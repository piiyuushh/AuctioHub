import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { AuctionHistory } from '@/lib/models'

export async function GET() {
  try {
    try {
      await requireAdmin()
    } catch {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const summary = await AuctionHistory.getAdminSummary(6)

    return NextResponse.json({
      totalAuctionsConducted: summary.totalAuctionsConducted,
      fullPaymentCount: summary.fullPaymentCount,
      penaltyCount: summary.penaltyCount,
      auctionsThisMonth: summary.auctionsThisMonth,
      totalFullPaymentValue: summary.totalFullPaymentValue,
      latestAuctions: summary.latest.map(item => ({
        id: item.id,
        productId: item.productId,
        productTitle: item.productTitle,
        productImageUrl: item.productImageUrl,
        winnerEmail: item.winnerEmail,
        paymentType: item.paymentType,
        outcomeStatus: item.outcomeStatus,
        winningBidAmount: item.winningBidAmount,
        conductedAt: item.conductedAt,
      })),
    })
  } catch (error) {
    console.error('Error fetching admin auction stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch auction stats' },
      { status: 500 }
    )
  }
}
