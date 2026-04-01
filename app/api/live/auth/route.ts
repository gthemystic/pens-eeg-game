import { NextResponse } from 'next/server'
import { getAdminPassword } from '@/lib/server/live-quiz-session'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  let body: { adminPassword?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.adminPassword || body.adminPassword !== getAdminPassword()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ ok: true })
}
