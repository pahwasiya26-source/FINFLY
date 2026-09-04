/**
 * Environment-aware Site URL and Callback URL resolver for FINEXFLY.
 * Never hard-codes localhost in production.
 */

export function getSiteUrl(): string {
  // 1. Explicit configured site URL (e.g. https://finexfly.vercel.app)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    let url = process.env.NEXT_PUBLIC_SITE_URL;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    return url.replace(/\/+$/, '');
  }

  // 2. In browser, always use current window.location.origin
  // Guarantees exact origin match for http://localhost:3000 and https://finexfly.vercel.app
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }

  // 3. Server-side fallback: NEXT_PUBLIC_VERCEL_URL or localhost
  let url = process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000';

  // Ensure protocol is present
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  // Strip trailing slashes
  return url.replace(/\/+$/, '');
}

export function getAuthCallbackUrl(): string {
  return `${getSiteUrl()}/auth/callback`;
}
