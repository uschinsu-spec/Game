// Ordered startup: dependencies must succeed before gameplay is evaluated.
(() => {
  'use strict';
  const sources = [
  "https://cdn.babylonjs.com/babylon.js",
  "https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js",
  "./assets/ui/ui-icons.js?v=20260915-stable-v8",
  "./game.js?v=20260915-stable-v8",
  "./assets/environment/terrain/tex_01_Grass_Lush.js?v=20260915-stable-v8",
  "./assets/environment/world/enhanced-world.js?v=20260915-stable-v8",
  "./assets/characters/rigged-player.js?v=20260915-stable-v8",
  "./assets/characters/player-animation-pro.js?v=20260915-stable-v8",
  "./assets/characters/player-upperbody-animation.js?v=20260915-stable-v8",
  "./assets/characters/player-combat-facing.js?v=20260915-stable-v8",
  "./assets/enemies/enemy-registry.js?v=20260915-stable-v8",
  "./assets/enemies/enemy-animation.js?v=20260915-stable-v8",
  "./assets/enemies/enemy-loader.js?v=20260915-stable-v8",
  "./assets/enemies/ultimate-monsters.js?v=20260915-stable-v8",
  "./idle-adventure.js?v=20260915-stable-v8",
  "./skill-vfx.js?v=20260915-stable-v8",
  "./progression-systems.js?v=20260915-stable-v8",
  "./mobile-runtime.js?v=20260915-stable-v8",
  "./mobile-controls-fix.js?v=20260915-stable-v8"
];
  const panel = document.createElement('section');
  panel.id = 'boot-status';
  panel.setAttribute('role', 'status');
  panel.style.cssText = 'position:fixed;inset:0;z-index:100000;background:#16222f;color:white;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;font:16px system-ui';
  const message = document.createElement('p');
  const retry = document.createElement('button');
  retry.textContent = 'Tải lại game';
  retry.hidden = true;
  retry.style.cssText = 'padding:12px 24px;font:inherit;border-radius:12px';
  retry.onclick = () => location.reload();
  panel.append(message, retry);
  document.body.appendChild(panel);
  let failed = false, current = '', timer;
  function fail(reason) {
    failed = true;
    clearTimeout(timer);
    panel.style.display = 'flex';
    retry.hidden = false;
    message.textContent = 'Không thể khởi động game: ' + reason + '. Hãy thử tải lại. Bản stable-v8.';
    if (window.GameRuntime) window.GameRuntime.engine.stopRenderLoop();
  }
  window.addEventListener('error', event => {
    if (!panel.isConnected || panel.style.display === 'none') return;
    fail(event.message || ('Không tải được ' + current));
  });
  function load(src) {
    return new Promise((resolve, reject) => {
      current = src;
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      timer = setTimeout(() => {
        // Do not evaluate another copy: a slow script can still arrive later.
        reject(new Error('Quá thời gian tải ' + src));
      }, 25000);
      script.onload = () => { clearTimeout(timer); resolve(); };
      script.onerror = () => { clearTimeout(timer); reject(new Error('Không tải được ' + src)); };
      document.head.appendChild(script);
    });
  }
  async function boot() {
    try {
      // Retire only this game's old worker; never erase another site's caches.
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration('./');
        if (registration && registration.scope === new URL('./', location.href).href) await registration.unregister();
      }
    } catch (error) { console.warn('[Boot] Worker cleanup', error); }
    try {
      for (let i = 0; i < sources.length; i++) {
        if (failed) return;
        message.textContent = 'Đang tải game ' + (i + 1) + '/' + sources.length;
        await load(sources[i]);
        if (failed) return;
        if (sources[i].startsWith('./game.js') && !window.GameRuntime) throw new Error('Không khởi tạo được đồ họa WebGL');
      }
      document.querySelectorAll('[data-ui-icon]').forEach(el => {
        const path = window.UI_ICONS && window.UI_ICONS[el.dataset.uiIcon];
        if (path) el.src = path;
      });
      const runtime = window.GameRuntime;
      if (!runtime) throw new Error('Thiếu GameRuntime');
      message.textContent = 'Đang dựng cảnh 3D…';
      timer = setTimeout(() => fail('Cảnh 3D chưa sẵn sàng sau 30 giây'), 30000);
      runtime.scene.onAfterRenderObservable.addOnce(() => {
        if (failed) return;
        clearTimeout(timer);
        panel.style.display = 'none';
      });
    } catch (error) { fail(error.message); console.error('[Boot]', error); }
  }
  message.textContent = 'Đang chuẩn bị game…';
  boot();
})();
