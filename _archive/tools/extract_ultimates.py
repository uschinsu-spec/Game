import os
import numpy as np
from PIL import Image

def extract_ultimates_precise():
    img2_path = r"C:\Users\nguye\.gemini\antigravity-ide\brain\599cf26d-283e-4472-af74-791320832a92\vfx_xianxia_ultimate_spells_1790494859061.jpg"
    out_dir_ult = r"H:\GOOGLE DRIVER\GAME\assets\vfx\ultimates"
    os.makedirs(out_dir_ult, exist_ok=True)
    
    img = Image.open(img2_path).convert('RGBA')
    
    # Exact pixel coordinates (x1, y1, x2, y2) for 1024x1024 image
    precise_ult_boxes = {
        'kim': (10, 10, 250, 500),         # Thái Canh Tru Tiên Trận (Vạn kiếm xoay)
        'hoa': (260, 10, 505, 500),        # Cửu Tiêu Thần Hỏa (Thiên thạch giáng thế)
        'thuy': (510, 245, 755, 495),      # Thiên Địa Băng Phong (Băng Liên vạn dặm)
        'tho': (765, 245, 1015, 495),      # Huyền Hoàng Địa Long (Rồng đất nham thạch)
        'moc': (10, 520, 250, 970),        # Vạn Vật Tái Sinh (Thần mộc thanh long)
        'phong': (260, 520, 505, 730),     # Hỗn Độn Thần Phong (Hố đen không gian)
        'loi': (515, 520, 760, 970),       # Tử Tiêu Diệt Thế Lôi (Lôi kiếp tối thượng)
        'ly': (770, 520, 1015, 970)        # Phạm Thánh Thần Ma Thể (Hoàng kim thần quyền)
    }
    
    for name, box in precise_ult_boxes.items():
        crop = img.crop(box)
        save_optimized_vfx(crop, os.path.join(out_dir_ult, f'vfx_{name}.png'))
        
    print("Precise ultimates extracted successfully!")

def save_optimized_vfx(crop_img, out_path):
    arr = np.array(crop_img).astype(np.float32)
    r_c, g_c, b_c = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    max_c = np.maximum(np.maximum(r_c, g_c), b_c)
    
    # Pure black transparency threshold
    threshold = 26.0
    alpha = np.clip((max_c - threshold) / (215.0 - threshold) * 255.0, 0, 255)
    
    # Non-linear boost to keep glowing particles and lighting vivid
    alpha_norm = alpha / 255.0
    alpha_boosted = np.power(alpha_norm, 0.80) * 255.0
    
    # Color un-multiplying to avoid dark halo around glows
    safe_a = np.maximum(alpha_boosted / 255.0, 0.08)
    arr[:, :, 0] = np.clip(r_c / safe_a, 0, 255)
    arr[:, :, 1] = np.clip(g_c / safe_a, 0, 255)
    arr[:, :, 2] = np.clip(b_c / safe_a, 0, 255)
    arr[:, :, 3] = alpha_boosted
    
    out_img = Image.fromarray(arr.astype(np.uint8))
    
    # Auto-trim transparent edges
    bbox = out_img.getbbox()
    if bbox:
        out_img = out_img.crop(bbox)
        
    # Resize to max 130px
    max_dim = 130
    orig_w, orig_h = out_img.size
    scale = max_dim / max(orig_w, orig_h)
    new_w = max(1, int(orig_w * scale))
    new_h = max(1, int(orig_h * scale))
    out_img = out_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    out_img.save(out_path, optimize=True)
    kb = os.path.getsize(out_path) / 1024
    print(f"Saved: {out_path} [{new_w}x{new_h}] ({kb:.1f} KB)")

if __name__ == '__main__':
    extract_ultimates_precise()
