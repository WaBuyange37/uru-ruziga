// hooks/useLessonState.ts
import { useState, useEffect, useCallback } from 'react'
import { lessonIdToCharacterId } from '@/lib/character-mapping'

export type TabType = 'overview' | 'culture' | 'strokes' | 'story'
export type PracticeMode = 'idle' | 'drawing' | 'evaluating' | 'complete'

interface LessonData {
  id: string
  title: string
  description: string
  content: string
  type: string
  order: number
  duration: number
}

interface CharacterData {
  id: string
  vowel?: string
  consonant?: string
  umwero: string
  title: string
  description: string
  pronunciation: string
  meaning: string
  culturalNote: string
  examples: Array<{ umwero: string; latin: string; meaning: string }>
  strokeGuide: string[]
  imageUrl?: string
  strokeImageUrl?: string
  audioUrl?: string
}

interface LessonState {
  lesson: LessonData | null
  character: CharacterData | null
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  practiceMode: PracticeMode
  setPracticeMode: (mode: PracticeMode) => void
  progress: number
  loading: boolean
  error: string | null
}

export function useLessonState(lessonId: string): LessonState {
  const [lesson, setLesson] = useState<LessonData | null>(null)
  const [character, setCharacter] = useState<CharacterData | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('drawing')
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load lesson data
  useEffect(() => {
    const loadLesson = async () => {
      try {
        setLoading(true)
        setError(null)

        // Try to get lesson from static data first for faster loading
        const staticLesson = getStaticLessonData(lessonId)
        if (staticLesson) {
          setLesson(staticLesson.lesson)
          setCharacter(staticLesson.character)
          setLoading(false)
          
          // Load progress in background (non-blocking)
          loadProgressInBackground()
          return
        }

        const token = localStorage.getItem('token')
        const headers: any = {}
        if (token) headers['Authorization'] = `Bearer ${token}`

        // Fetch lesson from API with timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
        
        const res = await fetch(`/api/lessons/${lessonId}`, { 
          headers,
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!res.ok) {
          throw new Error('Failed to load lesson')
        }

        const data = await res.json()
        setLesson(data.lesson)

        // Parse character data from lesson content
        if (data.lesson.content) {
          try {
            const content = JSON.parse(data.lesson.content)
            const char = (content.vowel || content.consonant || 'a').toLowerCase()
            const charUpper = char.toUpperCase()
            
            // Map lesson ID to actual character ID
            const actualCharacterId = lessonIdToCharacterId(data.lesson.id)
            
            const charData: CharacterData = {
              id: actualCharacterId, // Use mapped character ID
              vowel: content.vowel,
              consonant: content.consonant,
              umwero: content.umwero || '',
              title: data.lesson.title,
              description: data.lesson.description || '',
              pronunciation: content.pronunciation || '',
              meaning: content.meaning || '',
              culturalNote: content.culturalNote || '',
              examples: content.examples || [],
              strokeGuide: content.strokeGuide || [],
              // Dynamic asset paths based on actual file structure
              imageUrl: `/UmweroLetaByLeta/${char}/${charUpper}in8.jpg`,
              strokeImageUrl: `/UmweroLetaByLeta/${char}/${charUpper}-ways.${char === 'a' || char === 'o' || char === 'u' ? 'png' : 'jpg'}`,
              audioUrl: `/UmweroLetaByLeta/${char}/${charUpper}.mp3`
            }
            setCharacter(charData)
          } catch (e) {
            console.error('Error parsing lesson content:', e)
            setError('Invalid lesson data')
          }
        }

        // Calculate progress (optional - don't block lesson loading)
        try {
          const progressRes = await fetch('/api/progress/stats', { headers })
          if (progressRes.ok) {
            const progressData = await progressRes.json()
            setProgress(progressData.overview?.progressPercentage || 0)
          }
        } catch (progressError) {
          console.warn('Failed to load progress stats:', progressError)
          // Don't block lesson loading if progress fails
          setProgress(0)
        }
      } catch (err) {
        console.error('Error loading lesson:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    if (lessonId) {
      loadLesson()
    }
  }, [lessonId])

  // Background progress loading function
  const loadProgressInBackground = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers: any = {}
      if (token) headers['Authorization'] = `Bearer ${token}`
      
      const progressRes = await fetch('/api/progress/stats', { headers })
      if (progressRes.ok) {
        const progressData = await progressRes.json()
        setProgress(progressData.overview?.progressPercentage || 0)
      }
    } catch (error) {
      console.warn('Background progress loading failed:', error)
    }
  }

// Static lesson data for faster loading
function getStaticLessonData(lessonId: string): { lesson: LessonData; character: CharacterData } | null {
  // Map common lesson IDs to static data
  const staticLessons: Record<string, { lesson: LessonData; character: CharacterData }> = {
    'lesson-vowel-a': {
      lesson: {
        id: 'lesson-vowel-a',
        title: 'Vowel A',
        description: 'Learn the vowel A - Inyambo cow head',
        content: JSON.stringify({ vowel: 'a', glyph: '"', symbol: 'Inyambo cow head', examples: ['abana', 'amazi', 'akazi'] }),
        type: 'VOWEL',
        order: 1,
        duration: 8
      },
      character: {
        id: 'char-a', // Use actual database character ID
        vowel: 'a',
        umwero: '"',
        title: 'Vowel A',
        description: 'Learn the vowel A - Inyambo cow head',
        pronunciation: '/a/',
        meaning: 'Cow head symbol',
        culturalNote: 'From cow vocalization "Baaaa"',
        examples: [
          { umwero: '"B"N"', latin: 'abana', meaning: 'children' },
          { umwero: '"M"Z}', latin: 'amazi', meaning: 'water' }
        ],
        strokeGuide: ['Start from top', 'Draw downward', 'Complete the shape'],
        imageUrl: '/UmweroLetaByLeta/a/Ain8.jpg',
        strokeImageUrl: '/UmweroLetaByLeta/a/A-ways.png',
        audioUrl: '/UmweroLetaByLeta/a/A.mp3'
      }
    },
    'lesson-vowel-e': {
      lesson: {
        id: 'lesson-vowel-e',
        title: 'Vowel E',
        description: 'Learn the vowel E - True Kinyarwanda /e/ sound',
        content: JSON.stringify({ vowel: 'e', glyph: '|', symbol: 'True Kinyarwanda /e/ sound', examples: ['ese', 'ejo', 'erekana'] }),
        type: 'VOWEL',
        order: 2,
        duration: 8
      },
      character: {
        id: 'char-e', // Use actual database character ID
        vowel: 'e',
        umwero: '|',
        title: 'Vowel E',
        description: 'Learn the vowel E - True Kinyarwanda /e/ sound',
        pronunciation: '/e/',
        meaning: 'Pure E sound',
        culturalNote: 'Corrects Latin E mismatch',
        examples: [
          { umwero: '|S|', latin: 'ese', meaning: 'that' },
          { umwero: '|J{', latin: 'ejo', meaning: 'yesterday' }
        ],
        strokeGuide: ['Draw vertical line', 'Keep it straight'],
        imageUrl: '/UmweroLetaByLeta/e/Ein8.jpg',
        strokeImageUrl: '/UmweroLetaByLeta/e/E-ways.jpg',
        audioUrl: '/UmweroLetaByLeta/e/E.mp3'
      }
    },
    'lesson-vowel-i': {
      lesson: {
        id: 'lesson-vowel-i',
        title: 'Vowel I',
        description: 'Learn the vowel I - Long vowel',
        content: JSON.stringify({ vowel: 'i', glyph: '}', symbol: 'Long vowel', examples: ['iki', 'ino', 'inka'] }),
        type: 'VOWEL',
        order: 3,
        duration: 8
      },
      character: {
        id: 'char-i', // Use actual database character ID
        vowel: 'i',
        umwero: '}',
        title: 'Vowel I',
        description: 'Learn the vowel I - Long vowel',
        pronunciation: '/i/',
        meaning: 'Long vowel sound',
        culturalNote: 'Pure Kinyarwanda /i/',
        examples: [
          { umwero: '}K}', latin: 'iki', meaning: 'what' },
          { umwero: '}N{', latin: 'ino', meaning: 'this' }
        ],
        strokeGuide: ['Draw curved bracket', 'Open to the left'],
        imageUrl: '/UmweroLetaByLeta/i/Iin8.jpg',
        strokeImageUrl: '/UmweroLetaByLeta/i/I-ways.jpg',
        audioUrl: '/UmweroLetaByLeta/i/I.mp3'
      }
    },
    'lesson-vowel-o': {
      lesson: {
        id: 'lesson-vowel-o',
        title: 'Vowel O',
        description: 'Learn the vowel O - Circle — completeness',
        content: JSON.stringify({ vowel: 'o', glyph: '{', symbol: 'Circle — completeness', examples: ['oya', 'oko', 'ose'] }),
        type: 'VOWEL',
        order: 4,
        duration: 8
      },
      character: {
        id: 'char-o', // Use actual database character ID
        vowel: 'o',
        umwero: '{',
        title: 'Vowel O',
        description: 'Learn the vowel O - Circle — completeness',
        pronunciation: '/o/',
        meaning: 'Completeness symbol',
        culturalNote: 'Uruziga cycle of life',
        examples: [
          { umwero: '{Y"', latin: 'oya', meaning: 'no' },
          { umwero: '{K{', latin: 'oko', meaning: 'that' }
        ],
        strokeGuide: ['Draw circle', 'Complete the shape'],
        imageUrl: '/UmweroLetaByLeta/o/Oin8.jpg',
        strokeImageUrl: '/UmweroLetaByLeta/o/O-ways.png',
        audioUrl: '/UmweroLetaByLeta/o/O.mp3'
      }
    },
    'lesson-vowel-u': {
      lesson: {
        id: 'lesson-vowel-u',
        title: 'Vowel U',
        description: 'Learn the vowel U - Binding rope',
        content: JSON.stringify({ vowel: 'u', glyph: ':', symbol: 'Binding rope', examples: ['ubu', 'uko', 'uyu'] }),
        type: 'VOWEL',
        order: 5,
        duration: 8
      },
      character: {
        id: 'char-u', // Use actual database character ID
        vowel: 'u',
        umwero: ':',
        title: 'Vowel U',
        description: 'Learn the vowel U - Binding rope',
        pronunciation: '/u/',
        meaning: 'Binding symbol',
        culturalNote: 'Umugozi relationships',
        examples: [
          { umwero: ':B:', latin: 'ubu', meaning: 'now' },
          { umwero: ':K{', latin: 'uko', meaning: 'there' }
        ],
        strokeGuide: ['Draw two dots', 'Align vertically'],
        imageUrl: '/UmweroLetaByLeta/u/Uin8.jpg',
        strokeImageUrl: '/UmweroLetaByLeta/u/U-ways.png',
        audioUrl: '/UmweroLetaByLeta/u/U.mp3'
      }
    }
  }

  return staticLessons[lessonId] || null
}

  return {
    lesson,
    character,
    activeTab,
    setActiveTab,
    practiceMode,
    setPracticeMode,
    progress,
    loading,
    error
  }
}
