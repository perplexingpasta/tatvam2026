## MANDATORY FIRST STEP
Before writing any code or making any decisions, you MUST read PLAN.md in full. It contains all Firestore schemas, API contracts, env variable names, and architectural decisions for this project. Never assume — always verify against PLAN.md first.


# Project Overview

This is a web application built with **Next.js** (App Router), utilizing React, TypeScript, and TailwindCSS. The application includes several pre-defined routes under the `app/` directory such as `/about`, `/cart`, `/contact`, `/events`, `/registration`, and `/schedule`. It is a registration system for a college cultural fest.

## Key Decisions
- Database: Firebase Firestore (Admin SDK for all writes)
- File storage: Cloudinary (NOT Firebase Storage)
- Email: Resend
- Google Sheets: secondary mirror only, never source of truth
- Image compression: Cloudinary URL transforms (f_auto,q_auto,w_800)
- Do NOT use sharp, Firebase Storage, or any Firebase Extensions
- Hosting: Vercel

## Architecture Reference
- See PLAN.md for all Firestore schemas, API contracts, and env variable names
- All file uploads go through Next.js API routes using Admin SDK — never direct client uploads
- Cart state is session-only (React context, no persistence)
- Google Sheets sync is always async and fault-tolerant via sheetsRetryQueue

## Merch Store
A separate merch store exists at /merch and /merch/cart.
It is completely independent from the registration system.
See MerchPlan.md for all schemas, routes, and column layouts.
Do not modify any registration system files when working on merch.

## Phase Status
- Phase 0: ✅ Complete
- Phase 1: ✅ Complete
- Phase 2: ✅ Complete
- Phase 3: ✅ Complete
- Phase 4: ✅ Complete
- Phase 5: ✅ Complete

## Merch Phase Status
- Merch Phase 0: ✅ Complete
- Merch Phase 1: ✅ Complete
- Merch Phase 2: 🔄 In progress
- Merch Phase 3: ⏳ Not started
- Merch Phase 4: ⏳ Not started

**Main Technologies:**
- Next.js (16.2.4)
- React (19.2.4)
- TypeScript
- TailwindCSS (v4)
- ESLint

## Building and Running

The project relies on `npm` scripts defined in `package.json` to handle development, building, and production start. 

- **Development Server:** Run `npm run dev` to start the local server on `http://localhost:3000`. This supports hot-module replacement and auto-updating.
- **Production Build:** Run `npm run build` to generate an optimized production build.
- **Start Production Server:** Run `npm run start` after building to start the app in production mode.
- **Linting:** Run `npm run lint` to check for ESLint warnings and errors.

*(If you are using yarn, pnpm, or bun, substitute `npm` with your package manager of choice).*

## Development Conventions

- **Routing:** The application uses the Next.js App Router paradigm. All routes and page layouts are defined within the `app/` directory (e.g., `app/page.tsx` for the home page, `app/about/page.tsx` for the about page).
- **Styling:** Global styles are defined in `app/globals.css`. The primary styling solution is TailwindCSS, utilizing utility classes directly inside React components.
- **Fonts:** Custom fonts are managed via Next.js Font Optimization (`next/font/google`), specifically the `Geist` font family, as seen in `app/layout.tsx`.
- **Components:** React components should be written in TypeScript (`.tsx` format).
- **Metadata:** Page metadata (title, description) can be managed via the `metadata` export in layout or page files, adhering to Next.js App Router conventions.
