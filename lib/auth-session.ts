import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { getJwtSecret, verifyToken } from './jwt'

export const AUTH_COOKIE_NAME = 'token'
export const AUTH_MAX_AGE_SECONDS = 7 * 24 * 60 * 60

export type AuthTokenPayload = {
  userId: string
  email?: string | null
  username?: string | null
  role?: string
  developmentDemo?: boolean
}

export function createAuthToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' })
}

export function getAuthTokenFromRequest(request: NextRequest) {
  const authorization = request.headers.get('authorization')
  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length)
  }

  return request.cookies.get(AUTH_COOKIE_NAME)?.value ?? null
}

export async function getAuthPayload(request: NextRequest) {
  const token = getAuthTokenFromRequest(request)
  if (!token) return null

  return (await verifyToken(token)) as AuthTokenPayload | null
}

export async function getAuthenticatedUserId(request: NextRequest) {
  const payload = await getAuthPayload(request)
  return payload?.userId ?? null
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: AUTH_MAX_AGE_SECONDS,
  })

  return response
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  return response
}
