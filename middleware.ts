// protect routes and handle redirects
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '')
  const { pathname } = request.nextUrl

  // Public pages that don't require authentication
  const publicPages = ['/login', '/signup', '/']
  
  // Pages that require authentication
  const protectedPages = ['/dashboard', '/admin', '/profile', '/learn']
  
  // Check if current page is protected
  const isProtectedPage = protectedPages.some(page => pathname.startsWith(page))
  
  // If accessing protected page without token, redirect to login
  if (isProtectedPage && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If logged in user tries to access login/signup, redirect to home
  if (token && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}