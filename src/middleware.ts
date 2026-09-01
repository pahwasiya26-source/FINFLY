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

  // 2. Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured =
    supabaseUrl &&
    supabaseUrl !== 'https://your-project-id.supabase.co' &&
    supabaseUrl.startsWith('https://');

  if (isConfigured) {
    // Check for Supabase session cookies (sb-*-auth-token or supabase-auth-token)
    const hasAuthCookie = request.cookies
      .getAll()
      .some((c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));

    if (!hasAuthCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  } else if (process.env.NODE_ENV === 'production') {
    // In unconfigured production, block access to protected financial data safely
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'unconfigured_production');
    return NextResponse.redirect(loginUrl);
  }

  // In development demo mode without Supabase, allow pass-through
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
