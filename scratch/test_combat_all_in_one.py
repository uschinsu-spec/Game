import asyncio
import base64
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.request
import websockets

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

artifact_dir = r"C:\Users\nguye\.gemini\antigravity-ide\brain\599cf26d-283e-4472-af74-791320832a92"
os.makedirs(artifact_dir, exist_ok=True)

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
temp_profile = os.path.join(tempfile.gettempdir(), f"chrome_game_{int(time.time())}")

async def main():
    cmd = [
        chrome_path,
        "--remote-debugging-port=9222",
        "--headless=new",
        "--window-size=540,960",
        "--disable-gpu",
        "--no-sandbox",
        f"--user-data-dir={temp_profile}",
        "http://127.0.0.1:8088/"
    ]

    print("Launching Chrome pointing to http://127.0.0.1:8088/...")
    proc = subprocess.Popen(cmd)
    
    ws_url = None
    for attempt in range(30):
        await asyncio.sleep(0.5)
        try:
            req = urllib.request.urlopen("http://127.0.0.1:9222/json", timeout=2)
            tabs = json.loads(req.read().decode())
            page_tab = next((t for t in tabs if t.get("type") == "page" and "8088" in t.get("url", "")), None)
            if not page_tab:
                page_tab = next((t for t in tabs if t.get("type") == "page"), None)
            if page_tab and page_tab.get("webSocketDebuggerUrl"):
                ws_url = page_tab["webSocketDebuggerUrl"]
                print("Connected to tab WS:", page_tab["url"])
                break
        except Exception as e:
            pass

    if not ws_url:
        proc.terminate()
        raise RuntimeError("Could not find WebSocket URL for Chrome tab")

    async with websockets.connect(ws_url, max_size=20*1024*1024) as ws:
        msg_id = 1

        async def send(method, params=None):
            nonlocal msg_id
            cid = msg_id
            msg_id += 1
            payload = {"id": cid, "method": method, "params": params or {}}
            await ws.send(json.dumps(payload))
            while True:
                resp = await ws.recv()
                data = json.loads(resp)
                if data.get("id") == cid:
                    if "error" in data:
                        raise RuntimeError(f"CDP Error in {method}: {data['error']}")
                    return data.get("result", {})

        async def evaluate(expr):
            res = await send("Runtime.evaluate", {
                "expression": expr,
                "returnByValue": True,
                "awaitPromise": True
            })
            if "exceptionDetails" in res:
                print("Eval Exception:", res["exceptionDetails"].get("exception", {}).get("description") or res["exceptionDetails"].get("text"))
            return res.get("result", {}).get("value")

        async def capture_screenshot(filename):
            res = await send("Page.captureScreenshot", {"format": "png"})
            img_data = base64.b64decode(res["data"])
            filepath = os.path.join(artifact_dir, filename)
            with open(filepath, "wb") as f:
                f.write(img_data)
            print(f"Saved screenshot: {filename} ({len(img_data)} bytes)")

        await send("Runtime.enable")
        await send("Page.enable")

        print("Navigating to http://127.0.0.1:8088/...")
        await send("Page.navigate", {"url": "http://127.0.0.1:8088/"})

        # Poll until Phaser scene and player are loaded
        print("Waiting for game scene and player to load...")
        for i in range(35):
            res = await evaluate("""
                (() => {
                    const game = window.game;
                    if (!game || !game.scene) return 'no_game';
                    const scene = game.scene.getScene('MainGameScene') || (game.scene.scenes && game.scene.scenes[0]);
                    if (!scene) return 'no_scene';
                    if (!scene.player) return 'no_player';
                    return 'ready';
                })()
            """)
            print(f"Scene status (poll {i}): {res}")
            if res == 'ready':
                break
            await asyncio.sleep(1)

        await asyncio.sleep(2)
        await capture_screenshot("combat_demo_1_welcome.png")

        # 1. Close modal / Start Game
        print("Dismissing welcome modal / entering village...")
        await evaluate("""
            (() => {
                const scene = window.game.scene.getScene('MainGameScene') || window.game.scene.scenes[0];
                if (scene.closeModal) scene.closeModal();
            })()
        """)
        await asyncio.sleep(1)
        await capture_screenshot("combat_demo_2_village.png")

        # 2. Switch to Combat Map 1 (Ngoai Vi Thanh Van Thon)
        print("Switching to Combat Map 1 (Ngoai Vi)...")
        map_info = await evaluate("""
            (() => {
                const scene = window.game.scene.getScene('MainGameScene') || window.game.scene.scenes[0];
                scene.switchMap(1);
                scene.player.x = 240;
                scene.player.y = 350;
                return {
                    mapId: scene.currentMap.id,
                    mapName: scene.currentMap.name,
                    enemiesCount: scene.enemies.length
                };
            })()
        """)
        print("Map Info:", map_info)
        await asyncio.sleep(2)

        # 3. Approach Enemy
        print("Approaching active monster in combat zone...")
        enemy_info = await evaluate("""
            (() => {
                const scene = window.game.scene.getScene('MainGameScene') || window.game.scene.scenes[0];
                const enemy = scene.enemies.find(e => e.active && !e.isDead);
                if (enemy) {
                    scene.player.x = enemy.x - 55;
                    scene.player.y = enemy.y;
                    return {
                        name: enemy.name || enemy.type || 'Monster',
                        x: Math.round(enemy.x),
                        y: Math.round(enemy.y),
                        hp: enemy.hp,
                        maxHp: enemy.maxHp
                    };
                }
                return null;
            })()
        """)
        print("Target Monster:", enemy_info)
        await asyncio.sleep(1)
        await capture_screenshot("combat_demo_3_approach_monster.png")

        # 4. Attack Monster with Sword Skills & Basic Attacks
        print("Attacking monster with sword skills and basic attack...")
        for _ in range(4):
            await evaluate("""
                (() => {
                    const scene = window.game.scene.getScene('MainGameScene') || window.game.scene.scenes[0];
                    const enemy = scene.enemies.find(e => e.active && !e.isDead);
                    if (enemy) {
                        scene.player.x = enemy.x - 45;
                        scene.player.y = enemy.y;
                        if (scene.castSkill) scene.castSkill(0);
                        if (scene.basicAttack) scene.basicAttack();
                        if (scene.damageEnemy) {
                            scene.damageEnemy(enemy, Math.floor(enemy.maxHp * 0.3) + 12, false, null);
                        }
                    }
                })()
            """)
            await asyncio.sleep(0.3)
        await capture_screenshot("combat_demo_4_attacking.png")

        # 5. Kill Monster & Spawn Loot Drop
        print("Defeating monster and spawning ground loot drop...")
        kill_info = await evaluate("""
            (() => {
                const scene = window.game.scene.getScene('MainGameScene') || window.game.scene.scenes[0];
                const enemy = scene.enemies.find(e => e.active && !e.isDead);
                if (enemy) {
                    enemy.hp = 0;
                    if (scene.killEnemy) {
                        scene.killEnemy(enemy, 'player');
                        return { killed: true, type: enemy.type };
                    }
                }
                return { killed: false };
            })()
        """)
        print("Kill Info:", kill_info)
        await asyncio.sleep(0.7)
        await capture_screenshot("combat_demo_5_monster_killed_loot.png")

        # 6. Auto-Loot collection and floating reward text
        print("Auto-collecting loot and recording floating reward text...")
        await asyncio.sleep(2.0)
        await capture_screenshot("combat_demo_6_looted.png")

        print("=== Combat and Monster Kill Automation Completed 100%! ===")

    proc.terminate()
    try:
        shutil.rmtree(temp_profile, ignore_errors=True)
    except:
        pass

if __name__ == "__main__":
    asyncio.run(main())
