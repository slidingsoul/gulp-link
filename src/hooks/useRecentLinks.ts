import { useCallback, useEffect, useState } from 'react'
import {
  RECENT_LIMIT,
  readRecentLinks,
  recentStorageKey,
  writeRecentLinks,
} from '../lib/storage'
import type { RecentLink } from '../types'

export function useRecentLinks(userId: string | null) {
  const [links, setLinks] = useState<RecentLink[]>([])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- hydrate history from localStorage
    setLinks(userId ? readRecentLinks(userId) : [])
  }, [userId])

  // Keep tabs in sync when the same user shortens a link elsewhere.
  useEffect(() => {
    if (!userId) return
    const key = recentStorageKey(userId)
    const onStorage = (event: StorageEvent) => {
      if (event.key === key) setLinks(readRecentLinks(userId))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [userId])

  const add = useCallback(
    (link: RecentLink) => {
      if (!userId) return
      setLinks((current) => {
        const next = [link, ...current.filter((item) => item.code !== link.code)].slice(
          0,
          RECENT_LIMIT,
        )
        writeRecentLinks(userId, next)
        return next
      })
    },
    [userId],
  )

  const remove = useCallback(
    (code: string) => {
      if (!userId) return
      setLinks((current) => {
        const next = current.filter((item) => item.code !== code)
        writeRecentLinks(userId, next)
        return next
      })
    },
    [userId],
  )

  const clear = useCallback(() => {
    if (!userId) return
    writeRecentLinks(userId, [])
    setLinks([])
  }, [userId])

  return { links, add, remove, clear }
}
