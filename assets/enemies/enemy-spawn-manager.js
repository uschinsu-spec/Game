/**
 * enemy-spawn-manager.js
 * ======================
 * Zone-based enemy spawn/despawn/respawn system.
 *
 * Architecture:
 *
 *   EnemySpawnManager
 *   ├── zones[]            - map areas, each with allowed enemy types & density
 *   ├── EnemyPool          - reuses instances (zero GC)
 *   ├── player tracking    - drives spawn/despawn radius checks
 *   └── wave controller    - budget per zone, respawn cooldown
 *
 * Zone definition:
 *   {
 *     id:            'forest_north',
 *     center:        { x, z },       // world XZ position
 *     spawnRadius:   30,             // spawn inside this ring...
 *     minRadius:     10,             // ...but not closer than this
 *     despawnRadius: 60,             // remove when player is farther
 *     maxActive:     8,              // cap per zone
 *     density:       0.5,           // 0–1 target fill (0.5 = half of maxActive)
 *     respawnDelay:  15,             // seconds before a dead slot refills
 *     enemies: [                     // weighted enemy types
 *       { id: 'big_orc',  weight: 3 },
 *       { id: 'blob_mushnub', weight: 5 },
 *       { id: 'flying_armabee', weight: 2 }
 *     ]
 *   }
 *
 * Usage:
 *   const mgr = new EnemySpawnManager(scene, pool, { debug: true });
 *   mgr.addZone({ id:'forest', center:{x:0,z:0}, spawnRadius:30, ... });
 *   // game loop:
 *   mgr.update(dt, playerPosition);
 */
(function(global) {
  'use strict';

  // ─── Weighted random pick ────────────────────────────────────────────────
  function weightedPick(entries) {
    const total = entries.reduce((s, e) => s + (e.weight || 1), 0);
    let r = Math.random() * total;
    for (const e of entries) {
      r -= (e.weight || 1);
      if (r <= 0) return e.id;
    }
    return entries[entries.length - 1].id;
  }

  // ─── Random point in annulus (ring between minR and maxR) ───────────────
  function randomPointInRing(cx, cz, minR, maxR) {
    const angle = Math.random() * Math.PI * 2;
    const r     = minR + Math.random() * (maxR - minR);
    return { x: cx + Math.cos(angle) * r, z: cz + Math.sin(angle) * r };
  }

  // ─── Zone runtime state ──────────────────────────────────────────────────
  class SpawnZone {
    constructor(def) {
      this.id           = def.id          || ('zone_' + Date.now());
      this.center       = def.center      || { x: 0, z: 0 };
      this.spawnRadius  = def.spawnRadius || 30;
      this.minRadius    = def.minRadius   || 8;
      this.despawnRadius= def.despawnRadius || this.spawnRadius * 2;
      this.maxActive    = def.maxActive   || 6;
      this.density      = Math.max(0.1, Math.min(1.0, def.density || 0.6));
      this.respawnDelay = def.respawnDelay || 15;   // seconds
      this.enemies      = def.enemies     || [{ id: 'big_orc', weight: 1 }];
      this.enabled      = def.enabled !== false;
      this.yOffset      = def.yOffset     || 0;     // ground height

      // Runtime
      /** @type {Set<string>} active uids belonging to this zone */
      this.activeUids   = new Set();
      this._respawnTimers = [];  // [{remaining, enemyId}]
      this._spawning    = false; // lock during async spawn
    }

    get targetCount() {
      return Math.ceil(this.maxActive * this.density);
    }

    get activeCount() {
      return this.activeUids.size;
    }

    distToCenter(px, pz) {
      const dx = px - this.center.x;
      const dz = pz - this.center.z;
      return Math.sqrt(dx * dx + dz * dz);
    }

    tickRespawnTimers(dt) {
      for (const t of this._respawnTimers) t.remaining -= dt;
      // Return timers that are ready
      const ready = this._respawnTimers.filter(t => t.remaining <= 0);
      this._respawnTimers = this._respawnTimers.filter(t => t.remaining > 0);
      return ready;
    }

    scheduleRespawn(enemyId) {
      this._respawnTimers.push({
        remaining: this.respawnDelay + Math.random() * 5, // jitter
        enemyId
      });
    }

    randomSpawnPoint() {
      return randomPointInRing(
        this.center.x, this.center.z,
        this.minRadius, this.spawnRadius
      );
    }
  }

  // ─── EnemySpawnManager ───────────────────────────────────────────────────
  class EnemySpawnManager {
    /**
     * @param {BABYLON.Scene} scene
     * @param {EnemyPool}     pool
     * @param {object}        opts
     * @param {number}        opts.globalMaxActive  Hard cap across all zones (default 80)
     * @param {boolean}       opts.debug
     */
    constructor(scene, pool, opts = {}) {
      this.scene           = scene;
      this.pool            = pool;
      this.globalMaxActive = opts.globalMaxActive || 80;
      this.debug           = opts.debug || false;

      /** @type {Map<string, SpawnZone>} */
      this.zones = new Map();

      /** @type {Map<string, string>} uid → zoneId  */
      this._uidToZone = new Map();

      this._playerPos = { x: 0, y: 0, z: 0 };
      this._tickAccum = 0;
      this._tickRate  = 0.5;  // run zone logic every 500ms
    }

    // ── Zone management ────────────────────────────────────────────────────
    addZone(def) {
      const zone = new SpawnZone(def);
      this.zones.set(zone.id, zone);
      if (this.debug) console.log(`[SpawnMgr] Zone added: ${zone.id}`);
      return zone;
    }

    removeZone(zoneId) {
      const zone = this.zones.get(zoneId);
      if (!zone) return;
      // Despawn all enemies in zone
      for (const uid of zone.activeUids) {
        this.pool.despawn(uid);
        this._uidToZone.delete(uid);
      }
      this.zones.delete(zoneId);
    }

    setZoneEnabled(zoneId, enabled) {
      const zone = this.zones.get(zoneId);
      if (zone) zone.enabled = enabled;
    }

    // ── Main update ────────────────────────────────────────────────────────
    /**
     * Call every frame.
     * @param {number} dt
     * @param {{ x, y, z }} playerPos
     */
    update(dt, playerPos) {
      this._playerPos = playerPos;

      // Let pool handle AI updates
      this.pool.update(dt, playerPos);

      // Zone logic at reduced frequency
      this._tickAccum += dt;
      if (this._tickAccum < this._tickRate) return;
      const elapsed = this._tickAccum;
      this._tickAccum = 0;

      this._processZones(elapsed, playerPos);
    }

    _processZones(dt, playerPos) {
      const px = playerPos.x, pz = playerPos.z || playerPos.z;
      const totalActive = this.pool.active.size;

      for (const zone of this.zones.values()) {
        if (!zone.enabled) continue;

        const distToZone = zone.distToCenter(px, pz);

        // ── Despawn: player left despawn radius ──────────────────────────
        if (distToZone > zone.despawnRadius) {
          this._despawnZone(zone);
          continue;
        }

        // ── Respawn timers ───────────────────────────────────────────────
        const readyRespawns = zone.tickRespawnTimers(dt);
        for (const timer of readyRespawns) {
          if (distToZone <= zone.spawnRadius) {
            this._spawnOne(zone, timer.enemyId);
          } else {
            // Player not near — push back into queue
            zone.scheduleRespawn(timer.enemyId);
          }
        }

        // ── Fill to target density ───────────────────────────────────────
        const needed = zone.targetCount - zone.activeCount;
        if (needed > 0 && totalActive < this.globalMaxActive && distToZone <= zone.spawnRadius) {
          for (let i = 0; i < needed; i++) {
            this._spawnOne(zone);
          }
        }

        // ── Remove dead/recycled UIDs from zone tracking ─────────────────
        for (const uid of [...zone.activeUids]) {
          if (!this.pool.active.has(uid)) {
            zone.activeUids.delete(uid);
            this._uidToZone.delete(uid);
            // Schedule respawn with a random enemy from zone's list
            const picked = weightedPick(zone.enemies);
            zone.scheduleRespawn(picked);
            if (this.debug) console.log(`[SpawnMgr] [${zone.id}] Death tracked → respawn in ${zone.respawnDelay}s`);
          }
        }
      }
    }

    async _spawnOne(zone, forcedEnemyId = null) {
      if (zone._spawning) return; // no parallel spawns per zone
      zone._spawning = true;

      try {
        const enemyId = forcedEnemyId || weightedPick(zone.enemies);
        const pt      = zone.randomSpawnPoint();

        // Fix #6: use enemy's groundOffset for Y so flying enemies hover correctly
        const info  = global.EnemyRegistry ? global.EnemyRegistry.get(enemyId) : null;
        const spawnY = zone.yOffset + (info && info.groundOffset ? info.groundOffset : 0);

        const controller = await this.pool.spawn(enemyId, {
          position:  { x: pt.x, y: spawnY, z: pt.z },
          rotationY: Math.random() * Math.PI * 2,
          onAttackHit: (ev) => {
            if (this.onEnemyAttackHit) this.onEnemyAttackHit(ev, zone.id);
          },
          onDeath: (ev) => {
            if (this.onEnemyDeath) this.onEnemyDeath(ev, zone.id);
          }
        });

        if (controller) {
          // Fix #9: Re-check zone validity after async GLB load.
          // Player may have moved out of range during the await.
          const zoneStillValid = this.zones.has(zone.id) && zone.enabled;
          const px = this._playerPos.x, pz = this._playerPos.z;
          const playerStillNear = zone.distToCenter(px, pz) <= zone.despawnRadius;

          if (zoneStillValid && playerStillNear) {
            zone.activeUids.add(controller.uid);
            this._uidToZone.set(controller.uid, zone.id);
            if (this.debug) console.log(`[SpawnMgr] [${zone.id}] Spawned ${enemyId} @ (${pt.x.toFixed(1)}, ${pt.z.toFixed(1)})`);
          } else {
            // Zone gone or player left — immediately recycle without registering
            this.pool.recycle(controller);
            if (this.debug) console.log(`[SpawnMgr] [${zone.id}] Spawn cancelled (zone inactive after await): ${enemyId}`);
          }
        }
      } finally {
        zone._spawning = false;
      }
    }

    _despawnZone(zone) {
      if (zone.activeCount === 0) return;
      if (this.debug) console.log(`[SpawnMgr] [${zone.id}] Despawning ${zone.activeCount} enemies (out of range)`);

      for (const uid of [...zone.activeUids]) {
        const ctrl = this.pool.active.get(uid);
        if (ctrl) this.pool.recycle(ctrl);
        this._uidToZone.delete(uid);
      }
      zone.activeUids.clear();
    }

    // ── Public controls ────────────────────────────────────────────────────

    /** Force immediate spawn wave in a zone */
    triggerWave(zoneId, count, enemyIdOverride = null) {
      const zone = this.zones.get(zoneId);
      if (!zone) return;
      for (let i = 0; i < count; i++) {
        this._spawnOne(zone, enemyIdOverride);
      }
    }

    /** Instantly clear a zone (e.g. boss cutscene) */
    clearZone(zoneId) {
      const zone = this.zones.get(zoneId);
      if (zone) this._despawnZone(zone);
    }

    /** Get live stats */
    getStats() {
      const stats = { totalActive: this.pool.active.size, zones: {} };
      for (const [id, zone] of this.zones) {
        stats.zones[id] = {
          active:   zone.activeCount,
          target:   zone.targetCount,
          respawns: zone._respawnTimers.length
        };
      }
      return stats;
    }
  }

  global.EnemySpawnManager = EnemySpawnManager;
  global.SpawnZone          = SpawnZone;

})(typeof window !== 'undefined' ? window : this);
