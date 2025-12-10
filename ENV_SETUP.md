# 🔧 Environment Variables Setup Guide

## Files Created

1. **`.env.local`** - Local development environment with your actual credentials
2. **`.env.example`** - Template file for new developers (safe to commit to git)
3. **`.env.production`** - Template for production environment variables

## 📋 Environment Variables Explained

### Clerk Authentication
- **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`** - Public key for Clerk authentication (client-side)
- **`CLERK_SECRET_KEY`** - Private key for Clerk authentication (server-side)

### Admin Configuration
- **`ADMIN_EMAILS`** - Comma-separated list of admin email addresses for admin access

### Database
- **`MONGODB_URI`** - MongoDB connection string for your database

### File Upload (Cloudinary)
- **`CLOUDINARY_CLOUD_NAME`** - Your Cloudinary cloud name
- **`CLOUDINARY_API_KEY`** - Your Cloudinary API key
- **`CLOUDINARY_API_SECRET`** - Your Cloudinary API secret

### Optional Variables
- **`NODE_ENV`** - Environment type (development/production)
- **`DATABASE_URL`** - Alternative database URL (if using different DB)
- **`NEXTAUTH_SECRET`** - Secret for NextAuth (if implementing)
- **`NEXTAUTH_URL`** - Base URL for NextAuth callbacks

## 🚨 Security Notes

1. **Never commit `.env.local`** to version control
2. **Only commit `.env.example`** as a template
3. **Keep production credentials secure**
4. **Rotate secrets regularly**

## 🚀 Deployment Setup

### For Vercel:
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable from `.env.production` (with your actual production values)
4. Set environment scope to: Production, Preview, Development

### For other platforms:
- Copy variables from `.env.production`
- Update with your platform-specific production values
- Ensure all variables are set in your deployment environment

## 🧪 Testing Your Setup

Run these API endpoints to verify your environment variables:
- `/api/env-check` - Check if all required variables are set
- `/api/debug` - Detailed environment information (development only)
- `/api/db-test` - Test database connection
- `/api/cloudinary-test` - Test Cloudinary configuration

## 📝 Development Workflow

1. Copy `.env.example` to `.env.local` for new developers
2. Fill in actual values in `.env.local`
3. Never commit `.env.local` to git
4. Update `.env.example` when adding new variables (with placeholder values)

## 🔄 Variable Updates

When updating environment variables:
1. Update `.env.local` for local development
2. Update `.env.example` with new placeholder
3. Update production environment in your deployment platform
4. Document changes in this guide
