/**
 * WorldMapHierarchyUI.js
 * =========================================================================
 * ONE CANONICAL VISUAL WORLD MAP / MINIMAP TRAVEL UI
 * =========================================================================
 * - Chỉ có MỘT bản đồ tổng hợp; không tạo UI/map registry song song.
 * - Thành thị, tông môn, gia tộc, phân chi và world node cùng dùng worldRegistry.
 * - Marker mặc định chỉ hiện biểu tượng; nhãn chỉ hiện cho vị trí hiện tại / marker đang chọn
 *   (hoặc tạm thời khi hover trên desktop) để tránh chồng chữ trên mobile.
 * - Node có runtime map di chuyển bằng canonical switchMap().
 * - Faction marker chưa có runtime map chỉ mở hồ sơ thế lực, không tạo teleport giả.
 */
import { REALMS } from '../../config/realmsData.js';
import {
  HUMAN_REALM_ROOT_ID,
  canEnterMap,
  findMapById,
  getWorldAncestors,
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
const MAP_UI_LAYOUT_VERSION = '20260930-clear-marker-layout-v1';
const LEGACY_TO_ROOT = new Set(['nam_lang', 'van_tinh_hai', 'than_chau', 'man_hoang', 'thai_hu']);
const MAX_WORLD_MARKERS = 13;
const MAX_FACTION_MARKERS = 8;
const FILTERS = Object.freeze(['all', 'world', 'city', 'sect']);
const DIRECT_MAP_NODE_TYPES = new Set([
  'province', 'location', 'city_territory', 'settlement', 'sect', 'peak', 'hall'
]);

const COLOR = Object.freeze({
  panel: 0x020b12,
  panel2: 0x061622,
  panel3: 0x0a2230,
  map: 0x071c26,
  land: 0x104a43,
  land2: 0x0d3936,
  river: 0x25b7d3,
  cyan: 0x48d9f0,
  blue: 0x43a9db,
  green: 0x38ffaa,
  gold: 0xffcc55,
  purple: 0xb56dff,
  orange: 0xffa94d,
  red: 0xff6677,
  muted: 0x466879,
  locked: 0x64727a
});

function sameMapId(a, b) {
  return String(a) === String(b);
}

function truncateLabel(value, max = 36) {
  const text = String(value || '');
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(4, max - 1)).trim()}…`;
}

function isCityMap(map) {
  return map?.uiMode === 'city_hub' || map?.type === 'safe_city';
}

function isSectMap(map) {
  return map?.uiMode === 'sect_hub' || map?.type === 'safe_sect';
}

function isFamilyArchetype(archetype) {
  return archetype === 'CULTIVATION_FAMILY' || archetype === 'ANCIENT_CLAN';
}

function typeText(node) {
  const labels = {
    realm: 'NHÂN GIỚI', continent: 'ĐẠI LỤC', great_region: 'ĐẠI VỰC', province: 'LÃNH THỔ',
    nation: 'QUỐC GIA', commandery: 'QUẬN', city_territory: 'THÀNH VỰC', settlement: 'THÔN',
    sect: 'TÔNG MÔN', peak: 'SƠN PHONG', hall: 'ĐIỆN', location: 'ĐỊA ĐIỂM'
  };
  const loc = {
    safe_hub: 'AN TOÀN', major_hub: 'THÀNH THỊ', field: 'HOANG DÃ', secret_realm: 'BÍ CẢNH',
    prov_wild: 'HOANG DÃ', prov_secret: 'BÍ CẢNH', nat_wild: 'BIÊN HOANG', nat_secret: 'BÍ CẢNH',
    forbidden_zone: 'CẤM ĐỊA', town: 'TRẤN', resource: 'TÀI NGUYÊN', dungeon: 'PHÓ BẢN', market: 'PHƯỜNG THỊ'
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
  if (node.playableMapId != null) return findMapById(node.playableMapId);
  if (!DIRECT_MAP_NODE_TYPES.has(node.type) && node.materialized !== true) return null;
  return findMapById(node.id);
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

function stripTerritorySuffix(name) {
  return String(name || '').replace(/\s+(Châu|Đạo|Lĩnh|Phủ)$/u, '').trim();
}

function destinationMeta(node, map) {
  const base = stripTerritorySuffix(node?.name || map?.name || 'Linh');
  if (isCityMap(map)) {
    return {
      kind: 'city', icon: '▣', label: 'THÀNH THỊ', accent: COLOR.gold,
      name: node?.capital || map?.worldPath?.city || map?.name || `${base} Đại Thành`,
      desc: `Thành thị trung tâm của ${node?.name || map?.name}.`
    };
  }
  if (isSectMap(map) || node?.type === 'sect' || node?.type === 'peak' || node?.type === 'hall') {
    const mapName = String(map?.name || node?.name || '');
    return {
      kind: 'sect', icon: '✦', label: 'TÔNG MÔN', accent: COLOR.purple,
      name: mapName || `${base} Tông Môn`,
      desc: `Sơn môn tu hành nằm trong ${node?.name || map?.name}.`
    };
  }
  if (map?.isPeaceZone) {
    return {
      kind: 'hub', icon: '⌂', label: 'KHU AN TOÀN', accent: COLOR.green,
      name: node?.name || map?.name, desc: node?.desc || map?.sub || ''
    };
  }
  return {
    kind: 'field', icon: '◇', label: typeText(node), accent: COLOR.cyan,
    name: node?.name || map?.name, desc: node?.desc || map?.sub || ''
  };
}

function nodeStatus(node) {
  const map = resolveNodeMap(node);
  if (map) {
    if (sameMapId(map.id, gameState.currentMapId)) return 'ĐANG Ở ĐÂY';
    if (hasVisitedMap(gameState, map.id)) return 'ĐÃ KHÁM PHÁ';
    return 'CHƯA ĐẾN';
  }
  return isNodeDiscovered(gameState, node.id) ? 'ĐÃ MỞ' : 'CHƯA KHÁM PHÁ';
}

function currentContextNode() {
  const current = resolveSelectedWorldNode(gameState.currentMapId);
  if (!current) return getWorldNode(HUMAN_REALM_ROOT_ID);
  let cursor = current;
  while (cursor?.parentId) {
    if (['nation', 'province', 'great_region'].includes(cursor.type)) return cursor;
    cursor = getWorldNode(cursor.parentId);
  }
  return current;
}

function isDescendantOrSelf(nodeId, ancestorId) {
  if (!nodeId || !ancestorId) return false;
  if (nodeId === ancestorId) return true;
  return getWorldAncestors(nodeId, false).some(node => node.id === ancestorId);
}

function addButton(scene, panel, x, y, w, h, label, onPress, enabled = true, options = {}) {
  const fill = enabled ? (options.fill ?? COLOR.panel3) : 0x151d24;
  const stroke = enabled ? (options.stroke ?? COLOR.cyan) : COLOR.muted;
  const bg = scene.add.rectangle(x, y, w, h, fill, options.alpha ?? 1)
    .setStrokeStyle(options.lineWidth ?? 1.5, stroke);
  const txt = scene.add.text(x, y, label, {
    fontFamily: FONT,
    fontSize: options.fontSize ?? '11px',
    fontStyle: options.bold === false ? 'normal' : 'bold',
    color: enabled ? (options.color ?? '#d7f7ff') : '#577080',
    align: 'center',
    wordWrap: { width: Math.max(20, w - 12), useAdvancedWrap: true }
  }).setOrigin(0.5);
  if (enabled) {
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => bg.setStrokeStyle(2.2, options.hoverStroke ?? 0xffffff));
    bg.on('pointerout', () => bg.setStrokeStyle(options.lineWidth ?? 1.5, stroke));
    bg.on('pointerdown', pointer => {
      stopPointer(scene, pointer);
      onPress?.();
    });
  }
  panel.add([bg, txt]);
  return bg;
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

function markerKind(node, map) {
  if (map && sameMapId(map.id, gameState.currentMapId)) return 'current';
  if (map && isCityMap(map)) return 'city';
  if ((map && isSectMap(map)) || ['sect', 'peak', 'hall'].includes(node?.type)) return 'sect';
  if (map?.isPeaceZone) return 'hub';
  if (map) return 'world';
  return 'region';
}

function collectDescendantDestinations(root, maxDepth = 3, max = 16) {
  const out = [];
  const seen = new Set();
  const walk = (node, depth) => {
    if (!node || depth > maxDepth || out.length >= max) return;
    for (const child of getWorldChildren(node.id)) {
      if (seen.has(child.id)) continue;
      seen.add(child.id);
      const map = resolveNodeMap(child);
      const special = map || ['city_territory', 'settlement', 'location', 'sect', 'peak', 'hall'].includes(child.type);
      if (special) out.push({ node: child, map });
      if (depth < maxDepth && out.length < max) walk(child, depth + 1);
    }
  };
  walk(root, 1);
  return out;
}

function buildFactionMarkers(scene, activeNode) {
  const overlay = scene.getFactionOverlayForWorldNode?.(activeNode.id);
  const canonical = overlay?.mapMarkers || [];
  if (canonical.length) {
    return canonical
      .filter(marker => marker?.faction && (marker.faction.archetype === 'SECT' || isFamilyArchetype(marker.faction.archetype)))
      .slice(0, MAX_FACTION_MARKERS)
      .map(marker => {
        const family = isFamilyArchetype(marker.faction.archetype);
        const branch = Boolean(marker.branch || marker.markerType === 'FACTION_BRANCH');
        return {
          id: `faction:${marker.id}`,
          kind: 'faction',
          faction: marker.faction,
          branch: marker.branch || null,
          markerType: marker.markerType,
          worldNodeId: marker.worldNodeId,
          label: marker.label || marker.faction.name,
          sub: marker.subLabel || (branch ? 'CHI NHÁNH' : family ? 'GIA TỘC' : 'TÔNG MÔN'),
          accent: family ? COLOR.orange : branch ? 0xd79cff : COLOR.purple
        };
      });
  }
  if (!overlay?.topFactions?.length) return [];
  return overlay.topFactions
    .filter(faction => faction?.archetype === 'SECT' || isFamilyArchetype(faction?.archetype))
    .slice(0, MAX_FACTION_MARKERS)
    .map(faction => ({
      id: `faction:${faction.id}`,
      kind: 'faction',
      faction,
      branch: null,
      label: faction.name,
      sub: isFamilyArchetype(faction.archetype) ? 'GIA TỘC' : 'TÔNG MÔN',
      accent: isFamilyArchetype(faction.archetype) ? COLOR.orange : COLOR.purple
    }));
}

function buildWorldMarkers(scene, activeNode) {
  const immediate = getWorldChildren(activeNode.id);
  const selected = [];
  const ids = new Set();
  const push = (node, map = resolveNodeMap(node), priority = 10) => {
    if (!node || ids.has(node.id)) return;
    ids.add(node.id);
    selected.push({
      id: `node:${node.id}`,
      node,
      map,
      kind: markerKind(node, map),
      label: map ? destinationMeta(node, map).name : node.name,
      sub: map ? destinationMeta(node, map).label : typeText(node),
      accent: map ? destinationMeta(node, map).accent : COLOR.blue,
      priority
    });
  };

  const currentNode = resolveSelectedWorldNode(gameState.currentMapId);
  if (currentNode && isDescendantOrSelf(currentNode.id, activeNode.id)) push(currentNode, resolveNodeMap(currentNode), 0);
  immediate.forEach((child, index) => push(child, resolveNodeMap(child), 20 + index));

  if (['province', 'nation', 'commandery', 'city_territory', 'settlement'].includes(activeNode.type)) {
    collectDescendantDestinations(activeNode, 4, 20).forEach((entry, index) => push(entry.node, entry.map, 6 + index));
  }

  return selected
    .sort((a, b) => a.priority - b.priority || String(a.label).localeCompare(String(b.label), 'vi'))
    .slice(0, MAX_WORLD_MARKERS);
}

function markerVisible(marker, filter) {
  if (marker.kind === 'current') return true;
  if (filter === 'all') return true;
  if (filter === 'city') return marker.kind === 'city';
  if (filter === 'sect') return marker.kind === 'sect' || marker.kind === 'faction';
  return !['city', 'sect', 'faction'].includes(marker.kind);
}

function markerSlot(marker, index, total, faction = false) {
  if (faction) {
    const innerRing = [
      [-100, -92], [0, -112], [100, -92], [-126, -10],
      [126, -10], [-98, 82], [0, 108], [98, 82]
    ];
    return innerRing[index % innerRing.length];
  }

  const worldSlots = [
    [0, 8],
    [-176, -136], [-86, -154], [86, -154], [176, -136],
    [-194, -54], [194, -54], [-194, 42], [194, 42],
    [-164, 128], [-56, 148], [56, 148], [164, 128]
  ];
  return worldSlots[index % worldSlots.length];
}

function renderTerrain(scene, mapContainer) {
  const g = scene.add.graphics();
  g.fillStyle(COLOR.map, 1).fillRoundedRect(-228, -188, 456, 376, 18);
  g.lineStyle(1.5, COLOR.cyan, 0.48).strokeRoundedRect(-228, -188, 456, 376, 18);

  const landA = [
    new Phaser.Geom.Point(-196, -82), new Phaser.Geom.Point(-168, -144),
    new Phaser.Geom.Point(-92, -162), new Phaser.Geom.Point(-34, -126),
    new Phaser.Geom.Point(22, -148), new Phaser.Geom.Point(88, -132),
    new Phaser.Geom.Point(162, -88), new Phaser.Geom.Point(194, -24),
    new Phaser.Geom.Point(170, 58), new Phaser.Geom.Point(118, 126),
    new Phaser.Geom.Point(52, 154), new Phaser.Geom.Point(-18, 138),
    new Phaser.Geom.Point(-78, 162), new Phaser.Geom.Point(-144, 126),
    new Phaser.Geom.Point(-192, 58)
  ];
  g.fillStyle(COLOR.land, 0.82).fillPoints(landA, true);

  g.fillStyle(COLOR.land2, 0.76);
  g.fillTriangle(-190, -74, -118, -138, -50, -70);
  g.fillTriangle(34, -140, 110, -120, 78, -50);
  g.fillTriangle(-116, 84, -36, 118, -84, 152);
  g.fillTriangle(64, 54, 170, 18, 120, 122);

  g.lineStyle(6, COLOR.river, 0.18);
  g.beginPath(); g.moveTo(-126, -158); g.lineTo(-78, -72); g.lineTo(-18, -28); g.lineTo(22, 44); g.lineTo(82, 154); g.strokePath();
  g.lineStyle(2.2, COLOR.river, 0.74);
  g.beginPath(); g.moveTo(-126, -158); g.lineTo(-78, -72); g.lineTo(-18, -28); g.lineTo(22, 44); g.lineTo(82, 154); g.strokePath();

  for (let i = 0; i < 18; i += 1) {
    const seed = (i * 1103515245 + 12345) >>> 0;
    const x = -188 + (seed % 376);
    const y = -146 + ((seed >>> 8) % 282);
    g.fillStyle(i % 3 === 0 ? 0x2c725d : 0x215a4d, 0.58);
    g.fillTriangle(x, y - 6, x - 5, y + 4, x + 5, y + 4);
  }
  mapContainer.add(g);
}

function renderRoute(scene, mapContainer, currentPos, selectedPos) {
  if (!currentPos || !selectedPos) return;
  const route = scene.add.graphics();
  route.lineStyle(6, COLOR.cyan, 0.12);
  route.beginPath(); route.moveTo(currentPos[0], currentPos[1]); route.lineTo(selectedPos[0], selectedPos[1]); route.strokePath();
  route.lineStyle(2.2, COLOR.cyan, 0.92);
  const steps = 8;
  for (let i = 0; i < steps; i += 1) {
    const t0 = i / steps;
    const t1 = Math.min(1, t0 + 0.055);
    route.lineBetween(
      Phaser.Math.Linear(currentPos[0], selectedPos[0], t0),
      Phaser.Math.Linear(currentPos[1], selectedPos[1], t0),
      Phaser.Math.Linear(currentPos[0], selectedPos[0], t1),
      Phaser.Math.Linear(currentPos[1], selectedPos[1], t1)
    );
  }
  mapContainer.add(route);
}

function renderMarker(scene, mapContainer, marker, pos, selected, onSelect) {
  const [x, y] = pos;
  const current = marker.kind === 'current' || (marker.map && sameMapId(marker.map.id, gameState.currentMapId));
  const locked = marker.map ? !canEnterMap(marker.map.id, gameState).ok : false;
  const accent = locked ? COLOR.locked : current ? COLOR.gold : marker.accent;
  const radius = selected ? 15 : current ? 13 : 10;
  const familyFaction = marker.kind === 'faction' && isFamilyArchetype(marker.faction?.archetype);
  const branchFaction = marker.kind === 'faction' && Boolean(marker.branch);
  const persistentLabel = selected || current;

  const glow = scene.add.circle(x, y, radius + 8, accent, selected || current ? 0.18 : 0.045);
  const dot = scene.add.circle(x, y, radius, COLOR.panel2, 0.98).setStrokeStyle(selected ? 3 : 2, accent, 1);
  const core = scene.add.circle(x, y, selected ? 5.2 : 3.8, accent, 1);
  const hit = scene.add.circle(x, y, 23, 0x000000, 0.001).setInteractive({ useHandCursor: true });

  const symbol = current ? '●'
    : marker.kind === 'city' ? '▣'
      : marker.kind === 'faction' ? (branchFaction ? '✧' : familyFaction ? '◆' : '✦')
        : marker.kind === 'sect' ? '✦'
          : marker.kind === 'region' ? '◇' : '○';
  const sym = scene.add.text(x, y - 1, locked ? '×' : symbol, {
    fontFamily: FONT,
    fontSize: selected ? '14px' : '11px',
    fontStyle: 'bold',
    color: '#ffffff'
  }).setOrigin(0.5);

  const side = x > 72 ? -1 : 1;
  const calloutX = x + side * 19;
  const callout = scene.add.container(calloutX, y - 18);
  const labelName = scene.add.text(0, -5, truncateLabel(marker.label, selected ? 28 : 20), {
    fontFamily: FONT,
    fontSize: selected ? '9px' : '8px',
    fontStyle: 'bold',
    color: locked ? '#9aa8ae' : current ? '#ffe27a' : familyFaction ? '#ffd1a3' : marker.kind === 'faction' || marker.kind === 'sect' ? '#e5c8ff' : '#ebfbff'
  }).setOrigin(side > 0 ? 0 : 1, 0.5);
  const labelSub = scene.add.text(0, 8, locked ? 'CHƯA MỞ' : truncateLabel(marker.sub, 18), {
    fontFamily: FONT,
    fontSize: '6.4px',
    color: locked ? '#78878e' : familyFaction ? '#d99858' : marker.kind === 'faction' || marker.kind === 'sect' ? '#ad85db' : '#76a4b6'
  }).setOrigin(side > 0 ? 0 : 1, 0.5);
  const boxW = Math.max(74, Math.min(164, Math.max(labelName.width, labelSub.width) + 16));
  const boxX = side > 0 ? boxW / 2 - 6 : -boxW / 2 + 6;
  const labelBg = scene.add.rectangle(boxX, 1, boxW, 34, COLOR.panel, 0.94).setStrokeStyle(1, accent, 0.72);
  callout.add([labelBg, labelName, labelSub]);
  callout.setVisible(persistentLabel);

  hit.on('pointerover', () => callout.setVisible(true));
  hit.on('pointerout', () => callout.setVisible(persistentLabel));
  hit.on('pointerdown', pointer => {
    stopPointer(scene, pointer);
    onSelect(marker);
  });

  mapContainer.add([glow, dot, core, sym, hit, callout]);
}

function renderMapHeader(scene, panel, node) {
  const currentMap = findMapById(gameState.currentMapId);
  const currentName = currentMap?.name || 'Không xác định';

  panel.add(scene.add.text(-230, -338, 'VỊ TRÍ HIỆN TẠI', {
    fontFamily: FONT, fontSize: '8px', fontStyle: 'bold', color: '#66dff4'
  }).setOrigin(0, 0.5));

  const chip = scene.add.rectangle(0, -312, 462, 38, COLOR.panel2, 1).setStrokeStyle(1.2, 0x1f7187);
  panel.add(chip);
  panel.add(scene.add.text(-216, -312, '⌖', {
    fontFamily: FONT, fontSize: '13px', fontStyle: 'bold', color: '#66dff4'
  }).setOrigin(0, 0.5));
  panel.add(scene.add.text(-190, -312, truncateLabel(currentName, 34), {
    fontFamily: FONT, fontSize: '11px', fontStyle: 'bold', color: '#f2fbff'
  }).setOrigin(0, 0.5));
  panel.add(scene.add.text(208, -312, '1 BẢN ĐỒ', {
    fontFamily: FONT, fontSize: '7px', fontStyle: 'bold', color: '#6f9aaa'
  }).setOrigin(1, 0.5));

  panel.add(scene.add.text(-230, -282, truncateLabel(breadcrumb(node.id), 68), {
    fontFamily: FONT, fontSize: '7.5px', color: '#6da5b8'
  }).setOrigin(0, 0.5));
}

function renderFilterBar(scene, panel, state, activeNode, page) {
  const entries = [
    ['all', 'TẤT CẢ'], ['world', 'ĐỊA ĐIỂM'], ['city', 'THÀNH'], ['sect', 'THẾ LỰC']
  ];
  const xs = [-165, -55, 55, 165];
  entries.forEach(([key, label], index) => {
    const active = state.filter === key;
    addButton(scene, panel, xs[index], -246, 102, 30, label, () => {
      state.filter = key;
      state.selectedFactionId = null;
      scene.openMapPanel(activeNode.id, null, page);
    }, true, {
      fill: active ? 0x12384a : 0x061824,
      stroke: active ? COLOR.cyan : 0x2b5666,
      color: active ? '#dffaff' : '#82a7b6',
      fontSize: '7.5px',
      lineWidth: active ? 2 : 1
    });
  });
}

function renderMapLegend(scene, panel) {
  const entries = [
    ['●', '#ffcf55', 'Bạn'], ['▣', '#ffd46c', 'Thành'], ['✦', '#c08bff', 'Tông'],
    ['◆', '#ffb36b', 'Gia'], ['✧', '#d79cff', 'Chi'], ['○', '#54d9f0', 'Điểm']
  ];
  let x = -220;
  entries.forEach(([icon, color, label]) => {
    panel.add(scene.add.text(x, 195, `${icon} ${label}`, {
      fontFamily: FONT, fontSize: '6.6px', color
    }).setOrigin(0, 0.5));
    x += 72;
  });
}

function renderSelectedDetail(scene, panel, activeNode, selectedMarker, openNode, selectFaction) {
  const boxY = 328;
  const boxH = 156;
  const box = scene.add.rectangle(0, boxY, 462, boxH, COLOR.panel2, 1).setStrokeStyle(1.4, 0x315d6d);
  panel.add(box);

  if (!selectedMarker) {
    panel.add(scene.add.text(-208, 286, 'CHỌN MỘT MARKER', {
      fontFamily: FONT, fontSize: '8px', fontStyle: 'bold', color: '#67dff4'
    }).setOrigin(0, 0.5));
    panel.add(scene.add.text(-208, 315, 'Chạm một biểu tượng để hiện tên và thao tác.', {
      fontFamily: FONT, fontSize: '12px', fontStyle: 'bold', color: '#eefbff'
    }).setOrigin(0, 0.5));
    panel.add(scene.add.text(-208, 343, 'Nhãn được ẩn tự động khi chưa chọn để bản đồ không bị chồng chữ.', {
      fontFamily: FONT, fontSize: '8.5px', color: '#86a9b7',
      wordWrap: { width: 405, useAdvancedWrap: true }
    }).setOrigin(0, 0.5));
    return;
  }

  if (selectedMarker.kind === 'faction') {
    const faction = selectedMarker.faction;
    const family = isFamilyArchetype(faction?.archetype);
    const branch = selectedMarker.branch;
    const header = branch ? (selectedMarker.sub || 'CHI NHÁNH') : family ? 'GIA TỘC' : 'TÔNG MÔN';
    panel.add(scene.add.text(-208, 271, header, {
      fontFamily: FONT, fontSize: '8px', fontStyle: 'bold', color: family ? '#ffb36b' : '#c996ff'
    }).setOrigin(0, 0.5));
    panel.add(scene.add.text(-208, 297, truncateLabel(selectedMarker.label || faction.name, 42), {
      fontFamily: FONT, fontSize: '15px', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0, 0.5));
    const metaLine = branch
      ? `${truncateLabel(faction.name, 28)} • ${branch.markerLabel || branch.branchType}`
      : `${faction.meta?.rankLabel || faction.powerTier || 'THẾ LỰC'} • ${faction.meta?.seatName || activeNode.name}`;
    panel.add(scene.add.text(-208, 323, truncateLabel(metaLine, 58), {
      fontFamily: FONT, fontSize: '8px', color: '#94b3c0'
    }).setOrigin(0, 0.5));
    panel.add(scene.add.text(-208, 345, truncateLabel(
      branch ? `Chi nhánh cố định tại ${branch.meta?.seatName || branch.mapNodeId || branch.territoryId}.` : (faction.meta?.description || 'Thế lực canonical cố định.'),
      82
    ), {
      fontFamily: FONT, fontSize: '7.6px', color: '#779ba9',
      wordWrap: { width: 405, useAdvancedWrap: true }
    }).setOrigin(0, 0.5));
    addButton(scene, panel, 0, 382, 410, 36, 'XEM HỒ SƠ THẾ LỰC', () => selectFaction(faction.id), true, {
      fill: family ? 0x34200d : 0x28133b,
      stroke: family ? COLOR.orange : COLOR.purple,
      color: family ? '#ffe0bd' : '#e8d1ff',
      fontSize: '9px'
    });
    return;
  }

  const node = selectedMarker.node;
  const map = selectedMarker.map;
  if (!map) {
    panel.add(scene.add.text(-208, 275, typeText(node), {
      fontFamily: FONT, fontSize: '8px', fontStyle: 'bold', color: '#69dff3'
    }).setOrigin(0, 0.5));
    panel.add(scene.add.text(-208, 304, truncateLabel(node.name, 42), {
      fontFamily: FONT, fontSize: '16px', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0, 0.5));
    panel.add(scene.add.text(-208, 333, `${nodeStatus(node)} • Mở sâu hơn trong cùng hệ bản đồ.`, {
      fontFamily: FONT, fontSize: '8.5px', color: '#8fb1be'
    }).setOrigin(0, 0.5));
    addButton(scene, panel, 0, 378, 410, 38, 'MỞ KHU VỰC NÀY', () => openNode(node.id, null), true, {
      fill: 0x082d3a, stroke: COLOR.cyan, fontSize: '9px'
    });
    return;
  }

  const meta = destinationMeta(node, map);
  const access = canEnterMap(map.id, gameState);
  const current = sameMapId(map.id, gameState.currentMapId);
  const required = REALMS[map.minRealm]?.name || REALMS[access.requiredRealmIdx]?.name || 'Phàm Nhân';

  panel.add(scene.add.text(-208, 273, meta.label, {
    fontFamily: FONT, fontSize: '8px', fontStyle: 'bold', color: meta.kind === 'sect' ? '#cf9dff' : '#62e1f7'
  }).setOrigin(0, 0.5));
  panel.add(scene.add.text(-208, 301, truncateLabel(meta.name, 42), {
    fontFamily: FONT, fontSize: '16px', fontStyle: 'bold', color: '#ffffff'
  }).setOrigin(0, 0.5));
  panel.add(scene.add.text(-208, 329, `${map.isPeaceZone ? 'AN TOÀN' : 'CHIẾN ĐẤU'} • Cần ${required} • ${nodeStatus(node)}`, {
    fontFamily: FONT, fontSize: '8px', color: '#8db1c0'
  }).setOrigin(0, 0.5));

  addButton(scene, panel, -105, 378, 198, 38, 'MỞ CHI TIẾT', () => openNode(node.id, map.id), true, {
    fill: 0x082d3a, stroke: meta.accent, fontSize: '8.5px'
  });
  addButton(scene, panel, 105, 378, 198, 38,
    current ? 'ĐANG Ở ĐÂY' : access.ok ? 'DI CHUYỂN' : `KHÓA • ${required}`,
    () => travelTo(scene, map, meta.name),
    !current && access.ok,
    {
      fill: !current && access.ok ? 0x8d6114 : 0x17212a,
      stroke: !current && access.ok ? COLOR.gold : COLOR.muted,
      color: !current && access.ok ? '#fff0b6' : '#728a94',
      fontSize: '8.5px'
    }
  );
}

function renderVisualMap(scene, panel, activeNode, selectedMapId, page = 0) {
  const state = scene.__worldMapUiState || (scene.__worldMapUiState = { filter: 'all', selectedFactionId: null });
  if (!FILTERS.includes(state.filter)) state.filter = 'all';

  const worldMarkers = buildWorldMarkers(scene, activeNode);
  const factionMarkers = buildFactionMarkers(scene, activeNode);
  const allMarkers = [...worldMarkers, ...factionMarkers];
  const visible = allMarkers.filter(marker => markerVisible(marker, state.filter));

  let selectedMarker = null;
  if (state.selectedFactionId) {
    selectedMarker = allMarkers.find(marker => marker.kind === 'faction' && (marker.id === state.selectedFactionId || marker.faction?.id === state.selectedFactionId)) || null;
  }
  if (!selectedMarker && selectedMapId != null) {
    selectedMarker = allMarkers.find(marker => marker.map && sameMapId(marker.map.id, selectedMapId)) || null;
  }

  renderMapHeader(scene, panel, activeNode);
  renderFilterBar(scene, panel, state, activeNode, page);

  const mapContainer = scene.add.container(0, -12);
  panel.add(mapContainer);
  renderTerrain(scene, mapContainer);

  const mapClearHit = scene.add.rectangle(0, 0, 456, 376, 0x000000, 0.001).setInteractive({ useHandCursor: false });
  mapClearHit.on('pointerdown', pointer => {
    stopPointer(scene, pointer);
    state.selectedFactionId = null;
    scene.openMapPanel(activeNode.id, null, page);
  });
  mapContainer.add(mapClearHit);

  const positioned = new Map();
  const worldVisible = visible.filter(marker => marker.kind !== 'faction');
  const factionVisible = visible.filter(marker => marker.kind === 'faction');
  worldVisible.forEach((marker, index) => positioned.set(marker.id, markerSlot(marker, index, worldVisible.length, false)));
  factionVisible.forEach((marker, index) => positioned.set(marker.id, markerSlot(marker, index, factionVisible.length, true)));

  const currentMarker = worldVisible.find(marker => marker.map && sameMapId(marker.map.id, gameState.currentMapId));
  const currentPos = currentMarker ? positioned.get(currentMarker.id) : null;
  const selectedPos = selectedMarker ? positioned.get(selectedMarker.id) : null;
  renderRoute(scene, mapContainer, currentPos, selectedPos);

  visible.forEach(marker => {
    const pos = positioned.get(marker.id);
    if (!pos) return;
    renderMarker(scene, mapContainer, marker, pos, selectedMarker?.id === marker.id, picked => {
      if (picked.kind === 'faction') {
        state.selectedFactionId = picked.id;
        scene.openMapPanel(activeNode.id, null, page);
        return;
      }
      state.selectedFactionId = null;
      if (!picked.map && picked.node) {
        scene.openMapPanel(picked.node.id, null, 0);
        return;
      }
      scene.openMapPanel(activeNode.id, picked.map?.id ?? null, page);
    });
  });

  renderMapLegend(scene, panel);

  if (activeNode.parentId) {
    addButton(scene, panel, -185, 225, 86, 30, '‹ LÊN', () => {
      state.selectedFactionId = null;
      scene.openMapPanel(activeNode.parentId, null, 0);
    }, true, { fontSize: '8px', fill: 0x071b25, stroke: COLOR.blue });
  }

  panel.add(scene.add.text(214, 225, `${visible.length} marker • nhãn khi chọn`, {
    fontFamily: FONT, fontSize: '7px', color: '#6f94a3'
  }).setOrigin(1, 0.5));

  if (visible.length === 0) {
    panel.add(scene.add.text(0, -10, 'Không có marker phù hợp với bộ lọc hiện tại.', {
      fontFamily: FONT, fontSize: '10px', color: '#86aab8'
    }).setOrigin(0.5));
  }

  renderSelectedDetail(
    scene,
    panel,
    activeNode,
    selectedMarker,
    (nodeId, mapId = null) => {
      state.selectedFactionId = null;
      scene.openMapPanel(nodeId, mapId, 0);
    },
    factionId => scene.openFactionPanel?.(factionId)
  );
}

export function installWorldMapHierarchyUI(MainGameScene) {
  if (!MainGameScene?.prototype) return;
  const proto = MainGameScene.prototype;
  if (proto.__worldMapHierarchyUiInstalled) return;

  if (proto.__worldMapUiOwner && proto.__worldMapUiOwner !== MAP_UI_OWNER) {
    throw new Error(`World map UI conflict: ${proto.__worldMapUiOwner} vs ${MAP_UI_OWNER}`);
  }

  proto.__worldMapUiOwner = MAP_UI_OWNER;
  proto.__worldMapUiLayoutVersion = MAP_UI_LAYOUT_VERSION;
  proto.__worldMapHierarchyUiInstalled = true;

  proto.openMapPanel = function openHierarchicalWorldMap(
    activeNodeId = null,
    selectedMapId = null,
    page = 0
  ) {
    ensureWorldProgress(gameState);
    const scene = this;

    if (!scene.__worldMapUiState) scene.__worldMapUiState = { filter: 'all', selectedFactionId: null };
    if (LEGACY_TO_ROOT.has(activeNodeId)) activeNodeId = HUMAN_REALM_ROOT_ID;

    let node = activeNodeId ? getWorldNode(activeNodeId) : currentContextNode();
    if (!node) node = currentContextNode() || getWorldNode(HUMAN_REALM_ROOT_ID);

    const panel = scene.createModalShell(
      'BẢN ĐỒ DI CHUYỂN',
      `${typeText(node)} • ${node.name}`,
      {
        subtitleColor: '#7ad8ff',
        headerFill: 0x040d16,
        bgFill: COLOR.panel,
        closeOpts: { label: '×', width: 58, height: 48, fontSize: '26px' },
        closeX: 207,
        closeY: -432
      }
    );

    renderVisualMap(scene, panel, node, selectedMapId, page);
    return panel;
  };
}
