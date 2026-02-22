"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  Target, 
  BookOpen, 
  CheckCircle2, 
  Clock,
  BarChart3,
  Zap,
  Trophy,
  RefreshCw,
  Activity
} from 'lucide-react'
import { progressEvents } from '@/lib/progress-events'

interface ProgressData {
  characterId: string
  status: string
  score: number
  attempts: number
  character: {
    latinEquivalent: string
    type: string
  }
}

interface ProgressSummary {
  vowels: { learned: number; total: number }
  consonants: { learned: number; total: number }
  ligatures: { learned: number; total: number }
  overall: { learned: number; total: number; percentage: number }
}

interface ProgressStats {
  totalLearned: number
  inProgress: number
  totalRecords: number
  averageScore: number
  perfectScores: number
  recentActivity: number
}

export function ProgressTracker() {
  const [progress, setProgress] = useState<ProgressData[]>([])
  const [summary, setSummary] = useState<ProgressSummary | null>(null)
  const [stats, setStats] = useState<ProgressStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchProgress = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Authentication required')
        return
      }

      // Fetch detailed progress
      const progressResponse = await fetch('/api/character-progress', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!progressResponse.ok) {
        throw new Error(`Progress API error: ${progressResponse.status}`)
      }

      const progressData = await progressResponse.json()
      const progressArray = progressData.progress || []
      setProgress(progressArray)

      // Calculate stats
      const learned = progressArray.filter((p: ProgressData) => p.status === 'LEARNED')
      const inProgress = progressArray.filter((p: ProgressData) => p.status === 'IN_PROGRESS')
      const perfectScores = progressArray.filter((p: ProgressData) => p.score >= 90)
      const averageScore = progressArray.length > 0 
        ? Math.round(progressArray.reduce((sum: number, p: ProgressData) => sum + p.score, 0) / progressArray.length)
        : 0

      setStats({
        totalLearned: learned.length,
        inProgress: inProgress.length,
        totalRecords: progressArray.length,
        averageScore,
        perfectScores: perfectScores.length,
        recentActivity: progressArray.filter((p: ProgressData) => p.attempts > 0).length
      })

      // Fetch summary
      const summaryResponse = await fetch('/api/progress/summary', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json()
        setSummary(summaryData)
      }

      setLastUpdate(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load progress')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProgress()
    
    // Listen for progress updates
    const unsubscribe = progressEvents.subscribe(() => {
      fetchProgress()
    })

    return unsubscribe
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LEARNED': return 'bg-green-100 text-green-800 border-green-200'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-[#F3E5AB] to-[#FAEBD7] border-[#8B4513]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#8B4513] flex items-center gap-2 text-xl">
                <BarChart3 className="h-6 w-6" />
                Progress Tracker
              </CardTitle>
              <p className="text-[#D2691E] text-sm mt-1">
                Real-time learning progress and character mastery
              </p>
            </div>
            <div className="flex items-center gap-2">
              {lastUpdate && (
                <Badge variant="outline" className="text-xs bg-white/80">
                  Updated: {lastUpdate.toLocaleTimeString()}
                </Badge>
              )}
              <Button 
                onClick={fetchProgress} 
                disabled={loading} 
                size="sm"
                variant="outline"
                className="border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800 text-sm">⚠️ {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {summary && (
        <Card className="bg-white/90 backdrop-blur border-[#8B4513]">
          <CardHeader>
            <CardTitle className="text-[#8B4513] flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Learning Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">
                  {summary.vowels.learned}/{summary.vowels.total}
                </div>
                <div className="text-sm text-green-700 font-medium">Vowels</div>
                <Progress 
                  value={(summary.vowels.learned / summary.vowels.total) * 100} 
                  className="h-2 mt-2" 
                />
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">
                  {summary.consonants.learned}/{summary.consonants.total}
                </div>
                <div className="text-sm text-blue-700 font-medium">Consonants</div>
                <Progress 
                  value={(summary.consonants.learned / summary.consonants.total) * 100} 
                  className="h-2 mt-2" 
                />
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">
                  {summary.ligatures.learned}/{summary.ligatures.total}
                </div>
                <div className="text-sm text-purple-700 font-medium">Ligatures</div>
                <Progress 
                  value={(summary.ligatures.learned / summary.ligatures.total) * 100} 
                  className="h-2 mt-2" 
                />
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-600">
                  {summary.overall.learned}/{summary.overall.total}
                </div>
                <div className="text-sm text-orange-700 font-medium">
                  Overall ({summary.overall.percentage}%)
                </div>
                <Progress 
                  value={summary.overall.percentage} 
                  className="h-2 mt-2" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{stats.totalLearned}</div>
              <div className="text-xs text-green-700">Learned</div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              <div className="text-xs text-blue-700">In Progress</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4 text-center">
              <BookOpen className="h-6 w-6 text-gray-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-600">{stats.totalRecords}</div>
              <div className="text-xs text-gray-700">Total Records</div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">{stats.averageScore}%</div>
              <div className="text-xs text-yellow-700">Avg Score</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <Zap className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{stats.perfectScores}</div>
              <div className="text-xs text-purple-700">Perfect (90%+)</div>
            </CardContent>
          </Card>
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4 text-center">
              <Activity className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">{stats.recentActivity}</div>
              <div className="text-xs text-orange-700">Active</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Progress List */}
      <Card className="bg-white/90 backdrop-blur border-[#8B4513]">
        <CardHeader>
          <CardTitle className="text-[#8B4513] flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Character Progress ({progress.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {progress.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {progress
                .sort((a, b) => {
                  // Sort by status (LEARNED first), then by score
                  if (a.status !== b.status) {
                    return a.status === 'LEARNED' ? -1 : 1
                  }
                  return b.score - a.score
                })
                .map((p) => (
                <div 
                  key={p.characterId} 
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-[#F3E5AB]/20 to-white rounded-lg border border-[#8B4513]/20 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-umwero text-[#8B4513]">
                      {p.character.latinEquivalent}
                    </div>
                    <div>
                      <div className="font-medium text-[#8B4513]">
                        {p.character.latinEquivalent}
                      </div>
                      <div className="text-sm text-[#D2691E]">
                        {p.character.type} • {p.attempts} attempt{p.attempts !== 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {p.characterId}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(p.status)}>
                      {p.status.replace('_', ' ')}
                    </Badge>
                    <div className={`text-lg font-bold ${getScoreColor(p.score)}`}>
                      {p.score}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-[#8B4513] mb-2">No Progress Data</h3>
              <p className="text-[#D2691E] mb-4">
                Start practicing to see your character progress here
              </p>
              <Button 
                onClick={() => window.location.href = '/learn'} 
                className="bg-[#8B4513] hover:bg-[#A0522D]"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Start Learning
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}