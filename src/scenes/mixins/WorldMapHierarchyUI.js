/**
 * WorldMapHierarchyUI.js
 * =========================================================================
 * ONE CANONICAL VISUAL WORLD MAP / MINIMAP TRAVEL UI
 * =========================================================================
 * - Chỉ có MỘT bản đồ tổng hợp; không tạo UI/map registry song song.
 * - Thành thị, tông môn, gia tộc, phân chi và world node cùng dùng worldRegistry.
 * - Marker mặc định chỉ hiện biểu tượng; nhãn chỉ hiện cho vị trí hiện tại / marker đang chọn
 *   (hoặc tạm thời khi hover trên desktop) để tránh chồng chữ trên mobile.
 * - Vực/Châu/Quốc chỉ là node phân cấp, tuyệt đối không phải runtime map.
 * - Map gameplay chỉ gồm Thành, Hoang Dã, Bí Cảnh và Sơn Môn/Tổ Địa Tông Môn/Gia Tộc.
 * - Chỉ destination có runtime map canonical mới được phép di chuyển.
 * - Tông Môn/Thế Gia chỉ dùng faction ID + headquarters.playableMapId đã khai báo cố định.
 *   UI tuyệt đối không sinh faction ID hoặc map ID dự phòng.
 */
import { REALMS } from '../../config/realmsData.js';
import {
  HUMAN_REALM_ROOT_ID,
  RUNTIME_POLICIES,
  getNodeRuntimePolicy,
  canEnterMap,
  findMapById,
  getWorldAncestors,
  getWorldBreadcrumb,
  getWorldChildren,
  getWorldNode,
  getWorldNodeForMap
} from '../../config/world/worldRegistry.js?v=20260930-canonical-geography-v1';
import { HUMAN_REALM_FACTION_NETWORK } from '../../config/factions/gameFactionRegistry.js?v=20260930-canonical-geography-v1';
import { gameState } from '../../state/gameState.js';
import { ensureWorldProgress, hasVisitedMap, isNodeDiscovered } from '../../state/worldProgress.js';
import { travelService, TRAVEL_SOURCES } from '../../services/travelService.js';
import { stopPointer } from './UiModalManager.js';

const FONT = 'Be Vietnam Pro, sans-serif';
const MAP_UI_OWNER = 'WorldMapHierarchyUI';
const MAP_UI_LAYOUT_VERSION = '20261001-fixed-faction-destinations-v48';
const LEGACY_TO_ROOT = new Set(['nam_lang', 'van_tinh_hai', 'than_chau', 'man_hoang', 'thai_hu']);
const MAX_WORLD_MARKERS = 14;
const MAX_FACTION_MARKERS = 8;
const FILTERS = Object.freeze(['all', 'world', 'city', 'sect']);

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

function truncateLabel(value, max = 50) {
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

function resolveNodeRuler(scene, node) {
  if (!node) return null;
  if (node.rulerFaction) return node.rulerFaction;
  const network = scene?.network
    || scene?.getFactionRuntime?.()?.network
    || scene?.getFactionRuntimeCoordinator?.()?.network
    || HUMAN_REALM_FACTION_NETWORK
    || null;
  const rulerFaction = (network?.canonicalAtlas?.getRulerForJurisdiction?.(node.id))
    || (network?.getRulerForJurisdiction?.(node.id))
    || (network?.getLocalFactionsForJurisdiction?.(node.id)?.[0])
    || null;
  if (rulerFaction) {
    const family = isFamilyArchetype(rulerFaction.archetype);
    const dynasty = rulerFaction.archetype === 'IMPERIAL_DYNASTY' || rulerFaction.archetype === 'ROYAL_COURT' || (rulerFaction.tags && rulerFaction.tags.includes('dynasty'));
    const typeLabel = dynasty ? 'Hoàng Triều' : family ? 'Thế Gia' : 'Tông Môn';
    return {
      id: rulerFaction.id,
      name: rulerFaction.name,
      type: typeLabel,
      archetype: rulerFaction.archetype,
      rankLabel: rulerFaction.meta?.rankLabel || (rulerFaction.duty ? `${typeLabel} ${rulerFaction.duty}` : typeLabel),
      faction: rulerFaction
    };
  }
  if (node.ruler) {
    const isFamily = node.ruler.type === 'Thế Gia' || node.ruler.type === 'Gia Tộc';
    const isDynasty = node.ruler.type === 'Hoàng Triều' || node.ruler.type === 'Hoàng Tộc';
    const typeLabel = isDynasty ? 'Hoàng Triều' : isFamily ? 'Thế Gia' : 'Tông Môn';
    return {
      name: node.ruler.name,
      type: typeLabel,
      rankLabel: node.ruler.rankLabel || typeLabel
    };
  }
  return null;
}


function typeText(node) {
  const labels = {
    realm: 'NHÂN GIỚI', continent: 'ĐẠI LỤC', great_region: 'ĐẠI VỰC', region: 'VỰC', province: 'LÃNH THỔ',
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
  if (!node) return null;
  const policy = getNodeRuntimePolicy(node);
  if (policy === RUNTIME_POLICIES.NONE) return null;
  if (node.playableMapId != null) return findMapById(node.playableMapId);
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
    if (['nation', 'province', 'region', 'great_region'].includes(cursor.type)) return cursor;
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
  const textured = Boolean(options.texture && scene.textures.exists(options.texture));
  const bg = textured
    ? scene.add.image(x, y, options.texture).setDisplaySize(w, h).setAlpha(options.alpha ?? 1)
    : scene.add.rectangle(x, y, w, h, fill, options.alpha ?? 1)
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
    const baseScaleX = bg.scaleX;
    const baseScaleY = bg.scaleY;
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => {
      if (textured) bg.setScale(baseScaleX * 1.03, baseScaleY * 1.03);
      else bg.setStrokeStyle(2.2, options.hoverStroke ?? 0xffffff);
    });
    bg.on('pointerout', () => {
      if (textured) bg.setScale(baseScaleX, baseScaleY);
      else bg.setStrokeStyle(options.lineWidth ?? 1.5, stroke);
    });
    bg.on('pointerdown', pointer => {
      stopPointer(scene, pointer);
      onPress?.();
    });
  }
  panel.add([bg, txt]);
  return bg;
}

function travelTo(scene, map, displayName) {
  if (!map) return;
  scene?.closeModal?.();
  travelService.travel(map.id, {
    scene,
    source: TRAVEL_SOURCES.WORLD_MAP,
    customMessage: `Đã đến: ${displayName || map.name}`
  });
}

function factionGovernedNode(marker, activeNode) {
  const faction = marker?.faction;
  const nodeId = marker?.worldNodeId
    || faction?.meta?.governedNodeId
    || faction?.meta?.mapNodeId
    || faction?.homeTerritoryId
    || activeNode?.id;
  return nodeId ? getWorldNode(String(nodeId)) : null;
}

function factionHeadquartersMapId(faction) {
  const declaredMapId = faction?.headquarters?.playableMapId;
  return declaredMapId ? String(declaredMapId) : null;
}

function factionRuntimeDestination(faction, governedNode) {
  const headquartersMapId = factionHeadquartersMapId(faction);
  const headquartersMap = headquartersMapId ? findMapById(headquartersMapId) : null;
  return Object.freeze({
    node: governedNode || null,
    map: headquartersMap || null,
    kind: headquartersMap ? 'faction_headquarters' : 'missing_faction_map',
    direct: Boolean(headquartersMap)
  });
}

function factionTravelLabel(faction, destination) {
  if (!destination?.map) return 'CHƯA CÓ MAP';
  if (destination.kind === 'faction_headquarters') return isFamilyArchetype(faction?.archetype) ? 'VÀO THẾ GIA' : 'VÀO TÔNG MÔN';
  return 'DI CHUYỂN';
}

function markerKind(node, map) {
  if (map && sameMapId(map.id, gameState.currentMapId)) return 'current';
  if (map && isCityMap(map)) return 'city';
  if ((map && isSectMap(map)) || ['sect', 'peak', 'hall'].includes(node?.type)) return 'sect';
  if (map?.isPeaceZone) return 'hub';
  if (map) return 'world';
  return 'region';
}

function buildFactionMarkers(scene, activeNode) {
  // Factions are now seamlessly embedded directly in each territory/location marker.
  // Returning empty array here eliminates duplicate floating faction markers that caused text overlap.
  return [];
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

  immediate.forEach((child, index) => {
    const isSecret = child.locationKind?.includes('secret') || child.locationKind === 'secret_realm' || child.type === 'secret_realm';
    const isWild = child.locationKind?.includes('wild') || child.locationKind === 'field';
    const isStarter = child.locationKind === 'safe_hub' || child.id === 'nl.loc.thanh_ha.thanh_van_thon' || child.id === 'nl.loc.thanh_ha.thanh_van_ngoai_vi';
    const isPrimary = ['great_region', 'region', 'province', 'nation', 'continent', 'city_territory', 'city'].includes(child.type);
    const prio = isStarter ? (1 + index) : isPrimary ? (10 + index) : isWild ? (30 + index) : isSecret ? (50 + index) : (70 + index);
    push(child, resolveNodeMap(child), prio);
  });

  return selected.sort((a, b) => a.priority - b.priority);
}

function markerVisible(marker, filter) {
  if (marker.kind === 'current') return true;
  if (filter === 'all') return true;
  if (filter === 'city') return marker.kind === 'city';
  if (filter === 'sect') return marker.kind === 'sect' || Boolean(marker.node && resolveNodeRuler(null, marker.node));
  return !['city', 'sect'].includes(marker.kind);
}

function markerSlot(marker, index, total, allMarkers = []) {
  const node = marker?.node;
  const kind = node?.locationKind || '';
  const type = node?.type || '';
  const dir = node?.direction || '';

  // 1. Starter Maps
  if (kind === 'safe_hub' || node?.id === 'nl.loc.thanh_ha.thanh_van_thon') {
    return [-75, 0];
  }
  if (node?.id === 'nl.loc.thanh_ha.thanh_van_ngoai_vi') {
    return [75, 0];
  }

  // 2. 2 Bí Cảnh (kéo ra sát 02 mép: Mép Trên Cùng & Mép Dưới Cùng)
  const isSecret = kind.includes('secret') || kind === 'secret_realm' || type === 'secret_realm';
  if (isSecret) {
    if (dir === 'Trên') return [0, -245];
    if (dir === 'Dưới') return [0, 245];
    const secretMarkers = allMarkers.filter(m => m.node?.locationKind?.includes('secret') || m.node?.locationKind === 'secret_realm' || m.node?.type === 'secret_realm');
    const sIdx = secretMarkers.indexOf(marker);
    return sIdx === 0 ? [0, -245] : [0, 245];
  }

  // 3. 5 Khu Vực Chính (4 hướng Đông - Tây - Nam - Bắc và Ở Giữa)
  const isPrimary = ['great_region', 'region', 'province', 'nation', 'continent', 'city_territory', 'city'].includes(type);
  if (isPrimary) {
    const primarySlots = [
      [0, -115],   // Bắc (Trên)
      [-135, -15], // Tây (Trái)
      [0, -15],    // Trung (Ở giữa)
      [135, -15],  // Đông (Phải)
      [0, 85]      // Nam (Dưới)
    ];
    if (dir === 'Bắc') return [0, -115];
    if (dir === 'Tây') return [-135, -15];
    if (dir === 'Trung' || dir === 'Giữa' || dir === 'Ở Giữa') return [0, -15];
    if (dir === 'Đông') return [135, -15];
    if (dir === 'Nam') return [0, 85];

    const primaryMarkers = allMarkers.filter(m => ['great_region', 'region', 'province', 'nation', 'continent', 'city_territory', 'city'].includes(m.node?.type));
    const pIdx = primaryMarkers.indexOf(marker);
    return primarySlots[pIdx >= 0 ? pIdx % primarySlots.length : index % primarySlots.length];
  }

  // 4. 5 Hoang Dã / Dã Ngoại (Bố trí xen kẽ ở các góc để không chồng lên 5 khu vực chính và 2 bí cảnh)
  const isWild = kind.includes('wild') || kind === 'field';
  if (isWild) {
    const wildSlots = [
      [-125, -175], // 0: Tây Bắc
      [125, -175],  // 1: Đông Bắc
      [-125, 155],  // 2: Tây Nam
      [125, 155],   // 3: Đông Nam
      [0, 165]      // 4: Cận Nam
    ];
    const wildMarkers = allMarkers.filter(m => m.node?.locationKind?.includes('wild') || m.node?.locationKind === 'field');
    const wIdx = wildMarkers.indexOf(marker);
    return wildSlots[wIdx >= 0 ? wIdx % wildSlots.length : index % wildSlots.length];
  }

  // 5. Default Fallback Slots
  const defaultSlots = [
    [0, -115], [-135, -15], [0, -15], [135, -15], [0, 85],
    [-125, -175], [125, -175], [-125, 155], [125, 155]
  ];
  return defaultSlots[index % defaultSlots.length];
}


function renderTerrain(scene, mapContainer, activeNode) {
  if (activeNode?.id === HUMAN_REALM_ROOT_ID && scene.textures.exists('human_realm_atlas')) {
    mapContainer.add(scene.add.image(0, 0, 'human_realm_atlas').setDisplaySize(456, 568));
    return;
  }
  if (scene.textures.exists('sub_level_atlas')) {
    mapContainer.add(scene.add.image(0, 0, 'sub_level_atlas').setDisplaySize(456, 568));
    return;
  }
  if (scene.textures.exists('world_map_tiles')) {
    const seed = [...String(activeNode?.id || activeNode?.name || 'world')]
      .reduce((value, char) => ((value * 31) + char.charCodeAt(0)) >>> 0, 7);
    const byType = {
      sect: [14, 15], peak: [14, 15], hall: [14, 15],
      settlement: [6, 7], city_territory: [4, 5], nation: [4, 5],
      great_region: [0, 1, 2, 3], province: [0, 1, 2, 3]
    };
    const byKind = {
      secret_realm: [12, 13], forbidden_zone: [9, 10, 11], dungeon: [12, 13],
      prov_secret: [12, 13], nat_secret: [12, 13],
      prov_wild: [8, 9, 10, 11], nat_wild: [8, 9, 10, 11],
      town: [5, 6], market: [5], resource: [8, 10]
    };
    const frames = byKind[activeNode?.locationKind] || byType[activeNode?.type] || [0, 8, 12, 14];
    mapContainer.add(scene.add.image(0, 0, 'world_map_tiles', frames[seed % frames.length])
      .setDisplaySize(456, 568));
    return;
  }
  const g = scene.add.graphics();
  g.setScale(1, 1.5);
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
  const node = marker.node;
  const kind = node?.locationKind || '';
  const type = node?.type || '';

  const isSecret = kind.includes('secret') || kind === 'secret_realm';
  const isWild = kind.includes('wild') || kind === 'field';
  const isStarterVillage = kind === 'safe_hub' || node?.id === 'nl.loc.thanh_ha.thanh_van_thon';
  const isStarterOutskirt = node?.id === 'nl.loc.thanh_ha.thanh_van_ngoai_vi';
  const isPrimary = ['great_region', 'province', 'nation', 'continent', 'city_territory', 'city'].includes(type);

  let accent = locked ? COLOR.locked : current ? 0x00e5ff : (marker.accent || COLOR.blue);
  let bgFill = 0x071e2e;
  let strokeColor = 0x38bdf8;
  let textColor = '#ffffff';

  if (isSecret) {
    accent = 0xd946ef;
    strokeColor = 0xd946ef;
    bgFill = 0x22082e;
    textColor = '#f5d0fe';
  } else if (isWild) {
    accent = 0x22c55e;
    strokeColor = 0x22c55e;
    bgFill = 0x052112;
    textColor = '#bbf7d0';
  } else if (isStarterVillage) {
    accent = 0xfacc15;
    strokeColor = 0xfacc15;
    bgFill = 0x2e1e02;
    textColor = '#fef08a';
  } else if (isStarterOutskirt) {
    accent = 0xf97316;
    strokeColor = 0xf97316;
    bgFill = 0x2e0f02;
    textColor = '#fed7aa';
  } else if (isPrimary) {
    accent = 0x00e5ff;
    strokeColor = 0x00e5ff;
    bgFill = 0x031828;
    textColor = '#ffffff';
  }

  const callout = scene.add.container(x, y);
  const ruler = resolveNodeRuler(scene, node);
  let labelName, rulerName, boxW, boxH;

  if (ruler) {
    const isClan = ruler.type === 'Thế Gia' || ruler.type === 'Gia Tộc';
    const isDynasty = ruler.type === 'Hoàng Triều' || ruler.type === 'Hoàng Tộc';
    const subColor = isDynasty ? '#fde047' : isClan ? '#fdba74' : '#d8b4fe';
    const subIcon = isDynasty ? '👑 ' : isClan ? '🏛️ ' : '⛩️ ';

    labelName = scene.add.text(0, -8, truncateLabel(marker.label, 26), {
      fontFamily: FONT,
      fontSize: selected ? '12.5px' : '11.5px',
      fontStyle: 'bold',
      color: locked ? '#9aa8ae' : current ? '#ffe27a' : textColor,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    rulerName = scene.add.text(0, 8, truncateLabel(`${subIcon}${ruler.name}`, 24), {
      fontFamily: FONT,
      fontSize: selected ? '10px' : '9px',
      fontStyle: 'bold',
      color: subColor,
      stroke: '#000000',
      strokeThickness: 2.5
    }).setOrigin(0.5);

    boxW = Math.max(110, Math.max(labelName.width, rulerName.width) + 22);
    boxH = selected ? 42 : 38;
  } else {
    labelName = scene.add.text(0, 0, truncateLabel(marker.label, 36), {
      fontFamily: FONT,
      fontSize: selected ? '13px' : '11.5px',
      fontStyle: 'bold',
      color: locked ? '#9aa8ae' : current ? '#ffe27a' : textColor,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    boxW = Math.max(88, labelName.width + 20);
    boxH = selected ? 28 : 24;
  }

  const glowBg = (selected || current)
    ? scene.add.rectangle(0, 0, boxW + 8, boxH + 8, accent, 0.35)
    : null;
  const labelBg = scene.add.rectangle(0, 0, boxW, boxH, bgFill, 0.94)
    .setStrokeStyle(selected ? 2.5 : 1.8, strokeColor, 0.95);
  const hit = scene.add.rectangle(0, 0, boxW + 10, boxH + 10, 0x000000, 0.001)
    .setInteractive({ useHandCursor: true });

  hit.on('pointerdown', pointer => {
    stopPointer(scene, pointer);
    onSelect(marker);
  });

  if (glowBg) callout.add(glowBg);
  callout.add([labelBg, labelName, rulerName, hit].filter(Boolean));
  mapContainer.add(callout);
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
      state.inspectFactionMode = false;
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

function getEnemyInfoForNode(node) {
  const id = node?.id || '';
  const kind = node?.locationKind || '';
  const isSecret = kind.includes('secret') || node?.type === 'secret_realm' || node?.displayTypeLabel === 'BÍ CẢNH';

  let contKey = 'south';
  if (id.includes('dong_huyen') || id.includes('.dh') || id.startsWith('dh')) contKey = 'east';
  else if (id.includes('tay_mac') || id.includes('.tm') || id.startsWith('tm')) contKey = 'west';
  else if (id.includes('bac_minh') || id.includes('.bm') || id.startsWith('bm')) contKey = 'north';
  else if (id.includes('trung_vuc') || id.includes('.tv') || id.startsWith('tv')) contKey = 'center';
  else if (id.includes('nam_lang') || id.includes('.nl') || id.startsWith('nl')) contKey = 'south';

  const ENEMY_TIER_BY_CONTINENT = {
    south: { realm: 'Luyện Khí (Tầng 1 - 12)', monster: 'Yêu Thú Sơ Giai', guardian: 'Thủ Hộ: Luyện Khí Viên Mãn' },
    east: { realm: 'Trúc Cơ (Sơ Kỳ - Đỉnh Phong)', monster: 'Yêu Thú Nhị Giai', guardian: 'Thủ Hộ: Trúc Cơ Đỉnh Phong' },
    west: { realm: 'Kim Đan (Sơ Kỳ - Đỉnh Phong)', monster: 'Yêu Thú Tam Giai', guardian: 'Thủ Hộ: Kim Đan Cự Đầu' },
    north: { realm: 'Nguyên Anh (Sơ Kỳ - Đỉnh Phong)', monster: 'Cổ Thú Tứ Giai', guardian: 'Thủ Hộ: Nguyên Anh Lão Quái' },
    center: { realm: 'Hóa Thần (Sơ Kỳ - Đỉnh Phong)', monster: 'Thần Thú Ngũ Giai', guardian: 'Thủ Hộ: Hóa Thần Chí Tôn' }
  };
  const tier = ENEMY_TIER_BY_CONTINENT[contKey] || ENEMY_TIER_BY_CONTINENT.south;
  if (isSecret) {
    return {
      combatType: 'BÍ CẢNH',
      enemyText: `⚔ ${tier.guardian} • ${tier.monster}`,
      accentColor: '#f472b6',
      descDefault: 'Ẩn giấu truyền thừa đạo hạnh vô thượng, kỳ ngộ tạo hóa và cơ duyên ngàn năm.'
    };
  }
  return {
    combatType: 'CHIẾN ĐẤU',
    enemyText: `⚔ Cấp Quái: ${tier.realm} • ${tier.monster}`,
    accentColor: '#4ade80',
    descDefault: 'Hiểm trở vô biên, ẩn chứa nhiều kỳ trân dị bảo, yêu thú và dược liệu quý hiếm.'
  };
}

function renderSelectedDetail(scene, panel, activeNode, selectedMarker, openNode, selectFaction, page = 0) {
  const boxY = 328;
  const boxH = 156;
  const hasPngSkin = scene.textures.exists('world_map_ui_skin');
  const box = scene.textures.exists('map_ui_info_card')
    ? scene.add.image(0, boxY, 'map_ui_info_card').setDisplaySize(462, boxH)
    : scene.add.rectangle(0, boxY, 462, boxH, COLOR.panel2, hasPngSkin ? 0 : 1)
      .setStrokeStyle(1.4, 0x315d6d, hasPngSkin ? 0 : 1);
  panel.add(box);

  if (!selectedMarker) {
    panel.add(scene.add.text(0, 290, activeNode.name || 'NHÂN GIỚI', {
      fontFamily: FONT, fontSize: '22px', fontStyle: 'bold', color: '#ffe49a'
    }).setOrigin(0.5));
    panel.add(scene.add.text(0, 332, activeNode.id === HUMAN_REALM_ROOT_ID
      ? 'Chạm một đại lục để xem khu vực.'
      : 'Chạm một địa danh để xem chi tiết.', {
      fontFamily: FONT, fontSize: '13px', color: '#c8ecff'
    }).setOrigin(0.5));
    return;
  }

  const state = scene.__worldMapUiState || (scene.__worldMapUiState = { filter: 'all', selectedFactionId: null, inspectFactionMode: false });
  const node = selectedMarker.node;
  const map = selectedMarker.map;
  const ruler = selectedMarker.kind === 'faction'
    ? {
        id: selectedMarker.faction?.id,
        name: selectedMarker.faction?.name,
        type: isFamilyArchetype(selectedMarker.faction?.archetype) ? 'Thế Gia' : 'Tông Môn',
        archetype: selectedMarker.faction?.archetype,
        rankLabel: selectedMarker.faction?.meta?.rankLabel || (isFamilyArchetype(selectedMarker.faction?.archetype) ? 'Thế Gia' : 'Tông Môn'),
        faction: selectedMarker.faction
      }
    : resolveNodeRuler(scene, node);
  const rulerFaction = ruler?.faction
    || (ruler?.id ? HUMAN_REALM_FACTION_NETWORK.getFaction(ruler.id) || HUMAN_REALM_FACTION_NETWORK.canonicalAtlas.getFactionById(ruler.id) : null);

  // =========================================================================
  // CHẾ ĐỘ 2: TÌM HIỂU TÔNG MÔN / GIA TỘC / HOÀNG TRIỀU
  // =========================================================================
  if (state.inspectFactionMode && ruler) {
    const isClan = ruler.type === 'Thế Gia' || ruler.type === 'Gia Tộc';
    const isDynasty = ruler.type === 'Hoàng Triều' || ruler.type === 'Hoàng Tộc';
    const headerColor = isDynasty ? '#fde047' : isClan ? '#ffb36b' : '#c996ff';
    const headerTitle = isDynasty ? '👑 THÔNG TIN HOÀNG TRIỀU' : isClan ? '🏛️ THÔNG TIN THẾ GIA' : '⛩️ THÔNG TIN TÔNG MÔN';

    panel.add(scene.add.text(-208, 263, headerTitle, {
      fontFamily: FONT, fontSize: '9px', fontStyle: 'bold', color: headerColor
    }).setOrigin(0, 0.5));
    panel.add(scene.add.text(-208, 287, truncateLabel(ruler.name, 36), {
      fontFamily: FONT, fontSize: '17px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0, 0.5));

    const territoryName = node?.name || activeNode?.name || 'Khu Vực';
    const metaLine = `🏰 Quy mô: ${ruler.rankLabel || ruler.type} • Trấn giữ: ${territoryName}`;
    panel.add(scene.add.text(-208, 310, truncateLabel(metaLine, 56), {
      fontFamily: FONT, fontSize: '9.5px', color: '#94b3c0'
    }).setOrigin(0, 0.5));

    const leaderTitle = rulerFaction?.meta?.leaderTitle || (isDynasty ? 'Hoàng Đế' : isClan ? 'Tộc Trưởng' : 'Tông Chủ');
    const leaderName = rulerFaction?.meta?.leaderName || 'Tiên Đạo Tiền Bối';
    const technique = rulerFaction?.meta?.signatureTechnique || rulerFaction?.doctrine?.signatureTechnique || '';
    const infoLine = technique
      ? `Chưởng quản: ${leaderTitle} ${leaderName} • Truyền thừa: ${technique}`
      : `Chưởng quản: ${leaderTitle} ${leaderName} • ${rulerFaction?.meta?.seatName || 'Sơn Môn'}`;
    panel.add(scene.add.text(-208, 328, truncateLabel(infoLine, 60), {
      fontFamily: FONT, fontSize: '9.5px', color: '#bae6fd'
    }).setOrigin(0, 0.5));

    const descText = rulerFaction?.meta?.description
      || rulerFaction?.doctrine?.motto
      || 'Hội tụ linh mạch cửu tiêu, đệ tử đông đảo, uy danh hiển hách khắp cõi tu chân.';
    panel.add(scene.add.text(-208, 346, truncateLabel(descText, 110), {
      fontFamily: FONT, fontSize: '8.5px', color: '#7dd3fc',
      wordWrap: { width: 416, useAdvancedWrap: true }
    }).setOrigin(0, 0));

    // Nút 1: Quay lại
    addButton(scene, panel, -105, 386, 198, 36, '‹ QUAY LẠI', () => {
      state.inspectFactionMode = false;
      scene.openMapPanel(activeNode.id, node?.id || selectedMarker.id, page);
    }, true, {
      fill: 0x082d3a, stroke: COLOR.cyan, color: '#6df2ff', fontSize: '10.5px'
    });

    // Nút 2: Đi đến gia tộc / tông môn / hoàng triều
    const factionMapId = factionHeadquartersMapId(rulerFaction);
    const factionMap = factionMapId ? findMapById(factionMapId) : null;
    const factionAccess = factionMap ? canEnterMap(factionMap.id, gameState) : { ok: false };
    const factionCurrent = factionMap ? sameMapId(factionMap.id, gameState.currentMapId) : false;
    const factionRequired = factionMap
      ? (REALMS[factionMap.minRealm]?.name || REALMS[factionAccess.requiredRealmIdx]?.name || 'Phàm Nhân')
      : null;
    const canTravelFaction = Boolean(factionMap && !factionCurrent && factionAccess.ok);
    const destLabel = isDynasty ? 'ĐI ĐẾN HOÀNG THÀNH' : isClan ? 'ĐI ĐẾN GIA TỘC' : 'ĐI ĐẾN TÔNG MÔN';
    const travelLabel = factionCurrent
      ? 'ĐANG Ở MAP'
      : canTravelFaction
        ? destLabel
        : factionMap
          ? `KHÓA • ${factionRequired}`
          : 'XEM THẾ LỰC';

    addButton(scene, panel, 105, 386, 198, 36, travelLabel, () => {
      if (canTravelFaction) {
        travelTo(scene, factionMap, ruler.name);
      } else if (!factionMap && rulerFaction?.id) {
        selectFaction(rulerFaction.id);
      }
    }, canTravelFaction || (!factionMap && Boolean(rulerFaction?.id)), {
      fill: canTravelFaction ? 0x8d6114 : (isClan ? 0x34200d : 0x28133b),
      stroke: canTravelFaction ? COLOR.gold : (isClan ? COLOR.orange : COLOR.purple),
      color: canTravelFaction ? '#fff3b0' : (isClan ? '#ffe0bd' : '#e8d1ff'),
      fontSize: '10px',
      texture: canTravelFaction ? 'map_ui_action_gold' : null
    });
    return;
  }

  // =========================================================================
  // CHẾ ĐỘ 1: MẶC ĐỊNH (THÔNG TIN ĐỊA DANH + 2 TÙY CHỌN TIẾP TỤC / TÌM HIỂU)
  // =========================================================================
  const access = map ? canEnterMap(map.id, gameState) : { ok: true };
  const current = map ? sameMapId(map.id, gameState.currentMapId) : false;
  const required = map ? (REALMS[map.minRealm]?.name || REALMS[access.requiredRealmIdx]?.name || 'Phàm Nhân') : 'Phàm Nhân';
  const hasChildren = node ? getWorldChildren(node.id).length > 0 : false;
  const meta = map ? destinationMeta(node, map) : null;
  const isCombat = Boolean(map && !map.isPeaceZone);

  const displayType = (meta?.label || typeText(node) || 'ĐỊA DANH').toUpperCase();
  panel.add(scene.add.text(-208, 263, displayType, {
    fontFamily: FONT, fontSize: '10px', fontStyle: 'bold', color: meta?.kind === 'sect' ? '#cf9dff' : '#69dff3'
  }).setOrigin(0, 0.5));

  panel.add(scene.add.text(-208, 287, truncateLabel(node?.name || map?.name || selectedMarker.label, 36), {
    fontFamily: FONT, fontSize: '18px', fontStyle: 'bold', color: '#ffe49a',
    stroke: '#000000', strokeThickness: 3
  }).setOrigin(0, 0.5));

  if (ruler) {
    const isClan = ruler.type === 'Thế Gia' || ruler.type === 'Gia Tộc';
    const isDynasty = ruler.type === 'Hoàng Triều' || ruler.type === 'Hoàng Tộc';
    const rulerIcon = isDynasty ? '👑' : isClan ? '🏛️' : '⛩️';
    const rulerColor = isDynasty ? '#fde047' : isClan ? '#ffc27d' : '#d8b4fe';

    panel.add(scene.add.text(-208, 312, truncateLabel(`${rulerIcon} Trấn Giữ: ${ruler.name} • ${ruler.rankLabel || ruler.type}`, 50), {
      fontFamily: FONT, fontSize: '11.5px', fontStyle: 'bold', color: rulerColor,
      stroke: '#000000', strokeThickness: 2.5
    }).setOrigin(0, 0.5));
  } else {
    const enemyInfo = node ? getEnemyInfoForNode(node) : null;
    const statusLine = isCombat
      ? `⚔ Cấp Quái: ${required} • Yêu Thú Sơ Giai • ${nodeStatus(node)}`
      : enemyInfo
        ? enemyInfo.enemyText
        : `⌂ Khu An Toàn • ${nodeStatus(node)}`;
    panel.add(scene.add.text(-208, 312, statusLine, {
      fontFamily: FONT, fontSize: '11.5px', fontStyle: 'bold', color: isCombat ? '#4ade80' : '#93c5fd',
      stroke: '#000000', strokeThickness: 2.5
    }).setOrigin(0, 0.5));
  }

  panel.add(scene.add.text(-208, 332, truncateLabel(node?.desc || map?.sub || 'Phong thủy bảo địa, linh khí cửu tiêu dồi dào, hội tụ nhiều cơ duyên tu đạo.', 120), {
    fontFamily: FONT, fontSize: '10px', color: '#bfe7f9',
    wordWrap: { width: 416, useAdvancedWrap: true },
    lineSpacing: 2
  }).setOrigin(0, 0));

  // Tùy chọn nút bấm
  if (ruler) {
    // 2 TÙY CHỌN: Tiếp tục đi vào khu vực đó | Tìm hiểu tông môn/gia tộc
    const canEnterDirect = Boolean(map && !current && access.ok);
    const canEnterHierarchy = Boolean(!map && hasChildren);
    const enterLabel = current
      ? 'ĐANG Ở ĐÂY'
      : map
        ? (access.ok ? 'TIẾP TỤC ĐI VÀO' : `KHÓA • ${required}`)
        : 'TIẾP TỤC ĐI VÀO';

    addButton(scene, panel, -105, 386, 198, 38, enterLabel, () => {
      if (map) {
        if (canEnterDirect) travelTo(scene, map, node?.name || map.name);
      } else if (hasChildren) {
        state.inspectFactionMode = false;
        openNode(node.id, null);
      }
    }, canEnterDirect || canEnterHierarchy, {
      fill: (canEnterDirect || canEnterHierarchy) ? 0x8d6114 : 0x17212a,
      stroke: (canEnterDirect || canEnterHierarchy) ? COLOR.gold : COLOR.muted,
      color: (canEnterDirect || canEnterHierarchy) ? '#fff3b0' : '#728a94',
      fontSize: '10.5px',
      texture: (canEnterDirect || canEnterHierarchy) ? 'map_ui_action_gold' : null
    });

    const isClan = ruler.type === 'Thế Gia' || ruler.type === 'Gia Tộc';
    const isDynasty = ruler.type === 'Hoàng Triều' || ruler.type === 'Hoàng Tộc';
    const inspectLabel = isDynasty ? 'TÌM HIỂU HOÀNG TRIỀU' : isClan ? 'TÌM HIỂU GIA TỘC' : 'TÌM HIỂU TÔNG MÔN';

    addButton(scene, panel, 105, 386, 198, 38, inspectLabel, () => {
      state.inspectFactionMode = true;
      scene.openMapPanel(activeNode.id, node?.id || selectedMarker.id, page);
    }, true, {
      fill: isDynasty ? 0x3d3005 : isClan ? 0x34200d : 0x28133b,
      stroke: isDynasty ? COLOR.gold : isClan ? COLOR.orange : COLOR.purple,
      color: isDynasty ? '#ffe49a' : isClan ? '#ffe0bd' : '#e8d1ff',
      fontSize: '10px'
    });
  } else {
    // Không có thế lực trấn giữ (Bí cảnh, dã ngoại...)
    if (hasChildren && map) {
      addButton(scene, panel, -105, 386, 198, 38, 'TIẾP TỤC ĐI VÀO', () => openNode(node.id, map.id), true, {
        fill: 0x082d3a, stroke: meta?.accent || COLOR.cyan, color: '#6df2ff', fontSize: '11px'
      });
      addButton(scene, panel, 105, 386, 198, 38,
        current ? 'ĐANG Ở ĐÂY' : access.ok ? 'DI CHUYỂN' : `KHÓA • ${required}`,
        () => travelTo(scene, map, meta?.name || map.name),
        !current && access.ok,
        {
          fill: !current && access.ok ? 0x8d6114 : 0x17212a,
          stroke: !current && access.ok ? COLOR.gold : COLOR.muted,
          color: !current && access.ok ? '#fff3b0' : '#728a94',
          fontSize: '11px',
          texture: !current && access.ok ? 'map_ui_action_gold' : null
        }
      );
    } else if (hasChildren) {
      addButton(scene, panel, 0, 386, 410, 38, 'TIẾP TỤC ĐI VÀO', () => openNode(node.id, null), true, {
        fill: 0x082d3a, stroke: COLOR.cyan, color: '#6df2ff', fontSize: '12px'
      });
    } else if (map) {
      addButton(scene, panel, 0, 386, 410, 38,
        current ? 'ĐANG Ở ĐÂY' : access.ok ? 'TIẾP TỤC ĐI VÀO' : `KHÓA • ${required}`,
        () => travelTo(scene, map, meta?.name || map.name),
        !current && access.ok,
        {
          fill: !current && access.ok ? 0x8d6114 : 0x17212a,
          stroke: !current && access.ok ? COLOR.gold : COLOR.muted,
          color: !current && access.ok ? '#fff3b0' : '#728a94',
          fontSize: '12px',
          texture: !current && access.ok ? 'map_ui_action_gold' : null
        }
      );
    }
  }
}

function renderVisualMap(scene, panel, activeNode, selectedMapId, page = 0) {
  const state = scene.__worldMapUiState || (scene.__worldMapUiState = { filter: 'all', selectedFactionId: null, inspectFactionMode: false });
  if (!FILTERS.includes(state.filter)) state.filter = 'all';

  const worldMarkers = buildWorldMarkers(scene, activeNode);
  const factionMarkers = buildFactionMarkers(scene, activeNode);
  const allMarkers = [...worldMarkers, ...factionMarkers];
  const filteredWorldMarkers = worldMarkers.filter(marker => markerVisible(marker, state.filter));
  const filteredFactionMarkers = factionMarkers.filter(marker => markerVisible(marker, state.filter));
  const filteredMarkers = [...filteredWorldMarkers, ...filteredFactionMarkers];
  const rootAtlas = activeNode.id === HUMAN_REALM_ROOT_ID && scene.textures.exists('human_realm_atlas');
  const pageCount = Math.max(1, Math.ceil(filteredWorldMarkers.length / MAX_WORLD_MARKERS));
  const safePage = Phaser.Math.Clamp(Number(page) || 0, 0, pageCount - 1);
  const visibleWorldMarkers = rootAtlas
    ? filteredWorldMarkers
    : filteredWorldMarkers.slice(safePage * MAX_WORLD_MARKERS, (safePage + 1) * MAX_WORLD_MARKERS);
  const visibleFactionMarkers = rootAtlas ? [] : filteredFactionMarkers;
  const visible = [...visibleWorldMarkers, ...visibleFactionMarkers];

  let selectedMarker = null;
  if (state.selectedFactionId) {
    selectedMarker = allMarkers.find(marker => marker.kind === 'faction' && (marker.id === state.selectedFactionId || marker.faction?.id === state.selectedFactionId)) || null;
  }
  if (!selectedMarker && selectedMapId != null) {
    selectedMarker = allMarkers.find(marker =>
      marker.id === selectedMapId ||
      marker.node?.id === selectedMapId ||
      `node:${marker.node?.id}` === selectedMapId ||
      (marker.map && sameMapId(marker.map.id, selectedMapId))
    ) || null;
  }

  panel.add(scene.add.text(0, -428, truncateLabel(activeNode.name || 'NHÂN GIỚI', 32), {
    fontFamily: FONT, fontSize: '17px', fontStyle: 'bold', color: '#ffe49a'
  }).setOrigin(0.5));
  panel.add(scene.add.text(0, -404, `${typeText(activeNode)} • ${filteredMarkers.length || 0} ĐỊA DANH`, {
    fontFamily: FONT, fontSize: '8.5px', fontStyle: 'bold', color: '#75dff6'
  }).setOrigin(0.5));

  const mapContainer = scene.add.container(0, -105);
  panel.add(mapContainer);
  renderTerrain(scene, mapContainer, activeNode);

  const mapClearHit = scene.add.rectangle(0, 0, 456, 568, 0x000000, 0.001).setInteractive({ useHandCursor: false });
  mapClearHit.on('pointerdown', pointer => {
    stopPointer(scene, pointer);
    state.selectedFactionId = null;
    state.inspectFactionMode = false;
    scene.openMapPanel(activeNode.id, null, page);
  });
  mapContainer.add(mapClearHit);

  if (rootAtlas) {
    const CONTINENT_AREAS = [
      { id: 'bm', name: 'Bắc Minh Đại Lục', x: 0, y: -160, w: 220, h: 120 },
      { id: 'tm', name: 'Tây Mạc Đại Lục', x: -145, y: -20, w: 140, h: 140 },
      { id: 'tv', name: 'Trung Vực Đại Lục', x: 0, y: -20, w: 130, h: 140 },
      { id: 'dh', name: 'Đông Huyền Đại Lục', x: 145, y: -20, w: 140, h: 140 },
      { id: 'nl', name: 'Nam Lăng Đại Lục', x: 0, y: 155, w: 260, h: 160 }
    ];

    CONTINENT_AREAS.forEach(area => {
      const hit = scene.add.rectangle(area.x, area.y, area.w, area.h, 0x000000, 0.001)
        .setInteractive({ useHandCursor: true });
      const hoverGlow = scene.add.rectangle(area.x, area.y, area.w, area.h, 0x38bdf8, 0.0)
        .setStrokeStyle(1.5, 0x38bdf8, 0)
        .setVisible(false);
      hit.on('pointerover', () => {
        hoverGlow.setVisible(true).setFillStyle(0x38bdf8, 0.10).setStrokeStyle(1.5, 0x38bdf8, 0.7);
      });
      hit.on('pointerout', () => {
        hoverGlow.setVisible(false);
      });
      hit.on('pointerdown', pointer => {
        stopPointer(scene, pointer);
        state.selectedFactionId = null;
        state.inspectFactionMode = false;
        scene.openMapPanel(area.id, null, 0);
      });
      mapContainer.add([hoverGlow, hit]);
    });
  } else {
    const positioned = new Map();
    const worldVisible = visibleWorldMarkers;
    worldVisible.forEach((marker, index) => {
      const [x, y] = markerSlot(marker, index, worldVisible.length, worldVisible);
      positioned.set(marker.id, [x, y]);
    });


    const currentMarker = worldVisible.find(marker => marker.map && sameMapId(marker.map.id, gameState.currentMapId));
    const currentPos = currentMarker ? positioned.get(currentMarker.id) : null;
    const selectedPos = selectedMarker ? positioned.get(selectedMarker.id) : null;
    renderRoute(scene, mapContainer, currentPos, selectedPos);

    visible.forEach(marker => {
      const pos = positioned.get(marker.id);
      if (!pos) return;
      renderMarker(scene, mapContainer, marker, pos, selectedMarker?.id === marker.id, picked => {
        state.inspectFactionMode = false;
        if (picked.kind === 'faction') {
          state.selectedFactionId = picked.id;
          scene.openMapPanel(activeNode.id, null, page);
          return;
        }
        state.selectedFactionId = null;
        scene.openMapPanel(activeNode.id, picked.node?.id || picked.id || picked.map?.id, page);
      });
    });
  }

  if (!rootAtlas && pageCount > 1) {
    addButton(scene, panel, 100, 220, 54, 30, '‹', () => {
      state.inspectFactionMode = false;
      scene.openMapPanel(activeNode.id, null, Math.max(0, safePage - 1));
    }, safePage > 0, { fontSize: '17px', fill: 0x071b25, stroke: COLOR.cyan });
    panel.add(scene.add.text(0, 220, `TRANG ${safePage + 1}/${pageCount}`, {
      fontFamily: FONT, fontSize: '12px', fontStyle: 'bold', color: '#d8f7ff'
    }).setOrigin(0.5));
    addButton(scene, panel, 170, 220, 54, 30, '›', () => {
      state.inspectFactionMode = false;
      scene.openMapPanel(activeNode.id, null, Math.min(pageCount - 1, safePage + 1));
    }, safePage < pageCount - 1, { fontSize: '17px', fill: 0x071b25, stroke: COLOR.cyan });
  }

  if (activeNode.parentId) {
    addButton(scene, panel, -185, 225, 112, 38, '‹ LÊN', () => {
      state.selectedFactionId = null;
      state.inspectFactionMode = false;
      scene.openMapPanel(activeNode.parentId, null, 0);
    }, true, { fontSize: '8px', fill: 0x071b25, stroke: COLOR.blue, texture: 'map_ui_back_button', color: '#fff3b5' });
  }

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
      state.inspectFactionMode = false;
      scene.openMapPanel(nodeId, mapId, 0);
    },
    factionId => scene.openFactionPanel?.(factionId),
    safePage
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

    if (!scene.__worldMapUiState) scene.__worldMapUiState = { filter: 'all', selectedFactionId: null, inspectFactionMode: false };
    if (LEGACY_TO_ROOT.has(activeNodeId)) activeNodeId = HUMAN_REALM_ROOT_ID;

    let node = activeNodeId ? getWorldNode(activeNodeId) : getWorldNode(HUMAN_REALM_ROOT_ID);
    if (!node) node = currentContextNode() || getWorldNode(HUMAN_REALM_ROOT_ID);
    scene.__lastMapNodeId = node?.id || HUMAN_REALM_ROOT_ID;

    const panel = scene.createModalShell(
      '',
      '',
      {
        subtitleColor: '#7ad8ff',
        headerFill: 0x040d16,
        bgFill: COLOR.panel,
        noCloseBtn: true
      }
    );
    panel.header.setVisible(false);
    panel.titleTxt.setVisible(false);
    panel.subtitleTxt.setVisible(false);

    if (scene.textures.exists('world_map_ui_skin')) {
      const skin = scene.add.image(0, 0, 'world_map_ui_skin').setDisplaySize(534, 954).setScrollFactor(0);
      panel.addAt(skin, 1);
    }
    if (scene.textures.exists('map_ui_close_button')) {
      const close = scene.add.image(207, -432, 'map_ui_close_button').setDisplaySize(58, 58).setInteractive({ useHandCursor: true });
      close.on('pointerdown', pointer => { stopPointer(scene, pointer); scene.closeModal?.(); });
      panel.add(close);
    } else {
      addButton(scene, panel, 207, -432, 58, 48, '×', () => scene.closeModal?.(), true, { fill: 0xb8193c, stroke: 0xffd1d9, fontSize: '26px' });
    }

    if (node.parentId) {
      if (scene.textures.exists('map_ui_back_button')) {
        const back = scene.add.image(-207, -432, 'map_ui_back_button').setDisplaySize(58, 58).setInteractive({ useHandCursor: true });
        back.on('pointerdown', pointer => {
          stopPointer(scene, pointer);
          if (scene.__worldMapUiState) {
            scene.__worldMapUiState.selectedFactionId = null;
            scene.__worldMapUiState.inspectFactionMode = false;
          }
          scene.openMapPanel(node.parentId, null, 0);
        });
        panel.add(back);
      } else {
        addButton(scene, panel, -207, -432, 58, 48, '‹', () => {
          if (scene.__worldMapUiState) {
            scene.__worldMapUiState.selectedFactionId = null;
            scene.__worldMapUiState.inspectFactionMode = false;
          }
          scene.openMapPanel(node.parentId, null, 0);
        }, true, { fill: 0x082d3a, stroke: COLOR.cyan, fontSize: '26px' });
      }
    }

    renderVisualMap(scene, panel, node, selectedMapId, page);
    return panel;
  };
}
