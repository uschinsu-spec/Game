// Fast boot: parallel dependency groups, persistent browser cache, background non-critical startup.
(() => {
  'use strict';
  const BUILD = '20260915-fastboot-v19';
  const v = `?v=${BUILD}`;
  const groups = [
    ['https://cdn.babylonjs.com/babylon.js'],
    ['https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js'],
    [`./assets/ui/ui-icons.js${v}`,`./game.js${v}`],
    [`./assets/environment/terrain/tex_01_Grass_Lush.js${v}`,`./assets/environment/world/enhanced-world.js${v}`],
    [`./assets/characters/rigged-player.js${v}`,`./assets/characters/player-animation-pro.js${v}`,`./assets/characters/player-upperbody-animation.js${v}`,`./assets/characters/player-combat-facing.js${v}`],
    [`./assets/enemies/enemy-registry.js${v}`,`./assets/enemies/enemy-animation.js${v}`,`./assets/enemies/enemy-loader.js${v}`,`./assets/enemies/ultimate-monsters.js${v}`],
    [`./idle-adventure.js${v}`,`./skill-vfx.js${v}`,`./progression-systems.js${v}`,`./mobile-runtime.js${v}`,`./mobile-controls-fix.js${v}`]
  ];
  const total=groups.reduce((n,g)=>n+g.length,0);let done=0,failed=false,timer;
  const panel=document.createElement('section');panel.id='boot-status';panel.setAttribute('role','status');panel.style.cssText='position:fixed;inset:0;z-index:100000;background:#102535;color:white;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;font:16px system-ui';
  const message=document.createElement('p'),retry=document.createElement('button');retry.textContent='Tải lại game';retry.hidden=true;retry.style.cssText='padding:12px 24px;font:inherit;border-radius:12px';retry.onclick=()=>location.reload();panel.append(message,retry);document.body.appendChild(panel);
  function status(){message.textContent=`Đang tải game ${Math.min(done,total)}/${total}`}
  function fail(reason){if(failed)return;failed=true;clearTimeout(timer);panel.style.display='flex';retry.hidden=false;message.textContent=`Không thể khởi động game: ${reason}. Hãy thử tải lại. Bản ${BUILD}.`;try{window.GameRuntime?.engine?.stopRenderLoop()}catch(_){} }
  window.addEventListener('error',e=>{if(panel.isConnected&&panel.style.display!=='none')fail(e.message||'Lỗi tải tài nguyên')});
  function load(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=false;const timeout=setTimeout(()=>reject(new Error('Quá thời gian tải '+src)),25000);s.onload=()=>{clearTimeout(timeout);done++;status();resolve()};s.onerror=()=>{clearTimeout(timeout);reject(new Error('Không tải được '+src))};document.head.appendChild(s)})}
  async function loadParallel(group){await Promise.all(group.map(load))}
  async function boot(){
    try{
      // Keep cache between visits. Only activate/update the service worker; never purge caches on every launch.
      if('serviceWorker' in navigator){navigator.serviceWorker.register(`./service-worker.js?v=${BUILD}`).catch(e=>console.warn('[Boot] SW',e))}
      status();
      // Babylon core and loader must remain ordered.
      await loadParallel(groups[0]);
      await loadParallel(groups[1]);
      // GameRuntime depends on Babylon; UI icon script is independent.
      await loadParallel(groups[2]);
      if(!window.GameRuntime)throw new Error('Không khởi tạo được đồ họa WebGL');
      // World before player/enemies; files inside each dependency tier download concurrently.
      await loadParallel(groups[3]);
      await loadParallel(groups[4]);
      await loadParallel(groups[5]);
      await loadParallel(groups[6]);
      document.querySelectorAll('[data-ui-icon]').forEach(el=>{const path=window.UI_ICONS&&window.UI_ICONS[el.dataset.uiIcon];if(path)el.src=`${path}${path.includes('?')?'&':'?'}v=${BUILD}`});
      const runtime=window.GameRuntime;if(!runtime)throw new Error('Thiếu GameRuntime');message.textContent='Đang dựng cảnh 3D…';timer=setTimeout(()=>fail('Cảnh 3D chưa sẵn sàng sau 30 giây'),30000);runtime.scene.onAfterRenderObservable.addOnce(()=>{if(failed)return;clearTimeout(timer);panel.style.display='none'});
    }catch(error){fail(error.message);console.error('[Boot]',error)}
  }
  // Warm the large player GLB as early as possible without blocking JS startup.
  try{const l=document.createElement('link');l.rel='preload';l.as='fetch';l.href=`./assets/characters/model-rigged.glb${v}`;l.crossOrigin='anonymous';document.head.appendChild(l)}catch(_){}
  message.textContent='Đang chuẩn bị game…';boot();
})();