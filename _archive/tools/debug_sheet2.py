import os
from PIL import Image, ImageDraw

def debug_sheet2():
    img_path = r"C:\Users\nguye\.gemini\antigravity-ide\brain\599cf26d-283e-4472-af74-791320832a92\vfx_xianxia_ultimate_spells_1790494859061.jpg"
    img = Image.open(img_path)
    w, h = img.size
    
    # Draw grid lines on a copy to see exact pixel layout
    grid_img = img.copy()
    draw = ImageDraw.Draw(grid_img)
    
    # 4 cols, 2 rows
    for c in range(1, 4):
        x = c * (w // 4)
        draw.line((x, 0, x, h), fill=(255, 0, 0), width=3)
    for r in range(1, 2):
        y = r * (h // 2)
        draw.line((0, y, w, y), fill=(0, 255, 0), width=3)
        
    out_grid = r"C:\Users\nguye\.gemini\antigravity-ide\brain\599cf26d-283e-4472-af74-791320832a92\debug_sheet2_grid.png"
    grid_img.save(out_grid)
    print(f"Saved debug grid: {out_grid} size: {w}x{h}")

if __name__ == '__main__':
    debug_sheet2()
