import { ArrowRight, Link2, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { ShortenState } from '../hooks/useShorten'
import { cn } from '../lib/cn'
import { Button } from './ui/Button'
import { Spinner } from './ui/Spinner'

interface ShortenFormProps {
  state: ShortenState
  onSubmit: (url: string) => Promise<boolean>
  onResetError: () => void
}

export function ShortenForm({ state, onSubmit, onResetError }: ShortenFormProps) {
  const [url, setUrl] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const loading = state.status === 'loading'
  const error = state.status === 'error' ? state.message : null

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return
    const ok = await onSubmit(url)
    if (ok) setUrl('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <label htmlFor="long-url" className="sr-only">
        Long URL
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Link2
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            id="long-url"
            type="url"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            placeholder="https://example.com/a/really/long/link"
            value={url}
            onChange={(event) => {
              setUrl(event.target.value)
              if (error) onResetError()
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'shorten-error' : 'shorten-hint'}
            className={cn(
              'h-14 w-full rounded-2xl border-2 border-ink bg-surface pl-12 pr-4 text-base text-ink shadow-hard outline-none transition placeholder:text-muted/70 focus:shadow-hard-lg',
              error && 'border-danger',
            )}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="shrink-0 sm:min-w-36"
          disabled={!url.trim()}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <Spinner className="size-4" />
              Gulping…
            </>
          ) : (
            <>
              Gulp it
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </div>

      {error ? (
        <p
          id="shorten-error"
          role="alert"
          className="animate-shake rounded-xl border-2 border-danger/40 bg-danger/10 px-3 py-2 text-sm font-medium text-danger"
        >
          {error}
        </p>
      ) : (
        <p id="shorten-hint" className="flex items-center gap-1.5 text-xs text-muted">
          <Sparkles className="size-3.5 text-accent" aria-hidden="true" />
          Bare domains get https:// automatically. Limit: 5 links per minute per account.
        </p>
      )}
    </form>
  )
}
