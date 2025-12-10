import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { NewArrival } from '@/lib/models'
import { requireAdmin } from '@/lib/admin'

export async function POST() {
  try {
    await requireAdmin()
    await connectToDatabase()
    
    // Check if data already exists
    const existingProducts = await NewArrival.countDocuments()
    if (existingProducts > 0) {
      return NextResponse.json({ 
        message: 'New arrivals data already exists',
        count: existingProducts 
      })
    }
    
    // Default new arrival products
    const defaultProducts = [
      {
        title: "PlayStation 5",
        description: "Black and White version of the PS5 coming out on sale.",
        imageUrl: "/assets/new arrivals/ps5.png",
        link: "/category",
        order: 1,
        isActive: true,
      },
      {
        title: "Women's Collections",
        description: "Featured women collections that give you another vibe.",
        imageUrl: "/assets/new arrivals/womens collection.png",
        link: "/category",
        order: 2,
        isActive: true,
      },
      {
        title: "Speakers",
        description: "Amazon wireless speakers",
        imageUrl: "/assets/new arrivals/speaker.png",
        link: "/category",
        order: 3,
        isActive: true,
      },
      {
        title: "Sneakers",
        description: "GUCCI INTENSE OUD EDP",
        imageUrl: "/assets/new arrivals/shoes.png",
        link: "/category",
        order: 4,
        isActive: true,
      },
    ]
    
    // Insert all products
    await NewArrival.insertMany(defaultProducts)
    
    console.log('✅ Seeded new arrival products successfully')
    return NextResponse.json({ 
      message: 'New arrival products seeded successfully',
      count: defaultProducts.length 
    })
  } catch (error) {
    console.error('❌ New Arrivals Seed Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to seed new arrival products',
        message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : 'Internal server error'
      },
      { status: 500 }
    )
  }
}
