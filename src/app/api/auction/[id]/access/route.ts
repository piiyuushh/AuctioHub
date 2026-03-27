import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AuctionParticipantBan, Product } from '@/lib/models'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || !session.user.id) {
      return NextResponse.json({ error: 'Authentication required', allowed: false }, { status: 401 })
    }

    const { id: productId } = await params

    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json({ error: 'Auction not found', allowed: false }, { status: 404 })
    }

    const isBanned = await AuctionParticipantBan.exists(productId, session.user.id)

    if (isBanned) {
      return NextResponse.json(
        {
          error: 'You were removed from this auction session by an administrator',
          allowed: false
        },
        { status: 403 }
      )
    }

    return NextResponse.json({ allowed: true })
  } catch (error) {
    console.error('Error checking auction access:', error)
    return NextResponse.json({ error: 'Failed to validate auction access', allowed: false }, { status: 500 })
  }
}
