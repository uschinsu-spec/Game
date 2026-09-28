import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
base_dir = r"h:\GOOGLE DRIVER\GAME\assets"

top_folders = sorted(os.listdir(base_dir))
for tf in top_folders:
    tf_path = os.path.join(base_dir, tf)
    if os.path.isdir(tf_path):
        sub_items = os.listdir(tf_path)
        sub_dirs = [s for s in sub_items if os.path.isdir(os.path.join(tf_path, s))]
        sub_files = [s for s in sub_items if os.path.isfile(os.path.join(tf_path, s))]
        print(f"[{tf}] -> {len(sub_dirs)} dirs, {len(sub_files)} files")
        if sub_files:
            print(f"   Files: {sub_files[:8]}")
        if sub_dirs:
            print(f"   Dirs: {sub_dirs[:8]}")
