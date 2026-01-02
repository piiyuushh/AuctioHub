import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/mongodb'
import { Product } from '@/lib/models'

// GET - Fetch current user's products
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    await connectToDatabase()
    
    const products = await Product.find({ userEmail: session.user.email })
      .sort({ createdAt: -1 })
      .lean()
    
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching user products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
