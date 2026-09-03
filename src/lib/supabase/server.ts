import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function assertServerEnvironment() {
  if (typeof window !== 'undefined') {
    throw new Error(
      '[FINEXFLY Security Violation] Server-side Supabase client must never be initialized in the browser.'
    );
  }
}

/**
 * Standard server-side Supabase client for Server Components and Route Handlers.
 * Respects Row Level Security (RLS) by forwarding the user's JWT authorization header.
 */
export function getSupabaseServerClient(userAccessToken?: string): SupabaseClient | null {
  assertServerEnvironment();

  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[FINEXFLY Security] Supabase URL or Anon key missing in production.');
    }
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: userAccessToken
        ? { Authorization: `Bearer ${userAccessToken}` }
        : {},
    },
  });
}

/**
 * Privileged Service-Role Supabase client for admin migrations, background worker tasks, or system seeders.
 * NEVER exposed to client/browser code.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  assertServerEnvironment();

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[FINEXFLY Security] SUPABASE_SERVICE_ROLE_KEY is not configured on the server.');
    }
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
