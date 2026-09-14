/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: HoleCover_90Half
 * ============================================================================
 * Category: Nối Khe & Mộng (floors)
 * Dimensions: 1.12m x 0.21m x 1.12m | Vertices: 32 | Faces: 16
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'HoleCover_90Half';
  const SUBMESHES = [{"matName":"MI_WoodTrim","texture":"T_WoodTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"elNhP5k3172DU2G/elNhP5k3172DU2G/elNhPzg41z2DU2G/elNhPzg41z2DU2G/QVaPP+k2171HVo+/QVaPP+k2171HVo+/QVaPPz441z1HVo+/QVaPPz441z1HVo+/Q5ULtAY3171EVo+/Q5ULtAY3171EVo+/78KbtCE41z1EVo+/78KbtCE41z1EVo+/a/NUtCE41z1+U2G/a/NUtCE41z1+U2G/jgXSs2Q3171+U2G/jgXSs2Q3171+U2G/gFNhP5k31719U2G/gFNhP5k31719U2G/gFNhPzg41z19U2G/gFNhPzg41z19U2G/RlaPP+k2171CVo+/RlaPP+k2171CVo+/RlaPPz441z1CVo+/RlaPPz441z1CVo+/RFaPP+k2172YjrWzRFaPP+k2172YjrWzRFaPPz441z3Q4hQzRFaPPz441z3Q4hQzflNhPzg41z3gQ+uxflNhPzg41z3gQ+uxflNhP003170+tI6zflNhP003170+tI6z","norm":"AAAAgAAAgL8AAACAAAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AAAAgAAAgD8AAACAAAAAgAAAgL8AAACAAAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/AAAAgAAAgD8AAACAAAAAgAAAgL8AAACAAAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/AAAAgAAAgD8AAACAAAAAAAAAAAAAAIA/AAAAgAAAgD8AAACAAAAAgAAAgL8AAACAAAAAAAAAAAAAAIA/AACAvwAAAAAAAACAAAAAAAAAgL8AAAAAAACAvwAAAAAAAACAAAAAgAAAgD8AAACAAAAAAAAAgL8AAAAAAACAPwAAAIAAAAAAAAAAgAAAgD8AAACAAACAPwAAAIAAAAAAAAAAAAAAgL8AAAAAAACAPwAAAIAAAAAAAAAAgAAAgD8AAACAAACAPwAAAIAAAAAAAACAvwAAAAAAAACAAAAAgAAAgD8AAACAAACAvwAAAAAAAACAAAAAAAAAgL8AAAAA","uv":"qTqQPjhFeD4AAIA/AA97OwAAgD/AJ/A9qTqQPjhFeD4rPAc/cJUHPgAAgD/AJ/A9AACAPwAPezsrPAc/cJUHPgAAAABwlQc+AAAAM7An8D0AAACzAAx7OwAAAABwlQc+AAAAs7An8D0AAAAAOEV4PgAAAAA4RXg+AAAAMwAMezsAAIA/AA97O6k6kD44RXg+AACAP8An8D2pOpA+OEV4Pis8Bz9wlQc+AACAP8An8D0rPAc/cJUHPgAAgD8AD3s7AAAAAHCVBz4AAAAzsCfwPQAAAABwlQc+AAAAswAMezsAAACzsCfwPQAAAAA4RXg+AAAAMwAMezsAAAAAOEV4Pg==","indices":"BQAJAAoABQAKAAYABAAAAA4ABAAOAAgAAgAMAA8AAgAPAAEACwANAAMACwADAAcAFQAXABsAFQAbABkAFAAYAB8AFAAfABEAEgAQAB4AEgAeABwAGgAWABMAGgATAB0A"}];

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
    dimensions: { x: 1.12, y: 0.21, z: 1.12 },
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
