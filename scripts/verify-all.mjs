import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const outDir = "/Users/siyapahwa/.gemini/antigravity-ide/brain/8ae54c8a-5bf4-4629-b334-fdcae3bfac4a/scratch";

const routes = [
  '/',
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
  '/login',
  '/digital-twin',
  '/reconciliation',
  '/agents',
  '/privacy'
];

const viewports = [
  { name: '1440x900', w: 1440, h: 900 },
  { name: '1024x768', w: 1024, h: 768 },
  { name: '768x1024', w: 768, h: 1024 },
  { name: '390x844', w: 390, h: 844 },
];

console.log("=== Starting Automated Headless Chrome Visual & DOM Verification ===");

for (const vp of viewports) {
  for (const r of ['/', '/financial-twin', '/money-flow', '/login', '/investments', '/business']) {
    const slug = r === '/' ? 'overview' : r.replace(/^\//, '');
    const outImg = path.join(outDir, `shot_${slug}_${vp.name}.png`);
    try {
      execSync(`"${chromePath}" --headless=new --screenshot="${outImg}" --window-size=${vp.w},${vp.h} "http://localhost:3000${r}" 2>/dev/null`, { timeout: 15000 });
      console.log(`✓ Captured [${vp.name}] ${r} -> ${outImg}`);
    } catch (e) {
      console.error(`✗ Error on ${r} at ${vp.name}:`, e.message);
    }
  }
}

console.log("=== Verification Capture Finished ===");
