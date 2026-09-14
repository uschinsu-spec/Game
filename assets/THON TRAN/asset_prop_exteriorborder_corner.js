/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Prop_ExteriorBorder_Corner
 * ============================================================================
 * Category: Đạo Cụ Thôn Trấn (props)
 * Dimensions: 0.7m x 0.13m x 0.7m | Vertices: 34 | Faces: 18
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Prop_ExteriorBorder_Corner';
  const SUBMESHES = [{"matName":"MI_RockTrim","texture":"T_RockTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"MzMzvyQQ6DIzMzM/MzMzvyQQ6DIzMzM/MzMzvyQQ6DIzMzM/MzMzvyQQ6DIAALgxMzMzvyQQ6DIAALgxMzMzvyQQ6DIAALgxexQuvwU8CT4AAMAxexQuvwU8CT4AAMAxexQuvwU8CT4AAMAxAAAANCQQ6DIzMzM/AAAANCQQ6DIzMzM/AAAANCQQ6DIzMzM/AAAANCQQ6DIAAASyAAAANCQQ6DIAAASyAAAANCQQ6DIAAASyAAAANAU8CT4AAASyAAAANAU8CT4AAASyAAAANAU8CT4AAASyMzMzv+L69D0zMzM/MzMzv+L69D0zMzM/MzMzv+L69D0zMzM/MzMzv+L69D0zMzM/exQuvwU8CT57FC4/exQuvwU8CT57FC4/exQuvwU8CT57FC4/AAAANAU8CT57FC4/AAAANAU8CT57FC4/AAAANAU8CT57FC4/AAAANOL69D0zMzM/AAAANOL69D0zMzM/AAAANOL69D0zMzM/MzMzv+P69D0AALgxMzMzv+P69D0AALgxMzMzv+P69D0AALgx","norm":"AACAvwAAAAAAAACAAAAAAAAAgL8AAACAAAAAAAAAAAAAAIA/AACAvwAAAAAAAACAAAAAAAAAgL8AAACAAAAAgAAAAAAAAIC/eS+dvi6jcz8AAACAeS+dvi6jcz8AAACAAAAAgAAAAAAAAIC/AAAAAAAAgL8AAACAAAAAAAAAAAAAAIA/AACAPwAAAAAAAACAAAAAAAAAgL8AAACAAAAAgAAAAAAAAIC/AACAPwAAAAAAAACAAAAAgAAAAAAAAIC/AAAAAAAAgD8AAACAAACAPwAAAAAAAACAAACAvwAAAAAAAACAlT6kvtojZD+VPqQ+lT6kvtojZD+VPqQ+AAAAAAAAAAAAAIA/EeJyvv4qcT8R4nI+EeJyvv4qcT8R4nI+EeJyvv4qcT8R4nI+AAAAAC6jcz95L50+AAAAAC6jcz95L50+AACAPwAAAAAAAACAAAAAAAAAAAAAAIA/AAAAAFXCTz/AkhU/AACAPwAAAAAAAACAAACAvwAAAAAAAACAwJIVv1XCTz8AAACAAAAAgAAAAAAAAIC/","uv":"yxcCP5fqFD+aBnE+NoCsPrggcj4SvBU/AiJIP5bqFD+aBnE+8pYBP5oGcT7ylgE/6f1GP5g2rD4CIkg/x3sBP5oGcT426BU/cjcBPzaArD5ymAA/ErwVP6BKcD6X6hQ/cjcBP/KWAT9yNwE/8pYBPz6WAT+W6hQ/cjcBPzboFT/SxwI/mDasPj6WAT85sAM/yxcCPyjlAj+4IHI+V9UCP8sXAj8o5QI/uCByPlfVAj+4IHI+tYwBP8sXAj/IewE/6f1GP7WMAT9ymAA/tYwBP9LHAj+1jAE/gA11PjqwAz9ymAA/V9UCP3KYAD9X1QI/oEpwPpoZBT8CIkg/oFUDPwIiSD+gVQM/mgZxPmS5Ez8=","indices":"EAAGABgAEAAYABoADQAFACEAIQAIAA8AIQAPAA0AAAASAB8AAAAfAAMABAAMAAkABAAJAAEACwAOABEAEQAbAB4AEQAeAAsAGQAWABMAGQATAB0ACgAcABUACgAVAAIAIAAUABcAIAAXAAcA"}];

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
    dimensions: { x: 0.7, y: 0.13, z: 0.7 },
    vertices: 34,
    triangles: 18,
    create: (name, scene) => createMasterMesh(name, scene),
    createInstance: (name, parent, scene) => createInstance(name, parent, scene)
  };

  global.ThonTranRegistry = global.ThonTranRegistry || {};
  global.ThonTranRegistry[MODEL_NAME] = AssetModule;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetModule;
  }
})(typeof window !== 'undefined' ? window : this);
