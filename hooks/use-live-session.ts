'use client'

import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { LIVE_PUBLIC_COLLECTION } from '@/lib/firebase/live-constants'
import { getLiveClientFirestore } from '@/lib/firebase/client-app'
import type { LivePublicSnapshot } from '@/lib/live-client'
import { cleanCode } from '@/lib/live-client'
import { publicSnapshot } from '@/lib/live-session-logic'
import type { LiveSessionPublic } from '@/lib/live-session-logic'
import { shouldSubscribeFirestore } from '@/lib/live-transport'

/**
 * Realtime room state: Firestore `onSnapshot` when configured, otherwise HTTP polling.
 * Firebase’s client SDK keeps a WebSocket-style channel under the hood — comfy on Vercel or Firebase Hosting.
 */
export function useLiveSession(
  code: string | null | undefined,
  playerId?: string | null
): LivePublicSnapshot | null {
  const [snap, setSnap] = useState<LivePublicSnapshot | null>(null)

  useEffect(() => {
    const c = code ? cleanCode(code) : ''
    if (!c || c.length < 4) {
      setSnap(null)
      return
    }

    if (shouldSubscribeFirestore()) {
      const db = getLiveClientFirestore()
      if (db) {
        const unsub = onSnapshot(doc(db, LIVE_PUBLIC_COLLECTION, c), (d) => {
          if (!d.exists()) {
            setSnap(null)
            return
          }
          const session = d.data() as LiveSessionPublic
          setSnap(publicSnapshot(session, playerId ?? undefined))
        })
        return () => unsub()
      }
    }

    let cancelled = false
    const poll = async () => {
      const q = playerId ? `?playerId=${encodeURIComponent(playerId)}` : ''
      const res = await fetch(`/api/live/${encodeURIComponent(c)}${q}`, { cache: 'no-store' })
      if (cancelled) return
      if (res.status === 404) {
        setSnap(null)
        return
      }
      if (res.ok) {
        const next = (await res.json()) as LivePublicSnapshot
        setSnap(next)
      }
    }
    poll()
    const interval = window.setInterval(poll, 900)
    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [code, playerId])

  return snap
}
