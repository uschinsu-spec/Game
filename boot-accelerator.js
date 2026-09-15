// GAME2 boot accelerator: warm network/cache in parallel without changing execution order.
(()=>{'use strict';
 const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 // The old iOS recovery path purged caches every new tab/session. The Safari SW bug is fixed,
 // so mark recovery complete before boot.js runs and preserve warm caches.
 if(isIOS){try{sessionStorage.setItem('GAME2_IOS_SW_RECOVERY_20260915_P1825','1')}catch(_){}}
 const head=document.head;
 const addLink=(rel,href,extra={})=>{try{const l=document.createElement('link');l.rel=rel;l.href=href;Object.assign(l,extra);head.appendChild(l);return l}catch(_){return null}};
 addLink('preconnect','https://cdn.babylonjs.com',{crossOrigin:'anonymous'});
 addLink('dns-prefetch','https://cdn.babylonjs.com');
 // Register the now Safari-safe worker on iOS too, so subsequent opens reuse code/assets.
 if('serviceWorker'in navigator){navigator.serviceWorker.register('./service-worker.js',{updateViaCache:'none',scope:'./'}).then(r=>r.update()).catch(e=>console.warn('[BootAccel] SW warmup',e))}
 const versioned=(src,build)=>`${src}${src.includes('?')?'&':'?'}v=${encodeURIComponent(build)}`;
 const preloadStage=(stage,build)=>{for(const src of stage?.files||[]){if(/^https?:\/\//i.test(src))continue;addLink('preload',versioned(src,build),{as:'script'})}};
 (async()=>{try{
   const manifest=await import('./core/build-manifest.js');
   const stages=manifest.BOOT_STAGES||[],build=manifest.BUILD_ID||'';
   const byId=id=>stages.find(s=>s.id===id);
   // Core is the visible 33% bottleneck: start all requests immediately.
   preloadStage(byId('core'),build);
   // Pipeline later mandatory stages while core scripts execute. Execution order remains owned by boot.js.
   setTimeout(()=>preloadStage(byId('runtime'),build),120);
   setTimeout(()=>preloadStage(byId('gameplay'),build),350);
   setTimeout(()=>preloadStage(byId('ui'),build),700);
   setTimeout(()=>preloadStage(byId('finalize'),build),900);
 }catch(e){console.warn('[BootAccel] preload unavailable',e)}})();
})();
