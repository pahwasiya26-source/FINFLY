const { exec } = require('child_process');
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const chromeProc = exec(`"${chromePath}" --headless=new --remote-debugging-port=9223 --window-size=1280,800 --disable-gpu --no-first-run --no-default-browser-check about:blank`);

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
async function fetchWithRetry(url, retries = 10) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url); return await res.json();
    } catch (e) { await sleep(1000); }
  }
}

async function run() {
  const targets = await fetchWithRetry('http://127.0.0.1:9223/json/list');
  const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
  
  await new Promise(resolve => {
    ws.addEventListener('open', async () => {
      let id = 1;
      const send = (method, params) => {
        const msgId = id++;
        ws.send(JSON.stringify({ id: msgId, method, params }));
        return new Promise(r => {
          const handler = (event) => {
            const data = JSON.parse(event.data);
            if (data.id === msgId) { ws.removeEventListener('message', handler); r(data.result); }
          };
          ws.addEventListener('message', handler);
        });
      };

      await send('Runtime.enable', {});
      await send('Page.enable', {});
      await send('Page.navigate', { url: 'http://localhost:3000/investments' });
      await sleep(4000); // Wait for load
      
      const { data } = await send('Page.captureScreenshot', { format: 'png' });
      require('fs').writeFileSync('screenshot_investments.png', Buffer.from(data, 'base64'));
      console.log('Screenshot saved to screenshot_investments.png');

      await send('Page.navigate', { url: 'http://localhost:3000/financial-twin' });
      await sleep(4000); // Wait for load
      
      const res2 = await send('Page.captureScreenshot', { format: 'png' });
      require('fs').writeFileSync('screenshot_twin.png', Buffer.from(res2.data, 'base64'));
      console.log('Screenshot saved to screenshot_twin.png');

      resolve();
    });
  });
  chromeProc.kill();
}
run().catch(e => { console.error(e); chromeProc.kill(); });
