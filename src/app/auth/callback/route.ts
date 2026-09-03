import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';
  const errorDescription =
    requestUrl.searchParams.get('error_description') ||
    requestUrl.searchParams.get('error');
  const origin = requestUrl.origin;

  if (errorDescription) {
    console.error('[FINEXFLY Auth Callback] Confirmation error from provider:', errorDescription);
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('error', 'email_confirmation_failed');
    loginUrl.searchParams.set('message', errorDescription);
    return NextResponse.redirect(loginUrl);
  }

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[FINEXFLY Auth Callback] Missing Supabase environment variables');
      const loginUrl = new URL('/login', origin);
      loginUrl.searchParams.set('error', 'unconfigured_production');
      return NextResponse.redirect(loginUrl);
    }

    // Prepare redirect response so cookies can be attached
    const redirectResponse = NextResponse.redirect(new URL(next, origin));

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            redirectResponse.cookies.set(name, value, options);
          });
        },
      },
    });

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('[FINEXFLY Auth Callback] exchangeCodeForSession error:', error.message);
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
      const loginUrl = new URL('/login', origin);
      loginUrl.searchParams.set('error', 'email_confirmation_failed');
      loginUrl.searchParams.set('message', exchangeErr?.message || 'Authentication exchange failed');
      return NextResponse.redirect(loginUrl);
    }
  }

  // Missing confirmation code in query params
  console.warn('[FINEXFLY Auth Callback] Request arrived without a valid code parameter');
  const fallbackUrl = new URL('/login', origin);
  fallbackUrl.searchParams.set('error', 'missing_confirmation_code');
  return NextResponse.redirect(fallbackUrl);
}
