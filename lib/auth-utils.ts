// lib/auth-utils.ts
// Utility functions for authentication and token management

export interface AuthResult {
  isValid: boolean
  userId?: string
  error?: string
}

export async function validateAuthToken(token: string): Promise<AuthResult> {
  try {
    if (!token) {
      return { isValid: false, error: 'No token provided' }
    }

    const response = await fetch('/api/debug/auth', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      return { isValid: false, error: `Auth failed: ${response.status}` }
    }

    const data = await response.json()
    
    if (data.success && data.userId) {
      return { isValid: true, userId: data.userId }
    } else {
      return { isValid: false, error: data.errorMessage || 'Token validation failed' }
    }
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Unknown auth error' 
    }
  }
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export function clearStoredToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('token')
}

export async function submitCharacterProgress(
  characterId: string, 
  score: number, 
  timeSpent: number = 0
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const token = getStoredToken()
    if (!token) {
      return { success: false, error: 'No authentication token' }
    }

    // Validate token first
    const authResult = await validateAuthToken(token)
    if (!authResult.isValid) {
      return { success: false, error: `Authentication failed: ${authResult.error}` }
    }

    console.log('Submitting progress:', { characterId, score, timeSpent, userId: authResult.userId })

    const response = await fetch('/api/progress/submit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        characterId,
        score,
        timeSpent
      })
    })

    const responseText = await response.text()
    console.log('Progress API response:', { status: response.status, text: responseText })

    if (!response.ok) {
      return { 
        success: false, 
        error: `API error ${response.status}: ${responseText}` 
      }
    }

    const data = JSON.parse(responseText)
    return { success: true, data }

  } catch (error) {
    console.error('Progress submission error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}