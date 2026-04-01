'use client'

import { useMemo } from 'react'
import type { ReactionBubble } from '@/lib/live-client'

function jitter(seed: string, salt: number): number {
  let h = salt
  for (let i = 0; i < seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i)
  return Math.abs(h)
}

/**
 * 🫧 Emoji confetti for the projector — reactions float up like soda bubbles at a victory party
 */
export function HostReactionBubbles({ bubbles }: { bubbles: ReactionBubble[] }) {
  const slice = useMemo(() => bubbles.slice(-28), [bubbles])

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
      aria-hidden
    >
      {slice.map((b) => {
        const leftPct = 4 + (jitter(b.id, 1) % 88)
        const drift = (jitter(b.id, 2) % 140) - 70
        const delay = (jitter(b.id, 3) % 12) * 0.04
        return (
          <div
            key={b.id}
            className="live-reaction-bubble absolute flex flex-col items-center gap-1 text-4xl sm:text-5xl md:text-7xl drop-shadow-[0_6px_16px_rgba(0,0,0,0.5)]"
            style={{
              left: `${leftPct}%`,
              bottom: '6%',
              ['--bubble-drift' as string]: `${drift}px`,
              animationDelay: `${delay}s`,
            }}
          >
            <span className="leading-none">{b.emoji}</span>
            <span className="text-[9px] sm:text-xs font-black uppercase tracking-wide text-white whitespace-nowrap bg-black/55 px-2 py-0.5 rounded-full border border-white/25 max-w-[160px] truncate flex items-center gap-1.5 justify-center">
              {b.heroImageUrl ? (
                <img src={b.heroImageUrl} alt="" className="h-4 w-4 rounded-full object-cover shrink-0" />
              ) : (
                <span className="leading-none">{b.heroEmoji}</span>
              )}
              <span className="truncate">{b.playerName}</span>
            </span>
          </div>
        )
      })}
    </div>
  )
}
