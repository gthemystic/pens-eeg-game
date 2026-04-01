'use client'

/**
 * 📊 The Histogram of Hunches — how the room voted, Kahoot-style
 * Bars rise like hopes (or guesses); counts don’t lie. Mostly. 📈✨
 */

import { cn } from '@/lib/utils'

const SLOT = [
  {
    bar: 'bg-answer-red',
    icon: '▲',
    label: 'Triangle',
  },
  {
    bar: 'bg-answer-blue',
    icon: '◆',
    label: 'Diamond',
  },
  {
    bar: 'bg-answer-yellow',
    icon: '●',
    label: 'Circle',
  },
  {
    bar: 'bg-answer-green',
    icon: '■',
    label: 'Square',
  },
] as const

export interface DistributionChoice {
  id: string
  text: string
  isCorrect?: boolean
}

export function HostAnswerDistribution({
  choices,
  countsByChoiceId,
  className,
}: {
  choices: DistributionChoice[]
  countsByChoiceId: Record<string, number>
  className?: string
}) {
  const counts = choices.map((c) => countsByChoiceId[c.id] ?? 0)
  const max = Math.max(1, ...counts)

  return (
    <div
      className={cn(
        'grid grid-cols-4 gap-2 md:gap-4 items-end min-h-[220px] md:min-h-[280px] px-2 py-4',
        className
      )}
      role="img"
      aria-label="Answer distribution bar chart"
    >
      {choices.map((choice, idx) => {
        const cfg = SLOT[idx % 4]!
        const n = counts[idx] ?? 0
        const pct = Math.round((n / max) * 100)
        return (
          <div
            key={choice.id}
            className="flex flex-col items-center gap-3 h-full justify-end"
          >
            <div className="w-full flex-1 flex items-end justify-center min-h-[120px] md:min-h-[160px]">
              <div
                className={cn(
                  'w-[72%] max-w-[120px] rounded-t-xl transition-all duration-500 ease-out shadow-lg',
                  cfg.bar,
                  n === 0 ? 'min-h-[8px] opacity-40' : ''
                )}
                style={{ height: n === 0 ? '8px' : `${Math.max(12, pct)}%` }}
              />
            </div>
            <div className="flex flex-col items-center gap-1 text-foreground">
              <span className="text-2xl md:text-3xl leading-none" aria-hidden>
                {cfg.icon}
              </span>
              <span className="text-xl md:text-2xl font-black tabular-nums">{n}</span>
              {choice.isCorrect && (
                <span className="text-answer-green text-2xl font-black" aria-label="Correct answer">
                  ✓
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
