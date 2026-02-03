import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'
import { CarouselImage } from '@/lib/models'

export async function GET() {
  try {
    console.log('Public Carousel Test: Starting...')
    
    // Test database connection
    console.log('Database connected')
    
    // Get active carousel images (same logic as the main carousel endpoint)
    const images = await CarouselImage.find({ isActive: true })
    // Already sorted by order in the model
    
    console.log(`Found ${images.length} active carousel images`)
    
    // Also get all images (including inactive) for debugging
    const allImages = await CarouselImage.find({})
    const sortedAllImages = allImages.sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    )
    
    console.log(`Total images in database: ${allImages.length}`)
    
    return NextResponse.json({
      success: true,
      activeImages: images,
      activeCount: images.length,
      totalImages: allImages.length,
      allImages: sortedAllImages.map((img: any) => ({
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
    console.error('Public carousel test error:', error)
    
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
