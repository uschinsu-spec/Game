"""
tools/process_all_fly_npcs.py
Tự động xử lý, resize 128x128, căn chuẩn đáy (baseline-aligned),
đặt tên chuẩn hoạt ảnh (idle, fly, run, attack, frame_01..16)
và xuất vào H:\\GOOGLE DRIVER\\GAME\\assets\\player\\NPC\\FLY NPC
"""
import os
import shutil
import numpy as np
from PIL import Image

def process_single_npc(folder_num, src_base, dest_base, target_size=(128, 128), pad_bottom=4):
    folder_path = os.path.join(src_base, str(folder_num))
    if not os.path.exists(folder_path):
        print(f"Skipping missing {folder_path}")
        return
        
    out_dir_npc = os.path.join(dest_base, f"npc_{folder_num}")
    out_dir_fly = os.path.join(dest_base, f"fly_npc_{folder_num}")
    os.makedirs(out_dir_npc, exist_ok=True)
    os.makedirs(out_dir_fly, exist_ok=True)
    
    tw, th = target_size
    
    # 1. Load all 16 frames
    images = []
    bboxes = []
    for i in range(1, 17):
        img_path = os.path.join(folder_path, f"{i}.png")
        img = Image.open(img_path).convert('RGBA')
        arr = np.array(img)
        alpha = arr[:, :, 3]
        pts = np.where(alpha > 15)
        if len(pts[0]) > 0:
            ymin, ymax = pts[0].min(), pts[0].max()
            xmin, xmax = pts[1].min(), pts[1].max()
            cw = xmax - xmin + 1
            ch = ymax - ymin + 1
            bboxes.append((xmin, ymin, xmax, ymax, cw, ch))
        else:
            bboxes.append((0, 0, img.width, img.height, img.width, img.height))
        images.append((img, arr))
        
    # 2. Global max dimensions across all 16 frames of this NPC
    max_cw = max(b[4] for b in bboxes)
    max_ch = max(b[5] for b in bboxes)
    
    max_allowed_w = tw - 8
    max_allowed_h = th - pad_bottom - 6
    
    scale = min(max_allowed_w / max_cw, max_allowed_h / max_ch, 1.0)
    
    # 3. Reference bottom baseline across idle/run frames (frames 9..16 -> index 8..15)
    bottom_offsets = [b[3] for b in bboxes]
    center_x_offsets = [(b[0] + b[2]) / 2.0 for b in bboxes]
    
    ref_bottom = np.median([bboxes[i][3] for i in range(8, 16)])
    ref_center_x = np.median([center_x_offsets[i] for i in range(8, 16)])
    
    processed_frames = {}
    
    for idx, (img, arr) in enumerate(images):
        frame_num = idx + 1
        b = bboxes[idx]
        
        new_w = max(1, int(img.width * scale))
        new_h = max(1, int(img.height * scale))
        resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        canvas = Image.new('RGBA', (tw, th), (0, 0, 0, 0))
        
        local_bot_y = int(b[3] * scale)
        local_cen_x = int(((b[0] + b[2]) / 2.0) * scale)
        
        target_bot_y = th - pad_bottom
        target_cen_x = tw // 2
        
        pos_x = target_cen_x - local_cen_x
        pos_y = target_bot_y - local_bot_y
        
        canvas.paste(resized, (pos_x, pos_y), resized)
        processed_frames[frame_num] = canvas
        
    # 4. Save named files:
    # 1..8: attack_01..08.png
    # 9..12: idle_01..04.png
    # 13..16: fly_01..04.png & run_01..04.png
    file_mappings = {}
    for i in range(1, 9):
        file_mappings[f"attack_{i:02d}.png"] = processed_frames[i]
    for i in range(9, 13):
        file_mappings[f"idle_{i-8:02d}.png"] = processed_frames[i]
    for i in range(13, 17):
        file_mappings[f"fly_{i-12:02d}.png"] = processed_frames[i]
        file_mappings[f"run_{i-12:02d}.png"] = processed_frames[i]
    for i in range(1, 17):
        file_mappings[f"frame_{i:02d}.png"] = processed_frames[i]
        file_mappings[f"{i}.png"] = processed_frames[i]
        
    for name, can in file_mappings.items():
        can.save(os.path.join(out_dir_npc, name))
        can.save(os.path.join(out_dir_fly, name))
        
    # 5. Build spritesheets
    # idle: 4x1 (512x128)
    idle_sheet = Image.new('RGBA', (tw * 4, th), (0, 0, 0, 0))
    for f in range(1, 5):
        idle_sheet.paste(file_mappings[f"idle_{f:02d}.png"], ((f - 1) * tw, 0))
    idle_sheet.save(os.path.join(out_dir_npc, "idle.png"))
    idle_sheet.save(os.path.join(out_dir_fly, "idle.png"))
    
    # fly: 4x1 (512x128)
    fly_sheet = Image.new('RGBA', (tw * 4, th), (0, 0, 0, 0))
    for f in range(1, 5):
        fly_sheet.paste(file_mappings[f"fly_{f:02d}.png"], ((f - 1) * tw, 0))
    fly_sheet.save(os.path.join(out_dir_npc, "fly.png"))
    fly_sheet.save(os.path.join(out_dir_fly, "fly.png"))
    
    # run: 4x1 (512x128)
    run_sheet = Image.new('RGBA', (tw * 4, th), (0, 0, 0, 0))
    for f in range(1, 5):
        run_sheet.paste(file_mappings[f"run_{f:02d}.png"], ((f - 1) * tw, 0))
    run_sheet.save(os.path.join(out_dir_npc, "run.png"))
    run_sheet.save(os.path.join(out_dir_fly, "run.png"))
    
    # attack: 8x1 (1024x128)
    attack_sheet = Image.new('RGBA', (tw * 8, th), (0, 0, 0, 0))
    for f in range(1, 9):
        attack_sheet.paste(file_mappings[f"attack_{f:02d}.png"], ((f - 1) * tw, 0))
    attack_sheet.save(os.path.join(out_dir_npc, "attack.png"))
    attack_sheet.save(os.path.join(out_dir_fly, "attack.png"))
    
    # preview montage 4x4 (512x512)
    preview = Image.new('RGBA', (tw * 4, th * 4), (20, 28, 38, 255))
    order = [
        "idle_01.png", "idle_02.png", "idle_03.png", "idle_04.png",
        "fly_01.png", "fly_02.png", "fly_03.png", "fly_04.png",
        "attack_01.png", "attack_02.png", "attack_03.png", "attack_04.png",
        "attack_05.png", "attack_06.png", "attack_07.png", "attack_08.png"
    ]
    for idx, fname in enumerate(order):
        im = file_mappings[fname]
        r = idx // 4
        c = idx % 4
        preview.paste(im, (c * tw, r * th), im)
    preview.save(os.path.join(out_dir_npc, "preview.png"))
    preview.save(os.path.join(out_dir_fly, "preview.png"))
    
    print(f"Done NPC {folder_num:02d}: scale={scale:.3f} -> 16 frames + 4 spritesheets + preview.png")

def main():
    src_base = r"C:\Users\nguye\Desktop\ENEMI\NPC"
    dest_base = r"H:\GOOGLE DRIVER\GAME\assets\characters\npc\flying"
    os.makedirs(dest_base, exist_ok=True)
    
    print(f"=== PROCESSING 20 FLYING NPCS ===")
    print(f"Source: {src_base}")
    print(f"Dest:   {dest_base}\n")
    
    for i in range(1, 21):
        process_single_npc(i, src_base, dest_base)
        
    print(f"\nALL 20 FLYING NPCS SUCCESSFULLY PROCESSED, RESIZED, BOTTOM-ALIGNED & SAVED!")

if __name__ == '__main__':
    main()
