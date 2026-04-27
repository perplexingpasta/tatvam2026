// app/api/registration/delegate/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebaseAdmin";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";
import { resend } from "@/lib/resend";
import { FieldValue } from "firebase-admin/firestore";
import { generateRegistrationEmailHtml } from "@/components/RegistrationEmailTemplate";
import { attemptSyncWithFallback } from "@/lib/sheetsSync";

const delegateTierSchema = z.enum(["tier1", "tier2", "tier3"]);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const isJSSMC = formData.get("isJSSMC") === "true";

    interface MemberInput {
      name: string;
      email: string;
      phone: string;
      collegeName: string;
      collegeIdNumber: string;
      delegateTier: string;
      collegeIdImage: File;
    }

    // 1. Parse members
    const members: MemberInput[] = [];
    let i = 0;
    while (formData.has(`member_${i}_name`)) {
      let collegeName = formData.get(`member_${i}_collegeName`) as string;
      let delegateTier = formData.get(`member_${i}_delegateTier`) as string;
      
      if (isJSSMC) {
        collegeName = "JSS Medical College";
        delegateTier = "tier3";
      } else {
        if (collegeName.trim().toLowerCase() === "jss medical college") {
          return NextResponse.json(
            { success: false, message: "JSSMC students must use the JSSMC registration form" },
            { status: 400 },
          );
        }
      }

      members.push({
        name: formData.get(`member_${i}_name`) as string,
        email: formData.get(`member_${i}_email`) as string,
        phone: formData.get(`member_${i}_phone`) as string,
        collegeName,
        collegeIdNumber: formData.get(`member_${i}_collegeIdNumber`) as string,
        delegateTier,
        collegeIdImage: formData.get(`member_${i}_collegeIdImage`) as File,
      });
      i++;
    }

    if (members.length === 0 || members.length > 25) {
      return NextResponse.json(
        { success: false, message: "Invalid number of members (1-25)" },
        { status: 400 },
      );
    }

    const teamName = formData.get("teamName") as string | null;
    if (members.length > 1 && !teamName) {
      return NextResponse.json(
        {
          success: false,
          message: "Team name is required for multiple members",
        },
        { status: 400 },
      );
    }

    const paymentScreenshot = formData.get("paymentScreenshot") as File | null;
    let utrNumber = formData.get("utrNumber") as string | null || "";
    let paymentStatus = "pending_verification";

    if (isJSSMC) {
      paymentStatus = "verified";
      utrNumber = "";
    } else {
      if (!paymentScreenshot || !utrNumber || !/^[A-Za-z0-9]{12,22}$/.test(utrNumber)) {
        return NextResponse.json(
          { success: false, message: "A valid UTR number (12-22 alphanumeric characters) and payment screenshot are required" },
          { status: 400 },
        );
      }
    }

    // 2. Validate with Zod
    const memberSchema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().min(10),
      collegeName: z.string(),
      collegeIdNumber: z.string().min(1),
      delegateTier: delegateTierSchema,
    });

    for (const member of members) {
      const parseResult = memberSchema.safeParse(member);
      if (!parseResult.success) {
        return NextResponse.json(
          {
            success: false,
            message: `Validation failed for member: ${member.name}`,
          },
          { status: 400 },
        );
      }
      if (
        !member.collegeIdImage ||
        member.collegeIdImage.size > 10 * 1024 * 1024
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid college ID image for member: ${member.name}`,
          },
          { status: 400 },
        );
      }
      const mime = member.collegeIdImage.type;
      if (!["image/jpeg", "image/png", "image/jpg"].includes(mime)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid image type for member: ${member.name}`,
          },
          { status: 400 },
        );
      }
    }

    if (!isJSSMC && paymentScreenshot) {
      if (
        paymentScreenshot.size > 10 * 1024 * 1024 ||
        !["image/jpeg", "image/png", "image/jpg"].includes(paymentScreenshot.type)
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid payment screenshot" },
          { status: 400 },
        );
      }
    }

    // 3. Re-validate uniqueness in Firestore Transaction
    try {
      await adminDb.runTransaction(async (transaction) => {
        for (const member of members) {
          const emailQuery = await transaction.get(
            adminDb
              .collection("delegates")
              .where("email", "==", member.email)
              .limit(1),
          );
          if (!emailQuery.empty)
            throw new Error(`Conflict: Email ${member.email} already exists`);

          const phoneQuery = await transaction.get(
            adminDb
              .collection("delegates")
              .where("phone", "==", member.phone)
              .limit(1),
          );
          if (!phoneQuery.empty)
            throw new Error(`Conflict: Phone ${member.phone} already exists`);

          const idQuery = await transaction.get(
            adminDb
              .collection("delegates")
              .where("collegeIdNumber", "==", member.collegeIdNumber)
              .limit(1),
          );
          if (!idQuery.empty)
            throw new Error(
              `Conflict: College ID ${member.collegeIdNumber} already exists`,
            );
        }
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.message.startsWith("Conflict:")) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 409 },
        );
      }
      throw error; // Re-throw if it's not a conflict error
    }

    // 4. Upload files to Cloudinary
    const generateId = () =>
      Math.random().toString(36).substring(2, 7).toUpperCase();
    interface UploadedMember extends MemberInput {
      collegeIdImageUrl: string;
      collegeIdImageOriginalUrl: string;
    }
    const uploadedMembers: UploadedMember[] = [];

    let paymentScreenshotUrl = "";
    try {
      if (!isJSSMC && paymentScreenshot) {
        const paymentBuffer = Buffer.from(await paymentScreenshot.arrayBuffer());
        const paymentUpload = await uploadToCloudinary(
          paymentBuffer,
          paymentScreenshot.type,
          "payments",
        );
        paymentScreenshotUrl = paymentUpload.originalUrl; // Original URL for payment
      }

      for (const member of members) {
        const buffer = Buffer.from(await member.collegeIdImage.arrayBuffer());
        const upload = await uploadToCloudinary(
          buffer,
          member.collegeIdImage.type,
          "college-ids",
        );

        uploadedMembers.push({
          ...member,
          collegeIdImageUrl: upload.transformedUrl,
          collegeIdImageOriginalUrl: upload.originalUrl,
        });
      }
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      return NextResponse.json(
        { success: false, message: "File upload failed, please try again." },
        { status: 503 },
      );
    }

    // 5. Generate IDs and Prepare Data
    const teamId = teamName
      ? `${teamName.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
      : null;
    const delegateIds: string[] = [];

    const getTierPrice = (tier: string) => {
      if (tier === "tier1")
        return parseInt(process.env.NEXT_PUBLIC_TIER_1_PRICE || "0");
      if (tier === "tier2")
        return parseInt(process.env.NEXT_PUBLIC_TIER_2_PRICE || "0");
      if (tier === "tier3")
        return parseInt(process.env.NEXT_PUBLIC_TIER_3_PRICE || "0");
      return 0;
    };

    const batch = adminDb.batch();
    const now = FieldValue.serverTimestamp();
    const delegatesData: Record<string, unknown>[] = [];

    for (let j = 0; j < uploadedMembers.length; j++) {
      const member = uploadedMembers[j];
      const firstName3 = member.name
        .substring(0, 3)
        .toUpperCase()
        .padEnd(3, "X");
      const phone5 = member.phone.slice(-5).padStart(5, "0");
      const delId = `${firstName3}-${phone5}-${generateId()}`;
      delegateIds.push(delId);

      const delegateData = {
        delegateId: delId,
        name: member.name,
        email: member.email,
        phone: member.phone,
        collegeName: member.collegeName,
        isJSSMC: isJSSMC,
        collegeIdNumber: member.collegeIdNumber,
        collegeIdImageUrl: member.collegeIdImageUrl, // Transformed for delegates collection
        delegateTier: member.delegateTier,
        tierPrice: getTierPrice(member.delegateTier),
        teamId: teamId,
        paymentScreenshotUrl: paymentScreenshotUrl,
        utrNumber: utrNumber,
        paymentStatus: paymentStatus,
        registeredEventIds: [],
        createdAt: now,
        sheetsSync: {
          status: "pending",
          retryCount: 0,
          lastAttempt: null,
          lastError: null,
        },
      };

      delegatesData.push({
        ...delegateData,
        createdAt: new Date().toISOString(), // Override serverTimestamp for array payload
        collegeIdImageOriginalUrl: member.collegeIdImageOriginalUrl, // Pass original URL for sheets
      });

      const delegateRef = adminDb.collection("delegates").doc(delId);
      batch.set(delegateRef, delegateData);
    }

    if (teamId && teamName) {
      const teamRef = adminDb.collection("teams").doc(teamId);
      batch.set(teamRef, {
        teamId,
        teamName,
        memberDelegateIds: delegateIds,
        leadDelegateId: delegateIds[0],
        createdAt: now,
      });
    }

    // 7. Commit Batch
    await batch.commit();

    // Fire and forget - never await this
    attemptSyncWithFallback("delegate", { delegates: delegatesData, teamId, teamName }, teamId || delegateIds[0]);

    // 8. Send Emails
    const festName = process.env.NEXT_PUBLIC_FEST_NAME || "Our Fest";
    for (let j = 0; j < uploadedMembers.length; j++) {
      const member = uploadedMembers[j];
      const delId = delegateIds[j];
      try {
        console.log(`Attempting to send email to ${member.email} from ${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}...`);
        const resendResponse = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
          to: member.email,
          subject: `Your Delegate ID for ${festName}`,
          html: generateRegistrationEmailHtml({
            name: member.name,
            festName,
            delegateId: delId,
            tier: member.delegateTier,
            teamId,
            isJSSMC: isJSSMC,
          }),
        });

        if (resendResponse.error) {
          console.error(`Resend API returned an error for ${member.email}:`, resendResponse.error);
        } else {
          console.log(`Successfully sent email to ${member.email}. Resend API Response ID:`, resendResponse.data?.id);
        }
      } catch (error) {
        console.error("Exception thrown while sending email to", member.email, ":", error);
        // Do not fail the whole request if email fails, as DB is already written
      }
    }

    return NextResponse.json({
      success: true,
      delegateIds,
      teamId,
      message: "Registration successful!",
    });
  } catch (error: unknown) {
    console.error("API error:", error);
    const msg =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
