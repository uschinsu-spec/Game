/**
 * WorldMapHierarchyUI.js
 * =========================================================================
 * ONE CANONICAL VISUAL WORLD MAP / MINIMAP TRAVEL UI
 * =========================================================================
 * - Chỉ có MỘT bản đồ tổng hợp; không còn tab THẾ GIỚI / THÀNH TRÌ / TÔNG MÔN.
 * - Thành thị, tông môn, gia tộc, phân tông/chi tộc, khu vực và điểm chưa mở cùng nằm trên một mặt bản đồ.
 * - Faction V5 hiển thị marker cố định trên đúng lãnh thổ/node canonical.
 * - Node có runtime map thì di chuyển bằng canonical switchMap().
 * - Faction marker chưa có runtime map chỉ mở thông tin thế lực, tuyệt đối không tạo map giả.
 * - Mọi di chuyển vẫn dùng worldRegistry + canEnterMap() + switchMap().
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

function hash32(value) {
  const s = String(value || '');
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
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
  if (currentNode && isDescendantOrSelf(currentNode.id, activeNode.id)) {
    push(currentNode, resolveNodeMap(currentNode), 0);
  }

  immediate.forEach((child, index) => push(child, resolveNodeMap(child), 20 + index));

  if (['province', 'nation', 'commandery', 'city_territory', 'settlement'].includes(activeNode.type)) {
    collectDescendantDestinations(activeNode, 4, 20).forEach((entry, index) => push(entry.node, entry.map, 6 + index));
  }

  return selected
    .sort((a, b) => a.priority - b.priority || String(a.label).localeCompare(String(b.label), 'vi'))
    .slice(0, MAX_WORLD_MARKERS);
}

function markerVisible(marker, filter) {
  if (filter === 'all') return true;
  if (filter === 'city') return marker.kind === 'city';
  if (filter === 'sect') return marker.kind === 'sect' || marker.kind === 'faction';
  return !['city', 'sect', 'faction'].includes(marker.kind);
}

function markerSlot(marker, index, total, faction = false) {
  const slots = [
    [-170, -118], [-55, -142], [76, -128], [174, -88],
    [-184, -22], [-72, -42], [60, -28], [176, 10],
    [-160, 82], [-45, 70], [80, 86], [168, 112],
    [8, 132]
  ];
  if (faction) {
    const fslots = [[-146, -102], [-48, -118], [62, -108], [145, -72], [150, 52], [65, 104], [-46, 108], [-142, 66]];
    return fslots[index % fslots.length];
  }
  const base = slots[index % slots.length];
  const jitter = (hash32(marker.id) % 17) - 8;
  return [base[0] + jitter, base[1] - Math.round(jitter / 2)];
}

function renderTerrain(scene, mapContainer) {
  const g = scene.add.graphics();
  g.fillStyle(COLOR.map, 1).fillRoundedRect(-228, -172, 456, 344, 18);
  g.lineStyle(1.5, COLOR.cyan, 0.48).strokeRoundedRect(-228, -172, 456, 344, 18);

  const landA = [
    new Phaser.Geom.Point(-194, -78), new Phaser.Geom.Point(-166, -132),
    new Phaser.Geom.Point(-92, -150), new Phaser.Geom.Point(-36, -118),
    new Phaser.Geom.Point(18, -138), new Phaser.Geom.Point(84, -124),
    new Phaser.Geom.Point(158, -82), new Phaser.Geom.Point(190, -20),
    new Phaser.Geom.Point(168, 52), new Phaser.Geom.Point(116, 112),
    new Phaser.Geom.Point(52, 140), new Phaser.Geom.Point(-18, 126),
    new Phaser.Geom.Point(-74, 150), new Phaser.Geom.Point(-140, 118),
    new Phaser.Geom.Point(-188, 54)
  ];
  g.fillStyle(COLOR.land, 0.82).fillPoints(landA, true);

  g.fillStyle(COLOR.land2, 0.76);
  g.fillTriangle(-190, -70, -120, -130, -54, -66);
  g.fillTriangle(30, -132, 105, -116, 74, -48);
  g.fillTriangle(-112, 82, -34, 112, -82, 145);
  g.fillTriangle(60, 52, 166, 18, 116, 116);

  g.lineStyle(6, COLOR.river, 0.18);
  g.beginPath(); g.moveTo(-120, -146); g.lineTo(-76, -70); g.lineTo(-18, -30); g.lineTo(18, 38); g.lineTo(78, 142); g.strokePath();
  g.lineStyle(2.2, COLOR.river, 0.75);
  g.beginPath(); g.moveTo(-120, -146); g.lineTo(-76, -70); g.lineTo(-18, -30); g.lineTo(18, 38); g.lineTo(78, 142); g.strokePath();

  for (let i = 0; i < 18; i += 1) {
    const seed = hash32(`terrain:${i}`);
    const x = -190 + (seed % 380);
    const y = -130 + ((seed >>> 8) % 250);
    g.fillStyle(i % 3 === 0 ? 0x2c725d : 0x215a4d, 0.65);
    g.fillTriangle(x, y - 7, x - 6, y + 5, x + 6, y + 5);
  }
  mapContainer.add(g);
}

function renderRoute(scene, mapContainer, currentPos, selectedPos) {
  if (!currentPos || !selectedPos) return;
  const route = scene.add.graphics();
  route.lineStyle(7, COLOR.cyan, 0.12);
  route.beginPath(); route.moveTo(currentPos[0], currentPos[1]); route.lineTo(selectedPos[0], selectedPos[1]); route.strokePath();
  route.lineStyle(2.4, COLOR.cyan, 0.95);
  const steps = 8;
  for (let i = 0; i < steps; i += 1) {
    const t0 = i / steps;
    const t1 = Math.min(1, t0 + 0.055);
    const x0 = Phaser.Math.Linear(currentPos[0], selectedPos[0], t0);
    const y0 = Phaser.Math.Linear(currentPos[1], selectedPos[1], t0);
    const x1 = Phaser.Math.Linear(currentPos[0], selectedPos[0], t1);
    const y1 = Phaser.Math.Linear(currentPos[1], selectedPos[1], t1);
    route.lineBetween(x0, y0, x1, y1);
  }
  mapContainer.add(route);
}

function renderMarker(scene, mapContainer, marker, pos, selected, onSelect) {
  const [x, y] = pos;
  const current = marker.kind === 'current' || (marker.map && sameMapId(marker.map.id, gameState.currentMapId));
  const locked = marker.map ? !canEnterMap(marker.map.id, gameState).ok : false;
  const accent = locked ? COLOR.locked : current ? COLOR.gold : marker.accent;
  const radius = selected ? 15 : (current ? 13 : 11);
  const familyFaction = marker.kind === 'faction' && isFamilyArchetype(marker.faction?.archetype);
  const branchFaction = marker.kind === 'faction' && Boolean(marker.branch);

  const glow = scene.add.circle(x, y, radius + 8, accent, selected || current ? 0.16 : 0.06);
  const dot = scene.add.circle(x, y, radius, COLOR.panel2, 0.98).setStrokeStyle(selected ? 3.2 : 2.1, accent, 1);
  const core = scene.add.circle(x, y, selected ? 5.5 : 4, accent, 1);
  const hit = scene.add.circle(x, y, 24, 0x000000, 0.001).setInteractive({ useHandCursor: true });

  const symbol = marker.kind === 'city' ? '▣'
    : marker.kind === 'faction' ? (branchFaction ? '✧' : familyFaction ? '◆' : '✦')
      : marker.kind === 'sect' ? '✦'
        : marker.kind === 'region' ? '◇'
          : current ? '●' : '○';
  const sym = scene.add.text(x, y - 1, locked ? '×' : symbol, {
    fontFamily: FONT, fontSize: selected ? '14px' : '12px', fontStyle: 'bold', color: '#ffffff'
  }).setOrigin(0.5);

  const labelRight = x < 92;
  const labelX = x + (labelRight ? 18 : -18);
  const label = scene.add.text(labelX, y - 12, marker.label, {
    fontFamily: FONT,
    fontSize: selected ? '9.5px' : '8.5px',
    fontStyle: 'bold',
    color: locked ? '#81919a' : current ? '#ffd968' : marker.kind === 'faction' ? (familyFaction ? '#ffd1a3' : '#deb8ff') : marker.kind === 'sect' ? '#deb8ff' : '#e9f9ff',
    align: labelRight ? 'left' : 'right',
    wordWrap: { width: 118, useAdvancedWrap: true }
  }).setOrigin(labelRight ? 0 : 1, 0.5);
  const sub = scene.add.text(labelX, y + 9, locked ? 'CHƯA MỞ' : marker.sub, {
    fontFamily: FONT,
    fontSize: '6.8px',
    color: locked ? '#6e7f88' : marker.kind === 'faction' ? (familyFaction ? '#d99858' : '#a97be1') : marker.kind === 'sect' ? '#a97be1' : '#739cac',
    align: labelRight ? 'left' : 'right'
  }).setOrigin(labelRight ? 0 : 1, 0.5);

  hit.on('pointerdown', pointer => {
    stopPointer(scene, pointer);
    onSelect(marker);
  });
  mapContainer.add([glow, dot, core, sym, label, sub, hit]);
}

function renderMapHeader(scene, panel, node) {
  panel.add(scene.add.text(-238, -330, 'BẢN ĐỒ TỔNG HỢP', {
    fontFamily: FONT, fontSize: '11px', fontStyle: 'bold', color: '#66e8ff'
  }).setOrigin(0, 0.5));
  panel.add(scene.add.text(-108, -330, 'Thành thị • Tông môn • Gia tộc • khu vực trên cùng bản đồ', {
    fontFamily: FONT, fontSize: '8.5px', color: '#86a8b7'
  }).setOrigin(0, 0.5));

  const currentMap = findMapById(gameState.currentMapId);
  const currentName = currentMap?.name || 'Không xác định';
  const chip = scene.add.rectangle(0, -294, 470, 42, COLOR.panel2, 1).setStrokeStyle(1.4, 0x1f7187);
  panel.add(chip);
  panel.add(scene.add.text(-220, -294, '⌖  Hiện tại', {
    fontFamily: FONT, fontSize: '9px', color: '#66dff4'
  }).setOrigin(0, 0.5));
  panel.add(scene.add.text(-132, -294, currentName, {
    fontFamily: FONT, fontSize: '11px', fontStyle: 'bold', color: '#f2fbff',
    wordWrap: { width: 255, useAdvancedWrap: true }
  }).setOrigin(0, 0.5));

  panel.add(scene.add.text(-230, -258, breadcrumb(node.id), {
    fontFamily: FONT, fontSize: '8px', color: '#6da5b8',
    wordWrap: { width: 405, useAdvancedWrap: true }
  }).setOrigin(0, 0.5));

  panel.add(scene.add.text(-230, -238, `${typeText(node)} • ${node.name}`, {
    fontFamily: FONT, fontSize: '11px', fontStyle: 'bold', color: '#fff0a8'
  }).setOrigin(0, 0.5));
}

function renderMapLegend(scene, panel) {
  const entries = [
    ['●', '#ffcf55', 'Vị trí'], ['▣', '#ffd46c', 'Thành'], ['✦', '#c08bff', 'Tông'],
    ['◆', '#ffb36b', 'Gia tộc'], ['✧', '#d79cff', 'Chi nhánh'], ['○', '#54d9f0', 'Khu vực']
  ];
  let x = -224;
  entries.forEach(([icon, color, label]) => {
    panel.add(scene.add.text(x, 144, `${icon} ${label}`, {
      fontFamily: FONT, fontSize: '6.6px', color
    }).setOrigin(0, 0.5));
    x += 73;
  });
}

function renderSelectedDetail(scene, panel, activeNode, selectedMarker, openNode, selectFaction) {
  const top = 174;
  const box = scene.add.rectangle(0, 286, 470, 214, COLOR.panel2, 1).setStrokeStyle(1.6, 0x315d6d);
  panel.add(box);

  if (!selectedMarker) {
    panel.add(scene.add.text(0, 240, 'Chạm vào một điểm trên bản đồ', {
      fontFamily: FONT, fontSize: '15px', fontStyle: 'bold', color: '#e8f8ff'
    }).setOrigin(0.5));
    panel.add(scene.add.text(0, 270, 'Chọn thành thị, tông môn, gia tộc hoặc khu vực để xem chi tiết và di chuyển.', {
      fontFamily: FONT, fontSize: '9.5px', color: '#87a9b7', align: 'center',
      wordWrap: { width: 390, useAdvancedWrap: true }
    }).setOrigin(0.5));
    return;
  }

  if (selectedMarker.kind === 'faction') {
    const faction = selectedMarker.faction;
    const family = isFamilyArchetype(faction?.archetype);
    const branch = selectedMarker.branch;
    const header = branch ? (selectedMarker.sub || 'CHI NHÁNH THẾ LỰC') : family ? 'GIA TỘC TRÊN LÃNH THỔ' : 'TÔNG MÔN TRÊN LÃNH THỔ';
    panel.add(scene.add.text(-214, top + 22, header, {
      fontFamily: FONT, fontSize: '8px', fontStyle: 'bold', color: family ? '#ffb36b' : '#c996ff'
    }).setOrigin(0, 0.5));
    panel.add(scene.add.text(-214, top + 52, selectedMarker.label || faction.name, {
      fontFamily: FONT, fontSize: '17px', fontStyle: 'bold', color: '#ffffff',
      wordWrap: { width: 420, useAdvancedWrap: true }
    }).setOrigin(0, 0.5));
    const line = branch
      ? `${faction.name} • ${branch.markerLabel || branch.branchType} • ${activeNode.name}`
      : `${faction.meta?.rankLabel || faction.powerTier || 'THẾ LỰC'} • ${family ? 'GIA TỘC' : 'TÔNG MÔN'} • ${activeNode.name}`;
    panel.add(scene.add.text(-214, top + 84, line, {
      fontFamily: FONT, fontSize: '8.5px', color: '#9eb9c5',
      wordWrap: { width: 420, useAdvancedWrap: true }
    }).setOrigin(0, 0.5));
    const desc = branch
      ? `Chi nhánh cố định của ${faction.name}, neo tại node ${branch.mapNodeId || branch.territoryId}. Không sinh ngẫu nhiên khi vào vùng.`
      : faction.meta?.description || 'Thế lực canonical cố định trong Faction V5 và hiển thị trực tiếp trên bản đồ.';
    panel.add(scene.add.text(-214, top + 112, desc, {
      fontFamily: FONT, fontSize: '8.2px', color: '#83a8b9',
      wordWrap: { width: 420, useAdvancedWrap: true }
    }).setOrigin(0, 0.5));
    addButton(scene, panel, 0, top + 168, 420, 42, 'XEM THÔNG TIN THẾ LỰC', () => selectFaction(faction.id), true, {
      fill: family ? 0x34200d : 0x28133b, stroke: family ? COLOR.orange : COLOR.purple, color: family ? '#ffe0bd' : '#e8d1ff', fontSize: '11px'
    });
    return;
  }

  const node = selectedMarker.node;
  const map = selectedMarker.map;
  if (!map) {
    panel.add(scene.add.text(-214, top + 24, typeText(node), {
      fontFamily: FONT, fontSize: '8px', fontStyle: 'bold', color: '#69dff3'
    }).setOrigin(0, 0.5));
    panel.add(scene.add.text(-214, top + 55, node.name, {
      fontFamily: FONT, fontSize: '18px', fontStyle: 'bold', color: '#ffffff',
      wordWrap: { width: 420, useAdvancedWrap: true }
    }).setOrigin(0, 0.5));
    panel.add(scene.add.text(-214, top + 90, `${nodeStatus(node)} • Chọn để mở sâu hơn trong cùng hệ bản đồ.`, {
      fontFamily: FONT, fontSize: '9px', color: '#8fb1be'
    }).setOrigin(0, 0.5));
    addButton(scene, panel, 0, top + 160, 420, 44, 'MỞ KHU VỰC NÀY', () => openNode(node.id, null), true, {
      fill: 0x082d3a, stroke: COLOR.cyan, fontSize: '11px'
    });
    return;
  }

  const meta = destinationMeta(node, map);
  const access = canEnterMap(map.id, gameState);
  const current = sameMapId(map.id, gameState.currentMapId);
  const required = REALMS[map.minRealm]?.name || REALMS[access.requiredRealmIdx]?.name || 'Phàm Nhân';

  panel.add(scene.add.text(-214, top + 18, `ĐIỂM ĐẾN ĐÃ CHỌN • ${meta.label}`, {
    fontFamily: FONT, fontSize: '8px', fontStyle: 'bold', color: meta.kind === 'sect' ? '#cf9dff' : '#62e1f7'
  }).setOrigin(0, 0.5));
  panel.add(scene.add.text(-214, top + 48, meta.name, {
    fontFamily: FONT, fontSize: '18px', fontStyle: 'bold', color: '#ffffff',
    wordWrap: { width: 420, useAdvancedWrap: true }
  }).setOrigin(0, 0.5));
  panel.add(scene.add.text(-214, top + 77, `${map.isPeaceZone ? 'KHU AN TOÀN' : 'KHU CHIẾN ĐẤU'} • Cần: ${required} • ${nodeStatus(node)}`, {
    fontFamily: FONT, fontSize: '8px', color: '#8db1c0'
  }).setOrigin(0, 0.5));

  const statusText = current ? 'ĐANG Ở ĐÂY' : access.ok ? 'DI CHUYỂN' : `KHÓA • CẦN ${required}`;
  addButton(scene, panel, 42, top + 143, 330, 48, statusText, () => travelTo(scene, map, meta.name), !current && access.ok, {
    fill: !current && access.ok ? 0x8d6114 : 0x17212a,
    stroke: !current && access.ok ? COLOR.gold : COLOR.muted,
    color: !current && access.ok ? '#fff0b6' : '#728a94',
    fontSize: '12px'
  });
  addButton(scene, panel, -177, top + 143, 92, 48, 'MỞ CHI TIẾT', () => openNode(node.id, map.id), true, {
    fill: 0x082d3a, stroke: meta.accent, fontSize: '8.5px'
  });
}

function renderVisualMap(scene, panel, activeNode, selectedMapId, page = 0) {
  const state = scene.__worldMapUiState || (scene.__worldMapUiState = { filter: 'all', selectedFactionId: null });
  const filter = FILTERS.includes(state.filter) ? state.filter : 'all';
  const worldMarkers = buildWorldMarkers(scene, activeNode);
  const factionMarkers = buildFactionMarkers(scene, activeNode);
  const allMarkers = [...worldMarkers, ...factionMarkers];
  const visible = allMarkers.filter(marker => markerVisible(marker, filter));

  let selectedMarker = null;
  if (state.selectedFactionId) {
    selectedMarker = allMarkers.find(marker => marker.kind === 'faction' && (marker.id === state.selectedFactionId || marker.faction?.id === state.selectedFactionId)) || null;
  }
  if (!selectedMarker && selectedMapId != null) {
    selectedMarker = allMarkers.find(marker => marker.map && sameMapId(marker.map.id, selectedMapId)) || null;
  }

  renderMapHeader(scene, panel, activeNode);

  const mapContainer = scene.add.container(0, -42);
  panel.add(mapContainer);
  renderTerrain(scene, mapContainer);

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
    renderMarker(
      scene,
      mapContainer,
      marker,
      positioned.get(marker.id),
      selectedMarker?.id === marker.id,
      picked => {
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
      }
    );
  });

  renderMapLegend(scene, panel);

  if (activeNode.parentId) {
    addButton(scene, panel, -190, 118, 72, 34, '‹ LÊN', () => {
      state.selectedFactionId = null;
      scene.openMapPanel(activeNode.parentId, null, 0);
    }, true, { fontSize: '9px', fill: 0x071b25, stroke: COLOR.blue });
  }

  const filterLabel = filter === 'all' ? 'TẤT CẢ' : filter === 'world' ? 'KHU VỰC' : filter === 'city' ? 'THÀNH THỊ' : 'THẾ LỰC';
  addButton(scene, panel, 159, 118, 126, 34, `BỘ LỌC: ${filterLabel}`, () => {
    const idx = FILTERS.indexOf(filter);
    state.filter = FILTERS[(idx + 1) % FILTERS.length];
    state.selectedFactionId = null;
    scene.openMapPanel(activeNode.id, null, page);
  }, true, { fontSize: '8px', fill: 0x071b25, stroke: COLOR.cyan });

  if (visible.length === 0) {
    panel.add(scene.add.text(0, -42, 'Không có marker phù hợp với bộ lọc hiện tại.', {
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
