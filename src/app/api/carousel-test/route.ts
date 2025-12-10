import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { CarouselImage } from '@/lib/models'

export async function GET() {
  try {
    console.log('🔍 Public Carousel Test: Starting...')
    
    // Test database connection
    await connectToDatabase()
    console.log('✅ Database connected')
    
    // Get active carousel images (same logic as the main carousel endpoint)
    const images = await CarouselImage.find(
      { isActive: true },
      'url altText order isActive createdAt'
    ).sort({ order: 1 })
    
    console.log(`📸 Found ${images.length} active carousel images`)
    
    // Also get all images (including inactive) for debugging
    const allImages = await CarouselImage.find({})
      .select('url altText order isActive createdAt')
      .sort({ createdAt: -1 })
    
    console.log(`📸 Total images in database: ${allImages.length}`)
    
    return NextResponse.json({
      success: true,
      activeImages: images,
      activeCount: images.length,
      totalImages: allImages.length,
      allImages: allImages.map(img => ({
        url: img.url.substring(0, 50) + '...',
        altText: img.altText,
        order: img.order,
        isActive: img.isActive,
        createdAt: img.createdAt
      })),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV || 'local'
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Public carousel test error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV || 'local',
        hasMongoUri: !!process.env.MONGODB_URI
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
