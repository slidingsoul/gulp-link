import { Check, Copy, Download, ExternalLink } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { useRef, useState } from 'react'
import { copyText } from '../lib/copy'
import { prettyUrl } from '../lib/url'
import type { ShortenedLink } from '../types'

interface ResultCardProps {
  link: ShortenedLink
  onCopied: (message: string) => void
  onCopyFailed: () => void
}

const hardButton =
  'inline-flex h-11 items-center justify-center gap-2 rounded-2xl border-2 border-[#1a1614] bg-[#fffdf8] px-4 text-sm font-semibold text-[#1a1614] shadow-[4px_4px_0_0_#1a1614] transition hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none'

export function ResultCard({ link, onCopied, onCopyFailed }: ResultCardProps) {
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  async function handleCopy() {
    const ok = await copyText(link.shortUrl)
    if (!ok) {
      onCopyFailed()
      return
    }
    setCopied(true)
    onCopied('Copied to clipboard')
    window.setTimeout(() => setCopied(false), 2000)
  }

  function downloadQr() {
    const canvas = canvasRef.current
    if (!canvas) return
    const anchor = document.createElement('a')
    anchor.href = canvas.toDataURL('image/png')
    anchor.download = `gulp-${link.code}.png`
    anchor.click()
  }

  return (
    <section
      className="animate-pop rounded-[2rem] border-2 border-ink bg-lime p-5 text-[#1a1614] shadow-hard-lg sm:p-7"
      aria-live="polite"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#1a1614] bg-[#fffdf8] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]">
            <Check className="size-3" aria-hidden="true" />
            freshly gulped
          </p>
          <p className="mt-3 break-all font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            {link.shortUrl}
          </p>
          <p
            className="mt-1 truncate text-xs font-medium text-[#1a1614]/60"
            title={link.originalUrl}
          >
            {prettyUrl(link.originalUrl, 64)}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={handleCopy} className={hardButton}>
              {copied ? (
                <>
                  <Check className="size-4" aria-hidden="true" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="size-4" aria-hidden="true" />
                  Copy link
                </>
              )}
            </button>

            <a href={link.shortUrl} target="_blank" rel="noreferrer" className={hardButton}>
              <ExternalLink className="size-4" aria-hidden="true" />
              Open
            </a>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-2 self-center rounded-2xl border-2 border-[#1a1614] bg-white p-3 shadow-[2px_2px_0_0_#1a1614] sm:self-start">
          <div role="img" aria-label={`QR code for ${link.shortUrl}`}>
            <QRCodeCanvas
              ref={canvasRef}
              value={link.shortUrl}
              size={128}
              level="M"
              bgColor="#ffffff"
              fgColor="#1a1614"
              marginSize={2}
            />
          </div>
          <button
            type="button"
            onClick={downloadQr}
            className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#1a1614] bg-[#c8f25a] px-3 py-1.5 text-xs font-bold text-[#1a1614] shadow-[2px_2px_0_0_#1a1614] transition hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <Download className="size-3.5" aria-hidden="true" />
            Download PNG
          </button>
        </div>
      </div>
    </section>
  )
}
