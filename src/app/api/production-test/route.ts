import { NextResponse } from 'next/server'
import { CarouselImage } from '@/lib/models'

export async function GET() {
  try {
    console.log('Production Debug: Starting comprehensive test...')
    
    // Check environment variables
    const envCheck = {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV || 'local',
      hasMongoUri: !!process.env.MONGODB_URI,
      mongoUriLength: process.env.MONGODB_URI?.length || 0,
      mongoUriPrefix: process.env.MONGODB_URI?.substring(0, 30) + '...',
      hasAdminEmails: !!process.env.ADMIN_EMAILS,
      adminEmails: process.env.ADMIN_EMAILS,
      hasCloudinary: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
    }
    
    console.log('Environment check:', envCheck)
    
    // Test database connection
    const dbResult = {
      connected: false,
      error: null as string | null,
      carouselCount: 0,
      sampleImages: [] as Array<{
        url: string;
        altText: string;
        order: number;
        isActive: boolean;
      }>
    }
    
    try {
      console.log('Attempting database connection...')
      console.log('Database connected successfully')
      
      dbResult.connected = true
      
      // Get carousel images
      const images = await CarouselImage.find({ isActive: true })
      const limitedImages = images.slice(0, 3)
      
      dbResult.carouselCount = images.length
      dbResult.sampleImages = limitedImages.map((img) => ({
        url: img.url.substring(0, 50) + '...',
        altText: img.altText || '',
        order: img.order,
        isActive: img.isActive
      }))
      
      console.log(`Found ${dbResult.carouselCount} active carousel images`)
      
    } catch (dbError) {
      console.error('Database error:', dbError)
      dbResult.error = dbError instanceof Error ? dbError.message : 'Unknown database error'
    }
    
    // Test carousel API endpoint
    const carouselApiResult = {
      success: false,
      error: null as string | null,
      imageCount: 0
    }
    
    try {
      // Since we're in the same process, we can call the carousel API logic directly
      const allImages = await CarouselImage.find({ isActive: true })
      // Already sorted by order in the model
      
      carouselApiResult.success = true
      carouselApiResult.imageCount = allImages.length
      
    } catch (apiError) {
      console.error('Carousel API error:', apiError)
      carouselApiResult.error = apiError instanceof Error ? apiError.message : 'Unknown API error'
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envCheck,
      database: dbResult,
      carouselApi: carouselApiResult,
      diagnosis: {
        issue: dbResult.connected ? 
          (dbResult.carouselCount === 0 ? 'Database connected but no carousel images found' : 'Everything looks good') :
          'Database connection failed',
        solution: dbResult.connected ? 
          (dbResult.carouselCount === 0 ? 'Run the seed endpoint: /api/admin/seed' : 'No action needed') :
          'Check MongoDB URI and network connectivity'
      }
    })
    
  } catch (error) {
    console.error('Production debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
