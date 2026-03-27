import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NotificationEvent } from '@/lib/models'

export const runtime = 'nodejs'

function toSse(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id
  const encoder = new TextEncoder()
  let lastSeenAt = new Date()

  const stream = new ReadableStream({
    start(controller) {
      let closed = false

      const send = (event: string, payload: unknown) => {
        if (closed) return
        controller.enqueue(encoder.encode(toSse(event, payload)))
      }

      const close = () => {
        if (closed) return
        closed = true
        clearInterval(pollTimer)
        clearInterval(heartbeatTimer)
        try {
          controller.close()
        } catch {
          // no-op
        }
      }

      const poll = async () => {
        try {
          const events = await NotificationEvent.findForUserSince({
            recipientUserId: userId,
            since: lastSeenAt,
            limit: 25,
          })

          if (events.length === 0) return

          for (const event of events) {
            send('notification', event)
          }

          const newest = events[events.length - 1]?.createdAt
          if (newest) {
            lastSeenAt = new Date(newest)
          }
        } catch (error) {
          console.error('Notification polling error:', error)
        }
      }

      send('connected', { ok: true, ts: new Date().toISOString() })

      const pollTimer = setInterval(() => {
        void poll()
      }, 3000)

      const heartbeatTimer = setInterval(() => {
        send('heartbeat', { ts: new Date().toISOString() })
      }, 15000)

      request.signal.addEventListener('abort', close)
      void poll()
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
