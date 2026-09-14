/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Stairs_Exterior_PlatformU
 * ============================================================================
 * Category: Cầu Thang & Bậc (stairs)
 * Dimensions: 2.0m x 1.0m x 2.0m | Vertices: 94 | Faces: 68
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Stairs_Exterior_PlatformU';
  const SUBMESHES = [{"matName":"MI_RockTrim","texture":"T_RockTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"ZmZmvyAgSD8AFoA/ZmZmvyAgSD8AFoA/ZmZmvyAgSD8AAACAZmZmv08YfT8AAACAZmZmv2vEeT8AFoA/ZmZmv2vEeT8AFoA/ZmZmv08YfT9aqno/ZmZmv08YfT88hE2/ZmZmvyAgSD88hE2/r3t1PyAgSD8AAACAr3t1P08YfT8AAACAr3t1PyAgSD8AFoA/r3t1PyAgSD8AFoA/r3t1P08YfT9aqno/r3t1P2vEeT8AFoA/r3t1P2vEeT8AFoA/r3t1P08YfT88hE2/r3t1PyAgSD88hE2/","norm":"AAAAAAAAgL8AAACAAAAAAAAAAAAAAIA/AAAAAAAAgL8AAACAAAAAAAAAgD8AAACAAAAAAAAAAAAAAIA/AAAAAJAaWz8xZgQ/AAAAAJiZdj8leIk+AAAAAAAAgD8AAACAAAAAAAAAgL8AAACAAAAAAAAAgL8AAACAAAAAAAAAgD8AAACAAAAAAAAAgL8AAACAAAAAAAAAAAAAAIA/AAAAAJiZdj8leIk+AAAAAAAAAAAAAIA/AAAAAJAaWz8xZgQ/AAAAAAAAgD8AAACAAAAAAAAAgL8AAACA","uv":"AADuPjaAsT60uAi/aJABPwAA7j5mcgE/0LQIv8Q//z60uAi/IncUP9C0CL9aZ6w+0LQIvzq2sj7QtAi/1Pq9PgAA7j6+CL8+PDEDv2VyAT8gdeM+wD//Pj0xA782gLE+knzjPmaQAT8gdeM+OLayPpJ84z4gdxQ/IHXjPlhnrD4gdeM+0vq9PjwxA7++CL8+","indices":"CgADAAYACgAGAA0ADQAGAAUADQAFAA8ADAAOAAQADAAEAAEACgAQAAcACgAHAAMAAgAIABEAAgARAAkAAgAJAAsAAgALAAAA"},{"matName":"MI_Brick","texture":"T_Brick_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"AQCAPwAAgD/9/38/AQCAPwAAgD/9/38/AQCAPwAAADP9/38/AQCAPwAAADP9/38/z8xMPwAAADP9/38/z8xMPwAAADP9/38/AACAPwAAgD/JzEy/AACAPwAAgD/JzEy/AACAPwAAgD/JzEy/AACAPzg/3KXJzEy/AACAPzg/3KXJzEy/AACAPzg/3KXJzEy/zZNMP8PAvqXKzEy/zZNMP8PAvqXKzEy/zZNMP8PAvqXKzEy/zZNMP8PAvqXKzEy/z8xMPwAAgD/9/38/z8xMPwAAgD/9/38/zZNMPwAAgD/KzEy/zZNMPwAAgD/KzEy/zZNMPwAAgD/KzEy/zZNMPwAAgD/KzEy/zZNMP9DUEiX8/3+/zZNMP9DUEiX8/3+/zZNMPwAAgD/8/3+/zZNMPwAAgD/8/3+/5ul8P9DUEiX7/3+/5ul8P9DUEiX7/3+/AACAP7ba3iTg6Xy/AACAP7ba3iTg6Xy/AACAPwAAgD/g6Xy/AACAPwAAgD/g6Xy/5ul8PwAAgD/7/3+/5ul8PwAAgD/7/3+/AAAAANDUEiUAAIC/AAAAANDUEiUAAIC/AAAAAAAAgD8AAIC/AAAAAAAAgD8AAIC/AAAAAIL1lKTOzEy/AAAAAIL1lKTOzEy/AAAAAAAAgD/OzEy/AAAAAAAAgD/OzEy/AQCAvwAAgD/9/38/AQCAvwAAgD/9/38/AQCAvwAAADP9/38/AQCAvwAAADP9/38/z8xMvwAAADP9/38/z8xMvwAAADP9/38/AACAvwAAgD/JzEy/AACAvwAAgD/JzEy/AACAvwAAgD/JzEy/AACAvzg/3KXJzEy/AACAvzg/3KXJzEy/AACAvzg/3KXJzEy/zZNMv8PAvqXKzEy/zZNMv8PAvqXKzEy/zZNMv8PAvqXKzEy/zZNMv8PAvqXKzEy/z8xMvwAAgD/9/38/z8xMvwAAgD/9/38/zZNMvwAAgD/KzEy/zZNMvwAAgD/KzEy/zZNMvwAAgD/KzEy/zZNMvwAAgD/KzEy/zZNMv9DUEiX8/3+/zZNMv9DUEiX8/3+/zZNMvwAAgD/8/3+/zZNMvwAAgD/8/3+/5ul8v9DUEiX7/3+/5ul8v9DUEiX7/3+/AACAv7ba3iTg6Xy/AACAv7ba3iTg6Xy/AACAvwAAgD/g6Xy/AACAvwAAgD/g6Xy/5ul8vwAAgD/7/3+/5ul8vwAAgD/7/3+/","norm":"AAAAAAAAgD8AAACAAACAPwAAAAAAAACAAAAAgAAAgL8AAAAAAACAPwAAAAAAAACA/v9/vwAAAABuEgM6AAAAgAAAgL8AAAAAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAACAPwAAAAAAAACAAAAAgAAAgL8AAAAAAAAAgAAAgL8AAAAAAACAPwAAAAAAAACA/v9/vwAAAABuEgM6AAAAgAAAgL8AAAAAAAAAgAAAgL8AAAAAAAAAgAAAAAAAAIA//v9/vwAAAABuEgM6AAAAAAAAgD8AAACA/v9/vwAAAABuEgM6AAAAgAAAAAAAAIA/AAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAgAAAgL8AAACAAAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAgD8AAACAAAAAgAAAgL8AAACA/O/DPgAAAAAug2y/AAAAgAAAgL8AAACALoNsPwAAAAD878O+AAAAAAAAgD8AAACALoNsPwAAAAD878O+AAAAAAAAgD8AAACA/O/DPgAAAAAug2y/AAAAAAAAgL8AAACAAAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAgD8AAACAAAAAAAAAgL8AAACAAAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AAAAAAAAgD8AAACAAACAvwAAAAAAAACAAAAAgAAAgD8AAACAAACAvwAAAAAAAACAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAA/v9/PwAAAABuEgM6AACAvwAAAAAAAACAAAAAgAAAgD8AAACAAAAAgAAAgD8AAACAAACAvwAAAAAAAACAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAAAAAAIA//v9/PwAAAABuEgM6AAAAgAAAgD8AAACA/v9/PwAAAABuEgM6AAAAAAAAAAAAAIA/AAAAgAAAgD8AAACAAAAAgAAAgD8AAACA/v9/PwAAAABuEgM6AAAAAAAAgL8AAACAAAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/AAAAAAAAgD8AAACA/O/DvgAAAAAug2y/AAAAAAAAgL8AAACALoNsvwAAAAD878O+AAAAAAAAgL8AAACALoNsvwAAAAD878O+AAAAAAAAgD8AAACA/O/DvgAAAAAug2y/AAAAAAAAgD8AAACA","uv":"AAAAM+PQZT8AAAAA//8XP86mWj9yz3w/AFCUOK79fz8AAIA/AACAP86mWj9gYWA/AAAAAJDsSj8AAIA/5dBlP7JiZj9X+Bc/a6y6PXLPfD/Oplo/cs98P7BiZj+w/X8/AAAAAP3/fz9rrLo9YGFgP+8IRz9yz3w/7whHP9gImj0AAIA/AQAYPwAAADOQ7Eo/AAAAAP//Fz/vCEc/OkzZPtCwzT2Q7Eo/AACAP5LsSj/vCEc/YGFgP+ZJZj8AAIA/5klmPwEAGD/QsM0949BlP2V5WT9gYWA/8nR+PwAAgD/Oplo/GRhiP11wfj+w/X8/AAAAAOYxZD+6dH4/i/8XP8GGxTvj0GU/83R+PwEAGD8u3cE+YGFgP2vtwD7//38/a+3APgAAGD9LiR8/5NBlPy7dwT5yz3w/Lt3BPuAImj0u3cE+OkzZPkuJHz+R7Eo/AAAAAP//Fz8AAAAz49BlPwBQlDiu/X8/zqZaP3LPfD/Oplo/YGFgPwAAgD8AAIA/smJmP1f4Fz8AAAAAkOxKPwAAgD/l0GU/sGJmP7D9fz9rrLo9cs98P86mWj9yz3w/a6y6PWBhYD/vCEc/cs98P+8IRz/YCJo9AAAAAP3/fz8AAAAzkOxKPwAAgD8BABg/7whHPzpM2T7QsM09kOxKPwAAgD+S7Eo/AAAAAP//Fz/vCEc/YGFgP+ZJZj8AAIA/5klmPwEAGD/QsM0949BlP/J0fj8AAIA/ZXlZP2BhYD9dcH4/sP1/P86mWj8ZGGI/unR+P4v/Fz8AAAAA5jFkP/N0fj8BABg/wYbFO+PQZT8=","indices":"DAAEABAADAAQABIAAwALAAgAAwAIAAEAAgAFAA0AAgANAAkAEQAAAAcAEQAHABUABgAeACAAIAAZABQAIAAUAAYAHAAKAA4ADgAWABoADgAaABwACAALAB0ACAAdAB8AIwAkABgAIwAYABcAHwAdABsAHwAbACEAFwAYACEAFwAhABsAGQAlACkAGQApABQADgAmACIADgAiABYADwATACgADwAoACcAOQA/ADsAOQA7AC8ALAAqADAALAAwADMALQA0ADYALQA2AC4AOgA+ADIAOgAyACsASwBJADEAMQA9AEMAMQBDAEsANwA1AEcARwBFAEAARwBAADcAMABIAEYAMABGADMAIwBBAEIAIwBCACQASABKAEQASABEAEYAQQBEAEoAQQBKAEIAQwA9ACkAQwApACUANwBAACIANwAiACYAOAAnACgAOAAoADwA"}];

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
    vertices: 94,
    triangles: 68,
    create: (name, scene) => createMasterMesh(name, scene),
    createInstance: (name, parent, scene) => createInstance(name, parent, scene)
  };

  global.ThonTranRegistry = global.ThonTranRegistry || {};
  global.ThonTranRegistry[MODEL_NAME] = AssetModule;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetModule;
  }
})(typeof window !== 'undefined' ? window : this);
