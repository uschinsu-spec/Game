/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Floor_WoodDark_OverhangCorner2
 * ============================================================================
 * Category: Sàn Nhà (floors)
 * Dimensions: 0.96m x 0.02m x 1.75m | Vertices: 54 | Faces: 26
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Floor_WoodDark_OverhangCorner2';
  const SUBMESHES = [{"matName":"MI_WoodTrim","texture":"T_WoodTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"AACAvwDXIzwAAIA/AACAvwDXIzwAAEC/AACAvwDXIzwAAAC/AACAvwDXIzwAAAC/AACAvwDXIzwAAIC+AACAvwDXIzwAAIC+AACAvwDXIzwAAACAAACAvwDXIzwAAACAAACAvwDXIzwAAIA+AACAvwDXIzwAAIA+AACAvwDXIzwAAAA/AACAvwDXIzwAAAA/AACAvwDXIzwAAEA/AACAvwDXIzwAAEA/AACAvxTYI7wAAIA/AACAvyfYI7wAAEA/AACAvyfYI7wAAEA/AACAvznYI7wAAAA/AACAvznYI7wAAAA/AACAv0vYI7wAAIA+AACAv0vYI7wAAIA+AACAv17YI7wAAFgnAACAv17YI7wAAFgnAACAv3DYI7wAAIC+AACAv3DYI7wAAIC+AACAv4PYI7wAAAC/AACAv4PYI7wAAAC/AACAv5XYI7wAAEC/oJIxvf3WI7wAAIA+oJIxvf3WI7wAAIA+uKWQvgDXIzwAAACAuKWQvgDXIzwAAACAvKWQvmPXI7ysF3QmvKWQvmPXI7ysF3QmkowFvwDXIzwAAIC+kowFvwDXIzwAAIC+kowFv8nXI7wAAIC+kowFv8nXI7wAAIC+SMZCvwDXIzwAAAC/SMZCvwDXIzwAAAC/SMZCvy/YI7wAAAC/SMZCvy/YI7wAAAC/YJIxvQDXIzwAAEA/YJIxvQDXIzwAAEA/QJIxvdjWI7wAAEA/QJIxvdjWI7wAAEA/wJIxvQDXIzwAAAA/wJIxvQDXIzwAAAA/oJIxverWI7wAAAA/oJIxverWI7wAAAA/QJIxvQDXIzwAAIA/YJIxvcbWI7wAAIA/wJIxvQDXIzwAAIA+wJIxvQDXIzwAAIA+","norm":"AAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAgD8AAACAAAAAAAAAgL8AAAAAAAAAAAAAgD8AAACAAAAAAAAAgD8AAACA","uv":"Xvv/PqKAnz5e+/8+2IbePl77/z7ead0+Xvv/PrsRDj8AQBQ43mndPl77/z6igJ8+AEAUOKKAnz5g+/8+2IbePmD7/z67EQ4/r/1/P95p3T5g+/++uREOP6/9fz+igJ8+YPv/vtSG3j5e+/8+3mndPl/7/76igJ8+X/v/vt5p3T5e+/8+1IbePgBAFDiigJ8+Xvv/PrkRDj9e+/++uREOPwBAFDjead0+Xvv/vtSG3j6v/X8/ooCfPl77/76igJ8+r/1/P95p3T5g+/++uREOP177/77ead0+YPv/vtSG3j5Yj7G8uhEOPwrn9D7ead0+HaMQPtiG3j50rrc+ooCfPhyjEL7Wht4+yCgkP6KAnz6y63Q+3mndPiiKhT6igJ8+KIqFvqKAnz4UxUI/3mndPsLCwj7ead0+wsLCProRDj/EwsK+uhEOP8LCwr7ead0+OI+xvNSG3j4gj7E83mndPhiPsbzead0++I6xPNSG3j6Yj7G8uREOP32MBT+igJ8+WI+xPLkRDj8K5/Q+ooCfPgCPsTyigJ8+OI+xvKKAnz6Yj7E8uhEOP32MBT/ead0+","indices":"AAAyACsAAAArAA0ADAAqAC4ADAAuAAoACwAvADUACwA1AAkACAA0AB4ACAAeAAcABgAfACIABgAiAAQABQAjACYABQAmAAIAAwAnAAEALAAzAA4ALAAOAA8AHQAxABEAHQARABQAJQAhABYAJQAWABgAGwAoABkAMAAtABAAMAAQABIAIAAcABMAIAATABUAKQAkABcAKQAXABoA"}];

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
    dimensions: { x: 0.96, y: 0.02, z: 1.75 },
    vertices: 54,
    triangles: 26,
    create: (name, scene) => createMasterMesh(name, scene),
    createInstance: (name, parent, scene) => createInstance(name, parent, scene)
  };

  global.ThonTranRegistry = global.ThonTranRegistry || {};
  global.ThonTranRegistry[MODEL_NAME] = AssetModule;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetModule;
  }
})(typeof window !== 'undefined' ? window : this);
