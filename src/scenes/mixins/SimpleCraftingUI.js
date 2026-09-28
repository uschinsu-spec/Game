import { W, H } from '../constants.js';
import {
  CRAFTING_SYSTEM,
  calculatePillEfficiency,
  getPlayerPillRank,
  canCraftRecipe,
  deductCraftMaterials
} from '../../config/craftingData.js';
import { getHerbByName } from '../../config/herbsData.js';
import { gameState } from '../../state/gameState.js';

const FONT = 'Be Vietnam Pro, sans-serif';

function stopPointer(pointer) {
  const evt = pointer?.event;
  if (!evt) return;
  evt.stopPropagation?.();
  evt.preventDefault?.();
}

function pauseWorld(scene) {
  scene.moveTarget = null;
  if (scene.player?.body?.setVelocity) scene.player.setVelocity(0, 0);
  if (scene.joy) {
    scene.joy.active = false;
    scene.joy.id = null;
    scene.joy.x = 0;
    scene.joy.y = 0;
  }
  scene.joyBase?.setVisible?.(false);
  scene.joyKnob?.setVisible?.(false);
  if (!scene.__uiWorldPaused && scene.physics?.world?.pause) {
    scene.physics.world.pause();
    scene.__uiWorldPaused = true;
  }
}

function createShell(scene, title, subtitle = '') {
  scene.closeModal();

  const overlay = scene.fixed(scene.add.rectangle(W / 2, H / 2, W + 12, H + 12, 0x020912, 1), 9998)
    .setInteractive({ useHandCursor: false });
  const panel = scene.fixed(scene.add.container(W / 2, H / 2), 10000);

  scene.activeModal = panel;
  scene.activeModalOverlay = overlay;
  pauseWorld(scene);

  overlay.on('pointerdown', pointer => stopPointer(pointer));
  overlay.on('pointerup', pointer => stopPointer(pointer));
  overlay.on('pointermove', pointer => stopPointer(pointer));

  const bg = scene.add.rectangle(0, 0, W - 8, H - 8, 0x082638, 1)
    .setStrokeStyle(2.5, 0x63e6ff, 1);
  const header = scene.add.rectangle(0, -427, W - 20, 88, 0x0b3247, 1)
    .setStrokeStyle(1.5, 0x3dd9ff, 0.9);
  const titleTxt = scene.add.text(-238, -445, title, {
    fontFamily: FONT,
    fontSize: '22px',
    fontStyle: 'bold',
    color: '#ffe77a'
  }).setOrigin(0, 0.5);
  const subTxt = scene.add.text(-238, -414, subtitle, {
    fontFamily: FONT,
    fontSize: '12px',
    color: '#9aeaff'
  }).setOrigin(0, 0.5);

  panel.add([bg, header, titleTxt, subTxt]);
  scene.createModalCloseBtn(panel);
  return panel;
}

function addButton(scene, panel, x, y, w, h, label, onPress, opts = {}) {
  const enabled = opts.enabled !== false;
  const fill = enabled ? (opts.fill ?? 0x0e4f68) : 0x253544;
  const stroke = enabled ? (opts.stroke ?? 0x55e6ff) : 0x536270;
  const color = enabled ? (opts.color ?? '#f4fdff') : '#8493a0';

  const bg = scene.add.rectangle(x, y, w, h, fill, 1)
    .setStrokeStyle(2, stroke, 1)
    .setInteractive({ useHandCursor: enabled });
  const txt = scene.add.text(x, y, label, {
    fontFamily: FONT,
    fontSize: opts.fontSize ?? '15px',
    fontStyle: 'bold',
    color,
    align: 'center',
    wordWrap: { width: Math.max(60, w - 18), useAdvancedWrap: true }
  }).setOrigin(0.5);

  if (enabled && typeof onPress === 'function') {
    bg.on('pointerdown', pointer => {
      stopPointer(pointer);
      onPress();
    });
  }
  panel.add([bg, txt]);
  return bg;
}

function gradeColor(item) {
  return {
    'Cực Phẩm': 0xffb020,
    'Thượng Phẩm': 0xff72e6,
    'Trung Phẩm': 0x66ddff
  }[item?.grade] || 0x66f5a3;
}

function ownedCount(tab, item) {
  if (tab === 'pills') return gameState.inventory?.pills?.[item.name] || 0;
  if (tab === 'talismans') return gameState.inventory?.talismans?.[item.name] || 0;
  if (tab === 'formations') return (gameState.inventory?.formations || []).includes(item.name) ? 1 : 0;
  return 0;
}

function ingredientLines(item) {
  const lines = [];
  if (Array.isArray(item.recipeHerbs) && item.recipeHerbs.length) {
    item.recipeHerbs.forEach(req => {
      const have = (typeof gameState.herbs === 'object' && gameState.herbs) ? (gameState.herbs[req.name] || 0) : 0;
      const icon = getHerbByName(req.name)?.emoji || '🌿';
      lines.push({ text: `${icon} ${req.name}: ${have}/${req.count}`, ok: have >= req.count });
    });
  }
  if ((item.costOres || 0) > 0) {
    const have = gameState.ores || 0;
    lines.push({ text: `💎 Khoáng: ${have}/${item.costOres}`, ok: have >= item.costOres });
  }
  if ((item.costGold || 0) > 0) {
    const have = gameState.gold || 0;
    lines.push({ text: `✨ Linh Thạch: ${have}/${item.costGold}`, ok: have >= item.costGold });
  }
  return lines;
}

function tabLabel(tab) {
  if (tab === 'talismans') return 'PHÙ LỤC';
  if (tab === 'formations') return 'TRẬN PHÁP';
  return 'ĐAN DƯỢC';
}

function renderCategoryTabs(scene, panel, currentTab) {
  const tabs = [
    { key: 'pills', label: '💊 ĐAN DƯỢC' },
    { key: 'talismans', label: '📜 PHÙ LỤC' },
    { key: 'formations', label: '☸ TRẬN PHÁP' }
  ];
  tabs.forEach((tab, idx) => {
    const x = -168 + idx * 168;
    const active = tab.key === currentTab;
    addButton(scene, panel, x, -352, 154, 52, tab.label,
      () => scene.openCraftingPanel(tab.key), {
        fill: active ? 0x126783 : 0x0b3a50,
        stroke: active ? 0x7cf3ff : 0x32778e,
        color: active ? '#ffffff' : '#b8eafa',
        fontSize: '13px'
      });
  });
}

function renderRankSelector(scene, panel, activeRank) {
  const rankLabels = ['Nhất Phẩm', 'Nhị Phẩm', 'Tam Phẩm', 'Tứ Phẩm', 'Ngũ Phẩm'];
  rankLabels.forEach((label, idx) => {
    const rank = idx + 1;
    const row = Math.floor(idx / 3);
    const col = idx % 3;
    const x = -164 + col * 164;
    const y = -292 + row * 48;
    const active = rank === activeRank;
    addButton(scene, panel, x, y, 150, 40, label,
      () => scene.openCraftingPanel('pills', rank), {
        fill: active ? 0x165d45 : 0x123443,
        stroke: active ? 0x62ffbd : 0x3b7181,
        color: active ? '#dfffee' : '#c2e8f2',
        fontSize: '12px'
      });
  });
}

function renderList(scene, panel, tab, activeRank) {
  let items = CRAFTING_SYSTEM[tab] || [];
  if (tab === 'pills') items = items.filter(item => item.pillRank === activeRank);
  items = items.slice(0, 7);

  const startY = tab === 'pills' ? -172 : -270;
  const rowH = 72;

  if (!items.length) {
    const empty = scene.add.text(0, -60, 'Chưa có nội dung ở mục này.', {
      fontFamily: FONT, fontSize: '18px', color: '#c8f4ff'
    }).setOrigin(0.5);
    panel.add(empty);
    return;
  }

  items.forEach((item, idx) => {
    const y = startY + idx * rowH;
    const owned = ownedCount(tab, item);
    const color = gradeColor(item);
    const box = scene.add.rectangle(0, y, 476, 60, 0x0d3347, 1)
      .setStrokeStyle(2, color, 0.95)
      .setInteractive({ useHandCursor: true });
    const name = scene.add.text(-218, y - 10, item.name, {
      fontFamily: FONT,
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0, 0.5);
    const meta = scene.add.text(-218, y + 14, `[${item.rank || ''}${item.grade ? ` • ${item.grade}` : ''}]  •  Có: ${owned}`, {
      fontFamily: FONT,
      fontSize: '12px',
      color: '#a9eaff'
    }).setOrigin(0, 0.5);
    const arrow = scene.add.text(215, y, '›', {
      fontFamily: FONT,
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#7cf3ff'
    }).setOrigin(0.5);

    box.on('pointerdown', pointer => {
      stopPointer(pointer);
      scene.openCraftingPanel(tab, activeRank, item.name);
    });
    panel.add([box, name, meta, arrow]);
  });
}

function renderDetail(scene, panel, tab, activeRank, item) {
  const owned = ownedCount(tab, item);
  const gColor = gradeColor(item);

  const crumb = scene.add.text(-230, -352, `BÁCH NGHỆ  ›  ${tabLabel(tab)}`, {
    fontFamily: FONT,
    fontSize: '13px',
    color: '#8feaff'
  }).setOrigin(0, 0.5);
  const itemName = scene.add.text(-230, -306, item.name, {
    fontFamily: FONT,
    fontSize: '24px',
    fontStyle: 'bold',
    color: '#fff19a',
    wordWrap: { width: 455, useAdvancedWrap: true }
  }).setOrigin(0, 0.5);
  const rank = scene.add.text(-230, -268, `[${item.rank || ''}${item.grade ? ` • ${item.grade}` : ''}]   •   Đang có: ${owned}`, {
    fontFamily: FONT,
    fontSize: '14px',
    fontStyle: 'bold',
    color: '#a8f5ff'
  }).setOrigin(0, 0.5);

  const descBg = scene.add.rectangle(0, -168, 470, 130, 0x0d3347, 1)
    .setStrokeStyle(1.5, 0x3c91aa, 1);
  const desc = scene.add.text(-215, -214, item.desc || 'Không có mô tả.', {
    fontFamily: FONT,
    fontSize: '15px',
    color: '#e4f9ff',
    lineSpacing: 6,
    wordWrap: { width: 430, useAdvancedWrap: true }
  }).setOrigin(0, 0);
  panel.add([crumb, itemName, rank, descBg, desc]);

  let infoY = -74;
  if (tab === 'pills' && item.type === 'cultivation') {
    const eff = calculatePillEfficiency(item, gameState.realmIdx);
    const effText = eff.canUse
      ? `✨ Hiệu quả: +${eff.effectiveSpeed} Tu Vi/s • ${item.durationSec || 0}s • ${Math.round((eff.efficiency || 1) * 100)}% dược lực`
      : `⚠️ ${eff.reason}`;
    const effObj = scene.add.text(-215, infoY, effText, {
      fontFamily: FONT,
      fontSize: '14px',
      fontStyle: 'bold',
      color: eff.canUse ? '#79ffd1' : '#ff9ca8',
      wordWrap: { width: 430, useAdvancedWrap: true }
    }).setOrigin(0, 0.5);
    panel.add(effObj);
    infoY += 52;
  }

  const reqTitle = scene.add.text(-215, infoY, 'NGUYÊN LIỆU CẦN', {
    fontFamily: FONT,
    fontSize: '15px',
    fontStyle: 'bold',
    color: '#ffe77a'
  }).setOrigin(0, 0.5);
  panel.add(reqTitle);
  infoY += 38;

  const reqs = ingredientLines(item);
  reqs.forEach(req => {
    const line = scene.add.text(-205, infoY, `${req.ok ? '✓' : '✕'}  ${req.text}`, {
      fontFamily: FONT,
      fontSize: '14px',
      fontStyle: 'bold',
      color: req.ok ? '#78ffc2' : '#ff9aa8'
    }).setOrigin(0, 0.5);
    panel.add(line);
    infoY += 34;
  });

  const alreadyFormation = tab === 'formations' && owned > 0;
  const canCraft = !alreadyFormation && canCraftRecipe(item, gameState);
  const actionLabel = tab === 'formations' ? 'XÁC NHẬN BỐ TRÍ' : tab === 'talismans' ? 'XÁC NHẬN LUYỆN PHÙ' : 'XÁC NHẬN LUYỆN ĐAN';

  addButton(scene, panel, 0, 285, 430, 58, alreadyFormation ? 'ĐÃ SỞ HỮU TRẬN PHÁP' : actionLabel, () => {
    if (!canCraftRecipe(item, gameState)) {
      scene.showFloatingText(scene.player.x, scene.player.y - 60, 'Không đủ nguyên liệu!', '#ff7777');
      return;
    }
    deductCraftMaterials(item, gameState);
    if (tab === 'pills') {
      gameState.inventory.pills[item.name] = (gameState.inventory.pills[item.name] || 0) + 1;
      scene.showFloatingText(scene.player.x, scene.player.y - 60, `Luyện thành [${item.name}]!`, '#ffd700');
    } else if (tab === 'talismans') {
      gameState.inventory.talismans[item.name] = (gameState.inventory.talismans[item.name] || 0) + 1;
      scene.showFloatingText(scene.player.x, scene.player.y - 60, `Luyện thành [${item.name}]!`, '#66ffcc');
    } else {
      if (!gameState.inventory.formations.includes(item.name)) gameState.inventory.formations.push(item.name);
      scene.showFloatingText(scene.player.x, scene.player.y - 60, `Bố trí [${item.name}]!`, '#ffd700');
    }
    scene.updateHUD();
    scene.openCraftingPanel(tab, activeRank, item.name);
  }, {
    enabled: canCraft,
    fill: 0x166044,
    stroke: 0x61ffc0,
    color: '#ffffff',
    fontSize: '16px'
  });

  if (tab === 'pills' && owned > 0) {
    addButton(scene, panel, 0, 354, 430, 54, 'DÙNG ĐAN DƯỢC NGAY', () => {
      const result = scene.consumePill(item.name);
      if (result?.success) scene.openCraftingPanel(tab, activeRank, item.name);
    }, {
      fill: 0x145f7a,
      stroke: 0x69e7ff,
      color: '#ffffff',
      fontSize: '15px'
    });
  }

  addButton(scene, panel, 0, 420, 430, 48, '‹ QUAY LẠI DANH SÁCH', () => {
    scene.openCraftingPanel(tab, activeRank);
  }, {
    fill: 0x303e50,
    stroke: 0x94b8cc,
    color: '#eaf8ff',
    fontSize: '14px'
  });
}

export function installSimpleCraftingUI(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__simpleCraftingUiInstalled) return;
  const proto = MainGameScene.prototype;
  proto.__simpleCraftingUiInstalled = true;

  proto.openCraftingPanel = function openSimpleCraftingPanel(currentTab = 'pills', pillRankFilter = null, itemName = null) {
    const tab = ['pills', 'talismans', 'formations'].includes(currentTab) ? currentTab : 'pills';
    const playerRank = Math.max(1, getPlayerPillRank(gameState.realmIdx));
    const activeRank = tab === 'pills' ? (pillRankFilter || playerRank) : null;
    const panel = createShell(this, 'BÁCH NGHỆ', itemName ? 'Chi tiết & xác nhận' : 'Chọn mục cần xem');

    if (itemName) {
      const item = (CRAFTING_SYSTEM[tab] || []).find(entry => entry.name === itemName);
      if (item) {
        renderDetail(this, panel, tab, activeRank, item);
        return;
      }
    }

    renderCategoryTabs(this, panel, tab);
    if (tab === 'pills') renderRankSelector(this, panel, activeRank);
    renderList(this, panel, tab, activeRank);
  };
}
