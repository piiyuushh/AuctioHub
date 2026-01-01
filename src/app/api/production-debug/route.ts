import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/mongodb'
import { CarouselImage } from '@/lib/models'
import { isAdmin } from '@/lib/admin'

export async function GET() {
  try {
    console.log('🔍 Production Debug Endpoint Called')
    
    // Test 1: Environment Variables
    const envCheck = {
      hasMongoUri: !!process.env.MONGODB_URI,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasAdminEmails: !!process.env.ADMIN_EMAILS,
      nodeEnv: process.env.NODE_ENV,
      mongoUriStart: process.env.MONGODB_URI?.substring(0, 20) + '...',
    }
    
    // Test 2: Authentication
    let authTest: { hasSession: boolean; userEmail: string | null } = { hasSession: false, userEmail: null }
    try {
      const session = await getServerSession(authOptions)
      authTest = {
        hasSession: !!session,
        userEmail: session?.user?.email || null
      }
    } catch (error) {
      console.error('Auth test failed:', error)
    }
    
    // Test 3: Admin Check
    const adminTest: { isAdmin: boolean; error: string | null } = { isAdmin: false, error: null }
    try {
      adminTest.isAdmin = await isAdmin()
    } catch (error) {
      adminTest.error = error instanceof Error ? error.message : 'Unknown error'
    }
    
    // Test 4: Database Connection
    let dbTest: {
      connected: boolean;
      error: string | null;
      carouselCount: number;
      sampleImages: Array<{ id: string; url: string; isActive: boolean; order: number }>;
    } = {
      connected: false,
      error: null,
      carouselCount: 0,
      sampleImages: []
    }
    
    try {
      await connectToDatabase()
      console.log('📊 Database connected successfully')
      
      const count = await CarouselImage.countDocuments()
      const images = await CarouselImage.find({}).limit(3).lean()
      
      dbTest = {
        connected: true,
        error: null,
        carouselCount: count,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sampleImages: images.map((img: any) => ({
          id: img._id?.toString() || 'unknown',
          url: img.url || 'unknown',
          isActive: img.isActive || false,
          order: img.order || 0
        }))
      }
    } catch (error) {
      console.error('Database test failed:', error)
      dbTest = {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown database error',
        carouselCount: 0,
        sampleImages: []
      }
    }
    
    // Test 5: API Endpoints Test
    const apiTest = {
      timestamp: new Date().toISOString(),
      server: 'vercel',
      region: process.env.VERCEL_REGION || 'unknown'
    }
    
    return NextResponse.json({
      status: 'Production Debug Report',
      environment: envCheck,
      authentication: authTest,
      admin: adminTest,
      database: dbTest,
      api: apiTest
    }, { status: 200 })
    
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
