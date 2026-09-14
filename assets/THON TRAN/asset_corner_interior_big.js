/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Corner_Interior_Big
 * ============================================================================
 * Category: Cột & Góc Tường (corners)
 * Dimensions: 0.33m x 3.0m x 0.37m | Vertices: 36 | Faces: 24
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Corner_Interior_Big';
  const SUBMESHES = [{"matName":"MI_WoodTrim","texture":"T_WoodTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"bdOlPv//P0D5LTU9bdOlPv//P0D5LTU9bdOlPv//P0D5LTU9a9OlPv//P0AZ1aW+a9OlPv//P0AZ1aW+a9OlPv//P0AZ1aW+RLwXvP//P0AZ1aW+RLwXvP//P0AZ1aW+RLwXvP//P0AZ1aW+I9OlPgAAALRdLjU9I9OlPgAAALRdLjU9I9OlPgAAALRdLjU9IdOlPgAAALQN1aW+IdOlPgAAALQN1aW+IdOlPgAAALQN1aW+BMgXvAAAALQN1aW+BMgXvAAAALQN1aW+BMgXvAAAALQN1aW+bNOlPv//P0A2KTe+bNOlPv//P0A2KTe+RLwXvP//P0A1KTe+RLwXvP//P0A1KTe+ItOlPgAAALQeKTe+ItOlPgAAALQeKTe+BMgXvAAAALQeKTe+BMgXvAAAALQeKTe+MktBPv//P0D8LTU9MktBPv//P0D8LTU9L0tBPv//P0AZ1aW+L0tBPv//P0AZ1aW+i0pBPgAAALQN1aW+i0pBPgAAALQN1aW+jkpBPgAAALRYLjU9jkpBPgAAALRYLjU9jEpBPgAAALQeKTe+MEtBPv//P0A2KTe+","norm":"AAAAgAAAAAAAAIA/AAAAAAAAgD8AAACAAACAPwAAAIAAAACAAAAAAAAAAIAAAIC/AAAAAAAAgD8AAACAAACAPwAAAIAAAACAAACAvwAAAAAAAACAAAAAAAAAAIAAAIC/AAAAAAAAgD8AAACAAAAAAAAAgL8AAACAAAAAgAAAAAAAAIA/AACAPwAAAIAAAACAAAAAAAAAgL8AAACAAAAAAAAAAIAAAIC/AACAPwAAAIAAAACAAACAvwAAAAAAAACAAAAAAAAAgL8AAACAAAAAAAAAAIAAAIC/AAAAAAAAgD8AAACAAACAPwAAAIAAAACAAACAvwAAAAAAAACAAAAAAAAAgD8AAACAAAAAAAAAgL8AAACAAACAPwAAAIAAAACAAACAvwAAAAAAAACAAAAAAAAAgL8AAACAAAAAgAAAAAAAAIA/AAAAAAAAgD8AAACAAAAAAAAAAIAAAIC/AAAAAAAAgD8AAACAAAAAAAAAgL8AAACAAAAAAAAAAIAAAIC/AAAAAAAAgL8AAACAAAAAgAAAAAAAAIA/AAAAAAAAgL8AAACAAAAAAAAAgD8AAACA","uv":"AACAPwAPezuTPao+m3dJPwAAAAA4RXg+AACAP8An8D2SC/s+m3dJPwAAAABwlQc+AAAAAHCVBz4AAIA/AA97O5IL+z68XSA/kz2qPpt3ST8AAAAAAAp7OwAAgD84RXg+kgv7Ppt3ST8AAAAAqCfwPQAAgD9wlQc+AACAP3CVBz6SC/s+vF0gPwAAAAAACns7SjbbPpt3ST8AAAAAEPozPgAAAAAQ+jM+SjbbPrxdID9KNts+m3dJPwAAgD8Q+jM+AACAPxD6Mz5KNts+vF0gPwAAgD/QIUw9kz2qPiLMOD8AAIA/WO+RPZIL+z4izDg/kgv7PiLMOD8AAAAAMO+RPZI9qj4izDg/AAAAAJAhTD1KNts+Isw4P0o22z4izDg/","indices":"IwAdAAgAIwAIABUAHAAfABEAHAARAAcAEwACAAsAEwALABcAGgAhAAoAGgAKAAAABQATABcABQAXAA4ADwAYABQADwAUAAYAHgAiABkAHgAZABAAAQASACMAAQAjABsADAAWACIADAAiAB4AAwANAB8AAwAfABwAFgAJACAAFgAgACIAEgAEAB0AEgAdACMA"}];

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
    dimensions: { x: 0.33, y: 3.0, z: 0.37 },
    vertices: 36,
    triangles: 24,
    create: (name, scene) => createMasterMesh(name, scene),
    createInstance: (name, parent, scene) => createInstance(name, parent, scene)
  };

  global.ThonTranRegistry = global.ThonTranRegistry || {};
  global.ThonTranRegistry[MODEL_NAME] = AssetModule;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetModule;
  }
})(typeof window !== 'undefined' ? window : this);
