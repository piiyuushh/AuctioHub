# AuctioHub

Role-based online auction platform built with Next.js App Router, PostgreSQL, NextAuth (Google OAuth), Cloudinary, and Stripe.

## Overview

AuctioHub is a full-stack auction web app where users can:

- List products in supported categories
- Start and manage timed auctions
- Place bids on active auctions
- Chat on auction items
- Pay as winners through Stripe checkout

Admins can:

- Manage homepage carousel and new arrivals
- Manage users and roles
- Monitor auction activity and auction history
- Control live auction sessions (extend/cancel/ban participants)
- Export dashboard reports

## Tech Stack

- Framework: Next.js 16 (App Router)
- UI: React 19, Tailwind CSS 4, Radix UI
- Auth: NextAuth with Google provider
- Database: PostgreSQL (via pg)
- Media storage: Cloudinary
- Payments: Stripe

## Key Features

### Public and user features

- Homepage with carousel and new arrivals
- Category browsing and search/filter support
- Product listing with optional auction configuration
- Live bidding and auction detail pages
- User dashboard with stats and profile editing
- Auction notifications stream (SSE)
- Payment flow for winners and penalty handling

### Admin features

- Admin dashboard with platform analytics
- Auction sessions viewer with filtering and pagination
- User role management
- Carousel and new arrivals content management
- Auction controls: extend, cancel, and participant bans
- Cloudinary admin utilities and system checks

## Project Structure

```text
src/
	app/
		api/                 # Route handlers (public, user, admin, payments, notifications)
		admin/               # Admin pages
		auction/             # Auction detail pages
		category/            # Product browsing and category pages
		user-dashboard/      # User dashboard page
	components/
		admin/               # Admin dashboard UI modules
		notifications/       # Notification host UI
		ui/                  # Shared UI primitives
	lib/
		auth.ts              # NextAuth configuration
		admin.ts             # Admin guards/helpers
		database.ts          # PostgreSQL pool
		models.ts            # Data access layer
		notifications.ts     # Notification emitters
scripts/
	schema.sql            # Base PostgreSQL schema
	setup-db.js           # Scripted schema setup
	add-*.sql             # Incremental migration scripts
```

## Authentication and Authorization

- Sign-in is handled by NextAuth Google OAuth.
- Roles are stored in the users table (`USER` or `ADMIN`).
- `ADMIN_EMAILS` is used to bootstrap initial admin assignment on login.
- Middleware protects:
	- `/admin/*`
	- `/user-dashboard/*`
	- `/api/admin/*`

## Database

Primary schema is in `scripts/schema.sql` and includes:

- users
- products
- bids
- auction_history
- auction_participant_bans
- chat_messages
- carousel_images
- new_arrivals
- notification_events
- admin_settings

## Environment Variables

Create `.env.local` in the project root and configure:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

DATABASE_URL=your_postgres_connection_string

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

STRIPE_SECRET_KEY=your_stripe_secret_key

ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Add the required variables to `.env.local`.

### 3. Initialize database

Option A: run schema directly in your PostgreSQL/Supabase SQL editor using `scripts/schema.sql`.

Option B: run the setup script:

```bash
node scripts/setup-db.js
```

For existing databases that started with older schema versions, apply incremental scripts in `scripts/` as needed:

- `add-product-category.sql`
- `add-auction-history-table.sql`
- `add-auction-bans.sql`
- `add-notification-events.sql`

### 4. Run development server

```bash
npm run dev
```

App runs on `http://localhost:3000`.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production app
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## API Route Groups

### Public routes

- `/api/products` (GET)
- `/api/carousel` (GET)
- `/api/new-arrivals` (GET)
- `/api/auction/[id]/access` (GET)

### Authenticated user routes

- `/api/products` (POST, PUT, DELETE)
- `/api/products/bid` (POST)
- `/api/products/my-products` (GET)
- `/api/profile` (GET, PUT)
- `/api/profile/upload-image` (POST)
- `/api/user-dashboard/stats` (GET)
- `/api/auction/[id]/chat` (GET, POST)
- `/api/payment/create-checkout-session` (POST)
- `/api/payment/pending` (GET)
- `/api/payment/process-completion` (POST)
- `/api/notifications/stream` (GET)

### Admin routes

- `/api/admin/users`
- `/api/admin/auction`
- `/api/admin/auction-stats`
- `/api/admin/auction-sessions`
- `/api/admin/auction/[productId]/extend`
- `/api/admin/auction/[productId]/cancel`
- `/api/admin/auction/[productId]/bidders`
- `/api/admin/auction/[productId]/bidders/[userId]/ban`
- `/api/admin/carousel`
- `/api/admin/new-arrivals`
- `/api/admin/upload`
- `/api/admin/delete-image`
- `/api/admin/clear-cloudinary`
- `/api/admin/check`
- `/api/admin/fix-indexes`

There are also debug/test utility routes under `src/app/api` for environment and integration checks.

## Payment Flow

- Stripe checkout sessions are created server-side.
- Currency is configured as NPR.
- Supports full winner payment and penalty payment flows.
- Successful payment completion is processed via API and linked to auction history.

## Deployment Notes

- Configure all required environment variables in your deployment platform.
- Ensure PostgreSQL is reachable from deployed runtime.
- Ensure Cloudinary and Stripe keys are production-safe.
- Restrict or disable debug/test routes in production if not needed.

## Current Project Status

This repository contains both production features and several operational/debug endpoints used during development and deployment verification. Consider reviewing and hardening those endpoints before final production rollout.
