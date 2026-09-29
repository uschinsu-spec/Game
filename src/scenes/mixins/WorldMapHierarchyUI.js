/**
 * WorldMapHierarchyUI.js
 * SINGLE WORLD MAP UI OWNER.
 * Nam Lăng → Đại Vực → Châu → Quốc/Thế lực → Quận → Thành Vực → Location.
 */
import { REALMS } from '../../config/realmsData.js';
import {
  NAM_LANG_ROOT_ID,
  canEnterMap,
  getMapById,
  getWorldBreadcrumb,
  getWorldChildren,
  getWorldNode,
  getWorldNodeForMap
} from '../../config/world/worldRegistry.js';
import { gameState } from '../../state/gameState.js';
import { ensureWorldProgress, hasVisitedMap, hasWaypoint, isNodeDiscovered } from '../../state/worldProgress.js';
import { stopPointer } from './UiModalManager.js';

const FONT = 'Be Vietnam Pro, sans-serif';
const PAGE_SIZE = 6;
const MAP_UI_OWNER = 'WorldMapHierarchyUI';
const TYPE_LABEL = Object.freeze({
  continent: 'ĐẠI LỤC',
  great_region: 'ĐẠI VỰC',
  province: 'CHÂU',
  nation: 'QUỐC / THẾ LỰC',
  commandery: 'QUẬN',
  city_territory: 'THÀNH VỰC',
  location: 'ĐỊA ĐIỂM'
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

function nodeStatus(node) {
  if (node.playableMapId != null) {
    if (Number(node.playableMapId) === Number(gameState.currentMapId)) return 'ĐANG Ở ĐÂY';
    return hasVisitedMap(gameState, node.playableMapId) ? 'ĐÃ KHÁM PHÁ' : 'CHƯA ĐẾN';
  }
  if (node.status === 'planned' || node.materialized === false) return 'DỮ LIỆU THẾ GIỚI';
  return isNodeDiscovered(gameState, node.id) ? 'ĐÃ BIẾT' : 'CHƯA KHÁM PHÁ';
}

function breadcrumbText(nodeId) {
  return getWorldBreadcrumb(nodeId).map(node => node.name).join(' › ');
}

function scaleSummary(node) {
  const p = node.generationProfile || {};
  const parts = [];
  const fmt = value => Array.isArray(value) ? `${value[0]}–${value[1]}` : value;
  if (p.nations) parts.push(`Quốc gia dự kiến: ${fmt(p.nations)}`);
  if (p.commanderies) parts.push(`Quận dự kiến: ${fmt(p.commanderies)}`);
  if (p.cities) parts.push(`Thành vực dự kiến: ${fmt(p.cities)}`);
  if (p.settlements) parts.push(`Thôn/trấn dự kiến: ${fmt(p.settlements)}`);
  if (node.counts?.provinces) parts.push(`${node.counts.provinces} Châu`);
  if (node.counts?.greatRegions) parts.push(`${node.counts.greatRegions} Đại Vực`);
  return parts.join(' • ');
}

function renderBrowser(scene, panel, node, page = 0) {
  const children = getWorldChildren(node.id);
  const totalPages = Math.max(1, Math.ceil(children.length / PAGE_SIZE));
  const currentPage = Math.max(0, Math.min(Number(page) || 0, totalPages - 1));
  const shown = children.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  panel.add(scene.add.text(-238, -356, breadcrumbText(node.id), {
    fontFamily: FONT,
    fontSize: '11px',
    fontStyle: 'bold',
    color: '#8fe8ff',
    wordWrap: { width: 476, useAdvancedWrap: true }
  }).setOrigin(0, 0.5));

  panel.add(scene.add.text(-238, -326, node.desc || '', {
    fontFamily: FONT,
    fontSize: '12px',
    color: '#d6f5ff',
    lineSpacing: 4,
    wordWrap: { width: 476, useAdvancedWrap: true }
  }).setOrigin(0, 0));

  const scale = scaleSummary(node);
  if (scale) {
    panel.add(scene.add.text(0, -265, scale, {
      fontFamily: FONT,
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffe69a',
      align: 'center',
      wordWrap: { width: 470, useAdvancedWrap: true }
    }).setOrigin(0.5));
  }

  shown.forEach((child, idx) => {
    const y = -205 + idx * 82;
    const status = nodeStatus(child);
    const discovered = isNodeDiscovered(gameState, child.id) || child.type === 'great_region' || child.type === 'province';
    const current = Number(child.playableMapId) === Number(gameState.currentMapId);
    const box = scene.add.rectangle(0, y, 476, 70, current ? 0x155a48 : 0x0d3347, 1)
      .setStrokeStyle(1.5, discovered ? 0x4fbcd8 : 0x526474, 1)
      .setInteractive({ useHandCursor: true });
    const type = scene.add.text(-216, y - 17, TYPE_LABEL[child.type] || child.type, {
      fontFamily: FONT, fontSize: '10px', fontStyle: 'bold', color: '#7adfff'
    }).setOrigin(0, 0.5);
    const name = scene.add.text(-216, y + 2, child.name, {
      fontFamily: FONT,
      fontSize: '15px',
      fontStyle: 'bold',
      color: discovered ? '#fff1a8' : '#bbc7cd',
      wordWrap: { width: 310, useAdvancedWrap: true }
    }).setOrigin(0, 0.5);
    const state = scene.add.text(210, y, status, {
      fontFamily: FONT,
      fontSize: '10.5px',
      fontStyle: 'bold',
      color: current ? '#7dffca' : '#a9eaff',
      align: 'right'
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
        fontFamily: FONT,
        fontSize: '15px',
        color: '#c7edf8',
        align: 'center',
        lineSpacing: 8,
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
    fontFamily: FONT,
    fontSize: '11px',
    fontStyle: 'bold',
    color: '#8fe8ff',
    wordWrap: { width: 476, useAdvancedWrap: true }
  }).setOrigin(0, 0.5));

  panel.add(scene.add.text(-220, -310, TYPE_LABEL[node.type] || node.type, {
    fontFamily: FONT, fontSize: '11px', fontStyle: 'bold', color: '#7adfff'
  }).setOrigin(0, 0.5));

  panel.add(scene.add.text(-220, -278, node.name, {
    fontFamily: FONT,
    fontSize: '24px',
    fontStyle: 'bold',
    color: '#fff19a',
    wordWrap: { width: 440, useAdvancedWrap: true }
  }).setOrigin(0, 0.5));

  const box = scene.add.rectangle(0, -80, 470, 310, 0x0d3347, 1).setStrokeStyle(1.5, 0x3c91aa);
  const scale = scaleSummary(node);
  const info = scene.add.text(-215, -210, `${node.desc || 'Chưa có mô tả.'}${scale ? `\n\n${scale}` : ''}`, {
    fontFamily: FONT,
    fontSize: '14px',
    color: '#e7fbff',
    lineSpacing: 8,
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
      enabled: canFastTravel,
      fill: 0x166044,
      stroke: 0x61ffc0,
      fontSize: '15px'
    });

    panel.add(scene.add.text(0, 205,
      `Yêu cầu: ${REALMS[map.minRealm]?.name || 'Không yêu cầu'} • Template: ${map.templateId}\n${visited ? 'Đã khám phá' : 'Chưa khám phá'} • ${waypoint ? 'Waypoint đã mở' : 'Waypoint chưa mở'}`, {
        fontFamily: FONT,
        fontSize: '11px',
        color: '#a9eaff',
        align: 'center',
        lineSpacing: 4
      }).setOrigin(0.5));
  } else {
    panel.add(scene.add.text(0, 175, 'ĐỊA ĐIỂM DỮ LIỆU • CHƯA DỰNG COMBAT MAP', {
      fontFamily: FONT, fontSize: '12px', fontStyle: 'bold', color: '#ffcf7a'
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

  // Direct implementation only. There is no fallback to any legacy flat map UI.
  proto.openMapPanel = function openHierarchicalWorldMap(activeNodeId = NAM_LANG_ROOT_ID, selectedMapId = null, page = 0) {
    ensureWorldProgress(gameState);

    if (selectedMapId != null) {
      const selectedNode = getWorldNodeForMap(selectedMapId);
      if (selectedNode) activeNodeId = selectedNode.id;
    }

    if (LEGACY_TO_ROOT.has(activeNodeId)) activeNodeId = NAM_LANG_ROOT_ID;
    let node = getWorldNode(activeNodeId);
    if (!node) node = getWorldNodeForMap(gameState.currentMapId) || getWorldNode(NAM_LANG_ROOT_ID);

    const panel = this.createModalShell('ĐẠI BẢN ĐỒ NAM LĂNG', `${TYPE_LABEL[node.type] || 'BẢN ĐỒ'} • ${node.name}`, {
      subtitleColor: '#9aeaff',
      headerFill: 0x0a3b52,
      bgFill: 0x062a3b
    });

    const children = getWorldChildren(node.id);
    if (node.type === 'location' || children.length === 0) renderNodeDetail(this, panel, node);
    else renderBrowser(this, panel, node, page);
    return panel;
  };
}
