// Ordered startup: dependencies must succeed before gameplay is evaluated.
(() => {
  'use strict';
  const BUILD = '20260915-mobile-opt-v11';
  const v = `?v=${BUILD}`;
  const sources = [
    'https://cdn.babylonjs.com/babylon.js',
    'https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js',
    `./assets/ui/ui-icons.js${v}`,
    `./game.js${v}`,
    `./assets/environment/terrain/tex_01_Grass_Lush.js${v}`,
    `./assets/environment/world/enhanced-world.js${v}`,
    `./assets/characters/rigged-player.js${v}`,
    `./assets/characters/player-animation-pro.js${v}`,
    `./assets/characters/player-upperbody-animation.js${v}`,
    `./assets/characters/player-combat-facing.js${v}`,
    `./assets/enemies/enemy-registry.js${v}`,
    `./assets/enemies/enemy-animation.js${v}`,
    `./assets/enemies/enemy-loader.js${v}`,
    `./assets/enemies/ultimate-monsters.js${v}`,
    `./idle-adventure.js${v}`,
    `./skill-vfx.js${v}`,
    `./progression-systems.js${v}`,
    `./mobile-runtime.js${v}`,
    `./mobile-controls-fix.js${v}`
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
    message.textContent = `Không thể khởi động game: ${reason}. Hãy thử tải lại. Bản ${BUILD}.`;
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
      timer = setTimeout(() => reject(new Error('Quá thời gian tải ' + src)), 25000);
      script.onload = () => { clearTimeout(timer); resolve(); };
      script.onerror = () => { clearTimeout(timer); reject(new Error('Không tải được ' + src)); };
      document.head.appendChild(script);
    });
  }

  async function boot() {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.filter(r => r.scope === new URL('./', location.href).href).map(r => r.unregister()));
      }
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.filter(name => name.startsWith('tu-tien-')).map(name => caches.delete(name)));
      }
    } catch (error) {
      console.warn('[Boot] Cache cleanup', error);
    }

    try {
      for (let i = 0; i < sources.length; i++) {
        if (failed) return;
        message.textContent = `Đang tải game ${i + 1}/${sources.length}`;
        await load(sources[i]);
        if (failed) return;
        if (sources[i].includes('./game.js') && !window.GameRuntime) throw new Error('Không khởi tạo được đồ họa WebGL');
      }

      document.querySelectorAll('[data-ui-icon]').forEach(el => {
        const path = window.UI_ICONS && window.UI_ICONS[el.dataset.uiIcon];
        if (path) el.src = `${path}${path.includes('?') ? '&' : '?'}v=${BUILD}`;
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
    } catch (error) {
      fail(error.message);
      console.error('[Boot]', error);
    }
  }

  message.textContent = 'Đang chuẩn bị game…';
  boot();
})();
