import { cn } from '../lib/cn'

export type MascotMood = 'idle' | 'gulping' | 'happy' | 'confused'

interface MascotProps {
  mood?: MascotMood
  className?: string
}

/**
 * Gulp — a hand-drawn blob that eats links. Decorative, so it is hidden
 * from assistive technology; surrounding copy carries the meaning.
 */
export function Mascot({ mood = 'idle', className }: MascotProps) {
  const gulping = mood === 'gulping'

  return (
    <svg
      viewBox="0 0 200 200"
      className={cn('overflow-visible', className)}
      aria-hidden="true"
      focusable="false"
    >
      <g className={gulping ? 'mascot-gulp' : 'mascot-float'}>
        <ellipse cx="100" cy="180" rx="50" ry="7" fill="var(--ink)" opacity="0.12" />

        <path
          d="M100 16c40 0 69 27 69 67 0 47-31 82-69 82S31 130 31 83c0-40 29-67 69-67Z"
          fill="var(--lime)"
          stroke="var(--ink)"
          strokeWidth="5"
          strokeLinejoin="round"
        />

        <path
          d="M72 132c8 10 18 15 28 15s20-5 28-15"
          fill="none"
          stroke="var(--ink)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.14"
        />

        {mood === 'happy' ? (
          <>
            <path
              d="M61 81q12-13 24 0"
              fill="none"
              stroke="var(--ink)"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M115 81q12-13 24 0"
              fill="none"
              stroke="var(--ink)"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            <g className="animate-blink" style={{ transformOrigin: '73px 82px' }}>
              <ellipse
                cx="73"
                cy="82"
                rx="12"
                ry="14"
                fill="var(--paper)"
                stroke="var(--ink)"
                strokeWidth="4"
              />
              <circle cx="76" cy="85" r="5" fill="var(--ink)" />
            </g>
            <g className="animate-blink" style={{ transformOrigin: '127px 82px' }}>
              <ellipse
                cx="127"
                cy="82"
                rx="12"
                ry="14"
                fill="var(--paper)"
                stroke="var(--ink)"
                strokeWidth="4"
              />
              <circle cx="124" cy="85" r="5" fill="var(--ink)" />
            </g>
          </>
        )}

        {mood === 'confused' && (
          <path
            d="M115 66l16 9"
            fill="none"
            stroke="var(--ink)"
            strokeWidth="4"
            strokeLinecap="round"
          />
        )}

        {gulping ? (
          <ellipse cx="100" cy="118" rx="16" ry="20" fill="var(--ink)" />
        ) : mood === 'happy' ? (
          <path
            d="M78 109q22 25 44 0Z"
            fill="var(--paper)"
            stroke="var(--ink)"
            strokeWidth="4"
            strokeLinejoin="round"
          />
        ) : mood === 'confused' ? (
          <path
            d="M84 118q8-7 16 0t16 0"
            fill="none"
            stroke="var(--ink)"
            strokeWidth="4"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M84 112q16 14 32 0"
            fill="none"
            stroke="var(--ink)"
            strokeWidth="4"
            strokeLinecap="round"
          />
        )}

        {gulping && (
          <g transform="rotate(-18 160 105)">
            <rect
              x="146"
              y="96"
              width="30"
              height="18"
              rx="9"
              fill="none"
              stroke="var(--ink)"
              strokeWidth="4"
            />
            <rect
              x="158"
              y="101"
              width="30"
              height="18"
              rx="9"
              fill="none"
              stroke="var(--ink)"
              strokeWidth="4"
            />
          </g>
        )}

        <circle cx="56" cy="106" r="7" fill="var(--accent)" opacity="0.5" />
        <circle cx="144" cy="106" r="7" fill="var(--accent)" opacity="0.5" />
      </g>
    </svg>
  )
}
