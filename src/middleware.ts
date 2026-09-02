import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public static assets and auth endpoints
  const isPublicPath =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname === '/login' ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/api/public');

  if (isPublicPath) {
    return NextResponse.next();
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured =
    supabaseUrl &&
    supabaseUrl !== 'https://your-project-id.supabase.co' &&
    supabaseUrl.startsWith('https://');

  // In strict production, only legitimate Supabase auth session tokens are accepted
  if (isProduction) {
    if (!isConfigured) {
      // In unconfigured production, block access to protected financial data safely
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'unconfigured_production');
      return NextResponse.redirect(loginUrl);
    }

    // Check for standard Supabase session cookies (sb-<project-ref>-auth-token)
    // Note: synthetic/demo cookies like 'sb-finfly-auth-token' or 'finfly_session' are strictly rejected in production
    const hasProductionAuthCookie = request.cookies
      .getAll()
      .some(
        (c) =>
          c.name.startsWith('sb-') &&
          c.name.endsWith('-auth-token') &&
          c.name !== 'sb-finfly-auth-token'
      );

    if (!hasProductionAuthCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // -------------------------------------------------------------
  // Development / Local Demo Mode
  // -------------------------------------------------------------
  // In development, allow demo session cookies or pass-through
  const hasDevSession = request.cookies
    .getAll()
    .some(
      (c) =>
        (c.name.startsWith('sb-') && c.name.endsWith('-auth-token')) ||
        c.name === 'finfly_session' ||
        c.name === 'sb-finfly-auth-token'
    );

  if (isConfigured && !hasDevSession) {
    // If Supabase is configured locally and user has no session, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
