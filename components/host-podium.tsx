'use client'

/**
 * 🏆 The Neural Podium — top three synapses get the spotlight
 * Second on the left, first in the middle (tallest), third on the right — classic awards geometry. 🥇
 */

import { HeroAvatarFace } from '@/components/hero-avatar-face'
import { cn } from '@/lib/utils'
import type { LeaderboardEntry } from '@/lib/live-client'

type PodiumSlot = LeaderboardEntry | undefined

export function HostPodium({
  first,
  second,
  third,
  className,
  revealedStep = 3, // Defaults to 3 (all) if not controlled
}: {
  first: PodiumSlot
  second: PodiumSlot
  third: PodiumSlot
  className?: string
  revealedStep?: number
}) {
  return (
    <div
      className={cn(
        'flex flex-row items-end justify-center gap-2 md:gap-8 lg:gap-12 max-w-5xl mx-auto px-4',
        className
      )}
    >
      <PodiumColumn place={2} row={second} isVisible={revealedStep >= 2} className="order-1" />
      <PodiumColumn place={1} row={first} isVisible={revealedStep >= 3} className="order-2 scale-105 md:scale-110 z-10" tall />
      <PodiumColumn place={3} row={third} isVisible={revealedStep >= 1} className="order-3" />
    </div>
  )
}

function PodiumColumn({
  place,
  row,
  tall,
  className,
  isVisible = true,
}: {
  place: 1 | 2 | 3
  row: PodiumSlot
  tall?: boolean
  className?: string
  isVisible?: boolean
}) {
  const badge =
    place === 1
      ? 'bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 text-amber-950 border-amber-300'
      : place === 2
        ? 'bg-gradient-to-br from-slate-200 via-slate-300 to-slate-500 text-slate-900 border-slate-400'
        : 'bg-gradient-to-br from-orange-200 via-amber-700 to-amber-900 text-amber-100 border-amber-800'

  const deckH = tall ? 'h-28 md:h-40' : place === 2 ? 'h-20 md:h-28' : 'h-16 md:h-24'

  if (!row) {
    return (
      <div className={cn('flex flex-col items-center w-[30%] max-w-[220px] opacity-25', className)}>
        <div className="mb-3 min-h-[100px] md:min-h-[120px] flex items-end justify-center text-white/25 text-sm font-bold">
          —
        </div>
        <div
          className={cn(
            'w-full rounded-t-2xl border-b-4 border-black/15',
            'bg-gradient-to-b from-white/5 to-white/10 flex items-start justify-center pt-3',
            deckH
          )}
        >
          <div
            className={cn(
              'w-14 h-14 md:w-16 md:h-16 rounded-lg flex items-center justify-center text-2xl font-black border-2 opacity-60',
              badge
            )}
          >
            {place}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        'flex flex-col items-center w-[30%] max-w-[220px] transition-all duration-700 ease-out',
        !isVisible && 'translate-y-12 opacity-0 pointer-events-none',
        isVisible && 'translate-y-0 opacity-100 animate-pop-in',
        className
      )}
    >
      <div className={cn(
        "flex flex-col items-center gap-2 mb-3 min-h-[140px] md:min-h-[180px] justify-end",
        isVisible && place === 1 && "animate-float"
      )}>
        <span
          className={cn(
            'leading-none drop-shadow-lg flex items-end justify-center',
            tall && 'md:scale-110'
          )}
          aria-hidden
        >
          <HeroAvatarFace
            avatarId={row.avatarId}
            frameClassName={cn(
              "h-28 w-28 md:h-36 md:w-36",
              isVisible && place === 1 && "ring-4 ring-amber-400/50 shadow-[0_0_30px_rgba(251,191,36,0.4)]"
            )}
            imgClassName="h-full w-full"
            emojiClassName="text-6xl md:text-8xl lg:text-9xl"
          />
        </span>
        <p className="text-center font-black text-lg md:text-2xl tracking-tight truncate max-w-full px-1">
          {row.name}
        </p>
        <p className="text-sm md:text-base font-bold text-white/70 tabular-nums">
          {row.totalPoints.toLocaleString()} pts
        </p>
      </div>
      <div
        className={cn(
          'w-full rounded-t-2xl border-b-4 border-black/25 shadow-2xl transition-transform duration-500 delay-200',
          !isVisible && 'scale-y-0 origin-bottom',
          isVisible && 'scale-y-100 origin-bottom',
          'bg-gradient-to-b from-amber-900/40 to-amber-950/90 flex flex-col items-center justify-start pt-3',
          deckH
        )}
      >
        <div
          className={cn(
            'w-14 h-14 md:w-16 md:h-16 rounded-lg flex items-center justify-center text-2xl md:text-3xl font-black border-2 shadow-inner',
            badge
          )}
        >
          {place}
        </div>
      </div>
    </div>
  )
}
