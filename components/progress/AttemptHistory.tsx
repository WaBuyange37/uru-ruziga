'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import Image from 'next/image'

interface Attempt {
  id: string
  aiScore: number | null
  feedback: string | null
  isCorrect: boolean
  timeSpent: number
  drawingData: string | null
  createdAt: string
}

interface AttemptHistoryProps {
  attempts: Attempt[]
}

export function AttemptHistory({ attempts }: AttemptHistoryProps) {
  if (attempts.length === 0) {
    return null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }

  return (
    <Card className="border-2 border-[#8B4513]">
      <CardHeader>
        <CardTitle className="text-[#8B4513]">
          Practice History ({attempts.length} attempts)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {attempts.slice().reverse().map((attempt, index) => (
            <div
              key={attempt.id}
              className={`p-4 rounded-lg border-2 ${
                attempt.isCorrect
                  ? 'bg-green-50 border-green-200'
                  : 'bg-orange-50 border-orange-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Drawing Thumbnail */}
                {attempt.drawingData && (
                  <div className="relative w-16 h-16 flex-shrink-0 bg-white rounded border border-gray-300 overflow-hidden">
                    <Image
                      src={attempt.drawingData}
                      alt={`Attempt ${attempts.length - index}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}

                {/* Attempt Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {attempt.isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-orange-600" />
                      )}
                      <span className="font-semibold text-gray-900">
                        Attempt #{attempts.length - index}
                      </span>
                    </div>
                    <span className={`text-lg font-bold ${
                      attempt.isCorrect ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {attempt.aiScore || 0}%
                    </span>
                  </div>

                  {attempt.feedback && (
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                      {attempt.feedback}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(attempt.timeSpent)}</span>
                    </div>
                    <span>{formatDate(attempt.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
