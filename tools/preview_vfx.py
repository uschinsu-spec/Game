import os
from PIL import Image, ImageDraw, ImageFont

def create_vfx_preview():
    elements = ['kim', 'hoa', 'thuy', 'tho', 'moc', 'phong', 'loi', 'ly']
    elem_names = ['Kim (Kiếm)', 'Hỏa (Lửa)', 'Thủy (Băng)', 'Thổ (Đất)', 'Mộc (Thảo)', 'Phong (Gió)', 'Lôi (Sét)', 'Thể Tu (Quyền)']
    
    # 2 rows, 8 cols -> 8 elements in Tier 1 and 8 elements in Tier 2
    cell_w = 140
    cell_h = 190
    
    img = Image.new('RGBA', (cell_w * 8 + 40, cell_h * 2 + 80), (15, 23, 42, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw title
    draw.text((20, 15), "HIỆU ỨNG VFX KỸ NĂNG ĐÃ XÓA NỀN & TỐI ƯU KÍCH THƯỚC (TRANSPARENT PNG)", fill=(255, 215, 0))
    
    # Row 1: Skills
    draw.text((20, 45), "▼ CƠ BẢN & TRUNG GIAI (SKILLS):", fill=(102, 255, 204))
    for i, elem in enumerate(elements):
        x = 20 + i * cell_w
        y = 70
        # Background box to test transparency
        draw.rectangle((x, y, x + cell_w - 10, y + cell_h - 10), fill=(24, 38, 58, 255), outline=(50, 80, 120, 255))
        
        path = f"H:/GOOGLE DRIVER/GAME/assets/vfx/skills/vfx_{elem}.png"
        if os.path.exists(path):
            vfx = Image.open(path).convert('RGBA')
            vw, vh = vfx.size
            img.paste(vfx, (x + (cell_w - 10 - vw) // 2, y + 10), vfx)
        
        draw.text((x + 10, y + cell_h - 30), elem_names[i], fill=(255, 255, 255))
    
    # Row 2: Ultimates
    y_r2 = 70 + cell_h
    draw.text((20, y_r2 - 25), "▼ ĐẠI THẦN THÔNG & CẤM THUẬT (ULTIMATES):", fill=(255, 170, 68))
    for i, elem in enumerate(elements):
        x = 20 + i * cell_w
        y = y_r2
        draw.rectangle((x, y, x + cell_w - 10, y + cell_h - 10), fill=(24, 38, 58, 255), outline=(50, 80, 120, 255))
        
        path = f"H:/GOOGLE DRIVER/GAME/assets/vfx/ultimates/vfx_{elem}.png"
        if os.path.exists(path):
            vfx = Image.open(path).convert('RGBA')
            vw, vh = vfx.size
            img.paste(vfx, (x + (cell_w - 10 - vw) // 2, y + 10), vfx)
        
        draw.text((x + 10, y + cell_h - 30), elem_names[i], fill=(255, 215, 0))
    
    out_path = r"C:\Users\nguye\.gemini\antigravity-ide\brain\599cf26d-283e-4472-af74-791320832a92\vfx_transparent_optimized_preview.png"
    img.save(out_path)
    print(f"Saved preview: {out_path}")

if __name__ == '__main__':
    create_vfx_preview()
