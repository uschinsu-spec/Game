/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Corner_Interior_Small
 * ============================================================================
 * Category: Cột & Góc Tường (corners)
 * Dimensions: 0.21m x 3.0m x 0.24m | Vertices: 24 | Faces: 12
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Corner_Interior_Small';
  const SUBMESHES = [{"matName":"MI_WoodTrim","texture":"T_WoodTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"lGfPPv//P0AngTi+lGfPPv//P0AngTi+lGfPPv//P0AngTi+qpdHPv//P0AmgTi+qpdHPv//P0AmgTi+qpdHPv//P0AmgTi+kmfPPv//P0Co8ta+kmfPPv//P0Co8ta+kmfPPv//P0Co8ta+qpdHPv//P0Co8ta+qpdHPv//P0Co8ta+qpdHPv//P0Co8ta+ZGfPPqCgIbQXgTi+ZGfPPqCgIbQXgTi+ZGfPPqCgIbQXgTi+MJdHPoS+vLMYgTi+MJdHPoS+vLMYgTi+MJdHPoS+vLMYgTi+YmfPPqCgIbSg8ta+YmfPPqCgIbSg8ta+YmfPPqCgIbSg8ta+MJdHPoS+vLOg8ta+MJdHPoS+vLOg8ta+MJdHPoS+vLOg8ta+","norm":"AAAAAAAAAAAAAIA/AAAAAAAAgD8AAACAAACAPwAAAIAAAACAAACAvwAAAAAAAACAAAAAAAAAAAAAAIA/AAAAAAAAgD8AAACAAAAAgAAAAIAAAIC/AAAAAAAAgD8AAACAAACAPwAAAIAAAACAAACAvwAAAAAAAACAAAAAgAAAAIAAAIC/AAAAAAAAgD8AAACAAAAAgAAAgL8AAAAAAAAAAAAAAAAAAIA/AACAPwAAAIAAAACAAACAvwAAAAAAAACAAAAAgAAAgL8AAAAAAAAAAAAAAAAAAIA/AAAAgAAAgL8AAAAAAAAAgAAAAIAAAIC/AACAPwAAAIAAAACAAACAvwAAAAAAAACAAAAAgAAAgL8AAAAAAAAAgAAAAIAAAIC/","uv":"AACAPwAPezuTPao+m3dJPwAAAAA4RXg+AAAAADhFeD4AAIA/wCfwPZM9qj68XSA/AACAP8An8D2SC/s+m3dJPwAAAABwlQc+AAAAAHCVBz4AAIA/AA97O5IL+z68XSA/kz2qPpt3ST8AAAAAAAp7OwAAgD84RXg+AACAPzhFeD6TPao+vF0gPwAAAACoJ/A9kgv7Ppt3ST8AAAAAqCfwPQAAgD9wlQc+AACAP3CVBz6SC/s+vF0gPwAAAAAACns7","indices":"AQAHAAsAAQALAAUAEgAMABAAEgAQABYABgATABcABgAXAAoAFQAPAAMAFQADAAkACAACAA4ACAAOABQABAARAA0ABAANAAAA"}];

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
    category: 'corners',
    categoryVi: 'Cột & Góc Tường',
    icon: '🧱',
    dimensions: { x: 0.21, y: 3.0, z: 0.24 },
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
