import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'
import { User, CarouselImage } from '@/lib/models'

export async function GET() {
  try {
    console.log('🧪 Testing database connection...')
    
    // Test connection
    console.log('✅ Database connection successful')
    
    // Test User model
    const allUsers = await User.find({})
    const userCount = allUsers.length
    console.log('👥 User count:', userCount)
    
    // Test CarouselImage model
    const allImages = await CarouselImage.find({})
    const imageCount = allImages.length
    console.log('🖼️ Carousel image count:', imageCount)
    
    // Get sample data
    const sampleUser = allUsers[0] || null
    const sampleImage = allImages[0] || null
    
    return NextResponse.json({
      success: true,
      connection: 'Connected to MongoDB',
      environment: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV || 'local',
      counts: {
        users: userCount,
        carouselImages: imageCount
      },
      samples: {
        user: sampleUser,
        image: sampleImage
      },
      mongoUri: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
      mongoUriPrefix: process.env.MONGODB_URI?.substring(0, 25) + '...',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Database test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        mongoUri: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
        environment: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV || 'local'
      }
    }, { status: 500 })
  }
}
