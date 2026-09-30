import os
import re
import json

def generate_mappings():
    # 1. Map Weapons (33 items -> 01_vu_khi/XX_rXc*.png)
    # 2. Map Armors (32 items -> 02_ao_giap/XX_rXc*.png)
    # 3. Map Helms (26 items -> 03_mu_non/XX_rXc*.png)
    # 4. Map Boots (26 items -> 05_giay/XX_rXc*.png)
    # 5. Map Amulets (26 items -> 06_trang_suc/XX_rXc*.png)
    # 6. Map Shields (26 items -> 07_phap_bao/XX_rXc*.png)
    # 7. Map Rings (21 items -> 06_trang_suc/XX_rXc*.png starting from index 27)
    # 8. Map Cloaks (21 items -> 02_ao_giap/XX_rXc*.png starting from index 27 or 07_phap_bao)
    
    # 9. Map Herbs (90 herbs -> 10_nguyen_lieu [1..40] and 20_bach_nghe_che_tao [1..49] and 08_dan_duoc)
    # 10. Map Minerals (60 minerals -> 10_nguyen_lieu [1..49] and 19_tien_te_phan_thuong)
    # 11. Map Pills (23 pills -> 08_dan_duoc [1..40])
    # 12. Map Talismans (24 talismans -> 09_phu_luc_tran_phap [1..40])
    
    icons_dir = r'H:\GOOGLE DRIVER\GAME\assets\icons\game_icons'
    categories = {}
    for cat in os.listdir(icons_dir):
        cat_path = os.path.join(icons_dir, cat)
        if os.path.isdir(cat_path):
            categories[cat] = sorted([f for f in os.listdir(cat_path) if f.endswith('.png')])
            
    print("Available categories & counts:")
    for k, v in categories.items():
        print(f"  {k}: {len(v)} icons")

    # Let's verify itemsData.js mapping
    items_file = r'H:\GOOGLE DRIVER\GAME\src\config\itemsData.js'
    with open(items_file, 'r', encoding='utf-8') as f:
        items_text = f.read()

    # Track indices for each type
    type_indices = {
        'weapon': 0,
        'armor': 0,
        'helm': 0,
        'boots': 0,
        'amulet': 0,
        'shield': 0,
        'ring': 0,
        'cloak': 0
    }
    
    # Map of iconKey -> relative asset path
    all_loaded_icons = {}

    def replace_item_icon(match):
        line = match.group(0)
        type_m = re.search(r"type:\s*'([^']+)'", line)
        if not type_m:
            return line
        itype = type_m.group(1)
        idx = type_indices.get(itype, 0)
        type_indices[itype] = idx + 1
        
        # Determine category and file
        if itype == 'weapon':
            cat = '01_vu_khi'
            file = categories[cat][idx % len(categories[cat])]
            icon_key = f"icon_w_{idx+1}"
        elif itype == 'armor':
            cat = '02_ao_giap'
            file = categories[cat][idx % len(categories[cat])]
            icon_key = f"icon_a_{idx+1}"
        elif itype == 'helm':
            cat = '03_mu_non'
            file = categories[cat][idx % len(categories[cat])]
            icon_key = f"icon_h_{idx+1}"
        elif itype == 'boots':
            cat = '05_giay'
            file = categories[cat][idx % len(categories[cat])]
            icon_key = f"icon_b_{idx+1}"
        elif itype == 'amulet':
            cat = '06_trang_suc'
            file = categories[cat][idx % 25] # first 25 for amulets
            icon_key = f"icon_am_{idx+1}"
        elif itype == 'ring':
            cat = '06_trang_suc'
            file = categories[cat][(25 + idx) % len(categories[cat])] # next for rings
            icon_key = f"icon_r_{idx+1}"
        elif itype == 'shield':
            cat = '07_phap_bao'
            file = categories[cat][idx % 25] # first 25 for shields
            icon_key = f"icon_sh_{idx+1}"
        elif itype == 'cloak':
            cat = '07_phap_bao'
            file = categories[cat][(25 + idx) % len(categories[cat])] # 25+ for cloaks
            icon_key = f"icon_cl_{idx+1}"
        else:
            return line
            
        rel_path = f"icons/game_icons/{cat}/{file}"
        all_loaded_icons[icon_key] = rel_path
        
        # Replace icon:'...'
        new_line = re.sub(r"icon:\s*'[^']+'", f"icon:'{icon_key}'", line)
        return new_line

    new_items_text = re.sub(r"\{[^{}\n]*id:\s*\d+[^{}\n]*\}", replace_item_icon, items_text)
    
    with open(items_file, 'w', encoding='utf-8') as f:
        f.write(new_items_text)
    print(f"Updated itemsData.js with unique item icons! Processed: {type_indices}")

    # 2. Update herbsData.js
    herbs_file = r'H:\GOOGLE DRIVER\GAME\src\config\herbsData.js'
    with open(herbs_file, 'r', encoding='utf-8') as f:
        herbs_text = f.read()

    herb_idx = 0
    def replace_herb_icon(match):
        nonlocal herb_idx
        block = match.group(0)
        id_m = re.search(r"id:\s*'([^']+)'", block)
        if not id_m:
            return block
        hid = id_m.group(1)
        herb_idx += 1
        
        # We use 10_nguyen_lieu and 20_bach_nghe_che_tao
        if herb_idx <= 49:
            cat = '10_nguyen_lieu'
            file = categories[cat][(herb_idx - 1) % len(categories[cat])]
        else:
            cat = '20_bach_nghe_che_tao'
            file = categories[cat][(herb_idx - 50) % len(categories[cat])]
            
        icon_key = f"herb_icon_{hid}"
        rel_path = f"icons/game_icons/{cat}/{file}"
        all_loaded_icons[icon_key] = rel_path
        
        if "icon:" in block:
            new_block = re.sub(r"icon:\s*'[^']+'", f"icon: '{icon_key}'", block)
        else:
            # Insert after emoji
            new_block = re.sub(r"(emoji:\s*'[^']+',)", r"\1\n    icon: '" + icon_key + "',", block)
        return new_block

    new_herbs_text = re.sub(r"\{[^{}]*id:\s*'herb_[^']+'[^{}]*\}", replace_herb_icon, herbs_text)
    with open(herbs_file, 'w', encoding='utf-8') as f:
        f.write(new_herbs_text)
    print(f"Updated herbsData.js with {herb_idx} herb icons!")

    # 3. Update mineralsData.js
    minerals_file = r'H:\GOOGLE DRIVER\GAME\src\config\mineralsData.js'
    with open(minerals_file, 'r', encoding='utf-8') as f:
        minerals_text = f.read()

    ore_idx = 0
    def replace_mineral_icon(match):
        nonlocal ore_idx
        line = match.group(0)
        id_m = re.search(r"id:\s*'([^']+)'", line)
        if not id_m:
            return line
        oid = id_m.group(1)
        ore_idx += 1
        
        if ore_idx <= 40:
            cat = '10_nguyen_lieu'
            file = categories[cat][(49 - ore_idx) % len(categories[cat])] # take from back of 10_nguyen_lieu
        else:
            cat = '19_tien_te_phan_thuong'
            file = categories[cat][(ore_idx - 41) % len(categories[cat])]
            
        icon_key = f"ore_icon_{oid}"
        rel_path = f"icons/game_icons/{cat}/{file}"
        all_loaded_icons[icon_key] = rel_path
        
        if "icon:" in line:
            new_line = re.sub(r"icon:\s*'[^']+'", f"icon:'{icon_key}'", line)
        else:
            new_line = re.sub(r"(emoji:\s*'[^']+',)", r"\1 icon:'" + icon_key + "',", line)
        return new_line

    new_minerals_text = re.sub(r"\{[^{}\n]*id:\s*'ore_[^']+'[^{}\n]*\}", replace_mineral_icon, minerals_text)
    with open(minerals_file, 'w', encoding='utf-8') as f:
        f.write(new_minerals_text)
    print(f"Updated mineralsData.js with {ore_idx} mineral icons!")

    # 4. Update craftingData.js (Pills and Talismans)
    crafting_file = r'H:\GOOGLE DRIVER\GAME\src\config\craftingData.js'
    with open(crafting_file, 'r', encoding='utf-8') as f:
        crafting_text = f.read()

    pill_idx = 0
    def replace_pill_icon(match):
        nonlocal pill_idx
        block = match.group(0)
        id_m = re.search(r"id:\s*'([^']+)'", block)
        if not id_m:
            return block
        pid = id_m.group(1)
        pill_idx += 1
        
        cat = '08_dan_duoc'
        file = categories[cat][(pill_idx - 1) % len(categories[cat])]
        icon_key = f"pill_icon_{pid}"
        rel_path = f"icons/game_icons/{cat}/{file}"
        all_loaded_icons[icon_key] = rel_path
        
        if "icon:" in block:
            new_block = re.sub(r"icon:\s*'[^']+'", f"icon: '{icon_key}'", block)
        else:
            new_block = re.sub(r"(type:\s*'[^']+',)", r"\1\n      icon: '" + icon_key + "',", block)
        return new_block

    new_crafting_text = re.sub(r"\{[^{}]*id:\s*'pill_[^']+'[^{}]*\}", replace_pill_icon, crafting_text)

    talisman_idx = 0
    def replace_talisman_icon(match):
        nonlocal talisman_idx
        block = match.group(0)
        id_m = re.search(r"id:\s*'([^']+)'", block)
        if not id_m:
            return block
        tid = id_m.group(1)
        talisman_idx += 1
        
        cat = '09_phu_luc_tran_phap'
        file = categories[cat][(talisman_idx - 1) % len(categories[cat])]
        icon_key = f"talisman_icon_{tid}"
        rel_path = f"icons/game_icons/{cat}/{file}"
        all_loaded_icons[icon_key] = rel_path
        
        if "icon:" in block:
            new_block = re.sub(r"icon:\s*'[^']+'", f"icon: '{icon_key}'", block)
        else:
            new_block = re.sub(r"(type:\s*'[^']+',)", r"\1\n      icon: '" + icon_key + "',", block)
        return new_block

    new_crafting_text = re.sub(r"\{[^{}]*id:\s*'talisman_[^']+'[^{}]*\}", replace_talisman_icon, new_crafting_text)

    with open(crafting_file, 'w', encoding='utf-8') as f:
        f.write(new_crafting_text)
    print(f"Updated craftingData.js with {pill_idx} pills and {talisman_idx} talismans!")

    # 5. Write iconManifest.js
    manifest_file = r'H:\GOOGLE DRIVER\GAME\src\config\iconManifest.js'
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
    print(f"Created {manifest_file} with {len(all_loaded_icons)} loaded icons!")

if __name__ == '__main__':
    generate_mappings()
