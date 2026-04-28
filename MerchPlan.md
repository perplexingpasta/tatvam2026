# Merch Store Plan

## Overview
A self-contained merch store at /merch allowing anyone (no delegate ID required) to browse items, customise attributes per unit, and place an order via UTR-based manual payment. Completely separate from the delegate registration system.

## New Pages
- /merch — browse catalogue, add items to merch cart
- /merch/cart — review cart, fill buyer details, payment, submit

## New API Routes
- POST /api/merch/order — submit a merch order
- POST /api/merch/sheets/retry — process failed Sheets sync retries

## New Firestore Collections
- merchOrders/{orderId}
- merchSheetsRetryQueue/{docId}

## New Environment Variables
- GOOGLE_MERCH_SHEETS_SPREADSHEET_ID
- NEXT_PUBLIC_MERCH_PAYMENT_QR_IMAGE_PATH

## Merch Catalogue
Defined entirely in /lib/merchCatalogue.ts as a static TypeScript  config file. No Firestore collection needed for catalogue items. Images stored in /public/merch/ directory. To update: edit the config file and swap images, then commit.

## Firestore Schema

### merchOrders/{orderId}
- orderId: string (format: MERCH-XXXXX, 5 random uppercase alphanumeric)
- buyerName: string
- buyerEmail: string
- buyerPhone: string
- units: array of MerchUnit objects (see types below)
- totalAmount: number
- utrNumber: string
- paymentScreenshotUrl: string (Cloudinary original URL)
- submittedAt: Timestamp
- merchSheetsSync: object
  - status: "pending" | "synced" | "failed" | "dead_letter"
  - retryCount: number
  - lastAttempt: Timestamp | null
  - lastError: string | null

### MerchUnit (embedded in merchOrders)
- unitId: string (UUID)
- itemId: string (e.g. "jersey")
- itemName: string
- price: number
- attributes: Record<string, string>
  (e.g. { size: "L", playerName: "VIKRAM", jerseyNumber: "10" })

### merchSheetsRetryQueue/{docId}
- type: "merchOrder"
- referenceId: string (orderId)
- payload: object
- retryCount: number
- status: "pending" | "synced" | "failed" | "dead_letter"
- nextRetryAt: Timestamp
- lastError: string
- createdAt: Timestamp

## API Route Contracts

### POST /api/merch/order
Request: multipart/form-data
- buyerName: string
- buyerEmail: string
- buyerPhone: string
- units: JSON string (array of MerchUnit without unitId)
- utrNumber: string
- paymentScreenshot: File (jpg/jpeg/png, max 10MB)

Response (success):
{ success: true, orderId: string, message: string }

Error codes:
- 400: validation failure
- 415: wrong content type
- 503: Cloudinary upload failure
- 500: internal error

### POST /api/merch/sheets/retry
Request: empty body
Response: { success: true, syncedCount: number, message: string }

## Google Sheets Column Layout (Merch Orders Sheet)
One row per unit (not per order) so fulfilment team can tick off 
individual items.

Columns A through L:
A: Order ID
B: Buyer Name
C: Buyer Email
D: Buyer Phone
E: Item Name
F: Custom Attributes (formatted as "Name: VIKRAM | Number: 10 | Size: L")
G: Unit Price
H: Total Order Amount (same for all rows of same order)
I: UTR Number
J: Payment Screenshot URL
K: Submitted At
L: Units in Order (total count, same for all rows of same order)

## Merch Cart
- Stored in localStorage under key "merchCart"
- Persists across page refreshes and sessions
- Resets only on successful order submission
- Cart item shape: MerchCartUnit (see types)

## Email
- Sender: RESEND_FROM_EMAIL (same as registration emails)
- Subject: "Order Confirmed — [NEXT_PUBLIC_FEST_NAME] Merch"
- Content: Order ID, itemised list with attributes per unit,
  total amount, UTR submitted, pickup instructions,
  team contact details

## Merch Catalogue Config Location
/lib/merchCatalogue.ts

## Image Location
/public/merch/[item-id]-[number].jpg (or .png)
Example: /public/merch/jersey-1.jpg, /public/merch/jersey-2.jpg

## Phase Status
- Phase 0: ✅ Complete
- Phase 1: ✅ Complete
- Phase 2: ✅ Complete
- Phase 3: ✅ Complete
- Phase 4: 🔄 In progress
