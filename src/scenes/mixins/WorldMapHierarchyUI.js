/**
 * WorldMapHierarchyUI.js
 * =========================================================================
 * VISUAL ELLIPSE MAP — Mọi cấp đều hiển thị dạng bản đồ ellipse trực quan
 * =========================================================================
 * Cách hoạt động:
 *  • Nhấn minimap  → Realm map: 5 lục địa dạng ellipse
 *  • Nhấn lục địa → Great Region map: các Đại Vực / Huyền Vực... ellipse
 *  • Nhấn vùng    → Province map: Quốc gia + Hoang Dã + Bí Cảnh
 *  • Nhấn quốc gia→ Nation map: Thành vực + Biên hoang + Bí cảnh
 *  • ...tiếp tục đến địa điểm lá → Detail + Dịch Chuyển
 */
import { REALMS } from '../../config/realmsData.js';
import {
  HUMAN_REALM_ROOT_ID,
  canEnterMap,
  getMapById,
  getWorldBreadcrumb,
  getWorldChildren,
  getWorldNode,
  getWorldNodeForMap
} from '../../config/world/worldRegistry.js?v=20260929-single-map-system-v1';
import { gameState } from '../../state/gameState.js';
import { ensureWorldProgress, hasVisitedMap, isNodeDiscovered } from '../../state/worldProgress.js';
import { stopPointer } from './UiModalManager.js';

const FONT         = 'Be Vietnam Pro, sans-serif';
const MAP_UI_OWNER  = 'WorldMapHierarchyUI';
const LEGACY_TO_ROOT = new Set(['nam_lang', 'van_tinh_hai', 'than_chau', 'man_hoang', 'thai_hu']);
const PAGE_MAX     = 12; // số ellipse tối đa mỗi trang

// ──────────────────────────────────────────────────────────────────────────
// DYNAMIC TEXTURE LOADER — tự load PNG 3D khi mở map lần đầu (không cần restart)
// ──────────────────────────────────────────────────────────────────────────
const ZONE_TEX_KEYS = [
  'zone_nation', 'zone_wild', 'zone_secret', 'zone_city',
  'zone_village', 'zone_continent', 'zone_region', 'zone_province'
];
const ZONE_TEX_BASE = './assets/ui/map/zones/';
let _zoneTexReady   = false; // cache: đã load xong chưa

/**
 * Kiểm tra và load các zone texture nếu chưa có.
 * Gọi callback() ngay nếu đã sẵn sàng, ngược lại load rồi gọi callback khi xong.
 */
function ensureZoneTextures(scene, callback) {
  if (_zoneTexReady) { callback(); return; }

  const missing = ZONE_TEX_KEYS.filter(k => !scene.textures.exists(k));
  if (missing.length === 0) { _zoneTexReady = true; callback(); return; }

  missing.forEach(k => scene.load.image(k, `${ZONE_TEX_BASE}${k}.png`));
  scene.load.once('complete', () => {
    _zoneTexReady = true;
    callback();
  });
  scene.load.once('loaderror', (_file) => {
    // Nếu lỗi đường dẫn, vẫn gọi callback — fallback graphics sẽ được dùng
    _zoneTexReady = true;
    callback();
  });
  scene.load.start();
}

// ──────────────────────────────────────────────────────────────────────────
// MÀU SẮC + TEXTURE theo loại node
// ──────────────────────────────────────────────────────────────────────────
const KIND_COLOR = {
  realm:          { text: '#b0f0ff', stroke: 0x3adcff, icon: '🌍', tex: 'zone_continent' },
  continent:      { text: '#c8f0ff', stroke: 0x48c8e8, icon: '🗺️', tex: 'zone_continent' },
  great_region:   { text: '#ffe89a', stroke: 0xf5d84a, icon: '🏔️', tex: 'zone_region'    },
  province:       { text: '#d6f9ff', stroke: 0x2ab6d4, icon: '🏯', tex: 'zone_province'  },
  nation:         { text: '#ffe59a', stroke: 0xf5c842, icon: '⚜️', tex: 'zone_nation'    },
  city_territory: { text: '#b8ffde', stroke: 0x3dffb3, icon: '🏙️', tex: 'zone_city'      },
  settlement:     { text: '#c8f0ff', stroke: 0x78d8f5, icon: '🏘️', tex: 'zone_village'   },
  safe_hub:       { text: '#a8ffe8', stroke: 0x40ffaa, icon: '🏠', tex: 'zone_village'   },
  field:          { text: '#b8ffc0', stroke: 0x50dd5a, icon: '⚔️', tex: 'zone_wild'      },
  secret_realm:   { text: '#e4c0ff', stroke: 0xc060ff, icon: '✨', tex: 'zone_secret'    },
  major_hub:      { text: '#ffe8a0', stroke: 0xffc840, icon: '🏛️', tex: 'zone_city'      },
  prov_wild:      { text: '#98ff9c', stroke: 0x3acc40, icon: '🌿', tex: 'zone_wild'      },
  prov_secret:    { text: '#d8a8ff', stroke: 0xa848f8, icon: '💠', tex: 'zone_secret'    },
  nat_wild:       { text: '#a8ffa8', stroke: 0x48cc4a, icon: '🗡️', tex: 'zone_wild'      },
  nat_secret:     { text: '#cca0ff', stroke: 0x9038e8, icon: '🔮', tex: 'zone_secret'    },
  forbidden_zone: { text: '#ffaaaa', stroke: 0xff3030, icon: '💀', tex: 'zone_secret'    },
  default:        { text: '#d6f5ff', stroke: 0x4fbcd8, icon: '📍', tex: 'zone_province'  },
};

function nodeColor(node) {
  if (node.type === 'location') return KIND_COLOR[node.locationKind] ?? KIND_COLOR.default;
  return KIND_COLOR[node.type] ?? KIND_COLOR.default;
}

// texture key → ảnh PNG 3D; fallback về placeholder nếu chưa load
function zoneTex(scene, col) {
  const key = col.tex ?? 'zone_province';
  return scene.textures.exists(key) ? key : null;
}

// ──────────────────────────────────────────────────────────────────────────
// LABEL CẤP NODE
// ──────────────────────────────────────────────────────────────────────────
const TYPE_LABEL = {
  realm: 'NHÂN GIỚI', continent: 'ĐẠI LỤC', great_region: 'ĐẠI VỰC',
  province: 'CHÂU', nation: 'QUỐC GIA', commandery: 'QUẬN',
  city_territory: 'THÀNH VỰC', settlement: 'THÔN', location: 'ĐỊA ĐIỂM'
};
const LOC_KIND_LABEL = {
  safe_hub: 'AN TOÀN', major_hub: 'ĐẠI THÀNH', field: 'HOANG DÃ',
  secret_realm: 'BÍ CẢNH', prov_wild: 'HOANG DÃ CHÂU', prov_secret: 'BÍ CẢNH CHÂU',
  nat_wild: 'BIÊN HOANG', nat_secret: 'BÍ CẢNH QUỐC', forbidden_zone: 'CẤM ĐỊA',
  town: 'TRẤN', resource: 'TÀI NGUYÊN', dungeon: 'PHÓ BẢN', market: 'PHƯỜNG THỊ',
};

function typeText(node) {
  if (node?.displayTypeLabel) return node.displayTypeLabel;
  if (node.type === 'location' && node.locationKind)
    return LOC_KIND_LABEL[node.locationKind] ?? TYPE_LABEL.location;
  return TYPE_LABEL[node.type] ?? node.type?.toUpperCase() ?? '?';
}

function breadcrumb(nodeId) {
  return getWorldBreadcrumb(nodeId).map(n => n.name).join(' › ');
}

function nodeStatus(node) {
  const map = getMapById(node.playableMapId ?? node.id);
  if (map) {
    if (Number(map.id) === Number(gameState.currentMapId)) return '📍HERE';
    if (hasVisitedMap(gameState, map.id)) return '✓';
    return '○';
  }
  return isNodeDiscovered(gameState, node.id) ? '✓' : '○';
}

// ──────────────────────────────────────────────────────────────────────────
// LAYOUT PRESETS — vị trí ellipse cho 1..12 items (tọa độ map-relative)
// Map center offset: tất cả y đã tính sẵn, apply thêm MAP_CY khi render
// ──────────────────────────────────────────────────────────────────────────
const MAP_CY = -30; // độ lệch y của map center so với panel center

const ELLIPSE_PRESETS = [
  // 0 items - không dùng
  [],
  // 1 item
  [{ cx:   0, cy:   0, rx: 165, ry: 68 }],
  // 2 items
  [
    { cx:-118, cy:   0, rx: 112, ry: 52 },
    { cx: 118, cy:   0, rx: 112, ry: 52 },
  ],
  // 3 items
  [
    { cx:   0, cy:-115, rx: 120, ry: 50 },
    { cx:-118, cy:  65, rx: 110, ry: 46 },
    { cx: 118, cy:  65, rx: 110, ry: 46 },
  ],
  // 4 items
  [
    { cx:-115, cy:-100, rx: 108, ry: 46 },
    { cx: 115, cy:-100, rx: 108, ry: 46 },
    { cx:-115, cy:  50, rx: 108, ry: 46 },
    { cx: 115, cy:  50, rx: 108, ry: 46 },
  ],
  // 5 items — layout bản đồ thế giới
  [
    { cx:   0, cy:-148, rx: 138, ry: 54 },
    { cx: 182, cy: -25, rx:  88, ry: 46 },
    { cx:-182, cy: -25, rx:  88, ry: 46 },
    { cx: 132, cy: 120, rx:  96, ry: 42 },
    { cx:-132, cy: 120, rx:  96, ry: 42 },
  ],
  // 6 items
  [
    { cx:-150, cy:-128, rx: 92, ry: 38 },
    { cx:   0, cy:-138, rx: 92, ry: 38 },
    { cx: 150, cy:-128, rx: 92, ry: 38 },
    { cx:-150, cy:  18, rx: 92, ry: 38 },
    { cx:   0, cy:  25, rx: 92, ry: 38 },
    { cx: 150, cy:  18, rx: 92, ry: 38 },
  ],
  // 7 items
  [
    { cx:-150, cy:-140, rx: 86, ry: 36 },
    { cx:   0, cy:-148, rx: 86, ry: 36 },
    { cx: 150, cy:-140, rx: 86, ry: 36 },
    { cx:-150, cy:  -5, rx: 84, ry: 35 },
    { cx:   0, cy: -10, rx: 84, ry: 35 },
    { cx: 150, cy:  -5, rx: 84, ry: 35 },
    { cx:   0, cy: 135, rx: 92, ry: 38 },
  ],
  // 8 items
  [
    { cx:-150, cy:-138, rx: 82, ry: 34 },
    { cx:   0, cy:-145, rx: 82, ry: 34 },
    { cx: 150, cy:-138, rx: 82, ry: 34 },
    { cx:-150, cy: -10, rx: 80, ry: 33 },
    { cx:   0, cy: -15, rx: 80, ry: 33 },
    { cx: 150, cy: -10, rx: 80, ry: 33 },
    { cx: -76, cy: 128, rx: 82, ry: 34 },
    { cx:  76, cy: 128, rx: 82, ry: 34 },
  ],
  // 9 items
  [
    { cx:-150, cy:-138, rx: 78, ry: 32 },
    { cx:   0, cy:-145, rx: 78, ry: 32 },
    { cx: 150, cy:-138, rx: 78, ry: 32 },
    { cx:-150, cy: -15, rx: 76, ry: 31 },
    { cx:   0, cy: -18, rx: 76, ry: 31 },
    { cx: 150, cy: -15, rx: 76, ry: 31 },
    { cx:-150, cy: 108, rx: 76, ry: 31 },
    { cx:   0, cy: 105, rx: 76, ry: 31 },
    { cx: 150, cy: 108, rx: 76, ry: 31 },
  ],
  // 10 items
  [
    { cx:-150, cy:-148, rx: 74, ry: 30 },
    { cx:   0, cy:-152, rx: 74, ry: 30 },
    { cx: 150, cy:-148, rx: 74, ry: 30 },
    { cx:-150, cy: -28, rx: 72, ry: 29 },
    { cx:   0, cy: -32, rx: 72, ry: 29 },
    { cx: 150, cy: -28, rx: 72, ry: 29 },
    { cx:-150, cy:  90, rx: 72, ry: 29 },
    { cx:   0, cy:  87, rx: 72, ry: 29 },
    { cx: 150, cy:  90, rx: 72, ry: 29 },
    { cx:   0, cy: 202, rx: 78, ry: 31 },
  ],
  // 11 items
  [
    { cx:-150, cy:-148, rx: 70, ry: 28 },
    { cx:   0, cy:-155, rx: 70, ry: 28 },
    { cx: 150, cy:-148, rx: 70, ry: 28 },
    { cx:-150, cy: -32, rx: 68, ry: 27 },
    { cx:   0, cy: -36, rx: 68, ry: 27 },
    { cx: 150, cy: -32, rx: 68, ry: 27 },
    { cx:-150, cy:  82, rx: 68, ry: 27 },
    { cx:   0, cy:  79, rx: 68, ry: 27 },
    { cx: 150, cy:  82, rx: 68, ry: 27 },
    { cx: -76, cy: 192, rx: 70, ry: 28 },
    { cx:  76, cy: 192, rx: 70, ry: 28 },
  ],
  // 12 items
  [
    { cx:-150, cy:-150, rx: 68, ry: 27 },
    { cx:   0, cy:-155, rx: 68, ry: 27 },
    { cx: 150, cy:-150, rx: 68, ry: 27 },
    { cx:-150, cy: -38, rx: 66, ry: 26 },
    { cx:   0, cy: -42, rx: 66, ry: 26 },
    { cx: 150, cy: -38, rx: 66, ry: 26 },
    { cx:-150, cy:  75, rx: 66, ry: 26 },
    { cx:   0, cy:  72, rx: 66, ry: 26 },
    { cx: 150, cy:  75, rx: 66, ry: 26 },
    { cx:-150, cy: 185, rx: 66, ry: 26 },
    { cx:   0, cy: 182, rx: 66, ry: 26 },
    { cx: 150, cy: 185, rx: 66, ry: 26 },
  ],
];

function getEllipsePositions(n) {
  const clamped = Math.max(1, Math.min(n, PAGE_MAX));
  return ELLIPSE_PRESETS[clamped] ?? ELLIPSE_PRESETS[PAGE_MAX];
}

// ──────────────────────────────────────────────────────────────────────────
// TẠO ZONE ISLAND — ảnh PNG 3D + ring glow overlay
// ──────────────────────────────────────────────────────────────────────────
function createZoneIsland(scene, panel, pos, col, isCurrent) {
  const { cx, cy, rx, ry } = pos;
  const realCy = cy + MAP_CY;
  const tex = zoneTex(scene, col);

  // Shadow dưới đảo
  const shadow = scene.add.graphics();
  shadow.fillStyle(0x000000, 0.38);
  shadow.fillEllipse(cx + 6, realCy + 10, rx * 2 + 12, ry * 0.7 + 6);
  panel.add(shadow);

  // Ảnh đảo 3D
  let island;
  if (tex) {
    island = scene.add.image(cx, realCy, tex)
      .setDisplaySize(rx * 2 + 10, ry * 2 + 10)
      .setAlpha(0.97);
  } else {
    // Fallback graphics nếu chưa load xong
    const g = scene.add.graphics();
    g.fillStyle(0x0d3347, 1);
    g.fillEllipse(cx, realCy, rx * 2, ry * 2);
    g.lineStyle(2, col.stroke, 1);
    g.strokeEllipse(cx, realCy, rx * 2, ry * 2);
    island = g;
  }
  panel.add(island);

  // Ring glow (tím/vàng/cyan tùy loại)
  const ring = scene.add.graphics();
  const ringAlpha = isCurrent ? 0.9 : 0.55;
  ring.lineStyle(isCurrent ? 3 : 2, isCurrent ? 0x3dffb3 : col.stroke, ringAlpha);
  ring.strokeEllipse(cx, realCy, rx * 2 + 6, ry * 2 + 6);
  panel.add(ring);

  return { island, shadow, ring };
}

// ──────────────────────────────────────────────────────────────────────────
// RENDER ELLIPSE MAP — universal cho mọi cấp
// ──────────────────────────────────────────────────────────────────────────
function renderEllipseMap(scene, panel, node, children, page, onClickChild, onBack, onPage) {
  const totalPages = Math.max(1, Math.ceil(children.length / PAGE_MAX));
  const curPage    = Math.max(0, Math.min(page, totalPages - 1));
  const shown      = children.slice(curPage * PAGE_MAX, curPage * PAGE_MAX + PAGE_MAX);
  const positions  = getEllipsePositions(shown.length);

  // ─ Breadcrumb ─
  panel.add(scene.add.text(-235, -356, breadcrumb(node.id), {
    fontFamily: FONT, fontSize: '10.5px', fontStyle: 'bold', color: '#6abcda',
    wordWrap: { width: 470, useAdvancedWrap: true }
  }).setOrigin(0, 0.5));

  // ─ Tên node hiện tại ─
  panel.add(scene.add.text(-235, -332, node.name, {
    fontFamily: FONT, fontSize: '16px', fontStyle: 'bold', color: '#ffe89a',
    stroke: '#030c14', strokeThickness: 3
  }).setOrigin(0, 0.5));

  // ─ Mô tả ngắn ─
  if (node.desc) {
    panel.add(scene.add.text(-235, -311, node.desc, {
      fontFamily: FONT, fontSize: '10px', color: '#7ab8cc', lineSpacing: 2,
      wordWrap: { width: 470, useAdvancedWrap: true }
    }).setOrigin(0, 0));
  }

  // ─ Nền bản đồ ─
  const mapBg = scene.add.rectangle(0, MAP_CY, 490, 556, 0x030b13, 0.97)
    .setStrokeStyle(1.5, 0x142840);
  panel.add(mapBg);

  // ─ Lưới mờ ─
  const grid = scene.add.graphics();
  grid.lineStyle(1, 0x0d2540, 0.45);
  const gx0 = -240, gx1 = 240, gy0 = MAP_CY - 278, gy1 = MAP_CY + 278;
  for (let x = gx0; x <= gx1; x += 48) grid.strokeLineShape(new Phaser.Geom.Line(x, gy0, x, gy1));
  for (let y = gy0; y <= gy1; y += 48) grid.strokeLineShape(new Phaser.Geom.Line(gx0, y, gx1, y));
  panel.add(grid);

  // ─ Zone Islands (PNG 3D) ─
  shown.forEach((child, idx) => {
    const pos = positions[idx];
    if (!pos) return;
    const col       = nodeColor(child);
    const status    = nodeStatus(child);
    const isCurrent = status.includes('HERE');
    const realCy    = pos.cy + MAP_CY;

    // Tạo đảo 3D
    const { island, shadow, ring } = createZoneIsland(scene, panel, pos, col, isCurrent);

    // Hit area trong suốt
    const hit = scene.add.ellipse(pos.cx, realCy, pos.rx * 2 + 8, pos.ry * 2 + 8, 0, 0)
      .setInteractive({ useHandCursor: true });
    panel.add(hit);

    // Font sizes tự động theo kích thước đảo
    const nameFontSize = pos.rx > 115 ? '13px' : pos.rx > 85 ? '11px' : pos.rx > 65 ? '10px' : '9px';
    const typeFontSize = pos.rx > 115 ? '9.5px' : pos.rx > 85 ? '8.5px' : '7.5px';
    const iconFontSize = pos.rx > 115 ? '18px'  : pos.rx > 85 ? '14px'  : pos.rx > 65 ? '12px' : '10px';
    const wrapW = Math.max(50, pos.rx * 2 - 14);

    // Overlay tối phía dưới đảo để text đọc rõ
    const textBg = scene.add.graphics();
    textBg.fillStyle(0x000000, 0.52);
    textBg.fillRoundedRect(
      pos.cx - pos.rx * 0.75, realCy + pos.ry * 0.1,
      pos.rx * 1.5, pos.ry * 0.82, 6
    );
    panel.add(textBg);

    const iconTxt = scene.add.text(pos.cx, realCy - pos.ry * 0.26, col.icon, {
      fontFamily: FONT, fontSize: iconFontSize
    }).setOrigin(0.5);
    panel.add(iconTxt);

    const nameTxt = scene.add.text(pos.cx, realCy + pos.ry * 0.22, child.name, {
      fontFamily: FONT, fontSize: nameFontSize, fontStyle: 'bold',
      color: isCurrent ? '#3dffb3' : '#ffffff',
      stroke: '#000a08', strokeThickness: 3,
      align: 'center', wordWrap: { width: wrapW, useAdvancedWrap: true }
    }).setOrigin(0.5);
    panel.add(nameTxt);

    const typeTxt = scene.add.text(pos.cx, realCy + pos.ry * 0.58, typeText(child), {
      fontFamily: FONT, fontSize: typeFontSize, fontStyle: 'bold',
      color: `#${col.stroke.toString(16).padStart(6, '0')}`,
      stroke: '#000812', strokeThickness: 2, align: 'center'
    }).setOrigin(0.5);
    panel.add(typeTxt);

    // Status badge
    if (status !== '○') {
      panel.add(scene.add.text(pos.cx + pos.rx - 2, realCy - pos.ry + 4, status, {
        fontFamily: FONT, fontSize: '8px', fontStyle: 'bold',
        color: isCurrent ? '#3dffb3' : '#88d8f0',
        stroke: '#000', strokeThickness: 2
      }).setOrigin(1, 0.5));
    }

    // Hover → scale tween 3D island
    hit.on('pointerover', () => {
      if (island.setAlpha) island.setAlpha(1);
      ring.clear();
      ring.lineStyle(3, 0xffffff, 0.9);
      ring.strokeEllipse(pos.cx, realCy, pos.rx * 2 + 10, pos.ry * 2 + 10);
      if (scene.tweens) {
        scene.tweens.add({ targets: [island], scaleX: 1.06, scaleY: 1.06, duration: 120, ease: 'Sine.Out' });
      }
      nameTxt.setColor('#ffffff').setStroke('#001508', 4);
    });
    hit.on('pointerout', () => {
      ring.clear();
      ring.lineStyle(isCurrent ? 3 : 2, isCurrent ? 0x3dffb3 : col.stroke, isCurrent ? 0.9 : 0.55);
      ring.strokeEllipse(pos.cx, realCy, pos.rx * 2 + 6, pos.ry * 2 + 6);
      if (scene.tweens) {
        scene.tweens.add({ targets: [island], scaleX: 1.0, scaleY: 1.0, duration: 120, ease: 'Sine.Out' });
      }
      nameTxt.setColor(isCurrent ? '#3dffb3' : '#ffffff').setStroke('#000a08', 3);
    });
    hit.on('pointerdown', pointer => {
      stopPointer(scene, pointer);
      onClickChild(child);
    });
  });

  // ─ Chú thích đếm items ─
  panel.add(scene.add.text(0, MAP_CY + 278, `${shown.length} khu vực  •  trang ${curPage + 1}/${totalPages}`, {
    fontFamily: FONT, fontSize: '10px', color: '#2a6a88', align: 'center'
  }).setOrigin(0.5));

  // ─ Paging buttons ─
  const btnY = 255;
  if (totalPages > 1) {
    addNavBtn(scene, panel, -120, btnY, 200, 40, '‹ TRANG TRƯỚC',
      () => onPage(curPage - 1), curPage > 0);
    addNavBtn(scene, panel,  120, btnY, 200, 40, 'TRANG SAU ›',
      () => onPage(curPage + 1), curPage < totalPages - 1);
  }

  // ─ Back button ─
  if (node.parentId) {
    addNavBtn(scene, panel, 0, 303, 430, 42, '‹ LÊN CẤP TRƯỚC', () => onBack(node.parentId));
  }
}

// ──────────────────────────────────────────────────────────────────────────
// RENDER LOCATION DETAIL (node lá — có thể dịch chuyển)
// ──────────────────────────────────────────────────────────────────────────
function renderLocationDetail(scene, panel, node, onBack) {
  const col = nodeColor(node);

  // Breadcrumb
  panel.add(scene.add.text(-235, -356, breadcrumb(node.id), {
    fontFamily: FONT, fontSize: '10.5px', fontStyle: 'bold', color: '#6abcda',
    wordWrap: { width: 470, useAdvancedWrap: true }
  }).setOrigin(0, 0.5));

  // Badge loại địa điểm
  const badgeBg = scene.add.rectangle(-165, -326, 160, 26, col.fill, 1)
    .setStrokeStyle(1.5, col.stroke);
  panel.add(badgeBg);
  panel.add(scene.add.text(-165, -326, `${col.icon}  ${typeText(node)}`, {
    fontFamily: FONT, fontSize: '11px', fontStyle: 'bold',
    color: col.text, align: 'center'
  }).setOrigin(0.5));

  // Tên
  panel.add(scene.add.text(-235, -294, node.name, {
    fontFamily: FONT, fontSize: '24px', fontStyle: 'bold',
    color: '#fff5b8', stroke: '#030c14', strokeThickness: 4,
    wordWrap: { width: 470, useAdvancedWrap: true }
  }).setOrigin(0, 0.5));

  // ─ Big Island 3D cho node đơn lẻ ─
  const singlePos = { cx: 0, cy: 0, rx: 200, ry: 90 };
  const isCurr = nodeStatus(node).includes('HERE');
  createZoneIsland(scene, panel, singlePos, col, isCurr);

  // Overlay text bg
  const detailTextBg = scene.add.graphics();
  detailTextBg.fillStyle(0x000000, 0.55);
  detailTextBg.fillRoundedRect(-148, MAP_CY + 8, 296, 68, 8);
  panel.add(detailTextBg);

  // Icon lớn
  panel.add(scene.add.text(0, MAP_CY - 24, col.icon, {
    fontFamily: FONT, fontSize: '38px'
  }).setOrigin(0.5));
  panel.add(scene.add.text(0, MAP_CY + 20, node.name, {
    fontFamily: FONT, fontSize: '16px', fontStyle: 'bold', color: '#ffffff',
    stroke: '#000a08', strokeThickness: 4, align: 'center',
    wordWrap: { width: 370, useAdvancedWrap: true }
  }).setOrigin(0.5));
  panel.add(scene.add.text(0, MAP_CY + 50, typeText(node), {
    fontFamily: FONT, fontSize: '10px', fontStyle: 'bold',
    color: `#${col.stroke.toString(16).padStart(6, '0')}`,
    stroke: '#000', strokeThickness: 2, align: 'center'
  }).setOrigin(0.5));

  // ─ Thông tin chi tiết phía dưới ellipse ─
  const infoLines = [];
  if (node.desc) infoLines.push(node.desc);
  if (node.climate) infoLines.push(`🌤️ ${node.climate}`);
  if (node.capital) infoLines.push(`🏛️ Trung tâm: ${node.capital}`);
  const ep = node.enemyProfile;
  if (ep) infoLines.push(`⚔️ Yêu thú: ${REALMS[ep.minRealmIdx]?.name || 'Phàm'} — ${REALMS[ep.maxRealmIdx]?.name || '?'}`);

  if (infoLines.length) {
    panel.add(scene.add.text(0, MAP_CY + 110, infoLines.join('\n'), {
      fontFamily: FONT, fontSize: '11.5px', color: '#c8eeff',
      lineSpacing: 5, align: 'center',
      wordWrap: { width: 440, useAdvancedWrap: true }
    }).setOrigin(0.5, 0));
  }

  // ─ Nút Dịch Chuyển ─
  const isNonTravel = node.type === 'clan' || node.type === 'guild';
  const map = isNonTravel ? null : getMapById(node.playableMapId ?? node.id);

  if (map) {
    const current   = Number(map.id) === Number(gameState.currentMapId);
    const access    = canEnterMap(map.id, gameState);
    const canGo     = !current && access.ok;

    const label = current
      ? '📍 ĐANG Ở ĐÂY'
      : !access.ok
        ? `🔒 CẦN ${REALMS[access.requiredRealmIdx]?.name ?? 'CẢNH GIỚI CAO HƠN'}`
        : `🌀 DỊCH CHUYỂN ĐẾN ${node.name.toUpperCase()}`;

    addNavBtn(scene, panel, 0, 212, 440, 58, label, () => {
      if (!canGo) return;
      scene.closeModal();
      scene.switchMap(map.id);
      scene.showFloatingText?.(
        scene.player?.x ?? 270,
        (scene.player?.y ?? 620) - 60,
        `Đã đến: ${node.name}`, '#66ffcc'
      );
    }, canGo, {
      fill: canGo ? 0x0c3d28 : 0x181a22,
      stroke: canGo ? 0x38ffaa : 0x405060,
      fontSize: '14px',
      color: canGo ? '#a8ffe8' : '#5a7888'
    });

    panel.add(scene.add.text(0, 252,
      `${map.isPeaceZone ? '🕊️ Khu An Toàn' : '⚔️ Khu Chiến Đấu'}  •  Cần: ${REALMS[map.minRealm]?.name ?? 'Phàm Nhân'}`, {
        fontFamily: FONT, fontSize: '10px', color: '#6898b8', align: 'center'
      }).setOrigin(0.5));
  }

  // ─ Back ─
  if (node.parentId) {
    addNavBtn(scene, panel, 0, 303, 430, 42, '‹ QUAY LẠI', () => onBack(node.parentId));
  }
}

// ──────────────────────────────────────────────────────────────────────────
// NAV BUTTON HELPER
// ──────────────────────────────────────────────────────────────────────────
function addNavBtn(scene, panel, x, y, w, h, label, onPress, enabled = true, opts = {}) {
  const bg = scene.add.rectangle(x, y, w, h,
    enabled ? (opts.fill ?? 0x0c3448) : 0x141e28, 1)
    .setStrokeStyle(1.5, enabled ? (opts.stroke ?? 0x48b8d4) : 0x344050);
  if (enabled) bg.setInteractive({ useHandCursor: true });

  const txt = scene.add.text(x, y, label, {
    fontFamily: FONT, fontSize: opts.fontSize ?? '13px', fontStyle: 'bold',
    color: enabled ? (opts.color ?? '#c8f0ff') : '#48687a',
    align: 'center', wordWrap: { width: w - 18, useAdvancedWrap: true }
  }).setOrigin(0.5);

  if (enabled) {
    bg.on('pointerover', () => bg.setStrokeStyle(2.5, 0xffffff));
    bg.on('pointerout',  () => bg.setStrokeStyle(1.5, opts.stroke ?? 0x48b8d4));
    bg.on('pointerdown', pointer => { stopPointer(scene, pointer); onPress(); });
  }
  panel.add([bg, txt]);
  return bg;
}

// ──────────────────────────────────────────────────────────────────────────
// DISPATCHER — chọn chế độ render phù hợp
// ──────────────────────────────────────────────────────────────────────────
function renderMapUI(scene, panel, node, page, openNode) {
  const children = getWorldChildren(node.id);
  const isLeaf   = node.type === 'location' ||
    (node.type !== 'settlement' && children.length === 0);

  const onClickChild = child => openNode(child.id);
  const onBack       = parentId => openNode(parentId);
  const onPage       = newPage => openNode(node.id, newPage);

  if (isLeaf) {
    renderLocationDetail(scene, panel, node, onBack);
  } else {
    renderEllipseMap(scene, panel, node, children, page, onClickChild, onBack, onPage);
  }
}

// ──────────────────────────────────────────────────────────────────────────
// INSTALL
// ──────────────────────────────────────────────────────────────────────────
export function installWorldMapHierarchyUI(MainGameScene) {
  if (!MainGameScene?.prototype) return;
  const proto = MainGameScene.prototype;
  if (proto.__worldMapHierarchyUiInstalled) return;

  if (proto.__worldMapUiOwner && proto.__worldMapUiOwner !== MAP_UI_OWNER) {
    throw new Error(`World map UI conflict: ${proto.__worldMapUiOwner} vs ${MAP_UI_OWNER}`);
  }
  proto.__worldMapUiOwner = MAP_UI_OWNER;
  proto.__worldMapHierarchyUiInstalled = true;

  proto.openMapPanel = function openHierarchicalWorldMap(
    activeNodeId = HUMAN_REALM_ROOT_ID,
    selectedMapId = null,
    page = 0
  ) {
    ensureWorldProgress(gameState);

    if (selectedMapId != null) {
      const sel = getWorldNodeForMap(selectedMapId);
      if (sel) activeNodeId = sel.id;
    }
    if (LEGACY_TO_ROOT.has(activeNodeId)) activeNodeId = HUMAN_REALM_ROOT_ID;

    let node = getWorldNode(activeNodeId);
    if (!node) node = getWorldNodeForMap(gameState.currentMapId) ?? getWorldNode(HUMAN_REALM_ROOT_ID);

    // ─ Đảm bảo zone texture đã load xong trước khi render ─
    // Nếu chưa sẵn: hiển thị panel "Đang tải bản đồ..." rồi tự động mở lại khi xong
    const scene = this;

    if (!_zoneTexReady && ZONE_TEX_KEYS.some(k => !scene.textures.exists(k))) {
      // Hiển thị panel chờ
      const loadingPanel = scene.createModalShell(
        'ĐẠI BẢN ĐỒ NHÂN GIỚI',
        'Đang tải ảnh bản đồ 3D...',
        { subtitleColor: '#ffdf60', headerFill: 0x040d16, bgFill: 0x020b12 }
      );
      loadingPanel.add(scene.add.text(0, 0, '\u231B  Khởi động hình ảnh khu vực...', {
        fontFamily: FONT, fontSize: '16px', fontStyle: 'bold',
        color: '#ffe89a', align: 'center'
      }).setOrigin(0.5));
      loadingPanel.add(scene.add.text(0, 40, 'Chỉ cần một lần — sẽ tự động vào bản đồ', {
        fontFamily: FONT, fontSize: '12px', color: '#88c8e0', align: 'center'
      }).setOrigin(0.5));

      ensureZoneTextures(scene, () => {
        // Khi load xong: đóng panel chờ, mở lại bản đồ thật
        if (scene.closeModal) scene.closeModal();
        scene.openMapPanel(activeNodeId, null, page);
      });
      return loadingPanel;
    }

    // Texture đã sẵn → render ngước lại
    const panel = scene.createModalShell(
      'ĐẠI BẢN ĐỒ NHÂN GIỚI',
      `${typeText(node)} • ${node.name}`,
      { subtitleColor: '#7ad8ff', headerFill: 0x040d16, bgFill: 0x020b12 }
    );

    const openNode = (nodeId, pg = 0) => scene.openMapPanel(nodeId, null, pg);
    renderMapUI(scene, panel, node, page, openNode);
    return panel;
  };
}
