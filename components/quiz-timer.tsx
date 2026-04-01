'use client'

import { cn } from '@/lib/utils'

interface QuizTimerProps {
  timeRemaining: number
  totalTime: number
  className?: string
}

export function QuizTimer({ timeRemaining, totalTime, className }: QuizTimerProps) {
  const percentage = (timeRemaining / totalTime) * 100
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (percentage / 100) * circumference

  const getColor = () => {
    if (percentage > 60) return 'oklch(0.58 0.2 145)'
    if (percentage > 30) return 'oklch(0.82 0.18 85)'
    return 'oklch(0.62 0.22 25)'
  }

  const isUrgent = timeRemaining <= 5

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <svg width="88" height="88" viewBox="0 0 88 88" aria-label={`${timeRemaining} seconds remaining`}>
        {/* Background circle */}
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="oklch(0.28 0.07 262)"
          strokeWidth="6"
        />
        {/* Progress circle */}
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="timer-ring-circle"
          style={{
            filter: isUrgent ? `drop-shadow(0 0 6px ${getColor()})` : undefined,
          }}
        />
      </svg>
      <span
        className={cn(
          'absolute font-black text-2xl tabular-nums',
          isUrgent ? 'text-answer-red animate-pulse' : 'text-foreground'
        )}
        aria-live="polite"
      >
        {timeRemaining}
      </span>
    </div>
  )
}

export function ProgressBar({
  current,
  total,
  className,
}: {
  current: number
  total: number
  className?: string
}) {
  const percentage = ((current + 1) / total) * 100

  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
        <span>Question {current + 1}</span>
        <span>{total} total</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={current + 1}
          aria-valuemin={1}
          aria-valuemax={total}
        />
      </div>
    </div>
  )
}
