"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import CarouselManager from './CarouselManager'
import UserManager from './UserManager'
import NewArrivalsManager from './NewArrivalsManager'
import { FiHome, FiUsers, FiImage, FiPackage, FiSettings, FiActivity, FiTrendingUp, FiShoppingBag, FiBarChart2 } from 'react-icons/fi'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('carousel')
  const [stats, setStats] = useState({
    totalUsers: 0,
    carouselImages: 0,
    totalAuctionsConducted: 0,
    fullPaymentCount: 0,
    penaltyCount: 0,
    auctionsThisMonth: 0,
    totalFullPaymentValue: 0,
    latestAuctions: [] as Array<{
      id: string
      productTitle: string
      winnerEmail: string | null
      paymentType: 'full' | 'penalty'
      winningBidAmount: number
      conductedAt: string
    }>,
    loading: true
  })
  const router = useRouter()
  
  // Fetch real-time stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersResponse, carouselResponse, auctionStatsResponse] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/carousel'),
          fetch('/api/admin/auction-stats')
        ])

        const users = await usersResponse.json()
        const carouselData = await carouselResponse.json()
        const auctionStats = auctionStatsResponse.ok ? await auctionStatsResponse.json() : null

        const totalUserCount = Array.isArray(users) ? users.length : 0
        const imageCount = Array.isArray(carouselData) ? carouselData.length : 0
        
        setStats({
          totalUsers: totalUserCount,
          carouselImages: imageCount,
          totalAuctionsConducted: auctionStats?.totalAuctionsConducted || 0,
          fullPaymentCount: auctionStats?.fullPaymentCount || 0,
          penaltyCount: auctionStats?.penaltyCount || 0,
          auctionsThisMonth: auctionStats?.auctionsThisMonth || 0,
          totalFullPaymentValue: auctionStats?.totalFullPaymentValue || 0,
          latestAuctions: auctionStats?.latestAuctions || [],
          loading: false
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
        setStats({
          totalUsers: 0,
          carouselImages: 0,
          totalAuctionsConducted: 0,
          fullPaymentCount: 0,
          penaltyCount: 0,
          auctionsThisMonth: 0,
          totalFullPaymentValue: 0,
          latestAuctions: [],
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

  const primaryCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      loading: stats.loading,
      icon: FiUsers,
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-700',
      hint: 'Registered members'
    },
    {
      title: 'Auctions Conducted',
      value: stats.totalAuctionsConducted,
      loading: stats.loading,
      icon: FiShoppingBag,
      iconBg: 'bg-green-100',
      iconText: 'text-green-700',
      hint: 'All-time payment events'
    },
    {
      title: 'Full Payment Value',
      value: `NPR ${stats.totalFullPaymentValue.toFixed(2)}`,
      loading: stats.loading,
      icon: FiTrendingUp,
      iconBg: 'bg-cyan-100',
      iconText: 'text-cyan-700',
      hint: 'Revenue from completed full payments'
    }
  ]

  const secondaryCards = [
    {
      title: 'Carousel Images',
      value: stats.carouselImages,
      icon: FiImage,
      color: 'text-purple-700',
    },
    {
      title: 'Full Payments',
      value: stats.fullPaymentCount,
      icon: FiTrendingUp,
      color: 'text-emerald-700',
    },
    {
      title: 'Penalty Payments',
      value: stats.penaltyCount,
      icon: FiActivity,
      color: 'text-amber-700',
    },
    {
      title: 'This Month',
      value: stats.auctionsThisMonth,
      icon: FiBarChart2,
      color: 'text-indigo-700',
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
              className="w-full sm:w-auto px-6 py-3 bg-[#F6F4EB] border-2 border-[#4682A9] text-[#1f3f56] rounded-2xl font-semibold shadow-lg hover:bg-[#ece9dc] transition-all duration-300 flex items-center justify-center gap-2"
            >
              <FiHome className="text-lg" />
              Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-5">
          {primaryCards.map((card, index) => {
            const Icon = card.icon
            return (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{card.title}</p>
                  <div className={`${card.iconBg} p-3 rounded-xl`}>
                    <Icon className={`text-xl ${card.iconText}`} />
                  </div>
                </div>
                {card.loading ? (
                  <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <>
                    <p className="text-4xl font-bold text-gray-900 leading-tight">{card.value}</p>
                    <p className="text-sm text-gray-500 mt-2">{card.hint}</p>
                  </>
                )}
              </div>
            )
          })}
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5 mb-8">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Operational Metrics</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {secondaryCards.map((metric, index) => {
              const Icon = metric.icon
              return (
                <div key={index} className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{metric.title}</p>
                    <Icon className={`text-base ${metric.color}`} />
                  </div>
                  {stats.loading ? (
                    <div className="h-7 w-12 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-black">Latest Conducted Auctions</h3>
            <span className="text-sm text-gray-500">From payment completion history</span>
          </div>
          {stats.latestAuctions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 px-4 py-6 text-center">
              <p className="text-gray-600 text-sm font-medium">No auction history available yet.</p>
              <p className="text-xs text-gray-500 mt-1">Entries will appear here as payment completions are processed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="py-2 pr-3">Product</th>
                    <th className="py-2 pr-3">Winner</th>
                    <th className="py-2 pr-3">Type</th>
                    <th className="py-2 pr-3">Amount</th>
                    <th className="py-2">Conducted</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.latestAuctions.map((auction) => (
                    <tr key={auction.id} className="border-b border-gray-100">
                      <td className="py-3 pr-3 font-medium text-gray-800">{auction.productTitle}</td>
                      <td className="py-3 pr-3 text-gray-600">{auction.winnerEmail || 'N/A'}</td>
                      <td className="py-3 pr-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${auction.paymentType === 'full' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {auction.paymentType}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-gray-800">NPR {Number(auction.winningBidAmount || 0).toFixed(2)}</td>
                      <td className="py-3 text-gray-600">{new Date(auction.conductedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
                    className={`relative flex-shrink-0 px-6 py-4 text-sm font-semibold rounded-2xl border-2 mx-1 transition-all duration-300 min-w-max ${
                      isActive
                        ? 'bg-[#F6F4EB] border-[#4682A9] text-[#1f3f56] shadow-md'
                        : tab.available
                        ? 'bg-[#F6F4EB] border-[#7aa2bf] text-gray-700 hover:bg-[#ece9dc] hover:text-[#1f3f56]'
                        : 'bg-[#f8f8f8] border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
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
