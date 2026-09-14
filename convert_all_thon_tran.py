import json
import base64
import struct
import os
import shutil
import re

SRC_DIR = r"H:\GOOGLE DRIVER\ASSET\THON TRAN\Medieval Village MegaKit[Standard]\Medieval Village MegaKit[Standard]"
GLTF_DIR = os.path.join(SRC_DIR, "glTF")
TEX_SRC_DIR = os.path.join(SRC_DIR, "Textures")

DST_DIR = r"H:\GOOGLE DRIVER\GAME\assets\THON TRAN"
TEX_DST_DIR = os.path.join(DST_DIR, "textures")

def copy_textures():
    os.makedirs(TEX_DST_DIR, exist_ok=True)
    for fname in os.listdir(TEX_SRC_DIR):
        if fname.endswith(('.png', '.jpg', '.jpeg', '.webp')):
            src = os.path.join(TEX_SRC_DIR, fname)
            dst = os.path.join(TEX_DST_DIR, fname)
            shutil.copy2(src, dst)
    print(f"Copied textures to {TEX_DST_DIR}")

# Mapping component types
COMPONENT_TYPES = {
    5120: ('b', 1), # BYTE
    5121: ('B', 1), # UNSIGNED_BYTE
    5122: ('h', 2), # SHORT
    5123: ('H', 2), # UNSIGNED_SHORT
    5125: ('I', 4), # UNSIGNED_INT
    5126: ('f', 4), # FLOAT
}

TYPE_NUM_COMPONENTS = {
    'SCALAR': 1,
    'VEC2': 2,
    'VEC3': 3,
    'VEC4': 4,
    'MAT2': 4,
    'MAT3': 9,
    'MAT4': 16
}

def read_accessor_data(gltf, accessor_idx, bin_buffer):
    acc = gltf['accessors'][accessor_idx]
    bv_idx = acc['bufferView']
    bv = gltf['bufferViews'][bv_idx]
    
    offset = bv.get('byteOffset', 0) + acc.get('byteOffset', 0)
    count = acc['count']
    comp_type = acc['componentType']
    type_str = acc['type']
    
    fmt_char, comp_size = COMPONENT_TYPES[comp_type]
    num_comps = TYPE_NUM_COMPONENTS[type_str]
    total_elements = count * num_comps
    
    byte_stride = bv.get('byteStride', 0)
    
    if byte_stride == 0 or byte_stride == num_comps * comp_size:
        total_bytes = total_elements * comp_size
        return bin_buffer[offset : offset + total_bytes], fmt_char, num_comps, count
    else:
        # Strided buffer
        out = bytearray()
        for i in range(count):
            elem_offset = offset + i * byte_stride
            out.extend(bin_buffer[elem_offset : elem_offset + num_comps * comp_size])
        return bytes(out), fmt_char, num_comps, count

# Categorize model based on name
def categorize_model(name):
    n = name.lower()
    if n.startswith('balcony'): return ('Ban Công', 'balconies', '🏛️')
    if n.startswith('corner'): return ('Cột & Góc Tường', 'corners', '🧱')
    if n.startswith('doorframe'): return ('Khung Cửa Đi', 'doors', '🚪')
    if n.startswith('door'): return ('Cửa Đi', 'doors', '🚪')
    if n.startswith('floor'): return ('Sàn Nhà', 'floors', '🪵')
    if n.startswith('holecover'): return ('Nối Khe & Mộng', 'floors', '🪵')
    if n.startswith('overhang'): return ('Mái Hiên & Ban Công', 'overhangs', '🏘️')
    if n.startswith('prop'): return ('Đạo Cụ Thôn Trấn', 'props', '📦')
    if n.startswith('roof'): return ('Mái Ngói & Mái Gỗ', 'roofs', '🏠')
    if n.startswith('stair'): return ('Cầu Thang & Bậc', 'stairs', '🪜')
    if n.startswith('wall'): return ('Tường Gạch & Vữa', 'walls', '🧱')
    if n.startswith('window'): return ('Cửa Sổ & Mái Cửa', 'windows', '🪟')
    return ('Kiến Trúc', 'misc', '🏛️')

def convert_gltf_to_js(gltf_path, bin_path, js_path):
    with open(gltf_path, 'r', encoding='utf-8') as f:
        gltf = json.load(f)
    
    with open(bin_path, 'rb') as f:
        bin_data = f.read()

    model_name = os.path.splitext(os.path.basename(gltf_path))[0]
    vi_cat, cat_id, icon = categorize_model(model_name)

    # Extract Materials & Texture References
    materials_info = []
    if 'materials' in gltf:
        for m in gltf['materials']:
            m_name = m.get('name', 'MI_Default')
            tex_file = None
            pbr = m.get('pbrMetallicRoughness', {})
            if 'baseColorTexture' in pbr:
                tex_idx = pbr['baseColorTexture']['index']
                if 'textures' in gltf and tex_idx < len(gltf['textures']):
                    img_idx = gltf['textures'][tex_idx].get('source', 0)
                    if 'images' in gltf and img_idx < len(gltf['images']):
                        tex_file = gltf['images'][img_idx].get('uri') or gltf['images'][img_idx].get('name')
                        if tex_file and not tex_file.endswith('.png'):
                            tex_file += '.png'
            materials_info.append({
                'name': m_name,
                'texture': tex_file or 'T_WoodTrim_BaseColor.png',
                'doubleSided': m.get('doubleSided', True)
            })
    else:
        materials_info.append({
            'name': 'MI_Default',
            'texture': 'T_WoodTrim_BaseColor.png',
            'doubleSided': True
        })

    # Extract Meshes and Submesh Primitives
    submeshes = []
    total_vertices = 0
    total_triangles = 0
    min_bounds = [999999, 999999, 999999]
    max_bounds = [-999999, -999999, -999999]

    if 'meshes' in gltf:
        for mesh in gltf['meshes']:
            for prim in mesh.get('primitives', []):
                attrs = prim['attributes']
                mat_idx = prim.get('material', 0)
                mat_def = materials_info[mat_idx] if mat_idx < len(materials_info) else materials_info[0]

                # Position
                pos_bytes, _, _, pos_count = read_accessor_data(gltf, attrs['POSITION'], bin_data)
                # Normals
                norm_bytes = b''
                if 'NORMAL' in attrs:
                    norm_bytes, _, _, _ = read_accessor_data(gltf, attrs['NORMAL'], bin_data)
                # UV
                uv_bytes = b''
                if 'TEXCOORD_0' in attrs:
                    uv_bytes, _, _, _ = read_accessor_data(gltf, attrs['TEXCOORD_0'], bin_data)
                # Indices
                idx_bytes = b''
                idx_count = 0
                if 'indices' in prim:
                    idx_bytes, idx_fmt, _, idx_count = read_accessor_data(gltf, prim['indices'], bin_data)
                    # Convert uint32 or uint8 to standard Uint16 / Uint32
                    is_uint32 = (idx_fmt == 'I')
                else:
                    is_uint32 = False

                # Calculate bounding box from position floats
                pos_floats = struct.unpack(f'<{len(pos_bytes)//4}f', pos_bytes)
                for i in range(0, len(pos_floats), 3):
                    x, y, z = pos_floats[i], pos_floats[i+1], pos_floats[i+2]
                    min_bounds[0] = min(min_bounds[0], x)
                    min_bounds[1] = min(min_bounds[1], y)
                    min_bounds[2] = min(min_bounds[2], z)
                    max_bounds[0] = max(max_bounds[0], x)
                    max_bounds[1] = max(max_bounds[1], y)
                    max_bounds[2] = max(max_bounds[2], z)

                total_vertices += pos_count
                total_triangles += idx_count // 3 if idx_count > 0 else pos_count // 3

                submeshes.append({
                    'matName': mat_def['name'],
                    'texture': mat_def['texture'],
                    'doubleSided': mat_def['doubleSided'],
                    'isUint32': is_uint32,
                    'pos': base64.b64encode(pos_bytes).decode('ascii'),
                    'norm': base64.b64encode(norm_bytes).decode('ascii') if norm_bytes else "",
                    'uv': base64.b64encode(uv_bytes).decode('ascii') if uv_bytes else "",
                    'indices': base64.b64encode(idx_bytes).decode('ascii') if idx_bytes else ""
                })

    size_x = round(max_bounds[0] - min_bounds[0], 2)
    size_y = round(max_bounds[1] - min_bounds[1], 2)
    size_z = round(max_bounds[2] - min_bounds[2], 2)

    # Generate Standalone JS Code
    js_content = f"""/**
 * ============================================================================
 * 🏛️ THÔN TRẤN 3D ASSET MODULE: {model_name}
 * ============================================================================
 * Category: {vi_cat} ({cat_id})
 * Dimensions: {size_x}m x {size_y}m x {size_z}m | Vertices: {total_vertices} | Faces: {total_triangles}
 * Architecture: Standalone Zero-Dependency Babylon.js Mesh Module with Material Cache
 * ============================================================================
 */
(function(global) {{
  'use strict';

  const MODEL_NAME = '{model_name}';
  const SUBMESHES = {json.dumps(submeshes, separators=(',', ':'))};

  function b64ToF32(b64) {{
    const bin = atob(b64);
    const buf = new ArrayBuffer(bin.length);
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Float32Array(buf);
  }}

  function b64ToIndices(b64, isUint32) {{
    if (!b64) return null;
    const bin = atob(b64);
    const buf = new ArrayBuffer(bin.length);
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return isUint32 ? new Uint32Array(buf) : new Uint16Array(buf);
  }}

  function getSharedMaterial(matName, texFileName, doubleSided, scene) {{
    global.ThonTranMaterials = global.ThonTranMaterials || {{}};
    const matKey = 'TTMat_' + matName + '_' + (texFileName || 'default');
    if (global.ThonTranMaterials[matKey] && !global.ThonTranMaterials[matKey].isDisposed()) {{
      return global.ThonTranMaterials[matKey];
    }}

    const mat = new BABYLON.StandardMaterial(matKey, scene);
    if (texFileName) {{
      const texPath = './assets/THON TRAN/textures/' + texFileName;
      const diffuseTex = new BABYLON.Texture(texPath, scene);
      mat.diffuseTexture = diffuseTex;
    }}
    mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    mat.specularColor = new BABYLON.Color3(0.08, 0.08, 0.08);
    mat.backFaceCulling = !doubleSided;
    mat.freeze();

    global.ThonTranMaterials[matKey] = mat;
    return mat;
  }}

  function createMasterMesh(name, scene) {{
    const root = new BABYLON.TransformNode(name || MODEL_NAME, scene);
    
    SUBMESHES.forEach((sub, idx) => {{
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
    }});

    return root;
  }}

  function createInstance(name, parentNode, scene) {{
    const instanceRoot = new BABYLON.TransformNode(name, scene);
    if (parentNode) instanceRoot.parent = parentNode;

    SUBMESHES.forEach((sub, idx) => {{
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
    }});

    return instanceRoot;
  }}

  const AssetModule = {{
    name: MODEL_NAME,
    category: '{cat_id}',
    categoryVi: '{vi_cat}',
    icon: '{icon}',
    dimensions: {{ x: {size_x}, y: {size_y}, z: {size_z} }},
    vertices: {total_vertices},
    triangles: {total_triangles},
    create: (name, scene) => createMasterMesh(name, scene),
    createInstance: (name, parent, scene) => createInstance(name, parent, scene)
  }};

  global.ThonTranRegistry = global.ThonTranRegistry || {{}};
  global.ThonTranRegistry[MODEL_NAME] = AssetModule;

  if (typeof module !== 'undefined' && module.exports) {{
    module.exports = AssetModule;
  }}
}})(typeof window !== 'undefined' ? window : this);
"""

    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(js_content)

    return {
        'id': model_name,
        'name': model_name.replace('_', ' '),
        'category': cat_id,
        'categoryVi': vi_cat,
        'icon': icon,
        'fileName': os.path.basename(js_path),
        'filePath': f"./assets/THON TRAN/{os.path.basename(js_path)}",
        'dimensions': {'x': size_x, 'y': size_y, 'z': size_z},
        'vertices': total_vertices,
        'triangles': total_triangles,
        'fileSize': os.path.getsize(js_path)
    }

def main():
    os.makedirs(DST_DIR, exist_ok=True)
    copy_textures()

    manifest = {}
    converted_count = 0

    gltf_files = sorted([f for f in os.listdir(GLTF_DIR) if f.endswith('.gltf')])
    print(f"Found {len(gltf_files)} glTF models to convert...")

    for fname in gltf_files:
        base_name = os.path.splitext(fname)[0]
        gltf_path = os.path.join(GLTF_DIR, fname)
        bin_path = os.path.join(GLTF_DIR, f"{base_name}.bin")
        js_path = os.path.join(DST_DIR, f"asset_{base_name.lower()}.js")

        if os.path.exists(bin_path):
            info = convert_gltf_to_js(gltf_path, bin_path, js_path)
            manifest[base_name] = info
            converted_count += 1
            if converted_count % 20 == 0 or converted_count == len(gltf_files):
                print(f"[{converted_count}/{len(gltf_files)}] Converted {base_name} ({info['vertices']} vtx, {info['fileSize']/1024:.1f} KB)")
        else:
            print(f"⚠️ Warning: Missing .bin file for {fname}")

    # Write Manifest JSON
    manifest_path = os.path.join(DST_DIR, "thon_tran_manifest.json")
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print(f"[OK] Saved manifest: {manifest_path} ({len(manifest)} assets)")

    # Write Loader JS
    loader_path = os.path.join(DST_DIR, "thon_tran_loader.js")
    catalog_map = {k: v['filePath'] for k, v in manifest.items()}
    loader_code = f"""(function(global) {{
  'use strict';

  const THON_TRAN_CATALOG = {json.dumps(catalog_map, indent=2)};
  const loadedScripts = new Set();

  function loadAsset(modelName) {{
    return new Promise((resolve) => {{
      if (global.ThonTranRegistry && global.ThonTranRegistry[modelName]) {{
        return resolve(global.ThonTranRegistry[modelName]);
      }}
      const url = THON_TRAN_CATALOG[modelName];
      if (!url) return resolve(null);
      if (loadedScripts.has(url)) {{
        return resolve(global.ThonTranRegistry ? global.ThonTranRegistry[modelName] : null);
      }}
      loadedScripts.add(url);
      const s = document.createElement('script');
      s.src = url;
      s.onload = () => resolve(global.ThonTranRegistry ? global.ThonTranRegistry[modelName] : null);
      s.onerror = () => resolve(null);
      document.body.appendChild(s);
    }});
  }}

  function preloadCategory(catId, manifestData) {{
    if (!manifestData) return Promise.resolve([]);
    const keys = Object.keys(manifestData).filter(k => manifestData[k].category === catId);
    return Promise.all(keys.map(loadAsset));
  }}

  function preloadAll() {{
    return Promise.all(Object.keys(THON_TRAN_CATALOG).map(loadAsset));
  }}

  // Preload in idle time
  if (typeof window !== 'undefined') {{
    if (window.requestIdleCallback) {{
      window.requestIdleCallback(() => preloadAll());
    }} else {{
      setTimeout(() => preloadAll(), 1000);
    }}
  }}

  global.ThonTranLoader = {{
    catalog: THON_TRAN_CATALOG,
    loadAsset: loadAsset,
    preloadCategory: preloadCategory,
    preloadAll: preloadAll,
    getAsset: (modelName) => global.ThonTranRegistry ? global.ThonTranRegistry[modelName] : null
  }};
}})(typeof window !== 'undefined' ? window : this);
"""
    with open(loader_path, 'w', encoding='utf-8') as f:
        f.write(loader_code)
    print(f"[OK] Saved loader: {loader_path}")

if __name__ == '__main__':
    main()
