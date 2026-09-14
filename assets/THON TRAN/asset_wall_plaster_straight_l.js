/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Wall_Plaster_Straight_L
 * ============================================================================
 * Category: Tường Gạch & Vữa (walls)
 * Dimensions: 2.0m x 3.12m x 0.41m | Vertices: 108 | Faces: 72
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Wall_Plaster_Straight_L';
  const SUBMESHES = [{"matName":"MI_WoodTrim","texture":"T_WoodTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"//9/P0YTYj9kVL09//9/P0YTYj9kVL09AACAP9hKJj9kVL09AACAP9hKJj9kVL09/v9/P0YTYj+tDk28/v9/P0YTYj+tDk28//9/P9hKJj/NDk28//9/P9hKJj/NDk28AQCAvyoTYj+0VL09AQCAvyoTYj+0VL09AACAv7hKJj+sVL09AACAv7hKJj+sVL09AQCAvyoTYj9dDE28AQCAvyoTYj9dDE28AACAv7hKJj99DE28AACAv7hKJj99DE28AACAPxJ5R0CKVL09AACAPxJ5R0CKVL09AACAP/aGOECKVL09AACAP/aGOECKVL09/v9/PxJ5R0CAr7O6/v9/PxJ5R0CAr7O6//9/P/aGOECAsLO6//9/P/aGOECAsLO6AQCAvwp5R0CKVL09AQCAvwp5R0CKVL09AACAv+6GOECKVL09AACAv+6GOECKVL09AQCAvwp5R0AAnbO6AQCAvwp5R0AAnbO6AACAv+6GOEAAnrO6AACAv+6GOEAAnrO6AACAvxJ5R0ATyaC+AACAvxJ5R0ATyaC+AQCAv/aGOEATyaC+AQCAv/aGOEATyaC+//9/vxJ5R0Ckxke+AACAv/aGOECixke+AACAPwp5R0A9yaC+AACAPwp5R0A9yaC+/v9/P+6GOEA7yaC+/v9/P+6GOEA7yaC+AACAPwp5R0D2xke+//9/P+6GOED0xke+s/BZv/WGOECoxke+Iw0jv/WGOECwxke+634+v6YVOUCsxke+5SQBP/CGOEDgxke+WoRhP+6GOEDvxke+634+P9glOEDqxke+s/BZvxF5R0AWyaC+s/BZvxF5R0AWyaC+Iw0jvxF5R0AayaC+Iw0jvxF5R0AayaC+634+v2DqRkAYyaC+634+v2DqRkAYyaC+5SQBPwx5R0AzyaC+5SQBPwx5R0AzyaC+WoRhPwp5R0A7yaC+WoRhPwp5R0A7yaC+634+PyLaR0A4yaC+634+PyLaR0A4yaC+WoRhPwp5R0Dxxke+5SQBPwx5R0Dixke+634+PyLaR0Dsxke+Iw0jvxF5R0Cyxke+s/BZvxF5R0Cqxke+634+v2DqRkCuxke+WIRhP+6GOEA4yaC+WIRhP+6GOEA4yaC+4iQBP/CGOEAyyaC+4iQBP/CGOEAyyaC+6X4+P9glOEA2yaC+6X4+P9glOEA2yaC+JQ0jv/WGOEAayaC+JQ0jv/WGOEAayaC+tfBZv/WGOEAWyaC+tfBZv/WGOEAWyaC+7X4+v6YVOUAYyaC+7X4+v6YVOUAYyaC+Tbh8vx0yOUBR4H89Tbh8vx0yOUBR4H89ddxSvx4yOUA14H+9ddxSvx4yOUA14H+9cNxSvx8yOUBL4H89cNxSvx8yOUBL4H89ULh8vx4yOUAx4H+9ULh8vx4yOUAx4H+9QjqAP6AjYD/04H+9QjqAP6AjYD/04H+9qphWP5sjYD/u4H+9qphWP5sjYD/u4H+9QjqAP5wjYD+O3389QjqAP5wjYD+O3389pJhWP6QjYD+S3389pJhWP6QjYD+S3389","norm":"AAAAAAAAAIAAAIA/AAAAgAAAgD8AAAAAAAAAAAAAgL8AAACAAAAAAAAAAIAAAIA/AAAAgAAAAAAAAIC/AAAAgAAAgD8AAAAAAAAAAAAAgL8AAACAAAAAgAAAAAAAAIC/AAAAAAAAAIAAAIA/AAAAgAAAgD8AAAAAAAAAAAAAgL8AAACAAAAAAAAAAIAAAIA/AAAAgAAAAAAAAIC/AAAAgAAAgD8AAAAAAAAAAAAAgL8AAACAAAAAgAAAAAAAAIC/AAAAAAAAAAAAAIA/AAAAgAAAgD8AAAAAAAAAAAAAgL8AAACAAAAAAAAAAAAAAIA/AAAAgAAAAAAAAIC/AAAAgAAAgD8AAAAAAAAAAAAAgL8AAACAAAAAgAAAAAAAAIC/AAAAAAAAAAAAAIA/AAAAgAAAgD8AAAAAAAAAAAAAgL8AAACAAAAAAAAAAAAAAIA/AAAAgAAAAAAAAIC/AAAAgAAAgD8AAAAAAAAAAAAAgL8AAACAAAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/AAAAAAAAgD8AAACAAAAAgAAAgL8AAAAAAAAAgAAAAAAAAIC/AAAAAAAAgD8AAACAAAAAgAAAgL8AAAAAAAAAgAAAAIAAAIC/AAAAAAAAgD8AAACAAAAAgAAAgL8AAACAAAAAgAAAAIAAAIC/AAAAAAAAgD8AAACAAAAAgAAAgL8AAACAduIlPTzKf78AAACAduIlvTzKf78AAAAAAAAAgAAAgL8AAAAAkypLvPb6f78AAAAA+vCwPLfwf78AAACAV10YPCr9f78AAACAAAAAgAAAAAAAAIC/duIlPTzKfz8AAACAduIlvTzKfz8AAACAAAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/AAAAgAAAgD8AAACAkypLvPb6fz8AAACAAAAAgAAAAIAAAIC/AAAAgAAAAIAAAIC/+vCwPLfwfz8AAACAAAAAgAAAAIAAAIC/V10YPCr9fz8AAACA+vCwPLfwfz8AAACAkypLvPb6fz8AAACAV10YPCr9fz8AAACAduIlvTzKfz8AAACAduIlPTzKfz8AAACAAAAAAAAAgD8AAACAAAAAgAAAAIAAAIC/+vCwPLfwf78AAACAkypLvPb6f78AAAAAAAAAgAAAAIAAAIC/AAAAgAAAAIAAAIC/V10YPCr9f78AAACAduIlvTzKf78AAAAAAAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/duIlPTzKf78AAACAAAAAAAAAgL8AAACAAAAAgAAAAAAAAIC/4do9v8y6K78AAAAAAAAAAAAAAIAAAIA/AAAAgAAAAAAAAIC/4do9P8y6Kz8AAACAAAAAAAAAAIAAAIA/4do9P8y6Kz8AAACA4do9v8y6K78AAAAAAAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/4do9P8y6Kz8AAACA4do9v8y6K78AAAAAAAAAgAAAAAAAAIC/AAAAAAAAAIAAAIA/4do9P8y6Kz8AAACA4do9v8y6K78AAAAAAAAAAAAAAIAAAIA/","uv":"AACAPwAPezsAAAAA6GGdPgAAAADoYZ0+AACAP8An8D0AAIA/wCfwPQAAAADoCYE+AAAAAOgJgT4AAIA/AA97OwAAAAAACns7AACAP+hhnT4AAIA/6GGdPgAAAACoJ/A9AAAAAKgn8D0AAIA/6AmBPgAAgD/oCYE+AAAAAAAKezsAAIA/AA97OwAAAADoYZ0+AAAAAOhhnT4AAIA/wCfwPQAAgD/AJ/A9AAAAAOgJgT4AAAAA6AmBPgAAgD8AD3s7AAAAAAAKezsAAIA/6GGdPgAAgD/oYZ0+AAAAAKgn8D0AAAAAqCfwPQAAgD/oCYE+AACAP+gJgT4AAAAAAAp7OwAAgD8AD3s7AAAAAOhhnT4AAAAA6GGdPgAAgD/AJ/A9AAAAAOgJgT4AAAAA6AmBPgAAAAAACns7AACAP+hhnT4AAIA/6GGdPgAAAACoJ/A9AACAP+gJgT4AAIA/6AmBPjM9mD3oCYE+uuU5PugJgT4qAgM+6AmBPnGSQD/qCYE+LsJwP+gJgT52P18/6AmBPlr4bD8AD3s7Mz2YPehhnT665Tk+6GGdPpGGUT8ADns7dj9fPwAOezsqAgM+6GGdPnGSQD/oYZ0+NLZ9PgAMezsz3XM9AAp7Oy3CcD/oYZ0+KgIDPgAKezt2P18/6GGdPi3CcD/oCYE+cpJAP+gJgT52P18/6AmBPrjlOT7oCYE+MD2YPegJgT4oAgM+6AmBPjndcz24J/A9LcJwP+hhnT5ykkA/6GGdPjq2fT6wJ/A9LAIDPrAn8D12P18/6GGdPrrlOT7oYZ0+koZRP8An8D1a+Gw/wCfwPTQ9mD3oYZ0+KgIDPuhhnT52P18/wCfwPTo7eT9owp0+w5jYPGjCnT5kcoE9asKdPrTRbz90b38+aHKBPXRvfz6z0W8/aMKdPjw7eT90b38+kJjYPHRvfz6ysXk/aMKdPr7JyTx4b38+b317PXRvfz4pSHA/eG9/PrKxeT90b38+tMnJPGjCnT6WfXs9aMKdPidIcD9owp0+","indices":"BAAHAA8ABAAPAAwADgAGAAIADgACAAoABQANAAkABQAJAAEAAwAAAAgAAwAIAAsAFAAXAB8AFAAfABwAHgAWABIAHgASABoAFQAdABkAFQAZABEAEwAQABgAEwAYABsAPgAqACcAPgAnADsAOQBHAEsAOQBLADUARAA6ACYARAAmACkAKwAwAEUAKwBFACgAIwAgADIAIwAyAEwAJABCADMAJAAzACEALAAlACIALAAiAE0APwA4ADQAPwA0AEEAOgBEAEgAOgBIADwAPABIAEcAPABHADkATAAyADYATAA2AE8ATwA2ADUATwA1AEsAPgA7AD0APgA9AEAAQAA9ADgAQAA4AD8AMwBCAEMAMwBDADcANwBDAEEANwBBADQALABNAE4ALABOAC4ALgBOAEoALgBKAC0ARQAwADEARQAxAEkASQAxAC8ASQAvAEYALQBKAEYALQBGAC8AUABWAFoAUABaAF4AXQBZAFMAXQBTAFUAXwBcAFQAXwBUAFEAWABbAFcAWABXAFIA"},{"matName":"MI_Plaster","texture":"T_Plaster_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"AACAvwAAQEDizQw0AACAPwAAQEDizQw0AACAv65HYT8tvTszAACAP65HYT8uvTszAACAvwAAAADTzEy+AACAvwAAQEDHzEy+AACAPwAAAADTzEy+AACAPwAAQEDHzEy+","norm":"AAAAAAAAAIAAAIA/AAAAAAAAAIAAAIA/AAAAgAAAAIAAAIA/AAAAgAAAAIAAAIA/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/","uv":"AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AACAPwAAgD/XOKs4AACgP15hqzgAQKs4AACAPwAAoD8AAIA/AECrOA==","indices":"AgADAAEAAgABAAAABwAGAAQABwAEAAUA"},{"matName":"MI_Brick","texture":"T_Brick_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"AACAvwAAAAAAAACAAACAPwAAAAAAAACAAACAv65HYT8tvTszAACAP65HYT8uvTsz","norm":"AAAAgAAAAIAAAIA/AAAAgAAAAIAAAIA/AAAAgAAAAIAAAIA/AAAAgAAAAIAAAIA/","uv":"AECUOJRXfz9e+38/lVd/PwBglDgAThQ/Xvt/PwBOFD8=","indices":"AAABAAMAAAADAAIA"}];

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
    category: 'walls',
    categoryVi: 'Tường Gạch & Vữa',
    icon: '🧱',
    dimensions: { x: 2.0, y: 3.12, z: 0.41 },
    vertices: 108,
    triangles: 72,
    create: (name, scene) => createMasterMesh(name, scene),
    createInstance: (name, parent, scene) => createInstance(name, parent, scene)
  };

  global.ThonTranRegistry = global.ThonTranRegistry || {};
  global.ThonTranRegistry[MODEL_NAME] = AssetModule;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetModule;
  }
})(typeof window !== 'undefined' ? window : this);
