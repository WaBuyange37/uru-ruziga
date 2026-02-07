// lib/jwt.ts
// Helper to get JWT_SECRET at runtime (not build time)
// This function will only throw when actually called, not when imported

export function getJwtSecret(): string {
  // Only check at runtime when the function is called
  if (typeof process !== 'undefined' && process.env) {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set')
    }
    return secret
  }
  // During build, return a placeholder that will never be used
  return 'build-time-placeholder'
}
