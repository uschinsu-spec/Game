import os
import re
import json

def analyze():
    # 1. Check icons in H:\GOOGLE DRIVER\icons
    icon_root = r'H:\GOOGLE DRIVER\icons'
    categories = {}
    for d in sorted(os.listdir(icon_root)):
        dp = os.path.join(icon_root, d)
        if os.path.isdir(dp):
            files = sorted([f for f in os.listdir(dp) if f.lower().endswith(('.png', '.jpg', '.webp'))])
            categories[d] = files
            
    print(f"Total icon categories: {len(categories)}")
    for cat, files in categories.items():
        print(f"  {cat}: {len(files)} icons")

    # 2. Inspect itemsData.js
    with open(r'H:\GOOGLE DRIVER\GAME\src\config\itemsData.js', 'r', encoding='utf-8') as f:
        items_content = f.read()

    # Find types and counts
    items_by_type = {}
    items_by_rank = {}
    for line in items_content.split('\n'):
        if '{ id:' in line and 'name:' in line:
            type_m = re.search(r"type:\s*'([^']+)'", line)
            rank_m = re.search(r"rank:\s*(\d+)", line)
            name_m = re.search(r"name:\s*'([^']+)'", line)
            id_m = re.search(r"id:\s*(\d+)", line)
            if type_m:
                t = type_m.group(1)
                items_by_type[t] = items_by_type.get(t, 0) + 1
            if rank_m:
                r = int(rank_m.group(1))
                items_by_rank[r] = items_by_rank.get(r, 0) + 1

    print("\n--- itemsData.js Breakdown ---")
    print(f"Total item types: {items_by_type}")
    print(f"Total item ranks: {items_by_rank}")
    print(f"Total items in itemsData.js: {sum(items_by_type.values())}")

    # 3. Inspect herbsData.js
    with open(r'H:\GOOGLE DRIVER\GAME\src\config\herbsData.js', 'r', encoding='utf-8') as f:
        herbs_content = f.read()
    herb_count = len(re.findall(r"id:\s*'herb_", herbs_content))
    print(f"\n--- herbsData.js: {herb_count} herbs ---")

    # 4. Inspect mineralsData.js
    with open(r'H:\GOOGLE DRIVER\GAME\src\config\mineralsData.js', 'r', encoding='utf-8') as f:
        minerals_content = f.read()
    mineral_count = len(re.findall(r"id:'ore_", minerals_content))
    print(f"--- mineralsData.js: {mineral_count} minerals ---")

    # 5. Inspect craftingData.js
    with open(r'H:\GOOGLE DRIVER\GAME\src\config\craftingData.js', 'r', encoding='utf-8') as f:
        crafting_content = f.read()
    pills_count = len(re.findall(r"id:\s*'pill_", crafting_content))
    talis_count = len(re.findall(r"id:\s*'talisman_", crafting_content))
    form_count = len(re.findall(r"id:\s*'formation_", crafting_content))
    print(f"--- craftingData.js: {pills_count} pills, {talis_count} talismans, {form_count} formations ---")

if __name__ == '__main__':
    analyze()
