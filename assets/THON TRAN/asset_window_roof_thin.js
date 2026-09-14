/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Window_Roof_Thin
 * ============================================================================
 * Category: Cửa Sổ & Mái Cửa (windows)
 * Dimensions: 0.85m x 1.18m x 1.18m | Vertices: 92 | Faces: 46
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Window_Roof_Thin';
  const SUBMESHES = [{"matName":"MI_WoodTrim","texture":"T_WoodTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"ZTW2PlJntj8IWJ+9ZTW2PlJntj8IWJ+9nYSWPlJntj8IWJ+9nYSWPlJntj8IWJ+9ZTW2PqpKqz8AHGw6ZTW2PqpKqz8AHGw6nYSWPqpKqz8AIGw6nYSWPqpKqz8AIGw6XTW2PofTDkCH2U8/XTW2PofTDkCH2U8/kISWPojTDkCM2U8/kISWPojTDkCM2U8/XTW2Pu1KC0DH62w/XTW2Pu1KC0DH62w/kYSWPu1KC0DH62w/kYSWPu1KC0DH62w/uzXAvu1KC0DH62w/uzXAvu1KC0DH62w/74Sgvu1KC0DH62w/74Sgvu1KC0DH62w/vDXAvojTDkCM2U8/vDXAvojTDkCM2U8/74SgvofTDkCH2U8/74SgvofTDkCH2U8/rzXAvqpKqz8AIGw6rzXAvqpKqz8AIGw654SgvqpKqz8AHGw654SgvqpKqz8AHGw6rzXAvlJntj8IWJ+9rzXAvlJntj8IWJ+954SgvlJntj8IWJ+954SgvlJntj8IWJ+9","norm":"AAAAANyoPT8H8iu/AACAPwAAAAAAAACAAACAvwAAAIAAAAAAAAAAANyoPT8H8iu/AAAAANyoPb8H8is/AACAPwAAAAAAAACAAACAvwAAAIAAAAAAAAAAANyoPb8H8is/AAAAANyoPT8H8iu/AACAPwAAAAAAAACAAACAvwAAAIAAAAAAAAAAANyoPT8H8iu/AAAAANyoPb8H8is/AACAPwAAAAAAAACAAACAvwAAAIAAAAAAAAAAANyoPb8H8is/AACAvwAAAIAAAACAAAAAANyoPb8H8is/AAAAANyoPb8H8is/AACAPwAAAAAAAAAAAACAvwAAAIAAAACAAAAAANyoPT8H8iu/AAAAANyoPT8H8iu/AACAPwAAAAAAAAAAAACAvwAAAIAAAACAAAAAANyoPb8H8is/AAAAANyoPb8H8is/AACAPwAAAAAAAAAAAACAvwAAAIAAAACAAAAAANyoPT8H8iu/AAAAANyoPT8H8iu/AACAPwAAAAAAAAAA","uv":"LErAP6gEgD4Ehbq+QCdpPTjqob3QSTo+LErAP/yxnT4AAIA//LGdPgSFur4APow6OOqhvXwYAT4AAIA/qASAPg4uJT+oBIA+jUf8PkAnaT0BKUc/0Ek6PhYuJT/8sZ0+aAvgPfyxnT4SvAY/AD6MOk7BTz98GAE+ZgvgPaoEgD5OwU8/fBgBPmYL4D2qBIA+aAvgPfyxnT4SvAY/AD6MOgEpRz/QSTo+Fi4lP/yxnT4OLiU/qASAPo1H/D5AJ2k9OOqhvXwYAT4AAIA/qASAPgAAgD/8sZ0+BIW6vgA+jDo46qG90Ek6PixKwD/8sZ0+LErAP6gEgD4Ehbq+QCdpPQ==","indices":"BAAMAA8ABAAPAAcADgAKAAIADgACAAYABQABAAkABQAJAA0AAwALAAgAAwAIAAAAGgASABEAGgARABkAEAAUABwAEAAcABgAHQAVABYAHQAWAB4AGwAfABcAGwAXABMA"},{"matName":"MI_WoodTrim_Wear","texture":"T_WoodTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"dJxDPo3yBkBa34M/dJxDPo3yBkBa34M/dJxDPo3yBkBa34M/FOhSPk/sC0D4kYk/FOhSPk/sC0D4kYk/FOhSPk/sC0D4kYk/rFvsPtnaBkBTzIM/rFvsPtnaBkBTzIM/rFvsPtnaBkBTzIM/3LvpPuHyC0Dl0ok/3LvpPuHyC0Dl0ok/3LvpPuHyC0Dl0ok/oj2jvdX6C0Cgc4w/oj2jvdX6C0Cgc4w/oj2jvdX6C0Cgc4w/Ik+3vUEjBkAIwYY/Ik+3vUEjBkAIwYY/Ik+3vUEjBkAIwYY/CFdCPioVC0C+9Yw/CFdCPioVC0C+9Yw/CFdCPioVC0C+9Yw/8JhLPvU6BkAN1IY/8JhLPvU6BkAN1IY/8JhLPvU6BkAN1IY/0tC/vdX6C0Cdc4w/0tC/vdX6C0Cdc4w/0tC/vdX6C0Cdc4w/Ik+3vUMjBkAEwYY/Ik+3vUMjBkAEwYY/Ik+3vUMjBkAEwYY/tMrAvj+ZC0DUu4w/tMrAvj+ZC0DUu4w/tMrAvj+ZC0DUu4w/2eHEvvU6BkAM1IY/2eHEvvU6BkAM1IY/2eHEvvU6BkAM1IY/dOPCvajMGUCI0CE+dOPCvajMGUCI0CE+YvJLPu5dIECc0CE+YvJLPu5dIECc0CE+98bHvuPqGUCo0CE+98bHvuPqGUCo0CE+tc5FPuPqGUCm0CE+tc5FPuPqGUCm0CE+9UDmPn1eIECo0CE+9UDmPn1eIECo0CE+iFk7PmggIECo0CE+iFk7PmggIECo0CE+gMrNvcP+IECm0CE+gMrNvcP+IECm0CE+QDexvcH+IECm0CE+QDexvcH+IECm0CE+LdU9PloKGkCo0CE+LdU9PloKGkCo0CE+dOPCvabMGUCQ0CE+dOPCvabMGUCQ0CE+X0nEvhmkIECg0CE+X0nEvhmkIECg0CE+EnjpPiTsGUCo0CE+EnjpPiTsGUCo0CE+","norm":"/NJ8vzy1FT4Qs2o96+LHu6o6cr8ioqW+pUZYuyW/AL+kRF0//NJ8vzy1FT4Qs2o9pUZYuyW/AL+kRF0/DJ8Ju9DIcT/oPKg+6+LHu6o6cr8ioqW+pUZYuyW/AL+kRF0/bIV/P/wgdD061F48pUZYuyW/AL+kRF0/DJ8Ju9DIcT/oPKg+bIV/P/wgdD061F48K/h+vzfAqD3HlRA9hXSTvEW0976s/18/QwI8PVx2cT8/c6g+K/h+vzfAqD3HlRA9hXSTvEW0976s/18/e8i6Ozobcr+NWqa+hXSTvEW0976s/18/QwI8PVx2cT8/c6g+eYl+PwCI0j0U7es8hXSTvEW0976s/18/e8i6Ozobcr+NWqa+eYl+PwCI0j0U7es8qKSSvJOfcT+K6qg+J3ABPORf677+VWM/ULx/P/OsNj0/iQ48tH63u/gdcr/USqa+J3ABPORf677+VWM/ULx/P/OsNj0/iQ488Dx/vy5jkD2wmP88qKSSvJOfcT+K6qg+J3ABPORf677+VWM/8Dx/vy5jkD2wmP88tH63u/gdcr/USqa+J3ABPORf677+VWM/tH63u/gdcr/USqa+ULx/P/OsNj0/iQ48/NJ8vzy1FT4Qs2o9DJ8Ju9DIcT/oPKg+8Dx/vy5jkD2wmP88tH63u/gdcr/USqa+e8i6Ozobcr+NWqa+eYl+PwCI0j0U7es8DJ8Ju9DIcT/oPKg+bIV/P/wgdD061F48QwI8PVx2cT8/c6g+eYl+PwCI0j0U7es8qKSSvJOfcT+K6qg+ULx/P/OsNj0/iQ48K/h+vzfAqD3HlRA9QwI8PVx2cT8/c6g+/NJ8vzy1FT4Qs2o96+LHu6o6cr8ioqW+K/h+vzfAqD3HlRA9e8i6Ozobcr+NWqa+8Dx/vy5jkD2wmP88qKSSvJOfcT+K6qg+6+LHu6o6cr8ioqW+bIV/P/wgdD061F48","uv":"AAAAABJ4gT5MK5G+AD5PO+vdsz02HB8/AAAAAOyHnD5XoyI+NhwfP0wrkb4APk87TCuRvnjZ5z3r3bM9IblJPwAAAADsh5w+V6MiPiG5ST9MK5G+eNnnPQAAAAASeIE+AAAAABJ4gT7r3bM9NhwfPwAAgD/ARO49AAAAAOyHnD5XoyI+NhwfPwAAgD/ARO49692zPSG5ST8AAIA/AD9POwAAAADsh5w+V6MiPiG5ST8AAIA/AD9POwAAAAASeIE+DMrGPsxfBD7r3bM9NhwfP6z6Kz8SeIE+DMrGPsxfBD5XoyI+NhwfP6z6Kz/sh5w+rPorP+yHnD4MysY+MEV4Puvdsz0huUk/rPorPxJ4gT4MysY+MEV4PlejIj4huUk/Pz2GP9RfBD4TiKo/7oecPplhLD/sh5w+5ZfHPgA+Tzuqlao/FHiBPtdKhj84RXg+sJ6tPgA+TzuoMCk/FHiBPrRzxz6A2ec9gE8sPxR4gT7P/qE+AD9PO5kALz/uh5w+Wx+JP9RfBD4vaq0/FHiBPrHZLj8WeIE+nEyiPsBE7j3vmiY/FHiBPpMKvD4APk87dxUpP+6HnD4S1a0+wETuPZZ6rT/sh5w+wy+JPzhFeD4i1Ls+gNnnPbd/Jj/sh5w+","indices":"BwAJAAQABwAEAAIACgAsACcACgAnAAUAEgANABAAEgAQABUAFgARADcAFgA3ACoAIAAjABwAIAAcABkAIgApACQAIgAkABsAOwAtAAsAOwALAAgAKwAvABQAKwAUABcAJQAxABoAJQAaAB0AOAAoACEAOAAhAB4AJgA0AAAAJgAAAAMAMgA2AA8AMgAPAAwANQA6AAYANQAGAAEALgAzAA4ALgAOABMAMAA5AB8AMAAfABgA"}];

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
    category: 'windows',
    categoryVi: 'Cửa Sổ & Mái Cửa',
    icon: '🪟',
    dimensions: { x: 0.85, y: 1.18, z: 1.18 },
    vertices: 92,
    triangles: 46,
    create: (name, scene) => createMasterMesh(name, scene),
    createInstance: (name, parent, scene) => createInstance(name, parent, scene)
  };

  global.ThonTranRegistry = global.ThonTranRegistry || {};
  global.ThonTranRegistry[MODEL_NAME] = AssetModule;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetModule;
  }
})(typeof window !== 'undefined' ? window : this);
