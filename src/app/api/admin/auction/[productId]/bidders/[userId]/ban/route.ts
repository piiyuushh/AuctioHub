import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireAdmin } from '@/lib/admin'
import { pool } from '@/lib/database'
import { AuctionParticipantBan, Bid, Product, User } from '@/lib/models'
import { emitAuctionWon, emitUserRemovedFromAuction } from '@/lib/notifications'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; userId: string }> }
) {
  try {
    try {
      await requireAdmin()
    } catch {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { productId, userId } = await params
    const body = await request.json().catch(() => ({}))
    const reason = typeof body.reason === 'string' ? body.reason : 'Removed by admin during live auction'

    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json({ error: 'Auction not found' }, { status: 404 })
    }

    if (!product.hasAuction || product.auctionStatus !== 'active') {
      return NextResponse.json({ error: 'This auction is not active' }, { status: 400 })
    }

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: 'Bidder not found' }, { status: 404 })
    }

    await AuctionParticipantBan.upsert({
      productId,
      userId,
      userEmail: user.email,
      bannedByEmail: session.user.email,
      reason
    })

    await Bid.updateMany(
      { productId, userId },
      { $set: { isActive: false, isWinning: false } }
    )

    await Bid.updateMany(
      { productId },
      { $set: { isWinning: false } }
    )

    const nextWinnerResult = await pool.query(
      `SELECT b.id, b.user_id, b.user_email, b.bid_amount
       FROM bids b
       WHERE b.product_id = $1
         AND b.is_active = true
         AND NOT EXISTS (
           SELECT 1 FROM auction_participant_bans apb
           WHERE apb.product_id = b.product_id
             AND apb.user_id = b.user_id
         )
       ORDER BY b.bid_amount DESC, b.created_at DESC
       LIMIT 1`,
      [productId]
    )

    const activeBidCountResult = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM bids b
       WHERE b.product_id = $1
         AND b.is_active = true
         AND NOT EXISTS (
           SELECT 1 FROM auction_participant_bans apb
           WHERE apb.product_id = b.product_id
             AND apb.user_id = b.user_id
         )`,
      [productId]
    )

    const nextWinner = nextWinnerResult.rows[0]
    const totalBids = activeBidCountResult.rows[0]?.count || 0

    if (nextWinner) {
      await Bid.updateMany(
        { _id: nextWinner.id },
        { $set: { isWinning: true } }
      )

      await Product.findByIdAndUpdate(productId, {
        currentBid: parseFloat(nextWinner.bid_amount),
        highestBidder: nextWinner.user_id,
        highestBidderEmail: nextWinner.user_email,
        totalBids
      })
    } else {
      await Product.findByIdAndUpdate(productId, {
        currentBid: product.startingBid || 0,
        highestBidder: null,
        highestBidderEmail: null,
        totalBids: 0
      })
    }

    const updatedAuction = await Product.findById(productId)

    await emitUserRemovedFromAuction({
      product,
      userId,
      userEmail: user.email,
      reason,
    })

    if (updatedAuction) {
      await emitAuctionWon(updatedAuction)
    }

    return NextResponse.json({
      success: true,
      message: `User ${user.email} has been removed and banned from this auction`,
      auction: updatedAuction
    })
  } catch (error) {
    console.error('Error banning auction bidder:', error)
    return NextResponse.json({ error: 'Failed to remove bidder' }, { status: 500 })
  }
}
