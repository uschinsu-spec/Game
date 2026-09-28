import { gameState } from '../../state/gameState.js';

const MAP_THANH_VAN_OUTSKIRTS = 1;
const MAP_VAN_MOC = 2;

const HERB_QUALITY = {
  1: { name: 'Nhất Phẩm Sơ Cấp', color: '#a7f3d0', tint: 0x86efac },
  2: { name: 'Nhất Phẩm Trung Cấp', color: '#7dd3fc', tint: 0x38bdf8 },
  3: { name: 'Nhất Phẩm Cao Cấp', color: '#d8b4fe', tint: 0xc084fc },
  4: { name: 'Nhất Phẩm Cực Phẩm', color: '#fde68a', tint: 0xfbbf24 }
};

const COMMON_MINERALS = [
  { id: 'ore_0_iron', name: 'Phàm Thiết Khoáng', rankName: 'Phàm Phẩm', emoji: '⛏️', color: 0xaeb8c2, textColor: '#e2e8f0', desc: 'Khoáng sắt phàm tục dùng luyện khí và rèn trang bị nhập môn.' },
  { id: 'ore_0_copper', name: 'Xích Đồng Khoáng', rankName: 'Phàm Phẩm', emoji: '🪨', color: 0xd97745, textColor: '#fdba74', desc: 'Quặng đồng đỏ thường gặp tại Thanh Vân Ngoại Vi.' },
  { id: 'ore_0_greenstone', name: 'Thanh Thạch Khoáng', rankName: 'Phàm Phẩm', emoji: '🪨', color: 0x6fae8c, textColor: '#bbf7d0', desc: 'Đá xanh cứng chắc, nguyên liệu luyện khí cơ bản.' },
  { id: 'ore_0_blacksand', name: 'Hắc Sa Thiết', rankName: 'Phàm Phẩm', emoji: '⚫', color: 0x64748b, textColor: '#cbd5e1', desc: 'Thiết sa đen lẫn trong tầng đất đá ngoại vi.' }
];

const VAN_MOC_MINERALS = {
  1: [
    { id: 'ore_1_greensteel', name: 'Thanh Cương Khoáng', rankName: 'Nhất Phẩm Sơ Cấp', emoji: '💠', color: 0x4ade80, textColor: '#bbf7d0' },
    { id: 'ore_1_woodstone', name: 'Mộc Linh Thạch', rankName: 'Nhất Phẩm Sơ Cấp', emoji: '🟢', color: 0x22c55e, textColor: '#86efac' }
  ],
  2: [
    { id: 'ore_1_darkiron', name: 'Huyền Thiết Quặng', rankName: 'Nhất Phẩm Trung Cấp', emoji: '🔷', color: 0x38bdf8, textColor: '#7dd3fc' },
    { id: 'ore_1_jadecopper', name: 'Bích Đồng Tinh', rankName: 'Nhất Phẩm Trung Cấp', emoji: '💎', color: 0x06b6d4, textColor: '#67e8f9' }
  ],
  3: [
    { id: 'ore_1_spiritsteel', name: 'Tinh Cương Linh Khoáng', rankName: 'Nhất Phẩm Cao Cấp', emoji: '🔮', color: 0xa855f7, textColor: '#d8b4fe' },
    { id: 'ore_1_jade', name: 'Thanh Ngọc Khoáng', rankName: 'Nhất Phẩm Cao Cấp', emoji: '💠', color: 0x8b5cf6, textColor: '#c4b5fd' }
  ],
  4: [
    { id: 'ore_1_purplegold', name: 'Tử Kim Linh Khoáng', rankName: 'Nhất Phẩm Cực Phẩm', emoji: '✨', color: 0xf59e0b, textColor: '#fde68a' },
    { id: 'ore_1_vanmoc', name: 'Vạn Mộc Tinh Thạch', rankName: 'Nhất Phẩm Cực Phẩm', emoji: '🌟', color: 0xfbbf24, textColor: '#fef3c7' }
  ]
};

function currentMapId(scene) {
  return Number(gameState.currentMapId ?? scene?.currentMap?.id ?? 0);
}

function ensureMineralBag() {
  if (!gameState.materials || typeof gameState.materials !== 'object') gameState.materials = {};
  if (!gameState.materials.minerals || typeof gameState.materials.minerals !== 'object') {
    gameState.materials.minerals = {};
  }
  return gameState.materials.minerals;
}

function ensureHerbQualityBag() {
  if (!gameState.materials || typeof gameState.materials !== 'object') gameState.materials = {};
  if (!gameState.materials.herbQualities || typeof gameState.materials.herbQualities !== 'object') {
    gameState.materials.herbQualities = {};
  }
  return gameState.materials.herbQualities;
}

function qualityForZone(zone) {
  return HERB_QUALITY[Math.max(1, Math.min(4, Number(zone) || 1))];
}

function mineralFor(scene, zone, idx) {
  const mapId = currentMapId(scene);
  if (mapId === MAP_THANH_VAN_OUTSKIRTS) {
    return COMMON_MINERALS[Math.abs(Number(idx) || 0) % COMMON_MINERALS.length];
  }
  if (mapId === MAP_VAN_MOC) {
    const strictZone = Math.max(1, Math.min(4, Number(zone) || 1));
    const pool = VAN_MOC_MINERALS[strictZone];
    return pool[Math.abs(Number(idx) || 0) % pool.length];
  }
  return null;
}

function mineralSpawnPoints(scene) {
  const mapId = currentMapId(scene);
  const totalW = scene.worldW || 32000;
  const points = [];
  const addRange = (start, end, stepMin, stepMax, zone) => {
    for (let x = start; x < Math.min(end, totalW - 420); x += Phaser.Math.Between(stepMin, stepMax)) {
      points.push({ x, zone });
    }
  };

  if (mapId === MAP_THANH_VAN_OUTSKIRTS) {
    addRange(950, 4000, 1050, 1350, 1);
    addRange(4500, 12000, 760, 980, 2);
    addRange(12400, 22000, 560, 760, 3);
    addRange(22400, totalW - 420, 420, 600, 4);
  } else if (mapId === MAP_VAN_MOC) {
    // Càng sâu càng nhiều mỏ, cùng logic mật độ tăng dần như yêu thú/thảo dược.
    addRange(850, 4000, 900, 1150, 1);
    addRange(4300, 12000, 650, 850, 2);
    addRange(12300, 22000, 460, 620, 3);
    addRange(22300, totalW - 420, 300, 430, 4);
  }
  return points;
}

function spawnMineralNode(scene, x, y, zone, idx) {
  const def = mineralFor(scene, zone, idx);
  if (!def) return null;

  const container = scene.add.container(x, y).setDepth(Math.floor(y) + 3);
  const shadow = scene.add.ellipse(0, 14, 38, 12, 0x000000, 0.35);
  const aura = scene.add.ellipse(0, 8, 42, 18, def.color, 0.34);
  const rock = scene.textures.exists('mat_ore')
    ? scene.add.image(0, -4, 'mat_ore').setDisplaySize(38, 38).setTint(def.color)
    : scene.add.text(0, -4, def.emoji, { fontSize: '30px' }).setOrigin(0.5);
  const tagBg = scene.add.rectangle(0, -36, 144, 18, 0x07131d, 0.92).setStrokeStyle(1, def.color, 1);
  const tag = scene.add.text(0, -36, `${def.emoji} ${def.name}`, {
    fontFamily: 'sans-serif', fontSize: '8px', fontStyle: 'bold', color: def.textColor,
    stroke: '#000', strokeThickness: 2
  }).setOrigin(0.5);
  const grade = scene.add.text(0, -23, def.rankName, {
    fontFamily: 'sans-serif', fontSize: '7px', fontStyle: 'bold', color: def.textColor,
    stroke: '#000', strokeThickness: 2
  }).setOrigin(0.5);
  const promptBg = scene.add.rectangle(0, -56, 84, 16, 0x3f3410, 0.96).setStrokeStyle(1, 0xfde047).setVisible(false);
  const prompt = scene.add.text(0, -56, '⛏ [Khai Khoáng]', {
    fontFamily: 'sans-serif', fontSize: '7px', fontStyle: 'bold', color: '#fef08a'
  }).setOrigin(0.5).setVisible(false);

  container.add([shadow, aura, rock, tagBg, tag, grade, promptBg, prompt]);
  scene.tweens.add({ targets: aura, scaleX: 1.3, scaleY: 1.3, alpha: 0.10, yoyo: true, repeat: -1, duration: 900 + Math.random() * 300 });
  scene.tweens.add({ targets: rock, y: '-=2', angle: { from: -2, to: 2 }, yoyo: true, repeat: -1, duration: 1250 + Math.random() * 350, ease: 'Sine.easeInOut' });

  const hitZone = scene.add.rectangle(x, y - 18, 116, 68, 0x000000, 0)
    .setInteractive({ useHandCursor: true })
    .setDepth(Math.floor(y) + 5);

  const node = { x, y, zone, idx, def, container, hitZone, promptBg, prompt, isHarvested: false };
  hitZone.on('pointerdown', pointer => {
    pointer?.event?.stopPropagation?.();
    scene.interactWithMineral?.(node);
  });

  const playerX = scene.player?.x ?? 350;
  const near = Math.abs(x - playerX) <= 950;
  container.setVisible(near);
  hitZone.setVisible(near);
  scene.mineralNodes.push(node);
  return node;
}

function initMineralNodes(scene) {
  if (Array.isArray(scene.mineralNodes)) {
    scene.mineralNodes.forEach(node => {
      node?.container?.destroy?.(true);
      node?.hitZone?.destroy?.();
    });
  }
  scene.mineralNodes = [];
  scene.mineralTarget = null;

  const mapId = currentMapId(scene);
  if (mapId !== MAP_THANH_VAN_OUTSKIRTS && mapId !== MAP_VAN_MOC) return;
  const points = mineralSpawnPoints(scene);
  points.forEach((sp, idx) => {
    const y = Phaser.Math.Between(scene.field.top + 42, scene.field.bottom - 38);
    spawnMineralNode(scene, sp.x, y, sp.zone, idx);
  });
}

function harvestMineral(scene, node) {
  if (!node || node.isHarvested || !scene.player?.active) return;
  node.isHarvested = true;
  scene.mineralTarget = null;
  node.promptBg?.setVisible(false);
  node.prompt?.setVisible(false);

  const mapId = currentMapId(scene);
  let count = 1;
  if (mapId === MAP_THANH_VAN_OUTSKIRTS) count = Phaser.Math.Between(1, 2);
  else if (node.zone === 2) count = Phaser.Math.Between(1, 2);
  else if (node.zone === 3) count = 2;
  else if (node.zone === 4) count = Phaser.Math.Between(2, 3);

  const bag = ensureMineralBag();
  bag[node.def.id] = (bag[node.def.id] || 0) + count;

  // Tương thích toàn bộ hệ luyện khí/rèn hiện tại đang dùng gameState.ores.
  gameState.ores = (gameState.ores || 0) + count;

  scene.spawnVfx?.(node.x, node.y, 0, 0.55, { tint: node.def.color, duration: 330 });
  scene.showFloatingText?.(
    scene.player.x,
    scene.player.y - 64,
    `${node.def.emoji} KHAI KHOÁNG: +${count} ${node.def.name} • ${node.def.rankName}`,
    node.def.textColor,
    '12px'
  );
  scene.updateHUD?.();

  scene.tweens.add({
    targets: node.container, scaleX: 0.12, scaleY: 0.12, alpha: 0, duration: 280, ease: 'Cubic.easeIn',
    onComplete: () => {
      node.container?.setVisible(false);
      node.hitZone?.setVisible(false);
    }
  });

  const delay = Phaser.Math.Between(30000, 45000);
  scene.time.delayedCall(delay, () => {
    if (!node || !scene.scene?.isActive()) return;
    node.isHarvested = false;
    node.container?.setScale(1).setAlpha(1);
    const near = Math.abs((scene.player?.x ?? 350) - node.x) <= 950;
    node.container?.setVisible(near);
    node.hitZone?.setVisible(near);
    if (near) scene.spawnVfx?.(node.x, node.y, 0, 0.42, { tint: node.def.color, duration: 240 });
  });
}

function updateMineralNodes(scene) {
  if (!Array.isArray(scene.mineralNodes) || !scene.player?.active) return;
  const px = scene.player.x;
  const py = scene.player.y;
  scene.mineralNodes.forEach(node => {
    if (!node?.container) return;
    if (node.isHarvested) {
      node.container.setVisible(false);
      node.hitZone?.setVisible(false);
      return;
    }
    const near = Math.abs(node.x - px) <= 950;
    if (node.container.visible !== near) {
      node.container.setVisible(near);
      node.hitZone?.setVisible(near);
    }
    if (!near) return;
    const dist = Phaser.Math.Distance.Between(px, py, node.x, node.y);
    const showPrompt = dist <= 125;
    node.promptBg?.setVisible(showPrompt);
    node.prompt?.setVisible(showPrompt);
  });
}

function addVanMocHerbGradeLabel(scene, herb, zone, quality) {
  if (!herb?.container || !quality) return;
  const label = scene.add.text(0, -20, quality.name, {
    fontFamily: 'sans-serif', fontSize: '7px', fontStyle: 'bold', color: quality.color,
    stroke: '#000', strokeThickness: 2
  }).setOrigin(0.5);
  herb.container.add(label);
  herb.qualityLabel = label;
  herb.resourceQuality = quality.name;
}

export function installWorldResourceProgression(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__worldResourceProgressionInstalled) return;
  const proto = MainGameScene.prototype;
  proto.__worldResourceProgressionInstalled = true;
  ensureMineralBag();
  ensureHerbQualityBag();

  const previousSpawnHerb = proto.spawnOneHerb;
  if (typeof previousSpawnHerb === 'function') {
    proto.spawnOneHerb = function spawnHerbWithVanMocQuality(x, y, zone = 1, idx = 0, herbDef = null) {
      let finalDef = herbDef;
      const mapId = currentMapId(this);
      if (mapId === MAP_VAN_MOC && herbDef) {
        const quality = qualityForZone(zone);
        finalDef = { ...herbDef, rank: 1, rankName: quality.name, color: quality.color };
      }
      const herb = previousSpawnHerb.call(this, x, y, zone, idx, finalDef);
      if (mapId === MAP_VAN_MOC && herb) {
        const quality = qualityForZone(zone);
        herb.herbDef = finalDef || herb.herbDef;
        addVanMocHerbGradeLabel(this, herb, zone, quality);
      }
      return herb;
    };
  }

  const previousHarvestHerb = proto.harvestHerb;
  if (typeof previousHarvestHerb === 'function') {
    proto.harvestHerb = function harvestHerbTrackQuality(herb) {
      if (herb && !herb.isHarvested && currentMapId(this) === MAP_VAN_MOC) {
        const quality = qualityForZone(herb.zone);
        const baseName = herb.herbDef?.name || 'Linh Thảo';
        const bag = ensureHerbQualityBag();
        if (!bag[baseName] || typeof bag[baseName] !== 'object') bag[baseName] = {};
        // HerbsMixin cho zone 1/2: 1–2; zone 3/4: 2–3. Ta lưu metadata sau khi hái bằng delta tổng.
        const before = Number(gameState.herbs?.[baseName] || 0);
        const result = previousHarvestHerb.call(this, herb);
        const after = Number(gameState.herbs?.[baseName] || 0);
        const gained = Math.max(0, after - before);
        if (gained > 0) bag[baseName][quality.name] = (bag[baseName][quality.name] || 0) + gained;
        return result;
      }
      return previousHarvestHerb.call(this, herb);
    };
  }

  proto.interactWithMineral = function interactWithMineral(node) {
    if (!node || node.isHarvested || !this.player?.active) return;
    if (gameState.isResting) {
      gameState.isResting = false;
      this.createSideToggleButtons?.();
    }
    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, node.x, node.y);
    if (dist <= 90) {
      harvestMineral(this, node);
      return;
    }
    this.mineralTarget = node;
    this.showFloatingText?.(this.player.x, this.player.y - 40, `⛏ Đang tiến lại khai thác ${node.def.name}...`, node.def.textColor, '11px');
    this.moveTarget = {
      x: node.x,
      y: node.y,
      onArrive: () => {
        this.mineralTarget = null;
        harvestMineral(this, node);
      }
    };
  };

  const previousInitHerbs = proto.initHerbs;
  if (typeof previousInitHerbs === 'function') {
    proto.initHerbs = function initHerbsAndMinerals(...args) {
      const result = previousInitHerbs.apply(this, args);
      initMineralNodes(this);
      return result;
    };
  }

  const previousUpdateHerbs = proto.updateHerbs;
  if (typeof previousUpdateHerbs === 'function') {
    proto.updateHerbs = function updateHerbsAndMinerals(time, delta) {
      const result = previousUpdateHerbs.call(this, time, delta);
      updateMineralNodes(this);
      return result;
    };
  }

  proto.getWorldMineralInventory = function getWorldMineralInventory() {
    const bag = ensureMineralBag();
    const defs = [...COMMON_MINERALS, ...Object.values(VAN_MOC_MINERALS).flat()];
    return defs.map(def => ({ ...def, count: Number(bag[def.id] || 0) })).filter(row => row.count > 0);
  };
}
