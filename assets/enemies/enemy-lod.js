/**
 * enemy-lod.js
 * ============
 * Geometry-level LOD system for enemies.
 *
 * LOD Levels:
 *   LOD0  - original GLB mesh (full quality, <18m)
 *   LOD1  - auto-simplified mesh (medium quality, 18–40m)
 *   LOD2  - billboard impostor plane (very far, >40m)
 *
 * How it works:
 *   Babylon.js mesh.addLODLevel(distance, lodMesh) handles the GPU-side swap.
 *   EnemyLOD wraps this and generates LOD1 via Babylon's SimplificationQueue,
 *   and LOD2 as a DynamicTexture billboard.
 *
 *   If simplification is unavailable (mobile), LOD1 falls through to LOD2.
 *
 * Usage:
 *   const lod = new EnemyLOD(scene, shadowManager);
 *   // After enemy spawns:
 *   lod.attach(controller);
 *   // When enemy recycled:
 *   lod.detach(controller);
 *
 * Per-enemy override via registry:
 *   info.lod = { lod1Distance: 20, lod2Distance: 45, lod1Quality: 0.5 }
 */
(function(global) {
  'use strict';

  // ── Default distances (metres) ───────────────────────────────────────────
  const DEFAULT_LOD = {
    lod1Distance: 18,    // switch to reduced mesh
    lod2Distance: 42,    // switch to billboard
    lod1Quality:  0.45,  // 45% of original triangles (SimplificationQueue)
    lod2Quality:  0.20,  // 20% for LOD2 (not used if billboard)
    useBillboard: true   // LOD2 = billboard impostor
  };

  // ── LOD impostor colors per category (for billboard tint) ───────────────
  const CAT_COLOR = {
    big:    '#c0392b',
    blob:   '#27ae60',
    flying: '#8e44ad'
  };

  // ─── EnemyLOD ────────────────────────────────────────────────────────────
  class EnemyLOD {
    /**
     * @param {BABYLON.Scene}  scene
     * @param {EnemyShadowManager} [shadowMgr]  optional — manages caster registration
     */
    constructor(scene, shadowMgr = null) {
      this.scene     = scene;
      this.shadowMgr = shadowMgr;

      /** Map from uid → { billboardMesh, lodMeshes[] } */
      this._attached = new Map();
    }

    // ── Attach LOD to a spawned enemy ─────────────────────────────────────
    /**
     * @param {EnemyController} controller
     */
    attach(controller) {
      if (!controller || !controller.rootNode) return;
      if (this._attached.has(controller.uid)) return;

      const info    = controller.info || {};
      const lodConf = Object.assign({}, DEFAULT_LOD, info.lod || {});
      const meshes  = controller.visualMeshes || controller.meshes || [];

      if (meshes.length === 0) return;

      const billboardMesh = this._buildBillboard(controller, lodConf);
      const lodMeshes     = [];

      for (const mesh of meshes) {
        if (!mesh || mesh.isDisposed()) continue;

        // LOD2: billboard impostor (always added first = farthest distance)
        if (lodConf.useBillboard && billboardMesh) {
          try {
            mesh.addLODLevel(lodConf.lod2Distance, billboardMesh);
          } catch(e) { /* some meshes don't support LOD */ }
        } else {
          try {
            mesh.addLODLevel(lodConf.lod2Distance, null); // null = hidden
          } catch(e) {}
        }

        // LOD1: simplified geometry
        this._buildLOD1(mesh, lodConf, (lod1Mesh) => {
          if (!lod1Mesh) return;
          lodMeshes.push(lod1Mesh);
          try {
            mesh.addLODLevel(lodConf.lod1Distance, lod1Mesh);
          } catch(e) {}
        });
      }

      this._attached.set(controller.uid, { billboardMesh, lodMeshes });

      if (this.shadowMgr) {
        this.shadowMgr.registerEnemy(controller);
      }
    }

    // ── Detach / clean up ─────────────────────────────────────────────────
    detach(controller) {
      if (!controller) return;
      const data = this._attached.get(controller.uid);
      if (!data) return;

      if (data.billboardMesh && !data.billboardMesh.isDisposed()) {
        data.billboardMesh.dispose();
      }
      for (const m of data.lodMeshes) {
        if (!m.isDisposed()) m.dispose();
      }

      this._attached.delete(controller.uid);

      if (this.shadowMgr) {
        this.shadowMgr.unregisterEnemy(controller);
      }
    }

    // ── Build LOD1 via SimplificationQueue ────────────────────────────────
    _buildLOD1(sourceMesh, lodConf, callback) {
      // Babylon SimplificationQueue (requires BABYLON.SimplificationQueue)
      if (!sourceMesh.simplify || typeof sourceMesh.simplify !== 'function') {
        // Fallback: clone mesh and manually reduce via octree / decimation hint
        // For now, skip LOD1 on unsupported platforms (mobile)
        callback(null);
        return;
      }

      sourceMesh.simplify(
        [{ quality: lodConf.lod1Quality, distance: lodConf.lod1Distance }],
        false, // async background
        BABYLON.SimplificationType.QUADRATIC,
        (simplifiedMesh) => {
          if (simplifiedMesh) {
            simplifiedMesh.isVisible     = false; // managed by LOD system
            simplifiedMesh.receiveShadows= true;
            simplifiedMesh.isPickable    = false;
            callback(simplifiedMesh);
          } else {
            callback(null);
          }
        }
      );
    }

    // ── Build LOD2 billboard impostor ─────────────────────────────────────
    _buildBillboard(controller, lodConf) {
      if (!lodConf.useBillboard) return null;

      const info   = controller.info || {};
      const height = (info.height || 2.0) * (info.scale || 1.0);
      const width  = height * 0.6;

      const billboard = BABYLON.MeshBuilder.CreatePlane(
        'LOD2_Billboard_' + controller.uid,
        { width, height },
        this.scene
      );

      // Parent to rootNode so it follows the enemy
      billboard.parent       = controller.rootNode;
      billboard.position.y   = height * 0.5 + (info.groundOffset || 0);
      billboard.billboardMode= BABYLON.Mesh.BILLBOARDMODE_Y; // rotate on Y axis only
      billboard.isPickable   = false;
      billboard.receiveShadows = false;

      // Create a colored silhouette texture
      const texW   = 64, texH = 128;
      const dynTex = new BABYLON.DynamicTexture(
        'LOD2_Tex_' + controller.uid,
        { width: texW, height: texH },
        this.scene, false
      );
      dynTex.hasAlpha = true;

      const ctx  = dynTex.getContext();
      const color= CAT_COLOR[info.cat] || '#888888';
      ctx.clearRect(0, 0, texW, texH);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.75;
      // Simple rounded rectangle silhouette
      ctx.beginPath();
      ctx.roundRect(8, 8, texW - 16, texH - 16, 12);
      ctx.fill();
      // Emoji icon overlay
      if (info.icon) {
        ctx.globalAlpha = 1.0;
        ctx.font        = '28px serif';
        ctx.textAlign   = 'center';
        ctx.fillText(info.icon, texW / 2, texH / 2 + 10);
      }
      dynTex.update();

      const mat  = new BABYLON.StandardMaterial('LOD2_Mat_' + controller.uid, this.scene);
      mat.diffuseTexture  = dynTex;
      mat.emissiveColor   = BABYLON.Color3.FromHexString(color || '#888888').scale(0.4);
      mat.specularColor   = BABYLON.Color3.Black();
      mat.backFaceCulling = false;
      billboard.material  = mat;

      // Initially hidden (LOD system controls visibility by distance)
      billboard.isVisible = false;

      return billboard;
    }

    /**
     * Force-refresh LOD configuration for an enemy (e.g., after settings change).
     */
    refresh(controller) {
      this.detach(controller);
      this.attach(controller);
    }

    getStats() {
      return { attached: this._attached.size };
    }
  }

  global.EnemyLOD = EnemyLOD;

})(typeof window !== 'undefined' ? window : this);
