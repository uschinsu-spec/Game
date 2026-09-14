/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Floor_WoodLight
 * ============================================================================
 * Category: Sàn Nhà (floors)
 * Dimensions: 2.0m x 0.02m x 2.0m | Vertices: 64 | Faces: 32
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Floor_WoodLight';
  const SUBMESHES = [{"matName":"MI_WoodTrim","texture":"T_WoodTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"AACAvwDXIzwAAIA/AACAPwDXIzwAAIA/AACAvwDXIzwAAIC/AACAPwDXIzwAAIC/AACAvwDXIzwAAEC/AACAvwDXIzwAAEC/AACAvwDXIzwAAAC/AACAvwDXIzwAAAC/AACAvwDXIzwAAIC+AACAvwDXIzwAAIC+AACAvwDXIzwAAACAAACAvwDXIzwAAACAAACAvwDXIzwAAIA+AACAvwDXIzwAAIA+AACAvwDXIzwAAAA/AACAvwDXIzwAAAA/AACAvwDXIzwAAEA/AACAvwDXIzwAAEA/AACAPwDXIzwAAEA/AACAPwDXIzwAAEA/AACAPwDXIzwAAAA/AACAPwDXIzwAAAA/AACAPwDXIzwAAIA+AACAPwDXIzwAAIA+AACAPwDXIzwAAACAAACAPwDXIzwAAACAAACAPwDXIzwAAIC+AACAPwDXIzwAAIC+AACAPwDXIzwAAAC/AACAPwDXIzwAAAC/AACAPwDXIzwAAEC/AACAPwDXIzwAAEC/AACAP1nVI7wAAIA/AACAvxTYI7wAAIA/AACAP+zVI7wAAIC/AACAv6fYI7wAAIC/AACAP9nVI7wAAEC/AACAP9nVI7wAAEC/AACAP8fVI7wAAAC/AACAP8fVI7wAAAC/AACAP7XVI7wAAIC+AACAP7XVI7wAAIC+AACAP6LVI7wAAFinAACAP6LVI7wAAFinAACAP5DVI7wAAIA+AACAP5DVI7wAAIA+AACAP33VI7wAAAA/AACAP33VI7wAAAA/AACAP2vVI7wAAEA/AACAP2vVI7wAAEA/AACAvyfYI7wAAEA/AACAvyfYI7wAAEA/AACAvznYI7wAAAA/AACAvznYI7wAAAA/AACAv0vYI7wAAIA+AACAv0vYI7wAAIA+AACAv17YI7wAAFgnAACAv17YI7wAAFgnAACAv3DYI7wAAIC+AACAv3DYI7wAAIC+AACAv4PYI7wAAAC/AACAv4PYI7wAAAC/AACAv5XYI7wAAEC/AACAv5XYI7wAAEC/","norm":"AAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAA","uv":"Xvv/PgA1Tjtf+/++ADVOO1ECAD90fnw+2P6/P3R+fD5e+/8+QEUBPlECAD84RQE+Xvv/PpgW/j1e+/8+fH58PgBAFDiYFv49Xvv/PgA1TjsAQBQ4ADVOO2D7/z5ARQE+YPv/Pnx+fD6v/X8/mBb+PWD7/750fnw+r/1/PwA1Tjtg+/++OEUBPl77/z6YFv49X/v/vpgW/j1e+/8+OEUBPgBAFDgANU47Xvv/PnR+fD5e+/++dH58PgBAFDiYFv49Xvv/vjhFAT6v/X8/ADVOO177/74ANU47r/1/P5gW/j1g+/++dH58Pl77/76YFv49YPv/vjhFAT7Y/r8/OEUBPl77/z4ANU47X/v/vgA1TjtRAgA/dH58Ptj+vz90fnw+Xvv/PkBFAT5RAgA/OEUBPl77/z6YFv49Xvv/Pnx+fD4AQBQ4mBb+PV77/z4ANU47AEAUOAA1Tjtg+/8+QEUBPmD7/z58fnw+r/1/P5gW/j1g+/++dH58Pq/9fz8ANU47YPv/vjhFAT5e+/8+mBb+PV/7/76YFv49Xvv/PjhFAT4AQBQ4ADVOO177/z50fnw+Xvv/vnR+fD4AQBQ4mBb+PV77/744RQE+r/1/PwA1Tjte+/++ADVOO6/9fz+YFv49YPv/vnR+fD5e+/++mBb+PWD7/744RQE+2P6/PzhFAT4=","indices":"BQAfAAMABQADAAIAAAABABIAAAASABEAEAATABUAEAAVAA4ADwAUABcADwAXAA0ADAAWABgADAAYAAsACgAZABsACgAbAAgACQAaAB0ACQAdAAYABwAcAB4ABwAeAAQAJQA/ACMAJQAjACIAIAAhADIAIAAyADEAMAAzADUAMAA1AC4ALwA0ADcALwA3AC0ALAA2ADgALAA4ACsAKgA5ADsAKgA7ACgAKQA6AD0AKQA9ACYAJwA8AD4AJwA+ACQA"}];

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
    dimensions: { x: 2.0, y: 0.02, z: 2.0 },
    vertices: 64,
    triangles: 32,
    create: (name, scene) => createMasterMesh(name, scene),
    createInstance: (name, parent, scene) => createInstance(name, parent, scene)
  };

  global.ThonTranRegistry = global.ThonTranRegistry || {};
  global.ThonTranRegistry[MODEL_NAME] = AssetModule;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetModule;
  }
})(typeof window !== 'undefined' ? window : this);
