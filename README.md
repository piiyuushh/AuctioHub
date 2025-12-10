# AuctioHub - Online Auction Platform

> **WARNING: This project is currently under active development**

AuctioHub is a modern, full-featured online auction platform built with Next.js, MongoDB, and Clerk authentication. The platform enables users to participate in auctions, place bids, and manage their auction activities in a secure and user-friendly environment.

## Features

### Current Features
- **User Authentication** - Secure sign-up/sign-in with Clerk
- **Role-Based Access Control** - Admin and User roles
- **Admin Dashboard** - Manage users, carousel images, and new arrivals
- **Dynamic Carousel** - Customizable homepage banners
- **New Arrivals Section** - Showcase latest auction items
- **Image Management** - Cloudinary integration for media storage
- **FAQ Section** - Common questions and answers

### In Development
- Live Auction System
- Real-time Bidding
- Auction Listings & Categories
- User Profiles & Bid History
- Payment Integration
- Notification System
- Advanced Search & Filters

## Tech Stack

**Frontend:**
- [Next.js 15](https://nextjs.org/) - React Framework
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
- [Tailwind CSS 4](https://tailwindcss.com/) - Styling
- [React Icons](https://react-icons.github.io/react-icons/) - Icon Library

**Backend:**
- [MongoDB](https://www.mongodb.com/) - Database
- [Mongoose](https://mongoosejs.com/) - ODM
- [Clerk](https://clerk.com/) - Authentication & User Management

**Services:**
- [Cloudinary](https://cloudinary.com/) - Media Management
- [Vercel](https://vercel.com/) - Deployment (Planned)

## Prerequisites

- Node.js 20.x or higher
- MongoDB Atlas account
- Clerk account
- Cloudinary account

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd auctiohub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   # Admin Configuration
   MASTER_ADMIN_EMAIL="your-admin-email@example.com"
   ADMIN_EMAILS="your-admin-email@example.com"

   # MongoDB
   MONGODB_URI="your-mongodb-connection-string"

   # Cloudinary
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
   CLERK_SECRET_KEY="your-clerk-secret-key"
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
auctiohub/
├── public/
│   └── assets/          # Static images and banners
├── src/
│   ├── app/
│   │   ├── admin/       # Admin dashboard pages
│   │   ├── api/         # API routes
│   │   ├── category/    # Category pages
│   │   ├── contact/     # Contact page
│   │   ├── faq/         # FAQ page
│   │   └── ...
│   ├── components/
│   │   ├── admin/       # Admin-specific components
│   │   ├── ui/          # Reusable UI components
│   │   ├── Carousel.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── ...
│   └── lib/
│       ├── mongodb.ts   # Database connection
│       ├── models.ts    # Mongoose schemas
│       ├── admin.ts     # Admin utilities
│       └── utils.ts     # Helper functions
└── ...
```

## Admin Access

To set up admin access:

1. Add your email to the `ADMIN_EMAILS` environment variable
2. Sign up using that email through Clerk
3. The system will automatically grant admin privileges
4. Access admin dashboard at `/admin`

## Customization

### Carousel Images
- Recommended size: **1920×800 pixels**
- Format: JPG or WebP
- Max file size: 300KB per image
- Managed through Admin Dashboard

### Color Palette
The project uses a modern color scheme:
- Light Background: `#F7F7F7`
- Neutral: `#EEEEEE`
- Dark: `#393E46`
- Accent: `#929AAB`

## Deployment

This project is configured for deployment on Vercel:

```bash
npm run build
```

For deployment instructions, see [Next.js Deployment Documentation](https://nextjs.org/docs/deployment).

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Contributing

This project is currently under development. Contributions, issues, and feature requests are welcome!

## License

This project is part of a Final Year Project (FYP).

## Author

**Piyush Karn**
- Email: piyushkarn76@gmail.com

## Links

- [Live Demo](#) _(Coming Soon)_
- [Documentation](#) _(In Progress)_

---

**Note:** This project is actively being developed. Features and documentation may change frequently. Please check back for updates!

**Last Updated:** December 2025