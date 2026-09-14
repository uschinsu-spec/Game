/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Window_Roof_Wide
 * ============================================================================
 * Category: Cửa Sổ & Mái Cửa (windows)
 * Dimensions: 1.42m x 1.18m x 1.18m | Vertices: 132 | Faces: 66
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Window_Roof_Wide';
  const SUBMESHES = [{"matName":"MI_WoodTrim","texture":"T_WoodTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"uK0jP1Jntj8GWJ+9uK0jP1Jntj8GWJ+9CAYKP1Jntj8GWJ+9CAYKP1Jntj8GWJ+9uK0jP6pKqz8AG2w6uK0jP6pKqz8AG2w6CAYKP6pKqz8AH2w6CAYKP6pKqz8AH2w6sq0jP4fTDkCH2U8/sq0jP4fTDkCH2U8//QUKP4jTDkCM2U8//QUKP4jTDkCM2U8/sq0jP+1KC0DH62w/sq0jP+1KC0DH62w//gUKP+1KC0DH62w//gUKP+1KC0DH62w/uK0jv1Jntj8GWJ+9uK0jv1Jntj8GWJ+9CAYKv1Jntj8GWJ+9CAYKv1Jntj8GWJ+9uK0jv6pKqz8AG2w6uK0jv6pKqz8AG2w6CAYKv6pKqz8AH2w6CAYKv6pKqz8AH2w6sq0jv4fTDkCH2U8/sq0jv4fTDkCH2U8//QUKv4jTDkCM2U8//QUKv4jTDkCM2U8/sq0jv+1KC0DH62w/sq0jv+1KC0DH62w//gUKv+1KC0DH62w//gUKv+1KC0DH62w/","norm":"AAAAANyoPT8H8iu/AACAPwAAAAAAAAAAAACAvwAAAIAAAAAAAAAAANyoPT8H8iu/AAAAANyoPb8H8is/AACAPwAAAAAAAAAAAACAvwAAAIAAAAAAAAAAANyoPb8H8is/AAAAANyoPT8H8iu/AACAPwAAAAAAAAAAAACAvwAAAIAAAAAAAAAAANyoPT8H8iu/AAAAANyoPb8H8is/AACAPwAAAAAAAAAAAACAvwAAAIAAAAAAAAAAANyoPb8H8is/AACAvwAAAAAAAAAAAAAAgNyoPT8H8iu/AAAAgNyoPT8H8iu/AACAPwAAAIAAAAAAAACAvwAAAAAAAAAAAAAAANyoPb8H8is/AAAAANyoPb8H8is/AACAPwAAAIAAAAAAAACAvwAAAAAAAAAAAAAAgNyoPT8H8iu/AAAAgNyoPT8H8iu/AACAPwAAAIAAAAAAAACAvwAAAAAAAAAAAAAAANyoPb8H8is/AAAAANyoPb8H8is/AACAPwAAAIAAAAAA","uv":"LErAP6gEgD4Ehbq+QCdpPTjqob3QSTo+LErAP/yxnT4AAIA//LGdPgSFur4APow6OOqhvXwYAT4AAIA/qASAPg4uJT+oBIA+jUf8PkAnaT0BKUc/0Ek6PhYuJT/8sZ0+aAvgPfyxnT4SvAY/AD6MOk7BTz98GAE+ZgvgPaoEgD4Ehbq+QCdpPSxKwD+oBIA+LErAP/yxnT446qG90Ek6PgSFur4APow6AACAP/yxnT4AAIA/qASAPjjqob18GAE+jUf8PkAnaT0OLiU/qASAPhYuJT/8sZ0+ASlHP9BJOj4SvAY/AD6MOmgL4D38sZ0+ZgvgPaoEgD5OwU8/fBgBPg==","indices":"BAAMAA8ABAAPAAcADgAKAAIADgACAAYABQABAAkABQAJAA0AAwALAAgAAwAIAAAAFQAWAB4AFQAeAB0AHwAXABMAHwATABsAFAAcABgAFAAYABAAEgARABkAEgAZABoA"},{"matName":"MI_WoodTrim_Wear","texture":"T_WoodTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"dJxDPo3yBkBa34M/dJxDPo3yBkBa34M/dJxDPo3yBkBa34M/FOhSPk/sC0D4kYk/FOhSPk/sC0D4kYk/FOhSPk/sC0D4kYk/rFvsPtnaBkBTzIM/rFvsPtnaBkBTzIM/rFvsPtnaBkBTzIM/3LvpPuHyC0Dl0ok/3LvpPuHyC0Dl0ok/3LvpPuHyC0Dl0ok/qKRAP9X6C0Cdc4w/qKRAP9X6C0Cdc4w/qKRAP9X6C0Cdc4w/V3VBP0MjBkAEwYY/V3VBP0MjBkAEwYY/V3VBP0MjBkAEwYY/0HLwPszJC0CpzYs/0HLwPszJC0CpzYs/0HLwPszJC0CpzYs/rFvsPvU6BkAM1IY/rFvsPvU6BkAM1IY/rFvsPvU6BkAM1IY/oj2jvdX6C0Cgc4w/oj2jvdX6C0Cgc4w/oj2jvdX6C0Cgc4w/Ik+3vUEjBkAIwYY/Ik+3vUEjBkAIwYY/Ik+3vUEjBkAIwYY/CFdCPioVC0C+9Yw/CFdCPioVC0C+9Yw/CFdCPioVC0C+9Yw/8JhLPvU6BkAN1IY/8JhLPvU6BkAN1IY/8JhLPvU6BkAN1IY/qYHHvuHyC0Dl0ok/qYHHvuHyC0Dl0ok/qYHHvuHyC0Dl0ok/2eHEvtnaBkBTzIM/2eHEvtnaBkBTzIM/2eHEvtnaBkBTzIM/veQjvyDKDED4kYk/veQjvyDKDED4kYk/veQjvyDKDED4kYk/p7cnv43yBkBa34M/p7cnv43yBkBa34M/p7cnv43yBkBa34M/0tC/vdX6C0Cdc4w/0tC/vdX6C0Cdc4w/0tC/vdX6C0Cdc4w/Ik+3vUMjBkAEwYY/Ik+3vUMjBkAEwYY/Ik+3vUMjBkAEwYY/tMrAvj+ZC0DUu4w/tMrAvj+ZC0DUu4w/tMrAvj+ZC0DUu4w/2eHEvvU6BkAM1IY/2eHEvvU6BkAM1IY/2eHEvvU6BkAM1IY/K6Ilv787IUCc0CE+K6Ilv787IUCc0CE+dOPCvajMGUCI0CE+dOPCvajMGUCI0CE+eCkpv1oKGkCo0CE+eCkpv1oKGkCo0CE+YvJLPu5dIECc0CE+YvJLPu5dIECc0CE+98bHvuPqGUCo0CE+98bHvuPqGUCo0CE+tc5FPuPqGUCm0CE+tc5FPuPqGUCm0CE+jnbpPuPqGUCo0CE+jnbpPuPqGUCo0CE+9UDmPn1eIECo0CE+9UDmPn1eIECo0CE+iFk7PmggIECo0CE+iFk7PmggIECo0CE+gMrNvcP+IECm0CE+gMrNvcP+IECm0CE+QDexvcH+IECm0CE+QDexvcH+IECm0CE+ceU+P8P+IECm0CE+ceU+P8P+IECm0CE+LdU9PloKGkCo0CE+LdU9PloKGkCo0CE+pfTsPgjTIECo0CE+pfTsPgjTIECo0CE+c8XHviTsGUCo0CE+c8XHviTsGUCo0CE+jfzKvn1eIECo0CE+jfzKvn1eIECo0CE+dOPCvabMGUCQ0CE+dOPCvabMGUCQ0CE+X0nEvhmkIECg0CE+X0nEvhmkIECg0CE+zQJAP6jMGUCI0CE+zQJAP6jMGUCI0CE+EnjpPiTsGUCo0CE+EnjpPiTsGUCo0CE+","norm":"/NJ8vzy1FT4Qs2o96+LHu6o6cr8ioqW+pUZYuyW/AL+kRF0//NJ8vzy1FT4Qs2o9pUZYuyW/AL+kRF0/DJ8Ju9DIcT/oPKg+6+LHu6o6cr8ioqW+pUZYuyW/AL+kRF0/bIV/P/wgdD061F48pUZYuyW/AL+kRF0/DJ8Ju9DIcT/oPKg+bIV/P/wgdD061F48yytLvBiMcT/aeqk+blbBuyf+2L7t3Wc/9tR/P6WkEj08grc7blbBuyf+2L7t3Wc/tH63u/gdcr/USqa+9tR/P6WkEj08grc7gEF/vzOKjj1F8/08yytLvBiMcT/aeqk+blbBuyf+2L7t3Wc/gEF/vzOKjj1F8/08blbBuyf+2L7t3Wc/tH63u/gdcr/USqa+K/h+vzfAqD3HlRA9hXSTvEW0976s/18/QwI8PVx2cT8/c6g+K/h+vzfAqD3HlRA9hXSTvEW0976s/18/e8i6Ozobcr+NWqa+hXSTvEW0976s/18/QwI8PVx2cT8/c6g+eYl+PwCI0j0U7es8hXSTvEW0976s/18/e8i6Ozobcr+NWqa+eYl+PwCI0j0U7es8XJh/vNCD8b6dsWE/cEpIPRiIcT+g1Kc+bIV/P/wgdD061F48XJh/vNCD8b6dsWE/6+LHu6o6cr8ioqW+bIV/P/wgdD061F48BYp9vxKVAz5mtlE9XJh/vNCD8b6dsWE/cEpIPRiIcT+g1Kc+BYp9vxKVAz5mtlE9XJh/vNCD8b6dsWE/6+LHu6o6cr8ioqW+qKSSvJOfcT+K6qg+J3ABPORf677+VWM/ULx/P/OsNj0/iQ48tH63u/gdcr/USqa+J3ABPORf677+VWM/ULx/P/OsNj0/iQ488Dx/vy5jkD2wmP88qKSSvJOfcT+K6qg+J3ABPORf677+VWM/8Dx/vy5jkD2wmP88tH63u/gdcr/USqa+J3ABPORf677+VWM/BYp9vxKVAz5mtlE9cEpIPRiIcT+g1Kc+tH63u/gdcr/USqa+ULx/P/OsNj0/iQ48BYp9vxKVAz5mtlE96+LHu6o6cr8ioqW+/NJ8vzy1FT4Qs2o9DJ8Ju9DIcT/oPKg+8Dx/vy5jkD2wmP88tH63u/gdcr/USqa+e8i6Ozobcr+NWqa+eYl+PwCI0j0U7es8gEF/vzOKjj1F8/08tH63u/gdcr/USqa+DJ8Ju9DIcT/oPKg+bIV/P/wgdD061F48QwI8PVx2cT8/c6g+eYl+PwCI0j0U7es8qKSSvJOfcT+K6qg+ULx/P/OsNj0/iQ48K/h+vzfAqD3HlRA9QwI8PVx2cT8/c6g+yytLvBiMcT/aeqk+9tR/P6WkEj08grc7/NJ8vzy1FT4Qs2o96+LHu6o6cr8ioqW+gEF/vzOKjj1F8/08yytLvBiMcT/aeqk+6+LHu6o6cr8ioqW+bIV/P/wgdD061F48cEpIPRiIcT+g1Kc+bIV/P/wgdD061F48K/h+vzfAqD3HlRA9e8i6Ozobcr+NWqa+8Dx/vy5jkD2wmP88qKSSvJOfcT+K6qg+tH63u/gdcr/USqa+9tR/P6WkEj08grc76+LHu6o6cr8ioqW+bIV/P/wgdD061F48","uv":"AAAAABJ4gT5MK5G+AD5PO+vdsz02HB8/AAAAAOyHnD5XoyI+NhwfP0wrkb4APk87TCuRvnjZ5z3r3bM9IblJPwAAAADsh5w+V6MiPiG5ST9MK5G+eNnnPQAAAAASeIE+AACAP8BE7j3r3bM9NhwfPwAAAAASeIE+V6MiPjYcHz8AAIA/wETuPQAAAADsh5w+AAAAAOyHnD4AAIA/AD9PO+vdsz0huUk/AAAAABJ4gT5XoyI+IblJPwAAgD8AP087AAAAABJ4gT7r3bM9NhwfPwAAgD/ARO49AAAAAOyHnD5XoyI+NhwfPwAAgD/ARO49692zPSG5ST8AAIA/AD9POwAAAADsh5w+V6MiPiG5ST8AAIA/AD9POwAAAAASeIE+V6MiPiG5ST8AAIA/cJUHPgAAAAASeIE+692zPSG5ST8AAIA/cJUHPgAAAADsh5w+AAAAAOyHnD5XoyI+NhwfPwAAgD84RXg+AAAAABJ4gT7r3bM9NhwfPwAAgD84RXg+DMrGPsxfBD7r3bM9NhwfP6z6Kz8SeIE+DMrGPsxfBD5XoyI+NhwfP6z6Kz/sh5w+rPorP+yHnD4MysY+MEV4Puvdsz0huUk/rPorPxJ4gT4MysY+MEV4PlejIj4huUk/mWEsP+yHnD7PPKc+OEV4Pj89hj/UXwQ+E4iqP+6HnD7vmiY/FHiBPiHKsj44RXg+mWEsP+yHnD7ll8c+AD5PO6qVqj8UeIE+10qGPzhFeD6wnq0+AD5PO6gwKT8UeIE+qDApPxR4gT6xnq0+AD5PO7Rzxz6A2ec9gE8sPxR4gT7P/qE+AD9PO5kALz/uh5w+Wx+JP9RfBD4vaq0/FHiBPrHZLj8WeIE+nEyiPsBE7j2fTKI+wETuPbDZLj8UeIE+75omPxR4gT6TCrw+AD5POzvhLj/uh5w+ij2iPgA/TzuSALM+cJUHPrd/Jj/sh5w+AGGnPnCVBz6ATyw/FHiBPncVKT/uh5w+EtWtPsBE7j2Weq0/7IecPsMviT84RXg+D9WtPsBE7j15FSk/7oecPiLUuz6A2ec9t38mP+yHnD4=","indices":"BwAJAAQABwAEAAIACgBKAEMACgBDAAUAFAAWAA8AFAAPAA0AFwBJAGAAFwBgABAAHgAZABwAHgAcACEAIgAdAF0AIgBdAEYAJwAkACsAJwArAC4AJQBaAD0AJQA9ACwAOAA7ADQAOAA0ADEAOgBFAD4AOgA+ADMAYwBLAAsAYwALAAgARwBNACAARwAgACMAQQBYACgAQQAoAC8AYQBTAA4AYQAOABEAPwBPADIAPwAyADUAUgBXABMAUgATAAwAPABAAC0APAAtACoAWQBbACYAWQAmACkAVgBIABUAVgAVABIAXgBEADkAXgA5ADYAQgBUAAAAQgAAAAMAUABcABsAUAAbABgAVQBiAAYAVQAGAAEATABRABoATAAaAB8ATgBfADcATgA3ADAA"}];

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
    dimensions: { x: 1.42, y: 1.18, z: 1.18 },
    vertices: 132,
    triangles: 66,
    create: (name, scene) => createMasterMesh(name, scene),
    createInstance: (name, parent, scene) => createInstance(name, parent, scene)
  };

  global.ThonTranRegistry = global.ThonTranRegistry || {};
  global.ThonTranRegistry[MODEL_NAME] = AssetModule;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetModule;
  }
})(typeof window !== 'undefined' ? window : this);
