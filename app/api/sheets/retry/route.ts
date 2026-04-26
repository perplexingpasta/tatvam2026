import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { syncToSheets, SyncType } from "@/lib/sheetsSync";
import { Timestamp } from "firebase-admin/firestore";

export async function POST() {
  try {
    const now = Timestamp.now();

    // const snapshot = await adminDb.collection("sheetsRetryQueue").get();

    const snapshot = await adminDb
      .collection("sheetsRetryQueue")
      .where("status", "in", ["pending", "failed"])
      .where("nextRetryAt", "<=", now)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({
        success: true,
        syncedCount: 0,
        message: "No items to retry",
      });
    }

    let syncedCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();

      // Skip if already synced or permanently failed
      // if (data.status === "synced" || data.status === "dead_letter") {
      //   continue;
      // }

      // Check if it's time to retry
      // if (data.nextRetryAt && data.nextRetryAt.toMillis() > now.toMillis()) {
      //   continue;
      // }

      const result = await syncToSheets(
        data.type as SyncType,
        data.payload,
        data.referenceId,
        doc.id,
        data.retryCount,
      );

      if (result.success) {
        syncedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      syncedCount,
      message: `Successfully retried ${syncedCount} items`,
    });
  } catch (error: unknown) {
    console.error("Error in retry processor route:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
