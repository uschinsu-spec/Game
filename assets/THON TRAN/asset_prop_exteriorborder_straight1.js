/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Prop_ExteriorBorder_Straight1
 * ============================================================================
 * Category: Đạo Cụ Thôn Trấn (props)
 * Dimensions: 2.0m x 0.13m x 0.7m | Vertices: 28 | Faces: 16
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Prop_ExteriorBorder_Straight1';
  const SUBMESHES = [{"matName":"MI_RockTrim","texture":"T_RockTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"AQCAvyQQ6DIzMzM/AQCAvyQQ6DIzMzM/AQCAvyQQ6DIzMzM/AQCAvyQQ6DIAAACAAQCAvyQQ6DIAAACAAQCAvyQQ6DIAAACAAQCAvwU8CT4AAACAAQCAvwU8CT4AAACAAQCAvwU8CT4AAACAAQCAPyQQ6DIzMzM/AQCAPyQQ6DIzMzM/AQCAPyQQ6DIzMzM/AQCAPyQQ6DIAAACAAQCAPyQQ6DIAAACAAQCAPyQQ6DIAAACAAQCAPwU8CT4AAACAAQCAPwU8CT4AAACAAQCAPwU8CT4AAACAAQCAv+L69D0zMzM/AQCAv+L69D0zMzM/AQCAv+L69D0zMzM/AQCAvwU8CT57FC4/AQCAvwU8CT57FC4/AQCAPwU8CT57FC4/AQCAPwU8CT57FC4/AQCAP+L69D0zMzM/AQCAP+L69D0zMzM/AQCAP+L69D0zMzM/","norm":"AACAvwAAAAAAAACAAAAAAAAAgL8AAACAAAAAAAAAAAAAAIA/AACAvwAAAAAAAACAAAAAAAAAgL8AAACAAAAAAAAAAAAAAIC/AACAvwAAAAAAAACAAAAAAAAAAAAAAIC/AAAAAAAAgD8AAACAAAAAAAAAgL8AAACAAAAAAAAAAAAAAIA/AACAPwAAAAAAAACAAAAAAAAAgL8AAACAAAAAAAAAAAAAAIC/AACAPwAAAAAAAACAAAAAAAAAAAAAAIC/AAAAAAAAgD8AAACAAACAPwAAAAAAAACAAACAvwAAAAAAAACAAAAAAAAAAAAAAIA/AAAAAFXCTz/AkhU/AACAvwAAAAAAAACAAAAAAC6jcz95L50+AAAAAC6jcz95L50+AACAPwAAAAAAAACAAAAAAAAAAAAAAIA/AAAAAFXCTz/AkhU/AACAPwAAAAAAAACA","uv":"PpYBP5fqFD8AlY46NoCsPkAaHTsSvBU/yZgzPpbqFD8AlY468pYBPwCVjjrylgE/yZgzPjmwAz8AlY46NugVP4AaHTuYNqw+cjcBPzaArD5ymAA/ErwVP8mYMz6X6hQ/cjcBP/KWAT9yNwE/8pYBPz6WAT+W6hQ/cjcBPzboFT9ymAA/mDasPj6WAT85sAM/PpYBP5oZBT9AGh07V9UCP0AaHTtX1QI/gCMAPzqwAz9AGh07tYwBP3KYAD+1jAE/wGM5PjqwAz9ymAA/V9UCP3KYAD9X1QI/x5gzPpoZBT8=","indices":"EAAIABYAEAAWABcABQAHAA8ABQAPAA0AAwAAABIAEgAVAAYAEgAGAAMABAAMAAkABAAJAAEACwAOABEAEQAYABsAEQAbAAsAFwAWABQAFwAUABoACgAZABMACgATAAIA"}];

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
    category: 'props',
    categoryVi: 'Đạo Cụ Thôn Trấn',
    icon: '📦',
    dimensions: { x: 2.0, y: 0.13, z: 0.7 },
    vertices: 28,
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
