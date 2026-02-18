"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { Loader2, AlertCircle, CheckCircle, Mail } from "lucide-react"
import Link from "next/link"

function VerifyEmailContent() {
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams?.get('email') || ''

  useEffect(() => {
    if (!email) {
      router.push('/signup')
    }
  }, [email, router])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code")
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      // Store token
      localStorage.setItem('token', data.token)
      
      setSuccess(true)
      setTimeout(() => {
        router.push('/')
      }, 2000)

    } catch (err: any) {
      setError(err.message || "Verification failed")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError("")
    setResending(true)

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend code')
      }

      setError("") // Clear any previous errors
      alert("Verification code sent! Please check your email.")

    } catch (err: any) {
      setError(err.message || "Failed to resend code")
    } finally {
      setResending(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F3E5AB] to-[#E8D89E] px-4 py-8">
        <Card className="w-full max-w-md shadow-xl border-2 border-[#8B4513]">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#8B4513] mb-2">Email Verified!</h2>
            <p className="text-[#D2691E]">Redirecting to homepage...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F3E5AB] to-[#E8D89E] px-4 py-8">
      <Card className="w-full max-w-md shadow-xl border-2 border-[#8B4513]">
        <CardHeader className="space-y-2 pb-6 text-center">
          <div className="mx-auto w-16 h-16 bg-[#8B4513] rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-[#F3E5AB]" />
          </div>
          <CardTitle className="text-3xl font-bold text-center text-[#8B4513]">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-center text-[#D2691E]">
            We've sent a 6-digit code to<br />
            <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-[#8B4513] font-medium">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                required
                maxLength={6}
                className="h-14 text-center text-2xl font-bold tracking-widest bg-white border-[#8B4513] focus:border-[#D2691E] focus:ring-[#D2691E]"
              />
              <p className="text-xs text-[#D2691E] text-center">
                Code expires in 10 minutes
              </p>
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
              disabled={loading || otp.length !== 6}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-6">
          <div className="text-center text-sm text-[#8B4513]">
            Didn't receive the code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-[#D2691E] hover:underline font-semibold disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend Code"}
            </button>
          </div>

          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#8B4513]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-[#8B4513]">
                Wrong email?
              </span>
            </div>
          </div>

          <Link href="/signup" className="w-full">
            <Button 
              type="button"
              variant="outline" 
              className="w-full h-11 border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#F3E5AB] font-semibold"
            >
              Back to Signup
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F3E5AB] to-[#E8D89E]">
        <Card className="w-full max-w-md shadow-xl border-2 border-[#8B4513]">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-16 w-16 text-[#8B4513] mx-auto mb-4 animate-spin" />
            <p className="text-[#D2691E]">Loading...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
