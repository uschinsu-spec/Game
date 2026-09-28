import os
import shutil
import re
from PIL import Image

ICONS_SRC = r'H:\GOOGLE DRIVER\icons'
GAME_ASSETS = r'H:\GOOGLE DRIVER\GAME\assets\icons'
TARGET_DIR = os.path.join(GAME_ASSETS, 'game_icons')

def process_and_copy_icons():
    os.makedirs(TARGET_DIR, exist_ok=True)
    categories = [
        '01_VU_KHI', '02_AO_GIAP', '03_MU_NON', '04_GANG_TAY', '05_GIAY',
        '06_TRANG_SUC', '07_PHAP_BAO', '08_DAN_DUOC', '09_PHU_LUC_TRAN_PHAP',
        '10_NGUYEN_LIEU', '11_UI_HUD_NAVIGATION', '12_CONG_PHAP_TAM_PHAP',
        '13_BUFF_DEBUFF_TRANG_THAI', '14_NHIEM_VU_THANH_TUU', '15_LINH_THU_PET',
        '16_YEU_THU_DO_GIAM', '17_NPC_CHUC_NANG', '18_BAN_DO_CONG_DICH_CHUYEN',
        '19_TIEN_TE_PHAN_THUONG', '20_BACH_NGHE_CHE_TAO'
    ]
    
    total_copied = 0
    cat_files = {}
    for cat in categories:
        src_cat_dir = os.path.join(ICONS_SRC, cat)
        tgt_cat_dir = os.path.join(TARGET_DIR, cat.lower())
        os.makedirs(tgt_cat_dir, exist_ok=True)
        
        if os.path.isdir(src_cat_dir):
            files = sorted([f for f in os.listdir(src_cat_dir) if f.lower().endswith(('.png', '.jpg', '.webp'))])
            cat_files[cat] = []
            for f in files:
                src_file = os.path.join(src_cat_dir, f)
                tgt_file = os.path.join(tgt_cat_dir, f)
                # Optimize / ensure 64x64 RGBA PNG
                try:
                    with Image.open(src_file) as im:
                        im = im.convert('RGBA')
                        # resize to 64x64 if not already
                        if im.size != (64, 64):
                            im = im.resize((64, 64), Image.Resampling.LANCZOS)
                        im.save(tgt_file, 'PNG', optimize=True)
                        cat_files[cat].append((f, tgt_file))
                        total_copied += 1
                except Exception as e:
                    print(f"Error copying {src_file}: {e}")
                    
    print(f"Successfully processed & optimized {total_copied} icons into {TARGET_DIR}")
    return cat_files

if __name__ == '__main__':
    cat_files = process_and_copy_icons()
