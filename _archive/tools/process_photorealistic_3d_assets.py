import os
import glob
from PIL import Image, ImageDraw, ImageFilter, ImageOps

# Locate generated images
brain_dir = r"C:\Users\nguye\.gemini\antigravity-ide\brain\599cf26d-283e-4472-af74-791320832a92"

skill_imgs = sorted(glob.glob(os.path.join(brain_dir, "xianxia_skills_grid*.jpg")))
item_imgs = sorted(glob.glob(os.path.join(brain_dir, "xianxia_items_grid*.jpg")))
ui_imgs = sorted(glob.glob(os.path.join(brain_dir, "xianxia_ui_elements*.jpg")))

print("Found skill image:", skill_imgs[-1] if skill_imgs else "None")
print("Found item image:", item_imgs[-1] if item_imgs else "None")
print("Found ui image:", ui_imgs[-1] if ui_imgs else "None")

def get_circular_crop(img, box, target_size):
    crop = img.crop(box).convert("RGBA")
    crop = crop.resize(target_size, Image.Resampling.LANCZOS)
    
    # Create soft antialiased circular mask
    mask = Image.new("L", (target_size[0] * 4, target_size[1] * 4), 0)
    m_draw = ImageDraw.Draw(mask)
    m_draw.ellipse([2, 2, mask.width - 3, mask.height - 3], fill=255)
    mask = mask.resize(target_size, Image.Resampling.LANCZOS)
    
    out = Image.new("RGBA", target_size, (0, 0, 0, 0))
    out.paste(crop, (0, 0), mask)
    return out

# -------------------------------------------------------------
# 1. PROCESS SKILL ICONS (10 Skills -> 960x96)
# -------------------------------------------------------------
if skill_imgs:
    src_skills = Image.open(skill_imgs[-1])
    W, H = src_skills.size
    print(f"Skills image size: {W}x{H}")
    
    # Coordinates of the 10 circular medallions in xianxia_skills_grid
    # Grid layout:
    # Row 0: 4 icons (0: Wind/Jade Sword, 1: Sword Rain, 2: Lightning Sword, 3: Ice Sword)
    # Row 1: 4 icons (4: Fire Sword, 5: Taiji Sword Array, 6: Winged Boots, 7: Flying Sword on Cloud)
    # Row 2, col 1: (8: Seven Star Constellation)
    # Row 3, col 1: (9: Golden Temple Bell)
    
    col_w = W / 4.0
    row_h = H / 4.0
    
    # Center coords of each skill
    skill_centers = [
        (col_w * 0.5, row_h * 0.5),     # 0: Jade Wind Sword
        (col_w * 1.5, row_h * 0.5),     # 1: Golden Sword Rain
        (col_w * 2.5, row_h * 0.5),     # 2: Purple Lightning Sword
        (col_w * 3.5, row_h * 0.5),     # 3: Frost Ice Greatsword
        (col_w * 0.5, row_h * 1.5),     # 4: Flaming Phoenix Sword
        (col_w * 1.5, row_h * 1.5),     # 5: Taiji Sword Nova
        (col_w * 2.5, row_h * 1.5),     # 6: Winged Boots (Dash)
        (col_w * 3.5, row_h * 1.5),     # 7: Flying Sword on Cloud (Flight)
        (col_w * 1.5, row_h * 2.5),     # 8: Seven Star Matrix
        (col_w * 2.5, row_h * 3.5),     # 9: Golden Bell Aegis
    ]
    
    radius = int(col_w * 0.44)
    
    skill_sheet = Image.new("RGBA", (96 * 10, 96), (0, 0, 0, 0))
    for i, (cx, cy) in enumerate(skill_centers):
        box = (int(cx - radius), int(cy - radius), int(cx + radius), int(cy + radius))
        icon = get_circular_crop(src_skills, box, (96, 96))
        skill_sheet.paste(icon, (i * 96, 0))
        
    skill_sheet.save("assets/skill_icons.png")
    print("Saved realistic 3D assets/skill_icons.png successfully!")

# -------------------------------------------------------------
# 2. PROCESS ITEMS ATLAS (18 Items -> 1440x80)
# -------------------------------------------------------------
if item_imgs:
    src_items = Image.open(item_imgs[-1])
    W, H = src_items.size
    print(f"Items image size: {W}x{H}")
    
    # 3x6 Grid: 3 columns (Tier 1, Tier 2, Tier 3) x 6 rows (Sword, Armor, Helm, Boots, Ring, Talisman)
    col_w = W / 3.0
    row_h = H / 6.0
    
    item_sheet = Image.new("RGBA", (80 * 18, 80), (0, 0, 0, 0))
    
    # Atlas order in game: 6 categories x 3 tiers:
    # Index = tier * 6 + category
    # category 0: weapon, 1: armor, 2: helm, 3: boots, 4: ring, 5: talisman
    for tier in range(3):
        for cat in range(6):
            idx = tier * 6 + cat
            cx = (tier + 0.5) * col_w
            cy = (cat + 0.5) * row_h
            # Inside the card frame
            box_r = min(col_w, row_h) * 0.40
            box = (int(cx - box_r), int(cy - box_r), int(cx + box_r), int(cy + box_r))
            
            icon = get_circular_crop(src_items, box, (80, 80))
            item_sheet.paste(icon, (idx * 80, 0))
            
    item_sheet.save("assets/items_atlas.png")
    print("Saved realistic 3D assets/items_atlas.png successfully!")

# -------------------------------------------------------------
# 3. PROCESS 3D UI ELEMENTS
# -------------------------------------------------------------
if ui_imgs:
    src_ui = Image.open(ui_imgs[-1])
    W, H = src_ui.size
    print(f"UI image size: {W}x{H}")
    
    # 4 Quadrants:
    # Top-Left: 1) Attack Button (Dragon seal with crossed swords)
    # Top-Right: 2) BaGua formation plate
    # Bottom-Left: 3) Yin-Yang joystick knob
    # Bottom-Right: 4) Golden Dragon Avatar Frame
    
    half_w = W / 2.0
    half_h = H / 2.0
    r_atk = int(half_w * 0.44)
    
    # 1. Attack Button (128x128)
    atk_cx, atk_cy = half_w * 0.5, half_h * 0.5
    atk_box = (int(atk_cx - r_atk), int(atk_cy - r_atk), int(atk_cx + r_atk), int(atk_cy + r_atk))
    atk_icon = get_circular_crop(src_ui, atk_box, (128, 128))
    atk_icon.save("assets/ui_btn_attack.png")
    print("Saved realistic 3D assets/ui_btn_attack.png")
    
    # 2. BaGua Joystick Base (180x180)
    bagua_cx, bagua_cy = half_w * 1.5, half_h * 0.5
    bagua_box = (int(bagua_cx - r_atk), int(bagua_cy - r_atk), int(bagua_cx + r_atk), int(bagua_cy + r_atk))
    bagua_icon = get_circular_crop(src_ui, bagua_box, (180, 180))
    bagua_icon.save("assets/ui_joystick_base.png")
    print("Saved realistic 3D assets/ui_joystick_base.png")
    
    # 3. Yin-Yang Joystick Knob (90x90)
    knob_cx, knob_cy = half_w * 0.5, half_h * 1.5
    knob_box = (int(knob_cx - r_atk), int(knob_cy - r_atk), int(knob_cx + r_atk), int(knob_cy + r_atk))
    knob_icon = get_circular_crop(src_ui, knob_box, (90, 90))
    knob_icon.save("assets/ui_joystick_knob.png")
    print("Saved realistic 3D assets/ui_joystick_knob.png")
    
    # 4. Avatar Frame (96x96 with hollow center)
    av_cx, av_cy = half_w * 1.5, half_h * 1.5
    av_box = (int(av_cx - r_atk), int(av_cy - r_atk), int(av_cx + r_atk), int(av_cy + r_atk))
    av_crop = src_ui.crop(av_box).convert("RGBA").resize((96*4, 96*4), Image.Resampling.LANCZOS)
    
    # Mask out outer background and hollow inner circle
    av_mask = Image.new("L", (96*4, 96*4), 0)
    d_mask = ImageDraw.Draw(av_mask)
    d_mask.ellipse([4, 4, 96*4 - 5, 96*4 - 5], fill=255)
    # Hollow center for player portrait
    d_mask.ellipse([96*4*0.25, 96*4*0.25, 96*4*0.75, 96*4*0.75], fill=0)
    
    av_out = Image.new("RGBA", (96*4, 96*4), (0, 0, 0, 0))
    av_out.paste(av_crop, (0, 0), av_mask)
    av_out = av_out.resize((96, 96), Image.Resampling.LANCZOS)
    av_out.save("assets/ui_avatar_frame.png")
    print("Saved realistic 3D assets/ui_avatar_frame.png")

print("All realistic 3D game assets processed successfully!")
