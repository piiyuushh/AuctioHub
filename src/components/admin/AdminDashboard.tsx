"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import CarouselManager from './CarouselManager'
import UserManager from './UserManager'
import NewArrivalsManager from './NewArrivalsManager'
import { FiHome, FiUsers, FiImage, FiPackage, FiSettings, FiActivity, FiTrendingUp, FiShoppingBag } from 'react-icons/fi'

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
    { id: 'carousel', label: 'Carousel', icon: FiImage, available: true, color: 'blue' },
    { id: 'newarrivals', label: 'New Arrivals', icon: FiTrendingUp, available: true, color: 'green' },
    { id: 'users', label: 'Users', icon: FiUsers, available: true, color: 'purple' },
    { id: 'products', label: 'Products', icon: FiPackage, available: false, color: 'orange' },
    { id: 'settings', label: 'Settings', icon: FiSettings, available: false, color: 'gray' },
  ]

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      loading: stats.loading,
      icon: FiUsers,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      description: 'Registered members'
    },
    {
      title: 'Carousel Images',
      value: stats.carouselImages,
      loading: stats.loading,
      icon: FiImage,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      description: 'Active banners'
    }
  ]
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-[#4682A9] shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center space-x-4">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-white shadow-lg">
                <Image
                  src="/assets/logo.png"
                  alt="AuctioHub Logo"
                  fill
                  className="object-contain p-2"
                />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  AuctioHub Admin
                </h1>
                <p className="text-sm text-gray-200 mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Platform Management
                </p>
              </div>
            </div>
            <button
              onClick={navigateToHome}
              className="w-full sm:w-auto px-6 py-3 bg-white text-[#4682A9] rounded-xl font-semibold shadow-lg hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <FiHome className="text-lg" />
              Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {statsCards.map((card, index) => {
            const Icon = card.icon
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-2">{card.title}</p>
                    <div className="flex items-baseline gap-2">
                      {card.loading ? (
                        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#4682A9] rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span className="text-4xl font-bold text-black">
                            {card.value}
                          </span>
                          <span className={`text-sm font-medium ${card.textColor}`}>
                            {card.description}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className={`${card.bgColor} p-4 rounded-xl`}>
                    <Icon className={`text-2xl ${card.textColor}`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex overflow-x-auto scrollbar-hide p-2" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => tab.available && setActiveTab(tab.id)}
                    disabled={!tab.available}
                    className={`relative flex-shrink-0 px-6 py-4 text-sm font-semibold rounded-xl mx-1 transition-all duration-300 min-w-max ${
                      isActive
                        ? 'bg-[#4682A9] text-white shadow-md'
                        : tab.available
                        ? 'text-gray-600 hover:bg-gray-100 hover:text-black'
                        : 'text-gray-400 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="text-lg" />
                      <span>{tab.label}</span>
                      {!tab.available && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
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
          <div className="p-8">
            {activeTab === 'carousel' && (
              <div>
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <FiImage className="text-2xl text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-black">Carousel Management</h2>
                      <p className="text-sm text-gray-600 mt-1">Manage homepage carousel images and banners</p>
                    </div>
                  </div>
                </div>
                <CarouselManager />
              </div>
            )}
            
            {activeTab === 'users' && (
              <div>
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <FiUsers className="text-2xl text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-black">User Management</h2>
                      <p className="text-sm text-gray-600 mt-1">View and manage platform users and permissions</p>
                    </div>
                  </div>
                </div>
                <UserManager />
              </div>
            )}
            
            {activeTab === 'newarrivals' && (
              <div>
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <FiTrendingUp className="text-2xl text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-black">New Arrivals</h2>
                      <p className="text-sm text-gray-600 mt-1">Manage featured products on homepage</p>
                    </div>
                  </div>
                </div>
                <NewArrivalsManager />
              </div>
            )}
            
            {activeTab === 'products' && (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <FiPackage className="text-4xl text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-black mb-3">Product Management</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Advanced product management features are currently in development
                </p>
                <div className="inline-flex items-center px-6 py-3 bg-orange-100 text-orange-700 rounded-xl font-semibold">
                  <FiSettings className="mr-2" />
                  Coming Soon
                </div>
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <FiSettings className="text-4xl text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-black mb-3">Platform Settings</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  System configuration and platform settings will be available soon
                </p>
                <div className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold">
                  <FiActivity className="mr-2" />
                  In Development
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
