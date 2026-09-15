// GAME2 Phase 17 stable bootstrap: BUILD_ID versioning + weighted stages.
(async()=>{'use strict';
 const {BUILD_ID,BOOT_STAGES,TOTAL_BOOT_WEIGHT}=await import('./core/build-manifest.js');
 window.GAME2_BUILD_ID=BUILD_ID;window.__GAME2_BOOT_MARKS__=window.__GAME2_BOOT_MARKS__||[];
 const mark=(stage,detail={})=>{const x={stage,at:performance.now(),...detail};window.__GAME2_BOOT_MARKS__.push(x);window.GameServices?.performanceTelemetry?.markBoot?.(stage,detail)};
 const panel=document.createElement('section');panel.id='boot-status';panel.setAttribute('role','status');panel.setAttribute('aria-live','polite');panel.innerHTML='<div class="boot-brand"><b>Thanh Vân Tiên Vực</b><span id="boot-message">Đang khởi động…</span><div class="boot-track"><i id="boot-progress"></i></div><small id="boot-percent">0%</small><button id="boot-retry" hidden>Tải lại game</button></div>';panel.style.cssText='position:fixed;inset:0;z-index:100000;background:linear-gradient(#65b7df,#3b86ae);color:white;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;font:16px system-ui';const st=document.createElement('style');st.textContent='#boot-status .boot-brand{width:min(360px,86vw);display:grid;gap:12px}#boot-status b{font-size:22px}#boot-status span,#boot-status small{opacity:.92}#boot-status .boot-track{height:8px;border-radius:99px;background:#ffffff36;overflow:hidden}#boot-progress{display:block;width:0;height:100%;background:#fff3b0;transition:width .18s ease}#boot-retry{min-height:48px;border:0;border-radius:14px;padding:0 24px;font:700 16px system-ui}';document.head.appendChild(st);document.body.appendChild(panel);
 const msg=panel.querySelector('#boot-message'),bar=panel.querySelector('#boot-progress'),pct=panel.querySelector('#boot-percent'),retry=panel.querySelector('#boot-retry');retry.onclick=()=>location.reload();
 let completedWeight=0,failed=false,timer=null,swReg=null,reloading=false;
 const progress=(stage,fraction=0)=>{const p=Math.max(0,Math.min(1,(completedWeight+stage.weight*fraction)/TOTAL_BOOT_WEIGHT));msg.textContent=stage.label;bar.style.width=`${Math.round(p*100)}%`;pct.textContent=`${Math.round(p*100)}%`};
 const fail=r=>{if(failed)return;failed=true;clearTimeout(timer);retry.hidden=false;msg.textContent=`Không thể khởi động: ${r}`;bar.style.background='#ffd3d3';try{window.GameRuntime?.engine?.stopRenderLoop?.()}catch(_){}};
 const stableSrc=src=>/^https?:\/\//i.test(src)?src:`${src}${src.includes('?')?'&':'?'}v=${encodeURIComponent(BUILD_ID)}`;
 function load(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=stableSrc(src);s.async=false;const to=setTimeout(()=>reject(new Error('Quá thời gian tải tài nguyên')),25000);s.onload=()=>{clearTimeout(to);resolve()};s.onerror=()=>{clearTimeout(to);reject(new Error('Không tải được tài nguyên'))};document.head.appendChild(s)})}
 async function registerSW(){if(!('serviceWorker'in navigator))return null;try{const r=await navigator.serviceWorker.register('./service-worker.js',{updateViaCache:'none',scope:'./'});swReg=r;await r.update();return r}catch(e){console.warn('[Boot] SW',e);return null}}
 async function activateWaitingWorker(){const w=swReg?.waiting;if(!w)return false;try{window.GameCore?.saveSystem?.flush?.();window.GameServices?.economyStore?.save?.();window.GameServices?.worldState?.save?.('PWA_UPDATE');w.postMessage({type:'SKIP_WAITING'});return true}catch(_){return false}}
 navigator.serviceWorker?.addEventListener?.('controllerchange',()=>{if(reloading||!window.GameServices?.runtimeLifecycle)return;reloading=true;window.GameServices.runtimeLifecycle.flush('SW_UPDATE');location.reload()});
 try{
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
   mark('BOOT_READY',{buildId:BUILD_ID});bar.style.width='100%';pct.textContent='100%';msg.textContent='Sẵn sàng';
   timer=setTimeout(()=>fail('Cảnh 3D chưa sẵn sàng'),30000);rt.scene.onAfterRenderObservable.addOnce(async()=>{if(failed)return;clearTimeout(timer);panel.style.display='none';mark('FIRST_FRAME');await activateWaitingWorker()});
 }catch(e){fail(e.message||String(e));console.error('[Boot]',e)}
})();