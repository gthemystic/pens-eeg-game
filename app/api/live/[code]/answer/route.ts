import { NextResponse } from 'next/server'
import { backendSubmitAnswer } from '@/lib/server/live-session-backend'

export const dynamic = 'force-dynamic'

export async function POST(
  req: Request,
  ctx: { params: Promise<{ code: string }> }
) {
  const { code } = await ctx.params
  let body: { playerId?: string; answerId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.playerId || !body.answerId) {
    return NextResponse.json({ error: 'playerId and answerId required' }, { status: 400 })
  }

  const ok = await backendSubmitAnswer(code, body.playerId, body.answerId)
  if (!ok) {
    return NextResponse.json(
      { error: 'Answer not accepted (wrong phase, unknown player, or time expired)' },
      { status: 400 }
    )
  }

  return NextResponse.json({ ok: true })
}
