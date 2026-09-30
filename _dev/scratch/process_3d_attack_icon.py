import os
from PIL import Image

src_img = r'C:\Users\nguye\.gemini\antigravity-ide\brain\599cf26d-283e-4472-af74-791320832a92\basic_attack_3d_1790611804229.jpg'
dest_1 = r'H:\GOOGLE DRIVER\GAME\assets\icons\skills\basic_attack_3d.png'
dest_2 = r'H:\GOOGLE DRIVER\GAME\assets\icons\ui\xianxia_attack.png'
dest_3 = r'H:\GOOGLE DRIVER\GAME\assets\icons\ui\xianxia_attack_bright.png'

os.makedirs(os.path.dirname(dest_1), exist_ok=True)
os.makedirs(os.path.dirname(dest_2), exist_ok=True)

with Image.open(src_img) as im:
    im = im.convert('RGBA')
    # Save 128x128 for high quality skill slot icon
    im_128 = im.resize((128, 128), Image.Resampling.LANCZOS)
    im_128.save(dest_1, 'PNG', optimize=True)
    im_128.save(dest_2, 'PNG', optimize=True)
    im_128.save(dest_3, 'PNG', optimize=True)

print("Saved optimized 3D basic attack icon to game assets!")
