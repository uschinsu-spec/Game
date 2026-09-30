/**
 * HerbsMixin.js
 * Quản lý Hệ thống Tài nguyên Thế Giới: Linh Thảo & Khai Khoáng
 * =============================================================
 * - Linh Thảo: Thu hái thảo dược phân bố theo độ sâu map (Zone 1..4) kèm phẩm cấp chất lượng.
 * - Khai Khoáng: Khai thác khoáng thạch (Phàm Thiết, Xích Đồng, Thanh Cương, Huyền Thiết, Tử Kim,...).
 * - Thu Hái / Khai Thác: Click từ xa tự động di chuyển đến gần hoặc bấm trực tiếp khi đứng gần (<= 90px).
 * - Tự động hồi sinh (Respawn) sau chu kỳ 25 - 45s.
 */
import { gameState } from '../../state/gameState.js';
import { getMapById } from '../../config/world/worldRegistry.js?v=20260929-single-map-system-v1';
import { ALL_HERBS, getHerbsByRank } from '../../config/herbsData.js';

const MAP_THANH_VAN_OUTSKIRTS = 1;
const MAP_VAN_MOC = 2;

export const HERB_QUALITY = {
  1: { name: 'Nhất Phẩm Sơ Cấp', color: '#a7f3d0', tint: 0x86efac },
  2: { name: 'Nhất Phẩm Trung Cấp', color: '#7dd3fc', tint: 0x38bdf8 },
  3: { name: 'Nhất Phẩm Cao Cấp', color: '#d8b4fe', tint: 0xc084fc },
  4: { name: 'Nhất Phẩm Cực Phẩm', color: '#fde68a', tint: 0xfbbf24 }
};

export const COMMON_MINERALS = [
  { id: 'ore_0_iron', name: 'Phàm Thiết Khoáng', rankName: 'Phàm Phẩm', emoji: '⛏️', color: 0xaeb8c2, textColor: '#e2e8f0', desc: 'Khoáng sắt phàm tục dùng luyện khí và rèn trang bị nhập môn.' },
  { id: 'ore_0_copper', name: 'Xích Đồng Khoáng', rankName: 'Phàm Phẩm', emoji: '🪨', color: 0xd97745, textColor: '#fdba74', desc: 'Quặng đồng đỏ thường gặp tại Thanh Vân Ngoại Vi.' },
  { id: 'ore_0_greenstone', name: 'Thanh Thạch Khoáng', rankName: 'Phàm Phẩm', emoji: '🪨', color: 0x6fae8c, textColor: '#bbf7d0', desc: 'Đá xanh cứng chắc, nguyên liệu luyện khí cơ bản.' },
  { id: 'ore_0_blacksand', name: 'Hắc Sa Thiết', rankName: 'Phàm Phẩm', emoji: '⚫', color: 0x64748b, textColor: '#cbd5e1', desc: 'Thiết sa đen lẫn trong tầng đất đá ngoại vi.' }
];

export const VAN_MOC_MINERALS = {
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

export const HerbsMixin = {

  // =========================================================================
  // 1. KHỞI TẠO TOÀN BỘ LINH THẢO & KHOÁNG THẠCH TRÊN BẢN ĐỒ
  // =========================================================================
  initHerbs() {
    ensureMineralBag();
    ensureHerbQualityBag();

    // Dọn dẹp herbs cũ
    if (this.herbsGroup) {
      this.herbsGroup.forEach(h => {
        if (h.container) h.container.destroy(true);
        if (h.hitZone) h.hitZone.destroy();
      });
    }
    this.herbsGroup = [];
    this.herbTarget = null;

    const curMapId = Number(gameState.currentMapId ?? this.currentMap?.id ?? 0);
    const map = this.currentMap || getMapById(curMapId);

    // Trong thôn (map 0 an toàn) không sinh linh thảo / khoáng thạch hoang dã
    if (map?.isPeaceZone || curMapId === 0) {
      this.initMineralNodes();
      return;
    }

    const totalW = this.worldW || 32000;
    const herbSpawnPoints = [];

    // MẬT ĐỘ TĂNG DẦN THEO ĐỘ SÂU BẢN ĐỒ
    for (let x = 750; x < 4000; x += Phaser.Math.Between(850, 1200)) {
      herbSpawnPoints.push({ x, zone: 1 });
    }
    for (let x = 4200; x < 12000; x += Phaser.Math.Between(520, 780)) {
      herbSpawnPoints.push({ x, zone: 2 });
    }
    for (let x = 12200; x < 22000; x += Phaser.Math.Between(340, 520)) {
      herbSpawnPoints.push({ x, zone: 3 });
    }
    for (let x = 22200; x < totalW - 400; x += Phaser.Math.Between(220, 360)) {
      herbSpawnPoints.push({ x, zone: 4 });
    }

    const mapRank = Math.min(5, Math.max(1, curMapId));
    const availableHerbs = getHerbsByRank(mapRank);

    herbSpawnPoints.forEach((sp, idx) => {
      const y = Phaser.Math.Between(this.field.top + 35, this.field.bottom - 35);
      const herbDef = availableHerbs[idx % availableHerbs.length] || availableHerbs[0];
      this.spawnOneHerb(sp.x, y, sp.zone, idx, herbDef);
    });

    // Khởi tạo khoáng thạch đồng bộ
    this.initMineralNodes();
  },

  // =========================================================================
  // 2. SINH MỘT CÂY LINH THẢO (KÈM PHẨM CẤP CHẤT LƯỢNG)
  // =========================================================================
  spawnOneHerb(x, y, zone = 1, idx = 0, herbDef = null) {
    const curMapId = Number(gameState.currentMapId ?? this.currentMap?.id ?? 1);
    if (!herbDef) {
      const mapRank = Math.min(5, Math.max(1, curMapId));
      const pool = getHerbsByRank(mapRank);
      herbDef = pool[idx % pool.length] || pool[0];
    }

    const quality = qualityForZone(zone);
    if (curMapId === MAP_VAN_MOC && herbDef) {
      herbDef = { ...herbDef, rank: 1, rankName: quality.name, color: quality.color };
    }

    const herbTex = (herbDef?.icon && this.textures.exists(herbDef.icon))
      ? herbDef.icon
      : (this.textures.exists(`herb_${(idx % 7) + 1}`) ? `herb_${(idx % 7) + 1}` : 'mat_herb');
    const container = this.add.container(x, y).setDepth(Math.floor(y) + 4);

    const shadow = this.add.ellipse(0, 12, 28, 9, 0x000000, 0.35);
    const auraColorHex = parseInt((herbDef.color || '#34d399').replace('#', ''), 16);
    const aura = this.add.ellipse(0, 8, 32, 14, auraColorHex, 0.45);
    this.tweens.add({
      targets: aura,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0.15,
      yoyo: true,
      repeat: -1,
      duration: 700 + Math.random() * 300
    });

    const sprite = this.add.image(0, -6, this.textures.exists(herbTex) ? herbTex : 'mat_herb')
      .setDisplaySize(32, 32);

    this.tweens.add({
      targets: sprite,
      angle: { from: -4, to: 4 },
      y: '-=2',
      duration: 1200 + Math.random() * 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const tagBg = this.add.rectangle(0, -32, 116, 17, 0x081c15, 0.9)
      .setStrokeStyle(1.2, auraColorHex);
    const tagTxt = this.add.text(0, -32, `${herbDef.emoji} ${herbDef.name}`, {
      fontFamily: 'sans-serif',
      fontSize: '8px',
      fontStyle: 'bold',
      color: herbDef.color || '#86efac'
    }).setOrigin(0.5);

    const btnPrompt = this.add.rectangle(0, -50, 74, 15, 0x14532d, 0.95)
      .setStrokeStyle(1, 0xfacc15)
      .setVisible(false);
    const btnTxt = this.add.text(0, -50, '✨ [Thu Hái]', {
      fontFamily: 'sans-serif',
      fontSize: '7.5px',
      fontStyle: 'bold',
      color: '#fef08a'
    }).setOrigin(0.5).setVisible(false);

    this.tweens.add({
      targets: [btnPrompt, btnTxt],
      y: '-=3',
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    container.add([shadow, aura, sprite, tagBg, tagTxt, btnPrompt, btnTxt]);

    if (curMapId === MAP_VAN_MOC && quality) {
      const gradeLabel = this.add.text(0, -20, quality.name, {
        fontFamily: 'sans-serif', fontSize: '7px', fontStyle: 'bold', color: quality.color,
        stroke: '#000', strokeThickness: 2
      }).setOrigin(0.5);
      container.add(gradeLabel);
    }

    const hitZone = this.add.rectangle(x, y - 20, 110, 60, 0x000000, 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(Math.floor(y) + 5);

    const herbData = {
      x,
      y,
      zone,
      idx,
      herbDef,
      resourceQuality: quality?.name,
      container,
      hitZone,
      sprite,
      tagBg,
      btnPrompt,
      btnTxt,
      isHarvested: false,
      respawnTime: 0
    };

    hitZone.on('pointerdown', (pointer) => {
      if (pointer?.event) pointer.event.stopPropagation();
      this.interactWithHerb(herbData);
    });

    const playerX = this.player ? this.player.x : 350;
    const isNear = Math.abs(x - playerX) <= 950;
    container.setVisible(isNear);
    hitZone.setVisible(isNear);

    this.herbsGroup.push(herbData);
    return herbData;
  },

  interactWithHerb(herb) {
    if (!herb || herb.isHarvested || !this.player || !this.player.active) return;

    if (gameState.isResting) {
      gameState.isResting = false;
      if (this.createSideToggleButtons) this.createSideToggleButtons();
    }

    const px = this.player.x;
    const py = this.player.y;
    const dist = Phaser.Math.Distance.Between(px, py, herb.x, herb.y);

    if (dist <= 90) {
      this.harvestHerb(herb);
    } else {
      this.herbTarget = herb;
      const hName = herb.herbDef?.name || 'Linh Thảo';
      this.showFloatingText(this.player.x, this.player.y - 40, `🌿 Đang tiến lại hái ${hName}...`, '#86efac', '11px');
      this.moveTarget = {
        x: herb.x,
        y: herb.y,
        onArrive: () => {
          this.herbTarget = null;
          this.harvestHerb(herb);
        }
      };
    }
  },

  harvestHerb(herb) {
    if (!herb || herb.isHarvested || !this.player || !this.player.active) return;
    herb.isHarvested = true;
    this.herbTarget = null;

    if (herb.btnPrompt) herb.btnPrompt.setVisible(false);
    if (herb.btnTxt) herb.btnTxt.setVisible(false);

    const herbDef = herb.herbDef || ALL_HERBS[0];
    const count = herb.zone >= 3 ? Phaser.Math.Between(2, 3) : Phaser.Math.Between(1, 2);

    if (typeof gameState.herbs !== 'object' || gameState.herbs === null) {
      gameState.herbs = {};
    }
    gameState.herbs[herbDef.name] = (gameState.herbs[herbDef.name] || 0) + count;

    // Track quality metadata
    const quality = qualityForZone(herb.zone);
    const qBag = ensureHerbQualityBag();
    if (!qBag[herbDef.name] || typeof qBag[herbDef.name] !== 'object') qBag[herbDef.name] = {};
    qBag[herbDef.name][quality.name] = (qBag[herbDef.name][quality.name] || 0) + count;

    if (this.spawnVfx) {
      this.spawnVfx(herb.x, herb.y, 0, 0.7, { tint: 0x34d399, duration: 350 });
      this.spawnVfx(this.player.x, this.player.y, 0, 0.5, { tint: 0x67e8f9, duration: 300 });
    }

    this.showFloatingText(
      this.player.x,
      this.player.y - 65,
      `${herbDef.emoji} HÁI ĐƯỢC: +${count} [${herbDef.name}] (${quality.name})!`,
      herbDef.color || '#4ade80',
      '13px'
    );

    this.updateHUD();

    this.tweens.add({
      targets: herb.container,
      scaleX: 0.1,
      scaleY: 0.1,
      alpha: 0,
      duration: 300,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        herb.container.setVisible(false);
        if (herb.hitZone) herb.hitZone.setVisible(false);
      }
    });

    const respawnDelay = Phaser.Math.Between(25000, 40000);
    herb.respawnTime = this.time.now + respawnDelay;

    this.time.delayedCall(respawnDelay, () => {
      if (!herb || !this.scene || !this.scene.isActive()) return;
      this.respawnHerb(herb);
    });
  },

  respawnHerb(herb) {
    if (!herb) return;
    herb.isHarvested = false;
    herb.container.setScale(1).setAlpha(1);

    const playerX = this.player ? this.player.x : 350;
    const isNear = Math.abs(herb.x - playerX) <= 950;
    herb.container.setVisible(isNear);
    if (herb.hitZone) herb.hitZone.setVisible(isNear);

    if (isNear && this.spawnVfx) {
      this.spawnVfx(herb.x, herb.y, 0, 0.5, { tint: 0x34d399, duration: 250 });
    }
  },

  // =========================================================================
  // 3. KHỞI TẠO & QUẢN LÝ KHOÁNG THẠCH (KHAI KHOÁNG)
  // =========================================================================
  initMineralNodes() {
    if (Array.isArray(this.mineralNodes)) {
      this.mineralNodes.forEach(node => {
        node?.container?.destroy?.(true);
        node?.hitZone?.destroy?.();
      });
    }
    this.mineralNodes = [];
    this.mineralTarget = null;

    const curMapId = Number(gameState.currentMapId ?? this.currentMap?.id ?? 0);
    if (curMapId !== MAP_THANH_VAN_OUTSKIRTS && curMapId !== MAP_VAN_MOC) return;

    const totalW = this.worldW || 32000;
    const points = [];
    const addRange = (start, end, stepMin, stepMax, zone) => {
      for (let x = start; x < Math.min(end, totalW - 420); x += Phaser.Math.Between(stepMin, stepMax)) {
        points.push({ x, zone });
      }
    };

    if (curMapId === MAP_THANH_VAN_OUTSKIRTS) {
      addRange(950, 4000, 1050, 1350, 1);
      addRange(4500, 12000, 760, 980, 2);
      addRange(12400, 22000, 560, 760, 3);
      addRange(22400, totalW - 420, 420, 600, 4);
    } else if (curMapId === MAP_VAN_MOC) {
      addRange(850, 4000, 900, 1150, 1);
      addRange(4300, 12000, 650, 850, 2);
      addRange(12300, 22000, 460, 620, 3);
      addRange(22300, totalW - 420, 300, 430, 4);
    }

    points.forEach((sp, idx) => {
      const y = Phaser.Math.Between(this.field.top + 42, this.field.bottom - 38);
      this.spawnMineralNode(sp.x, y, sp.zone, idx);
    });
  },

  spawnMineralNode(x, y, zone, idx) {
    const curMapId = Number(gameState.currentMapId ?? this.currentMap?.id ?? 0);
    let def = null;
    if (curMapId === MAP_THANH_VAN_OUTSKIRTS) {
      def = COMMON_MINERALS[Math.abs(Number(idx) || 0) % COMMON_MINERALS.length];
    } else if (curMapId === MAP_VAN_MOC) {
      const strictZone = Math.max(1, Math.min(4, Number(zone) || 1));
      const pool = VAN_MOC_MINERALS[strictZone];
      def = pool[Math.abs(Number(idx) || 0) % pool.length];
    }
    if (!def) return null;

    const container = this.add.container(x, y).setDepth(Math.floor(y) + 3);
    const shadow = this.add.ellipse(0, 14, 38, 12, 0x000000, 0.35);
    const aura = this.add.ellipse(0, 8, 42, 18, def.color, 0.34);
    const rock = this.textures.exists('mat_ore')
      ? this.add.image(0, -4, 'mat_ore').setDisplaySize(38, 38).setTint(def.color)
      : this.add.text(0, -4, def.emoji, { fontSize: '30px' }).setOrigin(0.5);
    const tagBg = this.add.rectangle(0, -36, 144, 18, 0x07131d, 0.92).setStrokeStyle(1, def.color, 1);
    const tag = this.add.text(0, -36, `${def.emoji} ${def.name}`, {
      fontFamily: 'sans-serif', fontSize: '8px', fontStyle: 'bold', color: def.textColor,
      stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5);
    const grade = this.add.text(0, -23, def.rankName, {
      fontFamily: 'sans-serif', fontSize: '7px', fontStyle: 'bold', color: def.textColor,
      stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5);
    const promptBg = this.add.rectangle(0, -56, 84, 16, 0x3f3410, 0.96).setStrokeStyle(1, 0xfde047).setVisible(false);
    const prompt = this.add.text(0, -56, '⛏ [Khai Khoáng]', {
      fontFamily: 'sans-serif', fontSize: '7px', fontStyle: 'bold', color: '#fef08a'
    }).setOrigin(0.5).setVisible(false);

    container.add([shadow, aura, rock, tagBg, tag, grade, promptBg, prompt]);
    this.tweens.add({ targets: aura, scaleX: 1.3, scaleY: 1.3, alpha: 0.10, yoyo: true, repeat: -1, duration: 900 + Math.random() * 300 });
    this.tweens.add({ targets: rock, y: '-=2', angle: { from: -2, to: 2 }, yoyo: true, repeat: -1, duration: 1250 + Math.random() * 350, ease: 'Sine.easeInOut' });

    const hitZone = this.add.rectangle(x, y - 18, 116, 68, 0x000000, 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(Math.floor(y) + 5);

    const node = { x, y, zone, idx, def, container, hitZone, promptBg, prompt, isHarvested: false };
    hitZone.on('pointerdown', pointer => {
      pointer?.event?.stopPropagation?.();
      this.interactWithMineral?.(node);
    });

    const playerX = this.player?.x ?? 350;
    const near = Math.abs(x - playerX) <= 950;
    container.setVisible(near);
    hitZone.setVisible(near);
    this.mineralNodes.push(node);
    return node;
  },

  interactWithMineral(node) {
    if (!node || node.isHarvested || !this.player?.active) return;
    if (gameState.isResting) {
      gameState.isResting = false;
      this.createSideToggleButtons?.();
    }
    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, node.x, node.y);
    if (dist <= 90) {
      this.harvestMineral(node);
      return;
    }
    this.mineralTarget = node;
    this.showFloatingText?.(this.player.x, this.player.y - 40, `⛏ Đang tiến lại khai thác ${node.def.name}...`, node.def.textColor, '11px');
    this.moveTarget = {
      x: node.x,
      y: node.y,
      onArrive: () => {
        this.mineralTarget = null;
        this.harvestMineral(node);
      }
    };
  },

  harvestMineral(node) {
    if (!node || node.isHarvested || !this.player?.active) return;
    node.isHarvested = true;
    this.mineralTarget = null;
    node.promptBg?.setVisible(false);
    node.prompt?.setVisible(false);

    const curMapId = Number(gameState.currentMapId ?? this.currentMap?.id ?? 0);
    let count = 1;
    if (curMapId === MAP_THANH_VAN_OUTSKIRTS) count = Phaser.Math.Between(1, 2);
    else if (node.zone === 2) count = Phaser.Math.Between(1, 2);
    else if (node.zone === 3) count = 2;
    else if (node.zone === 4) count = Phaser.Math.Between(2, 3);

    const bag = ensureMineralBag();
    bag[node.def.id] = (bag[node.def.id] || 0) + count;
    gameState.ores = (gameState.ores || 0) + count;

    this.spawnVfx?.(node.x, node.y, 0, 0.55, { tint: node.def.color, duration: 330 });
    this.showFloatingText?.(
      this.player.x,
      this.player.y - 64,
      `${node.def.emoji} KHAI KHOÁNG: +${count} ${node.def.name} • ${node.def.rankName}`,
      node.def.textColor,
      '12px'
    );
    this.updateHUD?.();

    this.tweens.add({
      targets: node.container, scaleX: 0.12, scaleY: 0.12, alpha: 0, duration: 280, ease: 'Cubic.easeIn',
      onComplete: () => {
        node.container?.setVisible(false);
        node.hitZone?.setVisible(false);
      }
    });

    const delay = Phaser.Math.Between(30000, 45000);
    this.time.delayedCall(delay, () => {
      if (!node || !this.scene?.isActive()) return;
      node.isHarvested = false;
      node.container?.setScale(1).setAlpha(1);
      const near = Math.abs((this.player?.x ?? 350) - node.x) <= 950;
      node.container?.setVisible(near);
      node.hitZone?.setVisible(near);
      if (near) this.spawnVfx?.(node.x, node.y, 0, 0.42, { tint: node.def.color, duration: 240 });
    });
  },

  updateMineralNodes() {
    if (!Array.isArray(this.mineralNodes) || !this.player?.active) return;
    const px = this.player.x;
    const py = this.player.y;
    this.mineralNodes.forEach(node => {
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
  },

  getWorldMineralInventory() {
    const bag = ensureMineralBag();
    const defs = [...COMMON_MINERALS, ...Object.values(VAN_MOC_MINERALS).flat()];
    return defs.map(def => ({ ...def, count: Number(bag[def.id] || 0) })).filter(row => row.count > 0);
  },

  // =========================================================================
  // 4. TICK CẬP NHẬT CULLING & NÚT THU HÁI / KHAI KHOÁNG
  // =========================================================================
  updateHerbs(time, delta) {
    this.updateMineralNodes();

    if (!this.herbsGroup || this.herbsGroup.length === 0 || !this.player || !this.player.active) return;
    const px = this.player.x;
    const py = this.player.y;

    for (let i = 0; i < this.herbsGroup.length; i++) {
      const h = this.herbsGroup[i];
      if (!h || !h.container) continue;

      if (h.isHarvested) {
        if (h.container.visible) h.container.setVisible(false);
        if (h.hitZone && h.hitZone.visible) h.hitZone.setVisible(false);
        continue;
      }

      const isNear = Math.abs(h.x - px) <= 950;
      if (h.container.visible !== isNear) {
        h.container.setVisible(isNear);
        if (h.hitZone) h.hitZone.setVisible(isNear);
      }

      if (!isNear) continue;

      const dist = Phaser.Math.Distance.Between(px, py, h.x, h.y);
      const showBtn = dist <= 120;
      if (h.btnPrompt && h.btnPrompt.visible !== showBtn) {
        h.btnPrompt.setVisible(showBtn);
        h.btnTxt?.setVisible(showBtn);
      }
    }
  }
};
