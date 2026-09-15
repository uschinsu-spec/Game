// Zero-manual-version boot loader: code always fetched fresh; heavy assets remain browser/SW cached.
(()=>{
  'use strict';
  const groups=[
    ['https://cdn.babylonjs.com/babylon.js'],
    ['https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js'],
    ['./assets/ui/ui-icons.js','./game.js'],
    ['./assets/environment/terrain/tex_01_Grass_Lush.js','./assets/environment/world/enhanced-world.js'],
    ['./assets/characters/rigged-player.js','./assets/characters/player-animation-pro.js','./assets/characters/player-upperbody-animation.js','./assets/characters/player-combat-facing.js'],
    ['./assets/enemies/enemy-registry.js','./assets/enemies/enemy-animation.js','./assets/enemies/enemy-loader.js','./assets/enemies/ultimate-monsters.js'],
    ['./idle-adventure.js','./skill-vfx.js','./progression-systems.js','./mobile-runtime.js','./mobile-controls-fix.js']
  ];
  const total=groups.reduce((n,g)=>n+g.length,0);let done=0,failed=false,timer;
  const panel=document.createElement('section');panel.id='boot-status';panel.setAttribute('role','status');panel.style.cssText='position:fixed;inset:0;z-index:100000;background:#5aa8d6;color:white;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;font:16px system-ui';
  const message=document.createElement('p'),retry=document.createElement('button');retry.textContent='Tải lại game';retry.hidden=true;retry.style.cssText='padding:12px 24px;font:inherit;border-radius:12px';retry.onclick=()=>location.reload();panel.append(message,retry);document.body.appendChild(panel);
  const status=()=>message.textContent=`Đang tải game ${Math.min(done,total)}/${total}`;
  const fail=reason=>{if(failed)return;failed=true;clearTimeout(timer);panel.style.display='flex';retry.hidden=false;message.textContent=`Không thể khởi động game: ${reason}.`;try{window.GameRuntime?.engine?.stopRenderLoop()}catch(_){}};
  window.addEventListener('error',e=>{if(panel.isConnected&&panel.style.display!=='none')fail(e.message||'Lỗi tải tài nguyên')});
  function fresh(src){if(/^https?:\/\//i.test(src))return src;return `${src}${src.includes('?')?'&':'?'}t=${Date.now()}-${Math.random().toString(36).slice(2)}`}
  function load(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=fresh(src);s.async=false;const timeout=setTimeout(()=>reject(new Error('Quá thời gian tải '+src)),25000);s.onload=()=>{clearTimeout(timeout);done++;status();resolve()};s.onerror=()=>{clearTimeout(timeout);reject(new Error('Không tải được '+src))};document.head.appendChild(s)})}
  const loadParallel=group=>Promise.all(group.map(load));
  async function boot(){try{
    if('serviceWorker'in navigator){try{const reg=await navigator.serviceWorker.register('./service-worker.js',{updateViaCache:'none'});await reg.update();if(reg.waiting)reg.waiting.postMessage({type:'SKIP_WAITING'})}catch(e){console.warn('[Boot] SW',e)}}
    status();
    for(const group of groups){await loadParallel(group);if(!window.GameRuntime&&group===groups[2])throw new Error('Không khởi tạo được đồ họa WebGL')}
    document.querySelectorAll('[data-ui-icon]').forEach(el=>{const path=window.UI_ICONS&&window.UI_ICONS[el.dataset.uiIcon];if(path)el.src=path});
    const runtime=window.GameRuntime;if(!runtime)throw new Error('Thiếu GameRuntime');message.textContent='Đang dựng cảnh 3D…';timer=setTimeout(()=>fail('Cảnh 3D chưa sẵn sàng sau 30 giây'),30000);runtime.scene.onAfterRenderObservable.addOnce(()=>{if(failed)return;clearTimeout(timer);panel.style.display='none'})
  }catch(error){fail(error.message);console.error('[Boot]',error)}}
  try{const l=document.createElement('link');l.rel='preload';l.as='fetch';l.href='./assets/characters/model-rigged.glb';l.crossOrigin='anonymous';document.head.appendChild(l)}catch(_){}
  boot();
})();