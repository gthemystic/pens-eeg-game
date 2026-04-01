import { NextResponse } from 'next/server'
import { backendHostAction } from '@/lib/server/live-session-backend'
import type { HostAction } from '@/lib/live-session-logic'

export const dynamic = 'force-dynamic'

export async function POST(
  req: Request,
  ctx: { params: Promise<{ code: string }> }
) {
  const { code } = await ctx.params
  const hostSecret = req.headers.get('x-host-secret')
  if (!hostSecret) {
    return NextResponse.json({ error: 'Missing X-Host-Secret' }, { status: 401 })
  }

  let body: { action?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const action = body.action as HostAction
  const allowed: HostAction[] = ['start', 'next', 'back_to_lobby']
  if (!action || !allowed.includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const result = await backendHostAction(code, hostSecret, action)
  if (!result.ok) {
    const status = result.error === 'Forbidden' ? 403 : result.error === 'Session not found' ? 404 : 400
    return NextResponse.json({ error: result.error }, { status })
  }

  return NextResponse.json({ ok: true })
}
