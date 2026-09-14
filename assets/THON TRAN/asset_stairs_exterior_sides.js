/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Stairs_Exterior_Sides
 * ============================================================================
 * Category: Cầu Thang & Bậc (stairs)
 * Dimensions: 2.0m x 1.0m x 2.0m | Vertices: 32 | Faces: 16
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Stairs_Exterior_Sides';
  const SUBMESHES = [{"matName":"MI_Brick","texture":"T_Brick_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"ysxMPwAAgD8AAIC/ysxMPwAAgD8AAIC/ysxMPzg/3KUAAIC/ysxMPzg/3KUAAIC//P9/P9DUEiUAAIC//P9/P9DUEiUAAIC/0MxMPwAAgD8AAIA/0MxMPwAAgD8AAIA/0MxMP9DUEiUAAIA/0MxMP9DUEiUAAIA/AgCAP9DUEiUAAIA/AgCAP9DUEiUAAIA//P9/PwAAgD8AAIC//P9/PwAAgD8AAIC/AgCAPwAAgD8AAIA/AgCAPwAAgD8AAIA/ysxMvwAAgD8AAIC/ysxMvwAAgD8AAIC/ysxMvzg/3KUAAIC/ysxMvzg/3KUAAIC//P9/v9DUEiUAAIC//P9/v9DUEiUAAIC/0MxMvwAAgD8AAIA/0MxMvwAAgD8AAIA/0MxMv9DUEiUAAIA/0MxMv9DUEiUAAIA/AgCAv9DUEiUAAIA/AgCAv9DUEiUAAIA//P9/vwAAgD8AAIC//P9/vwAAgD8AAIC/AgCAvwAAgD8AAIA/AgCAvwAAgD8AAIA/","norm":"AACAvwAAAAAAAAAAAAAAAAAAgD8AAACAAACAvwAAAAAAAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAACAPwAAAAAAAACAAACAvwAAAAAAAAAAAAAAAAAAgD8AAACAAACAvwAAAAAAAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAACAPwAAAAAAAACAAAAAAAAAgD8AAACAAACAPwAAAAAAAACAAAAAAAAAgD8AAACAAACAPwAAAAAAAACAAAAAAAAAgD8AAACAAACAPwAAAAAAAAAAAAAAgAAAgL8AAAAAAACAPwAAAAAAAAAAAACAvwAAAAAAAACAAAAAgAAAgL8AAAAAAAAAAAAAgD8AAACAAACAPwAAAAAAAAAAAAAAgAAAgL8AAAAAAACAPwAAAAAAAAAAAACAvwAAAAAAAACAAAAAgAAAgL8AAAAAAACAvwAAAAAAAACAAAAAAAAAgD8AAACAAACAvwAAAAAAAACAAAAAAAAAgD8AAACA","uv":"zqZaPzpM2T4AAAAz49BlP86mWj/YCJo9zqZaP3LPfD/Oplo/YGFgPwAAgD8AAIA/a6y6PTpM2T4AAIA/5dBlP2usuj3YCJo9a6y6PXLPfD9rrLo9YGFgPwAAAAD9/38/AAAAM5DsSj8AAIA/AQAYPwAAgD+S7Eo/AAAAAP//Fz8AAAAAkOxKP86mWj86TNk+zqZaP3LPfD/Oplo/2AiaPQAAgD8AAIA/zqZaP2BhYD8AAIA/kuxKP2usuj06TNk+a6y6PXLPfD9rrLo92AiaPQAAAAD9/38/a6y6PWBhYD8AAIA/AQAYPwAAAADj0GU/AAAAAP//Fz8AAIA/5dBlPw==","indices":"CwAFAA0ACwANAA8AAgAIAAYAAgAGAAAAAwAEAAoAAwAKAAkADAABAAcADAAHAA4AGgAeABwAGgAcABQAEwARABcAEwAXABkAEgAYABsAEgAbABUAHQAfABYAHQAWABAA"}];

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
    category: 'stairs',
    categoryVi: 'Cầu Thang & Bậc',
    icon: '🪜',
    dimensions: { x: 2.0, y: 1.0, z: 2.0 },
    vertices: 32,
    triangles: 16,
    create: (name, scene) => createMasterMesh(name, scene),
    createInstance: (name, parent, scene) => createInstance(name, parent, scene)
  };

  global.ThonTranRegistry = global.ThonTranRegistry || {};
  global.ThonTranRegistry[MODEL_NAME] = AssetModule;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetModule;
  }
})(typeof window !== 'undefined' ? window : this);
