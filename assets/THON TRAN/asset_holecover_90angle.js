/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: HoleCover_90Angle
 * ============================================================================
 * Category: Nối Khe & Mộng (floors)
 * Dimensions: 2.12m x 0.21m x 2.12m | Vertices: 40 | Faces: 20
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'HoleCover_90Angle';
  const SUBMESHES = [{"matName":"MI_WoodTrim","texture":"T_WoodTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"elNhP5k3172DU2G/elNhP5k3172DU2G/elNhP5k3172DU2G/elNhP5k3172DU2G/AQCAv/Y21715U2G/AQCAv/Y21715U2G/AQCAv/Y21715U2G/AACAvzg41z15U2G/AACAvzg41z15U2G/AACAvzg41z15U2G/AQCAv+k2171BVo+/AQCAv+k2171BVo+/AQCAv+k2171BVo+/AACAvz441z1BVo+/AACAvz441z1BVo+/AACAvz441z1BVo+/glNhP803173//38/glNhP803173//38/glNhP803173//38/glNhPy031z3//38/glNhPy031z3//38/glNhPy031z3//38/R1aPP8Y3170BAIA/R1aPP8Y3170BAIA/R1aPP8Y3170BAIA/R1aPPy031z0BAIA/R1aPPy031z0BAIA/R1aPPy031z0BAIA/elNhPzg41z2DU2G/elNhPzg41z2DU2G/elNhPzg41z2DU2G/elNhPzg41z2DU2G/QVaPP+k2171HVo+/QVaPP+k2171HVo+/QVaPP+k2171HVo+/QVaPP+k2171HVo+/QVaPPz441z1HVo+/QVaPPz441z1HVo+/QVaPPz441z1HVo+/QVaPPz441z1HVo+/","norm":"AACAvwAAAAAAAAAAAAAAgAAAgL8AAACAAAAAAAAAgL8AAACAAAAAAAAAAAAAAIA/AACAvwAAAAAAAAAAAAAAgAAAgL8AAACAAAAAAAAAAAAAAIA/AACAvwAAAAAAAAAAAAAAAAAAAAAAAIA/AAAAAAAAgD8AAAAAAACAvwAAAAAAAAAAAAAAgAAAgL8AAACAAAAAgAAAAAAAAIC/AACAvwAAAAAAAAAAAAAAgAAAAAAAAIC/AAAAAAAAgD8AAAAAAACAvwAAAAAAAAAAAAAAAAAAgL8AAACAAAAAgAAAAAAAAIA/AACAvwAAAAAAAAAAAAAAgAAAAAAAAIA/AAAAAAAAgD8AAAAAAAAAAAAAgL8AAACAAAAAgAAAAAAAAIA/AACAPwAAAAAAAACAAAAAgAAAAAAAAIA/AAAAAAAAgD8AAAAAAACAPwAAAAAAAACAAACAvwAAAAAAAAAAAAAAAAAAAAAAAIA/AAAAAAAAgD8AAAAAAAAAAAAAgD8AAAAAAAAAgAAAgL8AAACAAAAAAAAAgL8AAACAAAAAgAAAAAAAAIC/AACAPwAAAAAAAACAAAAAgAAAAAAAAIC/AAAAAAAAgD8AAAAAAAAAAAAAgD8AAAAAAACAPwAAAAAAAACA","uv":"AAAAAAAKezsAAAAAOEV4PgAAgD84RXg+AACAPwAPezuTPao+m3dJPwAAgD84RXg+AAAAAAAKezuTPao+vF0gPwAAAACoJ/A9AACAPzhFeD6SC/s+m3dJPwAAgD9wlQc+AAAAAKgn8D2SC/s+vF0gPwAAAAAACns7AACAP3CVBz4AAIA/AA97OwAAAAA4RXg+kz2qPpt3ST8AAIA/wCfwPZM9qj68XSA/AAAAADhFeD4AAAAAcJUHPpIL+z6bd0k/AACAP8An8D2SC/s+vF0gPwAAAABwlQc+AACAPwAPezsAAAAAqCfwPQAAgD/AJ/A9AAAAADhFeD4AAIA/OEV4PgAAAABwlQc+AACAP3CVBz4AAIA/wCfwPQAAAACoJ/A9AACAPwAPezsAAAAAcJUHPgAAgD9wlQc+AAAAAAAKezs=","indices":"CgAEAAcACgAHAA0AIgAMAA4AIgAOACQADwAJAB4ADwAeACUAIAABAAUAIAAFAAsAHQAIAAYAHQAGAAMAEgAXABkAEgAZABQAGAAjACcAGAAnABsAJgAfABUAJgAVABoAFgARAAIAFgACACEAEwAcAAAAEwAAABAA"}];

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
    dimensions: { x: 2.12, y: 0.21, z: 2.12 },
    vertices: 40,
    triangles: 20,
    create: (name, scene) => createMasterMesh(name, scene),
    createInstance: (name, parent, scene) => createInstance(name, parent, scene)
  };

  global.ThonTranRegistry = global.ThonTranRegistry || {};
  global.ThonTranRegistry[MODEL_NAME] = AssetModule;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetModule;
  }
})(typeof window !== 'undefined' ? window : this);
