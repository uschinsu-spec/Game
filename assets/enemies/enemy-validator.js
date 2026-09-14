/**
 * enemy-validator.js
 * ==================
 * Debug validation tool for all enemies in EnemyRegistry.
 * Run EnemyValidator.runAll(scene) at startup (dev mode only).
 *
 * Checks per enemy:
 *   [1] GLB file exists (HTTP HEAD request)
 *   [2] GLB loads without error (SceneLoader)
 *   [3] Skeleton present in loaded model
 *   [4] Animation names match registry declaration
 *   [5] Materials / textures are present (no null materials)
 *   [6] Collider data valid (height > 0, radius > 0)
 *
 * Usage:
 *   <script src="assets/enemies/enemy-validator.js"></script>
 *   // after scene is created:
 *   EnemyValidator.runAll(scene).then(report => console.table(report));
 */
(function(global) {
  'use strict';

  const OK   = 'OK';
  const WARN = 'WARN';
  const ERR  = 'ERROR';

  async function fileExists(url) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      return res.ok;
    } catch {
      return false;
    }
  }

  async function loadTemp(modelPath, scene) {
    try {
      const container = await BABYLON.SceneLoader.LoadAssetContainerAsync('', modelPath, scene);
      return { container, error: null };
    } catch (err) {
      return { container: null, error: err.message || String(err) };
    }
  }

  function _validateColliderData(info) {
    const issues = [];
    if (info.colliderHeight === undefined) issues.push('colliderHeight missing');
    else if (info.colliderHeight <= 0)     issues.push('colliderHeight<=0');
    if (info.colliderRadius === undefined) issues.push('colliderRadius missing');
    else if (info.colliderRadius <= 0)     issues.push('colliderRadius<=0');
    if (info.groundOffset === undefined)   issues.push('groundOffset missing');
    return issues.length === 0 ? OK : WARN;
  }

  async function validateEnemy(info, scene) {
    const row = {
      id: info.id, name: info.name, cat: info.cat,
      modelPath: info.modelPath,
      fileExists: WARN, loadsOK: WARN, hasSkeleton: WARN,
      animMatch: WARN, animMissing: [], animExtra: [],
      materialOK: WARN, nullMaterials: 0,
      colliderOK: WARN, errors: []
    };

    // Check 1: file exists
    const exists = await fileExists(info.modelPath);
    row.fileExists = exists ? OK : ERR;
    if (!exists) {
      row.errors.push('GLB not found: ' + info.modelPath);
      row.loadsOK = row.hasSkeleton = row.animMatch = row.materialOK = ERR;
      row.colliderOK = _validateColliderData(info);
      return row;
    }

    // Check 2: model loads
    const { container, error } = await loadTemp(info.modelPath, scene);
    if (!container) {
      row.loadsOK = ERR;
      row.errors.push('Load failed: ' + error);
      row.hasSkeleton = row.animMatch = row.materialOK = ERR;
      row.colliderOK = _validateColliderData(info);
      return row;
    }
    row.loadsOK = OK;

    // Check 3: skeleton
    if (container.skeletons && container.skeletons.length > 0) {
      row.hasSkeleton = OK;
    } else {
      row.hasSkeleton = WARN;
      row.errors.push('No skeleton - animations may not work');
    }

    // Check 4: animation names
    const actualAnimNames = (container.animationGroups || []).map(ag => ag.name);
    const registryAnims   = Array.isArray(info.anims) ? info.anims : [];
    row.animMissing = registryAnims.filter(n => !actualAnimNames.includes(n));
    row.animExtra   = actualAnimNames.filter(n => !registryAnims.includes(n));

    if (row.animMissing.length === 0 && row.animExtra.length === 0) {
      row.animMatch = OK;
    } else if (row.animMissing.length > 0) {
      row.animMatch = ERR;
      row.errors.push('Missing anims: [' + row.animMissing.join(', ') + ']');
    } else {
      row.animMatch = WARN;
    }

    // Check 5: materials
    let nullCount = 0;
    for (const mesh of container.meshes) {
      if (!mesh.material) {
        nullCount++;
      } else if (mesh.material.getActiveTextures) {
        for (const tex of mesh.material.getActiveTextures()) {
          if (tex && !tex.url && !tex._buffer) nullCount++;
        }
      }
    }
    row.nullMaterials = nullCount;
    row.materialOK    = nullCount === 0 ? OK : (nullCount > 2 ? ERR : WARN);
    if (nullCount > 0) row.errors.push(nullCount + ' null material/texture');

    container.dispose();

    // Check 6: collider data
    row.colliderOK = _validateColliderData(info);

    return row;
  }

  const EnemyValidator = {

    async runAll(scene, opts = {}) {
      const concurrency = opts.concurrency || 3;
      const registry    = global.EnemyRegistry;
      if (!registry) {
        console.error('[EnemyValidator] EnemyRegistry not found. Load enemy-registry.js first.');
        return [];
      }

      const all    = registry.getAll();
      const report = [];
      const start  = performance.now();

      console.group('[EnemyValidator] Checking ' + all.length + ' enemies...');

      for (let i = 0; i < all.length; i += concurrency) {
        const batch   = all.slice(i, i + concurrency);
        const results = await Promise.all(batch.map(info => validateEnemy(info, scene)));
        report.push(...results);
        console.log('  [' + Math.min(i + concurrency, all.length) + '/' + all.length + '] validated');
      }

      const summary = report.map(r => ({
        ID: r.id, Cat: r.cat,
        'File?': r.fileExists,
        'Load?': r.loadsOK,
        'Skel?': r.hasSkeleton,
        'Anim?': r.animMatch,
        'Mat?':  r.materialOK,
        'Collider?': r.colliderOK,
        'Missing Anims': r.animMissing.join(',') || '-',
        'Errors': r.errors.join(' | ') || '-'
      }));

      console.groupEnd();
      console.log('[EnemyValidator] Done in ' + ((performance.now() - start) / 1000).toFixed(2) + 's');
      console.table(summary);

      const errored = report.filter(r => r.errors.length > 0);
      if (errored.length > 0) {
        console.group('[EnemyValidator] ' + errored.length + ' enemies with issues:');
        errored.forEach(r => console.warn('  [' + r.id + '] ' + r.errors.join(' | ')));
        console.groupEnd();
      } else {
        console.log('[EnemyValidator] All enemies passed!');
      }

      return report;
    },

    async validateOne(enemyId, scene) {
      const registry = global.EnemyRegistry;
      if (!registry) { console.error('[EnemyValidator] No registry.'); return null; }
      const info = registry.get(enemyId);
      if (!info) { console.error('[EnemyValidator] Unknown enemy: ' + enemyId); return null; }
      const result = await validateEnemy(info, scene);
      console.log('[EnemyValidator] ' + enemyId + ':', result);
      return result;
    },

    async quickFileCheck() {
      const registry = global.EnemyRegistry;
      if (!registry) { console.error('[EnemyValidator] No registry.'); return []; }
      const all     = registry.getAll();
      const missing = [];
      const results = await Promise.all(all.map(async info => {
        const exists = await fileExists(info.modelPath);
        if (!exists) missing.push(info.id);
        return { id: info.id, modelPath: info.modelPath, exists };
      }));
      if (missing.length === 0) {
        console.log('[EnemyValidator] All ' + all.length + ' GLB files found.');
      } else {
        console.warn('[EnemyValidator] ' + missing.length + ' missing GLBs:', missing);
      }
      return results;
    }
  };

  global.EnemyValidator = EnemyValidator;

})(typeof window !== 'undefined' ? window : this);
