const SW_VERSION = '20260914-1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Same-origin game files should prefer the network so new GitHub Pages
  // deployments are picked up quickly instead of lingering in mobile cache.
  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      try {
        return await fetch(new Request(req, { cache: 'no-store' }));
      } catch (_) {
        return fetch(req);
      }
    })());
  }
});
