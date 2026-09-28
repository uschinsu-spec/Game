import fs from 'fs';
import path from 'path';

const artifactDir = 'C:\\Users\\nguye\\.gemini\\antigravity-ide\\brain\\599cf26d-283e-4472-af74-791320832a92';

async function main() {
  console.log('Fetching CDP tabs...');
  let tab = null;
  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json');
      tab = tabs.find(t => t.type === 'page' && t.url && t.url.includes('localhost:8080')) ||
            tabs.find(t => t.type === 'page');
      if (tab && tab.webSocketDebuggerUrl) break;
    } catch (e) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  if (!tab || !tab.webSocketDebuggerUrl) {
    throw new Error('No target tab found after polling');
  }
  console.log('Connecting to tab:', tab.url, tab.webSocketDebuggerUrl);

  const ws = new WebSocket(tab.webSocketDebuggerUrl);

  let msgId = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.method === 'Runtime.consoleAPICalled') {
      const args = data.params.args.map(a => a.value || a.description || '').join(' ');
      console.log(`[Browser Console ${data.params.type}]:`, args);
    }
    if (data.method === 'Runtime.exceptionThrown') {
      console.error('[Browser Uncaught Exception]:', data.params.exceptionDetails?.exception?.description || data.params.exceptionDetails?.text);
    }
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  console.log('WebSocket connected.');

  function send(method, params = {}) {
    const id = msgId++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Runtime.enable');
  await send('Page.enable');

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      console.error('Eval error:', res.exceptionDetails.exception?.description || res.exceptionDetails.text);
    }
    return res.result?.value;
  }

  async function captureScreenshot(filename) {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const outPath = path.join(artifactDir, filename);
    fs.writeFileSync(outPath, buffer);
    console.log(`Saved screenshot: ${filename} (${buffer.length} bytes)`);
  }

  // Navigate to URL
  console.log('Navigating to http://localhost:8080/...');
  await send('Page.navigate', { url: 'http://localhost:8080/' });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Wait for game to initialize
  console.log('Waiting for Phaser scene and player...');
  for (let i = 0; i < 30; i++) {
    const status = await evaluate(`
      (() => {
        const game = window.game;
        if (!game || !game.scene) return 'no_game';
        const scene = game.scene.getScene('MainGameScene') || (game.scene.scenes && game.scene.scenes[0]);
        if (!scene) return 'no_scene';
        if (!scene.player) return 'no_player';
        return 'ready';
      })()
    `);
    console.log('Poll ' + i + ': ' + status);
    if (status === 'ready') break;
    await new Promise(r => setTimeout(r, 1000));
  }

  await new Promise(r => setTimeout(r, 1500));
  await captureScreenshot('combat_demo_1_welcome.png');

  // 2. Dismiss welcome screen or start new game
  console.log('Dismissing welcome screen...');
  await evaluate(`
    (() => {
      const scene = window.game.scene.getScene('MainGameScene') || window.game.scene.scenes[0];
      if (scene && scene.closeModal) {
        scene.closeModal();
      }
      return true;
    })()
  `);
  await new Promise(r => setTimeout(r, 800));
  await captureScreenshot('combat_demo_2_village.png');

  // 3. Switch to Combat Map (Map 1 - Ngoại Vi Thanh Vân Thôn)
  console.log('Switching to combat map 1 (Ngoại Vi Thanh Vân Thôn)...');
  const mapSwitchResult = await evaluate(`
    (() => {
      const scene = window.game.scene.getScene('MainGameScene') || window.game.scene.scenes[0];
      scene.switchMap(1);
      scene.player.x = 260;
      scene.player.y = 360;
      return { mapId: scene.currentMap.id, enemies: scene.enemies ? scene.enemies.length : 0 };
    })()
  `);
  console.log('Map switch result:', mapSwitchResult);
  await new Promise(r => setTimeout(r, 1500));

  // 4. Locate an active enemy and move player near it
  console.log('Moving player near monster...');
  const enemyInfo = await evaluate(`
    (() => {
      const scene = window.game.scene.getScene('MainGameScene') || window.game.scene.scenes[0];
      const enemy = scene.enemies && scene.enemies.find(e => e.active && !e.isDead);
      if (enemy) {
        scene.player.x = enemy.x - 65;
        scene.player.y = enemy.y;
        return { name: enemy.name || enemy.type || 'Yêu Thú', x: enemy.x, y: enemy.y, hp: enemy.hp, maxHp: enemy.maxHp };
      }
      return null;
    })()
  `);
  console.log('Target Enemy Info:', enemyInfo);
  await new Promise(r => setTimeout(r, 800));
  await captureScreenshot('combat_demo_3_approach_monster.png');

  // 5. Attack the monster
  console.log('Executing attacks on monster...');
  for (let i = 0; i < 4; i++) {
    await evaluate(`
      (() => {
        const scene = window.game.scene.getScene('MainGameScene') || window.game.scene.scenes[0];
        const enemy = scene.enemies && scene.enemies.find(e => e.active && !e.isDead);
        if (enemy) {
          scene.player.x = enemy.x - 55;
          scene.player.y = enemy.y;
          if (scene.castSkill) scene.castSkill(0);
          if (scene.basicAttack) scene.basicAttack();
          if (scene.damageEnemy) {
            scene.damageEnemy(enemy, Math.floor(enemy.maxHp * 0.35) + 15, false, null);
          }
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 250));
  }
  await new Promise(r => setTimeout(r, 300));
  await captureScreenshot('combat_demo_4_attacking.png');

  // 6. Kill the monster, trigger loot drop & floating texts
  console.log('Defeating monster and spawning drop...');
  const killResult = await evaluate(`
    (() => {
      const scene = window.game.scene.getScene('MainGameScene') || window.game.scene.scenes[0];
      const enemy = scene.enemies && scene.enemies.find(e => e.active && !e.isDead);
      if (enemy) {
        enemy.hp = 0;
        if (scene.killEnemy) {
          scene.killEnemy(enemy, 'player');
          return { killed: true, enemyType: enemy.vanMocAsset || enemy.type };
        }
      }
      return { killed: false };
    })()
  `);
  console.log('Kill result:', killResult);
  await new Promise(r => setTimeout(r, 600));
  await captureScreenshot('combat_demo_5_monster_killed_loot.png');

  // 7. Auto-loot / collection animation
  await new Promise(r => setTimeout(r, 1500));
  await captureScreenshot('combat_demo_6_looted.png');

  console.log('All gameplay & combat phases completed successfully!');
  ws.close();
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
