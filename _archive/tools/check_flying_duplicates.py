import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
base_dir = r"H:\GOOGLE DRIVER\GAME\assets\characters\npc\flying"

print(f"=== KIỂM TRA THƯ MỤC FLYING NPC ===")
print(f"Path: {base_dir}")

folders = sorted(os.listdir(base_dir))
print(f"Total subfolders: {len(folders)}")
print(f"Folder list: {folders}\n")

for f in folders:
    f_path = os.path.join(base_dir, f)
    if os.path.isdir(f_path):
        files = sorted(os.listdir(f_path))
        print(f"📁 {f}: {len(files)} files")
        # Categorize files
        named_frames = [x for x in files if any(x.startswith(k) for k in ['idle_', 'run_', 'attack_', 'fly_'])]
        spritesheets = [x for x in files if x.endswith(('_idle.png', '_run.png', '_attack.png', '_fly.png'))]
        numbered_raw = [x for x in files if x.replace('.png', '').isdigit()]
        other = [x for x in files if x not in named_frames and x not in spritesheets and x not in numbered_raw]
        print(f"   - Named frames: {len(named_frames)} ({', '.join(named_frames[:4])}...)")
        print(f"   - Spritesheets: {len(spritesheets)} ({', '.join(spritesheets)})")
        print(f"   - Numbered raw: {len(numbered_raw)} ({', '.join(numbered_raw[:5])}...)")
        print(f"   - Other: {len(other)} ({', '.join(other)})")
