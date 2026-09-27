"""
tools/fix_enemy_feet.py
Chỉnh sửa đáy chân cho tất cả enemy frames:
1. Làm mềm và bo tròn đáy chân (khử vết cắt ngang phẳng do tách ảnh).
2. Thêm viền tối mảnh tự nhiên dưới đế giày/chân để tạo cảm giác tiếp đất chuẩn.
3. Căn chỉnh ground baseline đồng nhất cho toàn bộ frames của mỗi quái (không bị nhấp nhô/lún đất).
4. Chuẩn hóa kích thước khung hình 140x140 với lề đáy chân 12px chuẩn game.
"""
import os
import numpy as np
from PIL import Image, ImageFilter

def heal_feet_sole(img):
    """
    Phát hiện và phục hồi đế chân bị cắt phẳng bằng cách bo tròn mép đáy và tạo viền outline tự nhiên.
    """
    arr = np.array(img).copy()
    h, w = arr.shape[:2]
    alpha = arr[:, :, 3]
    
    pts = np.where(alpha > 15)
    if len(pts[0]) == 0:
        return img
        
    bottom_y = pts[0].max()
    top_y = pts[0].min()
    left_x = pts[1].min()
    right_x = pts[1].max()
    
    # Kiểm tra xem có bao nhiêu pixel ở 2 hàng đáy cùng
    bottom_row_pixels = np.sum(alpha[bottom_y, :] > 20)
    
    # Nếu hàng đáy cùng có nhiều pixel (> 8px) và chạm sát viền cũ
    if bottom_y >= h - 3 and bottom_row_pixels > 8:
        # Làm mịn 2 hàng dưới cùng
        for dy in range(3):
            curr_y = bottom_y - dy
            if 0 <= curr_y < h:
                mask = alpha[curr_y, :] > 15
                # Taper alpha
                factor = (dy + 1) / 3.0
                arr[curr_y, mask, 3] = (arr[curr_y, mask, 3].astype(float) * (0.5 + 0.45 * factor)).astype(np.uint8)
                # Đậm màu viền đáy giày
                arr[curr_y, mask, :3] = (arr[curr_y, mask, :3].astype(float) * (0.65 + 0.3 * factor)).astype(np.uint8)
                
    return Image.fromarray(arr)

def process_and_align_enemy(enemy_dir, target_w=140, target_h=140, ground_margin=12):
    """
    Xử lý tất cả frame trong thư mục enemy:
    - Bo tròn đáy chân
    - Căn chỉnh ground baseline chung cho cả bộ animation (idle, run, attack)
    """
    files = ['idle_0.png', 'idle_1.png', 'run_0.png', 'run_1.png', 'run_2.png', 'run_3.png',
             'attack_0.png', 'attack_1.png', 'attack_2.png', 'attack_3.png']
    
    loaded_imgs = {}
    crops = {}
    
    # Bước 1: Phục hồi đế chân cho từng frame
    for fn in files:
        p = os.path.join(enemy_dir, fn)
        if not os.path.exists(p):
            continue
        im = Image.open(p).convert('RGBA')
        healed = heal_feet_sole(im)
        loaded_imgs[fn] = healed
        
        # Bounding box
        arr = np.array(healed)
        pts = np.where(arr[:, :, 3] > 15)
        if len(pts[0]) > 0:
            b_y, t_y = pts[0].max(), pts[0].min()
            l_x, r_x = pts[1].min(), pts[1].max()
            crops[fn] = {
                'img': healed.crop((l_x, t_y, r_x + 1, b_y + 1)),
                't_y': t_y, 'b_y': b_y, 'l_x': l_x, 'r_x': r_x,
                'w': r_x - l_x + 1, 'h': b_y - t_y + 1
            }
            
    if not crops:
        return
        
    # Bước 2: Tìm baseline chân chạm đất chung (lấy từ idle_0 & idle_1 hoặc max b_y)
    idle_bottoms = [crops[fn]['b_y'] for fn in ['idle_0.png', 'idle_1.png'] if fn in crops]
    common_ground_b_y = max(idle_bottoms) if idle_bottoms else max(c['b_y'] for c in crops.values())
    
    # Bước 3: Đặt lên canvas chuẩn 140x140
    for fn, data in crops.items():
        crop_img = data['img']
        cw, ch = crop_img.size
        
        # Độ lệch của chân frame này so với baseline chạm đất (để giữ nhịp nhấc chân khi chạy/tấn công)
        foot_offset_from_ground = common_ground_b_y - data['b_y']
        
        # Ground Y trên canvas đích
        canvas_ground_y = target_h - ground_margin
        
        # Vị trí paste
        paste_x = (target_w - cw) // 2
        paste_y = canvas_ground_y - foot_offset_from_ground - ch
        
        # Kiểm tra tràn đỉnh canvas
        if paste_y < 2:
            # Scale vừa vặn
            scale = (canvas_ground_y - foot_offset_from_ground - 4) / max(1, ch)
            new_w = max(1, int(cw * scale))
            new_h = max(1, int(ch * scale))
            scaled_crop = crop_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            paste_x = (target_w - new_w) // 2
            paste_y = canvas_ground_y - foot_offset_from_ground - new_h
            crop_to_paste = scaled_crop
        else:
            crop_to_paste = crop_img
            
        canvas = Image.new('RGBA', (target_w, target_h), (0, 0, 0, 0))
        canvas.paste(crop_to_paste, (max(0, paste_x), max(0, paste_y)), crop_to_paste)
        
        # Lưu đè lại file đã hoàn thiện
        save_p = os.path.join(enemy_dir, fn)
        canvas.save(save_p)

if __name__ == '__main__':
    enemies_dir = r'H:\GOOGLE DRIVER\GAME\assets\enemies'
    print('Bat dau chinh sua day chan cho toan bo cac Enemy...')
    
    # Xử lý 8 Enemy mới
    for e in range(1, 9):
        edir = os.path.join(enemies_dir, f'enemy_{e}')
        if os.path.exists(edir):
            process_and_align_enemy(edir)
            print(f' -> Da chinh sua day chan: enemy_{e}')
            
    # Xử lý 8 Enemy cũ
    for e in range(1, 9):
        edir = os.path.join(enemies_dir, f'old_enemy_{e}')
        if os.path.exists(edir):
            process_and_align_enemy(edir, target_w=128, target_h=128, ground_margin=14)
            print(f' -> Da chinh sua day chan: old_enemy_{e}')
            
    print('Hoan tat 100%!')
