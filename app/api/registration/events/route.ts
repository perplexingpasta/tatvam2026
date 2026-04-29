import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebaseAdmin";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";
import { resend } from "@/lib/resend";
import { FieldValue } from "firebase-admin/firestore";
import { generateEventRegistrationEmailHtml } from "@/components/EventRegistrationEmailTemplate";
import { attemptSyncWithFallback } from "@/lib/sheetsSync";

const eventTypeSchema = z.enum(["solo", "group"]);

const cartItemSchema = z.object({
  eventId: z.string(),
  eventName: z.string(),
  eventType: eventTypeSchema,
  participantDelegateIds: z.array(z.string()).min(1),
  teamId: z.string().nullable(),
  eventFee: z.number().min(0),
});

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { success: false, message: "Unsupported Media Type: expected multipart/form-data" },
        { status: 415 }
      );
    }

    const formData = await req.formData();


    const cartItemsStr = formData.get("cartItems") as string;
    const utrNumber = formData.get("utrNumber") as string;
    const paymentScreenshot = formData.get("paymentScreenshot") as File | null;

    if (!cartItemsStr || !utrNumber || !paymentScreenshot) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!/^[A-Za-z0-9]{12,22}$/.test(utrNumber)) {
      return NextResponse.json(
        { success: false, message: "A valid UTR number (12-22 alphanumeric characters) is required" },
        { status: 400 }
      );
    }

    if (
      paymentScreenshot.size > 10 * 1024 * 1024 ||
      !["image/jpeg", "image/png", "image/jpg"].includes(paymentScreenshot.type)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid payment screenshot. Max 10MB JPG/PNG" },
        { status: 400 }
      );
    }

    let parsedCartItems;
    try {
      parsedCartItems = JSON.parse(cartItemsStr);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid cartItems JSON" },
        { status: 400 }
      );
    }

    const validationResult = z.array(cartItemSchema).safeParse(parsedCartItems);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, message: "Invalid cartItems payload" },
        { status: 400 }
      );
    }

    const cartItems = validationResult.data;
    if (cartItems.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty" },
        { status: 400 }
      );
    }

    const totalAmount = cartItems.reduce((acc, item) => acc + item.eventFee, 0);

    // 1. Transaction to re-verify uniqueness
    const delegateRefsToUpdate: { ref: FirebaseFirestore.DocumentReference; eventId: string }[] = [];
    // We will collect delegate details to send email
    const emailDataMap = new Map<string, { name: string; email: string }>();

    let attempt = 0;
    while (attempt < 3) {
      try {
        await adminDb.runTransaction(async (transaction) => {
          // Clear arrays in case of retry
          delegateRefsToUpdate.length = 0;
          emailDataMap.clear();

          for (const item of cartItems) {
            for (const delegateId of item.participantDelegateIds) {
              const delegateRef = adminDb.collection("delegates").doc(delegateId);
              const delegateDoc = await transaction.get(delegateRef);

              if (!delegateDoc.exists) {
                throw new Error(`Conflict: Delegate ${delegateId} not found`);
              }

              const data = delegateDoc.data();
              const registeredEventIds = data?.registeredEventIds || [];

              if (registeredEventIds.includes(item.eventId)) {
                throw new Error(`Conflict: Delegate ${delegateId} is already registered for ${item.eventName}`);
              }

              delegateRefsToUpdate.push({ ref: delegateRef, eventId: item.eventId });
              
              // Store email/name for email notification
              if (!emailDataMap.has(delegateId)) {
                 emailDataMap.set(delegateId, { name: data?.name || "", email: data?.email || "" });
              }
            }
          }
        });
        break; // success, exit loop
      } catch (error: unknown) {
        if (error instanceof Error && error.message.startsWith("Conflict:")) {
          return NextResponse.json(
            { success: false, message: error.message },
            { status: 409 }
          );
        }
        attempt++;
        if (attempt >= 3) {
          return NextResponse.json(
            { success: false, message: "Registration failed due to concurrent request. Please try again." },
            { status: 409 }
          );
        }
        await new Promise(resolve => setTimeout(resolve, 100 * attempt));
      }
    }

    // 2. Upload payment screenshot
    let paymentScreenshotUrl = "";
    try {
      const paymentBuffer = Buffer.from(await paymentScreenshot.arrayBuffer());
      const paymentUpload = await uploadToCloudinary(
        paymentBuffer,
        paymentScreenshot.type,
        "payment-proofs" // From instructions
      );
      paymentScreenshotUrl = paymentUpload.originalUrl;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      return NextResponse.json(
        { success: false, message: "File upload failed, please try again." },
        { status: 503 }
      );
    }

    // 3. Write eventRegistration document to Firestore
    const batch = adminDb.batch();
    const registrationRef = adminDb.collection("eventRegistrations").doc();
    const now = FieldValue.serverTimestamp();

    const registrationData = {
      registrationId: registrationRef.id,
      cartItems,
      totalAmount,
      paymentScreenshotUrl,
      utrNumber,
      paymentStatus: "pending_verification",
      submittedAt: now,
      sheetsSync: {
        status: "pending",
        retryCount: 0,
        lastAttempt: null,
        lastError: null,
      },
    };

    batch.set(registrationRef, registrationData);

    // 4. Update each delegate document's registered events
    for (const { ref, eventId } of delegateRefsToUpdate) {
      batch.update(ref, {
        registeredEventIds: FieldValue.arrayUnion(eventId)
      });
    }

    // 5. Trigger Sheets sync asynchronously via sheetsRetryQueue
    // Get all participant IDs for sheets payload
    const allParticipantIds = new Set<string>();
    const eventNames: string[] = [];
    cartItems.forEach(item => {
      item.participantDelegateIds.forEach(id => allParticipantIds.add(id));
      eventNames.push(item.eventName);
    });

    await batch.commit();

    // Fire and forget — never await this
    attemptSyncWithFallback("eventRegistration", {
      registrationId: registrationRef.id,
      participantDelegateIds: Array.from(allParticipantIds),
      eventNames: eventNames,
      totalAmount,
      utrNumber,
      paymentStatus: "pending_verification",
      submittedAt: new Date().toISOString()
    }, registrationRef.id);

    // 6. Send a single confirmation email to the lead delegate (first ID entered in the cart)
    const leadDelegateId = cartItems[0].participantDelegateIds[0];
    const leadData = emailDataMap.get(leadDelegateId);
    
    if (leadData && leadData.email) {
      const festName = process.env.NEXT_PUBLIC_FEST_NAME || "Our Fest";
      
      const emailProps = {
        leadName: leadData.name,
        festName,
        cartItems: cartItems.map(item => ({
          eventName: item.eventName,
          eventType: item.eventType,
          participantNames: item.participantDelegateIds.map(id => emailDataMap.get(id)?.name || id),
          eventFee: item.eventFee
        })),
        totalAmount,
        utrNumber
      };

      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
          to: leadData.email,
          subject: `Event Registration Confirmed — ${festName}`,
          html: generateEventRegistrationEmailHtml(emailProps),
        });
      } catch (error) {
        console.error("Failed to send event confirmation email:", error);
      }
    }

    return NextResponse.json({
      success: true,
      registrationId: registrationRef.id,
      message: "Event registration successful!",
    });

  } catch (error: unknown) {
    console.error("API error:", error);
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
