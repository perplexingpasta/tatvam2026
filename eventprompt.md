I have finally gotten the real events list for this upcoming college fest. It's:


As you can see, each event field will have an unique eventID, indian name, an english name, a short description, price (either per person or in total), team members specification, minimumTeamSize and maximumTeamSize, event schedule (time and date), event image, venue, type of event (solo/group) and tags (solo/group, >4 members, <₹300 price, etc. add more relevant tags per your discretion for a better user experience) Each event should have all these fields even though they might be blank for now, I'll fill it in later. On the /events page, since it's a card based layout, users will only see both the event names, their tags, dates, time and venue. When they click on any event, a new page opens up (/events/event-name) and there they see the entire description and imahges (if any). From there they can add the event to the cart


Also, currently on /events we are categorising events by either solo or group, change that to these categories as above (drama, art, literary, music events, etc.).
The events should appear in card based formats and stack vertically on mobile device. Also, add a small collapse button beside the category names. So, if the user clicks on the collapse button near the music events section, the entire section collapses and the user can view the next section such as dance events.


Also on the same /events page, there should be a robust search functionality which lets user search in for the event by either its indian or english name. Just below the search bar should be tags so that the users can immediately filter out results based on specific tags (all the events will have the relevant tag attribute). These tags could be something like solo, group, >4 members, <₹300 price, etc.


I want something quite similar to this but with added functionality: https://vagus-sammscrithi-2026.vercel.app/sammscrithi


claude's questions
- seed events in firestore unlike merch catalogue which is hard-coded
- Open a modal/drawer on the same page but make it so that if the user clicks anywhere outside the modal, the modal closes. This modal will have the additional detail regarding the event including the images, description, etc. Users can add the event to the cart from over here as well. Make the modal have rounded corners and the background should become blur when the modal is shown on the screen. Optimize entire layout for mobile devices.







Read @PLAN.md and @MerchPlan.md fully before writing any code.

We are implementing a robust image upload system to solve two critical problems:
1. Large multipart form submissions failing due to Vercel's 4.5MB request body limit (experienced with team of 5+ members)
2. No image compression currently happening anywhere in the project

This change affects:
- app/registration/page.tsx (delegate registration — JSSMC and 
  non-JSSMC flows, college ID images + payment screenshot)
- app/merch/cart/page.tsx (merch store — payment screenshot only)

This does NOT affect:
- app/cart/page.tsx (event registration payment screenshot)
  Leave this file completely untouched.
- Any API routes other than the ones explicitly listed below
- Any existing lib files other than cloudinaryUpload.ts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK-BY-TASK IMPLEMENTATION PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You MUST complete each task fully, verify it works, and explicitly state "TASK N COMPLETE — ALL CHECKS PASSED" before asking me for instructions for the next task.
There are 9 tasks in total.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OVERVIEW OF THE NEW UPLOAD ARCHITECTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEFORE (broken for large teams):
User fills form → selects all files → clicks submit → one giant multipart request with all binary file data → Vercel rejects if > 4.5MB

AFTER (correct):
User selects a file → browser compresses it immediately → compressed file uploads to /api/upload/image in background → field shows "Uploading..." then "Uploaded ✅" with preview → Cloudinary URL stored in React state → user clicks submit → final request contains ONLY text fields + Cloudinary URLs (tiny payload, never fails)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 1 — INSTALL browser-image-compression
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Run:
npm install browser-image-compression

This is the only new npm package allowed in this implementation.
Verify it installs without errors before proceeding.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 2/9 — CREATE POST /api/upload/image ROUTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create app/api/upload/image/route.ts

This is a standalone staging upload endpoint. It accepts a single file, validates it, compresses it server-side, uploads to Cloudinary, and returns the URL. It does NOT write to Firestore. It is called once per file as the user selects files, before form submission.

Implementation requirements:

1. Validate Content-Type is multipart/form-data. Return 415 if not.

2. Parse FormData and extract:
   - file: File (the image to upload)
   - folder: string (where to store in Cloudinary — 
     e.g. "college-ids", "payment-proofs", "merch-payments")
     Validate folder is one of these three exact values.
     Return 400 if folder is not one of the allowed values.

3. Server-side file validation:
   - Accepted MIME types: image/jpeg, image/jpg, image/png
   - Max size: read from NEXT_PUBLIC_MAX_FILE_SIZE_MB env 
     variable (default 10). Check BEFORE compression.
   - Return 400 with descriptive message if either check fails.

4. Convert File to Buffer:
   const buffer = Buffer.from(await file.arrayBuffer());

5. Apply Cloudinary incoming transformations during upload. Update uploadToCloudinary in lib/cloudinaryUpload.ts to accept an optional options parameter for transformations.
   
   For college-ids folder: apply these transformations:
   {
     transformation: [
       { width: 1200, crop: "limit" },
       { quality: "auto:good" },
       { fetch_format: "auto" }
     ]
   }
   
   For payment-proofs and merch-payments folders: apply:
   {
     transformation: [
       { width: 2000, crop: "limit" },
       { quality: "auto:good" },
       { fetch_format: "auto" }
     ]
   }
   (payment screenshots need higher resolution for legibility)

6. Call uploadToCloudinary(buffer, file.type, folder) with the appropriate transformations.
   If upload throws: return 503 "Upload failed, please try again."

7. Return:
   {
     success: true,
     originalUrl: string,
     transformedUrl: string,
     folder: string
   }

8. This route must have a Vercel body size config override:
   export const config = {
     api: {
       bodyParser: false,
     },
   };
   
   Also add this at the top of the route file to increase 
   the limit for this specific route only:
   export const maxDuration = 30; // seconds


Verify task implementation and explicitly report task completion when done.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 3/9 — CREATE useImageUpload HOOK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create hooks/useImageUpload.ts

This hook encapsulates the entire client-side upload flow:
browser compression → staged upload → state management.

```typescript
import imageCompression from 'browser-image-compression';

export type UploadStatus = 
  "idle" | "compressing" | "uploading" | "success" | "error";

export interface UploadState {
  status: UploadStatus;
  originalUrl: string | null;
  transformedUrl: string | null;
  previewUrl: string | null;  // local object URL for preview
  errorMessage: string | null;
  fileName: string | null;
}

export interface UseImageUploadOptions {
  folder: "college-ids" | "payment-proofs" | "merch-payments";
  maxSizeMB?: number;        // default: 10
  compressionTargetMB?: number; // default: 0.5
  maxWidthOrHeight?: number; // default: 1200
}

export function useImageUpload(options: UseImageUploadOptions) {
  // Returns:
  // - uploadState: UploadState
  // - handleFileSelect: (file: File) => Promise<void>
  // - reset: () => void
}
```

handleFileSelect must:

1. Immediately validate file type (jpeg/jpg/png only) and size 
   (≤ maxSizeMB). If invalid:
   - Set status: "error"
   - Set errorMessage to a descriptive message
   - Do NOT proceed with compression or upload
   - Return early

2. Generate a local preview URL immediately using URL.createObjectURL(file) — set as previewUrl so the user sees the image instantly without waiting for upload

3. Set status: "compressing"

4. Compress the file using browser-image-compression:
```typescript
   const compressed = await imageCompression(file, {
     maxSizeMB: options.compressionTargetMB ?? 0.5,
     maxWidthOrHeight: options.maxWidthOrHeight ?? 1200,
     useWebWorker: true,
     fileType: 'image/webp', // always output webp
   });
```
   If compression throws: set status "error" with message 
   "Compression failed. Please try a different image."

5. Set status: "uploading"

6. Create a FormData with the compressed file and folder, 
   POST to /api/upload/image:
```typescript
   const formData = new FormData();
   formData.append('file', compressed, file.name);
   formData.append('folder', options.folder);
   const response = await fetch('/api/upload/image', {
     method: 'POST',
     body: formData,
   });
```
   
7. If response is not ok: set status "error" with the error message from the response body.

8. If response is ok: 
   - Set status: "success"
   - Set originalUrl and transformedUrl from response
   - Keep previewUrl as is (already showing the image)

9. The reset function must:
   - Revoke the object URL: URL.revokeObjectURL(previewUrl)
   - Reset all state to initial values

10. Use useCallback for handleFileSelect and reset to prevent unnecessary re-renders.

11. Clean up object URLs on unmount using useEffect cleanup.

Verify task implementation and explicitly report task completion when done.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 4/9 — CREATE StagedFileUpload COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create components/StagedFileUpload.tsx (client component)

This is a reusable file input component that wraps useImageUpload and displays the appropriate UI state.

Props:
```typescript
interface StagedFileUploadProps {
  folder: "college-ids" | "payment-proofs" | "merch-payments";
  label: string;           // e.g. "College ID Image"
  onUploadComplete: (urls: { 
    originalUrl: string; 
    transformedUrl: string 
  }) => void;
  onUploadReset: () => void;
  disabled?: boolean;      // disable during form submission
  compressionTargetMB?: number;  // default 0.5
  maxWidthOrHeight?: number;     // default 1200
}
```

UI states to render:

IDLE state:
- Dashed border upload area
- Upload icon + "Click to upload or drag and drop"
- "JPG, PNG up to [maxSizeMB]MB" subtitle
- Clicking opens file picker (accept="image/jpeg,image/jpg,
  image/png")

COMPRESSING state:
- Show preview thumbnail (from previewUrl)
- Show spinner + text "Compressing..."
- Input disabled

UPLOADING state:
- Show preview thumbnail
- Show spinner + text "Uploading..."
- Input disabled

SUCCESS state:
- Show preview thumbnail
- Show green checkmark + text "Uploaded ✅"
- Small "Change" button — clicking resets the upload state 
  and re-opens file picker
- Call onUploadComplete with the URLs when entering this state
  (use useEffect watching status === "success")

ERROR state:
- Show red X icon + errorMessage text in red below
- Upload area is re-enabled so user can try again
- Call onUploadReset when entering error state

IMPORTANT:
- Call onUploadComplete only ONCE when status becomes "success"
  (use a ref to track if it has been called)
- Call onUploadReset when status becomes "error" or when 
  "Change" is clicked
- Never call onUploadComplete with null/undefined URLs

Verify task implementation and explicitly report task completion when done.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 5/9 — UPDATE DELEGATE REGISTRATION FORM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Update app/registration/page.tsx

The registration form has two separate flows (JSSMC and non-JSSMC) and supports up to 25 members. Each member has their own college ID image upload. There is also one shared payment screenshot upload (non-JSSMC only).

CRITICAL: The final form submission (POST /api/registration/delegate) must send ONLY text fields and Cloudinary URLs. No file binary data in the final submission. Ever.

Changes required:

1. Replace every college ID image file input with 
   <StagedFileUpload> component:
   - folder="college-ids"
   - label="College ID Image"
   - compressionTargetMB={0.5}
   - maxWidthOrHeight={1200}

2. For each member in the form, maintain upload state in 
   React state:
```typescript
   interface MemberUploadState {
     collegeIdImageOriginalUrl: string | null;
     collegeIdImageTransformedUrl: string | null;
   }
```
   Store as an array: memberUploads[memberIndex]

3. When StagedFileUpload calls onUploadComplete for member N:
   - Update memberUploads[N] with the returned URLs
   
   When StagedFileUpload calls onUploadReset for member N:
   - Clear memberUploads[N] back to null values

4. For non-JSSMC flow — replace payment screenshot file input 
   with <StagedFileUpload>:
   - folder="payment-proofs"
   - label="Payment Screenshot"
   - compressionTargetMB={0.8}
   - maxWidthOrHeight={2000}
   
   Store the returned URLs in:
```typescript
   const [paymentScreenshot, setPaymentScreenshot] = useState<{
     originalUrl: string | null;
     transformedUrl: string | null;
   }>({ originalUrl: null, transformedUrl: null });
```

5. Submit button blocking logic:
   Before allowing submission, check:
   
   a. All members have completed college ID uploads:
      const pendingCollegeIds = members
        .map((_, i) => i)
        .filter(i => !memberUploads[i]?.collegeIdImageOriginalUrl);
   
   b. For non-JSSMC: payment screenshot is uploaded:
      const paymentPending = !paymentScreenshot.originalUrl;
   
   If any uploads are pending when submit is clicked:
   - Do NOT submit
   - Show a clear error message above the submit button:
     For pending college IDs: 
     "Please wait for the following uploads to complete: 
     College ID for [Member Name], College ID for [Member Name]"
     For pending payment screenshot:
     "Please wait for the payment screenshot to finish uploading"
   - Do not disable the submit button preemptively — only 
     show this message on click attempt

6. Update the final FormData construction to send URLs 
   instead of files:
   REMOVE: formData.append(`member_${i}_collegeIdImage`, file)
   ADD: formData.append(`member_${i}_collegeIdImageUrl`, 
          memberUploads[i].collegeIdImageOriginalUrl)
        formData.append(`member_${i}_collegeIdImageTransformedUrl`,
          memberUploads[i].collegeIdImageTransformedUrl)
   
   REMOVE: formData.append('paymentScreenshot', file)
   ADD: formData.append('paymentScreenshotUrl', 
          paymentScreenshot.originalUrl)

7. When "Add Member" button is clicked to add a new member:
   - Add a new entry to memberUploads array initialised to 
     { collegeIdImageOriginalUrl: null, 
       collegeIdImageTransformedUrl: null }
   
   When a member is removed:
   - Remove the corresponding memberUploads entry

8. When the back button is clicked (returning to card 
   selection screen):
   - Reset all memberUploads to null
   - Reset paymentScreenshot to null values

Verify task implementation and explicitly report task completion when done.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 6/9 — UPDATE DELEGATE REGISTRATION API ROUTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Update app/api/registration/delegate/route.ts

Since files are now uploaded before form submission, the API route no longer receives File objects. It receives URLs.

Changes required:

1. Remove ALL file parsing logic:
   - Remove: formData.get(`member_${i}_collegeIdImage`) as File
   - Remove: the Cloudinary upload loop for college ID images
   - Remove: payment screenshot File parsing and upload
   - Remove: any Buffer.from(await file.arrayBuffer()) calls
   - Remove: uploadToCloudinary calls for these files

2. Instead, read URLs directly from FormData:
```typescript
   const collegeIdImageUrl = formData.get(
     `member_${i}_collegeIdImageUrl`
   ) as string;
   const collegeIdImageTransformedUrl = formData.get(
     `member_${i}_collegeIdImageTransformedUrl`  
   ) as string;
```

3. For non-JSSMC flow, read payment screenshot URL:
```typescript
   const paymentScreenshotUrl = formData.get(
     'paymentScreenshotUrl'
   ) as string;
```

4. Validate that all URL fields are present and are valid URLs (use Zod z.string().url() check). Return 400 if any are missing or malformed. This prevents someone from bypassing the staged upload on the client.

5. For JSSMC flow: paymentScreenshotUrl should be set to "" (empty string) as before — no change to JSSMC logic.

6. Keep ALL other logic unchanged:
   - Uniqueness checks (email, phone, collegeIdNumber)
   - Delegate ID generation
   - Firestore batch write
   - Team ID generation
   - Email sending
   - Sheets sync
   - isJSSMC handling
   - All validation except file validation

7. The Cloudinary upload try/catch block that previously handled file uploads can be removed entirely since uploads happen before this route is called.

8. Remove the file size/type validation for college ID images and payment screenshot from this route — that validation now happens in /api/upload/image.

Verify task implementation and explicitly report task completion when done.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 7/9 — UPDATE MERCH CART PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Update app/merch/cart/page.tsx

Only the payment screenshot upload needs to change here.
The rest of the merch cart page remains unchanged.

Changes required:

1. Replace the payment screenshot file input with 
   <StagedFileUpload>:
   - folder="merch-payments"
   - label="Payment Screenshot"
   - compressionTargetMB={0.8}
   - maxWidthOrHeight={2000}

2. Store the returned URLs in state:
```typescript
   const [paymentScreenshot, setPaymentScreenshot] = useState<{
     originalUrl: string | null;
   }>({ originalUrl: null });
```

3. Submit blocking logic — if user clicks "Place Order" 
   and payment screenshot upload is not complete:
   - Do NOT submit
   - Show message above submit button:
     "Please wait for the payment screenshot to finish 
     uploading"

4. Update the fetch call to /api/merch/order:
   Send paymentScreenshotUrl as a text field in FormData 
   instead of a File:
   REMOVE: formData.append('paymentScreenshot', file)
   ADD: formData.append('paymentScreenshotUrl', 
          paymentScreenshot.originalUrl)

Verify task implementation and explicitly report task completion when done.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 8/9 — UPDATE MERCH ORDER API ROUTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Update app/api/merch/order/route.ts

Changes required:

1. Remove file parsing:
   REMOVE: formData.get('paymentScreenshot') as File
   REMOVE: Buffer.from(await file.arrayBuffer())
   REMOVE: uploadToCloudinary call for payment screenshot
   REMOVE: 503 error handling for Cloudinary upload

2. Instead read URL:
```typescript
   const paymentScreenshotUrl = formData.get(
     'paymentScreenshotUrl'
   ) as string;
```

3. Validate paymentScreenshotUrl is a valid Cloudinary URL:
   - Must be a valid URL (z.string().url())
   - Must start with "https://res.cloudinary.com/" to confirm 
     it went through the staging upload and wasn't spoofed
   - Return 400 if validation fails

4. Keep ALL other logic unchanged:
   - Buyer details validation
   - Units validation and price recalculation
   - Order ID generation
   - Firestore write
   - Sheets sync
   - Email sending

Verify task implementation and explicitly report task completion when done.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 9/9 — UPDATE lib/cloudinaryUpload.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Update lib/cloudinaryUpload.ts to support incoming transformations.

Update the function signature:
```typescript
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  mimeType: string,
  folder: string,
  transformations?: object[]
): Promise<{ originalUrl: string; transformedUrl: string }>
```

When transformations are provided, pass them to the 
Cloudinary upload call:
```typescript
cloudinary.v2.uploader.upload_stream(
  {
    folder,
    resource_type: "image",
    ...(transformations && { transformation: transformations }),
  },
  ...
)
```

The /api/upload/image route will pass the appropriate 
transformations based on the folder parameter.

Keep the existing transformedUrl generation logic unchanged 
(replacing /upload/ with /upload/f_auto,q_auto,w_800/ in 
the URL).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VERIFICATION STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Perform ALL of these after implementing all tasks:

1. Run npx tsc --noEmit — zero TypeScript errors required.

2. Run npm run build — must complete without errors.

3. Test StagedFileUpload component states:
   - Go to /registration (non-JSSMC flow)
   - Select a valid image for member 1's college ID
   - Confirm you see "Compressing..." then "Uploading..." 
     then "Uploaded ✅" with a thumbnail preview
   - Select an invalid file type (PDF) — confirm immediate 
     inline error appears
   - Select a valid image then click "Change" — confirm 
     upload state resets and file picker opens

4. Test submit blocking:
   - Fill all text fields for a solo registration
   - Do NOT upload the college ID image
   - Click submit — confirm message appears listing which 
     uploads are pending
   - Upload the college ID image — wait for "Uploaded ✅"
   - Click submit — confirm it proceeds normally

5. Test solo delegate registration end-to-end:
   - JSSMC flow: upload college ID, submit
   - Confirm Firestore document has collegeIdImageUrl 
     populated with a Cloudinary URL
   - Confirm no File objects were sent in the final 
     submission (check Network tab in DevTools — the 
     final POST to /api/registration/delegate should 
     contain only text fields)

6. Test team registration with 5 members:
   - Register 5 members simultaneously
   - Upload a college ID image for each member — confirm 
     each shows "Uploading..." independently and resolves 
     to "Uploaded ✅"
   - Submit — confirm all 5 Firestore documents created 
     with correct collegeIdImageUrls
   - Check Network tab — final payload should be tiny 
     (text only, no binary data)

7. Test team registration with 10 members:
   - Same as above with 10 members
   - This must succeed — previously failed at 5 members

8. Test merch payment screenshot upload:
   - Go to /merch, add items, go to /merch/cart
   - Proceed to checkout
   - Select payment screenshot — confirm "Uploading..." 
     then "Uploaded ✅"
   - Submit — confirm Firestore document has 
     paymentScreenshotUrl starting with 
     "https://res.cloudinary.com/"

9. Test Cloudinary transformations are being applied:
   - After uploading a college ID image, go to Cloudinary 
     dashboard → Media Library → college-ids folder
   - Confirm uploaded image dimensions are capped at 1200px
   - Confirm file size is significantly smaller than 
     the original

10. Test the /api/upload/image route security:
    - Try to call it with folder="../../etc" or any 
      value not in the allowed list — confirm 400 response
    - Try to call it with a PDF — confirm 400 response
    - Try to call POST /api/registration/delegate with a 
      spoofed paymentScreenshotUrl like "http://evil.com/x"
      — confirm 400 response (URL doesn't start with 
      https://res.cloudinary.com/)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Only new npm package allowed: browser-image-compression
- Do NOT modify app/cart/page.tsx (event registration)
- Do NOT modify app/api/registration/events/route.ts
- Do NOT modify any Sheets sync files
- Do NOT modify any email template files
- Do NOT change Firestore collection names or field names
- Do NOT change delegate ID generation logic
- Do NOT change JSSMC/non-JSSMC business logic
- The /api/upload/image route must be the ONLY place where file binary data is received and processed
- All other API routes must only receive and validate URLs
- Report completion of each task explicitly before moving to the next
- After all tasks: run npx tsc --noEmit and npm run build and report results before declaring completion