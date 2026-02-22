"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AuthDebugger() {
  const [authResult, setAuthResult] = useState<any>(null)
  const [progressResult, setProgressResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testAuth = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      console.log('Token exists:', !!token)
      console.log('Token length:', token?.length)
      
      if (!token) {
        setAuthResult({ error: 'No token in localStorage' })
        return
      }

      const response = await fetch('/api/debug/auth', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      setAuthResult({ status: response.status, data })
      console.log('Auth test result:', data)
    } catch (error) {
      setAuthResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const testProgress = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        setProgressResult({ error: 'No token in localStorage' })
        return
      }

      const response = await fetch('/api/progress/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          characterId: 'char-a',
          score: 85,
          timeSpent: 0
        })
      })

      const data = await response.json()
      setProgressResult({ status: response.status, data })
      console.log('Progress test result:', data)
    } catch (error) {
      setProgressResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mb-4">
      <CardHeader>
        <CardTitle>Auth & Progress Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testAuth} disabled={loading} size="sm">
            Test Auth
          </Button>
          <Button onClick={testProgress} disabled={loading} size="sm">
            Test Progress
          </Button>
        </div>

        {authResult && (
          <div className="p-3 bg-gray-50 rounded">
            <h4 className="font-semibold mb-2">Auth Test Result:</h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(authResult, null, 2)}
            </pre>
          </div>
        )}

        {progressResult && (
          <div className="p-3 bg-gray-50 rounded">
            <h4 className="font-semibold mb-2">Progress Test Result:</h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(progressResult, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}