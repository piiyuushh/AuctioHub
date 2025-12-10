import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import connectToDatabase from '@/lib/mongodb'
import { User } from '@/lib/models'
import { clerkClient } from '@clerk/nextjs/server'

// GET - Fetch all users
export async function GET() {
  try {
    console.log('🔍 Admin Users API - GET request')
    
    // Check if user is admin
    await requireAdmin()
    
    // Connect to database
    await connectToDatabase()
    
    // Fetch all users, sorted by creation date (newest first)
    const users = await User.find({})
      .sort({ createdAt: -1 })
      .lean()
    
    console.log(`✅ Found ${users.length} users`)
    
    return NextResponse.json(users)
  } catch (error) {
    console.error('❌ Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// PUT - Update user role
export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 Admin Users API - PUT request')
    
    // Check if user is admin
    await requireAdmin()
    
    const { userId, role } = await request.json()
    
    if (!userId || !role) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      )
    }
    
    if (!['USER', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be USER or ADMIN' },
        { status: 400 }
      )
    }
    
    // Connect to database
    await connectToDatabase()
    
    // Find the user
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // If demoting an admin to user, check if they're the last admin
    if (user.role === 'ADMIN' && role === 'USER') {
      const adminCount = await User.countDocuments({ role: 'ADMIN' })
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot demote the last admin user. At least one admin must remain.' },
          { status: 400 }
        )
      }
    }
    
    // Update user role
    user.role = role
    await user.save()
    
    console.log(`✅ Updated user ${user.email} role to ${role}`)
    
    return NextResponse.json({
      message: `User role updated to ${role} successfully`,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        clerkId: user.clerkId
      }
    })
  } catch (error) {
    console.error('❌ Error updating user role:', error)
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    )
  }
}

// POST - Add new admin user (create placeholder)
export async function POST(request: NextRequest) {
  try {
    console.log('➕ Admin Users API - POST request')
    
    // Check if user is admin
    await requireAdmin()
    
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }
    
    // Connect to database
    await connectToDatabase()
    
    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      // If user already exists, update their role to admin
      if (existingUser.role === 'ADMIN') {
        return NextResponse.json(
          { error: 'User is already an admin' },
          { status: 400 }
        )
      }
      
      existingUser.role = 'ADMIN'
      await existingUser.save()
      
      return NextResponse.json({
        message: `Existing user ${email} has been promoted to admin`,
        user: existingUser
      })
    }
    
    // Create a placeholder admin user (will be connected when they sign up)
    const newUser = await User.create({
      clerkId: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Temporary ID
      email,
      role: 'ADMIN'
    })
    
    console.log(`✅ Created placeholder admin user: ${email}`)
    
    return NextResponse.json({
      message: `Admin user ${email} added successfully. They will have admin access when they sign up.`,
      user: newUser
    })
  } catch (error) {
    console.error('❌ Error adding admin user:', error)
    return NextResponse.json(
      { error: 'Failed to add admin user' },
      { status: 500 }
    )
  }
}

// DELETE - Remove user
export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Admin Users API - DELETE request')
    
    // Check if user is admin
    await requireAdmin()
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    // Connect to database
    await connectToDatabase()
    
    // Find the user
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // If removing an admin, check if they're the last admin
    if (user.role === 'ADMIN') {
      const adminCount = await User.countDocuments({ role: 'ADMIN' })
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot remove the last admin user. At least one admin must remain.' },
          { status: 400 }
        )
      }
    }
    
    // For real users (not temp placeholders), also try to delete from Clerk
    let clerkDeletionResult = null
    if (!user.clerkId.startsWith('temp-')) {
      try {
        const clerk = await clerkClient()
        await clerk.users.deleteUser(user.clerkId)
        clerkDeletionResult = 'User deleted from Clerk authentication'
        console.log(`✅ Deleted user from Clerk: ${user.clerkId}`)
      } catch (clerkError) {
        console.warn('⚠️ Failed to delete user from Clerk (they may not exist there):', clerkError)
        clerkDeletionResult = 'User was not found in Clerk (may be a placeholder user)'
      }
    } else {
      clerkDeletionResult = 'Placeholder user - no Clerk account to delete'
    }
    
    // Remove from database
    await User.findByIdAndDelete(userId)
    
    console.log(`✅ Deleted user from database: ${user.email}`)
    
    return NextResponse.json({
      message: `User ${user.email} has been removed successfully`,
      details: clerkDeletionResult
    })
  } catch (error) {
    console.error('❌ Error removing user:', error)
    return NextResponse.json(
      { error: 'Failed to remove user' },
      { status: 500 }
    )
  }
}
