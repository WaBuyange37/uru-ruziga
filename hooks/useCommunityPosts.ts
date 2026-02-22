import { useState, useEffect } from 'react'

interface CommunityPost {
  id: string
  userId: string
  content: string
  language: string
  latinText?: string
  umweroText?: string
  imageUrl?: string
  mediaUrls: string[]
  isChallenge: boolean
  challengeType?: string
  likesCount: number
  commentsCount: number
  views: number
  isPinned: boolean
  isPublic: boolean
  createdAt: string
  updatedAt: string
  user: {
    id: string
    fullName: string | null
    email: string
    avatar: string | null
    role: string
  }
  likes: Array<{ userId: string }>
  comments: Array<{
    id: string
    content: string
    createdAt: string
    user: {
      id: string
      fullName: string | null
      avatar: string | null
    }
  }>
}

interface CreatePostInput {
  content: string
  language?: 'en' | 'rw' | 'um'
  latinText?: string
  umweroText?: string
  mediaUrls?: string[]
  isChallenge?: boolean
  challengeType?: string
}

export function useCommunityPosts() {
  const [discussions, setDiscussions] = useState<CommunityPost[]>([])
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
      
      console.log('🔍 Fetching community posts from /api/community/posts...')
      const response = await fetch('/api/community/posts')
      
      console.log('📡 Response status:', response.status, response.statusText)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Posts fetched successfully:', {
        count: data.posts?.length || 0,
        posts: data.posts
      })
      
      setDiscussions(data.posts || [])
    } catch (err: any) {
      console.error('❌ Fetch posts error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDiscussions()
  }, [])

  const createDiscussion = async (input: CreatePostInput): Promise<CommunityPost | null> => {
    const token = getToken()
    if (!token) {
      setError('Authentication required')
      return null
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(input)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create post')
      }

      const data = await response.json()
      const newPost = data.post

      setDiscussions(prev => [newPost, ...prev])
      return newPost
    } catch (err: any) {
      console.error('Create post error:', err)
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const deleteDiscussion = async (postId: string): Promise<boolean> => {
    const token = getToken()
    if (!token) {
      setError('Authentication required')
      return false
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/community/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete post')
      }

      setDiscussions(prev => prev.filter(d => d.id !== postId))
      return true
    } catch (err: any) {
      console.error('Delete post error:', err)
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