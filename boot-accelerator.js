// GAME2 boot accelerator: remove stale Service Workers, then warm network in parallel.
(async()=>{'use strict';
 const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 const RETIRE_KEY='GAME2_SW_RETIRED_P1828';
 const head=document.head;
 const addLink=(rel,href,extra={})=>{try{const l=document.createElement('link');l.rel=rel;l.href=href;Object.assign(l,extra);head.appendChild(l);return l}catch(_){return null}};
 addLink('preconnect','https://cdn.babylonjs.com',{crossOrigin:'anonymous'});
 addLink('dns-prefetch','https://cdn.babylonjs.com');

 // Normal-mode browsers may still be controlled by an old worker/cache while private mode is clean.
 // Remove every registration and every GAME2 Cache Storage entry once for this release.
 try{
   let already=false;try{already=sessionStorage.getItem(RETIRE_KEY)==='1'}catch(_){}
   if(!already){
     const hadController=!!navigator.serviceWorker?.controller;
     if('serviceWorker'in navigator){
       const regs=await navigator.serviceWorker.getRegistrations();
       await Promise.all(regs.map(r=>r.unregister().catch(()=>false)));
     }
     if('caches'in window){
       for(const name of await caches.keys()) if(name.startsWith('game2-')) await caches.delete(name);
     }
     try{sessionStorage.setItem(RETIRE_KEY,'1')}catch(_){}
     // A controller remains attached to the current document until navigation. Reload once after unregistering it.
     if(hadController){
       const u=new URL(location.href);u.searchParams.set('nocache','p18.28');u.searchParams.set('_',Date.now().toString());
       location.replace(u.toString());return;
     }
   }
 }catch(e){console.warn('[BootAccel] stale SW cleanup',e)}

 const versioned=(src,build)=>`${src}${src.includes('?')?'&':'?'}v=${encodeURIComponent(build)}`;
 const preloadStage=(stage,build)=>{for(const src of stage?.files||[]){if(/^https?:\/\//i.test(src))continue;addLink('preload',versioned(src,build),{as:'script'})}};
 try{
   const manifest=await import(`./core/build-manifest.js?boot=${Date.now()}`);
   const stages=manifest.BOOT_STAGES||[],build=manifest.BUILD_ID||'';
   const byId=id=>stages.find(s=>s.id===id);
   preloadStage(byId('core'),build);
   setTimeout(()=>preloadStage(byId('runtime'),build),80);
   setTimeout(()=>preloadStage(byId('gameplay'),build),220);
   setTimeout(()=>preloadStage(byId('ui'),build),420);
   setTimeout(()=>preloadStage(byId('finalize'),build),520);
 }catch(e){console.warn('[BootAccel] preload unavailable',e)}
})();
