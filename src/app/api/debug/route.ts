import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import connectToDatabase from '@/lib/mongodb'
import { CarouselImage } from '@/lib/models'

export async function GET() {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
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
    const userEmail = user?.emailAddresses[0]?.emailAddress
    const isUserAdmin = userEmail ? adminEmails.includes(userEmail) : false
    
    return NextResponse.json({
      debug: {
        // Authentication
        hasUserId: !!userId,
        hasUser: !!user,
        userEmail: userEmail || 'No email',
        isUserAdmin,
        
        // Environment Variables
        adminEmailsEnv: process.env.ADMIN_EMAILS || 'NOT SET',
        adminEmailsArray: adminEmails,
        clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 20) + '...' || 'NOT SET',
        hasClerkSecret: !!process.env.CLERK_SECRET_KEY,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlStart: process.env.DATABASE_URL?.substring(0, 30) + '...' || 'NOT SET',
        
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
          ...(!process.env.CLERK_SECRET_KEY ? ['CLERK_SECRET_KEY environment variable is missing'] : []),
          ...(!process.env.DATABASE_URL ? ['DATABASE_URL environment variable is missing'] : []),
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
