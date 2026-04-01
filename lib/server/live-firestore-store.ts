/**
 * Firestore persistence for live rooms — works on Vercel (Admin SDK) + Firebase Hosting.
 */

import { getAdminFirestore } from '@/lib/firebase/admin'
import { getQuizById } from '@/lib/quiz-data'
import type { LiveSession, LiveSessionPublic } from '@/lib/live-session-logic'
import { normalizeSessionFields } from '@/lib/live-session-logic'
import { LIVE_PUBLIC_COLLECTION } from '@/lib/firebase/live-constants'
import { instantiateLiveSession, randomRoomCode } from '@/lib/server/live-quiz-session'

const PUBLIC = LIVE_PUBLIC_COLLECTION
const HOST = 'pens_live_host'

function stripForPublic(session: LiveSession): LiveSessionPublic {
  const { hostSecret: _, ...rest } = session
  return rest
}

export async function firestoreSaveSession(session: LiveSession): Promise<void> {
  const db = getAdminFirestore()
  const code = session.code.toUpperCase()
  const batch = db.batch()
  batch.set(db.collection(PUBLIC).doc(code), stripForPublic(session))
  batch.set(
    db.collection(HOST).doc(code),
    { hostSecret: session.hostSecret },
    { merge: true }
  )
  await batch.commit()
}

export async function firestoreLoadFullSession(code: string): Promise<LiveSession | undefined> {
  const db = getAdminFirestore()
  const c = code.toUpperCase()
  const [pub, hostSnap] = await Promise.all([
    db.collection(PUBLIC).doc(c).get(),
    db.collection(HOST).doc(c).get(),
  ])
  if (!pub.exists || !hostSnap.exists) return undefined
  const secret = hostSnap.data()?.hostSecret
  if (typeof secret !== 'string') return undefined
  const data = pub.data() as LiveSessionPublic
  if (!data?.quiz?.questions?.length) return undefined
  const session: LiveSession = { ...data, hostSecret: secret, code: c }
  normalizeSessionFields(session)
  return session
}

export async function firestoreTryCreateSession(session: LiveSession): Promise<boolean> {
  const db = getAdminFirestore()
  const code = session.code.toUpperCase()
  const pubRef = db.collection(PUBLIC).doc(code)
  try {
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(pubRef)
      if (snap.exists) throw new Error('collision')
      tx.set(pubRef, stripForPublic(session))
      tx.set(db.collection(HOST).doc(code), { hostSecret: session.hostSecret })
    })
    return true
  } catch {
    return false
  }
}

export async function firestoreCreateLiveSession(
  quizId: string
): Promise<{ session: LiveSession; code: string } | null> {
  const quiz = getQuizById(quizId)
  if (!quiz) return null
  for (let i = 0; i < 28; i++) {
    const code = randomRoomCode()
    const session = instantiateLiveSession(quiz, code)
    const ok = await firestoreTryCreateSession(session)
    if (ok) return { session, code }
  }
  return null
}
