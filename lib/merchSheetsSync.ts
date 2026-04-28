import { getSheetsClient } from "./sheets";

export async function syncMerchOrderToSheets(order: any, units: any[]) {
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_MERCH_SHEETS_SPREADSHEET_ID;

    if (!spreadsheetId) {
      throw new Error("Missing GOOGLE_MERCH_SHEETS_SPREADSHEET_ID");
    }

    const rows = units.map(unit => {
      const attributesString = Object.entries(unit.attributes || {})
        .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
        .join(" | ");

      return [
        order.orderId,
        order.buyerName,
        order.buyerEmail,
        order.buyerPhone,
        unit.itemName,
        attributesString,
        unit.price.toString(),
        order.totalAmount.toString(),
        order.utrNumber,
        order.paymentScreenshotUrl,
        order.submittedAt instanceof Date ? order.submittedAt.toISOString() : new Date().toISOString(),
        units.length.toString(),
      ];
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "MerchOrders!A:L",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: rows,
      },
    });

  } catch (error) {
    console.error("Error syncing merch order to sheets:", error);
    throw error;
  }
}

export async function attemptMerchSyncWithFallback(orderId: string, payload: any) {
  try {
    const { adminDb } = await import("./firebaseAdmin");
    try {
      await syncMerchOrderToSheets(payload.order, payload.units);
      
      await adminDb.collection("merchOrders").doc(orderId).update({
        "merchSheetsSync.status": "synced",
        "merchSheetsSync.lastAttempt": new Date(),
      });
    } catch (error: any) {
      const nextRetryAt = new Date();
      // First retry happens immediately (or within a minute), subsequent retries use exponential backoff in retry cron
      
      await adminDb.collection("merchSheetsRetryQueue").add({
        type: "merchOrder",
        referenceId: orderId,
        payload,
        retryCount: 0,
        status: "pending",
        nextRetryAt,
        lastError: error.message || "Unknown error",
        createdAt: new Date(),
      });

      await adminDb.collection("merchOrders").doc(orderId).update({
        "merchSheetsSync.status": "pending",
        "merchSheetsSync.lastAttempt": new Date(),
        "merchSheetsSync.lastError": error.message || "Unknown error",
      });
    }
  } catch (outerError) {
    console.error("Critical error in attemptMerchSyncWithFallback:", outerError);
  }
}
