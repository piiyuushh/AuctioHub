import { isAdmin } from '@/lib/admin'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/admin/AdminDashboard'

export default async function AdminPage() {
  console.log('🔍 AdminPage: Starting admin check...')
  
  const { userId } = await auth()
  console.log('🔍 AdminPage: User ID:', userId ? 'Present' : 'None')
  
  // If not signed in at all, redirect to sign in
  if (!userId) {
    console.log('❌ AdminPage: No user ID, redirecting to sign-in')
    redirect('/sign-in')
  }
  
  // Check if user is admin
  const adminStatus = await isAdmin()
  console.log('🔍 AdminPage: Admin status:', adminStatus)
  
  if (!adminStatus) {
    console.log('❌ AdminPage: Not admin, redirecting to access denied')
    redirect('/admin-access-denied')
  }
  
  console.log('✅ AdminPage: Admin access granted, rendering dashboard')
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboard />
    </div>
  )
}
