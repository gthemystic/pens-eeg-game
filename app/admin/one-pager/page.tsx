'use client'

/**
 * 📄 Host one-pager — print-me cheat sheet + join QR (no cape required). 🖨️
 * Now with enhanced Ghibli-inspired visuals and EEG-themed artistry. 🎨🧠
 */

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { PensLogo } from '@/components/pens-logo'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Printer, CheckCircle2, Globe, Laptop, Smartphone } from 'lucide-react'

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
    <div className="min-h-screen bg-[#fdfcf0] text-[#2d2d2d] font-sans selection:bg-primary/20">
      {/* Visual Header - Ghibli Style */}
      <div className="relative h-48 md:h-64 w-full overflow-hidden print:h-40">
        <img 
          src="/assets/host-one-pager-header.png" 
          alt="Ghibli-style Neurology Lab" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fdfcf0] to-transparent opacity-60" />
        
        {/* Navigation - Hidden on Print */}
        <div className="absolute top-6 left-6 z-10 print:hidden">
          <Link 
            href="/admin" 
            className="group flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full text-sm font-bold shadow-sm hover:shadow-md hover:bg-white transition-all border border-black/5"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Console
          </Link>
        </div>
        
        <div className="absolute top-6 right-6 z-10 print:hidden">
          <Button 
            type="button" 
            onClick={() => window.print()}
            className="rounded-full font-black shadow-lg hover:scale-105 transition-transform bg-[#4a6fa5] text-white hover:bg-[#3d5a8a]"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Guide
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-16 -mt-12 relative z-20 print:mt-0 print:pb-8">
        {/* Title Card */}
        <header className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-black/5 print:shadow-none print:border-none print:p-0">
          <div className="flex items-center gap-4 mb-6 print:mb-4">
            <div className="bg-[#f0f4f8] p-3 rounded-2xl">
              <PensLogo size="sm" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[#4a6fa5]/70">
                Official Host Guide
              </p>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#1a2a3a]">
                PENS EEG Quiz Night
              </h1>
            </div>
          </div>
          
          <p className="text-lg text-[#4a5568] leading-relaxed max-w-2xl print:text-base print:max-w-full">
            The ultimate cheat sheet for running a successful live room. 
            Everything you need to lead your participants through the wonders of brainwave interpretation.
          </p>
        </header>

        <div className="grid md:grid-cols-5 gap-8 mt-10 print:grid-cols-5 print:gap-6">
          
          {/* Left Column: QR & URL */}
          <div className="md:col-span-2 space-y-8 print:space-y-6">
            <section className="bg-white rounded-3xl p-8 shadow-lg border border-black/5 print:shadow-none print:border-2 print:border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Smartphone className="w-5 h-5 text-[#4a6fa5]" />
                <h2 className="text-xl font-black tracking-tight">Participant Join</h2>
              </div>
              
              <div className="bg-[#f8fafc] rounded-2xl p-6 flex flex-col items-center gap-4 border border-[#e2e8f0]">
                {qrValue ? (
                  <div className="bg-white p-4 rounded-xl shadow-inner">
                    <QRCodeSVG
                      value={qrValue}
                      size={180}
                      level="H"
                      includeMargin={false}
                      className="print:contrast-125"
                    />
                  </div>
                ) : (
                  <div className="w-[180px] h-[180px] bg-gray-100 animate-pulse rounded-xl" />
                )}
                
                <div className="text-center space-y-1 w-full">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Scan to enter</p>
                  <p className="font-mono text-sm font-bold break-all bg-white py-2 px-3 rounded-lg border border-gray-100 shadow-sm">
                    {origin || 'pens-quiz.com'}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex items-start gap-3 bg-[#fff9db] p-4 rounded-xl border border-[#ffe066]/30">
                <CheckCircle2 className="w-5 h-5 text-[#f59f00] shrink-0 mt-0.5" />
                <p className="text-xs font-medium leading-relaxed text-[#856404]">
                  <strong>Tip:</strong> Players can enter the code you announce or simply scan this QR to reach the lobby instantly.
                </p>
              </div>
            </section>

            <section className="hidden md:block print:block overflow-hidden rounded-3xl bg-white shadow-lg border border-black/5 print:shadow-none">
              <img 
                src="/assets/eeg-magical-landscape.png" 
                alt="EEG Landscape" 
                className="w-full h-40 object-cover"
              />
              <div className="p-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">
                  Art: "The Electrical River" (EEG Waveform)
                </p>
              </div>
            </section>
          </div>

          {/* Right Column: Steps & URLs */}
          <div className="md:col-span-3 space-y-8 print:space-y-6">
            <section className="bg-[#1a2a3a] rounded-3xl p-8 shadow-2xl text-white print:bg-white print:text-black print:border-2 print:border-gray-100 print:shadow-none">
              <div className="flex items-center gap-2 mb-8 print:mb-6">
                <div className="bg-[#4a6fa5] p-2 rounded-lg print:bg-gray-100">
                  <Laptop className="w-5 h-5 text-white print:text-black" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">Host Checklist</h2>
              </div>
              
              <div className="space-y-6">
                {[
                  { step: "01", title: "Access Console", desc: "Open /admin and enter your host secret key." },
                  { step: "02", title: "Create Room", desc: "Select your desired EEG quiz and launch a fresh session." },
                  { step: "03", title: "Display Board", desc: "Open the Projector Link on the main screen for all to see." },
                  { step: "04", title: "Assemble Players", desc: "Announce the 6-character room code as players scan in." },
                  { step: "05", title: "Begin Journey", desc: "Once everyone has a hero avatar, tap Start Quiz." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-5 group">
                    <div className="text-3xl font-black text-[#4a6fa5]/40 group-hover:text-[#4a6fa5] transition-colors print:text-gray-300">
                      {item.step}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg leading-none print:text-base">{item.title}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed print:text-gray-600">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-3xl p-8 shadow-lg border border-black/5 print:shadow-none print:border-2 print:border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Globe className="w-5 h-5 text-[#4a6fa5]" />
                <h2 className="text-xl font-black tracking-tight">Deployment URLs</h2>
              </div>
              
              <div className="grid gap-3">
                {[
                  { label: "Participant Link", url: `${origin}/?code=ROOM` },
                  { label: "Projector View", url: `${origin}/display?code=ROOM` },
                  { label: "Host Controls", url: `${origin}/admin` }
                ].map((link, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
                    <span className="text-xs font-black uppercase text-gray-400 mb-1 sm:mb-0">{link.label}</span>
                    <span className="font-mono text-xs font-bold text-[#4a6fa5] truncate max-w-[240px]">
                      {link.url}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <footer className="mt-12 text-center space-y-4 print:mt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#f0f4f8] rounded-full text-[10px] font-bold uppercase tracking-widest text-[#4a6fa5]/60 border border-[#e2e8f0]">
            Created for PENS Pediatric Epilepsy & Neurology Specialists
          </div>
          <p className="text-[#a0aec0] text-xs max-w-lg mx-auto leading-relaxed">
            Proprietary EEG Quiz System. All brainwave patterns and diagnostic sequences are for educational purposes.
          </p>
        </footer>
      </div>
    </div>
  )
}
