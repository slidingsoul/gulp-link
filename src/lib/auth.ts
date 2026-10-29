import { createAuthClient } from '@neondatabase/auth'
import { BetterAuthVanillaAdapter } from '@neondatabase/auth/vanilla/adapters'
import type { AuthUser } from '../types'
import { AUTH_BASE_URL } from './env'

/**
 * Neon Managed Better Auth client. The JWT plugin is included by Neon's
 * adapter, so `authClient.token()` returns the EdDSA token snap-link verifies.
 */
export const authClient = createAuthClient(AUTH_BASE_URL, {
  adapter: BetterAuthVanillaAdapter({
    // Needed when VITE_AUTH_MODE=direct (cross-origin auth).
    fetchOptions: { credentials: 'include' },
  }),
})

interface AuthErrorLike {
  code?: string
  message?: string
  status?: number
}

function messageForAuthError(error: unknown): string {
  const e = (error ?? {}) as AuthErrorLike
  const code = (e.code ?? '').toUpperCase()
  const message = (e.message ?? '').trim()
  const lower = message.toLowerCase()

  if (
    code.includes('USER_ALREADY_EXISTS') ||
    lower.includes('already exists') ||
    lower.includes('already registered') ||
    lower.includes('user already')
  ) {
    return 'That email already has an account. Try signing in instead.'
  }
  if (
    code.includes('INVALID_EMAIL_OR_PASSWORD') ||
    lower.includes('invalid email or password') ||
    lower.includes('invalid password') ||
    lower.includes('incorrect password')
  ) {
    return 'Email or password is incorrect.'
  }
  if (
    code.includes('EMAIL_NOT_VERIFIED') ||
    lower.includes('not verified') ||
    lower.includes('verify your email')
  ) {
    return 'Verify your email first — check your inbox for the link.'
  }
  if (
    lower.includes('password') &&
    (lower.includes('short') || lower.includes('length') || lower.includes('at least'))
  ) {
    return 'Use at least 8 characters for your password.'
  }
  if (lower.includes('invalid email') || lower.includes('email is invalid')) {
    return 'That email address looks invalid.'
  }
  if (e.status === 429 || lower.includes('too many')) {
    return 'Too many attempts. Wait a minute and try again.'
  }
  if (
    lower.includes('failed to fetch') ||
    lower.includes('network') ||
    lower.includes('fetch failed')
  ) {
    return 'Can’t reach the auth service. Check your connection and try again.'
  }
  return message || 'Something went wrong. Please try again.'
}

function toAuthUser(user: {
  id: string
  name?: string | null
  email: string
  image?: string | null
}): AuthUser {
  const fallback = user.email.split('@')[0] || 'Gulper'
  return {
    id: user.id,
    name: (user.name ?? '').trim() || fallback,
    email: user.email,
    image: user.image ?? null,
  }
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const { data, error } = await authClient.getSession()
  if (error) throw error
  if (!data?.user) return null
  return toAuthUser(data.user)
}

export type SignInResult = { ok: true; user: AuthUser } | { ok: false; message: string }

export async function signInWithEmail(email: string, password: string): Promise<SignInResult> {
  try {
    const { error } = await authClient.signIn.email({ email, password })
    if (error) return { ok: false, message: messageForAuthError(error) }

    const user = await getSessionUser()
    if (!user) {
      return {
        ok: false,
        message: 'Signed in, but the session didn’t stick. Check that cookies are enabled.',
      }
    }
    return { ok: true, user }
  } catch (error) {
    // Better Auth throws for non-2xx responses (e.g. a 401 on bad credentials).
    return { ok: false, message: messageForAuthError(error) }
  }
}

export type SignUpResult =
  | { ok: true; user: AuthUser | null; needsVerification: boolean }
  | { ok: false; message: string }

export async function signUpWithEmail(
  name: string,
  email: string,
  password: string,
): Promise<SignUpResult> {
  try {
    const { error } = await authClient.signUp.email({ name, email, password })
    if (error) return { ok: false, message: messageForAuthError(error) }

    // Some branches require email verification, in which case sign-up succeeds
    // but no session cookie is issued yet.
    const user = await getSessionUser().catch(() => null)
    return { ok: true, user, needsVerification: !user }
  } catch (error) {
    return { ok: false, message: messageForAuthError(error) }
  }
}

export async function signOutUser(): Promise<void> {
  clearJwt()
  try {
    await authClient.signOut()
  } catch {
    // Signing out locally is enough; the session cookie may already be gone.
  }
}

export class AuthTokenError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthTokenError'
  }
}

let cachedToken: { token: string; expiresAt: number } | null = null

function tokenExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const json = JSON.parse(atob(padded)) as { exp?: unknown }
    return typeof json.exp === 'number' ? json.exp * 1000 : null
  } catch {
    return null
  }
}

/** Returns a fresh-enough JWT for snap-link's Authorization header. */
export async function getJwt(force = false): Promise<string> {
  if (!force && cachedToken && cachedToken.expiresAt - 30_000 > Date.now()) {
    return cachedToken.token
  }

  let data: unknown
  try {
    const result = await authClient.token()
    if (result.error) throw result.error
    data = result.data
  } catch (error) {
    throw new AuthTokenError(messageForAuthError(error))
  }

  // Neon's adapter returns the JWT as `session.token`; the raw Better Auth
  // JWT plugin returns `token`. Support both shapes.
  const payload = data as
    | { token?: string; session?: { token?: string } }
    | null
    | undefined
  const token = payload?.token ?? payload?.session?.token
  if (!token) {
    throw new AuthTokenError('Your session expired. Sign in again.')
  }

  cachedToken = {
    token,
    expiresAt: tokenExpiry(token) ?? Date.now() + 14 * 60_000,
  }
  return token
}

export function clearJwt(): void {
  cachedToken = null
}
