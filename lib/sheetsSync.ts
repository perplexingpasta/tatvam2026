// lib/sheetsSync.ts
import { getSheetsClient } from "./sheets";
import { adminDb } from "./firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

export type SyncType = "delegate" | "eventRegistration";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatDate = (dateValue: any) => {
  let date: Date;
  if (!dateValue) {
    date = new Date();
  } else if (typeof dateValue.toDate === "function") {
    date = dateValue.toDate();
  } else {
    date = new Date(dateValue);
  }

  const dFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const tFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const dateStr = dFormatter.format(date).replace(/\//g, "-");
  const timeStr = tFormatter.format(date);

  return `${timeStr}, ${dateStr}`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getTierName = (tier: any) => {
  switch (tier) {
    case "tier1":
      return process.env.NEXT_PUBLIC_TIER_1_NAME || "Gold";
    case "tier2":
      return process.env.NEXT_PUBLIC_TIER_2_NAME || "Platinum";
    case "tier3":
      return process.env.NEXT_PUBLIC_TIER_3_NAME || "Diamond";
    default:
      return tier;
  }
};

export const attemptSyncWithFallback = async (
  type: SyncType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any,
  referenceId: string,
): Promise<void> => {
  try {
    const result = await syncToSheets(type, payload, referenceId);

    if (result.success) {
      console.log(`[sheetsSync] Immediate sync succeeded for ${referenceId}`);
      // The update of the source document to "synced" happens inside syncToSheets
    } else {
      console.warn(
        `[sheetsSync] Immediate sync failed, enqueued for retry. referenceId:`,
        referenceId,
      );
      // The creation of the retry queue document and updating the source to "failed"/"pending"
      // is already gracefully handled inside the catch block of syncToSheets when a sync fails.
    }
  } catch (error) {
    console.error(
      `[sheetsSync] Unexpected error in attemptSyncWithFallback for ${referenceId}:`,
      error,
    );
  }
};

export const syncToSheets = async (
  type: SyncType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any,
  referenceId: string,
  retryDocId?: string,
  currentRetryCount: number = 0,
) => {
  try {
    const sheets = await getSheetsClient();

    if (type === "delegate") {
      // payload from Phase 1 is { delegates: [...], teamId, teamName }

      const delegates = payload.delegates || [payload];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const delegateValues = delegates.map((d: any) => [
        d.delegateId,
        d.name,
        d.email,
        d.phone,
        d.collegeName,
        d.collegeIdNumber,
        d.collegeIdImageOriginalUrl || d.collegeIdImageUrl || "",
        getTierName(d.delegateTier),
        d.tierPrice !== undefined && d.tierPrice !== null ? d.tierPrice : "",
        payload.teamId || "",
        payload.teamName || "",
        d.paymentStatus || "",
        d.utrNumber || "",
        d.paymentScreenshotUrl || "",
        formatDate(d.createdAt),
      ]);

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: "Delegates!A:O",
        valueInputOption: "USER_ENTERED",
        requestBody: { values: delegateValues },
      });
    } else if (type === "eventRegistration") {
      const values = [
        [
          payload.registrationId,
          (payload.participantDelegateIds || []).join(","),
          (payload.eventNames || []).join(","),
          payload.totalAmount,
          payload.utrNumber || "",
          payload.paymentStatus || "",
          formatDate(payload.submittedAt),
        ],
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: "EventRegistrations!A:G",
        valueInputOption: "USER_ENTERED",
        requestBody: { values },
      });
    } else {
      throw new Error(`Invalid sync type: ${type}`);
    }

    // if (retryDocId) {
    //   await adminDb.collection("sheetsRetryQueue").doc(retryDocId).update({
    //     status: "synced",
    //     updatedAt: Timestamp.now(),
    //   });
    // }

    // return { success: true };

    if (retryDocId) {
      await adminDb.collection("sheetsRetryQueue").doc(retryDocId).update({
        status: "synced",
        updatedAt: Timestamp.now(),
      });
    }

    // Update sheetsSync status on the source document(s)
    if (type === "delegate" && payload.delegates) {
      // payload.delegates is an array, we need to update all of them
      const delegates = payload.delegates || [payload];
      for (const d of delegates) {
        if (d.delegateId) {
          try {
            await adminDb.collection("delegates").doc(d.delegateId).update({
              "sheetsSync.status": "synced",
              "sheetsSync.lastAttempt": Timestamp.now(),
              "sheetsSync.lastError": null,
            });
          } catch (updateError) {
            console.warn(
              `Could not update sheetsSync status on delegates/${d.delegateId}:`,
              updateError,
            );
          }
        }
      }
    } else if (referenceId) {
      const collection =
        type === "eventRegistration" ? "eventRegistrations" : "delegates";
      try {
        await adminDb.collection(collection).doc(referenceId).update({
          "sheetsSync.status": "synced",
          "sheetsSync.lastAttempt": Timestamp.now(),
          "sheetsSync.lastError": null,
        });
      } catch (updateError) {
        // Non-critical — log but don't fail the sync
        console.warn(
          `Could not update sheetsSync status on ${collection}/${referenceId}:`,
          updateError,
        );
      }
    }

    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[sheetsSync] FULL ERROR for ${type} ${referenceId}:`, error);
    console.error(`[sheetsSync] Error message:`, errorMessage);

    const newRetryCount = currentRetryCount + 1;
    let status = "failed";

    const isFirstAttempt = !retryDocId;
    let delayMinutes = isFirstAttempt ? 0 : Math.pow(2, currentRetryCount);
    if (delayMinutes > 60) delayMinutes = 60;

    if (newRetryCount > 10) {
      status = "dead_letter";
      console.error(
        `DEAD LETTER: Sheets sync failed permanently for ${type} ${referenceId}. Payload:`,
        JSON.stringify(payload, null, 2),
      );
    }

    const nextRetryAt = new Date(Date.now() + delayMinutes * 60000);

    const docData = {
      type,
      referenceId,
      payload,
      retryCount: newRetryCount,
      lastError: errorMessage,
      status,
      updatedAt: Timestamp.now(),
    };

    if (retryDocId) {
      await adminDb
        .collection("sheetsRetryQueue")
        .doc(retryDocId)
        .update({
          ...docData,
          nextRetryAt: Timestamp.fromDate(nextRetryAt),
        });
    } else {
      await adminDb.collection("sheetsRetryQueue").add({
        ...docData,
        nextRetryAt: Timestamp.now(), // Always immediate for first-time entries
        createdAt: Timestamp.now(),
      });
    }

    // return { success: false, error: errorMessage };

    // Update sheetsSync status on the source document(s) to reflect failure
    if (type === "delegate" && payload.delegates) {
      const delegates = payload.delegates || [payload];
      for (const d of delegates) {
        if (d.delegateId) {
          try {
            await adminDb
              .collection("delegates")
              .doc(d.delegateId)
              .update({
                "sheetsSync.status":
                  newRetryCount > 10 ? "dead_letter" : "failed",
                "sheetsSync.retryCount": newRetryCount,
                "sheetsSync.lastAttempt": Timestamp.now(),
                "sheetsSync.lastError": errorMessage,
              });
          } catch (updateError) {
            console.warn(
              `Could not update sheetsSync status on delegates/${d.delegateId}:`,
              updateError,
            );
          }
        }
      }
    } else if (referenceId) {
      const collection =
        type === "eventRegistration" ? "eventRegistrations" : "delegates";
      try {
        await adminDb
          .collection(collection)
          .doc(referenceId)
          .update({
            "sheetsSync.status": newRetryCount > 10 ? "dead_letter" : "failed",
            "sheetsSync.retryCount": newRetryCount,
            "sheetsSync.lastAttempt": Timestamp.now(),
            "sheetsSync.lastError": errorMessage,
          });
      } catch (updateError) {
        console.warn(
          `Could not update sheetsSync status on ${collection}/${referenceId}:`,
          updateError,
        );
      }
    }

    return { success: false, error: errorMessage };
  }
};
