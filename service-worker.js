// GAME2 service worker retirement shim.
// GitHub Pages releases change frequently; persistent SW caches were keeping normal-mode browsers on stale builds.
// This worker immediately replaces older workers, clears GAME2 caches, unregisters itself, and only passes requests to network.
const PREFIX='game2-';

self.addEventListener('install',event=>{
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    try{
      for(const name of await caches.keys()){
        if(name.startsWith(PREFIX)) await caches.delete(name);
      }
    }catch(e){console.warn('[SW retire] cache cleanup',e)}
    try{await self.clients.claim()}catch(_){}
    try{await self.registration.unregister()}catch(e){console.warn('[SW retire] unregister',e)}
    try{
      const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
      for(const client of clients) client.postMessage({type:'GAME2_SW_RETIRED'});
    }catch(_){}
  })());
});

self.addEventListener('fetch',event=>{
  if(event.request.method==='GET') event.respondWith(fetch(event.request));
});

self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING') self.skipWaiting();
});
