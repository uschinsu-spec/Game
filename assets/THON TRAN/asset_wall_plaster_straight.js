/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Wall_Plaster_Straight
 * ============================================================================
 * Category: Tường Gạch & Vữa (walls)
 * Dimensions: 2.0m x 3.12m x 0.41m | Vertices: 134 | Faces: 86
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Wall_Plaster_Straight';
  const SUBMESHES = [{"matName":"MI_WoodTrim","texture":"T_WoodTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"QdBxv1XrPj8DLLA9QdBxv1XrPj8DLLA9QdBxv1XrPj9uS568AACAv11ICz+ZS568/v9/v+edND8DLLA9AACAv1xICz8DLLA9AACAv1xICz8DLLA9QdBxP1XrPj8DLLA9QdBxP1XrPj8DLLA9QdBxP1XrPj+BzjW9AACAP11ICz+WzjW9/v9/P+edND8DLLA9AACAP1xICz8DLLA9AACAP1xICz8DLLA9//9/P0YTYj9kVL09//9/P0YTYj9kVL09AACAP9hKJj9kVL09AACAP9hKJj9kVL09/v9/P0YTYj+tDk28/v9/P0YTYj+tDk28//9/P9hKJj/NDk28//9/P9hKJj/NDk28AQCAvyoTYj+0VL09AQCAvyoTYj+0VL09AACAv7hKJj+sVL09AACAv7hKJj+sVL09AQCAvyoTYj9dDE28AQCAvyoTYj9dDE28AACAv7hKJj99DE28AACAv7hKJj99DE28AO1qvQAAQECmC3I9AO1qvQAAQECmC3I9QOxqPQAAQECiC3I9QOxqPQAAQECiC3I9AO1qvQAAQECiC3K9AO1qvQAAQECiC3K9QOxqPQAAQECmC3K9QOxqPQAAQECmC3K9gOxqvYI9UD+mC3I9gOxqvYI9UD+mC3I9wOxqPYI9UD+iC3I9wOxqPYI9UD+iC3I9gOxqvYI9UD+iC3K9gOxqvYI9UD+iC3K9wOxqPYI9UD+mC3K9wOxqPYI9UD+mC3K9AACAPxJ5R0CKVL09AACAPxJ5R0CKVL09AACAP/aGOECKVL09AACAP/aGOECKVL09/v9/PxJ5R0CAr7O6/v9/PxJ5R0CAr7O6//9/P/aGOECAsLO6//9/P/aGOECAsLO6AQCAvwp5R0CKVL09AQCAvwp5R0CKVL09AACAv+6GOECKVL09AACAv+6GOECKVL09AQCAvwp5R0AAnbO6AQCAvwp5R0AAnbO6AACAv+6GOEAAnrO6AACAv+6GOEAAnrO68EhEvgBZCbuNaq898EhEvgBZCbuNaq899M4kvghZCbt+9Ho99M4kvghZCbt+9Ho9+s4kPgBaCbuTaK89+s4kPgBaCbuTaK8950hEPhhZCbv8zjW95EhEvphZCbtkTJ68DM8kvgBbCbsIzzW9DM8kPgBbCbt8TJ688EhEPgBZCbsm93s98EhEPgBZCbsm93s9AACAvxJ5R0ATyaC+AACAvxJ5R0ATyaC+AQCAv/aGOEATyaC+AQCAv/aGOEATyaC+//9/vxJ5R0Ckxke+AACAv/aGOECixke+AACAPwp5R0A9yaC+AACAPwp5R0A9yaC+/v9/P+6GOEA7yaC+/v9/P+6GOEA7yaC+AACAPwp5R0D2xke+//9/P+6GOED0xke+s/BZv/WGOECoxke+Iw0jv/WGOECwxke+634+v6YVOUCsxke+5SQBP/CGOEDgxke+WoRhP+6GOEDvxke+634+P9glOEDqxke+s/BZvxF5R0AWyaC+s/BZvxF5R0AWyaC+Iw0jvxF5R0AayaC+Iw0jvxF5R0AayaC+634+v2DqRkAYyaC+634+v2DqRkAYyaC+5SQBPwx5R0AzyaC+5SQBPwx5R0AzyaC+WoRhPwp5R0A7yaC+WoRhPwp5R0A7yaC+634+PyLaR0A4yaC+634+PyLaR0A4yaC+WoRhPwp5R0Dxxke+5SQBPwx5R0Dixke+634+PyLaR0Dsxke+Iw0jvxF5R0Cyxke+s/BZvxF5R0Cqxke+634+v2DqRkCuxke+WIRhP+6GOEA4yaC+WIRhP+6GOEA4yaC+4iQBP/CGOEAyyaC+4iQBP/CGOEAyyaC+6X4+P9glOEA2yaC+6X4+P9glOEA2yaC+JQ0jv/WGOEAayaC+JQ0jv/WGOEAayaC+tfBZv/WGOEAWyaC+tfBZv/WGOEAWyaC+7X4+v6YVOUAYyaC+7X4+v6YVOUAYyaC+","norm":"F7dROVJJnbkAAIA/gm8PPwILVD8AAAAAgm8PPwILVD8AAAAAZlQPv1gdVL8AAACAF7dROVJJnbkAAIA/ZlQPv1gdVL8AAACAF7dROVJJnbkAAIA/gm8PvwILVD8AAAAAHzo0vKfarLxy7X8/gm8PvwILVD8AAAAAZlQPP1gdVL8AAACAHzo0vKfarLxy7X8/Hzo0vKfarLxy7X8/ZlQPP1gdVL8AAACAAAAAAAAAAIAAAIA/AAAAgAAAgD8AAAAAAAAAAAAAgL8AAACAAAAAAAAAAIAAAIA/AAAAgAAAAAAAAIC/AAAAgAAAgD8AAAAAAAAAAAAAgL8AAACAAAAAgAAAAAAAAIC/AAAAAAAAAIAAAIA/AAAAgAAAgD8AAAAAAAAAAAAAgL8AAACAAAAAAAAAAIAAAIA/AAAAgAAAAAAAAIC/AAAAgAAAgD8AAAAAAAAAAAAAgL8AAACAAAAAgAAAAAAAAIC/AACAvwAAAIAAAACAAAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AACAPwAAAAAAAACAAACAvwAAAIAAAACAAAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/AACAPwAAAAAAAACAAACAvwAAAIAAAACAAAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AACAPwAAAAAAAACAAACAvwAAAIAAAACAAAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/AACAPwAAAAAAAACAAAAAAAAAAAAAAIA/AAAAgAAAgD8AAAAAAAAAAAAAgL8AAACAAAAAAAAAAAAAAIA/AAAAgAAAAAAAAIC/AAAAgAAAgD8AAAAAAAAAAAAAgL8AAACAAAAAgAAAAAAAAIC/AAAAAAAAAAAAAIA/AAAAgAAAgD8AAAAAAAAAAAAAgL8AAACAAAAAAAAAAAAAAIA/AAAAgAAAAAAAAIC/AAAAgAAAgD8AAAAAAAAAAAAAgL8AAACAAAAAgAAAAAAAAIC/ZlQPv1gdVL8AAACAF7dROVJJnbkAAIA/gm8PvwILVD8AAAAAHzo0vKfarLxy7X8/F7dROVJJnbkAAIA/gm8PPwILVD8AAAAAZlQPP1gdVL8AAACAZlQPv1gdVL8AAACAgm8PvwILVD8AAAAAgm8PPwILVD8AAAAAHzo0vKfarLxy7X8/ZlQPP1gdVL8AAACAAAAAgAAAAAAAAIC/AAAAAAAAgD8AAACAAAAAgAAAgL8AAAAAAAAAgAAAAAAAAIC/AAAAAAAAgD8AAACAAAAAgAAAgL8AAAAAAAAAgAAAAIAAAIC/AAAAAAAAgD8AAACAAAAAgAAAgL8AAACAAAAAgAAAAIAAAIC/AAAAAAAAgD8AAACAAAAAgAAAgL8AAACAduIlPTzKf78AAACAduIlvTzKf78AAAAAAAAAgAAAgL8AAAAAkypLvPb6f78AAAAA+vCwPLfwf78AAACAV10YPCr9f78AAACAAAAAgAAAAAAAAIC/duIlPTzKfz8AAACAduIlvTzKfz8AAACAAAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/AAAAgAAAgD8AAACAkypLvPb6fz8AAACAAAAAgAAAAIAAAIC/AAAAgAAAAIAAAIC/+vCwPLfwfz8AAACAAAAAgAAAAIAAAIC/V10YPCr9fz8AAACA+vCwPLfwfz8AAACAkypLvPb6fz8AAACAV10YPCr9fz8AAACAduIlvTzKfz8AAACAduIlPTzKfz8AAACAAAAAAAAAgD8AAACAAAAAgAAAAIAAAIC/+vCwPLfwf78AAACAkypLvPb6f78AAAAAAAAAgAAAAIAAAIC/AAAAgAAAAIAAAIC/V10YPCr9f78AAACAduIlvTzKf78AAAAAAAAAgAAAAAAAAIC/AAAAgAAAAAAAAIC/duIlPTzKf78AAACAAAAAAAAAgL8AAACAAAAAgAAAAAAAAIC/","uv":"AAAAAAAKezsAAIA/6GGdPgAAgD/oCYE+ykNrP+gJgT4AAAAAoGMaPclDaz/qYZ0+teGlPbAn8D3SNBs/6GGdPlyWyb4ACns70jQbP+gJgT6ceAY/6AmBPlyWyb6gYxo97x2gvrAn8D2beAY/6mGdPgAAgD8AD3s7AAAAAOhhnT4AAAAA6GGdPgAAgD/AJ/A9AACAP8An8D0AAAAA6AmBPgAAAADoCYE+AACAPwAPezsAAAAAAAp7OwAAgD/oYZ0+AACAP+hhnT4AAAAAqCfwPQAAAACoJ/A9AACAP+gJgT4AAIA/6AmBPgAAAAAACns7AAAAAGjCnT61baY/dG9/PrVtpj9owp0+AAAAAGjCnT4AAAAAdG9/PrVtpj9owp0+tW2mP3Rvfz4AAAAAdG9/PrVtpj9owp0+AAAAAHRvfz4AAAAAaMKdPrVtpj9owp0+tW2mP3Rvfz4AAAAAaMKdPgAAAAB0b38+tW2mP3Rvfz4AAIA/AA97OwAAAADoYZ0+AAAAAOhhnT4AAIA/wCfwPQAAgD/AJ/A9AAAAAOgJgT4AAAAA6AmBPgAAgD8AD3s7AAAAAAAKezsAAIA/6GGdPgAAgD/oYZ0+AAAAAKgn8D0AAAAAqCfwPQAAgD/oCYE+AACAP+gJgT4AAAAAAAp7O9Z52z7oYZ0+FUMSP7gn8D3T+ES96mGdPmJyhT4AD3s7YIQnPwAOeztA97A+6GGdPrQbDz3oCYE+0XnbPugJgT4D+US96AmBPjv3sD7oCYE+nN81Prgn8D3OGw896GGdPgAAgD8AD3s7AAAAAOhhnT4AAAAA6GGdPgAAgD/AJ/A9AAAAAOgJgT4AAAAA6AmBPgAAAAAACns7AACAP+hhnT4AAIA/6GGdPgAAAACoJ/A9AACAP+gJgT4AAIA/6AmBPjM9mD3oCYE+uuU5PugJgT4qAgM+6AmBPnGSQD/qCYE+LsJwP+gJgT52P18/6AmBPlr4bD8AD3s7Mz2YPehhnT665Tk+6GGdPpGGUT8ADns7dj9fPwAOezsqAgM+6GGdPnGSQD/oYZ0+NLZ9PgAMezsz3XM9AAp7Oy3CcD/oYZ0+KgIDPgAKezt2P18/6GGdPi3CcD/oCYE+cpJAP+gJgT52P18/6AmBPrjlOT7oCYE+MD2YPegJgT4oAgM+6AmBPjndcz24J/A9LcJwP+hhnT5ykkA/6GGdPjq2fT6wJ/A9LAIDPrAn8D12P18/6GGdPrrlOT7oYZ0+koZRP8An8D1a+Gw/wCfwPTQ9mD3oYZ0+KgIDPuhhnT52P18/wCfwPQ==","indices":"BQADAEUABQBFAD4ADQBJAEQADQBEAAoAEgAVAB0AEgAdABoAHAAUABAAHAAQABgAEwAbABcAEwAXAA8AEQAOABYAEQAWABkAIwAkACwAIwAsACsALQAlACEALQAhACkAIgAqACYAIgAmAB4AIAAfACcAIAAnACgAMgA1AD0AMgA9ADoAPAA0ADAAPAAwADgAMwA7ADcAMwA3AC8AMQAuADYAMQA2ADkACABBAEgASAAMAAsASAALAAgABgA/AEIAQgAAAAQAQgAEAAYARgBAAAcARgAHAAkAQwBHAAIAQwACAAEAaABUAFEAaABRAGUAYwBxAHUAYwB1AF8AbgBkAFAAbgBQAFMAVQBaAG8AVQBvAFIATQBKAFwATQBcAHYATgBsAF0ATgBdAEsAVgBPAEwAVgBMAHcAaQBiAF4AaQBeAGsAZABuAHIAZAByAGYAZgByAHEAZgBxAGMAdgBcAGAAdgBgAHkAeQBgAF8AeQBfAHUAaABlAGcAaABnAGoAagBnAGIAagBiAGkAXQBsAG0AXQBtAGEAYQBtAGsAYQBrAF4AVgB3AHgAVgB4AFgAWAB4AHQAWAB0AFcAbwBaAFsAbwBbAHMAcwBbAFkAcwBZAHAAVwB0AHAAVwBwAFkA"},{"matName":"MI_Plaster","texture":"T_Plaster_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"AACAvwAAAAAAAACAAACAvwAAQEDizQw0AACAPwAAAAAAAACAAACAPwAAQEDizQw0AACAv94JVj9g9xwzAACAv94JVj9g9xwzAACAP94JVj9g9xwzAACAP94JVj9g9xwzAACAvwAAAADTzEy+AACAvwAAQEDHzEy+AACAPwAAAADTzEy+AACAPwAAQEDHzEy+","norm":"AAAAAAAAAIAAAIA/AAAAAAAAAIAAAIA/AAAAAAAAAIAAAIA/AAAAAAAAAIAAAIA/AAAAAAAAAIAAAIA/AAAAAAAAAIAAAIA/AAAAAAAAAIAAAIA/AAAAAAAAAIAAAIA/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/","uv":"1zirOAEAXj8AAAAAAAAAAAAAgD8BAF4/AACAPwAAAAAAAAAAAACAPyJEqzi40gQ/AACAP7jSBD8AAIA/AACAP9c4qzgAAKA/XmGrOABAqzgAAIA/AACgPwAAgD8AQKs4","indices":"BgAFAAAABgAAAAIAAwABAAQAAwAEAAcACwAKAAgACwAIAAkA"}];

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
    vertices: 134,
    triangles: 86,
    create: (name, scene) => createMasterMesh(name, scene),
    createInstance: (name, parent, scene) => createInstance(name, parent, scene)
  };

  global.ThonTranRegistry = global.ThonTranRegistry || {};
  global.ThonTranRegistry[MODEL_NAME] = AssetModule;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetModule;
  }
})(typeof window !== 'undefined' ? window : this);
