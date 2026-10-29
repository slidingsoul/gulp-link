import { cn } from '../lib/cn'

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('font-display font-extrabold tracking-tight', className)}>
      gulp<span className="text-accent">.</span>
    </span>
  )
}
