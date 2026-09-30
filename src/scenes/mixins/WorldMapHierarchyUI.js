/**
 * WorldMapHierarchyUI.js
 * =========================================================================
 * ONE CANONICAL WORLD MAP / MINIMAP UI
 * =========================================================================
 * - Chỉ còn một cây THẾ GIỚI.
 * - Thành Thị / Tông Môn là điểm đến nằm trực tiếp trong đúng lãnh thổ.
 * - Không còn tab, catalog hay travel UI riêng cho Thành Thị / Tông Môn.
 * - Mọi di chuyển vẫn dùng worldRegistry + canEnterMap() + switchMap().
 */
import { REALMS } from '../../config/realmsData.js';
import {
  HUMAN_REALM_ROOT_ID,
  canEnterMap,
  findMapById,
  getWorldBreadcrumb,
  getWorldChildren,
  getWorldNode,
  getWorldNodeForMap
} from '../../config/world/worldRegistry.js?v=20260929-single-map-system-v1';
import { gameState } from '../../state/gameState.js';
import { ensureWorldProgress, hasVisitedMap, isNodeDiscovered } from '../../state/worldProgress.js';
import { stopPointer } from './UiModalManager.js';

const FONT = 'Be Vietnam Pro, sans-serif';
const MAP_UI_OWNER = 'WorldMapHierarchyUI';
const LEGACY_TO_ROOT = new Set(['nam_lang', 'van_tinh_hai', 'than_chau', 'man_hoang', 'thai_hu']);
const HIERARCHY_PAGE_SIZE = 8;
const DIRECT_MAP_NODE_TYPES = new Set([
  'province',
  'location',
  'city_territory',
  'settlement',
  'sect',
  'peak',
  'hall'
]);

const COLOR = Object.freeze({
  panel: 0x020b12,
  panel2: 0x061622,
  panel3: 0x0a2230,
  cyan: 0x48c8e8,
  green: 0x38ffaa,
  gold: 0xffcc55,
  purple: 0xb27aff,
  muted: 0x365267
});

function sameMapId(a, b) {
  return String(a) === String(b);
}

function isCityMap(map) {
  return map?.uiMode === 'city_hub' || map?.type === 'safe_city';
}

function isSectMap(map) {
  return map?.uiMode === 'sect_hub' || map?.type === 'safe_sect';
}

function typeText(node) {
  const labels = {
    realm: 'NHÂN GIỚI',
    continent: 'ĐẠI LỤC',
    great_region: 'ĐẠI VỰC',
    province: 'LÃNH THỔ',
    nation: 'QUỐC GIA',
    commandery: 'QUẬN',
    city_territory: 'THÀNH VỰC',
    settlement: 'THÔN',
    sect: 'TÔNG MÔN',
    peak: 'SƠN PHONG',
    hall: 'ĐIỆN',
    location: 'ĐỊA ĐIỂM'
  };
  const loc = {
    safe_hub: 'AN TOÀN',
    major_hub: 'THÀNH THỊ',
    field: 'HOANG DÃ',
    secret_realm: 'BÍ CẢNH',
    prov_wild: 'HOANG DÃ',
    prov_secret: 'BÍ CẢNH',
    nat_wild: 'BIÊN HOANG',
    nat_secret: 'BÍ CẢNH',
    forbidden_zone: 'CẤM ĐỊA',
    town: 'TRẤN',
    resource: 'TÀI NGUYÊN',
    dungeon: 'PHÓ BẢN',
    market: 'PHƯỜNG THỊ'
  };

  if (node?.displayTypeLabel) return node.displayTypeLabel;
  if (node?.type === 'location' && node.locationKind) return loc[node.locationKind] || 'ĐỊA ĐIỂM';
  return labels[node?.type] || String(node?.type || 'KHU VỰC').toUpperCase();
}

function breadcrumb(nodeId) {
  return getWorldBreadcrumb(nodeId).map(node => node.name).join(' › ');
}

function resolveNodeMap(node) {
  if (!node || node.type === 'clan' || node.type === 'guild') return null;

  // Không biến các node điều hướng như Realm / Đại Lục / Đại Vực thành map runtime.
  // Chỉ resolve các node thực sự có map hoặc các lãnh thổ được materialize.
  if (node.playableMapId != null) return findMapById(node.playableMapId);
  if (!DIRECT_MAP_NODE_TYPES.has(node.type) && node.materialized !== true) return null;
  return findMapById(node.id);
}

function stripTerritorySuffix(name) {
  return String(name || '').replace(/\s+(Châu|Đạo|Lĩnh|Phủ)$/u, '').trim();
}

function destinationMeta(node, map) {
  const base = stripTerritorySuffix(node?.name || map?.name || 'Linh');

  if (isCityMap(map)) {
    return {
      kind: 'city',
      icon: '🏙️',
      label: 'THÀNH THỊ',
      accent: COLOR.gold,
      name: node?.capital || map?.worldPath?.city || `${base} Đại Thành`,
      desc: `Thành thị trung tâm của ${node?.name || map?.name}.`
    };
  }

  if (isSectMap(map)) {
    const mapName = String(map?.name || '');
    const explicit = /Tông|Môn|Phái|Cung|Điện|Các|Sơn Trang/u.test(mapName) ? mapName : null;
    return {
      kind: 'sect',
      icon: '🏯',
      label: 'TÔNG MÔN',
      accent: COLOR.purple,
      name: explicit || `${base} Tông Môn`,
      desc: `Sơn môn tu hành trọng yếu nằm trong ${node?.name || map?.name}.`
    };
  }

  if (map?.isPeaceZone) {
    return {
      kind: 'hub',
      icon: '🏠',
      label: 'KHU AN TOÀN',
      accent: COLOR.green,
      name: node?.name || map?.name,
      desc: node?.desc || map?.sub || ''
    };
  }

  return {
    kind: 'field',
    icon: '⚔️',
    label: 'KHU VỰC',
    accent: COLOR.cyan,
    name: node?.name || map?.name,
    desc: node?.desc || map?.sub || ''
  };
}

function nodeStatus(node) {
  const map = resolveNodeMap(node);
  if (map) {
    if (sameMapId(map.id, gameState.currentMapId)) return '📍 ĐANG Ở ĐÂY';
    if (hasVisitedMap(gameState, map.id)) return '✓ ĐÃ ĐẾN';
    return '○ CHƯA ĐẾN';
  }
  return isNodeDiscovered(gameState, node.id) ? '✓ ĐÃ MỞ' : '○ CHƯA KHÁM PHÁ';
}

function addButton(scene, panel, x, y, w, h, label, onPress, enabled = true, options = {}) {
  const fill = enabled ? (options.fill ?? COLOR.panel3) : 0x151d24;
  const stroke = enabled ? (options.stroke ?? COLOR.cyan) : COLOR.muted;
  const bg = scene.add.rectangle(x, y, w, h, fill, options.alpha ?? 1)
    .setStrokeStyle(options.lineWidth ?? 1.5, stroke);
  const txt = scene.add.text(x, y, label, {
    fontFamily: FONT,
    fontSize: options.fontSize ?? '12px',
    fontStyle: options.bold === false ? 'normal' : 'bold',
    color: enabled ? (options.color ?? '#d7f7ff') : '#577080',
    align: 'center',
    wordWrap: { width: Math.max(20, w - 14), useAdvancedWrap: true }
  }).setOrigin(0.5);

  if (enabled) {
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => bg.setStrokeStyle(2.5, options.hoverStroke ?? 0xffffff));
    bg.on('pointerout', () => bg.setStrokeStyle(options.lineWidth ?? 1.5, stroke));
    bg.on('pointerdown', pointer => {
      stopPointer(scene, pointer);
      onPress?.();
    });
  }

  panel.add([bg, txt]);
  return bg;
}

function addPageControls(scene, panel, page, totalPages, y, onPage) {
  if (totalPages <= 1) return;
  addButton(scene, panel, -125, y, 205, 40, '‹ TRANG TRƯỚC', () => onPage(page - 1), page > 0);
  addButton(scene, panel, 125, y, 205, 40, 'TRANG SAU ›', () => onPage(page + 1), page < totalPages - 1);
  panel.add(scene.add.text(0, y + 31, `${page + 1}/${totalPages}`, {
    fontFamily: FONT,
    fontSize: '9px',
    color: '#7094a8'
  }).setOrigin(0.5));
}

function travelTo(scene, map, displayName) {
  const access = canEnterMap(map.id, gameState);
  if (!access.ok || sameMapId(map.id, gameState.currentMapId)) return;

  scene.closeModal?.();
  scene.switchMap(map.id);
  scene.showFloatingText?.(
    scene.player?.x ?? 270,
    (scene.player?.y ?? 620) - 60,
    `Đã đến: ${displayName || map.name}`,
    '#66ffcc'
  );
}

function travelLabel(map, meta) {
  if (sameMapId(map.id, gameState.currentMapId)) return '📍 ĐANG Ở ĐÂY';
  const access = canEnterMap(map.id, gameState);
  if (!access.ok) return `🔒 ${REALMS[access.requiredRealmIdx]?.name ?? 'CHƯA ĐỦ CẢNH GIỚI'}`;
  if (meta.kind === 'city') return '🌀 ĐẾN THÀNH THỊ';
  if (meta.kind === 'sect') return '🌀 ĐẾN TÔNG MÔN';
  return '🌀 DI CHUYỂN';
}

function addTravelButton(scene, panel, x, y, map, meta, width = 185, height = 38) {
  const current = sameMapId(map.id, gameState.currentMapId);
  const access = canEnterMap(map.id, gameState);
  const canGo = !current && access.ok;
  return addButton(
    scene,
    panel,
    x,
    y,
    width,
    height,
    travelLabel(map, meta),
    () => travelTo(scene, map, meta.name),
    canGo,
    {
      fill: canGo ? 0x0c3d28 : 0x171d22,
      stroke: canGo ? COLOR.green : COLOR.muted,
      color: canGo ? '#a8ffe8' : '#607884',
      fontSize: '10px'
    }
  );
}

function renderWorldHeader(scene, panel, node) {
  panel.add(scene.add.text(-238, -294, breadcrumb(node.id), {
    fontFamily: FONT,
    fontSize: '9.5px',
    fontStyle: 'bold',
    color: '#69bddc',
    wordWrap: { width: 476, useAdvancedWrap: true }
  }).setOrigin(0, 0.5));

  panel.add(scene.add.text(-238, -268, node.name, {
    fontFamily: FONT,
    fontSize: '19px',
    fontStyle: 'bold',
    color: '#fff2b0',
    stroke: '#02080c',
    strokeThickness: 3,
    wordWrap: { width: 476, useAdvancedWrap: true }
  }).setOrigin(0, 0.5));

  panel.add(scene.add.text(-238, -242, `${typeText(node)}  •  ${nodeStatus(node)}`, {
    fontFamily: FONT,
    fontSize: '10px',
    color: '#8eb7c8'
  }).setOrigin(0, 0.5));
}

function renderInlineDestination(scene, panel, node, map) {
  const meta = destinationMeta(node, map);
  const current = sameMapId(map.id, gameState.currentMapId);
  const box = scene.add.rectangle(0, -198, 470, 58, COLOR.panel2, 0.98)
    .setStrokeStyle(current ? 2.5 : 1.5, current ? COLOR.green : meta.accent);
  panel.add(box);

  panel.add(scene.add.text(-218, -209, `${meta.icon} ${meta.label} • ${meta.name}`, {
    fontFamily: FONT,
    fontSize: '10px',
    fontStyle: 'bold',
    color: current ? '#74ffd1' : meta.kind === 'city' ? '#ffe28a' : meta.kind === 'sect' ? '#ddc3ff' : '#d7f7ff',
    wordWrap: { width: 286, useAdvancedWrap: true }
  }).setOrigin(0, 0.5));

  panel.add(scene.add.text(-218, -187, meta.kind === 'city'
    ? `Trung tâm của ${node.name}`
    : meta.kind === 'sect'
      ? `Sơn môn tại ${node.name}`
      : 'Điểm đến trực tiếp của khu vực', {
      fontFamily: FONT,
      fontSize: '8px',
      color: '#789daf',
      wordWrap: { width: 280, useAdvancedWrap: true }
    }).setOrigin(0, 0.5));

  addTravelButton(scene, panel, 169, -198, map, meta, 128, 34);
}

function renderDestinationDetail(scene, panel, node, map, openNode) {
  const meta = destinationMeta(node, map);
  const access = canEnterMap(map.id, gameState);
  const required = REALMS[map.minRealm]?.name ?? REALMS[access.requiredRealmIdx]?.name ?? 'Phàm Nhân';
  const box = scene.add.rectangle(0, -32, 470, 382, COLOR.panel2, 0.98).setStrokeStyle(2.4, meta.accent);
  panel.add(box);

  panel.add(scene.add.text(0, -174, `${meta.icon}  ${meta.label}`, {
    fontFamily: FONT,
    fontSize: '12px',
    fontStyle: 'bold',
    color: meta.kind === 'city' ? '#ffe28a' : meta.kind === 'sect' ? '#ddc3ff' : '#bcefff'
  }).setOrigin(0.5));

  panel.add(scene.add.text(0, -135, meta.name, {
    fontFamily: FONT,
    fontSize: '22px',
    fontStyle: 'bold',
    color: '#ffffff',
    align: 'center',
    stroke: '#02080c',
    strokeThickness: 3,
    wordWrap: { width: 420, useAdvancedWrap: true }
  }).setOrigin(0.5));

  panel.add(scene.add.text(0, -91, `Thuộc: ${node.name}`, {
    fontFamily: FONT,
    fontSize: '10px',
    fontStyle: 'bold',
    color: '#8fcde1'
  }).setOrigin(0.5));

  panel.add(scene.add.text(0, -63, meta.desc, {
    fontFamily: FONT,
    fontSize: '10.5px',
    color: '#b9d9e5',
    align: 'center',
    lineSpacing: 3,
    wordWrap: { width: 410, useAdvancedWrap: true }
  }).setOrigin(0.5, 0));

  const extra = [];
  if (meta.kind === 'city' && Array.isArray(node.notableCities) && node.notableCities.length) {
    extra.push(`🏘️ Đô thị lân cận: ${node.notableCities.slice(0, 2).join(' • ')}`);
  }
  if (meta.kind === 'sect') extra.push('☯ Sơn môn an toàn, mở đúng giao diện Tông Môn khi đến nơi.');

  if (extra.length) {
    panel.add(scene.add.text(0, 25, extra.join('\n'), {
      fontFamily: FONT,
      fontSize: '9.5px',
      color: '#8fb5c6',
      align: 'center',
      lineSpacing: 3,
      wordWrap: { width: 410, useAdvancedWrap: true }
    }).setOrigin(0.5));
  }

  panel.add(scene.add.text(0, 79, `${map.isPeaceZone ? '🕊️ Khu An Toàn' : '⚔️ Khu Chiến Đấu'}  •  Cần: ${required}`, {
    fontFamily: FONT,
    fontSize: '10px',
    color: '#78aabd',
    align: 'center'
  }).setOrigin(0.5));

  addTravelButton(scene, panel, 0, 132, map, meta, 420, 52);
  if (node.parentId) {
    addButton(scene, panel, 0, 255, 430, 42, '‹ QUAY LẠI THẾ GIỚI', () => openNode(node.parentId, 0));
  }
}

function renderHierarchy(scene, panel, node, page, openNode) {
  const children = getWorldChildren(node.id);
  const map = resolveNodeMap(node);
  const isLeaf = node.type === 'location' || (children.length === 0 && !!map);
  renderWorldHeader(scene, panel, node);

  if (isLeaf && map) {
    renderDestinationDetail(scene, panel, node, map, openNode);
    return;
  }

  const hasInlineDestination = !!map;
  if (hasInlineDestination) renderInlineDestination(scene, panel, node, map);

  const totalPages = Math.max(1, Math.ceil(children.length / HIERARCHY_PAGE_SIZE));
  const safePage = Math.max(0, Math.min(page, totalPages - 1));
  const shown = children.slice(
    safePage * HIERARCHY_PAGE_SIZE,
    safePage * HIERARCHY_PAGE_SIZE + HIERARCHY_PAGE_SIZE
  );
  const startY = hasInlineDestination ? -132 : -176;
  const rowGap = hasInlineDestination ? 82 : 93;

  shown.forEach((child, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = col === 0 ? -119 : 119;
    const y = startY + row * rowGap;
    const childMap = resolveNodeMap(child);
    const meta = childMap ? destinationMeta(child, childMap) : null;
    const current = childMap && sameMapId(childMap.id, gameState.currentMapId);
    const stroke = current ? COLOR.green : (meta?.accent ?? COLOR.cyan);
    const cardHeight = hasInlineDestination ? 72 : 82;

    const card = scene.add.rectangle(x, y, 226, cardHeight, COLOR.panel2, 0.98)
      .setStrokeStyle(current ? 2.5 : 1.3, stroke);
    card.setInteractive({ useHandCursor: true });
    card.on('pointerdown', pointer => {
      stopPointer(scene, pointer);
      openNode(child.id, 0);
    });
    panel.add(card);

    panel.add(scene.add.text(x - 101, y - 23, child.name, {
      fontFamily: FONT,
      fontSize: '10.5px',
      fontStyle: 'bold',
      color: current ? '#74ffd1' : '#f2fbff',
      wordWrap: { width: 195, useAdvancedWrap: true }
    }).setOrigin(0, 0.5));

    const locationLine = meta && (meta.kind === 'city' || meta.kind === 'sect')
      ? `${meta.icon} ${meta.label}: ${meta.name}`
      : typeText(child);
    panel.add(scene.add.text(x - 101, y + 1, locationLine, {
      fontFamily: FONT,
      fontSize: meta?.kind === 'city' || meta?.kind === 'sect' ? '8px' : '8.5px',
      color: meta?.kind === 'city' ? '#ffd978' : meta?.kind === 'sect' ? '#d6b5ff' : '#72a4b9',
      wordWrap: { width: 195, useAdvancedWrap: true }
    }).setOrigin(0, 0.5));

    panel.add(scene.add.text(x - 101, y + 25, nodeStatus(child), {
      fontFamily: FONT,
      fontSize: '8px',
      color: current ? '#74ffd1' : '#8bb8ca'
    }).setOrigin(0, 0.5));
  });

  addPageControls(scene, panel, safePage, totalPages, 218, newPage => openNode(node.id, newPage));
  if (node.parentId) {
    addButton(scene, panel, 0, 280, 430, 40, '‹ LÊN CẤP TRƯỚC', () => openNode(node.parentId, 0));
  }
}

function resolveSelectedWorldNode(selectedMapId) {
  if (selectedMapId == null) return null;

  const directNode = getWorldNode(String(selectedMapId));
  if (directNode) return directNode;

  const indexedNode = getWorldNodeForMap(selectedMapId);
  if (indexedNode) return indexedNode;

  const map = findMapById(selectedMapId);
  const nodeId = map?.locationNodeId || map?.geography?.nodeId || map?.worldPath?.nodeId;
  return nodeId ? getWorldNode(nodeId) : null;
}

export function installWorldMapHierarchyUI(MainGameScene) {
  if (!MainGameScene?.prototype) return;
  const proto = MainGameScene.prototype;
  if (proto.__worldMapHierarchyUiInstalled) return;

  if (proto.__worldMapUiOwner && proto.__worldMapUiOwner !== MAP_UI_OWNER) {
    throw new Error(`World map UI conflict: ${proto.__worldMapUiOwner} vs ${MAP_UI_OWNER}`);
  }

  proto.__worldMapUiOwner = MAP_UI_OWNER;
  proto.__worldMapHierarchyUiInstalled = true;

  // Giữ signature 3 tham số canonical. Nếu code cũ còn truyền viewMode thứ 4,
  // JavaScript sẽ tự bỏ qua; không còn nhánh Thành Thị/Tông Môn riêng nào chạy.
  proto.openMapPanel = function openUnifiedWorldMap(
    activeNodeId = HUMAN_REALM_ROOT_ID,
    selectedMapId = null,
    page = 0
  ) {
    ensureWorldProgress(gameState);
    const scene = this;

    if (LEGACY_TO_ROOT.has(activeNodeId)) activeNodeId = HUMAN_REALM_ROOT_ID;

    const selectedNode = resolveSelectedWorldNode(selectedMapId);
    if (selectedNode) activeNodeId = selectedNode.id;

    let node = getWorldNode(activeNodeId);
    if (!node) {
      node = resolveSelectedWorldNode(gameState.currentMapId) || getWorldNode(HUMAN_REALM_ROOT_ID);
    }

    const panel = scene.createModalShell(
      'ĐẠI BẢN ĐỒ NHÂN GIỚI',
      `${typeText(node)} • ${node.name}`,
      { subtitleColor: '#7ad8ff', headerFill: 0x040d16, bgFill: COLOR.panel }
    );

    const openWorldNode = (nodeId, nextPage = 0) => scene.openMapPanel(nodeId, null, nextPage);
    renderHierarchy(scene, panel, node, page, openWorldNode);
    return panel;
  };
}
