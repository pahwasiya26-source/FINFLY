import { exec } from 'child_process';

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const chromeProc = exec(`"${chromePath}" --headless=new --remote-debugging-port=9223 --disable-gpu --no-first-run --no-default-browser-check about:blank`);

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchWithRetry(url, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      return await res.json();
    } catch (e) {
      await sleep(1000);
    }
  }
  throw new Error("Failed to fetch " + url);
}

async function run() {
  console.log("Waiting for chrome...");
  const targets = await fetchWithRetry('http://127.0.0.1:9223/json/list');
  const pageWsUrl = targets[0].webSocketDebuggerUrl;

  const ws = new WebSocket(pageWsUrl);
  
  await new Promise(resolve => {
    ws.addEventListener('open', async () => {
      let id = 1;
      const send = (method, params) => {
        const msgId = id++;
        ws.send(JSON.stringify({ id: msgId, method, params }));
        return new Promise(r => {
          const handler = (event) => {
            const data = JSON.parse(event.data);
            if (data.id === msgId) {
              ws.removeEventListener('message', handler);
              r(data.result);
            }
          };
          ws.addEventListener('message', handler);
        });
      };

      ws.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        if (data.method === 'Runtime.consoleAPICalled') {
          console.log('BROWSER CONSOLE:', data.params.args.map(a => a.value || a.description));
        }
        if (data.method === 'Runtime.exceptionThrown') {
          console.log('BROWSER EXCEPTION:', data.params.exceptionDetails.exception.description);
        }
      });

      await send('Runtime.enable', {});
      await send('Page.enable', {});
      
      console.log("Navigating...");
      await send('Page.navigate', { url: 'http://localhost:3000/investments' });
      await sleep(5000); // Wait for hydration and errors
      
      const dom = await send('Runtime.evaluate', {
        expression: 'document.querySelector("main") ? document.querySelector("main").innerHTML : "NO MAIN TAG"',
        returnByValue: true
      });
      console.log('MAIN DOM LENGTH:', dom.result.value.length);
      
      resolve();
    });
  });

  chromeProc.kill();
  process.exit(0);
}
run().catch(e => { console.error(e); chromeProc.kill(); process.exit(1); });
