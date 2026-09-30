import os
from PIL import Image, ImageEnhance

SRC_MAP = r'h:\GOOGLE DRIVER\GAME\ChatGPT Image Sep 27, 2026, 11_37_17 AM.png'
OUT_MAP = r'h:\GOOGLE DRIVER\GAME\assets\valley_panorama.png'

def apply_user_map():
    print(f"Applying user map from: {SRC_MAP}")
    img = Image.open(SRC_MAP).convert('RGB')
    
    target_w, target_h = 3200, 960
    
    # Scale keeping aspect ratio so that height is 960
    scale = target_h / img.height
    new_w = int(img.width * scale)
    new_h = target_h
    
    resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Expand horizontally to target_w (3200)
    canvas = Image.new('RGB', (target_w, target_h))
    
    offset_x = 0
    while offset_x < target_w:
        canvas.paste(resized, (offset_x, 0))
        offset_x += new_w
        
    final_bg = canvas.crop((0, 0, target_w, target_h))
    
    # Color & contrast enhance
    enhancer = ImageEnhance.Color(final_bg)
    final_bg = enhancer.enhance(1.08)
    final_bg = ImageEnhance.Contrast(final_bg).enhance(1.05)
    
    final_bg.save(OUT_MAP, quality=95)
    print(f"Successfully applied user map to: {OUT_MAP} ({final_bg.size})")

if __name__ == '__main__':
    apply_user_map()
