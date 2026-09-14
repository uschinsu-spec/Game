/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Roof_Wooden_2x1_Middle
 * ============================================================================
 * Category: Mái Ngói & Mái Gỗ (roofs)
 * Dimensions: 2.0m x 0.14m x 2.0m | Vertices: 48 | Faces: 24
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Roof_Wooden_2x1_Middle';
  const SUBMESHES = [{"matName":"MI_WoodTrim_Wear","texture":"T_WoodTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"AACAP1ifbD///3+/AACAP1ifbD///3+/AACAP4gwhj///3+/AACAP4gwhj///3+///9/v/AcbT8AAIC///9/v/AcbT8AAIC///9/v5T3hz8AAIC///9/v5T3hz8AAIC/mZkZvwEIbT8AAIC/mZkZvwEIbT8AAIC/ysxMvhLzbD8AAIC/ysxMvhLzbD8AAIC/z8xMPiTebD///3+/z8xMPiTebD///3+/mpkZP0a0bD///3+/mpkZP0a0bD///3+/mZkZv72rhz8AAIC/mZkZv72rhz8AAIC/ysxMvuZfhz8AAIC/ysxMvuZfhz8AAIC/z8xMPg4Uhz///3+/z8xMPg4Uhz///3+/mpkZP2B8hj///3+/mpkZP2B8hj///3+/AACAP1ifbD///38/AACAP1ifbD///38/AACAP4gwhj///38/AACAP4gwhj///38///9/v/AcbT8AAIA///9/v/AcbT8AAIA///9/v5T3hz8AAIA///9/v5T3hz8AAIA/mZkZvwEIbT8AAIA/mZkZvwEIbT8AAIA/ysxMvhLzbD8AAIA/ysxMvhLzbD8AAIA/z8xMPiTebD///38/z8xMPiTebD///38/mpkZP0a0bD///38/mpkZP0a0bD///38/mZkZv72rhz8AAIA/mZkZv72rhz8AAIA/ysxMvuZfhz8AAIA/ysxMvuZfhz8AAIA/z8xMPg4Uhz///38/z8xMPg4Uhz///38/mpkZP2B8hj///38/mpkZP2B8hj///38/","norm":"FLdRuvz/f78AAACAAACAPwAAAAAAAACAHA2+O+b+fz8AAACAAACAPwAAAAAAAACAAACAvwAAAAAAAACAFLdRuvz/f78AAACAAACAvwAAAAAAAACAHA2+O+b+fz8AAACAFLdRuvz/f78AAACAFLdRuvz/f78AAACAFLdRuvz/f78AAACAFLdRuvz/f78AAACAB7fRuuz/f78AAACAFLdRuvz/f78AAACAB7fRuuz/f78AAACAFLdRuvz/f78AAACAHA2+O+b+fz8AAACAHA2+O+b+fz8AAACAHA2+O+b+fz8AAACAHA2+O+b+fz8AAACAHA2+O+b+fz8AAACAhQ8+PJf7fz8AAACAHA2+O+b+fz8AAACAhQ8+PJf7fz8AAACAFLdRuvz/f78AAACAAACAPwAAAAAAAACAHA2+O+b+fz8AAACAAACAPwAAAAAAAACAAACAvwAAAAAAAACAFLdRuvz/f78AAACAAACAvwAAAAAAAACAHA2+O+b+fz8AAACAFLdRuvz/f78AAACAFLdRuvz/f78AAACAFLdRuvz/f78AAACAFLdRuvz/f78AAACAB7fRuuz/f78AAACAFLdRuvz/f78AAACAB7fRuuz/f78AAACAFLdRuvz/f78AAACAHA2+O+b+fz8AAACAHA2+O+b+fz8AAACAHA2+O+b+fz8AAACAHA2+O+b+fz8AAACAHA2+O+b+fz8AAACAhQ8+PJf7fz8AAACAHA2+O+b+fz8AAACAhQ8+PJf7fz8AAACA","uv":"AACAP+zIfz67hzU/7IecPgAAAADsyH8+BB87PxZ4gT4GozU/FHiBPgAAgD8gKP89Uzo7P+yHnD4AAIA/ICj/PQAAgD/wyH8+AADAPyAo/z3//38/AHL9OgAAwD/wyH8+AADAPyAo/z3//38/xC8CPgAAwD/syH8+AACAPyAo/z0AAIA/8Mh/PgAAwD8gKP89//9/PwBy/ToAAMA/8Mh/Pv//fz/ELwI+AADAPyAo/z0AAAAAICj/PQAAwD/syH8+AAAAAOzIfz6K8JS+7IecPgAAgD/syH8++MGJvhZ4gT70uZS+FHiBPgAAAAAgKP89WouJvuyHnD4AAAAAICj/PQAAAADwyH8+AAAAPyAo/z0AAICzAHL9OgAAAD/wyH8+AAAAPyAo/z0AAICzxC8CPgAAAD/syH8+AAAAACAo/z0AAAAA8Mh/PgAAAD8gKP89AACAswBy/ToAAAA/8Mh/PgAAgLPELwI+AAAAPyAo/z0AAIA/ICj/PQAAAD/syH8+","indices":"HwAoABAAHwAQAAcAHAAeAAYAHAAGAAQAIAAdAAUAIAAFAAgAIwAhAAkAIwAJAAsAJQAiAAoAJQAKAA0AJgAkAAwAJgAMAA4ALgAaAAIALgACABYALQAvABcALQAXABUAKgAsABQAKgAUABIAKQArABMAKQATABEAGwAZAAEAGwABAAMAGAAnAA8AGAAPAAAA"}];

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
    dimensions: { x: 2.0, y: 0.14, z: 2.0 },
    vertices: 48,
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
