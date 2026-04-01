'use client'

/**
 * 🦸 Tiny face tile — CDN portrait when we have one, emoji fallback when we don’t. One component, many moods.
 */
import { getHeroAvatar } from '@/lib/hero-avatars'
import { cn } from '@/lib/utils'

export function HeroAvatarFace({
  avatarId,
  imgClassName,
  emojiClassName,
  frameClassName,
}: {
  avatarId: string
  imgClassName?: string
  emojiClassName?: string
  frameClassName?: string
}) {
  const h = getHeroAvatar(avatarId)
  if (h.imageUrl) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10',
          frameClassName
        )}
      >
        <img src={h.imageUrl} alt="" className={cn('h-full w-full object-cover', imgClassName)} />
      </span>
    )
  }
  return <span className={cn('inline-flex shrink-0 leading-none', emojiClassName)}>{h.emoji}</span>
}
