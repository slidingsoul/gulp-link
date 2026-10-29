import { useCallback, useState } from 'react'
import { AuthScreen } from './components/AuthScreen'
import { ConfigScreen } from './components/ConfigScreen'
import { Header } from './components/Header'
import { LoadingScreen } from './components/LoadingScreen'
import { RecentLinks } from './components/RecentLinks'
import { ResultCard } from './components/ResultCard'
import { ShortenForm } from './components/ShortenForm'
import { ToastStack } from './components/Toast'
import { useRecentLinks } from './hooks/useRecentLinks'
import { useSession } from './hooks/useSession'
import { useShorten } from './hooks/useShorten'
import { useToast } from './hooks/useToast'
import { CONFIG_ERROR } from './lib/env'

export default function App() {
  const session = useSession()
  const toast = useToast()
  const [notice, setNotice] = useState<string | null>(null)

  const { expire } = session
  const handleUnauthorized = useCallback(() => {
    setNotice('Your session expired. Sign in again.')
    expire()
  }, [expire])

  const shorten = useShorten(handleUnauthorized)
  const userId = session.state.status === 'signed-in' ? session.state.user.id : null
  const recent = useRecentLinks(userId)

  const { submit } = shorten
  const { add } = recent
  const { push } = toast

  const handleSubmit = useCallback(
    async (url: string) => {
      const result = await submit(url)
      if (!result) return false
      add({ ...result, createdAt: new Date().toISOString() })
      push('Link gulped. Nice bite.', 'success')
      return true
    },
    [submit, add, push],
  )

  if (CONFIG_ERROR) return <ConfigScreen message={CONFIG_ERROR} />
  if (session.state.status === 'loading') return <LoadingScreen />

  if (session.state.status === 'signed-out') {
    return (
      <>
        <AuthScreen
          notice={notice ?? session.error}
          onSignIn={async (email, password) => {
            const ok = await session.signIn(email, password)
            if (ok) setNotice(null)
            return ok
          }}
          onSignUp={async (name, email, password) => {
            const result = await session.signUp(name, email, password)
            if (result.ok) setNotice(null)
            return result
          }}
          onClearError={() => {
            session.clearError()
            setNotice(null)
          }}
        />
        <ToastStack toasts={toast.toasts} onDismiss={toast.dismiss} />
      </>
    )
  }

  const user = session.state.user

  return (
    <div className="flex min-h-dvh flex-col">
      <Header
        user={user}
        onSignOut={() => {
          void session.signOut()
          setNotice(null)
          shorten.reset()
        }}
      />

      <main className="mx-auto w-full max-w-4xl flex-1 px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
        <section className="mb-8">
          <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
            <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
            ready to gulp
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
            Feed me a link.
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted text-pretty sm:text-base">
            Drop a long URL below. I’ll chew it down to six characters and hand it back.
          </p>
        </section>

        <ShortenForm
          state={shorten.state}
          onSubmit={handleSubmit}
          onResetError={shorten.reset}
        />

        <div className="mt-8 space-y-10">
          {shorten.state.status === 'success' && (
            <ResultCard
              link={{
                code: shorten.state.code,
                shortUrl: shorten.state.shortUrl,
                originalUrl: shorten.state.originalUrl,
              }}
              onCopied={(message) => push(message, 'success')}
              onCopyFailed={() => push('Couldn’t copy — select the link manually.', 'error')}
            />
          )}

          <RecentLinks
            links={recent.links}
            onRemove={recent.remove}
            onClear={recent.clear}
            onCopied={() => push('Copied to clipboard', 'success')}
            onCopyFailed={() => push('Couldn’t copy — select the link manually.', 'error')}
          />
        </div>
      </main>

      <ToastStack toasts={toast.toasts} onDismiss={toast.dismiss} />
    </div>
  )
}
