(function(global) {
  'use strict';

  const MANIFEST_URL = './assets/THON TRAN/thon_tran_manifest.json';
  const loadPromises = new Map();
  let manifestPromise = null;

  function getRegistryAsset(modelName) {
    return global.ThonTranRegistry && global.ThonTranRegistry[modelName]
      ? global.ThonTranRegistry[modelName]
      : null;
  }

  function getManifest() {
    if (!manifestPromise) {
      manifestPromise = fetch(MANIFEST_URL, { cache: 'no-cache' })
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.json();
        })
        .catch((err) => {
          manifestPromise = null;
          console.error('[ThonTranLoader] Failed to load manifest:', err);
          return null;
        });
    }
    return manifestPromise;
  }

  function waitForRegistry(modelName, attempts = 12) {
    return new Promise((resolve) => {
      const check = () => {
        const api = getRegistryAsset(modelName);
        if (api) return resolve(api);
        if (attempts-- <= 0) return resolve(null);
        setTimeout(check, 25);
      };
      check();
    });
  }

  async function resolveAssetUrl(modelName) {
    const manifest = await getManifest();
    const entry = manifest && manifest[modelName];
    return entry && (entry.filePath || entry.fileName)
      ? (entry.filePath || `./assets/THON TRAN/${entry.fileName}`)
      : null;
  }

  function loadAsset(modelName) {
    const existing = getRegistryAsset(modelName);
    if (existing) return Promise.resolve(existing);

    if (loadPromises.has(modelName)) {
      return loadPromises.get(modelName);
    }

    const promise = (async () => {
      const url = await resolveAssetUrl(modelName);
      if (!url) {
        console.warn('[ThonTranLoader] Unknown asset:', modelName);
        return null;
      }

      const alreadyLoaded = Array.from(document.scripts).some((s) => {
        try {
          return s.src && decodeURIComponent(s.src).includes(url.replace('./', ''));
        } catch (_) {
          return false;
        }
      });

      if (alreadyLoaded) {
        const api = await waitForRegistry(modelName);
        if (api) return api;
      }

      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.async = true;
        script.src = `${url}${url.includes('?') ? '&' : '?'}v=20260915-village-loader-fix1`;

        script.onload = async () => {
          const api = await waitForRegistry(modelName);
          if (!api) {
            console.warn('[ThonTranLoader] Script loaded but asset did not register:', modelName);
            loadPromises.delete(modelName);
          }
          resolve(api);
        };

        script.onerror = () => {
          console.warn('[ThonTranLoader] Failed to load asset script:', modelName, url);
          loadPromises.delete(modelName);
          resolve(null);
        };

        document.body.appendChild(script);
      });
    })();

    loadPromises.set(modelName, promise);
    return promise;
  }

  async function preloadCategory(catId, manifestData) {
    const manifest = manifestData || await getManifest();
    if (!manifest) return [];
    const keys = Object.keys(manifest).filter((key) => manifest[key] && manifest[key].category === catId);
    return preloadList(keys);
  }

  async function preloadList(keys, concurrency = 6) {
    const results = new Array(keys.length);
    let cursor = 0;

    async function worker() {
      while (cursor < keys.length) {
        const index = cursor++;
        results[index] = await loadAsset(keys[index]);
      }
    }

    const workers = Array.from({ length: Math.min(concurrency, keys.length) }, () => worker());
    await Promise.all(workers);
    return results;
  }

  async function preloadAll() {
    const manifest = await getManifest();
    if (!manifest) return [];
    return preloadList(Object.keys(manifest), 6);
  }

  global.ThonTranLoader = {
    get catalog() {
      return null;
    },
    loadAsset,
    preloadCategory,
    preloadAll,
    getAsset: getRegistryAsset,
    getManifest
  };

  // Delay bulk preload so the village can request its required pieces first.
  if (typeof window !== 'undefined') {
    const startPreload = () => preloadAll().catch((err) => {
      console.warn('[ThonTranLoader] Background preload failed:', err);
    });

    if (window.requestIdleCallback) {
      window.requestIdleCallback(startPreload, { timeout: 3000 });
    } else {
      setTimeout(startPreload, 2500);
    }
  }
})(typeof window !== 'undefined' ? window : this);
