import { NextResponse } from 'next/server'
import { publicSnapshot } from '@/lib/live-session-logic'
import { backendGetSession } from '@/lib/server/live-session-backend'

export const dynamic = 'force-dynamic'

export async function GET(
  req: Request,
  ctx: { params: Promise<{ code: string }> }
) {
  const { code } = await ctx.params
  const url = new URL(req.url)
  const playerId = url.searchParams.get('playerId') ?? undefined

  const session = await backendGetSession(code)
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  return NextResponse.json(publicSnapshot(session, playerId))
}
