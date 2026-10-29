const rawAuthUrl = (import.meta.env.VITE_NEON_AUTH_URL ?? '').trim()
const authMode = import.meta.env.VITE_AUTH_MODE ?? 'proxy'

/**
 * In proxy mode the browser talks to the app's own origin and the server (Vite
 * in dev/preview, a reverse proxy in production) forwards /auth to Neon. This
 * keeps the session cookie same-origin. Better Auth requires an absolute base
 * URL, so build it from the current origin. Direct mode talks to Neon itself.
 */
const currentOrigin =
  typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'

export const AUTH_BASE_URL =
  authMode === 'proxy' ? `${currentOrigin}/auth` : rawAuthUrl || '/auth'

export const API_BASE = (import.meta.env.VITE_API_BASE || '/api').replace(/\/+$/, '')

/**
 * Optional override for the origin used when displaying/copying short links.
 * When empty, the app uses the canonical `link` returned by POST /snap.
 */
export const SHORT_BASE = (import.meta.env.VITE_SHORT_BASE_URL || '').replace(/\/+$/, '')

export const CONFIG_ERROR = rawAuthUrl
  ? null
  : 'VITE_NEON_AUTH_URL is missing. Add it to .env.local and restart the dev server.'
