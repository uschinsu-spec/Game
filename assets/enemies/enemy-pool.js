/**
 * enemy-pool.js
 * =============
 * Object pool for enemy instances to avoid GC pressure on spawn/despawn.
 *
 * Architecture:
 *   EnemyPool
 *   ├── active   Map<uid, EnemyController>   - currently alive enemies
 *   └── inactive Map<enemyId, EnemyController[]> - dormant, ready to reuse
 *
 * Usage:
 *   const pool = new EnemyPool(scene);
 *   const enemy = await pool.spawn('big_demon', { position: {x,y,z} });
 *   pool.recycle(enemy);          // deactivates & stores for reuse
 *   pool.despawn(enemy.uid);      // permanent remove from active
 *   pool.update(dt, playerPos);   // call every frame
 */
(function(global) {
  'use strict';

  class EnemyPool {
    /**
     * @param {BABYLON.Scene} scene
     * @param {object}        opts
     * @param {number}        opts.maxPerType   Max inactive per enemy type (default 5)
     * @param {number}        opts.maxTotal     Hard cap on active enemies (default 100)
     * @param {boolean}       opts.debug        Log pool stats
     */
    constructor(scene, opts = {}) {
      this.scene      = scene;
      this.maxPerType = opts.maxPerType || 5;
      this.maxTotal   = opts.maxTotal   || 100;
      this.debug      = opts.debug      || false;

      /** @type {Map<string, import('./enemy-controller').EnemyController>} */
      this.active   = new Map();  // uid → controller

      /** @type {Map<string, Array>} */
      this.inactive = new Map();  // enemyId → controller[]

      // Fix #8: persistent Set so setTimeout closures don't close over stale arrays
      /** @type {Set<string>} uids scheduled for recycle after death animation */
      this._pendingRecycle = new Set();
    }

    // ── Internal: activate a recycled controller ─────────────────────────
    _activateRecycled(controller, options) {
      const pos = options.position || { x: 0, y: 0, z: 0 };

      // Re-enable scene objects
      controller.rootNode.setEnabled(true);
      controller.rootNode.position.set(pos.x, pos.y || 0, pos.z);
      if (options.rotationY !== undefined) {
        controller.rootNode.rotation.y = options.rotationY;
      }

      // Re-enable collider
      if (controller.colliderMesh) {
        controller.colliderMesh.setEnabled(true);
        controller.colliderMesh.checkCollisions = true;
      }

      // Reset combat state
      const info    = controller.info || {};
      controller.hp      = options.hp     || info.hp     || 1000;
      controller.maxHp   = controller.hp;
      controller.damage  = options.damage || info.damage || 80;
      controller.isDead  = false;
      controller.state   = 'idle';
      controller.target  = null;
      controller._inWindup  = false;
      controller._hitDealt  = false;
      controller._deathRecycleScheduled = false;  // Fix #8: reset death flag
      controller._spawnY = pos.y || 0;             // Fix #6: anchor flying Y
      controller.performanceTier = 1;
      controller.aiAccumulator   = 0;
      controller.tierCheckAccumulator = Math.random() * 0.3;
      controller.shadowsEnabled  = true;

      // Rebuild HP bar if disposed during previous death
      if (controller.hpBarMesh && controller.hpBarMesh.isDisposed()) {
        controller.hpBarMesh = null;
        controller.hpBarFill = null;
        controller.initHpBar && controller.initHpBar();
      }
      if (controller.hpBarMesh) {
        controller.hpBarMesh.setEnabled(true);
        controller.updateHpBar && controller.updateHpBar();
      }

      // Reset animation (clears external events, preserves internal damage listeners)
      if (controller.anim) {
        controller.anim.reset();  // only clears anim.events (external layer)
        controller.anim.play('Idle', true);

        // Re-attach caller-provided external hooks (VFX, sound, loot)
        if (options.onAttackHit) controller.anim.events.on('onAttackHit', options.onAttackHit);
        if (options.onDeath)     controller.anim.events.on('onDeath',     options.onDeath);
        if (options.onFootstep)  controller.anim.events.on('onFootstep',  options.onFootstep);
      }

      // Assign fresh uid (node names intentionally keep old uid — cosmetic only)
      const newUid = 'enemy_' + controller.enemyId + '_' + Date.now() + '_' + Math.floor(Math.random() * 9999);
      controller.uid = newUid;
      controller._managedByPool = true;

      this.active.set(newUid, controller);

      if (this.debug) console.log(`[EnemyPool] ♻️ Recycled ${controller.enemyId} → ${newUid}`);
      return controller;
    }

    // ── Spawn ─────────────────────────────────────────────────────────────
    /**
     * Spawn an enemy. Reuses a pooled instance if available, otherwise loads fresh.
     * @param {string}  enemyId
     * @param {object}  options  - { position, rotationY, hp, damage, onAttackHit, onDeath }
     * @returns {Promise<EnemyController|null>}
     */
    async spawn(enemyId, options = {}) {
      if (this.active.size >= this.maxTotal) {
        if (this.debug) console.warn(`[EnemyPool] maxTotal (${this.maxTotal}) reached. Skipping spawn.`);
        return null;
      }

      // Try to reuse from inactive pool
      const bucket = this.inactive.get(enemyId);
      if (bucket && bucket.length > 0) {
        const recycled = bucket.pop();
        return this._activateRecycled(recycled, options);
      }

      // Fresh spawn via EnemyLoader
      if (!global.EnemyLoader) {
        console.error('[EnemyPool] EnemyLoader not found.');
        return null;
      }

      const controller = await global.EnemyLoader.spawn(enemyId, this.scene, options);
      if (!controller) return null;

      controller._managedByPool = true;
      controller._spawnY = (options.position && options.position.y) || 0; // Fix #6

      // Attach external event hooks
      if (controller.anim) {
        if (options.onAttackHit) controller.anim.events.on('onAttackHit', options.onAttackHit);
        if (options.onDeath)     controller.anim.events.on('onDeath',     options.onDeath);
        if (options.onFootstep)  controller.anim.events.on('onFootstep',  options.onFootstep);
      }

      this.active.set(controller.uid, controller);
      if (this.debug) console.log(`[EnemyPool] 🆕 Fresh spawn: ${enemyId} → ${controller.uid}`);
      return controller;
    }

    // ── Recycle (soft despawn) ─────────────────────────────────────────────
    /**
     * Move an enemy from active → inactive pool.
     * Hides it; does NOT destroy any Babylon objects.
     * @param {EnemyController} controller
     */
    recycle(controller) {
      if (!controller) return;
      if (controller._recycling) return; // guard against double-recycle
      controller._recycling = true;

      this.active.delete(controller.uid);
      this._pendingRecycle.delete(controller.uid); // Fix #8: clear any pending timer

      // Hide root node
      if (controller.rootNode) controller.rootNode.setEnabled(false);
      if (controller.colliderMesh) {
        controller.colliderMesh.setEnabled(false);
        controller.colliderMesh.checkCollisions = false;
      }
      if (controller.hpBarMesh && !controller.hpBarMesh.isDisposed()) {
        controller.hpBarMesh.setEnabled(false);
      }
      // Reset animation external listeners only
      if (controller.anim) controller.anim.reset();

      controller._recycling = false;

      // Store in inactive bucket or permanently dispose if full
      const id = controller.enemyId;
      if (!this.inactive.has(id)) this.inactive.set(id, []);

      const bucket = this.inactive.get(id);
      if (bucket.length < this.maxPerType) {
        bucket.push(controller);
        if (this.debug) console.log(`[EnemyPool] 💤 Recycled ${id}. Pool: ${bucket.length}/${this.maxPerType}`);
      } else {
        controller.dispose && controller.dispose();
        if (this.debug) console.log(`[EnemyPool] 🗑️ Pool full for ${id}. Disposed.`);
      }
    }

    // ── Hard despawn ──────────────────────────────────────────────────────
    /**
     * Permanently remove an enemy (editor clear, scene reset, etc.)
     */
    despawn(uid) {
      const ctrl = this.active.get(uid);
      if (ctrl) {
        this.active.delete(uid);
        ctrl.dispose && ctrl.dispose();
      }
    }

    // ── Update loop ───────────────────────────────────────────────────────
    /**
     * Call every frame from your game loop.
     * Handles AI update + auto-recycle of dead enemies.
     * @param {number} dt          delta time in seconds
     * @param {BABYLON.Vector3} [playerPos] optional player position for LOD
     */
    update(dt, playerPos) {
      // Fix #8: flush persistent _pendingRecycle set (timers resolve here)
      if (this._pendingRecycle.size > 0) {
        for (const uid of this._pendingRecycle) {
          const ctrl = this.active.get(uid);
          if (ctrl) this.recycle(ctrl);
        }
        this._pendingRecycle.clear();
      }

      for (const [uid, ctrl] of this.active) {
        if (ctrl.isDead) {
          // Schedule recycle after death animation completes
          if (!ctrl._deathRecycleScheduled) {
            ctrl._deathRecycleScheduled = true;
            const capturedUid = uid; // explicit capture — no stale closure
            setTimeout(() => {
              this._pendingRecycle.add(capturedUid); // push to persistent Set
            }, 2800);
          }
          continue;
        }

        ctrl.update(dt);
      }
    }

    // ── Stats ─────────────────────────────────────────────────────────────
    getStats() {
      const inactiveTotal = Array.from(this.inactive.values()).reduce((s, a) => s + a.length, 0);
      return {
        active:   this.active.size,
        inactive: inactiveTotal,
        byType:   Object.fromEntries(
          Array.from(this.inactive.entries()).map(([k, v]) => [k, v.length])
        )
      };
    }

    // ── Clear all ─────────────────────────────────────────────────────────
    /**
     * Dispose all enemies (active + inactive). Call on scene unload.
     */
    disposeAll() {
      // Cancel all pending recycle timers
      this._pendingRecycle.clear();

      for (const ctrl of this.active.values()) {
        ctrl.dispose && ctrl.dispose();
      }
      for (const bucket of this.inactive.values()) {
        bucket.forEach(ctrl => ctrl.dispose && ctrl.dispose());
      }
      this.active.clear();
      this.inactive.clear();
    }

    /**
     * Fix #10: Flush (dispose) all inactive instances of a given enemy type.
     * Must be called BEFORE EnemyLoader.unload(id) to prevent use-after-free.
     * @param {string} enemyId
     */
    flushType(enemyId) {
      const bucket = this.inactive.get(enemyId);
      if (bucket) {
        bucket.forEach(ctrl => ctrl.dispose && ctrl.dispose());
        this.inactive.delete(enemyId);
      }
      // Also remove any active enemies of this type (rare — map unload)
      for (const [uid, ctrl] of this.active) {
        if (ctrl.enemyId === enemyId) {
          this.active.delete(uid);
          ctrl.dispose && ctrl.dispose();
        }
      }
      if (this.debug) console.log(`[EnemyPool] 🧹 Flushed type: ${enemyId}`);
    }

    /**
     * Preload a set of enemies into the inactive pool.
     * Useful for prewarming before a wave starts.
     * @param {Array<{id, count}>} list
     */
    async prewarm(list) {
      const jobs = [];
      for (const { id, count } of list) {
        for (let i = 0; i < count; i++) {
          jobs.push(
            global.EnemyLoader.spawn(id, this.scene, { position: { x: 0, y: -999, z: 0 } })
              .then(ctrl => {
                if (ctrl) this.recycle(ctrl);
              })
          );
        }
      }
      await Promise.all(jobs);
      if (this.debug) console.log('[EnemyPool] Prewarm done:', this.getStats());
    }
  }

  global.EnemyPool = EnemyPool;

})(typeof window !== 'undefined' ? window : this);
