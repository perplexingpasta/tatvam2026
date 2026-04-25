# Registration System Plan

## Environment Variables

The project requires the following environment variables (also see `.env.local.example`):

- **Firebase (Client SDK)**
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`

- **Firebase (Admin SDK)**
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY` (ensure newline characters are handled correctly)
  - `FIREBASE_PROJECT_ID` (can reuse `NEXT_PUBLIC_FIREBASE_PROJECT_ID`)

- **Resend**
  - `RESEND_API_KEY`

- **Cloudinary**
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

- **Google Sheets**
  - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
  - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
  - `GOOGLE_SHEETS_SPREADSHEET_ID`

- **App-level Constants**
  - `NEXT_PUBLIC_MAX_FILE_SIZE_MB` (e.g., 10)
  - `NEXT_PUBLIC_TIER_1_PRICE`
  - `NEXT_PUBLIC_TIER_2_PRICE`
  - `NEXT_PUBLIC_TIER_3_PRICE`
  - `RESEND_FROM_EMAIL`
  - `NEXT_PUBLIC_FEST_NAME`
  - `NEXT_PUBLIC_PAYMENT_QR_IMAGE_PATH`

## Firestore Schemas

### 1. `delegates/{delegateId}`
- `delegateId`: string (Unique, format: `[FIRST 3 CHARS OF FIRST NAME (uppercase)]-[LAST 5 DIGITS OF PHONE]-[5 random alphanumeric chars, uppercase]`)
- `name`: string
- `email`: string (Unique constraint)
- `phone`: string (Unique constraint)
- `yearOfStudy`: string
- `collegeIdNumber`: string (Unique constraint)
- `collegeIdImageUrl`: string (Cloudinary CDN URL with `f_auto,q_auto,w_800` transforms)
- `delegateTier`: "tier1" | "tier2" | "tier3"
- `tierPrice`: number
- `teamId`: string | null
- `paymentScreenshotUrl`: string (Cloudinary original URL)
- `utrNumber`: string
- `paymentStatus`: "pending_verification" | "verified" | "rejected"
- `registeredEventIds`: string[]
- `createdAt`: Timestamp
- `sheetsSync`: object
  - `status`: "pending" | "synced" | "failed"
  - `retryCount`: number
  - `lastAttempt`: Timestamp | null
  - `lastError`: string | null

### 2. `teams/{teamId}`
- `teamId`: string (Unique, format: `[FIRST 3 CHARS OF TEAM NAME (uppercase)]-[7 random alphanumeric chars, uppercase]`)
- `teamName`: string
- `memberDelegateIds`: string[]
- `leadDelegateId`: string
- `createdAt`: Timestamp

### 3. `eventRegistrations/{registrationId}`
- `registrationId`: string (Auto Firestore ID)
- `cartItems`: Array of objects
  - `eventId`: string
  - `eventName`: string
  - `eventType`: "solo" | "group"
  - `participantDelegateIds`: string[]
  - `teamId`: string | null
  - `eventFee`: number
- `totalAmount`: number
- `paymentScreenshotUrl`: string (Cloudinary CDN URL - original, no transforms)
- `utrNumber`: string
- `paymentStatus`: "pending_verification" | "verified" | "rejected"
- `submittedAt`: Timestamp
- `sheetsSync`: object
  - `status`: "pending" | "synced" | "failed"
  - `retryCount`: number
  - `lastAttempt`: Timestamp | null
  - `lastError`: string | null

### 4. `events/{eventId}` (Seed data)
- `eventId`: string
- `name`: string
- `description`: string
- `type`: "solo" | "group"
- `minTeamSize`: number | null
- `maxTeamSize`: number | null
- `fee`: number
- `schedule`: Timestamp | null
- `venue`: string | null

### 5. `sheetsRetryQueue/{docId}`
- `type`: "delegate" | "eventRegistration"
- `referenceId`: string
- `payload`: object
- `retryCount`: number
- `nextRetryAt`: Timestamp
- `lastError`: string
- `createdAt`: Timestamp

## API Route Contracts

### 1. `POST /api/registration/delegate`
- **Request Body Shape:** FormData containing delegate fields (name, email, phone, yearOfStudy, collegeIdNumber, delegateTier, utrNumber, teamName (optional), collegeIdImage file, paymentScreenshot file).
- **Response Shape (Success):** `{ success: true, delegateIds: string[], teamId?: string, message: string }`
- **Error Codes:** 400 (Bad Request / Validation), 409 (Conflict - email/phone/collegeId already exists), 500 (Internal Server Error)

### 2. `POST /api/registration/events`
- **Request Body Shape:** FormData containing event registration fields (cartItems array as JSON string, utrNumber, paymentScreenshot file).
- **Response Shape (Success):** `{ success: true, registrationId: string, message: string }`
- **Error Codes:** 400 (Bad Request / Validation), 500 (Internal Server Error)

### 3. `POST /api/sheets/retry` (Optional, if cron needed for retry queue)
- **Request Body Shape:** Empty
- **Response Shape (Success):** `{ success: true, syncedCount: number, message: string }`

### 4. `GET /api/delegates/lookup`
- **Purpose:** Looks up a delegate by their unique delegate ID during event registration on the cart page. Used to verify participant identity before event payment.
- **Request:** Query parameter `?id=VIK-66688-FV3U9`
- **Response Shape (Success):** 
  `{ success: true, delegate: { name: string, yearOfStudy: string, college: string, delegateTier: string, teamId: string | null } }`
- **IMPORTANT:** Never return sensitive fields in this response — 
  phone, email, collegeIdNumber, collegeIdImageUrl, and paymentScreenshotUrl must be explicitly excluded from the response.
- **Error Codes:** 
  - 400 (missing or malformed ID parameter)
  - 404 (delegate ID not found)
  - 429 (rate limit exceeded — max 20 requests per IP per minute)
  - 500 (Internal Server Error)
- **Security:** This endpoint must be rate-limited to prevent delegate ID enumeration attacks. Implement using an in-memory rate limiter or upstash/ratelimit if available.

## Google Sheets Column Layout

### Delegates Sheet
Columns: Delegate ID, Name, Email, Phone, Year of Study, College ID Number, Delegate Tier, Tier Price, Team ID, Payment Status, UTR Number, College ID Image URL, Payment Screenshot URL, Created At

### Event Registrations Sheet
Columns: Registration ID, Event Items (Summarized), Total Amount, Payment Status, UTR Number, Payment Screenshot URL, Submitted At

### Teams Sheet
Columns: Team ID, Team Name, Lead Delegate ID, Member Delegate IDs (comma-separated), Created At