import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'
import { NewArrival } from '@/lib/models'

// Get active new arrival products for public display
export async function GET() {
  try {
    console.log('🔍 Getting active new arrival products...')
    
    // Only return active products for public endpoint
    const allProducts = await NewArrival.find({ isActive: true })
    // Already sorted by order in the model
    const products = allProducts.slice(0, 4) // Limit to 4 products as shown in the component
    
    console.log('✅ Found active new arrival products:', products.length)
    return NextResponse.json(products)
  } catch (error) {
    console.error('❌ New Arrivals Public GET Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch new arrival products',
        message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : 'Internal server error'
      },
      { status: 500 }
    )
  }
}
