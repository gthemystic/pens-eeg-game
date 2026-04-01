'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useGameStore } from '@/lib/quiz-store'
import { eegQuizzes, type Quiz } from '@/lib/quiz-data'
import { QuizCard } from '@/components/quiz-card'
import { PensLogo, PensLogoFull } from '@/components/pens-logo'
import { BrainwaveAnimation } from '@/components/brainwave-animation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  Brain,
  BookOpen,
  Users,
  Search,
  Play,
  Zap,
  Star,
  ChevronRight,
} from 'lucide-react'

export function LobbyScreen() {
  const { startGame, setPlayerName, playerName } = useGameStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [localName, setLocalName] = useState(playerName || '')
  const [nameError, setNameError] = useState('')

  const filteredQuizzes = eegQuizzes.filter(
    (q) =>
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz)
  }

  const handleStartGame = () => {
    const name = localName.trim()
    if (!name) {
      setNameError('Please enter your name to continue')
      return
    }
    if (!selectedQuiz) return
    setNameError('')
    setPlayerName(name)
    startGame(selectedQuiz, name)
  }

  const totalQuestions = eegQuizzes.reduce((sum, q) => sum + q.questions.length, 0)
  const totalPlays = eegQuizzes.reduce((sum, q) => sum + q.plays, 0)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Header */}
      <header className="relative overflow-hidden bg-[oklch(0.12_0.08_262)] border-b border-border/50">
        <BrainwaveAnimation className="absolute bottom-0 left-0 right-0" />
        <div className="relative z-10 px-4 py-8 md:py-12 flex flex-col items-center gap-5 text-center">
          <div className="animate-float">
            <PensLogoFull />
          </div>
          <div className="space-y-2 animate-slide-up-fade">
            <h1 className="font-black text-2xl md:text-3xl text-foreground text-balance">
              EEG Training Quiz
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-md leading-relaxed">
              Sharpen your neurodiagnostic skills with interactive EEG quizzes designed for trainees and clinicians.
            </p>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-4 md:gap-6 text-sm animate-slide-up-fade stagger-2">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <BookOpen className="w-4 h-4 text-primary" />
              <span><strong className="text-foreground">{totalQuestions}</strong> Questions</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="w-4 h-4 text-answer-green" />
              <span><strong className="text-foreground">{eegQuizzes.length}</strong> Quizzes</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Play className="w-4 h-4 text-answer-yellow" />
              <span><strong className="text-foreground">{totalPlays}</strong> Plays</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-6 space-y-6 max-w-4xl mx-auto w-full">
        {/* Search */}
        <div className="relative animate-slide-up-fade">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search quizzes..."
            className="pl-10 bg-card border-border/50 rounded-xl h-11 text-base"
            aria-label="Search quizzes"
          />
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide animate-slide-up-fade stagger-1">
          {['All', 'EEG Interpretation', 'EEG Variants', 'Epilepsy Syndromes'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSearchTerm(cat === 'All' ? '' : cat)}
              className={cn(
                'shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors',
                (cat === 'All' && !searchTerm) || searchTerm === cat
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary text-secondary-foreground border-border/50 hover:bg-secondary/80'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Section header */}
        <div className="flex items-center justify-between">
          <h2 className="font-black text-lg text-foreground">
            Quiz Library
            <span className="ml-2 text-muted-foreground font-normal text-sm">
              ({filteredQuizzes.length})
            </span>
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Brain className="w-4 h-4 text-primary" />
            EEG Training
          </div>
        </div>

        {/* Quiz grid */}
        {filteredQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQuizzes.map((quiz, idx) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onClick={() => handleSelectQuiz(quiz)}
                style={{ animationDelay: `${idx * 0.08}s` }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Brain className="w-12 h-12 text-muted-foreground" />
            <p className="text-muted-foreground">No quizzes match your search</p>
            <Button variant="outline" onClick={() => setSearchTerm('')} size="sm">
              Clear search
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-4 py-4 text-center border-t border-border/50 space-y-2">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} PENS — Pediatric Epilepsy &amp; Neurology Specialists. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground">
          Classroom mode?{' '}
          <Link href="/" className="font-bold text-primary underline-offset-4 hover:underline">
            Join a live quiz
          </Link>
          {' · '}
          <Link href="/admin" className="font-bold text-primary underline-offset-4 hover:underline">
            Host / admin login
          </Link>
        </p>
      </footer>

      {/* Quiz start dialog */}
      <Dialog open={!!selectedQuiz} onOpenChange={(open) => !open && setSelectedQuiz(null)}>
        <DialogContent className="bg-card border-border max-w-md mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-xl text-balance">
              {selectedQuiz?.title}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
              {selectedQuiz?.description}
            </DialogDescription>
          </DialogHeader>

          {selectedQuiz && (
            <div className="space-y-4">
              {/* Quiz meta */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  <BookOpen className="w-3 h-3 mr-1" />
                  {selectedQuiz.questions.length} Questions
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  {selectedQuiz.difficulty}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  {selectedQuiz.category}
                </Badge>
              </div>

              {/* Answer preview */}
              <div className="bg-[oklch(0.18_0.07_262)] rounded-xl p-3 grid grid-cols-2 gap-1.5">
                {['bg-answer-red', 'bg-answer-blue', 'bg-answer-yellow', 'bg-answer-green'].map(
                  (color, i) => (
                    <div key={i} className={cn('rounded-lg px-3 py-2 flex items-center gap-2', color)}>
                      <span className="text-white text-xs font-bold">
                        {['▲', '◆', '●', '■'][i]}
                      </span>
                      <div className="h-2 flex-1 rounded bg-white/30" />
                    </div>
                  )
                )}
              </div>

              {/* Player name */}
              <div className="space-y-1.5">
                <label htmlFor="player-name" className="text-sm font-semibold text-foreground">
                  Your Name
                </label>
                <Input
                  id="player-name"
                  value={localName}
                  onChange={(e) => {
                    setLocalName(e.target.value)
                    setNameError('')
                  }}
                  placeholder="Enter your name..."
                  className="bg-secondary border-border/50 rounded-xl h-11 text-base"
                  onKeyDown={(e) => e.key === 'Enter' && handleStartGame()}
                  maxLength={30}
                />
                {nameError && (
                  <p className="text-xs text-answer-red">{nameError}</p>
                )}
              </div>

              <Button
                onClick={handleStartGame}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-base rounded-xl"
              >
                <Play className="w-5 h-5 mr-2 fill-current" />
                Start Quiz
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
