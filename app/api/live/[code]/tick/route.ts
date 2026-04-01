import { NextResponse } from 'next/server'
import { backendTickSession } from '@/lib/server/live-session-backend'

export const dynamic = 'force-dynamic'

/** When the client timer hits zero, nudge the server to seal the round (Firestore writes). */
export async function POST(
  _: Request,
  ctx: { params: Promise<{ code: string }> }
) {
  const { code } = await ctx.params
  const ok = await backendTickSession(code)
  if (!ok) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
