"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import { CircleIcon, LogIn, Eye, EyeOff } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isAuthenticated } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirect = searchParams?.get('redirect') || '/'
      router.push(redirect)
    }
  }, [isAuthenticated, router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(identifier, password)
      // Redirect after successful login
      const redirect = searchParams?.get('redirect') || '/'
      router.push(redirect)
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F3E5AB] via-[#F5E9C3] to-[#D2691E] p-3 sm:p-4">
      <Card className="w-full max-w-md border-2 border-[#8B4513] shadow-xl bg-white">
        <CardHeader className="text-center space-y-3 sm:space-y-4 pb-6">
          <div className="flex justify-center">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-[#8B4513] flex items-center justify-center">
              <CircleIcon className="h-8 w-8 sm:h-10 sm:w-10 text-[#F3E5AB]" />
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-[#8B4513]">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-[#D2691E] text-sm sm:text-base">
            Sign in to continue learning Umwero
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-[#8B4513] text-sm font-medium">
                Username, Email, or Mobile Number
              </Label>
              <Input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your username, email, or mobile"
                required
                autoComplete="username"
                className="border-2 border-[#D2691E] focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/20 transition-all h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#8B4513] text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="border-2 border-[#D2691E] focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/20 transition-all h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B4513] hover:text-[#A0522D] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8B4513] hover:bg-[#A0522D] text-white h-11 text-base font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 sm:mt-8 text-center space-y-3">
            <p className="text-sm text-[#8B4513]">
              Don't have an account?{' '}
              <Link href="/signup" className="font-semibold text-[#D2691E] hover:text-[#8B4513] hover:underline transition-colors">
                Sign Up
              </Link>
            </p>
            <Link href="/" className="text-sm text-[#8B4513] hover:text-[#D2691E] hover:underline block transition-colors">
              ← Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F3E5AB] via-[#F5E9C3] to-[#D2691E]">
        <div className="h-12 w-12 border-4 border-[#8B4513] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
