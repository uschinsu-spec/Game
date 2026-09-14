const SW_VERSION = 'auto-update-v20260914-real-enemies-v2';
const CORE_CACHE = `tu-tien-core-${SW_VERSION}`;
const RUNTIME_CACHE = `tu-tien-runtime-${SW_VERSION}`;

const CORE = [
  './',
  './index.html',
  './editor.html',
  './style.css',
  './editor-studio.css',
  './editor-studio.js',
  './assets/environment/terrain/tex_01_Grass_Lush.js',
  './assets/environment/flora/flora_loader.js',
  './assets/environment/flora/asset_birchtree_1.js',
  './assets/environment/flora/asset_normaltree_1.js',
  './assets/environment/flora/asset_pinetree_1.js',
  './assets/environment/flora/asset_mapletree_1.js',
  './assets/environment/flora/asset_palmtree_1.js',
  './assets/environment/flora/asset_deadtree_1.js',
  './assets/environment/flora/asset_bush_flowers.js',
  './assets/environment/flora/asset_flower_1_clump.js',
  './assets/environment/flora/asset_grass_large_extruded.js',
  './assets/environment/flora/asset_rock_1.js',
  './assets/environment/flora/asset_rock_3.js',
  './assets/ui/ui-icons.js',
  './assets/ui/ui-icons.css',
  './assets/ui/icons/portrait.svg',
  './assets/ui/icons/pet.svg',
  './assets/ui/icons/artifact.svg',
  './assets/ui/icons/coin.svg',
  './assets/ui/icons/jade.svg',
  './assets/ui/icons/auto.svg',
  './assets/ui/icons/report.svg',
  './assets/ui/icons/challenge.svg',
  './assets/ui/icons/quick-battle.svg',
  './assets/ui/icons/gear.svg',
  './assets/ui/icons/skill.svg',
  './assets/ui/icons/battle.svg',
  './assets/ui/icons/seal.svg',
  './assets/ui/icons/cultivate.svg',
  './assets/environment/world/enhanced-world.js',
  './assets/THON TRAN/thon_tran_loader.js',
  './assets/environment/world/village-safezone.js',
  './assets/characters/rigged-player.js',
  './assets/enemies/enemy-registry.js',
  './assets/enemies/enemy-animation.js',
  './assets/enemies/enemy-loader.js',
  './assets/enemies/ultimate-monsters.js',
  './assets/enemies/blob/cactoro.glb',
  './assets/enemies/flying/dragon.glb',
  './assets/enemies/big/demon.glb',
  './game.js',
  './idle-adventure.js',
  './progression-systems.js',
  './mobile-runtime.js',
  './manifest.webmanifest',
  './version.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CORE_CACHE)
      .then(cache => cache.addAll(CORE))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter(name => name !== CORE_CACHE && name !== RUNTIME_CACHE)
        .map(name => caches.delete(name))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

async function networkFirst(request) {
  const url = new URL(request.url);
  try {
    // Revalidate with the browser/CDN HTTP cache. Unchanged large assets can return 304,
    // while changed files are downloaded and replace the Service Worker cache entry.
    const response = await fetch(new Request(request, { cache: 'no-cache' }));
    if (response && response.ok) {
      const cache = await caches.open(url.origin === self.location.origin ? CORE_CACHE : RUNTIME_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (_) {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    throw _;
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // This tiny file is the update signal and must always come from the network.
  if (url.origin === self.location.origin && url.pathname.endsWith('/version.json')) {
    event.respondWith(
      fetch(new Request(request, { cache: 'no-store' }))
        .catch(() => caches.match(request, { ignoreSearch: true }))
    );
    return;
  }

  // Network-first keeps GAME current automatically after every push, but still
  // falls back to the local cache when offline or when GitHub Pages is unreachable.
  event.respondWith(networkFirst(request));
});
