import { API_BASE } from './env'

export class ApiError extends Error {
  status: number
  retryAfter: number | null

  constructor(message: string, status: number, retryAfter: number | null = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.retryAfter = retryAfter
  }
}

interface ErrorBody {
  error?: unknown
}

interface CreateLinkBody {
  link?: unknown
  short_code?: unknown
}

export interface CreatedLink {
  code: string
  shortUrl: string
}

function serverMessage(body: unknown): string {
  if (body && typeof body === 'object' && 'error' in body) {
    const value = (body as ErrorBody).error
    if (typeof value === 'string') return value
  }
  return ''
}

function defaultMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Invalid URL format'
    case 401:
      return 'Invalid or expired token'
    case 429:
      return 'Rate limit exceeded'
    default:
      return 'Request failed'
  }
}

function retryAfterSeconds(response: Response): number | null {
  const value = response.headers.get('Retry-After')
  if (!value) return null
  const seconds = Number.parseInt(value, 10)
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null
}

/**
 * POST /snap — returns the bare code plus the backend's canonical short URL.
 * snap-link builds the URL from PUBLIC_BASE_URL (or the request origin).
 */
export async function createShortLink(link: string, token: string): Promise<CreatedLink> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12_000)

  try {
    const response = await fetch(`${API_BASE}/snap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ link }),
      signal: controller.signal,
    })

    let body: unknown = null
    try {
      body = await response.json()
    } catch {
      // A non-JSON error body is still an error; fall back to the status.
    }

    if (!response.ok) {
      throw new ApiError(
        serverMessage(body) || defaultMessage(response.status),
        response.status,
        retryAfterSeconds(response),
      )
    }

    const payload = body && typeof body === 'object' ? (body as CreateLinkBody) : null
    const code = typeof payload?.short_code === 'string' ? payload.short_code.trim() : ''
    const shortUrl = typeof payload?.link === 'string' ? payload.link.trim() : ''
    if (!code) throw new ApiError('The server sent back an empty short code.', 500)
    return { code, shortUrl }
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('The server took too long to answer.', 0)
    }
    throw new ApiError('Can’t reach the API. Is snap-link running on :8081?', 0)
  } finally {
    clearTimeout(timeout)
  }
}

export function friendlyApiMessage(error: ApiError): string {
  switch (error.status) {
    case 400:
      return 'That link doesn’t look right. Try a full http(s) URL.'
    case 401:
      return 'Your session expired. Sign in again.'
    case 404:
      return 'The API couldn’t find that endpoint.'
    case 429:
      return error.retryAfter
        ? `You’ve hit your 5-links-per-minute limit. Try again in ${error.retryAfter}s.`
        : 'You’ve hit your 5-links-per-minute limit. Give it a minute.'
    case 500:
      return 'Gulp choked on that one. Try again in a moment.'
    case 503:
      return 'The API is up but its database is down. Try again soon.'
    case 0:
      return error.message
    default:
      return error.message || 'Something went wrong.'
  }
}
