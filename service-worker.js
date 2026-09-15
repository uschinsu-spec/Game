// GAME2 versioned PWA cache — Safari/iOS safe and self-refreshing.
importScripts('./core/build-id.js');
const BUILD_ID=self.GAME2_BUILD_ID,PREFIX='game2-',SHELL=`${PREFIX}${BUILD_ID}-shell`,ASSETS=`${PREFIX}${BUILD_ID}-assets`;
const SHELL_FILES=['./','./index.html','./assets/ui/style.css','./assets/ui/skill-vfx.css','./manifest.webmanifest','./assets/ui/ui-icons.css','./boot-accelerator.js','./boot.js','./core/build-id.js','./core/build-manifest.js'];
const CODE_RE=/\.(?:js|css|html|json|webmanifest)$/i,ASSET_RE=/\.(?:png|jpg|jpeg|webp|svg|woff2?|glb|gltf|bin)$/i;
const activateNow=()=>self.skipWaiting();
const normalized=req=>{
  const u=new URL(req.url);
  u.searchParams.delete('v');u.searchParams.delete('iosfix');u.searchParams.delete('nocache');u.searchParams.delete('reload');u.searchParams.delete('_');
  [...u.searchParams.keys()].filter(k=>k.startsWith('utm_')).forEach(k=>u.searchParams.delete(k));
  return u.toString();
};

self.addEventListener('install',e=>e.waitUntil((async()=>{
  const c=await caches.open(SHELL);
  await c.addAll(SHELL_FILES);
  await activateNow();
})()));

self.addEventListener('activate',e=>e.waitUntil((async()=>{
  for(const n of await caches.keys())if(n.startsWith(PREFIX)&&n!==SHELL&&n!==ASSETS)await caches.delete(n);
  await self.clients.claim();
  const cs=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  for(const c of cs)c.postMessage({type:'GAME2_SW_ACTIVE',buildId:BUILD_ID});
})()));

self.addEventListener('message',e=>{
  const t=e.data?.type;
  if(t==='SKIP_WAITING')activateNow();
  if(t==='GET_BUILD')e.source?.postMessage?.({type:'GAME2_SW_BUILD',buildId:BUILD_ID});
  if(t==='PURGE_OLD')e.waitUntil((async()=>{for(const n of await caches.keys())if(n.startsWith(PREFIX)&&!n.includes(BUILD_ID))await caches.delete(n)})());
});

async function networkFirst(req,cacheName){
  const key=normalized(req);
  try{
    const res=await fetch(req);
    if(res?.ok)(await caches.open(cacheName)).put(key,res.clone()).catch(()=>{});
    return res;
  }catch(err){const hit=await caches.match(key);if(hit)return hit;throw err}
}

async function cacheFirstUpdate(req){
  const key=normalized(req),cache=await caches.open(ASSETS),hit=await cache.match(key);
  if(hit){fetch(req).then(r=>{if(r?.ok)cache.put(key,r.clone())}).catch(()=>{});return hit}
  const r=await fetch(req);if(r?.ok)cache.put(key,r.clone()).catch(()=>{});return r;
}

self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const u=new URL(req.url);if(u.origin!==self.location.origin)return;
  if(req.mode==='navigate'){e.respondWith(networkFirst(req,SHELL));return}
  if(CODE_RE.test(u.pathname)){e.respondWith(networkFirst(req,SHELL));return}
  if(ASSET_RE.test(u.pathname)){e.respondWith(cacheFirstUpdate(req));return}
  e.respondWith(networkFirst(req,SHELL));
});
