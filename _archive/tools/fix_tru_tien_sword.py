"""
tools/fix_tru_tien_sword.py
Chỉnh sửa độ lệch tâm, căn chỉnh chính xác 100% trục giữa (centerline) cho Tru Tiên Kiếm
và toàn bộ 8 frames của kim_5_tru_tien.
"""
import os
import cv2
import numpy as np
from PIL import Image

def black_to_transparent_vfx(img_crop, threshold=10, gamma=1.2):
    arr = np.array(img_crop.convert('RGBA'), dtype=np.float32)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    luminance = np.maximum(r, np.maximum(g, b))
    alpha = np.clip((luminance - threshold) / (255.0 - threshold), 0.0, 1.0)
    alpha = np.power(alpha, 1.0 / gamma) * 255.0
    arr[:, :, 3] = alpha
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))

def fix_tru_tien_all():
    src_p = r'C:\Users\nguye\.gemini\antigravity-ide\brain\599cf26d-283e-4472-af74-791320832a92\sword_vfx_master_sheet_1790498841083.jpg'
    master = Image.open(src_p)
    
    out_base = r'H:\GOOGLE DRIVER\GAME\assets\vfx\sword'
    k5_dir = os.path.join(out_base, 'kim_5_tru_tien')
    os.makedirs(k5_dir, exist_ok=True)
    
    # 8 Tru Tien Swords on Row 4 (y: 610 to 805)
    # Tọa độ X tâm thực tế của từng thanh kiếm trong master sheet
    sword_centers_x = [55, 160, 265, 370, 475, 580, 685, 790]
    
    # Kích thước khung cắt chuẩn quanh tâm kiếm (bán kính 48px mỗi bên = rộng 96px, cao 196px)
    half_w = 48
    y0, y1 = 610, 806
    
    canvas_w, canvas_h = 160, 220
    ground_tip_y = 205 # mũi kiếm cắm xuống đáy
    
    for i, cx in enumerate(sword_centers_x):
        x0 = cx - half_w
        x1 = cx + half_w
        
        crop = master.crop((x0, y0, x1, y1))
        vfx = black_to_transparent_vfx(crop)
        
        # Tìm chính xác trục tâm kiếm (trung bình x của các pixel sáng > 60)
        arr = np.array(vfx)
        alpha = arr[:, :, 3]
        pts = np.where(alpha > 60)
        
        if len(pts[0]) > 0:
            core_min_x = pts[1].min()
            core_max_x = pts[1].max()
            core_center_x = (core_min_x + core_max_x) / 2.0
            
            # Crop ôm sát
            min_y = pts[0].min()
            max_y = pts[0].max()
            tight = vfx.crop((0, min_y, vfx.width, max_y + 1))
            
            # Tính offset để đưa core_center_x về đúng chính giữa canvas (canvas_w / 2 = 80)
            paste_x = int(canvas_w / 2.0 - core_center_x)
            paste_y = ground_tip_y - tight.height
            
            canvas = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))
            canvas.paste(tight, (paste_x, max(2, paste_y)), tight)
            
            save_fn = f'frame_{i}.png'
            canvas.save(os.path.join(k5_dir, save_fn))
            
            # Lưu frame_0 hoặc frame_1 làm giant_tru_tien_sword.png chuẩn
            if i == 0:
                # Tạo bản standalone giant_tru_tien_sword.png hoàn hảo
                standalone = Image.new('RGBA', (140, 220), (0, 0, 0, 0))
                # Căn giữa trên 140x220
                s_paste_x = int(140 / 2.0 - core_center_x)
                standalone.paste(tight, (s_paste_x, max(2, paste_y)), tight)
                standalone.save(os.path.join(out_base, 'giant_tru_tien_sword.png'))
                
    print('Da can chinh tam 100% cho giant_tru_tien_sword.png va 8 frames kim_5_tru_tien!')

if __name__ == '__main__':
    fix_tru_tien_all()
