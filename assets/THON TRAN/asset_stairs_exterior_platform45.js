/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Stairs_Exterior_Platform45
 * ============================================================================
 * Category: Cầu Thang & Bậc (stairs)
 * Dimensions: 2.0m x 1.0m x 2.0m | Vertices: 87 | Faces: 55
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Stairs_Exterior_Platform45';
  const SUBMESHES = [{"matName":"MI_RockTrim","texture":"T_RockTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"ZmZmvyAgSD8AFoA/ZmZmvyAgSD8AFoA/ZmZmvyAgSD8AAACAZmZmv08YfT8AAACAAACAPyAgSD8AFoA/AACAPyAgSD8AFoA/AACAPyAgSD8AFoA/AACAPyAgSD8AAACAAACAPyAgSD8AAACAAACAP08YfT8AAACAAACAP08YfT8AAACAZmZmv2vEeT8AFoA/ZmZmv2vEeT8AFoA/ZmZmv08YfT9aqno/AACAP08YfT9aqno/AACAP08YfT9aqno/AACAP2vEeT8AFoA/AACAP2vEeT8AFoA/AACAP2vEeT8AFoA/ZmZmv08YfT88hE2/AACAPyAgSD88hE2/AACAPyAgSD88hE2/ZmZmvyAgSD88hE2/AACAP08YfT88hE2/AACAP08YfT88hE2/","norm":"AAAAAAAAgL8AAACAAAAAAAAAAAAAAIA/AAAAAAAAgL8AAACAAAAAAAAAgD8AAACAAAAAAAAAgL8AAACAAAAAAAAAAAAAAIA/AACAPwAAAAAAAACAAAAAAAAAgL8AAACAAACAPwAAAAAAAACAAAAAAAAAgD8AAACAAACAPwAAAAAAAACAAAAAAAAAAAAAAIA/AAAAAJAaWz8xZgQ/AAAAAJiZdj8leIk+AAAAAJiZdj8leIk+AACAPwAAAAAAAACAAAAAAAAAAAAAAIA/AAAAAJAaWz8xZgQ/AACAPwAAAAAAAACAAAAAAAAAgD8AAACAAAAAAAAAgL8AAACAAACAPwAAAAAAAACAAAAAAAAAgL8AAACAAAAAAAAAgD8AAACAAACAPwAAAAAAAACA","uv":"AADuPjaAsT60uAi/aJABPwAA7j5mcgE/0LQIv8Q//z60uAi/NoCxPpaO7j5mkAE/lo7uPmaQAT+0uAi/ZnIBP7S4CL9mcgE/zobuPsA//z7Ohu4+wD//PrS4CL8idxQ/0LQIv1pnrD7QtAi/OrayPs6G7j44trI+zobuPji2sj6Wju4+IHcUP86G7j5YZ6w+zobuPlhnrD7QtAi/1Pq9PrS4CL++CL8+tLgIv74Ivz4AAO4+vgi/Ps6G7j7S+r0+zobuPtL6vT4=","indices":"CQADAA0ACQANAA4AAgAHAAQAAgAEAAAADgANAAwADgAMABEABQAQAAsABQALAAEACQAXABMACQATAAMAAgAWABQAAgAUAAcACAAVABgACgAPABIACAAYAAoAEgAGAAgACAAKABIA"},{"matName":"MI_Brick","texture":"T_Brick_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"/P9/PwAAgD8BAIC//P9/PwAAgD8BAIC//P9/PwAAADMBAIC//P9/PwAAADMBAIC//P9/PwAAADPQzEy//P9/PwAAADPQzEy/ysxMvwAAgD8AAIC/ysxMvwAAgD8AAIC/ysxMvwAAgD8AAIC/ysxMvzg/3KUAAIC/ysxMvzg/3KUAAIC/ysxMvzg/3KUAAIC/y8xMv8PAvqXMk0y/y8xMv8PAvqXMk0y/y8xMv8PAvqXMk0y/y8xMv8PAvqXMk0y//P9/PwAAgD/QzEy//P9/PwAAgD/QzEy/y8xMvwAAgD/Mk0y/y8xMvwAAgD/Mk0y/y8xMvwAAgD/Mk0y/y8xMvwAAgD/Mk0y/0MxMvwAAgD8AAIA/0MxMvwAAgD8AAIA/0MxMv9DUEiUAAIA/0MxMv9DUEiUAAIA/AgCAv9DUEiUAAIA/AgCAv9DUEiUAAIA/AgCAvwAAgD8AAIA/AgCAvwAAgD8AAIA//BWAPwAAgD8AAIA//BWAPwAAgD8AAIA//BWAPwAAgD8AAIA//BWAP37tdz8AAIA//BWAP37tdz8AAIA//BWAP37tdz8AAIA/w/hMP37tdz8AAIA/w/hMP37tdz8AAIA/w/hMP37tdz8AAIA/w/hMPwAAgD8AAIA/w/hMPwAAgD8AAIA/w/hMPwAAgD8AAIA//BWAP37tdz8iB00//BWAP37tdz8iB00/xfhMP37tdz8iB00/xfhMP37tdz8iB00//BWAPwAAgD8iB00//BWAPwAAgD8iB00/xfhMPwAAgD8iB00/xfhMPwAAgD8iB00//f9/v9DUEiXMk0y//f9/v9DUEiXMk0y//f9/vwAAgD/Mk0y//f9/vwAAgD/Mk0y//P9/v9DUEiXl6Xy//P9/v9DUEiXl6Xy/4el8v7ba3iQAAIC/4el8v7ba3iQAAIC/4el8vwAAgD8AAIC/4el8vwAAgD8AAIC//P9/vwAAgD/l6Xy//P9/vwAAgD/l6Xy/","norm":"AAAAgAAAAAAAAIC/AAAAAAAAgD8AAACAAAAAAAAAgL8AAAAAAAAAgAAAAAAAAIC/AAAAAAAAgL8AAAAAbhIDOgAAAAD+/38/AAAAgAAAAAAAAIC/AAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAgAAAAAAAAIC/AAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAbhIDOgAAAAD+/38/AACAPwAAAAAAAAAAAAAAAAAAgD8AAACAbhIDOgAAAAD+/38/AAAAAAAAgD8AAACAAAAAAAAAgD8AAACAbhIDOgAAAAD+/38/AACAPwAAAAAAAAAAAAAAAAAAgD8AAACAAACAPwAAAAAAAAAAAAAAgAAAgL8AAAAAAACAPwAAAAAAAAAAAACAvwAAAAAAAACAAAAAgAAAgL8AAAAAAACAvwAAAAAAAACAAAAAAAAAgD8AAACAAAAAAAAAAAAAAIA/AAAAAAAAgD8AAACAAACAPwAAAAAAAACAAAAAAAAAgL8AAACAAAAAAAAAAAAAAIA/AACAPwAAAAAAAACAAACAvwAAAAAAAACAAAAAAAAAgL8AAACAAAAAAAAAAAAAAIA/AACAvwAAAAAAAACAAAAAAAAAAAAAAIA/AAAAAAAAgD8AAACAAAAAAAAAgL8AAACAAACAPwAAAAAAAACAAACAvwAAAAAAAACAAAAAAAAAgL8AAACAAAAAAAAAgD8AAACAAACAPwAAAAAAAACAAACAvwAAAAAAAACAAAAAAAAAgD8AAACAAACAvwAAAAAAAACAAAAAgAAAgL8AAAAAAACAvwAAAAAAAACAAAAAAAAAgD8AAACALoNsvwAAAAD878O+AAAAgAAAgL8AAAAA/O/DvgAAAAAug2y/AAAAgAAAgL8AAAAA/O/DvgAAAAAug2y/AAAAAAAAgD8AAACALoNsvwAAAAD878O+AAAAAAAAgD8AAACA","uv":"AAAAAP//Fz8AAAAz49BlP86mWj9yz3w/AFCUOK79fz/Oplo/YGFgPwAAgD8AAIA/smJmP1f4Fz8AAAAAkOxKPwAAgD/l0GU/a6y6PXLPfD/Oplo/cs98P7BiZj+w/X8/a6y6PWBhYD/vCEc/cs98PwAAAAD9/38/7whHP9gImj0AAAAzkOxKPwAAgD8BABg/0LDNPZDsSj8AAIA/kuxKPwAAAAD//xc/7whHPzpM2T4AAIA/kuxKP2usuj06TNk+a6y6PXLPfD9rrLo92AiaPQAAAAD9/38/a6y6PWBhYD8AAAAA//8XPwAAgD/l0GU/DqRTP1aIAD8AAIA/kuxKP2usuj06TNk+a6y6PXLPfD8PpFM/EOMcP2usuj3YCJo9AAAAAP3/fz9rrLo9YGFgPxSkaz8Q4xw/AAAAAP//Fz8UpGs/ZtUDPwAAgD/l0GU/cAAfPnLPfD9wAB8+2AiaPeghrD39/38/cAAfPmBhYD/De2o/kuxKP3AAHz46TNk+6CGsPf//Fz/De2o/5dBlP+ZJZj8AAIA/7whHP2BhYD/mSWY/AQAYP9CwzT3j0GU/8nR+PwAAgD9leVk/YGFgP11wfj+w/X8/zqZaPxkYYj+6dH4/i/8XPwAAAADmMWQ/83R+PwEAGD/BhsU749BlPw==","indices":"DgAFABEADgARABQAAwALAAYAAwAGAAAAAgAEAAwAAgAMAAkAEAABAAgAEAAIABMABwA7AD0APQA1ABIAPQASAAcAOQAKAA0ADQAzADcADQA3ADkADwAVABcADwAXABkADQAYABsADQAbADMANQAdABYANQAWABIAIgAeACgAIgAoACYAKwAvACAAKwAgACMAKgAhACUAKgAlAC0AMQApAB8AMQAfAC4AJAAnADAAJAAwACwABgALADgABgA4ADoAGgAcADQAGgA0ADIAOgA4ADYAOgA2ADwAMgA0ADwAMgA8ADYA"}];

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
    vertices: 87,
    triangles: 55,
    create: (name, scene) => createMasterMesh(name, scene),
    createInstance: (name, parent, scene) => createInstance(name, parent, scene)
  };

  global.ThonTranRegistry = global.ThonTranRegistry || {};
  global.ThonTranRegistry[MODEL_NAME] = AssetModule;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetModule;
  }
})(typeof window !== 'undefined' ? window : this);
