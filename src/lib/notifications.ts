import { IProduct, NotificationEvent, User } from './models'

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'destructive'

export const NotificationTypes = {
  AUCTION_STARTED: 'AUCTION_STARTED',
  AUCTION_ENDED: 'AUCTION_ENDED',
  AUCTION_WON: 'AUCTION_WON',
  USER_REMOVED_FROM_AUCTION: 'USER_REMOVED_FROM_AUCTION',
} as const

type NotificationType = (typeof NotificationTypes)[keyof typeof NotificationTypes]

interface EmitNotificationInput {
  eventType: NotificationType
  title: string
  description?: string
  severity?: NotificationSeverity
  productId?: string | null
  recipientUserId?: string | null
  actionUrl?: string | null
  metadata?: Record<string, unknown>
  dedupeKey?: string
  expiresInHours?: number
}

export async function emitNotification(input: EmitNotificationInput) {
  const expiresAt =
    input.expiresInHours && input.expiresInHours > 0
      ? new Date(Date.now() + input.expiresInHours * 60 * 60 * 1000)
      : null

  return NotificationEvent.create({
    eventType: input.eventType,
    title: input.title,
    description: input.description || null,
    severity: input.severity || 'info',
    productId: input.productId || null,
    recipientUserId: input.recipientUserId || null,
    actionUrl: input.actionUrl || null,
    metadata: input.metadata || {},
    dedupeKey: input.dedupeKey || null,
    expiresAt,
  })
}

export async function emitAuctionStarted(product: IProduct) {
  const productId = product.id || product._id
  if (!productId) return null

  return emitNotification({
    eventType: NotificationTypes.AUCTION_STARTED,
    title: 'Auction session started',
    description: `${product.title} is now live for bidding.`,
    severity: 'info',
    productId,
    actionUrl: `/auction/${productId}`,
    metadata: { productTitle: product.title },
    dedupeKey: `auction-started:${productId}`,
    expiresInHours: 24,
  })
}

export async function emitAuctionEnded(product: IProduct, source: string) {
  const productId = product.id || product._id
  if (!productId) return null

  return emitNotification({
    eventType: NotificationTypes.AUCTION_ENDED,
    title: 'Auction session ended',
    description: `${product.title} is now closed.`,
    severity: 'warning',
    productId,
    actionUrl: '/category',
    metadata: { productTitle: product.title, source },
    dedupeKey: `auction-ended:${productId}`,
    expiresInHours: 24,
  })
}

export async function emitAuctionWon(product: IProduct) {
  const productId = product.id || product._id
  if (!productId) return null

  let winnerUserId = product.highestBidder || null
  if (!winnerUserId && product.highestBidderEmail) {
    const winnerUser = await User.findOne({ email: product.highestBidderEmail.toLowerCase() })
    winnerUserId = winnerUser?.id || winnerUser?._id || null
  }

  if (!winnerUserId) return null

  return emitNotification({
    eventType: NotificationTypes.AUCTION_WON,
    title: 'You won this auction',
    description: `Complete payment for ${product.title}.`,
    severity: 'success',
    productId,
    recipientUserId: winnerUserId,
    actionUrl: `/payment/${productId}`,
    metadata: {
      productTitle: product.title,
      winningBid: product.currentBid || product.startingBid || 0,
    },
    dedupeKey: `auction-won:${productId}:${winnerUserId}`,
    expiresInHours: 24,
  })
}

interface RemovedInput {
  product: IProduct
  userId: string
  userEmail: string
  reason?: string | null
}

export async function emitUserRemovedFromAuction(input: RemovedInput) {
  const productId = input.product.id || input.product._id
  if (!productId) return null

  return emitNotification({
    eventType: NotificationTypes.USER_REMOVED_FROM_AUCTION,
    title: 'Removed from auction session',
    description: input.reason || `You can no longer participate in ${input.product.title}.`,
    severity: 'destructive',
    productId,
    recipientUserId: input.userId,
    actionUrl: '/category',
    metadata: {
      productTitle: input.product.title,
      userEmail: input.userEmail,
      reason: input.reason || null,
    },
    dedupeKey: `user-removed:${productId}:${input.userId}`,
    expiresInHours: 24,
  })
}
