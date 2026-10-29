import { AlertTriangle } from 'lucide-react'
import { Wordmark } from './Wordmark'

export function ConfigScreen({ message }: { message: string }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5">
      <div className="w-full max-w-lg rounded-[2rem] border-2 border-ink bg-surface p-6 shadow-hard-lg sm:p-8">
        <Wordmark className="text-3xl" />
        <div className="mt-6 flex items-start gap-3 rounded-2xl border-2 border-danger/40 bg-danger/10 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden="true" />
          <div>
            <h1 className="font-display text-lg font-bold">One env var short</h1>
            <p className="mt-1 text-sm text-muted">{message}</p>
            <pre className="mt-3 overflow-x-auto rounded-xl bg-paper p-3 text-xs">
              <code>VITE_NEON_AUTH_URL=https://…/neondb/auth</code>
            </pre>
          </div>
        </div>
        <p className="mt-4 text-xs text-muted">
          Copy <code>.env.example</code> to <code>.env.local</code>, fill it in, and restart{' '}
          <code>npm run dev</code>.
        </p>
      </div>
    </main>
  )
}
