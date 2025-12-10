import { NextResponse } from 'next/server'

export async function GET() {
  // Test basic Cloudinary connection without file upload
  try {
    const { v2: cloudinary } = await import('cloudinary')
    
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })
    
    // Check environment variables
    const envStatus = {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'MISSING',
      hasApiKey: !!process.env.CLOUDINARY_API_KEY,
      hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV || 'local'
    }
    
    // Test Cloudinary API connection
    let cloudinaryTest: { connected: boolean; error: string | null; result?: unknown } = { connected: false, error: null }
    try {
      // Simple API test - get account details
      const result = await cloudinary.api.ping()
      cloudinaryTest = { connected: true, error: null, result }
    } catch (error) {
      cloudinaryTest = { 
        connected: false, 
        error: error instanceof Error ? error.message : 'Unknown Cloudinary error'
      }
    }
    
    return NextResponse.json({
      status: 'Cloudinary Connection Test',
      environment: envStatus,
      cloudinaryConnection: cloudinaryTest,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
