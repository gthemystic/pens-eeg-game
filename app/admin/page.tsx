'use client'

/**
 * 🎤 The Backstage Pass — admin password, quiz pick, and host controls
 * Your phone becomes the conductor's baton; the projector gets the limelight. 🎭
 */

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { eegQuizzes } from '@/lib/quiz-data'
import { cleanCode, createLiveRoom, hostAction, verifyAdminPassword } from '@/lib/live-client'
import { useLiveSession } from '@/hooks/use-live-session'
import { PensLogo } from '@/components/pens-logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  Loader2,
  MonitorPlay,
  Play,
  SkipForward,
  Sparkles,
  Users,
} from 'lucide-react'

const ADMIN_KEY = 'pens_admin_unlocked'
const ADMIN_PW_KEY = 'pens_admin_password'
const LATEST_ROOM_KEY = 'pens_latest_room'

function hostSecretStorageKey(code: string) {
  return `pens_host_${cleanCode(code)}`
}

export default function AdminPage() {
  const [adminPassword, setAdminPassword] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [quizId, setQuizId] = useState(eegQuizzes[0]?.id ?? '')
  const [roomCode, setRoomCode] = useState<string | null>(null)
  const [hostSecret, setHostSecret] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const snap = useLiveSession(roomCode, null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const u = localStorage.getItem(ADMIN_KEY) === '1'
    setUnlocked(u)
    if (u) {
      const saved = localStorage.getItem(ADMIN_PW_KEY)
      if (saved) setAdminPassword(saved)
      
      // Auto-resume last room if we don't have one active
      const lastRoom = localStorage.getItem(LATEST_ROOM_KEY)
      if (lastRoom && !roomCode) {
        const secret = localStorage.getItem(hostSecretStorageKey(lastRoom))
        if (secret) {
          setRoomCode(lastRoom)
          setHostSecret(secret)
          setMessage(`Auto-resumed controls for ${lastRoom}.`)
        }
      }
    }
  }, [roomCode])

  const persistUnlock = () => {
    localStorage.setItem(ADMIN_KEY, '1')
    setUnlocked(true)
  }

  const loadHostSecretForCode = (code: string) => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(hostSecretStorageKey(code))
  }

  const tryUnlock = async () => {
    setBusy(true)
    setMessage('')
    const ok = await verifyAdminPassword(adminPassword)
    setBusy(false)
    if (!ok) {
      setMessage('That password did not match — try again.')
      return
    }
    localStorage.setItem(ADMIN_PW_KEY, adminPassword)
    persistUnlock()
    setMessage('Portal unlocked — create a fresh room when you are ready.')
  }

  const handleCreateRoom = async () => {
    setBusy(true)
    setMessage('')
    const created = await createLiveRoom(adminPassword, quizId)
    setBusy(false)
    if (!created) {
      setMessage('Could not create room — check password and try again.')
      return
    }
    localStorage.setItem(hostSecretStorageKey(created.code), created.hostSecret)
    localStorage.setItem(LATEST_ROOM_KEY, created.code)
    setRoomCode(created.code)
    setHostSecret(created.hostSecret)
    setMessage(`Room ${created.code} is live — open the projector link.`)
  }

  const resumeRoom = () => {
    const raw = window.prompt('Enter 6-character room code')?.trim() ?? ''
    const code = cleanCode(raw)
    if (code.length < 4) {
      setMessage('That code looks too short.')
      return
    }
    const secret = loadHostSecretForCode(code)
    if (!secret) {
      setMessage('No host key stored for that room on this device.')
      return
    }
    localStorage.setItem(LATEST_ROOM_KEY, code)
    setRoomCode(code)
    setHostSecret(secret)
    setMessage(`Resumed controls for ${code}.`)
  }

  const runHost = async (action: 'start' | 'next' | 'back_to_lobby') => {
    if (!roomCode || !hostSecret) return
    setBusy(true)
    const result = await hostAction(roomCode, hostSecret, action)
    setBusy(false)
    if (!result.ok) {
      setMessage(result.error)
      return
    }
    setMessage('')
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  const projectorUrl =
    roomCode && origin ? `${origin}/display?code=${encodeURIComponent(roomCode)}` : ''
  const playerUrl =
    roomCode && origin ? `${origin}/?code=${encodeURIComponent(roomCode)}` : ''

  const cta = useMemo(() => {
    if (!snap) return { label: '…', action: null as null | 'start' | 'next' | 'back_to_lobby' }
    if (snap.phase === 'lobby') return { label: 'Start quiz', action: 'start' as const }
    if (snap.phase === 'question')
      return { label: 'Reveal results & pause', action: 'next' as const }
    if (snap.phase === 'interim') {
      const last = snap.currentQuestionIndex + 1 >= snap.questionCount
      return {
        label: last ? 'Show final leaderboard' : 'Next question',
        action: 'next' as const,
      }
    }
    return { label: 'Reset to lobby', action: 'back_to_lobby' as const }
  }, [snap])

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md space-y-4">
          <div className="flex items-center gap-3">
            <PensLogo size="sm" />
            <h1 className="font-black text-2xl">Admin / host login</h1>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This gate keeps random guests from spawning rooms. The password is shared with hosts only
            (default dev password: <span className="font-mono">pens-dev</span> — set{' '}
            <span className="font-mono">PENS_ADMIN_PASSWORD</span> in production).
          </p>
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="admin-pass">
              Admin password
            </label>
            <Input
              id="admin-pass"
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter admin password"
              className="h-11"
              onKeyDown={(e) => e.key === 'Enter' && tryUnlock()}
            />
          </div>
          {message && <p className="text-sm text-answer-yellow">{message}</p>}
          <Button className="w-full h-12 font-bold" onClick={tryUnlock} disabled={busy}>
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Unlock portal'}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            <Link href="/" className="underline-offset-4 hover:underline">
              Participant join
            </Link>
            {' · '}
            <Link href="/admin/one-pager" className="underline-offset-4 hover:underline font-semibold">
              Printable host one-pager + QR
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <PensLogo size="sm" />
          <span className="font-black text-sm uppercase tracking-wide text-muted-foreground">
            Host console
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/one-pager">One-pager</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={resumeRoom}>
            Resume room
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/playground">Test Ending</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-xl mx-auto w-full space-y-6">
        <div className="rounded-xl border border-answer-yellow/35 bg-answer-yellow/10 px-4 py-3 text-sm leading-relaxed text-foreground">
          <p className="font-bold text-answer-yellow">Host vs join page</p>
          <p className="text-muted-foreground mt-1">
            <strong className="text-foreground">Players</strong> use the home page and enter the room code you announce.
            <strong className="text-foreground"> You</strong> do not &quot;join&quot; that way — tap{' '}
            <strong className="text-foreground">Create new room</strong> below (or{' '}
            <strong className="text-foreground">Resume room</strong> only if this phone already created that room).
            After the room syncs, <strong className="text-foreground">Start quiz</strong> appears in{' '}
            <strong className="text-foreground">Live status</strong>.
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-primary" />
            Create or refresh room
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Quiz</label>
            <Select value={quizId} onValueChange={setQuizId}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eegQuizzes.map((q) => (
                  <SelectItem key={q.id} value={q.id}>
                    {q.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="w-full font-black"
            onClick={handleCreateRoom}
            disabled={busy}
          >
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create new room'}
          </Button>
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </div>

        {roomCode && (
          <div className="rounded-2xl border border-primary/40 bg-primary/5 p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Room code</p>
                <p className="text-4xl font-black tracking-[0.2em]">{roomCode}</p>
              </div>
              <Users className="w-10 h-10 text-primary" />
            </div>
            <div className="grid gap-2">
              <Button variant="secondary" className="justify-start" asChild>
                <a href={projectorUrl} target="_blank" rel="noreferrer">
                  <MonitorPlay className="w-4 h-4 mr-2" />
                  Open projector view
                </a>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <a href={playerUrl} target="_blank" rel="noreferrer">
                  <Play className="w-4 h-4 mr-2" />
                  Participant link
                </a>
              </Button>
            </div>
          </div>
        )}

        {roomCode && hostSecret && (
          <div className="rounded-2xl border border-border/60 bg-card/80 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-black">Live status</p>
              {snap ? (
                <span
                  className={cn(
                    'text-xs font-bold px-2 py-1 rounded-full shrink-0',
                    snap.phase === 'lobby' && 'bg-secondary',
                    snap.phase === 'question' && 'bg-answer-yellow/20 text-answer-yellow',
                    snap.phase === 'interim' && 'bg-primary/15 text-primary',
                    snap.phase === 'final' && 'bg-answer-green/15 text-answer-green'
                  )}
                >
                  {snap.phase}
                </span>
              ) : (
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-primary/15 text-primary flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  syncing…
                </span>
              )}
            </div>
            {!snap && (
              <p className="text-sm text-muted-foreground">
                Connecting to room <span className="font-mono font-bold">{roomCode}</span>… When this
                finishes you&apos;ll see <strong className="text-foreground">Start quiz</strong> while
                everyone is still in the lobby. If it never loads, refresh this page or create a new
                room.
              </p>
            )}
            {snap && (
              <>
                <p className="text-sm text-muted-foreground leading-snug">{snap.quizTitle}</p>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4" />
                  <span className="font-semibold">{snap.players.length}</span>
                  <span className="text-muted-foreground">players in lobby / game</span>
                </div>
              </>
            )}
            <Button
              className="w-full h-12 font-black"
              onClick={() => cta.action && runHost(cta.action)}
              disabled={busy || !cta.action}
            >
              {busy ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : !snap ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Waiting for room sync…
                </>
              ) : (
                <>
                  <SkipForward className="w-5 h-5 mr-2" />
                  {snap.phase === 'lobby' ? 'Start quiz' : `Primary action: ${cta.label}`}
                </>
              )}
            </Button>
            {snap && snap.phase === 'lobby' && (
              <p className="text-xs font-semibold text-answer-green">
                Lobby ready — tap <strong>Start quiz</strong> when players have joined (you can start with
                zero players for a dry run).
              </p>
            )}
            <p className="text-xs text-muted-foreground leading-relaxed">
              Flow: lobby → you start → projector shows each question with the shared timer → when time
              ends everyone sees the interim board → you tap next when ready. No peeking required from
              you unless you want to end a round early.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
