// /home/nzela37/Kwizera/Projects/uru-ruziga/hooks/use-umwero-translation.ts
import { UMWERO_MAP, convertToUmwero } from '../lib/audio-utils'

// 🔒 CRITICAL TRANSLATION HOOK - DO NOT MODIFY 🔒
// This hook is PRODUCTION-LOCKED and used by both translator and chat
// Last verified working: February 2026
// See: UMWERO_LIGATURE_SYSTEM_CRITICAL.md for details

export function useUmweroTranslation() {
  // Legacy vowel map for backward compatibility
  const vowelMap = {
    'A': '"',
    'E': '|',
    'I': '}',
    'O': '{',
    'U': ':'
  }

  // Extract consonant and ligature mappings from the comprehensive UMWERO_MAP
  const consonantMap: Record<string, string> = {}
  const ligatureMap: Record<string, string> = {}
  
  // Build consonant and ligature maps from UMWERO_MAP
  Object.entries(UMWERO_MAP).forEach(([latin, umwero]) => {
    // Skip vowels, spaces, and punctuation
    if (!['A', 'E', 'I', 'O', 'U', 'a', 'e', 'i', 'o', 'u', ' ', '.', ',', '!', '?', ':', ';', '-', "'", '"', '(', ')'].includes(latin)) {
      const upperLatin = latin.toUpperCase()
      
      // Categorize as ligature (2+ characters) or consonant (single character)
      if (upperLatin.length > 1) {
        ligatureMap[upperLatin] = umwero
      } else {
        consonantMap[upperLatin] = umwero
      }
    }
  })

  // Legacy charMap for backward compatibility
  const charMap = {
    'a': '"', ':': '=', 'u': ':', 'o': '{',
    'e': '|', 'i': '}', 'A': '"', 'U': ':',
    'O': '{', 'E': '|', 'I': '}'
  }

  // 🚨 CRITICAL: Enhanced Latin to Umwero translation using the comprehensive mapping
  // DO NOT MODIFY: This calls the protected convertToUmwero() function
  const latinToUmwero = (text: string): string => {
    return convertToUmwero(text)
  }

  // Enhanced Umwero to Latin translation with ligature support
  const umweroToLatin = (text: string): string => {
    let result = ''
    const words = text.split(' ')

    for (let word of words) {
      let i = 0
      while (i < word.length) {
        let found = false
        
        // Check for multi-character Umwero sequences (ligatures) - longest first
        for (let len = 6; len >= 2; len--) {
          if (i + len <= word.length) {
            const umweroSeq = word.slice(i, i + len)
            
            // Find matching Latin sequence in UMWERO_MAP
            const latinMatch = Object.entries(UMWERO_MAP).find(([latin, umwero]) => 
              umwero === umweroSeq && latin.length > 1
            )
            
            if (latinMatch) {
              result += latinMatch[0].toLowerCase()
              i += len
              found = true
              break
            }
          }
        }
        
        // Check for single character mappings (vowels and consonants)
        if (!found) {
          const char = word[i]
          
          // Find matching single character in UMWERO_MAP
          const singleMatch = Object.entries(UMWERO_MAP).find(([latin, umwero]) => 
            umwero === char && latin.length === 1
          )
          
          if (singleMatch) {
            result += singleMatch[0].toLowerCase()
          } else {
            result += char.toLowerCase() // Keep unmapped characters
          }
          i++
        }
      }
      result += ' ' // Add space between words
    }

    return result.trim()
  }

  // Legacy translate function for backward compatibility
  const translate = (text: string) => {
    return latinToUmwero(text)
  }

  return { 
    translate, 
    latinToUmwero, 
    umweroToLatin, 
    charMap, 
    consonantMap: { ...consonantMap, ...ligatureMap }, // Combine for backward compatibility
    vowelMap,
    ligatureMap // New: expose ligatures separately
  }
}

