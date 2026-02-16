"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "../../app/contexts/AuthContext"
import { showToast } from "../ui/toast"
import CreatePostCard from "./CreatePostCard"
import FeedPostCard from "./FeedPostCard"
import { Loader2 } from "lucide-react"

interface Post {
  id: string
  userId: string
  content: string
  imageUrl: string | null
  isPinned: boolean
  views: number
  likesCount: number
  commentsCount: number
  createdAt: string
  updatedAt: string
  user: {
    id: string
    fullName: string
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
      fullName: string
      avatar: string | null
    }
  }>
}

export default function GlobalFeed() {
  const { user, isAuthenticated } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }

  const fetchPosts = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const response = await fetch(`/api/community/posts?page=${pageNum}&limit=10`, {
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }

      const data = await response.json()
      
      if (append) {
        setPosts(prev => [...prev, ...data.posts])
      } else {
        setPosts(data.posts)
      }

      setHasMore(data.pagination.page < data.pagination.totalPages)
    } catch (error) {
      console.error('Error fetching posts:', error)
      showToast('Failed to load posts', 'error')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts(1, false)
  }, [fetchPosts])

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          setPage(prev => prev + 1)
          fetchPosts(page + 1, true)
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasMore, loadingMore, loading, page, fetchPosts])

  const handlePostCreated = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev])
    showToast('Post created successfully!', 'success')
  }

  const handlePostDeleted = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId))
    showToast('Post deleted', 'success')
  }

  const handleLikeToggle = (postId: string, liked: boolean) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likesCount: liked ? post.likesCount + 1 : post.likesCount - 1,
          likes: liked 
            ? [...post.likes, { userId: user!.id }]
            : post.likes.filter(l => l.userId !== user!.id)
        }
      }
      return post
    }))
  }

  const handleCommentAdded = (postId: string, comment: any) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          commentsCount: post.commentsCount + 1,
          comments: [comment, ...post.comments]
        }
      }
      return post
    }))
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600">Please login to view the feed</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Create Post Card - Sticky */}
      <div className="sticky top-16 z-10 bg-neutral-50 pb-4">
        <CreatePostCard onPostCreated={handlePostCreated} />
      </div>

      {/* Loading State */}
      {loading && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#8B4513] mb-2" />
          <p className="text-neutral-600">Loading posts...</p>
        </div>
      )}

      {/* Posts Feed */}
      {posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((post) => (
            <FeedPostCard
              key={post.id}
              post={post}
              currentUserId={user!.id}
              onDelete={handlePostDeleted}
              onLikeToggle={handleLikeToggle}
              onCommentAdded={handleCommentAdded}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-neutral-600 mb-2">No posts yet</p>
          <p className="text-sm text-neutral-500">Be the first to share something!</p>
        </div>
      )}

      {/* Loading More Indicator */}
      {loadingMore && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-[#8B4513]" />
        </div>
      )}

      {/* Intersection Observer Target */}
      <div ref={observerTarget} className="h-4" />

      {/* End of Feed */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-4 text-sm text-neutral-500">
          You've reached the end
        </div>
      )}
    </div>
  )
}
