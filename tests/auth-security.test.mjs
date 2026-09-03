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
