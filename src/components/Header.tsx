import { LogOut } from 'lucide-react'
import { initials } from '../lib/format'
import type { AuthUser } from '../types'
import { Wordmark } from './Wordmark'

interface HeaderProps {
  user: AuthUser
  onSignOut: () => void
}

export function Header({ user, onSignOut }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b-2 border-line bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-4 px-5 sm:px-8">
        <a href="/" className="flex items-center gap-2" aria-label="Gulp home">
          <Wordmark className="text-2xl" />
        </a>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-lime text-xs font-bold text-[#1a1614]">
              {initials(user.name, user.email)}
            </div>
            <div className="hidden flex-col leading-tight sm:flex">
              <span className="max-w-40 truncate text-sm font-semibold">{user.name}</span>
              <span className="max-w-40 truncate text-[11px] text-muted">{user.email}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onSignOut}
            className="inline-flex size-10 items-center justify-center rounded-xl border-2 border-ink bg-surface text-ink shadow-hard-sm transition hover:-translate-y-0.5 hover:text-danger active:translate-y-0.5 active:shadow-none"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
