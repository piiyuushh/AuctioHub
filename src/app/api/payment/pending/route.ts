import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { pool } from '@/lib/database'

interface PendingPaymentRow {
  id: string
  title: string
  image_url: string
  current_bid: string | number | null
  auction_end_time: string | null
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const normalizedEmail = session.user.email.trim().toLowerCase()

    const result = await pool.query<PendingPaymentRow>(
      `SELECT
         p.id,
         p.title,
         p.image_url,
         p.current_bid,
         p.auction_end_time
       FROM products p
       WHERE LOWER(p.highest_bidder_email) = $1
         AND p.auction_status = 'ended'
         AND p.is_active = true
         AND p.has_auction = true
         AND NOT EXISTS (
           SELECT 1
           FROM auction_history ah
           WHERE ah.product_id = p.id
             AND ah.payment_type IN ('full', 'penalty')
         )
       ORDER BY p.updated_at DESC, p.created_at DESC`,
      [normalizedEmail]
    )

    const pending = result.rows.map((row) => ({
      productId: row.id,
      title: row.title,
      imageUrl: row.image_url,
      winningBid: Number(row.current_bid || 0),
      auctionEndTime: row.auction_end_time,
      paymentUrl: `/payment/${row.id}`,
    }))

    return NextResponse.json({ pending })
  } catch (error) {
    console.error('Error fetching pending payments:', error)
    return NextResponse.json({ error: 'Failed to fetch pending payments' }, { status: 500 })
  }
}
