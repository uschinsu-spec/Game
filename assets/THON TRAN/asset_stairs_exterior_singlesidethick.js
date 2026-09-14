/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Stairs_Exterior_SingleSideThick
 * ============================================================================
 * Category: Cầu Thang & Bậc (stairs)
 * Dimensions: 0.4m x 1.0m x 2.0m | Vertices: 24 | Faces: 12
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Stairs_Exterior_SingleSideThick';
  const SUBMESHES = [{"matName":"MI_Brick","texture":"T_Brick_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"oMxMvgAAAAAAAIC/oMxMvgAAAAAAAIC/oMxMvgAAAAAAAIC/wMxMPgAAgD8AAIA/wMxMPgAAgD8AAIA/wMxMPgAAgD8AAIA/4MxMvgAAAAAAAIA/4MxMvgAAAAAAAIA/4MxMvgAAAAAAAIA/oMxMvgAAgD8AAIC/oMxMvgAAgD8AAIC/oMxMvgAAgD8AAIC/4MxMvgAAgD8AAIA/4MxMvgAAgD8AAIA/4MxMvgAAgD8AAIA/wMxMPgAAAAAAAIC/wMxMPgAAAAAAAIC/wMxMPgAAAAAAAIC/wMxMPgAAAAAAAIA/wMxMPgAAAAAAAIA/wMxMPgAAAAAAAIA/wMxMPgAAgD8AAIC/wMxMPgAAgD8AAIC/wMxMPgAAgD8AAIC/","norm":"AACAvwAAAAAAAACAAAAAAAAAgL8AAACAAAAAAAAAAAAAAIC/AAAAAAAAAAAAAIA/AAAAAAAAgD8AAACAAACAPwAAAAAAAACAAACAvwAAAAAAAACAAAAAAAAAgL8AAACAAAAAAAAAAAAAAIA/AACAvwAAAAAAAACAAAAAAAAAAAAAAIC/AAAAAAAAgD8AAACAAACAvwAAAAAAAACAAAAAAAAAAAAAAIA/AAAAAAAAgD8AAACAAAAAAAAAgL8AAACAAAAAAAAAAAAAAIC/AACAPwAAAAAAAACAAAAAAAAAgL8AAACAAAAAAAAAAAAAAIA/AACAPwAAAAAAAACAAAAAAAAAAAAAAIC/AAAAAAAAgD8AAACAAACAPwAAAAAAAACA","uv":"AACAPwAAgD/Oplo/YGFgP9l6Fj8AAIA/8s9OP5GdFz8AAIA/kuxKPwAAAAD//xc/AAAAAP3/fz9rrLo9YGFgP9l6Fj8AAIA/AACAPwEAGD/ZehY/kp0XPwAAAADj0GU/AAAAAP//Fz/ZehY/kZ0XPwAAgD/l0GU/zqZaP3LPfD/yz04/AACAPwAAgD8AAIA/a6y6PXLPfD/yz04/AACAPwAAAAD9/38/8s9OP5KdFz8AAAAAkOxKPwAAgD8BABg/","indices":"BgAMAAkABgAJAAAAFAARABcAFAAXAAUADwASAAcADwAHAAEACwAOAAQACwAEABYACAATAAMACAADAA0AEAACAAoAEAAKABUA"}];

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
    dimensions: { x: 0.4, y: 1.0, z: 2.0 },
    vertices: 24,
    triangles: 12,
    create: (name, scene) => createMasterMesh(name, scene),
    createInstance: (name, parent, scene) => createInstance(name, parent, scene)
  };

  global.ThonTranRegistry = global.ThonTranRegistry || {};
  global.ThonTranRegistry[MODEL_NAME] = AssetModule;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetModule;
  }
})(typeof window !== 'undefined' ? window : this);
