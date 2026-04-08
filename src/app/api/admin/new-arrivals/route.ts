import { NextRequest, NextResponse } from 'next/server'
import { NewArrival } from '@/lib/models'
import { requireAdmin } from '@/lib/admin'

// Get all new arrival products (both active and inactive for admin)
export async function GET() {
  try {
    console.log('Getting new arrival products...')
    
    // For admin endpoint, return both active and inactive products
    const products = await NewArrival.find({})
    // Already sorted by order in the model
      
    
    console.log('Found new arrival products:', products.length)
    return NextResponse.json(products)
  } catch (error) {
    console.error('New Arrivals GET Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch new arrival products',
        message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

// Create new arrival product with automatic ordering (max 4 products)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    
    const { title, description, imageUrl, link } = await request.json()
    
    if (!title || !description || !imageUrl) {
      return NextResponse.json(
        { error: 'Title, description, and image URL are required' },
        { status: 400 }
      )
    }
    
    // Check if we already have 4 products (maximum limit)
    const productCount = await NewArrival.countDocuments({})
    if (productCount >= 4) {
      return NextResponse.json(
        { error: 'Maximum of 4 new arrival products allowed. Please delete an existing product first.' },
        { status: 400 }
      )
    }
    
    // Get the highest order number and add 1
    const lastProduct = await NewArrival.findOne({})
    const nextOrder = lastProduct ? lastProduct.order + 1 : 1
    
    const newProduct = await NewArrival.create({
      title,
      description,
      imageUrl,
      link: link || '/category',
      order: nextOrder,
      isActive: true
    })
    
    console.log('Created new arrival product:', newProduct._id)
    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error('New Arrivals POST Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to create new arrival product',
        message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

// Update new arrival product
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()
    
    const { id, title, description, imageUrl, link, order, isActive } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }
    
    const updateData: {
      title?: string;
      description?: string;
      imageUrl?: string;
      link?: string;
      order?: number;
      isActive?: boolean;
    } = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (link !== undefined) updateData.link = link
    if (order !== undefined) updateData.order = order
    if (isActive !== undefined) updateData.isActive = isActive
    
    const updatedProduct = await NewArrival.findByIdAndUpdate(
      id,
      updateData
    )
    
    if (!updatedProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    console.log('Updated new arrival product:', updatedProduct._id)
    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('New Arrivals PUT Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to update new arrival product',
        message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

// Delete new arrival product
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }
    
    await NewArrival.findByIdAndDelete(id)
    
    console.log('Deleted new arrival product:', id)
    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('New Arrivals DELETE Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to delete new arrival product',
        message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : 'Internal server error'
      },
      { status: 500 }
    )
  }
}
