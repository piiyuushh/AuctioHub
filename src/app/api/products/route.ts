import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/mongodb'
import { Product } from '@/lib/models'

// GET - Fetch all active products (public) or single product by ID
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('id')
    
    // If ID is provided, fetch single product
    if (productId) {
      const product = await Product.findById(productId).lean()
      
      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(product)
    }
    
    // Otherwise, fetch all products
    const products = await Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean()
    
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST - Create new product (authenticated users only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { 
      title, 
      description, 
      imageUrl, 
      cloudinary_public_id,
      hasAuction,
      auctionDurationHours,
      startingBid 
    } = await request.json()
    
    if (!title || !description || !imageUrl) {
      return NextResponse.json(
        { error: 'Title, description, and image are required' },
        { status: 400 }
      )
    }

    await connectToDatabase()
    
    const productData: any = {
      userId: session.user.id,
      userEmail: session.user.email,
      title,
      description,
      imageUrl,
      cloudinary_public_id: cloudinary_public_id || null,
      isActive: true,
      hasAuction: hasAuction || false,
      auctionStatus: hasAuction ? 'active' : 'none',
    }

    // Add auction fields if auction is enabled
    if (hasAuction) {
      const durationHours = auctionDurationHours || 24
      productData.auctionEndTime = new Date(Date.now() + durationHours * 60 * 60 * 1000)
      productData.startingBid = startingBid || 0
      productData.currentBid = startingBid || 0
    }

    const product = await Product.create(productData)

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

// PUT - Update product (owner only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { 
      productId, 
      title, 
      description, 
      imageUrl, 
      cloudinary_public_id,
      endAuction,
      extendAuction,
      extensionHours 
    } = await request.json()
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    await connectToDatabase()
    
    const product = await Product.findById(productId)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if user owns this product
    if (product.userEmail !== session.user.email) {
      return NextResponse.json(
        { error: 'You can only edit your own products' },
        { status: 403 }
      )
    }

    // Handle auction end
    if (endAuction && product.hasAuction) {
      product.auctionStatus = 'ended'
      product.auctionEndTime = new Date()
    }

    // Handle auction extension
    if (extendAuction && product.hasAuction && product.auctionStatus === 'active') {
      const currentEndTime = product.auctionEndTime || new Date()
      const hours = extensionHours || 24
      product.auctionEndTime = new Date(currentEndTime.getTime() + hours * 60 * 60 * 1000)
    }

    // Update other fields
    if (title) product.title = title
    if (description) product.description = description
    if (imageUrl) product.imageUrl = imageUrl
    if (cloudinary_public_id !== undefined) product.cloudinary_public_id = cloudinary_public_id
    
    await product.save()

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE - Delete product (owner only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('id')
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    await connectToDatabase()
    
    const product = await Product.findById(productId)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if user owns this product
    if (product.userEmail !== session.user.email) {
      return NextResponse.json(
        { error: 'You can only delete your own products' },
        { status: 403 }
      )
    }

    await Product.findByIdAndDelete(productId)

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
