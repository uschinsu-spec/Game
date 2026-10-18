import os, re, sys

GAME_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

print("=" * 60)
print("KIEM TRA TOAN DIEN HE THONG TAI TAI NGUYEN GAME")
print("=" * 60)

# 1. Check index.html scripts and css
index_path = os.path.join(GAME_DIR, "index.html")
with open(index_path, "r", encoding="utf-8") as f:
    html_content = f.read()

scripts = re.findall(r'<script[^>]+src=["\']([^"\']+)["\']', html_content)
css_links = re.findall(r'<link[^>]+href=["\']([^"\']+)["\']', html_content)

print(f"\n[1] Kiem tra {len(scripts)} File Script trong index.html:")
missing_count = 0
for s in scripts:
    if s.startswith("http://") or s.startswith("https://"):
        print(f"  [CDN] {s}")
        continue
    full_path = os.path.normpath(os.path.join(GAME_DIR, s))
    if os.path.exists(full_path):
        size_kb = os.path.getsize(full_path) / 1024
        print(f"  [OK] {s} ({size_kb:.1f} KB)")
    else:
        print(f"  [MISSING!] {s}")
        missing_count += 1

print(f"\n[2] Kiem tra {len(css_links)} File CSS trong index.html:")
for c in css_links:
    if c.startswith("http://") or c.startswith("https://"):
        print(f"  [CDN] {c}")
        continue
    full_path = os.path.normpath(os.path.join(GAME_DIR, c))
    if os.path.exists(full_path):
        size_kb = os.path.getsize(full_path) / 1024
        print(f"  [OK] {c} ({size_kb:.1f} KB)")
    else:
        print(f"  [MISSING!] {c}")
        missing_count += 1

# 3. Check enemy configs and visuals
enemies = ["wolf", "golem", "bandit"]
print("\n[3] Kiem tra Enemy Configs & Visuals:")
for kind in enemies:
    config_path = os.path.join(GAME_DIR, "enemies", kind, "config.js")
    visual_path = os.path.join(GAME_DIR, "enemies", kind, "visual.js")
    textures_dir = os.path.join(GAME_DIR, "enemies", kind, "textures")
    
    print(f"\n--- Enemy: [{kind.upper()}] ---")
    if os.path.exists(config_path):
        print(f"  [OK] config.js: {os.path.getsize(config_path)} bytes")
    else:
        print(f"  [MISSING!] config.js")
        missing_count += 1
        
    if os.path.exists(visual_path):
        print(f"  [OK] visual.js: {os.path.getsize(visual_path)} bytes")
    else:
        print(f"  [MISSING!] visual.js")
        missing_count += 1
        
    if os.path.exists(textures_dir):
        textures = os.listdir(textures_dir)
        print(f"  [OK] textures folder ({len(textures)} files):")
        for t in sorted(textures):
            tp = os.path.join(textures_dir, t)
            print(f"      - {t} ({os.path.getsize(tp)/1024:.1f} KB)")
    else:
        print(f"  [MISSING!] textures directory")
        missing_count += 1

# 4. Check texture references inside visual.js
print("\n[4] Kiem tra lien ket Texture ben trong visual.js:")
for kind in enemies:
    visual_path = os.path.join(GAME_DIR, "enemies", kind, "visual.js")
    with open(visual_path, "r", encoding="utf-8") as f:
        v_code = f.read()
    
    # Check setTexture calls
    calls = re.findall(r'setTexture\(["\'](\w+)["\'],\s*[`"\']([^`"\']+)[\'"`]', v_code)
    print(f"\n  Enemy [{kind}] texture slots mapped in visual.js ({len(calls)} slots):")
    for slot, rel_url in calls:
        clean_url = rel_url.replace("${texPath}", f"./enemies/{kind}/textures/")
        target_file = os.path.normpath(os.path.join(GAME_DIR, clean_url))
        if os.path.exists(target_file):
            print(f"    [MATCHED] slot '{slot}' -> {clean_url} ({os.path.getsize(target_file)/1024:.1f} KB)")
        else:
            print(f"    [BROKEN LINK!] slot '{slot}' -> {clean_url}")
            missing_count += 1

print("\n" + "=" * 60)
if missing_count == 0:
    print("KET LUAN: TAT CA TAI NGUYEN, SCRIPTS, TEXTURES VA CONFIGS DEU NHO VA DAY DU 100%!")
else:
    print(f"CANH BAO: Phat hien {missing_count} loi thieu hoac sai duong dan!")
print("=" * 60)
