// middleware.ts - Fixed routing logic
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // Public routes that anyone can access
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/about',
    '/gallery',
    '/translate',
    '/games-and-quizzes',
    '/umwero-chat',
    '/community',
    '/fund',
    '/cart',
    '/verify-email',
  ]

  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/admin',
    '/teacher',
    '/profile',
    '/learn', // Learning requires authentication
  ]

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  // Allow access to public routes regardless of auth status
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Redirect to login if accessing protected route without token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Allow all other routes
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, fonts, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf)).*)',
  ],
}