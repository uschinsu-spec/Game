/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Prop_Support
 * ============================================================================
 * Category: Đạo Cụ Thôn Trấn (props)
 * Dimensions: 0.2m x 1.71m x 2.04m | Vertices: 32 | Faces: 16
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Prop_Support';
  const SUBMESHES = [{"matName":"MI_WoodTrim","texture":"T_WoodTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"sl7LPbThOkDxhfU/sl7LPbThOkDxhfU/6l3LvbThOkDxhfU/6l3LvbThOkDxhfU/AF7LvbXhOkAmbsg/AF7LvbXhOkAmbsg/ml7LPbXhOkAkbsg/ml7LPbXhOkAkbsg/0e64vbbhOkBUxbk+0e64vbbhOkBUxbk+ve64vbbhOkBA/i09ve64vbbhOkBA/i09Ou+4PbbhOkBg/i09Ou+4PbbhOkBg/i09JO+4PbbhOkBUxbk+JO+4PbbhOkBUxbk+wl7Lvc4Omz9o6vG9wl7Lvc4Omz9o6vG9s17LvTXlwD946vG9s17LvTXlwD946vG9B17LPdAOmz9Q6vG9B17LPdAOmz9Q6vG9DV7LPTblwD9Y6vG9DV7LPTblwD9Y6vG9Fe+4vWo0GEBuGIE/Fe+4vWo0GEBuGIE/7u64PWo0GEBuGIE/7u64PWo0GEBuGIE/9e64PThND0AMn1o/9e64PThND0AMn1o/E++4vTdND0AQn1o/E++4vTdND0AQn1o/","norm":"AAAAgOMZRL+kjyQ/AACAPwAAAIAAAACAAACAvwAAAAAAAAAAAAAAgOMZRL+kjyQ/AACAvwAAAAAAAAAAAAAAgOMZRD+kjyS/AAAAgOMZRD+kjyS/AACAPwAAAIAAAACAAACAvwAAAAAAAACAAAAAAOMZRD+kjyQ/AACAvwAAAAAAAACAAAAAAOMZRL+kjyS/AAAAAOMZRL+kjyS/AACAPwAAAIAAAAAAAAAAAOMZRD+kjyQ/AACAPwAAAIAAAAAAAACAvwAAAAAAAAAAAAAAgOMZRL+kjyQ/AACAvwAAAAAAAAAAAAAAgOMZRD+kjyS/AAAAgOMZRL+kjyQ/AACAPwAAAIAAAACAAAAAgOMZRD+kjyS/AACAPwAAAIAAAACAAACAvwAAAAAAAACAAAAAAOMZRD+kjyQ/AAAAAOMZRD+kjyQ/AACAPwAAAIAAAAAAAAAAAOMZRL+kjyS/AACAPwAAAIAAAAAAAACAvwAAAAAAAACAAAAAAOMZRL+kjyS/","uv":"AACAP3hpoD4AAAAA+0oNPwAAAAD7Sg0/AACAP0p92j6o9sI9Ej7iPiuhZz92aaA+KqFnP0h92j6w9sI9Ej7iPoelfT4SPuI+npZAP3RpoD4bKhw++0oNP3n1WD9Ifdo+ePVYP3ZpoD4jKhw++0oNP56WQD9Ifdo+iaV9PhI+4j6iC3A/+0oNP+JFfz1Efdo+7uJePxI+4j5FdAQ+cGmgPvBFfz1uaaA+oQtwP/tKDT9KdAQ+RH3aPu3iXj8SPuI+5x4TPxI+4j4xwtk+cmmgPjDC2T5Efdo+6B4TPxA+4j4ShN8+cmmgPvc9ED/7Sg0/+T0QP/tKDT8OhN8+Rn3aPg==","indices":"AwARABQAAwAUAAAABwABABUABwAVABcABQAGABYABQAWABMADAAcAB8ADAAfAAsAEgAQAAIAEgACAAQACQAZABoACQAaAA4ADwAbAB0ADwAdAA0AGAAIAAoAGAAKAB4A"}];

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
    dimensions: { x: 0.2, y: 1.71, z: 2.04 },
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
