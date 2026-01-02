import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/mongodb'
import { Product, Bid } from '@/lib/models'

// POST - Place a bid on a product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { productId, bidAmount } = await request.json()
    
    if (!productId || !bidAmount) {
      return NextResponse.json(
        { error: 'Product ID and bid amount are required' },
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

    // Check if product has auction
    if (!product.hasAuction) {
      return NextResponse.json(
        { error: 'This product does not have an auction' },
        { status: 400 }
      )
    }

    // Check if auction is active
    if (product.auctionStatus !== 'active') {
      return NextResponse.json(
        { error: 'This auction has ended' },
        { status: 400 }
      )
    }

    // Check if auction time has expired
    if (product.auctionEndTime && new Date(product.auctionEndTime) < new Date()) {
      product.auctionStatus = 'ended'
      await product.save()
      return NextResponse.json(
        { error: 'This auction has ended' },
        { status: 400 }
      )
    }

    // Prevent seller from bidding on their own product
    if (product.userEmail === session.user.email) {
      return NextResponse.json(
        { error: 'You cannot bid on your own product' },
        { status: 403 }
      )
    }

    // Check if bid is higher than current bid
    const currentBid = product.currentBid || product.startingBid || 0
    if (bidAmount <= currentBid) {
      return NextResponse.json(
        { error: `Bid must be higher than current bid of Rs. ${currentBid}` },
        { status: 400 }
      )
    }

    // Mark previous winning bid as not winning
    if (product.highestBidder) {
      await Bid.updateMany(
        { productId, isWinning: true },
        { isWinning: false }
      )
    }

    // Create new bid
    const bid = await Bid.create({
      productId,
      userId: session.user.id,
      userEmail: session.user.email,
      bidAmount,
      isWinning: true,
    })

    // Update product with new highest bid
    product.currentBid = bidAmount
    product.highestBidder = session.user.id
    product.highestBidderEmail = session.user.email
    product.totalBids = (product.totalBids || 0) + 1
    await product.save()

    return NextResponse.json({
      success: true,
      bid,
      product: {
        _id: product._id,
        currentBid: product.currentBid,
        highestBidder: product.highestBidder,
        highestBidderEmail: product.highestBidderEmail,
        totalBids: product.totalBids,
      }
    })
  } catch (error) {
    console.error('Error placing bid:', error)
    return NextResponse.json(
      { error: 'Failed to place bid' },
      { status: 500 }
    )
  }
}

// GET - Get all bids for a product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    await connectToDatabase()
    
    const bids = await Bid.find({ productId })
      .sort({ bidAmount: -1, createdAt: -1 })
      .lean()
    
    return NextResponse.json(bids)
  } catch (error) {
    console.error('Error fetching bids:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bids' },
      { status: 500 }
    )
  }
}
