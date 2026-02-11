// hooks/useLessonProgress.ts
// Custom hook for managing lesson progress with localStorage persistence

import { useState, useEffect, useCallback } from 'react'
import type { LessonProgress, LessonProgressState, GlobalProgress } from '@/types/lesson-progress'

const STORAGE_KEY = 'uruziga_lesson_progress'

export function useLessonProgress() {
  const [progressState, setProgressState] = useState<LessonProgressState>({})
  const [isLoaded, setIsLoaded] = useState(false)

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Convert date strings back to Date objects
        Object.keys(parsed).forEach(key => {
          if (parsed[key].lastAccessed) {
            parsed[key].lastAccessed = new Date(parsed[key].lastAccessed)
          }
        })
        setProgressState(parsed)
      }
    } catch (error) {
      console.error('Error loading lesson progress:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progressState))
      } catch (error) {
        console.error('Error saving lesson progress:', error)
      }
    }
  }, [progressState, isLoaded])

  // Get progress for a specific lesson
  const getLessonProgress = useCallback((lessonId: string): LessonProgress | null => {
    return progressState[lessonId] || null
  }, [progressState])

  // Update progress for a lesson
  const updateLessonProgress = useCallback((lessonId: string, updates: Partial<LessonProgress>) => {
    setProgressState(prev => ({
      ...prev,
      [lessonId]: {
        ...prev[lessonId],
        lessonId,
        completed: false,
        score: 0,
        attempts: 0,
        timeSpent: 0,
        lastAccessed: new Date(),
        ...updates,
      }
    }))
  }, [])

  // Mark lesson as completed
  const completeLess = useCallback((lessonId: string, score: number) => {
    setProgressState(prev => {
      const existing = prev[lessonId] || {
        lessonId,
        completed: false,
        score: 0,
        attempts: 0,
        timeSpent: 0,
        lastAccessed: new Date(),
      }

      return {
        ...prev,
        [lessonId]: {
          ...existing,
          completed: true,
          score: Math.max(existing.score, score),
          attempts: existing.attempts + 1,
          lastAccessed: new Date(),
        }
      }
    })
  }, [])

  // Start a lesson (mark as in progress)
  const startLesson = useCallback((lessonId: string) => {
    setProgressState(prev => ({
      ...prev,
      [lessonId]: {
        ...prev[lessonId],
        lessonId,
        completed: false,
        score: prev[lessonId]?.score || 0,
        attempts: (prev[lessonId]?.attempts || 0) + 1,
        timeSpent: prev[lessonId]?.timeSpent || 0,
        lastAccessed: new Date(),
      }
    }))
  }, [])

  // Add time spent on a lesson
  const addTimeSpent = useCallback((lessonId: string, seconds: number) => {
    setProgressState(prev => {
      const existing = prev[lessonId]
      if (!existing) return prev

      return {
        ...prev,
        [lessonId]: {
          ...existing,
          timeSpent: existing.timeSpent + seconds,
          lastAccessed: new Date(),
        }
      }
    })
  }, [])

  // Calculate global progress
  const getGlobalProgress = useCallback((totalLessons: number): GlobalProgress => {
    const lessons = Object.values(progressState)
    const completedLessons = lessons.filter(l => l.completed).length
    const inProgressLessons = lessons.filter(l => !l.completed && l.attempts > 0).length
    const totalTimeSpent = lessons.reduce((sum, l) => sum + l.timeSpent, 0)
    const averageScore = lessons.length > 0
      ? lessons.reduce((sum, l) => sum + l.score, 0) / lessons.length
      : 0

    return {
      totalLessons,
      completedLessons,
      inProgressLessons,
      percentageComplete: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      totalTimeSpent,
      averageScore: Math.round(averageScore),
    }
  }, [progressState])

  // Reset all progress (for testing)
  const resetProgress = useCallback(() => {
    setProgressState({})
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  // Check if lesson is locked based on prerequisites
  const isLessonLocked = useCallback((lessonId: string, prerequisites: string[]): boolean => {
    if (prerequisites.length === 0) return false
    
    return prerequisites.some(prereqId => {
      const prereqProgress = progressState[prereqId]
      return !prereqProgress || !prereqProgress.completed
    })
  }, [progressState])

  return {
    progressState,
    isLoaded,
    getLessonProgress,
    updateLessonProgress,
    completeLesson: completeLess,
    startLesson,
    addTimeSpent,
    getGlobalProgress,
    resetProgress,
    isLessonLocked,
  }
}
