'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useGameStore } from '@/lib/quiz-store'
import { AnswerButton } from '@/components/answer-button'
import { QuizTimer, ProgressBar } from '@/components/quiz-timer'
import { PensLogo } from '@/components/pens-logo'
import { BrainwaveAnimation } from '@/components/brainwave-animation'
import { cn } from '@/lib/utils'
import { Flame, Star, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function GameScreen() {
  const {
    quiz,
    currentQuestionIndex,
    timeRemaining,
    selectedAnswerId,
    showAnswer,
    totalScore,
    streak,
    playerName,
    selectAnswer,
    nextQuestion,
    setTimeRemaining,
    timeUp,
  } = useGameStore()

  const question = quiz?.questions[currentQuestionIndex]
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Reset timer and start countdown on new question
  useEffect(() => {
    if (!question || showAnswer) return

    // Initialize time
    setTimeRemaining(question.timeLimit)

    // Use a ref to track the current time to avoid stale closure
    let current = question.timeLimit

    timerRef.current = setInterval(() => {
      current -= 1
      if (current <= 0) {
        clearInterval(timerRef.current!)
        setTimeRemaining(0)
      } else {
        setTimeRemaining(current)
      }
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [currentQuestionIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  // Stop timer when answer selected or time up
  useEffect(() => {
    if (showAnswer && timerRef.current) {
      clearInterval(timerRef.current)
    }
  }, [showAnswer])

  // Watch for time running out (timeRemaining hits 0 without selecting)
  useEffect(() => {
    if (timeRemaining <= 0 && !showAnswer && question) {
      timeUp()
    }
  }, [timeRemaining]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectAnswer = useCallback(
    (answerId: string) => {
      if (showAnswer || !question) return
      selectAnswer(answerId, timeRemaining)
    },
    [showAnswer, question, selectAnswer, timeRemaining]
  )

  if (!quiz || !question) return null

  const correctAnswer = question.answers.find((a) => a.isCorrect)
  const selectedAnswer = question.answers.find((a) => a.id === selectedAnswerId)
  const isCorrect = selectedAnswer?.isCorrect ?? false

  // Get last recorded points
  const lastAnswer = useGameStore.getState().playerAnswers.at(-1)
  const lastPoints = lastAnswer?.pointsEarned ?? 0

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <PensLogo size="sm" />
        <div className="flex items-center gap-3">
          {streak >= 2 && (
            <div className="flex items-center gap-1 text-answer-yellow text-sm font-bold animate-pop-in">
              <Flame className="w-4 h-4" />
              <span>{streak}x</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full">
            <Star className="w-4 h-4 text-answer-yellow fill-answer-yellow" />
            <span className="font-black text-sm tabular-nums">{totalScore.toLocaleString()}</span>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="px-4 pt-3">
        <ProgressBar
          current={currentQuestionIndex}
          total={quiz.questions.length}
        />
      </div>

      {/* Question card */}
      <div className="flex-1 flex flex-col px-4 py-4 gap-4">
        <div className="relative bg-[oklch(0.22_0.09_262)] rounded-2xl overflow-hidden border border-border/50 shadow-xl">
          <BrainwaveAnimation className="absolute bottom-0 left-0 right-0 opacity-30" />

          <div className="relative z-10 p-5 flex flex-col items-center gap-4">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                Q{currentQuestionIndex + 1} of {quiz.questions.length}
              </span>
              <QuizTimer
                timeRemaining={timeRemaining}
                totalTime={question.timeLimit}
              />
            </div>

            <p className="text-foreground font-black text-lg md:text-xl text-center text-balance leading-snug min-h-[60px]">
              {question.question}
            </p>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="w-3.5 h-3.5 text-answer-yellow" />
              Up to {question.points.toLocaleString()} pts
            </div>
          </div>
        </div>

        {/* Answer buttons */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" key={`answers-${currentQuestionIndex}`}>
          {question.answers.map((answer, idx) => (
            <AnswerButton
              key={answer.id}
              id={answer.id}
              text={answer.text}
              index={idx}
              isSelected={selectedAnswerId === answer.id}
              isCorrect={answer.isCorrect}
              showResult={showAnswer}
              disabled={showAnswer}
              onClick={() => handleSelectAnswer(answer.id)}
            />
          ))}
        </div>

        {/* Result feedback */}
        {showAnswer && (
          <div
            className={cn(
              'rounded-2xl p-4 border animate-slide-up-fade',
              isCorrect
                ? 'bg-answer-green/10 border-answer-green/30'
                : 'bg-answer-red/10 border-answer-red/30'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p
                  className={cn(
                    'font-black text-base mb-1',
                    isCorrect ? 'text-answer-green' : 'text-answer-red'
                  )}
                >
                  {selectedAnswerId === null
                    ? "Time's up!"
                    : isCorrect
                    ? streak >= 2
                      ? `On fire! ${streak}x streak!`
                      : 'Correct!'
                    : 'Incorrect'}
                </p>
                {!isCorrect && (
                  <p className="text-sm text-muted-foreground mb-1">
                    Correct answer:{' '}
                    <span className="font-semibold text-foreground">
                      {correctAnswer?.text}
                    </span>
                  </p>
                )}
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {question.explanation}
                </p>
              </div>
              {isCorrect && lastPoints > 0 && (
                <div className="shrink-0 text-right">
                  <span className="text-answer-yellow font-black text-xl animate-score-pop block">
                    +{lastPoints}
                  </span>
                  <span className="text-xs text-muted-foreground">pts</span>
                </div>
              )}
            </div>

            <Button
              onClick={nextQuestion}
              className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl h-12"
            >
              {currentQuestionIndex + 1 >= quiz.questions.length ? 'See Results' : 'Next Question'}
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
