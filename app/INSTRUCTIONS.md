You are a senior full-stack developer. You will implement a complete, production-grade registration system in an existing Next.js (App Router) project using TypeScript and
Tailwind CSS. The project already has the following blank page.tsx files scaffolded:
app/page.tsx, app/events/page.tsx, app/schedule/page.tsx, app/registration/page.tsx,
app/contact/page.tsx, app/about/page.tsx. You will also need to create app/cart/page.tsx
during implementation.

══════════════════════════════════════════════
ABSOLUTE RULES — NEVER VIOLATE THESE
══════════════════════════════════════════════

- DO NOT hallucinate libraries, APIs, Firebase extensions, or npm packages. Only use
  packages that exist on npm as of 2024 and are widely adopted.
- Before writing any code, define ALL data schemas, Firestore collection structures,
  API route contracts, and environment variable names in a PLAN.md file. Do not write
  a single line of implementation code until this plan is written and complete.
- After every phase, run a self-check: verify that all code compiles with zero TypeScript
  errors, all referenced env variables are documented, and no placeholder/stub logic is
  left unimplemented before moving to the next phase.
- Follow the principle of least surprise: never silently swallow errors. Every failure
  must surface a log entry and, where applicable, a user-facing message.
- All user-facing UI must be mobile-first, responsive, and optimised for minimal initial
  page load (use Next.js dynamic imports, lazy loading, and image optimisation where
  appropriate).
- Prefer server-side logic (Next.js Route Handlers) over client-side wherever possible.
- Use modular, maintainable architecture: separate concerns into /lib, /components,
  /hooks, /types, and /app/api directories.

══════════════════════════════════════════════
TECH STACK (FIXED — DO NOT SUBSTITUTE)
══════════════════════════════════════════════

- Framework: Next.js 14+ App Router, TypeScript, Tailwind CSS
- Validation: Zod (shared schemas used on both client and server)
- Email: Resend
- Database: Firebase Firestore
- File Storage: Firebase Storage (for college ID images and payment screenshots)
- Google Sheets: google-auth-library + googleapis npm packages (service account auth)
- Hosting: Netlify (ensure next.config.js is compatible; use @netlify/plugin-nextjs)
- Image compression: Use the sharp npm package in a Next.js API route to compress
  images before uploading to Firebase Storage. DO NOT reference any Firebase Extension
  for compression — implement it directly in the upload route handler.

══════════════════════════════════════════════
ENVIRONMENT VARIABLES
══════════════════════════════════════════════
At the start of Phase 1, create a .env.local.example file listing every single
environment variable the project will need, with a comment explaining each one.
Include variables for: Firebase (project config + service account), Resend API key,
Google Sheets (spreadsheet IDs + service account credentials), and any app-level
constants (e.g. max file size, delegate kit prices).

══════════════════════════════════════════════
DATA SCHEMAS — DEFINE THESE IN PLAN.md FIRST
══════════════════════════════════════════════

Firestore Collections:

1. `delegates/{delegateId}`
   - delegateId: string (unique, generated — see ID format rules below)
   - name: string
   - email: string
   - phone: string
   - yearOfStudy: string
   - collegeIdNumber: string
   - collegeIdImageUrl: string (Firebase Storage CDN URL)
   - delegateTier: "tier1" | "tier2" | "tier3"
   - tierPrice: number
   - teamId: string | null
   - paymentScreenshotUrl: string
   - utrNumber: string
   - paymentStatus: "pending_verification" | "verified" | "rejected"
   - createdAt: Timestamp
   - sheetsSync: { status: "pending"|"synced"|"failed", retryCount: number,
     lastAttempt: Timestamp | null, lastError: string | null }

2. `teams/{teamId}`
   - teamId: string (generated — see ID format rules)
   - teamName: string
   - memberDelegateIds: string[]
   - leadDelegateId: string
   - createdAt: Timestamp

3. `eventRegistrations/{registrationId}`
   - registrationId: string (auto Firestore ID)
   - cartItems: Array<{ eventId: string, eventName: string, eventType: "solo"|"group",
     participantDelegateIds: string[], teamId: string | null, eventFee: number }>
   - totalAmount: number
   - paymentScreenshotUrl: string
   - utrNumber: string
   - paymentStatus: "pending_verification" | "verified" | "rejected"
   - submittedAt: Timestamp
   - sheetsSync: { status: "pending"|"synced"|"failed", retryCount: number,
     lastAttempt: Timestamp | null, lastError: string | null }

4. `events/{eventId}` (seed data — populate in a seed script)
   - eventId: string
   - name: string
   - description: string
   - type: "solo" | "group"
   - minTeamSize: number | null
   - maxTeamSize: number | null
   - fee: number
   - schedule: Timestamp | null
   - venue: string | null

5. `sheetsRetryQueue/{docId}` (for fault-tolerant Sheets sync)
   - type: "delegate" | "eventRegistration"
   - referenceId: string
   - payload: object
   - retryCount: number
   - nextRetryAt: Timestamp
   - lastError: string
   - createdAt: Timestamp

DELEGATE ID FORMAT:

- Solo (1 person): [FIRST 3 CHARS OF FIRST NAME (uppercase)] + "-" + [LAST 5 DIGITS
  OF PHONE] + "-" + [5 random alphanumeric chars, uppercase]
  Example: VIK-66688-FV3U9
- Team registration (2+ people): Each member gets the same solo-format ID as above.
  Additionally, a TEAM ID is generated: [FIRST 3 CHARS OF TEAM NAME (uppercase)] + "-"
  - [7 random alphanumeric chars, uppercase]
    Example: SPD-A3K9PQ2
- ID generation must be collision-resistant: after generating an ID, check Firestore
  to confirm it doesn't already exist before saving. Retry generation if collision found.

UNIQUENESS CONSTRAINTS (enforce at Firestore write time using transactions):

- No two delegates may share the same email address.
- No two delegates may share the same phone number.
- No two delegates may share the same collegeIdNumber.
- Return a specific, descriptive error message for each violation (e.g. "A delegate
  with this email already exists.") — never a generic error.

══════════════════════════════════════════════
PRICING MODEL
══════════════════════════════════════════════

- There are three delegate kit tiers. Each has its own fixed price (store prices in
  env variables so they can be updated without code changes).
- Every participant must purchase one delegate kit tier as the base registration.
- Every event has its own additional fee stored in the `events` collection in Firestore.
- Total amount for a team registration = sum of (tierPrice for each member).
- Total amount for event registration = sum of (eventFee for each cart item × applicable
  participants). Calculate and display this breakdown clearly on the cart and payment pages.

══════════════════════════════════════════════
PHASE-BY-PHASE IMPLEMENTATION PLAN
══════════════════════════════════════════════

You MUST complete each phase fully, verify it works, and explicitly state
"PHASE N COMPLETE — ALL CHECKS PASSED" before starting the next phase.

────────────────────────────────────────────
PHASE 0 — PLANNING & SCAFFOLDING
────────────────────────────────────────────

1. Create PLAN.md documenting: all Firestore schemas, all API route contracts (method,
   path, request body shape, response shape, error codes), all environment variables,
   and the Google Sheets column layout for each sheet.
2. Create .env.local.example with all required variables and descriptive comments.
3. Install all required npm packages in one go: zod, firebase, firebase-admin, resend,
   sharp, googleapis, google-auth-library, @netlify/plugin-nextjs. Do not install any
   other packages not listed here without explicitly stating why.
4. Create /types/index.ts with all shared TypeScript types derived from the Firestore
   schemas above. Use Zod schemas as the source of truth and infer TS types from them.
5. Create a /lib directory with separate files: firebase.ts (client SDK init),
   firebaseAdmin.ts (Admin SDK init), resend.ts (Resend client init), sheets.ts
   (Google Sheets client init with service account).
6. Create a Firestore seed script at /scripts/seedEvents.ts that populates the events
   collection with sample events (mix of solo and group types with fees). This script
   must be runnable with `npx ts-node scripts/seedEvents.ts`.

PHASE 0 CHECK: Confirm all packages install without errors. Confirm TypeScript compiles.
Confirm all lib files initialise without throwing. Document any GCP/Firebase setup steps
the developer must manually complete (project creation, enabling Firestore, Storage,
Google Sheets API, creating service account, downloading credentials JSON).

────────────────────────────────────────────
PHASE 1 — DELEGATE REGISTRATION (/registration)
────────────────────────────────────────────
Build the multi-step registration form on app/registration/page.tsx.

STEP 1 — MEMBER INFORMATION FORM:

- Form fields for the first person (team lead): name, year of study, college ID number,
  college ID image upload, phone number, email.
- An "Add Member" button below the delegate tier cards (see step 2) allows adding up
  to 24 additional members, each with the same fields. Maximum 25 members total.
- When 2 or more members are present, a "Team Name" field appears.
- File upload for college ID image: accept jpg, jpeg, png only; max 10MB; show a
  preview thumbnail after selection; show a clear error for invalid type or size
  BEFORE attempting upload.

STEP 2 — DELEGATE TIER SELECTION:

- Each person must individually select one of three delegate tiers (cards with name,
  description, and price pulled from env variables).
- Show a running total of the combined kit cost for all members.

STEP 3 — PAYMENT PAGE:

- Display the total amount (sum of all selected tier prices for all members).
- Show a QR code image (image path stored in an env variable).
- Form fields: payment screenshot upload (jpg, jpeg, png, max 10MB) + UTR number input.
- Submit button triggers the full registration API route.

API ROUTE: POST /api/registration/delegate

- Validate entire payload with Zod on the server.
- Re-validate uniqueness (email, phone, collegeIdNumber) for ALL members in a single
  Firestore transaction before writing anything. If any conflict exists, return a
  descriptive error identifying which member has the conflict.
- Use sharp to compress each college ID image before uploading to Firebase Storage.
  Target: ≤ 200KB output, quality 80, convert to webp.
- Generate delegate IDs and team ID (if applicable) using the collision-resistant
  method described above.
- Write all delegates and team (if applicable) to Firestore atomically using a
  batched write.
- Trigger Google Sheets sync asynchronously (do not await — enqueue to sheetsRetryQueue
  and process in background).
- Send individual confirmation emails via Resend to each member's email address.
- Email content: subject "Your Delegate ID for [Fest Name]", body includes their name,
  delegate ID, tier purchased, and team ID (if applicable). Use a clean HTML email
  template. This is EMAIL TYPE 1 (delegate kit confirmation only — no event info).

PHASE 1 CHECK: Submit a test registration for 3 members. Verify: 3 Firestore documents
created, 1 team document created, 3 emails delivered, college ID images appear in
Firebase Storage, sheetsRetryQueue has a pending entry.

────────────────────────────────────────────
PHASE 2 — GOOGLE SHEETS SYNC + RETRY QUEUE
────────────────────────────────────────────
This phase must be implemented before Phase 3 because event registration also depends on it.

SHEET STRUCTURE (create these as separate tabs/sheets in one Google Spreadsheet):

- Sheet 1 "Delegates": delegateId, name, email, phone, yearOfStudy, collegeIdNumber,
  collegeIdImageUrl, delegateTier, tierPrice, teamId, utrNumber, paymentStatus,
  createdAt
- Sheet 2 "Teams": teamId, teamName, leadDelegateId, memberDelegateIds (comma-separated),
  createdAt
- Sheet 3 "EventRegistrations": registrationId, participantDelegateIds, eventNames,
  totalAmount, utrNumber, paymentStatus, submittedAt

SYNC LOGIC:

- All Sheets writes are APPEND operations (new rows only — never overwrite).
- Create /lib/sheetsSync.ts with an async function `syncToSheets(type, payload)`
  that appends a row to the appropriate sheet.
- On any Sheets API failure: catch the error, log it with the payload, write/update
  a document in sheetsRetryQueue with status "failed", retryCount++, and set
  nextRetryAt using exponential backoff: 2^retryCount minutes, capped at 60 minutes.
- Create a retry processor at /app/api/sheets/retry/route.ts (POST). This route reads
  all sheetsRetryQueue documents where nextRetryAt ≤ now, attempts re-sync, and
  updates status to "synced" on success or increments retryCount on failure.
- The retry route must be called by a Netlify Scheduled Function (cron: every 5 minutes).
  Create the netlify/functions/sheetsRetryProcessor.ts file for this.
- Maximum retry attempts: 10. After 10 failures, set status to "dead_letter" and log
  a console.error with full payload so no data is ever silently lost.
- The source of truth is always Firestore. Sheets is a secondary mirror. A Sheets
  failure must NEVER block or roll back the primary Firestore write.

PHASE 2 CHECK: Manually mark a sheetsRetryQueue entry as failed. Trigger the retry
route. Confirm the row appears in Google Sheets and the Firestore doc is updated to
"synced".

────────────────────────────────────────────
PHASE 3 — EVENTS PAGE (/events)
────────────────────────────────────────────

- Fetch all events from Firestore on the server (use React Server Component).
- Display events as cards grouped by type (solo / group). Show name, description,
  fee, team size range (for group events).
- Each card has an "Add to Cart" button. Cart state is stored in React context
  (sessionStorage is fine — cart resets on tab close by design).
- Cart icon in the header shows count of items currently in cart.
- No delegate ID is required at this stage — the user is just browsing and selecting.
- A delegate can add multiple events. A solo event and a group event can both exist
  in the same cart.

PHASE 3 CHECK: Add a mix of solo and group events to cart. Confirm cart state persists
across client-side navigation (but correctly resets on page reload).

────────────────────────────────────────────
PHASE 4 — CART & EVENT PAYMENT (/cart)
────────────────────────────────────────────
Cart page lists all selected events. For each event:

SOLO EVENT:

- Input field: "Enter your Delegate ID"
- On submit: call GET /api/delegates/lookup?id=XXXX — return delegate's name, college,
  and year of study (never return sensitive fields like phone or image URL to the client).
- Show pulled details for the user to visually confirm. If confirmed, mark this cart
  item as "verified".
- BLOCK: If the delegate ID is already registered for this event, return error:
  "This delegate is already registered for [Event Name]."

GROUP EVENT:

- Input fields to add delegate IDs one by one (minimum and maximum team size shown).
- On each ID entry: live lookup to show that member's name.
- Once all members are added: "Confirm Team" button pulls and displays all members'
  details.
- BLOCK: If any delegate ID in the group is already registered for this event,
  return a specific error naming which delegate is the conflict.
- BLOCK: If fewer than minTeamSize or more than maxTeamSize members are entered,
  show a validation error before allowing confirmation.
- Events are strictly solo OR group — the UI must not allow a solo event to accept
  multiple IDs, and a group event must not accept only 1 ID.

CHECKOUT FLOW:

- Show a full order summary: each event, participant names, individual event fees,
  subtotals, and grand total.
- Display QR code for payment (same as delegate registration QR).
- Form: payment screenshot upload (jpg, jpeg, png, max 10MB) + UTR number.
- On submit: POST /api/registration/events

API ROUTE: POST /api/registration/events

- Validate full payload with Zod.
- For each cart item: re-verify in Firestore (inside a transaction) that none of the
  delegate IDs are already registered for that event. If any conflict is found,
  return a descriptive error and abort the entire write.
- Use sharp to compress the payment screenshot before uploading to Firebase Storage.
- Write the eventRegistration document to Firestore.
- Update each delegate document's registered events (add a registeredEventIds array
  field to the delegate schema — include this in Phase 0 PLAN.md).
- Trigger Sheets sync asynchronously via sheetsRetryQueue (same pattern as Phase 2).
- Send a single confirmation email to the lead delegate (first ID entered in the cart).
- Email content (EMAIL TYPE 2 — event registration only): subject "Event Registration
  Confirmed — [Fest Name]", body lists every event registered, participant names per
  event, total amount paid, and UTR number submitted. Use a clean HTML email template.

PHASE 4 CHECK: Complete a full event registration flow with 1 solo and 1 group event.
Verify: Firestore eventRegistration document created, delegate documents updated with
event IDs, duplicate ID blocked with correct error, confirmation email received,
Sheets row appended.

────────────────────────────────────────────
PHASE 5 — EDGE CASES, HARDENING & FINAL CHECKS
────────────────────────────────────────────
Go through this checklist and implement or verify each item:

SECURITY:

- All API routes must validate Content-Type header.
- All file uploads must re-validate type and size server-side (never trust client
  validation alone). Reject any file that does not pass server-side mime-type check.
- Never expose Firebase Admin credentials or Google service account JSON to the client.
- All Firestore writes that involve uniqueness checks must use Firestore transactions
  (not independent reads + writes, which have race conditions).
- Rate-limit the delegate lookup endpoint (/api/delegates/lookup) to prevent enumeration.

ERROR STATES TO HANDLE EXPLICITLY:

- Firebase Storage upload failure: return 503 with message "File upload failed.
  Please try again." Do not partially write to Firestore if storage upload failed.
- Resend email failure: log the error but do NOT fail the registration. The Firestore
  write is the source of truth. Email is best-effort.
- Sheets sync failure: handled by retry queue. Never surface to user.
- Firestore transaction contention (concurrent duplicate registrations): retry up to
  3 times before returning a 409 conflict error.
- Network timeout on file upload: show a progress indicator and a timeout error
  message after 30 seconds.

UX POLISH:

- Show a loading spinner / skeleton during all async operations.
- Disable submit buttons after first click to prevent double submissions.
- All forms must show field-level validation errors inline (not just a toast).
- After successful delegate registration, show a success screen listing all generated
  IDs clearly (not just an email — show it on screen too so users can screenshot it).
- After successful event registration, show a confirmation screen with the full
  event list and UTR number.

PERFORMANCE:

- All images uploaded to Firebase Storage must use the CDN URL pattern
  (with alt=media token) — not the raw bucket path.
- Use Next.js dynamic imports for the QR code display component.
- Events page must use a React Server Component to eliminate client-side fetch waterfall.

FINAL PHASE CHECK: Run `tsc --noEmit` and confirm zero TypeScript errors. Run a full
end-to-end walkthrough: delegate registration (team of 3) → event registration (1 solo

- 1 group) → verify all Firestore documents → verify all Sheets rows → verify both
  email types received. Document any manual setup steps remaining (Firebase rules,
  Netlify env config, GCP service account permissions).

══════════════════════════════════════════════
GOOGLE CLOUD / FIREBASE SETUP GUIDE REQUIRED
══════════════════════════════════════════════
Since this project starts from scratch on GCP, before Phase 0 code, output a
SETUP_GUIDE.md file with step-by-step manual instructions for:

1. Creating a Firebase project and enabling Firestore + Storage.
2. Setting Firestore security rules (deny all client reads/writes — only Admin SDK
   may write; optionally allow client reads on the events collection only).
3. Setting Firebase Storage security rules (deny all direct client access — uploads
   go through the Next.js API route using Admin SDK only).
4. Creating a GCP service account with roles: Firebase Admin, Cloud Datastore User,
   Storage Admin, Google Sheets API Editor.
5. Downloading the service account JSON and mapping each field to the correct env
   variable.
6. Enabling the Google Sheets API in GCP console.
7. Creating the Google Spreadsheet, sharing it with the service account email, and
   noting the spreadsheet ID for the env variable.
8. Configuring Netlify: adding all env variables, enabling the scheduled function,
   and installing @netlify/plugin-nextjs.

══════════════════════════════════════════════
CANCELLATIONS (OFFLINE — NO APP LOGIC NEEDED)
══════════════════════════════════════════════
Cancellations are handled manually offline. The app does not need a cancellation
flow. However, the paymentStatus field on both delegates and eventRegistrations
documents must support a "rejected" value so that organizers can manually update
this field in the Firebase console if needed. The app does not need to react to
this field — it is purely for record-keeping.

══════════════════════════════════════════════
OUT OF SCOPE — DO NOT IMPLEMENT
══════════════════════════════════════════════

- Admin dashboard
- Webhook-based payment verification
- User accounts or authentication sessions
- Server-side cart persistence
- Any payment gateway integration (Razorpay, Stripe, etc.)
- Any Firebase Extensions (implement compression directly via sharp instead)
