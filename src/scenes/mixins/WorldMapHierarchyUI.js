/**
 * WorldMapHierarchyUI.js
 * SINGLE WORLD MAP UI OWNER.
 * Nhân Giới → Đại Lục → cấu trúc lãnh thổ riêng của từng Đại Lục → các cấp địa phương.
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
import { ensureWorldProgress, hasVisitedMap, hasWaypoint, isNodeDiscovered } from '../../state/worldProgress.js';
import { stopPointer } from './UiModalManager.js';

const FONT = 'Be Vietnam Pro, sans-serif';
const PAGE_SIZE = 6;
const MAP_UI_OWNER = 'WorldMapHierarchyUI';
const TYPE_LABEL = Object.freeze({
  realm: 'NHÂN GIỚI',
  continent: 'ĐẠI LỤC',
  great_region: 'ĐẠI VỰC',
  province: 'CHÂU',
  nation: 'QUỐC / THẾ LỰC',
  commandery: 'QUẬN',
  city_territory: 'THÀNH VỰC',
  location: 'ĐỊA ĐIỂM'
});
const LOCATION_KIND_LABEL = Object.freeze({
  safe_hub: 'THÔN AN TOÀN', major_hub: 'ĐẠI THÀNH', town: 'TRẤN', field: 'HOANG DÃ',
  forbidden_zone: 'CẤM ĐỊA', resource: 'TÀI NGUYÊN', dungeon: 'PHÓ BẢN', mountain: 'SƠN MẠCH',
  lake: 'LINH HỒ', secret: 'ẨN ĐỊA', secret_realm: 'BÍ CẢNH', travel: 'GIAO THÔNG', valley: 'SƠN CỐC',
  market: 'PHƯỜNG THỊ', mine: 'KHOÁNG MẠCH', tomb: 'CỔ MỘ', camp: 'DOANH ĐỊA',
  outpost: 'TIỀN ĐỒN', enemy_camp: 'SƠN TRẠI'
});
const LEGACY_TO_ROOT = new Set(['nam_lang', 'van_tinh_hai', 'than_chau', 'man_hoang', 'thai_hu']);

function addButton(scene, panel, x, y, w, h, label, onPress, opts = {}) {
  const enabled = opts.enabled !== false;
  const bg = scene.add.rectangle(x, y, w, h, enabled ? (opts.fill ?? 0x0d4057) : 0x253544, 1)
    .setStrokeStyle(2, enabled ? (opts.stroke ?? 0x55dff7) : 0x536270, 1);
  if (enabled) bg.setInteractive({ useHandCursor: true });

  const txt = scene.add.text(x, y, label, {
    fontFamily: FONT,
    fontSize: opts.fontSize || '14px',
    fontStyle: opts.fontStyle || 'bold',
    color: enabled ? (opts.color || '#f5fdff') : '#8493a0',
    align: opts.align || 'center',
    lineSpacing: 4,
    wordWrap: { width: Math.max(60, w - 20), useAdvancedWrap: true }
  }).setOrigin(0.5);

  if (enabled && onPress) {
    bg.on('pointerdown', pointer => {
      stopPointer(scene, pointer);
      onPress();
    });
  }
  panel.add([bg, txt]);
  return bg;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

function compactList(items, limit = 4) {
  if (!Array.isArray(items) || !items.length) return '';
  const shown = items.slice(0, limit);
  const more = items.length - shown.length;
  return `${shown.join(', ')}${more > 0 ? ` +${more}` : ''}`;
}

function nodeTypeText(node) {
  if (node?.displayTypeLabel) return node.displayTypeLabel;
  if (node.type === 'location' && node.locationKind) {
    return LOCATION_KIND_LABEL[node.locationKind] || TYPE_LABEL[node.type];
  }
  return TYPE_LABEL[node.type] || node.type;
}

function nodeStatus(node) {
  if (node.playableMapId != null) {
    if (Number(node.playableMapId) === Number(gameState.currentMapId)) return 'ĐANG Ở ĐÂY';
    return hasVisitedMap(gameState, node.playableMapId) ? 'ĐÃ KHÁM PHÁ' : 'CHƯA ĐẾN';
  }
  if (node.status === 'planned' || node.materialized === false || node.status === 'world_data') return 'DỮ LIỆU THẾ GIỚI';
  return isNodeDiscovered(gameState, node.id) ? 'ĐÃ BIẾT' : 'CHƯA KHÁM PHÁ';
}

function breadcrumbText(nodeId) {
  return getWorldBreadcrumb(nodeId).map(node => node.name).join(' › ');
}

function scaleSummary(node) {
  const p = node.generationProfile || {};
  const c = node.counts || {};
  const parts = [];
  const fmt = value => Array.isArray(value) ? `${formatNumber(value[0])}–${formatNumber(value[1])}` : formatNumber(value);

  if (c.continents) parts.push(`${formatNumber(c.continents)} Đại Lục`);
  if (c.primaryRegions) parts.push(`${formatNumber(c.primaryRegions)} ${node.primaryRegionLabel || 'vùng cấp cao'}`);
  if (c.territories) parts.push(`${formatNumber(c.territories)} ${node.secondaryRegionLabel || 'đơn vị cấp hai'}`);
  if (c.subdivisions) parts.push(`${formatNumber(c.subdivisions)} ${node.subdivisionLabel || 'đơn vị trực thuộc'}`);
  if (c.greatRegions) parts.push(`${formatNumber(c.greatRegions)} Đại Vực`);
  if (c.provinces) parts.push(`${formatNumber(c.provinces)} Châu`);
  if (c.politicalEntities) parts.push(`${formatNumber(c.politicalEntities)} chính thể`);
  if (c.majorStates || c.mediumStates || c.smallStates) {
    parts.push(`Đại/Trung/Tiểu: ${formatNumber(c.majorStates)}/${formatNumber(c.mediumStates)}/${formatNumber(c.smallStates)}`);
  }
  if (c.commanderies) parts.push(`${formatNumber(c.commanderies)} Quận`);
  if (c.cities) parts.push(`${formatNumber(c.cities)} Thành/Phủ`);
  if (c.townsAtLeast) parts.push(`${formatNumber(c.townsAtLeast)}+ Trấn`);
  if (c.villagesAtLeast) parts.push(`${formatNumber(c.villagesAtLeast)}+ Thôn`);
  if (c.towns) parts.push(`${formatNumber(c.towns)} Trấn`);
  if (c.villages) parts.push(`${formatNumber(c.villages)} Thôn`);

  if (!parts.length) {
    if (p.nations) parts.push(`Quốc gia/thế lực: ${fmt(p.nations)}`);
    if (p.commanderies) parts.push(`Quận: ${fmt(p.commanderies)}`);
    if (p.cities) parts.push(`Thành vực: ${fmt(p.cities)}`);
    if (p.settlements) parts.push(`Thôn/trấn: ${fmt(p.settlements)}`);
  }
  return parts.join(' • ');
}

function extraDetailLines(node) {
  const lines = [];
  const c = node.counts || {};
  if (node.structureSummary) lines.push(`Kết cấu: ${node.structureSummary}`);
  if (node.position) lines.push(`Phương vị: ${node.position}`);
  if (node.climate) lines.push(`Khí hậu/địa thế: ${node.climate}`);
  if (node.capital) lines.push(`Trung tâm: ${node.capital}`);
  if (c.mountainRanges || c.largeForests || c.miningZones || c.spiritLakes) {
    lines.push(`Địa hình: ${c.mountainRanges || 0} sơn mạch • ${c.largeForests || 0} đại lâm • ${c.miningZones || 0} khoáng khu • ${c.spiritLakes || 0} linh hồ`);
  }
  if (c.cultivationFamilies || c.minorSects || c.smallSecretRealms || c.localForbiddenZones) {
    lines.push(`Tu tiên: ${c.cultivationFamilies || 0} gia tộc • ${c.minorSects || 0} tiểu tông • ${c.smallSecretRealms || 0} bí cảnh • ${c.localForbiddenZones || 0} cấm địa`);
  }
  if (node.materializedLocationTarget) lines.push(`Playable mục tiêu: ${node.materializedLocationTarget[0]}–${node.materializedLocationTarget[1]} địa điểm quan trọng`);
  if (node.notableCities?.length) lines.push(`Thành thị: ${compactList(node.notableCities, 3)}`);
  if (node.notableTowns?.length) lines.push(`Trấn: ${compactList(node.notableTowns, 3)}`);
  if (node.secretRealms?.length) lines.push(`Bí cảnh: ${compactList(node.secretRealms, 3)}`);
  if (node.forbiddenZones?.length) lines.push(`Cấm địa: ${compactList(node.forbiddenZones, 2)}`);
  if (node.products?.length || node.signatureProducts?.length) lines.push(`Sản vật: ${compactList(node.products || node.signatureProducts, 4)}`);
  if (node.minerals?.length || node.signatureMinerals?.length) lines.push(`Khoáng vật: ${compactList(node.minerals || node.signatureMinerals, 3)}`);
  if (node.enemyProfile) lines.push(`Enemy: cảnh giới ${node.enemyProfile.minRealmIdx}–${node.enemyProfile.maxRealmIdx} • Boss ${node.enemyProfile.bossRealmIdx}`);
  if (node.notablePowers?.length) lines.push(`Thế lực: ${compactList(node.notablePowers, 4)}`);
  if (node.cultivationFactions?.length) lines.push(`Tông môn: ${compactList(node.cultivationFactions, 3)}`);
  if (node.strategicRegions?.length) lines.push(`Khu chiến lược: ${compactList(node.strategicRegions, 5)}`);
  if (node.powerScale?.length) lines.push(`Cấp sức mạnh: ${compactList(node.powerScale, 2)}`);
  if (node.capitalServices?.length) lines.push(`Dịch vụ thủ phủ: ${compactList(node.capitalServices, 5)}`);
  if (node.services?.length) lines.push(`Chức năng: ${compactList(node.services, 5)}`);
  if (node.unlockHint) lines.push(`Mở khóa: ${node.unlockHint}`);
  return lines;
}

function buildDetailText(node) {
  const sections = [node.desc || 'Chưa có mô tả.'];
  const scale = scaleSummary(node);
  if (scale) sections.push(scale);
  const extra = extraDetailLines(node);
  if (extra.length) sections.push(extra.join('\n'));
  return sections.join('\n\n');
}

function renderBrowser(scene, panel, node, page = 0) {
  const children = getWorldChildren(node.id);
  const totalPages = Math.max(1, Math.ceil(children.length / PAGE_SIZE));
  const currentPage = Math.max(0, Math.min(Number(page) || 0, totalPages - 1));
  const shown = children.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  panel.add(scene.add.text(-238, -356, breadcrumbText(node.id), {
    fontFamily: FONT, fontSize: '11px', fontStyle: 'bold', color: '#8fe8ff',
    wordWrap: { width: 476, useAdvancedWrap: true }
  }).setOrigin(0, 0.5));

  panel.add(scene.add.text(-238, -326, node.desc || '', {
    fontFamily: FONT, fontSize: '12px', color: '#d6f5ff', lineSpacing: 4,
    wordWrap: { width: 476, useAdvancedWrap: true }
  }).setOrigin(0, 0));

  const scale = scaleSummary(node);
  if (scale) {
    panel.add(scene.add.text(0, -265, scale, {
      fontFamily: FONT, fontSize: '11px', fontStyle: 'bold', color: '#ffe69a', align: 'center',
      wordWrap: { width: 470, useAdvancedWrap: true }
    }).setOrigin(0.5));
  }

  shown.forEach((child, idx) => {
    const y = -205 + idx * 82;
    const status = nodeStatus(child);
    const discovered = isNodeDiscovered(gameState, child.id) || ['realm', 'continent', 'great_region', 'province'].includes(child.type);
    const current = Number(child.playableMapId) === Number(gameState.currentMapId);
    const box = scene.add.rectangle(0, y, 476, 70, current ? 0x155a48 : 0x0d3347, 1)
      .setStrokeStyle(1.5, discovered ? 0x4fbcd8 : 0x526474, 1)
      .setInteractive({ useHandCursor: true });
    const type = scene.add.text(-216, y - 17, nodeTypeText(child), {
      fontFamily: FONT, fontSize: '10px', fontStyle: 'bold', color: '#7adfff'
    }).setOrigin(0, 0.5);
    const name = scene.add.text(-216, y + 2, child.name, {
      fontFamily: FONT, fontSize: '15px', fontStyle: 'bold', color: discovered ? '#fff1a8' : '#bbc7cd',
      wordWrap: { width: 310, useAdvancedWrap: true }
    }).setOrigin(0, 0.5);
    const state = scene.add.text(210, y, status, {
      fontFamily: FONT, fontSize: '10.5px', fontStyle: 'bold', color: current ? '#7dffca' : '#a9eaff', align: 'right'
    }).setOrigin(1, 0.5);
    box.on('pointerdown', pointer => {
      stopPointer(scene, pointer);
      scene.openMapPanel(child.id, null, 0);
    });
    panel.add([box, type, name, state]);
  });

  if (!shown.length) {
    panel.add(scene.add.text(0, -35,
      'Khu vực này chưa materialize thành các địa điểm con.\nDữ liệu sẽ được tạo khi tuyến truyện hoặc người chơi cần đến.', {
        fontFamily: FONT, fontSize: '15px', color: '#c7edf8', align: 'center', lineSpacing: 8,
        wordWrap: { width: 440, useAdvancedWrap: true }
      }).setOrigin(0.5));
  }

  if (totalPages > 1) {
    addButton(scene, panel, -125, 350, 210, 44, '‹ TRANG TRƯỚC', () => scene.openMapPanel(node.id, null, currentPage - 1), {
      enabled: currentPage > 0, fontSize: '12px'
    });
    addButton(scene, panel, 125, 350, 210, 44, `TRANG ${currentPage + 1}/${totalPages} ›`, () => scene.openMapPanel(node.id, null, currentPage + 1), {
      enabled: currentPage < totalPages - 1, fontSize: '12px'
    });
  }

  if (node.parentId) {
    addButton(scene, panel, 0, 408, 430, 46, '‹ LÊN CẤP BẢN ĐỒ TRƯỚC', () => scene.openMapPanel(node.parentId), {
      fill: 0x303e50, stroke: 0x94b8cc, fontSize: '13px'
    });
  }
}

function renderNodeDetail(scene, panel, node) {
  panel.add(scene.add.text(-238, -356, breadcrumbText(node.id), {
    fontFamily: FONT, fontSize: '11px', fontStyle: 'bold', color: '#8fe8ff',
    wordWrap: { width: 476, useAdvancedWrap: true }
  }).setOrigin(0, 0.5));

  panel.add(scene.add.text(-220, -310, nodeTypeText(node), {
    fontFamily: FONT, fontSize: '11px', fontStyle: 'bold', color: '#7adfff'
  }).setOrigin(0, 0.5));

  panel.add(scene.add.text(-220, -278, node.name, {
    fontFamily: FONT, fontSize: '24px', fontStyle: 'bold', color: '#fff19a',
    wordWrap: { width: 440, useAdvancedWrap: true }
  }).setOrigin(0, 0.5));

  const box = scene.add.rectangle(0, -80, 470, 310, 0x0d3347, 1).setStrokeStyle(1.5, 0x3c91aa);
  const info = scene.add.text(-215, -214, buildDetailText(node), {
    fontFamily: FONT, fontSize: '12.2px', color: '#e7fbff', lineSpacing: 5,
    wordWrap: { width: 430, useAdvancedWrap: true }
  }).setOrigin(0, 0);
  panel.add([box, info]);

  if (node.playableMapId != null) {
    const map = getMapById(node.playableMapId);
    const current = Number(map.id) === Number(gameState.currentMapId);
    const visited = hasVisitedMap(gameState, map.id);
    const waypoint = hasWaypoint(gameState, map.id);
    const access = canEnterMap(map.id, gameState);
    const canFastTravel = !current && visited && waypoint && access.ok;

    let travelLabel = 'CHƯA MỞ ĐIỂM DỊCH CHUYỂN';
    if (current) travelLabel = 'ĐANG Ở ĐỊA ĐIỂM NÀY';
    else if (!access.ok && access.reason === 'REALM') travelLabel = `CẦN ${REALMS[access.requiredRealmIdx]?.name || 'CẢNH GIỚI CAO HƠN'}`;
    else if (canFastTravel) travelLabel = 'DỊCH CHUYỂN ĐẾN ĐÂY';
    else if (!visited) travelLabel = 'CHƯA TỪNG ĐẶT CHÂN ĐẾN';

    addButton(scene, panel, 0, 150, 430, 60, travelLabel, () => {
      if (!canFastTravel) return;
      scene.closeModal();
      const entered = scene.switchMap(map.id);
      scene.showFloatingText?.(scene.player.x, scene.player.y - 60, `Đã dịch chuyển: ${entered.name}`, '#66ffcc');
    }, {
      enabled: canFastTravel, fill: 0x166044, stroke: 0x61ffc0, fontSize: '15px'
    });

    panel.add(scene.add.text(0, 205,
      `Yêu cầu: ${REALMS[map.minRealm]?.name || 'Không yêu cầu'} • Template: ${map.templateId}\n${visited ? 'Đã khám phá' : 'Chưa khám phá'} • ${waypoint ? 'Waypoint đã mở' : 'Waypoint chưa mở'}`, {
        fontFamily: FONT, fontSize: '11px', color: '#a9eaff', align: 'center', lineSpacing: 4
      }).setOrigin(0.5));
  } else {
    panel.add(scene.add.text(0, 175, `${nodeTypeText(node)} DỮ LIỆU • CHƯA MATERIALIZE THÀNH COMBAT/HUB MAP`, {
      fontFamily: FONT, fontSize: '12px', fontStyle: 'bold', color: '#ffcf7a', align: 'center',
      wordWrap: { width: 430, useAdvancedWrap: true }
    }).setOrigin(0.5));
  }

  if (node.parentId) {
    addButton(scene, panel, 0, 408, 430, 46, '‹ QUAY LẠI', () => scene.openMapPanel(node.parentId), {
      fill: 0x303e50, stroke: 0x94b8cc, fontSize: '13px'
    });
  }
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

  proto.openMapPanel = function openHierarchicalWorldMap(activeNodeId = HUMAN_REALM_ROOT_ID, selectedMapId = null, page = 0) {
    ensureWorldProgress(gameState);

    if (selectedMapId != null) {
      const selectedNode = getWorldNodeForMap(selectedMapId);
      if (selectedNode) activeNodeId = selectedNode.id;
    }

    if (LEGACY_TO_ROOT.has(activeNodeId)) activeNodeId = HUMAN_REALM_ROOT_ID;
    let node = getWorldNode(activeNodeId);
    if (!node) node = getWorldNodeForMap(gameState.currentMapId) || getWorldNode(HUMAN_REALM_ROOT_ID);

    const panel = this.createModalShell('ĐẠI BẢN ĐỒ NHÂN GIỚI', `${nodeTypeText(node)} • ${node.name}`, {
      subtitleColor: '#9aeaff', headerFill: 0x0a3b52, bgFill: 0x062a3b
    });

    const children = getWorldChildren(node.id);
    if (node.type === 'location' || children.length === 0) renderNodeDetail(this, panel, node);
    else renderBrowser(this, panel, node, page);
    return panel;
  };
}
