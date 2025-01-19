"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      router.push('/')
    } catch (err) {
      setError('Failed to log in')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen bg-[#FFFFFF]">
      <Card className="w-full max-w-md bg-[#F3E5AB] border-[#8B4513]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-[#8B4513]">Login</CardTitle>
          <CardDescription className="text-center text-[#D2691E]">Welcome back to Uruziga</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white border-[#8B4513] text-[#8B4513]"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white border-[#8B4513] text-[#8B4513]"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]">
              Log In
            </Button>
          </form>
          <p className="mt-4 text-center text-[#8B4513]">
            Don't have an account?{' '}
            <Link href="/register" className="text-[#D2691E] hover:underline">
              Register here
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

