'use client'

import { BookOpen, Users, Play, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Quiz } from '@/lib/quiz-data'
import { cn } from '@/lib/utils'

interface QuizCardProps {
  quiz: Quiz
  onClick: () => void
  style?: React.CSSProperties
}

const difficultyColors = {
  Beginner: 'bg-answer-green/20 text-answer-green border-answer-green/30',
  Intermediate: 'bg-answer-yellow/20 text-answer-yellow border-answer-yellow/30',
  Advanced: 'bg-answer-red/20 text-answer-red border-answer-red/30',
}

const categoryColors = [
  'from-[oklch(0.62_0.22_25)] to-[oklch(0.55_0.22_250)]',
  'from-[oklch(0.55_0.22_250)] to-[oklch(0.58_0.2_145)]',
  'from-[oklch(0.58_0.2_145)] to-[oklch(0.82_0.18_85)]',
]

const answerShapes = [
  { color: 'bg-answer-red', icon: '▲', label: 'Triangle' },
  { color: 'bg-answer-blue', icon: '◆', label: 'Diamond' },
  { color: 'bg-answer-yellow', icon: '●', label: 'Circle' },
  { color: 'bg-answer-green', icon: '■', label: 'Square' },
]

export function QuizCard({ quiz, onClick, style }: QuizCardProps) {
  const colorIdx = Math.abs(quiz.id.charCodeAt(0)) % categoryColors.length

  return (
    <button
      onClick={onClick}
      style={style}
      className={cn(
        'group relative w-full text-left rounded-2xl overflow-hidden',
        'bg-card border border-border/50',
        'quiz-card-hover cursor-pointer',
        'animate-slide-up-fade opacity-0',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      )}
      aria-label={`Start quiz: ${quiz.title}`}
    >
      {/* Top color bar with answer buttons */}
      <div className={`h-2 w-full bg-gradient-to-r ${categoryColors[colorIdx]}`} />

      {/* Answer button grid preview */}
      <div className="relative bg-[oklch(0.22_0.09_262)] p-3">
        <div className="grid grid-cols-2 gap-1.5">
          {answerShapes.map((shape, i) => (
            <div
              key={shape.label}
              className={cn(
                'flex items-center gap-2 rounded-lg px-2.5 py-2',
                shape.color,
                'opacity-90'
              )}
            >
              <span className="text-white text-xs font-bold">{shape.icon}</span>
              <div className="flex-1 h-2 rounded-full bg-white/30" />
            </div>
          ))}
        </div>

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-b">
          <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold text-sm shadow-lg">
            <Play className="w-4 h-4 fill-current" />
            Play Now
          </div>
        </div>
      </div>

      {/* Info section */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-foreground text-sm leading-tight line-clamp-2 text-balance">
            {quiz.title}
          </h3>
          <Badge
            variant="outline"
            className={cn('shrink-0 text-xs border', difficultyColors[quiz.difficulty])}
          >
            {quiz.difficulty}
          </Badge>
        </div>

        <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
          {quiz.description}
        </p>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3 text-muted-foreground text-xs">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              {quiz.questions.length} questions
            </span>
            <span className="flex items-center gap-1">
              <Play className="w-3.5 h-3.5" />
              {quiz.plays} plays
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            {quiz.participants}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {quiz.category}
          </Badge>
          {quiz.difficulty === 'Advanced' && (
            <span className="flex items-center gap-1 text-xs text-answer-yellow">
              <Zap className="w-3 h-3" />
              Challenge
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
