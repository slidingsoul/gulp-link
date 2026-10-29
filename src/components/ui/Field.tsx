import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon?: ReactNode
  trailing?: ReactNode
  error?: string | null
  hint?: string
}

export function Field({
  label,
  icon,
  trailing,
  error,
  hint,
  id,
  name,
  className,
  ...props
}: FieldProps) {
  const fieldId = id ?? name
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={fieldId}
        className="block text-[11px] font-bold uppercase tracking-[0.14em] text-muted"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
            {icon}
          </span>
        )}
        <input
          id={fieldId}
          name={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-12 w-full rounded-2xl border-2 border-ink bg-surface px-4 text-sm text-ink shadow-hard-sm outline-none transition placeholder:text-muted/70 focus:shadow-hard',
            icon ? 'pl-11' : undefined,
            trailing ? 'pr-12' : undefined,
            error && 'border-danger',
            className,
          )}
          {...props}
        />
        {trailing && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</span>
        )}
      </div>
      {error ? (
        <p id={`${fieldId}-error`} className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
