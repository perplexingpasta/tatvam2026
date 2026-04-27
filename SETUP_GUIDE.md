# Production Setup Guide

Before going live, the following manual steps are required:

## 1. Firebase Security Rules
Deploy the generated Firestore security rules to protect the database:
```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

## 2. Netlify Environment Variables
Ensure all environment variables defined in `PLAN.md` (and `.env.local.example` if it exists) are accurately added to your Netlify project configuration in the dashboard.

## 3. Google Spreadsheet Setup
- Create a new Google Spreadsheet.
- Share it with the `GOOGLE_SERVICE_ACCOUNT_EMAIL` (give Editor access).
- Create two sheets named exactly `Delegates` and `Event Registrations`.
- Add the following header row to the `Delegates` sheet (Row 1):
  `Delegate ID`, `Name`, `Email`, `Phone`, `College Name`, `College ID Number`, `College ID Image URL`, `Delegate Tier`, `Tier Price`, `Team ID`, `Team Name`, `Is JSSMC`, `Payment Status`, `UTR Number`, `Payment Screenshot URL`, `Created At`
- Add the following header row to the `Event Registrations` sheet (Row 1):
  `Registration ID`, `Event Items (Summarized)`, `Total Amount`, `Payment Status`, `UTR Number`, `Payment Screenshot URL`, `Submitted At`

## 4. Cloudinary Upload Preset
- Log into Cloudinary dashboard.
- Create an upload preset if you're using unsigned uploads (though the Admin SDK handles signed uploads, so this might not be strictly necessary if configured directly).
- Verify that `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are correctly configured.

## 5. Resend Email Verification
- In the Resend dashboard, add your domain.
- Add the generated DNS records (TXT/MX) to your domain registrar (e.g., GoDaddy, Cloudflare) to verify sending identity.
- Wait for Resend to verify the DNS records before sending production emails.

## 6. Firebase Indexes
- Ensure all required indexes are deployed. The retry queue might need an index.
- If you encounter a query error in the Firebase console during testing, click the link provided in the error message to automatically create the required index.