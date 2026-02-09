// lib/oauth.ts - OAuth configuration and utilities
import { createHash } from 'crypto'

export interface OAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scope: string
  authUrl: string
  tokenUrl: string
  userInfoUrl: string
}

export interface OAuthTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
}

export interface OAuthUserInfo {
  id: string
  email: string
  name?: string
  picture?: string
  verified?: boolean
}

/**
 * Generate state parameter for OAuth security
 */
export function generateOAuthState(): string {
  const state = createHash('sha256')
    .update(Date.now().toString() + Math.random().toString())
    .digest('hex')
  
  return state
}

/**
 * Verify OAuth state
 */
export function verifyOAuthState(receivedState: string, originalState: string): boolean {
  return receivedState === originalState
}

/**
 * OAuth configurations for different providers
 */
export const OAUTH_CONFIGS: { [key: string]: OAuthConfig } = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback/google`,
    scope: 'openid email profile',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo'
  },
  facebook: {
    clientId: process.env.FACEBOOK_APP_ID || '',
    clientSecret: process.env.FACEBOOK_APP_SECRET || '',
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback/facebook`,
    scope: 'email public_profile',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    userInfoUrl: 'https://graph.facebook.com/v18.0/me?fields=id,name,email,picture'
  },
  twitter: {
    clientId: process.env.TWITTER_CLIENT_ID || '',
    clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback/twitter`,
    scope: 'tweet.read users.read',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    userInfoUrl: 'https://api.twitter.com/2/users/me'
  }
}

/**
 * Get OAuth authorization URL
 */
export function getOAuthUrl(provider: string): string {
  const config = OAUTH_CONFIGS[provider.toLowerCase()]
  if (!config) {
    throw new Error(`Unsupported OAuth provider: ${provider}`)
  }

  const state = generateOAuthState()
  
  // Store state in session for verification
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('oauth_state', state)
    sessionStorage.setItem('oauth_provider', provider.toLowerCase())
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope,
    response_type: 'code',
    state: state,
    access_type: 'offline' // For refresh token
  })

  return `${config.authUrl}?${params.toString()}`
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  provider: string, 
  code: string
): Promise<OAuthTokenResponse> {
  const config = OAUTH_CONFIGS[provider.toLowerCase()]
  if (!config) {
    throw new Error(`Unsupported OAuth provider: ${provider}`)
  }

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: config.redirectUri,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to exchange code for token: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Get user info from OAuth provider
 */
export async function getOAuthUserInfo(
  provider: string, 
  accessToken: string
): Promise<OAuthUserInfo> {
  const config = OAUTH_CONFIGS[provider.toLowerCase()]
  if (!config) {
    throw new Error(`Unsupported OAuth provider: ${provider}`)
  }

  const response = await fetch(`${config.userInfoUrl}?access_token=${accessToken}`)
  
  if (!response.ok) {
    throw new Error(`Failed to get user info: ${response.statusText}`)
  }

  return response.json()
}
