import { create } from 'zustand'
import type { Quiz, Question } from './quiz-data'

export interface PlayerAnswer {
  questionId: string
  answerId: string | null
  isCorrect: boolean
  timeRemaining: number
  pointsEarned: number
}

export interface GameState {
  phase: 'lobby' | 'playing' | 'question-result' | 'final-results'
  quiz: Quiz | null
  currentQuestionIndex: number
  playerAnswers: PlayerAnswer[]
  totalScore: number
  streak: number
  maxStreak: number
  playerName: string
  timeRemaining: number
  selectedAnswerId: string | null
  showAnswer: boolean
}

interface GameActions {
  startGame: (quiz: Quiz, playerName: string) => void
  selectAnswer: (answerId: string, timeRemaining: number) => void
  nextQuestion: () => void
  resetGame: () => void
  setPlayerName: (name: string) => void
  setTimeRemaining: (time: number) => void
  timeUp: () => void
}

const initialState: GameState = {
  phase: 'lobby',
  quiz: null,
  currentQuestionIndex: 0,
  playerAnswers: [],
  totalScore: 0,
  streak: 0,
  maxStreak: 0,
  playerName: '',
  timeRemaining: 0,
  selectedAnswerId: null,
  showAnswer: false,
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...initialState,

  setPlayerName: (name) => set({ playerName: name }),

  setTimeRemaining: (time) => set({ timeRemaining: time }),

  startGame: (quiz, playerName) => {
    set({
      phase: 'playing',
      quiz,
      playerName,
      currentQuestionIndex: 0,
      playerAnswers: [],
      totalScore: 0,
      streak: 0,
      maxStreak: 0,
      timeRemaining: quiz.questions[0]?.timeLimit ?? 20,
      selectedAnswerId: null,
      showAnswer: false,
    })
  },

  selectAnswer: (answerId, timeRemaining) => {
    const { quiz, currentQuestionIndex, streak, maxStreak } = get()
    if (!quiz) return

    const question = quiz.questions[currentQuestionIndex]
    const answer = question.answers.find((a) => a.id === answerId)
    if (!answer) return

    const isCorrect = answer.isCorrect
    const timeFraction = timeRemaining / question.timeLimit
    const pointsEarned = isCorrect
      ? Math.round(question.points * (0.5 + 0.5 * timeFraction))
      : 0

    const newStreak = isCorrect ? streak + 1 : 0
    const newMaxStreak = Math.max(newStreak, maxStreak)

    const playerAnswer: PlayerAnswer = {
      questionId: question.id,
      answerId,
      isCorrect,
      timeRemaining,
      pointsEarned,
    }

    set((state) => ({
      selectedAnswerId: answerId,
      showAnswer: true,
      streak: newStreak,
      maxStreak: newMaxStreak,
      totalScore: state.totalScore + pointsEarned,
      playerAnswers: [...state.playerAnswers, playerAnswer],
    }))
  },

  timeUp: () => {
    const { quiz, currentQuestionIndex } = get()
    if (!quiz) return

    const question = quiz.questions[currentQuestionIndex]

    const playerAnswer: PlayerAnswer = {
      questionId: question.id,
      answerId: null,
      isCorrect: false,
      timeRemaining: 0,
      pointsEarned: 0,
    }

    set((state) => ({
      selectedAnswerId: null,
      showAnswer: true,
      streak: 0,
      playerAnswers: [...state.playerAnswers, playerAnswer],
    }))
  },

  nextQuestion: () => {
    const { quiz, currentQuestionIndex } = get()
    if (!quiz) return

    const nextIndex = currentQuestionIndex + 1

    if (nextIndex >= quiz.questions.length) {
      set({ phase: 'final-results' })
    } else {
      set({
        currentQuestionIndex: nextIndex,
        timeRemaining: quiz.questions[nextIndex].timeLimit,
        selectedAnswerId: null,
        showAnswer: false,
        phase: 'playing',
      })
    }
  },

  resetGame: () => set(initialState),
}))
