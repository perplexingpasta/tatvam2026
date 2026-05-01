# PLAN.md — Tatvam 2026 Registration System

> **For coding agents:** This is the single source of truth for this project. Read this **before** writing any code. All variable names, collection names, field names, API routes, and environment variables in this document match what is in the codebase exactly.

---

## Architecture Decisions

- **Database:** Firebase Firestore (Admin SDK for all server-side reads/writes). Never use client SDK for writes.
- **File Storage:** Cloudinary only. **No Firebase Storage.**
- **Email:** Resend.
- **Google Sheets:** Secondary mirror only, never source of truth. Always async, always fault-tolerant.
- **Image Compression:** Client-side, via `browser-image-compression` in the `useImageUpload` hook, converting to `image/webp` before upload. Cloudinary applies additional URL transforms (`f_auto,q_auto,w_800`) on delivery.
- **Hosting:** Vercel.
- **Firestore REST mode:** `adminDb.settings({ preferRest: true })` is called inside the `if (!admin.apps.length)` block in `lib/firebaseAdmin.ts` to avoid gRPC connection errors in local dev.

---

## System Modules

There are **two independent systems** in this project. They do not share API routes, Firestore collections, or Google Sheets.

1. **Registration System** — Delegate registration + Event registration (cart-based)
2. **Merch Store** — Standalone merchandise store, no delegate ID required

---

## Environment Variables

All must be set in `.env.local` for development and in Vercel for production.

### Firebase (Client SDK — public, used in `lib/firebase.ts`)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Firebase (Admin SDK — server-side only, used in `lib/firebaseAdmin.ts`)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` — newlines must be escaped as `\n` in the .env file; the code replaces them: `process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')`

### Cloudinary (server-side only, used in `lib/cloudinary.ts`)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Resend (server-side only)
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL` — the sender address, e.g. `noreply@yourdomain.com`

### Google Sheets — Registration System
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `GOOGLE_SHEETS_SPREADSHEET_ID` — used in `lib/sheetsSync.ts`

### Google Sheets — Merch Store
- `GOOGLE_MERCH_SHEETS_SPREADSHEET_ID` — used in `lib/merchSheetsSync.ts`

### App-Level Constants (public)
- `NEXT_PUBLIC_FEST_NAME` — e.g. `"Tatvam 2026"`
- `NEXT_PUBLIC_SITE_URL` — e.g. `"https://tatvam.in"` (used by cron)
- `NEXT_PUBLIC_PAYMENT_QR_IMAGE_PATH` — path to QR image for delegate/event payments, e.g. `"/qr-code.webp"`
- `NEXT_PUBLIC_SPORTS_PAYMENT_QR_IMAGE_PATH` — path to QR image for sports committee payments, e.g. `"/sports-qr-code.webp"`
- `NEXT_PUBLIC_MERCH_PAYMENT_QR_IMAGE_PATH` — path to QR image for merch payments
- `NEXT_PUBLIC_MAX_FILE_SIZE_MB` — max upload size, e.g. `"10"` (read in `/api/upload/image`)
- `NEXT_PUBLIC_TIER_1_NAME` — e.g. `"Gold"`
- `NEXT_PUBLIC_TIER_1_PRICE` — e.g. `"100"`
- `NEXT_PUBLIC_TIER_2_NAME` — e.g. `"Platinum"`
- `NEXT_PUBLIC_TIER_2_PRICE` — e.g. `"200"`
- `NEXT_PUBLIC_TIER_3_NAME` — e.g. `"Diamond"`
- `NEXT_PUBLIC_TIER_3_PRICE` — e.g. `"300"`

### Cron Security
- `CRON_SECRET` — bearer token verified in `/api/cron/sheets-retry`

---

## Firestore Collections

### 1. `delegates/{delegateId}`

- `delegateId`: string — Format: `[FIRST3CHARS_OF_NAME]-[LAST5DIGITS_OF_PHONE]-[5_RANDOM_ALPHANUM]` (all uppercase), e.g. `RJT-09322-B4GJY`
- `name`: string
- `email`: string — must be unique
- `phone`: string — must be unique
- `collegeName`: string
- `isJSSMC`: boolean
- `collegeIdNumber`: string — must be unique
- `collegeIdImageUrl`: string — Cloudinary transformed URL (`f_auto,q_auto,w_800`). This is what gets stored in Firestore, not the original.
- `delegateTier`: `"tier1"` | `"tier2"` | `"tier3"`
- `tierPrice`: number
- `teamId`: string | null
- `paymentScreenshotUrl`: string — Cloudinary original URL (no transforms)
- `utrNumber`: string — 12–22 alphanumeric characters
- `paymentStatus`: `"pending_verification"` | `"verified"` | `"rejected"`
- `registeredEventIds`: string[] — array of `eventId`s the delegate has registered for
- `createdAt`: Firestore Timestamp
- `sheetsSync`: object
  - `status`: `"pending"` | `"synced"` | `"failed"` | `"dead_letter"`
  - `retryCount`: number
  - `lastAttempt`: Timestamp | null
  - `lastError`: string | null

### 2. `teams/{teamId}`

- `teamId`: string — Format: `[FIRST3CHARS_OF_TEAMNAME]-[7_RANDOM_ALPHANUM]` (all uppercase), e.g. `TAT-B4GJY12`
- `teamName`: string
- `memberDelegateIds`: string[]
- `leadDelegateId`: string — always `memberDelegateIds[0]`
- `createdAt`: Firestore Timestamp

### 3. `eventRegistrations/{registrationId}`

- `registrationId`: string — auto-generated Firestore doc ID
- `domain`: `"cultural"` | `"sports"` (optional, defaults to cultural for older entries)
- `participantDelegateIds`: string[] — flat array of all delegate IDs across all cart items (deduplicated)
- `cartItems`: array of objects:
  - `eventId`: string
  - `eventName`: string
  - `eventType`: `"solo"` | `"group"`
  - `participantDelegateIds`: string[]
  - `teamId`: string | null
  - `eventFee`: number
- `totalAmount`: number
- `paymentScreenshotUrl`: string — Cloudinary original URL
- `utrNumber`: string
- `paymentStatus`: `"pending_verification"` | `"verified"` | `"rejected"`
- `submittedAt`: Firestore Timestamp
- `sheetsSync`: object
  - `status`: `"pending"` | `"synced"` | `"failed"` | `"dead_letter"`
  - `retryCount`: number
  - `lastAttempt`: Timestamp | null
  - `lastError`: string | null

### 4. `events/{eventId}`

Read-only at runtime. Seeded via `scripts/seedEvents.ts` from `lib/eventsCatalogue.ts`. The `eventId` equals the event's `slug`.

- `eventId`: string — same as `slug`
- `indianName`: string — e.g. `"Swar Leela"`
- `englishName`: string — e.g. `"Solo Eastern Singing"`
- `slug`: string — URL-safe, e.g. `"swar-leela"`
- `category`: `"music"` | `"dance"` | `"assorted"` | `"quiz"` | `"drama"` | `"art"` | `"literary"`
- `description`: string — full description (may be empty)
- `shortDescription`: string — 1–2 sentences for card display
- `type`: `"solo"` | `"group"`
- `pricingType`: `"per_person"` | `"flat_total"` | `"free"`
- `fee`: number — 0 if free; per-person if `per_person`; total if `flat_total`
- `minTeamSize`: number | null
- `maxTeamSize`: number | null
- `isOnline`: boolean
- `isAvailable`: boolean — false = registration closed
- `tags`: string[] — auto-generated by `generateTags()` in `lib/eventsCatalogue.ts`
- `imageUrls`: string[]
- `venue`: string | null
- `eventDate`: string | null — ISO date string
- `eventTime`: string | null — e.g. `"10:00 AM"`
- `schedule`: string | null — combined display, e.g. `"Day 1, 10:00 AM"`
- `rules`: string[]
- `contactName`: string | null
- `contactPhone`: string | null

**To add/edit/delete events:** Edit `lib/eventsCatalogue.ts`, then run:
```
npx tsx scripts/seedEvents.ts
```
This wipes and re-seeds the entire `events` collection.

### 5. `sheetsRetryQueue/{docId}`

Used by `lib/sheetsSync.ts` for the registration system's retry queue.

- `type`: `"delegate"` | `"eventRegistration"` | `"sportsRegistration"`
- `referenceId`: string — delegateId, teamId, or registrationId
- `payload`: any — the full sync payload
- `retryCount`: number
- `status`: `"pending"` | `"synced"` | `"failed"` | `"dead_letter"` — becomes `"dead_letter"` after 10 retries
- `nextRetryAt`: Firestore Timestamp
- `lastError`: string
- `createdAt`: Firestore Timestamp
- `updatedAt`: Firestore Timestamp

### 6. `merchOrders/{orderId}`

- `orderId`: string — Format: `MERCH-[AAA]-[BBB]-[XXXXX]` where AAA = first 3 letters of buyer name, BBB = first 3 letters of item name or `MIX` for multiple items, XXXXX = 5 random hex chars uppercased
- `buyerName`: string
- `buyerEmail`: string
- `buyerPhone`: string
- `units`: array of MerchUnit objects:
  - `unitId`: string (UUID)
  - `itemId`: string — e.g. `"jersey"`
  - `itemName`: string
  - `price`: number
  - `attributes`: `Record<string, string>` — e.g. `{ size: "L", playerName: "VIKRAM" }`
- `totalAmount`: number — calculated server-side, never trusted from client
- `utrNumber`: string
- `paymentScreenshotUrl`: string — Cloudinary original URL
- `submittedAt`: Date (stored as JS Date in Firestore, not server timestamp)
- `merchSheetsSync`: object
  - `status`: `"pending"` | `"synced"` | `"failed"`
  - `retryCount`: number
  - `lastAttempt`: Date | null
  - `lastError`: string | null

### 7. `merchSheetsRetryQueue/{docId}`

- `type`: `"merchOrder"`
- `referenceId`: string — orderId
- `payload`: object
- `retryCount`: number
- `status`: `"pending"` | `"synced"` | `"failed"` | `"dead_letter"`
- `nextRetryAt`: Date
- `lastError`: string
- `createdAt`: Date

---

## API Route Contracts

### `POST /api/registration/delegate`

Registers one or more delegates (up to 25) in a single submission.

**Request:** `multipart/form-data`
- `isJSSMC`: `"true"` | `"false"`
- `teamName`: string (optional; required if member count > 1)
- `paymentScreenshotUrl`: string — pre-uploaded Cloudinary URL (JSSMC: omit or empty)
- `utrNumber`: string (JSSMC: omit or empty)
- Per member (indexed from 0):
  - `member_${i}_name`, `member_${i}_email`, `member_${i}_phone`
  - `member_${i}_collegeName`, `member_${i}_collegeIdNumber`, `member_${i}_delegateTier`
  - `member_${i}_collegeIdImageUrl` — Cloudinary original URL
  - `member_${i}_collegeIdImageTransformedUrl` — Cloudinary transformed URL (stored as `collegeIdImageUrl` in Firestore)

**Response (success):** `{ success: true, delegateIds: string[], teamId: string | null, message: string }`

**Error codes:** 400 (validation), 409 (email/phone/collegeId conflict), 415 (wrong content type), 500

**Validation:** Runs a Firestore transaction to re-check uniqueness of email, phone, and collegeIdNumber. Retries up to 3 times on non-conflict transaction errors.

---

### `GET /api/registration/validate`

Pre-flight uniqueness check called from the frontend before proceeding to Step 2 (payment).

**Request query params:**
- `emails`: comma-separated list
- `phones`: comma-separated list
- `collegeIds`: comma-separated list

**Response (success):** `{ success: true, conflicts: Array<{ field: string, value: string }> }`

**Rate limit:** 30 requests per IP per minute.

---

### `POST /api/registration/events`

Submits an event registration cart.

**Request:** `multipart/form-data`
- `cartItems`: JSON string — array of `{ eventId, eventName, eventType, participantDelegateIds, teamId, eventFee }`
- `utrNumber`: string
- `paymentScreenshotUrl`: string — pre-uploaded Cloudinary URL (validated as a valid URL)

**Response (success):** `{ success: true, registrationId: string, message: string }`

**Error codes:** 400 (validation/missing fields), 409 (delegate already registered for an event), 415, 500

**Behaviour:** Runs a Firestore transaction to verify no delegate is already in `registeredEventIds` for any event in the cart, then writes the `eventRegistrations` doc, batch-updates all delegate docs (`registeredEventIds: FieldValue.arrayUnion(eventId)`), fires Google Sheets sync (async), and sends a confirmation email to the lead delegate.

---

### `POST /api/registration/sports`

Submits a sports registration cart. Identical contract and behaviour to `/api/registration/events`, but writes to the `SportsRegistrations` tab in Google Sheets.

---

### `GET /api/delegates/lookup`

Verifies a delegate ID during event cart checkout.

**Request query params:**
- `id`: string — the delegate ID
- `eventId`: string (optional) — if provided, checks if delegate is already registered for this event and returns a 409 if so

**Response (success):** `{ success: true, delegate: { name, collegeName, college, delegateTier, teamId } }`

> **IMPORTANT:** Never return `phone`, `email`, `collegeIdNumber`, `collegeIdImageUrl`, or `paymentScreenshotUrl` in this response.

**Error codes:** 400 (missing id), 404 (not found), 409 (already registered for event), 429 (rate limited), 500

**Rate limit:** 20 requests per IP per minute, in-memory.

---

### `GET /api/registration-status`

Public lookup for a delegate's registration status. Used by `/registration-status` page.

**Request query params:**
- `query`: string — accepts email address, delegate ID (`AAA-DDDDD-AAAAA` format), or team ID (`AAA-AAAAAAA` format)

**Lookup type detection:**
- Contains `@` → email lookup
- Matches `/^[A-Z]{3}-\d{5}-[A-Z0-9]{5}$/` → delegate lookup
- Matches `/^[A-Z]{3}-[A-Z0-9]{7}$/` → team lookup

**Response (delegate/email lookup):**
```json
{
  "success": true,
  "lookupType": "delegate",
  "delegate": { "delegateId", "name", "email", "collegeName", "delegateTier", "teamId", "isJSSMC", "paymentStatus", "registeredEventIds", "createdAt" },
  "team": { ... } | null,
  "soloEvents": [...],
  "teamEvents": [...]
}
```

**Response (team lookup):**
```json
{
  "success": true,
  "lookupType": "team",
  "team": { "teamId", "teamName", "leadDelegateId", "memberDelegateIds", "members": [...] },
  "teamEvents": [...]
}
```

**Rate limit:** 10 requests per IP per minute.

---

### `POST /api/upload/image`

Shared image upload endpoint. Handles compression, validation, and Cloudinary upload.

**Request:** `multipart/form-data`
- `file`: File — WebP (after client-side conversion), JPEG, JPG, or PNG accepted
- `folder`: `"college-ids"` | `"payment-proofs"` | `"merch-payments"`

**Response (success):** `{ success: true, originalUrl: string, transformedUrl: string, folder: string }`

**Cloudinary transforms applied on server:**
- `college-ids`: `width: 1200, crop: "limit"` + `quality: "auto:good"` + `fetch_format: "auto"`
- `payment-proofs` and `merch-payments`: `width: 2000, crop: "limit"` + `quality: "auto:good"` + `fetch_format: "auto"`

**Max file size:** Controlled by `NEXT_PUBLIC_MAX_FILE_SIZE_MB` (default: 20MB).

**Note:** Client side already compresses to WebP via `useImageUpload` hook before this endpoint is called. The `transformedUrl` uses the pattern: `{baseUrl}/upload/f_auto,q_auto,w_800/{path}`.

---

### `POST /api/merch/order`

Submits a merchandise order.

**Request:** `multipart/form-data`
- `buyerName`: string
- `buyerEmail`: string
- `buyerPhone`: string
- `utrNumber`: string — 12–22 alphanumeric
- `units`: JSON string — array of `{ itemId, itemName, price, attributes: Record<string, string> }`
- `paymentScreenshotUrl`: string — pre-uploaded Cloudinary URL (must start with `https://res.cloudinary.com/`)

**Response (success):** `{ success: true, orderId: string, message: string }`

**Behaviour:** Validates prices server-side against `lib/merchCatalogue.ts` (price from client is checked against catalogue — mismatch = 400). Total calculated server-side. Generates orderId. Writes to Firestore. Fires Sheets sync async. Sends confirmation email via Resend.

---

### `GET /api/cron/sheets-retry`

Triggered by Vercel cron. Secured by `CRON_SECRET` bearer token.

**Auth:** `Authorization: Bearer ${CRON_SECRET}`

**Behaviour:** Calls `POST /api/sheets/retry` internally via `NEXT_PUBLIC_SITE_URL`.

---

## Image Upload Flow (Client-Side)

All image uploads follow this pattern:

1. User selects image in a `<StagedFileUpload />` component.
2. The `useImageUpload` hook (in `hooks/useImageUpload.ts`) runs:
   - Validates file type (JPEG, JPG, PNG only) and size.
   - Compresses and converts to **WebP** using `browser-image-compression` with `fileType: 'image/webp'`.
   - Uploads the compressed WebP to `/api/upload/image`.
3. The upload API applies Cloudinary transforms and returns `{ originalUrl, transformedUrl }`.
4. The parent component stores the URLs in state.
5. On form submission, only the **URL strings** are sent to the registration/order API — no raw files.

**Folders used:**
- `"college-ids"` — delegate college ID cards (compressionTargetMB: 0.5, maxWidthOrHeight: 1200)
- `"payment-proofs"` — delegate/event payment screenshots (compressionTargetMB: 0.8, maxWidthOrHeight: 2000)
- `"merch-payments"` — merch payment screenshots (same settings as payment-proofs)

---

## Google Sheets Sync

### Registration System (`lib/sheetsSync.ts`)

**Sync types:** `"delegate"` | `"eventRegistration"` | `"sportsRegistration"`

**Flow:** `attemptSyncWithFallback()` is called fire-and-forget after writing to Firestore. It calls `syncToSheets()`. On failure, a doc is added to `sheetsRetryQueue` and the source doc's `sheetsSync.status` is set to `"failed"`.

#### Delegates Sheet (`"Delegates!A:P"`) — 16 columns
| Col | Field |
|-----|-------|
| A | Delegate ID |
| B | Name |
| C | Email |
| D | Phone |
| E | College Name |
| F | College ID Number |
| G | College ID Image URL (original) |
| H | Delegate Tier (human name, e.g. "Gold") |
| I | Tier Price |
| J | Team ID |
| K | Team Name |
| L | Is JSSMC (`"TRUE"` / `"FALSE"`) |
| M | Payment Status |
| N | UTR Number |
| O | Payment Screenshot URL |
| P | Created At (formatted in IST, `"HH:MM AM, DD-MM-YYYY"`) |

#### Event Registrations Sheet (`"EventRegistrations!A:I"`) — 9 columns, one row per cart item
| Col | Field |
|-----|-------|
| A | Registration ID |
| B | Event Name |
| C | Event Type |
| D | Team ID |
| E | Participant IDs (comma-separated) |
| F | Total Amount |
| G | UTR Number |
| H | Payment Status |
| I | Submitted At (formatted in IST) |

#### Sports Registrations Sheet (`"SportsRegistrations!A:J"`) — 10 columns, one row per cart item
| Col | Field |
|-----|-------|
| A | Registration ID |
| B | Event Name |
| C | Event Type |
| D | Participant Names (comma-separated) |
| E | Participant IDs (comma-separated) |
| F | Event Fee |
| G | Total Amount |
| H | UTR Number |
| I | Payment Status |
| J | Submitted At (formatted in IST) |

---

### Merch Store (`lib/merchSheetsSync.ts`)

**Spreadsheet:** `GOOGLE_MERCH_SHEETS_SPREADSHEET_ID`

#### Merch Orders Sheet (`"MerchOrders!A:L"`) — 12 columns, one row per **unit** (not per order)
| Col | Field |
|-----|-------|
| A | Order ID |
| B | Buyer Name |
| C | Buyer Email |
| D | Buyer Phone |
| E | Item Name |
| F | Attributes (e.g. `"Size: L \| PlayerName: VIKRAM"`) |
| G | Unit Price |
| H | Total Order Amount |
| I | UTR Number |
| J | Payment Screenshot URL |
| K | Submitted At (ISO string) |
| L | Total Units in Order |

---

## Merch Catalogue

Defined statically in `lib/merchCatalogue.ts`. No Firestore collection. Images stored in `/public/merch/[item-id]-[number].jpg`.

**Current items:** `jersey` (₹499), `hoodie` (₹899), `varsity-jacket` (₹1299)

Each item has: `id`, `name`, `description`, `price`, `images`, `isAvailable`, `attributes[]`

Each attribute has: `id`, `label`, `type` (`"text"` | `"number"` | `"select"`), `required`, `placeholder?`, `options?`

To add/edit merch items: edit `lib/merchCatalogue.ts` only. No seeding script needed.

---

## Events Catalogue

Defined in `lib/eventsCatalogue.ts` as a `rawEvents` array. The `buildEvent()` function fills in defaults and generates tags. The exported `eventsCatalogue` array is what gets seeded to Firestore.

**Tag auto-generation rules** (see `generateTags()` in `lib/eventsCatalogue.ts`):
- Always adds `"solo"` or `"group"` based on type
- `"online"` if `isOnline: true`
- `"free"` if `pricingType === "free"`
- `"under-100"` if `fee < 100`
- `"under-300"` if `fee < 300`
- `"large-team"` if `maxTeamSize >= 6`
- `"small-team"` if `maxTeamSize <= 5` and type is `"group"`
- `"flagship"` for slugs: `ahaang`, `group-dance`, `streetplay`, `fashion-main`, `codm-mobile`, `bgmi-mobile`
- `"gaming"` for slugs: `fifa-pc`, `bgmi-mobile`, `codm-mobile`
- `"performing-arts"` for categories: `music`, `dance`
- `"visual-arts"` for category: `art`
- `"literary"` for category: `literary`
- `"music"` / `"dance"` for respective categories

**Current count:** 33 events across 7 categories.

**To update events:** Edit `lib/eventsCatalogue.ts`, then run `npx tsx scripts/seedEvents.ts`.

> **WARNING:** Changing a `slug` (= `eventId`) for an existing event after delegates have registered will orphan those `registeredEventIds` entries. Only change slugs before any registrations are live.

---

## Key Components

- **`components/StagedFileUpload.tsx`** — File upload UI component used for college IDs, payment proofs, and merch payments. Uses `useImageUpload` hook internally.
- **`hooks/useImageUpload.ts`** — Handles client-side compression (WebP), upload to `/api/upload/image`, and state management.
- **`components/CartProvider.tsx`** — React context for the cultural event registration cart. Persisted to `localStorage` under `"eventsCart"`.
- **`lib/eventPricing.ts`** — Utility functions: `formatEventPrice()`, `getCartFee()`, `formatTeamSize()`.

---

## State Management & Carts

All carts are persisted to `localStorage` and strictly isolated to prevent overlaps:
- `"eventsCart"` — Cultural events cart state
- `"sportsCart"` — Sports events cart state
- `"merchCart"` — Merchandise cart state

---

## Delegate Registration Flow (Summary)

1. User selects mode: **JSSMC** (free, tier3) or **External** (paid).
2. Fills in member details. College IDs are uploaded via `StagedFileUpload` (step 1 triggers upload immediately).
3. Click "Proceed" → frontend calls `/api/registration/validate` to pre-check uniqueness.
4. **JSSMC:** submits directly. **External:** moves to Step 2 (payment page).
5. User uploads payment screenshot via `StagedFileUpload`, enters UTR.
6. Submits → calls `/api/registration/delegate` with all data + pre-uploaded Cloudinary URLs.

## Event Registration Flow (Summary)

1. Browse `/events` page (reads from Firestore `events` collection).
2. Add events to cart (persisted in `localStorage` under key `"eventsCart"`).
3. Go to `/cart`. Enter delegate IDs per event, verify via `/api/delegates/lookup`.
4. Upload payment screenshot via `StagedFileUpload`, enter UTR.
5. Submit → calls `/api/registration/events` with pre-uploaded `paymentScreenshotUrl`.

## Merch Store Flow (Summary)

1. Browse `/merch` page (reads from `lib/merchCatalogue.ts` statically).
2. Add items to merch cart (stored in `localStorage` under key `"merchCart"`).
3. Go to `/merch/cart`. Fill buyer details, upload payment screenshot, enter UTR.
4. Submit → calls `/api/merch/order` with pre-uploaded `paymentScreenshotUrl`.