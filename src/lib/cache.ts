type CacheEntry<T> = {
  value: T
  expiresAt: number
}

const memoryCache = new Map<string, CacheEntry<unknown>>()

export async function getCachedValue<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>
): Promise<T> {
  const now = Date.now()
  const existing = memoryCache.get(key)

  if (existing && existing.expiresAt > now) {
    return existing.value as T
  }

  const value = await loader()
  memoryCache.set(key, {
    value,
    expiresAt: now + ttlMs,
  })

  return value
}

export function invalidateCachedValue(key: string) {
  memoryCache.delete(key)
}

export function clearCachedValues() {
  memoryCache.clear()
}