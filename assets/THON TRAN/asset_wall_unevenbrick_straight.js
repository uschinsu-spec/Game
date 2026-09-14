/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Wall_UnevenBrick_Straight
 * ============================================================================
 * Category: Tường Gạch & Vữa (walls)
 * Dimensions: 2.0m x 3.12m x 0.41m | Vertices: 76 | Faces: 56
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Wall_UnevenBrick_Straight';
  const SUBMESHES = [{"matName":"MI_WoodTrim","texture":"T_WoodTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"AACAPxJ5R0CKVL09AACAPxJ5R0CKVL09AACAP/aGOECKVL09AACAP/aGOECKVL09/v9/PxJ5R0CAr7O6/v9/PxJ5R0CAr7O6//9/P/aGOECAsLO6//9/P/aGOECAsLO6AQCAvwp5R0CKVL09AQCAvwp5R0CKVL09AACAv+6GOECKVL09AACAv+6GOECKVL09AQCAvwp5R0AAnbO6AQCAvwp5R0AAnbO6AACAv+6GOEAAnrO6AACAv+6GOEAAnrO6AACAvxJ5R0ATyaC+AACAvxJ5R0ATyaC+AQCAv/aGOEATyaC+AQCAv/aGOEATyaC+//9/vxJ5R0Ckxke+AACAv/aGOECixke+AACAPwp5R0A9yaC+AACAPwp5R0A9yaC+/v9/P+6GOEA7yaC+/v9/P+6GOEA7yaC+AACAPwp5R0D2xke+//9/P+6GOED0xke+s/BZv/WGOECoxke+Iw0jv/WGOECwxke+634+v6YVOUCsxke+5SQBP/CGOEDgxke+WoRhP+6GOEDvxke+634+P9glOEDqxke+s/BZvxF5R0AWyaC+s/BZvxF5R0AWyaC+Iw0jvxF5R0AayaC+Iw0jvxF5R0AayaC+634+v2DqRkAYyaC+634+v2DqRkAYyaC+5SQBPwx5R0AzyaC+5SQBPwx5R0AzyaC+WoRhPwp5R0A7yaC+WoRhPwp5R0A7yaC+634+PyLaR0A4yaC+634+PyLaR0A4yaC+WoRhPwp5R0Dxxke+5SQBPwx5R0Dixke+634+PyLaR0Dsxke+Iw0jvxF5R0Cyxke+s/BZvxF5R0Cqxke+634+v2DqRkCuxke+WIRhP+6GOEA4yaC+WIRhP+6GOEA4yaC+4iQBP/CGOEAyyaC+4iQBP/CGOEAyyaC+6X4+P9glOEA2yaC+6X4+P9glOEA2yaC+JQ0jv/WGOEAayaC+JQ0jv/WGOEAayaC+tfBZv/WGOEAWyaC+tfBZv/WGOEAWyaC+7X4+v6YVOUAYyaC+7X4+v6YVOUAYyaC+","norm":"AAAAAAAAAAAAAIA/AAAAgAAAgD8AAAAAAAAAAAAAgL8AAACAAAAAAAAAAAAAAIA/AAAAgAAAAAAAAIC/AAAAgAAAgD8AAAAAAAAAAAAAgL8AAACAAAAAgAAAAAAAAIC/AAAAAAAAAAAAAIA/AAAAgAAAgD8AAAAAAAAAAAAAgL8AAACAAAAAAAAAAAAAAIA/AAAAgAAAAAAAAIC/AAAAgAAAgD8AAAAAAAAAAAAAgL8AAACAAAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/AAAAAAAAgD8AAACAAAAAgAAAgL8AAAAAAAAAgAAAAAAAAIC/AAAAAAAAgD8AAACAAAAAgAAAgL8AAAAAAAAAgAAAAIAAAIC/AAAAAAAAgD8AAACAAAAAgAAAgL8AAACAAAAAgAAAAIAAAIC/AAAAAAAAgD8AAACAAAAAgAAAgL8AAACAduIlPTzKf78AAACAduIlvTzKf78AAAAAAAAAgAAAgL8AAAAAkypLvPb6f78AAAAA+vCwPLfwf78AAACAV10YPCr9f78AAACAAAAAgAAAAAAAAIC/duIlPTzKfz8AAACAduIlvTzKfz8AAACAAAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/AAAAgAAAgD8AAACAkypLvPb6fz8AAACAAAAAgAAAAIAAAIC/AAAAgAAAAIAAAIC/+vCwPLfwfz8AAACAAAAAgAAAAIAAAIC/V10YPCr9fz8AAACA+vCwPLfwfz8AAACAkypLvPb6fz8AAACAV10YPCr9fz8AAACAduIlvTzKfz8AAACAduIlPTzKfz8AAACAAAAAAAAAgD8AAACAAAAAgAAAAIAAAIC/+vCwPLfwf78AAACAkypLvPb6f78AAAAAAAAAgAAAAIAAAIC/AAAAgAAAAIAAAIC/V10YPCr9f78AAACAduIlvTzKf78AAAAAAAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/duIlPTzKf78AAACAAAAAAAAAgL8AAACAAAAAgAAAAAAAAIC/","uv":"AACAPwAPezsAAAAA6GGdPgAAAADoYZ0+AACAP8An8D0AAIA/wCfwPQAAAADoCYE+AAAAAOgJgT4AAIA/AA97OwAAAAAACns7AACAP+hhnT4AAIA/6GGdPgAAAACoJ/A9AAAAAKgn8D0AAIA/6AmBPgAAgD/oCYE+AAAAAAAKezsAAIA/AA97OwAAAADoYZ0+AAAAAOhhnT4AAIA/wCfwPQAAAADoCYE+AAAAAOgJgT4AAAAAAAp7OwAAgD/oYZ0+AACAP+hhnT4AAAAAqCfwPQAAgD/oCYE+AACAP+gJgT4zPZg96AmBPrrlOT7oCYE+KgIDPugJgT5xkkA/6gmBPi7CcD/oCYE+dj9fP+gJgT5a+Gw/AA97OzM9mD3oYZ0+uuU5PuhhnT6RhlE/AA57O3Y/Xz8ADns7KgIDPuhhnT5xkkA/6GGdPjS2fT4ADHs7M91zPQAKezstwnA/6GGdPioCAz4ACns7dj9fP+hhnT4twnA/6AmBPnKSQD/oCYE+dj9fP+gJgT645Tk+6AmBPjA9mD3oCYE+KAIDPugJgT453XM9uCfwPS3CcD/oYZ0+cpJAP+hhnT46tn0+sCfwPSwCAz6wJ/A9dj9fP+hhnT665Tk+6GGdPpKGUT/AJ/A9WvhsP8An8D00PZg96GGdPioCAz7oYZ0+dj9fP8An8D0=","indices":"BAAHAA8ABAAPAAwADgAGAAIADgACAAoABQANAAkABQAJAAEAAwAAAAgAAwAIAAsALgAaABcALgAXACsAKQA3ADsAKQA7ACUANAAqABYANAAWABkAGwAgADUAGwA1ABgAEwAQACIAEwAiADwAFAAyACMAFAAjABEAHAAVABIAHAASAD0ALwAoACQALwAkADEAKgA0ADgAKgA4ACwALAA4ADcALAA3ACkAPAAiACYAPAAmAD8APwAmACUAPwAlADsALgArAC0ALgAtADAAMAAtACgAMAAoAC8AIwAyADMAIwAzACcAJwAzADEAJwAxACQAHAA9AD4AHAA+AB4AHgA+ADoAHgA6AB0ANQAgACEANQAhADkAOQAhAB8AOQAfADYAHQA6ADYAHQA2AB8A"},{"matName":"MI_Plaster","texture":"T_Plaster_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"AACAvwAAAADTzEy+AACAvwAAQEDHzEy+AACAPwAAAADTzEy+AACAPwAAQEDHzEy+","norm":"AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/","uv":"1zirOAAAoD9eYas4AECrOAAAgD8AAKA/AACAPwBAqzg=","indices":"AwACAAAAAwAAAAEA"},{"matName":"MI_UnevenBrick","texture":"T_UnevenBrick_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"AACAvwAAAAAAAACAAACAvwAAQEDizQw0AACAPwAAAAAAAACAAACAPwAAQEDizQw0AACAv65HYT8tvTszAACAv65HYT8tvTszAACAP65HYT8uvTszAACAP65HYT8uvTsz","norm":"AAAAgAAAAIAAAIA/AAAAAAAAAIAAAIA/AAAAgAAAAIAAAIA/AAAAAAAAAIAAAIA/AAAAgAAAAIAAAIA/AAAAgAAAAIAAAIA/AAAAgAAAAIAAAIA/AAAAgAAAAIAAAIA/","uv":"AECUOMortj8AAAAAAAAAAF77fz/KK7Y/AACAPwAAAAAAAAAAgFOAPwBglDiAU4A/Xvt/P4BTgD8AAIA/gFOAPw==","indices":"AAACAAYAAAAGAAUABAAHAAMABAADAAEA"}];

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
    vertices: 76,
    triangles: 56,
    create: (name, scene) => createMasterMesh(name, scene),
    createInstance: (name, parent, scene) => createInstance(name, parent, scene)
  };

  global.ThonTranRegistry = global.ThonTranRegistry || {};
  global.ThonTranRegistry[MODEL_NAME] = AssetModule;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetModule;
  }
})(typeof window !== 'undefined' ? window : this);
