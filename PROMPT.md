You are a senior full-stack developer. You will implement a complete, production-grade registration system in an existing Next.js (App Router) project using TypeScript and
Tailwind CSS. The project already has the following blank page.tsx files scaffolded:
app/page.tsx, app/events/page.tsx, app/schedule/page.tsx, app/registration/page.tsx, app/contact/page.tsx, app/about/page.tsx. You will also need to create app/cart/page.tsx during implementation.

══════════════════════════════════════════════
ABSOLUTE RULES — NEVER VIOLATE THESE
══════════════════════════════════════════════

- DO NOT hallucinate libraries, APIs, Firebase extensions, or npm packages. Only use packages that exist on npm as of 2024 and are widely adopted.
- Before writing any code, define ALL data schemas, Firestore collection structures, API route contracts, and environment variable names in a PLAN.md file. Do not write a single line of implementation code until this plan is written and complete.
- After every phase, run a self-check: verify that all code compiles with zero TypeScript errors, all referenced env variables are documented, and no placeholder/stub logic is
  left unimplemented before moving to the next phase.
- Follow the principle of least surprise: never silently swallow errors. Every failure must surface a log entry and, where applicable, a user-facing message.
- All user-facing UI must be mobile-first, responsive, and optimised for minimal initial page load (use Next.js dynamic imports, lazy loading, and image optimisation where appropriate).
- Prefer server-side logic (Next.js Route Handlers) over client-side wherever possible.
- Use modular, maintainable architecture: separate concerns into /lib, /components, /hooks, /types, and /app/api directories.

══════════════════════════════════════════════
TECH STACK (FIXED — DO NOT SUBSTITUTE)
══════════════════════════════════════════════

- Framework: Next.js 14+ App Router, TypeScript, Tailwind CSS
- Validation: Zod (shared schemas used on both client and server)
- Email: Resend
- Database: Firebase Firestore
- File Storage: Cloudinary (for college ID images and payment screenshots)
- Image compression: Cloudinary handles compression and CDN delivery automatically via URL transformation parameters. Do NOT use sharp or any server-side compression library. After uploading a file to Cloudinary, store the URL with these transformations appended: f_auto,q_auto,w_800 for images displayed in the app. For admin/sheet reference URLs, store the original upload URL as-is.
- Google Sheets: google-auth-library + googleapis npm packages (service account auth)
- Hosting: Netlify (ensure next.config.js is compatible; use @netlify/plugin-nextjs)

══════════════════════════════════════════════
ENVIRONMENT VARIABLES
══════════════════════════════════════════════
At the start of Phase 1, create a .env.local.example file listing every single environment variable the project will need, with a comment explaining each one.
Include variables for: Firebase (project config + service account), Resend API key, Cloudinary (cloud name, API key, API secret), Google Sheets (spreadsheet IDs + service account credentials), and any app-level constants (e.g. max file size, delegate kit prices).

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
   - collegeIdImageUrl: string (Cloudinary CDN URL with f_auto,q_auto,w_800 transforms)
   - delegateTier: "tier1" | "tier2" | "tier3"
   - tierPrice: number
   - teamId: string | null
   - paymentScreenshotUrl: string (Cloudinary original URL — no transforms)
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
   - paymentScreenshotUrl: string (Cloudinary CDN URL — store original, no transforms)
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

- Solo (1 person): [FIRST 3 CHARS OF FIRST NAME (uppercase)] + "-" + [LAST 5 DIGITS OF PHONE] + "-" + [5 random alphanumeric chars, uppercase]Example: VIK-66688-FV3U9
- Team registration (2+ people): Each member gets the same solo-format ID as above. Additionally, a TEAM ID is generated: [FIRST 3 CHARS OF TEAM NAME (uppercase)] + "-"
  - [7 random alphanumeric chars, uppercase]
    Example: SPD-A3K9PQ2
- ID generation must be collision-resistant: after generating an ID, check Firestore to confirm it doesn't already exist before saving. Retry generation if collision found.

UNIQUENESS CONSTRAINTS (enforce at Firestore write time using transactions):

- No two delegates may share the same email address.
- No two delegates may share the same phone number.
- No two delegates may share the same collegeIdNumber.
- Return a specific, descriptive error message for each violation (e.g. "A delegate
  with this email already exists.") — never a generic error.

══════════════════════════════════════════════
PRICING MODEL
══════════════════════════════════════════════

- There are three delegate kit tiers. Each has its own fixed price (store prices in env variables so they can be updated without code changes).
- Every participant must purchase one delegate kit tier as the base registration.
- Every event has its own additional fee stored in the `events` collection in Firestore.
- Total amount for a team registration = sum of (tierPrice for each member).
- Total amount for event registration = sum of (eventFee for each cart item × applicable participants). Calculate and display this breakdown clearly on the cart and payment pages.

══════════════════════════════════════════════
PHASE-BY-PHASE IMPLEMENTATION PLAN
══════════════════════════════════════════════

You MUST complete each phase fully, verify it works, and explicitly state "PHASE N COMPLETE — ALL CHECKS PASSED" before starting the next phase.

────────────────────────────────────────────
PHASE 0 — PLANNING & SCAFFOLDING
────────────────────────────────────────────

1. Create PLAN.md documenting: all Firestore schemas, all API route contracts (method, path, request body shape, response shape, error codes), all environment variables, and the Google Sheets column layout for each sheet.
2. Create .env.local.example with all required variables and descriptive comments.
3. Install all required npm packages in one go: zod, firebase, firebase-admin, resend, cloudinary, googleapis, google-auth-library, @netlify/plugin-nextjs. Do not install any other packages not listed here without explicitly stating why.
4. Create /types/index.ts with all shared TypeScript types derived from the Firestore schemas above. Use Zod schemas as the source of truth and infer TS types from them.
5. Create a /lib directory with separate files: firebase.ts (client SDK init), firebaseAdmin.ts (Admin SDK init), resend.ts (Resend client init), sheets.ts (Google Sheets client init with service account), cloudinary.ts (Cloudinary Node.js SDK init using CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET). Also create /lib/cloudinaryUpload.ts with the signature:
   uploadToCloudinary(fileBuffer: Buffer, mimeType: string, folder: string):
   Promise<{ originalUrl: string, transformedUrl: string }>
   It must:
   - Upload via cloudinary.v2.uploader.upload_stream
   - Use the folder parameter to organise uploads (e.g. "college-ids",
     "payment-proofs")
   - Return originalUrl as the raw secure_url from Cloudinary's response
   - Return transformedUrl as the same URL with /upload/ replaced by
     /upload/f_auto,q_auto,w_800/ for display use
   - Throw a descriptive error if upload fails — never silently swallow it
     Never write temp files to disk — always convert incoming FormData files to a
     Buffer before passing to uploadToCloudinary.
6. Create a Firestore seed script at /scripts/seedEvents.ts that populates the events collection with sample events (mix of solo and group types with fees). This script must be runnable with `npx ts-node scripts/seedEvents.ts`.

PHASE 0 CHECK: Confirm all packages install without errors. Confirm TypeScript compiles.
Confirm all lib files initialise without throwing. Document any GCP/Firebase setup steps the developer must manually complete (project creation, enabling Firestore, Google Sheets API, creating service account, downloading credentials JSON). Also verify Cloudinary SDK initialises correctly using the provided env variables.
