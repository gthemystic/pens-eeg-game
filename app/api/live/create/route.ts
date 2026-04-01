import { NextResponse } from 'next/server'
import { getAdminPassword } from '@/lib/server/live-quiz-session'
import { backendCreateSession } from '@/lib/server/live-session-backend'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  let body: { adminPassword?: string; quizId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.adminPassword || body.adminPassword !== getAdminPassword()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!body.quizId || typeof body.quizId !== 'string') {
    return NextResponse.json({ error: 'quizId required' }, { status: 400 })
  }

  const created = await backendCreateSession(body.quizId)
  if (!created) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
  }

  const { session, code } = created
  return NextResponse.json({
    code,
    hostSecret: session.hostSecret,
    quizTitle: session.quiz.title,
  })
}
