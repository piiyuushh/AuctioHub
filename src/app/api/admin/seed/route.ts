import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { CarouselImage } from '@/lib/models'
import { requireAdmin } from '@/lib/admin'

export async function POST() {
  try {
    await requireAdmin()
    await connectToDatabase()
    
    // Check if carousel images already exist
    const existingCount = await CarouselImage.countDocuments()
    
    if (existingCount > 0) {
      return NextResponse.json({
        success: false,
        message: `Database already has ${existingCount} carousel images. Use the admin panel to manage them.`,
        existingCount
      })
    }
    
    // Create initial carousel images
    const initialImages = [
      {
        url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop',
        altText: 'Shopping Center - Discover Amazing Products',
        order: 1,
        isActive: true
      },
      {
        url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&h=400&fit=crop',
        altText: 'Fashion Collection - Latest Trends',
        order: 2,
        isActive: true
      },
      {
        url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=400&fit=crop',
        altText: 'Electronics Store - Premium Gadgets',
        order: 3,
        isActive: true
      },
      {
        url: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1200&h=400&fit=crop',
        altText: 'Home & Living - Transform Your Space',
        order: 4,
        isActive: true
      }
    ]
    
    console.log('🌱 Creating initial carousel images...')
    const createdImages = await CarouselImage.insertMany(initialImages)
    
    console.log(`✅ Successfully created ${createdImages.length} initial carousel images`)
    
    return NextResponse.json({
      success: true,
      message: `Successfully created ${createdImages.length} initial carousel images`,
      images: createdImages
    })
  } catch (error) {
    console.error('Seed Error:', error)
    
    if (error instanceof Error && error.message.includes('Admin access required')) {
      return NextResponse.json(
        { error: 'Unauthorized access - admin privileges required' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to seed initial data' },
      { status: 500 }
    )
  }
}
