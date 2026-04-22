import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { pool } from '@/lib/database'

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 50

export async function GET(request: NextRequest) {
  try {
    try {
      await requireAdmin()
    } catch {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(Number(searchParams.get('page') || DEFAULT_PAGE), 1)
    const pageSize = Math.min(
      Math.max(Number(searchParams.get('pageSize') || DEFAULT_PAGE_SIZE), 1),
      MAX_PAGE_SIZE
    )
    const paymentType = searchParams.get('paymentType')
    const search = searchParams.get('search')?.trim()
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')

    const filters: string[] = []
    const params: unknown[] = []
    let paramCount = 1

    if (paymentType === 'full' || paymentType === 'penalty') {
      filters.push(`ah.payment_type = $${paramCount}`)
      params.push(paymentType)
      paramCount++
    }

    if (search) {
      filters.push(`(ah.product_title ILIKE $${paramCount} OR ah.winner_email ILIKE $${paramCount})`)
      params.push(`%${search}%`)
      paramCount++
    }

    if (fromDate) {
      filters.push(`ah.conducted_at >= $${paramCount}`)
      params.push(new Date(fromDate))
      paramCount++
    }

    if (toDate) {
      filters.push(`ah.conducted_at <= $${paramCount}`)
      params.push(new Date(toDate))
      paramCount++
    }

    const whereSql = filters.length ? `WHERE ${filters.join(' AND ')}` : ''

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM auction_history ah
       ${whereSql}`,
      params
    )

    const offset = (page - 1) * pageSize

    const dataResult = await pool.query(
      `SELECT
        ah.id,
        ah.product_id,
        ah.product_title,
        ah.product_image_url,
        ah.product_category,
        ah.winner_email,
        ah.winning_bid_amount,
        ah.payment_type,
        ah.outcome_status,
        ah.conducted_at
       FROM auction_history ah
       ${whereSql}
       ORDER BY ah.conducted_at DESC, ah.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, pageSize, offset]
    )

    const total = countResult.rows[0]?.total || 0

    return NextResponse.json({
      items: dataResult.rows.map((row) => ({
        id: row.id,
        productId: row.product_id,
        productTitle: row.product_title,
        productImageUrl: row.product_image_url,
        category: row.product_category,
        winnerEmail: row.winner_email,
        winningBidAmount: Number(row.winning_bid_amount || 0),
        paymentType: row.payment_type,
        outcomeStatus: row.outcome_status,
        conductedAt: row.conducted_at,
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(Math.ceil(total / pageSize), 1),
      },
    })
  } catch (error) {
    console.error('Error fetching auction sessions:', error)
    return NextResponse.json({ error: 'Failed to fetch auction sessions' }, { status: 500 })
  }
}
