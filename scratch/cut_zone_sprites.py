"""
cut_zone_sprites.py
Cắt sprite sheet 4x2 thành 8 file PNG riêng và copy vào assets/ui/map/zones/
"""
from PIL import Image
import os
import shutil

# Đường dẫn
SHEET_PATH = r"C:\Users\nguye\.gemini\antigravity-ide\brain\60274eb9-0e6b-4458-8033-4464fa9576d7\zone_spritesheet_1790702369959.jpg"
OUT_DIR    = r"H:\GOOGLE DRIVER\GAME\assets\ui\map\zones"

# Tên 8 zone theo thứ tự left→right, top→bottom
ZONE_NAMES = [
    "zone_nation",      # [0,0] Quốc gia - đảo hoàng cung vàng
    "zone_wild",        # [0,1] Hoang dã - rừng jade xanh
    "zone_secret",      # [0,2] Bí cảnh - phế tích tím
    "zone_city",        # [0,3] Thành vực - thành phố cyan
    "zone_village",     # [1,0] Thôn an toàn - làng yên bình
    "zone_continent",   # [1,1] Đại lục - bản đồ lục địa
    "zone_region",      # [1,2] Đại vực - núi lửa sấm sét
    "zone_province",    # [1,3] Châu - ruộng bậc thang
]

os.makedirs(OUT_DIR, exist_ok=True)

img = Image.open(SHEET_PATH)
W, H = img.size
print(f"Sprite sheet size: {W}x{H}")

# 4 cột, 2 hàng — phát hiện border tự động (xấp xỉ)
COLS, ROWS = 4, 2

# Tính kích thước mỗi ô (có border ~3px mỗi bên)
# Ảnh có border đen khoảng 4px giữa các ô
cell_w = W / COLS
cell_h = H / ROWS

print(f"Cell size: {cell_w:.1f}x{cell_h:.1f}")

results = []
for row in range(ROWS):
    for col in range(COLS):
        idx  = row * COLS + col
        name = ZONE_NAMES[idx]

        # Crop với margin nhỏ để tránh border line
        margin = 6
        x0 = int(col * cell_w) + margin
        y0 = int(row * cell_h) + margin
        x1 = int((col + 1) * cell_w) - margin
        y1 = int((row + 1) * cell_h) - margin

        # Phần label text nằm ở bottom ~50px — cắt bỏ
        label_strip = 52
        y1_clean = y1 - label_strip

        cell = img.crop((x0, y0, x1, y1_clean))

        # Convert to RGBA (PNG với transparency)
        cell_rgba = cell.convert("RGBA")

        # Lưu PNG
        out_path = os.path.join(OUT_DIR, f"{name}.png")
        cell_rgba.save(out_path, "PNG", optimize=True)

        saved_size = os.path.getsize(out_path) // 1024
        print(f"  [{row},{col}] {name}: {cell.size[0]}x{cell.size[1]}px -> {saved_size}KB")
        results.append(name)

print(f"\n✅ Đã cắt {len(results)} zone sprites vào: {OUT_DIR}")
print("Zone files:")
for r in results:
    print(f"  → {r}.png")
