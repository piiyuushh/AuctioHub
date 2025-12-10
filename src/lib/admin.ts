import { auth, currentUser } from '@clerk/nextjs/server'
import connectToDatabase from './mongodb'
import { User } from './models'

export async function isAdmin() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      console.log('❌ No userId found')
      return false
    }
    
    const user = await currentUser()
    if (!user) {
      console.log('❌ No user found')
      return false
    }
    
    const userEmail = user.emailAddresses[0]?.emailAddress
    if (!userEmail) {
      console.log('❌ No user email found')
      return false
    }
    
    console.log('🔍 Checking admin status for:', userEmail)
    
    // Connect to database and check user role
    await connectToDatabase()
    
    // Check if user exists in database and has admin role
    let dbUser = await User.findOne({ clerkId: userId })
    
    // If user doesn't exist in database, create them
    if (!dbUser) {
      console.log('👤 User not found in database, creating...')
      
      // Check if user email is in initial admin emails list (for first-time setup)
      const adminEmailsRaw = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || []
      // Remove quotes if they exist (handles both "email" and 'email' formats)
      const adminEmails = adminEmailsRaw.map(email => email.replace(/^["']|["']$/g, ''))
      const isInitialAdmin = adminEmails.includes(userEmail)
      
      console.log('🔍 Admin check:', {
        userEmail,
        adminEmailsRaw,
        adminEmails,
        isInitialAdmin
      })
      
      console.log('🔍 Admin emails from env:', adminEmails)
      console.log('🔍 Is initial admin?', isInitialAdmin)
      
      // Check if there's already a user with this email (from previous setup or migration)
      const existingUserByEmail = await User.findOne({ email: userEmail })
      console.log('🔍 Existing user by email found?', !!existingUserByEmail)
      
      if (existingUserByEmail) {
        // Update the existing user record with the new clerkId
        existingUserByEmail.clerkId = userId
        if (isInitialAdmin && existingUserByEmail.role !== 'ADMIN') {
          existingUserByEmail.role = 'ADMIN'
          console.log('🔄 Updated existing user to ADMIN role')
        }
        dbUser = await existingUserByEmail.save()
        console.log(`✅ Updated existing user: ${userEmail} with role: ${dbUser.role}`)
      } else {
        // Create new user
        dbUser = await User.create({
          clerkId: userId,
          email: userEmail,
          role: isInitialAdmin ? 'ADMIN' : 'USER'
        })
        console.log(`✅ Created new user: ${userEmail} with role: ${dbUser.role}`)
      }
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
    const { userId } = await auth()
    if (!userId) return null
    
    const clerkUser = await currentUser()
    if (!clerkUser) return null
    
    await connectToDatabase()
    
    let dbUser = await User.findOne({ clerkId: userId })
    
    // Create user if doesn't exist
    if (!dbUser) {
      const userEmail = clerkUser.emailAddresses[0]?.emailAddress
      if (!userEmail) return null
      
      const adminEmailsRaw = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || []
      const adminEmails = adminEmailsRaw.map(email => email.replace(/^["']|["']$/g, ''))
      const isInitialAdmin = adminEmails.includes(userEmail)
      
      // Check if there's already a user with this email
      const existingUserByEmail = await User.findOne({ email: userEmail })
      
      if (existingUserByEmail) {
        // Update the existing user record with the new clerkId
        existingUserByEmail.clerkId = userId
        if (isInitialAdmin && existingUserByEmail.role !== 'ADMIN') {
          existingUserByEmail.role = 'ADMIN'
        }
        dbUser = await existingUserByEmail.save()
      } else {
        // Create new user
        dbUser = await User.create({
          clerkId: userId,
          email: userEmail,
          role: isInitialAdmin ? 'ADMIN' : 'USER'
        })
      }
    }
    
    return dbUser
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}
