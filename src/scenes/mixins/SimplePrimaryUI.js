// Character-only primary UI.
// Map UI was removed from this module: WorldMapHierarchyUI is the sole map UI owner.
import { REALMS } from '../../config/realmsData.js';
import { getCongPhapById } from '../../config/congPhapData.js';
import { gameState } from '../../state/gameState.js';
import { stopPointer } from './UiModalManager.js';
import { ELEMENTS_8 } from './ElementalCombatProgression.js';
import { getItemByName, getItemQuantity, removeItem, getEquipmentStats } from './ItemSystem.js?v=20261001-item-icons-v4';

const FONT = 'Be Vietnam Pro, sans-serif';

function createShell(scene, title, subtitle = '') {
  return scene.createModalShell(title, subtitle, {
    headerY: -427,
    headerH: 88,
    titleFontSize: '22px',
    titleY: -445,
    subY: -414,
    subtitleColor: '#9aeaff'
  });
}

function addButton(scene, panel, x, y, w, h, label, onPress, opts = {}) {
  const enabled = opts.enabled !== false;
  const bg = scene.add.rectangle(x, y, w, h, enabled ? (opts.fill ?? 0x0e4f68) : 0x253544, 1)
    .setStrokeStyle(2, enabled ? (opts.stroke ?? 0x55e6ff) : 0x536270, 1);
  if (enabled) bg.setInteractive({ useHandCursor: true });

  const txt = scene.add.text(x, y, label, {
    fontFamily: FONT,
    fontSize: opts.fontSize ?? '15px',
    fontStyle: 'bold',
    color: enabled ? (opts.color ?? '#f4fdff') : '#8493a0',
    align: 'center',
    wordWrap: { width: Math.max(60, w - 18), useAdvancedWrap: true }
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

function addBack(scene, panel, action) {
  addButton(scene, panel, 0, 420, 430, 48, '‹ QUAY LẠI', action, {
    fill: 0x303e50, stroke: 0x94b8cc, color: '#eaf8ff', fontSize: '14px'
  });
}

function breakthroughState() {
  const currentRealm = REALMS[gameState.realmIdx] || REALMS[0];
  const activeCp = gameState.activeCongPhapId ? getCongPhapById(gameState.activeCongPhapId) : null;
  let canBreak = false;
  let reason = `Cần đủ ${currentRealm.expReq} Tu Vi.`;
  let requiredPill = null;

  if (gameState.realmIdx >= REALMS.length - 1) {
    reason = 'Đã đạt cảnh giới tối đa hiện tại.';
  } else if (activeCp && gameState.realmIdx >= activeCp.maxRealmIdx) {
    reason = `Công pháp hiện tại chỉ tu đến ${activeCp.maxStage}. Hãy đổi công pháp cao hơn.`;
  } else if ((gameState.exp || 0) >= currentRealm.expReq) {
    if (currentRealm.bottleneck) {
      requiredPill = currentRealm.pillNeeded;
      const requiredDef = getItemByName(requiredPill);
      const have = requiredDef ? getItemQuantity(requiredDef.id) : 0;
      canBreak = have > 0;
      reason = canBreak ? `Đủ Tu Vi và đã có ${requiredPill}.` : `Cần 1 ${requiredPill} để đột phá.`;
    } else {
      canBreak = true;
      reason = 'Đã đủ Tu Vi, có thể đột phá.';
    }
  }
  return { currentRealm, activeCp, canBreak, reason, requiredPill };
}

function renderCharacterSummary(scene, panel) {
  const { currentRealm, activeCp, canBreak, reason } = breakthroughState();
  const expReq = Math.max(1, currentRealm.expReq || 1);
  const exp = gameState.exp || 0;
  const pct = Math.min(100, Math.floor(exp / expReq * 100));

  const realm = scene.add.text(0, -325, currentRealm.name, {
    fontFamily: FONT, fontSize: '24px', fontStyle: 'bold', color: '#fff19a'
  }).setOrigin(0.5);

  const cpName = activeCp ? `📜 ${activeCp.name} [${activeCp.elem} • ${activeCp.grade}]` : '⚠️ Chưa vận hành công pháp';
  const cp = scene.add.text(0, -300, cpName, {
    fontFamily: FONT, fontSize: '13px', fontStyle: 'bold', color: activeCp ? '#78ffd1' : '#ffb0a8'
  }).setOrigin(0.5);

  const statBg = scene.add.rectangle(0, -221, 470, 126, 0x0d3347, 1).setStrokeStyle(1.5, 0x3c91aa);
  const maxHp = scene.calcPlayerMaxHp?.() || 0;
  const maxMp = scene.calcPlayerMaxMp?.() || 0;
  const dmg = scene.calcPlayerDmg?.() || 0;
  const def = scene.calcPlayerDef?.() || 0;
  const sense = scene.calcPlayerSpiritualSense?.() || 10;
  const atkInterval = scene.calcPlayerAtkInterval?.() || 400;
  const atkSpeed = (1000 / atkInterval).toFixed(1);
  const itemStats = getEquipmentStats();
  const critRate = (15 + (sense * 0.5) + Number(itemStats.critRate || 0)).toFixed(1);

  const stats = scene.add.text(-215, -274,
    `❤️ HP: ${maxHp.toLocaleString('vi-VN')}     🔷 MP: ${maxMp.toLocaleString('vi-VN')}\n` +
    `⚔️ Công: ${dmg.toLocaleString('vi-VN')}     🛡️ Thủ: ${def.toLocaleString('vi-VN')}\n` +
    `⚡ Thần Thức: ${sense.toLocaleString('vi-VN')} • ${atkSpeed} đòn/s • Bạo +${critRate}%\n` +
    `✨ Tu Vi: ${exp.toLocaleString('vi-VN')} / ${expReq.toLocaleString('vi-VN')} (${pct}%)`, {
      fontFamily: FONT, fontSize: '12.5px', color: '#e7fbff', lineSpacing: 5
    }).setOrigin(0, 0);
  panel.add([realm, cp, statBg, stats]);

  const cultivated = scene.getCultivationElement?.();
  const tableBg = scene.add.rectangle(0, 16, 470, 326, 0x0b2839, 1).setStrokeStyle(1.5, 0x3c91aa);
  const tableTitle = scene.add.text(0, -133, 'CHỈ SỐ SÁT THƯƠNG & PHÒNG NGỰ 8 HỆ', {
    fontFamily: FONT, fontSize: '13px', fontStyle: 'bold', color: '#ffe89a'
  }).setOrigin(0.5);
  const columnHead = scene.add.text(-215, -111, 'HỆ', {
    fontFamily: FONT, fontSize: '11px', fontStyle: 'bold', color: '#91d8ee'
  });
  const dmgHead = scene.add.text(55, -111, 'DAMAGE', {
    fontFamily: FONT, fontSize: '11px', fontStyle: 'bold', color: '#ffb6a1'
  }).setOrigin(1, 0);
  const defHead = scene.add.text(215, -111, 'DEF', {
    fontFamily: FONT, fontSize: '11px', fontStyle: 'bold', color: '#a9ddff'
  }).setOrigin(1, 0);
  panel.add([tableBg, tableTitle, columnHead, dmgHead, defHead]);

  ELEMENTS_8.forEach((elem, index) => {
    const y = -82 + index * 32;
    const active = elem === cultivated;
    const row = scene.add.rectangle(0, y, 448, 29, active ? 0x195a53 : (index % 2 ? 0x10384b : 0x0d3042), 1);
    if (active) row.setStrokeStyle(1, 0x71f4c0);
    const label = scene.add.text(-215, y, `${active ? '◆ ' : ''}${elem}`, {
      fontFamily: FONT, fontSize: '12.5px', fontStyle: active ? 'bold' : 'normal', color: active ? '#9dffdc' : '#e4f6ff'
    }).setOrigin(0, 0.5);
    const elemDmg = scene.calcPlayerElementalDmg?.(elem) ?? dmg;
    const elemDef = scene.calcPlayerElementalDef?.(elem) ?? def;
    const attack = scene.add.text(55, y, elemDmg.toLocaleString('vi-VN'), {
      fontFamily: FONT, fontSize: '12px', color: '#ffcfbd'
    }).setOrigin(1, 0.5);
    const defense = scene.add.text(215, y, elemDef.toLocaleString('vi-VN'), {
      fontFamily: FONT, fontSize: '12px', color: '#b9e4ff'
    }).setOrigin(1, 0.5);
    panel.add([row, label, attack, defense]);
  });

  addButton(scene, panel, 0, 223, 430, 50, gameState.isMeditating ? 'DỪNG TĨNH TỌA' : 'BẮT ĐẦU TĨNH TỌA', () => {
    scene.toggleMeditation();
    scene.openCharacterPanel();
  }, {
    fill: gameState.isMeditating ? 0x7c2635 : 0x166044,
    stroke: gameState.isMeditating ? 0xff9aaa : 0x61ffc0,
    fontSize: '15px'
  });

  addButton(scene, panel, 0, 286, 430, 50, canBreak ? 'ĐỘT PHÁ CẢNH GIỚI  ›' : 'XEM YÊU CẦU ĐỘT PHÁ  ›', () => {
    scene.openCharacterPanel('break');
  }, {
    fill: canBreak ? 0x725215 : 0x17455a,
    stroke: canBreak ? 0xffda63 : 0x59c9e7,
    fontSize: '15px'
  });

  addButton(scene, panel, 0, 349, 430, 50, 'THẾ LỰC & QUAN HỆ  ›', () => {
    scene.openPlayerFactionPanel?.();
  }, {
    enabled: typeof scene.openPlayerFactionPanel === 'function',
    fill: 0x49306d,
    stroke: 0xc4a7ff,
    color: '#f6efff',
    fontSize: '15px'
  });

  const hint = scene.add.text(0, 402, reason, {
    fontFamily: FONT, fontSize: '11.5px', color: canBreak ? '#8effc5' : '#bcefff',
    align: 'center', wordWrap: { width: 430, useAdvancedWrap: true }
  }).setOrigin(0.5);
  panel.add(hint);
}

function renderBreakthroughDetail(scene, panel) {
  const { currentRealm, activeCp, canBreak, reason, requiredPill } = breakthroughState();
  const nextRealm = REALMS[Math.min(gameState.realmIdx + 1, REALMS.length - 1)];
  const title = scene.add.text(-220, -330, `Đột Phá: ${currentRealm.name} → ${nextRealm.name}`, {
    fontFamily: FONT, fontSize: '22px', fontStyle: 'bold', color: '#fff19a',
    wordWrap: { width: 440, useAdvancedWrap: true }
  }).setOrigin(0, 0.5);
  const box = scene.add.rectangle(0, -140, 470, 280, 0x0d3347, 1).setStrokeStyle(1.5, 0x3c91aa);
  const expReq = Math.max(1, currentRealm.expReq || 1);
  const exp = gameState.exp || 0;
  const req = scene.add.text(-215, -245,
    `Tu Vi: ${exp.toLocaleString('vi-VN')} / ${expReq.toLocaleString('vi-VN')}\n` +
    `${activeCp ? `Công pháp: ${activeCp.name} (Max: ${activeCp.maxStage})` : 'Công pháp: Chưa chọn'}\n` +
    `${requiredPill ? `Đan dược cần: ${requiredPill} • Có: ${(() => { const d=getItemByName(requiredPill); return d ? getItemQuantity(d.id) : 0; })()}` : 'Đan dược: Không yêu cầu'}\n\n${reason}`, {
      fontFamily: FONT, fontSize: '15px', color: '#e7fbff', lineSpacing: 10,
      wordWrap: { width: 430, useAdvancedWrap: true }
    }).setOrigin(0, 0);
  panel.add([title, box, req]);

  addButton(scene, panel, 0, 120, 430, 62, 'XÁC NHẬN ĐỘT PHÁ', () => {
    const state = breakthroughState();
    if (!state.canBreak) return;
    if (state.requiredPill) {
      const pill = getItemByName(state.requiredPill);
      if (!pill || !removeItem(pill.id, 1).success) return;
    }
    if (gameState.realmIdx < REALMS.length - 1) {
      gameState.realmIdx++;
      gameState.exp = 0;
      scene.playerHp = scene.calcPlayerMaxHp();
      gameState.mana = scene.calcPlayerMaxMp();
      scene.updateHUD();
      scene.openCharacterPanel();
      scene.showFloatingText(scene.player.x, scene.player.y - 60, `ĐỘT PHÁ: ${REALMS[gameState.realmIdx].name}!`, '#ffd700', '18px');
    }
  }, {
    enabled: canBreak,
    fill: 0x725215,
    stroke: 0xffda63,
    fontSize: '17px'
  });
  addBack(scene, panel, () => scene.openCharacterPanel());
}

export const CharacterPrimaryModal = Object.freeze({
  openCharacterPanel(view = 'summary') {
    const panel = createShell(this, 'NHÂN VẬT', view === 'break' ? 'Kiểm tra yêu cầu & xác nhận' : 'Thông tin tu luyện chính');
    if (view === 'break') renderBreakthroughDetail(this, panel);
    else renderCharacterSummary(this, panel);
  }
});

export function installSimplePrimaryUI(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__simplePrimaryUiV3Installed) return;
  MainGameScene.prototype.__simplePrimaryUiV3Installed = true;
  MainGameScene.prototype.openCharacterPanel = CharacterPrimaryModal.openCharacterPanel;
}
