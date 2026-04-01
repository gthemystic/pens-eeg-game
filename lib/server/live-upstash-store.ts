/**
 * 🗄️ Upstash Redis persistence for live rooms — survives multi-instance Vercel without Firebase drama.
 * One JSON blob per code + short-lived locks so concurrent taps don’t ghost-write each other. 🔐✨
 */

import { Redis } from '@upstash/redis'
import type { LiveSession } from '@/lib/live-session-logic'
import { normalizeSessionFields } from '@/lib/live-session-logic'

const ROOM_TTL_SEC = 60 * 60 * 24 * 7
const LOCK_EX_SEC = 12

let redisSingleton: Redis | null | undefined

function getRedis(): Redis | null {
  if (redisSingleton !== undefined) return redisSingleton
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  if (!url || !token) {
    redisSingleton = null
    return null
  }
  redisSingleton = new Redis({ url, token })
  return redisSingleton
}

export function isUpstashLiveConfigured(): boolean {
  return getRedis() !== null
}

function sessionKey(code: string) {
  return `pens:live:session:${code.toUpperCase()}`
}

function lockKey(code: string) {
  return `pens:live:lock:${code.toUpperCase()}`
}

/**
 * 🎪 The Velvet Rope — one writer at a time per room; everyone else waits in the queue politely.
 */
export async function upstashWithLock<T>(code: string, fn: () => Promise<T>): Promise<T> {
  const r = getRedis()!
  const lk = lockKey(code)
  const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  for (let attempt = 0; attempt < 45; attempt++) {
    const acquired = await r.set(lk, token, { nx: true, ex: LOCK_EX_SEC })
    if (acquired === 'OK') {
      try {
        return await fn()
      } finally {
        const cur = await r.get<string>(lk)
        if (cur === token) await r.del(lk)
      }
    }
    await new Promise((res) => setTimeout(res, 35 + attempt * 12))
  }
  throw new Error('pens_live_lock_timeout')
}

export async function upstashLoadFullSession(code: string): Promise<LiveSession | undefined> {
  const r = getRedis()
  if (!r) return undefined
  try {
    const raw = await r.get<string>(sessionKey(code))
    if (raw == null) return undefined
    const str = typeof raw === 'string' ? raw : JSON.stringify(raw)
    const s = JSON.parse(str) as LiveSession
    normalizeSessionFields(s)
    return s
  } catch (err) {
    console.error('upstashLoadFullSession err:', err)
    return undefined
  }
}

export async function upstashSaveSession(session: LiveSession): Promise<void> {
  const r = getRedis()!
  await r.set(sessionKey(session.code), JSON.stringify(session), { ex: ROOM_TTL_SEC })
}

/** Returns true if the room was created (SET NX succeeded). */
export async function upstashTryCreateSession(session: LiveSession): Promise<boolean> {
  const r = getRedis()!
  const ok = await r.set(sessionKey(session.code), JSON.stringify(session), {
    nx: true,
    ex: ROOM_TTL_SEC,
  })
  return ok === 'OK'
}
