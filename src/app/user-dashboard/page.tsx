"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { FaGavel, FaListAlt, FaTrophy, FaChartLine, FaDollarSign, FaClock, FaUserEdit } from "react-icons/fa";
import Image from "next/image";

interface DashboardStats {
  activeBids: number
  activeListings: number
  auctionsWon: number
  totalSpent: number
  successRate: number
  avgBidAmount: number
  avgBidHours: number
  recentAlerts: Array<{ type: 'info' | 'success' | 'warning'; title: string; subtitle: string }>
}

interface ProfileData {
  id: string
  email: string
  name: string
  image: string
  role: string
  createdAt?: string
}

export default function UserDashboard() {
  const { data: session, status, update } = useSession();
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [dashboardError, setDashboardError] = useState<string | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: "", image: "" })
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [isDraggingImage, setIsDraggingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!session?.user?.email) return

    const fetchDashboardData = async () => {
      setLoadingData(true)
      setDashboardError(null)

      try {
        const [statsResponse, profileResponse] = await Promise.all([
          fetch('/api/user-dashboard/stats'),
          fetch('/api/profile'),
        ])

        if (!statsResponse.ok) {
          const body = await statsResponse.json().catch(() => ({}))
          throw new Error(body?.error || 'Failed to load dashboard stats')
        }

        if (!profileResponse.ok) {
          const body = await profileResponse.json().catch(() => ({}))
          throw new Error(body?.error || 'Failed to load profile')
        }

        const statsPayload = await statsResponse.json()
        const profilePayload = await profileResponse.json()

        setStats(statsPayload)
        setProfile(profilePayload)
        setFormData({
          name: profilePayload.name || '',
          image: profilePayload.image || '',
        })
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to load dashboard'
        setDashboardError(message)
      } finally {
        setLoadingData(false)
      }
    }

    fetchDashboardData()
  }, [session?.user?.email])

  const user = useMemo(() => {
    return {
      name: profile?.name || session?.user?.name || 'User',
      email: profile?.email || session?.user?.email || '',
      image: profile?.image || session?.user?.image || '/assets/profiles/default-avatar.png',
      id: profile?.id || session?.user?.id,
      createdAt: profile?.createdAt,
    }
  }, [profile, session])

  const refreshStats = async () => {
    const statsResponse = await fetch('/api/user-dashboard/stats')
    if (statsResponse.ok) {
      const payload = await statsResponse.json()
      setStats(payload)
    }
  }

  const uploadProfileImage = async (file: File) => {
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      throw new Error('Invalid file type. Use JPG, PNG, or WEBP.')
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image too large. Maximum size is 5MB.')
    }

    const body = new FormData()
    body.append('file', file)

    const response = await fetch('/api/profile/upload-image', {
      method: 'POST',
      body,
    })

    const payload = await response.json()
    if (!response.ok) {
      throw new Error(payload?.error || 'Failed to upload image')
    }

    setFormData((prev) => ({ ...prev, image: payload.url }))
    setSelectedFileName(file.name)
    setProfileMessage('Image uploaded. Save changes to update your profile.')
  }

  const handleImageFile = async (file: File | null) => {
    if (!file) return

    setProfileError(null)
    setProfileMessage(null)
    setIsUploadingImage(true)

    try {
      await uploadProfileImage(file)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to upload image'
      setProfileError(message)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleProfileSave = async () => {
    setSavingProfile(true)
    setProfileError(null)
    setProfileMessage(null)

    try {
      if (!formData.name.trim()) {
        throw new Error('Name is required')
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          image: formData.image.trim(),
        }),
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to update profile')
      }

      setProfile((prev) => {
        const next = {
          id: payload.profile.id,
          email: payload.profile.email,
          name: payload.profile.name,
          image: payload.profile.image,
          role: payload.profile.role,
          createdAt: prev?.createdAt,
        }
        return next
      })

      await update({
        name: payload.profile.name,
        image: payload.profile.image,
      })

      setProfileMessage('Profile updated successfully')
      setIsEditingProfile(false)
      await refreshStats()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update profile'
      setProfileError(message)
    } finally {
      setSavingProfile(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#393E46] mx-auto"></div>
          <p className="mt-4 text-[#929AAB]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7]">
        <div className="text-center">
          <p className="text-[#393E46] text-xl">Please sign in to view your dashboard</p>
        </div>
      </div>
    );
  }

  if (loadingData) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F7F7F7]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#393E46] mx-auto"></div>
            <p className="mt-4 text-[#929AAB]">Loading dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (dashboardError || !stats) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F7F7F7]">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl border border-red-200 p-6 max-w-xl w-full text-center">
            <p className="text-red-700 font-semibold mb-3">Unable to load your dashboard</p>
            <p className="text-[#393E46] text-sm mb-5">{dashboardError || 'Unexpected error'}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 bg-[#F6F4EB] border-2 border-[#4682A9] text-[#1f3f56] rounded-2xl hover:bg-[#ece9dc] transition"
            >
              Retry
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F7]">
      <Header />
      
      <main className="flex-1 w-full xl:px-8 2xl:px-0 2xl:max-w-[1800px] 2xl:mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#393E46] mb-2">User Dashboard</h1>
            <p className="text-[#929AAB]">Manage your auctions and track your activity</p>
          </div>

          {/* User Profile Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#EEEEEE] p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[#EEEEEE]">
                  <Image
                    src={user?.image || "/assets/profiles/default-avatar.png"}
                    alt={user?.name || "User"}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-[#393E46] mb-2">
                  {user.name}
                </h2>
                <p className="text-[#929AAB] mb-4">
                  {user.email}
                </p>
                
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <div className="bg-[#F7F7F7] px-4 py-2 rounded-lg">
                    <span className="text-sm text-[#929AAB]">Member Since</span>
                    <p className="text-[#393E46] font-semibold">
                      {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Edit Profile Button */}
              <div className="flex-shrink-0">
                <button
                  onClick={() => {
                    setFormData({
                      name: profile?.name || '',
                      image: profile?.image || '',
                    })
                    setSelectedFileName(null)
                    setProfileError(null)
                    setProfileMessage(null)
                    setIsEditingProfile(true)
                  }}
                  className="px-6 py-3 bg-[#F6F4EB] border-2 border-[#4682A9] text-[#1f3f56] rounded-2xl hover:bg-[#ece9dc] transition-all duration-300 font-medium inline-flex items-center gap-2"
                >
                  <FaUserEdit />
                  Edit Profile
                </button>
              </div>
            </div>
            {profileMessage && (
              <p className="mt-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                {profileMessage}
              </p>
            )}
            {profileError && (
              <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                {profileError}
              </p>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-[#EEEEEE] p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaGavel className="text-blue-600 text-xl" />
                </div>
                <span className="text-[#929AAB] text-sm">Active</span>
              </div>
              <h3 className="text-3xl font-bold text-[#393E46] mb-1">{stats.activeBids}</h3>
              <p className="text-[#929AAB] text-sm">Active Bids</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#EEEEEE] p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FaListAlt className="text-purple-600 text-xl" />
                </div>
                <span className="text-[#929AAB] text-sm">Listed</span>
              </div>
              <h3 className="text-3xl font-bold text-[#393E46] mb-1">{stats.activeListings}</h3>
              <p className="text-[#929AAB] text-sm">Active Listings</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#EEEEEE] p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FaTrophy className="text-green-600 text-xl" />
                </div>
                <span className="text-[#929AAB] text-sm">Won</span>
              </div>
              <h3 className="text-3xl font-bold text-[#393E46] mb-1">{stats.auctionsWon}</h3>
              <p className="text-[#929AAB] text-sm">Auctions Won</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#EEEEEE] p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <FaChartLine className="text-indigo-600 text-xl" />
                </div>
                <span className="text-[#929AAB] text-sm">Rate</span>
              </div>
              <h3 className="text-3xl font-bold text-[#393E46] mb-1">{stats.successRate.toFixed(1)}%</h3>
              <p className="text-[#929AAB] text-sm">Success Rate</p>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Statistics Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-[#EEEEEE] p-6">
                <h2 className="text-2xl font-bold text-[#393E46] mb-6">Statistics</h2>
                
                <div className="space-y-4">
                  {/* Total Spent */}
                  <div className="flex items-center justify-between p-4 bg-[#F7F7F7] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#393E46] rounded-lg flex items-center justify-center">
                        <FaDollarSign className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-[#929AAB]">Total Spent</p>
                        <p className="text-xl font-bold text-[#393E46]">NPR {stats.totalSpent.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="text-green-600 text-sm font-medium">Full payments</div>
                  </div>

                  {/* Success Rate */}
                  <div className="flex items-center justify-between p-4 bg-[#F7F7F7] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#393E46] rounded-lg flex items-center justify-center">
                        <FaChartLine className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-[#929AAB]">Success Rate</p>
                        <p className="text-xl font-bold text-[#393E46]">{stats.successRate.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="text-green-600 text-sm font-medium">Real outcomes</div>
                  </div>

                  {/* Average Bid Amount */}
                  <div className="flex items-center justify-between p-4 bg-[#F7F7F7] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#393E46] rounded-lg flex items-center justify-center">
                        <FaDollarSign className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-[#929AAB]">Avg. Bid Amount</p>
                        <p className="text-xl font-bold text-[#393E46]">NPR {stats.avgBidAmount.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="text-blue-600 text-sm font-medium">Across bids</div>
                  </div>

                  {/* Average Bid Time */}
                  <div className="flex items-center justify-between p-4 bg-[#F7F7F7] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#393E46] rounded-lg flex items-center justify-center">
                        <FaClock className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-[#929AAB]">Avg. Bid Time</p>
                        <p className="text-xl font-bold text-[#393E46]">{stats.avgBidHours.toFixed(1)} hrs</p>
                      </div>
                    </div>
                    <div className="text-blue-600 text-sm font-medium">Time since bids</div>
                  </div>

                  {/* Win Rate Chart Placeholder */}
                  <div className="p-4 bg-[#F7F7F7] rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#393E46] rounded-lg flex items-center justify-center">
                        <FaTrophy className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-[#929AAB]">Win Rate Progress</p>
                      </div>
                    </div>
                    <div className="w-full bg-[#EEEEEE] rounded-full h-4">
                      <div className="bg-gradient-to-r from-[#393E46] to-[#929AAB] h-4 rounded-full" style={{ width: `${Math.min(stats.successRate, 100)}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-[#EEEEEE] p-6">
                <h2 className="text-xl font-bold text-[#393E46] mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/category')}
                    className="w-full py-3 bg-[#F6F4EB] border-2 border-[#4682A9] text-[#1f3f56] rounded-2xl hover:bg-[#ece9dc] transition-all duration-300 font-medium"
                  >
                    Browse Auctions
                  </button>
                  <button
                    onClick={() => router.push('/category')}
                    className="w-full py-3 bg-[#F6F4EB] border-2 border-[#4682A9] text-[#1f3f56] rounded-2xl hover:bg-[#ece9dc] transition-all duration-300 font-medium"
                  >
                    View My Bids
                  </button>
                  <button
                    onClick={() => router.push('/category')}
                    className="w-full py-3 bg-[#F6F4EB] border-2 border-[#4682A9] text-[#1f3f56] rounded-2xl hover:bg-[#ece9dc] transition-all duration-300 font-medium"
                  >
                    Manage Listings
                  </button>
                </div>
              </div>

              {/* Recent Alerts */}
              <div className="bg-white rounded-2xl shadow-sm border border-[#EEEEEE] p-6">
                <h2 className="text-xl font-bold text-[#393E46] mb-4">Recent Alerts</h2>
                <div className="space-y-4">
                  {stats.recentAlerts.length === 0 ? (
                    <div className="p-3 bg-gray-50 border-l-4 border-gray-400 rounded">
                      <p className="text-sm font-medium text-[#393E46]">No recent alerts</p>
                      <p className="text-xs text-[#929AAB] mt-1">Your activity updates will appear here</p>
                    </div>
                  ) : (
                    stats.recentAlerts.map((alert, index) => {
                      const classes =
                        alert.type === 'success'
                          ? 'bg-green-50 border-green-500'
                          : alert.type === 'warning'
                            ? 'bg-yellow-50 border-yellow-500'
                            : 'bg-blue-50 border-blue-500'

                      return (
                        <div key={`${alert.title}-${index}`} className={`p-3 border-l-4 rounded ${classes}`}>
                          <p className="text-sm font-medium text-[#393E46]">{alert.title}</p>
                          <p className="text-xs text-[#929AAB] mt-1">{alert.subtitle}</p>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsEditingProfile(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl border border-[#EEEEEE] p-6 w-full max-w-lg">
            <h3 className="text-2xl font-bold text-[#393E46] mb-4">Edit Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#393E46] mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-[#DADADA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#393E46]"
                  placeholder="Your display name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#393E46] mb-1">Profile Image</label>
                <div className="flex items-center gap-4 mb-3">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border border-[#DADADA] bg-white">
                    <Image
                      src={formData.image || '/assets/profiles/default-avatar.png'}
                      alt="Profile preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#393E46]">{selectedFileName || 'Current image'}</p>
                    <p className="text-xs text-[#929AAB]">JPG, PNG, WEBP up to 10MB</p>
                  </div>
                </div>
                <div
                  onDragOver={(event) => {
                    event.preventDefault()
                    setIsDraggingImage(true)
                  }}
                  onDragLeave={() => setIsDraggingImage(false)}
                  onDrop={(event) => {
                    event.preventDefault()
                    setIsDraggingImage(false)
                    const file = event.dataTransfer.files?.[0] || null
                    handleImageFile(file)
                  }}
                  className={`border-2 border-dashed rounded-lg p-4 text-center transition ${isDraggingImage ? 'border-[#393E46] bg-[#F7F7F7]' : 'border-[#DADADA] bg-white'}`}
                >
                  <p className="text-sm text-[#393E46] mb-2">Drag and drop image here</p>
                  <p className="text-xs text-[#929AAB] mb-3">or</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 bg-[#F6F4EB] border-2 border-[#4682A9] text-[#1f3f56] rounded-2xl text-sm hover:bg-[#ece9dc]"
                    disabled={isUploadingImage}
                  >
                    Select Image
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={(event) => handleImageFile(event.target.files?.[0] || null)}
                  />
                </div>
                {isUploadingImage && (
                  <p className="text-sm text-[#393E46] mt-2">Uploading image to Cloudinary...</p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 border-2 border-[#4682A9] bg-[#F6F4EB] rounded-2xl text-[#1f3f56] hover:bg-[#ece9dc]"
                disabled={savingProfile}
              >
                Cancel
              </button>
              <button
                onClick={handleProfileSave}
                className="px-4 py-2 bg-[#F6F4EB] border-2 border-[#4682A9] text-[#1f3f56] rounded-2xl hover:bg-[#ece9dc] disabled:opacity-60"
                disabled={savingProfile || isUploadingImage}
              >
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
