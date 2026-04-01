'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface PensLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'full' | 'icon'
  className?: string
}

export function PensLogo({ size = 'md', variant = 'full', className }: PensLogoProps) {
  const sizes = {
    sm: { icon: 32, text: 'text-sm' },
    md: { icon: 48, text: 'text-base' },
    lg: { icon: 64, text: 'text-xl' },
    xl: { icon: 80, text: 'text-2xl' },
  }

  const { icon, text } = sizes[size]

  if (variant === 'icon') {
    return (
      <div className={cn('relative', className)}>
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/d2e37c33-40bc-41c2-9f8a-79dc2ddb6b59.jpeg"
          alt="PENS Logo — Pediatric Epilepsy & Neurology Specialists"
          width={icon}
          height={icon}
          className="rounded-lg object-contain"
        />
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="relative shrink-0 animate-float">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/d2e37c33-40bc-41c2-9f8a-79dc2ddb6b59.jpeg"
          alt="PENS Logo"
          width={icon}
          height={icon}
          className="rounded-xl object-contain drop-shadow-lg"
        />
      </div>
      <div className={cn('flex flex-col leading-tight', text)}>
        <span className="font-black text-foreground tracking-tight">PENS</span>
        <span className="font-semibold text-muted-foreground text-[0.65em] leading-tight max-w-[180px]">
          Pediatric Epilepsy &amp; Neurology Specialists
        </span>
      </div>
    </div>
  )
}

export function PensLogoFull({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <Image
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/f0c00838-3818-4eda-8d7f-ed8df7706651.jpeg"
        alt="PENS — Pediatric Epilepsy & Neurology Specialists"
        width={320}
        height={120}
        className="object-contain drop-shadow-xl"
      />
    </div>
  )
}
