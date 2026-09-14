/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: HoleCover_StraightHalf
 * ============================================================================
 * Category: Nối Khe & Mộng (floors)
 * Dimensions: 1.0m x 0.21m x 0.24m | Vertices: 20 | Faces: 10
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'HoleCover_StraightHalf';
  const SUBMESHES = [{"matName":"MI_WoodTrim","texture":"T_WoodTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"////vgM31715U2G/////vgM31715U2G/////vgM31715U2G//f//vis41z15U2G//f//vis41z15U2G//f//vis41z15U2G/AAAAv/Y2171BVo+/AAAAv/Y2171BVo+/AAAAv/Y2171BVo+/////vjE41z1BVo+/////vjE41z1BVo+/////vjE41z1BVo+/AAAAP/Y2171DVo+/AAAAP/Y2171DVo+/+///PjE41z1DVo+/+///PjE41z1DVo+/////Pis41z1+U2G/////Pis41z1+U2G/AAAAP1o3171+U2G/AAAAP1o3171+U2G/","norm":"AACAvwAAAAAAAAAAAAAAgAAAgL8AAACAAAAAAAAAAIAAAIA/AACAvwAAAAAAAAAAAAAAAAAAAIAAAIA/AAAAgAAAgD8AAAAAAACAvwAAAAAAAAAAAAAAgAAAgL8AAACAAAAAgAAAAAAAAIC/AACAvwAAAAAAAAAAAAAAgAAAAAAAAIC/AAAAgAAAgD8AAAAAAAAAgAAAgL8AAACAAAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/AAAAgAAAgD8AAAAAAAAAAAAAAIAAAIA/AAAAgAAAgD8AAAAAAAAAgAAAgL8AAACAAAAAAAAAAIAAAIA/","uv":"kz2qPpt3ST8AAIA/OEV4PgAAAAAACns7kz2qPrxdID8AAAAAqCfwPQAAgD84RXg+kgv7Ppt3ST8AAIA/cJUHPgAAAACoJ/A9kgv7PrxdID8AAAAAAAp7OwAAgD9wlQc+ABHsunCVBz4EO4A/sCfwPQQ7gD8ADHs7ABHsunCVBz4EO4A/sCfwPQAR7Lo4RXg+ABHsujhFeD4EO4A/AAx7Ow==","indices":"BgAAAAMABgADAAkACwAFABEACwARAA8ADAASAAEADAABAAcAEwAQAAQAEwAEAAIADgANAAgADgAIAAoA"}];

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
    category: 'floors',
    categoryVi: 'Nối Khe & Mộng',
    icon: '🪵',
    dimensions: { x: 1.0, y: 0.21, z: 0.24 },
    vertices: 20,
    triangles: 10,
    create: (name, scene) => createMasterMesh(name, scene),
    createInstance: (name, parent, scene) => createInstance(name, parent, scene)
  };

  global.ThonTranRegistry = global.ThonTranRegistry || {};
  global.ThonTranRegistry[MODEL_NAME] = AssetModule;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetModule;
  }
})(typeof window !== 'undefined' ? window : this);
