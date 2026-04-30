# Tatvam 2026 — College Cultural Fest Registration System

A robust, premium full-stack registration platform for Tatvam 2026, built with **Next.js**, **TypeScript**, and **Firebase**. This system handles delegate registrations, event signups, and merchandise sales with a focus on speed, data integrity, and visual excellence.

## 🚀 Key Features

### 🎫 Registration Modules
- **Delegate Registration**: Individual and team registration system with tiered pricing (Gold, Platinum, Diamond). Supports JSSMC-specific complimentary registration.
- **Event Registration**: A cart-based system allowing delegates to sign up for solo or group events. Includes real-time delegate ID verification and team lead assignment.
- **Merch Store**: Fully integrated store for festival merchandise with cart management and separate payment verification.

### ⚡ Performance & Optimization
- **Staged Image Uploads**: Client-side image compression and **WebP conversion** using `browser-image-compression`. This significantly reduces upload times and server load.
- **Smart Image Delivery**: Automatic Cloudinary URL transforms (`f_auto, q_auto`) for optimal asset delivery.
- **Speed Insights**: Integrated Vercel Analytics and Speed Insights for real-time performance monitoring.

### 🛡️ Reliability & Security
- **Data Mirroring**: Primary source of truth in **Firestore** with an automated asynchronous mirror to **Google Sheets** for administrative ease.
- **Fault Tolerance**: Background task queue with a retry mechanism (`sheetsRetryQueue`) to handle intermittent external API failures (Google Sheets/Resend).
- **Secure Lookups**: Rate-limited delegate ID verification to prevent enumeration attacks.
- **Admin Verification**: All payments are staged as `pending_verification` for administrative review via UTR matching.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16.2.4](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/)
- **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Server-side Logic**: [Firebase Admin SDK](https://firebase.google.com/docs/admin)
- **Storage & CDN**: [Cloudinary](https://cloudinary.com/)
- **Email**: [Resend](https://resend.com/)
- **Sheets Sync**: [Google Sheets API v4](https://developers.google.com/sheets/api)
- **Validation**: [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)
- **Hosting**: [Vercel](https://www.vercel.com/)

## 📂 Project Structure

- `app/`: Next.js App Router pages, layouts, and API routes.
- `components/`: Reusable UI components, providers, and email templates.
- `lib/`: Core service integrations (Firebase, Cloudinary, Sheets, Resend).
- `hooks/`: Custom hooks for image processing and state management.
- `scripts/`: Administrative utility scripts (e.g., seeding events).
- `types/`: Shared TypeScript interfaces and Zod schemas.

## ⚙️ Setup & Installation

### 1. Environment Variables

Create a `.env.local` file in the root directory. Refer to `PLAN.md` for a comprehensive list of all required variables across Firebase, Cloudinary, Resend, and Google Sheets.

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Sync Events Database

To populate the Firestore `events` collection from the local catalogue:
```bash
npx ts-node scripts/seedEvents.ts
```

## 🏗️ Architecture Note

- **Source of Truth**: Firestore is the primary database.
- **File Uploads**: All images are processed via Next.js API routes using the Admin SDK and uploaded directly to Cloudinary.
- **Google Sheets**: Acts as a secondary mirror. Syncing is handled asynchronously via a `sheetsRetryQueue` to ensure data consistency even during API downtime.
- **Cart State**: Registration and Merch carts use React Context for session-only persistence. No data is written to the database until the payment proof and UTR are submitted.
- **Asynchronous Processing**: Google Sheets synchronization is "fire-and-forget" from the main API routes to ensure fast response times for users. Failures are automatically caught and queued for retries.
- **Payment Verification**: The system is designed for manual UTR/Screenshot reconciliation. Automatic payment gateway integration is not implemented by design.

## 📄 License

This project is private and intended exclusively for Tatvam 2026.
