"use client"
// app/contexts/AuthContext.tsx
// Fixed AuthContext for Neon database integration

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  email: string
  fullName: string
  role: 'USER' | 'ADMIN' | 'TEACHER'
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (fullName: string, email: string, password: string) => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      
      if (token) {
        try {
          // Verify token is still valid
          const response = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (response.ok) {
            const { user } = await response.json()
            setUser(user)
          } else {
            // Token invalid, clear it
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
          }
        } catch (error) {
          console.error('Auth check error:', error)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
      
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Store token and user
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      // Set cookie for server-side middleware
      document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
      
      setUser(data.user)
    } catch (error: any) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (fullName: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // After successful registration, log in automatically
      await login(email, password)
    } catch (error: any) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const logout = () => {
    // Clear all auth data
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('completedVowels')
    localStorage.removeItem('vowelsProgress')
    
    // Clear cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    
    setUser(null)
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      logout, 
      register, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}