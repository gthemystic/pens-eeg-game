'use client'

/**
 * 🎮 The Participant Portal — join code + name, then ride the host's tempo
 * The projector gets the spotlight; your phone just whispers answers. 🧠✨
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  cleanCode,
  joinLiveSession,
  sendLiveReaction,
  submitLiveAnswer,
  tickLiveSession,
} from '@/lib/live-client'
import {
  DEFAULT_HERO_AVATAR_ID,
  LIVE_REACTION_EMOJIS,
  SUPERHERO_AVATARS,
} from '@/lib/hero-avatars'
import { useLiveSession } from '@/hooks/use-live-session'
import { AnswerButton } from '@/components/answer-button'
import { HeroAvatarFace } from '@/components/hero-avatar-face'
import { QuizTimer, ProgressBar } from '@/components/quiz-timer'
import { PensLogo, PensLogoFull } from '@/components/pens-logo'
import { BrainwaveAnimation } from '@/components/brainwave-animation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Brain, Loader2, Trophy, Users } from 'lucide-react'

export function JoinLiveScreen() {
  const searchParams = useSearchParams()
  const initialCode = searchParams.get('code') ?? ''

  const [codeInput, setCodeInput] = useState(initialCode)
  const [nameInput, setNameInput] = useState('')
  const [pickAvatarId, setPickAvatarId] = useState(DEFAULT_HERO_AVATAR_ID)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [joinedCode, setJoinedCode] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [localPick, setLocalPick] = useState<string | null>(null)
  const [nowTick, setNowTick] = useState(() => Date.now())
  const tickSentRef = useRef('')

  const code = joinedCode ?? cleanCode(codeInput)
  const snap = useLiveSession(joinedCode, playerId)

  useEffect(() => {
    if (!snap || snap.phase !== 'question') {
      setLocalPick(null)
      return
    }
    if (snap.mySubmittedAnswerId) {
      setLocalPick(snap.mySubmittedAnswerId)
    }
  }, [snap?.phase, snap?.currentQuestionIndex, snap?.mySubmittedAnswerId])

  useEffect(() => {
    if (!snap || snap.phase !== 'question' || !snap.questionEndsAt) return
    const id = window.setInterval(() => setNowTick(Date.now()), 250)
    return () => window.clearInterval(id)
  }, [snap?.phase, snap?.questionEndsAt])

  const timeRemaining = useMemo(() => {
    if (!snap?.questionEndsAt || !snap.question) return snap?.question?.timeLimit ?? 0
    const msLeft = snap.questionEndsAt - nowTick
    return Math.max(0, Math.ceil(msLeft / 1000))
  }, [snap?.questionEndsAt, snap?.question, nowTick])

  useEffect(() => {
    if (!joinedCode || !snap || snap.phase !== 'question' || !snap.questionEndsAt) return
    if (timeRemaining > 0) return
    const key = `${snap.currentQuestionIndex}-${snap.questionEndsAt}`
    if (tickSentRef.current === key) return
    tickSentRef.current = key
    tickLiveSession(joinedCode)
  }, [joinedCode, snap, timeRemaining])

  const handleJoin = async () => {
    setError('')
    const c = cleanCode(codeInput)
    if (c.length < 4) {
      setError('Enter a valid room code')
      return
    }
    const name = nameInput.trim()
    if (!name) {
      setError('Enter your name so the host can see you in the lobby')
      return
    }
    setBusy(true)
    const res = await joinLiveSession(c, name, pickAvatarId)
    setBusy(false)
    if (!res.ok) {
      setError(
        res.error === 'avatar_taken'
          ? 'That hero was already picked — choose another portrait.'
          : 'Could not join — check the code or wait for a new lobby'
      )
      return
    }
    setPlayerId(res.playerId)
    setJoinedCode(c)
    setCodeInput(c)
  }

  const handlePick = async (answerId: string) => {
    if (!playerId || !joinedCode || !snap?.question) return
    if (localPick || snap.mySubmittedAnswerId) return
    setLocalPick(answerId)
    const ok = await submitLiveAnswer(joinedCode, playerId, answerId)
    if (!ok) {
      setLocalPick(null)
      setError('Could not lock in answer — timer may have ended')
      window.setTimeout(() => setError(''), 4000)
    }
  }

  if (!joinedCode) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="relative overflow-hidden bg-[oklch(0.12_0.08_262)] border-b border-border/50">
          <BrainwaveAnimation className="absolute bottom-0 left-0 right-0 opacity-40" />
          <div className="relative z-10 px-4 py-10 flex flex-col items-center gap-4 text-center">
            <PensLogoFull />
            <h1 className="font-black text-2xl text-foreground leading-tight">
              <span className="block">Join live</span>
              <span className="block text-primary">EEG quiz</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
              Enter the room code from the projector and your name.
              <br />
              The host starts when everyone is ready.
            </p>
          </div>
        </header>

        <main className="flex-1 px-4 py-8 max-w-md mx-auto w-full space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="room-code">
              Room code
            </label>
            <Input
              id="room-code"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="e.g. ABC123"
              className="h-12 text-lg font-bold tracking-widest text-center uppercase"
              maxLength={8}
              autoCapitalize="characters"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="player-name">
              Your name
            </label>
            <Input
              id="player-name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="How you want to appear"
              className="h-12 text-base"
              maxLength={40}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold block">Superhero avatar</span>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
              {SUPERHERO_AVATARS.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setPickAvatarId(h.id)}
                  title={h.label}
                  className={cn(
                    'rounded-xl border-2 p-2 flex items-center justify-center transition-colors min-h-[52px]',
                    pickAvatarId === h.id
                      ? 'border-primary bg-primary/15 ring-2 ring-primary/40'
                      : 'border-border/60 bg-card hover:bg-secondary/80'
                  )}
                >
                  <HeroAvatarFace
                    avatarId={h.id}
                    frameClassName="h-10 w-10"
                    imgClassName="h-full w-full"
                    emojiClassName="text-3xl"
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Pick your hero — the projector shows it next to your name.
            </p>
          </div>
          {error && <p className="text-sm text-answer-red">{error}</p>}
          <Button
            className="w-full h-12 font-black text-base"
            onClick={handleJoin}
            disabled={busy}
          >
            {busy ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Joining…
              </>
            ) : (
              'Enter lobby'
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground pt-4">
            <Link href="/admin" className="font-bold text-primary underline-offset-4 hover:underline">
              Host login
            </Link>
          </p>
        </main>
      </div>
    )
  }

  if (!snap) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Syncing with room {code}…</p>
      </div>
    )
  }

  if (snap.phase === 'lobby') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <PensLogo size="sm" />
          <span className="text-xs font-mono font-bold text-muted-foreground">{code}</span>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-16 gap-6">
          <div className="text-center space-y-2">
            <Users className="w-12 h-12 mx-auto text-primary" />
            <h2 className="font-black text-2xl">You&apos;re in the lobby</h2>
            <p className="text-muted-foreground text-sm max-w-sm">
              {snap.quizTitle}. Hang tight — the host will start the countdown on the projector.
            </p>
          </div>
          <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-4">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Who&apos;s here ({snap.players.length})
            </p>
            <ul className="space-y-1 max-h-48 overflow-y-auto">
              {snap.players.map((p) => (
                <li
                  key={p.id}
                  className={cn(
                    'text-sm font-semibold py-2 px-2 rounded-lg flex items-center gap-2',
                    p.id === playerId ? 'bg-primary/15 text-foreground' : 'bg-secondary/50'
                  )}
                >
                  <HeroAvatarFace
                    avatarId={p.avatarId}
                    frameClassName="h-8 w-8"
                    imgClassName="h-full w-full"
                    emojiClassName="text-xl"
                  />
                  <span className="truncate">
                    {p.name}
                    {p.id === playerId ? ' (you)' : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  if (snap.phase === 'question' && snap.question) {
    const q = snap.question
    const locked = !!(localPick || snap.mySubmittedAnswerId)
    const pick = localPick ?? snap.mySubmittedAnswerId
    const me = playerId ? snap.players.find((p) => p.id === playerId) : undefined

    return (
      <div className="min-h-screen bg-background flex flex-col pb-28">
        <header className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card/40">
          <PensLogo size="sm" />
          <span className="text-xs text-muted-foreground font-semibold truncate max-w-[40%]">
            {snap.quizTitle}
          </span>
        </header>
        <div className="px-4 pt-3">
          <ProgressBar current={snap.currentQuestionIndex} total={snap.questionCount} />
        </div>
        <div className="flex-1 flex flex-col px-4 py-4 gap-4">
          <div className="relative bg-[oklch(0.22_0.09_262)] rounded-2xl overflow-hidden border border-border/50">
            <BrainwaveAnimation className="absolute bottom-0 left-0 right-0 opacity-25" />
            <div className="relative z-10 p-5 flex flex-col items-center gap-4">
              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Q{snap.currentQuestionIndex + 1} of {snap.questionCount}
                </span>
                <QuizTimer timeRemaining={timeRemaining} totalTime={q.timeLimit} />
              </div>
              <p className="text-foreground font-black text-lg text-center text-balance leading-snug">
                {q.prompt}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {q.choices.map((choice, idx) => (
              <AnswerButton
                key={choice.id}
                id={choice.id}
                text={choice.text}
                index={idx}
                isSelected={pick === choice.id}
                isCorrect={false}
                showResult={false}
                disabled={locked}
                onClick={() => handlePick(choice.id)}
              />
            ))}
          </div>

          {locked && (
            <p className="text-center text-sm text-muted-foreground">
              Answer locked — look up at the projector between rounds.
            </p>
          )}
          {playerId && (
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {LIVE_REACTION_EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  className="min-h-[52px] min-w-[52px] rounded-xl bg-secondary border border-border/60 text-3xl active:scale-95 transition-transform"
                  onClick={() => joinedCode && sendLiveReaction(joinedCode, playerId, em)}
                  aria-label={`Send reaction ${em}`}
                >
                  {em}
                </button>
              ))}
            </div>
          )}
          {error && <p className="text-center text-sm text-answer-red">{error}</p>}
        </div>
        {me && playerId && (
          <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-border/60 bg-[oklch(0.12_0.08_262)] text-white">
            <span className="shrink-0 rounded-full bg-white/10 w-14 h-14 flex items-center justify-center border border-white/15 overflow-hidden">
              <HeroAvatarFace
                avatarId={me.avatarId}
                frameClassName="h-14 w-14"
                imgClassName="h-full w-full"
                emojiClassName="text-4xl"
              />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate">{me.name}</p>
              <p className="text-xs text-white/70 tabular-nums">
                {snap.viewerRunningPoints ?? 0} pts · room {code}
              </p>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (snap.phase === 'interim') {
    const row = snap.interimBoard?.rows.find((r) => r.playerId === playerId)
    const me = playerId ? snap.players.find((p) => p.id === playerId) : undefined
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center gap-4 pb-28">
        <Brain className="w-14 h-14 text-primary mx-auto" />
        <h2 className="font-black text-2xl">Round recap is on the projector</h2>
        <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
          The host will review everyone&apos;s picks on the big screen, then advance when the room is ready.
        </p>
        {row && (
          <div className="rounded-2xl border border-border/60 bg-card px-5 py-4 max-w-sm w-full text-left">
            <p className="text-xs font-bold text-muted-foreground uppercase">Your pick</p>
            <p className="font-semibold text-foreground mt-1">{row.answerText}</p>
            <p
              className={cn(
                'text-sm font-black mt-2',
                row.isCorrect ? 'text-answer-green' : 'text-answer-red'
              )}
            >
              {row.isCorrect ? `+${row.points} pts` : 'No points this round'}
            </p>
          </div>
        )}
        {playerId && (
          <div className="flex flex-wrap justify-center gap-2 max-w-sm">
            {LIVE_REACTION_EMOJIS.map((em) => (
              <button
                key={em}
                type="button"
                className="min-h-[52px] min-w-[52px] rounded-xl bg-secondary border border-border/60 text-3xl active:scale-95 transition-transform"
                onClick={() => joinedCode && sendLiveReaction(joinedCode, playerId, em)}
                aria-label={`Send reaction ${em}`}
              >
                {em}
              </button>
            ))}
          </div>
        )}
        {me && playerId && (
          <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-border/60 bg-[oklch(0.12_0.08_262)] text-white">
            <span className="shrink-0 rounded-full bg-white/10 w-14 h-14 flex items-center justify-center border border-white/15 overflow-hidden">
              <HeroAvatarFace
                avatarId={me.avatarId}
                frameClassName="h-14 w-14"
                imgClassName="h-full w-full"
                emojiClassName="text-4xl"
              />
            </span>
            <div className="flex-1 min-w-0 text-left">
              <p className="font-bold truncate">{me.name}</p>
              <p className="text-xs text-white/70 tabular-nums">
                {snap.viewerRunningPoints ?? 0} pts
              </p>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (snap.phase === 'final') {
    const rank =
      snap.leaderboard.findIndex((e) => e.playerId === playerId) + 1
    const me = snap.leaderboard.find((e) => e.playerId === playerId)
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <PensLogo size="sm" />
          <Trophy className="w-6 h-6 text-answer-yellow" />
        </header>
        <div className="flex-1 flex flex-col items-center px-4 py-10 gap-6 max-w-lg mx-auto w-full">
          <h1 className="font-black text-3xl text-center">Final standings</h1>
          <p className="text-muted-foreground text-sm text-center">
            The host can walk through this on the projector — here&apos;s your position.
          </p>
          {me && (
            <div className="w-full rounded-2xl border border-answer-yellow/40 bg-answer-yellow/10 p-5 text-center">
              <p className="text-xs font-bold text-muted-foreground uppercase">You</p>
              <p className="text-2xl font-black mt-1">
                #{rank} · {me.totalPoints.toLocaleString()} pts
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {me.correctCount} / {snap.questionCount} correct
              </p>
            </div>
          )}
          <ol className="w-full space-y-2">
            {snap.leaderboard.map((e, i) => (
              <li
                key={e.playerId}
                className={cn(
                  'flex items-center justify-between rounded-xl border px-4 py-3',
                  e.playerId === playerId
                    ? 'border-primary bg-primary/10'
                    : 'border-border/60 bg-card'
                )}
              >
                <span className="font-bold flex items-center gap-2 min-w-0">
                  <HeroAvatarFace
                    avatarId={e.avatarId}
                    frameClassName="h-8 w-8"
                    imgClassName="h-full w-full"
                    emojiClassName="text-xl"
                  />
                  <span className="truncate">
                    {i + 1}. {e.name}
                  </span>
                </span>
                <span className="tabular-nums font-black">{e.totalPoints.toLocaleString()}</span>
              </li>
            ))}
          </ol>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">Play another room</Link>
          </Button>
        </div>
      </div>
    )
  }

  return null
}
