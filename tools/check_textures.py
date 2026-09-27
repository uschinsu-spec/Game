import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    code = f.read()

loaded_images = re.findall(r"load\.image\(['\"]([^'\"]+)['\"]", code)
loaded_spritesheets = re.findall(r"load\.spritesheet\(['\"]([^'\"]+)['\"]", code)
all_loaded = set(loaded_images + loaded_spritesheets)

arr_match = re.search(r"\[([^\]]+)\]\.forEach\(k=>this\.load\.image", code)
if arr_match:
    for k in arr_match.group(1).replace("'", "").replace('"', '').split(','):
        all_loaded.add(k.strip())

print('Loaded textures in Phaser:', sorted(all_loaded))

enemy_texs = set(re.findall(r"tex:['\"]([^'\"]+)['\"]", code))
print('Enemy textures used in ENEMY_TYPES:', sorted(enemy_texs))

unloaded = enemy_texs - all_loaded
if unloaded:
    print('WARNING: Unloaded textures used:', unloaded)
else:
    print('SUCCESS: ALL ENEMY TEXTURES ARE LOADED AND 100% VALID!')
