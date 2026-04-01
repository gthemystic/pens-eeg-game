/**
 * In-memory live sessions (dev / single Node process).
 * For Vercel + Firebase, use live-session-backend + Firestore instead.
 */

import { randomBytes } from 'crypto'
import { DEFAULT_HERO_AVATAR_ID, isAllowedLiveReactionEmoji, isValidHeroAvatarId } from '@/lib/hero-avatars'
import { getQuizById, type Quiz } from '@/lib/quiz-data'
import type { LivePlayer, LiveSession } from '@/lib/live-session-logic'
import { maybeCloseQuestion, normalizeSessionFields } from '@/lib/live-session-logic'

export type {
  HostAction,
  LiveAnswerRow,
  LivePhase,
  LivePlayer,
  LiveReaction,
  LiveSession,
  LiveSessionPublic,
  RoundTiming,
  ScoreRow,
} from '@/lib/live-session-logic'
export {
  applyHostAction,
  computeScores,
  maybeCloseQuestion,
  normalizeSessionFields,
  publicSnapshot,
  scoreSubmission,
} from '@/lib/live-session-logic'

declare global {
  // eslint-disable-next-line no-var
  var __pensLiveSessions: Map<string, LiveSession> | undefined
}

const sessions: Map<string, LiveSession> =
  globalThis.__pensLiveSessions ?? new Map<string, LiveSession>()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__pensLiveSessions = sessions
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function randomRoomCode(length = 6): string {
  const bytes = randomBytes(length)
  let out = ''
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[bytes[i]! % CODE_ALPHABET.length]
  }
  return out
}

function newHostSecret(): string {
  return randomBytes(24).toString('base64url')
}

export function newLivePlayerId(): string {
  return randomBytes(12).toString('base64url')
}

export function newReactionEventId(): string {
  return randomBytes(10).toString('base64url')
}

export function instantiateLiveSession(quiz: Quiz, code: string): LiveSession {
  return {
    code,
    hostSecret: newHostSecret(),
    quiz,
    phase: 'lobby',
    currentQuestionIndex: 0,
    questionEndsAt: null,
    questionStartedAt: null,
    players: [],
    answers: [],
    roundTimings: [],
    reactions: [],
    createdAt: Date.now(),
  }
}

export function getAdminPassword(): string {
  return process.env.PENS_ADMIN_PASSWORD ?? 'pens-dev'
}

export function createLiveSession(quizId: string): { session: LiveSession; code: string } | null {
  const quiz = getQuizById(quizId)
  if (!quiz) return null
  let code = randomRoomCode()
  while (sessions.has(code)) {
    code = randomRoomCode()
  }
  const session = instantiateLiveSession(quiz, code)
  sessions.set(code, session)
  return { session, code }
}

export function getLiveSession(code: string): LiveSession | undefined {
  const session = sessions.get(code.toUpperCase())
  if (session) {
    normalizeSessionFields(session)
    maybeCloseQuestion(session)
  }
  return session
}

export function assertHost(session: LiveSession, hostSecret: string): boolean {
  return session.hostSecret === hostSecret
}

export type LiveJoinPlayerResult =
  | { ok: true; player: LivePlayer }
  | { ok: false; reason: 'not_found' | 'not_lobby' | 'bad_name' | 'avatar_taken' }

export function tryJoinPlayerOnSession(
  session: LiveSession,
  name: string,
  avatarId?: string
): LiveJoinPlayerResult {
  if (session.phase !== 'lobby') return { ok: false, reason: 'not_lobby' }
  const trimmed = name.trim().slice(0, 40)
  if (!trimmed) return { ok: false, reason: 'bad_name' }
  const aid =
    avatarId && isValidHeroAvatarId(avatarId) ? avatarId : DEFAULT_HERO_AVATAR_ID
  if (session.players.some((p) => p.avatarId === aid)) return { ok: false, reason: 'avatar_taken' }
  const player: LivePlayer = {
    id: newLivePlayerId(),
    name: trimmed,
    avatarId: aid,
    joinedAt: Date.now(),
  }
  session.players.push(player)
  return { ok: true, player }
}

export function joinPlayer(code: string, name: string, avatarId?: string): LiveJoinPlayerResult {
  const session = getLiveSession(code)
  if (!session) return { ok: false, reason: 'not_found' }
  return tryJoinPlayerOnSession(session, name, avatarId)
}

export function tryAppendReactionOnSession(
  session: LiveSession,
  playerId: string,
  emoji: string
): boolean {
  if (session.phase !== 'question' && session.phase !== 'interim') return false
  const player = session.players.find((p) => p.id === playerId)
  if (!player) return false
  if (!isAllowedLiveReactionEmoji(emoji)) return false
  session.reactions.push({
    id: newReactionEventId(),
    playerId,
    playerName: player.name,
    avatarId: player.avatarId || DEFAULT_HERO_AVATAR_ID,
    emoji,
    at: Date.now(),
  })
  session.reactions = session.reactions.slice(-120)
  return true
}

export function appendLiveReaction(code: string, playerId: string, emoji: string): boolean {
  const session = getLiveSession(code)
  if (!session) return false
  return tryAppendReactionOnSession(session, playerId, emoji)
}

export function trySubmitAnswerOnSession(
  session: LiveSession,
  playerId: string,
  answerId: string
): boolean {
  if (session.phase !== 'question') return false
  const player = session.players.find((p) => p.id === playerId)
  if (!player) return false
  const q = session.quiz.questions[session.currentQuestionIndex]
  if (!q || !q.answers.some((a) => a.id === answerId)) return false
  if (Date.now() > (session.questionEndsAt ?? 0)) return false
  session.answers.push({
    playerId,
    questionIndex: session.currentQuestionIndex,
    answerId,
    submittedAt: Date.now(),
  })
  return true
}

export function submitAnswer(code: string, playerId: string, answerId: string): boolean {
  const session = getLiveSession(code)
  if (!session) return false
  return trySubmitAnswerOnSession(session, playerId, answerId)
}
