/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Prop_Brick3
 * ============================================================================
 * Category: Đạo Cụ Thôn Trấn (props)
 * Dimensions: 0.38m x 0.25m x 0.22m | Vertices: 98 | Faces: 126
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Prop_Brick3';
  const SUBMESHES = [{"matName":"MI_RockTrim","texture":"T_RockTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"ZX9GPmh77j0H5Se9ZX9GPmh77j0H5Se9ISlGPuZRAT4RrtQ8ISlGPuZRAT4RrtQ8AW1IPuInpz2rcO+8MnWUPRgTCj7wy/K86ddJPlS0sT1TocK96ddJPlS0sT1TocK9knmIPXCOAD4MEK69gdcwPh2h4T1r7rq98Z0nvvzS/D1kWqm98Z0nvvzS/D1kWqm9Sdg6voQUWz1iQsO9Sdg6voQUWz1iQsO9aLuMvOv69zziJNC9WFrIvCBIkrxBq969+xU6vhL7ozwRttC9+xU6vhL7ozwRttC9YqL4vRUZrb3f0M69aaxGPuQJjT0D4c29aaxGPuQJjT0D4c296CGgvP7mqL13ds69wbAUPphvsr0PKMq9Paw/Pu0XmL2Xfce9Paw/Pu0XmL2Xfce9gqPQPUDT4b2/4rC9ytrPPaW86r29cgS9OIWhvAJ74b1PCLe9Gas5PntX1r1PyJG9Gas5PntX1r1PyJG9ZTw1PjAK4729cgS9ZTw1PjAK4729cgS9ERczPnul1b1hq7w9ERczPnul1b1hq7w9ERczPnul1b1hq7w9/Z5FPlQ9pb3dzPK8uQhCPhr0l73pkbw9XfBKPva2FzylAfK8KSdFPpaGAT1eOLw95Y82PkB6Cz1ug9I95Y82PkB6Cz1ug9I9jTZIPnGSsj1dCbw9dfFHPplQvT3tBLw9LXA8Pl10sz39Ms89LXA8Pl10sz39Ms89VDIDPZo8hz1mvdc9lG8VPdHPmj0V1cY9/fs/Pv2O4T3t9bs9/fs/Pv2O4T3t9bs92YE/PmqxBD4oF0o92YE/PmqxBD4oF0o92miKPWoo8D2s87Y9B2AQvpVS/T1kGKo9M1UovoIZ+z2EH4Y9M1UovoIZ+z2EH4Y9scQpvlCOxj0VkbA9scQpvlCOxj0VkbA9E2Ervi4pgD22Tb09E2Ervi4pgD22Tb09E3sqvjsNgL3wjMg9E3sqvjsNgL3wjMg9L/o6vi/yOD1mDJ49E5s7vlVymjyGzPK8jRU5vive1z1ddo89iZ4vvmcEur1J9Ko9iZ4vvmcEur1J9Ko9M0kvvsFk3r35PbA9M0kvvsFk3r35PbA9M0kvvsFk3r35PbA99xMzvsGM1b14nSi89xMzvsGM1b14nSi84wcyvvi9x70emw294wcyvvi9x70emw29Fh/6vbY/6729cgS931AIvqqd4L1Jyrc931AIvqqd4L1Jyrc92JnRvPgA6729cgS9sUQBviVx4b3PlLW9CcYQvlPl6r0+k5+9M0kvvlVp370nLK29M0kvvlVp370nLK29PU8wvp7pUb1Aycy9PU8wvp7pUb1Aycy9OIWhvHCx4L3hMbk9OIWhvHCx4L3hMbk9GF2XvOHgp73Jndc9gqPQPbrk4L1BmrM9gqPQPbrk4L1BmrM9wbAUPlb7sL3pm9M9SP3MPH+4LT328No9zcUzPlzYlr2Rosw9zcUzPlzYlr2Rosw9LnH2vXnKrb3Ryso9ufw4vvwS8D0OzPK8KX0rvrmQBj7vy/K8KX0rvrmQBj7vy/K8Axs5vsVk2D3rYrS9Axs5vsVk2D3rYrS9","norm":"gXI3P9uiMT8f/5C9gXI3P9uiMT8f/5C96C4wP+a0OT8oyDo86C4wP+a0OT8oyDo8Dex/P9s+xjwlSZ07Ajg0PZaBfz9MZjO9ThU6P1+AlT57IB+/ThU6P1+AlT57IB+/4m7OPGuROj8kLS+/2vtpPihVMD+7IDC/FVqVvmr1Oj/9IR6/FVqVvmr1Oj/9IR6/nAA4v85W5D3Pri+/nAA4v85W5D3Pri+/IgGRvNE/OT45vHu/mAu+u5wesDzB73+/NfIwv6QdJzwG/Di/NfIwv6QdJzwG/Di/21OFvbLfcb53Mni/CwMkPwrilD18rUO/CwMkPwrilD18rUO/FOTHO7bOir5WaHa/OKLwPUJdyb60cGm/UcklP9ytmL4QgjO/UcklP9ytmL4QgjO/IRc3PQDxU78BIQ+/nZQHPW7Gf7/3idK8U89eO5A3Ub9GhhO/C0gSP3rYQr/TIp2+C0gSP3rYQr/TIp2+2JALPwqFVr/SDse82JALPwqFVr/SDse8Wu3lPuWHPr+bHv0+Wu3lPuWHPr+bHv0+Wu3lPuWHPr+bHv0+cZJ4P8ZsdL7dM2+8WHhaPymbVb4BlfQ+V89/P0UdBb0zkam8iXlhP/287Lz5AvI+01WhPsiY/7s683I/01WhPsiY/7s683I/TLNmP//gRzzR190+i7ZfPyTgOj6js+Y+++mZPvvPCD5gwHE/++mZPvvPCD5gwHE/wzEivY4auj4zRm4/NX5QvaX36D5Yl2M/i8PxPryfGT8lTCU/i8PxPryfGT8lTCU/xdrVPj1kZj8tyf89xdrVPj1kZj8tyf89T7YEvKs0QT8u8Cc/VPYCvhOWOz/LGSs/ZOfVvqNiWT9va6U+ZOfVvqNiWT9va6U+/7HbviyBkz5gKFs//7HbviyBkz5gKFs/I5HivnyW5T0qxWM/I5HivnyW5T0qxWM/MGTuvusTcr1MDWI/MGTuvusTcr1MDWI/G7Vxv7XQ3ju8pag+/Np/v2ShCb29Sh268yRWv41YyD5MZ8Q+lvdSv8qaFb5vGww/lvdSv8qaFb5vGww/Q/0Xv18zJL/EyPg+Q/0Xv18zJL/EyPg+Q/0Xv18zJL/EyPg+8n08v4hJLL9I+Y+98n08v4hJLL9I+Y+9hjVTvyfND78y6nu9hjVTvyfND78y6nu932mrvRUZf79q8bC7t44GvsfiSr/Qcxg/t44GvsfiSr/Qcxg/KBIDOlvyf7+NHae88pJ/vBSsRL9Z1CO/WgZ5vZO8fL+Hnxa+aVsjv8pAJL9t6dm+aVsjv8pAJL9t6dm+fwIIv65ZE77IulW/fwIIv65ZE77IulW/zWSqu8vBV7+Cxwk/zWSqu8vBV7+Cxwk/7fKwvLtBcb5mu3g/ggTePBtaXb/+agA/ggTePBtaXb/+agA/eMpDPU6ohr4pr3Y/t9ijvPvIujza4X8/wW2UPqj6HL7U13E/wW2UPqj6HL7U13E/7aOjvds7Ur7StXk/pHdovww31j6wL5m8z/XIvk1Xaz8I7uu8z/XIvk1Xaz8I7uu8Rm4xv788qj4ovCO/Rm4xv788qj4ovCO/","uv":"1yf0PoBYHj4gZy0/AHP8O7l/9T64uQE+eN80PwCT+ju/qew+hAwaPqAuLz9gFnA9REnuPvDcNT62BiY/gGoLPCx2KT/wTHs9M14oP0D4ozziB5Y+cKAuPtpxKT+QlR0+IgCGPnAkKD6d5iE/wGglPqGUHz+gRMA9SZIaP+CRxT3c830+CPwkPjhMHj/o3yQ+tYcTPxThCT7/eOo+rHg4PiAWJD+AuRs81vUTP9iFwD3W1xM/AKLwPCMFzD6seDg+hAYVP4BFSDzZIRE/gNg8PSytCz9QODY9TeQQP7AOwD22WMU+QIEtPv2xED+AcGI8ZKfDPmQjHT6yggw/gPxjPOZRxT6IBNQ9htT+PoDgKTwMbVM/YJOcPMSvyj6w/Rs+bxzMPrgQ1z2Vh90+RDkbPm1E4T6wtNA9hoPhPuDJwT3xyEQ/AKV4PCyN7D64kNA9YZntPvBW0D3stuw+SHvEPUATPz8Aykk8YDVBP0jLmD2g6D8/YDCVPSNP8T6AR809VHo8P4BqLzxDIvY+cNjuPaBrNz8AHyg8dJE7P+D8dT3xbTo/3MsPPt4XlD4QwWs+WCU5PyQSGj5nu44+JDJ0PsWnPD8ARRs+8nOHPvCNdz7+Z0A/nPsdPuV8Wj4kUHk+P39NPyxlID6ehYM+eJpuPhC9fD6YNkM+LGGPPsQ3az4slE4+0OVyPiq5UD/02CM+iQpHPhT7cz6MDfw+TEYdPtiVUj+0liM+nfZIPqwVSz4GQwg/LH4gPhLRSz7A20A+CvEKPxwgIT6oxAo/3N4JPpiV+z6wBg0+gq9SP9y2Ez7UAAs/AD/DPWydED/AlQs+sXQPP+zpET6JCkc+uLYrPjphED+8RB4+dIFfPlQYJT6ZuxY/XKYfPppH/D4Y2bk9DmxTPyBMyT1+K1A/mO3GPXp+/j7wCyY9TANUPxC1Rz0hNVE/4FD+PJicQz9wLZ89/JbLPtA8yj26GVA/4GeWPD8HUD/Asg0+somSPtR5RD44fJY+nNhEPkIjLz+YZB8+ZOOQPlBHLD4ofCc/NN4kPg==","indices":"MwADAAEAMwABAAUABAAAAAIAAgAqACkAAgApAAQAAAAEAAYACAAFAAEACQABAAcAAQAJAAgACAAJAAcACAAHAA4ACwBfAAUACwAFAAgACwAIAA0ACwANAGEADgANAAgADQAOAA8ADQAPABEABwAUAA8ABwAPAA4ADwASAFIADwBSABEADwAVABIAFAAYABYAFAAWAA8AFQAPABYAFgAZABsAFgAbABUAGAAdABkAGAAZABYAHwAaABkAHwAZAB0AGQAaAEwAGQBMABsAFwAjAB4AFwAeABwAJAAgAB4AJAAeACMAHwAhAFYAHwBWABoAJQAmACQAJQAkACMAJQAjABcAJQAXABMAKQAmACUAKQAlAAQABgAEACUABgAlABMAJAAmACcAJAAnAFoAKwAnACYAKwAmACkAKQAqACsALAAuAC0ALAAtAFkALABZACgAMwAuACwAMwAsADAAKgAvACsAMwAwADIAMQAvACoAMQAqAAIAAwAzADIAXwA2ADQANAAzAAUANAAFAF8AOgAuADMAOgAzADQAOAA0ADYANAA4ADoALQAuADoAOgA8AFkAOgBZAC0AOwA5AD0AOwA9AEAAOQA3AD8AOQA/AD0APgBFAEAAPgBAAD0APgA9AD8APgA/AF0ASwBcADwAPABBAEQAPABEAEsAQABFAEIASQBGAEgARwBFAD4ARgBJAEoARgBKAEMAUwBKAEkAUwBJAEwAGwBMAEkAGwBJAE0ASQBIAFAASQBQAE4ATgBNAEkAUABNAE4APgAMABAAPgAQAE8ARwA+AE8AUQBPABAAEgBNAFAAEgBQAFIAFQAbAE0AFQBNABIAVgBTAEwAVgBMABoAVQBcAEsAVQBLAFQAWABVAFQAWABUAFcAWwBYAFcAWwBXACIAVQBYAFkAKABZAFgAKABYAFsAWgAgACQAWQA8AFwAWQBcAFUAXQA/ADUAXQA1AF4ANQA/ADcAPgBdAGAAPgBgAAwAXQBeAAoAXQAKAGAA"}];

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
    dimensions: { x: 0.38, y: 0.25, z: 0.22 },
    vertices: 98,
    triangles: 126,
    create: (name, scene) => createMasterMesh(name, scene),
    createInstance: (name, parent, scene) => createInstance(name, parent, scene)
  };

  global.ThonTranRegistry = global.ThonTranRegistry || {};
  global.ThonTranRegistry[MODEL_NAME] = AssetModule;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetModule;
  }
})(typeof window !== 'undefined' ? window : this);
