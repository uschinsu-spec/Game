import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
base = r"h:\GOOGLE DRIVER\GAME\assets\characters\npc\flying"
print("=== TIẾN HÀNH ĐỔI TÊN CHUẨN HÓA CÁC FRAME FLYING NPC ===")

for i in range(1, 21):
    p = os.path.join(base, f"npc_{i}")
    if not os.path.exists(p):
        continue
    
    # 1. Read files into memory
    data = {}
    for fname in os.listdir(p):
        fpath = os.path.join(p, fname)
        if os.path.isfile(fpath):
            with open(fpath, "rb") as f:
                data[fname] = f.read()
                
    # 2. Clear folder
    for fname in os.listdir(p):
        fpath = os.path.join(p, fname)
        if os.path.isfile(fpath):
            os.remove(fpath)
            
    # 3. Write attack_01..08
    for j in range(1, 9):
        atk_name = f"attack_{j:02d}.png"
        if atk_name in data:
            with open(os.path.join(p, atk_name), "wb") as f:
                f.write(data[atk_name])
                
    # 4. Write fly_01..08 (fly_01..04 = idle_01..04, fly_05..08 = old fly_01..04)
    for j in range(1, 5):
        idle_name = f"idle_{j:02d}.png"
        target_name = f"fly_{j:02d}.png"
        if idle_name in data:
            with open(os.path.join(p, target_name), "wb") as f:
                f.write(data[idle_name])
                
    for j in range(1, 5):
        old_fly_name = f"fly_{j:02d}.png"
        target_name = f"fly_{j+4:02d}.png"
        if old_fly_name in data:
            with open(os.path.join(p, target_name), "wb") as f:
                f.write(data[old_fly_name])
                
    new_files = sorted(os.listdir(p))
    print(f"npc_{i}: {len(new_files)} files -> {new_files}")

print("=== HOÀN TẤT ĐỔI TÊN CHUẨN HÓA 20 FLYING NPC ===")
