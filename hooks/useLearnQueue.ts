// hooks/useLearnQueue.ts
"use client"

import { useState, useEffect, useCallback } from 'react'
import { progressEvents } from '@/lib/progress-events'

export interface Character {
  id: string
  vowel: string
  umwero: string
  title: string
  description: string
  pronunciation: string
  meaning: string
  culturalNote: string
  duration: number
  difficulty: number
  order: number
  imageUrl: string
  audioUrl?: string
  examples: string[]
}

export interface CharacterProgress {
  characterId: string
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'LEARNED'
  score: number
  timeSpent: number
  attempts: number
  lastAttempt: Date
}

export interface LearnState {
  activeQueue: Character[]      // max 6 visible
  learned: Character[]          // completed characters
  remaining: Character[]        // not yet shown
  progress: Record<string, CharacterProgress>
}

const QUEUE_SIZE = 6

// API helper functions
async function fetchCharacterProgress(type: string): Promise<Record<string, CharacterProgress>> {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      // Fallback to localStorage if no auth token
      const savedProgress = localStorage.getItem(`learnProgress_${type}`)
      return savedProgress ? JSON.parse(savedProgress) : {}
    }

    const response = await fetch(`/api/character-progress?type=${type}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch progress')
    }

    const data = await response.json()
    
    // Convert API response to our format
    const progress: Record<string, CharacterProgress> = {}
    data.progress.forEach((p: any) => {
      progress[p.characterId] = {
        characterId: p.characterId,
        status: p.status,
        score: p.score,
        timeSpent: p.timeSpent,
        attempts: p.attempts,
        lastAttempt: new Date(p.lastAttempt)
      }
    })

    return progress
  } catch (error) {
    console.error('Error fetching character progress:', error)
    // Fallback to localStorage
    const savedProgress = localStorage.getItem(`learnProgress_${type}`)
    return savedProgress ? JSON.parse(savedProgress) : {}
  }
}

async function updateCharacterProgressAPI(characterId: string, score: number, timeSpent: number = 0): Promise<boolean> {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      return false // Will fallback to localStorage
    }

    const response = await fetch('/api/character-progress', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        characterId,
        score,
        timeSpent
      })
    })

    if (!response.ok) {
      throw new Error('Failed to update progress')
    }

    const data = await response.json()
    return data.success
  } catch (error) {
    console.error('Error updating character progress:', error)
    return false
  }
}

export function useLearnQueue(initialCharacters: Character[], type: 'vowel' | 'consonant' | 'ligature') {
  const [learnState, setLearnState] = useState<LearnState>({
    activeQueue: [],
    learned: [],
    remaining: [],
    progress: {}
  })

  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)

  // Function to refresh progress from API
  const refreshProgress = useCallback(async () => {
    setLoading(true)
    
    try {
      // Load progress from API (with localStorage fallback)
      const progress = await fetchCharacterProgress(type)

      // Separate characters based on their progress
      const learned: Character[] = []
      const notStarted: Character[] = []
      const inProgress: Character[] = []

      initialCharacters.forEach(char => {
        const charProgress = progress[char.id]
        if (charProgress?.status === 'LEARNED') {
          learned.push(char)
        } else if (charProgress?.status === 'IN_PROGRESS') {
          inProgress.push(char)
        } else {
          notStarted.push(char)
        }
      })

      // Create active queue: in-progress first, then new characters
      const activeQueue = [...inProgress, ...notStarted].slice(0, QUEUE_SIZE)
      const remaining = [...inProgress, ...notStarted].slice(QUEUE_SIZE)

      setLearnState({
        activeQueue,
        learned,
        remaining,
        progress
      })
    } catch (error) {
      console.error('Error refreshing progress:', error)
    } finally {
      setLoading(false)
    }
  }, [initialCharacters, type])

  // Initialize state from API and fallback to localStorage
  useEffect(() => {
    setMounted(true)
    refreshProgress()
  }, [refreshProgress])

  // Listen for focus events to refresh progress when user returns to page
  useEffect(() => {
    const handleFocus = () => {
      // Refresh progress when user returns to the page (e.g., from lesson)
      refreshProgress()
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible, refresh progress
        refreshProgress()
      }
    }

    // Listen for progress update events
    const unsubscribe = progressEvents.subscribe((event) => {
      if (event.type === type) {
        // Refresh progress when a character of this type is updated
        refreshProgress()
      }
    })

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      unsubscribe()
    }
  }, [refreshProgress, type])

  // Save progress to localStorage (backup)
  const saveProgress = useCallback((progress: Record<string, CharacterProgress>) => {
    localStorage.setItem(`learnProgress_${type}`, JSON.stringify(progress))
  }, [type])

  // Update character status with API integration
  const updateCharacterStatus = useCallback(async (characterId: string, status: 'LEARNED' | 'IN_PROGRESS', score?: number) => {
    const finalScore = score || 0
    
    // Try to update via API first
    const apiSuccess = await updateCharacterProgressAPI(characterId, finalScore, 0)
    
    setLearnState(prevState => {
      const newProgress = { ...prevState.progress }
      
      // Update progress
      newProgress[characterId] = {
        characterId,
        status,
        score: finalScore,
        timeSpent: newProgress[characterId]?.timeSpent || 0,
        attempts: (newProgress[characterId]?.attempts || 0) + 1,
        lastAttempt: new Date()
      }

      let newActiveQueue = [...prevState.activeQueue]
      let newLearned = [...prevState.learned]
      let newRemaining = [...prevState.remaining]

      if (status === 'LEARNED') {
        // Find the character in active queue
        const charIndex = newActiveQueue.findIndex(char => char.id === characterId)
        if (charIndex !== -1) {
          const [learnedChar] = newActiveQueue.splice(charIndex, 1)
          newLearned.push(learnedChar)

          // Fill the gap with next character from remaining
          if (newRemaining.length > 0) {
            const nextChar = newRemaining.shift()!
            newActiveQueue.push(nextChar)
          }
        }
      }

      const newState = {
        activeQueue: newActiveQueue,
        learned: newLearned,
        remaining: newRemaining,
        progress: newProgress
      }

      // Always save to localStorage as backup
      saveProgress(newProgress)

      return newState
    })
  }, [saveProgress])

  // Get progress stats
  const getProgressStats = useCallback(() => {
    const total = initialCharacters.length
    const learnedCount = learnState.learned.length
    const inProgressCount = learnState.activeQueue.filter(char => 
      learnState.progress[char.id]?.status === 'IN_PROGRESS'
    ).length

    return {
      total,
      learned: learnedCount,
      inProgress: inProgressCount,
      notStarted: total - learnedCount - inProgressCount,
      percentage: Math.round((learnedCount / total) * 100)
    }
  }, [initialCharacters.length, learnState])

  // Toggle view learned characters
  const [showLearned, setShowLearned] = useState(false)

  return {
    learnState,
    updateCharacterStatus,
    getProgressStats,
    showLearned,
    setShowLearned,
    mounted,
    loading,
    refreshProgress // Export refresh function for manual refresh
  }
}