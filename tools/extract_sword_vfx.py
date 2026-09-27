"""
tools/extract_sword_vfx.py
Tách và tối ưu hóa toàn bộ bộ VFX Hệ Kiếm (Hệ Kim) sang transparent RGBA PNG:
1. Kim Nhận Thuật (Flying Sword Projectile)
2. Bạch Hổ Canh Kim Kiếm (Cross-Slash Sword Energy Burst)
3. Thập Nhị Thiên Kiếm Trận (12-Sword Runic Formation)
4. Đại Canh Kiếm Khí (Vạn Kiếm Quy Tông Rain)
5. Thái Canh Tru Tiên Trận (Giant Tru Tien Celestial Sword Impact)
"""
import os
import numpy as np
from PIL import Image

def black_to_transparent_vfx(img_crop, threshold=15, gamma=1.2):
    """
    Chuyển nền đen thành kênh Alpha mượt mà, giữ trọn ánh sáng phát quang (glow/bloom).
    """
    arr = np.array(img_crop.convert('RGBA'), dtype=np.float32)
    # Tính độ sáng pixel
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    luminance = np.maximum(r, np.maximum(g, b))
    
    # Tính alpha mượt mà
    alpha = np.clip((luminance - threshold) / (255.0 - threshold), 0.0, 1.0)
    alpha = np.power(alpha, 1.0 / gamma) * 255.0
    
    # Nâng nhẹ độ rực màu của vùng sáng
    arr[:, :, 3] = alpha
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))

def extract_and_export():
    src_p = r'C:\Users\nguye\.gemini\antigravity-ide\brain\599cf26d-283e-4472-af74-791320832a92\sword_vfx_master_sheet_1790498841083.jpg'
    im = Image.open(src_p)
    w, h = im.size
    print(f'Master image size: {w}x{h}')
    
    out_base = r'H:\GOOGLE DRIVER\GAME\assets\vfx\sword'
    os.makedirs(out_base, exist_ok=True)
    
    # -------------------------------------------------------------
    # 1. Kim Nhận Thuật / Phi Kiếm Projectile (Row 1: y: 25 to 170)
    # -------------------------------------------------------------
    dir_k1 = os.path.join(out_base, 'kim_1_flying_sword')
    os.makedirs(dir_k1, exist_ok=True)
    # 8 frames on row 1 (x: 100 to 1020, y: 25 to 85)
    r1_y0, r1_y1 = 25, 80
    r1_w = (1020 - 95) / 8.0
    for i in range(8):
        x0 = int(95 + i * r1_w)
        x1 = int(95 + (i + 1) * r1_w)
        crop = im.crop((x0, r1_y0, x1, r1_y1))
        vfx = black_to_transparent_vfx(crop)
        # Bounding box
        bbox = vfx.getbbox()
        if bbox:
            vfx = vfx.crop(bbox)
        # Canvas 128x64 (horizontal projectile)
        canv = Image.new('RGBA', (128, 64), (0, 0, 0, 0))
        canv.paste(vfx, ((128 - vfx.width)//2, (64 - vfx.height)//2), vfx)
        canv.save(os.path.join(dir_k1, f'frame_{i}.png'))
    print('Exported kim_1_flying_sword (8 frames)')
    
    # -------------------------------------------------------------
    # 2. Bạch Hổ Canh Kim Kiếm (Row 5: Golden Cross-Slash & Hit Sparks)
    # -------------------------------------------------------------
    dir_k2 = os.path.join(out_base, 'kim_2_slash_burst')
    os.makedirs(dir_k2, exist_ok=True)
    # 8 frames on row 5 (y: 810 to 920, x: 0 to 1024)
    r5_y0, r5_y1 = 810, 920
    r5_w = 1024.0 / 8.0
    for i in range(8):
        x0 = int(i * r5_w)
        x1 = int((i + 1) * r5_w)
        crop = im.crop((x0, r5_y0, x1, r5_y1))
        vfx = black_to_transparent_vfx(crop)
        bbox = vfx.getbbox()
        if bbox:
            vfx = vfx.crop(bbox)
        canv = Image.new('RGBA', (140, 140), (0, 0, 0, 0))
        canv.paste(vfx, ((140 - vfx.width)//2, (140 - vfx.height)//2), vfx)
        canv.save(os.path.join(dir_k2, f'frame_{i}.png'))
    print('Exported kim_2_slash_burst (8 frames)')

    # -------------------------------------------------------------
    # 3. Thập Nhị Thiên Kiếm Trận (Row 2: Rotating Sword Array)
    # -------------------------------------------------------------
    dir_k3 = os.path.join(out_base, 'kim_3_sword_array')
    os.makedirs(dir_k3, exist_ok=True)
    # Row 2 circles (y: 190 to 300, 8 frames from x: 190 to 1024)
    r2_y0, r2_y1 = 185, 305
    r2_w = (1024.0 - 190.0) / 7.0
    for i in range(7):
        x0 = int(190 + i * r2_w)
        x1 = int(190 + (i + 1) * r2_w)
        crop = im.crop((x0, r2_y0, x1, r2_y1))
        vfx = black_to_transparent_vfx(crop)
        bbox = vfx.getbbox()
        if bbox:
            vfx = vfx.crop(bbox)
        canv = Image.new('RGBA', (180, 180), (0, 0, 0, 0))
        canv.paste(vfx, ((180 - vfx.width)//2, (180 - vfx.height)//2), vfx)
        canv.save(os.path.join(dir_k3, f'frame_{i}.png'))
    # Also save the big compound sword array from top-left (0..190, 185..390)
    big_array_crop = im.crop((5, 195, 195, 385))
    big_vfx = black_to_transparent_vfx(big_array_crop)
    big_canv = Image.new('RGBA', (200, 200), (0, 0, 0, 0))
    big_canv.paste(big_vfx, ((200 - big_vfx.width)//2, (200 - big_vfx.height)//2), big_vfx)
    big_canv.save(os.path.join(dir_k3, 'frame_7.png'))
    big_canv.save(os.path.join(out_base, 'sword_array_formation.png'))
    print('Exported kim_3_sword_array (8 frames + formation icon)')

    # -------------------------------------------------------------
    # 4. Đại Canh Kiếm Khí (Vạn Kiếm Quy Tông Rain - Row 3)
    # -------------------------------------------------------------
    dir_k4 = os.path.join(out_base, 'kim_4_sword_rain')
    os.makedirs(dir_k4, exist_ok=True)
    # Row 3: y: 400 to 595, 8 frames from x: 0 to 1024
    r3_y0, r3_y1 = 400, 595
    r3_w = 1024.0 / 8.0
    for i in range(8):
        x0 = int(i * r3_w)
        x1 = int((i + 1) * r3_w)
        crop = im.crop((x0, r3_y0, x1, r3_y1))
        vfx = black_to_transparent_vfx(crop)
        bbox = vfx.getbbox()
        if bbox:
            vfx = vfx.crop(bbox)
        canv = Image.new('RGBA', (140, 200), (0, 0, 0, 0))
        canv.paste(vfx, ((140 - vfx.width)//2, (200 - vfx.height)//2), vfx)
        canv.save(os.path.join(dir_k4, f'frame_{i}.png'))
    print('Exported kim_4_sword_rain (8 frames)')

    # -------------------------------------------------------------
    # 5. Thái Canh Tru Tiên Trận (Giant Tru Tien Celestial Sword - Row 4)
    # -------------------------------------------------------------
    dir_k5 = os.path.join(out_base, 'kim_5_tru_tien')
    os.makedirs(dir_k5, exist_ok=True)
    # Row 4: y: 605 to 805, 8 frames from x: 0 to 1024
    r4_y0, r4_y1 = 605, 805
    r4_w = 1024.0 / 8.0
    for i in range(8):
        x0 = int(i * r4_w)
        x1 = int((i + 1) * r4_w)
        crop = im.crop((x0, r4_y0, x1, r4_y1))
        vfx = black_to_transparent_vfx(crop)
        bbox = vfx.getbbox()
        if bbox:
            vfx = vfx.crop(bbox)
        canv = Image.new('RGBA', (160, 220), (0, 0, 0, 0))
        canv.paste(vfx, ((160 - vfx.width)//2, (220 - vfx.height)//2), vfx)
        canv.save(os.path.join(dir_k5, f'frame_{i}.png'))
    print('Exported kim_5_tru_tien (8 frames)')

    # Also save single high-res sprites for projectile / formation instantiation
    single_sword = black_to_transparent_vfx(im.crop((95, 25, 205, 80)))
    single_sword.save(os.path.join(out_base, 'golden_flying_sword.png'))
    
    giant_sword = black_to_transparent_vfx(im.crop((10, 605, 120, 805)))
    giant_sword.save(os.path.join(out_base, 'giant_tru_tien_sword.png'))
    print('Exported individual master sword assets!')

if __name__ == '__main__':
    extract_and_export()
