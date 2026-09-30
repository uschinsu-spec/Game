import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
base_dir = r"H:\GOOGLE DRIVER\GAME\assets"

print("=== KIỂM TRA TOÀN BỘ ASSETS CÒN FILE TRÙNG NÀO KHÔNG ===")

for sub in ["characters/npc/animated", "characters/enemies", "characters/player"]:
    p = os.path.join(base_dir, sub)
    if os.path.exists(p):
        for root, dirs, files in os.walk(p):
            rel = os.path.relpath(root, base_dir)
            print(f"📁 {rel}: {len(dirs)} subdirs, {len(files)} files")
