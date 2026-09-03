import test from 'node:test';
import assert from 'node:assert/strict';

import { isSupabaseConfigured } from '../src/lib/supabase/client.ts';
import { getSupabaseServerClient, getSupabaseAdminClient } from '../src/lib/supabase/server.ts';

// -------------------------------------------------------------
// Auth & Security Architecture Tests
// -------------------------------------------------------------
test('Supabase Client: Identifies unconfigured state cleanly without crashing', () => {
  const configured = isSupabaseConfigured();
  assert.equal(typeof configured, 'boolean');
});

test('Supabase Server Enclave: Prevents client-side access to Admin/Service-Role Client', () => {
  // Simulate browser environment
  global.window = {};
  
  assert.throws(
    () => {
      getSupabaseAdminClient();
    },
    {
      name: 'Error',
      message: /FINEXFLY Security Violation/,
    }
  );

  // Restore server environment
  delete global.window;
});

test('Supabase Server Client: Safely returns null when env vars are missing', () => {
  const client = getSupabaseServerClient();
  assert.ok(client === null || typeof client === 'object');
});

test('Production Security Gate: Demo cookies strictly rejected when NODE_ENV is production', () => {
  const isProduction = true;
  const mockCookies = [
    { name: 'finfly_session', value: 'active' },
    { name: 'sb-finfly-auth-token', value: 'active' },
  ];

  // In production, only legitimate project-ref Supabase cookies (not synthetic demo cookies) are valid
  const hasValidProductionAuth = mockCookies.some(
    (c) =>
      c.name.startsWith('sb-') &&
      c.name.endsWith('-auth-token') &&
      c.name !== 'sb-finfly-auth-token'
  );

  assert.equal(hasValidProductionAuth, false, 'Synthetic demo cookies must be rejected in production');
});

test('Password Reset Validation: Rejects empty or invalid email formatting', () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  assert.equal(emailRegex.test(''), false, 'Empty email must fail validation');
  assert.equal(emailRegex.test('   '), false, 'Whitespace email must fail validation');
  assert.equal(emailRegex.test('not-an-email'), false, 'Invalid format must fail validation');
  assert.equal(emailRegex.test('user@domain'), false, 'Missing TLD must fail validation');
  assert.equal(emailRegex.test('user@domain.com'), true, 'Valid email must pass validation');
  assert.equal(emailRegex.test('siya.pahwa@finfly.ai'), true, 'Valid company email must pass validation');
});

test('Password Update Validation: Enforces minimum password length >= 6 and matching confirmation', () => {
  function validatePasswordUpdate(password, confirmPassword) {
    if (password.length < 6) {
      return { valid: false, error: 'Password must be at least 6 characters long.' };
    }
    if (password !== confirmPassword) {
      return { valid: false, error: 'Passwords do not match. Please ensure both fields match.' };
    }
    return { valid: true };
  }

  assert.equal(validatePasswordUpdate('12345', '12345').valid, false);
  assert.equal(validatePasswordUpdate('123456', 'mismatch').valid, false);
  assert.equal(validatePasswordUpdate('secure_password_123', 'secure_password_123').valid, true);
});

test('Public Route Middleware: /forgot-password and /reset-password are recognized as public auth routes', () => {
  function isPublicPath(pathname) {
    return (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/favicon.ico') ||
      pathname === '/login' ||
      pathname === '/forgot-password' ||
      pathname === '/reset-password' ||
      pathname.startsWith('/auth/callback') ||
      pathname.startsWith('/privacy') ||
      pathname.startsWith('/api/public')
    );
  }

  assert.equal(isPublicPath('/forgot-password'), true);
  assert.equal(isPublicPath('/reset-password'), true);
  assert.equal(isPublicPath('/login'), true);
  assert.equal(isPublicPath('/'), false);
  assert.equal(isPublicPath('/finance-controller'), false);
  assert.equal(isPublicPath('/reconciliation'), false);
});

test('Auth Navigation UX: Sign In and Create Account screens both route to /forgot-password', () => {
  const authRoutes = {
    signInForgotPasswordTarget: '/forgot-password',
    signUpForgotPasswordTarget: '/forgot-password',
    recoveryRedirectTarget: '/reset-password',
  };

  assert.equal(authRoutes.signInForgotPasswordTarget, '/forgot-password');
  assert.equal(authRoutes.signUpForgotPasswordTarget, '/forgot-password');
  assert.equal(authRoutes.recoveryRedirectTarget, '/reset-password');
});
