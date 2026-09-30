import os
import shutil

ASSETS_DIR = r'h:\GOOGLE DRIVER\GAME\assets'

structure = {
    'player': [
        'player_idle.png',
        'player_run.png',
        'player_attack.png',
        'flying_sword.png',
        'user_player_calibrated_preview.png'
    ],
    'enemies': [
        'enemy_1.png',
        'enemy_2.png',
        'enemy_3.png',
        'enemy_4.png',
        'enemy_5.png',
        'enemy_6.png',
        'enemy_7.png',
        'enemy_8.png',
        'ENEMI.png',
        'enemy_preview_sheet.png'
    ],
    'ui': [
        'ui_avatar_frame.png',
        'ui_btn_attack.png',
        'ui_joystick_base.png',
        'ui_joystick_knob.png',
        'ui_modal_bg.png'
    ],
    'icons': [
        'skill_icons.png',
        'items_atlas.png',
        'stage_icons.png'
    ],
    'environment': [
        'valley_panorama.png'
    ],
    'vfx': [
        'vfx_atlas.png'
    ]
}

def reorganize():
    print("Reorganizing assets directory into subfolders...")
    for folder, files in structure.items():
        folder_path = os.path.join(ASSETS_DIR, folder)
        os.makedirs(folder_path, exist_ok=True)
        for f in files:
            src = os.path.join(ASSETS_DIR, f)
            dst = os.path.join(folder_path, f)
            if os.path.exists(src):
                shutil.move(src, dst)
                print(f"Moved {f} -> {folder}/{f}")

    # Update src/main.js
    main_js_path = 'src/main.js'
    with open(main_js_path, 'r', encoding='utf-8') as f:
        code = f.read()

    new_preload = """ preload(){
  const A='./assets/';
  // Environment Background
  this.load.image('valley_panorama', A+'environment/valley_panorama.png');
  // UI Elements
  ['ui_avatar_frame','ui_btn_attack','ui_joystick_base','ui_joystick_knob','ui_modal_bg'].forEach(k=>this.load.image(k, A+'ui/'+k+'.png'));
  // Player Sprites & Weapon
  this.load.image('flying_sword', A+'player/flying_sword.png');
  this.load.spritesheet('player_idle', A+'player/player_idle.png', {frameWidth:128, frameHeight:128});
  this.load.spritesheet('player_run', A+'player/player_run.png', {frameWidth:128, frameHeight:128});
  this.load.spritesheet('player_attack', A+'player/player_attack.png', {frameWidth:128, frameHeight:128});
  // Enemies
  for(let i=1;i<=8;i++){this.load.spritesheet('enemy_'+i, A+'enemies/enemy_'+i+'.png', {frameWidth:128, frameHeight:128});}
  this.load.spritesheet('boss', A+'enemies/enemy_6.png', {frameWidth:128, frameHeight:128});
  // Icons & Atlases
  this.load.spritesheet('skill_icons', A+'icons/skill_icons.png', {frameWidth:96, frameHeight:96});
  this.load.spritesheet('items', A+'icons/items_atlas.png', {frameWidth:80, frameHeight:80});
  this.load.spritesheet('stage_icons', A+'icons/stage_icons.png', {frameWidth:72, frameHeight:72});
  // VFX
  this.load.spritesheet('vfx', A+'vfx/vfx_atlas.png', {frameWidth:128, frameHeight:128});
 }"""

    import re
    code = re.sub(r"preload\(\)\{[\s\S]+?create\(\)\{", new_preload + "\n create(){", code)

    with open(main_js_path, 'w', encoding='utf-8') as f:
        f.write(code)

    print("Reorganized assets and updated main.js preload successfully!")

if __name__ == '__main__':
    reorganize()
