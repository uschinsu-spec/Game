/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Prop_Brick1
 * ============================================================================
 * Category: Đạo Cụ Thôn Trấn (props)
 * Dimensions: 0.35m x 0.21m x 0.25m | Vertices: 82 | Faces: 108
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Prop_Brick1';
  const SUBMESHES = [{"matName":"MI_RockTrim","texture":"T_RockTrim_BaseColor.png","doubleSided":true,"isUint32":false,"pos":"pq3cPYYovT2MRd29pq3cPYYovT2MRd29o2kxPsTbN71ktfS9o2kxPsTbN71ktfS94zsvPtJ7vr2E6eu94zsvPtJ7vr2E6eu98yodPorC372f2ea9oObeu4LL272dOea9GEG/PCjNkrxub/q9zBhcPfH2LzzZIem9dCFKvXiZxTpIsP69NAECvcySHD20Nva9OrqgvS4qYjwBcAC+rQoovjhtijyDePu9rQoovjhtijyDePu91DpevXxhQz2Gkfi9vaYFvshr47z/ifW9+r+qvdQzOr3NHPO9OnrvvSr6jr0NafC9XfcqvuNufr1DD9G9XfcqvuNufr1DD9G9GsDqvXKu272RouW9fWAovomT3r0PL4q9fWAovomT3r0PL4q9rTcVvnKH0r1atte9pfQpvuHSuDv8aO29pfQpvuHSuDv8aO29be8rvvb4nD3LK/S9be8rvvb4nD3LK/S9fUoQvp7+xz1mpea9fUoQvp7+xz1mpea96pOQvb4uxz0IQei96pOQvb4uxz0IQei99ZYOvvWAtD10B/299OtIvTbSwT0VdOi99OtIvTbSwT0VdOi9PY4ivn3joT0BFf+97d0mvmaixT3FwNa97d0mvmaixT3FwNa97d0mvmaixT3FwNa9A/81Pohl3byb4eS9A/81Pohl3byb4eS9+2cyPg7wtD3Q49y9+2cyPg7wtD3Q49y9+2cyPg7wtD3Q49y9NtfcPQoOuj2eKLg9o2kxPkmyNL1+5vY9o2kxPkmyNL1+5vY94zsvPj3Ovb3uyfE94zsvPj3Ovb3uyfE98yodPkW5373sNuw9oObeu1XZ273sSus9RnX3Pc3alzymbfg9Fvj3PdY9MT3Nudk9GECaPO5m2DwOQv49LFESPUaobz0Wjek9+jGTvScKED0Ad/89/YslvoyGkjynk+Q9/YslvoyGkjynk+Q96ou2vYtyhT3ivPI9LXUJvhK99bwcTfM9Tc8ovibNgr02S8E9Tc8ovibNgr02S8E9iqjyvSUM4r0DHOc9lfsmvq6T3r2Kxn49lfsmvq6T3r2Kxn497foSvjbW1L3eedI9zYUnvjBAuju7ROI9zYUnvjBAuju7ROI99XspviN3nT1L6d899XspviN3nT1L6d89xR8Ovoo0xj2fHrY9UL9FvJIpxT0Roco9bQgMvksbtj1ACOo9MDAxPAoutT2d1Mo9DaMTvlMwrz3/bew99cgkviJ9wT3ZDKw99cgkviJ9wT3ZDKw9A/81PnRC4bzL3Nk9A/81PnRC4bzL3Nk9A3wyPvLysT0eQbs9A3wyPvLysT0eQbs9","norm":"msQxPXLnPD/jaiy/msQxPXLnPD/jaiy/FHskP0CTqbzQGES/FHskP0CTqbzQGES/OiUyPzl9u74CJx6/OiUyPzl9u74CJx6/ocWNPlMzQr/p/Ba/dxMDuvoVPr9deSu/mWIqPTvo4jwcrn+/pxODPSuKEj601Xy/2/MOPbiGSbwe03+/dqGSPX7Eyz3IEX6/SKGJO3mN27zi53+/zNEjv4gF57yqlkS/zNEjv4gF57yqlkS/D656Pf1t1j1DHH6/BzAdvtpWDr5Xc3q/gHOTuyz81L36m36/xj0Gvsat8r2k+Hu/oZZRv023Eb7iaQ6/oZZRv023Eb7iaQ6/X0HPvRYqOL/a6y+/ia4wv2zgNr92vOy9ia4wv2zgNr92vOy9/PDjvplLF7/dNSy/XYxQv37PTLy5bxS/XYxQv37PTLy5bxS/y2VZv0quWD5Xtfe+y2VZv0quWD5Xtfe+rXTgvb2Kaj8gX8W+rXTgvb2Kaj8gX8W++dvoPafqRD9U+SC/+dvoPafqRD9U+SC/y5IpvRUC+j5mJ1+/h1IFPtk2OD9KnS6/h1IFPtk2OD9KnS6/ldaUvu1crT4ZGGW/r8Ebv/gaQz/GnmK+r8Ebv/gaQz/GnmK+r8Ebv/gaQz/GnmK+l11KP4rWIzzFxRy/l11KP4rWIzzFxRy/Ww8XPyoXFD+BLBC/Ww8XPyoXFD+BLBC/Ww8XPyoXFD+BLBC/ap2rPeezUz9sVA4/coUpPyU0bzwEyz8/coUpPyU0bzwEyz8/XsYsPyYStL5SESY/XsYsPyYStL5SESY/w/+KPobVP78znRo/mpvEuonUOb+eEzA/8vN0PpDtgD4lEHA/dXEsPkwepz6YG24/gG8BPVtO8z3pDn4/XBa3Pc5Fwz5mims/4nfgvJcflj0FN38/4hw5v3ElZD1ZQTA/4hw5v3ElZD1ZQTA/xC4QOwxrXj4743k/e299vhu3r72pD3c/zRRev6CBBL496vU+zRRev6CBBL496vU+/xYzvr5JN7/cBS0/qjIyvyuNNb+cKuU9qjIyvyuNNb+cKuU9eYkRv5WfC7/mqx0/WvdIv6vdVz0SAh4/WvdIv6vdVz0SAh4/L41Gvw8bjT6AYRE/L41Gvw8bjT6AYRE/QeeuveUqez8QqzE+Rtv5PUMoXj+FofY+IsP+vJ5HPT/2LSw/Bg7YPTBfUj+YWg8/HnRtvsWlBz+Q1VA/+gsgv3q0RD+GLgw++gsgv3q0RD+GLgw+Oo9pP61vxT3uu8s+Oo9pP61vxT3uu8s+kf8dP8/MGT/PEQI/kf8dP8/MGT/PEQI/","uv":"a+mcPlCJTj6j+iM/zG9PPnI4lz7cE4k+2qG9PhhqNj68WJY+9Dt+PkrGxz7Eoz4+VkTJPpDfRz42oMY+RmqBPghqtD4c+XU+9pGuPngsaD6OXLA+kGGKPgk7qD7UsYY+GA2uPkzGkD7YP8g9iJVePnbTrj6g16M+60mmPqjAiz6SBbg+DjqbPsuWuj4OAZE+9y7APq4alz7geLY9jD1/PnSkwT5KNqI+6wnHPo6hlT7sbpk93C6JPkEozj4IpZ8+yVfHPsQKmz6YfcI9SEdjPqrRsT7UTKQ+DNjFPQTQRT6fg6E+hvOkPkTLmz6Imp8+AkolP7D0nz7ZGps+eNOPPghdJT+WcY8+ju+ePjy3nj7zi5s+eNqKPkJAJT/UZ4o+wy+hPlqfoj7wGLo9FE49Pn/nmz7kAKU+VV0kP+oApT4inpU+/OGMPk52uT50VjM+9ceUPjy/pD56Hp8+AG8wPoSiIz/kjzE+A+4NPyxRUz4KLks+riqJPqA4/D5Awjo+hj1MPvQ7fj5QRvI+mO0/PsZn8D5I/Uc+eJLxPtSugT5SOwU/vJFPPspOCD8AuE0+bhMGP3gZej5cuAk/7BxzPmp1Bj/+BZA+BPBMOwguXT6JGAQ/xNqjPvSNCT9QCpQ+THr+Pur8mz4h0x88mB9/Pjje9D5UM6I+CBHwPm4clj5Qwrg82OeIPq+g6D6O/58+1Z/vPnTKmj4E62c7xEpiPtirAj+k76M+Ai+NO/i9RD5oAws/jCmkPniGDj8sxJ4+Lb8NPwS8hD783As/8qSdPhJDDT+0GH8+jYELP54nnz7BCm88FE49Pta5Dj8g5qM+mQhRPpy6jD5VWwA/zBA2PoUnVz68ZKQ+VkUNPyCENT4=","indices":"AQAjAEoAAQBKAC0AMwA/ABUAMwAVAAcABgAFADEABgAxADIAFwAVAD8AFwA/AEEATgAuAAIATgACACgAAwAFAAYAAwAGAAgALgAwAAQALgAEAAIACAAGAAcACAAHAAoACAAKAAsACAALAAkAAwAIAAkAAwAJACkACgAMAA8ACgAPAAsABwARAAwABwAMAAoAGgAOAAwAGgAMABAADgAkAA8ADgAPAAwAEQASABAAEQAQAAwABwAVABIABwASABEAEgAVABgAEgAYABQAEAASABQAEAAUABoAMgAzAAcAMgAHAAYAEwAWAEAAEwBAAD0AFQAXABgAFwAUABgAGQATAD0AGQA9AEMAQwA5AA0AQwANABkAGwANADkAGwA5AEUAJQAbAEUAJQBFAEwAHgAnAE0AHgBNAEcAIAAeAEcAIABHAEgASABKACMASAAjACAAUABOACgAUAAoACoADwAkACEADwAhAB8AHQAfACEAHwAiAAsAHwALAA8ACQALACIACQAiAAAAJgAdACEAJgAhACQAJAAOABwAHAAmACQAAAArACkAAAApAAkALwA0ADIALwAyADEANAA2ADMANAAzADIANAA1ADcANAA3ADYALwBPADUALwA1ADQANgA3ADsANgA7ADgAMwA2ADgAMwA4ADwARAA8ADgARAA4ADoAOgA4ADsAOgA7AEsAMwA8AD8APAA+AEIAPABCAD8APABEAD4APwBCAEEAQQBCAD4AOwBIAEkAOwBJAEsARwBJAEgASAA7ADcASAA3AEoANQAtAEoANQBKADcATQBLAEkATQBJAEcASwBGADoARgBLAE0ALQA1AE8ALQBPAFEALAABAC0ALAAtAFEA"}];

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
    dimensions: { x: 0.35, y: 0.21, z: 0.25 },
    vertices: 82,
    triangles: 108,
    create: (name, scene) => createMasterMesh(name, scene),
    createInstance: (name, parent, scene) => createInstance(name, parent, scene)
  };

  global.ThonTranRegistry = global.ThonTranRegistry || {};
  global.ThonTranRegistry[MODEL_NAME] = AssetModule;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetModule;
  }
})(typeof window !== 'undefined' ? window : this);
