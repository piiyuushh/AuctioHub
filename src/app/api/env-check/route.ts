import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const envCheck = {
      hasAdminEmails: !!process.env.ADMIN_EMAILS,
      adminEmailsValue: process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.substring(0, 10) + '...' : 'NOT SET',
      hasMongoUri: !!process.env.MONGODB_URI,
      mongoUriPrefix: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'NOT SET',
      hasCloudinary: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET),
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV || 'local',
      timestamp: new Date().toISOString()
    }
    
    console.log('🔍 Environment check:', envCheck)
    
    return NextResponse.json({
      success: true,
      environment: envCheck,
      message: 'Environment variables check completed'
    })
  } catch (error) {
    console.error('❌ Environment check error:', error)
    return NextResponse.json(
      { error: 'Failed to check environment variables' },
      { status: 500 }
    )
  }
}
