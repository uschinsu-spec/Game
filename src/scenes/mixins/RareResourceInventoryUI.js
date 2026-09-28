import { W, H } from '../constants.js';
import { gameState } from '../../state/gameState.js';
import { stopPointer } from './UiModalManager.js';

const FONT = 'Be Vietnam Pro, sans-serif';

const CORE_NAMES = {
  nhat_pham_so_ky: ['Nội Đan Nhất Phẩm Sơ Kỳ', '🔮', '#a7f3d0'],
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

function createShell(scene, subtitle = '') {
  return scene.createModalShell('🎒 TÀI NGUYÊN HIẾM', subtitle, {
    bgFill: 0x124766,
    bgAlpha: 0.98,
    bgStroke: 0x7df3ff,
    headerY: -420,
    headerH: 94,
    headerFill: 0x0b5a70,
    headerStroke: 0xffdc63,
    titleFontSize: '22px',
    titleY: -437,
    subY: -402,
    subtitleColor: '#b9f8ff'
  });
}

function resourceRows() {
  const rows = [];
  const cores = gameState.materials?.beastCores || {};
  Object.entries(CORE_NAMES).forEach(([key, [name, emoji, color]]) => {
    const count = Number(cores[key] || 0);
    if (count > 0) rows.push({ id: `core_${key}`, name, subtitle: 'Yêu thú Nhất Phẩm', count, emoji, color });
  });

  const minerals = gameState.materials?.minerals || {};
  Object.entries(MINERAL_NAMES).forEach(([key, [name, grade]]) => {
    const count = Number(minerals[key] || 0);
    if (count > 0) rows.push({ id: `mineral_${key}`, name, subtitle: grade, count, emoji: '⛏️', color: '#dff8ff' });
  });
  return rows;
}

function addButton(scene, panel, x, y, w, h, label, action, fill = 0x29485a, stroke = 0x8ddff5) {
  const bg = scene.add.rectangle(x, y, w, h, fill, 1).setStrokeStyle(2, stroke, 1).setInteractive({ useHandCursor: true });
  const txt = scene.add.text(x, y, label, { fontFamily: FONT, fontSize: '13px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
  bg.on('pointerdown', p => { stopPointer(scene, p); action(); });
  panel.add([bg, txt]);
}

export function installRareResourceInventoryUI(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__rareResourceInventoryInstalled) return;
  const proto = MainGameScene.prototype;
  proto.__rareResourceInventoryInstalled = true;

  const previousOpenGear = proto.openGearPanel;
  if (typeof previousOpenGear !== 'function') return;

  proto.openRareResourcePanel = function openRareResourcePanel(page = 0) {
    const rows = resourceRows();
    const pageSize = 8;
    const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
    const current = Math.max(0, Math.min(Number(page) || 0, totalPages - 1));
    const panel = createShell(this, 'Nội Đan • Khoáng Thạch phân phẩm');
    const shown = rows.slice(current * pageSize, current * pageSize + pageSize);

    if (!shown.length) {
      const empty = this.add.text(0, -40, 'Chưa có Nội Đan hoặc Khoáng phân phẩm.\nHãy săn yêu thú và khai khoáng ngoài map.', {
        fontFamily: FONT, fontSize: '16px', fontStyle: 'bold', color: '#e5fbff', align: 'center', lineSpacing: 8
      }).setOrigin(0.5);
      panel.add(empty);
    }

    shown.forEach((row, idx) => {
      const y = -320 + idx * 82;
      const box = this.add.rectangle(0, y, 474, 68, 0x0d3d52, 1).setStrokeStyle(1.5, 0x56dff5, 1);
      const icon = this.add.text(-210, y, row.emoji, { fontSize: '24px' }).setOrigin(0.5);
      const name = this.add.text(-178, y - 11, row.name, {
        fontFamily: FONT, fontSize: '14px', fontStyle: 'bold', color: row.color
      }).setOrigin(0, 0.5);
      const info = this.add.text(-178, y + 15, `${row.subtitle} • Số lượng: ${row.count}`, {
        fontFamily: FONT, fontSize: '11px', color: '#b9eff8'
      }).setOrigin(0, 0.5);
      panel.add([box, icon, name, info]);
    });

    if (totalPages > 1) {
      addButton(this, panel, -115, 365, 210, 44, '‹ TRƯỚC', () => this.openRareResourcePanel(current - 1));
      addButton(this, panel, 115, 365, 210, 44, `SAU ${current + 1}/${totalPages} ›`, () => this.openRareResourcePanel(current + 1));
    }
    addButton(this, panel, 0, 420, 430, 48, '‹ QUAY LẠI HÀNH TRANG', () => previousOpenGear.call(this, 'bag', 0), 0x303e50, 0x94b8cc);
  };

  proto.openGearPanel = function openGearWithRareResources(view = 'bag', page = 0, selectedId = null) {
    const result = previousOpenGear.call(this, view, page, selectedId);
    const bagView = (view === 'bag' || typeof view === 'number' && view !== -1);
    if (!bagView || selectedId || !this.activeModal?.active) return result;

    const panel = this.activeModal;
    const hasRare = resourceRows().length > 0;
    const bg = this.add.rectangle(0, 415, 430, 46, hasRare ? 0x5b4513 : 0x263849, 1)
      .setStrokeStyle(2, hasRare ? 0xffdc63 : 0x6b7d89, 1)
      .setInteractive({ useHandCursor: true });
    const txt = this.add.text(0, 415, hasRare ? '🔮 TÀI NGUYÊN HIẾM / KHOÁNG PHÂN PHẨM' : 'TÀI NGUYÊN HIẾM: CHƯA CÓ', {
      fontFamily: FONT, fontSize: '12px', fontStyle: 'bold', color: hasRare ? '#fff1a8' : '#a7b5bf'
    }).setOrigin(0.5);
    bg.on('pointerdown', p => {
      stopPointer(this, p);
      this.openRareResourcePanel(0);
    });
    panel.add([bg, txt]);
    return result;
  };
}
