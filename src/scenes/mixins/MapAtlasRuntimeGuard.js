/**
 * MapAtlasRuntimeGuard.js
 * Ensures the painted world-map atlases are available before the canonical
 * WorldMapHierarchyUI is opened. This protects GitHub Pages/mobile sessions
 * from stale module caches or a missed boot texture without creating a second
 * map UI implementation.
 */

const MAP_ATLASES = Object.freeze([
  { key: 'human_realm_atlas', url: './assets/ui/map/human_realm_atlas.webp' },
  { key: 'sub_level_atlas', url: './assets/ui/map/sub_level_atlas.webp' }
]);

function ensureMapAtlases(scene, done) {
  const missing = MAP_ATLASES.filter(asset => !scene.textures?.exists?.(asset.key));
  if (!missing.length) {
    done(true);
    return;
  }

  if (scene.__mapAtlasLoadState === 'loading') {
    if (!Array.isArray(scene.__mapAtlasLoadWaiters)) scene.__mapAtlasLoadWaiters = [];
    scene.__mapAtlasLoadWaiters.push(done);
    return;
  }

  scene.__mapAtlasLoadState = 'loading';
  scene.__mapAtlasLoadWaiters = [done];
  const expectedKeys = new Set(missing.map(asset => asset.key));
  let failed = false;

  const onError = file => {
    if (expectedKeys.has(file?.key)) {
      failed = true;
      console.warn('[MapAtlasRuntimeGuard] Atlas load failed:', file?.key || file?.src || 'unknown');
    }
  };

  const finish = () => {
    scene.load.off('loaderror', onError);
    const ready = MAP_ATLASES.every(asset => scene.textures?.exists?.(asset.key));
    scene.__mapAtlasLoadState = ready ? 'ready' : 'error';
    const waiters = Array.isArray(scene.__mapAtlasLoadWaiters)
      ? scene.__mapAtlasLoadWaiters.splice(0)
      : [];
    waiters.forEach(callback => callback(Boolean(ready && !failed)));
  };

  scene.load.on('loaderror', onError);
  scene.load.once('complete', finish);
  missing.forEach(asset => scene.load.image(asset.key, asset.url));

  const busy = typeof scene.load.isLoading === 'function' ? scene.load.isLoading() : false;
  if (!busy) scene.load.start();
}

export function installMapAtlasRuntimeGuard(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__mapAtlasRuntimeGuardInstalled) return;

  const proto = MainGameScene.prototype;
  const canonicalOpenMapPanel = proto.openMapPanel;
  if (typeof canonicalOpenMapPanel !== 'function') {
    throw new Error('MapAtlasRuntimeGuard requires WorldMapHierarchyUI to be installed first.');
  }

  proto.__mapAtlasRuntimeGuardInstalled = true;
  proto.openMapPanel = function openHierarchicalWorldMap(...args) {
    if (MAP_ATLASES.every(asset => this.textures?.exists?.(asset.key))) {
      return canonicalOpenMapPanel.apply(this, args);
    }

    this.__pendingMapAtlasOpenArgs = args;
    ensureMapAtlases(this, ready => {
      const pendingArgs = this.__pendingMapAtlasOpenArgs || args;
      this.__pendingMapAtlasOpenArgs = null;
      if (!ready) {
        console.warn('[MapAtlasRuntimeGuard] Painted atlas unavailable; canonical UI will use its fallback terrain.');
      }
      canonicalOpenMapPanel.apply(this, pendingArgs);
    });
    return null;
  };
}