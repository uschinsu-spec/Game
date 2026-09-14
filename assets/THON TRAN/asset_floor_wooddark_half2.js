/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Floor_WoodDark_Half2
 * ============================================================================
 * Category: Sàn Nhà (floors)
 * Dimensions: 1.0m x 0.02m x 2.0m | Vertices: 62 | Faces: 32
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Floor_WoodDark_Half2';
  const SUBMESHES = [{"matName":"MI_WoodTrim","texture":"T_WoodTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"AACAPwDXIzwAAIA/AACAPwDXIzwAAIC/AACAPwDXIzwAAEA/AACAPwDXIzwAAEA/AACAPwDXIzwAAAA/AACAPwDXIzwAAAA/AACAPwDXIzwAAIA+AACAPwDXIzwAAIA+AACAPwDXIzwAAACAAACAPwDXIzwAAACAAACAPwDXIzwAAIC+AACAPwDXIzwAAIC+AACAPwDXIzwAAAC/AACAPwDXIzwAAAC/AACAPwDXIzwAAEC/AACAPwDXIzwAAEC/AACAP1nVI7wAAIA/AACAP+zVI7wAAIC/AACAP9nVI7wAAEC/AACAP9nVI7wAAEC/AACAP8fVI7wAAAC/AACAP8fVI7wAAAC/AACAP7XVI7wAAIC+AACAP7XVI7wAAIC+AACAP6LVI7wAAFinAACAP6LVI7wAAFinAACAP5DVI7wAAIA+AACAP5DVI7wAAIA+AACAP33VI7wAAAA/AACAP33VI7wAAAA/AACAP2vVI7wAAEA/AACAP2vVI7wAAEA/AAAAAADXIzwAAIA/AAAAAADXIzwAAIC/AAAAAADXIzwAAEA/AAAAAADXIzwAAAA/AAAAAADXIzwAAAA/AAAAAADXIzwAAIA+AAAAAADXIzwAAIA+AAAAAADXIzwAAACAAAAAAADXIzwAAACAAAAAAADXIzwAAIC+AAAAAADXIzwAAIC+AAAAAADXIzwAAAC/AAAAAADXIzwAAAC/AAAAAADXIzwAAEC/AAAAAADXIzwAAEC/AAAAALbWI7wAAIA/AAAAAErXI7wAAIC/AAAAAMnWI7wAAEA/AAAAANvWI7wAAAA/AAAAANvWI7wAAAA/AAAAAO7WI7wAAIA+AAAAAO7WI7wAAIA+AAAAAADXI7wAAACAAAAAAADXI7wAAACAAAAAABLXI7wAAIC+AAAAABLXI7wAAIC+AAAAACXXI7wAAAC/AAAAACXXI7wAAAC/AAAAADfXI7wAAEC/AAAAADfXI7wAAEC/","norm":"AAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAA","uv":"X/v/vqKAnz7Y/r8/uREOP1/7/77ead0+Xvv/PtSG3j4AQBQ4ooCfPl77/z65EQ4/Xvv/vrkRDj8AQBQ43mndPl77/77Uht4+r/1/P6KAnz5e+/++ooCfPq/9fz/ead0+YPv/vrkRDj9e+/++3mndPmD7/77Uht4+2P6/P9SG3j5e+/8+ooCfPlECAD+5EQ4/Xvv/PtiG3j5RAgA/1IbePl77/z7ead0+Xvv/PrsRDj8AQBQ43mndPl77/z6igJ8+AEAUOKKAnz5g+/8+2IbePmD7/z67EQ4/r/1/P95p3T5g+/++uREOP6/9fz+igJ8+YPv/vtSG3j5e+/8+3mndPgAAgLKigJ8+AACAP7kRDj8AAMCyWPjdPgAAALO5EQ4/AAAAP6KAnz4AAAAzuhEOPwAAAD/ead0+AAAAM9aG3j4AAAA/ooCfPgAAAACigJ8+AAAAP95p3T4AAACzuhEOPwAAAADead0+AAAAs9aG3j4AAIA/1IbePgAAgLKigJ8+AACAP7kRDj8AAMCyWPjdPgAAALO5EQ4/AAAAP6KAnz4AAAAzuhEOPwAAAD/ead0+AAAAM9aG3j4AAAA/ooCfPgAAAACigJ8+AAAAP95p3T4AAACzuhEOPwAAAADead0+AAAAs9aG3j4AAIA/1IbePg==","indices":"LgAPAAEALgABACEAIAAAAAIAIAACACIAIgADAAUAIgAFACMAJAAEAAcAJAAHACYAJQAGAAgAJQAIACcAKAAJAAsAKAALACoAKQAKAA0AKQANACwAKwAMAA4AKwAOAC0AFQA6ADwAFQA8ABIAFwA4ADsAFwA7ABQAGAA3ADkAGAA5ABYAGgA0ADYAGgA2ABkAHQAzADUAHQA1ABsAHgAxADIAHgAyABwAEAAvADEAEAAxAB8AEwA9ADAAEwAwABEA"}];

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
    dimensions: { x: 1.0, y: 0.02, z: 2.0 },
    vertices: 62,
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
