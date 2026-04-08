import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { v2 as cloudinary } from 'cloudinary'

type CloudinaryResource = {
  public_id: string
  secure_url: string
  created_at: string
  bytes: number
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function DELETE() {
  try {
    await requireAdmin()

    console.log('Starting bulk Cloudinary cleanup...')

    // Get all resources from the tokari-banners folder
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'tokari-banners/',
      max_results: 500,
    })

    if (!result.resources || result.resources.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No images found to delete',
        deleted: 0,
      })
    }

    console.log(`Found ${result.resources.length} images to delete`)

    // Delete each image
    const resources = (result.resources || []) as CloudinaryResource[]
    const publicIds = resources.map((resource) => resource.public_id)
    const deleteResult = await cloudinary.api.delete_resources(publicIds, {
      resource_type: 'image',
    })

    const deletedCount = Object.keys(deleteResult.deleted).filter(
      (key) => deleteResult.deleted[key] === 'deleted'
    ).length

    console.log(`Deleted ${deletedCount} images from Cloudinary`)

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedCount} images`,
      deleted: deletedCount,
      details: deleteResult,
    })
  } catch (error: unknown) {
    console.error('Error clearing Cloudinary:', error)
    return NextResponse.json(
      {
        error: 'Failed to clear Cloudinary images',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    await requireAdmin()

    // List all images in tokari-banners folder
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'tokari-banners/',
      max_results: 500,
    })

    return NextResponse.json({
      success: true,
      count: result.resources.length,
      images: ((result.resources || []) as CloudinaryResource[]).map((r) => ({
        public_id: r.public_id,
        url: r.secure_url,
        created_at: r.created_at,
        bytes: r.bytes,
      })),
    })
  } catch (error: unknown) {
    console.error('Error listing Cloudinary images:', error)
    return NextResponse.json(
      {
        error: 'Failed to list Cloudinary images',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
