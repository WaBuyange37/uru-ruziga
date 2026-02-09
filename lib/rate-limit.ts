// lib/rate-limit.ts
// Production-grade rate limiting for Uruziga

interface RateLimitConfig {
  interval: number // milliseconds
  uniqueTokenPerInterval: number
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

const tokenCache = new Map<string, number[]>()

/**
 * Rate limiter using token bucket algorithm
 * @param identifier - Unique identifier (IP, userId, email)
 * @param config - Rate limit configuration
 */
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig = {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 10, // 10 requests per minute
  }
): Promise<RateLimitResult> {
  const now = Date.now()
  const windowStart = now - config.interval

  // Get existing tokens for this identifier
  const tokens = tokenCache.get(identifier) || []
  
  // Remove expired tokens
  const validTokens = tokens.filter(token => token > windowStart)
  
  // Check if limit exceeded
  if (validTokens.length >= config.uniqueTokenPerInterval) {
    const oldestToken = validTokens[0]
    const resetTime = oldestToken + config.interval
    
    return {
      success: false,
      limit: config.uniqueTokenPerInterval,
      remaining: 0,
      reset: resetTime,
    }
  }
  
  // Add new token
  validTokens.push(now)
  tokenCache.set(identifier, validTokens)
  
  // Clean up old entries periodically
  if (tokenCache.size > 10000) {
    const keysToDelete: string[] = []
    tokenCache.forEach((tokens, key) => {
      if (tokens.every(token => token < windowStart)) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => tokenCache.delete(key))
  }
  
  return {
    success: true,
    limit: config.uniqueTokenPerInterval,
    remaining: config.uniqueTokenPerInterval - validTokens.length,
    reset: now + config.interval,
  }
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from headers (works with most proxies)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'
  
  return ip
}

/**
 * Preset rate limit configurations
 */
export const RATE_LIMITS = {
  // Authentication endpoints
  AUTH_LOGIN: { interval: 60 * 1000, uniqueTokenPerInterval: 5 }, // 5 per minute
  AUTH_REGISTER: { interval: 60 * 1000, uniqueTokenPerInterval: 3 }, // 3 per minute
  AUTH_VERIFY: { interval: 60 * 1000, uniqueTokenPerInterval: 10 }, // 10 per minute
  
  // Community endpoints
  POST_CREATE: { interval: 60 * 60 * 1000, uniqueTokenPerInterval: 10 }, // 10 per hour
  POST_COMMENT: { interval: 60 * 60 * 1000, uniqueTokenPerInterval: 30 }, // 30 per hour
  POST_LIKE: { interval: 60 * 1000, uniqueTokenPerInterval: 60 }, // 60 per minute
  
  // Chat endpoints
  CHAT_MESSAGE: { interval: 60 * 1000, uniqueTokenPerInterval: 20 }, // 20 per minute
  
  // Translation endpoints
  TRANSLATE: { interval: 60 * 60 * 1000, uniqueTokenPerInterval: 100 }, // 100 per hour
  
  // Image generation
  IMAGE_GENERATE: { interval: 60 * 60 * 1000, uniqueTokenPerInterval: 50 }, // 50 per hour
  
  // Admin endpoints
  ADMIN_ACTION: { interval: 60 * 1000, uniqueTokenPerInterval: 30 }, // 30 per minute
  
  // General API
  API_GENERAL: { interval: 60 * 1000, uniqueTokenPerInterval: 60 }, // 60 per minute
}

/**
 * Middleware helper to apply rate limiting
 */
export async function withRateLimit(
  request: Request,
  config: RateLimitConfig,
  identifier?: string
): Promise<Response | null> {
  const clientId = identifier || getClientIdentifier(request)
  const result = await rateLimit(clientId, config)
  
  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests',
        message: 'You have exceeded the rate limit. Please try again later.',
        limit: result.limit,
        remaining: result.remaining,
        reset: new Date(result.reset).toISOString(),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.reset.toString(),
          'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
        },
      }
    )
  }
  
  return null
}
