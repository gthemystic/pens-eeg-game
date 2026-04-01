'use client'

/**
 * 🖥️ The Big Canvas — meant for the projector, not your pocket
 * Bold type, loud colors, zero mystery about who picked what. 🎬
 */

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { cleanCode, tickLiveSession } from '@/lib/live-client'
import { useLiveSession } from '@/hooks/use-live-session'
import { HostReactionBubbles } from '@/components/host-reaction-bubbles'
import { PensLogoFull } from '@/components/pens-logo'
import { BrainwaveAnimation } from '@/components/brainwave-animation'
import { QuizTimer } from '@/components/quiz-timer'
import { AnswerButton } from '@/components/answer-button'
import { HostAnswerDistribution } from '@/components/host-answer-distribution'
import { HostPodium } from '@/components/host-podium'
import { HeroAvatarFace } from '@/components/hero-avatar-face'
import { VictoryConfetti } from '@/lib/victory-confetti'
import { cn } from '@/lib/utils'
import { Loader2, Trophy } from 'lucide-react'

function DisplayInner() {
  const params = useSearchParams()
  const raw = params.get('code') ?? ''
  const code = cleanCode(raw)
  const tickSentRef = useRef('')

  const snap = useLiveSession(code.length >= 4 ? code : null, null)
  const [nowTick, setNowTick] = useState(() => Date.now())
  const [revealStep, setRevealStep] = useState(0) // 0: Atmosphere, 1: 3rd, 2: 2nd, 3: 1st/Podium Complete

  useEffect(() => {
    if (!snap?.questionEndsAt) return
    const id = window.setInterval(() => setNowTick(Date.now()), 200)
    return () => window.clearInterval(id)
  }, [snap?.questionEndsAt])

  // Reset or start reveal sequence when we hit the final phase
  useEffect(() => {
    if (snap?.phase === 'final') {
      // Sequence: Atmosphere (1s) -> 3rd (2s) -> 2nd (1.5s) -> 1st (massive)
      const timer1 = setTimeout(() => {
        setRevealStep(1)
        VictoryConfetti.bronze()
      }, 3000) // Give a few seconds for the atmosphere to build

      const timer2 = setTimeout(() => {
        setRevealStep(2)
        VictoryConfetti.silver()
      }, 5000)

      const timer3 = setTimeout(() => {
        setRevealStep(3)
        VictoryConfetti.gold()
      }, 7000)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    } else {
      setRevealStep(0)
    }
  }, [snap?.phase])

  const timeRemaining = useMemo(() => {
    if (!snap?.questionEndsAt || !snap.question) return snap?.question?.timeLimit ?? 0
    const msLeft = snap.questionEndsAt - nowTick
    return Math.max(0, Math.ceil(msLeft / 1000))
  }, [snap?.questionEndsAt, snap?.question, nowTick])

  useEffect(() => {
    if (code.length < 4 || !snap || snap.phase !== 'question' || !snap.questionEndsAt) return
    if (timeRemaining > 0) return
    const key = `${snap.currentQuestionIndex}-${snap.questionEndsAt}`
    if (tickSentRef.current === key) return
    tickSentRef.current = key
    tickLiveSession(code)
  }, [code, snap, timeRemaining])

  const missing = code.length >= 4 && snap === null

  if (code.length < 4) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[oklch(0.12_0.08_262)] text-white px-6 text-center gap-4">
        <PensLogoFull />
        <p className="text-xl font-bold">Add ?code=ROOM to this URL from the host phone.</p>
        <Link href="/admin" className="underline font-semibold">
          Open host console
        </Link>
      </div>
    )
  }

  if (missing || !snap) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-3">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-lg font-semibold text-muted-foreground">Connecting to room {code}…</p>
      </div>
    )
  }

  if (snap.phase === 'lobby') {
    return (
      <div className="min-h-screen bg-[oklch(0.1_0.06_262)] text-white flex flex-col relative overflow-hidden">
        <BrainwaveAnimation className="absolute bottom-0 opacity-30 pointer-events-none" />
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 gap-10">
          <PensLogoFull />
          <div className="text-center space-y-3">
            <p className="uppercase tracking-[0.35em] text-sm text-white/70">Room code</p>
            <p className="text-7xl md:text-9xl font-black tracking-[0.25em]">{snap.code}</p>
          </div>
          <div className="w-full max-w-4xl bg-white/5 border border-white/10 rounded-3xl p-8">
            <p className="text-sm uppercase text-white/60 font-bold tracking-widest mb-4">
              Lobby roster · {snap.players.length} players
            </p>
            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-lg font-bold">
              {snap.players.map((p) => (
                <li
                  key={p.id}
                  className="rounded-2xl bg-white/10 px-4 py-3 flex flex-col items-center justify-center gap-1 text-center"
                >
                  <HeroAvatarFace
                    avatarId={p.avatarId}
                    frameClassName="h-12 w-12"
                    imgClassName="h-full w-full"
                    emojiClassName="text-3xl"
                  />
                  <span className="truncate w-full">{p.name}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-center text-xl text-white/80 max-w-2xl">
            {snap.quizTitle}
          </p>
          <p className="text-2xl font-black text-answer-yellow animate-pulse">
            Waiting for host to start…
          </p>
        </div>
      </div>
    )
  }

  if (snap.phase === 'question' && snap.question) {
    const q = snap.question
    return (
      <>
        <HostReactionBubbles bubbles={snap.reactionBubbles} />
        <div className="min-h-screen bg-background flex flex-col relative">
          <div className="absolute top-4 left-4 z-[55] rounded-full bg-black/75 backdrop-blur-sm text-white px-4 py-2 md:px-5 md:py-3 text-lg md:text-2xl font-black tabular-nums border-2 border-white/25 shadow-lg">
            {snap.answeredCount}/{snap.totalPlayers} answered
          </div>
        <div className="relative bg-[oklch(0.14_0.08_262)] text-white px-6 py-10 flex flex-col gap-6 overflow-hidden">
          <BrainwaveAnimation className="absolute bottom-0 opacity-35 pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-start gap-8">
            <div className="flex-1 space-y-4">
              <p className="text-sm font-bold uppercase tracking-[0.35em] text-white/60">
                Question {snap.currentQuestionIndex + 1} / {snap.questionCount}
              </p>
              <h1 className="text-4xl md:text-6xl font-black leading-tight text-balance">
                {q.prompt}
              </h1>
            </div>
            <div className="shrink-0 flex items-center gap-6">
              <QuizTimer
                className="scale-125 md:scale-150"
                timeRemaining={timeRemaining}
                totalTime={q.timeLimit}
              />
            </div>
          </div>
        </div>
        <div className="flex-1 px-4 md:px-10 py-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {q.choices.map((choice, idx) => (
            <AnswerButton
              key={choice.id}
              id={choice.id}
              text={choice.text}
              index={idx}
              isSelected={false}
              isCorrect={false}
              showResult={false}
              disabled
              onClick={() => undefined}
            />
          ))}
        </div>
      </div>
      </>
    )
  }

  if (snap.phase === 'interim' && snap.question && snap.interimBoard) {
    const q = snap.question
    const countsByChoiceId: Record<string, number> = {}
    for (const c of q.choices) countsByChoiceId[c.id] = 0
    for (const row of snap.interimBoard.rows) {
      if (row.answerId && countsByChoiceId[row.answerId] != null) {
        countsByChoiceId[row.answerId] += 1
      }
    }
    return (
      <>
        <HostReactionBubbles bubbles={snap.reactionBubbles} />
        <div className="min-h-screen bg-[oklch(0.2_0.04_262)] px-4 md:px-10 py-6 md:py-10 space-y-6 md:space-y-10 relative">
        <div className="max-w-6xl mx-auto rounded-3xl bg-white text-zinc-900 shadow-2xl border border-black/10 overflow-hidden">
          <div className="px-6 md:px-10 pt-8 pb-4 md:pt-10">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-zinc-500 mb-3">
              Question {snap.currentQuestionIndex + 1} / {snap.questionCount}
            </p>
            <h2 className="text-2xl md:text-4xl font-black text-balance leading-tight">{q.prompt}</h2>
          </div>
          <div className="px-4 md:px-8 pb-2 border-t border-zinc-200">
            <HostAnswerDistribution choices={q.choices} countsByChoiceId={countsByChoiceId} />
          </div>
          <div className="px-4 md:px-8 pb-8 grid grid-cols-1 md:grid-cols-2 gap-3">
            {q.choices.map((choice, idx) => (
              <AnswerButton
                key={choice.id}
                id={choice.id}
                text={choice.text}
                index={idx}
                isSelected={!choice.isCorrect}
                isCorrect={!!choice.isCorrect}
                showResult
                slotColoredResults
                disabled
                onClick={() => undefined}
              />
            ))}
          </div>
        </div>
        <div className="max-w-6xl mx-auto overflow-hidden rounded-3xl border border-border/60 bg-card">
          <div className="grid grid-cols-12 bg-secondary/80 text-xs md:text-sm font-black uppercase tracking-wide text-muted-foreground px-4 py-3">
            <span className="col-span-4">Player</span>
            <span className="col-span-5">Answer</span>
            <span className="col-span-1 text-center">✓</span>
            <span className="col-span-2 text-right">Pts</span>
          </div>
          <div className="divide-y divide-border/50">
            {snap.interimBoard.rows.map((row) => (
              <div
                key={row.playerId}
                className={cn(
                  'grid grid-cols-12 px-4 py-4 items-center text-base md:text-lg',
                  row.isCorrect ? 'bg-answer-green/10' : 'bg-answer-red/5'
                )}
              >
                <span className="col-span-4 font-bold truncate">{row.name}</span>
                <span className="col-span-5 font-semibold text-balance">{row.answerText}</span>
                <span className="col-span-1 text-center text-2xl">
                  {row.isCorrect ? '✓' : '✕'}
                </span>
                <span className="col-span-2 text-right font-black tabular-nums">
                  +{row.points}
                </span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-center text-xl md:text-2xl font-black text-white drop-shadow-md animate-pulse">
          Host: advance when ready for the next question
        </p>
      </div>
      </>
    )
  }

  if (snap.phase === 'final') {
    const lb = snap.leaderboard
    const [gold, silver, bronze, ...rest] = lb
    return (
      <div className={cn(
        "min-h-screen transition-colors duration-1000 flex flex-col items-center px-4 py-10 md:py-14 gap-8 relative overflow-hidden",
        revealStep >= 3 
          ? "bg-[oklch(0.12_0.08_262)] bg-linear-to-b from-amber-500/20 via-sky-900 to-black" 
          : "bg-background bg-linear-to-b from-sky-400 via-sky-300 to-amber-100"
      )}>
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
            {snap.quizTitle}
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

  return null
}

function DisplayFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>
  )
}

export default function DisplayPage() {
  return (
    <Suspense fallback={<DisplayFallback />}>
      <DisplayInner />
    </Suspense>
  )
}

