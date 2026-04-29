import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { syncMerchOrderToSheets } from "@/lib/merchSheetsSync";

export async function POST() {
  try {
    const now = new Date();
    
    // NOTE: This query requires a composite index in Firestore on the merchSheetsRetryQueue collection:
    // Fields: status (ASC), nextRetryAt (ASC)
    // Create this index in the Firebase Console if you encounter an index error.
    const snapshot = await adminDb
      .collection("merchSheetsRetryQueue")
      .where("status", "in", ["pending", "failed"])
      .where("nextRetryAt", "<=", now)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ success: true, syncedCount: 0, message: "No pending or failed merch retries." });
    }

    let syncedCount = 0;
    const batch = adminDb.batch();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const { referenceId, payload, retryCount } = data;

      try {
        await syncMerchOrderToSheets(payload.order, payload.units);
        
        batch.update(doc.ref, {
          status: "synced",
        });
        
        const orderRef = adminDb.collection("merchOrders").doc(referenceId);
        batch.update(orderRef, {
          "merchSheetsSync.status": "synced",
          "merchSheetsSync.lastAttempt": new Date(),
        });
        
        syncedCount++;
      } catch (error: unknown) {
        console.error(`Merch sheets retry failed for ${referenceId}:`, error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const newRetryCount = retryCount + 1;
        
        if (newRetryCount >= 10) {
          batch.update(doc.ref, {
            status: "dead_letter",
            lastError: errorMessage,
          });
          
          const orderRef = adminDb.collection("merchOrders").doc(referenceId);
          batch.update(orderRef, {
            "merchSheetsSync.status": "dead_letter",
            "merchSheetsSync.lastAttempt": new Date(),
            "merchSheetsSync.lastError": errorMessage,
          });
          console.error("Merch dead letter payload:", JSON.stringify(payload, null, 2));
        } else {
          // Exponential backoff
          const backoffMinutes = Math.min(Math.pow(2, newRetryCount), 60);
          const nextRetryAt = new Date(Date.now() + backoffMinutes * 60000);
          
          batch.update(doc.ref, {
            status: "failed",
            retryCount: newRetryCount,
            nextRetryAt,
            lastError: errorMessage,
          });
          
          const orderRef = adminDb.collection("merchOrders").doc(referenceId);
          batch.update(orderRef, {
            "merchSheetsSync.lastAttempt": new Date(),
            "merchSheetsSync.lastError": errorMessage,
          });
        }
      }
    }

    await batch.commit();

    return NextResponse.json({ 
      success: true, 
      syncedCount, 
      message: `Successfully processed ${syncedCount} out of ${snapshot.size} retries.` 
    });
    
  } catch (error: unknown) {
    console.error("Critical error in merch sheets retry route:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
