import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { syncToSheets, SyncType } from "@/lib/sheetsSync";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (contentType && !contentType.includes("application/json")) {
      return NextResponse.json(
        { success: false, message: "Unsupported Media Type: expected application/json or empty body" },
        { status: 415 }
      );
    }

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

      if (data.type === "team") {
        await doc.ref.update({
          status: "dead_letter",
          lastError: "team sync type deprecated — data now written to Delegates sheet",
          updatedAt: Timestamp.now()
        });
        continue;
      }

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
