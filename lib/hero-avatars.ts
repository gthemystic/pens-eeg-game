/**
 * 🦸 Cape-friendly roster — alohe CDN portraits (MIT) + emoji fallback for reactions.
 * Each id is unique in the catalog; the lobby enforces one pick per room. 🎪
 * @see https://github.com/alohe/avatars
 */
export interface HeroAvatar {
  id: string
  label: string
  emoji: string
  /** Optional full-bleed portrait — when set, UIs should prefer img over emoji. */
  imageUrl?: string
}

const ALOHE_CDN = 'https://cdn.jsdelivr.net/gh/alohe/avatars/png'

function aloheRange(prefix: string, from: number, to: number): string[] {
  return Array.from({ length: to - from + 1 }, (_, i) => `${prefix}_${from + i}.png`)
}

/** Curated filenames that exist in alohe/avatars/png (as of main branch). */
const ALOHE_MANIFEST: string[] = [
  ...aloheRange('memo', 1, 24),
  ...aloheRange('vibrent', 1, 20),
  ...aloheRange('notion', 1, 15),
  ...aloheRange('teams', 1, 9),
  ...aloheRange('toon', 1, 10),
]

function fileToId(file: string): string {
  const base = file.replace('.png', '')
  const [pack, num] = base.split('_')
  return `alohe-${pack}-${num}`
}

function fileToLabel(file: string): string {
  const base = file.replace('.png', '')
  const [pack, num] = base.split('_')
  const title = pack ? `${pack.charAt(0).toUpperCase()}${pack.slice(1)}` : 'Hero'
  return `${title} ${num}`
}

export const SUPERHERO_AVATARS: HeroAvatar[] = ALOHE_MANIFEST.map((file) => ({
  id: fileToId(file),
  label: fileToLabel(file),
  emoji: '🦸',
  imageUrl: `${ALOHE_CDN}/${file}`,
}))

export const DEFAULT_HERO_AVATAR_ID = SUPERHERO_AVATARS[0]!.id

const AVATAR_IDS = new Set(SUPERHERO_AVATARS.map((h) => h.id))

export function isValidHeroAvatarId(id: string): boolean {
  return AVATAR_IDS.has(id)
}

export function getHeroAvatar(id: string): HeroAvatar {
  return SUPERHERO_AVATARS.find((h) => h.id === id) ?? SUPERHERO_AVATARS[0]!
}

/** Kahoot-style quick reactions — single-codepoint / common emoji only */
export const LIVE_REACTION_EMOJIS = ['👍', '👏', '❤️', '😂', '🤔', '🎉', '🔥', '⚡', '🧠', '✨'] as const

export type LiveReactionEmoji = (typeof LIVE_REACTION_EMOJIS)[number]

export function isAllowedLiveReactionEmoji(s: string): s is LiveReactionEmoji {
  return (LIVE_REACTION_EMOJIS as readonly string[]).includes(s)
}
