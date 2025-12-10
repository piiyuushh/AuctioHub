import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { User, CarouselImage } from '@/lib/models'

export async function GET() {
  try {
    console.log('🧪 Testing database connection...')
    
    // Test connection
    await connectToDatabase()
    console.log('✅ Database connection successful')
    
    // Test User model
    const userCount = await User.countDocuments()
    console.log('👥 User count:', userCount)
    
    // Test CarouselImage model
    const imageCount = await CarouselImage.countDocuments()
    console.log('🖼️ Carousel image count:', imageCount)
    
    // Get sample data
    const sampleUser = await User.findOne().select('email role createdAt')
    const sampleImage = await CarouselImage.findOne().select('url altText isActive')
    
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
