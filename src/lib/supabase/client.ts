import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project-id.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key-here' &&
    supabaseUrl.startsWith('https://')
  );
}

let browserClient: SupabaseClient | null = null;

/**
 * Get or initialize the browser-side Supabase client using the anon key.
 * In production, if unconfigured, it safely fails without creating fake access.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (browserClient) return browserClient;

  if (isSupabaseConfigured()) {
    browserClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    return browserClient;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    console.error(
      '[FINFLY Security Guard] Supabase is not configured in production. Failing safely.'
    );
    return null;
  }

  // Development/Demo fallback notice
  return null;
}
