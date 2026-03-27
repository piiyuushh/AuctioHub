import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { AuctionParticipantBan, Bid, Product } from '@/lib/models'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    try {
      await requireAdmin()
    } catch {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { productId } = await params

    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json({ error: 'Auction not found' }, { status: 404 })
    }

    await Promise.all([
      Bid.updateMany(
        { productId },
        { $set: { isActive: false, isWinning: false } }
      ),
      Product.findByIdAndUpdate(productId, {
        auctionStatus: 'none',
        hasAuction: false,
        isActive: false,
        auctionEndTime: null,
        highestBidder: null,
        highestBidderEmail: null,
        currentBid: product.startingBid || 0,
        totalBids: 0
      }),
      AuctionParticipantBan.clearByProductId(productId)
    ])

    const updated = await Product.findById(productId)

    return NextResponse.json({
      success: true,
      message: 'Auction cancelled and listing was unpublished',
      auction: updated
    })
  } catch (error) {
    console.error('Error cancelling auction:', error)
    return NextResponse.json({ error: 'Failed to cancel auction' }, { status: 500 })
  }
}
