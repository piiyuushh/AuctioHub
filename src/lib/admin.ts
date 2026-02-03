import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { pool } from './database'
import { User } from './models'

export async function isAdmin() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.log('❌ No session or email found')
      return false
    }
    
    const userEmail = session.user.email.toLowerCase()
    console.log('🔍 Checking admin status for:', userEmail)
    
    // Check if user exists in database and has admin role
    const dbUser = await User.findOne({ email: userEmail })
    
    if (!dbUser) {
      console.log('❌ User not found in database')
      return false
    }
    
    const isAdminUser = dbUser.role === 'ADMIN'
    
    if (isAdminUser) {
      console.log('✅ Admin access granted for:', userEmail)
    } else {
      console.log('❌ Admin access denied for:', userEmail, 'Role:', dbUser.role)
    }
    
    return isAdminUser
  } catch (error) {
    console.log('❌ Error checking admin status:', error)
    return false
  }
}

export async function requireAdmin() {
  const adminStatus = await isAdmin()
  if (!adminStatus) {
    throw new Error('Admin access required')
  }
  return adminStatus
}

export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return null
    
    const userEmail = session.user.email.toLowerCase()
    const dbUser = await User.findOne({ email: userEmail })
    
    return dbUser
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

