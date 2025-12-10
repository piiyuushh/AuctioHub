import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { v2 as cloudinary } from 'cloudinary'

// Configure runtime and limits
export const runtime = 'nodejs'
export const maxDuration = 60

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  console.log('🔍 Upload endpoint called')
  
  try {
    console.log('🔐 Checking admin access...')
    await requireAdmin()
    console.log('✅ Admin access granted')

    // Check if Cloudinary is configured with detailed logging
    const configCheck = {
      hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
      hasApiKey: !!process.env.CLOUDINARY_API_KEY,
      hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME?.substring(0, 5) + '***'
    }
    
    console.log('🌤️ Cloudinary config check:', configCheck)
    
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Cloudinary not configured')
      return NextResponse.json({ 
        error: 'Cloudinary not configured. Missing environment variables.',
        details: configCheck
      }, { status: 500 })
    }

    console.log('📝 Parsing form data...')
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      console.error('❌ No file in form data')
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }
    
    console.log('📁 File received:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    // Validate file type
    console.log('🔍 Validating file type:', file.type)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      console.error('❌ Invalid file type:', file.type)
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Only JPEG, PNG, WebP, and GIF are allowed.` },
        { status: 400 }
      )
    }

    // Validate file size (max 8MB for Vercel compatibility)
    console.log('🔍 Validating file size:', file.size)
    const maxSize = 8 * 1024 * 1024 // 8MB (reduced for Vercel limits)
    if (file.size > maxSize) {
      console.error('❌ File too large:', file.size)
      return NextResponse.json(
        { error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size is 8MB.` },
        { status: 400 }
      )
    }

    try {
      console.log('🔄 Converting file to buffer...')
      // Convert file to buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      console.log('✅ Buffer created, size:', buffer.length)

      console.log('☁️ Starting Cloudinary upload...')
      // Upload to Cloudinary
      const uploadResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: 'tokari-banners',
            public_id: `banner-${Date.now()}`,
            transformation: [
              { width: 1200, height: 400, crop: 'fill' },
              { quality: 'auto', fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) {
              console.error('❌ Cloudinary upload error:', error)
              reject(error)
            } else {
              console.log('✅ Cloudinary upload success:', {
                public_id: result?.public_id,
                secure_url: result?.secure_url?.substring(0, 50) + '...'
              })
              resolve(result)
            }
          }
        ).end(buffer)
      })

      const result = uploadResponse as { secure_url: string; public_id: string }
      
      console.log('🎉 Upload completed successfully')
      return NextResponse.json({
        success: true,
        url: result.secure_url,
        public_id: result.public_id,
        message: 'File uploaded successfully to Cloudinary'
      })

    } catch (uploadError) {
      console.error('❌ Cloudinary upload failed:', uploadError)
      return NextResponse.json(
        { 
          error: 'Failed to upload to Cloudinary. Please try again.',
          details: uploadError instanceof Error ? uploadError.message : 'Unknown upload error'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ Upload endpoint error:', error)
    
    if (error instanceof Error && error.message.includes('Admin access required')) {
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Server error during upload' },
      { status: 500 }
    )
  }
}
