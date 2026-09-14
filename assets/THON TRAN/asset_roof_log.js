/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Roof_Log
 * ============================================================================
 * Category: Mái Ngói & Mái Gỗ (roofs)
 * Dimensions: 1.15m x 1.39m x 10.7m | Vertices: 176 | Faces: 164
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Roof_Log';
  const SUBMESHES = [{"matName":"MI_WoodTrim","texture":"T_WoodTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"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","norm":"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","uv":"kz2qPpt3ST8AAAAAAAp7OwAAAEA4RXg+AAAAQDhFeD6TPao+vF0gPwAAAACoJ/A9AAAAAKgn8D2SC/s+m3dJPwAAAEBwlQc+AAAAQHCVBz4AAAAAAAp7O5IL+z68XSA/L5r3P3CVBz4LXYY9AAl7Ozay5z90lQc+Rm5CPgAKezuhEPQ/TG0EPi3Guj0ACns7ZAPwP3CVBz64yf89AAp7O+d06z9giQI+yVgkPgAKeztGbkI+AAp7Ozay5z84RXg+KICFPQAKezv+p/c/OEV4PriCIj4ACns7qK/rPzhFeD64yf89AAp7O2QD8D84RXg+QFfFPQAKezuMqvM/OEV4PkRuQj6oJ/A9NrLnP3CVBz4KXYY9qCfwPS+a9z9wlQc+yFgkPqgn8D3ndOs/YIkCPrjJ/z2oJ/A9ZAPwP3CVBz4mxro9qCfwPaEQ9D9QbQQ+NrLnPzhFeD5EbkI+qCfwPf2n9z84RXg+J4CFPagn8D2or+s/OEV4PriCIj6oJ/A9ZAPwPzhFeD64yf89qCfwPYyq8z84RXg+P1fFPagn8D0uAL0/cJUHPqP/BT8ACns7awOhP5D/Az6m8j0/AAt7OwAAgD9wlQc+AACAPwAMezui/wU/AAp7Oy4AvT84RXg+AACAPwAMezsAAIA/eHlqPqXyPT8AC3s7awOhP1ivdD6i/wU/sCfwPS4AvT9wlQc+AACAP7An8D0AAIA/cJUHPqTyPT+wJ/A9bAOhP4z/Az4uAL0/OEV4PqL/BT+wJ/A9bAOhP1ivdD6k8j0/sCfwPQAAgD94eWo+AACAP7An8D2M+2k/AAx7OyQBiz/I4G0+F/dTPwANeztIApY/DEhxPkgClj8QSHE+GPdTP8An8D0kAYs/xOBtPoz7aT+wJ/A9jPtpP7gn8D0kAYs/gGMGPhj3Uz+wJ/A9SQKWP4AxBT5GApY/iDEFPhj3Uz8ADns7JAGLP3hjBj6M+2k/AAx7O5M9qj6bd0k/AAAAAAAKezsAAABAOEV4PgAAAEA4RXg+kz2qPrxdID8AAAAAqCfwPQAAAACoJ/A9kgv7Ppt3ST8AAABAcJUHPgAAAEBwlQc+AAAAAAAKezuSC/s+vF0gPy+a9z9wlQc+C12GPQAJezs2suc/dJUHPkZuQj4ACns7oRD0P0xtBD4txro9AAp7O2QD8D9wlQc+uMn/PQAKezvndOs/YIkCPslYJD4ACns7Rm5CPgAKezs2suc/OEV4PiiAhT0ACns7/qf3PzhFeD64giI+AAp7O6iv6z84RXg+uMn/PQAKeztkA/A/OEV4PkBXxT0ACns7jKrzPzhFeD5EbkI+qCfwPTay5z9wlQc+Cl2GPagn8D0vmvc/cJUHPshYJD6oJ/A953TrP2CJAj64yf89qCfwPWQD8D9wlQc+Jsa6Pagn8D2hEPQ/UG0EPjay5z84RXg+RG5CPqgn8D39p/c/OEV4PieAhT2oJ/A9qK/rPzhFeD64giI+qCfwPWQD8D84RXg+uMn/Pagn8D2MqvM/OEV4Pj9XxT2oJ/A9LgC9P3CVBz6j/wU/AAp7O2sDoT+Q/wM+pvI9PwALezui/wU/AAp7Oy4AvT84RXg+pfI9PwALeztrA6E/WK90PqL/BT+wJ/A9LgC9P3CVBz6k8j0/sCfwPWwDoT+M/wM+LgC9PzhFeD6i/wU/sCfwPWwDoT9Yr3Q+pPI9P7An8D2M+2k/AAx7OyQBiz/I4G0+F/dTPwANeztIApY/DEhxPkgClj8QSHE+GPdTP8An8D0kAYs/xOBtPoz7aT+wJ/A9jPtpP7gn8D0kAYs/gGMGPhj3Uz+wJ/A9SQKWP4AxBT5GApY/iDEFPhj3Uz8ADns7JAGLP3hjBj6M+2k/AAx7Ow==","indices":"BwAAAAQABwAEAAsACQADACwACQAsAAwARwArABYARwAWADoALQAFAAEALQABABgAQAAgAA8AQAAPADUAQQA7ABcAQQAXACEADgAqAEYADgBGADQAIwAZAAIAIwACAAgAIgAGAAoAIgAKAA0ADgAUAC4ADgAuACoAFAASADAAFAAwAC4AEgAQADIAEgAyADAAEAAMACwAEAAsADIAGAAeADMAGAAzAC0AHgAcADEAHgAxADMAHAAaAC8AHAAvADEAGgAWACsAGgArAC8AIwApAB8AIwAfABkAKQAnAB0AKQAdAB8AJwAlABsAJwAbAB0AJQAhABcAJQAXABsADQARACgADQAoACIAEQATACYAEQAmACgAEwAVACQAEwAkACYAFQAPACAAFQAgACQAOgA+AEkAOgBJAEcATAA8AEsATABLAFMAQQBFAD8AQQA/ADsAVQBDAD0AVQA9AE0AWAA2AEgAWABIAFAANgA0AEYANgBGAEgANQA3AEQANQBEAEAAWwA5AEIAWwBCAFQANwBZAFYANwBWAEQAWQBbAFQAWQBUAFYAOABaAFIAOABSAEoAWgBYAFAAWgBQAFIARQBXAE8ARQBPAD8AVwBVAE0AVwBNAE8APgBOAFEAPgBRAEkATgBMAFMATgBTAFEAYwBnAGAAYwBgAFwAZQBoAIgAZQCIAF8AnQCUAHIAnQByAIcAiQB0AF0AiQBdAGEAmACRAGsAmABrAHwAmQB9AHMAmQBzAJUAagCQAJwAagCcAIYAfwBkAF4AfwBeAHUAfgBpAGYAfgBmAGIAagCGAIoAagCKAHAAcACKAIwAcACMAG4AbgCMAI4AbgCOAGwAbACOAIgAbACIAGgAdACJAI8AdACPAHoAegCPAI0AegCNAHgAeACNAIsAeACLAHYAdgCLAIcAdgCHAHIAfwB1AHsAfwB7AIUAhQB7AHkAhQB5AIMAgwB5AHcAgwB3AIEAgQB3AHMAgQBzAH0AaQB+AIQAaQCEAG0AbQCEAIIAbQCCAG8AbwCCAIAAbwCAAHEAcQCAAHwAcQB8AGsAlACdAJ8AlACfAJYAoACnAEsAoABLADwAmQCVAJcAmQCXAJsAqQChAD0AqQA9AEMArACkAJ4ArACeAJIAkgCeAJwAkgCcAJAAkQCYAJoAkQCaAJMArwCoAEIArwBCADkAkwCaAKoAkwCqAK0ArQCqAKgArQCoAK8AOABKAKYAOACmAK4ArgCmAKQArgCkAKwAmwCXAKMAmwCjAKsAqwCjAKEAqwChAKkAlgCfAKUAlgClAKIAogClAKcAogCnAKAA"}];

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
    dimensions: { x: 1.15, y: 1.39, z: 10.7 },
    vertices: 176,
    triangles: 164,
    create: (name, scene) => createMasterMesh(name, scene),
    createInstance: (name, parent, scene) => createInstance(name, parent, scene)
  };

  global.ThonTranRegistry = global.ThonTranRegistry || {};
  global.ThonTranRegistry[MODEL_NAME] = AssetModule;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetModule;
  }
})(typeof window !== 'undefined' ? window : this);
