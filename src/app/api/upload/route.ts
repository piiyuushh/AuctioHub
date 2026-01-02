import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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
  console.log('🔍 Public upload endpoint called')
  
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.error('❌ Not authenticated')
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    console.log('✅ User authenticated:', session.user.email)

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Cloudinary not configured')
      return NextResponse.json({ 
        error: 'Cloudinary not configured. Missing environment variables.'
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
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      console.error('❌ Invalid file type:', file.type)
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Only JPEG, PNG, WebP, and GIF are allowed.` },
        { status: 400 }
      )
    }

    // Validate file size (max 8MB)
    const maxSize = 8 * 1024 * 1024 // 8MB
    if (file.size > maxSize) {
      console.error('❌ File too large:', file.size)
      return NextResponse.json(
        { error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size is 8MB.` },
        { status: 400 }
      )
    }

    try {
      console.log('🔄 Converting file to buffer...')
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      console.log('☁️ Uploading to Cloudinary...')
      const timestamp = Date.now()
      
      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'tokari-products',
            public_id: `product-${timestamp}`,
            resource_type: 'image',
            transformation: [
              { width: 1200, height: 1200, crop: 'limit' },
              { quality: 'auto:good' },
              { fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) {
              console.error('❌ Cloudinary upload error:', error)
              reject(error)
            } else {
              console.log('✅ Cloudinary upload successful:', result?.secure_url)
              resolve(result)
            }
          }
        )
        
        uploadStream.end(buffer)
      })

      const uploadResult = result as any

      return NextResponse.json({
        success: true,
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        size: uploadResult.bytes
      })

    } catch (uploadError: any) {
      console.error('❌ Upload processing error:', uploadError)
      return NextResponse.json(
        { 
          error: 'Failed to upload image to Cloudinary',
          details: uploadError.message 
        },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('❌ Server error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
