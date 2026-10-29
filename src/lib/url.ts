export type UrlCheck = { ok: true; url: string } | { ok: false; message: string }

/**
 * Mirrors snap-link's validateURL: trim, 2048 max, no spaces, http(s) only,
 * and auto-prefix bare hosts with https://. Client-side checks are a courtesy;
 * the server remains the source of truth.
 */
export function normalizeUrl(raw: string): UrlCheck {
  const value = raw.trim()

  if (!value) return { ok: false, message: 'Paste a link first — I’m hungry.' }
  if (value.length > 2048) {
    return { ok: false, message: 'That link is too long (2,048 characters max).' }
  }
  if (/\s/.test(value)) return { ok: false, message: 'Links can’t contain spaces.' }

  let candidate = value
  const lower = candidate.toLowerCase()
  const hasHttp = lower.startsWith('http://')
  const hasHttps = lower.startsWith('https://')

  if (!hasHttp && !hasHttps) {
    if (candidate.includes('://')) {
      return { ok: false, message: 'Only http and https links are allowed.' }
    }
    candidate = `https://${candidate}`
  }

  try {
    const parsed = new URL(candidate)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { ok: false, message: 'Only http and https links are allowed.' }
    }
    if (!parsed.hostname) {
      return { ok: false, message: 'That link is missing a domain.' }
    }
    return { ok: true, url: candidate }
  } catch {
    return { ok: false, message: 'That doesn’t look like a valid link.' }
  }
}

/** Shorten a URL for display: example.com/some/path → example.com/some/pa… */
export function prettyUrl(url: string, max = 52): string {
  let display = url
  try {
    const parsed = new URL(url)
    const path = `${parsed.pathname}${parsed.search}${parsed.hash}`.replace(/\/$/, '')
    display = `${parsed.hostname}${path}`
  } catch {
    // Keep the raw string.
  }
  return display.length > max ? `${display.slice(0, max - 1)}…` : display
}
