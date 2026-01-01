import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/mongodb'
import { User } from '@/lib/models'
import mongoose from 'mongoose'

// This endpoint helps fix orphaned MongoDB indexes
// Only accessible by admin users
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectToDatabase()
    
    // Check if user is admin in database OR in admin emails list (fallback)
    const userEmail = session.user.email.toLowerCase()
    const dbUser = await User.findOne({ 
      email: { $regex: new RegExp(`^${userEmail}$`, 'i') } 
    })
    
    const adminEmailsRaw = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || []
    const adminEmails = adminEmailsRaw.map(e => e.replace(/^["']|["']$/g, ''))
    const isInAdminEmails = adminEmails.includes(userEmail)
    
    const isAdmin = (dbUser?.role === 'ADMIN') || isInAdminEmails
    
    if (!isAdmin) {
      return NextResponse.json({ 
        error: 'Not authorized',
        debug: {
          email: userEmail,
          dbRole: dbUser?.role || 'user not found',
          isInAdminEmails,
          adminEmails
        }
      }, { status: 403 })
    }
    
    const db = mongoose.connection.db
    if (!db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 })
    }
    
    const usersCollection = db.collection('users')
    
    // Get current indexes
    const indexes = await usersCollection.indexes()
    console.log('Current indexes:', indexes)
    
    const droppedIndexes: string[] = []
    const errors: string[] = []
    
    // Drop the OLD clerkId index (from previous Clerk auth system)
    try {
      await usersCollection.dropIndex('clerkId_1')
      console.log('✅ Dropped clerkId_1 index')
      droppedIndexes.push('clerkId_1')
    } catch (e: any) {
      console.log('clerkId_1 index does not exist or already dropped:', e.message)
      errors.push(`clerkId_1: ${e.message}`)
    }
    
    // Drop the googleId index if it exists (to recreate as sparse)
    try {
      await usersCollection.dropIndex('googleId_1')
      console.log('✅ Dropped googleId_1 index')
      droppedIndexes.push('googleId_1')
    } catch (e: any) {
      console.log('googleId_1 index does not exist or already dropped:', e.message)
      errors.push(`googleId_1: ${e.message}`)
    }
    
    // Recreate the googleId index as sparse (allows multiple null values)
    await usersCollection.createIndex(
      { googleId: 1 }, 
      { unique: true, sparse: true, name: 'googleId_1' }
    )
    console.log('✅ Recreated googleId_1 index as sparse')
    
    // Get updated indexes
    const newIndexes = await usersCollection.indexes()
    
    return NextResponse.json({
      success: true,
      message: 'Indexes fixed successfully! You can now sign in with any Google account.',
      droppedIndexes,
      errors,
      previousIndexes: indexes,
      currentIndexes: newIndexes
    })
    
  } catch (error: any) {
    console.error('Fix indexes error:', error)
    return NextResponse.json({
      error: 'Failed to fix indexes',
      details: error.message
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await connectToDatabase()
    
    const db = mongoose.connection.db
    if (!db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 })
    }
    
    const usersCollection = db.collection('users')
    
    // Get current indexes
    const indexes = await usersCollection.indexes()
    
    // Get all users
    const users = await usersCollection.find({}).toArray()
    
    return NextResponse.json({
      indexes,
      userCount: users.length,
      users: users.map(u => ({
        _id: u._id,
        email: u.email,
        googleId: u.googleId,
        role: u.role,
        name: u.name
      }))
    })
    
  } catch (error: any) {
    console.error('Get indexes error:', error)
    return NextResponse.json({
      error: 'Failed to get indexes',
      details: error.message
    }, { status: 500 })
  }
}
