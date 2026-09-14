/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Corner_Exterior_TopDown
 * ============================================================================
 * Category: Cột & Góc Tường (corners)
 * Dimensions: 0.09m x 2.47m x 0.09m | Vertices: 34 | Faces: 16
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Corner_Exterior_TopDown';
  const SUBMESHES = [{"matName":"MI_WoodTrim","texture":"T_WoodTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"AAAEtMBKJj+0VL09AAAEtMBKJj+0VL09AAAEtCoTYj+0VL09AAAEtCoTYj+0VL09AKActCoTYj9AYKC5AKActCoTYj9AYKC5cFS9vUYTYj8AAICzcFS9vUYTYj8AAICzcFS9vdhKJj8AAACAcFS9vdhKJj8AAACA905OvScTYj+U9yc9905OvScTYj+U9yc9AAActMBKJj8AYKC5AAActMBKJj8AYKC5905OvcBKJj+U9yc9905OvcBKJj+U9yc9f9vIs++GOEAn67w9f9vIs++GOEAn67w9SvUMOu+GOEDC8Ay6SvUMOu+GOEDC8Ay6/uo8ve+GOEAe6zw9/uo8ve+GOEAe6zw9/uo8ve+GOEAe6zw9f9vIswt5R0Am67w9f9vIswt5R0Am67w9SvUMOgt5R0DM8Ay6SvUMOgt5R0DM8Ay68eq8vQt5R0CwZoSz8eq8vQt5R0CwZoSz8eq8ve+GOECEx38y8eq8ve+GOECEx38y/uo8vQt5R0Ae6zw9/uo8vQt5R0Ae6zw9/uo8vQt5R0Ae6zw9","norm":"ouo2vwAAAAAfGjM/AAAAgAAAgD8AAACAouo2vwAAAAAfGjM/AAAAgAAAgD8AAAAAAAAAAAAAgD8AAAAAAAAAAAAAgD8AAAAAbKkyvwAAAAC6WDc/AAAAAAAAgD8AAAAAbKkyvwAAAAC6WDc/AAAAAAAAgD8AAAAAftA0vwAAAABZOTU/AAAAAAAAgD8AAAAAAAAAAAAAgD8AAAAAAAAAAAAAgD8AAAAAftA0vwAAAABZOTU/AAAAAAAAgD8AAAAA9AQ1vwAAAAD0BDU/AAAAAAAAgL8AAACAAAAAAAAAgL8AAACAAAAAAAAAgL8AAACA9AQ1vwAAAAD0BDU/AAAAAAAAgL8AAACAAAAAAAAAgL8AAACA9AQ1vwAAAAD0BDU/AAAAgAAAgD8AAACAAAAAgAAAgD8AAACAAAAAgAAAgD8AAACA9AQ1vwAAAAD0BDU/AAAAAAAAgD8AAACA9AQ1vwAAAAD0BDU/AAAAAAAAgL8AAACA9AQ1vwAAAAD0BDU/AAAAgAAAgD8AAACAAAAAgAAAgD8AAACA","uv":"AAAAAKgn8D0A8Bs56GGdPgAAAAAACns7APAbOehhnT5ggFk4olSEPiLyGzkAMoQ+AAAAAAAPeztghFk41GidPgAAAADAJ/A9YIRZONRonT6N1CM9AAt7O3blyzyGfZE+YIBZOKJUhD4i8hs5ADKEPo3UIz2wJ/A9duXLPIZ9kT4AAAAAqCfwPSLyGzk0ZZ0+YIBZOMj/gD4i8hs5fgyBPmBbPD2wJ/A9cHLpPJq7jz4iPeo8RLWPPgAAAAAACns7IvIbOTRlnT5ggFk4yP+APiLyGzl+DIE+AAAAAAAPeztghFk41GidPgAAAADAJ/A9YIRZONRonT5gWzw9AAx7O3By6Tyau48+Ij3qPES1jz4=","indices":"DQAPAAEADAAJAA8ABAAHAAsABQALAAMACgAGAAgACgAIAA4AAgAKAA4AAgAOAAAAEwARABYAEgAVAB4AHwAbAB0AHwAdABQAGQAcACAAGgAhABgAFwAfABQAFwAUABAA"}];

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
    dimensions: { x: 0.09, y: 2.47, z: 0.09 },
    vertices: 34,
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
