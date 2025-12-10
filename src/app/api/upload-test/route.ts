import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    
    // Check environment variables
    const envCheck = {
      hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
      hasApiKey: !!process.env.CLOUDINARY_API_KEY,
      hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'NOT_SET',
      apiKeyPartial: process.env.CLOUDINARY_API_KEY ? `${process.env.CLOUDINARY_API_KEY.substring(0, 6)}****` : 'NOT_SET'
    }
    
    // Check if we can parse form data
    let formDataCheck = null
    let fileCheck = null
    
    try {
      const data = await request.formData()
      const file = data.get('file') as File | null
      
      formDataCheck = {
        success: true,
        hasFile: !!file,
        fileName: file?.name || 'no file',
        fileSize: file?.size || 0,
        fileType: file?.type || 'no type'
      }
      
      if (file) {
        fileCheck = {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        }
      }
      
    } catch (error) {
      formDataCheck = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown form data error'
      }
    }
    
    return NextResponse.json({
      status: 'Upload Test Debug',
      environment: envCheck,
      formData: formDataCheck,
      file: fileCheck,
      timestamp: new Date().toISOString(),
      serverInfo: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV || 'local'
      }
    })
    
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Upload test endpoint - use POST with form data to test upload functionality'
  })
}
