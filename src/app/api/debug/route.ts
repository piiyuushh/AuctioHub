import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/mongodb'
import { CarouselImage } from '@/lib/models'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    // Test database connection
    let dbStatus = 'unknown'
    let dbError = null
    let carouselCount = 0
    
    try {
      await connectToDatabase()
      const count = await CarouselImage.countDocuments()
      carouselCount = count
      dbStatus = 'connected'
    } catch (error) {
      dbStatus = 'failed'
      dbError = error instanceof Error ? error.message : 'Unknown database error'
    }
    
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || []
    const userEmail = session?.user?.email
    const isUserAdmin = userEmail ? adminEmails.includes(userEmail) : false
    
    return NextResponse.json({
      debug: {
        // Authentication
        hasSession: !!session,
        userEmail: userEmail || 'No email',
        isUserAdmin,
        
        // Environment Variables
        adminEmailsEnv: process.env.ADMIN_EMAILS || 'NOT SET',
        adminEmailsArray: adminEmails,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasDatabaseUrl: !!process.env.MONGODB_URI,
        databaseUrlStart: process.env.MONGODB_URI?.substring(0, 30) + '...' || 'NOT SET',
        
        // Database
        databaseStatus: dbStatus,
        databaseError: dbError,
        carouselImageCount: carouselCount,
        
        // System
        environment: process.env.NODE_ENV,
        platform: process.env.VERCEL ? 'Vercel' : 'Local',
        timestamp: new Date().toISOString(),
        
        // Recommendations
        issues: [
          ...(adminEmails.length === 0 ? ['ADMIN_EMAILS environment variable is empty'] : []),
          ...(!process.env.NEXTAUTH_SECRET ? ['NEXTAUTH_SECRET environment variable is missing'] : []),
          ...(!process.env.MONGODB_URI ? ['MONGODB_URI environment variable is missing'] : []),
          ...(dbStatus === 'failed' ? ['Database connection failed'] : []),
          ...(!isUserAdmin && userEmail ? [`User ${userEmail} is not in admin list`] : [])
        ]
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Debug failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
