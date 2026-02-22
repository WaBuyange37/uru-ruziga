'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface Attempt {
  id: string
  aiScore: number | null
  createdAt: string
  isCorrect: boolean
}

interface ProgressGraphProps {
  attempts: Attempt[]
  characterName: string
}

export function ProgressGraph({ attempts, characterName }: ProgressGraphProps) {
  if (attempts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          No practice history yet. Start practicing to see your progress!
        </CardContent>
      </Card>
    )
  }

  const scores = attempts.map(a => a.aiScore).filter(s => s !== null) as number[]
  const maxScore = Math.max(...scores, 100)
  const minScore = Math.min(...scores, 0)

  // Calculate trend
  const recentAvg = scores.slice(-3).reduce((a, b) => a + b, 0) / Math.min(scores.length, 3)
  const earlyAvg = scores.slice(0, 3).reduce((a, b) => a + b, 0) / Math.min(scores.length, 3)
  const trend = recentAvg - earlyAvg

  return (
    <Card className="border-2 border-[#8B4513]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-[#8B4513]">Progress for "{characterName}"</span>
          <div className="flex items-center gap-2">
            {trend > 5 && (
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm font-semibold">+{Math.round(trend)}%</span>
              </div>
            )}
            {trend < -5 && (
              <div className="flex items-center gap-1 text-orange-600">
                <TrendingDown className="h-5 w-5" />
                <span className="text-sm font-semibold">{Math.round(trend)}%</span>
              </div>
            )}
            {Math.abs(trend) <= 5 && (
              <div className="flex items-center gap-1 text-gray-600">
                <Minus className="h-5 w-5" />
                <span className="text-sm font-semibold">Stable</span>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Graph */}
        <div className="relative h-48 bg-gradient-to-b from-[#FFF8DC] to-white rounded-lg p-4 border border-[#F3E5AB]">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
            <span>100</span>
            <span>75</span>
            <span>50</span>
            <span>25</span>
            <span>0</span>
          </div>

          {/* Grid lines */}
          <div className="absolute left-8 right-4 top-4 bottom-8">
            {[0, 25, 50, 75, 100].map(value => (
              <div
                key={value}
                className="absolute left-0 right-0 border-t border-gray-200"
                style={{ bottom: `${value}%` }}
              />
            ))}

            {/* Plot points and line */}
            <svg className="w-full h-full" preserveAspectRatio="none">
              {/* Line connecting points */}
              <polyline
                points={attempts.map((attempt, index) => {
                  const x = (index / Math.max(attempts.length - 1, 1)) * 100
                  const y = 100 - ((attempt.aiScore || 0) / 100) * 100
                  return `${x},${y}`
                }).join(' ')}
                fill="none"
                stroke="#8B4513"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />

              {/* Points */}
              {attempts.map((attempt, index) => {
                const x = (index / Math.max(attempts.length - 1, 1)) * 100
                const y = 100 - ((attempt.aiScore || 0) / 100) * 100
                return (
                  <g key={attempt.id}>
                    <circle
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="4"
                      fill={attempt.isCorrect ? '#10b981' : '#f59e0b'}
                      stroke="white"
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                    />
                  </g>
                )
              })}
            </svg>
          </div>

          {/* X-axis */}
          <div className="absolute left-8 right-4 bottom-0 flex justify-between text-xs text-gray-500">
            <span>Attempt 1</span>
            <span>Attempt {attempts.length}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Passed (≥70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>Needs Practice</span>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {attempts.length}
            </div>
            <div className="text-xs text-blue-800">Total Attempts</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {scores[scores.length - 1] || 0}%
            </div>
            <div className="text-xs text-green-800">Latest Score</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {Math.max(...scores, 0)}%
            </div>
            <div className="text-xs text-purple-800">Best Score</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
