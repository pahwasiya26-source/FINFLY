import { exec } from 'child_process';

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
      
      // Force Light theme by injecting localStorage
      await send('Page.navigate', { url: 'http://localhost:3000/investments' });
      await sleep(1000);
      await send('Runtime.evaluate', { expression: "localStorage.setItem('theme', 'light');" });
      await send('Page.navigate', { url: 'http://localhost:3000/investments' });
      await sleep(4000); // Wait for load
      
      const evalScript = `(() => {
        const h1 = document.querySelector('h1');
        const main = document.querySelector('main');
        if (!h1) return 'No h1';
        
        const h1Style = window.getComputedStyle(h1);
        const mainStyle = window.getComputedStyle(main);
        
        return {
          h1: { color: h1Style.color, background: h1Style.backgroundColor },
          main: { color: mainStyle.color, background: mainStyle.backgroundColor, opacity: mainStyle.opacity },
          htmlTheme: document.documentElement.getAttribute('data-theme')
        };
      })()`;
      
      const res = await send('Runtime.evaluate', { expression: evalScript, returnByValue: true });
      console.log('COLOR TEST:', res.result.value);
      resolve();
    });
  });
  chromeProc.kill();
}
run().catch(e => { console.error(e); chromeProc.kill(); });
