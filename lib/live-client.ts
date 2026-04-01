/**
 * 🌐 Live session client helpers — fetch/poll the orchestrator without drama
 */

export type LivePhase = 'lobby' | 'question' | 'interim' | 'final'

export interface ReactionBubble {
  id: string
  emoji: string
  playerName: string
  heroEmoji: string
  heroImageUrl?: string
}

export interface LivePublicSnapshot {
  code: string
  phase: LivePhase
  quizTitle: string
  quizDescription: string
  questionCount: number
  currentQuestionIndex: number
  questionEndsAt: number | null
  questionStartedAt: number | null
  /** Players who submitted for the current question (question phase only) */
  answeredCount: number
  totalPlayers: number
  reactionBubbles: ReactionBubble[]
  players: {
    id: string
    name: string
    avatarId: string
    heroEmoji: string
    heroLabel: string
    heroImageUrl?: string
  }[]
  question: {
    id: string
    prompt: string
    points: number
    timeLimit: number
    answerCount: number
    choices: { id: string; text: string; isCorrect?: boolean }[]
  } | null
  interimBoard: { rows: InterimRow[] } | null
  leaderboard: LeaderboardEntry[]
  mySubmittedAnswerId: string | null
  /** Sealed-round points only — shown in the participant footer */
  viewerRunningPoints?: number
}

export interface InterimRow {
  playerId: string
  name: string
  answerId: string | null
  answerText: string | null
  isCorrect: boolean
  points: number
}

export interface LeaderboardEntry {
  playerId: string
  name: string
  avatarId: string
  heroEmoji: string
  heroImageUrl?: string
  totalPoints: number
  correctCount: number
}

export async function fetchLiveSession(
  code: string,
  playerId?: string | null
): Promise<LivePublicSnapshot | null> {
  const c = cleanCode(code)
  const q = playerId ? `?playerId=${encodeURIComponent(playerId)}` : ''
  const res = await fetch(`/api/live/${encodeURIComponent(c)}${q}`, {
    cache: 'no-store',
  })
  if (res.status === 404) return null
  if (!res.ok) return null
  return (await res.json()) as LivePublicSnapshot
}

export function cleanCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export type JoinLiveSessionResult =
  | { ok: true; playerId: string; name: string; avatarId: string }
  | { ok: false; error: 'avatar_taken' | 'join_failed' }

export async function joinLiveSession(
  code: string,
  name: string,
  avatarId?: string
): Promise<JoinLiveSessionResult> {
  const res = await fetch(`/api/live/${encodeURIComponent(cleanCode(code))}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, avatarId }),
  })
  if (res.status === 409) {
    try {
      const j = (await res.json()) as { error?: string }
      if (j?.error === 'avatar_taken') return { ok: false, error: 'avatar_taken' }
    } catch {
      /* fall through */
    }
    return { ok: false, error: 'join_failed' }
  }
  if (!res.ok) return { ok: false, error: 'join_failed' }
  const data = (await res.json()) as { playerId: string; name: string; avatarId: string }
  return { ok: true, playerId: data.playerId, name: data.name, avatarId: data.avatarId }
}

export async function submitLiveAnswer(
  code: string,
  playerId: string,
  answerId: string
): Promise<boolean> {
  const res = await fetch(`/api/live/${encodeURIComponent(cleanCode(code))}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId, answerId }),
  })
  return res.ok
}

export async function verifyAdminPassword(adminPassword: string): Promise<boolean> {
  const res = await fetch('/api/live/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminPassword }),
  })
  return res.ok
}

export async function createLiveRoom(
  adminPassword: string,
  quizId: string
): Promise<{ code: string; hostSecret: string; quizTitle: string } | null> {
  const res = await fetch('/api/live/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminPassword, quizId }),
  })
  if (!res.ok) return null
  return (await res.json()) as { code: string; hostSecret: string; quizTitle: string }
}

export async function hostAction(
  code: string,
  hostSecret: string,
  action: 'start' | 'next' | 'back_to_lobby'
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch(`/api/live/${encodeURIComponent(cleanCode(code))}/host`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Host-Secret': hostSecret,
    },
    body: JSON.stringify({ action }),
  })
  if (!res.ok) {
    let msg = 'Request failed'
    try {
      const j = await res.json()
      if (j?.error) msg = j.error
    } catch {
      /* stay generic */
    }
    return { ok: false, error: msg }
  }
  return { ok: true }
}

/** Nudge the server when the local timer hits zero so Firestore advances to interim. */
export async function tickLiveSession(code: string): Promise<boolean> {
  const res = await fetch(`/api/live/${encodeURIComponent(cleanCode(code))}/tick`, {
    method: 'POST',
  })
  return res.ok
}

export async function sendLiveReaction(
  code: string,
  playerId: string,
  emoji: string
): Promise<boolean> {
  const res = await fetch(`/api/live/${encodeURIComponent(cleanCode(code))}/react`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId, emoji }),
  })
  return res.ok
}
