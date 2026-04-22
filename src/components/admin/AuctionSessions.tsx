"use client"

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiCreditCard,
  FiFilter,
  FiLayers,
  FiPackage,
  FiSearch,
  FiTag,
  FiUser,
} from 'react-icons/fi'

type SessionItem = {
  id: string
  productId: string
  productTitle: string
  productImageUrl: string | null
  category: string | null
  winnerEmail: string | null
  winningBidAmount: number
  paymentType: 'full' | 'penalty'
  outcomeStatus: 'completed' | 'penalty_paid' | 'relisted'
  conductedAt: string
}

type Pagination = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

const CATEGORY_LABELS: Record<string, string> = {
  electronics: 'Electronics',
  collectibles: 'Collectibles',
  'luxury goods': 'Luxury Goods',
  'real estate and property': 'Real Estate and Property',
  furniture: 'Furniture',
}

export default function AuctionSessions() {
  const [items, setItems] = useState<SessionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [paymentType, setPaymentType] = useState<'all' | 'full' | 'penalty'>('all')
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 8, total: 0, totalPages: 1 })

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPagination((prev) => ({ ...prev, page: 1 }))
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set('page', String(pagination.page))
        params.set('pageSize', String(pagination.pageSize))

        if (paymentType !== 'all') {
          params.set('paymentType', paymentType)
        }

        if (debouncedSearch) {
          params.set('search', debouncedSearch)
        }

        const response = await fetch(`/api/admin/auction-sessions?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Failed to fetch sessions')
        }

        const data = await response.json()
        setItems(data.items || [])
        setPagination(data.pagination)
      } catch (error) {
        console.error(error)
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [debouncedSearch, paymentType, pagination.page, pagination.pageSize])

  const totals = useMemo(() => {
    const fullCount = items.filter((item) => item.paymentType === 'full').length
    const penaltyCount = items.filter((item) => item.paymentType === 'penalty').length
    const sum = items.reduce((acc, item) => acc + item.winningBidAmount, 0)
    return { fullCount, penaltyCount, sum }
  }, [items])

  const nextPage = () => {
    if (pagination.page < pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
    }
  }

  const prevPage = () => {
    if (pagination.page > 1) {
      setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
    }
  }

  const formatDateTime = (value: string) => {
    const date = new Date(value)
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#d4e2ed] bg-[radial-gradient(circle_at_top_right,#f8f4eb_0%,#edf5fb_38%,#f6fbff_100%)] p-5 sm:p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white p-4 border border-[#dce8f2] shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#4d7390] font-semibold">Full Payments</p>
              <FiCreditCard className="text-[#5a8dad]" />
            </div>
            <p className="text-3xl font-bold text-[#1f3f56] mt-2 leading-none">{totals.fullCount}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 border border-[#dce8f2] shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#4d7390] font-semibold">Penalty Payments</p>
              <FiLayers className="text-[#5a8dad]" />
            </div>
            <p className="text-3xl font-bold text-[#1f3f56] mt-2 leading-none">{totals.penaltyCount}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 border border-[#dce8f2] shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#4d7390] font-semibold">Visible Volume</p>
              <FiPackage className="text-[#5a8dad]" />
            </div>
            <p className="text-3xl font-bold text-[#1f3f56] mt-2 leading-none">NPR {totals.sum.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="md:col-span-2 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product or winner"
            className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-[#d5dce2] focus:outline-none focus:ring-2 focus:ring-[#7ca8c7]/35 focus:border-[#4682A9] bg-white shadow-sm"
          />
        </label>
        <label className="relative">
          <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={paymentType}
            onChange={(e) => {
              setPaymentType(e.target.value as 'all' | 'full' | 'penalty')
              setPagination((prev) => ({ ...prev, page: 1 }))
            }}
            className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-[#d5dce2] focus:outline-none focus:ring-2 focus:ring-[#7ca8c7]/35 focus:border-[#4682A9] bg-white shadow-sm"
          >
            <option value="all">All payment types</option>
            <option value="full">Full</option>
            <option value="penalty">Penalty</option>
          </select>
        </label>
      </div>

      {loading ? (
        <div className="py-16 text-center text-gray-600 rounded-2xl border border-dashed border-[#cfd8df] bg-white">
          Loading auction sessions...
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-[#cfd8df] rounded-2xl text-gray-600 bg-white">
          No auction sessions found for current filters.
        </div>
      ) : (
        <>
          <div className="rounded-3xl border border-[#d9e2e9] bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr className="bg-[#f6fafc] border-b border-[#e6edf2]">
                    <th className="text-left text-[11px] uppercase tracking-[0.16em] text-[#5b7990] font-semibold px-4 py-3">Product</th>
                    <th className="text-left text-[11px] uppercase tracking-[0.16em] text-[#5b7990] font-semibold px-4 py-3">Winner</th>
                    <th className="text-left text-[11px] uppercase tracking-[0.16em] text-[#5b7990] font-semibold px-4 py-3">Payment Type</th>
                    <th className="text-left text-[11px] uppercase tracking-[0.16em] text-[#5b7990] font-semibold px-4 py-3">Outcome</th>
                    <th className="text-left text-[11px] uppercase tracking-[0.16em] text-[#5b7990] font-semibold px-4 py-3">Conducted At</th>
                    <th className="text-right text-[11px] uppercase tracking-[0.16em] text-[#5b7990] font-semibold px-4 py-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-[#edf1f4] last:border-0 hover:bg-[#fbfdff] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-[280px]">
                          <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-[#d8e3ec]">
                            {item.productImageUrl ? (
                              <Image src={item.productImageUrl} alt={item.productTitle} fill className="object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-500">No image</div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#1f2f3d] truncate">{item.productTitle}</p>
                            <span className="mt-1 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#e7f1f8] text-[#245676] font-medium">
                              <FiTag />
                              {CATEGORY_LABELS[item.category || ''] || 'Uncategorized'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#3f5568]">
                        <div className="inline-flex items-center gap-2 min-w-[180px]">
                          <FiUser className="text-[#6a8295] shrink-0" />
                          <span className="truncate">{item.winnerEmail || 'No winner assigned'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${item.paymentType === 'full' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
                        >
                          <FiCreditCard />
                          {item.paymentType === 'full' ? 'Full Payment' : 'Penalty Payment'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center rounded-full bg-[#f0f4f7] text-[#4a5f70] px-2.5 py-1 capitalize">
                          {item.outcomeStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#3f5568]">
                        <div className="inline-flex items-center gap-2 whitespace-nowrap">
                          <FiCalendar className="text-[#6a8295] shrink-0" />
                          <span>{formatDateTime(item.conductedAt)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <p className="text-2xl font-extrabold text-[#1f3f56] leading-none">NPR {item.winningBidAmount.toFixed(2)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </>
      )}
    </div>
  )
}
