// lib/jwt.ts
// Helper to get JWT_SECRET at runtime only
// Returns the secret or throws when called, not when imported

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set')
  }
  return secret
}
