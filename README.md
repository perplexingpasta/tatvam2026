# College Cultural Fest Registration System

A robust, full-stack registration platform for college cultural fests, built with **Next.js (App Router)**, **TypeScript**, and **Firebase**.

## 🚀 Features

- **Delegate Registration**: Support for individual and team registrations with tiered pricing.
- **Event Registration**: Cart-based system for solo and group event signups.
- **Secure Lookups**: Rate-limited delegate ID verification for event participants.
- **Image Management**: Automated upload and optimization of ID cards and payment screenshots via **Cloudinary**.
- **Email Notifications**: Transactional emails for registration confirmation using **Resend**.
- **Data Integrity**: **Google Sheets** secondary mirror for easy administrative access and offline reporting.
- **Reliability**: Fault-tolerant retry queue for asynchronous background tasks (like Google Sheets syncing).

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/)
- **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Server-side Logic**: [Firebase Admin SDK](https://firebase.google.com/docs/admin)
- **Storage & CDN**: [Cloudinary](https://cloudinary.com/)
- **Email**: [Resend](https://resend.com/)
- **Sheets Sync**: [Google Sheets API](https://developers.google.com/sheets/api)
- **Validation**: [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)
- **Hosting**: [Netlify](https://www.netlify.com/)

## 📂 Project Structure

- `app/`: Next.js App Router pages and API routes.
- `components/`: Reusable React components and email templates.
- `lib/`: Core logic for Firebase, Cloudinary, Resend, and Google Sheets.
- `types/`: Shared TypeScript interfaces and schemas.
- `scripts/`: Utility scripts (e.g., database seeding).
- `netlify/`: Background functions for task processing.

## ⚙️ Setup & Installation

### 1. Environment Variables

Create a `.env.local` file in the root directory and populate it with the following keys (refer to `PLAN.md` for details):

```env
# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
# Firebase Admin
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="..."
# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
# Resend
RESEND_API_KEY=...
# Google Sheets
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="..."
GOOGLE_SHEETS_SPREADSHEET_ID=...
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Seed Database (Optional)

To populate initial event data:
```bash
npx ts-node scripts/seedEvents.ts
```

## 🏗️ Architecture Note

- **Source of Truth**: Firestore is the primary database.
- **File Uploads**: All images are processed via Next.js API routes using the Admin SDK and uploaded directly to Cloudinary.
- **Google Sheets**: Acts as a secondary mirror. Syncing is handled asynchronously via a `sheetsRetryQueue` to ensure data consistency even during API downtime.
- **Cart State**: Managed client-side via React Context; no persistence until payment submission.

## 📄 License

This project is private and intended for specific fest use.
