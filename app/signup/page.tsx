"use client"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { EyeIcon, EyeOffIcon, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function SignupPage() {
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
      case "medium": return "text-yellow-600"
      case "strong": return "text-green-600"
      default: return ""
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F3E5AB] to-[#E8D89E] px-4 py-8">
      <Card className="w-full max-w-md shadow-xl border-2 border-[#8B4513]">
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-3xl font-bold text-center text-[#8B4513]">
            Create Account
          </CardTitle>
          <CardDescription className="text-center text-[#D2691E]">
            Join the Umwero learning community
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-[#8B4513] font-medium">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="h-11 bg-white border-[#8B4513] focus:border-[#D2691E] focus:ring-[#D2691E]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#8B4513] font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="h-11 bg-white border-[#8B4513] focus:border-[#D2691E] focus:ring-[#D2691E]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#8B4513] font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="h-11 bg-white border-[#8B4513] focus:border-[#D2691E] focus:ring-[#D2691E] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8B4513] hover:text-[#D2691E]"
                >
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              {password && (
                <p className={`text-sm mt-1 ${getPasswordStrengthColor()}`}>
                  Password strength: {getPasswordStrength()}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[#8B4513] font-medium">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                className="h-11 bg-white border-[#8B4513] focus:border-[#D2691E] focus:ring-[#D2691E]"
              />
            </div>

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 h-4 w-4 text-[#8B4513] border-[#8B4513] rounded focus:ring-[#8B4513]"
              />
              <Label
                htmlFor="terms"
                className="text-sm text-[#8B4513] leading-5 cursor-pointer"
              >
                I agree to the{" "}
                <Link href="/terms" className="text-[#D2691E] hover:underline">
                  Terms and Conditions
                </Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-[#D2691E] hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-11 bg-[#8B4513] hover:bg-[#A0522D] text-[#F3E5AB] font-semibold shadow-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
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
                Already have an account?
              </span>
            </div>
          </div>

          <Link href="/login" className="w-full">
            <Button 
              type="button"
              variant="outline" 
              className="w-full h-11 border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#F3E5AB] font-semibold"
            >
              Sign In
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
