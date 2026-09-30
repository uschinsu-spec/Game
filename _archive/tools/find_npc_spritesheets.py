import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
base_dir = r"H:\GOOGLE DRIVER\GAME\assets\characters\npc"

targets = {"idle.png", "run.png", "attack.png", "fly.png", "preview.png"}
found_files = []

for root, dirs, files in os.walk(base_dir):
    for f in files:
        if f in targets:
            full = os.path.join(root, f)
            rel = os.path.relpath(full, base_dir)
            found_files.append((full, rel))

print(f"=== TÌM THẤY {len(found_files)} FILE CẦN XÓA TRONG NPC ===")
for full, rel in found_files[:30]:
    print("  -", rel)
if len(found_files) > 30:
    print(f"  ... và {len(found_files) - 30} file khác.")
