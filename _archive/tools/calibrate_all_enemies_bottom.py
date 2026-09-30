"""
tools/calibrate_all_enemies_bottom.py
Canh đáy chuẩn tuyệt đối (Ground Baseline Lock) cho toàn bộ:
1. 10 quái vật trong assets/ENEMI FLY
2. 16 quái vật trong assets/enemies
3. 8 quái vật trong assets/enemies/old_enemy_*

Khóa đáy chuẩn tại Y = 126 (bottom_gap = 13px) trên Canvas 140x140.
Khử hoàn toàn hiện tượng nhảy frame khi vỗ cánh/tấn công.
"""
import os
import numpy as np
from PIL import Image

def align_folder_bottom(folder_path, target_w=140, target_h=140, target_bottom_gap=13):
    anim_files = ['idle_0.png', 'idle_1.png', 'run_0.png', 'run_1.png', 'run_2.png', 'run_3.png',
                  'attack_0.png', 'attack_1.png', 'attack_2.png', 'attack_3.png']
    
    crops = {}
    target_ground_y = target_h - 1 - target_bottom_gap
    
    # Bước 1: Crop ôm sát nội dung thực tế của từng frame
    for fn in anim_files:
        fp = os.path.join(folder_path, fn)
        if not os.path.exists(fp):
            continue
        im = Image.open(fp).convert('RGBA')
        arr = np.array(im)
        alpha = arr[:, :, 3]
        pts = np.where(alpha > 20)
        
        if len(pts[0]) > 0:
            b_y, t_y = pts[0].max(), pts[0].min()
            l_x, r_x = pts[1].min(), pts[1].max()
            
            # Crop ôm sát
            cropped = im.crop((l_x, t_y, r_x + 1, b_y + 1))
            crops[fn] = {
                'img': cropped,
                'w': r_x - l_x + 1,
                'h': b_y - t_y + 1
            }
            
    if not crops:
        return
        
    # Bước 2: Đặt từng frame lên canvas 140x140 với đáy chuẩn cố định tại target_ground_y
    for fn, data in crops.items():
        crop_im = data['img']
        cw, ch = crop_im.size
        
        # Nếu chiều cao vượt quá khung canvas (tính từ target_ground_y lên đỉnh)
        max_allowed_h = target_ground_y - 2
        if ch > max_allowed_h or cw > target_w - 6:
            scale = min(max_allowed_h / ch, (target_w - 8) / cw)
            nw = max(1, int(cw * scale))
            nh = max(1, int(ch * scale))
            crop_im = crop_im.resize((nw, nh), Image.Resampling.LANCZOS)
            cw, ch = crop_im.size
            
        paste_x = (target_w - cw) // 2
        paste_y = target_ground_y - ch + 1
        
        canvas = Image.new('RGBA', (target_w, target_h), (0, 0, 0, 0))
        canvas.paste(crop_im, (max(0, paste_x), max(0, paste_y)), crop_im)
        canvas.save(os.path.join(folder_path, fn))

def run_all_calibrations():
    # 1. ENEMI FLY (10 enemies)
    fly_base = r'H:\GOOGLE DRIVER\GAME\assets\ENEMI FLY'
    if os.path.exists(fly_base):
        for d in sorted(os.listdir(fly_base)):
            edir = os.path.join(fly_base, d)
            if os.path.isdir(edir):
                align_folder_bottom(edir, 140, 140, 13)
                print(f'[OK] Canh day chuan ENEMI FLY: {d}')
                
    # 2. enemies (enemy_1..16)
    en_base = r'H:\GOOGLE DRIVER\GAME\assets\enemies'
    if os.path.exists(en_base):
        for d in sorted(os.listdir(en_base)):
            edir = os.path.join(en_base, d)
            if os.path.isdir(edir):
                align_folder_bottom(edir, 140, 140, 13)
                print(f'[OK] Canh day chuan enemies: {d}')

if __name__ == '__main__':
    run_all_calibrations()
