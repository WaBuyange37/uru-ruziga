import { useState, useEffect } from 'react'

interface Discussion {
  id: string
  userId: string
  title: string
  content: string
  script: string
  category?: string
  mediaUrls?: string[]
  isPinned: boolean
  views: number
  likesCount: number
  createdAt: string
  updatedAt: string
  user: {
    id: string
    fullName: string | null
    username: string | null
    avatar: string | null
    role: string
  }
  _count: {
    comments: number
  }
}

interface CreateDiscussionInput {
  title: string
  content: string
  script: 'UMWERO' | 'LATIN'
  category?: string
  mediaUrls?: string[]
}

export function useDiscussions() {
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }

  const fetchDiscussions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/discussions')
      
      if (!response.ok) {
        throw new Error('Failed to fetch discussions')
      }

      const data = await response.json()
      setDiscussions(data.discussions || [])
    } catch (err: any) {
      console.error('Fetch discussions error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDiscussions()
  }, [])

  const createDiscussion = async (input: CreateDiscussionInput): Promise<Discussion | null> => {
    const token = getToken()
    if (!token) {
      setError('Authentication required')
      return null
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/discussions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(input)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create discussion')
      }

      const data = await response.json()
      const newDiscussion = data.discussion

      setDiscussions(prev => [newDiscussion, ...prev])
      return newDiscussion
    } catch (err: any) {
      console.error('Create discussion error:', err)
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const deleteDiscussion = async (discussionId: string): Promise<boolean> => {
    const token = getToken()
    if (!token) {
      setError('Authentication required')
      return false
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/discussions/${discussionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete discussion')
      }

      setDiscussions(prev => prev.filter(d => d.id !== discussionId))
      return true
    } catch (err: any) {
      console.error('Delete discussion error:', err)
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    discussions,
    loading,
    error,
    fetchDiscussions,
    createDiscussion,
    deleteDiscussion
  }
}
