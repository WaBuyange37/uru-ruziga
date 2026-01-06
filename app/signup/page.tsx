"use client"

import { useState } from "react"
import { useTranslation } from "../../hooks/useTranslation"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { EyeIcon, EyeOffIcon, Facebook, Github } from "lucide-react"
import Link from "next/link"
import { useAuth } from "../contexts/AuthContext"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const { t } = useTranslation()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Validation
    if (!fullName.trim()) {
      setError("Full name is required")
      setLoading(false)
      return
    }

    if (!email.trim()) {
      setError("Email is required")
      setLoading(false)
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Invalid email format")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match")
      setLoading(false)
      return
    }

    if (!agreeTerms) {
      setError("Please agree to terms and conditions")
      setLoading(false)
      return
    }

    try {
      // Fix: Pass parameters in correct order: (username, email, password)
      await register(fullName, email, password)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Signup failed")
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = () => {
    if (password.length === 0) return ""
    if (password.length < 6) return "weak"
    if (password.length < 10) return "medium"
    return "strong"
  }

  const getPasswordStrengthColor = () => {
    const strength = getPasswordStrength()
    switch (strength) {
      case "weak": return "text-red-500"
      case "medium": return "text-yellow-500"
      case "strong": return "text-green-500"
      default: return ""
    }
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md bg-[#F3E5AB] border-[#8B4513]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-[#8B4513]">
            Create Account
          </CardTitle>
          <CardDescription className="text-center text-[#D2691E]">
            Join the Umwero learning community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-[#8B4513]">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="bg-white border-[#8B4513] text-[#8B4513]"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-[#8B4513]">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="bg-white border-[#8B4513] text-[#8B4513]"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-[#8B4513]">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="bg-white border-[#8B4513] text-[#8B4513] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8B4513]"
                >
                  {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
              {password && (
                <p className={`text-sm mt-1 ${getPasswordStrengthColor()}`}>
                  Password strength: {getPasswordStrength()}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-[#8B4513]">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                className="bg-white border-[#8B4513] text-[#8B4513]"
              />
            </div>

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 h-4 w-4 text-[#8B4513] border-[#8B4513] rounded focus:ring-[#8B4513] focus:ring-2"
              />
              <Label
                htmlFor="terms"
                className="text-sm text-[#8B4513] leading-4 cursor-pointer"
              >
                I agree to the{" "}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Terms and Conditions
                </Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded border border-red-200">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#8B4513]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#F3E5AB] px-2 text-[#8B4513]">Or sign up with</span>
            </div>
          </div>

          <div className="flex space-x-4 w-full">
            <Button variant="outline" className="w-full border-[#8B4513] text-[#8B4513]">
              <Github className="mr-2 h-4 w-4" /> 
              Github
            </Button>
            <Button variant="outline" className="w-full border-[#8B4513] text-[#8B4513]">
              <Facebook className="mr-2 h-4 w-4" /> 
              Facebook
            </Button>
          </div>

          <p className="text-center text-sm text-[#8B4513]">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Sign in here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}