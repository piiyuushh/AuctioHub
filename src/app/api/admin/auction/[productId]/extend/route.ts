import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { Product } from '@/lib/models'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    try {
      await requireAdmin()
    } catch {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { productId } = await params
    const { minutesToAdd } = await request.json()

    if (!minutesToAdd || !Number.isFinite(minutesToAdd) || minutesToAdd <= 0) {
      return NextResponse.json({ error: 'minutesToAdd must be a positive number' }, { status: 400 })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json({ error: 'Auction not found' }, { status: 404 })
    }

    if (!product.hasAuction || product.auctionStatus !== 'active') {
      return NextResponse.json({ error: 'Only active auctions can be extended' }, { status: 400 })
    }

    const now = Date.now()
    const baseEnd = product.auctionEndTime ? new Date(product.auctionEndTime).getTime() : now
    const newEndTime = new Date(Math.max(baseEnd, now) + minutesToAdd * 60 * 1000)

    const updated = await Product.findByIdAndUpdate(productId, {
      auctionEndTime: newEndTime
    })

    return NextResponse.json({
      success: true,
      message: `Auction extended by ${minutesToAdd} minutes`,
      auction: {
        id: updated?.id || productId,
        auctionEndTime: updated?.auctionEndTime || newEndTime
      }
    })
  } catch (error) {
    console.error('Error extending auction:', error)
    return NextResponse.json({ error: 'Failed to extend auction' }, { status: 500 })
  }
}
