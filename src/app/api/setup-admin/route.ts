import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/mongodb'
import { User } from '@/lib/models'

// This endpoint helps set up the initial admin user
// It will make the currently logged-in user an admin if they match ADMIN_EMAILS
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({
        error: 'Not authenticated',
        message: 'Please sign in first'
      }, { status: 401 })
    }

    await connectToDatabase()
    
    const userEmail = session.user.email
    
    // Check admin emails from environment
    const adminEmailsRaw = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
    const adminEmails = adminEmailsRaw.map(e => e.replace(/^["']|["']$/g, ''))
    const isInAdminList = adminEmails.includes(userEmail)
    
    // Find current user in database
    let user = await User.findOne({ email: userEmail })
    
    // Get all users for reporting
    const allUsers = await User.find({}).lean()
    const adminUsers = allUsers.filter(u => u.role === 'ADMIN')
    
    // If user doesn't exist but is in admin list, something is wrong
    if (!user) {
      return NextResponse.json({
        status: 'user_not_found',
        message: 'Your user record was not found in the database. Please try signing out and signing in again.',
        email: userEmail,
        isInAdminEmailList: isInAdminList,
        adminEmails: adminEmails,
        totalUsers: allUsers.length,
        adminCount: adminUsers.length
      })
    }
    
    // If user is in admin list but not an admin, promote them
    if (isInAdminList && user.role !== 'ADMIN') {
      user.role = 'ADMIN'
      await user.save()
      
      return NextResponse.json({
        status: 'promoted',
        message: `Successfully promoted ${userEmail} to admin!`,
        user: {
          email: user.email,
          role: user.role,
          googleId: user.googleId
        },
        totalUsers: allUsers.length + 1,
        adminCount: adminUsers.length + 1
      })
    }
    
    // Return current status
    return NextResponse.json({
      status: 'ok',
      message: user.role === 'ADMIN' ? 'You are already an admin!' : 'You are a regular user',
      currentUser: {
        email: user.email,
        name: user.name,
        role: user.role,
        googleId: user.googleId,
        createdAt: user.createdAt
      },
      isInAdminEmailList: isInAdminList,
      database: {
        totalUsers: allUsers.length,
        adminCount: adminUsers.length,
        users: allUsers.map(u => ({
          email: u.email,
          name: u.name,
          role: u.role,
          createdAt: u.createdAt
        }))
      }
    })
    
  } catch (error) {
    console.error('Setup admin error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - Force set a user as admin (use with caution)
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({
        error: 'Not authenticated'
      }, { status: 401 })
    }

    await connectToDatabase()
    
    const userEmail = session.user.email
    
    // Check admin emails from environment
    const adminEmailsRaw = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
    const adminEmails = adminEmailsRaw.map(e => e.replace(/^["']|["']$/g, ''))
    
    if (!adminEmails.includes(userEmail)) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'Your email is not in the ADMIN_EMAILS list',
        yourEmail: userEmail,
        adminEmails: adminEmails
      }, { status: 403 })
    }
    
    // Find or create user
    let user = await User.findOne({ email: userEmail })
    
    if (!user) {
      // Create user as admin
      user = await User.create({
        googleId: session.user.googleId || `manual-${Date.now()}`,
        email: userEmail,
        name: session.user.name || 'Admin',
        image: session.user.image || '',
        role: 'ADMIN'
      })
      
      return NextResponse.json({
        status: 'created',
        message: `Created new admin user: ${userEmail}`,
        user: {
          email: user.email,
          role: user.role
        }
      })
    }
    
    // Update existing user to admin
    user.role = 'ADMIN'
    await user.save()
    
    return NextResponse.json({
      status: 'updated',
      message: `Updated ${userEmail} to admin`,
      user: {
        email: user.email,
        role: user.role
      }
    })
    
  } catch (error) {
    console.error('Force admin error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
