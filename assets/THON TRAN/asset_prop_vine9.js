/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Prop_Vine9
 * ============================================================================
 * Category: Đạo Cụ Thôn Trấn (props)
 * Dimensions: 4.14m x 1.47m x 1.47m | Vertices: 72 | Faces: 44
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Prop_Vine9';
  const SUBMESHES = [{"matName":"MI_Vine","texture":"T_VineLeaf_png.png","doubleSided":true,"isUint32":false,"pos":"MWbdv2K6bb5np4A+Yh5FvwTbc75ogq8+SszUvyDT7z5mr9C+lOozv9DC7D5k1KG+sz4CwMk+qr4uj7E+XnKjv/Buw774swg/XALwv/xXgT7U+ha+VfeOv6hPUD7Q2iI9XaxEvmBZG73gTcw92Ix0v+Amsr3Gwoc+APisvur1Cz+qgsy+4+6Mv0TN/j60pm++z3SQv+PQF7/mByQ/NjGzvvUtCL8XqBc/7muavwD4/Trc3g0+pg3bvmAPgT0ov7g9vVMkv5okIr9Q3zc/1Cd4PvUDyr4fudU+NsuCv8DnrjzcU/g9/OIMvrwzhT4c4Te+iLGhvZhDnr1G+Cg+AM7YOmDyYr3c9u49CGjPvTduiL7K68M+bFtjPoQPN77AU0E+SEqNva4hQr4EGpM+tEwRPgKNB76uuCQ+xEx5PmL3q77HI7c+5JAKPob8ur56Vtg+ONsDPmK6bb5np4A+aFKLPwTbc75ogq8+dKpIPiDT7z5mr9C+TuyTP9DC7D5k1KG+YCEcPfHY2L6uQAk/zexGP8jji743jKc+hD9ZvqSZEz6Q8nI91doGP/rBlj6gLRm+k9k6P+PQF7/mByQ/ShXBP/UtCL8XqBc/VesmPwD4/Trc3g0+Lh63P2APgT0ov7g9urebP5okIr9Q3zc/SXMGQPUDyr4fudU+xSxWP8DnrjzcU/g9OEXcP7wzhT4c4Te+gMbjP5hDnr1G+Cg+zBfuP2DyYr3c9u49GOvgPzduiL7K68M+giYFQIQPN77AU0E+9AzlP64hQr4EGpM+lwUAQAKNB76uuCQ+mIUGQGL3q77HI7c+tDP/P4b8ur56Vtg+PJVFvhQs8L3Cjj4+LckzP2ASpz0w1+O9qYMKv6gkDT+WbNS+olW1PnQMQD/hVDa/pjIzv9osRz/vqDi/fmYYv9J0VT/TkEC/rLY7vwDg+T5GFf++MHWgvhg2Nj+LQh+/spIwv4zNHD/dJBe/Ru3UvrYpQj/N1Cu/jimUvpj29j5m+eC+oBDcvryl0D4awsu+yfsKP4CQc70WSWk+SyInP6BxpbzYHUM++m31Pka1q77ahew+759rP94pNr6T9Z8+TyQJP3RaYr6xPro+YcpSP4xU8r3XTog+hZFrP3p0zr62bAA/Y81FP8ls6b5fOg0/","norm":"F/ugPZ4Kfj+1+sK9ww1gPd9jfj+GF8i9JY+gPX1hfj+yp6S9xpddPai+fj/nkqm9Lu6vPZnVfT9OR8e9jDiJPcwWfj/ZstC9+peqPVUmfj868bC9FEaDPSlofj+Hkbq9vuTHPPsqfj/xa++9hYcwPZPjfT+dLve9/XrpPJRyfj9lgdm9nI5CPSonfj8+e+G9tTmBPVQZfj+G/NS9kdAzPT1jfj8wJtO9El6HPXJTfj9Jqb69o90+Pf2hfj/ynLy9ruNQPb05fj9W4Ni9TdrwPEGgfj8WK8u9YeZ7PZ9ofj8jDb69mcshPWrafj9B7a+9yWoaPeOwfj8g5b+9yzgSPX28fj9Lo7298KUbPRaRfj/d7sm9wJT2PF6/fj/gt8C9NMkYPU2gfj9/o8W9WHsDPfy+fj8Dfb+9dqfxPI6ofj+0fci9SHwDPXmZfj/Ek8u9F/ugPZ4Kfj+1+sK9ww1gPd9jfj+GF8i9JY+gPX1hfj+yp6S9xpddPai+fj/nkqm9FDNivrr7eD/2rpS9j/J0vuj3dz/6CYq90FNfvhBWeT/3H329z2Nyvr9NeD/Dbme9tTmBPVQZfj+G/NS9kdAzPT1jfj8wJtO9El6HPXJTfj9Jqb69o90+Pf2hfj/ynLy9ruNQPb05fj9W4Ni9TdrwPEGgfj8WK8u9YeZ7PZ9ofj8jDb69mcshPWrafj9B7a+9yWoaPeOwfj8g5b+9yzgSPX28fj9Lo7298KUbPRaRfj/d7sm9wJT2PF6/fj/gt8C9NMkYPU2gfj9/o8W9WHsDPfy+fj8Dfb+9dqfxPI6ofj+0fci9SHwDPXmZfj/Ek8u9v7Yzvj9Eez8DeJy96txKvj9Nej/UhY29TDAuvmrCez+bNYC9iL1FvgDJej9HsmG99n8ZvqiFfD+roIk95Nobvm5rfD+rD4s9YisYvsimfD+pAIA9zPkgvl5EfD/HU4U9MkwZvtuTfD835YM9ayIfvkFSfD/tlIc9YcQgvnlWfD9ZFXs9R+YdvhR3fD97ZXc9fnSTuybLfz/qbSM9CInbu3/Ifz8wSiY9nkNYu0TXfz86xA89YPhCvMbLfz/fDhw9FS6Qu37Sfz+IjRc9bdYjvJzKfz+4JiA9QPpCvMvUfz+ffww9C3UTvDjZfz8C/Qc9","uv":"AAAAAAAAgD8AAIA/AACAPwAAAAAAAAAAAACAPwAAAAAAAAAAAACAPwAAgD8AAIA/AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AACAPwAAgD8AAAAAAAAAAAAAgD8AAAAAAAAAAAAAgD8AAIA/AACAPwAAAAAAAAAAAACAPwAAAAAAAAAAAACAPwAAgD8AAIA/AAAAAAAAAAAAAIA/AAAAAJFDQT8AAAAAysMdPwAAAAAAAIA/NOWrPrZM4z4w5as++hpeP9jkVz7cPgE/0ORXPm9DFz/paSI/s+FGP+ppIj8AAAAAAACAPwAAgD8AAIA/AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AACAPwAAgD8AAAAAAAAAAAAAgD8AAAAAAAAAAAAAgD8AAIA/AACAPwAAAAAAAAAAAACAPwAAAAAAAAAAAACAPwAAgD8AAIA/AAAAAAAAAAAAAIA/AAAAAJFDQT8AAAAAysMdPwAAAAAAAIA/NOWrPrZM4z4w5as++hpeP9jkVz7cPgE/0ORXPm9DFz/paSI/s+FGP+ppIj8AAAAAAACAPwAAgD8AAIA/AAAAAAAAAAAAAIA/AAAAAJFDQT8AAAAAysMdPwAAAAAAAIA/NOWrPrZM4z4w5as++hpeP9jkVz7cPgE/0ORXPm9DFz/paSI/s+FGP+ppIj+RQ0E/AAAAAMrDHT8AAAAAAACAPzTlqz62TOM+MOWrPvoaXj/Y5Fc+3D4BP9DkVz5vQxc/6WkiP7PhRj/qaSI/","indices":"AAABAAMAAAADAAIABAAFAAcABAAHAAYACAAKAAsACAALAAkADAANAA8ADAAPAA4AEAARABMAEAATABIAGQAVABQAGQAUABgAGgAXABYAGgAWABsAFwAZABgAFwAYABYAHAAdAB8AHAAfAB4AIAAhACMAIAAjACIAJAAlACcAJAAnACYAKAApACsAKAArACoAMQAtACwAMQAsADAAMgAvAC4AMgAuADMALwAxADAALwAwAC4ANAA1ADcANAA3ADYAPQA5ADgAPQA4ADwAPgA7ADoAPgA6AD8AOwA9ADwAOwA8ADoARQBBAEAARQBAAEQARgBDAEIARgBCAEcAQwBFAEQAQwBEAEIA"}];

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
    category: 'props',
    categoryVi: 'Đạo Cụ Thôn Trấn',
    icon: '📦',
    dimensions: { x: 4.14, y: 1.47, z: 1.47 },
    vertices: 72,
    triangles: 44,
    create: (name, scene) => createMasterMesh(name, scene),
    createInstance: (name, parent, scene) => createInstance(name, parent, scene)
  };

  global.ThonTranRegistry = global.ThonTranRegistry || {};
  global.ThonTranRegistry[MODEL_NAME] = AssetModule;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetModule;
  }
})(typeof window !== 'undefined' ? window : this);
