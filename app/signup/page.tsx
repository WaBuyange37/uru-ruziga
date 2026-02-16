"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import { CircleIcon, UserPlus, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { register, isAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirect = searchParams?.get('redirect') || '/dashboard'
      router.push(redirect)
    }
  }, [isAuthenticated, router, searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword
  const passwordLength = formData.password.length >= 6

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    try {
      await register(formData.fullName, formData.username, formData.email, formData.password)
      // Redirect after successful registration
      const redirect = searchParams?.get('redirect') || '/dashboard'
      router.push(redirect)
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F3E5AB] via-[#F5E9C3] to-[#D2691E] p-3 sm:p-4 py-8">
      <Card className="w-full max-w-md border-2 border-[#8B4513] shadow-xl bg-white">
        <CardHeader className="text-center space-y-3 sm:space-y-4 pb-6">
          <div className="flex justify-center">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-[#8B4513] flex items-center justify-center">
              <CircleIcon className="h-8 w-8 sm:h-10 sm:w-10 text-[#F3E5AB]" />
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-[#8B4513]">
            Join Uruziga
          </CardTitle>
          <CardDescription className="text-[#D2691E] text-sm sm:text-base">
            Create an account to start learning Umwero
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-[#8B4513] text-sm font-medium">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                autoComplete="name"
                className="border-2 border-[#D2691E] focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/20 transition-all h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-[#8B4513] text-sm font-medium">
                Username <span className="text-red-500">*</span>
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a unique username"
                required
                autoComplete="username"
                className="border-2 border-[#D2691E] focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/20 transition-all h-11"
              />
              <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                <span className="text-[#8B4513]">•</span> 3-20 characters, letters, numbers, and underscores only
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#8B4513] text-sm font-medium">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
                autoComplete="email"
                className="border-2 border-[#D2691E] focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/20 transition-all h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#8B4513] text-sm font-medium">
                Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  required
                  autoComplete="new-password"
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
              <p className={`text-xs mt-1 flex items-center gap-1.5 ${passwordLength ? 'text-green-600' : 'text-gray-600'}`}>
                {passwordLength && <CheckCircle2 className="h-3 w-3" />}
                <span className={!passwordLength ? 'text-[#8B4513]' : ''}>•</span> Minimum 6 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[#8B4513] text-sm font-medium">
                Confirm Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  required
                  autoComplete="new-password"
                  className="border-2 border-[#D2691E] focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/20 transition-all h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B4513] hover:text-[#A0522D] transition-colors"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.confirmPassword && (
                <p className={`text-xs mt-1 flex items-center gap-1.5 ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordsMatch && <CheckCircle2 className="h-3 w-3" />}
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </p>
              )}
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
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 sm:mt-8 text-center space-y-3">
            <p className="text-sm text-[#8B4513]">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-[#D2691E] hover:text-[#8B4513] hover:underline transition-colors">
                Sign In
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

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F3E5AB] via-[#F5E9C3] to-[#D2691E] p-3 sm:p-4 py-8">
        <div className="h-12 w-12 border-4 border-[#8B4513] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  )
}
