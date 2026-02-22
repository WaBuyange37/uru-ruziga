// lib/lesson-cache.ts
// Simple in-memory cache for lessons to improve performance

interface CachedLesson {
  id: string
  title: string
  description: string
  content: string
  type: string
  order: number
  duration: number
  cachedAt: number
}

const lessonCache = new Map<string, CachedLesson>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export function getCachedLesson(lessonId: string): CachedLesson | null {
  const cached = lessonCache.get(lessonId)
  if (!cached) return null
  
  // Check if cache is expired
  if (Date.now() - cached.cachedAt > CACHE_TTL) {
    lessonCache.delete(lessonId)
    return null
  }
  
  return cached
}

export function setCachedLesson(lesson: any): void {
  lessonCache.set(lesson.id, {
    ...lesson,
    cachedAt: Date.now()
  })
}

export function clearLessonCache(): void {
  lessonCache.clear()
}

// Pre-populate cache with common lessons
export function initializeLessonCache(): void {
  const commonLessons = [
    {
      id: 'lesson-vowel-a',
      title: 'Vowel A',
      description: 'Learn the vowel A - Inyambo cow head',
      content: JSON.stringify({ 
        vowel: 'a', 
        glyph: '"', 
        symbol: 'Inyambo cow head', 
        examples: ['abana', 'amazi', 'akazi'] 
      }),
      type: 'VOWEL',
      order: 1,
      duration: 8
    },
    {
      id: 'lesson-vowel-e',
      title: 'Vowel E',
      description: 'Learn the vowel E - True Kinyarwanda /e/ sound',
      content: JSON.stringify({ 
        vowel: 'e', 
        glyph: '|', 
        symbol: 'True Kinyarwanda /e/ sound', 
        examples: ['ese', 'ejo', 'erekana'] 
      }),
      type: 'VOWEL',
      order: 2,
      duration: 8
    },
    {
      id: 'lesson-vowel-i',
      title: 'Vowel I',
      description: 'Learn the vowel I - Long vowel',
      content: JSON.stringify({ 
        vowel: 'i', 
        glyph: '}', 
        symbol: 'Long vowel', 
        examples: ['iki', 'ino', 'inka'] 
      }),
      type: 'VOWEL',
      order: 3,
      duration: 8
    },
    {
      id: 'lesson-vowel-o',
      title: 'Vowel O',
      description: 'Learn the vowel O - Circle — completeness',
      content: JSON.stringify({ 
        vowel: 'o', 
        glyph: '{', 
        symbol: 'Circle — completeness', 
        examples: ['oya', 'oko', 'ose'] 
      }),
      type: 'VOWEL',
      order: 4,
      duration: 8
    },
    {
      id: 'lesson-vowel-u',
      title: 'Vowel U',
      description: 'Learn the vowel U - Binding rope',
      content: JSON.stringify({ 
        vowel: 'u', 
        glyph: ':', 
        symbol: 'Binding rope', 
        examples: ['ubu', 'uko', 'uyu'] 
      }),
      type: 'VOWEL',
      order: 5,
      duration: 8
    }
  ]

  commonLessons.forEach(lesson => setCachedLesson(lesson))
}