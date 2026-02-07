"use client"

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
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F3E5AB] to-[#E8D89E] px-4 py-8">
      <Card className="w-full max-w-md shadow-xl border-2 border-[#8B4513]">
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-3xl font-bold text-center text-[#8B4513]">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center text-[#D2691E]">
            Sign in to continue your Umwero learning
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#8B4513] font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                className="h-11 bg-white border-[#8B4513] focus:border-[#D2691E] focus:ring-[#D2691E]"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[#8B4513] font-medium">
                  Password
                </Label>
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-[#D2691E] hover:text-[#8B4513] hover:underline"
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
                  className="h-11 bg-white border-[#8B4513] focus:border-[#D2691E] focus:ring-[#D2691E] pr-10"
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
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm font-medium">
                  {error}
                </p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-11 bg-[#8B4513] hover:bg-[#A0522D] text-[#F3E5AB] font-semibold text-base shadow-sm"
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
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-6">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#8B4513]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-[#8B4513]">
                New to Uruziga?
              </span>
            </div>
          </div>

          <Link href="/signup" className="w-full">
            <Button 
              type="button"
              variant="outline" 
              className="w-full h-11 border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#F3E5AB] font-semibold"
            >
              Create New Account
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
