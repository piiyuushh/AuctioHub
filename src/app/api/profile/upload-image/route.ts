import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { v2 as cloudinary } from 'cloudinary'
import { authOptions } from '@/lib/auth'

export const runtime = 'nodejs'
export const maxDuration = 60

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: 'Cloudinary is not configured' },
        { status: 500 }
      )
    }

    const data = await request.formData()
    const file = data.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Use JPG, PNG, or WEBP.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'Image too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadResult = await new Promise<{
      secure_url: string
      public_id: string
      width: number
      height: number
      bytes: number
      format: string
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'auctiohub-profiles',
          public_id: `profile-${Date.now()}`,
          resource_type: 'image',
          transformation: [
            { width: 600, height: 600, crop: 'fill', gravity: 'face' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error('Cloudinary upload failed'))
            return
          }

          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            format: result.format,
          })
        }
      )

      stream.end(buffer)
    })

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      size: uploadResult.bytes,
      format: uploadResult.format,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to upload profile image'
    console.error('Profile image upload error:', error)
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
