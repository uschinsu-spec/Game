import os
import glob
from PIL import Image, ImageDraw

brain_dir = r"C:\Users\nguye\.gemini\antigravity-ide\brain\599cf26d-283e-4472-af74-791320832a92"

stage_imgs = sorted(glob.glob(os.path.join(brain_dir, "xianxia_stages_grid*.jpg")))
print("Found stage image:", stage_imgs[-1] if stage_imgs else "None")

def get_circular_crop(img, box, target_size):
    crop = img.crop(box).convert("RGBA")
    crop = crop.resize(target_size, Image.Resampling.LANCZOS)
    
    mask = Image.new("L", (target_size[0] * 4, target_size[1] * 4), 0)
    m_draw = ImageDraw.Draw(mask)
    m_draw.ellipse([2, 2, mask.width - 3, mask.height - 3], fill=255)
    mask = mask.resize(target_size, Image.Resampling.LANCZOS)
    
    out = Image.new("RGBA", target_size, (0, 0, 0, 0))
    out.paste(crop, (0, 0), mask)
    return out

if stage_imgs:
    src_stages = Image.open(stage_imgs[-1])
    W, H = src_stages.size
    print(f"Stage image size: {W}x{H}")
    
    # 3 rows x 4 columns = 12 stages
    col_w = W / 4.0
    row_h = H / 4.0
    r = int(col_w * 0.44)
    
    stage_sheet = Image.new("RGBA", (72 * 12, 72), (0, 0, 0, 0))
    for row in range(3):
        for col in range(4):
            idx = row * 4 + col
            cx = (col + 0.5) * col_w
            cy = (row + 0.5) * row_h
            box = (int(cx - r), int(cy - r), int(cx + r), int(cy + r))
            icon = get_circular_crop(src_stages, box, (72, 72))
            stage_sheet.paste(icon, (idx * 72, 0))
            
    stage_sheet.save("assets/stage_icons.png")
    print("Saved realistic 3D assets/stage_icons.png successfully!")
