"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

export function UserLink() {
  const { isSignedIn, isLoaded } = useUser()
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

    if (isLoaded && isSignedIn) {
      checkAdminStatus()
    } else {
      setLoading(false)
    }
  }, [isSignedIn, isLoaded])

  // Don't show if user is not signed in, still loading, or is an admin
  if (!isLoaded || !isSignedIn || loading || isAdmin) {
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
