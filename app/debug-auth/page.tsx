"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthDebugPage() {
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testRegistration = async () => {
    addResult('🔍 Testing Registration...')
    
    try {
      const testUser = {
        fullName: 'Debug Test User',
        username: `debuguser${Date.now()}`,
        email: `debug${Date.now()}@example.com`,
        password: 'debugpass123'
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testUser)
      })

      addResult(`Register Status: ${response.status}`)
      
      const text = await response.text()
      addResult(`Register Response: ${text}`)

      if (response.ok) {
        const data = JSON.parse(text)
        addResult('✅ Registration successful!')
        
        // Test login immediately
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            identifier: testUser.email,
            password: testUser.password
          })
        })

        addResult(`Login Status: ${loginResponse.status}`)
        const loginText = await loginResponse.text()
        addResult(`Login Response: ${loginText}`)

        if (loginResponse.ok) {
          addResult('✅ Login successful!')
        } else {
          addResult('❌ Login failed!')
        }
      } else {
        addResult('❌ Registration failed!')
      }

    } catch (error: any) {
      addResult(`❌ Error: ${error.message}`)
    }
  }

  const testDatabaseConnection = async () => {
    addResult('🔍 Testing Database Connection...')
    
    try {
      const response = await fetch('/api/debug/auth')
      addResult(`DB Status: ${response.status}`)
      
      const text = await response.text()
      addResult(`DB Response: ${text}`)

    } catch (error: any) {
      addResult(`❌ DB Error: ${error.message}`)
    }
  }

  const testEnvironment = async () => {
    addResult('🔍 Testing Environment...')
    
    // Test empty login request to see if API is working
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      })

      addResult(`Empty Login Status: ${response.status}`)
      
      if (response.status === 400) {
        addResult('✅ API route accessible')
      } else if (response.status === 500) {
        addResult('❌ Server error - check environment variables')
        const text = await response.text()
        addResult(`Error: ${text}`)
      }

    } catch (error: any) {
      addResult(`❌ API Error: ${error.message}`)
    }
  }

  const runAllTests = async () => {
    setLoading(true)
    setResults([])
    
    addResult('🚀 Starting Production Auth Debug...')
    
    await testEnvironment()
    await testDatabaseConnection()
    await testRegistration()
    
    addResult('✅ Debug complete!')
    setLoading(false)
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              🔍 Production Authentication Debug
            </CardTitle>
            <p className="text-center text-gray-600">
              Debug authentication issues on the live site
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={runAllTests} 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Running Tests...' : 'Run All Tests'}
              </Button>
              <Button 
                onClick={testEnvironment} 
                disabled={loading}
                variant="outline"
              >
                Test Environment
              </Button>
              <Button 
                onClick={testDatabaseConnection} 
                disabled={loading}
                variant="outline"
              >
                Test Database
              </Button>
              <Button 
                onClick={testRegistration} 
                disabled={loading}
                variant="outline"
              >
                Test Auth Flow
              </Button>
              <Button 
                onClick={clearResults} 
                variant="outline"
              >
                Clear Results
              </Button>
            </div>

            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
              {results.length === 0 ? (
                <div className="text-gray-500">Click "Run All Tests" to start debugging...</div>
              ) : (
                results.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Common Issues:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Missing environment variables in Netlify Dashboard</li>
                <li>• Incorrect DATABASE_URL or database connection issues</li>
                <li>• JWT_SECRET not set properly</li>
                <li>• Prisma client generation failed during build</li>
                <li>• API routes not deployed correctly</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}