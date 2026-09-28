import { W, H } from '../constants.js';
import { REALMS } from '../../config/realmsData.js';
import { WORLD_REGIONS } from '../../config/regionsData.js';
import { CRAFTING_SYSTEM } from '../../config/craftingData.js';
import { getHerbByName } from '../../config/herbsData.js';
import { getCongPhapById } from '../../config/congPhapData.js';
import { gameState } from '../../state/gameState.js';
import { stopPointer } from './UiModalManager.js';
import { ELEMENTS_8 } from './ElementalCombatProgression.js';

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
    .setStrokeStyle(2, enabled ? (opts.stroke ?? 0x55e6ff) : 0x536270, 1)
    .setInteractive({ useHandCursor: enabled });
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

function gearStat(item) {
  if (!item) return '';
  if (item.bonusDmg) return `⚔ +${item.bonusDmg} Công`;
  if (item.bonusHp) return `❤ +${item.bonusHp} HP`;
  if (item.bonusDef) return `🛡 +${item.bonusDef} Giáp`;
  if (item.bonusSpd) return `💨 +${item.bonusSpd} Tốc`;
  return item.desc || 'Trang bị tu tiên';
}

function inventorySlots() {
  const slots = [];
  const mats = [
    { id: 'ore', name: 'Khoáng Thạch', emoji: '💎', count: gameState.ores || 0, type: 'material', desc: 'Khoáng thạch dùng cho rèn đúc và luyện chế.' },
    { id: 'pelt', name: 'Da Thú', emoji: '🐺', count: gameState.materials?.beastPelts || 0, type: 'material', desc: 'Nguyên liệu thu được khi săn dã thú.' },
    { id: 'fur', name: 'Lông Thú', emoji: '🪶', count: gameState.materials?.beastFurs || 0, type: 'material', desc: 'Nguyên liệu từ phi cầm và dã thú.' },
    { id: 'claw', name: 'Móng Vuốt', emoji: '🐾', count: gameState.materials?.beastClaws || 0, type: 'material', desc: 'Móng vuốt yêu thú dùng trao đổi.' },
    { id: 'blood', name: 'Huyết Thú', emoji: '🩸', count: gameState.materials?.beastBlood || 0, type: 'material', desc: 'Tinh huyết yêu thú.' },
    { id: 'horn', name: 'Sừng Thú', emoji: '🦏', count: gameState.materials?.beastHorns || 0, type: 'material', desc: 'Sừng yêu thú quý hiếm.' }
  ];
  mats.forEach(m => { if (m.count > 0) slots.push(m); });

  if (typeof gameState.herbs === 'object' && gameState.herbs) {
    Object.entries(gameState.herbs).forEach(([name, count]) => {
      if (count <= 0) return;
      const def = getHerbByName(name);
      slots.push({
        id: `herb_${name}`, name, emoji: def?.emoji || '🌿', count, type: 'herb',
        desc: def?.desc || 'Linh thảo dùng luyện đan.'
      });
    });
  }

  Object.entries(gameState.inventory?.pills || {}).forEach(([name, count]) => {
    if (count <= 0) return;
    const def = CRAFTING_SYSTEM.pills?.find(p => p.name === name);
    slots.push({ id: `pill_${name}`, name, emoji: '💊', count, type: 'pill', desc: def?.desc || 'Đan dược tu luyện.' });
  });

  Object.entries(gameState.inventory?.talismans || {}).forEach(([name, count]) => {
    if (count <= 0) return;
    const def = CRAFTING_SYSTEM.talismans?.find(p => p.name === name);
    slots.push({ id: `talisman_${name}`, name, emoji: '📜', count, type: 'talisman', desc: def?.desc || 'Phù lục chiến đấu.' });
  });

  (gameState.inventory?.formations || []).forEach(name => {
    slots.push({ id: `formation_${name}`, name, emoji: '☸', count: 1, type: 'formation', desc: 'Trận pháp đang sở hữu.' });
  });

  (gameState.inventory?.items || []).forEach((item, idx) => {
    slots.push({
      id: `gear_${item.id ?? item.name}_${idx}`, name: item.name, emoji: '⚔️', count: 1,
      type: 'gear', desc: gearStat(item), itemRef: item
    });
  });
  return slots;
}

function renderInventoryList(scene, panel, page) {
  const slots = inventorySlots();
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(slots.length / pageSize));
  const currentPage = Math.max(0, Math.min(page, totalPages - 1));
  const shown = slots.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  addButton(scene, panel, -120, -352, 220, 48, '🎒 HÀNH TRANG', () => scene.openGearPanel('bag', currentPage), {
    fill: 0x126783, stroke: 0x7cf3ff, fontSize: '14px'
  });
  addButton(scene, panel, 120, -352, 220, 48, '⚔️ TRANG BỊ', () => scene.openGearPanel('equip', 0), {
    fill: 0x0b3a50, stroke: 0x32778e, color: '#b8eafa', fontSize: '14px'
  });

  if (!shown.length) {
    const empty = scene.add.text(0, -40, 'Hành trang hiện đang trống.', {
      fontFamily: FONT, fontSize: '18px', color: '#c8f4ff'
    }).setOrigin(0.5);
    panel.add(empty);
  }

  shown.forEach((slot, idx) => {
    const y = -276 + idx * 76;
    const box = scene.add.rectangle(0, y, 476, 62, 0x0d3347, 1)
      .setStrokeStyle(1.5, 0x3a8ca6, 1).setInteractive({ useHandCursor: true });
    const name = scene.add.text(-218, y - 8, `${slot.emoji} ${slot.name}`, {
      fontFamily: FONT, fontSize: '16px', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0, 0.5);
    const count = scene.add.text(-218, y + 16, `Số lượng: ${slot.count}`, {
      fontFamily: FONT, fontSize: '12px', color: '#a9eaff'
    }).setOrigin(0, 0.5);
    const arrow = scene.add.text(215, y, '›', { fontFamily: FONT, fontSize: '32px', color: '#7cf3ff' }).setOrigin(0.5);
    box.on('pointerdown', pointer => {
      stopPointer(scene, pointer);
      scene.openGearPanel('bag', currentPage, slot.id);
    });
    panel.add([box, name, count, arrow]);
  });

  if (totalPages > 1) {
    addButton(scene, panel, -120, 362, 180, 44, '‹ TRANG TRƯỚC', () => scene.openGearPanel('bag', currentPage - 1), {
      enabled: currentPage > 0, fontSize: '12px'
    });
    addButton(scene, panel, 120, 362, 180, 44, `TRANG ${currentPage + 1}/${totalPages}  ›`, () => scene.openGearPanel('bag', currentPage + 1), {
      enabled: currentPage < totalPages - 1, fontSize: '12px'
    });
  }
}

function renderInventoryDetail(scene, panel, page, slot) {
  const title = scene.add.text(-220, -330, `${slot.emoji} ${slot.name}`, {
    fontFamily: FONT, fontSize: '24px', fontStyle: 'bold', color: '#fff19a',
    wordWrap: { width: 440, useAdvancedWrap: true }
  }).setOrigin(0, 0.5);
  const count = scene.add.text(-220, -282, `Số lượng đang có: ${slot.count}`, {
    fontFamily: FONT, fontSize: '14px', color: '#9aeaff'
  }).setOrigin(0, 0.5);
  const descBg = scene.add.rectangle(0, -150, 470, 190, 0x0d3347, 1).setStrokeStyle(1.5, 0x3c91aa);
  const desc = scene.add.text(-215, -220, slot.desc || 'Không có mô tả.', {
    fontFamily: FONT, fontSize: '16px', color: '#e4f9ff', lineSpacing: 7,
    wordWrap: { width: 430, useAdvancedWrap: true }
  }).setOrigin(0, 0);
  panel.add([title, count, descBg, desc]);

  if (slot.type === 'gear' && slot.itemRef) {
    addButton(scene, panel, 0, 180, 430, 58, 'XÁC NHẬN TRANG BỊ', () => scene.equipGearItem(slot.itemRef), {
      fill: 0x166044, stroke: 0x61ffc0, fontSize: '16px'
    });
  } else if (slot.type === 'pill' && slot.count > 0) {
    addButton(scene, panel, 0, 180, 430, 58, 'XÁC NHẬN DÙNG ĐAN', () => {
      const res = scene.consumePill(slot.name);
      if (res?.success) scene.openGearPanel('bag', page);
    }, { fill: 0x145f7a, stroke: 0x69e7ff, fontSize: '16px' });
  }

  addBack(scene, panel, () => scene.openGearPanel('bag', page));
}

function renderEquipment(scene, panel, selectedSlot = null) {
  addButton(scene, panel, -120, -352, 220, 48, '🎒 HÀNH TRANG', () => scene.openGearPanel('bag', 0), {
    fill: 0x0b3a50, stroke: 0x32778e, color: '#b8eafa', fontSize: '14px'
  });
  addButton(scene, panel, 120, -352, 220, 48, '⚔️ TRANG BỊ', () => scene.openGearPanel('equip', 0), {
    fill: 0x126783, stroke: 0x7cf3ff, fontSize: '14px'
  });

  const slots = [
    ['weapon', 'Vũ Khí', '🗡️'], ['armor', 'Đạo Bào', '🥋'], ['helm', 'Đạo Quán', '👑'],
    ['boots', 'Ngự Hài', '👟'], ['amulet', 'Ngọc Bội', '📿'], ['shield', 'Linh Thuẫn', '🛡️']
  ];

  if (selectedSlot) {
    const def = slots.find(([key]) => key === selectedSlot);
    const item = gameState.equipped?.[selectedSlot];
    const name = scene.add.text(-220, -315, `${def?.[2] || '⚔️'} ${item?.name || def?.[1] || 'Trang bị'}`, {
      fontFamily: FONT, fontSize: '24px', fontStyle: 'bold', color: '#fff19a',
      wordWrap: { width: 440, useAdvancedWrap: true }
    }).setOrigin(0, 0.5);
    const desc = scene.add.text(-215, -210, item ? gearStat(item) : 'Ô trang bị đang trống.', {
      fontFamily: FONT, fontSize: '17px', color: '#e4f9ff',
      wordWrap: { width: 430, useAdvancedWrap: true }
    }).setOrigin(0, 0);
    panel.add([name, desc]);
    if (item) {
      addButton(scene, panel, 0, 180, 430, 58, 'XÁC NHẬN THÁO TRANG BỊ', () => scene.unequipGear(selectedSlot), {
        fill: 0x7c2635, stroke: 0xff9aaa, fontSize: '16px'
      });
    }
    addBack(scene, panel, () => scene.openGearPanel('equip', 0));
    return;
  }

  slots.forEach(([key, label, emoji], idx) => {
    const item = gameState.equipped?.[key];
    const y = -275 + idx * 94;
    const box = scene.add.rectangle(0, y, 476, 78, item ? 0x0d3b50 : 0x102b3a, 1)
      .setStrokeStyle(1.5, item ? 0x55e6ff : 0x39566a).setInteractive({ useHandCursor: !!item });
    const text = scene.add.text(-215, y - 10, `${emoji} ${label}`, {
      fontFamily: FONT, fontSize: '15px', fontStyle: 'bold', color: '#9aeaff'
    }).setOrigin(0, 0.5);
    const value = scene.add.text(-215, y + 17, item ? `${item.name}  •  ${gearStat(item)}` : '[Trống]', {
      fontFamily: FONT, fontSize: '13px', color: item ? '#ffffff' : '#7890a0',
      wordWrap: { width: 400, useAdvancedWrap: true }
    }).setOrigin(0, 0.5);
    if (item) {
      box.on('pointerdown', pointer => {
        stopPointer(scene, pointer);
        scene.openGearPanel('equip', 0, key);
      });
    }
    panel.add([box, text, value]);
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
      const have = gameState.inventory?.pills?.[requiredPill] || 0;
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
  const critRate = (15 + (sense * 0.5)).toFixed(1);

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
  const columnHead = scene.add.text(-215, -111, 'HỆ', { fontFamily: FONT, fontSize: '11px', fontStyle: 'bold', color: '#91d8ee' });
  const dmgHead = scene.add.text(55, -111, 'DAMAGE', { fontFamily: FONT, fontSize: '11px', fontStyle: 'bold', color: '#ffb6a1' }).setOrigin(1, 0);
  const defHead = scene.add.text(215, -111, 'DEF', { fontFamily: FONT, fontSize: '11px', fontStyle: 'bold', color: '#a9ddff' }).setOrigin(1, 0);
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

  const hint = scene.add.text(0, 351, reason, {
    fontFamily: FONT, fontSize: '12.5px', color: canBreak ? '#8effc5' : '#bcefff',
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
    `${requiredPill ? `Đan dược cần: ${requiredPill} • Có: ${gameState.inventory?.pills?.[requiredPill] || 0}` : 'Đan dược: Không yêu cầu'}\n\n${reason}`, {
      fontFamily: FONT, fontSize: '15px', color: '#e7fbff', lineSpacing: 10,
      wordWrap: { width: 430, useAdvancedWrap: true }
    }).setOrigin(0, 0);
  panel.add([title, box, req]);

  addButton(scene, panel, 0, 120, 430, 62, 'XÁC NHẬN ĐỘT PHÁ', () => {
    const state = breakthroughState();
    if (!state.canBreak) return;
    if (state.requiredPill) gameState.inventory.pills[state.requiredPill]--;
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
    fill: 0x725215, stroke: 0xffda63, fontSize: '17px'
  });
  addBack(scene, panel, () => scene.openCharacterPanel());
}

function renderMapList(scene, panel, region) {
  const regions = WORLD_REGIONS;
  regions.forEach((reg, idx) => {
    const row = Math.floor(idx / 3);
    const col = idx % 3;
    const x = -166 + col * 166;
    const y = -352 + row * 50;
    const active = reg.id === region.id;
    addButton(scene, panel, x, y, 152, 42, reg.name, () => scene.openMapPanel(reg.id), {
      fill: active ? 0x126783 : 0x0b3a50,
      stroke: active ? 0x7cf3ff : 0x32778e,
      color: active ? '#ffffff' : '#b8eafa',
      fontSize: '11px'
    });
  });

  const desc = scene.add.text(0, -238, region.desc, {
    fontFamily: FONT, fontSize: '13px', color: '#bcefff', align: 'center',
    wordWrap: { width: 440, useAdvancedWrap: true }
  }).setOrigin(0.5);
  panel.add(desc);

  region.maps.forEach((map, idx) => {
    const y = -145 + idx * 96;
    const current = map.id === gameState.currentMapId;
    const unlocked = gameState.realmIdx >= map.minRealm;
    const box = scene.add.rectangle(0, y, 476, 80, current ? 0x154b3e : 0x0d3347, 1)
      .setStrokeStyle(2, current ? 0x69ffc2 : (unlocked ? 0x55e6ff : 0x5b6670), 1)
      .setInteractive({ useHandCursor: true });
    const name = scene.add.text(-215, y - 13, map.name, {
      fontFamily: FONT, fontSize: '16px', fontStyle: 'bold', color: unlocked ? '#fff19a' : '#9aa8b0'
    }).setOrigin(0, 0.5);
    const status = scene.add.text(-215, y + 16, current ? 'ĐANG Ở ĐÂY' : (unlocked ? 'Chạm để xem chi tiết' : `Khóa • Cần ${REALMS[map.minRealm]?.name || 'cảnh giới cao hơn'}`), {
      fontFamily: FONT, fontSize: '12px', color: current ? '#83ffd0' : (unlocked ? '#a9eaff' : '#ff9aa8')
    }).setOrigin(0, 0.5);
    const arrow = scene.add.text(215, y, '›', { fontFamily: FONT, fontSize: '32px', color: '#7cf3ff' }).setOrigin(0.5);
    box.on('pointerdown', pointer => {
      stopPointer(scene, pointer);
      scene.openMapPanel(region.id, map.id);
    });
    panel.add([box, name, status, arrow]);
  });
}

function renderMapDetail(scene, panel, region, map) {
  const current = map.id === gameState.currentMapId;
  const unlocked = gameState.realmIdx >= map.minRealm;
  const title = scene.add.text(-220, -330, map.name, {
    fontFamily: FONT, fontSize: '24px', fontStyle: 'bold', color: '#fff19a',
    wordWrap: { width: 440, useAdvancedWrap: true }
  }).setOrigin(0, 0.5);
  const box = scene.add.rectangle(0, -135, 470, 280, 0x0d3347, 1).setStrokeStyle(1.5, 0x3c91aa);
  const info = scene.add.text(-215, -245,
    `${map.sub}\n\nKhu vực: ${region.name}\nYêu cầu: ${REALMS[map.minRealm]?.name || 'Không yêu cầu'}\nTrạng thái: ${current ? 'Đang ở đây' : (unlocked ? 'Đã mở khóa' : 'Chưa đủ cảnh giới')}`, {
      fontFamily: FONT, fontSize: '16px', color: '#e7fbff', lineSpacing: 10,
      wordWrap: { width: 430, useAdvancedWrap: true }
    }).setOrigin(0, 0);
  panel.add([title, box, info]);

  addButton(scene, panel, 0, 120, 430, 62, current ? 'ĐANG Ở MAP NÀY' : 'XÁC NHẬN DỊCH CHUYỂN', () => {
    if (!unlocked || current) return;
    scene.closeModal();
    const entered = scene.switchMap(map.id);
    scene.showFloatingText(scene.player.x, scene.player.y - 60, `Đã tiến vào: ${entered.name}!`, '#66ffcc');
  }, {
    enabled: unlocked && !current,
    fill: 0x166044, stroke: 0x61ffc0, fontSize: '16px'
  });
  addBack(scene, panel, () => scene.openMapPanel(region.id));
}

export const CharacterMapPrimaryModal = {
  openCharacterPanel(view = 'summary') {
    const panel = createShell(this, 'NHÂN VẬT', view === 'break' ? 'Kiểm tra yêu cầu & xác nhận' : 'Thông tin tu luyện chính');
    if (view === 'break') renderBreakthroughDetail(this, panel);
    else renderCharacterSummary(this, panel);
  },

  openMapPanel(activeRegionId = 'nam_lang', selectedMapId = null) {
    const region = WORLD_REGIONS.find(r => r.id === activeRegionId) || WORLD_REGIONS[0];
    const panel = createShell(this, 'ĐẠI BẢN ĐỒ', selectedMapId != null ? 'Chi tiết & xác nhận dịch chuyển' : region.name);
    if (selectedMapId != null) {
      const map = region.maps.find(m => m.id === selectedMapId);
      if (map) {
        renderMapDetail(this, panel, region, map);
        return;
      }
    }
    renderMapList(this, panel, region);
  }
};

export function installSimplePrimaryUI(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__simplePrimaryUiInstalled) return;
  const proto = MainGameScene.prototype;
  proto.__simplePrimaryUiInstalled = true;

  Object.assign(proto, CharacterMapPrimaryModal);
}
