import { NextResponse } from 'next/server'
import { getPublicCarouselImages } from '@/lib/public-content'

export const revalidate = 300

export async function GET() {
  try {
    const images = await getPublicCarouselImages()
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
