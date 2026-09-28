import { W, H } from '../constants.js';
import { gameState } from '../../state/gameState.js';
import { CRAFTING_SYSTEM } from '../../config/craftingData.js';
import { getHerbByName } from '../../config/herbsData.js';
import { ensureCurrencies } from '../../config/currencyData.js';

const FONT = 'Be Vietnam Pro, sans-serif';
const COLS = 7;
const ROWS = 6;
const PAGE_SIZE = COLS * ROWS;

const CORE_NAMES = {
  nhat_pham_so_ky: ['Nội Đan Nhất Phẩm Sơ Kỳ', '🔮', '#86efac'],
  nhat_pham_trung_ky: ['Nội Đan Nhất Phẩm Trung Kỳ', '🔷', '#7dd3fc'],
  nhat_pham_hau_ky: ['Nội Đan Nhất Phẩm Hậu Kỳ', '🟣', '#d8b4fe'],
  nhat_pham_dinh_phong: ['Nội Đan Nhất Phẩm Đỉnh Phong', '🟡', '#fde68a']
};

const MINERAL_NAMES = {
  ore_0_iron: ['Phàm Thiết Khoáng', 'Phàm Phẩm'],
  ore_0_copper: ['Xích Đồng Khoáng', 'Phàm Phẩm'],
  ore_0_greenstone: ['Thanh Thạch Khoáng', 'Phàm Phẩm'],
  ore_0_blacksand: ['Hắc Sa Thiết', 'Phàm Phẩm'],
  ore_1_greensteel: ['Thanh Cương Khoáng', 'Nhất Phẩm Sơ Cấp'],
  ore_1_woodstone: ['Mộc Linh Thạch', 'Nhất Phẩm Sơ Cấp'],
  ore_1_darkiron: ['Huyền Thiết Quặng', 'Nhất Phẩm Trung Cấp'],
  ore_1_jadecopper: ['Bích Đồng Tinh', 'Nhất Phẩm Trung Cấp'],
  ore_1_spiritsteel: ['Tinh Cương Linh Khoáng', 'Nhất Phẩm Cao Cấp'],
  ore_1_jade: ['Thanh Ngọc Khoáng', 'Nhất Phẩm Cao Cấp'],
  ore_1_purplegold: ['Tử Kim Linh Khoáng', 'Nhất Phẩm Cực Phẩm'],
  ore_1_vanmoc: ['Vạn Mộc Tinh Thạch', 'Nhất Phẩm Cực Phẩm']
};

const FILTERS = [
  ['all', 'Tất cả'],
  ['gear', 'Trang bị'],
  ['gem', 'Bảo thạch'],
  ['craft', 'Chế tạo'],
  ['spirit', 'Tướng linh'],
  ['other', 'Khác']
];

const TYPE_ORDER = { gear: 0, gem: 1, craft: 2, spirit: 3, other: 4 };

function stopPointer(scene, pointer) {
  scene?.input?.stopPropagation?.();
  pointer?.event?.stopPropagation?.();
  pointer?.event?.preventDefault?.();
}

function positive(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function gearSignature(item = {}) {
  return [
    item.id || item.name || 'unknown', item.name || '', item.type || '', item.icon || '',
    item.bonusDmg || 0, item.bonusHp || 0, item.bonusDef || 0, item.bonusSpd || 0,
    item.rarity || item.grade || ''
  ].join('|');
}

function gearDescription(item = {}) {
  const stats = [];
  if (item.bonusDmg) stats.push(`⚔ +${item.bonusDmg} Công`);
  if (item.bonusHp) stats.push(`❤ +${item.bonusHp} HP`);
  if (item.bonusDef) stats.push(`🛡 +${item.bonusDef} Giáp`);
  if (item.bonusSpd) stats.push(`💨 +${item.bonusSpd} Tốc`);
  return stats.join('  ·  ') || item.desc || 'Trang bị tu tiên';
}

function buildSlots() {
  const slots = [];
  const pushCounted = (slot) => {
    const count = positive(slot.count);
    if (count) slots.push({ ...slot, count, iconKey: slot.icon || null });
  };

  [
    { id: 'ore', name: 'Khoáng Thạch', emoji: '💎', icon: 'mat_ore', count: gameState.ores, category: 'craft', type: 'material', color: '#67e8f9', desc: 'Khoáng thạch dùng để rèn đúc.' },
    { id: 'pelt', name: 'Da Thú', emoji: '🐺', icon: 'mat_beast_pelt', count: gameState.materials?.beastPelts, category: 'craft', type: 'material', color: '#fbbf24', desc: 'Nguyên liệu thu được từ dã thú.' },
    { id: 'fur', name: 'Lông Thú', emoji: '🪶', icon: 'mat_beast_fur', count: gameState.materials?.beastFurs, category: 'craft', type: 'material', color: '#e2e8f0', desc: 'Nguyên liệu thu được từ phi cầm.' },
    { id: 'claw', name: 'Móng Vuốt', emoji: '🐾', icon: 'mat_beast_claw', count: gameState.materials?.beastClaws, category: 'craft', type: 'material', color: '#f87171', desc: 'Móng vuốt hung thú dùng để chế tạo.' },
    { id: 'blood', name: 'Huyết Thú', emoji: '🩸', icon: 'mat_beast_blood', count: gameState.materials?.beastBlood, category: 'craft', type: 'material', color: '#fb7185', desc: 'Tinh huyết yêu thú thuần khiết.' },
    { id: 'horn', name: 'Sừng Thú', emoji: '🦏', icon: 'mat_beast_horn', count: gameState.materials?.beastHorns, category: 'craft', type: 'material', color: '#c084fc', desc: 'Sừng yêu thú quý hiếm.' }
  ].forEach(pushCounted);

  if (gameState.herbs && typeof gameState.herbs === 'object') {
    Object.entries(gameState.herbs).forEach(([name, count]) => {
      const def = getHerbByName(name);
      pushCounted({
        id: `herb_${name}`, name, count, category: 'craft', type: 'herb',
        emoji: def?.emoji || '🌿', icon: def?.icon || 'mat_herb',
        color: def?.color || '#86efac', herbRef: def,
        desc: `[${def?.rankName || 'Linh Thảo'}] ${def?.desc || 'Dược liệu dùng để luyện đan.'}\nGiá trị: ${def?.price || 50} Bạc/cây`
      });
    });
  } else if (positive(gameState.herbs)) {
    const def = getHerbByName('Ngưng Khí Thảo');
    pushCounted({ id: 'herb_legacy', name: 'Ngưng Khí Thảo', count: gameState.herbs, category: 'craft', type: 'herb', emoji: '🌿', icon: def?.icon || 'mat_herb', color: '#86efac', herbRef: def, desc: 'Linh thảo sơ cấp dùng để luyện đan.' });
  }

  Object.entries(gameState.inventory?.pills || {}).forEach(([name, count]) => {
    const def = CRAFTING_SYSTEM.pills?.find(item => item.name === name);
    pushCounted({ id: `pill_${name}`, name, count, category: 'craft', type: 'pill', emoji: '💊', icon: def?.icon || null, color: '#38bdf8', pillRef: def, desc: def?.desc || 'Đan dược tu luyện.' });
  });

  Object.entries(gameState.inventory?.talismans || {}).forEach(([name, count]) => {
    const def = CRAFTING_SYSTEM.talismans?.find(item => item.name === name);
    pushCounted({ id: `talisman_${name}`, name, count, category: 'craft', type: 'talisman', emoji: '📜', icon: def?.icon || null, color: '#f59e0b', talismanRef: def, desc: def?.desc || 'Phù lục chiến đấu.' });
  });

  const formationCounts = new Map();
  (gameState.inventory?.formations || []).forEach((name) => formationCounts.set(name, (formationCounts.get(name) || 0) + 1));
  formationCounts.forEach((count, name) => {
    const def = CRAFTING_SYSTEM.formations?.find(item => item.name === name);
    pushCounted({ id: `formation_${name}`, name, count, category: 'spirit', type: 'formation', emoji: '☸️', icon: def?.icon || null, color: '#c084fc', formationRef: def, desc: def?.desc || 'Trận pháp hộ thể.' });
  });

  const gearStacks = new Map();
  (gameState.inventory?.items || []).forEach((item) => {
    if (!item) return;
    const key = gearSignature(item);
    if (!gearStacks.has(key)) gearStacks.set(key, { item, count: 0 });
    gearStacks.get(key).count += 1;
  });
  gearStacks.forEach(({ item, count }, key) => pushCounted({
    id: `gear_${key}`, name: item.name || 'Trang Bị', count, category: 'gear', type: 'gear',
    emoji: '⚔️', icon: item.icon || null, color: '#fef08a', itemRef: item,
    desc: gearDescription(item)
  }));

  Object.entries(CORE_NAMES).forEach(([key, [name, emoji, color]]) => pushCounted({
    id: `core_${key}`, name, emoji, color, count: gameState.materials?.beastCores?.[key],
    category: 'gem', type: 'material', desc: 'Nội đan yêu thú dùng cho đột phá và chế tạo cao cấp.'
  }));
  Object.entries(MINERAL_NAMES).forEach(([key, [name, grade]]) => pushCounted({
    id: `mineral_${key}`, name, emoji: '⛏️', color: '#dff8ff', count: gameState.materials?.minerals?.[key],
    category: 'gem', type: 'material', desc: `[${grade}] Khoáng thạch phân phẩm dùng để luyện khí.`
  }));

  return slots;
}

function addPanelText(scene, panel, x, y, value, style = {}) {
  const txt = scene.add.text(x, y, value, { fontFamily: FONT, ...style });
  panel.add(txt);
  return txt;
}

export function installInventoryGridUI(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__inventoryGridUiInstalled) return;
  const proto = MainGameScene.prototype;
  proto.__inventoryGridUiInstalled = true;
  const previousOpenGear = proto.openGearPanel;
  if (typeof previousOpenGear !== 'function') return;

  proto.openGearPanel = function openCompactInventory(view = 0, pageArg = 0, filterArg = 'all') {
    if (view === -1 || view === 'equip') return previousOpenGear.call(this, -1);

    const page = Math.max(0, Number(view === 'bag' ? pageArg : view) || 0);
    const requestedFilter = FILTERS.some(([key]) => key === filterArg) ? filterArg : (this._inventoryFilter || 'all');
    this._inventoryFilter = requestedFilter;
    this.closeModal();

    const overlay = this.fixed(this.add.rectangle(W / 2, H / 2, W + 20, H + 20, 0x000000, 0.55), 1999998)
      .setInteractive({ useHandCursor: false });
    const panel = this.fixed(this.add.container(W / 2, H / 2), 2000000);
    this.activeModal = panel;
    this.activeModalOverlay = overlay;
    overlay.on('pointerdown', pointer => stopPointer(this, pointer));

    const bg = this.add.rectangle(0, 0, W - 14, H - 20, 0x101915, 0.99).setStrokeStyle(3, 0xb69555, 1);
    const inner = this.add.rectangle(0, 32, W - 38, H - 128, 0x07110d, 1).setStrokeStyle(1, 0x5d5138, 1);
    const header = this.add.rectangle(0, -H / 2 + 48, W - 28, 64, 0x5b1717, 1).setStrokeStyle(2, 0xd5aa5c, 1);
    panel.add([bg, inner, header]);
    addPanelText(this, panel, 0, -H / 2 + 48, 'TÚI ĐỒ', { fontSize: '21px', fontStyle: 'bold', color: '#ffe89a' }).setOrigin(0.5);
    this.createModalCloseBtn(panel, W / 2 - 42, -H / 2 + 48);

    const allSlots = buildSlots();
    const filtered = requestedFilter === 'all' ? [...allSlots] : allSlots.filter(slot => slot.category === requestedFilter);
    filtered.sort((a, b) => (TYPE_ORDER[a.category] ?? 9) - (TYPE_ORDER[b.category] ?? 9) || a.name.localeCompare(b.name, 'vi'));
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages - 1);
    const shown = filtered.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

    const tabY = -H / 2 + 94;
    const tabW = 78;
    FILTERS.forEach(([key, label], index) => {
      const x = -195 + index * tabW;
      const active = key === requestedFilter;
      const tab = this.add.rectangle(x, tabY, tabW - 4, 32, active ? 0x6f4318 : 0x26271f, 1)
        .setStrokeStyle(1, active ? 0xf8d477 : 0x665b43, 1)
        .setInteractive({ useHandCursor: true });
      const txt = this.add.text(x, tabY, label, { fontFamily: FONT, fontSize: '10px', fontStyle: 'bold', color: active ? '#fff2b2' : '#c9c2a8' }).setOrigin(0.5);
      tab.on('pointerdown', pointer => {
        stopPointer(this, pointer);
        this._inventoryFilter = key;
        this.openGearPanel('bag', 0, key);
      });
      panel.add([tab, txt]);
    });

    const c = ensureCurrencies(gameState);
    const statusY = tabY + 34;
    addPanelText(this, panel, -235, statusY, `Trang ${currentPage + 1}/${totalPages}`, { fontSize: '11px', fontStyle: 'bold', color: '#d8c68d' }).setOrigin(0, 0.5);
    addPanelText(this, panel, 235, statusY, `🪙 ${(c.silver || 0).toLocaleString()}   💎 ${(c.low || 0).toLocaleString()}`, { fontSize: '10px', color: '#fde68a' }).setOrigin(1, 0.5);

    const cell = 62;
    const gap = 5;
    const gridWidth = COLS * cell + (COLS - 1) * gap;
    const gridX = -gridWidth / 2;
    const gridY = statusY + 22;

    for (let index = 0; index < PAGE_SIZE; index += 1) {
      const row = Math.floor(index / COLS);
      const col = index % COLS;
      const x = gridX + col * (cell + gap) + cell / 2;
      const y = gridY + row * (cell + gap) + cell / 2;
      const slot = shown[index];
      const cellBg = this.add.rectangle(x, y, cell, cell, slot ? 0x12261c : 0x0a0f0c, 1)
        .setStrokeStyle(slot ? 1.5 : 1, slot ? 0x7f6335 : 0x252b25, 1);
      panel.add(cellBg);
      if (!slot) continue;

      cellBg.setInteractive({ useHandCursor: true });
      cellBg.on('pointerover', () => cellBg.setStrokeStyle(2.5, 0xffd66b, 1));
      cellBg.on('pointerout', () => cellBg.setStrokeStyle(1.5, 0x7f6335, 1));

      let icon;
      if (slot.icon && this.textures.exists(slot.icon)) {
        icon = this.add.image(x, y - 4, slot.icon).setDisplaySize(46, 46);
      } else {
        icon = this.add.text(x, y - 4, slot.emoji || '📦', { fontSize: '31px' }).setOrigin(0.5);
      }
      panel.add(icon);

      if (slot.count > 1) {
        const label = slot.count > 9999 ? `${Math.floor(slot.count / 1000)}k` : String(slot.count);
        const countBg = this.add.rectangle(x + 20, y + 20, Math.max(22, 9 + label.length * 7), 18, 0x050505, 0.88).setStrokeStyle(1, 0xd9bd61, 1);
        const countTxt = this.add.text(x + 20, y + 20, label, { fontFamily: FONT, fontSize: '10px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
        panel.add([countBg, countTxt]);
      }

      cellBg.on('pointerdown', pointer => {
        stopPointer(this, pointer);
        this._showItemPopup(panel, x, y, { ...slot, iconKey: slot.icon || 'item_default' }, currentPage);
      });
    }

    if (!filtered.length) {
      addPanelText(this, panel, 0, gridY + 190, 'Chưa có vật phẩm thuộc nhóm này.', { fontSize: '15px', fontStyle: 'bold', color: '#8c947f' }).setOrigin(0.5);
    }

    const footerY = H / 2 - 92;
    const prev = this.add.rectangle(-190, footerY, 72, 38, currentPage > 0 ? 0x5f351c : 0x252820, 1)
      .setStrokeStyle(1.5, currentPage > 0 ? 0xe5b864 : 0x45483d, 1).setInteractive({ useHandCursor: true });
    const prevTxt = this.add.text(-190, footerY, '◀', { fontFamily: FONT, fontSize: '19px', color: currentPage > 0 ? '#ffe092' : '#5f6258' }).setOrigin(0.5);
    const next = this.add.rectangle(190, footerY, 72, 38, currentPage < totalPages - 1 ? 0x5f351c : 0x252820, 1)
      .setStrokeStyle(1.5, currentPage < totalPages - 1 ? 0xe5b864 : 0x45483d, 1).setInteractive({ useHandCursor: true });
    const nextTxt = this.add.text(190, footerY, '▶', { fontFamily: FONT, fontSize: '19px', color: currentPage < totalPages - 1 ? '#ffe092' : '#5f6258' }).setOrigin(0.5);
    prev.on('pointerdown', pointer => { stopPointer(this, pointer); if (currentPage > 0) this.openGearPanel('bag', currentPage - 1, requestedFilter); });
    next.on('pointerdown', pointer => { stopPointer(this, pointer); if (currentPage < totalPages - 1) this.openGearPanel('bag', currentPage + 1, requestedFilter); });
    panel.add([prev, prevTxt, next, nextTxt]);

    const capacity = this.add.rectangle(0, footerY, 138, 38, 0x181d17, 1).setStrokeStyle(1.5, 0x746747, 1);
    const capacityTxt = this.add.text(0, footerY, `${allSlots.length}/252 ô`, { fontFamily: FONT, fontSize: '12px', fontStyle: 'bold', color: '#e5d8a6' }).setOrigin(0.5);
    panel.add([capacity, capacityTxt]);

    const bottomY = H / 2 - 42;
    const equipBtn = this.add.rectangle(-118, bottomY, 214, 42, 0x5f1e1e, 1).setStrokeStyle(1.5, 0xe0a460, 1).setInteractive({ useHandCursor: true });
    const equipTxt = this.add.text(-118, bottomY, 'TRANG BỊ ĐANG MẶC', { fontFamily: FONT, fontSize: '11px', fontStyle: 'bold', color: '#fff0bc' }).setOrigin(0.5);
    const sortBtn = this.add.rectangle(118, bottomY, 214, 42, 0x5f1e1e, 1).setStrokeStyle(1.5, 0xe0a460, 1).setInteractive({ useHandCursor: true });
    const sortTxt = this.add.text(118, bottomY, 'SẮP XẾP TÚI', { fontFamily: FONT, fontSize: '11px', fontStyle: 'bold', color: '#fff0bc' }).setOrigin(0.5);
    equipBtn.on('pointerdown', pointer => { stopPointer(this, pointer); this.openGearPanel(-1); });
    sortBtn.on('pointerdown', pointer => { stopPointer(this, pointer); this.openGearPanel('bag', 0, requestedFilter); });
    panel.add([equipBtn, equipTxt, sortBtn, sortTxt]);

    this.activeModal = panel;
    this.activeModalOverlay = overlay;
    return panel;
  };
}
