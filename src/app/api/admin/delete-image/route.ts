import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()
    
    const { searchParams } = new URL(request.url)
    const publicId = searchParams.get('public_id')
    const imageUrl = searchParams.get('image_url')
    
    if (!publicId && !imageUrl) {
      return NextResponse.json(
        { error: 'Either public_id or image_url is required' },
        { status: 400 }
      )
    }

    // If only URL is provided, extract public_id from Cloudinary URL
    let targetPublicId = publicId
    if (!targetPublicId && imageUrl) {
      const match = imageUrl.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|gif|webp)$/i)
      if (match) {
        targetPublicId = match[1]
      } else {
        return NextResponse.json(
          { error: 'Could not extract public_id from image URL. Please provide public_id directly.' },
          { status: 400 }
        )
      }
    }

    if (!targetPublicId) {
      return NextResponse.json(
        { error: 'Could not determine public_id for deletion' },
        { status: 400 }
      )
    }

    console.log('🗑️ Attempting to delete image from Cloudinary:', targetPublicId)

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(targetPublicId)
    
    console.log('🔄 Cloudinary deletion result:', result)

    if (result.result === 'ok') {
      return NextResponse.json({
        success: true,
        message: 'Image deleted successfully from Cloudinary',
        public_id: targetPublicId,
        result: result.result
      })
    } else if (result.result === 'not found') {
      return NextResponse.json({
        success: false,
        message: 'Image not found in Cloudinary (may have been already deleted)',
        public_id: targetPublicId,
        result: result.result
      }, { status: 404 })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to delete image from Cloudinary',
        public_id: targetPublicId,
        result: result.result
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Error deleting image from Cloudinary:', error)
    
    if (error instanceof Error && error.message.includes('Admin access required')) {
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to delete image from Cloudinary',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
