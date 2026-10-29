import type { RecentLink } from '../types'

export const RECENT_LIMIT = 50
const KEY_PREFIX = 'gulp:recent:'

export function recentStorageKey(userId: string): string {
  return `${KEY_PREFIX}${userId}`
}

function isRecentLink(value: unknown): value is RecentLink {
  if (!value || typeof value !== 'object') return false
  const link = value as Partial<RecentLink>
  return (
    typeof link.code === 'string' &&
    typeof link.shortUrl === 'string' &&
    typeof link.originalUrl === 'string' &&
    typeof link.createdAt === 'string'
  )
}

export function readRecentLinks(userId: string): RecentLink[] {
  try {
    const raw = localStorage.getItem(recentStorageKey(userId))
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isRecentLink).slice(0, RECENT_LIMIT)
  } catch {
    return []
  }
}

export function writeRecentLinks(userId: string, links: RecentLink[]): void {
  try {
    localStorage.setItem(recentStorageKey(userId), JSON.stringify(links.slice(0, RECENT_LIMIT)))
  } catch {
    // Quota or private mode — history is a convenience, not a requirement.
  }
}
