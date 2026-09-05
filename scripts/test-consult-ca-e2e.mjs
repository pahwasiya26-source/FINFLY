import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const artifactsDir = "/Users/siyapahwa/.gemini/antigravity-ide/brain/e151a797-5b83-41be-a5da-be7c9fdf17cf";
const profileDir = "/tmp/finfly-chrome-e2e-profile-full";

if (!fs.existsSync(profileDir)) {
  fs.mkdirSync(profileDir, { recursive: true });
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchWithRetry(url, retries = 20) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      return await res.json();
    } catch {
      await sleep(500);
    }
  }
  throw new Error("Could not connect to Chrome DevTools port");
}

class CDPRunner {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
    this.consoleLogs = [];
    this.networkRequests = [];
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = reject;
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        } else if (msg.method) {
          if (msg.method === 'Runtime.consoleAPICalled') {
            const args = msg.params.args.map(a => a.value || a.description).join(' ');
            this.consoleLogs.push({ type: msg.params.type, text: args });
          } else if (msg.method === 'Runtime.exceptionThrown') {
            this.consoleLogs.push({ type: 'exception', text: msg.params.exceptionDetails?.text || 'Exception' });
          } else if (msg.method === 'Network.requestWillBeSent') {
            this.networkRequests.push({
              url: msg.params.request.url,
              method: msg.params.request.method,
            });
          }
        }
      };
    });
  }

  async send(method, params = {}) {
    const msgId = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(msgId, { resolve, reject });
      this.ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.value;
  }

  async captureScreenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    if (res?.data) {
      const buffer = Buffer.from(res.data, 'base64');
      fs.writeFileSync(path.join(artifactsDir, filename), buffer);
      console.log(`  [Screenshot saved]: ${filename}`);
    }
  }

  async setViewport(width, height, isMobile = false) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 2,
      mobile: isMobile,
      screenOrientation: isMobile
        ? { angle: 0, type: 'portraitPrimary' }
        : { angle: 0, type: 'landscapePrimary' },
    });
  }
}

async function runE2E() {
  console.log("=== STARTING FULL CONSULT CA / AI FINANCE AGENT AUDIT & E2E TEST ===");

  const chromeProc = exec(
    `"${chromePath}" --headless=new --remote-debugging-port=9229 --user-data-dir="${profileDir}" --window-size=1440,900 --disable-gpu --no-first-run --no-default-browser-check about:blank`
  );

  try {
    const targets = await fetchWithRetry('http://127.0.0.1:9229/json/list');
    const pageTarget = targets.find(t => t.type === 'page') || targets[0];
    const cdp = new CDPRunner(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Network.enable');

    // 1. Authenticate via dev session cookie
    console.log("\n[1] Navigating to /personal-ca with dev session...");
    await cdp.send('Network.setCookie', {
      name: 'finfly_session',
      value: 'true',
      domain: 'localhost',
      path: '/',
    });

    await cdp.send('Page.navigate', { url: 'http://localhost:3000/personal-ca' });
    await sleep(2500);

    const submitQuery = async (queryText) => {
      return await cdp.evaluate(`
        (() => {
          const input = document.querySelector('input[placeholder*="Ask your Personal CA"]');
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          nativeInputValueSetter.call(input, ${JSON.stringify(queryText)});
          input.dispatchEvent(new Event('input', { bubbles: true }));
          const btn = document.querySelector('button[type="submit"]');
          btn.click();
          return { clicked: true, val: input.value };
        })()
      `);
    };

    // 2. PART A: Test EMPTY Workspace Mode
    console.log("\n[2] Part A: Testing EMPTY workspace mode...");
    cdp.networkRequests = [];

    await submitQuery('How much runway do I have?');
    await sleep(2000);

    const emptyResult = await cdp.evaluate(`
      (() => {
        const text = document.body.innerText;
        const badges = Array.from(document.querySelectorAll('.ca-layout-grid .pill-badge')).map(el => el.innerText);
        const metrics = Array.from(document.querySelectorAll('.ca-layout-grid [style*="Outfit"]')).map(el => el.innerText);
        return {
          intent: badges.find(b => b.includes('Intent:')),
          hasInsufficientText: text.includes('does not contain any recorded financial accounts') || text.includes('Insufficient Ledger Data'),
          metrics,
          hasActivateBtn: text.includes('Activate Demo Sandbox') || text.includes('Load Demo Data')
        };
      })()
    `);
    console.log("  EMPTY Mode Evaluation:", emptyResult);
    await cdp.captureScreenshot('consult_ca_empty_mode.png');

    // 3. PART B: Activate DEMO Workspace Sandbox
    console.log("\n[3] Part B: Activating DEMO workspace sandbox...");
    await cdp.evaluate(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Load Demo Data') || b.innerText.includes('Activate Demo Sandbox'));
        if (btn) btn.click();
      })()
    `);
    await sleep(1500);

    const demoActivated = await cdp.evaluate(`
      (() => {
        return {
          badgeText: Array.from(document.querySelectorAll('.pill-badge')).map(el => el.innerText).find(t => t.includes('Demo')),
        };
      })()
    `);
    console.log("  DEMO Mode Status:", demoActivated);

    // 4. Test 7 Realistic Questions in DEMO Mode

    // Q1: "What is my current financial position?"
    console.log("\n[4.1] Testing Query: 'What is my current financial position?'...");
    await submitQuery('What is my current financial position?');
    await sleep(2500);
    const q1 = await cdp.evaluate(`
      (() => {
        const text = document.body.innerText;
        const badges = Array.from(document.querySelectorAll('.ca-layout-grid .pill-badge')).map(el => el.innerText);
        const metrics = Array.from(document.querySelectorAll('.ca-layout-grid [style*="Outfit"]')).map(el => el.innerText);
        return {
          intent: badges.find(b => b.includes('Intent:')),
          grounded: badges.find(b => b.includes('GROUNDED')),
          netPositionMetric: metrics.find(m => m.includes('35,00,000')),
          metricsCount: metrics.length
        };
      })()
    `);
    console.log("  Q1 Result:", q1);
    await cdp.captureScreenshot('consult_ca_q1_position.png');

    // Q2: "How much runway do I have?"
    console.log("\n[4.2] Testing Query: 'How much runway do I have?'...");
    await submitQuery('How much runway do I have?');
    await sleep(2500);
    const q2 = await cdp.evaluate(`
      (() => {
        const badges = Array.from(document.querySelectorAll('.ca-layout-grid .pill-badge')).map(el => el.innerText);
        const metrics = Array.from(document.querySelectorAll('.ca-layout-grid [style*="Outfit"]')).map(el => el.innerText);
        return {
          intent: badges.find(b => b.includes('Intent:')),
          grounded: badges.find(b => b.includes('GROUNDED')),
          runwayMetric: metrics.find(m => m.includes('4.7 Months')),
          cashMetric: metrics.find(m => m.includes('4,50,000')),
        };
      })()
    `);
    console.log("  Q2 Result:", q2);
    await cdp.captureScreenshot('consult_ca_q2_runway.png');

    // Q3: "Where is my cash going?"
    console.log("\n[4.3] Testing Query: 'Where is my cash going?'...");
    await submitQuery('Where is my cash going?');
    await sleep(2500);
    const q3 = await cdp.evaluate(`
      (() => {
        const text = document.body.innerText;
        const badges = Array.from(document.querySelectorAll('.ca-layout-grid .pill-badge')).map(el => el.innerText);
        const metrics = Array.from(document.querySelectorAll('.ca-layout-grid [style*="Outfit"]')).map(el => el.innerText);
        return {
          intent: badges.find(b => b.includes('Intent:')),
          grounded: badges.find(b => b.includes('GROUNDED')),
          outflowMetric: metrics.find(m => m.includes('95,000')),
          hasTravelVariance: text.includes('Travel') || text.includes('Variance'),
        };
      })()
    `);
    console.log("  Q3 Result:", q3);
    await cdp.captureScreenshot('consult_ca_q3_spending.png');

    // Q4: "Are there unusual transactions?"
    console.log("\n[4.4] Testing Query: 'Are there unusual transactions?'...");
    await submitQuery('Are there unusual transactions?');
    await sleep(2500);
    const q4 = await cdp.evaluate(`
      (() => {
        const text = document.body.innerText;
        const badges = Array.from(document.querySelectorAll('.ca-layout-grid .pill-badge')).map(el => el.innerText);
        return {
          intent: badges.find(b => b.includes('Intent:')),
          grounded: badges.find(b => b.includes('GROUNDED')),
          hasVarianceSignal: text.includes('variance signal') || text.includes('Travel Spending'),
        };
      })()
    `);
    console.log("  Q4 Result:", q4);
    await cdp.captureScreenshot('consult_ca_q4_anomalies.png');

    // Q5: "How much tax should I plan for?"
    console.log("\n[4.5] Testing Query: 'How much tax should I plan for?'...");
    await submitQuery('How much tax should I plan for?');
    await sleep(2500);
    const q5 = await cdp.evaluate(`
      (() => {
        const text = document.body.innerText;
        const badges = Array.from(document.querySelectorAll('.ca-layout-grid .pill-badge')).map(el => el.innerText);
        return {
          intent: badges.find(b => b.includes('Intent:')),
          grounded: badges.find(b => b.includes('PROJECTION ESTIMATE')),
          hasTaxSlabs: text.includes('New Tax Regime') || text.includes('Estimated Tax'),
        };
      })()
    `);
    console.log("  Q5 Result:", q5);
    await cdp.captureScreenshot('consult_ca_q5_taxes.png');

    // Q6: "What happens if my monthly expenses increase by ₹50,000?"
    console.log("\n[4.6] Testing Query: 'What happens if my monthly expenses increase by ₹50,000?'...");
    await submitQuery('What happens if my monthly expenses increase by ₹50,000?');
    await sleep(2500);
    const q6 = await cdp.evaluate(`
      (() => {
        const text = document.body.innerText;
        const badges = Array.from(document.querySelectorAll('.ca-layout-grid .pill-badge')).map(el => el.innerText);
        const hasStagedAction = text.includes('Staged Action') && text.includes('Authorize & Execute');
        return {
          intent: badges.find(b => b.includes('Intent:')),
          grounded: badges.find(b => b.includes('PROJECTION ESTIMATE')),
          hasStagedAction,
          hasDelta: text.includes('Trajectory Delta') || text.includes('Baseline')
        };
      })()
    `);
    console.log("  Q6 Result:", q6);
    await cdp.captureScreenshot('consult_ca_q6_scenario.png');

    // Q7: "Summarize my financial situation."
    console.log("\n[4.7] Testing Query: 'Summarize my financial situation.'...");
    await submitQuery('Summarize my financial situation.');
    await sleep(2500);
    const q7 = await cdp.evaluate(`
      (() => {
        const badges = Array.from(document.querySelectorAll('.ca-layout-grid .pill-badge')).map(el => el.innerText);
        const metrics = Array.from(document.querySelectorAll('.ca-layout-grid [style*="Outfit"]')).map(el => el.innerText);
        return {
          intent: badges.find(b => b.includes('Intent:')),
          grounded: badges.find(b => b.includes('GROUNDED')),
          hasHealthScore: metrics.some(m => m.includes('/100') || m.includes('88')),
        };
      })()
    `);
    console.log("  Q7 Result:", q7);
    await cdp.captureScreenshot('consult_ca_q7_summary.png');

    // 5. Test Decision Trace Expansion
    console.log("\n[5] Testing Auditable Decision Trace Inspector...");
    const toggleResult = await cdp.evaluate(`
      (() => {
        const toggleBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Inspect Auditable Decision Trace'));
        if (toggleBtn) {
          toggleBtn.click();
          return { found: true };
        }
        return { found: false };
      })()
    `);
    console.log("  Toggle button click:", toggleResult);
    await sleep(800);

    const traceInspector = await cdp.evaluate(`
      (() => {
        const text = document.body.textContent || '';
        const hasTools = text.includes('Tool: getFinancialOverview()');
        const hasSource = text.includes('Source:');
        const hasFormula = text.includes('Formula:');
        window.scrollTo(0, document.body.scrollHeight);
        return {
          hasTools,
          hasSource,
          hasFormula
        };
      })()
    `);
    console.log("  Decision Trace inspector check:", traceInspector);
    await sleep(400);
    await cdp.captureScreenshot('consult_ca_decision_trace_inspector.png');

    // 6. Test Staged Action Human Authorization Button
    console.log("\n[6] Testing Human Authorization on Staged Action...");
    await submitQuery('What happens if my monthly expenses increase by ₹50,000?');
    await sleep(2500);

    const stagedClick = await cdp.evaluate(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Authorize & Execute'));
        if (btn) {
          btn.click();
          return { clicked: true };
        }
        return { clicked: false };
      })()
    `);
    await sleep(600);

    const authToast = await cdp.evaluate(`
      (() => {
        return {
          hasSuccessToast: document.body.innerText.includes('authorized by human controller')
        };
      })()
    `);
    console.log("  Human authorization check:", authToast);
    await cdp.captureScreenshot('consult_ca_human_authorization.png');

    // 7. Check Browser Console Log Health
    console.log("\n[7] Checking Browser Console Health...");
    const errorLogs = cdp.consoleLogs.filter(l => l.type === 'error' || l.type === 'exception');
    console.log(`  Total Console Logs: ${cdp.consoleLogs.length}`);
    console.log(`  Console Errors: ${errorLogs.length}`);
    if (errorLogs.length > 0) {
      console.log("  Errors found:", errorLogs);
    }

    console.log("\n=== ALL E2E VERIFICATIONS COMPLETE ===");
  } finally {
    chromeProc.kill();
  }
}

runE2E().catch((err) => {
  console.error("E2E Test Failed:", err);
  process.exit(1);
});
