import os
import re

def fix_skill_selection():
    # 1. Update SkillCongPhapModal.js
    modal_file = r'H:\GOOGLE DRIVER\GAME\src\scenes\modals\SkillCongPhapModal.js'
    with open(modal_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix unequipSlotBtn in openQuickSkillSelectModal
    old_unequip_slot = """    unequipSlotBtn.on('pointerdown', () => {
      if (gameState.equippedSkillIds[slotIndex]) {
        gameState.equippedSkillIds = gameState.equippedSkillIds.filter((_, idx) => idx !== slotIndex);
        this.createSkillBar();
        this.openQuickSkillSelectModal(slotIndex);
        this.showFloatingText(this.player.x, this.player.y - 60, `Đã làm trống Ô ${slotIndex + 1}!`, '#ff7777');
      }
    });"""

    new_unequip_slot = """    unequipSlotBtn.on('pointerdown', () => {
      if (gameState.equippedSkillIds[slotIndex]) {
        gameState.equippedSkillIds[slotIndex] = null;
        this.createSkillBar();
        this.openQuickSkillSelectModal(slotIndex);
        this.showFloatingText(this.player.x, this.player.y - 60, `Đã làm trống Ô ${slotIndex + 1}!`, '#ff7777');
      }
    });"""

    # Fix clearAllBtn
    old_clear_all = """    clearAllBtn.on('pointerdown', () => {
      if (gameState.equippedSkillIds && gameState.equippedSkillIds.length > 0) {
        gameState.equippedSkillIds = [];
        this.createSkillBar();
        this.openQuickSkillSelectModal(slotIndex);
        this.showFloatingText(this.player.x, this.player.y - 60, 'Đã tháo toàn bộ kỹ năng khỏi 5 ô!', '#ff5555', '14px');
      }
    });"""

    new_clear_all = """    clearAllBtn.on('pointerdown', () => {
      gameState.equippedSkillIds = [null, null, null, null, null];
      this.createSkillBar();
      this.openQuickSkillSelectModal(slotIndex);
      this.showFloatingText(this.player.x, this.player.y - 60, 'Đã tháo toàn bộ kỹ năng khỏi 5 ô!', '#ff5555', '14px');
    });"""

    # Fix actionBtn in openQuickSkillSelectModal
    old_action_btn = """        actionBtn.on('pointerdown', () => {
          if (isEquippedAnywhere) {
            gameState.equippedSkillIds = gameState.equippedSkillIds.filter(id => id !== skill.id);
            this.createSkillBar();
            this.openQuickSkillSelectModal(slotIndex);
            this.showFloatingText(this.player.x, this.player.y - 60, `Đã bỏ chọn [${skill.name}]!`, '#ff7777');
          } else {
            gameState.equippedSkillIds = gameState.equippedSkillIds.filter(id => id !== skill.id);
            if (slotIndex < gameState.equippedSkillIds.length) {
              gameState.equippedSkillIds[slotIndex] = skill.id;
            } else {
              gameState.equippedSkillIds.push(skill.id);
            }
            gameState.equippedSkillIds = gameState.equippedSkillIds.filter(Boolean);
            this.createSkillBar();
            this.openQuickSkillSelectModal(slotIndex);
            this.showFloatingText(this.player.x, this.player.y - 60, `Đã gắn [${skill.name}] vào Ô ${gameState.equippedSkillIds.indexOf(skill.id) + 1}!`, '#66ffcc');
          }
        });"""

    new_action_btn = """        actionBtn.on('pointerdown', () => {
          if (isEquippedAnywhere) {
            const existingIdx = gameState.equippedSkillIds.indexOf(skill.id);
            if (existingIdx !== -1) {
              gameState.equippedSkillIds[existingIdx] = null;
            }
            this.createSkillBar();
            this.openQuickSkillSelectModal(slotIndex);
            this.showFloatingText(this.player.x, this.player.y - 60, `Đã bỏ chọn [${skill.name}]!`, '#ff7777');
          } else {
            // Xóa skill nếu đang ở ô khác
            const existingIdx = gameState.equippedSkillIds.indexOf(skill.id);
            if (existingIdx !== -1) {
              gameState.equippedSkillIds[existingIdx] = null;
            }
            while (gameState.equippedSkillIds.length < 5) {
              gameState.equippedSkillIds.push(null);
            }
            gameState.equippedSkillIds[slotIndex] = skill.id;
            this.createSkillBar();
            this.openQuickSkillSelectModal(slotIndex);
            this.showFloatingText(this.player.x, this.player.y - 60, `Đã gắn [${skill.name}] vào Ô ${slotIndex + 1}!`, '#66ffcc');
          }
        });"""

    # Fix openSkillPanel equip logic (around line 735)
    old_panel_equip = """        btnBg.on('pointerdown', () => {
          if (isEquipped) {
            // BỎ CHỌN SKILL
            gameState.equippedSkillIds = gameState.equippedSkillIds.filter(id => id !== skill.id);
            this.showFloatingText(this.player.x, this.player.y - 60, `Đã bỏ chọn [${skill.name}]!`, '#ff7777');
          } else {
            // CHỌN SKILL
            if (gameState.equippedSkillIds.length < 5) {
              gameState.equippedSkillIds.push(skill.id);
            } else {
              gameState.equippedSkillIds[4] = skill.id; // Thay vào ô 5
            }
            this.showFloatingText(this.player.x, this.player.y - 60, `Đã gắn [${skill.name}] vào Ô ${gameState.equippedSkillIds.indexOf(skill.id) + 1}!`, '#66ffcc');
          }
          this.createSkillBar();
          this.openSkillPanel(activeElem);
        });"""

    new_panel_equip = """        btnBg.on('pointerdown', () => {
          if (isEquipped) {
            // BỎ CHỌN SKILL: Đặt ô tương ứng thành null (trống)
            const existingIdx = gameState.equippedSkillIds.indexOf(skill.id);
            if (existingIdx !== -1) {
              gameState.equippedSkillIds[existingIdx] = null;
            }
            this.showFloatingText(this.player.x, this.player.y - 60, `Đã bỏ chọn [${skill.name}]!`, '#ff7777');
          } else {
            // CHỌN SKILL: Tìm ô trống đầu tiên hoặc gán vào ô cuối
            let targetSlot = gameState.equippedSkillIds.findIndex(id => !id);
            if (targetSlot === -1) {
              if (gameState.equippedSkillIds.length < 5) {
                targetSlot = gameState.equippedSkillIds.length;
              } else {
                targetSlot = 4;
              }
            }
            while (gameState.equippedSkillIds.length <= targetSlot) {
              gameState.equippedSkillIds.push(null);
            }
            gameState.equippedSkillIds[targetSlot] = skill.id;
            this.showFloatingText(this.player.x, this.player.y - 60, `Đã gắn [${skill.name}] vào Ô ${targetSlot + 1}!`, '#66ffcc');
          }
          this.createSkillBar();
          this.openSkillPanel(activeElem);
        });"""

    content_norm = content.replace('\r\n', '\n')
    content_norm = content_norm.replace(old_unequip_slot.replace('\r\n', '\n'), new_unequip_slot.replace('\r\n', '\n'))
    content_norm = content_norm.replace(old_clear_all.replace('\r\n', '\n'), new_clear_all.replace('\r\n', '\n'))
    content_norm = content_norm.replace(old_action_btn.replace('\r\n', '\n'), new_action_btn.replace('\r\n', '\n'))
    content_norm = content_norm.replace(old_panel_equip.replace('\r\n', '\n'), new_panel_equip.replace('\r\n', '\n'))

    with open(modal_file, 'w', encoding='utf-8') as f:
        f.write(content_norm)
    print("Updated SkillCongPhapModal.js slot unequip logic!")

    # 2. Update SimpleSkillFullscreenUI.js
    ui_file = r'H:\GOOGLE DRIVER\GAME\src\scenes\mixins\SimpleSkillFullscreenUI.js'
    with open(ui_file, 'r', encoding='utf-8') as f:
        ui_content = f.read()

    old_ui_strip = "const swordIds = new Set(ELEMENTAL_SKILLS.filter(s => s.elem === 'Kiếm' || String(s.id).startsWith('kiem_')).map(s => s.id));\n    gameState.equippedSkillIds = (gameState.equippedSkillIds || []).filter(id => swordIds.has(id));"
    new_ui_strip = "const allowedIds = new Set(ELEMENTAL_SKILLS.map(s => s.id));\n    gameState.equippedSkillIds = (gameState.equippedSkillIds || []).map(id => (id && allowedIds.has(id)) ? id : null);"

    ui_content_norm = ui_content.replace('\r\n', '\n')
    ui_content_norm = ui_content_norm.replace(old_ui_strip.replace('\r\n', '\n'), new_ui_strip.replace('\r\n', '\n'))

    with open(ui_file, 'w', encoding='utf-8') as f:
        f.write(ui_content_norm)
    print("Updated SimpleSkillFullscreenUI.js!")

if __name__ == '__main__':
    fix_skill_selection()
