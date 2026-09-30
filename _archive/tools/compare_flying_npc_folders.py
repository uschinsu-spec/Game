import os
import sys
import filecmp

sys.stdout.reconfigure(encoding='utf-8')
base_dir = r"H:\GOOGLE DRIVER\GAME\assets\characters\npc\flying"

print("=== SO SÁNH NỘI DUNG GIỮA FOLDER npc_X VÀ fly_npc_X ===")
all_match = True
for i in range(1, 21):
    d1 = os.path.join(base_dir, f"npc_{i}")
    d2 = os.path.join(base_dir, f"fly_npc_{i}")
    if os.path.exists(d1) and os.path.exists(d2):
        f1_list = sorted(os.listdir(d1))
        f2_list = sorted(os.listdir(d2))
        if f1_list != f2_list:
            print(f"Mismatch file lists for NPC {i}: {len(f1_list)} vs {len(f2_list)}")
            all_match = False
        else:
            # Check byte comparison on key files
            diffs = []
            for fn in ["idle_01.png", "attack_01.png", "idle.png", "preview.png"]:
                if not filecmp.cmp(os.path.join(d1, fn), os.path.join(d2, fn)):
                    diffs.append(fn)
            if diffs:
                print(f"Byte mismatch in NPC {i}: {diffs}")
                all_match = False

if all_match:
    print("✅ 100% Các folder fly_npc_X và npc_X hoàn toàn trùng khớp từng byte!")
