# MongoDB Setup Guide

This project has been migrated from Prisma with PostgreSQL to MongoDB with Mongoose. Follow these steps to set up your MongoDB database.

## 1. Create a MongoDB Account and Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account
2. Create a new project (e.g., "Tokari Next")
3. Build a database cluster:
   - Choose the FREE tier (M0 Sandbox)
   - Select your preferred cloud provider and region
   - Give your cluster a name (e.g., "tokari-cluster")

## 2. Set up Database Access

1. **Create a Database User:**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and secure password
   - Give the user "Atlas Admin" privileges (or "Read and write to any database" for minimal access)

2. **Configure Network Access:**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (0.0.0.0/0) for development, or add your specific IP

## 3. Get Your Connection String

1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version "4.1 or later"
5. Copy the connection string (it will look like):
   ```
   mongodb+srv://<username>:<password>@<cluster-name>.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## 4. Update Your Environment Variables

1. Open your `.env.local` file
2. Replace the placeholder MongoDB URI with your actual connection string:
   ```bash
   MONGODB_URI="mongodb+srv://your-username:your-password@your-cluster.mongodb.net/tokari-next?retryWrites=true&w=majority"
   ```
   
   **Important:** 
   - Replace `your-username` with your database username
   - Replace `your-password` with your database password
   - Replace `your-cluster` with your cluster name
   - Add `/tokari-next` after `.mongodb.net` to specify the database name

## 5. Database Schema

The application will automatically create the following collections when data is first inserted:

### Collections:
- **users**: Stores user authentication data
- **carousel_images**: Stores carousel/banner images for the homepage
- **admin_settings**: Stores admin configuration settings

### Sample Documents:

**CarouselImage:**
```json
{
  "_id": "ObjectId",
  "url": "https://example.com/image.jpg",
  "altText": "Sample banner",
  "order": 0,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**User:**
```json
{
  "_id": "ObjectId",
  "clerkId": "user_xxx",
  "email": "user@example.com",
  "role": "USER",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 6. Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit your debug endpoint to test the database connection:
   ```
   http://localhost:3000/api/debug
   ```

3. Look for the database status in the response - it should show "connected"

## 7. Migration from Prisma

**What Changed:**
- ✅ Removed Prisma and PostgreSQL dependencies
- ✅ Added Mongoose and MongoDB dependencies
- ✅ Created MongoDB connection utility (`src/lib/mongodb.ts`)
- ✅ Created Mongoose models (`src/lib/models.ts`)
- ✅ Updated all API routes to use MongoDB
- ✅ Updated React components to handle MongoDB ObjectIds
- ✅ Removed Prisma schema and configuration files

**Data Migration:**
Since you're switching database types, you'll need to:
1. Export any existing data from your PostgreSQL database
2. Manually recreate important records in MongoDB through the admin interface
3. Upload new carousel images through the admin dashboard

## 8. Production Deployment

For production deployment on Vercel:

1. Add your MongoDB URI to Vercel environment variables:
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add: `MONGODB_URI` with your production MongoDB connection string

2. Make sure your MongoDB cluster allows connections from anywhere (0.0.0.0/0) or add Vercel's IP ranges

## Troubleshooting

**Connection Issues:**
- Verify your username and password are correct
- Check that your IP address is whitelisted in MongoDB Atlas
- Ensure the database name is included in the connection string

**Development vs Production:**
- Use different databases for development and production
- Create separate clusters or use different database names in the connection string

**Performance:**
- MongoDB Atlas free tier (M0) has some limitations
- For production, consider upgrading to a paid tier for better performance
