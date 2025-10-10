import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookies
  const token = request.cookies.get('auth-token')?.value;

  // Debug logging for token refresh
  if (token) {
    console.log('🔍 Middleware: Found auth token in cookie');
  } else {
    console.log('🔍 Middleware: No auth token found in cookie');
  }

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/forgot-password',
    '/reset-password',
    '/verify-otp',
  ];
  const isAuthPage = publicRoutes.some((route) => pathname.startsWith(route));

  // Define protected routes
  const protectedRoutes = ['/dashboard'];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // If no token and trying to access protected route, redirect to login
  if (!token && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If token exists and trying to access auth pages, redirect to dashboard
  // BUT only if we're not already on a protected route to avoid loops
  if (token && isAuthPage && !isProtectedRoute) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // For protected routes with token, let the client-side handle token validation
  // The client-side will handle token refresh automatically
  if (token && isProtectedRoute) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
