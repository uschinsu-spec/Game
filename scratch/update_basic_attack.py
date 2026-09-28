import os
import re

def update_basic_attack_system():
    # 1. Update gameState.js
    gs_path = r'H:\GOOGLE DRIVER\GAME\src\state\gameState.js'
    with open(gs_path, 'r', encoding='utf-8') as f:
        gs_text = f.read()
    gs_text = gs_text.replace("equippedSkillIds: []", "equippedSkillIds: ['basic_attack', 'kiem_1']")
    with open(gs_path, 'w', encoding='utf-8') as f:
        f.write(gs_text)
    print("Updated gameState.js equippedSkillIds!")

    # 2. Update saveSystem.js
    ss_path = r'H:\GOOGLE DRIVER\GAME\src\state\saveSystem.js'
    with open(ss_path, 'r', encoding='utf-8') as f:
        ss_text = f.read()
    
    # In loadGame / import
    ss_text = ss_text.replace(
        "gameState.equippedSkillIds = data.equippedSkillIds || [];",
        "gameState.equippedSkillIds = (data.equippedSkillIds && data.equippedSkillIds.length > 0) ? data.equippedSkillIds : ['basic_attack', 'kiem_1'];"
    )
    with open(ss_path, 'w', encoding='utf-8') as f:
        f.write(ss_text)
    print("Updated saveSystem.js!")

    # 3. Update HudMixin.js
    hud_path = r'H:\GOOGLE DRIVER\GAME\src\scenes\mixins\HudMixin.js'
    with open(hud_path, 'r', encoding='utf-8') as f:
        hud_text = f.read()

    # In createSkillBar:
    old_hud_btn_block = """    // Basic Attack Button (F)
    const attackX = startX + 5 * gap + 15;
    const atkBtn = this.fixed(this.add.circle(attackX, y, 30, 0x882222, 0).setInteractive({ useHandCursor: true }), 205);
    const atkIcon = this.fixed(this.add.image(attackX, y - 4, 'xianxia_attack').setDisplaySize(52, 52), 206);
    const atkLabel = this.fixed(this.add.text(attackX, y + 25, 'ĐÁNH (F)', { fontSize: '11px', fontStyle: 'bold', color: '#fff' }).setStroke('#291410', 3).setOrigin(0.5), 207);
    atkBtn.on('pointerdown', () => this.basicAttack());

    // Auto Toggle Button (Tap: Toggle Auto | Hold/Long-press: Open Auto Settings Menu)
    const autoX = attackX + 58;"""

    new_hud_btn_block = """    // Auto Toggle Button (Tap: Toggle Auto | Hold/Long-press: Open Auto Settings Menu)
    const autoX = startX + 5 * gap + 8;"""

    hud_text_norm = hud_text.replace('\r\n', '\n')
    old_hud_norm = old_hud_btn_block.replace('\r\n', '\n')
    new_hud_norm = new_hud_btn_block.replace('\r\n', '\n')

    if old_hud_norm in hud_text_norm:
        hud_text_norm = hud_text_norm.replace(old_hud_norm, new_hud_norm, 1)
        with open(hud_path, 'w', encoding='utf-8') as f:
            f.write(hud_text_norm)
        print("Updated HudMixin.js skill bar layout!")
    else:
        print("Warning: old_hud_btn_block not found in HudMixin.js")

    # 4. Update MainScene.js hotkeys
    main_path = r'H:\GOOGLE DRIVER\GAME\src\scenes\MainScene.js'
    with open(main_path, 'r', encoding='utf-8') as f:
        main_text = f.read()

    # If F or Space is pressed, trigger basicAttack or slot 0
    old_hotkey = "if (Phaser.Input.Keyboard.JustDown(this.keys.F) || Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) this.basicAttack();"
    new_hotkey = "if (Phaser.Input.Keyboard.JustDown(this.keys.F) || Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) { if (gameState.equippedSkillIds[0]) this.castSkill(gameState.equippedSkillIds[0]); else this.basicAttack(); }"
    
    main_text_norm = main_text.replace('\r\n', '\n')
    old_hotkey_norm = old_hotkey.replace('\r\n', '\n')
    new_hotkey_norm = new_hotkey.replace('\r\n', '\n')

    if old_hotkey_norm in main_text_norm:
        main_text_norm = main_text_norm.replace(old_hotkey_norm, new_hotkey_norm, 1)
        with open(main_path, 'w', encoding='utf-8') as f:
            f.write(main_text_norm)
        print("Updated MainScene.js hotkeys!")

if __name__ == '__main__':
    update_basic_attack_system()
