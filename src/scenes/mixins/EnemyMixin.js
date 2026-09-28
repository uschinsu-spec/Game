/**
 * EnemyMixin.js
 * Quản lý: initBattlefield, spawnOneEnemy, killEnemy,
 *           enemyAttack, enemyShootProjectile
 */
import { MONSTER_RANKS } from '../../config/monstersData.js';
import { ALL_MAPS } from '../../config/regionsData.js';
import { gameState } from '../../state/gameState.js';
import { getCongPhapById } from '../../config/congPhapData.js';
import { ensureCurrencies, addCurrency } from '../../config/currencyData.js';

export const EnemyMixin = {

  initBattlefield() {
    if (this.enemyGroup) {
      this.enemyGroup.getChildren().forEach(e => {
        if (e.hpBar) e.hpBar.destroy();
        if (e.hpBg) e.hpBg.destroy();
        if (e.nameText) e.nameText.destroy();
      });
      this.enemyGroup.clear(true, true);
    }
    this.enemies = [];

    if (this.groundDrops) {
      this.groundDrops.forEach(gd => {
        if (gd && gd.active) gd.destroy();
      });
      this.groundDrops = [];
    }

    const map = ALL_MAPS.find(m => m.id === gameState.currentMapId) || ALL_MAPS[0];
    if (map.isPeaceZone || map.id === 0) {
      // Thanh Vân Thôn là khu vực an toàn / hòa bình, tuyệt đối không xuất hiện quái thú
      return;
    }

    const totalW = this.worldW || 32000;

    // -------------------------------------------------------------------------
    // SPAWN CỐ ĐỊNH THEO TỶ LỆ MẬT ĐỘ TĂNG DẦN THEO ĐỘ SÂU BẢN ĐỒ (DENSITY GRADIENT)
    // - Vùng 1 (Đầu map: 650 -> 4,000px): Thưa thớt, an toàn cho tân thủ (khoảng cách ~450px)
    // - Vùng 2 (Trung gian: 4,000 -> 12,000px): Mật độ vừa (khoảng cách ~300px)
    // - Vùng 3 (Thâm sâu: 12,000 -> 22,000px): Mật độ cao (khoảng cách ~220px)
    // - Vùng 4 (Tận cùng / Gần Cấm Địa: 22,000 -> W - 500px): Dày đặc nhất (khoảng cách ~160px)
    // -------------------------------------------------------------------------
    const spawnPoints = [];

    if (totalW > 5000) {
      // Bản đồ săn quái rộng lớn (32,000px)
      const startX = 650;
      for (let x = startX; x < 4000; x += 450) {
        spawnPoints.push({ x, zone: 1 });
      }
      // Vùng 2 (4000 -> 12000)
      for (let x = 4200; x < 12000; x += 300) {
        spawnPoints.push({ x, zone: 2 });
      }
      // Vùng 3 (12000 -> 22000)
      for (let x = 12200; x < 22000; x += 220) {
        spawnPoints.push({ x, zone: 3 });
      }
      // Vùng 4 (22000 -> totalW - 500)
      for (let x = 22200; x < totalW - 500; x += 160) {
        spawnPoints.push({ x, zone: 4 });
      }
    } else {
      // Bản đồ kích thước nhỏ tiêu chuẩn (2880px)
      const step = 140;
      for (let x = 400; x < totalW - 200; x += step) {
        const zone = x < totalW * 0.3 ? 1 : (x < totalW * 0.7 ? 2 : 3);
        spawnPoints.push({ x, zone });
      }
    }

    const totalNodes = spawnPoints.length;
    for (let i = 0; i < totalNodes; i++) {
      const sp = spawnPoints[i];
      const y = Phaser.Math.Between(this.field.top + 35, this.field.bottom - 35);
      this.spawnOneFixedEnemy(sp.x, y, i, sp.zone);
    }
  },

  getEnemySpawnConfig(mapId, zone = 1, slotIndex = 0) {
    // Map 2: Vạn Mộc Sâm Lâm - Nhất Phẩm 4 giai đoạn theo zone độ sâu
    if (Number(mapId) === 2) {
      const strictZone = Math.max(1, Math.min(4, Number(zone) || 1));
      const vanMocZoneConfigs = {
        1: { monsterId: 'm_1_1', spriteNum: 5, stageLabel: 'Sơ Kỳ', color: '#a7f3d0', sizeMultiplier: 1.2 },
        2: { monsterId: 'm_1_2', spriteNum: 4, stageLabel: 'Trung Kỳ', color: '#fde68a', sizeMultiplier: 1.4 },
        3: { monsterId: 'm_1_3', spriteNum: 9, stageLabel: 'Hậu Kỳ', color: '#fdba74', sizeMultiplier: 1.6 },
        4: { monsterId: 'm_1_4', spriteNum: 7, stageLabel: 'Đỉnh Phong', color: '#fb7185', sizeMultiplier: 1.8 }
      };
      const cfg = vanMocZoneConfigs[strictZone];
      const monsterData = MONSTER_RANKS.find(m => m.id === cfg.monsterId) || MONSTER_RANKS[4];
      return {
        monsterData,
        spriteNum: cfg.spriteNum,
        baseScale: 0.50 * cfg.sizeMultiplier,
        displayName: `${monsterData.name} • ${cfg.stageLabel}`,
        nameColor: cfg.color,
        nameFontSize: strictZone === 4 ? '10px' : (strictZone === 3 ? '9.5px' : '9px'),
        vanMocZone: strictZone,
        vanMocStage: cfg.stageLabel,
        vanMocSizeMultiplier: cfg.sizeMultiplier
      };
    }

    // Generic spawn config for all other maps
    const map = ALL_MAPS[mapId] || ALL_MAPS[0];
    const mapNum = Number(mapId) || 0;
    let rankOffset = 0;
    if (zone === 1) rankOffset = (slotIndex % 2);
    else if (zone === 2) rankOffset = (slotIndex % 3);
    else if (zone >= 3) rankOffset = 1 + (slotIndex % 3);

    const mIdx = Math.min(MONSTER_RANKS.length - 1, (map.monsterIdxStart || 0) + rankOffset);
    const monsterData = MONSTER_RANKS[mIdx];
    
    // Từ Map 3 (Trúc Cơ) trở lên: Có cả quái đi đất và quái bay trên không (50/50)
    const isFlying = (mapNum >= 3) && (slotIndex % 2 === 1);
    const enemySpriteNum = isFlying ? ((slotIndex % 10) + 1) : (monsterData.spriteNum || ((mIdx % 16) + 1));
    const displayName = isFlying ? `[Phi Thiên] ${monsterData.name}` : monsterData.name;

    return {
      monsterData,
      isFlying,
      spriteNum: enemySpriteNum,
      baseScale: isFlying ? 0.52 : 0.50,
      displayName,
      nameColor: isFlying ? '#67e8f9' : '#ffd700',
      nameFontSize: '9px'
    };
  },

  spawnOneFixedEnemy(homeX, homeY, slotIndex, zone = 1) {
    const config = this.getEnemySpawnConfig(gameState.currentMapId, zone, slotIndex);
    const monsterData = config.monsterData;
    const enemySpriteNum = config.spriteNum;
    const baseEnemyScale = config.baseScale;

    const isFlying = config.isFlying || false;
    const initialTex = isFlying ? `enemy_fly_${enemySpriteNum}_idle_0` : `enemy_${enemySpriteNum}_idle_0`;
    const initialAnim = isFlying ? `e_enemy_fly_${enemySpriteNum}_idle` : `e_enemy_${enemySpriteNum}_idle`;

    const enemy = this.enemyGroup.create(homeX, homeY, initialTex)
      .setScale(baseEnemyScale * this.perspective(homeY))
      .setDepth(Math.floor(homeY));

    // Thuộc tính cố định
    enemy.homeX = homeX;
    enemy.homeY = homeY;
    enemy.isDead = false;
    enemy.isFlying = isFlying;
    enemy.monsterData = monsterData;
    enemy.isRanged = isFlying || monsterData.isRanged || [3, 6, 8, 13, 15, 16].includes(enemySpriteNum);
    enemy.baseEnemyScale = baseEnemyScale;
    enemy.hp = monsterData.hp;
    enemy.maxHp = monsterData.hp;
    enemy.dmg = monsterData.dmg;
    enemy.atkTimer = 400 + Math.random() * 400;
    enemy.roamTimer = 1500 + Math.random() * 2000;
    enemy.roamState = 'idle';
    enemy.roamVx = 0;
    enemy.roamVy = 0;
    enemy.enemySpriteNum = enemySpriteNum;
    if (config.vanMocZone) {
      enemy.vanMocZone = config.vanMocZone;
      enemy.vanMocStage = config.vanMocStage;
      enemy.vanMocAsset = `enemy_${enemySpriteNum}`;
      enemy.vanMocSizeMultiplier = config.vanMocSizeMultiplier;
    }
    if (this.anims.exists(initialAnim)) {
      enemy.play(initialAnim, true);
    }

    const barW = 36;
    enemy.barW = barW;
    enemy.hpBg = this.add.rectangle(homeX, homeY - 36, barW, 4, 0x111111, 0.8).setDepth(Math.floor(homeY) + 1);
    enemy.hpBar = this.add.rectangle(homeX - barW / 2, homeY - 36, barW, 4, 0xee5533)
      .setOrigin(0, 0.5).setDepth(Math.floor(homeY) + 2);
    enemy.nameText = this.add.text(homeX, homeY - 47, config.displayName, {
      fontSize: config.nameFontSize || '9px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: config.nameColor || '#ffd700',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(Math.floor(homeY) + 3);

    // Tối ưu hóa khởi tạo: Nếu xa player (>950px), ẩn đi ngay từ đầu
    const playerX = this.player ? this.player.x : 350;
    const isNear = Math.abs(homeX - playerX) <= 950;
    enemy.setVisible(isNear);
    if (enemy.body) enemy.body.enable = isNear;
    enemy.hpBg.setVisible(isNear);
    enemy.hpBar.setVisible(isNear);
    enemy.nameText.setVisible(isNear);

    this.enemies.push(enemy);
    return enemy;
  },

  buildEnemyDropTable(enemy) {
    const data = enemy?.monsterData;
    if (!data) {
      return {
        beastPelts: 1,
        beastFurs: 0,
        beastClaws: 0,
        beastBlood: 0,
        beastHorns: 0,
        beastCore: null
      };
    }

    const isRankOne = data.tier >= 1 && data.tier <= 4;
    const rawPelts = isRankOne ? Math.max(1, Phaser.Math.Between(2, 4)) : Phaser.Math.Between(2, 4);
    const rawFurs = isRankOne ? Math.max(1, Phaser.Math.Between(1, 3)) : Phaser.Math.Between(1, 3);
    const rawClaws = Math.random() < 0.65 ? Phaser.Math.Between(1, 2) : 0;
    const rawBlood = isRankOne ? Math.max(1, (Math.random() < 0.55 ? Phaser.Math.Between(1, 2) : 1)) : (Math.random() < 0.55 ? Phaser.Math.Between(1, 2) : 0);
    const rawHorns = Math.random() < 0.40 ? 1 : 0;

    // Nội Đan definitions theo Monster ID (Nhất Phẩm -> tương lai mở rộng Nhị/Tam/Tứ/Ngũ Phẩm)
    const CORE_DEFS = {
      m_1_1: { key: 'nhat_pham_so_ky', name: 'Nội Đan Nhất Phẩm Sơ Kỳ', chance: 0.20, color: 0x6ee7b7, textColor: '#a7f3d0' },
      m_1_2: { key: 'nhat_pham_trung_ky', name: 'Nội Đan Nhất Phẩm Trung Kỳ', chance: 0.30, color: 0x38bdf8, textColor: '#7dd3fc' },
      m_1_3: { key: 'nhat_pham_hau_ky', name: 'Nội Đan Nhất Phẩm Hậu Kỳ', chance: 0.45, color: 0xc084fc, textColor: '#d8b4fe' },
      m_1_4: { key: 'nhat_pham_dinh_phong', name: 'Nội Đan Nhất Phẩm Đỉnh Phong', chance: 0.70, color: 0xfbbf24, textColor: '#fde68a' }
    };

    let beastCore = null;
    const coreDef = CORE_DEFS[data.id];
    if (coreDef && Math.random() < coreDef.chance) {
      beastCore = {
        key: coreDef.key,
        name: coreDef.name,
        color: coreDef.color,
        textColor: coreDef.textColor,
        monsterId: data.id
      };
    }

    return {
      beastPelts: rawPelts,
      beastFurs: rawFurs,
      beastClaws: rawClaws,
      beastBlood: rawBlood,
      beastHorns: rawHorns,
      beastCore
    };
  },

  killEnemy(enemy) {
    if (!enemy || enemy.isDead) return;
    enemy.isDead = true;

    if (!gameState.materials) {
      gameState.materials = { beastPelts: 0, beastFurs: 0, beastClaws: 0, beastBlood: 0, beastHorns: 0 };
    }
    if (gameState.materials.beastHorns === undefined) gameState.materials.beastHorns = 0;
    if (!gameState.materials.beastCores || typeof gameState.materials.beastCores !== 'object') {
      gameState.materials.beastCores = {};
    }

    const isParty = !!(gameState.party && gameState.party.isFormed);
    const dropBundle = this.buildEnemyDropTable(enemy);

    // XÁC ĐỊNH AI GÂY DAMAGE NHIỀU NHẤT (TOP DAMAGE CONTRIBUTOR)
    let playerTeamDmg = 0;
    let wildTop = { totalDmg: 0, name: 'Tán Tu', ref: null };

    if (enemy.damageDealers) {
      for (const key in enemy.damageDealers) {
        const dealer = enemy.damageDealers[key];
        if (dealer.type === 'player' || dealer.type === 'party_npc') {
          playerTeamDmg += dealer.totalDmg;
        } else if (dealer.type === 'wild_npc') {
          if (dealer.totalDmg > wildTop.totalDmg) {
            wildTop = dealer;
          }
        }
      }
    } else {
      playerTeamDmg = 1;
    }

    let winnerInfo = {};
    if (playerTeamDmg >= wildTop.totalDmg) {
      winnerInfo = {
        winnerType: isParty ? 'party' : 'player',
        winnerName: isParty ? 'Tổ Đội 5 Người' : 'Bạn',
        ref: this.player
      };
    } else {
      winnerInfo = {
        winnerType: 'wild_npc',
        winnerName: wildTop.name || 'Tán Tu',
        ref: wildTop.ref
      };
    }

    // TẠO VẬT PHẨM RỚT RA ĐẤT (GROUND DROP ENTITY - 2S ĐẾM NGƯỢC)
    this.spawnGroundLootDrop(enemy.x, enemy.y, dropBundle, winnerInfo, isParty);

    // Hiệu ứng biến mất & ẩn quái để tối ưu bộ nhớ thay vì hủy đối tượng
    if (this.spawnVfx) {
      this.spawnVfx(enemy.x, enemy.y, 0, 0.55, { duration: 260, grow: 1.2, tint: 0xff3344 });
    }

    enemy.setVelocity(0, 0);
    enemy.setVisible(false);
    if (enemy.body) enemy.body.enable = false;
    if (enemy.hpBar) enemy.hpBar.setVisible(false);
    if (enemy.hpBg) enemy.hpBg.setVisible(false);
    if (enemy.nameText) enemy.nameText.setVisible(false);

    this.updateHUD();

    // HỒI SINH CỐ ĐỊNH SAU 5 GIÂY (5s Respawn)
    this.time.delayedCall(5000, () => {
      if (!enemy || !this.scene || !this.scene.isActive()) return;
      this.respawnEnemy(enemy);
    });
  },

  // =========================================================================
  // SPAWN GROUND LOOT DROP (VẬT PHẨM RỚT RA ĐẤT & TỰ ĐỘNG NHẶT SAU 2 GIÂY)
  // =========================================================================
  spawnGroundLootDrop(x, y, dropBundle, winnerInfo, isParty) {
    if (!this.groundDrops) this.groundDrops = [];

    const dropContainer = this.add.container(x, y - 6).setDepth(Math.floor(y) + 12);

    // 1. Vòng hào quang mặt đất phát sáng
    const isPlayerTeam = (winnerInfo.winnerType === 'player' || winnerInfo.winnerType === 'party');
    const core = dropBundle?.beastCore;
    const auraColor = core ? core.color : (isPlayerTeam ? (isParty ? 0x34d399 : 0xfde047) : 0x60a5fa);

    const aura = this.add.ellipse(0, 10, 36, 14, auraColor, 0.45);
    this.tweens.add({
      targets: aura,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0.15,
      yoyo: true,
      repeat: -1,
      duration: 480
    });

    // 2. Icon túi chiến lợi phẩm / Da thú / Nội Đan nảy lên mặt đất
    const coreIconKey = core ? `core_${core.key}` : null;
    const bagIcon = (core && coreIconKey && this.textures.exists(coreIconKey))
      ? this.add.image(0, -10, coreIconKey).setDisplaySize(28, 28)
      : (core
        ? this.add.text(0, -10, '🔮', { fontSize: '20px' }).setOrigin(0.5)
        : (this.textures.exists('mat_beast_pelt')
          ? this.add.image(0, -10, 'mat_beast_pelt').setDisplaySize(28, 28)
          : this.add.text(0, -10, '🎒', { fontSize: '18px' }).setOrigin(0.5)));

    this.tweens.add({
      targets: bagIcon,
      y: { from: -28, to: -6 },
      ease: 'Bounce.easeOut',
      duration: 380
    });

    // 3. Nhãn hiển thị đếm ngược 2s và Người có quyền nhặt (Top Damage)
    const tagBg = this.add.rectangle(0, -32, core ? 156 : 136, 22, 0x09111e, 0.9)
      .setStrokeStyle(1, auraColor);

    const tagText = this.add.text(0, -38, core ? `🔮 ${core.name} (2s)` : '🎁 Chiến Lợi Phẩm (2s)', {
      fontFamily: 'sans-serif',
      fontSize: core ? '7.5px' : '8.5px',
      fontStyle: 'bold',
      color: core ? core.textColor : '#f8fafc'
    }).setOrigin(0.5);

    const subText = this.add.text(0, -26, `👑 Top Dmg: ${winnerInfo.winnerName}`, {
      fontFamily: 'sans-serif',
      fontSize: '7.5px',
      color: isPlayerTeam ? '#fde047' : '#93c5fd'
    }).setOrigin(0.5);

    dropContainer.add([aura, bagIcon, tagBg, tagText, subText]);
    this.groundDrops.push(dropContainer);

    // 4. TỰ ĐỘNG NHẶT SAU 2 GIÂY (2000ms AUTO-LOOT)
    this.time.delayedCall(2000, () => {
      if (!dropContainer || !dropContainer.active || !this.scene || !this.scene.isActive()) return;

      // Xóa khỏi danh sách theo dõi
      const dropIdx = this.groundDrops.indexOf(dropContainer);
      if (dropIdx !== -1) this.groundDrops.splice(dropIdx, 1);

      // --- TRƯỜNG HỢP A: TÁN TU NGOÀI MAP (WILD NPC) CHIẾN THẮNG TOP DAMAGE ---
      if (winnerInfo.winnerType === 'wild_npc') {
        const wildNpcSprite = winnerInfo.ref?.sprite;
        const targetX = wildNpcSprite ? wildNpcSprite.x : (x - 60);
        const targetY = wildNpcSprite ? wildNpcSprite.y - 20 : y;

        this.tweens.add({
          targets: dropContainer,
          x: targetX,
          y: targetY,
          scaleX: 0.15,
          scaleY: 0.15,
          alpha: 0.2,
          duration: 320,
          ease: 'Cubic.easeIn',
          onComplete: () => {
            dropContainer.destroy();
            const lootName = core ? core.name : 'chiến lợi phẩm';
            this.showFloatingText(targetX, targetY - 45, `[Tán Tu] ${winnerInfo.winnerName} đã nhặt ${lootName}!`, '#93c5fd', '11px');
          }
        });
        return;
      }

      // --- TRƯỜNG HỢP B: PLAYER ĐI ĐƠN ĐỘC HÀNH (100% CHIẾN LỢI PHẨM) ---
      if (winnerInfo.winnerType === 'player' && !isParty) {
        const px = this.player ? this.player.x : x;
        const py = this.player ? this.player.y - 25 : y;

        this.tweens.add({
          targets: dropContainer,
          x: px,
          y: py,
          scaleX: 0.15,
          scaleY: 0.15,
          alpha: 0.2,
          duration: 320,
          ease: 'Cubic.easeIn',
          onComplete: () => {
            dropContainer.destroy();

            // Nhận 100% nguyên liệu
            gameState.materials.beastPelts = (gameState.materials.beastPelts || 0) + (dropBundle.beastPelts || 0);
            gameState.materials.beastFurs = (gameState.materials.beastFurs || 0) + (dropBundle.beastFurs || 0);
            gameState.materials.beastClaws = (gameState.materials.beastClaws || 0) + (dropBundle.beastClaws || 0);
            gameState.materials.beastBlood = (gameState.materials.beastBlood || 0) + (dropBundle.beastBlood || 0);
            gameState.materials.beastHorns = (gameState.materials.beastHorns || 0) + (dropBundle.beastHorns || 0);

            if (core) {
              if (!gameState.materials.beastCores) gameState.materials.beastCores = {};
              gameState.materials.beastCores[core.key] = (gameState.materials.beastCores[core.key] || 0) + 1;
            }

            if (gameState.afkStats) {
              gameState.afkStats.kills = (gameState.afkStats.kills || 0) + 1;
              gameState.afkStats.pelts = (gameState.afkStats.pelts || 0) + (dropBundle.beastPelts || 0);
            }
            this.updateAfkBanner?.();
            this.updateHUD?.();

            let dropList = [];
            if (dropBundle.beastPelts > 0) dropList.push(`+${dropBundle.beastPelts} Da`);
            if (dropBundle.beastFurs > 0) dropList.push(`+${dropBundle.beastFurs} Lông`);
            if (dropBundle.beastClaws > 0) dropList.push(`+${dropBundle.beastClaws} Móng`);
            if (dropBundle.beastBlood > 0) dropList.push(`+${dropBundle.beastBlood} Huyết`);
            if (dropBundle.beastHorns > 0) dropList.push(`+${dropBundle.beastHorns} Sừng`);
            if (core) dropList.push(`🔮 +1 ${core.name}`);

            this.showFloatingText(px, py - 35, `[100% Đơn Hành] ${dropList.join(' ')} (Tự Nhặt)`, core ? core.textColor : '#fde047', '12px');
            if (this.spawnVfx) this.spawnVfx(px, py, 0, 0.45, { tint: core ? core.color : 0xfde047, duration: 220 });
          }
        });
        return;
      }

      // --- TRƯỜNG HỢP C: TỔ ĐỘI 5 NGƯỜI (CHIA ĐỀU 5 PHẦN, DƯ PHÂN CHIA NGẪU NHIÊN) ---
      if (isParty) {
        const px = this.player ? this.player.x : x;
        const py = this.player ? this.player.y - 25 : y;

        // Phân phối từng loại vật phẩm cho 5 thành viên (Member 0 là Player, 1..4 là 4 Hiệp Khách)
        const playerReceived = { beastPelts: 0, beastFurs: 0, beastClaws: 0, beastBlood: 0, beastHorns: 0 };
        const matKeys = ['beastPelts', 'beastFurs', 'beastClaws', 'beastBlood', 'beastHorns'];

        matKeys.forEach(mKey => {
          const totalCount = dropBundle[mKey] || 0;
          if (totalCount <= 0) return;

          const baseEach = Math.floor(totalCount / 5);
          const remainder = totalCount % 5;

          // Xáo trộn ngẫu nhiên 5 thành viên để trao phần dư nếu có
          const shuffledMembers = [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5);
          const luckyRecipients = shuffledMembers.slice(0, remainder);

          // Player (index 0) nhận
          const playerLucky = luckyRecipients.includes(0);
          playerReceived[mKey] = baseEach + (playerLucky ? 1 : 0);
        });

        const coreReceiver = core ? Phaser.Math.Between(0, 4) : -1;

        this.tweens.add({
          targets: dropContainer,
          x: px,
          y: py,
          scaleX: 0.15,
          scaleY: 0.15,
          alpha: 0.2,
          duration: 320,
          ease: 'Cubic.easeIn',
          onComplete: () => {
            dropContainer.destroy();

            gameState.materials.beastPelts = (gameState.materials.beastPelts || 0) + playerReceived.beastPelts;
            gameState.materials.beastFurs = (gameState.materials.beastFurs || 0) + playerReceived.beastFurs;
            gameState.materials.beastClaws = (gameState.materials.beastClaws || 0) + playerReceived.beastClaws;
            gameState.materials.beastBlood = (gameState.materials.beastBlood || 0) + playerReceived.beastBlood;
            gameState.materials.beastHorns = (gameState.materials.beastHorns || 0) + playerReceived.beastHorns;

            if (core && coreReceiver === 0) {
              if (!gameState.materials.beastCores) gameState.materials.beastCores = {};
              gameState.materials.beastCores[core.key] = (gameState.materials.beastCores[core.key] || 0) + 1;
            }

            if (gameState.afkStats) {
              gameState.afkStats.kills = (gameState.afkStats.kills || 0) + 1;
              gameState.afkStats.pelts = (gameState.afkStats.pelts || 0) + playerReceived.beastPelts;
            }
            this.updateAfkBanner?.();
            this.updateHUD?.();

            let dropList = [];
            if (playerReceived.beastPelts > 0) dropList.push(`+${playerReceived.beastPelts} Da`);
            if (playerReceived.beastFurs > 0) dropList.push(`+${playerReceived.beastFurs} Lông`);
            if (playerReceived.beastClaws > 0) dropList.push(`+${playerReceived.beastClaws} Móng`);
            if (playerReceived.beastBlood > 0) dropList.push(`+${playerReceived.beastBlood} Huyết`);
            if (playerReceived.beastHorns > 0) dropList.push(`+${playerReceived.beastHorns} Sừng`);
            if (core && coreReceiver === 0) dropList.push(`🔮 +1 ${core.name}`);

            this.showFloatingText(px, py - 35, `[Tổ Đội] ${dropList.length > 0 ? dropList.join(' ') : 'Nhận phần chia'}`, '#34d399', '12px');
            if (core && coreReceiver > 0) {
              const follower = this.partyFollowers?.[coreReceiver - 1];
              const fx = follower?.sprite?.x ?? px;
              const fy = follower?.sprite?.y ?? py;
              this.showFloatingText(fx, fy - 40, `🔮 Đồng đội nhận ${core.name}`, '#a7f3d0', '10px');
            }
            if (this.spawnVfx) this.spawnVfx(px, py, 0, 0.45, { tint: 0x34d399, duration: 220 });
          }
        });
      }
    });
  },

  respawnEnemy(enemy) {
    if (!enemy || !this.scene || !this.scene.isActive()) return;

    enemy.isDead = false;
    enemy.damageDealers = {}; // Reset bảng ghi nhận sát thương khi hồi sinh mới
    // Đưa về vị trí spawn cố định ban đầu trên map
    enemy.x = enemy.homeX + Phaser.Math.Between(-12, 12);
    enemy.y = Phaser.Math.Clamp(enemy.homeY + Phaser.Math.Between(-8, 8), this.field.top + 30, this.field.bottom - 30);
    enemy.hp = enemy.maxHp;
    enemy.setVelocity(0, 0);
    enemy.roamState = 'idle';
    enemy.roamTimer = 1500 + Math.random() * 1500;

    // Reset thanh máu
    if (enemy.hpBar) enemy.hpBar.width = enemy.barW || 36;
    enemy.play('e_enemy_' + enemy.enemySpriteNum + '_idle', true);

    // Kiểm tra cự ly tới Player để bật hiển thị mượt mà
    const playerX = this.player ? this.player.x : 350;
    const isNear = Math.abs(enemy.x - playerX) <= 950;

    if (isNear) {
      enemy.setVisible(true);
      if (enemy.body) enemy.body.enable = true;
      if (enemy.hpBar) enemy.hpBar.setVisible(true);
      if (enemy.hpBg) enemy.hpBg.setVisible(true);
      if (enemy.nameText) enemy.nameText.setVisible(true);
      if (this.spawnVfx) {
        this.spawnVfx(enemy.x, enemy.y, 0, 0.6, { tint: 0x66ffcc, duration: 250 });
      }
    }
  },

  enemyAttack(enemy, target = null) {
    if (!enemy || !enemy.active || enemy.isDead) return;

    const targetX = target ? target.x : (this.player ? this.player.x : enemy.x);
    enemy.setFlipX(targetX < enemy.x);
    enemy.attackUntil = this.time.now + 450;

    const atkAnim = 'e_enemy_' + enemy.enemySpriteNum + '_attack';
    if (this.anims.exists(atkAnim)) {
      enemy.play(atkAnim, false);
      enemy.once('animationcomplete', () => {
        if (enemy && enemy.active && !enemy.isDead && this.time.now >= (enemy.attackUntil || 0)) {
          const idleAnim = 'e_enemy_' + enemy.enemySpriteNum + '_idle';
          if (this.anims.exists(idleAnim)) enemy.play(idleAnim, true);
        }
      });
    }

    // Windup before melee impact connects
    this.time.delayedCall(160, () => {
      if (!enemy || !enemy.active || enemy.isDead) return;
      const enemyDmg = enemy.dmg || 20;

      // 1. Hit Player
      if (this.player && this.player.active && !this.dead) {
        const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        if (d <= 130) {
          this.takePlayerDamage(enemyDmg);
          this.spawnVfx(this.player.x, this.player.y - 12, 0, 0.45, { tint: 0xff3344, duration: 180 });
        }
      }

      // 2. Hit Party Followers (Tổ Đội)
      if (this.partyFollowers && this.partyFollowers.length > 0) {
        for (let i = 0; i < this.partyFollowers.length; i++) {
          const f = this.partyFollowers[i];
          if (f && !f.isDead && f.sprite && f.sprite.visible) {
            const dF = Phaser.Math.Distance.Between(enemy.x, enemy.y, f.sprite.x, f.sprite.y);
            if (dF <= 130) {
              this.takePartyFollowerDamage(f, enemyDmg * 0.75);
            }
          }
        }
      }

      // 3. Hit Fellow NPCs (Tán Tu / Đồng Đạo Ngoài Map)
      if (this.fellowNpcs && this.fellowNpcs.length > 0) {
        for (let i = 0; i < this.fellowNpcs.length; i++) {
          const npc = this.fellowNpcs[i];
          if (npc && !npc.isDead && npc.sprite && npc.sprite.visible) {
            const dNpc = Phaser.Math.Distance.Between(enemy.x, enemy.y, npc.sprite.x, npc.sprite.y);
            if (dNpc <= 130) {
              this.takeFellowNpcDamage(npc, enemyDmg * 0.8);
            }
          }
        }
      }

      // 4. Hit Map NPCs
      if (this.npcsGroup && this.npcsGroup.length > 0) {
        for (let i = 0; i < this.npcsGroup.length; i++) {
          const mNpc = this.npcsGroup[i];
          if (mNpc && mNpc.container && mNpc.container.active) {
            const dM = Phaser.Math.Distance.Between(enemy.x, enemy.y, mNpc.container.x, mNpc.container.y);
            if (dM <= 130) {
              this.showFloatingText(mNpc.container.x, mNpc.container.y - 60, `🛡️ Hộ Thể!`, '#38bdf8', '11px');
              this.spawnVfx(mNpc.container.x, mNpc.container.y, 0, 0.4, { tint: 0x38bdf8, duration: 200 });
            }
          }
        }
      }
    });
  },

  enemyShootProjectile(enemy, target = null) {
    if (!enemy || !enemy.active || enemy.isDead) return;

    const targetX = target ? target.x : (this.player ? this.player.x : enemy.x);
    const targetY = target ? target.y : (this.player ? this.player.y : enemy.y);
    enemy.setFlipX(targetX < enemy.x);
    enemy.attackUntil = this.time.now + 450;

    const atkAnim = 'e_enemy_' + enemy.enemySpriteNum + '_attack';
    if (this.anims.exists(atkAnim)) {
      enemy.play(atkAnim, false);
    }

    const startX = enemy.x, startY = enemy.y - 15;
    const enemyDmg = enemy.dmg || 40;

    const proj = this.add.circle(startX, startY, 7, 0xff3355, 0.95).setDepth(Math.floor(startY) + 50);
    this.tweens.add({
      targets: proj,
      x: targetX, y: targetY,
      duration: 550,
      ease: 'Linear',
      onComplete: () => {
        if (proj && proj.active) proj.destroy();

        // Sát thương theo loại target
        if (target) {
          if (target.type === 'player' && this.player && this.player.active && !this.dead) {
            const d = Phaser.Math.Distance.Between(targetX, targetY, this.player.x, this.player.y);
            if (d < 60) {
              this.takePlayerDamage(enemyDmg);
              this.spawnVfx(this.player.x, this.player.y - 12, 0, 0.5, { tint: 0xff2244, duration: 200 });
            }
          } else if (target.type === 'party_follower' && target.ref && !target.ref.isDead) {
            this.takePartyFollowerDamage(target.ref, enemyDmg * 0.75);
          } else if (target.type === 'fellow_npc' && target.ref && !target.ref.isDead) {
            this.takeFellowNpcDamage(target.ref, enemyDmg * 0.8);
          } else if (target.type === 'map_npc' && target.ref) {
            this.showFloatingText(targetX, targetY - 60, `🛡️ Hộ Thể!`, '#38bdf8', '11px');
          }
        } else if (this.player && this.player.active && !this.dead) {
          const d = Phaser.Math.Distance.Between(targetX, targetY, this.player.x, this.player.y);
          if (d < 50) {
            this.takePlayerDamage(enemyDmg);
            this.spawnVfx(this.player.x, this.player.y - 12, 0, 0.5, { tint: 0xff2244, duration: 200 });
          }
        }
      }
    });
  },
};