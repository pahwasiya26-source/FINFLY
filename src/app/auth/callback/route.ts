import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const tokenHash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const next = requestUrl.searchParams.get('next') ?? '/';
  const errorDescription =
    requestUrl.searchParams.get('error_description') ||
    requestUrl.searchParams.get('error');

  // Resolve public origin correctly across localhost and Vercel reverse proxies
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const origin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : request.nextUrl.origin;

  // Prevent open redirect vulnerabilities; ensure next is an internal path
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/';
  const isPasswordReset = safeNext.startsWith('/reset-password');

  // 1. Handle error reported directly in callback parameters
  if (errorDescription) {
    console.error('[FINEXFLY Auth Callback] Provider reported error:', errorDescription);
    if (isPasswordReset) {
      const resetUrl = new URL('/reset-password', origin);
      resetUrl.searchParams.set('error', 'recovery_link_error');
      resetUrl.searchParams.set('message', errorDescription);
      return NextResponse.redirect(resetUrl);
    }
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('error', 'email_confirmation_failed');
    loginUrl.searchParams.set('message', errorDescription);
    return NextResponse.redirect(loginUrl);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[FINEXFLY Auth Callback] Missing Supabase environment variables');
    const fallbackUrl = new URL(isPasswordReset ? '/reset-password' : '/login', origin);
    fallbackUrl.searchParams.set('error', 'unconfigured_production');
    return NextResponse.redirect(fallbackUrl);
  }

  // Prepare redirect response so session cookies can be attached
  const redirectResponse = NextResponse.redirect(new URL(safeNext, origin));

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          redirectResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  // 2. PKCE Code Exchange Flow
  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('[FINEXFLY Auth Callback] exchangeCodeForSession error:', error.message);
        if (isPasswordReset) {
          // Pass error to reset-password page instead of dumping on login
          const resetUrl = new URL('/reset-password', origin);
          resetUrl.searchParams.set('error', 'exchange_failed');
          resetUrl.searchParams.set('message', error.message);
          return NextResponse.redirect(resetUrl);
        }
        const loginUrl = new URL('/login', origin);
        loginUrl.searchParams.set('error', 'email_confirmation_failed');
        loginUrl.searchParams.set('message', error.message);
        return NextResponse.redirect(loginUrl);
      }

      if (data?.session && data?.user) {
        // Upsert user profile using authenticated auth.uid()
        try {
          await supabase.from('profiles').upsert(
            {
              id: data.user.id,
              email: data.user.email ?? '',
              full_name:
                data.user.user_metadata?.full_name ||
                data.user.email?.split('@')[0] ||
                '',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );
        } catch (profileError) {
          console.warn('[FINEXFLY Auth Callback] Non-fatal profile creation warning:', profileError);
        }

        return redirectResponse;
      }
    } catch (exchangeErr: any) {
      console.error('[FINEXFLY Auth Callback] Unexpected exception during code exchange:', exchangeErr);
      const fallbackUrl = new URL(isPasswordReset ? '/reset-password' : '/login', origin);
      fallbackUrl.searchParams.set('error', 'exchange_exception');
      fallbackUrl.searchParams.set('message', exchangeErr?.message || 'Authentication exchange failed');
      return NextResponse.redirect(fallbackUrl);
    }
  }

  // 3. OTP / Token Hash Verification Flow (Supabase email verify links)
  if (tokenHash && type) {
    try {
      const { data, error: otpError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as any,
      });

      if (!otpError && data?.session) {
        return redirectResponse;
      }

      if (otpError) {
        console.error('[FINEXFLY Auth Callback] verifyOtp error:', otpError.message);
        const fallbackUrl = new URL(isPasswordReset ? '/reset-password' : '/login', origin);
        fallbackUrl.searchParams.set('error', 'otp_verification_failed');
        fallbackUrl.searchParams.set('message', otpError.message);
        return NextResponse.redirect(fallbackUrl);
      }
    } catch (otpErr: any) {
      console.error('[FINEXFLY Auth Callback] Unexpected OTP exception:', otpErr);
      const fallbackUrl = new URL(isPasswordReset ? '/reset-password' : '/login', origin);
      fallbackUrl.searchParams.set('error', 'otp_exception');
      return NextResponse.redirect(fallbackUrl);
    }
  }

  // 4. Hash Fragment / Implicit Grant Flow
  // When Supabase redirects with hash fragments (#access_token=...&type=recovery),
  // browsers do not send the fragment to the server.
  // Redirecting to safeNext (/reset-password) allows the browser to carry over the
  // hash fragment so the client-side Supabase client can process the recovery session.
  if (isPasswordReset || safeNext !== '/') {
    return redirectResponse;
  }

  // Missing confirmation parameters on general callback
  console.warn('[FINEXFLY Auth Callback] Request arrived without code or token_hash; redirecting to login');
  const fallbackUrl = new URL('/login', origin);
  fallbackUrl.searchParams.set('error', 'missing_confirmation_code');
  return NextResponse.redirect(fallbackUrl);
}
