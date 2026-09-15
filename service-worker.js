// Zero-manual-version service worker.
// Code/HTML/CSS = network-first so every deploy is picked up automatically.
// Heavy/static assets = cache-first for fast mobile reloads.
const CACHE_PREFIX='tu-tien-auto-';
const CODE_CACHE='tu-tien-auto-code';
const ASSET_CACHE='tu-tien-auto-assets';
const CODE_RE=/\.(?:js|css|html|webmanifest)$/i;
const HEAVY_RE=/\.(?:glb|gltf|bin|png|jpg|jpeg|webp|svg|woff2?)$/i;
self.addEventListener('install',e=>{e.waitUntil(self.skipWaiting())});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{const names=await caches.keys();await Promise.all(names.filter(n=>n.startsWith('tu-tien-')&&!n.startsWith(CACHE_PREFIX)).map(n=>caches.delete(n)));await self.clients.claim()})())});
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting();if(e.data?.type==='PURGE_CODE')e.waitUntil(caches.delete(CODE_CACHE))});
async function networkFirst(req,cacheName){try{const res=await fetch(new Request(req,{cache:'no-store'}));if(res&&res.ok){const c=await caches.open(cacheName);c.put(req,res.clone()).catch(()=>{})}return res}catch(err){const hit=await caches.match(req,{ignoreSearch:true});if(hit)return hit;throw err}}
async function cacheFirst(req,cacheName){const hit=await caches.match(req,{ignoreSearch:true});if(hit)return hit;const res=await fetch(req);if(res&&res.ok){const c=await caches.open(cacheName);c.put(req,res.clone()).catch(()=>{})}return res}
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET')return;const u=new URL(req.url);if(u.origin!==self.location.origin)return;if(req.mode==='navigate'){e.respondWith(networkFirst(req,CODE_CACHE));return}if(CODE_RE.test(u.pathname)){e.respondWith(networkFirst(req,CODE_CACHE));return}if(HEAVY_RE.test(u.pathname)){e.respondWith(cacheFirst(req,ASSET_CACHE));return}e.respondWith(networkFirst(req,CODE_CACHE))});