import { IProduct, Product } from './models'
import { emitAuctionEnded, emitAuctionWon } from './notifications'

function isExpiredActiveAuction(product: IProduct): boolean {
  if (!product.hasAuction || product.auctionStatus !== 'active' || !product.auctionEndTime) {
    return false
  }

  return new Date(product.auctionEndTime).getTime() <= Date.now()
}

export async function finalizeAuctionIfExpired(product: IProduct, source: string): Promise<IProduct> {
  const productId = product.id || product._id
  if (!productId || !isExpiredActiveAuction(product)) {
    return product
  }

  const updated = await Product.findByIdAndUpdate(productId, {
    auctionStatus: 'ended',
    auctionEndTime: new Date(),
  })

  const finalized = updated || product

  await Promise.all([
    emitAuctionEnded(finalized, source),
    emitAuctionWon(finalized),
  ])

  return finalized
}

export async function finalizeExpiredAuctionsForList(products: IProduct[], source: string): Promise<boolean> {
  const expired = products.filter((product) => isExpiredActiveAuction(product))
  if (expired.length === 0) {
    return false
  }

  await Promise.all(expired.map((product) => finalizeAuctionIfExpired(product, source)))
  return true
}
