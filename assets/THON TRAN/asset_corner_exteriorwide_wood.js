/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Corner_ExteriorWide_Wood
 * ============================================================================
 * Category: Cột & Góc Tường (corners)
 * Dimensions: 0.29m x 3.0m x 0.33m | Vertices: 48 | Faces: 36
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Corner_ExteriorWide_Wood';
  const SUBMESHES = [{"matName":"MI_WoodTrim","texture":"T_WoodTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"5zfXPf//P0AaZPU95zfXPf//P0AaZPU95zfXPf//P0AaZPU9EzfXvf//P0AdZPU9EzfXvf//P0AdZPU9EzfXvf//P0AdZPU94DfXPf//P0A3ZPW94DfXPf//P0A3ZPW94DfXPf//P0A3ZPW9EzfXvf//P0A3ZPW9EzfXvf//P0A3ZPW9EzfXvf//P0A3ZPW9S7YUPvp4LrQqkCk+S7YUPvp4LrQqkCk+S7YUPvp4LrQqkCk+v7YUvtANo7MokCk+v7YUvtANo7MokCk+v7YUvtANo7MokCk+RrYUPvp4LrQXkCm+RrYUPvp4LrQXkCm+RrYUPvp4LrQXkCm+v7YUvtANo7MXkCm+v7YUvtANo7MXkCm+v7YUvtANo7MXkCm+y/kHvq17gj7/CRu+y/kHvq17gj7/CRu+a/kHPqp7gj4NChs+a/kHPqp7gj4NChs+Z/kHPqp7gj7/CRu+Z/kHPqp7gj7/CRu+y/kHvq17gj4LChs+y/kHvq17gj4LChs+rl4TvgzAkz3MByi+rl4TvgzAkz3MByi+rl4Tvg7Akz3bByg+rl4Tvg7Akz3bByg+O14TPgHAkz3MByi+O14TPgHAkz3MByi+P14TPgDAkz3dByg+P14TPgDAkz3dByg+oDfXPbyIAEAtZPW9oDfXPbyIAEAtZPW9YzfXvbuIAEAnZPU9YzfXvbuIAEAnZPU9YzfXvbyIAEAtZPW9YzfXvbyIAEAtZPW9pzfXPbuIAEAjZPU9pzfXPbuIAEAjZPU9","norm":"AAAAAAAAAAAAAIA/AAAAAAAAgD8AAACAAACAPwAAAIAAAACAAACAvwAAAAAAAACAAAAAAAAAAAAAAIA/AAAAAAAAgD8AAACAAAAAAAAAAIAAAIC/AAAAAAAAgD8AAACAAACAPwAAAIAAAACAAACAvwAAAAAAAACAAAAAAAAAAIAAAIC/AAAAAAAAgD8AAACAAAAAgAAAgL8AAAAAAAAAgG2SqTz18X8/JfV/P3oZlTwAAACAJfV/v3oZlTwAAAAAAAAAgAAAgL8AAAAAAAAAgG2SqTz18X8/AAAAgAAAgL8AAAAAAAAAAG2SqTz18X+/JfV/P3oZlTwAAACAJfV/v3oZlTwAAAAAAAAAgAAAgL8AAAAAAAAAAG2SqTz18X+/ZM5/v11XHz0AAAAAAAAAAMR0NT2pv3+/AAAAgMR0NT2pv38/ZM5/P11XHz0AAACAAAAAAMR0NT2pv3+/ZM5/P11XHz0AAACAZM5/v11XHz0AAAAAAAAAgMR0NT2pv38/ZM5/v11XHz0AAAAAAAAAAGvdNT1fv3+/ZM5/v11XHz0AAAAAAAAAgGvdNT1fv38/AAAAAGvdNT1fv3+/ZM5/P11XHz0AAACAAAAAgGvdNT1fv38/ZM5/P11XHz0AAACAAAAAAJcWFTxK/X+/9P1/P/dtATwAAACA9P1/v/dtATwAAACAAAAAAJcWFTxK/X8/9P1/v/dtATwAAACAAAAAAJcWFTxK/X+/AAAAAJcWFTxK/X8/9P1/P/dtATwAAACA","uv":"AACAPwAPezuTPao+m3dJPwAAAAA4RXg+AAAAADhFeD4AAIA/wCfwPZM9qj68XSA/AACAP8An8D2SC/s+m3dJPwAAAABwlQc+AAAAAHCVBz4AAIA/AA97O5IL+z68XSA/kz2qPpt3ST8AAAAAAAp7OwAAgD84RXg+AACAPzhFeD6TPao+vF0gPwAAAACoJ/A9kgv7Ppt3ST8AAAAAqCfwPQAAgD9wlQc+AACAP3CVBz6SC/s+vF0gPwAAAAAACns7uEBqP3CVBz5A+q09AAp7Ozz6rT0ACns7uEBqPzhFeD5A+q09qCfwPbhAaj9wlQc+uEBqPzhFeD49+q09qCfwPQDYeT9wlQc+HgDFPAAKezv/13k/OEV4Ph0AxTyoJ/A9HwDFPLAn8D3/13k/cJUHPhkAxTwACns7ANh5PzhFeD76YCs/sCfwPQo+qT5wlQc+Cj6pPjhFeD77YCs/sCfwPQo+qT5wlQc++2ArPwANezv6YCs/AA57Owo+qT44RXg+","indices":"AQAHAAsAAQALAAUAEgAMABAAEgAQABYAIwARAA0AIwANACYALAAqAAMALAADAAkAJAATABcAJAAXACEAHgAqACwAHgAsABgAJQAnAA4AJQAOABQAKwAfABoAKwAaAC4AKQAvABsAKQAbAB0AHAAZAC0AHAAtACgAIAAiAB4AIAAeABgAFQAPACIAFQAiACAAHQAbACcAHQAnACUAHAAkACEAHAAhABkAHwAjACYAHwAmABoABgAoAC0ABgAtAAoACAACAC8ACAAvACkABAArAC4ABAAuAAAA"}];

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
    category: 'corners',
    categoryVi: 'Cột & Góc Tường',
    icon: '🧱',
    dimensions: { x: 0.29, y: 3.0, z: 0.33 },
    vertices: 48,
    triangles: 36,
    create: (name, scene) => createMasterMesh(name, scene),
    createInstance: (name, parent, scene) => createInstance(name, parent, scene)
  };

  global.ThonTranRegistry = global.ThonTranRegistry || {};
  global.ThonTranRegistry[MODEL_NAME] = AssetModule;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetModule;
  }
})(typeof window !== 'undefined' ? window : this);
