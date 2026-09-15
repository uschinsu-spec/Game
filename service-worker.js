// Zero-manual-version service worker.
// Code and critical 3D assets are always revalidated; decorative/static assets use stale-while-revalidate.
const CACHE_PREFIX='tu-tien-auto-';
const CODE_CACHE='tu-tien-auto-code';
const ASSET_CACHE='tu-tien-auto-assets';
const CODE_RE=/\.(?:js|css|html|json|webmanifest)$/i;
const CRITICAL_RE=/\.(?:glb|gltf|bin)$/i;
const STATIC_RE=/\.(?:png|jpg|jpeg|webp|svg|woff2?)$/i;
self.addEventListener('install',e=>e.waitUntil(self.skipWaiting()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{const names=await caches.keys();await Promise.all(names.filter(n=>n.startsWith('tu-tien-')&&!n.startsWith(CACHE_PREFIX)).map(n=>caches.delete(n)));await self.clients.claim()})()));
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting();if(e.data?.type==='PURGE_CODE')e.waitUntil(caches.delete(CODE_CACHE));if(e.data?.type==='PURGE_ALL')e.waitUntil(Promise.all([caches.delete(CODE_CACHE),caches.delete(ASSET_CACHE)]))});
function stableRequest(req){const u=new URL(req.url);u.search='';return new Request(u.toString(),{method:'GET',headers:req.headers,mode:req.mode,credentials:req.credentials,redirect:req.redirect})}
async function networkFirst(req,cacheName){const key=stableRequest(req);try{const res=await fetch(new Request(req,{cache:'no-cache'}));if(res&&res.ok)(await caches.open(cacheName)).put(key,res.clone()).catch(()=>{});return res}catch(err){const hit=await caches.match(key);if(hit)return hit;throw err}}
async function staleWhileRevalidate(req,cacheName){const key=stableRequest(req),cache=await caches.open(cacheName),hit=await cache.match(key);const update=fetch(new Request(req,{cache:'no-cache'})).then(res=>{if(res&&res.ok)cache.put(key,res.clone()).catch(()=>{});return res}).catch(()=>null);if(hit){update.catch(()=>{});return hit}const res=await update;if(res)return res;throw new Error('offline')}
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET')return;const u=new URL(req.url);if(u.origin!==self.location.origin)return;if(req.mode==='navigate'||CODE_RE.test(u.pathname)||CRITICAL_RE.test(u.pathname)){e.respondWith(networkFirst(req,CODE_CACHE));return}if(STATIC_RE.test(u.pathname)){e.respondWith(staleWhileRevalidate(req,ASSET_CACHE));return}e.respondWith(networkFirst(req,CODE_CACHE))});