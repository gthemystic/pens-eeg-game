'use client'

/**
 * 📄 Host one-pager — print-me cheat sheet + join QR (no cape required). 🖨️
 */

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { PensLogo } from '@/components/pens-logo'
import { Button } from '@/components/ui/button'

function siteUrlForQr(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

export default function AdminOnePagerPage() {
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(siteUrlForQr())
  }, [])

  const qrValue = useMemo(() => (origin ? `${origin}/` : ''), [origin])

  return (
    <div className="min-h-screen bg-background text-foreground print:bg-white print:text-black">
      <div className="max-w-3xl mx-auto px-6 py-8 print:py-6 print:px-8 space-y-8 print:space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4 print:hidden">
          <Link href="/admin" className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
            ← Back to host console
          </Link>
          <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
            Print / Save PDF
          </Button>
        </div>

        <header className="border-b border-border/60 print:border-black/20 pb-6 print:pb-4">
          <div className="flex items-center gap-3 mb-3">
            <PensLogo size="sm" />
            <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground print:text-black/70">
              Host quick sheet
            </p>
          </div>
          <h1 className="text-3xl md:text-4xl font-black leading-tight">
            PENS EEG — live quiz night
          </h1>
          <p className="mt-2 text-sm text-muted-foreground print:text-black/80 max-w-2xl leading-relaxed">
            One page for the person running the room: where players go, how the flow works, and the
            password reminder. The QR sends phones to the main join page for this deployment.
          </p>
        </header>

        <section className="grid md:grid-cols-2 gap-8 print:grid-cols-2 print:gap-6 items-start">
          <div className="space-y-4">
            <h2 className="text-lg font-black uppercase tracking-wide">Scan to join (players)</h2>
            <p className="text-sm text-muted-foreground print:text-black/75">
              Participants open this URL, enter the room code you announce, pick a hero avatar,
              then answer on their phones while the projector shows questions.
            </p>
            <div className="rounded-2xl border-2 border-border/80 bg-card p-6 flex flex-col items-center gap-3 print:border-black/30">
              {qrValue ? (
                <QRCodeSVG
                  value={qrValue}
                  size={200}
                  level="M"
                  includeMargin
                  className="print:contrast-125"
                />
              ) : (
                <p className="text-sm text-muted-foreground">Loading QR…</p>
              )}
              <p className="font-mono text-sm font-bold break-all text-center">{qrValue || '—'}</p>
            </div>
            <p className="text-xs text-muted-foreground print:text-black/60">
              Tip: set <span className="font-mono">NEXT_PUBLIC_SITE_URL</span> in production so the
              QR always encodes your canonical domain, even if you open this page from a preview URL.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-black uppercase tracking-wide">Host checklist</h2>
            <ol className="list-decimal pl-5 space-y-2 text-sm leading-relaxed print:text-black/90">
              <li>
                Open <span className="font-semibold">/admin</span>, unlock with the host password (
                <span className="font-mono">PENS_ADMIN_PASSWORD</span> — default in dev:{' '}
                <span className="font-mono">pens-dev</span>).
              </li>
              <li>Choose the quiz and tap <span className="font-semibold">Create new room</span>.</li>
              <li>
                On the big screen, open <span className="font-mono">/display?code=ROOM</span>{' '}
                (use the link in the console).
              </li>
              <li>Share the 6-character room code (or let players scan the QR and type the code).</li>
              <li>
                When everyone is in the lobby, tap <span className="font-semibold">Start quiz</span>.
              </li>
              <li>
                After each question, tap <span className="font-semibold">Reveal results</span>, then{' '}
                <span className="font-semibold">Next question</span> when you are ready.
              </li>
              <li>At the end, use <span className="font-semibold">Show final leaderboard</span>.</li>
            </ol>
            <div className="rounded-xl bg-secondary/60 print:bg-neutral-100 p-4 text-sm space-y-1">
              <p className="font-black">URLs (replace ROOM)</p>
              <p className="font-mono break-all text-xs opacity-90">
                {origin || '(your site)'}/?code=ROOM — players
              </p>
              <p className="font-mono break-all text-xs opacity-90">
                {origin || '(your site)'}/display?code=ROOM — projector
              </p>
              <p className="font-mono break-all text-xs opacity-90">{origin || '(your site)'}/admin — host</p>
            </div>
          </div>
        </section>

        <footer className="text-xs text-muted-foreground print:text-black/55 border-t border-border/40 print:border-black/15 pt-4 print:pt-3">
          Firestore live rooms: set <span className="font-mono">NEXT_PUBLIC_LIVE_TRANSPORT=firestore</span>{' '}
          and Firebase env vars on the server (see <span className="font-mono">.env.example</span>).
        </footer>
      </div>
    </div>
  )
}
