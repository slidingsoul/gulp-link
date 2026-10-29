import { Check, Copy, ExternalLink, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { copyText } from '../lib/copy'
import { timeAgo } from '../lib/format'
import { prettyUrl } from '../lib/url'
import type { RecentLink } from '../types'
import { Mascot } from './Mascot'
import { Button } from './ui/Button'

interface RecentLinksProps {
  links: RecentLink[]
  onRemove: (code: string) => void
  onClear: () => void
  onCopied: () => void
  onCopyFailed: () => void
}

const iconButton =
  'inline-flex size-9 items-center justify-center rounded-lg border-2 border-transparent text-muted transition hover:border-ink hover:bg-paper hover:text-ink'

export function RecentLinks({
  links,
  onRemove,
  onClear,
  onCopied,
  onCopyFailed,
}: RecentLinksProps) {
  const [confirmClear, setConfirmClear] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  async function copy(link: RecentLink) {
    const ok = await copyText(link.shortUrl)
    if (!ok) {
      onCopyFailed()
      return
    }
    setCopiedCode(link.code)
    onCopied()
    window.setTimeout(() => {
      setCopiedCode((current) => (current === link.code ? null : current))
    }, 1800)
  }

  if (links.length === 0) {
    return (
      <section className="rounded-[2rem] border-2 border-dashed border-line bg-surface/60 p-8 text-center">
        <Mascot className="mx-auto h-24 w-24 opacity-90" />
        <h2 className="mt-3 font-display text-xl font-bold tracking-tight">
          Nothing in the belly yet
        </h2>
        <p className="mt-1 text-sm text-muted">
          Your freshly gulped links will show up here.
        </p>
      </section>
    )
  }

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight">Recently gulped</h2>
          <p className="text-xs text-muted">
            Saved in this browser · {links.length} link{links.length === 1 ? '' : 's'}
          </p>
        </div>

        {confirmClear ? (
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                onClear()
                setConfirmClear(false)
              }}
            >
              Clear all
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmClear(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => setConfirmClear(true)}>
            Clear
          </Button>
        )}
      </div>

      <ul className="space-y-2.5">
        {links.map((link) => (
          <li
            key={link.code}
            className="flex items-center gap-2 rounded-2xl border-2 border-line bg-surface p-2.5 transition hover:border-ink sm:gap-3 sm:p-3"
          >
            <a
              href={link.shortUrl}
              target="_blank"
              rel="noreferrer"
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              <span className="inline-flex shrink-0 items-center rounded-lg border-2 border-ink bg-lime px-2 py-1 font-mono text-[11px] font-bold text-[#1a1614]">
                /{link.code}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">
                  {prettyUrl(link.originalUrl)}
                </span>
                <span className="block text-[11px] text-muted">{timeAgo(link.createdAt)}</span>
              </span>
            </a>

            <div className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                onClick={() => void copy(link)}
                className={iconButton}
                aria-label={`Copy ${link.code}`}
                title="Copy link"
              >
                {copiedCode === link.code ? (
                  <Check className="size-4 text-success" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
              <a
                href={link.shortUrl}
                target="_blank"
                rel="noreferrer"
                className={iconButton}
                aria-label={`Open ${link.code}`}
                title="Open link"
              >
                <ExternalLink className="size-4" />
              </a>
              <button
                type="button"
                onClick={() => onRemove(link.code)}
                className={`${iconButton} hover:text-danger`}
                aria-label={`Remove ${link.code}`}
                title="Remove from history"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
