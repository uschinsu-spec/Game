import { W, H } from '../constants.js';
import { gameState } from '../../state/gameState.js';
import { ALL_MAPS } from '../../config/regionsData.js';
import { ALL_HERBS, getHerbsByRank } from '../../config/herbsData.js';
import { CRAFTING_SYSTEM } from '../../config/craftingData.js';
import { NPCS_DATA } from '../../config/npcData.js';
import { ELEMENTAL_SKILLS } from '../../config/skillsData.js';
import { addCurrency } from '../../config/currencyData.js';

const FONT = 'Be Vietnam Pro, sans-serif';
const COMMON_HERB_SELL_PRICE = 50;

const COMMON_HERBS = [
  { id: 'herb_0_1', rank: 0, rankName: 'Phàm Phẩm', name: 'Cỏ Thanh Tâm', emoji: '🌱', icon: 'herb_1', color: '#b7f7c5', price: 50, desc: 'Cỏ dại hấp thu chút linh khí, thường mọc quanh Thanh Vân Thôn.' },
  { id: 'herb_0_2', rank: 0, rankName: 'Phàm Phẩm', name: 'Lá Sương Mai', emoji: '🍃', icon: 'herb_2', color: '#a7f3d0', price: 50, desc: 'Lá non đọng sương sớm, dược tính ôn hòa dành cho phàm nhân.' },
  { id: 'herb_0_3', rank: 0, rankName: 'Phàm Phẩm', name: 'Hoa Dại Linh Khí', emoji: '🌼', icon: 'herb_3', color: '#fde68a', price: 50, desc: 'Hoa dại mang linh khí cực mỏng, dùng chế đan dược Phàm Phẩm.' },
  { id: 'herb_0_4', rank: 0, rankName: 'Phàm Phẩm', name: 'Rễ Cam Thảo', emoji: '🪴', icon: 'herb_4', color: '#d9f99d', price: 50, desc: 'Rễ cỏ thông dụng giúp điều hòa khí huyết và dược tính.' },
  { id: 'herb_0_5', rank: 0, rankName: 'Phàm Phẩm', name: 'Nấm Trắng Phàm', emoji: '🍄', icon: 'herb_5', color: '#f1f5f9', price: 50, desc: 'Nấm trắng mọc nơi ẩm mát, bổ sung sinh lực cho người thường.' },
  { id: 'herb_0_6', rank: 0, rankName: 'Phàm Phẩm', name: 'Diệp Sinh Cơ', emoji: '🌿', icon: 'herb_6', color: '#86efac', price: 50, desc: 'Lá thuốc dân gian hỗ trợ liền thương và hồi phục thể lực.' },
  { id: 'herb_0_7', rank: 0, rankName: 'Phàm Phẩm', name: 'Cỏ Hồi Huyết', emoji: '☘️', icon: 'herb_7', color: '#fca5a5', price: 50, desc: 'Cỏ thuốc đỏ nhạt dùng trong các phương thuốc hồi huyết cơ bản.' },
  { id: 'herb_0_8', rank: 0, rankName: 'Phàm Phẩm', name: 'Bồ Công Anh Linh', emoji: '🌾', icon: 'herb_1', color: '#fef08a', price: 50, desc: 'Bồ công anh nhiễm chút linh khí, dễ tìm ở đồng cỏ Thanh Vân.' },
  { id: 'herb_0_9', rank: 0, rankName: 'Phàm Phẩm', name: 'Mầm Thanh Lộ', emoji: '🌱', icon: 'herb_2', color: '#99f6e4', price: 50, desc: 'Mầm cây uống sương thanh lộ, làm dịu kinh mạch phàm nhân.' },
  { id: 'herb_0_10', rank: 0, rankName: 'Phàm Phẩm', name: 'Hương Diệp', emoji: '🍂', icon: 'herb_3', color: '#fdba74', price: 50, desc: 'Lá thơm dùng làm dẫn dược cho các loại đan Phàm Phẩm.' }
];

const COMMON_PILLS = [
  {
    id: 'pill_0_hp_1', rank: 'Phàm Phẩm', pillRank: 0, grade: 'Phổ Thông', type: 'heal', healHp: 80,
    name: 'Phàm Phẩm Hồi Huyết Tán',
    recipeHerbs: [{ name: 'Cỏ Hồi Huyết', count: 2 }, { name: 'Rễ Cam Thảo', count: 1 }],
    costOres: 0, costGold: 0,
    desc: 'Thuốc tán cơ bản của phàm nhân, hồi phục 80 HP.'
  },
  {
    id: 'pill_0_hp_2', rank: 'Phàm Phẩm', pillRank: 0, grade: 'Phổ Thông', type: 'heal', healHp: 120,
    name: 'Phàm Phẩm Dưỡng Thể Hoàn',
    recipeHerbs: [{ name: 'Lá Sương Mai', count: 2 }, { name: 'Nấm Trắng Phàm', count: 1 }],
    costOres: 0, costGold: 0,
    desc: 'Dược hoàn ôn hòa dùng dưỡng thể, hồi phục 120 HP.'
  },
  {
    id: 'pill_0_hp_3', rank: 'Phàm Phẩm', pillRank: 0, grade: 'Phổ Thông', type: 'heal', healHp: 160,
    name: 'Phàm Phẩm Sinh Cơ Tán',
    recipeHerbs: [{ name: 'Diệp Sinh Cơ', count: 2 }, { name: 'Cỏ Thanh Tâm', count: 2 }],
    costOres: 0, costGold: 0,
    desc: 'Thuốc trị thương tốt hơn cho người mới, hồi phục 160 HP.'
  },
  {
    id: 'pill_0_hp_4', rank: 'Phàm Phẩm', pillRank: 0, grade: 'Phổ Thông', type: 'heal', healHp: 220,
    name: 'Phàm Phẩm Phục Nguyên Hoàn',
    recipeHerbs: [{ name: 'Mầm Thanh Lộ', count: 2 }, { name: 'Hương Diệp', count: 2 }, { name: 'Bồ Công Anh Linh', count: 1 }],
    costOres: 0, costGold: 0,
    desc: 'Phàm dược thượng hạng trong thôn, hồi phục 220 HP.'
  }
];

function stopPointer(scene, pointer) {
  scene?.input?.stopPropagation?.();
  pointer?.event?.stopPropagation?.();
  pointer?.event?.preventDefault?.();
}

function fitSingleLine(textObj, maxWidth, minPx = 10) {
  if (!textObj) return;
  let size = parseFloat(textObj.style?.fontSize || 16);
  while (textObj.width > maxWidth && size > minPx) {
    size -= 1;
    textObj.setFontSize(size);
  }
}

function isThanhVanArea(scene) {
  const id = Number(gameState.currentMapId ?? scene?.currentMap?.id ?? 0);
  return id === 0 || id === 1;
}

function getMapHerbRank(scene) {
  const id = Number(gameState.currentMapId ?? scene?.currentMap?.id ?? 0);
  const map = ALL_MAPS.find(m => m.id === id) || scene?.currentMap || ALL_MAPS[0];
  if (id === 0 || id === 1) return 0;
  const minRealm = Math.max(1, Number(map?.minRealm ?? 1));
  return Math.max(1, Math.min(5, Math.floor((minRealm - 1) / 4) + 1));
}

function injectCommonData() {
  COMMON_HERBS.forEach(herb => {
    if (!ALL_HERBS.some(h => h.id === herb.id || h.name === herb.name)) ALL_HERBS.unshift({ ...herb });
  });
  COMMON_PILLS.slice().reverse().forEach(pill => {
    if (!CRAFTING_SYSTEM.pills.some(p => p.id === pill.id || p.name === pill.name)) CRAFTING_SYSTEM.pills.unshift({ ...pill });
  });
}

function addEarlyRankTabs(scene, activeRank) {
  const panel = scene.activeModal;
  if (!panel?.active) return;

  const blocker = scene.add.rectangle(0, -268, 492, 106, 0x124766, 1)
    .setStrokeStyle(1.5, 0x69eaff, 0.9)
    .setInteractive({ useHandCursor: false });

  const makeTab = (x, rank, label) => {
    const active = activeRank === rank;
    const bg = scene.add.rectangle(x, -270, 220, 54, active ? 0x176b55 : 0x123443, 1)
      .setStrokeStyle(2, active ? 0x7dffca : 0x4b8192, 1)
      .setInteractive({ useHandCursor: true });
    const txt = scene.add.text(x, -270, label, {
      fontFamily: FONT, fontSize: '14px', fontStyle: 'bold', color: active ? '#edfff5' : '#c8edf6'
    }).setOrigin(0.5);
    bg.on('pointerdown', p => {
      stopPointer(scene, p);
      scene.openCraftingPanel('pills', rank);
    });
    panel.add([bg, txt]);
  };

  panel.add(blocker);
  makeTab(-116, 0, '🌱 PHÀM PHẨM');
  makeTab(116, 1, '💊 NHẤT PHẨM');

  const note = scene.add.text(0, -222, 'Thanh Vân: Đan Dược tối đa Nhất Phẩm', {
    fontFamily: FONT, fontSize: '10px', fontStyle: 'bold', color: '#a9f5ff'
  }).setOrigin(0.5);
  panel.add(note);
}

function createHerbMarketShell(scene, subtitle) {
  scene.closeModal();
  const overlay = scene.fixed(scene.add.rectangle(W / 2, H / 2, W + 16, H + 16, 0x000000, 0.001), 1999998)
    .setInteractive({ useHandCursor: false });
  const panel = scene.fixed(scene.add.container(W / 2, H / 2), 2000000);
  scene.activeModal = panel;
  scene.activeModalOverlay = overlay;
  scene.enterUiHardPause?.();
  overlay.on('pointerdown', p => stopPointer(scene, p));
  overlay.on('pointerup', p => stopPointer(scene, p));

  const bg = scene.add.rectangle(0, 0, W - 6, H - 6, 0x124766, 0.98).setStrokeStyle(3, 0x7df3ff, 1);
  const header = scene.add.rectangle(0, -420, W - 24, 94, 0x0b5a70, 1).setStrokeStyle(2, 0xffdc63, 1);
  const title = scene.add.text(-238, -437, '🌿 THƯƠNG HỘI • LINH THẢO', {
    fontFamily: FONT, fontSize: '22px', fontStyle: 'bold', color: '#ffe77a'
  }).setOrigin(0, 0.5);
  const sub = scene.add.text(-238, -402, subtitle, {
    fontFamily: FONT, fontSize: '12px', fontStyle: 'bold', color: '#b9f8ff'
  }).setOrigin(0, 0.5);
  fitSingleLine(title, 360, 15);
  fitSingleLine(sub, 360, 10);
  panel.add([bg, header, title, sub]);
  scene.createModalCloseBtn(panel);
  return panel;
}

function ownedCommonHerbs() {
  const bag = (typeof gameState.herbs === 'object' && gameState.herbs) ? gameState.herbs : {};
  return COMMON_HERBS.map(h => ({ ...h, count: Number(bag[h.name] || 0) })).filter(h => h.count > 0);
}

function sellCommonHerb(scene, herb, count) {
  if (!herb || count <= 0) return false;
  if (typeof gameState.herbs !== 'object' || gameState.herbs === null) gameState.herbs = {};
  const have = Number(gameState.herbs[herb.name] || 0);
  const qty = Math.min(have, count);
  if (qty <= 0) return false;
  gameState.herbs[herb.name] = have - qty;
  addCurrency(gameState, 'silver', qty * COMMON_HERB_SELL_PRICE);
  scene.updateHUD?.();
  scene.showFloatingText?.(scene.player.x, scene.player.y - 60, `+${qty * COMMON_HERB_SELL_PRICE} Bạc • bán ${qty} ${herb.name}`, '#ffe45c', '12px');
  return true;
}

function installTradeGuildAction() {
  const guild = NPCS_DATA.find(npc => npc.id === 'thuong_hoi');
  if (!guild) return;
  if (!Array.isArray(guild.actions)) guild.actions = [];
  if (!guild.actions.some(a => a.id === 'sell_common_herbs')) {
    guild.actions.push({
      id: 'sell_common_herbs',
      label: '🌿 Bán Linh Thảo Phàm Phẩm (50 Bạc/Cây)',
      desc: 'Thương Hội thu mua mọi Linh Thảo Phàm Phẩm với giá cố định 50 Bạc mỗi cây.',
      color: '#34d399',
      execute: scene => {
        scene.openCommonHerbSellPanel?.();
        return { success: true };
      }
    });
  }

  const drugShop = NPCS_DATA.find(npc => npc.id === 'duoc_diem');
  const craftAction = drugShop?.actions?.find(a => a.id === 'craft_pills');
  if (craftAction) craftAction.desc = 'Luyện Đan Dược Phàm Phẩm và Nhất Phẩm tại khu vực Thanh Vân.';
}

export function installEarlyGamePharmacopeia(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__earlyGamePharmacopeiaInstalled) return;
  const proto = MainGameScene.prototype;
  proto.__earlyGamePharmacopeiaInstalled = true;

  injectCommonData();
  installTradeGuildAction();

  const originalSpawnOneHerb = proto.spawnOneHerb;
  if (typeof originalSpawnOneHerb === 'function' && !originalSpawnOneHerb.__commonHerbWrapped) {
    const wrappedSpawn = function spawnHerbByMapProgression(x, y, zone = 1, idx = 0, herbDef = null) {
      const pool = getHerbsByRank(getMapHerbRank(this));
      const selected = pool.length ? pool[Math.abs(Number(idx) || 0) % pool.length] : herbDef;
      return originalSpawnOneHerb.call(this, x, y, zone, idx, selected);
    };
    wrappedSpawn.__commonHerbWrapped = true;
    proto.spawnOneHerb = wrappedSpawn;
  }

  const originalInitHerbs = proto.initHerbs;
  if (typeof originalInitHerbs === 'function' && !originalInitHerbs.__commonHerbWrapped) {
    const wrappedInit = function initHerbsWithThanhVanCommons(...args) {
      const result = originalInitHerbs.apply(this, args);
      // Thanh Van Village is now a static image hub. Resource nodes belong to
      // the outdoor maps and must not cover the labels painted into IMG_7504.
      return result;
    };
    wrappedInit.__commonHerbWrapped = true;
    proto.initHerbs = wrappedInit;
  }

  const originalCrafting = proto.openCraftingPanel;
  if (typeof originalCrafting === 'function' && !originalCrafting.__earlyRankWrapped) {
    const wrappedCrafting = function openThanhVanCrafting(currentTab = 'pills', pillRankFilter = null, itemName = null) {
      if (!isThanhVanArea(this) || currentTab !== 'pills') {
        return originalCrafting.call(this, currentTab, pillRankFilter, itemName);
      }

      const item = itemName ? CRAFTING_SYSTEM.pills.find(p => p.name === itemName) : null;
      let requestedRank = item ? Number(item.pillRank ?? 0) : (pillRankFilter == null ? 0 : Number(pillRankFilter));
      if (!Number.isFinite(requestedRank)) requestedRank = 0;
      requestedRank = Math.max(0, Math.min(1, requestedRank));

      let result;
      if (requestedRank === 0) {
        const savedRealm = gameState.realmIdx;
        gameState.realmIdx = 0;
        try {
          result = originalCrafting.call(this, 'pills', null, item?.pillRank === 0 ? itemName : null);
        } finally {
          gameState.realmIdx = savedRealm;
        }
      } else {
        result = originalCrafting.call(this, 'pills', 1, item?.pillRank === 1 ? itemName : null);
      }

      if (!itemName) addEarlyRankTabs(this, requestedRank);
      return result;
    };
    wrappedCrafting.__earlyRankWrapped = true;
    proto.openCraftingPanel = wrappedCrafting;
  }

  const originalSkillPanel = proto.openSkillPanel;
  if (typeof originalSkillPanel === 'function' && !originalSkillPanel.__earlySkillWrapped) {
    const wrappedSkills = function openThanhVanSkills(activeElem = 'Kiếm', selectedSkillId = null) {
      if (!isThanhVanArea(this)) return originalSkillPanel.call(this, activeElem, selectedSkillId);

      const all = [...ELEMENTAL_SKILLS];
      const allowed = all.filter(skill => Number(skill.minRealm ?? 0) < 4);
      const selectedAllowed = selectedSkillId && allowed.some(skill => skill.id === selectedSkillId) ? selectedSkillId : null;
      ELEMENTAL_SKILLS.splice(0, ELEMENTAL_SKILLS.length, ...allowed);
      try {
        return originalSkillPanel.call(this, activeElem, selectedAllowed);
      } finally {
        ELEMENTAL_SKILLS.splice(0, ELEMENTAL_SKILLS.length, ...all);
      }
    };
    wrappedSkills.__earlySkillWrapped = true;
    proto.openSkillPanel = wrappedSkills;
  }

  proto.openCommonHerbSellPanel = function openCommonHerbSellPanel(selectedHerbId = null) {
    const selected = selectedHerbId ? COMMON_HERBS.find(h => h.id === selectedHerbId) : null;
    const panel = createHerbMarketShell(this, `Thu mua Phàm Phẩm: ${COMMON_HERB_SELL_PRICE} Bạc / cây`);

    if (selected) {
      const have = Number(gameState.herbs?.[selected.name] || 0);
      const card = this.add.rectangle(0, -240, 474, 150, 0x0f5a54, 1).setStrokeStyle(2, 0x6fffc4, 1);
      const icon = this.add.text(-195, -240, selected.emoji, { fontSize: '44px' }).setOrigin(0.5);
      const name = this.add.text(-145, -263, selected.name, { fontFamily: FONT, fontSize: '20px', fontStyle: 'bold', color: '#eafff4' }).setOrigin(0, 0.5);
      const meta = this.add.text(-145, -222, `Phàm Phẩm • Đang có: ${have} • Giá: 50 Bạc/cây`, { fontFamily: FONT, fontSize: '12px', color: '#baffde' }).setOrigin(0, 0.5);
      fitSingleLine(name, 350, 13);
      fitSingleLine(meta, 350, 10);
      panel.add([card, icon, name, meta]);

      const makeAction = (y, label, fill, stroke, action, enabled = true) => {
        const bg = this.add.rectangle(0, y, 430, 62, enabled ? fill : 0x33424b, 1)
          .setStrokeStyle(2, enabled ? stroke : 0x66747d, 1)
          .setInteractive({ useHandCursor: enabled });
        const txt = this.add.text(0, y, label, { fontFamily: FONT, fontSize: '15px', fontStyle: 'bold', color: enabled ? '#ffffff' : '#94a3b8' }).setOrigin(0.5);
        if (enabled) bg.on('pointerdown', p => { stopPointer(this, p); action(); });
        panel.add([bg, txt]);
      };

      makeAction(-90, 'BÁN 1 CÂY • +50 BẠC', 0x176b55, 0x7dffca, () => {
        if (sellCommonHerb(this, selected, 1)) this.openCommonHerbSellPanel(selected.id);
      }, have > 0);
      makeAction(-10, `BÁN TẤT CẢ ${have} CÂY • +${have * 50} BẠC`, 0x71531a, 0xffdc63, () => {
        if (sellCommonHerb(this, selected, have)) this.openCommonHerbSellPanel();
      }, have > 0);
      makeAction(90, '‹ QUAY LẠI DANH SÁCH', 0x29485a, 0x8ddff5, () => this.openCommonHerbSellPanel(), true);
      return;
    }

    const owned = ownedCommonHerbs();
    if (!owned.length) {
      const empty = this.add.text(0, -40, 'Chưa có Linh Thảo Phàm Phẩm để bán.\nHãy thu hái tại Thanh Vân Thôn hoặc Thanh Vân Ngoại Vi.', {
        fontFamily: FONT, fontSize: '16px', fontStyle: 'bold', color: '#d9fbff', align: 'center', lineSpacing: 8
      }).setOrigin(0.5);
      panel.add(empty);
      return;
    }

    owned.slice(0, 10).forEach((herb, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = col === 0 ? -121 : 121;
      const y = -300 + row * 116;
      const box = this.add.rectangle(x, y, 224, 98, 0x0e4f56, 1)
        .setStrokeStyle(2, 0x62eec8, 1)
        .setInteractive({ useHandCursor: true });
      const icon = this.add.text(x - 82, y, herb.emoji, { fontSize: '26px' }).setOrigin(0.5);
      const name = this.add.text(x - 55, y - 18, herb.name, { fontFamily: FONT, fontSize: '13px', fontStyle: 'bold', color: '#eafff4' }).setOrigin(0, 0.5);
      const info = this.add.text(x - 55, y + 18, `Có ${herb.count} • 50 Bạc/cây`, { fontFamily: FONT, fontSize: '10px', color: '#baffde' }).setOrigin(0, 0.5);
      fitSingleLine(name, 150, 10);
      box.on('pointerdown', p => { stopPointer(this, p); this.openCommonHerbSellPanel(herb.id); });
      panel.add([box, icon, name, info]);
    });
  };
}
