'use client'

import { CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnswerButtonProps {
  id: string
  text: string
  index: number
  isSelected: boolean
  isCorrect: boolean
  showResult: boolean
  disabled: boolean
  onClick: () => void
  /** When showing results, keep ▲◆●■ slot colors (projector / Kahoot-style) instead of forcing green/red. */
  slotColoredResults?: boolean
}

const answerConfig = [
  {
    color: 'bg-answer-red hover:bg-[oklch(0.68_0.22_25)]',
    activeColor: 'bg-answer-red',
    icon: '▲',
    label: 'Triangle',
    shadowColor: 'shadow-[0_4px_0_oklch(0.45_0.22_25)]',
    stagger: 'stagger-1',
  },
  {
    color: 'bg-answer-blue hover:bg-[oklch(0.62_0.22_250)]',
    activeColor: 'bg-answer-blue',
    icon: '◆',
    label: 'Diamond',
    shadowColor: 'shadow-[0_4px_0_oklch(0.38_0.22_250)]',
    stagger: 'stagger-2',
  },
  {
    color: 'bg-answer-yellow hover:bg-[oklch(0.88_0.18_85)]',
    activeColor: 'bg-answer-yellow',
    icon: '●',
    label: 'Circle',
    shadowColor: 'shadow-[0_4px_0_oklch(0.65_0.18_85)]',
    stagger: 'stagger-3',
  },
  {
    color: 'bg-answer-green hover:bg-[oklch(0.65_0.2_145)]',
    activeColor: 'bg-answer-green',
    icon: '■',
    label: 'Square',
    shadowColor: 'shadow-[0_4px_0_oklch(0.42_0.2_145)]',
    stagger: 'stagger-4',
  },
]

export function AnswerButton({
  id,
  text,
  index,
  isSelected,
  isCorrect,
  showResult,
  disabled,
  onClick,
  slotColoredResults = false,
}: AnswerButtonProps) {
  const config = answerConfig[index % 4]

  const getButtonStyle = () => {
    if (!showResult) {
      if (disabled) {
        if (isSelected) return cn(config.color, config.shadowColor, 'ring-4 ring-white/90 scale-[1.02] brightness-110')
        return cn(config.color, 'opacity-30 scale-95 saturate-50 shadow-none')
      }
      return cn(
        config.color,
        config.shadowColor,
        'active:translate-y-1 active:shadow-none'
      )
    }
    if (slotColoredResults) {
      if (isCorrect) {
        return cn(
          config.activeColor,
          config.shadowColor,
          'scale-105 ring-2 ring-white/90'
        )
      }
      if (isSelected && !isCorrect) {
        return cn(config.activeColor, config.shadowColor, 'opacity-85 scale-[0.98]')
      }
      return cn(config.activeColor, config.shadowColor, 'opacity-35 scale-95')
    }
    if (isCorrect) {
      return 'bg-answer-green shadow-[0_4px_0_oklch(0.42_0.2_145)] scale-105'
    }
    if (isSelected && !isCorrect) {
      return 'bg-answer-red opacity-70 scale-95'
    }
    return 'opacity-40 scale-95'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative w-full flex items-center gap-3 px-4 py-4 rounded-xl',
        'text-white font-bold text-left',
        'transition-all duration-200',
        'min-h-[60px]',
        'animate-pop-in opacity-0',
        config.stagger,
        getButtonStyle(),
        !disabled && !showResult && 'hover:scale-[1.02] hover:translate-y-[-2px]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50'
      )}
      aria-label={`Answer ${config.label}: ${text}`}
    >
      {/* Shape icon */}
      <span className="text-white/80 text-lg shrink-0 w-6 text-center" aria-hidden="true">
        {config.icon}
      </span>

      {/* Answer text */}
      <span className="flex-1 text-sm md:text-base leading-snug">{text}</span>

      {/* Result indicator */}
      {showResult && isCorrect && (
        <CheckCircle className="w-6 h-6 shrink-0 text-white animate-pop-in" aria-label="Correct" />
      )}
      {showResult && isSelected && !isCorrect && (
        <XCircle className="w-6 h-6 shrink-0 text-white animate-pop-in" aria-label="Incorrect" />
      )}

      {/* Shimmer on hover */}
      {!showResult && !disabled && (
        <span className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <span className="animate-shimmer absolute inset-0 opacity-0 group-hover:opacity-100" />
        </span>
      )}
    </button>
  )
}
