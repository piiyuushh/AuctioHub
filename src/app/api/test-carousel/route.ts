import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import connectToDatabase from '@/lib/mongodb'
import { CarouselImage } from '@/lib/models'
import { isAdmin, requireAdmin } from '@/lib/admin'

export async function GET() {
  try {
    console.log('🔍 Carousel test endpoint called')
    
    // Test 1: Authentication
    const { userId } = await auth()
    const user = await currentUser()
    console.log('🔐 Auth check:', { hasUserId: !!userId, hasUser: !!user })
    
    // Test 2: Admin check
    const adminStatus = await isAdmin()
    console.log('👑 Admin check:', adminStatus)
    
    // Test 3: Database connection
    let dbTest = 'unknown'
    let carouselData = null
    let dbError = null
    
    try {
      await connectToDatabase()
      console.log('📊 Database connected')
      
      const images = await CarouselImage.find({}).sort({ order: 1 })
      carouselData = images
      dbTest = 'success'
      console.log('🖼️ Carousel images found:', images.length)
    } catch (error) {
      dbTest = 'failed'
      dbError = error instanceof Error ? error.message : 'Unknown database error'
      console.error('❌ Database error:', dbError)
    }
    
    // Test 4: Admin requirement
    let adminRequirementTest = 'unknown'
    let adminError = null
    
    try {
      await requireAdmin()
      adminRequirementTest = 'passed'
      console.log('✅ Admin requirement passed')
    } catch (error) {
      adminRequirementTest = 'failed'
      adminError = error instanceof Error ? error.message : 'Unknown admin error'
      console.error('❌ Admin requirement failed:', adminError)
    }
    
    return NextResponse.json({
      carouselTest: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        platform: process.env.VERCEL ? 'Vercel' : 'Local',
        
        // Authentication tests
        auth: {
          hasUserId: !!userId,
          hasUser: !!user,
          userEmail: user?.emailAddresses[0]?.emailAddress || 'No email'
        },
        
        // Admin tests
        admin: {
          isAdmin: adminStatus,
          adminRequirementTest,
          adminError,
          adminEmails: process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || []
        },
        
        // Database tests
        database: {
          connectionTest: dbTest,
          dbError,
          carouselImageCount: carouselData?.length || 0,
          sampleData: carouselData?.slice(0, 2) || []
        },
        
        // Environment variables
        environmentVars: {
          hasClerkKeys: !!process.env.CLERK_SECRET_KEY && !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          hasAdminEmails: !!process.env.ADMIN_EMAILS
        },
        
        // Overall status
        status: adminRequirementTest === 'passed' && dbTest === 'success' ? 'ALL_TESTS_PASSED' : 'SOME_TESTS_FAILED'
      }
    })
    
  } catch (error) {
    console.error('❌ Carousel test failed:', error)
    return NextResponse.json({
      carouselTest: {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }, { status: 500 })
  }
}
