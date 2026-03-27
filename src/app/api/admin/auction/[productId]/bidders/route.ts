import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { AuctionParticipantBan, Bid, Product } from '@/lib/models'

export async function GET(
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

    const [bids, bans] = await Promise.all([
      Bid.find({ productId }),
      AuctionParticipantBan.find({ productId })
    ])

    const sortedBids = bids.sort((a, b) => {
      if (b.bidAmount !== a.bidAmount) {
        return b.bidAmount - a.bidAmount
      }

      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    })

    const bannedSet = new Set(bans.map((ban) => ban.userId))

    const fullHistory = sortedBids.map((bid) => ({
      id: bid.id || bid._id,
      productId: bid.productId,
      userId: bid.userId,
      userEmail: bid.userEmail,
      bidAmount: bid.bidAmount,
      isWinning: bid.isWinning || false,
      isActive: bid.isActive !== false,
      isBanned: bannedSet.has(bid.userId),
      createdAt: bid.createdAt
    }))

    const groupedMap = new Map<string, {
      userId: string
      userEmail: string
      highestBid: number
      latestBidAmount: number
      totalBidEntries: number
      activeBidEntries: number
      latestBidAt: Date | null
      isCurrentWinner: boolean
      isBanned: boolean
    }>()

    for (const bid of sortedBids) {
      const key = bid.userId
      const existing = groupedMap.get(key)
      const isActive = bid.isActive !== false
      const createdAt = bid.createdAt ? new Date(bid.createdAt) : null
      const isCurrentWinner = product.highestBidder === bid.userId
      const isBanned = bannedSet.has(bid.userId)

      if (!existing) {
        groupedMap.set(key, {
          userId: bid.userId,
          userEmail: bid.userEmail,
          highestBid: bid.bidAmount,
          latestBidAmount: bid.bidAmount,
          totalBidEntries: 1,
          activeBidEntries: isActive ? 1 : 0,
          latestBidAt: createdAt,
          isCurrentWinner,
          isBanned
        })
        continue
      }

      existing.totalBidEntries += 1
      if (isActive) {
        existing.activeBidEntries += 1
      }
      if (bid.bidAmount > existing.highestBid) {
        existing.highestBid = bid.bidAmount
      }
      if (createdAt && (!existing.latestBidAt || createdAt > existing.latestBidAt)) {
        existing.latestBidAt = createdAt
        existing.latestBidAmount = bid.bidAmount
      }
      if (isCurrentWinner) {
        existing.isCurrentWinner = true
      }
      if (isBanned) {
        existing.isBanned = true
      }
    }

    const groupedUsers = Array.from(groupedMap.values()).sort((a, b) => b.highestBid - a.highestBid)

    return NextResponse.json({
      auction: {
        id: product.id || product._id,
        title: product.title,
        auctionStatus: product.auctionStatus,
        auctionEndTime: product.auctionEndTime,
        currentBid: product.currentBid,
        highestBidder: product.highestBidder,
        highestBidderEmail: product.highestBidderEmail,
        totalBids: product.totalBids
      },
      fullHistory,
      groupedUsers,
      bans
    })
  } catch (error) {
    console.error('Error fetching auction bidders:', error)
    return NextResponse.json({ error: 'Failed to fetch bidders' }, { status: 500 })
  }
}
