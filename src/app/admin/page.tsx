import { isAdmin } from '@/lib/admin'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/admin/AdminDashboard'

export default async function AdminPage() {
  console.log('AdminPage: Starting admin check...')
  
  const session = await getServerSession(authOptions)
  console.log('AdminPage: Session:', session ? 'Present' : 'None')
  
  // If not signed in at all, redirect to sign in
  if (!session) {
    console.log('AdminPage: No session, redirecting to sign-in')
    redirect('/sign-in')
  }
  
  // Check if user is admin
  const adminStatus = await isAdmin()
  console.log('AdminPage: Admin status:', adminStatus)
  
  if (!adminStatus) {
    console.log('AdminPage: Not admin, redirecting to access denied')
    redirect('/admin-access-denied')
  }
  
  console.log('AdminPage: Admin access granted, rendering dashboard')
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboard />
    </div>
  )
}
