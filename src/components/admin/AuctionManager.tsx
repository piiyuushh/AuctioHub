"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { FiClock, FiRefreshCw, FiSlash, FiUsers } from 'react-icons/fi'
import { AlertDialog } from '@/components/ui/AlertDialog'

interface AdminAuction {
  id: string
  title: string
  description: string
  imageUrl: string
  sellerEmail: string
  auctionStatus: 'active' | 'ended' | 'none'
  auctionEndTime: string | null
  startingBid: number
  currentBid: number
  highestBidder: string | null
  highestBidderEmail: string | null
  totalBids: number
  activeBidderCount: number
  bannedCount: number
}

interface FullBidEntry {
  id: string
  productId: string
  userId: string
  userEmail: string
  bidAmount: number
  isWinning: boolean
  isActive: boolean
  isBanned: boolean
  createdAt: string
}

interface GroupedBidder {
  userId: string
  userEmail: string
  highestBid: number
  latestBidAmount: number
  totalBidEntries: number
  activeBidEntries: number
  latestBidAt: string | null
  isCurrentWinner: boolean
  isBanned: boolean
}

interface BiddersPayload {
  auction: {
    id: string
    title: string
    auctionStatus: string
    auctionEndTime: string | null
    currentBid: number
    highestBidder: string | null
    highestBidderEmail: string | null
    totalBids: number
  }
  fullHistory: FullBidEntry[]
  groupedUsers: GroupedBidder[]
}

type ConfirmAction =
  | { type: 'cancel'; auctionId: string }
  | { type: 'ban'; auctionId: string; userId: string; userEmail: string }
  | null

export default function AuctionManager() {
  const [auctions, setAuctions] = useState<AdminAuction[]>([])
  const [loadingAuctions, setLoadingAuctions] = useState(true)
  const [loadingBidders, setLoadingBidders] = useState(false)
  const [isMutating, setIsMutating] = useState(false)
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(null)
  const [biddersPayload, setBiddersPayload] = useState<BiddersPayload | null>(null)
  const [viewMode, setViewMode] = useState<'grouped' | 'full'>('grouped')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [minutesToAdd, setMinutesToAdd] = useState(10)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)

  const selectedAuction = useMemo(
    () => auctions.find((auction) => auction.id === selectedAuctionId) || null,
    [auctions, selectedAuctionId]
  )

  const showError = useCallback((text: string) => {
    setMessage({ type: 'error', text })
  }, [])

  const showSuccess = useCallback((text: string) => {
    setMessage({ type: 'success', text })
  }, [])

  const fetchAuctions = useCallback(async () => {
    try {
      setLoadingAuctions(true)
      const response = await fetch('/api/admin/auction')
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to load auctions')
      }

      const data: AdminAuction[] = await response.json()
      setAuctions(data)

      if (data.length === 0) {
        setSelectedAuctionId(null)
        setBiddersPayload(null)
        return
      }

      if (!selectedAuctionId || !data.some((auction) => auction.id === selectedAuctionId)) {
        setSelectedAuctionId(data[0].id)
      }
    } catch (error) {
      console.error('Error loading auctions:', error)
      showError(error instanceof Error ? error.message : 'Failed to load auctions')
    } finally {
      setLoadingAuctions(false)
    }
  }, [selectedAuctionId, showError])

  const fetchBidders = useCallback(async (auctionId: string) => {
    try {
      setLoadingBidders(true)
      const response = await fetch(`/api/admin/auction/${auctionId}/bidders`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to load bidders')
      }

      const data: BiddersPayload = await response.json()
      setBiddersPayload(data)
    } catch (error) {
      console.error('Error loading bidders:', error)
      showError(error instanceof Error ? error.message : 'Failed to load bidders')
    } finally {
      setLoadingBidders(false)
    }
  }, [showError])

  useEffect(() => {
    void fetchAuctions()
  }, [fetchAuctions])

  useEffect(() => {
    if (!selectedAuctionId) {
      setBiddersPayload(null)
      return
    }

    void fetchBidders(selectedAuctionId)
  }, [selectedAuctionId, fetchBidders])

  const refreshSelectedAuction = async () => {
    if (!selectedAuctionId) return

    await Promise.all([fetchAuctions(), fetchBidders(selectedAuctionId)])
  }

  const extendAuction = async (minutes: number) => {
    if (!selectedAuctionId || minutes <= 0) {
      return
    }

    try {
      setIsMutating(true)
      const response = await fetch(`/api/admin/auction/${selectedAuctionId}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutesToAdd: minutes })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to extend auction')
      }

      showSuccess(`Auction timer extended by ${minutes} minutes`)
      await refreshSelectedAuction()
    } catch (error) {
      console.error('Error extending auction:', error)
      showError(error instanceof Error ? error.message : 'Failed to extend auction')
    } finally {
      setIsMutating(false)
    }
  }

  const cancelAuction = async (auctionId: string) => {
    try {
      setIsMutating(true)
      const response = await fetch(`/api/admin/auction/${auctionId}/cancel`, {
        method: 'POST'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to cancel auction')
      }

      showSuccess('Auction was cancelled and unpublished')
      setConfirmAction(null)
      await fetchAuctions()
    } catch (error) {
      console.error('Error cancelling auction:', error)
      showError(error instanceof Error ? error.message : 'Failed to cancel auction')
    } finally {
      setIsMutating(false)
    }
  }

  const banBidder = async (auctionId: string, userId: string, userEmail: string) => {
    try {
      setIsMutating(true)
      const response = await fetch(`/api/admin/auction/${auctionId}/bidders/${userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Removed by admin from active auction session' })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to remove bidder')
      }

      showSuccess(`${userEmail} was removed and banned from this auction`)
      setConfirmAction(null)
      await refreshSelectedAuction()
    } catch (error) {
      console.error('Error banning bidder:', error)
      showError(error instanceof Error ? error.message : 'Failed to remove bidder')
    } finally {
      setIsMutating(false)
    }
  }

  const formatDateTime = (value: string | null | undefined) => {
    if (!value) return 'N/A'
    return new Date(value).toLocaleString()
  }

  const renderGroupedUsers = () => {
    if (!biddersPayload || biddersPayload.groupedUsers.length === 0) {
      return <p className="text-sm text-gray-500">No bidders available for this auction.</p>
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="text-left border-b border-gray-200">
              <th className="py-2 pr-3">User</th>
              <th className="py-2 pr-3">Highest Bid</th>
              <th className="py-2 pr-3">Latest Bid</th>
              <th className="py-2 pr-3">Entries</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {biddersPayload.groupedUsers.map((user) => (
              <tr key={user.userId} className="border-b border-gray-100">
                <td className="py-3 pr-3 text-gray-700">{user.userEmail}</td>
                <td className="py-3 pr-3 font-semibold text-gray-900">NPR {Number(user.highestBid || 0).toFixed(2)}</td>
                <td className="py-3 pr-3 text-gray-700">NPR {Number(user.latestBidAmount || 0).toFixed(2)}</td>
                <td className="py-3 pr-3 text-gray-700">{user.activeBidEntries} active / {user.totalBidEntries} total</td>
                <td className="py-3 pr-3">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                      user.isBanned
                        ? 'bg-red-100 text-red-700'
                        : user.isCurrentWinner
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {user.isBanned ? 'Banned' : user.isCurrentWinner ? 'Current Winner' : 'Active'}
                  </span>
                </td>
                <td className="py-3">
                  {user.isBanned ? (
                    <span className="text-xs text-gray-500">Already removed</span>
                  ) : (
                    <button
                      onClick={() =>
                        setConfirmAction({
                          type: 'ban',
                          auctionId: selectedAuctionId!,
                          userId: user.userId,
                          userEmail: user.userEmail
                        })
                      }
                      disabled={isMutating}
                      className="px-3 py-1.5 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                    >
                      Remove User
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderFullHistory = () => {
    if (!biddersPayload || biddersPayload.fullHistory.length === 0) {
      return <p className="text-sm text-gray-500">No bid history available for this auction.</p>
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="text-left border-b border-gray-200">
              <th className="py-2 pr-3">Bidder</th>
              <th className="py-2 pr-3">Amount</th>
              <th className="py-2 pr-3">Time</th>
              <th className="py-2 pr-3">Winning</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {biddersPayload.fullHistory.map((bid) => (
              <tr key={bid.id} className="border-b border-gray-100">
                <td className="py-3 pr-3 text-gray-700">{bid.userEmail}</td>
                <td className="py-3 pr-3 font-semibold text-gray-900">NPR {Number(bid.bidAmount || 0).toFixed(2)}</td>
                <td className="py-3 pr-3 text-gray-600">{formatDateTime(bid.createdAt)}</td>
                <td className="py-3 pr-3 text-gray-700">{bid.isWinning ? 'Yes' : 'No'}</td>
                <td className="py-3">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                      bid.isBanned
                        ? 'bg-red-100 text-red-700'
                        : bid.isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {bid.isBanned ? 'Banned' : bid.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`px-4 py-3 rounded-xl border text-sm ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 xl:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Auctions</h3>
            <button
              onClick={() => void fetchAuctions()}
              disabled={loadingAuctions}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-60"
            >
              <FiRefreshCw className={`${loadingAuctions ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {loadingAuctions ? (
            <p className="text-sm text-gray-500">Loading auctions...</p>
          ) : auctions.length === 0 ? (
            <p className="text-sm text-gray-500">No active auctions found.</p>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {auctions.map((auction) => {
                const isSelected = selectedAuctionId === auction.id
                return (
                  <button
                    key={auction.id}
                    onClick={() => setSelectedAuctionId(auction.id)}
                    className={`w-full text-left rounded-xl border px-4 py-3 transition-all ${
                      isSelected
                        ? 'border-[#4682A9] bg-[#f2f7fb]'
                        : 'border-gray-200 bg-white hover:border-[#9ebcd0]'
                    }`}
                  >
                    <p className="font-semibold text-gray-900 truncate">{auction.title}</p>
                    <p className="text-xs text-gray-500 mt-1 truncate">Seller: {auction.sellerEmail}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <FiUsers /> {auction.activeBidderCount}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FiClock /> {formatDateTime(auction.auctionEndTime)}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 xl:col-span-2">
          {!selectedAuction ? (
            <p className="text-sm text-gray-500">Select an auction to manage session controls.</p>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedAuction.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedAuction.description}</p>
                  <p className="text-sm text-gray-600 mt-2">Seller: {selectedAuction.sellerEmail}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
                    <p className="text-xs text-gray-500">Current Bid</p>
                    <p className="font-semibold text-gray-900">NPR {Number(selectedAuction.currentBid || 0).toFixed(2)}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
                    <p className="text-xs text-gray-500">Auction Ends</p>
                    <p className="font-semibold text-gray-900">{formatDateTime(selectedAuction.auctionEndTime)}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Session Controls</h4>
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 items-start sm:items-center">
                  <button
                    onClick={() => void extendAuction(5)}
                    disabled={isMutating}
                    className="px-4 py-2 rounded-lg border border-[#4682A9] bg-white text-[#1f3f56] hover:bg-[#f2f7fb] disabled:opacity-60"
                  >
                    +5m
                  </button>
                  <button
                    onClick={() => void extendAuction(10)}
                    disabled={isMutating}
                    className="px-4 py-2 rounded-lg border border-[#4682A9] bg-white text-[#1f3f56] hover:bg-[#f2f7fb] disabled:opacity-60"
                  >
                    +10m
                  </button>
                  <button
                    onClick={() => void extendAuction(30)}
                    disabled={isMutating}
                    className="px-4 py-2 rounded-lg border border-[#4682A9] bg-white text-[#1f3f56] hover:bg-[#f2f7fb] disabled:opacity-60"
                  >
                    +30m
                  </button>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={minutesToAdd}
                      onChange={(event) => setMinutesToAdd(Number(event.target.value || 0))}
                      className="w-24 px-3 py-2 rounded-lg border border-gray-300 text-sm"
                    />
                    <button
                      onClick={() => void extendAuction(minutesToAdd)}
                      disabled={isMutating || minutesToAdd <= 0}
                      className="px-4 py-2 rounded-lg border border-[#4682A9] bg-white text-[#1f3f56] hover:bg-[#f2f7fb] disabled:opacity-60"
                    >
                      Add Minutes
                    </button>
                  </div>
                  <button
                    onClick={() => setConfirmAction({ type: 'cancel', auctionId: selectedAuction.id })}
                    disabled={isMutating}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 inline-flex items-center gap-2"
                  >
                    <FiSlash /> Cancel Auction Now
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Bidders</h4>
                  <div className="inline-flex rounded-lg bg-gray-100 p-1">
                    <button
                      onClick={() => setViewMode('grouped')}
                      className={`px-3 py-1.5 text-sm rounded-md ${viewMode === 'grouped' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'}`}
                    >
                      Grouped Users
                    </button>
                    <button
                      onClick={() => setViewMode('full')}
                      className={`px-3 py-1.5 text-sm rounded-md ${viewMode === 'full' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'}`}
                    >
                      Full History
                    </button>
                  </div>
                </div>

                {loadingBidders ? (
                  <p className="text-sm text-gray-500">Loading bidders...</p>
                ) : viewMode === 'grouped' ? (
                  renderGroupedUsers()
                ) : (
                  renderFullHistory()
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertDialog
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmAction(null)
          }
        }}
        title={confirmAction?.type === 'cancel' ? 'Cancel Auction Session?' : 'Remove User From Auction?'}
        description={
          confirmAction?.type === 'cancel'
            ? 'This will immediately end the auction and unpublish the listing from the marketplace.'
            : `This will remove ${confirmAction?.type === 'ban' ? confirmAction.userEmail : 'this user'} from the auction and prevent further participation in this session.`
        }
        confirmText={confirmAction?.type === 'cancel' ? 'Cancel Auction' : 'Remove User'}
        cancelText="Back"
        variant="destructive"
        onConfirm={async () => {
          if (!confirmAction) return

          if (confirmAction.type === 'cancel') {
            await cancelAuction(confirmAction.auctionId)
            return
          }

          await banBidder(confirmAction.auctionId, confirmAction.userId, confirmAction.userEmail)
        }}
      />
    </div>
  )
}
