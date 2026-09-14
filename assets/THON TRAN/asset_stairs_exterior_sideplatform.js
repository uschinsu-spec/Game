/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Stairs_Exterior_SidePlatform
 * ============================================================================
 * Category: Cầu Thang & Bậc (stairs)
 * Dimensions: 2.0m x 1.0m x 2.0m | Vertices: 55 | Faces: 30
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Stairs_Exterior_SidePlatform';
  const SUBMESHES = [{"matName":"MI_RockTrim","texture":"T_RockTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"/v9/PyAgSD8AAACA/v9/PyAgSD8AAACA/v9/PyAgSD8AAACAaQdQvyAgSD8AAACAaQdQvyAgSD8AAACAaQdQv08YfT8AAACA/v9/P08YfT8AAACA/v9/P08YfT8AAACA/v9/P08YfT8AAACAaQdQvyAgSD8AFoA/aQdQvyAgSD8AFoA//v9/PyAgSD8AFoA//v9/PyAgSD8AFoA//v9/PyAgSD8AFoA//v9/P08YfT9aqno//v9/P08YfT9aqno//v9/P08YfT9aqno/aQdQv08YfT9aqno/aQdQv08YfT9aqno//v9/P2vEeT8AFoA//v9/P2vEeT8AFoA//v9/P2vEeT8AFoA/aQdQv2vEeT8AFoA/aQdQv2vEeT8AFoA//v9/PyAgSD8AFoC//v9/PyAgSD8AFoC//v9/PyAgSD8AFoC/aQdQvyAgSD8AFoC/aQdQvyAgSD8AFoC/aQdQv08YfT9aqnq/aQdQv08YfT9aqnq//v9/P08YfT9aqnq//v9/P08YfT9aqnq//v9/P08YfT9aqnq/aQdQv2vEeT8AFoC/aQdQv2vEeT8AFoC//v9/P2vEeT8AFoC//v9/P2vEeT8AFoC//v9/P2vEeT8AFoC/","norm":"AAAAAAAAgL8AAACAAAAAAAAAgL8AAACAAACAPwAAAAAAAACAAAAAAAAAgL8AAACAAAAAAAAAgL8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAACAPwAAAAAAAACAAAAAAAAAgL8AAACAAAAAAAAAAAAAAIA/AAAAAAAAgL8AAACAAAAAAAAAAAAAAIA/AACAPwAAAAAAAACAAAAAAJiZdj8leIk+AAAAAJiZdj8leIk+AACAPwAAAAAAAACAAAAAAJiZdj8leIk+AAAAAJiZdj8leIk+AAAAAAAAAAAAAIA/AAAAAJAaWz8xZgQ/AACAPwAAAAAAAACAAAAAAAAAAAAAAIA/AAAAAJAaWz8xZgQ/AAAAAAAAgL8AAACAAAAAAAAAAAAAAIC/AACAPwAAAAAAAACAAAAAAAAAgL8AAACAAAAAAAAAAAAAAIC/AAAAAJiZdj8leIm+AAAAAJiZdj8leIm+AAAAAJiZdj8leIm+AAAAAJiZdj8leIm+AACAPwAAAAAAAACAAAAAAAAAAAAAAIC/AAAAAJAaWz8xZgS/AAAAAAAAAAAAAIC/AAAAAJAaWz8xZgS/AACAPwAAAAAAAACA","uv":"A534vmVyAT8Cnfi+ZnIBP2k6WD8RcRU/mSvVPmZyAT+aK9U+ZXIBPw+P+L7EP/8+PKzVPsA//z4+rNU+wD//Pmk6WD9yIwM/mSvVPjaAsT4Wlvi+aJABPwOd+L42gLE+Q7PVPmaQAT/GbQE/EXEVPzys1T44trI+PqzVPji2sj5qSwM/ciMDPw+P+L44trI+D4/4vjq2sj5Fs9U+IHcUPzys1T5YZ6w+xm0BP9BJBD8Wlvi+IncUPw+P+L5aZ6w+Ap34vjaAsT5Fs9U+ZpABP8mcmT8RcRU/mivVPjaAsT4Wlvi+aJABPw+P+L44trI+D4/4vjq2sj48rNU+OLayPj6s1T44trI+962YP3IjAz8Wlvi+IncUPw+P+L5aZ6w+Q7PVPiB3FD8+rNU+WGesPsmcmT/QSQQ/","indices":"HAAiACQAHAAkABkAIwAeAB8AIwAfACUAGAAAAAMAGAADABsAHQAFAAYAHQAGACAAFgAKAAwAFgAMABMAEQAXABQAEQAUAA8AAQALAAkAAQAJAAQABQASAA4ABQAOAAcAGgAmACEACAAQABUAGgAhAAgAFQANAAIAAgAaAAgACAAVAAIA"},{"matName":"MI_Brick","texture":"T_Brick_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"ysxMvwAAgD8AAIC/ysxMvwAAgD8AAIC/ysxMvzg/3KUAAIC/ysxMvzg/3KUAAIC//P9/v9DUEiUAAIC//P9/v9DUEiUAAIC/0MxMvwAAgD8AAIA/0MxMvwAAgD8AAIA/0MxMv9DUEiUAAIA/0MxMv9DUEiUAAIA/AgCAv9DUEiUAAIA/AgCAv9DUEiUAAIA//P9/vwAAgD8AAIC//P9/vwAAgD8AAIC/AgCAvwAAgD8AAIA/AgCAvwAAgD8AAIA/","norm":"AAAAAAAAgD8AAACAAACAPwAAAAAAAAAAAAAAgAAAgL8AAAAAAACAPwAAAAAAAAAAAACAvwAAAAAAAACAAAAAgAAAgL8AAAAAAAAAAAAAgD8AAACAAACAPwAAAAAAAAAAAAAAgAAAgL8AAAAAAACAPwAAAAAAAAAAAACAvwAAAAAAAACAAAAAgAAAgL8AAAAAAACAvwAAAAAAAACAAAAAAAAAgD8AAACAAACAvwAAAAAAAACAAAAAAAAAgD8AAACA","uv":"AAAAAJDsSj/Oplo/OkzZPs6mWj9yz3w/zqZaP9gImj0AAIA/AACAP86mWj9gYWA/AACAP5LsSj9rrLo9OkzZPmusuj1yz3w/a6y6PdgImj0AAAAA/f9/P2usuj1gYWA/AACAPwEAGD8AAAAA49BlPwAAAAD//xc/AACAP+XQZT8=","indices":"CgAOAAwACgAMAAQAAwABAAcAAwAHAAkAAgAIAAsAAgALAAUADQAPAAYADQAGAAAA"}];

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
    dimensions: { x: 2.0, y: 1.0, z: 2.0 },
    vertices: 55,
    triangles: 30,
    create: (name, scene) => createMasterMesh(name, scene),
    createInstance: (name, parent, scene) => createInstance(name, parent, scene)
  };

  global.ThonTranRegistry = global.ThonTranRegistry || {};
  global.ThonTranRegistry[MODEL_NAME] = AssetModule;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetModule;
  }
})(typeof window !== 'undefined' ? window : this);
