import { exec } from 'child_process';
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const chromeProc = exec(`"${chromePath}" --headless=new --remote-debugging-port=9223 --window-size=1280,800 --disable-gpu --no-first-run --no-default-browser-check about:blank`);

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
async function fetchWithRetry(url, retries = 10) {
  for (let i = 0; i < retries; i++) {
    try { const res = await fetch(url); return await res.json(); } catch (e) { await sleep(1000); }
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
      await send('Log.enable', {});

      const routes = [
        '/', '/money-flow', '/investments', '/business', '/taxes', 
        '/financial-twin', '/finance-controller', '/ai-cfo', '/reports', 
        '/ai-agents', '/privacy-center', '/settings',
        '/digital-twin', '/reconciliation', '/agents', '/privacy'
      ];
      
      const results = {};
      
      for (const route of routes) {
        let errors = [];
        const logHandler = (e) => {
          const msg = JSON.parse(e.data);
          if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
            errors.push(msg.params.args.map(a => a.value || a.description).join(' '));
          }
          if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
             errors.push(msg.params.entry.text);
          }
        };
        ws.addEventListener('message', logHandler);
        
        await send('Page.navigate', { url: 'http://localhost:3000' + route });
        await sleep(2500); // Wait for load and animations
        
        const evalScript = `(() => {
          const main = document.querySelector('.main-content-scroll');
          if (!main) return { error: 'No main content scroll found' };
          
          const rect = main.getBoundingClientRect();
          const hasVisibleContent = main.children.length > 0 && rect.height > 50;
          
          const h1 = document.querySelector('h1');
          const hasH1 = !!h1;
          
          const activeSidebar = document.querySelector('.desktop-sidebar a[data-active="true"]');
          const activePath = activeSidebar ? activeSidebar.getAttribute('href') : null;
          
          const isOverflowing = main.scrollWidth > main.clientWidth;
          
          return {
            hasVisibleContent,
            contentHeight: rect.height,
            contentWidth: rect.width,
            hasH1,
            h1Text: h1 ? h1.innerText : '',
            activePath,
            isOverflowing,
            bodyColor: window.getComputedStyle(document.body).backgroundColor,
            textColor: h1 ? window.getComputedStyle(h1).color : window.getComputedStyle(document.body).color
          };
        })()`;
        
        const res = await send('Runtime.evaluate', { expression: evalScript, returnByValue: true });
        
        ws.removeEventListener('message', logHandler);
        results[route] = {
          eval: res.result ? res.result.value : res,
          errors: errors
        };
      }
      
      console.log(JSON.stringify(results, null, 2));
      resolve();
    });
  });
  chromeProc.kill();
}
run().catch(e => { console.error(e); chromeProc.kill(); });
