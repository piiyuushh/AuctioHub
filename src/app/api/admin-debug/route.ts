import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const user = await currentUser()
    const userEmail = user?.emailAddresses[0]?.emailAddress
    
    // Get environment variables
    const adminEmailsRaw = process.env.ADMIN_EMAILS
    const adminEmails = adminEmailsRaw?.split(',').map(email => email.trim()) || []
    
    // Remove quotes if they exist
    const cleanedAdminEmails = adminEmails.map(email => 
      email.replace(/^["']|["']$/g, '') // Remove leading/trailing quotes
    )
    
    return NextResponse.json({
      environment: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV || 'local',
      userEmail,
      adminEmailsRaw,
      adminEmailsParsed: adminEmails,
      adminEmailsCleaned: cleanedAdminEmails,
      isAdminRaw: adminEmails.includes(userEmail || ''),
      isAdminCleaned: cleanedAdminEmails.includes(userEmail || ''),
      hasMongoUri: !!process.env.MONGODB_URI,
      hasCloudinary: !!process.env.CLOUDINARY_CLOUD_NAME
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Debug check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
