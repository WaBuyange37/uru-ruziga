"use client"
// app/login/page.tsx
// Perfect login page for Neon database

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { EyeIcon, EyeOffIcon, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Basic validation
    if (!email.trim()) {
      setError("Please enter your email")
      return
    }

    if (!password) {
      setError("Please enter your password")
      return
    }

    setLoading(true)

    try {
      await login(email, password)
      
      // Success! Redirect to dashboard
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen bg-[#FFFFFF]">
      <Card className="w-full max-w-md bg-[#F3E5AB] border-2 border-[#8B4513] shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center text-[#8B4513]">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center text-[#D2691E]">
            Sign in to continue your Umwero learning
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#8B4513] font-semibold">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                className="bg-white border-[#8B4513] text-[#8B4513] focus:ring-[#8B4513]"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[#8B4513] font-semibold">
                  Password
                </Label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs text-blue-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white border-[#8B4513] text-[#8B4513] pr-10 focus:ring-[#8B4513]"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8B4513] hover:text-[#D2691E]"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-600 text-sm font-medium">
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D] font-semibold py-6 text-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Demo Accounts Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-semibold text-blue-900 mb-2">
              Demo Accounts (for testing):
            </p>
            <div className="space-y-1 text-xs text-blue-800">
              <p><strong>Student:</strong> demo@uruziga.com / demo123</p>
              <p><strong>Teacher:</strong> teacher@uruziga.com / teach123</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pb-6">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#8B4513]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#F3E5AB] px-2 text-[#8B4513] font-medium">
                New to Uruziga?
              </span>
            </div>
          </div>

          <Link href="/signup" className="w-full">
            <Button 
              type="button"
              variant="outline" 
              className="w-full border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-[#F3E5AB] font-semibold"
            >
              Create New Account
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}