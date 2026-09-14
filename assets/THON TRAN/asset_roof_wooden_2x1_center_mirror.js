/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Roof_Wooden_2x1_Center_Mirror
 * ============================================================================
 * Category: Mái Ngói & Mái Gỗ (roofs)
 * Dimensions: 2.0m x 1.21m x 1.5m | Vertices: 104 | Faces: 52
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Roof_Wooden_2x1_Center_Mirror';
  const SUBMESHES = [{"matName":"MI_WoodTrim","texture":"T_WoodTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"//9/vwSjEb55U2G///9/vwSjEb55U2G///9/v9uH+z15U2G///9/v9uH+z15U2G///9/v6aiEb5ZpJS///9/v6aiEb5ZpJS/AACAPwSjEb57U2G/AACAPwSjEb57U2G///9/v72G+z1fpJS///9/v72G+z1fpJS/AACAP9uH+z15U2G/AACAP9uH+z15U2G/AACAP6aiEb5ZpJS/AACAP6aiEb5ZpJS/AACAP72G+z1fpJS/AACAP72G+z1fpJS/AACAP1ifbD8PY4kzAACAP4gwhj8PY4kzAACAv/AcbT8Aq8KvAACAv5T3hz8Aq8KvmpkZvwEIbT9GLWQympkZvwEIbT9GLWQyzcxMvhLzbD/zN+cyzcxMvhLzbD/zN+cyzMxMPiTebD+gLC4zzMxMPiTebD+gLC4zmZkZP0a0bD92NVgzmZkZP0a0bD92NVgzmpkZv72rhz9GLWQympkZv72rhz9GLWQyzcxMvuZfhz/zN+cyzcxMvuZfhz/zN+cyzMxMPg4Uhz+gLC4zzMxMPg4Uhz+gLC4zmZkZP2B8hj92NVgzmZkZP2B8hj92NVgz","norm":"AAAAgAAAgL8AAACAAAAAAAAAAIAAAIA/AAAAAAAAAIAAAIA/AAAAAAAAgD8AAACAAAAAgAAAgL8AAACAAAAAAAAAAIAAAIC/AAAAgAAAgL8AAACAAAAAAAAAAIAAAIA/AAAAAAAAAIAAAIC/AAAAAAAAgD8AAACAAAAAAAAAAIAAAIA/AAAAAAAAgD8AAACAAAAAgAAAgL8AAACAAAAAAAAAAIAAAIC/AAAAAAAAAIAAAIC/AAAAAAAAgD8AAACAAAAAgAAAAAAAAIA/AAAAgAAAAAAAAIA/AAAAgAAAAAAAAIA/AAAAgAAAAAAAAIA/AAAAgAAAAAAAAIA/AAAAgAAAAAAAAIA/AAAAgAAAAAAAAIA/AAAAgAAAAAAAAIA/AAAAgAAAAAAAAIA/AAAAgAAAAAAAAIA/AAAAgAAAAAAAAIA/AAAAgAAAAAAAAIA/AAAAgAAAAAAAAIA/AAAAgAAAAAAAAIA/AAAAgAAAAAAAAIA/AAAAgAAAAAAAAIA/AAAAgAAAAAAAAIA/AAAAgAAAAAAAAIA/AAAAgAAAAAAAAIA/AAAAgAAAAAAAAIA/","uv":"AAAAANjf7j0AAIA/AKKjOwAAgD/Y3+49AAAAANjf7j0AAAAAAKKjOwAAgD/Y3+49AACAP9jf7j0AAAAAAKKjOwAAgD8AoqM7AAAAAACiozsAAAAA2N/uPQAAgD/Y3+49AACAPwCiozsAAAAA2N/uPQAAAAAAoqM7AACAPwCioztZb649as0fP1dYHD4K0B8/W2+uPbAeST9XWBw+jyFJP5DaDjy6Hkk/W2+uPWrNHz/A2g48as0fP1tvrj3GHkk/kNoOPBIcST9bb649as0fP8DaDjxqzR8/WW+uPeYeST+lHJw9jyFJP1dYHD4+0B8/pRycPTTQHz9XWBw+jyFJP6UcnD2PIUk/V1gcPirQHz+lHJw9vdIfP1dYHD6PIUk/","indices":"BQAIAA4ABQAOAA0ADwAJAAMADwADAAsABAAMAAYABAAGAAAAAgABAAcAAgAHAAoAFQAdABMAFQATABIAEAARACMAEAAjABsAGQAhAB8AGQAfABcAFgAeABwAFgAcABQAGAAaACIAGAAiACAA"},{"matName":"MI_WoodTrim_Wear","texture":"T_WoodTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"AgCAP4D+Xb0zwr+/AgCAP4D+Xb0zwr+/AgCAP4D+Xb0zwr+/AgCAPwDLFL4f37m/AgCAPwDLFL4f37m/AgCAPwDLFL4f37m//v9/v4CxJ7303r+//v9/v4CxJ7303r+//v9/v4CxJ7303r+//v9/vyB5E77c+7m//v9/vyB5E77c+7m//v9/vyB5E77c+7m/AACAP1ifbD8PY4kzAACAP1ifbD8PY4kzAACAP4gwhj8PY4kzAACAP4gwhj8PY4kzAACAv/AcbT8Aq8KvAACAv/AcbT8Aq8KvAACAv5T3hz8Aq8KvAACAv5T3hz8Aq8Kvm5kZP6vxVL3+xr+/m5kZP6vxVL3+xr+/m5kZP6vxVL3+xr+/m5kZP6vxVL3+xr+/0sxMPgDYQr2U0L+/0sxMPgDYQr2U0L+/0sxMPgDYQr2U0L+/0sxMPgDYQr2U0L+/ycxMvivLOb1f1b+/ycxMvivLOb1f1b+/ycxMvivLOb1f1b+/ycxMvivLOb1f1b+/mZkZv1a+ML0q2r+/mZkZv1a+ML0q2r+/mZkZv1a+ML0q2r+/mZkZv1a+ML0q2r+/mZkZv3CxE74S97m/mZkZv3CxE74S97m/mZkZv3CxE74S97m/mZkZv3CxE74S97m/ycxMvsDpE75I8rm/ycxMvsDpE75I8rm/ycxMvsDpE75I8rm/ycxMvsDpE75I8rm/0sxMPhAiFL5+7bm/0sxMPhAiFL5+7bm/0sxMPhAiFL5+7bm/0sxMPhAiFL5+7bm/m5kZP7CSFL7q47m/m5kZP7CSFL7q47m/m5kZP7CSFL7q47m/m5kZP7CSFL7q47m/mpkZvwEIbT9GLWQympkZvwEIbT9GLWQyzcxMvhLzbD/zN+cyzcxMvhLzbD/zN+cyzMxMPiTebD+gLC4zzMxMPiTebD+gLC4zmZkZP0a0bD92NVgzmZkZP0a0bD92NVgzmpkZv72rhz9GLWQympkZv72rhz9GLWQyzcxMvuZfhz/zN+cyzcxMvuZfhz/zN+cyzMxMPg4Uhz+gLC4zzMxMPg4Uhz+gLC4zmZkZP2B8hj92NVgzmZkZP2B8hj92NVgz","norm":"7xGDuv605L4vCmW/wwKaOxsvTj99uxe/AACAPwAAAAAAAACA7xGDuv605L4vCmW/Akcduo4eTr8r0xc/AACAPwAAAAAAAACAAACAvwAAAIAAAACAW+9rupxV0r6JZmm/wwKaOxsvTj99uxe/AACAvwAAAIAAAACAW+9rupxV0r6JZmm/Akcduo4eTr8r0xc/Akcduo4eTr8r0xc/AACAPwAAAAAAAACAwwKaOxsvTj99uxe/AACAPwAAAAAAAACAAACAvwAAAIAAAACAAkcduo4eTr8r0xc/AACAvwAAAIAAAACAwwKaOxsvTj99uxe/fRMDu4vu3r5cdWa/7xGDuv605L4vCmW/wwKaOxsvTj99uxe/E14YPGgtTj89uhe/fRMDu4vu3r5cdWa/RRODunJZ2b7FyWe/wwKaOxsvTj99uxe/E14YPGgtTj89uhe/RRODunJZ2b7FyWe/p+9rujDR1b6pm2i/wwKaOxsvTj99uxe/wwKaOxsvTj99uxe/p+9rujDR1b6pm2i/W+9rupxV0r6JZmm/wwKaOxsvTj99uxe/wwKaOxsvTj99uxe/p+9rujDR1b6pm2i/W+9rupxV0r6JZmm/Akcduo4eTr8r0xc/Akcduo4eTr8r0xc/RRODunJZ2b7FyWe/p+9rujDR1b6pm2i/Akcduo4eTr8r0xc/Akcduo4eTr8r0xc/fRMDu4vu3r5cdWa/OWKquoQeTr8k0xc/RRODunJZ2b7FyWe/Akcduo4eTr8r0xc/fRMDu4vu3r5cdWa/OWKquoQeTr8k0xc/7xGDuv605L4vCmW/Akcduo4eTr8r0xc/Akcduo4eTr8r0xc/Akcduo4eTr8r0xc/Akcduo4eTr8r0xc/Akcduo4eTr8r0xc/OWKquoQeTr8k0xc/Akcduo4eTr8r0xc/OWKquoQeTr8k0xc/Akcduo4eTr8r0xc/wwKaOxsvTj99uxe/wwKaOxsvTj99uxe/wwKaOxsvTj99uxe/wwKaOxsvTj99uxe/wwKaOxsvTj99uxe/E14YPGgtTj89uhe/wwKaOxsvTj99uxe/E14YPGgtTj89uhe/","uv":"v4wfPqyvST8AAAAA8Mh/PgAAAAASeIE+vi2xPT6yST8AAAAA8Mh/PgAAAADsh5w+AAAAAOyHnD6/jB8+FD0fPwAAAAAwKP89AAAAABJ4gT6+LbE97z8fPwAAAAAwKP89AACAP+zIfz67hzU/7IecPgAAgD/syH8+BB87PxZ4gT4GozU/FHiBPgAAgD8gKP89Uzo7P+yHnD4AAIA/ICj/PdpmHD6ir0k/v4wfPhQ9Hz8AAAAAICj/PQAAAD/wyH8+v4wfPhU9Hz+/jB8+ja9JPwAAAADELwI+AAAAPyAo/z2/jB8+FT0fP/tmmz2Dr0k/AAAAAABy/ToAAAA/8Mh/Pvtmmz0VPR8/v4wfPnivST8AAAAA8Mh/PgAAAD8gKP89sLPXO+Y/Hz++LbE9QLJJPwAAAADwyH8+AAAAPyAo/z2+LbE92z8fP7Cz1ztAskk/AAAAAABy/ToAAAA/8Mh/Pr4tsT3QPx8/AAAAPyAo/z2+LbE9QLJJPwAAAADELwI+9OGqPUCyST8AAAA/8Mh/Pr4tsT27Px8/AAAAACAo/z0AAIA/8Mh/PgAAwD8gKP89//9/PwBy/ToAAMA/8Mh/PgAAwD8gKP89//9/P8QvAj4AAMA/7Mh/PgAAgD8gKP89AACAP/DIfz4AAMA/ICj/Pf//fz8Acv06AADAP/DIfz7//38/xC8CPgAAwD8gKP89AACAPyAo/z0AAMA/7Mh/Pg==","indices":"JQAKAAcAJQAHACEAIgAIABMAIgATADwAOwAzAAQAOwAEAAwAEgAGAAkAEgAJABAADQAFAAIADQACAA8AOAAtADEAOAAxADoAEQALACYAEQAmADQANQAnACsANQArADcANgAqAC8ANgAvADkAQQBDABcAQQAXABsAAQAWAEIAAQBCAA4AFAAwACwAFAAsABgAGgAeAD4AGgA+AEAAHwAjAD0AHwA9AD8AAwAyABUAAwAVAAAALgAoABwALgAcABkAKQAkACAAKQAgAB0A"}];

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
