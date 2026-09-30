import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
npc_base = r"H:\GOOGLE DRIVER\GAME\assets\characters\npc"

# Targets to remove in flying NPCs and animated NPCs
target_exact = {"idle.png", "run.png", "attack.png", "fly.png", "preview.png"}
target_prefixes = ["truong_lao_tong_mon_attack.png", "truong_lao_tong_mon_fly.png", "truong_lao_tong_mon_idle.png", "truong_lao_tong_mon_preview.png", "truong_lao_tong_mon_run.png"]

deleted_count = 0

for root, dirs, files in os.walk(npc_base):
    for f in files:
        if f in target_exact or f in target_prefixes:
            p = os.path.join(root, f)
            try:
                os.remove(p)
                print(f"🗑️ Đã xóa: {os.path.relpath(p, npc_base)}")
                deleted_count += 1
            except Exception as e:
                print(f"Error removing {p}: {e}")

print(f"\n=== ĐÃ XÓA THÀNH CÔNG {deleted_count} FILE SPRITESHEET & PREVIEW ===")

# Summary of remaining frames in each flying NPC folder
flying_dir = os.path.join(npc_base, "flying")
print(f"\nKiểm tra lại 20 folder Flying NPC:")
for i in range(1, 21):
    d = os.path.join(flying_dir, f"npc_{i}")
    if os.path.exists(d):
        flist = sorted(os.listdir(d))
        print(f"  📁 npc_{i}: {len(flist)} frames ({flist[0]} .. {flist[-1]})")
