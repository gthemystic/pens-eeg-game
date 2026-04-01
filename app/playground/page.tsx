'use client'

import { useEffect, useState } from 'react'
import { HostPodium } from '@/components/host-podium'
import { HeroAvatarFace } from '@/components/hero-avatar-face'
import { VictoryConfetti } from '@/lib/victory-confetti'
import { BrainwaveAnimation } from '@/components/brainwave-animation'
import { cn } from '@/lib/utils'
import { Trophy, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * 🎪 The Victory Playground - A sandbox to test the dramatic quiz ending
 */
export default function PlaygroundPage() {
  const [revealStep, setRevealStep] = useState(0)
  const [key, setKey] = useState(0) // Used to force re-render/reset sequence

  const mockLeaderboard = [
    { playerId: '1', name: 'Dr. Brainwave', avatarId: 'alohe-memo-1', heroEmoji: '🧠', totalPoints: 12450, correctCount: 10 },
    { playerId: '2', name: 'Synapse Surfer', avatarId: 'alohe-vibrent-5', heroEmoji: '🏄', totalPoints: 11200, correctCount: 9 },
    { playerId: '3', name: 'Neuron Ninja', avatarId: 'alohe-notion-3', heroEmoji: '🥷', totalPoints: 9800, correctCount: 8 },
    { playerId: '4', name: 'Alpha Wave', avatarId: 'alohe-teams-2', heroEmoji: '🌊', totalPoints: 8500, correctCount: 7 },
    { playerId: '5', name: 'Delta Dreamer', avatarId: 'alohe-toon-8', heroEmoji: '💤', totalPoints: 7200, correctCount: 6 },
  ]

  const [gold, silver, bronze, ...rest] = mockLeaderboard

  const startSequence = () => {
    setRevealStep(0)
    setKey(prev => prev + 1)
  }

  useEffect(() => {
    // Sequence: Atmosphere (1s) -> 3rd (2s) -> 2nd (1.5s) -> 1st (massive)
    const timer1 = setTimeout(() => {
      setRevealStep(1)
      VictoryConfetti.bronze()
    }, 2000)

    const timer2 = setTimeout(() => {
      setRevealStep(2)
      VictoryConfetti.silver()
    }, 4000)

    const timer3 = setTimeout(() => {
      setRevealStep(3)
      VictoryConfetti.gold()
    }, 6000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [key])

  return (
    <div key={key} className={cn(
      "min-h-screen transition-colors duration-1000 flex flex-col items-center px-4 py-10 md:py-14 gap-8 relative overflow-hidden",
      revealStep >= 3 
        ? "bg-[oklch(0.12_0.08_262)] bg-linear-to-b from-amber-500/20 via-sky-900 to-black" 
        : "bg-background bg-linear-to-b from-sky-400 via-sky-300 to-amber-100"
    )}>
      {/* Controls Overlay */}
      <div className="fixed top-4 right-4 z-[100]">
        <Button 
          onClick={startSequence}
          variant="secondary"
          className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Replay Sequence
        </Button>
      </div>

      <div className={cn(
        "pointer-events-none absolute inset-0 transition-opacity duration-1000",
        revealStep >= 3 ? "opacity-100" : "opacity-30"
      )} 
      style={{ background: "radial-gradient(ellipse at center, transparent 0%, oklch(0.15 0.06 262 / 0.35) 100%)" }} />
      
      <BrainwaveAnimation className={cn(
        "absolute bottom-0 pointer-events-none mix-blend-multiply transition-opacity duration-1000",
        revealStep >= 3 ? "opacity-25" : "opacity-15"
      )} />

      <div className="relative z-10 flex flex-col items-center gap-3 text-center animate-slide-up-fade">
        <div className={cn(
          "relative transition-transform duration-700",
          revealStep >= 3 && "scale-125"
        )}>
          <Trophy className={cn(
            "w-14 h-14 md:w-16 md:h-16 text-amber-900 drop-shadow transition-all duration-1000",
            revealStep >= 3 && "text-amber-400 animate-pulse-glow"
          )} />
          {revealStep >= 3 && (
            <div className="absolute inset-0 bg-amber-400 blur-2xl opacity-20 animate-pulse" />
          )}
        </div>
        <p className="uppercase tracking-[0.35em] text-sm text-white font-black drop-shadow">
          {revealStep >= 3 ? "Champion Crowned" : "Final podium"}
        </p>
        <h2 className="text-4xl md:text-6xl font-black text-white drop-shadow-lg max-w-4xl text-balance">
          EEG Essentials Playground
        </h2>
      </div>

      <HostPodium 
        first={gold} 
        second={silver} 
        third={bronze} 
        revealedStep={revealStep}
        className="relative z-10 py-4" 
      />

      {rest.length > 0 && revealStep >= 3 && (
        <ol className="relative z-10 w-full max-w-3xl space-y-2 px-2 animate-slide-up-fade stagger-3">
          {rest.map((row, i) => (
            <li
              key={row.playerId}
              className={cn(
                'flex items-center justify-between rounded-2xl px-5 py-4 text-lg md:text-xl font-bold',
                'bg-black/25 backdrop-blur-md border border-white/20 text-white'
              )}
            >
              <span className="flex items-center gap-3 min-w-0">
                <span className="text-2xl font-black tabular-nums w-10 shrink-0 text-white/90">
                  {i + 4}
                </span>
                <HeroAvatarFace
                  avatarId={row.avatarId}
                  frameClassName="h-8 w-8"
                  imgClassName="h-full w-full"
                  emojiClassName="text-2xl"
                />
                <span className="truncate">{row.name}</span>
              </span>
              <span className="font-black tabular-nums">{row.totalPoints.toLocaleString()} pts</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
