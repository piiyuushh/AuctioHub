import { NextResponse } from 'next/server'
import { isAdmin, getCurrentUser } from '@/lib/admin'

export async function GET() {
  try {
    console.log('Starting admin test...')
    
    // Test admin status
    const adminStatus = await isAdmin()
    console.log('Admin status result:', adminStatus)
    
    // Test getting current user
    const currentUser = await getCurrentUser()
    console.log('Current user:', currentUser)
    
    return NextResponse.json({
      success: true,
      isAdmin: adminStatus,
      currentUser: currentUser ? {
        email: currentUser.email,
        role: currentUser.role,
        id: currentUser._id || currentUser.id
      } : null,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Admin test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
