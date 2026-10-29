import { ArrowDown, Link2, QrCode, Sparkles } from 'lucide-react'
import { AuthForm } from './AuthForm'
import { Wordmark } from './Wordmark'

interface AuthScreenProps {
  notice: string | null
  onSignIn: (email: string, password: string) => Promise<boolean>
  onSignUp: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; needsVerification: boolean }>
  onClearError: () => void
}

export function AuthScreen({
  notice,
  onSignIn,
  onSignUp,
  onClearError,
}: AuthScreenProps) {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-lime/50 to-transparent"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-dvh max-w-6xl flex-col px-5 py-5 sm:px-8">
        <header className="flex items-center">
          <Wordmark className="text-2xl" />
        </header>

        <div className="grid flex-1 items-center gap-8 py-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-14">
          <section className="mx-auto w-full max-w-xl lg:mx-0">
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-surface px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] shadow-hard-sm">
              <Sparkles className="size-3.5 text-accent" aria-hidden="true" />
              the friendly link gulper
            </span>

            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[0.95] tracking-tight text-balance sm:mt-5 sm:text-6xl lg:text-7xl">
              Big links.
              <br />
              <span className="relative inline-block">
                Tiny gulps.
                <svg
                  className="absolute -bottom-1 left-0 h-2.5 w-full"
                  viewBox="0 0 200 10"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 7c40-6 80-6 120-2s60 2 76-2"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-3 max-w-md text-sm text-muted text-pretty sm:mt-5 sm:text-lg">
              Paste a long URL, get a six-character bite. Copy it, scan it, share it — no crumbs.
            </p>

            <div className="mt-8 hidden items-center gap-6 sm:flex">
              <ul className="space-y-2.5 text-sm font-medium">
                <li className="flex items-center gap-2.5">
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-surface shadow-hard-sm">
                    <Link2 className="size-4 text-accent" aria-hidden="true" />
                  </span>
                  Six-character links
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-surface shadow-hard-sm">
                    <QrCode className="size-4 text-indigo" aria-hidden="true" />
                  </span>
                  QR on every link
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-surface shadow-hard-sm">
                    <ArrowDown className="size-4 text-success" aria-hidden="true" />
                  </span>
                  History in your browser
                </li>
              </ul>
            </div>
          </section>

          <section className="mx-auto w-full max-w-md">
            <AuthForm
              onSignIn={onSignIn}
              onSignUp={onSignUp}
              error={notice}
              onClearError={onClearError}
            />
          </section>
        </div>
      </div>
    </main>
  )
}
