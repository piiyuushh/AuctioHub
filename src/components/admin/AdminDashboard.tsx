"use client"

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import CarouselManager from './CarouselManager'
import UserManager from './UserManager'
import NewArrivalsManager from './NewArrivalsManager'
import AuctionManager from './AuctionManager'
import AuctionSessions from './AuctionSessions'
import { FiHome, FiUsers, FiImage, FiPackage, FiSettings, FiActivity, FiTrendingUp, FiShoppingBag, FiBarChart2, FiDownload } from 'react-icons/fi'
import { exportDashboardPdf } from '@/lib/pdf-export'
import { AlertDialog } from '@/components/ui/AlertDialog'

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [dashboardSection, setDashboardSection] = useState<'stats' | 'controls'>('stats')
  const [activeTab, setActiveTab] = useState('carousel')
  const [exportScope, setExportScope] = useState<'full' | 'stats' | 'controls'>('full')
  const [isExporting, setIsExporting] = useState(false)
  const [alertDialog, setAlertDialog] = useState({ open: false, message: '' })
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
  const reportRootRef = useRef<HTMLDivElement | null>(null)
  const statsSectionRef = useRef<HTMLDivElement | null>(null)
  const controlsSectionRef = useRef<HTMLDivElement | null>(null)
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

  const handleExport = async () => {
    if (!reportRootRef.current) {
      return
    }

    const previousSection = dashboardSection
    setIsExporting(true)

    try {
      const waitForSectionRender = async () => {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      }

      const waitForSectionReady = async (
        getElement: () => HTMLElement | null,
        timeoutMs = 10000,
        stableMs = 500
      ) => {
        const startTime = Date.now()
        let settledSince = Date.now()

        while (Date.now() - startTime < timeoutMs) {
          const section = getElement()
          if (section) {
            const hasLoadingIndicators = Boolean(
              section.querySelector('.animate-pulse, [aria-busy="true"], [data-loading="true"]')
            )

            if (!hasLoadingIndicators) {
              if (Date.now() - settledSince >= stableMs) {
                return
              }
            } else {
              settledSince = Date.now()
            }
          }

          await new Promise<void>((resolve) => setTimeout(resolve, 120))
        }
      }

      const prepareStats = async () => {
        setDashboardSection('stats')
        await waitForSectionRender()
        await waitForSectionReady(() => statsSectionRef.current, 4000, 250)
      }

      const prepareControls = async () => {
        setDashboardSection('controls')
        await waitForSectionRender()
        await waitForSectionReady(() => controlsSectionRef.current, 12000, 700)
      }

      const sections: Array<{
        getElement: () => HTMLElement | null
        beforeCapture: () => Promise<void>
        startOnNewPage?: boolean
      }> = []

      if (exportScope === 'stats') {
        sections.push({
          getElement: () => statsSectionRef.current,
          beforeCapture: prepareStats,
        })
      } else if (exportScope === 'controls') {
        sections.push({
          getElement: () => controlsSectionRef.current,
          beforeCapture: prepareControls,
        })
      } else {
        sections.push({
          getElement: () => statsSectionRef.current,
          beforeCapture: prepareStats,
        })

        sections.push({
          getElement: () => controlsSectionRef.current,
          beforeCapture: prepareControls,
          startOnNewPage: true,
        })
      }

      await exportDashboardPdf({
        filePrefix: 'admin-report',
        rootElement: reportRootRef.current,
        cover: {
          title: 'Admin Report',
          subtitle: 'System overview',
          generatedAt: new Date(),
          identityLines: [
            `Admin: ${session?.user?.name || 'Administrator'}`,
            `Email: ${session?.user?.email || 'N/A'}`,
            `Scope: ${exportScope === 'full' ? 'Full dashboard' : exportScope}`,
            `Active tab: ${activeTab}`,
          ],
        },
        sections,
      })
    } catch (error) {
      console.error('Admin report export failed:', error)
      setAlertDialog({ open: true, message: 'Failed to export report. Please try again.' })
    } finally {
      setDashboardSection(previousSection)
      setIsExporting(false)
    }
  }

  const tabs = [
    { id: 'carousel', label: 'Carousel', icon: FiImage, available: true, color: 'blue' },
    { id: 'newarrivals', label: 'New Arrivals', icon: FiTrendingUp, available: true, color: 'green' },
    { id: 'users', label: 'Users', icon: FiUsers, available: true, color: 'purple' },
    { id: 'auction', label: 'Auction', icon: FiPackage, available: true, color: 'orange' },
    { id: 'sessions', label: 'Auction Sessions', icon: FiBarChart2, available: true, color: 'cyan' },
    { id: 'settings', label: 'Settings', icon: FiSettings, available: false, color: 'gray' },
  ]

  const sectionItems = [
    { id: 'stats' as const, label: 'Statistics', icon: FiBarChart2 },
    { id: 'controls' as const, label: 'Admin Controls', icon: FiSettings },
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

  const exportScopeLabel = exportScope === 'full' ? 'Full Report' : exportScope === 'stats' ? 'Stats Report' : 'Controls Report'
  
  return (
    <div ref={reportRootRef} className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,#e8f2fa,transparent_30%),radial-gradient(circle_at_90%_0%,#f2efe4,transparent_25%),#f4f6f8]">
      {/* Header */}
      <div className="bg-[linear-gradient(120deg,#3d7496,#4f8bb1)] shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
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
                <p className="text-sm text-blue-100 mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Platform Management Console
                </p>
              </div>
            </div>
            <div className="w-full lg:w-auto flex items-center gap-2">
              <button
                onClick={navigateToHome}
                className="w-full cursor-pointer sm:w-auto px-5 py-2.5 bg-[#F6F4EB] border border-[#d6d2c2] text-[#1f3f56] rounded-xl font-semibold shadow hover:bg-[#ece9dc] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <FiHome className="text-lg" />
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">
          <aside className="rounded-2xl border border-[#d7e4ee] bg-white p-5 h-fit xl:sticky xl:top-24 shadow-sm">
            <h3 className="text-xs uppercase tracking-[0.14em] text-[#5f7f95] font-bold mb-3">Workspace</h3>
            <div className="space-y-2">
              {sectionItems.map((sectionItem) => {
                const Icon = sectionItem.icon
                const isActive = dashboardSection === sectionItem.id
                return (
                  <button
                    key={sectionItem.id}
                    onClick={() => setDashboardSection(sectionItem.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                      isActive ? 'bg-[#e8f1f7] border-[#8cb5cf] text-[#1f3f56] shadow-sm' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon />
                    {sectionItem.label}
                  </button>
                )
              })}
            </div>

            <div className="mt-5 pt-5 border-t border-gray-200 space-y-3">
              <h4 className="text-xs uppercase tracking-[0.14em] text-[#5f7f95] font-bold">Report Tools</h4>
              <label className="text-xs font-semibold text-gray-600 block">Export scope</label>
              <select
                value={exportScope}
                onChange={(e) => setExportScope(e.target.value as 'full' | 'stats' | 'controls')}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-sm"
              >
                <option value="full">Full dashboard</option>
                <option value="stats">Statistics page</option>
                <option value="controls">Controls page</option>
              </select>

              <button
                onClick={handleExport}
                disabled={isExporting || stats.loading}
                className="w-full px-4 py-2.5 bg-[#1f3f56] text-white rounded-xl font-semibold shadow hover:bg-[#193246] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <FiDownload className="text-lg" />
                {isExporting ? 'Exporting...' : `Export ${exportScopeLabel}`}
              </button>
            </div>
          </aside>

          <main className="space-y-5">
            <div className="rounded-2xl border border-[#d9e6ef] bg-white px-5 py-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#5f7f95] font-bold">Current Section</p>
                <p className="text-xl font-bold text-[#1f3f56]">{dashboardSection === 'stats' ? 'Platform Statistics' : 'Operational Controls'}</p>
              </div>
              <p className="text-sm text-gray-600">{dashboardSection === 'stats' ? 'Monitor performance and latest auction outcomes.' : 'Manage content, users, live auctions, and historical sessions.'}</p>
            </div>

            {dashboardSection === 'stats' && (
              <div ref={statsSectionRef} className="space-y-0">
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
              </div>
            )}

            {dashboardSection === 'controls' && (
              <div ref={controlsSectionRef} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto scrollbar-hide" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => tab.available && setActiveTab(tab.id)}
                    disabled={!tab.available}
                    className={`relative flex-shrink-0 px-6 py-4 text-sm font-semibold transition-all duration-300 min-w-max flex items-center space-x-2 border-b-2 ${
                      isActive
                        ? 'text-[#4682A9] border-b-[#4682A9]'
                        : tab.available
                        ? 'text-gray-600 border-b-transparent hover:text-[#4682A9] hover:bg-gray-50'
                        : 'text-gray-400 border-b-transparent cursor-not-allowed opacity-50'
                    }`}
                  >
                    <Icon className="text-lg" />
                    <span>{tab.label}</span>
                    {!tab.available && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full ml-1">
                        Soon
                      </span>
                    )}
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
            
            {activeTab === 'auction' && (
              <div>
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <FiPackage className="text-2xl text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-black">Auction Management</h2>
                      <p className="text-sm text-gray-600 mt-1">Monitor active auctions, manage bidders, and control session timing</p>
                    </div>
                  </div>
                </div>
                <AuctionManager />
              </div>
            )}

            {activeTab === 'sessions' && (
              <div>
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-cyan-100 rounded-xl">
                      <FiBarChart2 className="text-2xl text-cyan-700" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-black">Auction Sessions</h2>
                      <p className="text-sm text-gray-600 mt-1">Explore completed sessions, winners, and payment outcomes</p>
                    </div>
                  </div>
                </div>
                <AuctionSessions />
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
            )}
          </main>
        </div>
      </div>
      
      <AlertDialog
        open={alertDialog.open}
        onOpenChange={(open) => setAlertDialog({ ...alertDialog, open })}
        title="Error"
        description={alertDialog.message}
        confirmText="Close"
        variant="destructive"
      />

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
