import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Product, Bid, AuctionParticipantBan } from '@/lib/models'
import { finalizeAuctionIfExpired } from '@/lib/auction-finalization'

// POST - Place a bid on a product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || !session.user.id) {
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

    
    const product = await Product.findById(productId)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const isBanned = await AuctionParticipantBan.exists(productId, session.user.id)
    if (isBanned) {
      return NextResponse.json(
        { error: 'You were removed from this auction session by an administrator' },
        { status: 403 }
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
    const finalized = await finalizeAuctionIfExpired(product, 'products:bid')
    if (finalized.auctionStatus === 'ended') {
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
    await Product.findByIdAndUpdate(productId, {
      currentBid: bidAmount,
      highestBidder: session.user.id,
      highestBidderEmail: session.user.email,
      $inc: { totalBids: 1 }
    })

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

    
    const bids = await Bid.find({ productId })
    // Sort in JavaScript since PostgreSQL model returns array
    const sortedBids = bids.sort((a, b) => {
      if (b.bidAmount !== a.bidAmount) {
        return b.bidAmount - a.bidAmount
      }
      return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    })
    
    return NextResponse.json(sortedBids)
  } catch (error) {
    console.error('Error fetching bids:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bids' },
      { status: 500 }
    )
  }
}
