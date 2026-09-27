import os
import cv2
import numpy as np
from PIL import Image

def black_to_alpha(crop_im, threshold=12, gamma=1.25):
    arr = np.array(crop_im.convert('RGBA'), dtype=np.float32)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    luminance = np.maximum(r, np.maximum(g, b))
    alpha = np.clip((luminance - threshold) / (255.0 - threshold), 0.0, 1.0)
    alpha = np.power(alpha, 1.0 / gamma) * 255.0
    arr[:, :, 3] = alpha
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))

def process_3d_sheet(sheet_path, out_folder, elem_key, num_cols=4, num_rows=2, max_w=120, max_h=60):
    if not os.path.exists(sheet_path):
        print(f"File not found: {sheet_path}")
        return False
        
    master = Image.open(sheet_path)
    W, H = master.size
    col_w = W / float(num_cols)
    row_h = H / float(num_rows)
    
    out_dir = os.path.join(r'assets\vfx', out_folder)
    os.makedirs(out_dir, exist_ok=True)
    
    for idx in range(num_cols * num_rows):
        if idx >= 8:
            break
        row = idx // num_cols
        col = idx % num_cols
        x0 = int(col * col_w)
        y0 = int(row * row_h)
        x1 = int((col + 1) * col_w)
        y1 = int((row + 1) * row_h)
        
        crop = master.crop((x0, y0, x1, y1))
        vfx = black_to_alpha(crop)
        bbox = vfx.getbbox()
        if bbox:
            vfx = vfx.crop(bbox)
            
        canvas = Image.new('RGBA', (128, 64), (0, 0, 0, 0))
        cw, ch = vfx.size
        scale = min(float(max_w) / cw, float(max_h) / ch)
        nw, nh = max(1, int(cw * scale)), max(1, int(ch * scale))
        vfx_resized = vfx.resize((nw, nh), Image.Resampling.LANCZOS)
        
        canvas.paste(vfx_resized, ((128 - nw) // 2, (64 - nh) // 2), vfx_resized)
        
        canvas.save(os.path.join(out_dir, f'frame_{idx}.png'), quality=95)
        canvas.save(os.path.join(out_dir, f'{elem_key}_1_frame_{idx}.png'), quality=95)
        canvas.save(os.path.join(out_dir, f'proj_1_frame_{idx}.png'), quality=95)
        
    canvas.save(os.path.join(out_dir, 'proj_1.png'), quality=95)
    print(f"Successfully processed 8 3D frames for {out_folder} ({elem_key}) in {out_dir}")
    return True
