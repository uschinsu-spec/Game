/**
 * enemy-shadow-manager.js
 * =======================
 * Manages which enemy meshes are registered as shadow CASTERS
 * with Babylon.js ShadowGenerator.
 *
 * Background:
 *   - mesh.receiveShadows = true  → the mesh RECEIVES shadows from others (cheap)
 *   - ShadowGenerator.addShadowCaster(mesh) → the mesh CASTS shadows (expensive GPU)
 *
 *   The loader currently sets receiveShadows = true but never calls
 *   addShadowCaster(). This means enemies are lit correctly but cast NO shadow.
 *   This manager fixes that by tracking a budget and adding/removing casters
 *   based on distance tier.
 *
 * Shadow budget policy:
 *   Tier 1 (near, <18m)   → caster ON
 *   Tier 2 (medium, 18-40m)→ caster OFF (too expensive for shadows at this dist)
 *   Tier 3 (far, >40m)    → caster OFF
 *
 *   Hard budget: at most maxCasters enemies cast shadows at once.
 *   Priority: nearest enemies get the budget slots first.
 *
 * Usage:
 *   const shadowMgr = new EnemyShadowManager(shadowGenerator, { maxCasters: 8 });
 *   // After spawn:
 *   shadowMgr.registerEnemy(controller);
 *   // Every frame:
 *   shadowMgr.update(playerPos);
 *   // After recycle/dispose:
 *   shadowMgr.unregisterEnemy(controller);
 *   // Scene reset:
 *   shadowMgr.disposeAll();
 */
(function(global) {
  'use strict';

  class EnemyShadowManager {
    /**
     * @param {BABYLON.ShadowGenerator} shadowGenerator
     * @param {object} opts
     * @param {number} opts.maxCasters       Max simultaneous shadow casters (default 8)
     * @param {number} opts.casterRange      Only cast shadows within this radius (default 20m)
     * @param {number} opts.updateInterval   How often to rebalance casters (seconds, default 0.3)
     * @param {boolean} opts.debug
     */
    constructor(shadowGenerator, opts = {}) {
      this.shadowGen      = shadowGenerator;
      this.maxCasters     = opts.maxCasters    || 8;
      this.casterRange    = opts.casterRange   || 20;
      this.updateInterval = opts.updateInterval|| 0.3;
      this.debug          = opts.debug         || false;

      /** @type {Map<string, {controller, meshes[]}>}  uid → data */
      this._registry  = new Map();

      /** @type {Set<BABYLON.Mesh>} currently active casters */
      this._activeCasters = new Set();

      this._timer     = 0;
      this._playerPos = { x: 0, y: 0, z: 0 };
    }

    // ── Register a spawned enemy ──────────────────────────────────────────
    /**
     * Call after EnemyLoader.spawn() — gives us the mesh list.
     * @param {EnemyController} controller
     */
    registerEnemy(controller) {
      if (!controller || !controller.rootNode) return;
      if (this._registry.has(controller.uid)) return;

      // Collect all visual meshes that should cast shadow
      const meshes = (controller.visualMeshes || controller.meshes || [])
        .filter(m => m && !m.isDisposed() && !m.name.startsWith('HP_') && !m.name.startsWith('Collider_'));

      if (meshes.length === 0) return;

      // Ensure receiveShadows is set on all visual meshes
      for (const m of meshes) {
        m.receiveShadows = true;
      }

      this._registry.set(controller.uid, { controller, meshes });
    }

    // ── Unregister (recycle or dispose) ───────────────────────────────────
    unregisterEnemy(controller) {
      if (!controller) return;
      const data = this._registry.get(controller.uid);
      if (!data) return;

      this._removeCasters(data.meshes);
      this._registry.delete(controller.uid);
    }

    // ── Per-frame update ──────────────────────────────────────────────────
    /**
     * Call once per frame (or at reduced frequency).
     * @param {{ x, y, z }} playerPos
     * @param {number} dt  delta seconds
     */
    update(playerPos, dt) {
      this._playerPos = playerPos;
      this._timer += dt;
      if (this._timer < this.updateInterval) return;
      this._timer = 0;

      this._rebalance(playerPos);
    }

    // ── Internal: rebalance casters by distance ───────────────────────────
    _rebalance(playerPos) {
      const px = playerPos.x, pz = playerPos.z;

      // Compute distance for each registered enemy
      const candidates = [];
      for (const [uid, data] of this._registry) {
        const ctrl = data.controller;
        if (ctrl.isDead || !ctrl.rootNode || ctrl.rootNode.isDisposed()) {
          this._removeCasters(data.meshes);
          continue;
        }
        const dx = ctrl.rootNode.position.x - px;
        const dz = ctrl.rootNode.position.z - pz;
        const d  = Math.sqrt(dx * dx + dz * dz);
        candidates.push({ uid, data, dist: d });
      }

      // Sort nearest-first
      candidates.sort((a, b) => a.dist - b.dist);

      // Assign shadow budget to nearest enemies within range
      let budget = this.maxCasters;
      const wantsCaster = new Set();

      for (const c of candidates) {
        if (budget > 0 && c.dist <= this.casterRange && c.data.controller.performanceTier === 1) {
          wantsCaster.add(c.uid);
          budget--;
        }
      }

      // Add new casters
      for (const c of candidates) {
        if (wantsCaster.has(c.uid)) {
          this._addCasters(c.data.meshes);
        } else {
          this._removeCasters(c.data.meshes);
        }
      }

      if (this.debug) {
        console.log(`[ShadowMgr] Casters: ${this._activeCasters.size}/${this.maxCasters}, registered: ${this._registry.size}`);
      }
    }

    // ── Add mesh list to ShadowGenerator ─────────────────────────────────
    _addCasters(meshes) {
      if (!this.shadowGen) return;
      for (const m of meshes) {
        if (m.isDisposed() || this._activeCasters.has(m)) continue;
        try {
          this.shadowGen.addShadowCaster(m, false); // false = don't include children
          this._activeCasters.add(m);
        } catch(e) {}
      }
    }

    // ── Remove mesh list from ShadowGenerator ─────────────────────────────
    _removeCasters(meshes) {
      if (!this.shadowGen) return;
      for (const m of meshes) {
        if (!this._activeCasters.has(m)) continue;
        try {
          this.shadowGen.removeShadowCaster(m);
          this._activeCasters.delete(m);
        } catch(e) {}
      }
    }

    // ── Manual override ───────────────────────────────────────────────────

    /** Force add casters for a specific enemy (e.g. boss fight) */
    forceCaster(controller) {
      const data = this._registry.get(controller.uid);
      if (data) this._addCasters(data.meshes);
    }

    /** Force remove casters for a specific enemy */
    forceNoCaster(controller) {
      const data = this._registry.get(controller.uid);
      if (data) this._removeCasters(data.meshes);
    }

    // ── Swap shadow generator (e.g. when light changes) ──────────────────
    setShadowGenerator(newShadowGen) {
      // Remove all from old generator
      if (this.shadowGen) {
        for (const m of this._activeCasters) {
          try { this.shadowGen.removeShadowCaster(m); } catch(e) {}
        }
      }
      this._activeCasters.clear();
      this.shadowGen = newShadowGen;
      // They will be re-added on next rebalance tick
    }

    // ── Dispose ───────────────────────────────────────────────────────────
    disposeAll() {
      for (const data of this._registry.values()) {
        this._removeCasters(data.meshes);
      }
      this._registry.clear();
      this._activeCasters.clear();
    }

    getStats() {
      return {
        registered:    this._registry.size,
        activeCasters: this._activeCasters.size,
        maxCasters:    this.maxCasters
      };
    }
  }

  global.EnemyShadowManager = EnemyShadowManager;

})(typeof window !== 'undefined' ? window : this);
