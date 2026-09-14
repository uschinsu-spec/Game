/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Roof_FrontSupports
 * ============================================================================
 * Category: Mái Ngói & Mái Gỗ (roofs)
 * Dimensions: 5.49m x 0.23m x 0.65m | Vertices: 120 | Faces: 60
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Roof_FrontSupports';
  const SUBMESHES = [{"matName":"MI_WoodTrim","texture":"T_WoodTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"co8vwF0z8r0glCA/co8vwF0z8r0glCA/co8vwF0z8r0glCA/co8vwMRG5z0glCA/co8vwMRG5z0glCA/co8vwMRG5z0glCA/1bkWwFsz8r0hlCA/1bkWwFsz8r0hlCA/1bkWwFsz8r0hlCA/1bkWwMRG5z0hlCA/1bkWwMRG5z0hlCA/1bkWwMRG5z0hlCA/1bkWwMdG5z3wWt+81bkWwMdG5z3wWt+8co8vwGAz8r3zWt+8co8vwGAz8r3zWt+81bkWwF8z8r3wWt+81bkWwF8z8r3wWt+8co8vwMdG5z3zWt+8co8vwMdG5z3zWt+8S/vdv1wz8r0olCA/S/vdv1wz8r0olCA/S/vdv1wz8r0olCA/S/vdv8NG5z0olCA/S/vdv8NG5z0olCA/S/vdv8NG5z0olCA/ElCsv1oz8r0olCA/ElCsv1oz8r0olCA/ElCsv1oz8r0olCA/ElCsv8VG5z0olCA/ElCsv8VG5z0olCA/ElCsv8VG5z0olCA/ElCsv8hG5z0JWt+8ElCsv8hG5z0JWt+8S/vdv18z8r0LWt+8S/vdv18z8r0LWt+8ElCsv14z8r0JWt+8ElCsv14z8r0JWt+8S/vdv8dG5z0LWt+8S/vdv8dG5z0LWt+8ZK85v1sz8r0olCA/ZK85v1sz8r0olCA/ZK85v1sz8r0olCA/ZK85v8RG5z0olCA/ZK85v8RG5z0olCA/ZK85v8RG5z0olCA/4rGsvl0z8r0vlCA/4rGsvl0z8r0vlCA/4rGsvl0z8r0vlCA/47GsvsRG5z0vlCA/47GsvsRG5z0vlCA/47GsvsRG5z0vlCA/5LGsvsdG5z0hWd+85LGsvsdG5z0hWd+8Za85v14z8r0FWt+8Za85v14z8r0FWt+847GsvmAz8r0hWd+847GsvmAz8r0hWd+8Za85v8hG5z0FWt+8Za85v8hG5z0FWt+8aI8vQFoz8r0+lCA/aI8vQFoz8r0+lCA/aI8vQFoz8r0+lCA/aI8vQMNG5z0+lCA/aI8vQMNG5z0+lCA/aI8vQMNG5z0+lCA/y7kWQFsz8r09lCA/y7kWQFsz8r09lCA/y7kWQFsz8r09lCA/y7kWQMRG5z09lCA/y7kWQMRG5z09lCA/y7kWQMRG5z09lCA/zbkWQMdG5z1NV9+8zbkWQMdG5z1NV9+8ao8vQF0z8r1KV9+8ao8vQF0z8r1KV9+8zbkWQF8z8r1NV9+8zbkWQF8z8r1NV9+8ao8vQMdG5z1KV9+8ao8vQMdG5z1KV9+8N/vdP1sz8r02lCA/N/vdP1sz8r02lCA/N/vdP1sz8r02lCA/N/vdP8RG5z02lCA/N/vdP8RG5z02lCA/N/vdP8RG5z02lCA//E+sP1wz8r02lCA//E+sP1wz8r02lCA//E+sP1wz8r02lCA//E+sP8NG5z02lCA//E+sP8NG5z02lCA//E+sP8NG5z02lCA/AFCsP8ZG5z00WN+8AFCsP8ZG5z00WN+8OvvdP14z8r0yWN+8OvvdP14z8r0yWN+8AFCsP2Az8r00WN+8AFCsP2Az8r00WN+8OvvdP8hG5z0yWN+8OvvdP8hG5z0yWN+8Oa85P1wz8r0vlCA/Oa85P1wz8r0vlCA/Oa85P1wz8r0vlCA/Oa85P8NG5z0vlCA/Oa85P8NG5z0vlCA/Oa85P8NG5z0vlCA/jrGsPloz8r0vlCA/jrGsPloz8r0vlCA/jrGsPloz8r0vlCA/jbGsPsNG5z0vlCA/jbGsPsNG5z0vlCA/jbGsPsNG5z0vlCA/mrGsPsdG5z0dWd+8mrGsPsdG5z0dWd+8QK85P18z8r0aWd+8QK85P18z8r0aWd+8mrGsPl0z8r0dWd+8mrGsPl0z8r0dWd+8QK85P8dG5z0aWd+8QK85P8dG5z0aWd+8","norm":"AACAvwAAAAAAAAAAAAAAAAAAgL8AAAAAAAAAgAAAAAAAAIA/AACAvwAAAAAAAAAAAAAAgAAAAAAAAIA/AAAAAAAAgD8AAAAAAAAAAAAAgL8AAAAAAAAAgAAAAAAAAIA/AACAPwAAAAAAAACAAAAAgAAAAAAAAIA/AAAAAAAAgD8AAAAAAACAPwAAAAAAAACAAAAAAAAAgD8AAAAAAACAPwAAAAAAAACAAACAvwAAAAAAAAAAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAACAPwAAAAAAAACAAACAvwAAAAAAAAAAAAAAAAAAgD8AAAAAAACAvwAAAAAAAACAAAAAAAAAgL8AAAAAAAAAAAAAAAAAAIA/AACAvwAAAAAAAACAAAAAAAAAAAAAAIA/AAAAAAAAgD8AAAAAAAAAAAAAgL8AAAAAAAAAAAAAAAAAAIA/AACAPwAAAAAAAAAAAAAAAAAAAAAAAIA/AAAAAAAAgD8AAAAAAACAPwAAAAAAAAAAAAAAAAAAgD8AAAAAAACAPwAAAAAAAAAAAACAvwAAAAAAAACAAAAAAAAAgL8AAAAAAAAAAAAAgL8AAAAAAACAPwAAAAAAAAAAAACAvwAAAAAAAACAAAAAAAAAgD8AAAAAAACAvwAAAAAAAAAAAAAAgAAAgL8AAAAAAAAAgAAAAAAAAIA/AACAvwAAAAAAAAAAAAAAgAAAAAAAAIA/AAAAAAAAgD8AAAAAAAAAgAAAgL8AAAAAAAAAgAAAAAAAAIA/AACAPwAAAAAAAACAAAAAgAAAAAAAAIA/AAAAAAAAgD8AAAAAAACAPwAAAAAAAACAAAAAAAAAgD8AAAAAAACAPwAAAAAAAACAAACAvwAAAAAAAAAAAAAAgAAAgL8AAAAAAAAAgAAAgL8AAAAAAACAPwAAAAAAAACAAACAvwAAAAAAAAAAAAAAAAAAgD8AAAAAAAAAAAAAgL8AAAAAAAAAgAAAAAAAAIA/AACAPwAAAAAAAAAAAAAAgAAAAAAAAIA/AAAAAAAAgD8AAAAAAACAPwAAAAAAAAAAAACAvwAAAAAAAACAAAAAAAAAgL8AAAAAAAAAgAAAAAAAAIA/AACAvwAAAAAAAACAAAAAgAAAAAAAAIA/AAAAAAAAgD8AAAAAAACAvwAAAAAAAACAAAAAAAAAgD8AAAAAAAAAAAAAgL8AAAAAAACAPwAAAAAAAAAAAACAvwAAAAAAAACAAAAAAAAAgL8AAAAAAAAAAAAAgD8AAAAAAACAPwAAAAAAAAAAAAAAAAAAgL8AAAAAAAAAAAAAAAAAAIA/AACAPwAAAAAAAAAAAAAAAAAAAAAAAIA/AAAAgAAAgD8AAAAAAACAPwAAAAAAAAAAAACAvwAAAAAAAACAAAAAAAAAgL8AAAAAAAAAAAAAAAAAAIA/AACAvwAAAAAAAACAAAAAAAAAAAAAAIA/AAAAgAAAgD8AAAAAAACAvwAAAAAAAACAAAAAgAAAgD8AAAAAAAAAAAAAgL8AAAAAAACAPwAAAAAAAAAAAACAvwAAAAAAAACAAAAAAAAAgL8AAAAAAAAAgAAAgD8AAAAAAACAPwAAAAAAAAAAAAAAgAAAgL8AAAAAAAAAAAAAAAAAAIA/AACAPwAAAAAAAAAAAAAAAAAAAAAAAIA/AAAAAAAAgD8AAAAAAACAPwAAAAAAAAAAAACAvwAAAIAAAACAAAAAgAAAgL8AAAAAAAAAAAAAAAAAAIA/AACAvwAAAIAAAACAAAAAAAAAAAAAAIA/AAAAAAAAgD8AAAAAAACAvwAAAIAAAACAAAAAAAAAgD8AAAAAAAAAgAAAgL8AAAAAAACAPwAAAAAAAAAAAACAvwAAAIAAAACAAAAAgAAAgL8AAAAAAAAAAAAAgD8AAAAAAACAPwAAAAAAAAAA","uv":"Si/mPwAPezsUa4C/OEV4Pj3tqz5EX0k/Si/mP8An8D097as+cmkfPxRrgL84RXg+FGuAv3CVBz5iIf8+RF9JP0ov5j/AJ/A9YiH/PnJpHz8Ua4C/cJUHPkov5j8AD3s7Ys8mv3CVBz7mK7k/AA57O+YruT8ADns7Ys8mvzhFeD5izya/cJUHPucruT/AJ/A95yu5P8An8D1izya/OEV4PlIJnD8AD3s7AK7GPDhFeD7wqCo+grFKP1IJnD/AJ/A98KgqPuMSID8ArsY8OEV4PgCuxjxwlQc+nIioPoKxSj9SCZw/wCfwPZyIqD7jEiA/AK7GPHCVBz5SCZw/AA97O2h4wD5wlQc+3AtePwAOezvcC14/AA57O2h4wD44RXg+aHjAPnCVBz7eC14/wCfwPd4LXj/AJ/A9aHjAPjhFeD7oGBNAAA97O9Axpr84RXg+YSH/PnJpHz/oGBNAwCfwPWEh/z5EX0k/0DGmvzhFeD7QMaa/cJUHPjztqz5yaR8/6BgTQMAn8D087as+RF9JP9Axpr9wlQc+6BgTQAAPezvaXHK/cJUHPmwu+T8ADns7bC75PwAOezvaXHK/OEV4Ptpccr9wlQc+bS75P8An8D1tLvk/wCfwPdpccr84RXg+rLiEPjhFeD7Xnyg+KpUgP3LvQz8AD3s7KY2pPiqVID+suIQ+OEV4PnLvQz/AJ/A9cu9DP8An8D2suIQ+cJUHPtefKD48L0o/cu9DPwAPezspjak+PC9KP6y4hD5wlQc+VNHTPgAOezscYxw/cJUHPhxjHD84RXg+VNHTPgAOeztY0dM+wCfwPRxjHD9wlQc+HGMcPzhFeD5Y0dM+wCfwPdAxpr84RXg+Pe2rPkRfST/oGBNAAA97Oz3tqz5yaR8/0DGmvzhFeD7oGBNAwCfwPegYE0DAJ/A90DGmv3CVBz5iIf8+RF9JP+gYE0AAD3s7YiH/PnJpHz/QMaa/cJUHPmwu+T8ADns72lxyv3CVBz7aXHK/OEV4Pmwu+T8ADns7bS75P8An8D3aXHK/cJUHPtpccr84RXg+bS75P8An8D1Mdek+OEV4PvCoKj6CsUo/nAC2PgAPezvwqCo+4xIgP0x16T44RXg+nAC2PsAn8D2cALY+wCfwPUx16T5wlQc+nIioPoKxSj+cALY+AA97O5yIqD7jEiA/THXpPnCVBz4Ahnk7AA57O2zBTj9wlQc+bMFOPzhFeD4Ahnk7AA57OwCIeTvAJ/A9bMFOP3CVBz5swU4/OEV4PgCIeTvAJ/A9","indices":"AgAHAAkAAgAJAAQADAATAAUADAAFAAoAAwASAA4AAwAOAAAABgABAA8ABgAPABAACAARAA0ACAANAAsAFgAbAB0AFgAdABgAIAAnABkAIAAZAB4AFwAmACIAFwAiABQAGgAVACMAGgAjACQAHAAlACEAHAAhAB8AKgAvADEAKgAxACwANAA7AC0ANAAtADIAKwA6ADYAKwA2ACgALgApADcALgA3ADgAMAA5ADUAMAA1ADMAPQA/AEYAPQBGAEQASQBHAEAASQBAAE4AQQA+AEsAQQBLAE8AQwBNAEoAQwBKADwAQgBFAEgAQgBIAEwAUQBTAFoAUQBaAFgAXQBbAFQAXQBUAGIAVQBSAF8AVQBfAGMAVwBhAF4AVwBeAFAAVgBZAFwAVgBcAGAAZQBnAG4AZQBuAGwAcQBvAGgAcQBoAHYAaQBmAHMAaQBzAHcAawB1AHIAawByAGQAagBtAHAAagBwAHQA"}];

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
    dimensions: { x: 5.49, y: 0.23, z: 0.65 },
    vertices: 120,
    triangles: 60,
    create: (name, scene) => createMasterMesh(name, scene),
    createInstance: (name, parent, scene) => createInstance(name, parent, scene)
  };

  global.ThonTranRegistry = global.ThonTranRegistry || {};
  global.ThonTranRegistry[MODEL_NAME] = AssetModule;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetModule;
  }
})(typeof window !== 'undefined' ? window : this);
