const AVATAR_COLOR_CLASSES = [
  "bg-accent-pink text-accent-pink-foreground",
  "bg-accent-blue text-accent-blue-foreground",
  "bg-accent-yellow text-accent-yellow-foreground",
  "bg-accent-green text-accent-green-foreground",
] as const

/**
 * Deterministisk pastellfärg per person (baserat på profil-id), så
 * familjens avatarer inte alla ser likadana ut när ingen bild är satt.
 */
export function getAvatarColorClass(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  }
  return AVATAR_COLOR_CLASSES[hash % AVATAR_COLOR_CLASSES.length]
}
