import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { pool } from '@/lib/database'
import { Product } from '@/lib/models'

export async function GET() {
  try {
    try {
      await requireAdmin()
    } catch {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const products = await Product.find({ hasAuction: true, auctionStatus: 'active' })
    const activeAuctions = products.filter((product) => product.isActive !== false)

    if (activeAuctions.length === 0) {
      return NextResponse.json([])
    }

    const productIds = activeAuctions.map((product) => product.id || product._id).filter(Boolean) as string[]

    const [bidStatsResult, banStatsResult] = await Promise.all([
      pool.query(
        `SELECT product_id, COUNT(*)::int AS bid_count, COUNT(DISTINCT user_id)::int AS bidder_count
         FROM bids
         WHERE product_id = ANY($1::uuid[]) AND is_active = true
         GROUP BY product_id`,
        [productIds]
      ),
      pool.query(
        `SELECT product_id, COUNT(*)::int AS banned_count
         FROM auction_participant_bans
         WHERE product_id = ANY($1::uuid[])
         GROUP BY product_id`,
        [productIds]
      )
    ])

    const bidStats = new Map(
      bidStatsResult.rows.map((row) => [row.product_id, { bidCount: row.bid_count, bidderCount: row.bidder_count }])
    )
    const banStats = new Map(
      banStatsResult.rows.map((row) => [row.product_id, row.banned_count])
    )

    const auctions = activeAuctions
      .map((product) => {
        const productId = product.id || product._id
        const stats = productId ? bidStats.get(productId) : null
        const bannedCount = productId ? banStats.get(productId) || 0 : 0
        const fallbackBidderCount = product.highestBidder ? 1 : 0
        const fallbackBidCount = product.totalBids ?? fallbackBidderCount

        return {
          id: productId,
          title: product.title,
          description: product.description,
          imageUrl: product.imageUrl,
          sellerEmail: product.userEmail,
          auctionStatus: product.auctionStatus,
          auctionEndTime: product.auctionEndTime,
          startingBid: product.startingBid || 0,
          currentBid: product.currentBid || 0,
          highestBidder: product.highestBidder,
          highestBidderEmail: product.highestBidderEmail,
          totalBids: stats?.bidCount ?? fallbackBidCount,
          activeBidderCount: stats?.bidderCount ?? fallbackBidderCount,
          bannedCount,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        }
      })
      .sort((a, b) => {
        const aTime = a.auctionEndTime ? new Date(a.auctionEndTime).getTime() : Number.MAX_SAFE_INTEGER
        const bTime = b.auctionEndTime ? new Date(b.auctionEndTime).getTime() : Number.MAX_SAFE_INTEGER
        return aTime - bTime
      })

    return NextResponse.json(auctions)
  } catch (error) {
    console.error('Error fetching admin auctions:', error)
    return NextResponse.json({ error: 'Failed to fetch auctions' }, { status: 500 })
  }
}
