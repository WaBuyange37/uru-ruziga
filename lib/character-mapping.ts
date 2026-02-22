// lib/character-mapping.ts
// Maps lesson IDs to actual database character IDs

export function getLessonIdToCharacterIdMap(): Record<string, string> {
  return {
    // Vowels
    'lesson-vowel-a': 'char-a',
    'lesson-vowel-e': 'char-e', 
    'lesson-vowel-i': 'char-i',
    'lesson-vowel-o': 'char-o',
    'lesson-vowel-u': 'char-u',
    
    // Consonants (add as needed)
    'lesson-consonant-b': 'char-b',
    'lesson-consonant-r': 'char-r',
    'lesson-consonant-m': 'char-m',
    'lesson-consonant-n': 'char-n',
    'lesson-consonant-k': 'char-k',
    'lesson-consonant-g': 'char-g',
    'lesson-consonant-t': 'char-t',
    'lesson-consonant-d': 'char-d',
    'lesson-consonant-p': 'char-p',
    'lesson-consonant-f': 'char-f',
    'lesson-consonant-v': 'char-v',
    'lesson-consonant-s': 'char-s',
    'lesson-consonant-z': 'char-z',
    'lesson-consonant-sh': 'char-sh',
    'lesson-consonant-j': 'char-j',
    'lesson-consonant-c': 'char-c',
    'lesson-consonant-h': 'char-h',
    'lesson-consonant-w': 'char-w',
    'lesson-consonant-y': 'char-y',
    'lesson-consonant-l': 'char-l',
    'lesson-consonant-ny': 'char-ny'
  }
}

export function getCharacterIdToLessonIdMap(): Record<string, string> {
  const lessonToChar = getLessonIdToCharacterIdMap()
  const charToLesson: Record<string, string> = {}
  
  for (const [lessonId, charId] of Object.entries(lessonToChar)) {
    charToLesson[charId] = lessonId
  }
  
  return charToLesson
}

export function lessonIdToCharacterId(lessonId: string): string {
  const mapping = getLessonIdToCharacterIdMap()
  return mapping[lessonId] || lessonId // fallback to original if not found
}

export function characterIdToLessonId(characterId: string): string {
  const mapping = getCharacterIdToLessonIdMap()
  return mapping[characterId] || characterId // fallback to original if not found
}