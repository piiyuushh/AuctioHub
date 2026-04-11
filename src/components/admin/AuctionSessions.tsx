"use client"

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { FiCalendar, FiChevronLeft, FiChevronRight, FiCreditCard, FiFilter, FiSearch, FiTag, FiUser } from 'react-icons/fi'

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

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#dae8f2] bg-[linear-gradient(140deg,#f6fbff,#eef6fb_50%,#f8f4eb)] p-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-xl bg-white/80 p-4 border border-[#d9e7f2]">
            <p className="text-xs uppercase tracking-wide text-[#4d7390] font-semibold">Full Payments</p>
            <p className="text-2xl font-bold text-[#1f3f56] mt-2">{totals.fullCount}</p>
          </div>
          <div className="rounded-xl bg-white/80 p-4 border border-[#d9e7f2]">
            <p className="text-xs uppercase tracking-wide text-[#4d7390] font-semibold">Penalty Payments</p>
            <p className="text-2xl font-bold text-[#1f3f56] mt-2">{totals.penaltyCount}</p>
          </div>
          <div className="rounded-xl bg-white/80 p-4 border border-[#d9e7f2]">
            <p className="text-xs uppercase tracking-wide text-[#4d7390] font-semibold">Visible Volume</p>
            <p className="text-2xl font-bold text-[#1f3f56] mt-2">NPR {totals.sum.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="md:col-span-2 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product or winner"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#4682A9] bg-white"
          />
        </label>
        <label className="relative">
          <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <select
            value={paymentType}
            onChange={(e) => {
              setPaymentType(e.target.value as 'all' | 'full' | 'penalty')
              setPagination((prev) => ({ ...prev, page: 1 }))
            }}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#4682A9] bg-white"
          >
            <option value="all">All payment types</option>
            <option value="full">Full</option>
            <option value="penalty">Penalty</option>
          </select>
        </label>
      </div>

      {loading ? (
        <div className="py-16 text-center text-gray-600">Loading auction sessions...</div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-gray-300 rounded-2xl text-gray-600">
          No auction sessions found for current filters.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {items.map((item) => (
              <article key={item.id} className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative h-44 sm:h-auto sm:w-44 flex-shrink-0 bg-gray-100">
                    {item.productImageUrl ? (
                      <Image src={item.productImageUrl} alt={item.productTitle} fill className="object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-sm text-gray-500">No image</div>
                    )}
                  </div>
                  <div className="flex-1 p-4 space-y-3">
                    <h4 className="text-lg font-bold text-gray-900 line-clamp-2">{item.productTitle}</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#e9f2f8] text-[#295776]">
                        <FiTag />
                        {CATEGORY_LABELS[item.category || ''] || 'Uncategorized'}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${item.paymentType === 'full' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        <FiCreditCard />
                        {item.paymentType}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <p className="text-gray-700 inline-flex items-center gap-2"><FiUser /> {item.winnerEmail || 'No winner'}</p>
                      <p className="text-gray-700 inline-flex items-center gap-2"><FiCalendar /> {new Date(item.conductedAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Outcome: {item.outcomeStatus}</p>
                      <p className="font-bold text-[#1f3f56]">NPR {item.winningBidAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={prevPage}
                disabled={pagination.page <= 1}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50"
              >
                <FiChevronLeft /> Prev
              </button>
              <button
                onClick={nextPage}
                disabled={pagination.page >= pagination.totalPages}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50"
              >
                Next <FiChevronRight />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
