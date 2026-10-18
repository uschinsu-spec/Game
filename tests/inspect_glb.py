import struct, json

with open(r'H:\GOOGLE DRIVER\GAME\assets\models\realistic_animated_bear_3d_model.glb', 'rb') as f:
    f.seek(12)
    chunk_len, chunk_type = struct.unpack('<I4s', f.read(8))
    gltf = json.loads(f.read(chunk_len).decode('utf-8'))

print("Scenes:", gltf.get("scenes"))
root_nodes = gltf.get("scenes", [{}])[0].get("nodes", [])
print("Root nodes:", root_nodes)
for idx in root_nodes:
    n = gltf.get("nodes", [])[idx]
    print(f"Root Node {idx}: {n.get('name')}, rot={n.get('rotation')}, scale={n.get('scale')}, children={n.get('children')}")

for i, a in enumerate(gltf.get("animations", [])):
    print(f"Anim {i}: {a.get('name')}")
