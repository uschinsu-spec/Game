import os
import re
import json

def update_crafting_and_rebuild():
    icons_dir = r'H:\GOOGLE DRIVER\GAME\assets\icons\game_icons'
    categories = {}
    for cat in os.listdir(icons_dir):
        cat_path = os.path.join(icons_dir, cat)
        if os.path.isdir(cat_path):
            categories[cat] = sorted([f for f in os.listdir(cat_path) if f.endswith('.png')])

    crafting_file = r'H:\GOOGLE DRIVER\GAME\src\config\craftingData.js'
    with open(crafting_file, 'r', encoding='utf-8') as f:
        crafting_text = f.read()

    # Read existing iconManifest to preserve previous keys
    all_loaded_icons = {}
    manifest_file = r'H:\GOOGLE DRIVER\GAME\src\config\iconManifest.js'
    if os.path.exists(manifest_file):
        with open(manifest_file, 'r', encoding='utf-8') as f:
            manifest_content = f.read()
        for m in re.finditer(r"\['([^']+)',\s*'([^']+)'\]", manifest_content):
            all_loaded_icons[m.group(1)] = m.group(2)

    # Pills
    pill_idx = 0
    lines = crafting_text.split('\n')
    new_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        id_m = re.search(r"id:\s*'(pill_[^']+)'", line)
        if id_m:
            pid = id_m.group(1)
            pill_idx += 1
            cat = '08_dan_duoc'
            file = categories[cat][(pill_idx - 1) % len(categories[cat])]
            icon_key = f"pill_icon_{pid}"
            rel_path = f"icons/game_icons/{cat}/{file}"
            all_loaded_icons[icon_key] = rel_path
            
            new_lines.append(line)
            # Check if next line is already icon
            if i + 1 < len(lines) and 'icon:' in lines[i+1]:
                lines[i+1] = f"      icon: '{icon_key}',"
            else:
                new_lines.append(f"      icon: '{icon_key}',")
            i += 1
            continue

        id_t_m = re.search(r"id:\s*'(talisman_[^']+)'", line)
        if id_t_m:
            tid = id_t_m.group(1)
            pill_idx += 1
            cat = '09_phu_luc_tran_phap'
            file = categories[cat][(pill_idx - 1) % len(categories[cat])]
            icon_key = f"talisman_icon_{tid}"
            rel_path = f"icons/game_icons/{cat}/{file}"
            all_loaded_icons[icon_key] = rel_path
            
            new_lines.append(line)
            if i + 1 < len(lines) and 'icon:' in lines[i+1]:
                lines[i+1] = f"      icon: '{icon_key}',"
            else:
                new_lines.append(f"      icon: '{icon_key}',")
            i += 1
            continue

        new_lines.append(line)
        i += 1

    with open(crafting_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines))

    print(f"Updated craftingData.js with {pill_idx} pill/talisman icons!")

    # Write updated iconManifest.js
    manifest_entries = []
    for k, v in sorted(all_loaded_icons.items()):
        manifest_entries.append(f"  ['{k}', '{v}']")
    
    manifest_js = "/**\n * Auto-generated icon manifest for all items, herbs, minerals, pills, talismans\n */\n"
    manifest_js += "export const GAME_ITEM_ICONS = [\n" + ",\n".join(manifest_entries) + "\n];\n\n"
    manifest_js += "export function loadAllItemIcons(scene, assetPrefix = './assets/') {\n"
    manifest_js += "  GAME_ITEM_ICONS.forEach(([key, path]) => {\n"
    manifest_js += "    if (!scene.textures.exists(key)) {\n"
    manifest_js += "      scene.load.image(key, assetPrefix + path);\n"
    manifest_js += "    }\n"
    manifest_js += "  });\n"
    manifest_js += "}\n"
    
    with open(manifest_file, 'w', encoding='utf-8') as f:
        f.write(manifest_js)
    print(f"Updated {manifest_file} with total {len(all_loaded_icons)} loaded icons!")

if __name__ == '__main__':
    update_crafting_and_rebuild()
