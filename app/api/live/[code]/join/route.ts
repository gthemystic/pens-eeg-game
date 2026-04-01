import { NextResponse } from 'next/server'
import { backendJoinPlayer } from '@/lib/server/live-session-backend'

export const dynamic = 'force-dynamic'

export async function POST(
  req: Request,
  ctx: { params: Promise<{ code: string }> }
) {
  const { code } = await ctx.params
  let body: { name?: string; avatarId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const name = typeof body.name === 'string' ? body.name : ''
  const avatarId = typeof body.avatarId === 'string' ? body.avatarId : undefined
  const joined = await backendJoinPlayer(code, name, avatarId)
  if (!joined.ok) {
    if (joined.reason === 'avatar_taken') {
      return NextResponse.json(
        { error: 'avatar_taken', message: 'That avatar is already taken in this room.' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'join_failed', reason: joined.reason },
      { status: 400 }
    )
  }

  return NextResponse.json({
    playerId: joined.player.id,
    name: joined.player.name,
    avatarId: joined.player.avatarId,
  })
}
