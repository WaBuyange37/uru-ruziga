// hooks/useProgressSummary.ts
"use client"

import { useState, useEffect, useCallback } from 'react'
import { progressEvents } from '@/lib/progress-events'

interface ProgressSummary {
  vowels: { learned: number; total: number }
  consonants: { learned: number; total: number }
  ligatures: { learned: number; total: number }
  overall: { learned: number; total: number; percentage: number }
}

export function useProgressSummary() {
  const [summary, setSummary] = useState<ProgressSummary>({
    vowels: { learned: 0, total: 0 },
    consonants: { learned: 0, total: 0 },
    ligatures: { learned: 0, total: 0 },
    overall: { learned: 0, total: 0, percentage: 0 }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSummary = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Not authenticated')
        setLoading(false)
        return
      }

      const response = await fetch('/api/progress/summary', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch progress: ${response.status}`)
      }

      const data = await response.json()
      setSummary(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching progress summary:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  // Listen for progress updates
  useEffect(() => {
    const unsubscribe = progressEvents.subscribe(() => {
      // Refresh summary when any character progress changes
      fetchSummary()
    })

    return unsubscribe
  }, [fetchSummary])

  // Listen for focus/visibility changes
  useEffect(() => {
    const handleFocus = () => fetchSummary()
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchSummary()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchSummary])

  return {
    summary,
    loading,
    error,
    refresh: fetchSummary
  }
}