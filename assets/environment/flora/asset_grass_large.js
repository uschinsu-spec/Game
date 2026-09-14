/**
 * ============================================================================
 * 🌲 FLORA 3D ASSET MODULE: Grass_Large
 * ============================================================================
 * Architecture:
 * ├── Geometry: Positions, Normals, UVs, Indices (Base64 Float32/Uint16)
 * ├── Textures: Embedded optimized textures
 * ├── Materials: StandardMaterial, Alpha test, 2-sided lighting, freeze
 * └── API: load(), create(), createInstance(), createThinForest(), setLOD(), dispose()
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Grass_Large';
  const GEOMETRY = {"None": {"pos": "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", "norm": "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", "uv": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", "ind": "AAABAAIAAAACAAMABAAFAAYABAAGAAcABQAEAAgABQAIAAkACgALAAwACgAMAA0ADgAPABAADgAQABEADQAOABEADQARAAoAEgATABQAEgAUABUAFgAXABgAFgAYABkAAQAAABoAAQAaABsAEwASABwAEwAcAB0AHgAfACAAHgAgACEAIgAjACQAIgAkACUAHwAeACYAHwAmACcAKAApACoAKAAqACsALAAtAC4ALAAuAC8ALQAsACMALQAjACIAMAAxADIAMAAyADMANAA1ADYANAA2ADcAMQAwADUAMQA1ADQAKwA4ADkAKwA5ACgAOgA7ADwAOgA8AD0APgA/AEAAPgBAAEEAPQBCAEMAPQBDADoARABFAEYARABGAEcASABJAEoASABKAEsATABNAE4ATABOAE8ASwBMAE8ASwBPAEgAUABRAFIAUABSAFMAJwAmAFQAJwBUAFUARQBEAFYARQBWAFcAUwAWABkAUwAZAFAAQgBYAFkAQgBZAEMAWgBbAFwAWgBcAF0AWwBaAF4AWwBeAF8AYABhAGIAYABiAGMAZABlAGYAZABmAGcAYQBgAGUAYQBlAGQAHQAcAGgAHQBoAGkAagBrAGwAagBsAG0AawBqAD8AawA/AD4AbgBvAHAAbgBwAHEAbwBuAHIAbwByAHMAdAB1AHYAdAB2AHcAeAB5AHoAeAB6AHsAdwB4AHsAdwB7AHQAfAB9AH4AfAB+AH8AfQB8AIAAfQCAAIEAggCDAIQAggCEAIUAhgCHAIgAhgCIAIkAiQCKAIsAiQCLAIYAgwCCAIwAgwCMAI0AjgCPAJAAjgCQAJEAkQCSAJMAkQCTAI4AkgCUAJUAkgCVAJMA", "indType": "Uint16Array", "vertexCount": 150, "indexCount": 324}};
  const TEXTURES = {"None": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="};

  function decodeBuffer(b64, Type) {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Type(bytes.buffer);
  }

  const AssetApi = {
    name: MODEL_NAME,
    version: '1.0.0',
    _cache: null,

    load: function(scene) {
      if (this._cache && this._cache.scene === scene && this._cache.masterMeshes[0] && !this._cache.masterMeshes[0].mesh.isDisposed()) {
        return this._cache;
      }

      const materials = {};
      const masterMeshes = [];

      for (const [matName, geom] of Object.entries(GEOMETRY)) {
        // 1. Material
        const mat = new BABYLON.StandardMaterial('Mat_' + MODEL_NAME + '_' + matName, scene);
        if (TEXTURES[matName]) {
          const tex = new BABYLON.Texture(TEXTURES[matName], scene, true, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
          tex.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
          tex.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
          mat.diffuseTexture = tex;
          const isAlpha = /Leaves|Flower|Grass|Bush|Petal|Plant/i.test(matName);
          if (isAlpha) {
            mat.diffuseTexture.hasAlpha = true;
            mat.useAlphaFromDiffuseTexture = true;
            mat.transparencyMode = BABYLON.Material.MATERIAL_ALPHATESTANDBLEND || 2;
            mat.alphaCutOff = 0.35;
            mat.backFaceCulling = false;
            mat.twoSidedLighting = true;
          } else {
            mat.backFaceCulling = true;
          }
        }
        mat.specularColor = new BABYLON.Color3(0.04, 0.04, 0.04);
        mat.ambientColor = new BABYLON.Color3(0.25, 0.25, 0.25);
        mat.freeze();
        materials[matName] = mat;

        // 2. Master Mesh
        const mesh = new BABYLON.Mesh('Master_' + MODEL_NAME + '_' + matName, scene);
        const vd = new BABYLON.VertexData();
        vd.positions = decodeBuffer(geom.pos, Float32Array);
        vd.normals = decodeBuffer(geom.norm, Float32Array);
        vd.uvs = decodeBuffer(geom.uv, Float32Array);
        vd.indices = decodeBuffer(geom.ind, geom.indType === 'Uint32Array' ? Uint32Array : Uint16Array);
        vd.applyToMesh(mesh, false);
        mesh.material = mat;
        mesh.isVisible = false;
        mesh.setEnabled(false);
        mesh.checkCollisions = false;
        masterMeshes.push({ mesh: mesh, matName: matName });
      }

      this._cache = { scene: scene, materials: materials, masterMeshes: masterMeshes };
      return this._cache;
    },

    create: function(scene, position, options) {
      options = options || {};
      const masters = this.load(scene);
      const rootName = options.name || (MODEL_NAME + '_' + Math.random().toString(36).substr(2, 9));
      const root = new BABYLON.TransformNode(rootName, scene);

      if (options.parent) root.parent = options.parent;
      if (position) {
        if (position.x !== undefined) root.position.set(position.x, position.y || 0, position.z);
        else if (Array.isArray(position)) root.position.set(position[0], position[1] || 0, position[2] || 0);
      }
      if (options.scale !== undefined) {
        if (typeof options.scale === 'number') root.scaling.setAll(options.scale);
        else root.scaling.copyFrom(options.scale);
      }
      if (options.rotationY !== undefined) root.rotation.y = options.rotationY;

      masters.masterMeshes.forEach(function(item, idx) {
        const inst = item.mesh.createInstance(rootName + '_part_' + idx);
        inst.parent = root;
        inst.setEnabled(true);
        inst.isVisible = true;
        inst.freezeWorldMatrix();
      });

      return root;
    },

    createInstance: function(name, parent, scene) {
      const masters = this.load(scene);
      const instances = [];
      masters.masterMeshes.forEach(function(item, idx) {
        const inst = item.mesh.createInstance(name + '_part_' + idx);
        if (parent) inst.parent = parent;
        inst.position.set(0, 0, 0);
        inst.rotation.set(0, 0, 0);
        inst.scaling.set(1, 1, 1);
        inst.setEnabled(true);
        inst.isVisible = true;
        inst.freezeWorldMatrix();
        instances.push(inst);
      });
      return instances;
    },

    createThinForest: function(scene, coordsArray, options) {
      options = options || {};
      if (!coordsArray || coordsArray.length === 0) return null;
      const masters = this.load(scene);
      const count = coordsArray.length;
      const resultMeshes = [];

      const matrices = new Float32Array(count * 16);
      const tempMatrix = new BABYLON.Matrix();
      const tempPos = new BABYLON.Vector3();
      const tempRot = BABYLON.Quaternion.Identity();
      const tempScale = new BABYLON.Vector3(1, 1, 1);

      for (let i = 0; i < count; i++) {
        const item = coordsArray[i];
        const x = item.x !== undefined ? item.x : (item[0] || 0);
        const y = item.y !== undefined ? item.y : (item[1] || 0);
        const z = item.z !== undefined ? item.z : (item[2] || 0);
        const s = item.scale || item.s || item[3] || 1.0;
        const rot = item.rotY || item.rot || item[4] || 0;

        tempPos.set(x, y, z);
        tempScale.set(s, s, s);
        BABYLON.Quaternion.RotationYawPitchRollToRef(rot, 0, 0, tempRot);
        BABYLON.Matrix.ComposeToRef(tempScale, tempRot, tempPos, tempMatrix);
        tempMatrix.copyToArray(matrices, i * 16);
      }

      masters.masterMeshes.forEach(function(item, idx) {
        const thinMesh = item.mesh.clone(MODEL_NAME + '_Thin_' + idx + '_' + Date.now());
        if (options.parent) thinMesh.parent = options.parent;
        thinMesh.setEnabled(true);
        thinMesh.isVisible = true;
        thinMesh.thinInstanceSetBuffer('matrix', matrices, 16, false);
        if (options.freeze !== false) thinMesh.freezeWorldMatrix();
        if (options.receiveShadows === false) thinMesh.receiveShadows = false;
        resultMeshes.push(thinMesh);
      });

      return {
        meshes: resultMeshes,
        count: count,
        dispose: function() { resultMeshes.forEach(function(m) { m.dispose(); }); }
      };
    },

    setLOD: function(mesh, distance) {
      if (mesh && mesh.maxCullDistance !== undefined) {
        mesh.maxCullDistance = distance;
      }
    },

    dispose: function(scene) {
      if (this._cache) {
        this._cache.masterMeshes.forEach(function(i) { i.mesh.dispose(); });
        Object.values(this._cache.materials).forEach(function(m) { m.dispose(); });
        this._cache = null;
      }
    }
  };

  AssetApi.spawnInstance = function(name, parent, scene) {
    return AssetApi.createInstance(name, parent, scene);
  };

  global.FloraAssetRegistry = global.FloraAssetRegistry || {};
  global.FloraAssetRegistry[MODEL_NAME] = AssetApi;
  global['Asset_' + MODEL_NAME] = AssetApi;

  if (MODEL_NAME === 'BirchTree_1') {
    global.BirchTree = AssetApi;
    global.BIRCH_TREE_3D_DATA = AssetApi;
  }

})(typeof window !== 'undefined' ? window : this);
