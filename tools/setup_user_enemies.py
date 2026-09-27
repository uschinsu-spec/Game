import os
import cv2
import numpy as np
from PIL import Image, ImageDraw

SRC_ENEMI = r'h:\GOOGLE DRIVER\GAME\assets\ENEMI.png'
ASSETS_DIR = r'h:\GOOGLE DRIVER\GAME\assets'
BRAIN_DIR = r'C:\Users\nguye\.gemini\antigravity-ide\brain\599cf26d-283e-4472-af74-791320832a92'

def process_and_setup():
    print(f"Loading ENEMI.png from: {SRC_ENEMI}")
    src = Image.open(SRC_ENEMI).convert('RGBA')
    
    # 8 Rows
    row_y = [
        (15, 145),
        (150, 285),
        (295, 420),
        (430, 560),
        (570, 695),
        (700, 845),
        (855, 965),
        (975, 1115)
    ]
    
    # 10 Columns
    col_x = [
        (10, 140), (145, 275), (280, 420), (425, 560), (565, 700),
        (705, 840), (845, 980), (980, 1125), (1125, 1265), (1265, 1395)
    ]
    
    fw, fh = 128, 128
    ground_y = 114
    target_h = 96
    
    for r_idx, (y1, y2) in enumerate(row_y):
        ename = f"enemy_{r_idx + 1}"
        spritesheet = Image.new('RGBA', (fw * 10, fh), (0, 0, 0, 0))
        
        for c_idx, (x1, x2) in enumerate(col_x):
            cell = src.crop((x1, y1, x2, y2))
            arr = np.array(cell)
            cell_alpha = arr[:, :, 3]
            v_has = np.where(np.sum(cell_alpha > 15, axis=1) > 0)[0]
            h_has = np.where(np.sum(cell_alpha > 15, axis=0) > 0)[0]
            
            if len(v_has) > 0 and len(h_has) > 0:
                top, bot = v_has[0], v_has[-1]
                left, right = h_has[0], h_has[-1]
                sprite = cell.crop((left, top, right + 1, bot + 1))
                
                sw, sh = sprite.size
                scale = min(target_h / max(1, sh), (fw - 12) / max(1, sw))
                if r_idx in [1, 5, 7]: # bigger enemies
                    scale = min(108 / max(1, sh), (fw - 8) / max(1, sw))
                    
                nw = max(1, int(sw * scale))
                nh = max(1, int(sh * scale))
                resized = sprite.resize((nw, nh), Image.Resampling.LANCZOS)
                
                px = (fw - nw) // 2
                py = ground_y - nh
                if py < 2:
                    py = 2
                    
                frame = Image.new('RGBA', (fw, fh), (0, 0, 0, 0))
                frame.paste(resized, (px, py), resized)
                spritesheet.paste(frame, (c_idx * fw, 0), frame)
                
        out_file = os.path.join(ASSETS_DIR, f"{ename}.png")
        spritesheet.save(out_file)
        print(f"Saved: {out_file} ({spritesheet.size})")

    # Remove old enemy assets
    for old_file in ['goblin.png', 'boar.png', 'bat.png', 'boss.png']:
        old_path = os.path.join(ASSETS_DIR, old_file)
        if os.path.exists(old_path):
            os.remove(old_path)
            print(f"Deleted old enemy asset: {old_file}")
            
    # Update main.js
    main_js_path = 'src/main.js'
    with open(main_js_path, 'r', encoding='utf-8') as f:
        code = f.read()
        
    # Replace preload enemy loading
    old_preload_enemies = """   this.load.spritesheet('goblin',A+'goblin.png',{frameWidth:128,frameHeight:128});
   this.load.spritesheet('boar',A+'boar.png',{frameWidth:128,frameHeight:128});
   this.load.spritesheet('bat',A+'bat.png',{frameWidth:128,frameHeight:128});
   this.load.spritesheet('boss',A+'boss.png',{frameWidth:192,frameHeight:192});"""

    new_preload_enemies = """   for(let i=1;i<=8;i++){this.load.spritesheet('enemy_'+i,A+'enemy_'+i+'.png',{frameWidth:128,frameHeight:128});}
   this.load.spritesheet('boss',A+'enemy_6.png',{frameWidth:128,frameHeight:128});"""

    if old_preload_enemies in code:
        code = code.replace(old_preload_enemies, new_preload_enemies)
    else:
        # regex replace
        import re
        code = re.sub(r"this\.load\.spritesheet\('goblin'[^;]+;[^;]+;[^;]+;[^;]+;", new_preload_enemies, code)

    # Replace createAnimations for enemies
    old_create_anims = """   ['goblin','boar','bat'].forEach(t=>{
    make('e_'+t+'_idle',t,0,1,4);
    make('e_'+t+'_run',t,2,5,8);
    make('e_'+t+'_attack',t,6,9,10,0);
    make('e_'+t,t,2,5,8);
   });
   make('e_boss_idle','boss',0,1,3);
   make('e_boss_run','boss',2,5,6);
   make('e_boss_attack','boss',6,9,8,0);
   make('e_boss','boss',2,5,6);"""

    new_create_anims = """   for(let i=1;i<=8;i++){
    const t='enemy_'+i;
    make('e_'+t+'_idle',t,0,1,4);
    make('e_'+t+'_run',t,2,5,8);
    make('e_'+t+'_attack',t,6,9,10,0);
    make('e_'+t,t,2,5,8);
   }
   make('e_boss_idle','boss',0,1,3);
   make('e_boss_run','boss',2,5,6);
   make('e_boss_attack','boss',6,9,8,0);
   make('e_boss','boss',2,5,6);"""

    code = code.replace(old_create_anims, new_create_anims)

    # Update STAGES to use new enemy pool
    old_stages = """const STAGES=[
 {name:'Linh Sơn Ngoại Vi',sub:'Thanh Vân Sơn',goal:26,sky:0xffffff,tint:0xffffff,weather:'petal',boss:'Hộ Sơn Yêu Tướng',enemies:['goblin_sword','goblin_spear','boar','bat']},
 {name:'Thanh Trúc Lâm',sub:'Trúc Hải',goal:30,sky:0xdfffee,tint:0xd9ffd7,weather:'leaf',boss:'Trúc Linh Vương',enemies:['goblin_archer','wolf','spider','bat']},
 {name:'Hắc Phong Cốc',sub:'U Minh Cốc',goal:34,sky:0xd7ddff,tint:0xd2c8ff,weather:'mist',boss:'Hắc Phong Ma Tướng',enemies:['goblin_mage','wolf_dark','brute','demon_bat']},
 {name:'Yêu Thú Sơn',sub:'Vạn Thú Lĩnh',goal:38,sky:0xffe7c7,tint:0xffd6ae,weather:'leaf',boss:'Xích Nha Hổ Vương',enemies:['boar_red','wolf','tiger','brute']},
 {name:'Thiên Kiếm Đài',sub:'Kiếm Phong',goal:42,sky:0xe6f8ff,tint:0xd8f5ff,weather:'spark',boss:'Kiếm Linh Hộ Pháp',enemies:['sword_spirit','goblin_sword','flying_swordling','elite_guard']},
 {name:'Hỏa Diệm Cốc',sub:'Liệt Hỏa Vực',goal:46,sky:0xffc09d,tint:0xffb379,weather:'ember',boss:'Viêm Ma',enemies:['fire_boar','fire_bat','brute_red','demon_guard']},
 {name:'Ma Vực',sub:'Huyết Nguyệt Uyên',goal:50,sky:0xb8a4d9,tint:0xad92d2,weather:'mist',boss:'Ma Tôn Phân Thân',enemies:['demon_guard','demon_bat','wolf_dark','elite_guard']},
 {name:'Xích Diệm Thiên',sub:'Hỏa Long Điện',goal:55,sky:0xff9d86,tint:0xff8b71,weather:'ember',boss:'Xích Diệm Hỏa Long',enemies:['fire_boar','brute_red','demon_guard','fire_bat']},
 {name:'Băng Phách Sơn',sub:'Huyền Băng Cảnh',goal:58,sky:0xe7fbff,tint:0xd5f6ff,weather:'snow',boss:'Băng Phách Yêu Quân',enemies:['ice_wolf','ice_golem','frost_bat','goblin_mage']},
 {name:'Lôi Đình Cảnh',sub:'Thiên Lôi Đài',goal:62,sky:0xc8d5ff,tint:0xc3d6ff,weather:'storm',boss:'Lôi Linh Vương',enemies:['thunder_guard','sword_spirit','storm_bat','elite_guard']},
 {name:'U Minh Thiên',sub:'Vong Hồn Giới',goal:66,sky:0xa99dcc,tint:0x9d8ec3,weather:'mist',boss:'U Minh Đế Quân',enemies:['ghost_guard','demon_guard','wolf_dark','demon_bat']},
 {name:'Thiên Môn Đỉnh',sub:'Chung Cực Thiên Kiếp',goal:72,sky:0xffe7ad,tint:0xffd788,weather:'storm',boss:'Thiên Kiếp Chân Long',enemies:['celestial_guard','thunder_guard','sword_spirit','elite_guard']}
];"""

    new_stages = """const STAGES=[
 {name:'Linh Sơn Ngoại Vi',sub:'Thanh Vân Sơn',goal:26,sky:0xffffff,tint:0xffffff,weather:'petal',boss:'Hộ Sơn Yêu Tướng',enemies:['mob_1','mob_2','mob_5','mob_7']},
 {name:'Thanh Trúc Lâm',sub:'Trúc Hải',goal:30,sky:0xdfffee,tint:0xd9ffd7,weather:'leaf',boss:'Trúc Linh Vương',enemies:['mob_3','mob_4','mob_5','mob_7']},
 {name:'Hắc Phong Cốc',sub:'U Minh Cốc',goal:34,sky:0xd7ddff,tint:0xd2c8ff,weather:'mist',boss:'Hắc Phong Ma Tướng',enemies:['mob_2','mob_4','mob_6','mob_8']},
 {name:'Yêu Thú Sơn',sub:'Vạn Thú Lĩnh',goal:38,sky:0xffe7c7,tint:0xffd6ae,weather:'leaf',boss:'Xích Nha Hổ Vương',enemies:['mob_1','mob_5','mob_6','mob_7']},
 {name:'Thiên Kiếm Đài',sub:'Kiếm Phong',goal:42,sky:0xe6f8ff,tint:0xd8f5ff,weather:'spark',boss:'Kiếm Linh Hộ Pháp',enemies:['mob_2','mob_3','mob_7','mob_8']},
 {name:'Hỏa Diệm Cốc',sub:'Liệt Hỏa Vực',goal:46,sky:0xffc09d,tint:0xffb379,weather:'ember',boss:'Viêm Ma',enemies:['mob_4','mob_5','mob_6','mob_8']},
 {name:'Ma Vực',sub:'Huyết Nguyệt Uyên',goal:50,sky:0xb8a4d9,tint:0xad92d2,weather:'mist',boss:'Ma Tôn Phân Thân',enemies:['mob_2','mob_6','mob_7','mob_8']},
 {name:'Xích Diệm Thiên',sub:'Hỏa Long Điện',goal:55,sky:0xff9d86,tint:0xff8b71,weather:'ember',boss:'Xích Diệm Hỏa Long',enemies:['mob_5','mob_6','mob_7','mob_8']},
 {name:'Băng Phách Sơn',sub:'Huyền Băng Cảnh',goal:58,sky:0xe7fbff,tint:0xd5f6ff,weather:'snow',boss:'Băng Phách Yêu Quân',enemies:['mob_3','mob_4','mob_7','mob_8']},
 {name:'Lôi Đình Cảnh',sub:'Thiên Lôi Đài',goal:62,sky:0xc8d5ff,tint:0xc3d6ff,weather:'storm',boss:'Lôi Linh Vương',enemies:['mob_2','mob_6','mob_7','mob_8']},
 {name:'U Minh Thiên',sub:'Vong Hồn Giới',goal:66,sky:0xa99dcc,tint:0x9d8ec3,weather:'mist',boss:'U Minh Đế Quân',enemies:['mob_3','mob_4','mob_6','mob_8']},
 {name:'Thiên Môn Đỉnh',sub:'Chung Cực Thiên Kiếp',goal:72,sky:0xffe7ad,tint:0xffd788,weather:'storm',boss:'Thiên Kiếp Chân Long',enemies:['mob_1','mob_2','mob_6','mob_8']}
];"""

    code = code.replace(old_stages, new_stages)

    # Update ENEMY_TYPES with all 8 new user enemy types
    new_enemy_types = """const ENEMY_TYPES={
 mob_1:{tex:'enemy_1',name:'Yêu Tộc Tiên Phong',hp:190,spd:62,dmg:20,scale:.60,tint:0xffffff,ai:'melee'},
 mob_2:{tex:'enemy_2',name:'Ma Binh Chiến Tướng',hp:240,spd:54,dmg:26,scale:.62,tint:0xffffff,ai:'melee'},
 mob_3:{tex:'enemy_3',name:'U Hồn Kiếm Giả',hp:210,spd:68,dmg:28,scale:.58,tint:0xffffff,ai:'hunter'},
 mob_4:{tex:'enemy_4',name:'Tà Thuật Vu Sư',hp:180,spd:42,dmg:35,scale:.58,tint:0xffffff,ai:'caster'},
 mob_5:{tex:'enemy_5',name:'Hắc Ma Dị Thú',hp:330,spd:72,dmg:32,scale:.60,tint:0xffffff,ai:'charge'},
 mob_6:{tex:'enemy_6',name:'Cự Ma Hộ Pháp',hp:680,spd:46,dmg:52,scale:.68,tint:0xffffff,ai:'slam',elite:true},
 mob_7:{tex:'enemy_7',name:'Huyết Dực Yêu Ma',hp:160,spd:84,dmg:22,scale:.56,tint:0xffffff,ai:'fly',flying:true},
 mob_8:{tex:'enemy_8',name:'Cửu U Ma Tôn',hp:820,spd:50,dmg:65,scale:.68,tint:0xffffff,ai:'caster',elite:true}
};"""

    code = re.sub(r"const ENEMY_TYPES=\{[^;]+\};", new_enemy_types, code)

    # In spawnEnemy default fallback
    code = code.replace("ENEMY_TYPES.goblin_sword", "ENEMY_TYPES.mob_1")

    with open(main_js_path, 'w', encoding='utf-8') as f:
        f.write(code)

    print("Updated src/main.js with all 8 new user enemy types successfully!")

if __name__ == '__main__':
    process_and_setup()
