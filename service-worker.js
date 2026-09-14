const SW_VERSION = '20260914-flora-ecosystem-v41';
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
  './assets/characters/rigged-player.js',
  './assets/enemies/ultimate-monsters.js',
  './game.js',
  './idle-adventure.js',
  './progression-systems.js',
  './mobile-runtime.js',
  './manifest.webmanifest',
  './version.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CORE_CACHE).then(c => c.addAll(CORE)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(n => n !== CORE_CACHE && n !== RUNTIME_CACHE).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === self.location.origin && (u.pathname.endsWith('/version.json') || r.mode === 'navigate')) {
    e.respondWith(fetch(new Request(r, { cache: 'no-store' })).catch(() => caches.match(r, { ignoreSearch: true })));
    return;
  }
  e.respondWith(
    caches.match(r, { ignoreSearch: true }).then(c => c || fetch(r).then(async x => {
      if (x && x.ok) {
        const cache = await caches.open(u.origin === self.location.origin ? CORE_CACHE : RUNTIME_CACHE);
        cache.put(r, x.clone());
      }
      return x;
    }))
  );
});