// GAME2 hardened bootstrap: iOS-safe recovery + visible fatal errors + resilient resource loading.
(async()=>{'use strict';
 const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 const IOS_RECOVERY_KEY='GAME2_IOS_SW_RECOVERY_20260915_P1825';
 const panel=document.createElement('section');panel.id='boot-status';panel.setAttribute('role','status');panel.setAttribute('aria-live','polite');panel.innerHTML='<div class="boot-brand"><b>Thanh Vân Tiên Vực</b><span id="boot-message">Đang khởi động…</span><div class="boot-track"><i id="boot-progress"></i></div><small id="boot-percent">0%</small><button id="boot-retry" hidden>Tải lại game</button></div>';panel.style.cssText='position:fixed;inset:0;z-index:100000;background:linear-gradient(#65b7df,#3b86ae);color:white;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;font:16px system-ui';const st=document.createElement('style');st.textContent='#boot-status .boot-brand{width:min(360px,86vw);display:grid;gap:12px}#boot-status b{font-size:22px}#boot-status span,#boot-status small{opacity:.92}#boot-status .boot-track{height:8px;border-radius:99px;background:#ffffff36;overflow:hidden}#boot-progress{display:block;width:0;height:100%;background:#fff3b0;transition:width .18s ease}#boot-retry{min-height:48px;border:0;border-radius:14px;padding:0 24px;font:700 16px system-ui}';document.head.appendChild(st);document.body.appendChild(panel);
 const msg=panel.querySelector('#boot-message'),bar=panel.querySelector('#boot-progress'),pct=panel.querySelector('#boot-percent'),retry=panel.querySelector('#boot-retry');
 let completedWeight=0,failed=false,timer=null,swReg=null,reloading=false,BUILD_ID='unknown',BOOT_STAGES=[],TOTAL_BOOT_WEIGHT=100;
 const fail=r=>{if(failed)return;failed=true;document.documentElement.dataset.gameBoot='failed';document.documentElement.dataset.gameBootError=String(r);clearTimeout(timer);retry.hidden=false;msg.textContent=`Không thể khởi động: ${r}`;bar.style.background='#ffd3d3';try{window.GameRuntime?.engine?.stopRenderLoop?.()}catch(_){}};
 retry.onclick=()=>{try{const u=new URL(location.href);u.searchParams.set('retry',Date.now().toString());location.replace(u.toString())}catch(_){location.reload()}};
 window.addEventListener('error',e=>{if(!failed&&e?.message)console.error('[Boot window error]',e.error||e.message)});
 window.addEventListener('unhandledrejection',e=>{if(!failed)console.error('[Boot rejection]',e.reason)});
 const safeSession={get(k){try{return window.sessionStorage?.getItem(k)||null}catch(e){console.warn('[Boot] sessionStorage get unavailable',e);return null}},set(k,v){try{window.sessionStorage?.setItem(k,v);return true}catch(e){console.warn('[Boot] sessionStorage set unavailable',e);return false}}};
 try{
   if(isIOS&&!safeSession.get(IOS_RECOVERY_KEY)){
     safeSession.set(IOS_RECOVERY_KEY,'1');
     try{
       const regs=('serviceWorker'in navigator)?await navigator.serviceWorker.getRegistrations():[];
       await Promise.all(regs.map(r=>r.unregister().catch(()=>false)));
       if('caches'in window){for(const k of await caches.keys())if(k.startsWith('game2-'))await caches.delete(k)}
       if(navigator.serviceWorker?.controller){const u=new URL(location.href);u.searchParams.set('iosfix','20260915-p18.25');location.replace(u.toString());return}
     }catch(e){console.warn('[Boot] iOS cache recovery',e)}
   }
   const manifest=await import(`./core/build-manifest.js?boot=${encodeURIComponent(Date.now())}`);
   BUILD_ID=manifest.BUILD_ID;BOOT_STAGES=manifest.BOOT_STAGES;TOTAL_BOOT_WEIGHT=manifest.TOTAL_BOOT_WEIGHT;
   if(!BUILD_ID||!Array.isArray(BOOT_STAGES)||!BOOT_STAGES.length)throw new Error('Build manifest không hợp lệ');
   window.GAME2_BUILD_ID=BUILD_ID;window.__GAME2_BOOT_MARKS__=window.__GAME2_BOOT_MARKS__||[];
   const mark=(stage,detail={})=>{const x={stage,at:performance.now(),...detail};window.__GAME2_BOOT_MARKS__.push(x);window.GameServices?.performanceTelemetry?.markBoot?.(stage,detail)};
   const progress=(stage,fraction=0)=>{const p=Math.max(0,Math.min(1,(completedWeight+stage.weight*fraction)/TOTAL_BOOT_WEIGHT));msg.textContent=stage.label;bar.style.width=`${Math.round(p*100)}%`;pct.textContent=`${Math.round(p*100)}%`};
   const stableSrc=src=>/^https?:\/\//i.test(src)?src:`${src}${src.includes('?')?'&':'?'}v=${encodeURIComponent(BUILD_ID)}`;
   function loadOnce(src,timeoutMs){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=stableSrc(src);s.async=false;const to=setTimeout(()=>{s.remove();reject(new Error(`Quá thời gian tải tài nguyên: ${src}`))},timeoutMs);s.onload=()=>{clearTimeout(to);resolve()};s.onerror=()=>{clearTimeout(to);s.remove();reject(new Error(`Không tải được tài nguyên: ${src}`))};document.head.appendChild(s)})}
   async function load(src){let last;for(let attempt=1;attempt<=2;attempt++){try{return await loadOnce(src,isIOS?45000:35000)}catch(e){last=e;console.warn(`[Boot] load attempt ${attempt} failed`,src,e);if(attempt<2)await new Promise(r=>setTimeout(r,700))}}throw last}
   async function registerSW(){if(isIOS||!('serviceWorker'in navigator))return null;try{const r=await navigator.serviceWorker.register('./service-worker.js',{updateViaCache:'none',scope:'./'});swReg=r;await r.update();return r}catch(e){console.warn('[Boot] SW',e);return null}}
   async function activateWaitingWorker(){const w=swReg?.waiting;if(!w)return false;try{window.GameCore?.saveSystem?.flush?.();window.GameServices?.economyStore?.save?.();window.GameServices?.worldState?.save?.('PWA_UPDATE');w.postMessage({type:'SKIP_WAITING'});return true}catch(_){return false}}
   navigator.serviceWorker?.addEventListener?.('controllerchange',()=>{if(isIOS||reloading||!window.GameServices?.runtimeLifecycle)return;reloading=true;window.GameServices.runtimeLifecycle.flush('SW_UPDATE');location.reload()});
   mark('BOOT_START',{buildId:BUILD_ID});
   registerSW();
   for(const stage of BOOT_STAGES){progress(stage,0);mark('STAGE_START',{id:stage.id});for(let i=0;i<stage.files.length;i++){await load(stage.files[i]);progress(stage,(i+1)/stage.files.length)}completedWeight+=stage.weight;progress(stage,0);mark('STAGE_DONE',{id:stage.id})}
   const s=window.GameServices||{};
   window.GameCore.world=window.GameCore.world||new window.GameCore.WorldSystem();
   window.GameCore.mapDiscovery=window.GameCore.mapDiscovery||new window.GameCore.MapDiscoverySystem();
   window.GameCore.waypoints=window.GameCore.waypoints||new window.GameCore.WaypointSystem();
   window.GameCore.teleport=window.GameCore.teleport||new window.GameCore.TeleportSystem({waypoints:window.GameCore.waypoints});
   window.GameCore.resourceNodes=window.GameCore.resourceNodes||new window.GameCore.ResourceNodeSystem();
   window.GameCore.respawnAnchors=window.GameCore.respawnAnchors||new window.GameCore.RespawnAnchorSystem();
   Object.assign(window.GameServices,{world:window.GameCore.world,mapDiscovery:window.GameCore.mapDiscovery,waypoints:window.GameCore.waypoints,teleport:window.GameCore.teleport,resourceNodes:window.GameCore.resourceNodes,respawnAnchors:window.GameCore.respawnAnchors});
   await window.GameCore.world.ready;
   window.GameCore.mapState=window.GameCore.mapState||new window.GameCore.MapStateSystem();
   window.GameCore.worldEnvironment=window.GameCore.worldEnvironment||new window.GameCore.WorldEnvironmentSystem();
   window.GameCore.worldEvents=window.GameCore.worldEvents||new window.GameCore.WorldEventMapSystem();
   Object.assign(window.GameServices,{mapState:window.GameCore.mapState,worldEnvironment:window.GameCore.worldEnvironment,worldEvents:window.GameCore.worldEvents});
   window.GameCore.mapData=window.GameCore.mapData||new window.GameCore.MapDataSystem({world:()=>window.GameServices.world});window.GameServices.mapData=window.GameCore.mapData;
   window.GameCore.mapUI=window.GameCore.mapUI||new window.GameCore.MapV2UI();window.GameServices.mapUI=window.GameCore.mapUI;
   window.GameMapV2={open:(m='LOCAL')=>window.GameServices.mapUI?.open?.(m),close:()=>window.GameServices.mapUI?.close?.(),data:()=>window.GameServices.mapData?.local?.()};window.GameMiniMap={redraw:()=>window.GameServices.mapUI?.drawMini?.(performance.now()),range:72,open:()=>window.GameServices.mapUI?.open?.('LOCAL')};
   document.querySelectorAll('[data-ui-icon]').forEach(el=>{const p=window.UI_ICONS?.[el.dataset.uiIcon];if(p)el.src=p});window.GameServices.uiState?.refresh?.();
   const rt=window.GameRuntime;if(!rt)throw new Error('Thiếu GameRuntime');
   if(!s.events||!s.settings||!s.audio||!s.uiCommands||!s.uiState||!window.GameServices.ui||!s.storage||!s.transactions||!s.worldState||!s.worldStreaming||!window.GameServices.world||!window.GameServices.mapUI||!s.cultivation||!s.damage||!s.wallet||!s.inventory||!s.pets||!s.interactions||!s.quests||!s.npcs||!s.spawnSystem||!s.skills||!s.casts||!s.performanceTelemetry||!s.runtimeLifecycle)throw new Error('GAME2 Phase17 systems chưa khởi tạo đầy đủ');
   mark('BOOT_READY',{buildId:BUILD_ID});bar.style.width='100%';pct.textContent='100%';msg.textContent='Sẵn sàng';document.documentElement.dataset.gameBoot='ready';
   timer=setTimeout(()=>fail('Cảnh 3D chưa sẵn sàng'),isIOS?45000:30000);rt.scene.onAfterRenderObservable.addOnce(async()=>{if(failed)return;clearTimeout(timer);panel.style.display='none';mark('FIRST_FRAME');await activateWaitingWorker()});
 }catch(e){fail(e?.message||String(e));console.error('[Boot]',e)}
})();
