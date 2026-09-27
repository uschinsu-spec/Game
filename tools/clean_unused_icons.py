import os
import re
import shutil

ROOT_DIR = r'H:\GOOGLE DRIVER\GAME'
ASSETS_DIR = os.path.join(ROOT_DIR, 'assets')
ICONS_DIR = os.path.join(ASSETS_DIR, 'icons')
MAIN_JS = os.path.join(ROOT_DIR, 'src', 'main.js')

def audit_and_clean():
    with open(MAIN_JS, 'r', encoding='utf-8') as f:
        code = f.read()

    # Find static loads like A+'icons/...'
    loads = re.findall(r"A\s*\+\s*'([^']+)'", code)
    used_assets = set()
    for l in loads:
        full_p = os.path.normpath(os.path.join(ASSETS_DIR, l))
        used_assets.add(full_p)

    # Dynamic loads
    for i in range(10):
        used_assets.add(os.path.normpath(os.path.join(ICONS_DIR, 'skills', f'skill_{i}.png')))
    for i in range(18):
        used_assets.add(os.path.normpath(os.path.join(ICONS_DIR, 'items', f'item_{i}.png')))
    for i in range(12):
        used_assets.add(os.path.normpath(os.path.join(ICONS_DIR, 'stages', f'stage_{i}.png')))

    print(f"=== USED ASSETS IN GAME ({len(used_assets)} files) ===")
    for u in sorted(used_assets):
        if 'icons' in u:
            print(" [KEEP]", os.path.relpath(u, ROOT_DIR))

    # Identify all files in assets/icons
    all_icon_files = []
    for root, dirs, files in os.walk(ICONS_DIR):
        for f in files:
            full_p = os.path.normpath(os.path.join(root, f))
            all_icon_files.append(full_p)

    unused_files = [f for f in all_icon_files if f not in used_assets]
    print(f"\nTotal icon files in assets/icons: {len(all_icon_files)}")
    print(f"Used icon files:                  {len(all_icon_files) - len(unused_files)}")
    print(f"Unused icon files to be removed:  {len(unused_files)}")

    # Delete unused files
    deleted_bytes = 0
    for f in unused_files:
        try:
            deleted_bytes += os.path.getsize(f)
            os.remove(f)
        except Exception as e:
            print(f"Error removing {f}: {e}")

    # Remove any empty subdirectories in assets/icons
    for root, dirs, files in list(os.walk(ICONS_DIR, topdown=False)):
        if root != ICONS_DIR:
            if not os.listdir(root):
                os.rmdir(root)
                print(f"Removed empty folder: {os.path.relpath(root, ROOT_DIR)}")

    print(f"\nSuccessfully cleaned {len(unused_files)} unused icon files ({deleted_bytes / 1024:.1f} KB freed)!")

if __name__ == '__main__':
    audit_and_clean()
