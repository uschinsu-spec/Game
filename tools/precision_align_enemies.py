"""
tools/precision_align_enemies.py
Canh chỉnh đáy chân từng frame cho toàn bộ 24 enemy:
1. Xác định chân/điểm tiếp đất thực tế (loại trừ bụi đất, hiệu ứng văng dưới sàn).
2. Khóa Ground Baseline cố định tại Y = 126 (canvas 140x140).
3. Đảm bảo Idle, Run, Attack đều đứng vững trên cùng một mặt đất, không bị nhảy giật.
4. Xử lý mềm mại lòng bàn chân, móng vuốt, đuôi xà, chân nhện/cua, vuốt rồng.
"""
import os
import numpy as np
from PIL import Image

def get_foot_baseline_y(arr, is_flying=False):
    """
    Tìm tọa độ Y của đáy chân thực sự (bỏ qua các hạt bụi đơn lẻ mờ nhạt).
    """
    alpha = arr[:, :, 3]
    h, w = alpha.shape
    
    # Quét từ dưới lên trên (từ h-1 về 0)
    # Tìm hàng đầu tiên có ít nhất 4 pixel đậm (alpha > 40)
    for y in range(h - 1, -1, -1):
        solid_pixels = np.sum(alpha[y, :] > 40)
        if solid_pixels >= 4:
            return y
    # Fallback
    pts = np.where(alpha > 15)
    return pts[0].max() if len(pts[0]) > 0 else h - 1

def clean_and_heal_sole(img):
    """
    Làm sạch viền và làm mềm tự nhiên phần tiếp đất.
    """
    arr = np.array(img).copy()
    h, w = arr.shape[:2]
    alpha = arr[:, :, 3]
    
    pts = np.where(alpha > 15)
    if len(pts[0]) == 0:
        return img
        
    b_y = pts[0].max()
    
    # Nếu hàng đáy có vết cắt phẳng sát mép
    if b_y >= h - 2:
        for dy in range(2):
            curr_y = b_y - dy
            if 0 <= curr_y < h:
                mask = alpha[curr_y, :] > 15
                factor = (dy + 1) / 2.0
                arr[curr_y, mask, 3] = (arr[curr_y, mask, 3].astype(float) * (0.6 + 0.35 * factor)).astype(np.uint8)
                arr[curr_y, mask, :3] = (arr[curr_y, mask, :3].astype(float) * (0.7 + 0.25 * factor)).astype(np.uint8)
                
    return Image.fromarray(arr)

def align_enemy_folder(enemy_dir, target_w=140, target_h=140, ground_y=126, is_flying=False):
    """
    Căn chỉnh chính xác đáy chân từng frame trong 1 thư mục enemy.
    """
    anim_files = ['idle_0.png', 'idle_1.png', 'run_0.png', 'run_1.png', 'run_2.png', 'run_3.png',
                  'attack_0.png', 'attack_1.png', 'attack_2.png', 'attack_3.png']
                  
    loaded = {}
    crops = {}
    
    for fn in anim_files:
        p = os.path.join(enemy_dir, fn)
        if not os.path.exists(p):
            continue
        im = Image.open(p).convert('RGBA')
        healed = clean_and_heal_sole(im)
        loaded[fn] = healed
        
        arr = np.array(healed)
        pts = np.where(arr[:, :, 3] > 15)
        if len(pts[0]) > 0:
            b_y, t_y = pts[0].max(), pts[0].min()
            l_x, r_x = pts[1].min(), pts[1].max()
            
            # Tìm foot contact Y cụ thể của frame này
            foot_y = get_foot_baseline_y(arr, is_flying)
            
            crops[fn] = {
                'img': healed.crop((l_x, t_y, r_x + 1, b_y + 1)),
                't_y': t_y, 'b_y': b_y, 'l_x': l_x, 'r_x': r_x,
                'foot_rel_y': foot_y - t_y, # khoảng cách từ đỉnh crop tới chân
                'w': r_x - l_x + 1, 'h': b_y - t_y + 1
            }
            
    if not crops:
        return
        
    # Xác định vị trí tiếp đất chuẩn từ idle frames
    idle_foots = [crops[fn]['foot_rel_y'] for fn in ['idle_0.png', 'idle_1.png'] if fn in crops]
    idle_heights = [crops[fn]['h'] for fn in ['idle_0.png', 'idle_1.png'] if fn in crops]
    ref_foot_rel = idle_foots[0] if idle_foots else crops[list(crops.keys())[0]]['foot_rel_y']
    ref_h = max(idle_heights) if idle_heights else crops[list(crops.keys())[0]]['h']

    # Xuất từng frame lên canvas 140x140
    for fn, data in crops.items():
        crop_img = data['img']
        cw, ch = crop_img.size
        
        # Nếu là idle: chân luôn đặt chính xác tại ground_y
        if fn.startswith('idle'):
            paste_y = ground_y - data['foot_rel_y']
        # Nếu là run: chân chống đất đặt tại ground_y
        elif fn.startswith('run'):
            # Chân tiếp đất trong run
            paste_y = ground_y - data['foot_rel_y']
        # Nếu là attack: nếu có effect văng dưới sàn, căn chỉnh theo chân người đánh
        elif fn.startswith('attack'):
            # Căn chân người đánh tại ground_y
            paste_y = ground_y - data['foot_rel_y']
        else:
            paste_y = ground_y - ch
            
        paste_x = (target_w - cw) // 2
        
        # Kiểm tra nếu sprite bị tràn lên trên
        if paste_y < 2:
            overflow = 2 - paste_y
            scale = (target_h - 16) / max(1, (ch + overflow))
            new_w = max(1, int(cw * scale))
            new_h = max(1, int(ch * scale))
            scaled = crop_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            paste_x = (target_w - new_w) // 2
            paste_y = max(2, ground_y - int(data['foot_rel_y'] * scale))
            to_paste = scaled
        elif paste_y + ch > target_h:
            # Nếu effect văng nhẹ chạm sàn dưới
            paste_y = target_h - ch
            to_paste = crop_img
        else:
            to_paste = crop_img
            
        canvas = Image.new('RGBA', (target_w, target_h), (0, 0, 0, 0))
        canvas.paste(to_paste, (max(0, paste_x), max(0, paste_y)), to_paste)
        canvas.save(os.path.join(enemy_dir, fn))

def run_precision_alignment():
    enemies_dir = r'H:\GOOGLE DRIVER\GAME\assets\enemies'
    
    # Flying enemies (Dơi, Rồng)
    flying_ids = {'enemy_8', 'enemy_16', 'old_enemy_7'}
    
    # Danh sách tất cả thư mục
    all_dirs = sorted([d for d in os.listdir(enemies_dir) if os.path.isdir(os.path.join(enemies_dir, d))])
    
    print(f'Dang thuc hien canh day chan cho {len(all_dirs)} thu muc Enemy...')
    for d in all_dirs:
        edir = os.path.join(enemies_dir, d)
        is_fly = d in flying_ids
        align_enemy_folder(edir, target_w=140, target_h=140, ground_y=126, is_flying=is_fly)
        print(f'  [OK] Canh chuan: {d}')
        
    print('Hoan tat canh chinh toan bo!')

if __name__ == '__main__':
    run_precision_alignment()
