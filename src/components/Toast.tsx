import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import type { ToastMessage } from '../hooks/useToast'
import { cn } from '../lib/cn'

interface ToastStackProps {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}

const toneStyles = {
  success: 'text-success',
  error: 'text-danger',
  info: 'text-indigo',
} as const

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  return (
    <div
      className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-20 sm:w-80 sm:items-end"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const Icon =
          toast.tone === 'success' ? CheckCircle2 : toast.tone === 'error' ? XCircle : Info

        return (
          <div
            key={toast.id}
            className="animate-rise pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-2xl border-2 border-ink bg-surface px-3.5 py-2.5 text-sm font-medium shadow-hard"
          >
            <Icon className={cn('size-4 shrink-0', toneStyles[toast.tone])} aria-hidden="true" />
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="inline-flex size-6 items-center justify-center rounded-md text-muted transition hover:bg-paper hover:text-ink"
              aria-label="Dismiss notification"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
