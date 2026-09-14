import json
import base64
import struct
import os
import shutil

SRC_ROOT = r"H:\GOOGLE DRIVER\ASSET\ENEMI"
DST_ROOT = r"H:\GOOGLE DRIVER\GAME\assets\enemies"
TEX_PATH = os.path.join(SRC_ROOT, "Atlas_Monsters.png")

def gltf_to_glb(gltf_path, glb_path, texture_bytes):
    with open(gltf_path, 'r', encoding='utf-8') as f:
        gltf = json.load(f)
    
    bin_data = bytearray()
    if 'buffers' in gltf and len(gltf['buffers']) > 0:
        buf0 = gltf['buffers'][0]
        uri = buf0.get('uri', '')
        if uri.startswith('data:application/octet-stream;base64,'):
            raw_b64 = uri.split('base64,')[1]
            bin_data = bytearray(base64.b64decode(raw_b64))
        elif uri.startswith('data:application/gltf-buffer;base64,'):
            raw_b64 = uri.split('base64,')[1]
            bin_data = bytearray(base64.b64decode(raw_b64))
    
    # Embed Texture bufferView if provided
    if texture_bytes:
        pad = (4 - (len(bin_data) % 4)) % 4
        bin_data += b'\x00' * pad
        
        img_offset = len(bin_data)
        img_len = len(texture_bytes)
        bin_data += texture_bytes
        
        if 'bufferViews' not in gltf:
            gltf['bufferViews'] = []
        img_bv_idx = len(gltf['bufferViews'])
        gltf['bufferViews'].append({
            'buffer': 0,
            'byteOffset': img_offset,
            'byteLength': img_len
        })
        
        if 'images' in gltf:
            for img in gltf['images']:
                img.pop('uri', None)
                img['bufferView'] = img_bv_idx
                img['mimeType'] = 'image/png'

    if 'buffers' in gltf and len(gltf['buffers']) > 0:
        buf0 = gltf['buffers'][0]
        buf0.pop('uri', None)
        buf0['byteLength'] = len(bin_data)
        gltf['buffers'] = [buf0]

    # Extract Animation Names
    anim_names = []
    if 'animations' in gltf:
        for a in gltf['animations']:
            if 'name' in a and a['name']:
                anim_names.append(a['name'])

    json_bytes = json.dumps(gltf, separators=(',', ':')).encode('utf-8')
    json_pad = (4 - (len(json_bytes) % 4)) % 4
    json_chunk_data = json_bytes + (b' ' * json_pad)
    json_chunk_len = len(json_chunk_data)

    bin_pad = (4 - (len(bin_data) % 4)) % 4
    bin_chunk_data = bin_data + (b'\x00' * bin_pad)
    bin_chunk_len = len(bin_chunk_data)

    magic = 0x46546C67 # "glTF"
    version = 2
    total_length = 12 + (8 + json_chunk_len) + (8 + bin_chunk_len)

    with open(glb_path, 'wb') as f:
        f.write(struct.pack('<III', magic, version, total_length))
        f.write(struct.pack('<II', json_chunk_len, 0x4E4F534A))
        f.write(json_chunk_data)
        f.write(struct.pack('<II', bin_chunk_len, 0x004E4942))
        f.write(bin_chunk_data)

    return anim_names, total_length

def main():
    tex_dst_dir = os.path.join(DST_ROOT, "textures")
    os.makedirs(tex_dst_dir, exist_ok=True)
    tex_dst = os.path.join(tex_dst_dir, "Atlas_Monsters.png")
    shutil.copy2(TEX_PATH, tex_dst)
    print(f"Copied texture to {tex_dst}")

    with open(TEX_PATH, 'rb') as f:
        texture_bytes = f.read()

    categories = {
        'big': os.path.join(SRC_ROOT, "Big", "glTF"),
        'blob': os.path.join(SRC_ROOT, "Blob", "glTF"),
        'flying': os.path.join(SRC_ROOT, "Flying", "glTF")
    }

    registry = {}
    total_converted = 0

    for cat, cat_dir in categories.items():
        out_cat_dir = os.path.join(DST_ROOT, cat)
        os.makedirs(out_cat_dir, exist_ok=True)

        for fname in os.listdir(cat_dir):
            if fname.endswith('.gltf'):
                model_name = os.path.splitext(fname)[0]
                gltf_file = os.path.join(cat_dir, fname)
                glb_file = os.path.join(out_cat_dir, f"{model_name.lower()}.glb")

                anims, size = gltf_to_glb(gltf_file, glb_file, texture_bytes)
                total_converted += 1

                key = f"{cat}_{model_name.lower()}"
                registry[key] = {
                    'id': key,
                    'name': model_name.replace('_', ' '),
                    'category': cat,
                    'modelPath': f"./assets/enemies/{cat}/{model_name.lower()}.glb",
                    'animations': anims if anims else ["Idle", "Walk", "Attack", "Death"],
                    'fileSize': size,
                    'hp': 1000 if cat == 'big' else (500 if cat == 'blob' else 750),
                    'damage': 80 if cat == 'big' else (40 if cat == 'blob' else 60),
                    'moveSpeed': 2.2 if cat == 'big' else (3.0 if cat == 'blob' else 3.5),
                    'scale': 1.0 if cat == 'big' else (0.85 if cat == 'blob' else 0.9)
                }
                print(f"[{total_converted}] Converted {cat}/{model_name} -> {glb_file} ({size/1024:.1f} KB, anims: {len(anims)})")

    # Write registry JSON and JS
    registry_json_path = os.path.join(DST_ROOT, "enemy-manifest.json")
    with open(registry_json_path, 'w', encoding='utf-8') as f:
        json.dump(registry, f, indent=2, ensure_ascii=False)
    print(f"Saved {registry_json_path}")

    return registry

if __name__ == '__main__':
    main()
