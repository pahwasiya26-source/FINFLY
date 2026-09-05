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

  // 2. In browser, if on localhost use localhost; if on vercel or custom domain, use that origin
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }

  // 3. Server-side fallback: production defaults to official URL https://finexfly.vercel.app
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    return 'https://finexfly.vercel.app';
  }

  let url = process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000';

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  return url.replace(/\/+$/, '');
}

export function getAuthCallbackUrl(): string {
  return `${getSiteUrl()}/auth/callback`;
}
