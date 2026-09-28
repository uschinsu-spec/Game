import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
base_dir = r"H:\GOOGLE DRIVER\GAME\assets\characters\npc\animated"

for root, dirs, files in os.walk(base_dir):
    rel = os.path.relpath(root, base_dir)
    print(f"📁 {rel}: {len(dirs)} subdirs, {len(files)} files")
    if files:
        print(f"   Files ({len(files)}): {files[:10]}")
