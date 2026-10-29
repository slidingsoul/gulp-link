import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const variants: Record<Variant, string> = {
  primary:
    'border-2 border-ink bg-accent text-accent-ink shadow-hard hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-hard-sm',
  secondary:
    'border-2 border-ink bg-surface text-ink shadow-hard hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-hard-sm',
  ghost:
    'border-2 border-transparent bg-transparent text-muted hover:border-ink hover:bg-surface hover:text-ink',
  danger:
    'border-2 border-ink bg-danger text-white shadow-hard hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-hard-sm',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 gap-1.5 rounded-xl px-3 text-xs',
  md: 'h-11 gap-2 rounded-2xl px-4 text-sm',
  lg: 'h-14 gap-2.5 rounded-2xl px-6 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-[transform,box-shadow,background-color,color] duration-150 disabled:pointer-events-none disabled:border-line disabled:bg-surface disabled:text-muted disabled:shadow-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
