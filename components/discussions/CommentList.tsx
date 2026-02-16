// components/discussions/CommentList.tsx
"use client"

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

interface CommentListProps {
  comments: Comment[]
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic py-4 text-center">
        No comments yet. Be the first to comment!
      </p>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#8B4513] to-[#D2691E] flex items-center justify-center text-white text-xs font-bold">
              {(comment.user.fullName || comment.user.username || 'A').charAt(0).toUpperCase()}
            </div>
          </div>
          
          <div className="flex-1 min-w-0 bg-gray-50 rounded-2xl px-3 py-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-gray-900">
                {comment.user.fullName || comment.user.username}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(comment.createdAt)}
              </span>
              {comment.script === 'umwero' && (
                <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                  ⵓⵎⵡⴻⵔⵓ
                </span>
              )}
            </div>
            
            <p
              className={`text-sm text-gray-900 break-words ${
                comment.script === 'umwero' ? 'font-umwero text-lg leading-relaxed' : ''
              }`}
              style={comment.script === 'umwero' ? { fontFamily: 'Umwero, monospace' } : {}}
            >
              {comment.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
