/**
 * Environment-aware Site URL and Callback URL resolver for FINEXFLY.
 * Never hard-codes localhost in production.
 */

export function getSiteUrl(): string {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

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
