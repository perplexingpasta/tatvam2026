merch store
    all phases
    verification after each phase
    no cron job in phase 3


large team error (should support 16)
test both team registration
test even registration


complete events
then add schedule
early bird prices

then registration status
    I would like to add a page to my web app. It's /registration-status. I have already created a folder with the same name inside the app folder and it contains a blank page.tsx at the moment. The idea is that any user can just input his delegate ID or team ID or email to view all of his registration details. In the placeholder to collect this field have sample entries such as "user@mail.com, ADI-28210-KAW5A, XOT-HCYAS89" for a better UX. The user can also view all the events he has signed up for including their dates, venue and time. The user also sees which teams he's a part of and which team events he's signed up for. There's a few buttons at the bottom: one to view brochure, one to sign up for more events (/events). The contact of my team member is also given at the bottom in case he wants to modify any field/information since he's not allowed to do it himself. Feel free to give suggestions or ask me questions to make this better.


team name or any error should pop up as toast
numbers 10 digits shown in subtext. if less or excees toast
for solo events, it should not say lead
read @PLAN.md before we continue. as you can see that currently we are sending delegateId in the event registrations data for the google sheets along with a bunch of other fields. that's great but can you make it so that along with the delegateID, the delegateName also goes with that in bracket    

reply_to: "yourpersonal@gmail.com"
test suite
toast notifs
more emails (delegate confirmation, event confirmation, reminders)
form should be blank after register another

use nextjs Link tags
fonts woff2
images webp w compression
favicon
dynamic loading
easter egg
cloudinary too less?
what changes do i need to make when deploying it on my custom domain in production 

DONE
delegate ID displayed on submission screen ✅
set up email template ✅
get domain ✅
connect domain ✅
form field validation and type check ✅
minimum UTR should be 12 ✅
format time of creation in sheets ✅
phone number 10 digits only (only numbers) ✅
formatted time is now AM or PM ✅
connected w github ✅
delegate tier name fix (plat and not tier 2) ✅
when inputting team members in event reg, first one is team lead and the frontend shows that ✅
make sheets sync automatic ✅
updated registration email template to use custom delegate kit names ✅
duplicate email, phone number and college id number validation while registering as a delegate ✅
utr allow letters ✅
college name instead of year of study ✅
replace img w nextjs Image ✅
no teams tab in sheets. all entries in delegates tab ✅
jssmc vs non-jss ✅
switched to vercel hosting ✅
added vercel analytics, speed insights ✅
move team name to the end after last member ✅
make a README for the repo ✅

need to ask
- delegate prices
- delegate kit names
- schedule
- all event names, their prices and desc







Read MerchPlan.md fully before writing any code.
Phases 0, 1, and 2 are complete. We are implementing Phase 3.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 3.1 — CREATE MERCH SHEETS RETRY API ROUTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create app/api/merch/sheets/retry/route.ts

This is separate from app/api/sheets/retry/route.ts.
Do not modify the existing retry route.

Logic:
1. Query merchSheetsRetryQueue where status in 
   ["pending", "failed"] AND nextRetryAt <= now
   (requires a Firestore composite index — note this 
   in a comment and remind the developer to create it 
   in Firebase console if it throws an index error)
2. For each document: call syncMerchOrderToSheets
3. On success: update doc status to "synced"
4. On failure: increment retryCount, set new nextRetryAt with exponential backoff (2^retryCount minutes, max 60), update lastError
5. After 10 failures: status = "dead_letter", console.error full payload
6. Return { success: true, syncedCount, message }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 3.2 — CREATE VERCEL CRON FOR MERCH RETRY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create app/api/cron/merch-sheets-retry/route.ts:

```typescript
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.MERCH_CRON_SECRET}`) {
    return NextResponse.json(
      { error: "Unauthorized" }, 
      { status: 401 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  try {
    const response = await fetch(
      `${baseUrl}/api/merch/sheets/retry`,
      { method: "POST" }
    );
    const data = await response.json();
    return NextResponse.json({ success: true, result: data });
  } catch (error) {
    console.error("Merch cron job failed:", error);
    return NextResponse.json(
      { success: false, error: String(error) }
    );
  }
}
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 3.3 — GOOGLE SHEETS SETUP INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Update SETUP_GUIDE.md with a new section:

MERCH GOOGLE SHEETS SETUP:
1. Create a NEW Google Spreadsheet (separate from the registrations spreadsheet)
2. Name it "[FestName] 2026 — Merch Orders"
3. Rename Sheet1 to "MerchOrders"
4. Set row 1 headers exactly as:
   A: Order ID | B: Buyer Name | C: Buyer Email | 
   D: Buyer Phone | E: Item Name | F: Custom Attributes | 
   G: Unit Price | H: Total Order Amount | I: UTR Number | 
   J: Payment Screenshot URL | K: Submitted At | 
   L: Units in Order
5. Share the spreadsheet with the same Google service account email (GOOGLE_SERVICE_ACCOUNT_EMAIL) as Editor
6. Copy the spreadsheet ID from the URL and set it as GOOGLE_MERCH_SHEETS_SPREADSHEET_ID in .env.local and in Vercel environment variables

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 3 CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Run npx tsc --noEmit — zero errors
2. Set up the merch Google Spreadsheet manually (see 3.3)
3. Fill in GOOGLE_MERCH_SHEETS_SPREADSHEET_ID in .env.local
4. Submit a test merch order
5. Without running any curl command, wait 5 seconds:
   - Confirm the order appears in the MerchOrders sheet
   - Confirm one row per unit
   - Confirm Custom Attributes formatted as 
     "Label: Value | Label: Value"
   - Confirm merchSheetsSync.status is "synced" in Firestore
6. Test retry route manually:
   curl -X POST http://localhost:3000/api/merch/sheets/retry
   Should return { success: true, syncedCount: 0 } 
   (queue should be empty after immediate sync)
7. Test failure fallback:
   - Temporarily set GOOGLE_MERCH_SHEETS_SPREADSHEET_ID to "invalid" in .env.local, restart dev server
   - Submit an order — order must still succeed
   - Confirm merchSheetsRetryQueue document created
   - Restore correct ID, restart, run curl retry route
   - Confirm row now appears in sheet
8. Update MerchPlan.md Phase Status:
   Phase 3: ✅ Complete

NOTE: Do NOT create any Vercel cron job or cron route for merch sheets retry.
The POST /api/merch/sheets/retry route exists for manual use only.
Remove MERCH_CRON_SECRET from all files — it is not needed.

Report "PHASE 3 COMPLETE" explicitly before stopping.