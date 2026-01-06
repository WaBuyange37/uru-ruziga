import { useState } from 'react'

interface SaveProgressOptions {
  lessonId: string
  completed?: boolean
  score?: number
}

export function useLessonProgress() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const saveProgress = async ({ lessonId, completed, score }: SaveProgressOptions) => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication required. Please log in.')
      }

      const response = await fetch(`/api/lessons/${lessonId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          completed,
          score,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save progress')
      }

      return data.progress
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save progress'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getProgress = async (lessonId: string) => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication required. Please log in.')
      }

      const response = await fetch(`/api/lessons/${lessonId}/progress`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch progress')
      }

      return data.progress
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch progress'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    saveProgress,
    getProgress,
    loading,
    error,
  }
}

