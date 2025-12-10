"use client"

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'

export function UserLabel() {
  const { isSignedIn, isLoaded } = useUser()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isSignedIn || !isLoaded) {
        setLoading(false)
        return
      }

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

    checkAdminStatus()
  }, [isSignedIn, isLoaded])

  // Don't show anything if loading, not signed in, or user is not an admin
  if (loading || !isLoaded || !isSignedIn || !isAdmin) {
    return null
  }

  return (
    <div className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200 bg-blue-50 px-3 py-1 rounded-full">
      Admin
    </div>
  )
}
