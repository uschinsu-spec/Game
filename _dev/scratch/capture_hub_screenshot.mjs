import http from 'http';
import fs from 'fs';
import path from 'path';

const artifactDir = 'C:\\Users\\nguye\\.gemini\\antigravity-ide\\brain\\60274eb9-0e6b-4458-8033-4464fa9576d7';

async function main() {
  console.log('Fetching CDP tabs...');
  let tab = null;
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json');
      const tabs = await res.json();
      tab = tabs.find(t => t.type === 'page' && t.url && t.url.includes('localhost:8080')) ||
            tabs.find(t => t.type === 'page');
      if (tab && tab.webSocketDebuggerUrl) break;
    } catch (e) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  if (!tab || !tab.webSocketDebuggerUrl) {
    console.log('No CDP tab found. Skipping screenshot capture.');
    return;
  }

  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  let msgId = 1;
  const send = (method, params = {}) => {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      const handler = (event) => {
        const data = JSON.parse(event.data);
        if (data.id === id) {
          ws.removeEventListener('message', handler);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  await new Promise(resolve => ws.addEventListener('open', resolve));
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.reload');
  await new Promise(r => setTimeout(r, 2000));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const outPath = path.join(artifactDir, 'game_single_hub_verified.png');
  fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
  console.log('Saved screenshot to:', outPath);
  ws.close();
}

main().catch(console.error);
