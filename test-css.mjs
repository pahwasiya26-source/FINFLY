import { exec } from 'child_process';

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const chromeProc = exec(`"${chromePath}" --headless=new --remote-debugging-port=9223 --disable-gpu --no-first-run --no-default-browser-check about:blank`);

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
async function fetchWithRetry(url, retries = 5) {
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
      await sleep(3000);
      
      const evalScript = `(() => {
        const main = document.querySelector('main');
        if (!main) return 'No main';
        const rect = main.getBoundingClientRect();
        const style = window.getComputedStyle(main);
        
        const child = main.firstElementChild;
        const childRect = child ? child.getBoundingClientRect() : null;
        const childStyle = child ? window.getComputedStyle(child) : null;
        
        return {
          main: { height: rect.height, opacity: style.opacity, display: style.display, visibility: style.visibility },
          child: child ? { height: childRect.height, opacity: childStyle.opacity, display: childStyle.display, visibility: childStyle.visibility } : 'No child'
        };
      })()`;
      
      const res = await send('Runtime.evaluate', { expression: evalScript, returnByValue: true });
      console.log('CSS TEST:', res.result.value);
      resolve();
    });
  });
  chromeProc.kill();
}
run().catch(e => { console.error(e); chromeProc.kill(); });
