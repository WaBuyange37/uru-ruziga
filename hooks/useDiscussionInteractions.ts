// hooks/useDiscussionInteractions.ts
// Hook for managing discussion likes and comments
import { useState } from 'react'

interface Comment {
  id: string
  userId: string
  discussionId: string
  content: string
  script: string
  createdAt: string
  user: {
    id: string
    fullName: string
    username: string
    avatar?: string
  }
}

export function useDiscussionInteractions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }

  // Toggle like on a discussion
  const toggleLike = async (discussionId: string): Promise<{ liked: boolean; likesCount: number } | null> => {
    const token = getToken()
    if (!token) {
      setError('Please login to like discussions')
      return null
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/discussions/${discussionId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to toggle like')
      }

      const data = await response.json()
      return {
        liked: data.liked,
        likesCount: data.likesCount
      }
    } catch (err: any) {
      console.error('Toggle like error:', err)
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Check if user liked a discussion
  const checkLiked = async (discussionId: string): Promise<boolean> => {
    const token = getToken()
    if (!token) return false

    try {
      const response = await fetch(`/api/discussions/${discussionId}/like`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) return false

      const data = await response.json()
      return data.liked
    } catch (err) {
      console.error('Check liked error:', err)
      return false
    }
  }

  // Add a comment to a discussion
  const addComment = async (
    discussionId: string,
    content: string,
    script: 'LATIN' | 'UMWERO' = 'LATIN'
  ): Promise<Comment | null> => {
    const token = getToken()
    if (!token) {
      setError('Please login to comment')
      return null
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/discussions/${discussionId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content, script: script.toLowerCase() })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add comment')
      }

      const data = await response.json()
      return data.comment
    } catch (err: any) {
      console.error('Add comment error:', err)
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Fetch comments for a discussion
  const fetchComments = async (discussionId: string): Promise<Comment[]> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/discussions/${discussionId}/comments`)

      if (!response.ok) {
        throw new Error('Failed to fetch comments')
      }

      const data = await response.json()
      return data.comments || []
    } catch (err: any) {
      console.error('Fetch comments error:', err)
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  return {
    toggleLike,
    checkLiked,
    addComment,
    fetchComments,
    loading,
    error
  }
}
