import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { adminDb } from "@/lib/firebaseAdmin";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";
import { attemptMerchSyncWithFallback } from "@/lib/merchSheetsSync";
import { resend } from "@/lib/resend";
import { generateMerchOrderEmailHtml } from "@/components/MerchOrderEmailTemplate";
import { merchUnitInputSchema } from "@/types/merch";
import { merchCatalogue } from "@/lib/merchCatalogue";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ success: false, error: "Wrong content type, must be multipart/form-data" }, { status: 415 });
    }

    const formData = await req.formData();
    const buyerName = formData.get("buyerName") as string;
    const buyerEmail = formData.get("buyerEmail") as string;
    const buyerPhone = formData.get("buyerPhone") as string;
    const utrNumber = formData.get("utrNumber") as string;
    const unitsStr = formData.get("units") as string;
    const paymentScreenshot = formData.get("paymentScreenshot") as File | null;

    // 1. Zod Validation for strings
    const strValidation = z.object({
      buyerName: z.string().min(1, "Name is required"),
      buyerEmail: z.string().email("Invalid email"),
      buyerPhone: z.string().min(10, "Phone number must be at least 10 digits"),
      utrNumber: z.string().regex(/^[A-Za-z0-9]{12,22}$/, "UTR must be 12-22 alphanumeric characters")
    }).safeParse({ buyerName, buyerEmail, buyerPhone, utrNumber });

    if (!strValidation.success) {
      return NextResponse.json({ success: false, error: "Validation failure", details: strValidation.error.format() }, { status: 400 });
    }

    // 2. Validate Screenshot
    if (!paymentScreenshot) {
      return NextResponse.json({ success: false, error: "Payment screenshot is required" }, { status: 400 });
    }
    const isValidType = ["image/jpeg", "image/jpg", "image/png"].includes(paymentScreenshot.type);
    const maxSizeMB = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || "10", 10);
    const isValidSize = paymentScreenshot.size <= maxSizeMB * 1024 * 1024;

    if (!isValidType || !isValidSize) {
      return NextResponse.json({ success: false, error: "Invalid payment screenshot. Must be jpg/png and under 10MB." }, { status: 400 });
    }

    // 3. Validate Units Array
    let unitsRaw: any;
    try {
      unitsRaw = JSON.parse(unitsStr);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid units JSON" }, { status: 400 });
    }

    const unitsValidation = z.array(merchUnitInputSchema).min(1).safeParse(unitsRaw);
    if (!unitsValidation.success) {
      return NextResponse.json({ success: false, error: "Invalid units format", details: unitsValidation.error.format() }, { status: 400 });
    }

    const unitsClient = unitsValidation.data;
    
    // Cross-validate with catalogue & calculate total server-side
    let calculatedTotal = 0;
    const validUnits = [];

    for (const unit of unitsClient) {
      const catalogueItem = merchCatalogue.find(item => item.id === unit.itemId);
      if (!catalogueItem) {
        return NextResponse.json({ success: false, error: `Item ${unit.itemName} not found in catalogue` }, { status: 400 });
      }
      if (!catalogueItem.isAvailable) {
        return NextResponse.json({ success: false, error: `Item ${unit.itemName} is no longer available` }, { status: 400 });
      }
      if (unit.price !== catalogueItem.price) {
        return NextResponse.json({ success: false, error: `Price mismatch for ${unit.itemName}` }, { status: 400 });
      }

      calculatedTotal += catalogueItem.price;

      validUnits.push({
        ...unit,
        unitId: crypto.randomUUID(),
        // Keep itemName from catalogue for absolute safety, though client one should match
        itemName: catalogueItem.name, 
      });
    }

    // 4. Generate Order ID (Format: MERCH-AAA-BBB-XXXXX)
    const aaa = buyerName.replace(/[^A-Za-z]/g, "").substring(0, 3).toUpperCase() || "XXX";
    
    const uniqueItems = new Set(validUnits.map(u => u.itemId));
    let bbb = "MIX";
    if (uniqueItems.size === 1) {
      const firstItemName = validUnits[0].itemName;
      bbb = firstItemName.replace(/[^A-Za-z]/g, "").substring(0, 3).toUpperCase() || "XXX";
    }

    let orderId = "";
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 5) {
      const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase().slice(0, 5);
      orderId = `MERCH-${aaa}-${bbb}-${randomPart}`;
      const doc = await adminDb.collection("merchOrders").doc(orderId).get();
      if (!doc.exists) isUnique = true;
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json({ success: false, error: "Failed to generate unique Order ID. Please try again." }, { status: 500 });
    }

    // 5. Upload Screenshot to Cloudinary
    let paymentScreenshotUrl = "";
    try {
      const buffer = Buffer.from(await paymentScreenshot.arrayBuffer());
      const uploadResult = await uploadToCloudinary(buffer, paymentScreenshot.type, "merch-payments");
      paymentScreenshotUrl = uploadResult.originalUrl;
    } catch (err: any) {
      console.error("Cloudinary upload failed:", err);
      return NextResponse.json({ success: false, error: "File upload failed, please try again." }, { status: 503 });
    }

    // 6. Write to Firestore
    const orderData = {
      orderId,
      buyerName,
      buyerEmail,
      buyerPhone,
      units: validUnits,
      totalAmount: calculatedTotal,
      utrNumber,
      paymentScreenshotUrl,
      submittedAt: new Date(),
      merchSheetsSync: {
        status: "pending",
        retryCount: 0,
        lastAttempt: null,
        lastError: null
      }
    };

    await adminDb.collection("merchOrders").doc(orderId).set(orderData);

    // 7. Fire and forget Sheets sync
    const payload = { order: orderData, units: validUnits };
    attemptMerchSyncWithFallback(orderId, payload).catch(e => console.error("Sheets sync failed:", e));

    // 8. Send Confirmation Email via Resend
    const festName = process.env.NEXT_PUBLIC_FEST_NAME || "Fest";
    try {
      const htmlContent = generateMerchOrderEmailHtml({
        buyerName,
        orderId,
        units: validUnits,
        totalAmount: calculatedTotal,
        utrNumber,
        festName
      });

      const { error: emailError } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: buyerEmail,
        subject: `Order Confirmed — ${festName} Merch`,
        html: htmlContent,
      });

      if (emailError) {
        console.error("Failed to send merch order confirmation email:", emailError);
      } else {
        console.log(`Confirmation email sent for merch order ${orderId}`);
      }
    } catch (emailErr) {
      console.error("Exception sending merch order confirmation email:", emailErr);
    }

    return NextResponse.json({ success: true, orderId, message: "Order placed successfully!" }, { status: 200 });

  } catch (error: any) {
    console.error("Merch order submission error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
