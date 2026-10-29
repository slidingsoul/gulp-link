import { useCallback, useState } from 'react'
import { ApiError, createShortLink, friendlyApiMessage } from '../lib/api'
import { AuthTokenError, clearJwt, getJwt } from '../lib/auth'
import { SHORT_BASE } from '../lib/env'
import { normalizeUrl } from '../lib/url'
import type { ShortenedLink } from '../types'

export type ShortenState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; code: string; shortUrl: string; originalUrl: string }
  | { status: 'error'; message: string; httpStatus: number | null }

export function useShorten(onUnauthorized: () => void) {
  const [state, setState] = useState<ShortenState>({ status: 'idle' })

  const submit = useCallback(
    async (rawUrl: string): Promise<ShortenedLink | null> => {
      const check = normalizeUrl(rawUrl)
      if (!check.ok) {
        setState({ status: 'error', message: check.message, httpStatus: null })
        return null
      }

      setState({ status: 'loading' })

      try {
        let token = await getJwt()
        let created: { code: string; shortUrl: string }

        try {
          created = await createShortLink(check.url, token)
        } catch (error) {
          // A 15-minute JWT can expire mid-session; refresh once and retry.
          if (error instanceof ApiError && error.status === 401) {
            token = await getJwt(true)
            created = await createShortLink(check.url, token)
          } else {
            throw error
          }
        }

        // VITE_SHORT_BASE_URL is an optional display override (handy in dev
        // when the backend builds links from 127.0.0.1). Otherwise use the
        // canonical link returned by snap-link.
        const shortUrl = SHORT_BASE ? `${SHORT_BASE}/${created.code}` : created.shortUrl
        if (!shortUrl) throw new ApiError('The server sent back an empty link.', 500)

        setState({ status: 'success', code: created.code, shortUrl, originalUrl: check.url })
        return { code: created.code, shortUrl, originalUrl: check.url }
      } catch (error) {
        if (error instanceof AuthTokenError) {
          clearJwt()
          onUnauthorized()
          setState({ status: 'error', message: error.message, httpStatus: 401 })
          return null
        }

        if (error instanceof ApiError) {
          if (error.status === 401) {
            clearJwt()
            onUnauthorized()
          }
          setState({
            status: 'error',
            message: friendlyApiMessage(error),
            httpStatus: error.status,
          })
          return null
        }

        setState({ status: 'error', message: 'Something went wrong. Try again.', httpStatus: null })
        return null
      }
    },
    [onUnauthorized],
  )

  const reset = useCallback(() => setState({ status: 'idle' }), [])

  return { state, submit, reset }
}
