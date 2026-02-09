// lib/jwt.ts
// Helper to get JWT_SECRET at runtime only
// Returns the secret or throws when called, not when imported

import jwt from 'jsonwebtoken'

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set')
  }
  return secret
}

export async function verifyToken(token: string): Promise<any> {
  try {
    const decoded = jwt.verify(token, getJwtSecret())
    return decoded
  } catch (error) {
    return null
  }
}
