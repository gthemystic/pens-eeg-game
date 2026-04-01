'use client'

import { useEffect, useRef } from 'react'
import { useGameStore } from '@/lib/quiz-store'
import { PensLogo } from '@/components/pens-logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Trophy,
  Star,
  Flame,
  RotateCcw,
  Home,
  CheckCircle,
  XCircle,
  Brain,
} from 'lucide-react'

function Confetti() {
  const colors = [
    'oklch(0.62 0.22 25)',
    'oklch(0.55 0.22 250)',
    'oklch(0.82 0.18 85)',
    'oklch(0.58 0.2 145)',
    'oklch(0.97 0 0)',
  ]
  const pieces = Array.from({ length: 40 })

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10" aria-hidden="true">
      {pieces.map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-3 rounded-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-20px',
            backgroundColor: colors[i % colors.length],
            animation: `confetti-fall ${2 + Math.random() * 3}s ease-in forwards`,
            animationDelay: `${Math.random() * 2}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  )
}

export function ResultsScreen({ onRestart, onHome }: { onRestart: () => void; onHome: () => void }) {
  const { quiz, playerAnswers, totalScore, maxStreak, playerName } = useGameStore()

  if (!quiz) return null

  const correctCount = playerAnswers.filter((a) => a.isCorrect).length
  const totalQuestions = quiz.questions.length
  const percentage = Math.round((correctCount / totalQuestions) * 100)
  const isGreat = percentage >= 80

  const getRankLabel = () => {
    if (percentage === 100) return { label: 'Perfect Score!', sub: 'EEG Expert', icon: '🧠' }
    if (percentage >= 80) return { label: 'Excellent!', sub: 'Senior EEG Reader', icon: '⭐' }
    if (percentage >= 60) return { label: 'Good Job!', sub: 'Junior Neurologist', icon: '📈' }
    return { label: 'Keep Practicing', sub: 'EEG Trainee', icon: '📚' }
  }

  const rank = getRankLabel()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {isGreat && <Confetti />}

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <PensLogo size="sm" />
        <span className="text-muted-foreground text-sm">{playerName}</span>
      </header>

      <div className="flex-1 flex flex-col items-center px-4 py-8 gap-6 max-w-lg mx-auto w-full">

        {/* Trophy section */}
        <div className="flex flex-col items-center gap-3 animate-pop-in">
          <div
            className={cn(
              'w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-2xl',
              isGreat
                ? 'bg-answer-yellow/20 animate-pulse-glow'
                : 'bg-secondary'
            )}
          >
            {isGreat ? (
              <Trophy className="w-12 h-12 text-answer-yellow" />
            ) : (
              <Brain className="w-12 h-12 text-primary" />
            )}
          </div>
          <h1 className="font-black text-3xl text-foreground text-balance text-center">
            {rank.label}
          </h1>
          <p className="text-muted-foreground text-sm font-semibold">{rank.sub}</p>
        </div>

        {/* Score card */}
        <div className="w-full bg-card rounded-2xl border border-border/50 overflow-hidden animate-slide-up-fade">
          <div className="bg-[oklch(0.22_0.09_262)] px-6 py-4 text-center">
            <div className="text-5xl font-black text-foreground tabular-nums">
              {totalScore.toLocaleString()}
            </div>
            <div className="text-muted-foreground text-sm mt-1">Total Points</div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border">
            <div className="flex flex-col items-center py-4 gap-1">
              <span className="text-2xl font-black text-answer-green">{correctCount}</span>
              <span className="text-xs text-muted-foreground text-center">Correct</span>
            </div>
            <div className="flex flex-col items-center py-4 gap-1">
              <span className="text-2xl font-black text-foreground">{percentage}%</span>
              <span className="text-xs text-muted-foreground text-center">Accuracy</span>
            </div>
            <div className="flex flex-col items-center py-4 gap-1">
              <span className="flex items-center gap-1 text-2xl font-black text-answer-yellow">
                <Flame className="w-5 h-5" />
                {maxStreak}
              </span>
              <span className="text-xs text-muted-foreground text-center">Best Streak</span>
            </div>
          </div>
        </div>

        {/* Question breakdown */}
        <div className="w-full space-y-2 animate-slide-up-fade stagger-2">
          <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">
            Question Breakdown
          </h2>
          <div className="space-y-1.5">
            {quiz.questions.map((q, idx) => {
              const answer = playerAnswers[idx]
              return (
                <div
                  key={q.id}
                  className="flex items-start gap-3 bg-card rounded-xl p-3 border border-border/50"
                >
                  <div className="shrink-0 mt-0.5">
                    {answer?.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-answer-green" />
                    ) : (
                      <XCircle className="w-5 h-5 text-answer-red" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground line-clamp-1">{q.question}</p>
                    {!answer?.isCorrect && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Correct: {q.answers.find((a) => a.isCorrect)?.text}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={cn(
                        'text-sm font-bold',
                        answer?.isCorrect ? 'text-answer-yellow' : 'text-muted-foreground'
                      )}
                    >
                      +{answer?.pointsEarned ?? 0}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-3 animate-slide-up-fade stagger-3">
          <Button
            onClick={onRestart}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Play Again
          </Button>
          <Button
            onClick={onHome}
            variant="outline"
            className="w-full h-12 font-bold rounded-xl border-border"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Quiz Library
          </Button>
        </div>

        {/* PENS branding footer */}
        <p className="text-xs text-muted-foreground text-center leading-relaxed mt-2">
          Powered by <span className="font-bold text-foreground">PENS</span> — Pediatric Epilepsy &amp; Neurology Specialists
        </p>
      </div>
    </div>
  )
}
