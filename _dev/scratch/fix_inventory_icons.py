import os
import re

def fix_all_inventory_icons():
    # 1. Update iconManifest.js with core and additional material keys
    manifest_file = r'H:\GOOGLE DRIVER\GAME\src\config\iconManifest.js'
    with open(manifest_file, 'r', encoding='utf-8') as f:
        manifest_content = f.read()

    core_icons = {
        'core_nhat_pham_so_ky': 'icons/game_icons/19_tien_te_phan_thuong/01_r1c1.png',
        'core_nhat_pham_trung_ky': 'icons/game_icons/19_tien_te_phan_thuong/02_r1c2.png',
        'core_nhat_pham_hau_ky': 'icons/game_icons/19_tien_te_phan_thuong/03_r1c3.png',
        'core_nhat_pham_dinh_phong': 'icons/game_icons/19_tien_te_phan_thuong/04_r1c4.png',
        'mat_beast_pelt': 'icons/materials/beast_pelt.png',
        'mat_beast_fur': 'icons/materials/beast_fur.png',
        'mat_beast_claw': 'icons/materials/beast_claw.png',
        'mat_beast_blood': 'icons/materials/beast_blood.png',
        'mat_beast_horn': 'icons/materials/beast_horn.png',
        'mat_ore': 'icons/materials/ore.png',
        'mat_herb': 'icons/materials/herb.png',
    }

    # Extract all current mappings
    current_mappings = dict(re.findall(r"\['([^']+)',\s*'([^']+)'\]", manifest_content))
    current_mappings.update(core_icons)

    entries = [f"  ['{k}', '{v}']" for k, v in sorted(current_mappings.items())]
    new_manifest_js = "/**\n * Auto-generated icon manifest for all items, herbs, minerals, pills, talismans\n */\n"
    new_manifest_js += "export const GAME_ITEM_ICONS = [\n" + ",\n".join(entries) + "\n];\n\n"
    new_manifest_js += "export function loadAllItemIcons(scene, assetPrefix = './assets/') {\n"
    new_manifest_js += "  GAME_ITEM_ICONS.forEach(([key, path]) => {\n"
    new_manifest_js += "    if (!scene.textures.exists(key)) {\n"
    new_manifest_js += "      scene.load.image(key, assetPrefix + path);\n"
    new_manifest_js += "    }\n"
    new_manifest_js += "  });\n"
    new_manifest_js += "}\n"

    with open(manifest_file, 'w', encoding='utf-8') as f:
        f.write(new_manifest_js)
    print(f"Updated iconManifest.js with total {len(current_mappings)} icon entries!")

    # 2. Update InventoryGridUI.js CORE_NAMES & buildSlots
    inv_file = r'H:\GOOGLE DRIVER\GAME\src\scenes\mixins\InventoryGridUI.js'
    with open(inv_file, 'r', encoding='utf-8') as f:
        inv_content = f.read()

    # Update CORE_NAMES
    old_core_names = """const CORE_NAMES = {
  nhat_pham_so_ky: ['Nội Đan Nhất Phẩm Sơ Kỳ', '🔮', '#86efac'],
  nhat_pham_trung_ky: ['Nội Đan Nhất Phẩm Trung Kỳ', '🔷', '#7dd3fc'],
  nhat_pham_hau_ky: ['Nội Đan Nhất Phẩm Hậu Kỳ', '🟣', '#d8b4fe'],
  nhat_pham_dinh_phong: ['Nội Đan Nhất Phẩm Đỉnh Phong', '🟡', '#fde68a']
};"""

    new_core_names = """const CORE_NAMES = {
  nhat_pham_so_ky: ['Nội Đan Nhất Phẩm Sơ Kỳ', '🔮', '#86efac', 'core_nhat_pham_so_ky'],
  nhat_pham_trung_ky: ['Nội Đan Nhất Phẩm Trung Kỳ', '🔷', '#7dd3fc', 'core_nhat_pham_trung_ky'],
  nhat_pham_hau_ky: ['Nội Đan Nhất Phẩm Hậu Kỳ', '🟣', '#d8b4fe', 'core_nhat_pham_hau_ky'],
  nhat_pham_dinh_phong: ['Nội Đan Nhất Phẩm Đỉnh Phong', '🟡', '#fde68a', 'core_nhat_pham_dinh_phong']
};"""

    inv_content = inv_content.replace(old_core_names, new_core_names)

    old_core_push = """  Object.entries(CORE_NAMES).forEach(([key, [name, emoji, color]]) => pushCounted({
    id: `core_${key}`, name, emoji, color, count: gameState.materials?.beastCores?.[key],
    category: 'gem', type: 'material', desc: 'Nội đan yêu thú dùng cho đột phá và chế tạo cao cấp.'
  }));"""

    new_core_push = """  Object.entries(CORE_NAMES).forEach(([key, [name, emoji, color, iconKey]]) => pushCounted({
    id: `core_${key}`, name, emoji, color, icon: iconKey || `core_${key}`, count: gameState.materials?.beastCores?.[key],
    category: 'gem', type: 'material', desc: 'Nội đan yêu thú dùng cho đột phá và chế tạo cao cấp.'
  }));"""

    inv_content = inv_content.replace(old_core_push, new_core_push)

    with open(inv_file, 'w', encoding='utf-8') as f:
        f.write(inv_content)
    print("Updated InventoryGridUI.js with core icons!")

    # 3. Update GearCraftingModal.js _showItemPopup to properly display slot.icon / slot.iconKey
    modal_file = r'H:\GOOGLE DRIVER\GAME\src\scenes\modals\GearCraftingModal.js'
    with open(modal_file, 'r', encoding='utf-8') as f:
        modal_content = f.read()

    # Update popup icon rendering
    old_popup_icon = """    // Khung Icon Lớn & Thông Tin Căn Bản
    const iconBox = this.add.rectangle(-125, -28, 68, 68, 0x112c3c, 1).setStrokeStyle(1.5, 0x4ade80);
    const iconImg = this.add.image(-125, -28, slot.iconKey || 'item_default').setDisplaySize(56, 56);
    if (!this.textures.exists(slot.iconKey)) {
      iconImg.setTexture('item_6');
    }"""

    new_popup_icon = """    // Khung Icon Lớn & Thông Tin Căn Bản
    const iconBox = this.add.rectangle(-125, -28, 68, 68, 0x112c3c, 1).setStrokeStyle(1.5, 0x4ade80);
    const effectiveIcon = slot.icon || slot.iconKey;
    let iconImg;
    if (effectiveIcon && this.textures.exists(effectiveIcon)) {
      iconImg = this.add.image(-125, -28, effectiveIcon).setDisplaySize(56, 56);
    } else {
      iconImg = this.add.text(-125, -28, slot.emoji || '📦', { fontSize: '36px' }).setOrigin(0.5);
    }"""

    modal_content_norm = modal_content.replace('\r\n', '\n')
    old_popup_norm = old_popup_icon.replace('\r\n', '\n')
    new_popup_norm = new_popup_icon.replace('\r\n', '\n')

    if old_popup_norm in modal_content_norm:
        modal_content_norm = modal_content_norm.replace(old_popup_norm, new_popup_norm, 1)
        with open(modal_file, 'w', encoding='utf-8') as f:
            f.write(modal_content_norm)
        print("Updated GearCraftingModal.js popup icon rendering!")
    else:
        print("Warning: could not find old_popup_icon in GearCraftingModal.js")

if __name__ == '__main__':
    fix_all_inventory_icons()
