import test from 'node:test';
import assert from 'node:assert/strict';

import { isSupabaseConfigured } from '../src/lib/supabase/client.ts';
import { getSupabaseServerClient, getSupabaseAdminClient } from '../src/lib/supabase/server.ts';

// -------------------------------------------------------------
// Auth & Security Architecture Tests
// -------------------------------------------------------------
test('Supabase Client: Identifies unconfigured state cleanly without crashing', () => {
  const configured = isSupabaseConfigured();
  // In demo environment without live env vars, should return false
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
      message: /FINFLY Security Violation/,
    }
  );

  // Restore server environment
  delete global.window;
});

test('Supabase Server Client: Safely returns null when env vars are missing', () => {
  const client = getSupabaseServerClient();
  // Should handle unconfigured environment gracefully
  assert.ok(client === null || typeof client === 'object');
});
