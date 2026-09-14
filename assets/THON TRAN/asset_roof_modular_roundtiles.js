/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Roof_Modular_RoundTiles
 * ============================================================================
 * Category: Mái Ngói & Mái Gỗ (roofs)
 * Dimensions: 0.66m x 0.51m x 2.25m | Vertices: 160 | Faces: 136
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Roof_Modular_RoundTiles';
  const SUBMESHES = [{"matName":"MI_RoundTiles","texture":"T_RoundTiles_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"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","norm":"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","uv":"91osP81ZYD8vESs/qjlXPzqYKj+qOVc/OpgqP579Jz8vESs/ApYoPzqYKj8Clig/T+9TP6o5Vz/O3VI/qjlXP5IsUj/NWWA/T+9TPwKWKD/O3VI/ApYoP0/vUz+e/Sc/bcROPxI0VT9fck0/TIBeP23ETj9qkCY/bcROPwb4JT+LmUk/EtRTPyy4SD9IPl0/i5lJP2owJT+LmUk/BpgkP6duRD8SlFI/+P1DP4oZXD+nbkQ/avAjP6duRD8GWCM/xUM/P4zqUD/FQz8/EvRRP8VDPz8GuCI/xUM/P2pQIz+RiTo/ihlcP+IYOj8SlFI/4hg6PwZYIz/iGDo/avAjP17PNT9IPl0//+00PxLUUz//7TQ/BpgkP//tND9qMCU/KhUxP8SuXj8cwy8/3mZVPxzDLz/SKiY/HMMvPzbDJj86mCo/qjlXP/daLD8Ng2I/jMAqP6o5Vz86mCo/ApYoPzqYKj9eKis/jMAqPwKWKD+NX1Q/qjlXP5IsUj8Ng2I/T+9TP6o5Vz+NX1Q/ApYoP0/vUz9eKis/T+9TPwKWKD9fck0/jKlgP23ETj8SNFU/bcROP8YkKT9txE4/apAmPyy4SD+IZ18/i5lJPxLUUz+LmUk/xsQnP4uZST9qMCU/+P1DP8pCXj+nbkQ/EpRSP6duRD/GhCY/p25EP2rwIz/FQz8/EvRRP8VDPz/ME1M/xUM/P2pQIz/FQz8/xuQlP+IYOj8SlFI/kYk6P8pCXj/iGDo/avAjP+IYOj/GhCY//+00PxLUUz9ezzU/iGdfP//tND9qMCU//+00P8bEJz8cwy8/3mZVPyoVMT8E2GA/HMMvPzbDJj8cwy8/klcpP/daLD/NWWA/LxErP6o5Vz86mCo/qjlXPzqYKj+e/Sc/LxErPwKWKD86mCo/ApYoP0/vUz+qOVc/zt1SP6o5Vz+SLFI/zVlgP0/vUz8Clig/zt1SPwKWKD9P71M/nv0nP23ETj8SNFU/X3JNP0yAXj9txE4/apAmP23ETj8G+CU/i5lJPxLUUz8suEg/SD5dP4uZST9qMCU/i5lJPwaYJD+nbkQ/EpRSP/j9Qz+KGVw/p25EP2rwIz+nbkQ/BlgjP8VDPz+M6lA/xUM/PxL0UT/FQz8/BrgiP8VDPz9qUCM/kYk6P4oZXD/iGDo/EpRSP+IYOj8GWCM/4hg6P2rwIz9ezzU/SD5dP//tND8S1FM//+00PwaYJD//7TQ/ajAlPyoVMT/Erl4/HMMvP95mVT8cwy8/0iomPxzDLz82wyY/OpgqP6o5Vz/3Wiw/DYNiP4zAKj+qOVc/OpgqPwKWKD86mCo/XiorP4zAKj8Clig/jV9UP6o5Vz+SLFI/DYNiP0/vUz+qOVc/jV9UPwKWKD9P71M/XiorP0/vUz8Clig/X3JNP4ypYD9txE4/EjRVP23ETj/GJCk/bcROP2qQJj8suEg/iGdfP4uZST8S1FM/i5lJP8bEJz+LmUk/ajAlP/j9Qz/KQl4/p25EPxKUUj+nbkQ/xoQmP6duRD9q8CM/xUM/PxL0UT/FQz8/zBNTP8VDPz9qUCM/xUM/P8bkJT/iGDo/EpRSP5GJOj/KQl4/4hg6P2rwIz/iGDo/xoQmP//tND8S1FM/Xs81P4hnXz//7TQ/ajAlP//tND/GxCc/HMMvP95mVT8qFTE/BNhgPxzDLz82wyY/HMMvP5JXKT8=","indices":"BgAJAA4ABgAOAAwADAAOABIADAASABAAEAASABYAEAAWABQAFAAWABsAFAAbABkAGQAbAB8AGQAfAB0AHQAfACMAHQAjACEAIQAjACcAIQAnACUAJQAnAAUAJQAFAAIAMAA1ADcAMAA3ADMANQA5ADsANQA7ADcAOQA9AD8AOQA/ADsAPQBAAEIAPQBCAD8AQABEAEYAQABGAEIARABIAEoARABKAEYASABMAE4ASABOAEoATAAoACsATAArAE4AAQAEAC0AAQAtACoACgAHAC4ACgAuADEACAANADQACAA0AC8ADwALADIADwAyADYADQARADgADQA4ADQAEwAPADYAEwA2ADoAEQAVADwAEQA8ADgAFwATADoAFwA6AD4AFQAYAEEAFQBBADwAGgAXAD4AGgA+AEMAGAAcAEUAGABFAEEAHgAaAEMAHgBDAEcAHAAgAEkAHABJAEUAIgAeAEcAIgBHAEsAIAAkAE0AIABNAEkAJgAiAEsAJgBLAE8AJAAAACkAJAApAE0AAwAmAE8AAwBPACwAVgBZAF4AVgBeAFwAXABeAGIAXABiAGAAYABiAGYAYABmAGQAZABmAGsAZABrAGkAaQBrAG8AaQBvAG0AbQBvAHMAbQBzAHEAcQBzAHcAcQB3AHUAdQB3AFUAdQBVAFIAgACFAIcAgACHAIMAhQCJAIsAhQCLAIcAiQCNAI8AiQCPAIsAjQCQAJIAjQCSAI8AkACUAJYAkACWAJIAlACYAJoAlACaAJYAmACcAJ4AmACeAJoAnAB4AHsAnAB7AJ4AUQBUAH0AUQB9AHoAWgBXAH4AWgB+AIEAWABdAIQAWACEAH8AXwBbAIIAXwCCAIYAXQBhAIgAXQCIAIQAYwBfAIYAYwCGAIoAYQBlAIwAYQCMAIgAZwBjAIoAZwCKAI4AZQBoAJEAZQCRAIwAagBnAI4AagCOAJMAaABsAJUAaACVAJEAbgBqAJMAbgCTAJcAbABwAJkAbACZAJUAcgBuAJcAcgCXAJsAcAB0AJ0AcACdAJkAdgByAJsAdgCbAJ8AdABQAHkAdAB5AJ0AUwB2AJ8AUwCfAHwA"}];

  function b64ToF32(b64) {
    const bin = atob(b64);
    const buf = new ArrayBuffer(bin.length);
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Float32Array(buf);
  }

  function b64ToIndices(b64, isUint32) {
    if (!b64) return null;
    const bin = atob(b64);
    const buf = new ArrayBuffer(bin.length);
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return isUint32 ? new Uint32Array(buf) : new Uint16Array(buf);
  }

  function getSharedMaterial(matName, texFileName, doubleSided, scene) {
    global.ThonTranMaterials = global.ThonTranMaterials || {};
    const matKey = 'TTMat_' + matName + '_' + (texFileName || 'default');
    if (global.ThonTranMaterials[matKey] && !global.ThonTranMaterials[matKey].isDisposed()) {
      return global.ThonTranMaterials[matKey];
    }

    const mat = new BABYLON.StandardMaterial(matKey, scene);
    if (texFileName) {
      const texPath = './assets/THON TRAN/textures/' + texFileName;
      const diffuseTex = new BABYLON.Texture(texPath, scene);
      mat.diffuseTexture = diffuseTex;
    }
    mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    mat.specularColor = new BABYLON.Color3(0.08, 0.08, 0.08);
    mat.backFaceCulling = !doubleSided;
    mat.freeze();

    global.ThonTranMaterials[matKey] = mat;
    return mat;
  }

  function createMasterMesh(name, scene) {
    const root = new BABYLON.TransformNode(name || MODEL_NAME, scene);
    
    SUBMESHES.forEach((sub, idx) => {
      const customMesh = new BABYLON.Mesh(MODEL_NAME + '_sub_' + idx, scene);
      const vertexData = new BABYLON.VertexData();

      vertexData.positions = b64ToF32(sub.pos);
      if (sub.norm) vertexData.normals = b64ToF32(sub.norm);
      if (sub.uv) vertexData.uvs = b64ToF32(sub.uv);
      if (sub.indices) vertexData.indices = b64ToIndices(sub.indices, sub.isUint32);

      vertexData.applyToMesh(customMesh, false);
      customMesh.material = getSharedMaterial(sub.matName, sub.texture, sub.doubleSided, scene);
      customMesh.receiveShadows = true;
      customMesh.parent = root;
    });

    return root;
  }

  function createInstance(name, parentNode, scene) {
    const instanceRoot = new BABYLON.TransformNode(name, scene);
    if (parentNode) instanceRoot.parent = parentNode;

    SUBMESHES.forEach((sub, idx) => {
      const mesh = new BABYLON.Mesh(name + '_sub_' + idx, scene);
      const vertexData = new BABYLON.VertexData();
      vertexData.positions = b64ToF32(sub.pos);
      if (sub.norm) vertexData.normals = b64ToF32(sub.norm);
      if (sub.uv) vertexData.uvs = b64ToF32(sub.uv);
      if (sub.indices) vertexData.indices = b64ToIndices(sub.indices, sub.isUint32);

      vertexData.applyToMesh(mesh, false);
      mesh.material = getSharedMaterial(sub.matName, sub.texture, sub.doubleSided, scene);
      mesh.receiveShadows = true;
      mesh.parent = instanceRoot;
    });

    return instanceRoot;
  }

  const AssetModule = {
    name: MODEL_NAME,
    category: 'roofs',
    categoryVi: 'Mái Ngói & Mái Gỗ',
    icon: '🏠',
    dimensions: { x: 0.66, y: 0.51, z: 2.25 },
    vertices: 160,
    triangles: 136,
    create: (name, scene) => createMasterMesh(name, scene),
    createInstance: (name, parent, scene) => createInstance(name, parent, scene)
  };

  global.ThonTranRegistry = global.ThonTranRegistry || {};
  global.ThonTranRegistry[MODEL_NAME] = AssetModule;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetModule;
  }
})(typeof window !== 'undefined' ? window : this);
