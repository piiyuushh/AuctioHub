import { CarouselImage, NewArrival } from '@/lib/models'
import { getCachedValue } from '@/lib/cache'

export type PublicCarouselImage = {
  url: string
}

export type PublicNewArrival = {
  _id?: string
  title: string
  description: string
  imageUrl: string
  link: string
  order: number
  isActive: boolean
}

const PUBLIC_CONTENT_TTL_MS = 5 * 60 * 1000

async function resolveWithFallback<T>(loader: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await loader()
  } catch (error) {
    console.warn('Public content fallback used:', error instanceof Error ? error.message : error)
    return fallback
  }
}

export async function getPublicCarouselImages(): Promise<PublicCarouselImage[]> {
  return resolveWithFallback(
    () => getCachedValue('public-carousel-images', PUBLIC_CONTENT_TTL_MS, async () => {
      const images = await CarouselImage.find({ isActive: true })
      return images.map((image) => ({ url: image.url }))
    }),
    []
  )
}

export async function getPublicNewArrivals(): Promise<PublicNewArrival[]> {
  return resolveWithFallback(
    () => getCachedValue('public-new-arrivals', PUBLIC_CONTENT_TTL_MS, async () => {
      const allProducts = await NewArrival.find({ isActive: true })
      return allProducts.slice(0, 4)
    }),
    []
  )
}