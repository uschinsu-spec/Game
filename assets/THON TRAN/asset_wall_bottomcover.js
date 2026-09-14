/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Wall_BottomCover
 * ============================================================================
 * Category: Tường Gạch & Vữa (walls)
 * Dimensions: 2.0m x 0.24m x 0.43m | Vertices: 48 | Faces: 36
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Wall_BottomCover';
  const SUBMESHES = [{"matName":"MI_WoodTrim","texture":"T_WoodTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"//9/P0Mi7z1DyPA9//9/P0Mi7z1DyPA9AACAPz0h771JyPA9AACAPz0h771JyPA9/v9/P0Ai7z0jsLO6/v9/P0Ai7z0jsLO6//9/P0Ah773dr7O6//9/P0Ah773dr7O6AQCAv0Mh7z2TyPA9AQCAv0Mh7z2TyPA9AACAvz0i772RyPA9AACAvz0i772RyPA9AQCAv0Ah7z2jnbO6AQCAv0Ah7z2jnbO6AACAv0Ai771dnbO6AACAv0Ai771dnbO6AACAvzki7z0UyaC+AACAvzki7z0UyaC+//9/vzwi7z2lxke+AACAPzkh7z0+yaC+AACAPzkh7z0+yaC+AACAPzwh7z33xke+AACAvyFEcjUTyaC+//9/P/HdhrU8yaC+iIJcP04h7z3xxke+0hAcP24h7z3nxke+rUk8P0lR9z3sxke+0BAcvwoi7z21xke+hoJcvyoi7z2rxke+q0k8v1U72z2wxke+h4Jcvyci7z0XyaC+h4Jcvyci7z0XyaC+0RAcvwci7z0dyaC+0RAcvwci7z0dyaC+rEk8v1I72z0ayaC+rEk8v1I72z0ayaC+0RAcP2sh7z01yaC+0RAcP2sh7z01yaC+h4JcP0sh7z07yaC+h4JcP0sh7z07yaC+rEk8P0ZR9z04yaC+rEk8P0ZR9z04yaC+h4Jcv6jGTjUWyaC+0RAcv/JUDjUcyaC+rEk8v82NLjUZyaC+0BAcP7PMKbU0yaC+hoJcP2k+arU5yaC+q0k8P44FSrU2yaC+","norm":"AAAAAAAAAAAAAIA/AAAAgAAAgD8AAACAAAAAAAAAgL8AAAAAAAAAAAAAAAAAAIA/AAAAgAAAAIAAAIC/AAAAgAAAgD8AAACAAAAAAAAAgL8AAAAAAAAAgAAAAIAAAIC/AAAAAAAAAAAAAIA/AAAAgAAAgD8AAACAAAAAAAAAgL8AAAAAAAAAAAAAAAAAAIA/AAAAgAAAAIAAAIC/AAAAgAAAgD8AAACAAAAAAAAAgL8AAAAAAAAAgAAAAIAAAIC/AAAAgAAAAIAAAIC/AAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAgAAAAIAAAIC/AAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAgAAAAIAAAIC/AAAAgAAAAIAAAIC/1z+CPLj3fz8AAACA1z+CvLj3fz8AAACAAAAAAAAAgD8AAACAgrAdvWvPfz8AAACAgrAdPWvPfz8AAACAAAAAAAAAgD8AAACAAAAAgAAAAIAAAIC/grAdPWvPfz8AAACAgrAdvWvPfz8AAACAAAAAgAAAAIAAAIC/AAAAgAAAAIAAAIC/AAAAAAAAgD8AAACA1z+CvLj3fz8AAACAAAAAgAAAAIAAAIC/AAAAgAAAAIAAAIC/1z+CPLj3fz8AAACAAAAAgAAAAIAAAIC/AAAAAAAAgD8AAACAAAAAgAAAAIAAAIC/AAAAgAAAAIAAAIC/AAAAgAAAAIAAAIC/AAAAgAAAAIAAAIC/AAAAgAAAAIAAAIC/AAAAgAAAAIAAAIC/","uv":"AACAPwAPezsAAAAA6GGdPgAAAADoYZ0+AACAP8An8D0AAIA/wCfwPQAAAADoCYE+AAAAAOgJgT4AAIA/AA97OwAAAAAACns7AACAP+hhnT4AAIA/6GGdPgAAAACoJ/A9AAAAAKgn8D0AAIA/6AmBPgAAgD/oCYE+AAAAAAAKezsAAIA/AA97OwAAAADoYZ0+AAAAAOgJgT4AAAAAAAp7OwAAgD/oYZ0+AACAP+gJgT4AAIA/QAB4PQAAAAAAAHg9REFuP+gJgT5oCE4/6AmBPtYkXj/oCYE+Xt5HPugJgT7j9Y096AmBPqhsBz7oCYE+REFuPwAOezvl9Y096GGdPmLeRz7oYZ0+aAhOPwAOezvWJF4/AA57O6hsBz7oYZ0+aAhOP+hhnT5i3kc+AAt7O+b1jT0ACns7REFuP+hhnT6obAc+AAt7O9YkXj/oYZ0+REFuP0AAeD1oCE4/QAB4PdYkXj9AAHg9Xt5HPgAAeD3j9Y09AAB4PahsBz4AAHg9","indices":"BAAHAA8ABAAPAAwADgAGAAIADgACAAoABQANAAkABQAJAAEAAwAAAAgAAwAIAAsAJQAtACsAJQArACEALgAmABMALgATABcAFgAQAB4AFgAeACoAGAAVABQAGAAUACcAEgAcAB8AEgAfABEAJgAuAC8AJgAvACgAKAAvAC0AKAAtACUAKgAeACIAKgAiACwALAAiACEALAAhACsAGAAnACkAGAApABoAGgApACQAGgAkABkAHwAcAB0AHwAdACMAIwAdABsAIwAbACAAGQAkACAAGQAgABsA"}];

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
    category: 'walls',
    categoryVi: 'Tường Gạch & Vữa',
    icon: '🧱',
    dimensions: { x: 2.0, y: 0.24, z: 0.43 },
    vertices: 48,
    triangles: 36,
    create: (name, scene) => createMasterMesh(name, scene),
    createInstance: (name, parent, scene) => createInstance(name, parent, scene)
  };

  global.ThonTranRegistry = global.ThonTranRegistry || {};
  global.ThonTranRegistry[MODEL_NAME] = AssetModule;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetModule;
  }
})(typeof window !== 'undefined' ? window : this);
