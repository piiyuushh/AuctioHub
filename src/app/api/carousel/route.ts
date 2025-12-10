import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { CarouselImage } from '@/lib/models'

export async function GET() {
  try {
    await connectToDatabase()
    
    // Public endpoint - no authentication required
    // Only return active images ordered by their order field
    const images = await CarouselImage.find(
      { isActive: true },
      'url altText order isActive' // Only select needed fields
    ).sort({ order: 1 })
    
    return NextResponse.json(images)
  } catch (error) {
    console.error('Public carousel GET Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json(
      { 
        error: 'Server error', 
        message: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Internal server error' : 'Internal server error'
      },
      { status: 500 }
    )
  }
}
