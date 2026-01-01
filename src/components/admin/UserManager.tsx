"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface User {
  _id: string
  googleId: string
  email: string
  name?: string
  role: 'USER' | 'ADMIN'
  createdAt: string
  updatedAt: string
}

export default function UserManager() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  // Get current user's email for comparison
  const currentUserEmail = session?.user?.email

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      console.log('Fetching users...')
      const response = await fetch('/api/admin/users')
      
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched users:', data)
        setUsers(Array.isArray(data) ? data : [])
        setMessage(null)
      } else {
        const errorText = await response.text()
        console.error('Failed to fetch users:', response.status, errorText)
        setMessage({ type: 'error', text: `Failed to fetch users (${response.status})` })
      }
    } catch (error) {
      console.error('Fetch error:', error)
      setMessage({ type: 'error', text: 'Error loading users' })
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: 'USER' | 'ADMIN', currentRole: string, userEmail: string) => {
    // Special confirmation for demoting admin to user
    if (currentRole === 'ADMIN' && newRole === 'USER') {
      const confirmMessage = `⚠️ WARNING: You are about to remove admin privileges from "${userEmail}".\n\nThis will:\n- Revoke their admin access\n- Remove them from the admin dashboard\n- Convert them to a regular user\n\nNote: If this is the last admin user, the demotion will be blocked to ensure system access.\n\nAre you sure you want to proceed?`
      
      if (!window.confirm(confirmMessage)) {
        return
      }
    }

    try {
      setActionLoading(true)
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      })

      if (response.ok) {
        const data = await response.json()
        setMessage({ type: 'success', text: data.message })
        await fetchUsers() // Refresh the list
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || 'Failed to update user role' })
      }
    } catch (error) {
      console.error('Update role error:', error)
      setMessage({ type: 'error', text: 'Error updating user role' })
    } finally {
      setActionLoading(false)
    }
  }

  const addAdminUser = async () => {
    if (!newAdminEmail.trim()) {
      setMessage({ type: 'error', text: 'Please enter an email address' })
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newAdminEmail)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' })
      return
    }

    try {
      setActionLoading(true)
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newAdminEmail.trim() })
      })

      if (response.ok) {
        const data = await response.json()
        setMessage({ type: 'success', text: data.message })
        setNewAdminEmail('')
        setShowAddForm(false)
        await fetchUsers() // Refresh the list
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || 'Failed to add admin user' })
      }
    } catch (error) {
      console.error('Add admin error:', error)
      setMessage({ type: 'error', text: 'Error adding admin user' })
    } finally {
      setActionLoading(false)
    }
  }

  const removeUser = async (userId: string, userEmail: string, userRole: string) => {
    // Special warning for admin users
    const isAdmin = userRole === 'ADMIN'
    const confirmMessage = isAdmin 
      ? `⚠️ WARNING: You are about to remove an ADMIN user "${userEmail}" from the system!\n\nThis will:\n- Delete them from the database\n- Revoke all admin privileges\n\nNote: If this is the last admin user, the removal will be blocked to ensure system access.\n\nThis action cannot be undone. Are you absolutely sure?`
      : `Are you sure you want to permanently remove user "${userEmail}" from the system?\n\nThis will delete them from the database.\n\nThis action cannot be undone.`
    
    if (!window.confirm(confirmMessage)) {
      return
    }

    try {
      setActionLoading(true)
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const data = await response.json()
        
        // Show detailed success message
        const successMessage = data.message || 'User removed successfully'
        
        setMessage({ type: 'success', text: successMessage })
        await fetchUsers() // Refresh the list
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || 'Failed to remove user' })
      }
    } catch (error) {
      console.error('Remove user error:', error)
      setMessage({ type: 'error', text: 'Error removing user' })
    } finally {
      setActionLoading(false)
    }
  }

  const clearMessage = () => {
    setTimeout(() => setMessage(null), 5000)
  }

  useEffect(() => {
    if (message) {
      clearMessage()
    }
  }, [message])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">User Management</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">User Management</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
            disabled={actionLoading}
          >
            {showAddForm ? 'Cancel' : 'Add Admin'}
          </button>
        </div>

        {message && (
          <div className={`p-3 rounded mb-4 ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-300' 
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message.text}
          </div>
        )}

        {showAddForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium mb-3">Add New Admin User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={actionLoading}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter the email address of the user you want to grant admin access to.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={addAdminUser}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {actionLoading ? 'Adding...' : 'Grant Admin Access'}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setNewAdminEmail('')
                  }}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Current Users ({users.length})</h3>
          
          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No users found. Users will appear here after they sign up.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Email</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Role</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Created</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => {
                    const isCurrentUser = user.email === currentUserEmail
                    return (
                      <tr key={user._id} className={`hover:bg-gray-50 ${isCurrentUser ? 'bg-blue-50' : ''}`}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {user.email}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-blue-600 font-medium">(You)</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'ADMIN' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            {isCurrentUser ? (
                              <div className="text-xs text-gray-500 italic py-1">
                                Cannot modify yourself
                              </div>
                            ) : (
                              <>
                                {user.role === 'USER' ? (
                                  <button
                                    onClick={() => updateUserRole(user._id, 'ADMIN', user.role, user.email)}
                                    disabled={actionLoading}
                                    className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 disabled:opacity-50"
                                  >
                                    Make Admin
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => updateUserRole(user._id, 'USER', user.role, user.email)}
                                    disabled={actionLoading}
                                    className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 disabled:opacity-50"
                                  >
                                    Remove Admin
                                  </button>
                                )}
                                <button
                                  onClick={() => removeUser(user._id, user.email, user.role)}
                                  disabled={actionLoading}
                                  className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                                >
                                  Remove User
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
