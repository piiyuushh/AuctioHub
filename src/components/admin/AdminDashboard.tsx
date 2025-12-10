"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import CarouselManager from './CarouselManager'
import UserManager from './UserManager'
import NewArrivalsManager from './NewArrivalsManager'
import { FiHome, FiUsers, FiImage, FiPackage, FiSettings, FiActivity } from 'react-icons/fi'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('carousel')
  const [stats, setStats] = useState({
    totalUsers: 0,
    carouselImages: 0,
    loading: true
  })
  const router = useRouter()
  
  // Fetch real-time stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total users count
        const usersResponse = await fetch('/api/admin/users')
        const users = await usersResponse.json()
        const totalUserCount = Array.isArray(users) ? users.length : 0
        
        // Fetch carousel images count
        const carouselResponse = await fetch('/api/carousel')
        const carouselData = await carouselResponse.json()
        const imageCount = Array.isArray(carouselData) ? carouselData.length : 0
        
        setStats({
          totalUsers: totalUserCount,
          carouselImages: imageCount,
          loading: false
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
        setStats({
          totalUsers: 0,
          carouselImages: 0,
          loading: false
        })
      }
    }

    fetchStats()
  }, [])
  
  const navigateToHome = () => {
    router.push('/')
  }

  const tabs = [
    { id: 'carousel', label: 'Carousel Management', icon: FiImage, available: true },
    { id: 'newarrivals', label: 'New Arrivals', icon: FiActivity, available: true },
    { id: 'users', label: 'User Management', icon: FiUsers, available: true },
    { id: 'products', label: 'Products', icon: FiPackage, available: false },
    { id: 'settings', label: 'Settings', icon: FiSettings, available: false },
  ]
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-black shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-white border-2 border-gray-200">
                <Image
                  src="/assets/logo.png"
                  alt="AuctioHub Logo"
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">AuctioHub Admin</h1>
                <p className="text-xs sm:text-sm text-gray-300">Platform Management</p>
              </div>
            </div>
            <button
              onClick={navigateToHome}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-all duration-200 group font-medium"
            >
              <FiHome className="mr-2 group-hover:animate-pulse" />
              <span className="sm:inline">Go to Home</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Registered Users</p>
                <div className="text-2xl sm:text-3xl font-bold text-black">
                  {stats.loading ? (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                  ) : (
                    <span>{stats.totalUsers}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Total users in database</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <FiUsers className="text-black text-lg sm:text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Carousel Images</p>
                <div className="text-2xl sm:text-3xl font-bold text-black">
                  {stats.loading ? (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                  ) : (
                    <span>{stats.carouselImages}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Homepage carousel items</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <FiImage className="text-black text-lg sm:text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto scrollbar-hide" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => tab.available && setActiveTab(tab.id)}
                    disabled={!tab.available}
                    className={`relative flex-shrink-0 py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm font-medium text-center focus:outline-none transition-all duration-200 min-w-max ${
                      activeTab === tab.id
                        ? 'text-black bg-gray-50 border-b-2 border-black'
                        : tab.available
                        ? 'text-gray-600 hover:text-black hover:bg-gray-50'
                        : 'text-gray-400 cursor-not-allowed bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                      <Icon className={`text-sm sm:text-lg ${
                        activeTab === tab.id ? 'text-black' : tab.available ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                      <span className="whitespace-nowrap">{tab.label}</span>
                      {!tab.available && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-1 sm:px-2 py-1 rounded-full ml-1 sm:ml-2">
                          Soon
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {activeTab === 'carousel' && (
              <div>
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-black mb-1 sm:mb-2">Carousel Management</h2>
                  <p className="text-sm sm:text-base text-gray-600">Manage your homepage carousel images and content</p>
                </div>
                <CarouselManager />
              </div>
            )}
            
            {activeTab === 'users' && (
              <div>
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-black mb-1 sm:mb-2">User Management</h2>
                  <p className="text-sm sm:text-base text-gray-600">View and manage platform users and their permissions</p>
                </div>
                <UserManager />
              </div>
            )}
            
            {activeTab === 'newarrivals' && (
              <div>
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-black mb-1 sm:mb-2">New Arrivals Management</h2>
                  <p className="text-sm sm:text-base text-gray-600">Manage featured new arrival products on your homepage</p>
                </div>
                <NewArrivalsManager />
              </div>
            )}
            
            {activeTab === 'products' && (
              <div className="text-center py-12 sm:py-16">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                  <FiPackage className="text-2xl sm:text-3xl text-gray-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-black mb-2">Product Management</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto px-4">
                  Advanced product management features are currently in development and will be available soon.
                </p>
                <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-xs sm:text-sm font-medium">
                  <FiSettings className="mr-1 sm:mr-2" />
                  Coming Soon
                </div>
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="text-center py-12 sm:py-16">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                  <FiSettings className="text-2xl sm:text-3xl text-gray-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-black mb-2">Platform Settings</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto px-4">
                  System configuration and platform settings will be available in the next update.
                </p>
                <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-xs sm:text-sm font-medium">
                  <FiActivity className="mr-1 sm:mr-2" />
                  Coming Soon
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
