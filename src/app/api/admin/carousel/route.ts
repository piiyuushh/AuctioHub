import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { CarouselImage } from '@/lib/models'
import { requireAdmin } from '@/lib/admin'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Get all carousel images (both active and inactive for admin)
export async function GET() {
  try {
    console.log('🔍 Getting carousel images...')
    await connectToDatabase()
    
    // For admin endpoint, return both active and inactive images
    const images = await CarouselImage.find({})
      .sort({ order: 1 })
      .exec()
    
    console.log('✅ Found carousel images:', images.length)
    return NextResponse.json(images)
  } catch (error) {
    console.error('❌ Carousel GET Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch carousel images',
        message: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

// Create new carousel image with automatic ordering
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    await connectToDatabase()
    
    const { url, altText, cloudinary_public_id } = await request.json()
    
    if (!url || !altText) {
      return NextResponse.json(
        { error: 'URL and alt text are required' },
        { status: 400 }
      )
    }
    
    // Check for duplicate URLs
    const existingImage = await CarouselImage.findOne({ url })
    if (existingImage) {
      return NextResponse.json(
        { error: 'An image with this URL already exists' },
        { status: 400 }
      )
    }
    
    // Automatically assign the next available order
    const maxOrder = await CarouselImage.findOne(
      { isActive: true },
      { order: 1 }
    ).sort({ order: -1 })
    const nextOrder = maxOrder ? maxOrder.order + 1 : 1
    
    console.log('💾 Creating carousel image with automatic order:', nextOrder)
    const image = await CarouselImage.create({
      url,
      altText,
      order: nextOrder,
      isActive: true,
      cloudinary_public_id: cloudinary_public_id || null
    })
    
    console.log('✅ Carousel image created:', image._id)
    return NextResponse.json(image, { status: 201 })
  } catch (error) {
    console.error('❌ Carousel POST Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized access - admin privileges required' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create carousel image', 
        message: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

// Update carousel image (only URL and alt text, no order changes)
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()
    await connectToDatabase()
    
    const { id, url, altText, isActive, moveDirection } = await request.json()
    
    // Handle move up/down operations
    if (moveDirection) {
      const currentImage = await CarouselImage.findById(id)
      if (!currentImage) {
        return NextResponse.json(
          { error: 'Image not found' },
          { status: 404 }
        )
      }
      
      const currentOrder = currentImage.order
      let targetOrder: number
      
      if (moveDirection === 'up') {
        targetOrder = currentOrder - 1
        if (targetOrder < 1) {
          return NextResponse.json(
            { error: 'Cannot move image further up' },
            { status: 400 }
          )
        }
      } else if (moveDirection === 'down') {
        const maxOrder = await CarouselImage.findOne({}, { order: 1 }).sort({ order: -1 })
        targetOrder = currentOrder + 1
        if (targetOrder > (maxOrder?.order || 1)) {
          return NextResponse.json(
            { error: 'Cannot move image further down' },
            { status: 400 }
          )
        }
      } else {
        return NextResponse.json(
          { error: 'Invalid move direction. Use "up" or "down"' },
          { status: 400 }
        )
      }
      
      // Find the image at the target position
      const targetImage = await CarouselImage.findOne({ order: targetOrder })
      if (!targetImage) {
        return NextResponse.json(
          { error: 'No image found at target position' },
          { status: 404 }
        )
      }
      
      // Swap the orders
      await CarouselImage.findByIdAndUpdate(currentImage._id, { order: targetOrder })
      await CarouselImage.findByIdAndUpdate(targetImage._id, { order: currentOrder })
      
      return NextResponse.json({ success: true, message: `Image moved ${moveDirection}` })
    }
    
    // Handle regular updates (URL, alt text, active status)
    const updateData: Record<string, unknown> = {}
    if (url !== undefined) updateData.url = url
    if (altText !== undefined) updateData.altText = altText
    if (isActive !== undefined) updateData.isActive = isActive
    
    const image = await CarouselImage.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
    
    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(image)
  } catch (error) {
    console.error('Failed to update carousel image:', error)
    return NextResponse.json(
      { error: 'Failed to update carousel image' },
      { status: 500 }
    )
  }
}

// Delete carousel image and automatically reorder
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()
    await connectToDatabase()
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Image ID required' },
        { status: 400 }
      )
    }
    
    // Get the image to be deleted to know its order and public_id
    const imageToDelete = await CarouselImage.findById(id)
    if (!imageToDelete) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }
    
    const deletedOrder = imageToDelete.order
    const cloudinaryPublicId = imageToDelete.cloudinary_public_id
    
    // Delete from Cloudinary if public_id exists
    if (cloudinaryPublicId) {
      try {
        console.log('🗑️ Deleting image from Cloudinary:', cloudinaryPublicId)
        const result = await cloudinary.uploader.destroy(cloudinaryPublicId)
        
        if (result.result === 'ok') {
          console.log('✅ Image deleted from Cloudinary successfully')
        } else {
          console.warn('⚠️ Cloudinary deletion result:', result.result)
        }
      } catch (cloudinaryError) {
        console.warn('⚠️ Error deleting from Cloudinary:', cloudinaryError)
        // Continue with database deletion even if Cloudinary deletion fails
      }
    }
    
    // Delete the image from database
    await CarouselImage.findByIdAndDelete(id)
    
    // Automatically reorder all images that come after the deleted one
    // This shifts all subsequent images down by 1 to fill the gap
    await CarouselImage.updateMany(
      { order: { $gt: deletedOrder } },
      { $inc: { order: -1 } }
    )
    
    console.log(`✅ Deleted image at order ${deletedOrder} and reordered subsequent images`)
    return NextResponse.json({ 
      success: true, 
      message: 'Image deleted and order automatically adjusted',
      cloudinary_deleted: !!cloudinaryPublicId
    })
  } catch (error) {
    console.error('Failed to delete carousel image:', error)
    return NextResponse.json(
      { error: 'Failed to delete carousel image' },
      { status: 500 }
    )
  }
}
