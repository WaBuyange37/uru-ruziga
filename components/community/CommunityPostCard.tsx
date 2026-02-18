'use client'

import { useState } from 'react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Heart, MessageCircle, Share2, MoreHorizontal, Eye } from 'lucide-react'
import Image from 'next/image'

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

interface CommunityPostCardProps {
  post: CommunityPost
}

export function CommunityPostCard({ post }: CommunityPostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [liked, setLiked] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const handleLike = async () => {
    // TODO: Implement like functionality
    setLiked(!liked)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.user.fullName}`,
          text: post.content,
          url: window.location.href
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case 'en': return 'English'
      case 'rw': return 'Kinyarwanda'
      case 'um': return 'Umwero'
      default: return 'Unknown'
    }
  }

  const isImage = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
  }

  const isVideo = (url: string) => {
    return /\.(mp4|webm|mov)$/i.test(url)
  }

  return (
    <Card className="border-b border-gray-200 rounded-none shadow-none hover:bg-gray-50/50 transition-colors">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B4513] to-[#D2691E] flex items-center justify-center text-white font-semibold">
              {post.user.fullName?.charAt(0) || post.user.email.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">
                  {post.user.fullName || post.user.email}
                </h3>
                {post.user.role === 'ADMIN' && (
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                    Admin
                  </span>
                )}
                {post.user.role === 'TEACHER' && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                    Teacher
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{formatDate(post.createdAt)}</span>
                <span>•</span>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                  {getLanguageLabel(post.language)}
                </span>
                {post.isPinned && (
                  <>
                    <span>•</span>
                    <span className="text-blue-600 font-medium">Pinned</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p 
            className={`text-gray-900 leading-relaxed ${
              post.language === 'um' ? 'font-umwero text-xl' : ''
            }`}
            style={post.language === 'um' ? { fontFamily: 'Umwero, monospace' } : {}}
          >
            {post.content}
          </p>

          {/* Translations */}
          {post.latinText && post.language === 'um' && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-200">
              <p className="text-sm text-blue-700 font-medium mb-1">Latin Translation:</p>
              <p className="text-blue-800">{post.latinText}</p>
            </div>
          )}

          {post.umweroText && post.language === 'rw' && (
            <div className="mt-3 p-3 bg-amber-50 rounded-lg border-l-4 border-amber-200">
              <p className="text-sm text-amber-700 font-medium mb-1">Umwero Translation:</p>
              <p 
                className="text-amber-800 font-umwero text-lg"
                style={{ fontFamily: 'Umwero, monospace' }}
              >
                {post.umweroText}
              </p>
            </div>
          )}
        </div>

        {/* Media */}
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div className="mb-4">
            {post.mediaUrls.length === 1 ? (
              <div className="rounded-lg overflow-hidden border border-gray-200">
                {isImage(post.mediaUrls[0]) ? (
                  <Image
                    src={post.mediaUrls[0]}
                    alt="Post media"
                    width={600}
                    height={400}
                    className="w-full h-auto max-h-96 object-cover"
                  />
                ) : isVideo(post.mediaUrls[0]) ? (
                  <video
                    src={post.mediaUrls[0]}
                    controls
                    className="w-full h-auto max-h-96"
                  />
                ) : (
                  <div className="p-4 bg-gray-100 text-center">
                    <p className="text-gray-600">Media file</p>
                  </div>
                )}
              </div>
            ) : (
              <div className={`grid gap-2 ${
                post.mediaUrls.length === 2 ? 'grid-cols-2' : 
                post.mediaUrls.length === 3 ? 'grid-cols-3' : 
                'grid-cols-2'
              }`}>
                {post.mediaUrls.slice(0, 4).map((url, index) => (
                  <div key={index} className="relative rounded-lg overflow-hidden border border-gray-200">
                    {isImage(url) ? (
                      <Image
                        src={url}
                        alt={`Post media ${index + 1}`}
                        width={300}
                        height={200}
                        className="w-full h-32 object-cover"
                      />
                    ) : isVideo(url) ? (
                      <video
                        src={url}
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                        <p className="text-gray-600 text-sm">Media</p>
                      </div>
                    )}
                    {index === 3 && post.mediaUrls.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-semibold">
                          +{post.mediaUrls.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Legacy single image support */}
        {post.imageUrl && (!post.mediaUrls || post.mediaUrls.length === 0) && (
          <div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
            <Image
              src={post.imageUrl}
              alt="Post image"
              width={600}
              height={400}
              className="w-full h-auto max-h-96 object-cover"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`gap-2 ${liked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500`}
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
              <span>{post.likesCount}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="gap-2 text-gray-500 hover:text-blue-500"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{post.commentsCount}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="gap-2 text-gray-500 hover:text-green-500"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
          </div>

          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Eye className="h-4 w-4" />
            <span>{post.views}</span>
          </div>
        </div>

        {/* Comments */}
        {showComments && post.comments.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="space-y-3">
              {post.comments.slice(0, 3).map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-sm font-semibold">
                    {comment.user.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <p className="font-semibold text-sm text-gray-900">
                        {comment.user.fullName || 'User'}
                      </p>
                      <p className="text-gray-800 text-sm">{comment.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              {post.commentsCount > 3 && (
                <Button variant="ghost" size="sm" className="text-blue-600">
                  View all {post.commentsCount} comments
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}