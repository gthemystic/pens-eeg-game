import { NextResponse } from 'next/server'
import { backendAppendReaction } from '@/lib/server/live-session-backend'

export const dynamic = 'force-dynamic'

export async function POST(
  req: Request,
  ctx: { params: Promise<{ code: string }> }
) {
  const { code } = await ctx.params
  let body: { playerId?: string; emoji?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.playerId || typeof body.emoji !== 'string') {
    return NextResponse.json({ error: 'playerId and emoji required' }, { status: 400 })
  }

  const ok = await backendAppendReaction(code, body.playerId, body.emoji)
  if (!ok) {
    return NextResponse.json(
      { error: 'Reaction not accepted (wrong phase, unknown player, or invalid emoji)' },
      { status: 400 }
    )
  }

  return NextResponse.json({ ok: true })
}
