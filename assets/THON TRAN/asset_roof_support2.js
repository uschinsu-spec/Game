/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Roof_Support2
 * ============================================================================
 * Category: Mái Ngói & Mái Gỗ (roofs)
 * Dimensions: 0.2m x 0.74m x 0.77m | Vertices: 124 | Faces: 84
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Roof_Support2';
  const SUBMESHES = [{"matName":"MI_WoodTrim","texture":"T_WoodTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"MH7MPQFZs71Q30M/MH7MPQFZs71Q30M/MH7MPQFZs71Q30M/FX7MvYt7hj1Q30M/FX7MvYt7hj1Q30M/FX7MvYt7hj1Q30M/L37MPZF7hj1Q30M/L37MPZF7hj1Q30M/L37MPZF7hj1Q30M/FH7MvQdZs71Q30M/FH7MvQdZs71Q30M/FH7MvQdZs71Q30M/In7MvfNYs73jvIsyIn7MvfNYs73jvIsyIX7MPZh7hj3ivIuyIX7MPZh7hj3ivIuyI37MvZJ7hj3hvIsyI37MvZJ7hj3hvIsyIn7MPe1Ys73gvIuyIn7MPe1Ys73gvIuyb3xjPZodjb2uhyo/b3xjPZodjb2uhyo/TXxjvZ4djb2uhyo/TXxjvZ4djb2uhyo/V3xjvYwdjb0rcxsyZXxjPYgdjb0ucxuyTnxjvSthLb91JoY8TnxjvSthLb91JoY8TnxjvSthLb91JoY8bnxjPSthLb9rJoY8bnxjPSthLb9rJoY8bnxjPSthLb9rJoY8WHxjvSlhLb8rcxsyWHxjvSlhLb8rcxsyZHxjPShhLb8ucxuyZHxjPShhLb8ucxuyV3xjvQ6PG78rcxsyV3xjvf30eb4rcxsyV3xjvRYMDL8scxsyV3xjvTwS+b4rcxsyWHxjvU0M2r4rcxsyV3xjvV0Gu74rcxsyV3xjvW4AnL4rcxsyTnxjvcQhgb5cqgg/TnxjvcQhgb5cqgg/TnxjvcQhgb5cqgg/TXxjvdFSG78e03s9TXxjvdFSG78e03s9TXxjvdFSG78e03s9TnxjvaYglr79WeM+TnxjvaYglr79WeM+TnxjvaYglr79WeM+TnxjvUSSsb6Hd7M+TnxjvUSSsb6Hd7M+TnxjvUSSsb6Hd7M+TnxjvdOX0b698IQ+TnxjvdOX0b698IQ+TnxjvdOX0b698IQ+TXxjva8C9L6f4jU+TXxjva8C9L6f4jU+TXxjva8C9L6f4jU+TnxjvTI9C7/JV+E9TnxjvTI9C7/JV+E9TnxjvTI9C7/JV+E9b3xjPdFSG78a03s9b3xjPdFSG78a03s9b3xjPdFSG78a03s9bnxjPcQhgb5cqgg/bnxjPcQhgb5cqgg/bnxjPcQhgb5cqgg/bnxjPTI9C7/HV+E9bnxjPTI9C7/HV+E9bnxjPTI9C7/HV+E9b3xjPa8C9L6d4jU+b3xjPa8C9L6d4jU+b3xjPa8C9L6d4jU+bnxjPdOX0b698IQ+bnxjPdOX0b698IQ+bnxjPdOX0b698IQ+bnxjPUSSsb6Hd7M+bnxjPUSSsb6Hd7M+bnxjPUSSsb6Hd7M+bnxjPaYglr79WeM+bnxjPaYglr79WeM+bnxjPaYglr79WeM+ZXxjPff0eb4ucxuyZXxjPQ6PG78ucxuyZHxjPWwAnL4ucxuyZXxjPVwGu74ucxuyZHxjPUwM2r4ucxuyY3xjPTwS+b4tcxuyZXxjPRYMDL8ucxuyTnxjvWTaEr6uhyo/TnxjvWTaEr6uhyo/TnxjvWTaEr6uhyo/TXxjvSOTbL5SexY/TXxjvSOTbL5SexY/TXxjvSOTbL5SexY/TXxjvb0xNL4S2Cc/TXxjvb0xNL4S2Cc/TXxjvb0xNL4S2Cc/TnxjveEIVb6AgSA/TnxjveEIVb6AgSA/TnxjveEIVb6AgSA/b3xjPSGTbL5SexY/b3xjPSGTbL5SexY/b3xjPSGTbL5SexY/bnxjPWLaEr6uhyo/bnxjPWLaEr6uhyo/bnxjPWLaEr6uhyo/bnxjPd8IVb6AgSA/bnxjPd8IVb6AgSA/bnxjPd8IVb6AgSA/b3xjPbsxNL4S2Cc/b3xjPbsxNL4S2Cc/b3xjPbsxNL4S2Cc/WHxjvVzaEr4rcxsyV3xjveOObr4rcxsyV3xjvd5rMb4rcxsyV3xjvWH9T74rcxsyZXxjPd+Obr4ucxuyZHxjPVjaEr4ucxuyZXxjPV39T74ucxuyZXxjPdprMb4ucxuy","norm":"AAAAAAAAgL8AAACAAAAAAAAAAAAAAIA/AACAPwAAAAAAAACAAACAvwAAAIAAAAAAAAAAAAAAAAAAAIA/AAAAgAAAgD8AAAAAAAAAAAAAAAAAAIA/AAAAgAAAgD8AAAAAAACAPwAAAAAAAACAAACAvwAAAIAAAAAAAAAAAAAAgL8AAACAAAAAAAAAAAAAAIA/AACAvwAAAIAAAAAAAAAAAAAAgL8AAACAAAAAgAAAgD8AAAAAAACAPwAAAAAAAACAAACAvwAAAIAAAAAAAAAAgAAAgD8AAAAAAAAAAAAAgL8AAACAAACAPwAAAAAAAACAAAAAAAAAAAAAAIA/AACAPwAAAIAAAACAAACAvwAAAAAAAAAAAAAAAAAAAAAAAIA/AACAvwAAAAAAAAAAAACAPwAAAIAAAACAAACAvwAAAIAAAAAAAAAAgAAAgL8AAACAAAAAANTsCb//qlc/AAAAgAAAgL8AAACAAAAAANTsCb//qlc/AACAPwAAAAAAAACAAACAvwAAAIAAAAAAAAAAgAAAgL8AAACAAAAAgAAAgL8AAACAAACAPwAAAAAAAACAAACAvwAAAIAAAAAAAACAvwAAAAAAAAAAAACAvwAAAIAAAAAAAACAvwAAAIAAAAAAAACAvwAAAIAAAAAAAACAvwAAAIAAAAAAAACAvwAAAIAAAAAAAACAvwAAAIAAAAAAAAAAAONObr8nCLs+AAAAAMneaL9JrNQ+AACAvwAAAIAAAAAAAAAAAGaFHL+Hk0o/AAAAANTsCb//qlc/AACAvwAAAIAAAAAAAAAAAMneaL9JrNQ+AAAAAM8cXr8Ik/4+AACAvwAAAIAAAAAAAAAAAM8cXr8Ik/4+AAAAAPbjUr/zHxE/AACAvwAAAIAAAAAAAAAAAPbjUr/zHxE/AAAAAMUARr+KRCI/AACAvwAAAIAAAAAAAAAAAMUARr+KRCI/AAAAAJ1gNb8bqTQ/AACAvwAAAIAAAAAAAAAAAJ1gNb8bqTQ/AAAAAGaFHL+Hk0o/AAAAAGaFHL+Hk0o/AAAAANTsCb//qlc/AACAPwAAAAAAAACAAAAAAONObr8nCLs+AAAAAMneaL9JrNQ+AACAPwAAAIAAAACAAAAAAJ1gNb8bqTQ/AAAAAGaFHL+Hk0o/AACAPwAAAAAAAACAAAAAAMUARr+KRCI/AAAAAJ1gNb8bqTQ/AACAPwAAAAAAAACAAAAAAPbjUr/zHxE/AAAAAMUARr+KRCI/AACAPwAAAAAAAACAAAAAAM8cXr8Ik/4+AAAAAPbjUr/zHxE/AACAPwAAAAAAAACAAAAAAMneaL9JrNQ+AAAAAM8cXr8Ik/4+AACAPwAAAAAAAACAAACAPwAAAIAAAACAAACAPwAAAAAAAACAAACAPwAAAAAAAACAAACAPwAAAAAAAACAAACAPwAAAAAAAACAAACAPwAAAAAAAACAAACAPwAAAAAAAACAAACAvwAAAIAAAAAAAAAAAAUInb6JqXM/AAAAAAAAAAAAAIA/AACAvwAAAIAAAAAAAAAAAONObr8nCLs+AAAAACzEXL+omwE/AACAvwAAAAAAAAAAAAAAAAKZKr9w3z4/AAAAAAUInb6JqXM/AACAvwAAAAAAAAAAAAAAACzEXL+omwE/AAAAAAKZKr9w3z4/AAAAAONObr8nCLs+AAAAACzEXL+omwE/AACAPwAAAAAAAACAAAAAAAUInb6JqXM/AAAAAAAAAAAAAIA/AACAPwAAAAAAAACAAAAAACzEXL+omwE/AAAAAAKZKr9w3z4/AACAPwAAAIAAAACAAAAAAAKZKr9w3z4/AAAAAAUInb6JqXM/AACAPwAAAIAAAACAAACAvwAAAAAAAAAAAACAvwAAAAAAAAAAAACAvwAAAIAAAAAAAACAvwAAAAAAAAAAAACAPwAAAIAAAACAAACAPwAAAAAAAACAAACAPwAAAIAAAACAAACAPwAAAIAAAACA","uv":"XXS1PzhFeD5VLP4+rXofP0YXFT+wJ/A9RhcVP7An8D2duaw+UoVJP110tT9wlQc+nbmsPqx6Hz9ddLU/OEV4PkYXFT8ADHs7RhcVPwAMeztddLU/cJUHPlUs/j5ShUk/AACAPwAMezsAAIA/cJUHPgAAgD84RXg+AACAPwAMezsAAIA/sCfwPQAAgD9wlQc+AACAPzhFeD4AAIA/sCfwPWABUb2ASIo7J0GoPUCLzzwnQag9YIvPPGABUb2QW/c9IGPDPkCLzzwgY8M+AIvPPDaevz5g/5g+RIVuP5Bb9z1EhW4/kFv3PUSFbj8ASIo7RIVuPwBIijs2nr8+YP+YPiBjwz5c/5g+cutyP5hb9z1y63I/gEiKOyBjwz5c/5g+IGPDPpL5iD4gY8M+GC/VPSBjwz6IDnY+IGPDPvApWj4gY8M+WEU+PiBjwz68YCI+IGPDPiR8Bj69BRE+EKfcPSbhXT6QW/c9JuFdPpBb9z14PLU+aMOIPrYHWD+QW/c9tgdYP5Bb9z3RXDo+HDQBPin7oz6QW/c9KfujPpBb9z1oamU+1OAZPqLl3T6YW/c9ouXdPphb9z2yn4c+QKs2PkKVDD+QW/c9QpUMP5Bb9z0BgZo+GJ1VPpoSKT+QW/c9mhIpP5Bb9z2/D6o+gJp0PiSzQj+YW/c9JLNCP5hb9z22B1g/gEeKO7YHWD+AR4o7eDy1PmjDiD4p4V0+gEiKOynhXT6ASIo7vQURPhCn3D0ks0I/AEiKOySzQj8ASIo7vw+qPoCadD6aEik/gEeKO5oSKT+AR4o7BIGaPhidVT5ClQw/AEiKO0KVDD8ASIo7sp+HPkCrNj6i5d0+AEiKO6Ll3T4ASIo7aGplPtTgGT4q+6M+AEiKOyr7oz4ASIo70Vw6Phw0AT4gY8M+EC/VPSBjwz6S+Yg+IGPDPiB8Bj4gY8M+vGAiPiBjwz5YRT4+IGPDPvApWj4gY8M+iA52PidBqD1g93A9EHvePJBb9z0Qe948kFv3PSpb8D3oJsk9jJQfPpBb9z2MlB8+kFv3PRPqsT3YdZY9OCOBPZBb9z04I4E9kFv3PSlOzD2w/LM9GJTdPZBb9z0YlN09kFv3PY2UHz6ASIo7jZQfPoBIijsqW/A94CbJPRB73jyASIo7EHvePIBIijsnQag9UPdwPRiU3T0ASIo7GJTdPQBIijspTsw9sPyzPSwjgT2ASIo7LCOBPYBIijsT6rE90HWWPSBjwz5g93A9IGPDPnDvyj0gY8M+mPeTPSBjwz6Ic689IGPDPmjvyj0gY8M+UPdwPSBjwz6Ic689IGPDPpD3kz0=","indices":"EAAMAAkAEAAJAAMAEQAFAAcAEQAHAA4AEwAPAAgAEwAIAAIACgANABIACgASAAAACwABAAYACwAGAAQAeABqAEUAeABFAFUAXwB1ACUAXwAlACsAGwAhACIAGwAiAB0AGQAVAG0AGQBtAHkAVgBCAB8AVgAfACMAFgAYAHQAFgB0AFwAFAAXAF4AFABeAGwAQQAwABwAQQAcAB4ALgAkACAALgAgABoALwBAAEcALwBHAD8APgBGAEoAPgBKADwAOwBJAE0AOwBNADkAOABMAFAAOABQADYANQBPAFMANQBTADMAMgBSAEQAMgBEAC0AQgBWAFsAQgBbAEgASABbAFoASABaAEsASwBaAFkASwBZAE4ATgBZAFgATgBYAFEAUQBYAFcAUQBXAFQAVABXAFUAVABVAEUAJAAuAD0AJAA9ACYAJgA9ADoAJgA6ACcAJwA6ADcAJwA3ACgAKAA3ADQAKAA0ACkAKQA0ADEAKQAxACoAKgAxACsAKgArACUAYQBpAG4AYQBuAGYAZwBvAHEAZwBxAGMAZAByAGsAZABrAF0AdQBfAGUAdQBlAHcAdwBlAGIAdwBiAHYAdgBiAFwAdgBcAHQAagB4AHoAagB6AHAAcAB6AHsAcAB7AHMAcwB7AHkAcwB5AG0AaABgACwAaAAsAEMA"}];

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
    dimensions: { x: 0.2, y: 0.74, z: 0.77 },
    vertices: 124,
    triangles: 84,
    create: (name, scene) => createMasterMesh(name, scene),
    createInstance: (name, parent, scene) => createInstance(name, parent, scene)
  };

  global.ThonTranRegistry = global.ThonTranRegistry || {};
  global.ThonTranRegistry[MODEL_NAME] = AssetModule;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetModule;
  }
})(typeof window !== 'undefined' ? window : this);
