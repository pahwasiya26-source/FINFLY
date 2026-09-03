import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

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
 * Get or initialize the browser-side Supabase client using SSR cookie storage.
 * In the browser, this client automatically syncs authenticated sessions with document.cookie,
 * ensuring Server Components, Route Handlers, and Next.js middleware receive valid auth tokens.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (browserClient) return browserClient;

  if (isSupabaseConfigured()) {
    browserClient = createBrowserClient(supabaseUrl!, supabaseAnonKey!, {
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
      '[FINEXFLY Security Guard] Supabase is not configured in production. Failing safely.'
    );
    return null;
  }

  return null;
}
