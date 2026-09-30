/**
 * WorldMapHierarchyUI.js
 * =========================================================================
 * SINGLE WORLD MAP / MINIMAP UI OWNER
 * =========================================================================
 * Hoàn thiện trên đúng hệ thống bản đồ hiện có:
 *  - Một openMapPanel() duy nhất.
 *  - Một worldRegistry duy nhất.
 *  - Một switchMap() duy nhất từ WorldMapRuntime.
 *  - Không tạo hệ thống travel/map thứ hai.
 *
 * MINIMAP có 3 chế độ hiển thị trong cùng panel:
 *  1) THẾ GIỚI  : duyệt cây Nhân Giới như trước.
 *  2) THÀNH THỊ : danh sách nhanh toàn bộ runtime map CITY_HUB.
 *  3) TÔNG MÔN  : danh sách nhanh toàn bộ runtime map SECT_HUB.
 *
 * Các map thành thị/tông môn mới được lấy động từ registry nên khi atlas/manifest
 * cập nhật, MINIMAP tự nhận mà không hard-code từng map.
 */
import { REALMS } from '../../config/realmsData.js';
import {
  ALL_PLAYABLE_MAPS,
  HUMAN_REALM_ROOT_ID,
  canEnterMap,
  findMapById,
  getAllWorldNodes,
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

const VIEW_WORLD = 'world';
const VIEW_CITY = 'city';
const VIEW_SECT = 'sect';
const HIERARCHY_PAGE_SIZE = 8;
const TRAVEL_PAGE_SIZE = 6;

const COLOR = Object.freeze({
  panel: 0x020b12,
  panel2: 0x061622,
  panel3: 0x0a2230,
  line: 0x24506a,
  cyan: 0x48c8e8,
  green: 0x38ffaa,
  gold: 0xffcc55,
  purple: 0xb27aff,
  red: 0xff6f6f,
  muted: 0x365267
});

function sameMapId(a, b) {
  return String(a) === String(b);
}

function mapTypeIcon(map) {
  if (map?.uiMode === 'city_hub' || map?.type === 'safe_city') return '🏙️';
  if (map?.uiMode === 'sect_hub' || map?.type === 'safe_sect') return '🏯';
  if (map?.isPeaceZone) return '🏠';
  return '⚔️';
}

function typeText(node) {
  const typeLabels = {
    realm: 'NHÂN GIỚI',
    continent: 'ĐẠI LỤC',
    great_region: 'ĐẠI VỰC',
    province: 'CHÂU',
    nation: 'QUỐC GIA',
    commandery: 'QUẬN',
    city_territory: 'THÀNH VỰC',
    settlement: 'THÔN',
    sect: 'TÔNG MÔN',
    peak: 'SƠN PHONG',
    hall: 'ĐIỆN',
    location: 'ĐỊA ĐIỂM'
  };
  const locLabels = {
    safe_hub: 'AN TOÀN',
    major_hub: 'ĐẠI THÀNH',
    field: 'HOANG DÃ',
    secret_realm: 'BÍ CẢNH',
    prov_wild: 'HOANG DÃ CHÂU',
    prov_secret: 'BÍ CẢNH CHÂU',
    nat_wild: 'BIÊN HOANG',
    nat_secret: 'BÍ CẢNH QUỐC',
    forbidden_zone: 'CẤM ĐỊA',
    town: 'TRẤN',
    resource: 'TÀI NGUYÊN',
    dungeon: 'PHÓ BẢN',
    market: 'PHƯỜNG THỊ'
  };

  if (node?.displayTypeLabel) return node.displayTypeLabel;
  if (node?.type === 'location' && node.locationKind) return locLabels[node.locationKind] || 'ĐỊA ĐIỂM';
  return typeLabels[node?.type] || String(node?.type || 'KHU VỰC').toUpperCase();
}

function breadcrumb(nodeId) {
  return getWorldBreadcrumb(nodeId).map(node => node.name).join(' › ');
}

function resolveNodeMap(node) {
  if (!node || node.type === 'clan' || node.type === 'guild') return null;
  return findMapById(node.playableMapId ?? node.id);
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

function isCityMap(map) {
  return map?.uiMode === 'city_hub' || map?.type === 'safe_city';
}

function isSectMap(map) {
  return map?.uiMode === 'sect_hub' || map?.type === 'safe_sect';
}

function isCityNode(node) {
  return node?.type === 'city_territory' || node?.locationKind === 'major_hub';
}

function isSectNode(node) {
  return node?.type === 'sect' || node?.type === 'peak' || node?.type === 'hall' || node?.locationKind === 'sect_hub';
}

function buildTravelCatalog(mode) {
  const wantCity = mode === VIEW_CITY;
  const rows = new Map();

  const put = (map, node = null) => {
    if (!map) return;
    const matches = wantCity ? isCityMap(map) : isSectMap(map);
    if (!matches) return;
    const key = String(map.id);
    const previous = rows.get(key);
    rows.set(key, {
      map,
      node: node || previous?.node || null,
      name: node?.name || previous?.name || map.name,
      typeLabel: wantCity ? 'THÀNH THỊ' : 'TÔNG MÔN'
    });
  };

  for (const map of ALL_PLAYABLE_MAPS) put(map, null);

  for (const node of getAllWorldNodes()) {
    const candidate = wantCity ? isCityNode(node) : isSectNode(node);
    if (!candidate) continue;
    put(resolveNodeMap(node), node);
  }

  return [...rows.values()].sort((a, b) => {
    const aHere = sameMapId(a.map.id, gameState.currentMapId) ? 0 : 1;
    const bHere = sameMapId(b.map.id, gameState.currentMapId) ? 0 : 1;
    if (aHere !== bHere) return aHere - bHere;
    return String(a.name).localeCompare(String(b.name), 'vi');
  });
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

function addHeaderTabs(scene, panel, activeMode, openMode) {
  const tabs = [
    { mode: VIEW_WORLD, label: '🌍 THẾ GIỚI', color: COLOR.cyan },
    { mode: VIEW_CITY, label: '🏙️ THÀNH THỊ', color: COLOR.gold },
    { mode: VIEW_SECT, label: '🏯 TÔNG MÔN', color: COLOR.purple }
  ];

  tabs.forEach((tab, index) => {
    const active = tab.mode === activeMode;
    addButton(
      scene,
      panel,
      -160 + index * 160,
      -300,
      148,
      42,
      tab.label,
      () => openMode(tab.mode),
      true,
      {
        fill: active ? 0x12354a : 0x071722,
        stroke: active ? tab.color : 0x25495c,
        color: active ? '#ffffff' : '#86a9b8',
        lineWidth: active ? 2.5 : 1.2,
        fontSize: '11px'
      }
    );
  });
}

function addPageControls(scene, panel, page, totalPages, y, onPage) {
  if (totalPages <= 1) return;
  addButton(scene, panel, -125, y, 205, 40, '‹ TRANG TRƯỚC', () => onPage(page - 1), page > 0);
  addButton(scene, panel, 125, y, 205, 40, 'TRANG SAU ›', () => onPage(page + 1), page < totalPages - 1);
  panel.add(scene.add.text(0, y + 31, `${page + 1}/${totalPages}`, {
    fontFamily: FONT, fontSize: '9px', color: '#7094a8'
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

function addTravelButton(scene, panel, x, y, map, displayName, width = 185, height = 38) {
  const current = sameMapId(map.id, gameState.currentMapId);
  const access = canEnterMap(map.id, gameState);
  const canGo = !current && access.ok;
  const label = current
    ? '📍 ĐANG Ở ĐÂY'
    : !access.ok
      ? `🔒 ${REALMS[access.requiredRealmIdx]?.name ?? 'CHƯA ĐỦ CẢNH GIỚI'}`
      : '🌀 DI CHUYỂN';

  return addButton(scene, panel, x, y, width, height, label,
    () => travelTo(scene, map, displayName),
    canGo,
    {
      fill: canGo ? 0x0c3d28 : 0x171d22,
      stroke: canGo ? COLOR.green : COLOR.muted,
      color: canGo ? '#a8ffe8' : '#607884',
      fontSize: '10px'
    });
}

function renderHierarchy(scene, panel, node, page, openNode) {
  const children = getWorldChildren(node.id);
  const map = resolveNodeMap(node);
  const isLeaf = node.type === 'location' || (children.length === 0 && !!map);

  panel.add(scene.add.text(-238, -262, breadcrumb(node.id), {
    fontFamily: FONT, fontSize: '9.5px', fontStyle: 'bold', color: '#69bddc',
    wordWrap: { width: 476, useAdvancedWrap: true }
  }).setOrigin(0, 0.5));

  panel.add(scene.add.text(-238, -236, node.name, {
    fontFamily: FONT, fontSize: '19px', fontStyle: 'bold', color: '#fff2b0',
    stroke: '#02080c', strokeThickness: 3,
    wordWrap: { width: 476, useAdvancedWrap: true }
  }).setOrigin(0, 0.5));

  panel.add(scene.add.text(-238, -211, `${typeText(node)}  •  ${nodeStatus(node)}`, {
    fontFamily: FONT, fontSize: '10px', color: '#8eb7c8'
  }).setOrigin(0, 0.5));

  if (isLeaf) {
    const col = map?.uiMode === 'city_hub' ? COLOR.gold : map?.uiMode === 'sect_hub' ? COLOR.purple : COLOR.cyan;
    const box = scene.add.rectangle(0, -15, 470, 340, COLOR.panel2, 0.98).setStrokeStyle(2, col);
    panel.add(box);
    panel.add(scene.add.text(0, -118, `${mapTypeIcon(map)}  ${node.name}`, {
      fontFamily: FONT, fontSize: '24px', fontStyle: 'bold', color: '#ffffff',
      align: 'center', wordWrap: { width: 420, useAdvancedWrap: true }
    }).setOrigin(0.5));

    if (node.desc || map?.sub) {
      panel.add(scene.add.text(0, -58, node.desc || map.sub, {
        fontFamily: FONT, fontSize: '11px', color: '#b9d9e5', align: 'center', lineSpacing: 4,
        wordWrap: { width: 410, useAdvancedWrap: true }
      }).setOrigin(0.5, 0));
    }

    if (map) {
      const required = REALMS[map.minRealm]?.name ?? 'Phàm Nhân';
      panel.add(scene.add.text(0, 75,
        `${map.isPeaceZone ? '🕊️ Khu An Toàn' : '⚔️ Khu Chiến Đấu'}  •  Cần: ${required}`, {
          fontFamily: FONT, fontSize: '11px', color: '#87b6ca', align: 'center'
        }).setOrigin(0.5));
      addTravelButton(scene, panel, 0, 132, map, node.name, 420, 54);
    }

    if (node.parentId) {
      addButton(scene, panel, 0, 246, 430, 42, '‹ QUAY LẠI', () => openNode(node.parentId, 0));
    }
    return;
  }

  const totalPages = Math.max(1, Math.ceil(children.length / HIERARCHY_PAGE_SIZE));
  const safePage = Math.max(0, Math.min(page, totalPages - 1));
  const shown = children.slice(safePage * HIERARCHY_PAGE_SIZE, safePage * HIERARCHY_PAGE_SIZE + HIERARCHY_PAGE_SIZE);

  const startY = -166;
  shown.forEach((child, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = col === 0 ? -119 : 119;
    const y = startY + row * 93;
    const childMap = resolveNodeMap(child);
    const current = childMap && sameMapId(childMap.id, gameState.currentMapId);
    const stroke = current ? COLOR.green : (childMap?.uiMode === 'city_hub' ? COLOR.gold : childMap?.uiMode === 'sect_hub' ? COLOR.purple : COLOR.cyan);

    const card = scene.add.rectangle(x, y, 226, 82, COLOR.panel2, 0.98).setStrokeStyle(current ? 2.5 : 1.3, stroke);
    card.setInteractive({ useHandCursor: true });
    card.on('pointerdown', pointer => {
      stopPointer(scene, pointer);
      openNode(child.id, 0);
    });
    panel.add(card);

    panel.add(scene.add.text(x - 101, y - 24, `${childMap ? mapTypeIcon(childMap) : '📍'} ${child.name}`, {
      fontFamily: FONT, fontSize: '11px', fontStyle: 'bold', color: current ? '#74ffd1' : '#f2fbff',
      wordWrap: { width: 194, useAdvancedWrap: true }
    }).setOrigin(0, 0.5));
    panel.add(scene.add.text(x - 101, y + 2, typeText(child), {
      fontFamily: FONT, fontSize: '8.5px', color: '#72a4b9'
    }).setOrigin(0, 0.5));
    panel.add(scene.add.text(x - 101, y + 24, nodeStatus(child), {
      fontFamily: FONT, fontSize: '8.5px', color: current ? '#74ffd1' : '#8bb8ca'
    }).setOrigin(0, 0.5));
  });

  addPageControls(scene, panel, safePage, totalPages, 222, newPage => openNode(node.id, newPage));
  if (node.parentId) {
    addButton(scene, panel, 0, 282, 430, 40, '‹ LÊN CẤP TRƯỚC', () => openNode(node.parentId, 0));
  }
}

function renderTravelCatalog(scene, panel, mode, page, openMode) {
  const isCity = mode === VIEW_CITY;
  const catalog = buildTravelCatalog(mode);
  const totalPages = Math.max(1, Math.ceil(catalog.length / TRAVEL_PAGE_SIZE));
  const safePage = Math.max(0, Math.min(page, totalPages - 1));
  const shown = catalog.slice(safePage * TRAVEL_PAGE_SIZE, safePage * TRAVEL_PAGE_SIZE + TRAVEL_PAGE_SIZE);
  const accent = isCity ? COLOR.gold : COLOR.purple;

  panel.add(scene.add.text(-238, -258,
    isCity ? 'TOÀN BỘ BẢN ĐỒ THÀNH THỊ' : 'TOÀN BỘ BẢN ĐỒ TÔNG MÔN', {
      fontFamily: FONT, fontSize: '17px', fontStyle: 'bold', color: isCity ? '#ffe28a' : '#ddc3ff'
    }).setOrigin(0, 0.5));

  panel.add(scene.add.text(-238, -232,
    `${catalog.length} địa điểm • dùng chung worldRegistry + switchMap`, {
      fontFamily: FONT, fontSize: '9.5px', color: '#729caf'
    }).setOrigin(0, 0.5));

  if (shown.length === 0) {
    panel.add(scene.add.text(0, 0,
      isCity ? 'Chưa có map Thành Thị trong registry.' : 'Chưa có map Tông Môn trong registry.', {
        fontFamily: FONT, fontSize: '14px', color: '#8aa8b6', align: 'center'
      }).setOrigin(0.5));
    return;
  }

  shown.forEach((entry, index) => {
    const { map, node, name } = entry;
    const y = -178 + index * 73;
    const current = sameMapId(map.id, gameState.currentMapId);
    const access = canEnterMap(map.id, gameState);
    const visited = hasVisitedMap(gameState, map.id);
    const card = scene.add.rectangle(0, y, 470, 64, COLOR.panel2, 0.98)
      .setStrokeStyle(current ? 2.5 : 1.2, current ? COLOR.green : accent);
    panel.add(card);

    panel.add(scene.add.text(-218, y - 15, `${isCity ? '🏙️' : '🏯'}  ${name}`, {
      fontFamily: FONT, fontSize: '12px', fontStyle: 'bold', color: current ? '#72ffd0' : '#f5fbff',
      wordWrap: { width: 255, useAdvancedWrap: true }
    }).setOrigin(0, 0.5));

    const path = node ? breadcrumb(node.id) : (map.sub || map.worldPath?.province || 'Nhân Giới');
    panel.add(scene.add.text(-218, y + 13, path, {
      fontFamily: FONT, fontSize: '8px', color: '#7296a8',
      wordWrap: { width: 255, useAdvancedWrap: true }
    }).setOrigin(0, 0.5));

    const status = current
      ? '📍 Hiện tại'
      : !access.ok
        ? `🔒 ${REALMS[access.requiredRealmIdx]?.name ?? 'Khóa'}`
        : visited ? '✓ Đã mở' : '○ Có thể đến';
    panel.add(scene.add.text(82, y - 14, status, {
      fontFamily: FONT, fontSize: '8.5px', color: current ? '#72ffd0' : access.ok ? '#9bcada' : '#d98c8c'
    }).setOrigin(0, 0.5));

    addTravelButton(scene, panel, 150, y + 13, map, name, 132, 29);
  });

  addPageControls(scene, panel, safePage, totalPages, 276, newPage => openMode(mode, newPage));
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

  proto.openMapPanel = function openUnifiedWorldMap(
    activeNodeId = HUMAN_REALM_ROOT_ID,
    selectedMapId = null,
    page = 0,
    viewMode = VIEW_WORLD
  ) {
    ensureWorldProgress(gameState);

    const scene = this;
    let mode = [VIEW_WORLD, VIEW_CITY, VIEW_SECT].includes(viewMode) ? viewMode : VIEW_WORLD;

    if (LEGACY_TO_ROOT.has(activeNodeId)) activeNodeId = HUMAN_REALM_ROOT_ID;

    if (selectedMapId != null) {
      const selectedMap = findMapById(selectedMapId);
      if (selectedMap) {
        if (isCityMap(selectedMap)) mode = VIEW_CITY;
        else if (isSectMap(selectedMap)) mode = VIEW_SECT;
      }
      const selectedNode = getWorldNodeForMap(selectedMapId);
      if (selectedNode) activeNodeId = selectedNode.id;
    }

    let node = getWorldNode(activeNodeId);
    if (!node) node = getWorldNodeForMap(gameState.currentMapId) || getWorldNode(HUMAN_REALM_ROOT_ID);

    const subtitle = mode === VIEW_CITY
      ? 'Dịch chuyển Thành Thị'
      : mode === VIEW_SECT
        ? 'Dịch chuyển Tông Môn'
        : `${typeText(node)} • ${node.name}`;

    const panel = scene.createModalShell(
      'ĐẠI BẢN ĐỒ NHÂN GIỚI',
      subtitle,
      { subtitleColor: '#7ad8ff', headerFill: 0x040d16, bgFill: COLOR.panel }
    );

    const openMode = (nextMode, nextPage = 0) => {
      scene.openMapPanel(activeNodeId, null, nextPage, nextMode);
    };
    addHeaderTabs(scene, panel, mode, nextMode => openMode(nextMode, 0));

    if (mode === VIEW_WORLD) {
      const openNode = (nodeId, nextPage = 0) => scene.openMapPanel(nodeId, null, nextPage, VIEW_WORLD);
      renderHierarchy(scene, panel, node, page, openNode);
    } else {
      renderTravelCatalog(scene, panel, mode, page, openMode);
    }

    return panel;
  };
}
