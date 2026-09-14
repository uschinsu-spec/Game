/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Stairs_Exterior_Sides45
 * ============================================================================
 * Category: Cầu Thang & Bậc (stairs)
 * Dimensions: 2.0m x 1.0m x 2.0m | Vertices: 42 | Faces: 28
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Stairs_Exterior_Sides45';
  const SUBMESHES = [{"matName":"MI_Brick","texture":"T_Brick_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"AQCAPwAAgD/9/38/AQCAPwAAgD/9/38/AQCAPwAAADP9/38/AQCAPwAAADP9/38/z8xMPwAAADP9/38/z8xMPwAAADP9/38/AACAPwAAgD/JzEy/AACAPwAAgD/JzEy/AACAPwAAgD/JzEy/AACAPzg/3KXJzEy/AACAPzg/3KXJzEy/AACAPzg/3KXJzEy/zZNMP8PAvqXKzEy/zZNMP8PAvqXKzEy/zZNMP8PAvqXKzEy/zZNMP8PAvqXKzEy/z8xMPwAAgD/9/38/z8xMPwAAgD/9/38/zZNMPwAAgD/KzEy/zZNMPwAAgD/KzEy/zZNMPwAAgD/KzEy/zZNMPwAAgD/KzEy///9/vwAAgD/RzEy///9/vwAAgD/RzEy///9/v9DUEiXRzEy///9/v9DUEiXRzEy///9/v9DUEiUCAIC///9/v9DUEiUCAIC///9/vwAAgD8CAIC///9/vwAAgD8CAIC/zZNMP9DUEiX8/3+/zZNMP9DUEiX8/3+/zZNMPwAAgD/8/3+/zZNMPwAAgD/8/3+/5ul8P9DUEiX7/3+/5ul8P9DUEiX7/3+/AACAP7ba3iTg6Xy/AACAP7ba3iTg6Xy/AACAPwAAgD/g6Xy/AACAPwAAgD/g6Xy/5ul8PwAAgD/7/3+/5ul8PwAAgD/7/3+/","norm":"AAAAAAAAgD8AAACAAACAPwAAAAAAAACAAAAAgAAAgL8AAAAAAACAPwAAAAAAAACA/v9/vwAAAABuEgM6AAAAgAAAgL8AAAAAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAACAPwAAAAAAAACAAAAAgAAAgL8AAAAAAAAAgAAAgL8AAAAAAACAPwAAAAAAAACA/v9/vwAAAABuEgM6AAAAgAAAgL8AAAAAAAAAgAAAgL8AAAAAAAAAgAAAAAAAAIA//v9/vwAAAABuEgM6AAAAAAAAgD8AAACA/v9/vwAAAABuEgM6AAAAgAAAAAAAAIA/AAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAgAAAAAAAAIA/AAAAAAAAgD8AAACAAAAAgAAAgL8AAACAAAAAgAAAAAAAAIA/AAAAgAAAgL8AAACAAAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAgD8AAACAAAAAgAAAgL8AAACAAAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAgD8AAACAAAAAgAAAgL8AAACA/O/DPgAAAAAug2y/AAAAgAAAgL8AAACALoNsPwAAAAD878O+AAAAAAAAgD8AAACALoNsPwAAAAD878O+AAAAAAAAgD8AAACA/O/DPgAAAAAug2y/","uv":"AAAAM+PQZT8AAAAA//8XP86mWj9yz3w/AFCUOK79fz8AAIA/AACAP86mWj9gYWA/AAAAAJDsSj8AAIA/5dBlP7JiZj9X+Bc/a6y6PXLPfD/Oplo/cs98P7BiZj+w/X8/AAAAAP3/fz9rrLo9YGFgP+8IRz9yz3w/7whHP9gImj0AAIA/AQAYPwAAADOQ7Eo/AAAAAP//Fz/vCEc/OkzZPtCwzT2Q7Eo/AACAP5LsSj9rrLo9OkzZPgAAgD+S7Eo/a6y6PXLPfD9rrLo92AiaPWusuj1gYWA/AAAAAP3/fz8AAAAA//8XPwAAgD/l0GU/7whHP2BhYD/mSWY/AACAP+ZJZj8BABg/0LDNPePQZT9leVk/YGFgP/J0fj8AAIA/zqZaPxkYYj9dcH4/sP1/PwAAAADmMWQ/unR+P4v/Fz/BhsU749BlP/N0fj8BABg/","indices":"DAAEABAADAAQABIAAwALAAgAAwAIAAEAAgAFAA0AAgANAAkAEQAAAAcAEQAHABUABgAmACgAKAAhABQAKAAUAAYAJAAKAA4ADgAeACIADgAiACQADwATABYADwAWABkADgAYABoADgAaAB4AIQAdABcAIQAXABQACAALACUACAAlACcAGwAcACAAGwAgAB8AJwAlACMAJwAjACkAHwAgACkAHwApACMA"}];

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
    vertices: 42,
    triangles: 28,
    create: (name, scene) => createMasterMesh(name, scene),
    createInstance: (name, parent, scene) => createInstance(name, parent, scene)
  };

  global.ThonTranRegistry = global.ThonTranRegistry || {};
  global.ThonTranRegistry[MODEL_NAME] = AssetModule;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetModule;
  }
})(typeof window !== 'undefined' ? window : this);
