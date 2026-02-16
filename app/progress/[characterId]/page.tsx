'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { ProgressGraph } from '@/components/progress/ProgressGraph'
import { AttemptHistory } from '@/components/progress/AttemptHistory'

interface Attempt {
  id: string
  aiScore: number | null
  aiMetrics: any
  feedback: string | null
  isCorrect: boolean
  timeSpent: number
  drawingData: string | null
  createdAt: string
}

interface Stats {
  totalAttempts: number
  averageScore: number
  bestScore: number
  latestScore: number
  improvement: number
  passRate: number
  totalTimeSpent: number
  trend: number
}

export default function CharacterProgressPage() {
  const params = useParams()
  const router = useRouter()
  const characterId = params.characterId as string

  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProgress()
  }, [characterId])

  const loadProgress = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch(
        `/api/progress/character-history?characterId=${characterId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to load progress')
      }

      const data = await response.json()
      setAttempts(data.attempts)
      setStats(data.stats)
    } catch (err) {
      console.error('Error loading progress:', err)
      setError('Failed to load progress data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF8DC] via-[#FFFFFF] to-[#F3E5AB]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#8B4513] mx-auto mb-4"></div>
          <p className="text-[#8B4513] text-lg">Loading progress...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF8DC] via-[#FFFFFF] to-[#F3E5AB]">
        <div className="text-center max-w-md">
          <p className="text-red-600 text-xl mb-4">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8DC] via-[#FFFFFF] to-[#F3E5AB]">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 text-[#8B4513] hover:bg-[#F3E5AB]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lessons
          </Button>

          <h1 className="text-4xl font-bold text-[#8B4513] mb-2">
            Your Progress
          </h1>
          <p className="text-[#D2691E]">
            Track your improvement over time
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg border-2 border-[#8B4513] p-4 text-center">
              <div className="text-3xl font-bold text-[#8B4513]">
                {stats.totalAttempts}
              </div>
              <div className="text-sm text-gray-600">Total Attempts</div>
            </div>
            <div className="bg-white rounded-lg border-2 border-[#8B4513] p-4 text-center">
              <div className="text-3xl font-bold text-green-600">
                {stats.averageScore}%
              </div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
            <div className="bg-white rounded-lg border-2 border-[#8B4513] p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">
                {stats.bestScore}%
              </div>
              <div className="text-sm text-gray-600">Best Score</div>
            </div>
            <div className="bg-white rounded-lg border-2 border-[#8B4513] p-4 text-center">
              <div className={`text-3xl font-bold ${
                stats.improvement >= 0 ? 'text-green-600' : 'text-orange-600'
              }`}>
                {stats.improvement >= 0 ? '+' : ''}{stats.improvement}%
              </div>
              <div className="text-sm text-gray-600">Improvement</div>
            </div>
          </div>
        )}

        {/* Progress Graph */}
        <div className="mb-8">
          <ProgressGraph
            attempts={attempts}
            characterName={characterId}
          />
        </div>

        {/* Attempt History */}
        <AttemptHistory attempts={attempts} />

        {/* Motivational Message */}
        {stats && stats.trend > 0 && (
          <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              You're Improving!
            </h3>
            <p className="text-green-700">
              Your recent attempts are {Math.round(stats.trend)}% better than your early ones. 
              Keep practicing to master this character!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
