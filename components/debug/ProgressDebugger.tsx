"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

export function ProgressDebugger() {
  const [progress, setProgress] = useState<ProgressData[]>([])
  const [summary, setSummary] = useState<ProgressSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchProgress = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('No auth token found')
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
      setProgress(progressData.progress || [])

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
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProgress()
    
    // Listen for progress updates
    const unsubscribe = progressEvents.subscribe(() => {
      console.log('🔄 Progress event received, refreshing debugger...')
      fetchProgress()
    })

    return unsubscribe
  }, [])

  const learnedCount = progress.filter(p => p.status === 'LEARNED').length
  const inProgressCount = progress.filter(p => p.status === 'IN_PROGRESS').length
  const totalCount = progress.length

  return (
    <Card className="w-full max-w-4xl mx-auto mb-6 border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-blue-800">
          🔍 Progress Debugger
          <div className="flex items-center gap-2">
            {lastUpdate && (
              <Badge variant="outline" className="text-xs">
                Updated: {lastUpdate.toLocaleTimeString()}
              </Badge>
            )}
            <Button onClick={fetchProgress} disabled={loading} size="sm">
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}
        
        {/* Summary Section */}
        {summary && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">Progress Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {summary.vowels.learned}/{summary.vowels.total}
                </div>
                <div className="text-sm text-gray-600">Vowels</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {summary.consonants.learned}/{summary.consonants.total}
                </div>
                <div className="text-sm text-gray-600">Consonants</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {summary.ligatures.learned}/{summary.ligatures.total}
                </div>
                <div className="text-sm text-gray-600">Ligatures</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {summary.overall.learned}/{summary.overall.total}
                </div>
                <div className="text-sm text-gray-600">Overall ({summary.overall.percentage}%)</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Detailed Progress */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{learnedCount}</div>
            <div className="text-sm text-gray-600">Learned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{inProgressCount}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{totalCount}</div>
            <div className="text-sm text-gray-600">Total Records</div>
          </div>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {progress.map((p) => (
            <div key={p.characterId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
              <div>
                <span className="font-medium text-lg">{p.character.latinEquivalent}</span>
                <span className="text-sm text-gray-500 ml-2">({p.character.type})</span>
                <span className="text-xs text-gray-400 ml-2">{p.characterId}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={
                  p.status === 'LEARNED' ? 'bg-green-100 text-green-800' :
                  p.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }>
                  {p.status}
                </Badge>
                <span className="text-sm font-medium text-gray-700">{p.score}%</span>
                <span className="text-xs text-gray-500">({p.attempts} attempts)</span>
              </div>
            </div>
          ))}
        </div>
        
        {progress.length === 0 && !loading && !error && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">No progress data found</p>
            <p className="text-xs text-gray-400">This could mean the user hasn't started any lessons yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}