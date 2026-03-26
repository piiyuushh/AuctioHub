import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { pool } from '@/lib/database'
import { AuctionHistory, User } from '@/lib/models'

function formatRelativeTime(date: Date | null): string {
  if (!date) return 'just now'

  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMinutes < 1) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await User.findOne({ email: session.user.email.toLowerCase() })
    if (!dbUser?.id) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = dbUser.id

    const [
      activeBidsResult,
      activeListingsResult,
      bidAverageResult,
      bidTimeResult,
      outbidResult,
      endingSoonResult,
    ] = await Promise.all([
      pool.query(
        `SELECT COUNT(*)::int AS count
         FROM bids b
         INNER JOIN products p ON p.id = b.product_id
         WHERE b.user_id = $1
           AND p.auction_status = 'active'
           AND p.highest_bidder = $1`,
        [userId]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS count
         FROM products
         WHERE user_id = $1 AND is_active = true`,
        [userId]
      ),
      pool.query(
        `SELECT COALESCE(AVG(bid_amount), 0)::numeric AS avg_bid_amount
         FROM bids
         WHERE user_id = $1`,
        [userId]
      ),
      pool.query(
        `SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600), 0)::numeric AS avg_bid_hours
         FROM bids
         WHERE user_id = $1`,
        [userId]
      ),
      pool.query(
        `SELECT p.title, b.updated_at
         FROM bids b
         INNER JOIN products p ON p.id = b.product_id
         WHERE b.user_id = $1
           AND p.auction_status = 'active'
           AND p.highest_bidder IS NOT NULL
           AND p.highest_bidder != $1
         ORDER BY b.updated_at DESC
         LIMIT 3`,
        [userId]
      ),
      pool.query(
        `SELECT p.title, p.auction_end_time
         FROM bids b
         INNER JOIN products p ON p.id = b.product_id
         WHERE b.user_id = $1
           AND p.auction_status = 'active'
           AND p.auction_end_time IS NOT NULL
           AND p.auction_end_time <= NOW() + INTERVAL '24 hours'
         ORDER BY p.auction_end_time ASC
         LIMIT 3`,
        [userId]
      ),
    ])

    const wonStats = await AuctionHistory.getUserWonStats(userId)

    const participatedEndedResult = await pool.query(
      `SELECT COUNT(DISTINCT p.id)::int AS count
       FROM bids b
       INNER JOIN products p ON p.id = b.product_id
       WHERE b.user_id = $1
         AND p.auction_status = 'ended'`,
      [userId]
    )

    const endedParticipations = participatedEndedResult.rows[0]?.count || 0
    const lostEndedAuctionsParticipated = Math.max(endedParticipations - wonStats.auctionsWon, 0)
    const denominator = wonStats.auctionsWon + lostEndedAuctionsParticipated
    const successRate = denominator > 0 ? (wonStats.auctionsWon / denominator) * 100 : 0

    const alerts: Array<{ type: 'info' | 'success' | 'warning'; title: string; subtitle: string }> = []

    for (const outbid of outbidResult.rows) {
      alerts.push({
        type: 'info',
        title: `Outbid on ${outbid.title}`,
        subtitle: formatRelativeTime(outbid.updated_at ? new Date(outbid.updated_at) : null),
      })
    }

    const recentWins = await AuctionHistory.find({ winnerUserId: userId, paymentType: 'full' }, { limit: 3 })
    for (const win of recentWins) {
      alerts.push({
        type: 'success',
        title: `You won ${win.productTitle}`,
        subtitle: formatRelativeTime(win.conductedAt ? new Date(win.conductedAt) : null),
      })
    }

    for (const endingSoon of endingSoonResult.rows) {
      const endTime = endingSoon.auction_end_time ? new Date(endingSoon.auction_end_time) : null
      alerts.push({
        type: 'warning',
        title: `${endingSoon.title} ends soon`,
        subtitle: endTime ? `Ends at ${endTime.toLocaleString()}` : 'Auction ending soon',
      })
    }

    const dedupedAlerts = Array.from(new Map(alerts.map(alert => [alert.title, alert])).values()).slice(0, 6)

    return NextResponse.json({
      activeBids: activeBidsResult.rows[0]?.count || 0,
      activeListings: activeListingsResult.rows[0]?.count || 0,
      auctionsWon: wonStats.auctionsWon,
      totalSpent: wonStats.totalSpent,
      successRate,
      avgBidAmount: parseFloat(bidAverageResult.rows[0]?.avg_bid_amount || 0),
      avgBidHours: parseFloat(bidTimeResult.rows[0]?.avg_bid_hours || 0),
      recentAlerts: dedupedAlerts,
    })
  } catch (error) {
    console.error('Error fetching user dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
