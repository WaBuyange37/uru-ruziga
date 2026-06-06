import { UMWERO_MAP } from '@/lib/audio-utils'

export function resolveUmweroFontInput(latinEquivalent: string, storedGlyph?: string | null): string {
  return UMWERO_MAP[latinEquivalent] || UMWERO_MAP[latinEquivalent.toUpperCase()] || storedGlyph || latinEquivalent
}
