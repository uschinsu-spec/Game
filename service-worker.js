const SW_VERSION='20260914-10';
const CORE_CACHE=`tu-tien-core-${SW_VERSION}`;
const RUNTIME_CACHE=`tu-tien-runtime-${SW_VERSION}`;
const CORE=['./','./index.html','./style.css','./game.js','./character-v2.js','./camera-controls.js','./mobile-runtime.js','./manifest.webmanifest','./version.json'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CORE_CACHE).then(cache=>cache.addAll(CORE)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const names=await caches.keys();
    await Promise.all(names.filter(n=>n!==CORE_CACHE&&n!==RUNTIME_CACHE).map(n=>caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);

  // HTML + version stay network-first so new deployments are discovered immediately.
  if(url.origin===self.location.origin&&(url.pathname.endsWith('/version.json')||req.mode==='navigate')){
    event.respondWith((async()=>{
      try{
        const fresh=await fetch(new Request(req,{cache:'no-store'}));
        const cache=await caches.open(CORE_CACHE);cache.put(req,fresh.clone());
        return fresh;
      }catch(_){return (await caches.match(req))||Response.error()}
    })());
    return;
  }

  // Game code/assets use stale-while-revalidate: instant repeat loads, fresh cache in background.
  event.respondWith((async()=>{
    const cached=await caches.match(req);
    const network=fetch(req).then(async res=>{
      if(res&&res.ok){const cache=await caches.open(url.origin===self.location.origin?CORE_CACHE:RUNTIME_CACHE);cache.put(req,res.clone())}
      return res;
    }).catch(()=>null);
    return cached||await network||Response.error();
  })());
});
