import { CRAFTING_SYSTEM, getPlayerPillRank } from '../../config/craftingData.js';
import { gameState } from '../../state/gameState.js';

const FONT = 'Be Vietnam Pro, sans-serif';

function stopPointer(scene, pointer) {
  scene?.input?.stopPropagation?.();
  pointer?.event?.stopPropagation?.();
  pointer?.event?.preventDefault?.();
}

function isThanhVanArea(scene) {
  const id = Number(gameState.currentMapId ?? scene?.currentMap?.id ?? 0);
  return id === 0 || id === 1;
}

function addRankTabs(scene, activeRank, earlyOnly = false) {
  const panel = scene.activeModal;
  if (!panel?.active) return;

  const blocker = scene.add.rectangle(0, -268, 494, 108, 0x124766, 1)
    .setStrokeStyle(1.5, 0x69eaff, 0.95)
    .setInteractive({ useHandCursor: false });
  panel.add(blocker);

  const addTab = (x, y, w, rank, label) => {
    const active = rank === activeRank;
    const bg = scene.add.rectangle(x, y, w, 42, active ? 0x176b55 : 0x123443, 1)
      .setStrokeStyle(2, active ? 0x7dffca : 0x4b8192, 1)
      .setInteractive({ useHandCursor: true });
    const txt = scene.add.text(x, y, label, {
      fontFamily: FONT,
      fontSize: '11px',
      fontStyle: 'bold',
      color: active ? '#edfff5' : '#c8edf6'
    }).setOrigin(0.5);
    bg.on('pointerdown', p => {
      stopPointer(scene, p);
      scene.openCraftingPanel('pills', rank);
    });
    panel.add([bg, txt]);
  };

  if (earlyOnly) {
    addTab(-116, -270, 220, 0, '🌱 PHÀM PHẨM');
    addTab(116, -270, 220, 1, '💊 NHẤT PHẨM');
    const note = scene.add.text(0, -222, 'Thanh Vân chỉ mở tối đa Đan Dược Nhất Phẩm', {
      fontFamily: FONT,
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#a9f5ff'
    }).setOrigin(0.5);
    panel.add(note);
    return;
  }

  const ranks = [
    [0, 'PHÀM'], [1, 'NHẤT'], [2, 'NHỊ'],
    [3, 'TAM'], [4, 'TỨ'], [5, 'NGŨ']
  ];
  ranks.forEach(([rank, label], idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    addTab(-164 + col * 164, -292 + row * 48, 150, rank, label);
  });
}

function addCommonBackOverride(scene) {
  const panel = scene.activeModal;
  if (!panel?.active) return;
  const bg = scene.add.rectangle(0, 420, 432, 50, 0x303e50, 1)
    .setStrokeStyle(2, 0x94b8cc, 1)
    .setInteractive({ useHandCursor: true });
  const txt = scene.add.text(0, 420, '‹ QUAY LẠI PHÀM PHẨM', {
    fontFamily: FONT,
    fontSize: '14px',
    fontStyle: 'bold',
    color: '#eaf8ff'
  }).setOrigin(0.5);
  bg.on('pointerdown', p => {
    stopPointer(scene, p);
    scene.openCraftingPanel('pills', 0);
  });
  panel.add([bg, txt]);
}

export function installCommonPillRankUiFix(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__commonPillRankUiFixInstalled) return;
  const proto = MainGameScene.prototype;
  proto.__commonPillRankUiFixInstalled = true;

  const previousOpen = proto.openCraftingPanel;
  if (typeof previousOpen !== 'function') return;

  proto.openCraftingPanel = function openCraftingWithCommonRank(currentTab = 'pills', pillRankFilter = null, itemName = null) {
    if (currentTab !== 'pills') {
      return previousOpen.call(this, currentTab, pillRankFilter, itemName);
    }

    const earlyOnly = isThanhVanArea(this);
    const realItem = itemName ? CRAFTING_SYSTEM.pills.find(p => p.name === itemName) : null;
    let requestedRank = realItem
      ? Number(realItem.pillRank ?? 0)
      : (pillRankFilter == null ? getPlayerPillRank(gameState.realmIdx) : Number(pillRankFilter));

    if (!Number.isFinite(requestedRank)) requestedRank = 0;
    requestedRank = Math.max(0, Math.min(earlyOnly ? 1 : 5, requestedRank));
    const wantsCommon = requestedRank === 0;

    if (!wantsCommon) {
      const result = previousOpen.call(this, 'pills', requestedRank, itemName);
      if (!itemName) addRankTabs(this, requestedRank, earlyOnly);
      return result;
    }

    const savedPills = [...CRAFTING_SYSTEM.pills];
    const commonAsRankOne = savedPills
      .filter(pill => Number(pill.pillRank) === 0)
      .map(pill => ({ ...pill, pillRank: 1 }));

    CRAFTING_SYSTEM.pills.splice(0, CRAFTING_SYSTEM.pills.length, ...commonAsRankOne);
    let result;
    try {
      result = previousOpen.call(this, 'pills', 1, itemName);
    } finally {
      CRAFTING_SYSTEM.pills.splice(0, CRAFTING_SYSTEM.pills.length, ...savedPills);
    }

    if (itemName) addCommonBackOverride(this);
    else addRankTabs(this, 0, earlyOnly);
    return result;
  };
}
