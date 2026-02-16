"use client"

import { useState } from "react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { Heart, MessageCircle, Trash2, Loader2, Send } from "lucide-react"
import { showToast } from "../ui/toast"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"

interface FeedPostCardProps {
  post: any
  currentUserId: string
  onDelete: (postId: string) => void
  onLikeToggle: (postId: string, liked: boolean) => void
  onCommentAdded: (postId: string, comment: any) => void
}

export default function FeedPostCard({
  post,
  currentUserId,
  onDelete,
  onLikeToggle,
  onCommentAdded,
}: FeedPostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [liking, setLiking] = useState(false)

  const isLiked = post.likes.some((like: any) => like.userId === currentUserId)
  const isOwner = post.userId === currentUserId
  const canDelete = isOwner // Add admin check if needed

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }

  const handleLike = async () => {
    if (liking) return

    setLiking(true)
    
    // Optimistic update
    onLikeToggle(post.id, !isLiked)

    try {
      const token = getToken()
      if (!token) {
        showToast('Please login to like posts', 'error')
        // Revert optimistic update
        onLikeToggle(post.id, isLiked)
        return
      }

      const response = await fetch(`/api/community/posts/${post.id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to toggle like')
      }

      const data = await response.json()
      
      // Update with server response
      if (data.liked !== !isLiked) {
        onLikeToggle(post.id, data.liked)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      // Revert optimistic update
      onLikeToggle(post.id, isLiked)
      showToast('Failed to update like', 'error')
    } finally {
      setLiking(false)
    }
  }

  const handleComment = async () => {
    if (!commentText.trim() || submittingComment) return

    setSubmittingComment(true)

    try {
      const token = getToken()
      if (!token) {
        showToast('Please login to comment', 'error')
        return
      }

      const response = await fetch(`/api/community/posts/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: commentText.trim(),
          language: 'en',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add comment')
      }

      const data = await response.json()
      
      // Add comment to list
      onCommentAdded(post.id, data.comment)
      
      // Reset form
      setCommentText('')
      showToast('Comment added!', 'success')
    } catch (error) {
      console.error('Error adding comment:', error)
      showToast('Failed to add comment', 'error')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return

    setDeleting(true)

    try {
      const token = getToken()
      if (!token) {
        showToast('Please login', 'error')
        return
      }

      const response = await fetch(`/api/community/posts/${post.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete post')
      }

      onDelete(post.id)
    } catch (error) {
      console.error('Error deleting post:', error)
      showToast('Failed to delete post', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card className="border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* User Avatar */}
            <div className="h-10 w-10 rounded-full bg-[#8B4513] flex items-center justify-center text-white font-semibold flex-shrink-0">
              {post.user.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>

            {/* User Info */}
            <div>
              <p className="font-semibold text-neutral-900">
                {post.user.fullName || 'Anonymous'}
              </p>
              <p className="text-sm text-neutral-500">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Delete Button */}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Post Content */}
        <div className="mb-3">
          <p className="text-neutral-800 whitespace-pre-wrap break-words">
            {post.content}
          </p>
        </div>

        {/* Post Image */}
        {post.imageUrl && (
          <div className="mb-3 rounded-lg overflow-hidden border">
            <Image
              src={post.imageUrl}
              alt="Post image"
              width={600}
              height={400}
              className="w-full h-auto max-h-96 object-cover"
            />
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center gap-4 py-2 border-t border-b">
          {/* Like Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={liking}
            className={`gap-2 ${isLiked ? 'text-red-600' : 'text-neutral-600'} hover:text-red-600`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="font-medium">{post.likesCount}</span>
          </Button>

          {/* Comment Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="gap-2 text-neutral-600 hover:text-[#8B4513]"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="font-medium">{post.commentsCount}</span>
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 space-y-4">
            {/* Comment Input */}
            <div className="flex gap-2">
              <Textarea
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-[60px] resize-none text-sm"
                disabled={submittingComment}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleComment()
                  }
                }}
              />
              <Button
                onClick={handleComment}
                disabled={!commentText.trim() || submittingComment}
                size="sm"
                className="bg-[#8B4513] hover:bg-[#A0522D] self-end"
              >
                {submittingComment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Comments List */}
            {post.comments.length > 0 && (
              <div className="space-y-3">
                {post.comments.map((comment: any) => (
                  <div key={comment.id} className="flex gap-2">
                    <div className="h-8 w-8 rounded-full bg-[#8B4513] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {comment.user.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 bg-neutral-100 rounded-lg p-3">
                      <p className="font-semibold text-sm text-neutral-900">
                        {comment.user.fullName || 'Anonymous'}
                      </p>
                      <p className="text-sm text-neutral-700 mt-1">
                        {comment.content}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {post.comments.length === 0 && (
              <p className="text-sm text-neutral-500 text-center py-4">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
