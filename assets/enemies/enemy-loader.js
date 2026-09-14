(function(global) {
  'use strict';

  const containerCache  = new Map();
  const loadingPromises = new Map();

  /**
   * Creates an invisible capsule collider for an enemy.
   * Parented to rootNode so it moves with the enemy automatically.
   * Visual meshes use checkCollisions = false for performance.
   */
  function createCapsuleCollider(uid, info, rootNode, scene) {
    const cDef    = global.EnemyRegistry ? global.EnemyRegistry.getColliderDef(info.id) : null;
    const cHeight = cDef ? cDef.colliderHeight : 1.8;
    const cRadius = cDef ? cDef.colliderRadius : 0.4;
    const gOffset = cDef ? cDef.groundOffset   : 0.0;

    let capsule;
    if (BABYLON.MeshBuilder.CreateCapsule) {
      capsule = BABYLON.MeshBuilder.CreateCapsule(
        'Collider_' + uid,
        { radius: cRadius, height: cHeight, tessellation: 8 },
        scene
      );
    } else {
      capsule = BABYLON.MeshBuilder.CreateCylinder(
        'Collider_' + uid,
        { diameter: cRadius * 2, height: cHeight, tessellation: 8 },
        scene
      );
    }

    capsule.position.y    = gOffset + cHeight * 0.5;
    capsule.parent        = rootNode;
    capsule.isVisible     = false;
    capsule.isPickable    = false;
    capsule.checkCollisions = true;
    capsule.receiveShadows  = false;
    capsule.metadata        = { isCollider: true, enemyId: info.id };
    return capsule;
  }

  class EnemyLoader {
    /**
     * Load and cache GLB asset container (loaded only once per model).
     */
    static async loadModel(enemyId, scene) {
      if (containerCache.has(enemyId))  return containerCache.get(enemyId);
      if (loadingPromises.has(enemyId)) return loadingPromises.get(enemyId);

      const info      = global.EnemyRegistry ? global.EnemyRegistry.get(enemyId) : null;
      const modelPath = info ? info.modelPath : `./assets/enemies/big/${enemyId}.glb`;

      let rootUrl = '';
      let fileName = modelPath;
      const lastSlash = modelPath.lastIndexOf('/');
      if (lastSlash !== -1) {
        rootUrl = modelPath.substring(0, lastSlash + 1);
        fileName = modelPath.substring(lastSlash + 1);
      }

      const promise = (async () => {
        try {
          const container = await BABYLON.SceneLoader.LoadAssetContainerAsync(rootUrl, fileName, scene, null, '.glb');
          containerCache.set(enemyId, container);
          return container;
        } catch (err) {
          console.error(`[EnemyLoader] Failed to load "${enemyId}" from ${modelPath}:`, err);
          return null;
        } finally {
          loadingPromises.delete(enemyId);
        }
      })();

      loadingPromises.set(enemyId, promise);
      return promise;
    }

    /** Preload a list of enemies into cache. */
    static async preload(enemyIdList = [], scene) {
      return Promise.all(enemyIdList.map(id => this.loadModel(id, scene)));
    }

    /**
     * Unload a single enemy model from cache and release GPU memory.
     *
     * ⚠️ Fix #10: If a pool is provided, flushes ALL inactive pool instances
     * of this type BEFORE disposing the GPU asset, preventing use-after-free.
     *
     * Safe call order:
     *   pool.flushType(id)          ← disposes pool's stale instances
     *   EnemyLoader.unload(id)      ← disposes GPU container
     *   OR just: EnemyLoader.unload(id, pool)  ← does both atomically
     *
     * @param {string}     enemyId
     * @param {EnemyPool}  [pool]  Optional pool to flush before unloading
     * @returns {boolean}
     */
    static unload(enemyId, pool = null) {
      // Fix #10: flush pool FIRST so no stale inactive instances reference this container
      if (pool && pool.flushType) {
        pool.flushType(enemyId);
      }

      const container = containerCache.get(enemyId);
      if (!container) return false;

      try {
        container.dispose();
      } catch(e) {
        console.warn(`[EnemyLoader] Error disposing container for "${enemyId}":`, e);
      }

      containerCache.delete(enemyId);
      loadingPromises.delete(enemyId);
      console.log(`[EnemyLoader] Unloaded: ${enemyId}`);
      return true;
    }

    /**
     * Unload all cached models and free GPU memory.
     *
     * @param {string[]}  [keepIds]  IDs to preserve in cache
     * @param {EnemyPool} [pool]     If provided, flushes pool instances before dispose
     * @returns {number}
     */
    static clearCache(keepIds = [], pool = null) {
      const keepSet = new Set(keepIds);
      let count = 0;

      for (const [id] of containerCache) {
        if (keepSet.has(id)) continue;
        this.unload(id, pool); // delegates flush + dispose atomically
        count++;
      }

      for (const id of loadingPromises.keys()) {
        if (!keepSet.has(id)) loadingPromises.delete(id);
      }

      console.log(`[EnemyLoader] Cache cleared. Unloaded ${count} model(s). Kept: [${[...keepSet].join(', ')}]`);
      return count;
    }

    /**
     * Returns a snapshot of what is currently in the cache.
     * Useful for debugging or building a preload manifest.
     *
     * @returns {{ loaded: string[], loading: string[], totalLoaded: number }}
     */
    static getCacheInfo() {
      return {
        loaded:      [...containerCache.keys()],
        loading:     [...loadingPromises.keys()],
        totalLoaded: containerCache.size
      };
    }


    /**
     * Spawn an enemy instance.
     * Returns EnemyController with visualMeshes[] exposed for:
     *   - EnemyShadowManager.registerEnemy()
     *   - EnemyLOD.attach()
     */
    static async spawn(enemyId, scene, options = {}) {

      const container = await this.loadModel(enemyId, scene);
      if (!container) {
        console.warn(`[EnemyLoader] Cannot spawn "${enemyId}" — model not loaded.`);
        return null;
      }

      const info = global.EnemyRegistry ? global.EnemyRegistry.get(enemyId) : {};
      const uid  = 'enemy_' + enemyId + '_' + Date.now() + '_' + Math.floor(Math.random() * 10000);

      const instance = container.instantiateModelsToScene(
        (name) => `${name}_${uid}`,
        false,
        { doNotInstantiate: true }
      );

      // ── Root transform ─────────────────────────────────────────────────
      const rootNode    = new BABYLON.TransformNode('Root_' + uid, scene);
      const pos         = options.position || { x: 0, y: 0, z: 0 };
      const targetScale = options.scale !== undefined ? options.scale : (info.scale || 1.0);
      rootNode.position.set(pos.x, pos.y || 0, pos.z);
      rootNode.scaling.setAll(targetScale);
      if (options.rotationY !== undefined) rootNode.rotation.y = options.rotationY;

      // ── Parent visual meshes ───────────────────────────────────────────
      for (const rootMesh of instance.rootNodes) {
        rootMesh.parent = rootNode;
        rootMesh.setEnabled(true);
      }

      // ── Visual mesh flags ──────────────────────────────────────────────
      const visualMeshes = [];
      for (const rootMesh of instance.rootNodes) {
        rootMesh.getChildMeshes(false).forEach(m => {
          m.setEnabled(true);
          m.isVisible       = true;
          m.isPickable      = true;
          m.checkCollisions = false;
          if (!m.name.startsWith('HP_') && !m.name.startsWith('Collider_')) {
            visualMeshes.push(m);
          }
        });
      }

      // ── Capsule collider ───────────────────────────────────────────────
      const colliderMesh = createCapsuleCollider(uid, info, rootNode, scene);

      // ── Animation ─────────────────────────────────────────────────────
      const animCtrl = new global.EnemyAnimationController(instance.animationGroups);
      animCtrl.play('Idle', true);

      // ── EnemyController ────────────────────────────────────────────────
      if (global.EnemyController) {
        return new global.EnemyController({
          uid, enemyId, info, rootNode, colliderMesh,
          visualMeshes,   // ← ShadowManager & LOD use this
          scene,
          animationController: animCtrl,
          instanceData: instance,
          options
        });
      }

      return {
        uid, enemyId, info, rootNode, colliderMesh,
        visualMeshes,
        animationController: animCtrl,
        instanceData: instance
      };
    }
  }

  global.EnemyLoader = EnemyLoader;
})(typeof window !== 'undefined' ? window : this);
