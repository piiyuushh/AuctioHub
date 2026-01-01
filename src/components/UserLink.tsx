"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export function UserLink() {
  const { data: session, status } = useSession()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/admin/check')
        if (response.ok) {
          const data = await response.json()
          setIsAdmin(data.isAdmin)
        }
      } catch (error) {
        console.log('Error checking admin status:', error)
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      checkAdminStatus()
    } else {
      setLoading(false)
    }
  }, [status])

  // Don't show if user is not signed in, still loading, or is an admin
  if (status !== 'authenticated' || loading || isAdmin) {
    return null
  }

  return (
    <Link 
      href="/user-dashboard" 
      className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200 bg-blue-50 px-3 py-1 rounded-full"
    >
      User
    </Link>
  )
}
