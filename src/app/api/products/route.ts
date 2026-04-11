import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Product, type IProduct } from '@/lib/models'
import { finalizeAuctionIfExpired, finalizeExpiredAuctionsForList } from '@/lib/auction-finalization'
import { emitAuctionEnded, emitAuctionStarted, emitAuctionWon } from '@/lib/notifications'

const VALID_CATEGORIES = [
  'electronics',
  'collectibles',
  'luxury goods',
  'real estate and property',
  'furniture',
] as const

// GET - Fetch all active products (public) or single product by ID
export async function GET(request: NextRequest) {
  try {
    
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('id')
    const search = searchParams.get('search')?.trim() || undefined
    const category = searchParams.get('category')?.trim() || undefined
    
    // If ID is provided, fetch single product
    if (productId) {
      const product = await Product.findById(productId)

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }

      const finalizedProduct = await finalizeAuctionIfExpired(product, 'products:get-single')
      return NextResponse.json(finalizedProduct)
    }

    // Otherwise, fetch all products
    const productQuery: Record<string, unknown> = { isActive: true }
    if (search) productQuery.search = search
    if (category) productQuery.category = category

    let allProducts = await Product.find(productQuery)
    const finalizedAny = await finalizeExpiredAuctionsForList(allProducts, 'products:get-list')
    if (finalizedAny) {
      allProducts = await Product.find(productQuery)
    }

    const products = allProducts.sort((a, b) =>
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    )

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
      category,
      cloudinary_public_id,
      hasAuction,
      auctionDurationHours,
      startingBid 
    } = await request.json()
    
    if (!title || !description || !imageUrl || !category) {
      return NextResponse.json(
        { error: 'Title, description, image, and category are required' },
        { status: 400 }
      )
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category value' },
        { status: 400 }
      )
    }

    
    const productData: Partial<IProduct> = {
      userId: session.user.id,
      userEmail: session.user.email,
      title,
      description,
      imageUrl,
      category,
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

    if (product.hasAuction) {
      await emitAuctionStarted(product)
    }

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
      category,
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

    const wasActiveAuction = product.hasAuction && product.auctionStatus === 'active'

    // Update other fields
    const updateData: Partial<IProduct> = {}
    if (title) updateData.title = title
    if (description) updateData.description = description
    if (imageUrl) updateData.imageUrl = imageUrl
    if (category) {
      if (!VALID_CATEGORIES.includes(category)) {
        return NextResponse.json(
          { error: 'Invalid category value' },
          { status: 400 }
        )
      }
      updateData.category = category
    }
    if (cloudinary_public_id !== undefined) updateData.cloudinary_public_id = cloudinary_public_id

    // Handle auction end
    if (endAuction && product.hasAuction) {
      updateData.auctionStatus = 'ended'
      updateData.auctionEndTime = new Date()
    }

    // Handle auction extension
    if (extendAuction && product.hasAuction && product.auctionStatus === 'active') {
      const currentEndTime = product.auctionEndTime || new Date()
      const hours = extensionHours || 24
      updateData.auctionEndTime = new Date(currentEndTime.getTime() + hours * 60 * 60 * 1000)
    }

    if (Object.keys(updateData).length > 0) {
      await Product.findByIdAndUpdate(productId, updateData)
    }

    const updatedProduct = await Product.findById(productId)

    if (updatedProduct && endAuction && wasActiveAuction && updatedProduct.auctionStatus === 'ended') {
      await Promise.all([
        emitAuctionEnded(updatedProduct, 'products:put-endAuction'),
        emitAuctionWon(updatedProduct),
      ])
    }

    return NextResponse.json(updatedProduct)
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
