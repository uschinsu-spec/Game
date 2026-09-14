/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Floor_WoodLight_OverhangCorner
 * ============================================================================
 * Category: Sàn Nhà (floors)
 * Dimensions: 1.0m x 0.02m x 1.76m | Vertices: 32 | Faces: 16
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Floor_WoodLight_OverhangCorner';
  const SUBMESHES = [{"matName":"MI_WoodTrim","texture":"T_WoodTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"AACAvwDXIzz//38/AQBAvwDXIzz//38/AQBAvwDXIzz//38/AQAAvwDXIzwAAIA/AQAAvwDXIzwAAIA/AQCAvgDXIzwAAIA/AQCAvgDXIzwAAIA/Lr07swDXIzwAAIA/AACAv1nVI7z//38/Lb07s6LVI7wAAIA/AQCAvpDVI7wAAIA/AQCAvpDVI7wAAIA/AQAAv33VI7wAAIA/AQAAv33VI7wAAIA/AQBAv2vVI7z//38/AQBAv2vVI7z//38///9/vwDXIzxZp0G/AACAvuPWI7x6Qe08AACAvuPWI7x6Qe0801pasgDXIzyw35Q+AABAvwDXIzwdQ/2+AABAvwDXIzwdQ/2+AAAAvyzXI7z5bm6+AAAAvyzXI7z5bm6+AACAvgDXIzz6Qe08AACAvgDXIzz6Qe08//9/v7/XI7xXp0G/AAAAvwDXIzwBb26+AAAAvwDXIzwBb26+xlpasprWI7yo35Q+AABAv3bXI7whQ/2+AABAv3bXI7whQ/2+","norm":"AAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAgAAAgL8AAAAAAAAAgAAAgL8AAAAAAAAAgAAAgL8AAAAAAAAAgAAAgL8AAAAAAAAAgAAAgL8AAAAAAAAAgAAAgL8AAAAAAAAAgAAAgL8AAAAAAAAAgAAAgL8AAAAAAAAAAAAAgD8AAACAAAAAgAAAgL8AAAAAAAAAgAAAgL8AAAAAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAgAAAgL8AAAAAAAAAgAAAgL8AAAAAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAgAAAgL8AAAAAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAgAAAgL8AAAAAAAAAgAAAgL8AAAAAAAAAgAAAgL8AAAAA","uv":"X/v/vgA1Tjtf+/++mBb+PV77/z44RQE+AEAUOAA1Tjte+/8+dH58Pl77/750fnw+AEAUOJgW/j1e+/++OEUBPl77/z4ANU47YPv/PkBFAT5g+/8+fH58Pq/9fz+YFv49YPv/vnR+fD6v/X8/ADVOO2D7/744RQE+Xvv/PpgW/j3Wo8E+ADVOO2A9bTx4fnw+9bQDP5gW/j3+3BS+PEUBPok+fb44RQE+hz59PpgW/j2kau49dH58PlZlxD4ANE47oD1tvHh+fD4Slvg+mBb+PdWjwb4ANU47tGruvXR+fD5VzR0/ADROO/ncFD5ARQE+iz59vpgW/j2KPn0+OEUBPg==","indices":"CAAaAB4ACAAeAA8ADgAfABYADgAWAAwADQAXABIADQASAAsACgARAB0ACgAdAAkAGwAUAAIAGwACAAQAGQAcAAMAGQADAAYAEwAYAAUAEwAFAAcAFQAQAAAAFQAAAAEA"}];

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
    category: 'floors',
    categoryVi: 'Sàn Nhà',
    icon: '🪵',
    dimensions: { x: 1.0, y: 0.02, z: 1.76 },
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
