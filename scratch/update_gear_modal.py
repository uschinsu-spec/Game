with open(r'H:\GOOGLE DRIVER\GAME\src\scenes\modals\GearCraftingModal.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace GEAR_SLOTS
old_block = """      const GEAR_SLOTS = [
        { key: 'weapon', name: 'Vũ Khí',     icon: '🗡️', emoji: '🗡️' },
        { key: 'armor',  name: 'Đạo Bào',    icon: '🥋', emoji: '🥋' },
        { key: 'helm',   name: 'Đạo Quán',   icon: '👑', emoji: '👑' },
        { key: 'boots',  name: 'Ngự Hài',    icon: '👟', emoji: '👟' },
        { key: 'amulet', name: 'Ngọc Bội',   icon: '📿', emoji: '📿' },
        { key: 'shield', name: 'Linh Thuẫn', icon: '🛡️', emoji: '🛡️' }
      ];
      if (!gameState.equipped) gameState.equipped = {};

      const slotW = 148, slotH = 80, cols = 3;
      const startX = -195, startY = -200;"""

new_block = """      const GEAR_SLOTS = [
        { key: 'weapon', name: 'Vũ Khí',     icon: '🗡️', emoji: '🗡️' },
        { key: 'armor',  name: 'Đạo Bào',    icon: '🥋', emoji: '🥋' },
        { key: 'helm',   name: 'Đạo Quán',   icon: '👑', emoji: '👑' },
        { key: 'boots',  name: 'Ngự Hài',    icon: '👟', emoji: '👟' },
        { key: 'amulet', name: 'Ngọc Bội',   icon: '📿', emoji: '📿' },
        { key: 'shield', name: 'Linh Thuẫn', icon: '🛡️', emoji: '🛡️' },
        { key: 'ring',   name: 'Giới Chỉ',   icon: '💍', emoji: '💍' },
        { key: 'cloak',  name: 'Phi Phong',  icon: '🧥', emoji: '🧥' }
      ];
      if (!gameState.equipped) gameState.equipped = {};

      const slotW = 112, slotH = 76, cols = 4;
      const startX = -232, startY = -200;"""

# Normalize \r\n to \n for replacement then write back
content_norm = content.replace('\r\n', '\n')
old_norm = old_block.replace('\r\n', '\n')
new_norm = new_block.replace('\r\n', '\n')

if old_norm in content_norm:
    content_norm = content_norm.replace(old_norm, new_norm, 1)
    with open(r'H:\GOOGLE DRIVER\GAME\src\scenes\modals\GearCraftingModal.js', 'w', encoding='utf-8') as f:
        f.write(content_norm)
    print("Successfully updated GearCraftingModal.js!")
else:
    print("Could not find old_block in GearCraftingModal.js")
