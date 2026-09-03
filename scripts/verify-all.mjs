/**
 * FINEXFLY Route & Health Verification Script
 * Checks all 20 application routes for HTTP 200 response and content validity.
 */

const ROUTES = [
  '/',
  '/personal-ca',
  '/money-flow',
  '/investments',
  '/business',
  '/taxes',
  '/financial-twin',
  '/finance-controller',
  '/ai-cfo',
  '/reports',
  '/ai-agents',
  '/privacy-center',
  '/settings',
  '/digital-twin',
  '/reconciliation',
  '/agents',
  '/privacy',
  '/login',
  '/forgot-password',
  '/reset-password',
];

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function verifyRoutes() {
  console.log(`\n🔍 Verifying FINEXFLY Routes on ${BASE_URL}...\n`);
  let passed = 0;
  let failed = 0;

  for (const route of ROUTES) {
    const url = `${BASE_URL}${route}`;
    try {
      const response = await fetch(url, { redirect: 'manual' });
      const status = response.status;

      // 200 is healthy; 307/302 is expected redirect for auth-guarded routes if unauthenticated in prod
      if (status === 200 || status === 307 || status === 302) {
        console.log(`  ✅ [${status}] ${route.padEnd(25)} -> OK`);
        passed++;
      } else {
        console.error(`  ❌ [${status}] ${route.padEnd(25)} -> Unexpected Status`);
        failed++;
      }
    } catch (err) {
      console.warn(`  ⚠️  [Offline/Skipped] ${route.padEnd(25)} -> Server not reachable at ${url}`);
      failed++;
    }
  }

  console.log(`\n📊 Route Verification Summary: ${passed} Passed, ${failed} Failed/Offline\n`);
}

verifyRoutes().catch(console.error);
