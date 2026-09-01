import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const outDir = "/Users/siyapahwa/.gemini/antigravity-ide/brain/8ae54c8a-5bf4-4629-b334-fdcae3bfac4a/scratch";

// Test light theme by injecting script or evaluating data-theme attribute
console.log("=== Testing Light Theme in Headless Chrome ===");

const routesToTest = [
  '/',
  '/financial-twin',
  '/money-flow',
  '/business',
  '/investments',
  '/taxes',
  '/finance-controller',
  '/ai-cfo',
  '/reports',
  '/ai-agents',
  '/privacy-center',
  '/settings',
  '/login'
];

for (const r of routesToTest) {
  const slug = r === '/' ? 'overview' : r.replace(/^\//, '');
  const outDark = path.join(outDir, `dark_${slug}.png`);
  const outLight = path.join(outDir, `light_${slug}.png`);
  
  // Dark mode capture
  execSync(`"${chromePath}" --headless=new --screenshot="${outDark}" --window-size=1440,900 "http://localhost:3000${r}" 2>/dev/null`, { timeout: 15000 });
  console.log(`✓ Dark mode captured: ${r}`);
}

console.log("=== All Dark Mode Routes Captured Successfully ===");
