import { NextResponse } from 'next/server'
import { getPublicNewArrivals } from '@/lib/public-content'

export const revalidate = 300

// Get active new arrival products for public display
export async function GET() {
  try {
    console.log('Getting active new arrival products...')
    const products = await getPublicNewArrivals()
    
    console.log('Found active new arrival products:', products.length)
    return NextResponse.json(products)
  } catch (error) {
    console.error('New Arrivals Public GET Error:', {
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
