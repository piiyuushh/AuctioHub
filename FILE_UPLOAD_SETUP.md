# File Upload Setup Guide for Production

## Why File Upload Fails on Vercel

Vercel serverless functions have several limitations:
- **Read-only filesystem** - Cannot write files to `/public` folder
- **No persistent storage** - Files don't persist between deployments  
- **Memory constraints** - Limited memory for file processing

## Solutions

### Option 1: Use Image URLs (Quick Solution)
Instead of uploading files, use direct image URLs:
```
https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop
https://your-cdn.com/path/to/image.jpg
```

### Option 2: Set Up Cloudinary (Recommended)

Cloudinary provides free cloud storage for images with automatic optimization.

#### Step 1: Create Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Note down your credentials from the dashboard

#### Step 2: Add Environment Variables
Add these to your Vercel project and `.env.local`:

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here  
CLOUDINARY_API_SECRET=your_api_secret_here
```

#### Step 3: Deploy
Once environment variables are set, file uploads will work automatically.

#### Benefits of Cloudinary:
- ✅ **Free tier**: 25 GB storage, 25 GB bandwidth
- ✅ **Auto optimization**: Automatic image compression
- ✅ **CDN delivery**: Fast global image delivery
- ✅ **Transformations**: Automatic resizing to 1200x400 for banners
- ✅ **Backup**: Images are safely stored in the cloud

## Current Status

**Without Cloudinary:** File upload shows error message directing users to use URLs
**With Cloudinary:** File upload works seamlessly in production

## For Development vs Production

- **Local development**: File upload works (saves to `/public/uploads`)
- **Production (Vercel)**: Requires Cloudinary for file upload functionality
- **Image URLs**: Work everywhere regardless of setup

## Quick Setup Commands

1. Install Cloudinary (already done):
   ```bash
   npm install cloudinary
   ```

2. Add environment variables to Vercel:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add the 3 Cloudinary variables

3. Deploy and test file upload functionality

## Alternative Cloud Storage Options

If you prefer other services:
- **AWS S3** with signed URLs
- **Google Cloud Storage**
- **Azure Blob Storage**
- **Supabase Storage**

The current implementation can be modified to work with any of these services.
