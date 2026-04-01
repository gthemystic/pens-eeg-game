/**
 * Pure live-session rules + public snapshots (safe for client + server bundles).
 * No Map, no secrets IO — just brainy state transforms. 🧠
 */

import type { Question, Quiz } from '@/lib/quiz-data'
import { DEFAULT_HERO_AVATAR_ID, getHeroAvatar } from '@/lib/hero-avatars'

export type LivePhase = 'lobby' | 'question' | 'interim' | 'final'

export interface LivePlayer {
  id: string
  name: string
  avatarId: string
  joinedAt: number
}

export interface LiveReaction {
  id: string
  playerId: string
  playerName: string
  avatarId: string
  emoji: string
  at: number
}

export interface LiveAnswerRow {
  playerId: string
  questionIndex: number
  answerId: string | null
  submittedAt: number
}

export interface RoundTiming {
  questionIndex: number
  startedAt: number
  endsAt: number
}

export interface ScoreRow {
  playerId: string
  name: string
  avatarId: string
  heroEmoji: string
  heroImageUrl?: string
  totalPoints: number
  correctCount: number
}

export interface LiveSession {
  code: string
  hostSecret: string
  quiz: Quiz
  phase: LivePhase
  currentQuestionIndex: number
  questionEndsAt: number | null
  questionStartedAt: number | null
  players: LivePlayer[]
  answers: LiveAnswerRow[]
  roundTimings: RoundTiming[]
  /** Floating emoji bursts for the projector — trimmed server-side */
  reactions: LiveReaction[]
  createdAt: number
}

export type LiveSessionPublic = Omit<LiveSession, 'hostSecret'>

export function normalizeSessionFields(session: LiveSessionPublic): void {
  if (!Array.isArray(session.reactions)) session.reactions = []
  for (const p of session.players) {
    if (!p.avatarId) p.avatarId = DEFAULT_HERO_AVATAR_ID
  }
}

export function scoreSubmission(
  question: Question,
  answerId: string | null,
  timeRemainingSec: number
): { isCorrect: boolean; points: number } {
  if (!answerId) {
    return { isCorrect: false, points: 0 }
  }
  const answer = question.answers.find((a) => a.id === answerId)
  if (!answer) {
    return { isCorrect: false, points: 0 }
  }
  const isCorrect = answer.isCorrect
  if (!isCorrect) {
    return { isCorrect: false, points: 0 }
  }
  const cap = Math.max(0, Math.min(timeRemainingSec, question.timeLimit))
  const timeFraction = cap / question.timeLimit
  const points = Math.round(question.points * (0.5 + 0.5 * timeFraction))
  return { isCorrect: true, points }
}

function getRoundTiming(session: LiveSessionPublic, questionIndex: number): RoundTiming | undefined {
  return session.roundTimings.find((r) => r.questionIndex === questionIndex)
}

export function computeScores(session: LiveSessionPublic): ScoreRow[] {
  const byPlayer = new Map<string, ScoreRow>()
  for (const p of session.players) {
    const avatarId = p.avatarId || DEFAULT_HERO_AVATAR_ID
    const hero = getHeroAvatar(avatarId)
    byPlayer.set(p.id, {
      playerId: p.id,
      name: p.name,
      avatarId,
      heroEmoji: hero.emoji,
      ...(hero.imageUrl ? { heroImageUrl: hero.imageUrl } : {}),
      totalPoints: 0,
      correctCount: 0,
    })
  }
  const n = session.quiz.questions.length
  for (let qi = 0; qi < n; qi++) {
    const q = session.quiz.questions[qi]!
    let timing = getRoundTiming(session, qi)
    if (!timing && session.phase === 'question' && qi === session.currentQuestionIndex) {
      if (session.questionStartedAt && session.questionEndsAt) {
        timing = {
          questionIndex: qi,
          startedAt: session.questionStartedAt,
          endsAt: session.questionEndsAt,
        }
      }
    }
    if (!timing) continue

    for (const p of session.players) {
      const row = byPlayer.get(p.id)!
      const ans = session.answers
        .filter((a) => a.questionIndex === qi && a.playerId === p.id)
        .sort((a, b) => b.submittedAt - a.submittedAt)[0]
      if (!ans) continue
      const timeRemaining = Math.max(
        0,
        Math.min(q.timeLimit, Math.floor((timing.endsAt - ans.submittedAt) / 1000))
      )
      const { isCorrect, points } = scoreSubmission(q, ans.answerId, timeRemaining)
      row.totalPoints += points
      if (isCorrect) row.correctCount += 1
    }
  }
  return [...byPlayer.values()].sort((a, b) => b.totalPoints - a.totalPoints)
}

/** Points earned in fully sealed rounds only (for footer score during play). */
export function runningPointsForPlayer(session: LiveSessionPublic, playerId: string): number {
  let total = 0
  for (const timing of session.roundTimings) {
    const q = session.quiz.questions[timing.questionIndex]
    if (!q) continue
    const ans = session.answers
      .filter((a) => a.questionIndex === timing.questionIndex && a.playerId === playerId)
      .sort((a, b) => b.submittedAt - a.submittedAt)[0]
    if (!ans) continue
    const timeRemaining = Math.max(
      0,
      Math.min(q.timeLimit, Math.floor((timing.endsAt - ans.submittedAt) / 1000))
    )
    total += scoreSubmission(q, ans.answerId, timeRemaining).points
  }
  return total
}

function countAnsweredCurrentQuestion(session: LiveSessionPublic): number {
  if (session.phase !== 'question') return 0
  const qi = session.currentQuestionIndex
  const ids = new Set(
    session.answers.filter((a) => a.questionIndex === qi).map((a) => a.playerId)
  )
  return ids.size
}

function sealCurrentRound(session: LiveSessionPublic, effectiveEndsAt: number) {
  if (session.questionStartedAt == null) return
  const idx = session.currentQuestionIndex
  if (session.roundTimings.some((r) => r.questionIndex === idx)) return
  session.roundTimings.push({
    questionIndex: idx,
    startedAt: session.questionStartedAt,
    endsAt: effectiveEndsAt,
  })
}

export function maybeCloseQuestion(session: LiveSession | LiveSessionPublic): boolean {
  if (session.phase !== 'question' || !session.questionEndsAt) return false
  if (Date.now() < session.questionEndsAt) return false
  sealCurrentRound(session, session.questionEndsAt)
  session.phase = 'interim'
  session.questionEndsAt = null
  return true
}

export type HostAction = 'start' | 'next' | 'back_to_lobby'

export function applyHostAction(
  session: LiveSessionPublic,
  action: HostAction
): { ok: true } | { ok: false; error: string } {
  maybeCloseQuestion(session)

  if (action === 'back_to_lobby') {
    session.phase = 'lobby'
    session.currentQuestionIndex = 0
    session.questionEndsAt = null
    session.questionStartedAt = null
    session.answers = []
    session.roundTimings = []
    session.reactions = []
    return { ok: true }
  }

  if (action === 'start') {
    if (session.phase !== 'lobby') {
      return { ok: false, error: 'Game already started' }
    }
    if (session.players.length === 0) {
      return { ok: false, error: 'Wait for at least one player in the lobby' }
    }
    session.currentQuestionIndex = 0
    session.answers = []
    session.roundTimings = []
    session.reactions = []
    const q = session.quiz.questions[0]!
    const now = Date.now()
    session.phase = 'question'
    session.questionStartedAt = now
    session.questionEndsAt = now + q.timeLimit * 1000
    return { ok: true }
  }

  if (action === 'next') {
    if (session.phase === 'interim') {
      const next = session.currentQuestionIndex + 1
      if (next >= session.quiz.questions.length) {
        session.phase = 'final'
        session.questionEndsAt = null
        session.questionStartedAt = null
        return { ok: true }
      }
      const q = session.quiz.questions[next]!
      const now = Date.now()
      session.currentQuestionIndex = next
      session.phase = 'question'
      session.questionStartedAt = now
      session.questionEndsAt = now + q.timeLimit * 1000
      session.reactions = []
      return { ok: true }
    }

    if (session.phase === 'question') {
      const now = Date.now()
      const plannedEnd = session.questionEndsAt ?? now
      const effectiveEnd = Math.min(now, plannedEnd)
      sealCurrentRound(session, effectiveEnd)
      session.phase = 'interim'
      session.questionEndsAt = null
      return { ok: true }
    }

    return { ok: false, error: 'Nothing to advance' }
  }

  return { ok: false, error: 'Unknown action' }
}

export function questionAnswersForParticipants(question: Question) {
  return question.answers.map((a) => ({
    id: a.id,
    text: a.text,
  }))
}

function buildInterimRows(session: LiveSessionPublic, questionIndex: number) {
  const q = session.quiz.questions[questionIndex]!
  const timing = getRoundTiming(session, questionIndex)
  const rows: {
    playerId: string
    name: string
    answerId: string | null
    answerText: string | null
    isCorrect: boolean
    points: number
  }[] = []

  for (const p of session.players) {
    const ans = session.answers
      .filter((a) => a.questionIndex === questionIndex && a.playerId === p.id)
      .sort((a, b) => b.submittedAt - a.submittedAt)[0]

    const answerId = ans?.answerId ?? null
    const answer = answerId ? q.answers.find((a) => a.id === answerId) : null
    let timeRemaining = 0
    if (ans && timing) {
      timeRemaining = Math.max(
        0,
        Math.min(q.timeLimit, Math.floor((timing.endsAt - ans.submittedAt) / 1000))
      )
    }
    const { isCorrect, points } = scoreSubmission(q, answerId, timeRemaining)

    rows.push({
      playerId: p.id,
      name: p.name,
      answerId,
      answerText: answer?.text ?? (answerId ? '—' : 'No answer'),
      isCorrect,
      points,
    })
  }
  return rows
}

export function publicSnapshot(session: LiveSessionPublic, viewerPlayerId?: string) {
  const question =
    session.phase === 'question' || session.phase === 'interim'
      ? session.quiz.questions[session.currentQuestionIndex]
      : null

  const interimRows =
    session.phase === 'interim' || session.phase === 'final'
      ? buildInterimRows(session, session.currentQuestionIndex)
      : []

  const leaderboard = session.phase === 'final' ? computeScores(session) : []
  const answeredCount = countAnsweredCurrentQuestion(session)
  const totalPlayers = session.players.length
  const reactionBubbles = (session.reactions ?? []).slice(-48).map((r) => {
    const hero = getHeroAvatar(r.avatarId)
    return {
      id: r.id,
      emoji: r.emoji,
      playerName: r.playerName,
      heroEmoji: hero.emoji,
      ...(hero.imageUrl ? { heroImageUrl: hero.imageUrl } : {}),
    }
  })

  return {
    code: session.code,
    phase: session.phase,
    quizTitle: session.quiz.title,
    quizDescription: session.quiz.description,
    questionCount: session.quiz.questions.length,
    currentQuestionIndex: session.currentQuestionIndex,
    questionEndsAt: session.questionEndsAt,
    questionStartedAt: session.questionStartedAt,
    answeredCount,
    totalPlayers,
    reactionBubbles,
    players: session.players.map((p) => {
      const avatarId = p.avatarId || DEFAULT_HERO_AVATAR_ID
      const hero = getHeroAvatar(avatarId)
      return {
        id: p.id,
        name: p.name,
        avatarId,
        heroEmoji: hero.emoji,
        heroLabel: hero.label,
        ...(hero.imageUrl ? { heroImageUrl: hero.imageUrl } : {}),
      }
    }),
    question:
      session.phase === 'question' && question
        ? {
            id: question.id,
            prompt: question.question,
            points: question.points,
            timeLimit: question.timeLimit,
            answerCount: question.answers.length,
            choices: questionAnswersForParticipants(question),
          }
        : session.phase === 'interim' && question
          ? {
              id: question.id,
              prompt: question.question,
              points: question.points,
              timeLimit: question.timeLimit,
              answerCount: question.answers.length,
              choices: question.answers.map((a) => ({
                id: a.id,
                text: a.text,
                isCorrect: a.isCorrect,
              })),
            }
          : null,
    interimBoard: session.phase === 'interim' ? { rows: interimRows } : null,
    leaderboard,
    mySubmittedAnswerId:
      viewerPlayerId && session.phase === 'question'
        ? session.answers
            .filter(
              (a) =>
                a.playerId === viewerPlayerId &&
                a.questionIndex === session.currentQuestionIndex
            )
            .sort((a, b) => b.submittedAt - a.submittedAt)[0]?.answerId ?? null
        : null,
    viewerRunningPoints:
      viewerPlayerId != null && viewerPlayerId !== ''
        ? runningPointsForPlayer(session, viewerPlayerId)
        : undefined,
  }
}
