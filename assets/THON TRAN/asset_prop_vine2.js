/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: Prop_Vine2
 * ============================================================================
 * Category: Đạo Cụ Thôn Trấn (props)
 * Dimensions: 1.39m x 2.6m x 0.21m | Vertices: 88 | Faces: 45
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {
  'use strict';

  const MODEL_NAME = 'Prop_Vine2';
  const SUBMESHES = [{"matName":"MI_Vine","texture":"T_VineLeaf_png.png","doubleSided":true,"isUint32":false,"pos":"LrYfvojM9r5IFic9/N5OP4jM9r5IFic9LrYfvojM9j5UFic9/N5OP4jM9j5UFic9MgbqvgosIr9JCQg9eMicPojZPr9H2yc+ihCvvuDGDz5UlcQ8Ir7XPkCH6Dyeax4+HF5kP/2fVL/TSpM7I3sNPr+Bgb8YleA9ToM1P0P3jr2mXFY7bMA3vdWEgL5PE949rDucPlyQnb+eFS0+HOTlvkfsnr/s+iC9m1uXPg6s5b5ujCc+MMTqvrwb6760Hze9Almsvo+RcL+KMuY9JZZ7vr87cL+qF6Q9cvT8vkh7lr8iMi0+cvT8vkh7lr8iMi0+XHEEvjvPlb9loCI9XHEEvjvPlb9loCI91B3RvqAyi78lwQ0+pKEuvmXCir+/LV09pKEuvmXCir+/LV09MDFkvuyWsL+Dy5Y9xo2wvnrQsL+2d+89+hkjP88fxb80TxK8IHYhPEsoz78sVQI9KAAPP/lVab/0UQu84J+Mve5mfb9+FAQ94tAmP2C0tr9pK8A9FOOFPaMFm7++JCW8MwheP/oJVb+7B+09ZeePPnysHb/mvUE8QHjcPCcbqL9aaL08NGjwPUDwp7/RB2g9qGgFvqhNxr85aAy9qGgFvqhNxr85aAy9WixuPpuhxb9YRM09WixuPpuhxb9YRM092Nw3vQAFu7+QD0G72Nw3vQAFu7+QD0G7bGlEPsWUur+roq09bGlEPsWUur+roq09aGsOPkxp4L8iz4c9wAyRPNmi4L9at648uOwNPpfAmr/81M498ppwPrCVmr8xD8U9kCPqvBjzuL/KJd49kCPqvBjzuL/KJd49XES3PgtHuL9r4bY9XES3PgtHuL9r4bY9YBt/PXCqrb8jiNU9jvmgPjU6rb8577s9cWKEPrwO07+Xir89m2EEPklI079jqsw9ImzXPd97v79MaL08IltIPvhQv7/KB2g9cAZVvWCu3b9BaAy9cAZVvWCu3b9BaAy9simfPlMC3b9VRM09simfPlMC3b9VRM09UL8IPbhl0r8AEEG7UL8IPbhl0r8AEEG7OkiKPn310b+ooq09cpJePgTK978fz4c9QpHEPZED+L9Mt6480GJJvaKe7L/M+ys83IkBPpn/8r+gq4U9wKtePOWz+L9OKaY8wKtePOWz+L9OKaY8BhOgPWY85L/zjoE9BhOgPWY85L/zjoE9YB7SPO+L47+sCzs97dMhPrPH7b/M+ys8tm6YPmrV/L+eq4U9GbQ0PrYY/L9OKaY8GbQ0PrYY/L9OKaY8lCCaPhrV7L/yjoE9br+CPkhx6b+pCzs9YJNaPU5lAsC0+ys8CmRwPry8A8Ccq4U9h5oFPqO2B8BCKaY8h5oFPqO2B8BCKaY8nI4sPuLl+b/xjoE9nI4sPuLl+b/xjoE96jHtPTBM+r+lCzs9","norm":"JYTAPMXtfz8qEwO7JYTAvMXtfz8qEwO7roXJPAPsfz+xLRC7roXJvAPsfz+xLRC7evYXPaXSfz/Y8jC76rRROVj9fz80cxO8Je8FPcXcfz/PRx27ToK3u2H8fz/60hG8Lu+nvDvyfz+MtlG5h/F9PD73fz9MY6q70uNHvCD7fz93uNG4aMvMPJnqfz9wqq275ts1vDb4fz82Ti+8wGj3PBbifz9uuVE6+diju3j8fz/uGRW8gkACPdHefz+kLZA6PbbROvb+fz/E8bC7qn83u0D/fz9kln+7xnUTPED7fz9cEwO8JxkVPCP7fz+9tgS82Z4JvJL9fz8PB/m6dvsHvKD9fz8dB/m6m9WjO8L9fz/rQti7z7XRu3D+fz+5Yyq7AW/Ou3r+fz+/Yyq7mAh5uyb/fz/L0V67WAj5OuT+fz+QOLS7GJFtvBz5fz/RttE5XzRvPPL4fz9Em8S6j941vPX7fz8mudE5rTGZPHX0fz9fuNG6+vvUO6D9fz+sN7S7W0QLPRnafz8xSh267HlyuyD+fz87Q9i7uoXJPBPsfz9O0t66WWBlPIz5fz98EoO6K5IgPJ38fz+t9DC7daqtPC3xfz8K0d46d6qtPDHxfz+ytdE6TeaMO7T+fz/Wupa7IS2QO6z+fz/Rupa77raNPDL2fz9ttFE5jrqNPDH2fz/KudE49SfLOzj+fz+GEYO7yG7OOzT+fz9ZlX+7heUMPEj9fz+PmUS7CqdoPFz5fz9kEoO6oAGau57+fz/wc5M70GAYvHH8fz9CBJo7AJtEOyj/fz/aWIY7ryhLOyL/fz/WWIY7/sB1vND3fz/+1aM7qR10vOj3fz8O1qM7hC2Qulz/fz+q5ow7Jf5UvK35fz9TkKA7fB8nvN77fz/qA5o7gJ+Ju8r+fz8xLZA77h8nPI38fz+gL5C6YOHHO4z+fz978TC7LIyOPP/1fz+hudE6LYyOPAH2fz8JnsQ6sn83Okr/fz8uu5a7iLZROlL/fz9YdJO7nC9dPAf6fz+Rt9E4nC9dPAf6fz+Rt1E5SWQqO0j/fz9sln+7gY+gO+z+fz/SmkS7JgosPFv8fz/sE4O6SeWMPE72fz+EtNG5axYVPP78fz9XmUS7DKdoPF75fz/o7Wu6ZEpqPEb5fz/R7Wu6JyU5PIv7fz98Dz67i8g6PHj7fz9uDz67jxliPKH5fz+HEgO7kwf5Oxr+fz92EQO6h2SqOqb/fz9hm0S7MNHeO3T+fz+kEYO6MtHeO3b+fz+P7Gu6sy2QOrD/fz+yDT67s7ZRO4b/fz/lnwm7kSpLPPT6fz81EwO6sJ+JOyL/fz/8mkS7bywQPHD9fz+d62u6z88RPGD9fz8XEYO6X6XoOxT+fz+ADD67KuzrOwj+fz93DD67Y0cdPNr8fz/SEAO7","uv":"AAAAAAAAgD8AAIA/AACAPwAAAAAAAAAAAACAPwAAAAAAAAAAAACAPwAAgD8AAIA/AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AACAPwAAgD8AAAAAAAAAAAAAgD8AAAAAAAAAAAAAgD8AAIA/AACAPwAAAAAAAAAAAACAPwAAAACRQ0E/AAAAAMrDHT8AAAAAAACAPzTlqz4AAIA/NOWrPrZM4z4w5as+tkzjPjDlqz76Gl4/2ORXPtw+AT/Q5Fc+3D4BP9DkVz5vQxc/6WkiP7PhRj/qaSI/AAAAAAAAgD8AAIA/AACAPwAAAAAAAAAAAACAPwAAAAAAAAAAAACAPwAAgD8AAIA/AAAAAAAAAAAAAIA/AAAAAJFDQT8AAAAAysMdPwAAAAAAAIA/NOWrPgAAgD805as+tkzjPjDlqz62TOM+MOWrPvoaXj/Y5Fc++hpeP9jkVz7cPgE/0ORXPtw+AT/Q5Fc+b0MXP+lpIj+z4UY/6mkiP5FDQT8AAAAAysMdPwAAAAAAAIA/NOWrPgAAgD805as+tkzjPjDlqz62TOM+MOWrPvoaXj/Y5Fc+3D4BP9DkVz5vQxc/6WkiP7PhRj/qaSI/kUNBPwAAAADKwx0/AAAAAAAAgD805as+AACAPzTlqz62TOM+MOWrPrZM4z4w5as++hpeP9jkVz76Gl4/2ORXPtw+AT/Q5Fc+b0MXP+lpIj+z4UY/6mkiP8hQUD8mRPM+b0MXP+lpIj+z4UY/6mkiP7PhRj/qaSI/wFoYP+LV6D7AWhg/4tXoPrbGKj/g9tY+yFBQPyZE8z5vQxc/6WkiP7PhRj/qaSI/s+FGP+ppIj/AWhg/4tXoPrbGKj/g9tY+yFBQPyZE8z5vQxc/6WkiP7PhRj/qaSI/s+FGP+ppIj/AWhg/4tXoPsBaGD/i1eg+tsYqP+D21j4=","indices":"AAABAAMAAAADAAIABAAFAAcABAAHAAYACAAKAAsACAALAAkADAAOAA8ADAAPAA0AGAARABAAGAAQABYAGQAUABIAGQASABoAFQAXABYAFQAWABMAGwAdAB4AGwAeABwAHwAhACIAHwAiACAALAAkACMALAAjACoALQAoACUALQAlAC4AJwArACkAJwApACYANgAwAC8ANgAvADUANwA0ADEANwAxADgAMwA2ADUAMwA1ADIAQQA6ADkAQQA5AD8AQgA9ADsAQgA7AEMAPgBBAEAAPgBAADwARQBJAEcARgBIAEoARgBKAEQATABPAE0ATgBPAFAATgBQAEsAUgBWAFMAVABVAFcAVABXAFEA"}];

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
    dimensions: { x: 1.39, y: 2.6, z: 0.21 },
    vertices: 88,
    triangles: 45,
    create: (name, scene) => createMasterMesh(name, scene),
    createInstance: (name, parent, scene) => createInstance(name, parent, scene)
  };

  global.ThonTranRegistry = global.ThonTranRegistry || {};
  global.ThonTranRegistry[MODEL_NAME] = AssetModule;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetModule;
  }
})(typeof window !== 'undefined' ? window : this);
