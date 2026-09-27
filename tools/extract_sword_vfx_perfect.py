"""
tools/extract_sword_vfx_perfect.py
Tách chính xác 100% từng hiệu ứng VFX hệ Kiếm từ master sheet không bị dính hình xung quanh.
"""
import os
import cv2
import numpy as np
from PIL import Image

def black_to_transparent_vfx(img_crop, threshold=12, gamma=1.25):
    arr = np.array(img_crop.convert('RGBA'), dtype=np.float32)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    luminance = np.maximum(r, np.maximum(g, b))
    
    alpha = np.clip((luminance - threshold) / (255.0 - threshold), 0.0, 1.0)
    alpha = np.power(alpha, 1.0 / gamma) * 255.0
    arr[:, :, 3] = alpha
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))

def make_clean_frame(master_im, x0, y0, x1, y1, target_w, target_h, pad=4):
    crop = master_im.crop((max(0, x0 - pad), max(0, y0 - pad), min(master_im.width, x1 + pad), min(master_im.height, y1 + pad)))
    vfx = black_to_transparent_vfx(crop)
    bbox = vfx.getbbox()
    if bbox:
        vfx = vfx.crop(bbox)
    
    canvas = Image.new('RGBA', (target_w, target_h), (0, 0, 0, 0))
    # Scale if larger than canvas
    cw, ch = vfx.size
    if cw > target_w - 4 or ch > target_h - 4:
        scale = min((target_w - 6) / cw, (target_h - 6) / ch)
        nw, nh = max(1, int(cw * scale)), max(1, int(ch * scale))
        vfx = vfx.resize((nw, nh), Image.Resampling.LANCZOS)
        cw, ch = vfx.size
        
    canvas.paste(vfx, ((target_w - cw) // 2, (target_h - ch) // 2), vfx)
    return canvas

def extract_all():
    src_p = r'C:\Users\nguye\.gemini\antigravity-ide\brain\599cf26d-283e-4472-af74-791320832a92\sword_vfx_master_sheet_1790498841083.jpg'
    master = Image.open(src_p)
    out_base = r'H:\GOOGLE DRIVER\GAME\assets\vfx\sword'
    os.makedirs(out_base, exist_ok=True)
    
    # -------------------------------------------------------------
    # 1. Kim Nhận Thuật (Flying Sword Projectiles - 8 frames)
    # -------------------------------------------------------------
    dir_k1 = os.path.join(out_base, 'kim_1_flying_sword')
    os.makedirs(dir_k1, exist_ok=True)
    # 8 flying swords on row 1
    swords_coords = [
        (105, 30, 202, 70),
        (208, 30, 305, 70),
        (310, 27, 408, 70),
        (412, 29, 508, 70),
        (515, 29, 610, 70),
        (618, 29, 715, 70),
        (720, 29, 816, 70),
        (822, 29, 918, 70)
    ]
    for i, (x0, y0, x1, y1) in enumerate(swords_coords):
        frame = make_clean_frame(master, x0, y0, x1, y1, 128, 64)
        frame.save(os.path.join(dir_k1, f'frame_{i}.png'))
    print('Cleaned kim_1_flying_sword (8 frames)')
    
    # -------------------------------------------------------------
    # 2. Bạch Hổ Canh Kim Kiếm (Cross-Slash to Hit Explosion - 8 frames)
    # -------------------------------------------------------------
    dir_k2 = os.path.join(out_base, 'kim_2_slash_burst')
    os.makedirs(dir_k2, exist_ok=True)
    # 4 cross-slash frames + 4 explosion bursts
    slash_coords = [
        (6, 822, 98, 912),      # cross blades 1
        (110, 822, 200, 912),   # cross blades 2
        (212, 822, 304, 912),   # slash diagonal
        (315, 822, 404, 912),   # slash glow
        (518, 822, 608, 912),   # spark burst 1
        (620, 822, 710, 912),   # spark burst 2
        (722, 822, 812, 912),   # spark burst 3
        (824, 822, 916, 912)    # flash ring
    ]
    for i, (x0, y0, x1, y1) in enumerate(slash_coords):
        frame = make_clean_frame(master, x0, y0, x1, y1, 140, 140)
        frame.save(os.path.join(dir_k2, f'frame_{i}.png'))
    print('Cleaned kim_2_slash_burst (8 frames)')

    # -------------------------------------------------------------
    # 3. Thập Nhị Thiên Kiếm Trận (Rotating 12-Sword Array - 8 frames)
    # -------------------------------------------------------------
    dir_k3 = os.path.join(out_base, 'kim_3_sword_array')
    os.makedirs(dir_k3, exist_ok=True)
    array_coords = [
        (205, 195, 306, 298),
        (308, 195, 408, 298),
        (410, 195, 510, 298),
        (512, 195, 612, 298),
        (614, 195, 714, 298),
        (716, 195, 816, 298),
        (818, 195, 918, 298),
        (920, 195, 1020, 298)
    ]
    for i, (x0, y0, x1, y1) in enumerate(array_coords):
        frame = make_clean_frame(master, x0, y0, x1, y1, 160, 160)
        frame.save(os.path.join(dir_k3, f'frame_{i}.png'))
        
    # Big master triple-formation
    master_array = make_clean_frame(master, 2, 193, 203, 396, 220, 220)
    master_array.save(os.path.join(out_base, 'sword_array_formation.png'))
    print('Cleaned kim_3_sword_array (8 frames + formation icon)')

    # -------------------------------------------------------------
    # 4. Đại Canh Kiếm Khí (Vạn Kiếm Quy Tông Rain - 8 frames)
    # -------------------------------------------------------------
    dir_k4 = os.path.join(out_base, 'kim_4_sword_rain')
    os.makedirs(dir_k4, exist_ok=True)
    rain_coords = [
        (20, 405, 85, 595),
        (120, 405, 185, 595),
        (225, 405, 290, 595),
        (320, 405, 395, 595),
        (425, 405, 500, 595),
        (525, 405, 600, 595),
        (625, 405, 700, 595),
        (725, 405, 800, 595)
    ]
    for i, (x0, y0, x1, y1) in enumerate(rain_coords):
        frame = make_clean_frame(master, x0, y0, x1, y1, 140, 200)
        frame.save(os.path.join(dir_k4, f'frame_{i}.png'))
    print('Cleaned kim_4_sword_rain (8 frames)')

    # -------------------------------------------------------------
    # 5. Thái Canh Tru Tiên Trận (Giant Celestial Tru Tiên Sword - 8 frames)
    # -------------------------------------------------------------
    dir_k5 = os.path.join(out_base, 'kim_5_tru_tien')
    os.makedirs(dir_k5, exist_ok=True)
    trutien_coords = [
        (5, 608, 105, 805),
        (110, 608, 210, 805),
        (215, 608, 315, 805),
        (320, 608, 420, 805),
        (425, 608, 525, 805),
        (530, 608, 630, 805),
        (635, 608, 735, 805),
        (740, 608, 840, 805)
    ]
    for i, (x0, y0, x1, y1) in enumerate(trutien_coords):
        frame = make_clean_frame(master, x0, y0, x1, y1, 160, 220)
        frame.save(os.path.join(dir_k5, f'frame_{i}.png'))
        
    # Shockwave ring (900..1020, 620..780)
    shockwave = make_clean_frame(master, 890, 620, 1020, 780, 160, 160)
    shockwave.save(os.path.join(out_base, 'tru_tien_shockwave.png'))
    print('Cleaned kim_5_tru_tien (8 frames + shockwave)')

if __name__ == '__main__':
    extract_all()
