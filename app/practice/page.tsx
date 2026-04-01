'use client'

import { useGameStore } from '@/lib/quiz-store'
import { LobbyScreen } from '@/components/lobby-screen'
import { GameScreen } from '@/components/game-screen'
import { ResultsScreen } from '@/components/results-screen'

/**
 * 🧘 Solo practice mode — the original single-player runway (no host required).
 */
export default function PracticePage() {
  const { phase, quiz, resetGame, startGame, playerName } = useGameStore()

  const handleRestart = () => {
    if (!quiz) return
    startGame(quiz, playerName)
  }

  const handleHome = () => {
    resetGame()
  }

  if (phase === 'playing' || phase === 'question-result') {
    return <GameScreen />
  }

  if (phase === 'final-results') {
    return <ResultsScreen onRestart={handleRestart} onHome={handleHome} />
  }

  return <LobbyScreen />
}
