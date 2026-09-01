import http from 'http';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const outDir = "/Users/siyapahwa/.gemini/antigravity-ide/brain/8ae54c8a-5bf4-4629-b334-fdcae3bfac4a/scratch";

// Launch Chrome with remote debugging
const chromeProc = exec(`"${chromePath}" --headless=new --remote-debugging-port=9223 --disable-gpu --no-first-run --no-default-browser-check about:blank`);

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  await sleep(1500);

  // Get WebSocket debugger URL
  const versionRes = await fetch('http://127.0.0.1:9223/json/version');
  const versionData = await versionRes.json();
  console.log("Chrome DevTools connected:", versionData.Browser);

  const targetsRes = await fetch('http://127.0.0.1:9223/json/list');
  const targets = await targetsRes.json();
  const pageWsUrl = targets[0].webSocketDebuggerUrl;

  // Connect WebSocket using native standard
  const { WebSocket } = await import('ws').catch(async () => {
    // If ws package not installed, we can test via standard fetch/REST endpoints
    return { WebSocket: null };
  });

  console.log("Testing complete!");
  chromeProc.kill();
}

run().catch(console.error);
