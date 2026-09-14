/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Roof_Wooden_2x1_Center
 * ============================================================================
 * Category: Mái Ngói & Mái Gỗ (roofs)
 * Dimensions: 2.0m x 1.21m x 1.5m | Vertices: 104 | Faces: 52
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Roof_Wooden_2x1_Center';
  const SUBMESHES = [{"matName":"MI_WoodTrim","texture":"T_WoodTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"//9/vwSjEb55U2E///9/vwSjEb55U2E///9/v9uH+z15U2E///9/v9uH+z15U2E///9/v6aiEb5ZpJQ///9/v6aiEb5ZpJQ/AACAPwSjEb57U2E/AACAPwSjEb57U2E///9/v72G+z1fpJQ///9/v72G+z1fpJQ/AACAP9uH+z15U2E/AACAP9uH+z15U2E/AACAP6aiEb5ZpJQ/AACAP6aiEb5ZpJQ/AACAP72G+z1fpJQ/AACAP72G+z1fpJQ/AACAP1ifbD8PY4mzAACAP4gwhj8PY4mzAACAv/AcbT8Aq8IvAACAv5T3hz8Aq8IvmpkZvwEIbT9GLWSympkZvwEIbT9GLWSyzcxMvhLzbD/zN+eyzcxMvhLzbD/zN+eyzMxMPiTebD+gLC6zzMxMPiTebD+gLC6zmZkZP0a0bD92NVizmZkZP0a0bD92NVizmpkZv72rhz9GLWSympkZv72rhz9GLWSyzcxMvuZfhz/zN+eyzcxMvuZfhz/zN+eyzMxMPg4Uhz+gLC6zzMxMPg4Uhz+gLC6zmZkZP2B8hj92NVizmZkZP2B8hj92NViz","norm":"AAAAgAAAgL8AAAAAAAAAAAAAAIAAAIC/AAAAAAAAAIAAAIC/AAAAAAAAgD8AAAAAAAAAgAAAgL8AAAAAAAAAAAAAAIAAAIA/AAAAgAAAgL8AAAAAAAAAAAAAAIAAAIC/AAAAAAAAAIAAAIA/AAAAAAAAgD8AAAAAAAAAAAAAAIAAAIC/AAAAAAAAgD8AAAAAAAAAgAAAgL8AAAAAAAAAAAAAAIAAAIA/AAAAAAAAAIAAAIA/AAAAAAAAgD8AAAAAAAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/","uv":"AAAAANjf7j0AAIA/AKKjOwAAgD/Y3+49AAAAANjf7j0AAAAAAKKjOwAAgD/Y3+49AACAP9jf7j0AAAAAAKKjOwAAgD8AoqM7AAAAAACiozsAAAAA2N/uPQAAgD/Y3+49AACAPwCiozsAAAAA2N/uPQAAAAAAoqM7AACAPwCioztZb649as0fP1dYHD4K0B8/W2+uPbAeST9XWBw+jyFJP5DaDjy6Hkk/W2+uPWrNHz/A2g48as0fP1tvrj3GHkk/kNoOPBIcST9bb649as0fP8DaDjxqzR8/WW+uPeYeST+lHJw9jyFJP1dYHD4+0B8/pRycPTTQHz9XWBw+jyFJP6UcnD2PIUk/V1gcPirQHz+lHJw9vdIfP1dYHD6PIUk/","indices":"BQANAA4ABQAOAAgADwALAAMADwADAAkABAAAAAYABAAGAAwAAgAKAAcAAgAHAAEAFQASABMAFQATAB0AEAAbACMAEAAjABEAGQAXAB8AGQAfACEAFgAUABwAFgAcAB4AGAAgACIAGAAiABoA"},{"matName":"MI_WoodTrim_Wear","texture":"T_WoodTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"AgCAP4D+Xb0zwr8/AgCAP4D+Xb0zwr8/AgCAP4D+Xb0zwr8/AgCAPwDLFL4f37k/AgCAPwDLFL4f37k/AgCAPwDLFL4f37k//v9/v4CxJ7303r8//v9/v4CxJ7303r8//v9/v4CxJ7303r8//v9/vyB5E77c+7k//v9/vyB5E77c+7k//v9/vyB5E77c+7k/AACAP1ifbD8PY4mzAACAP1ifbD8PY4mzAACAP4gwhj8PY4mzAACAP4gwhj8PY4mzAACAv/AcbT8Aq8IvAACAv/AcbT8Aq8IvAACAv5T3hz8Aq8IvAACAv5T3hz8Aq8Ivm5kZP6vxVL3+xr8/m5kZP6vxVL3+xr8/m5kZP6vxVL3+xr8/m5kZP6vxVL3+xr8/0sxMPgDYQr2U0L8/0sxMPgDYQr2U0L8/0sxMPgDYQr2U0L8/0sxMPgDYQr2U0L8/ycxMvivLOb1f1b8/ycxMvivLOb1f1b8/ycxMvivLOb1f1b8/ycxMvivLOb1f1b8/mZkZv1a+ML0q2r8/mZkZv1a+ML0q2r8/mZkZv1a+ML0q2r8/mZkZv1a+ML0q2r8/mZkZv3CxE74S97k/mZkZv3CxE74S97k/mZkZv3CxE74S97k/mZkZv3CxE74S97k/ycxMvsDpE75I8rk/ycxMvsDpE75I8rk/ycxMvsDpE75I8rk/ycxMvsDpE75I8rk/0sxMPhAiFL5+7bk/0sxMPhAiFL5+7bk/0sxMPhAiFL5+7bk/0sxMPhAiFL5+7bk/m5kZP7CSFL7q47k/m5kZP7CSFL7q47k/m5kZP7CSFL7q47k/m5kZP7CSFL7q47k/mpkZvwEIbT9GLWSympkZvwEIbT9GLWSyzcxMvhLzbD/zN+eyzcxMvhLzbD/zN+eyzMxMPiTebD+gLC6zzMxMPiTebD+gLC6zmZkZP0a0bD92NVizmZkZP0a0bD92NVizmpkZv72rhz9GLWSympkZv72rhz9GLWSyzcxMvuZfhz/zN+eyzcxMvuZfhz/zN+eyzMxMPg4Uhz+gLC6zzMxMPg4Uhz+gLC6zmZkZP2B8hj92NVizmZkZP2B8hj92NViz","norm":"7xGDuv605L4vCmU/wwKaOxsvTj99uxc/AACAPwAAAAAAAACA7xGDuv605L4vCmU/Akcduo4eTr8r0xe/AACAPwAAAAAAAACAAACAvwAAAIAAAAAAW+9rupxV0r6JZmk/wwKaOxsvTj99uxc/AACAvwAAAIAAAAAAW+9rupxV0r6JZmk/Akcduo4eTr8r0xe/Akcduo4eTr8r0xe/AACAPwAAAAAAAACAwwKaOxsvTj99uxc/AACAPwAAAAAAAACAAACAvwAAAIAAAAAAAkcduo4eTr8r0xe/AACAvwAAAIAAAAAAwwKaOxsvTj99uxc/fRMDu4vu3r5cdWY/7xGDuv605L4vCmU/wwKaOxsvTj99uxc/E14YPGgtTj89uhc/fRMDu4vu3r5cdWY/RRODunJZ2b7FyWc/wwKaOxsvTj99uxc/E14YPGgtTj89uhc/RRODunJZ2b7FyWc/p+9rujDR1b6pm2g/wwKaOxsvTj99uxc/wwKaOxsvTj99uxc/p+9rujDR1b6pm2g/W+9rupxV0r6JZmk/wwKaOxsvTj99uxc/wwKaOxsvTj99uxc/p+9rujDR1b6pm2g/W+9rupxV0r6JZmk/Akcduo4eTr8r0xe/Akcduo4eTr8r0xe/RRODunJZ2b7FyWc/p+9rujDR1b6pm2g/Akcduo4eTr8r0xe/Akcduo4eTr8r0xe/fRMDu4vu3r5cdWY/OWKquoQeTr8k0xe/RRODunJZ2b7FyWc/Akcduo4eTr8r0xe/fRMDu4vu3r5cdWY/OWKquoQeTr8k0xe/7xGDuv605L4vCmU/Akcduo4eTr8r0xe/Akcduo4eTr8r0xe/Akcduo4eTr8r0xe/Akcduo4eTr8r0xe/Akcduo4eTr8r0xe/OWKquoQeTr8k0xe/Akcduo4eTr8r0xe/OWKquoQeTr8k0xe/Akcduo4eTr8r0xe/wwKaOxsvTj99uxc/wwKaOxsvTj99uxc/wwKaOxsvTj99uxc/wwKaOxsvTj99uxc/wwKaOxsvTj99uxc/E14YPGgtTj89uhc/wwKaOxsvTj99uxc/E14YPGgtTj89uhc/","uv":"v4wfPqyvST8AAAAA8Mh/PgAAAAASeIE+vi2xPT6yST8AAAAA8Mh/PgAAAADsh5w+AAAAAOyHnD6/jB8+FD0fPwAAAAAwKP89AAAAABJ4gT6+LbE97z8fPwAAAAAwKP89AACAP+zIfz67hzU/7IecPgAAgD/syH8+BB87PxZ4gT4GozU/FHiBPgAAgD8gKP89Uzo7P+yHnD4AAIA/ICj/PdpmHD6ir0k/v4wfPhQ9Hz8AAAAAICj/PQAAAD/wyH8+v4wfPhU9Hz+/jB8+ja9JPwAAAADELwI+AAAAPyAo/z2/jB8+FT0fP/tmmz2Dr0k/AAAAAABy/ToAAAA/8Mh/Pvtmmz0VPR8/v4wfPnivST8AAAAA8Mh/PgAAAD8gKP89sLPXO+Y/Hz++LbE9QLJJPwAAAADwyH8+AAAAPyAo/z2+LbE92z8fP7Cz1ztAskk/AAAAAABy/ToAAAA/8Mh/Pr4tsT3QPx8/AAAAPyAo/z2+LbE9QLJJPwAAAADELwI+9OGqPUCyST8AAAA/8Mh/Pr4tsT27Px8/AAAAACAo/z0AAIA/8Mh/PgAAwD8gKP89//9/PwBy/ToAAMA/8Mh/PgAAwD8gKP89//9/P8QvAj4AAMA/7Mh/PgAAgD8gKP89AACAP/DIfz4AAMA/ICj/Pf//fz8Acv06AADAP/DIfz7//38/xC8CPgAAwD8gKP89AACAPyAo/z0AAMA/7Mh/Pg==","indices":"JQAhAAcAJQAHAAoAIgA8ABMAIgATAAgAOwAMAAQAOwAEADMAEgAQAAkAEgAJAAYADQAPAAIADQACAAUAOAA6ADEAOAAxAC0AEQA0ACYAEQAmAAsANQA3ACsANQArACcANgA5AC8ANgAvACoAQQAbABcAQQAXAEMAAQAOAEIAAQBCABYAFAAYACwAFAAsADAAGgBAAD4AGgA+AB4AHwA/AD0AHwA9ACMAAwAAABUAAwAVADIALgAZABwALgAcACgAKQAdACAAKQAgACQA"}];

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
    category: 'roofs',
    categoryVi: 'Mái Ngói & Mái Gỗ',
    icon: '🏠',
    dimensions: { x: 2.0, y: 1.21, z: 1.5 },
    vertices: 104,
    triangles: 52,
    create: (name, scene) => createMasterMesh(name, scene),
    createInstance: (name, parent, scene) => createInstance(name, parent, scene)
  };

  global.ThonTranRegistry = global.ThonTranRegistry || {};
  global.ThonTranRegistry[MODEL_NAME] = AssetModule;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetModule;
  }
})(typeof window !== 'undefined' ? window : this);
