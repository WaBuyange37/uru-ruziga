// components/discussions/DiscussionCard.tsx
"use client"

import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Heart, MessageCircle, Eye, MoreHorizontal } from 'lucide-react'
import { useDiscussionInteractions } from '../../hooks/useDiscussionInteractions'
import { CommentList } from './CommentList'
import { CommentForm } from './CommentForm'
import { useAuth } from '../../app/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface Discussion {
  id: string
  userId: string
  title: string
  content: string
  script: string
  category?: string
  mediaUrls?: string[]
  createdAt: string
  user: {
    id: string
    fullName: string | null
    username: string | null
    avatar?: string | null
  }
  _count?: {
    comments: number
  }
  views: number
  likesCount: number
}

interface Comment {
  id: string
  userId: string
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

interface DiscussionCardProps {
  discussion: Discussion
}

export function DiscussionCard({ discussion }: DiscussionCardProps) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { toggleLike, checkLiked, addComment, fetchComments, loading } = useDiscussionInteractions()
  
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(discussion.likesCount)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentsCount, setCommentsCount] = useState(discussion._count?.comments || 0)
  const [loadingComments, setLoadingComments] = useState(false)

  // Check if user liked this discussion
  useEffect(() => {
    if (isAuthenticated) {
      checkLiked(discussion.id).then(setLiked)
    }
  }, [discussion.id, isAuthenticated])

  // Load comments when expanded
  useEffect(() => {
    if (showComments && comments.length === 0) {
      loadComments()
    }
  }, [showComments])

  const loadComments = async () => {
    setLoadingComments(true)
    const fetchedComments = await fetchComments(discussion.id)
    setComments(fetchedComments)
    setCommentsCount(fetchedComments.length)
    setLoadingComments(false)
  }

  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    const result = await toggleLike(discussion.id)
    if (result) {
      setLiked(result.liked)
      setLikesCount(result.likesCount)
    }
  }

  const handleAddComment = async (content: string, script: 'LATIN' | 'UMWERO') => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    const newComment = await addComment(discussion.id, content, script)
    if (newComment) {
      setComments([...comments, newComment])
      setCommentsCount(commentsCount + 1)
    }
  }

  const handleToggleComments = () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    setShowComments(!showComments)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <article className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors cursor-pointer">
      <div className="flex gap-3 p-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#8B4513] to-[#D2691E] flex items-center justify-center text-white font-bold text-lg shadow-sm">
            {(discussion.user.fullName || discussion.user.username || 'A').charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-gray-900 hover:underline">
              {discussion.user.fullName || discussion.user.username}
            </span>
            <span className="text-gray-500 text-sm">
              @{discussion.user.username || 'user'}
            </span>
            <span className="text-gray-500 text-sm">·</span>
            <span className="text-gray-500 text-sm hover:underline">
              {formatDate(discussion.createdAt)}
            </span>
            {discussion.script === 'umwero' && (
              <>
                <span className="text-gray-500 text-sm">·</span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                  ⵓⵎⵡⴻⵔⵓ
                </span>
              </>
            )}
          </div>

          {/* Title */}
          {discussion.title && (
            <h3 className="font-semibold text-gray-900 mb-1 text-base">
              {discussion.title}
            </h3>
          )}

          {/* Content */}
          <div 
            className={`text-gray-900 mb-2 whitespace-pre-wrap break-words ${
              discussion.script === 'umwero' ? 'font-umwero text-xl leading-relaxed' : 'text-[15px] leading-normal'
            }`}
            style={discussion.script === 'umwero' ? { fontFamily: 'Umwero, monospace' } : {}}
          >
            {discussion.content}
          </div>

          {/* Media Gallery */}
          {discussion.mediaUrls && discussion.mediaUrls.length > 0 && (
            <div className={`mt-3 rounded-2xl overflow-hidden border border-gray-200 ${
              discussion.mediaUrls.length === 1 ? '' : 
              discussion.mediaUrls.length === 2 ? 'grid grid-cols-2 gap-0.5' :
              discussion.mediaUrls.length === 3 ? 'grid grid-cols-2 gap-0.5' :
              'grid grid-cols-2 gap-0.5'
            }`}>
              {discussion.mediaUrls.slice(0, 4).map((url, index) => {
                const isVideo = url.includes('.mp4') || url.includes('.webm') || url.includes('.mov')
                
                return (
                  <div 
                    key={index} 
                    className={`relative ${
                      discussion.mediaUrls.length === 3 && index === 0 ? 'col-span-2' : ''
                    }`}
                  >
                    {isVideo ? (
                      <video
                        src={url}
                        controls
                        className="w-full h-auto max-h-96 object-cover bg-black"
                      />
                    ) : (
                      <img
                        src={url}
                        alt={`Media ${index + 1}`}
                        className="w-full h-auto max-h-96 object-cover"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Category Tag */}
          {discussion.category && (
            <div className="mb-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F3E5AB] text-[#8B4513] border border-[#8B4513]/20">
                #{discussion.category}
              </span>
            </div>
          )}

          {/* Action Buttons - Twitter Style */}
          <div className="flex items-center justify-between max-w-md mt-3">
            {/* Comment */}
            <button
              onClick={handleToggleComments}
              className="group flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors"
            >
              <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                <MessageCircle className="h-[18px] w-[18px]" />
              </div>
              <span className="text-sm font-medium">{commentsCount}</span>
            </button>

            {/* Like */}
            <button
              onClick={handleLike}
              disabled={loading}
              className={`group flex items-center gap-1.5 transition-colors ${
                liked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
              }`}
            >
              <div className={`p-2 rounded-full transition-colors ${
                liked ? 'bg-red-50' : 'group-hover:bg-red-50'
              }`}>
                <Heart className={`h-[18px] w-[18px] ${liked ? 'fill-current' : ''}`} />
              </div>
              <span className="text-sm font-medium">{likesCount}</span>
            </button>

            {/* Views */}
            <div className="flex items-center gap-1.5 text-gray-500">
              <div className="p-2 rounded-full">
                <Eye className="h-[18px] w-[18px]" />
              </div>
              <span className="text-sm font-medium">{discussion.views}</span>
            </div>

            {/* More Options */}
            <button className="group p-2 rounded-full hover:bg-blue-50 text-gray-500 hover:text-blue-500 transition-colors">
              <MoreHorizontal className="h-[18px] w-[18px]" />
            </button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              {loadingComments ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B4513]"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <CommentList comments={comments} />
                  
                  {isAuthenticated && (
                    <div className="pt-4 border-t border-gray-100">
                      <CommentForm onSubmit={handleAddComment} loading={loading} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
