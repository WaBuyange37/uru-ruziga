// hooks/useLessonState.ts
import { useState, useEffect, useCallback } from 'react'

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
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('idle')
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load lesson data
  useEffect(() => {
    const loadLesson = async () => {
      try {
        setLoading(true)
        setError(null)

        const token = localStorage.getItem('token')
        const headers: any = {}
        if (token) headers['Authorization'] = `Bearer ${token}`

        // Fetch lesson
        const res = await fetch(`/api/lessons/${lessonId}`, { headers })
        
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
            
            const charData: CharacterData = {
              id: data.lesson.id,
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

        // Calculate progress
        const progressRes = await fetch('/api/progress/stats', { headers })
        if (progressRes.ok) {
          const progressData = await progressRes.json()
          setProgress(progressData.overview?.progressPercentage || 0)
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
