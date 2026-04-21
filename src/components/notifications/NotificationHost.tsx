"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

type ToastSeverity = 'info' | 'success' | 'warning' | 'destructive'

interface NotificationEventPayload {
  id: string
  eventType: string
  productId?: string | null
  title: string
  description?: string | null
  severity: ToastSeverity
  actionUrl?: string | null
  metadata?: Record<string, unknown>
  createdAt: string
}

interface ToastItem extends NotificationEventPayload {
  closing?: boolean
}

interface PendingPaymentItem {
  productId: string
  title: string
  winningBid: number
  paymentUrl: string
}

const AUTO_CLOSE_MS = 6000
const MAX_TOASTS = 4

export function NotificationHost() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const dedupeRef = useRef<Set<string>>(new Set())
  const loginToastUserRef = useRef<string | null>(null)

  const scheduleClose = useCallback((id: string) => {
    window.setTimeout(() => {
      setToasts((prev) => prev.map((toast) => (toast.id === id ? { ...toast, closing: true } : toast)))
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
      }, 280)
    }, AUTO_CLOSE_MS)
  }, [])

  const enqueueToast = useCallback((payload: NotificationEventPayload) => {
    if (dedupeRef.current.has(payload.id)) return
    dedupeRef.current.add(payload.id)

    setToasts((prev) => {
      const next: ToastItem[] = [{ ...payload }, ...prev]
      return next.slice(0, MAX_TOASTS)
    })

    scheduleClose(payload.id)

    if (
      payload.eventType === 'USER_REMOVED_FROM_AUCTION' &&
      payload.productId &&
      pathname === `/auction/${payload.productId}`
    ) {
      router.push('/category')
    }
  }, [pathname, router, scheduleClose])

  const closeNow = useCallback((id: string) => {
    setToasts((prev) => prev.map((toast) => (toast.id === id ? { ...toast, closing: true } : toast)))
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 280)
  }, [])

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) {
      return
    }

    if (loginToastUserRef.current !== session.user.id) {
      loginToastUserRef.current = session.user.id
      enqueueToast({
        id: `login-live-${session.user.id}`,
        eventType: 'SYSTEM',
        title: 'Welcome',
        description: 'You will now receive updates in real time.',
        severity: 'info',
        actionUrl: null,
        productId: null,
        createdAt: new Date().toISOString(),
      })
    }

    const stream = new EventSource('/api/notifications/stream')

    const onNotification = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data) as NotificationEventPayload
        enqueueToast(payload)
      } catch (error) {
        console.error('Failed to parse notification event:', error)
      }
    }

    stream.addEventListener('notification', onNotification)

    stream.onerror = () => {
      // EventSource auto-reconnects; keep silent to avoid noisy UX.
    }

    return () => {
      stream.removeEventListener('notification', onNotification)
      stream.close()
    }
  }, [enqueueToast, session?.user?.id, status])

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) {
      return
    }

    let cancelled = false

    const pollPendingPayments = async () => {
      try {
        const response = await fetch('/api/payment/pending', { cache: 'no-store' })
        if (!response.ok) return

        const payload = (await response.json()) as { pending?: PendingPaymentItem[] }
        const pendingItems = Array.isArray(payload.pending) ? payload.pending : []

        for (const item of pendingItems) {
          // Avoid spamming while the user is already on the payment page.
          if (pathname === item.paymentUrl) {
            continue
          }

          enqueueToast({
            id: `pending-payment:${item.productId}`,
            eventType: 'AUCTION_WON',
            productId: item.productId,
            title: 'Payment required for your winning bid',
            description: `${item.title} - Rs. ${Number(item.winningBid || 0).toLocaleString()}`,
            severity: 'warning',
            actionUrl: item.paymentUrl,
            metadata: {},
            createdAt: new Date().toISOString(),
          })
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to poll pending payments:', error)
        }
      }
    }

    void pollPendingPayments()
    const timer = window.setInterval(() => {
      void pollPendingPayments()
    }, 30000)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [enqueueToast, pathname, session?.user?.id, status])

  if (status !== 'authenticated') {
    return null
  }

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[70] flex w-[min(420px,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((toast) => {
        const showAction = Boolean(toast.actionUrl)
        return (
          <div
            key={toast.id}
            className={`toast-card toast-${toast.severity} ${toast.closing ? 'toast-slide-out' : 'toast-slide-in'}`}
          >
            <div className="toast-content">
              <p className="toast-title">{toast.title}</p>
              {toast.description ? <p className="toast-description">{toast.description}</p> : null}
            </div>

            <div className="toast-actions">
              {showAction ? (
                <button
                  className="toast-action-btn"
                  onClick={() => {
                    router.push(toast.actionUrl as string)
                    closeNow(toast.id)
                  }}
                >
                  Open
                </button>
              ) : null}
              <button className="toast-close-btn" onClick={() => closeNow(toast.id)} aria-label="Close notification">
                ×
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
