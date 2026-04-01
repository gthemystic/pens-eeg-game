/**
 * Unified live backend: Upstash (preferred on Vercel), else Firestore, else in-memory Map.
 */

import { isAdminFirestoreConfigured } from '@/lib/firebase/admin'
import { isFirestoreLiveIntent } from '@/lib/live-transport'
import {
  applyHostAction,
  maybeCloseQuestion,
  type HostAction,
  type LiveSession,
} from '@/lib/live-session-logic'
import * as firestore from '@/lib/server/live-firestore-store'
import { isAllowedLiveReactionEmoji } from '@/lib/hero-avatars'
import { getQuizById } from '@/lib/quiz-data'
import {
  appendLiveReaction,
  assertHost,
  createLiveSession,
  getLiveSession,
  instantiateLiveSession,
  joinPlayer,
  randomRoomCode,
  submitAnswer,
  tryAppendReactionOnSession,
  tryJoinPlayerOnSession,
  trySubmitAnswerOnSession,
  type LiveJoinPlayerResult,
} from '@/lib/server/live-quiz-session'
import {
  isUpstashLiveConfigured,
  upstashLoadFullSession,
  upstashSaveSession,
  upstashTryCreateSession,
  upstashWithLock,
} from '@/lib/server/live-upstash-store'

export type { LiveJoinPlayerResult }

let warnedNoRemoteStore = false

function persistence(): 'upstash' | 'firestore' | 'memory' {
  if (isUpstashLiveConfigured()) return 'upstash'
  const intent = isFirestoreLiveIntent()
  const creds = isAdminFirestoreConfigured()
  if (intent && !creds && !warnedNoRemoteStore) {
    warnedNoRemoteStore = true
    console.warn(
      '[pens-live] NEXT_PUBLIC_LIVE_TRANSPORT=firestore but credentials missing — using in-memory sessions (unsafe on serverless). Add Upstash or Firebase admin credentials.'
    )
  }
  if (intent && creds) return 'firestore'
  return 'memory'
}

export async function backendGetSession(code: string): Promise<LiveSession | undefined> {
  const p = persistence()
  if (p === 'upstash') {
    const s = await upstashLoadFullSession(code)
    if (!s) return undefined
    // DO NOT save the session back immediately if we mutate it for phase closing, 
    // since this endpoint is called concurrently by all participants!
    // Instead, just return the computed state or let tickLiveSession save it durably.
    maybeCloseQuestion(s)
    return s
  }
  if (p === 'firestore') {
    const s = await firestore.firestoreLoadFullSession(code)
    if (!s) return undefined
    if (maybeCloseQuestion(s)) await firestore.firestoreSaveSession(s)
    return s
  }
  return getLiveSession(code)
}

export async function backendCreateSession(quizId: string) {
  const quiz = getQuizById(quizId)
  if (!quiz) return null
  const p = persistence()
  if (p === 'upstash') {
    for (let i = 0; i < 28; i++) {
      const code = randomRoomCode()
      const session = instantiateLiveSession(quiz, code)
      const ok = await upstashTryCreateSession(session)
      if (ok) return { session, code }
    }
    return null
  }
  if (p === 'firestore') return firestore.firestoreCreateLiveSession(quizId)
  return createLiveSession(quizId)
}

export async function backendJoinPlayer(
  code: string,
  name: string,
  avatarId?: string
): Promise<LiveJoinPlayerResult> {
  const p = persistence()
  if (p === 'memory') return joinPlayer(code, name, avatarId)

  if (p === 'firestore') {
    const s = await backendGetSession(code)
    if (!s) return { ok: false, reason: 'not_found' }
    const r = tryJoinPlayerOnSession(s, name, avatarId)
    if (!r.ok) return r
    await firestore.firestoreSaveSession(s)
    return r
  }

  return upstashWithLock(code, async () => {
    const s = await upstashLoadFullSession(code)
    if (!s) return { ok: false, reason: 'not_found' }
    if (maybeCloseQuestion(s)) await upstashSaveSession(s)
    const r = tryJoinPlayerOnSession(s, name, avatarId)
    if (!r.ok) return r
    await upstashSaveSession(s)
    return r
  })
}

export async function backendSubmitAnswer(
  code: string,
  playerId: string,
  answerId: string
): Promise<boolean> {
  const p = persistence()
  if (p === 'memory') return submitAnswer(code, playerId, answerId)

  if (p === 'firestore') {
    const s = await backendGetSession(code)
    if (!s) return false
    const ok = trySubmitAnswerOnSession(s, playerId, answerId)
    if (ok) await firestore.firestoreSaveSession(s)
    return ok
  }

  return upstashWithLock(code, async () => {
    const s = await upstashLoadFullSession(code)
    if (!s) return false
    if (maybeCloseQuestion(s)) await upstashSaveSession(s)
    const ok = trySubmitAnswerOnSession(s, playerId, answerId)
    if (ok) await upstashSaveSession(s)
    return ok
  })
}

export async function backendAppendReaction(
  code: string,
  playerId: string,
  emoji: string
): Promise<boolean> {
  const p = persistence()
  if (p === 'memory') return appendLiveReaction(code, playerId, emoji)

  if (p === 'firestore') {
    const s = await backendGetSession(code)
    if (!s) return false
    if (!isAllowedLiveReactionEmoji(emoji)) return false
    if (!tryAppendReactionOnSession(s, playerId, emoji)) return false
    await firestore.firestoreSaveSession(s)
    return true
  }

  return upstashWithLock(code, async () => {
    const s = await upstashLoadFullSession(code)
    if (!s) return false
    if (maybeCloseQuestion(s)) await upstashSaveSession(s)
    if (!isAllowedLiveReactionEmoji(emoji)) return false
    if (!tryAppendReactionOnSession(s, playerId, emoji)) return false
    await upstashSaveSession(s)
    return true
  })
}

export async function backendHostAction(
  code: string,
  hostSecret: string,
  action: HostAction
): Promise<{ ok: true } | { ok: false; error: string }> {
  const p = persistence()
  if (p === 'upstash') {
    return upstashWithLock(code, async () => {
      const s = await upstashLoadFullSession(code)
      if (!s) return { ok: false, error: 'Session not found' }
      if (!assertHost(s, hostSecret)) return { ok: false, error: 'Forbidden' }
      const result = applyHostAction(s, action)
      if (!result.ok) return result
      await upstashSaveSession(s)
      return { ok: true }
    })
  }

  const s = await backendGetSession(code)
  if (!s) return { ok: false, error: 'Session not found' }
  if (!assertHost(s, hostSecret)) return { ok: false, error: 'Forbidden' }
  const result = applyHostAction(s, action)
  if (!result.ok) return result
  if (p === 'firestore') await firestore.firestoreSaveSession(s)
  return { ok: true }
}

/** Idempotent: close an expired question round (remote store + memory). */
export async function backendTickSession(code: string): Promise<boolean> {
  const p = persistence()
  if (p === 'memory') {
    const s = getLiveSession(code)
    return s !== undefined
  }
  if (p === 'firestore') {
    const s = await firestore.firestoreLoadFullSession(code)
    if (!s) return false
    if (maybeCloseQuestion(s)) {
      await firestore.firestoreSaveSession(s)
      return true
    }
    return true
  }
  return upstashWithLock(code, async () => {
    const s = await upstashLoadFullSession(code)
    if (!s) return false
    if (maybeCloseQuestion(s)) {
      await upstashSaveSession(s)
      return true
    }
    return true
  })
}
