"""
tools/process_flying_enemies.py
Xử lý 10 quái vật bay từ C:\\Users\\nguye\\Desktop\\ENEMI\\1:
- Chuẩn hóa kích thước 140x140 RGBA trong suốt.
- Canh chỉnh tâm bay (hover altitude) đồng nhất cho từng frame.
- Xuất vào thư mục H:\\GOOGLE DRIVER\\GAME\\assets\\ENEMI FLY\\enemy_1..10
"""
import os
import numpy as np
from PIL import Image

def clean_and_heal_fly_vfx(img):
    arr = np.array(img).copy()
    h, w = arr.shape[:2]
    alpha = arr[:, :, 3]
    
    pts = np.where(alpha > 15)
    if len(pts[0]) == 0:
        return img
        
    b_y = pts[0].max()
    t_y = pts[0].min()
    l_x = pts[1].min()
    r_x = pts[1].max()
    
    # Khử vết cắt phẳng đáy nếu có
    if b_y >= h - 2 and np.sum(alpha[b_y, :] > 20) > 6:
        for dy in range(2):
            curr_y = b_y - dy
            if 0 <= curr_y < h:
                mask = alpha[curr_y, :] > 15
                factor = (dy + 1) / 2.0
                arr[curr_y, mask, 3] = (arr[curr_y, mask, 3].astype(float) * (0.6 + 0.35 * factor)).astype(np.uint8)
                arr[curr_y, mask, :3] = (arr[curr_y, mask, :3].astype(float) * (0.7 + 0.25 * factor)).astype(np.uint8)
                
    return Image.fromarray(arr)

def process_flying_enemies():
    src_dir = r'C:\Users\nguye\Desktop\ENEMI\1'
    dest_base = r'H:\GOOGLE DRIVER\GAME\assets\ENEMI FLY'
    os.makedirs(dest_base, exist_ok=True)
    
    target_w, target_h = 140, 140
    
    for row in range(10):
        enemy_idx = row + 1
        out_dir = os.path.join(dest_base, f'enemy_{enemy_idx}')
        os.makedirs(out_dir, exist_ok=True)
        
        frame_mapping = {
            'idle_0.png': f'{row*10 + 1}.png',
            'idle_1.png': f'{row*10 + 2}.png',
            'run_0.png': f'{row*10 + 3}.png',
            'run_1.png': f'{row*10 + 4}.png',
            'run_2.png': f'{row*10 + 5}.png',
            'run_3.png': f'{row*10 + 6}.png',
            'attack_0.png': f'{row*10 + 7}.png',
            'attack_1.png': f'{row*10 + 8}.png',
            'attack_2.png': f'{row*10 + 9}.png',
            'attack_3.png': f'{row*10 + 10}.png'
        }
        
        crops = {}
        for anim_fn, src_fn in frame_mapping.items():
            sp = os.path.join(src_dir, src_fn)
            if not os.path.exists(sp):
                continue
            im = Image.open(sp).convert('RGBA')
            healed = clean_and_heal_fly_vfx(im)
            
            arr = np.array(healed)
            pts = np.where(arr[:, :, 3] > 15)
            if len(pts[0]) > 0:
                b_y, t_y = pts[0].max(), pts[0].min()
                l_x, r_x = pts[1].min(), pts[1].max()
                
                # Tính tâm trọng tâm thân thể
                c_y = (t_y + b_y) / 2.0
                c_x = (l_x + r_x) / 2.0
                
                crops[anim_fn] = {
                    'img': healed.crop((l_x, t_y, r_x + 1, b_y + 1)),
                    't_y': t_y, 'b_y': b_y, 'l_x': l_x, 'r_x': r_x,
                    'c_y': c_y, 'c_x': c_x,
                    'w': r_x - l_x + 1, 'h': b_y - t_y + 1
                }
                
        if not crops:
            continue
            
        # Tìm tâm bay tham chiếu từ idle_0, idle_1
        idle_centers_y = [crops[fn]['c_y'] for fn in ['idle_0.png', 'idle_1.png'] if fn in crops]
        ref_cy = np.mean(idle_centers_y) if idle_centers_y else np.mean([c['c_y'] for c in crops.values()])
        
        # Đặt từng frame lên canvas 140x140
        for anim_fn, data in crops.items():
            crop_im = data['img']
            cw, ch = crop_im.size
            
            # Scale nếu quá khổ
            if cw > target_w - 6 or ch > target_h - 6:
                scale = min((target_w - 8) / cw, (target_h - 8) / ch)
                nw, nh = max(1, int(cw * scale)), max(1, int(ch * scale))
                crop_im = crop_im.resize((nw, nh), Image.Resampling.LANCZOS)
                cw, ch = crop_im.size
                
            # Đặt ở vị trí trung tâm canvas
            paste_x = (target_w - cw) // 2
            paste_y = (target_h - ch) // 2
            
            canvas = Image.new('RGBA', (target_w, target_h), (0, 0, 0, 0))
            canvas.paste(crop_im, (max(0, paste_x), max(0, paste_y)), crop_im)
            canvas.save(os.path.join(out_dir, anim_fn))
            
        print(f'Done ENEMI FLY/enemy_{enemy_idx} ({len(crops)} frames)')
        
    print('Hoan tat xu ly 10 ENEMI FLY!')

if __name__ == '__main__':
    process_flying_enemies()
