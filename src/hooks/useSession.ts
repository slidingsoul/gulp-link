import { useCallback, useEffect, useState } from 'react'
import {
  clearJwt,
  getSessionUser,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
} from '../lib/auth'
import type { AuthUser } from '../types'

type SessionState =
  | { status: 'loading' }
  | { status: 'signed-out' }
  | { status: 'signed-in'; user: AuthUser }

export function useSession() {
  const [state, setState] = useState<SessionState>({ status: 'loading' })
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async (force = false) => {
    try {
      const user = await getSessionUser()
      setState((current) => {
        // Don't let the initial bootstrap overwrite a sign-in that happened
        // while the session request was still in flight.
        if (!force && current.status !== 'loading') return current
        return user ? { status: 'signed-in', user } : { status: 'signed-out' }
      })
    } catch {
      setState((current) => {
        if (!force && current.status !== 'loading') return current
        return { status: 'signed-out' }
      })
    }
  }, [])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- async session bootstrap
    void refresh()
  }, [refresh])

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null)
    const result = await signInWithEmail(email, password)
    if (!result.ok) {
      setError(result.message)
      return false
    }
    setState({ status: 'signed-in', user: result.user })
    return true
  }, [])

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    setError(null)
    const result = await signUpWithEmail(name, email, password)
    if (!result.ok) {
      setError(result.message)
      return { ok: false as const, needsVerification: false }
    }
    if (result.user && !result.needsVerification) {
      setState({ status: 'signed-in', user: result.user })
    }
    return { ok: true as const, needsVerification: result.needsVerification }
  }, [])

  const signOut = useCallback(async () => {
    clearJwt()
    setState({ status: 'signed-out' })
    setError(null)
    await signOutUser()
  }, [])

  const expire = useCallback(() => {
    clearJwt()
    setState({ status: 'signed-out' })
    setError('Your session expired. Sign in again.')
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return { state, error, signIn, signUp, signOut, expire, clearError, refresh }
}
