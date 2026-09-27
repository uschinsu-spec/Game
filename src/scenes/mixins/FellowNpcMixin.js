import { gameState } from '../../state/gameState.js';

export const SINO_VIET_NAMES = [
  'Lý Tiêu Dao', 'Hàn Lập', 'Lâm Động', 'Tiêu Viêm', 'Trương Tiểu Phàm',
  'Mộ Dung Phục', 'Diệp Thần', 'Lục Tuyết Kỳ', 'Sở Phong', 'Vương Lâm',
  'Tần Vũ', 'Thạch Hạo', 'Bạch Tiểu Thuần', 'Cố Trường Ca', 'Mạnh Hạo',
  'Lý Thất Dạ', 'Trần Bình An', 'Tô Minh', 'Kỷ Ninh', 'Đường Tam',
  'Lục Thanh Sơn', 'Hứa Thanh', 'Tiêu Thần', 'Lâm Phong', 'Phương Hàn',
  'Quân Tiêu Dao', 'Nhiếp Phong', 'Bộ Kinh Vân', 'Đoàn Dự', 'Hư Trúc',
  'Kiều Phong', 'Lệnh Hồ Xung', 'Dương Quá', 'Quách Tĩnh', 'Trương Vô Kỵ',
  'Phong Bất Bình', 'Diệp Cô Thành', 'Tây Môn Xuy Tuyết', 'Sở Lưu Hương', 'Lục Tiểu Phụng'
];

export const PARTY_MEMBERS_DEF = [
  { modelType: 'dai_han', name: 'Nhiếp Phong',   tint: 0xbbe1fa, offsetX: -48, offsetY: -26, title: '⚔️ Lam Đao' },
  { modelType: 'tho_san', name: 'Bộ Kinh Vân',   tint: 0xfecaca, offsetX: -48, offsetY:  26, title: '🪓 Xích Rìu' },
  { modelType: 'dai_han', name: 'Tiêu Phong',    tint: 0xbbf7d0, offsetX: -84, offsetY: -16, title: '⚔️ Bích Đao' },
  { modelType: 'tho_san', name: 'Đoàn Dự',       tint: 0xf3e8ff, offsetX: -84, offsetY:  16, title: '🪓 Tử Rìu' }
];

export const OUTFIT_COLOR_PALETTES = [
  { name: 'Lam Y (Thiên Lam)',        tint: 0xbae6fd, titleColor: '#bae6fd', vfxColor: 0x38bdf8 },
  { name: 'Bích Kiếm (Thanh Y)',     tint: 0xbbf7d0, titleColor: '#86efac', vfxColor: 0x4ade80 },
  { name: 'Hồng Sa (Chu Xích)',      tint: 0xfecdd3, titleColor: '#fda4af', vfxColor: 0xf43f5e },
  { name: 'Tử Hà (Đạo Tử)',          tint: 0xf3e8ff, titleColor: '#e9d5ff', vfxColor: 0xc084fc },
  { name: 'Hoàng Kim (Kim Bào)',     tint: 0xfef08a, titleColor: '#fef08a', vfxColor: 0xfacc15 },
  { name: 'Băng Tinh (Hải Lam)',     tint: 0xcffafe, titleColor: '#a5f3fc', vfxColor: 0x22d3ee },
  { name: 'Xích Viêm (Hỏa Bào)',     tint: 0xffedd5, titleColor: '#fed7aa', vfxColor: 0xfb923c },
  { name: 'Bạch Ngân (Nguyên Thủy)', tint: 0xffffff, titleColor: '#ffffff', vfxColor: 0xffffff },
  { name: 'Ngọc Bích (Lục Sa)',      tint: 0xd1fae5, titleColor: '#a7f3d0', vfxColor: 0x34d399 },
  { name: 'Hổ Phách (Hoàng Sa)',     tint: 0xfef3c7, titleColor: '#fde68a', vfxColor: 0xfbbf24 }
];

export const FellowNpcMixin = {

  getRandomSinoVietName(excludeName = '') {
    const available = SINO_VIET_NAMES.filter(n => n !== excludeName);
    return Phaser.Utils.Array.GetRandom(available) || 'Vô Danh Tu Sĩ';
  },

  getRandomOutfit() {
    return Phaser.Utils.Array.GetRandom(OUTFIT_COLOR_PALETTES);
  },

  // =========================================================================
  // 1. WILD ROAMING FELLOW NPCS (NPC TÁN TU NGOÀI MAP)
  // =========================================================================
  initFellowNpcs() {
    if (this.fellowNpcs) {
      this.fellowNpcs.forEach(npc => {
        if (npc.sprite) npc.sprite.destroy();
        if (npc.shadow) npc.shadow.destroy();
        if (npc.nameTag) npc.nameTag.destroy();
        if (npc.hpBg) npc.hpBg.destroy();
        if (npc.hpBar) npc.hpBar.destroy();
      });
    }
    this.fellowNpcs = [];

    // Khởi tạo luôn Party Followers nếu đang có tổ đội
    this.initPartyFollowers();

    const curMapId = gameState.currentMapId ?? 0;
    const map = (this.currentMap && this.currentMap.id === curMapId) ? this.currentMap : (this.getMapById ? this.getMapById(curMapId) : null);
    
    // Trong thôn (khu an toàn map 0) không sinh NPC hoang dã
    if (!map || map.isPeaceZone || curMapId === 0) {
      return;
    }

    const totalW = this.worldW || 32000;
    const spawnXCoords = [];

    // Spawn đều đặn dọc map, bắt đầu từ gần vị trí vào cổng (x = 550)
    for (let x = 550; x < totalW - 600; x += Phaser.Math.Between(750, 1150)) {
      spawnXCoords.push(x);
    }

    spawnXCoords.forEach((x, idx) => {
      const y = Phaser.Math.Between(this.field.top + 40, this.field.bottom - 40);
      const modelType = (idx % 2 === 0) ? 'dai_han' : 'tho_san';
      this.spawnOneFellowNpc(x, y, modelType);
    });
  },

  spawnOneFellowNpc(homeX, homeY, modelType = 'dai_han') {
    const name = this.getRandomSinoVietName();
    const outfit = this.getRandomOutfit();
    const initialAnim = `${modelType}_idle`;

    const sprite = this.physics.add.sprite(homeX, homeY, `${modelType}_idle_1`)
      .setScale(0.72)
      .setTint(outfit.tint)
      .setDepth(Math.floor(homeY));
    sprite.setCollideWorldBounds(true);
    sprite.body.setSize(44, 70).setOffset(42, 40);
    if (this.anims.exists(initialAnim)) sprite.play(initialAnim);

    const shadow = this.add.ellipse(homeX, homeY + 30, 36, 12, 0x000000, 0.4).setDepth(Math.floor(homeY) - 1);

    const titlePrefix = (modelType === 'dai_han') ? '⚔️ Tán Tu Đao' : '🪓 Thợ Săn Rìu';
    const nameTag = this.add.text(homeX, homeY - 48, `${titlePrefix} · ${name}`, {
      fontFamily: 'Be Vietnam Pro, sans-serif',
      fontSize: '8.5px',
      fontStyle: 'bold',
      color: outfit.titleColor || '#7dd3fc',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(Math.floor(homeY) + 3);

    const barW = 32;
    const hpBg = this.add.rectangle(homeX, homeY - 37, barW, 3, 0x111111, 0.8).setDepth(Math.floor(homeY) + 1);
    const hpBar = this.add.rectangle(homeX - barW / 2, homeY - 37, barW, 3, 0x34d399)
      .setOrigin(0, 0.5).setDepth(Math.floor(homeY) + 2);

    const playerX = this.player ? this.player.x : 350;
    const isNear = Math.abs(homeX - playerX) <= 950;
    sprite.setVisible(isNear);
    if (sprite.body) sprite.body.enable = isNear;
    shadow.setVisible(isNear);
    nameTag.setVisible(isNear);
    hpBg.setVisible(isNear);
    hpBar.setVisible(isNear);

    const npcData = {
      sprite,
      shadow,
      nameTag,
      hpBg,
      hpBar,
      barW,
      name,
      modelType,
      titlePrefix,
      tint: outfit.tint,
      outfitName: outfit.name,
      vfxColor: outfit.vfxColor,
      homeX,
      homeY,
      hp: 100,
      maxHp: 100,
      dmg: Phaser.Math.Between(1, 3),
      speed: Phaser.Math.Between(120, 145),
      searchRange: 520,
      attackRange: 75,
      atkInterval: Phaser.Math.Between(650, 950),
      lastAttack: 0,
      attackUntil: 0,
      targetEnemy: null,
      isDead: false,
      respawnTime: 0
    };

    this.fellowNpcs.push(npcData);
    return npcData;
  },

  // =========================================================================
  // 2. PARTY FOLLOWER NPCS (4 HIỆP KHÁCH TỔ ĐỘI THEO SAU PLAYER)
  // =========================================================================
  destroyPartyFollowers() {
    if (this.partyFollowers) {
      this.partyFollowers.forEach(f => {
        if (f.sprite) f.sprite.destroy();
        if (f.shadow) f.shadow.destroy();
        if (f.nameTag) f.nameTag.destroy();
        if (f.hpBg) f.hpBg.destroy();
        if (f.hpBar) f.hpBar.destroy();
      });
    }
    this.partyFollowers = [];
  },

  initPartyFollowers() {
    this.destroyPartyFollowers();
    if (!gameState || !gameState.party || !gameState.party.isFormed) return;

    const curMapId = gameState.currentMapId ?? 0;
    const map = (this.currentMap && this.currentMap.id === curMapId) ? this.currentMap : (this.getMapById ? this.getMapById(curMapId) : null);
    
    // Trong thôn (khu an toàn map 0) không xuất hiện, ra ngoài thôn sẽ tự động bám theo bảo vệ Player
    if (!map || map.isPeaceZone || curMapId === 0) return;

    const px = this.player ? this.player.x : 350;
    const py = this.player ? this.player.y : 600;

    this.partyFollowers = PARTY_MEMBERS_DEF.map((def, idx) => {
      const sx = px + def.offsetX;
      const sy = py + def.offsetY;

      const sprite = this.physics.add.sprite(sx, sy, `${def.modelType}_idle_1`)
        .setScale(0.72)
        .setTint(def.tint)
        .setDepth(Math.floor(sy));
      sprite.setCollideWorldBounds(true);
      sprite.body.setSize(44, 70).setOffset(42, 40);

      const animKey = `${def.modelType}_idle`;
      if (this.anims.exists(animKey)) sprite.play(animKey);

      const shadow = this.add.ellipse(sx, sy + 30, 36, 12, 0x000000, 0.45).setDepth(Math.floor(sy) - 1);

      const nameTag = this.add.text(sx, sy - 48, `[Tổ Đội] ${def.title} · ${def.name}`, {
        fontFamily: 'Be Vietnam Pro, sans-serif',
        fontSize: '8.5px',
        fontStyle: 'bold',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 2.2
      }).setOrigin(0.5).setDepth(Math.floor(sy) + 3);

      const barW = 34;
      const hpBg = this.add.rectangle(sx, sy - 37, barW, 3, 0x111111, 0.85).setDepth(Math.floor(sy) + 1);
      const hpBar = this.add.rectangle(sx - barW / 2, sy - 37, barW, 3, 0x34d399)
        .setOrigin(0, 0.5).setDepth(Math.floor(sy) + 2);

      return {
        sprite,
        shadow,
        nameTag,
        hpBg,
        hpBar,
        barW,
        name: def.name,
        modelType: def.modelType,
        tint: def.tint,
        title: def.title,
        offsetX: def.offsetX,
        offsetY: def.offsetY,
        hp: 150,
        maxHp: 150,
        dmg: Phaser.Math.Between(2, 4),
        speed: 155,
        attackRange: 75,
        atkInterval: Phaser.Math.Between(550, 800),
        lastAttack: 0,
        attackUntil: 0,
        targetEnemy: null,
        isDead: false,
        respawnTime: 0
      };
    });
  },

  updatePartyFollowers(time, delta) {
    if (!this.partyFollowers || this.partyFollowers.length === 0 || !this.player || !this.player.active) return;

    const px = this.player.x;
    const py = this.player.y;

    for (let i = 0; i < this.partyFollowers.length; i++) {
      const f = this.partyFollowers[i];
      if (!f || !f.sprite) continue;

      const sx = f.sprite.x;
      const sy = f.sprite.y;
      const pScale = 0.72 * this.perspective(sy);

      f.sprite.setScale(pScale).setDepth(Math.floor(sy));
      f.shadow.setPosition(sx, sy + 30 * pScale).setScale(pScale).setDepth(Math.floor(sy) - 1);
      f.nameTag.setPosition(sx, sy - 48).setDepth(Math.floor(sy) + 3);
      f.hpBg.setPosition(sx, sy - 37).setDepth(Math.floor(sy) + 1);
      f.hpBar.setPosition(sx - f.barW / 2, sy - 37).setDepth(Math.floor(sy) + 2);

      // Xử lý hồi sinh
      if (f.isDead) {
        if (time >= f.respawnTime) {
          f.isDead = false;
          f.hp = f.maxHp;
          if (f.hpBar) {
            f.hpBar.width = f.barW;
            f.hpBar.setVisible(true);
          }
          if (f.hpBg) f.hpBg.setVisible(true);
          f.sprite.setPosition(px + f.offsetX, py + f.offsetY)
            .setVelocity(0, 0)
            .clearTint()
            .setTint(f.tint)
            .setAlpha(1);
          f.sprite.play(`${f.modelType}_idle`, true);
          this.spawnVfx(f.sprite.x, f.sprite.y, 0, 0.6, { tint: f.tint, duration: 250 });
          this.showFloatingText(f.sprite.x, f.sprite.y - 45, `[Tổ Đội · ${f.name}] Trợ Chiến!`, '#ffd700', '10px');
        }
        continue;
      }

      // 1. Quét tìm quái xung quanh Player (bán kính 380px)
      let target = f.targetEnemy;
      if (!target || !target.active || target.isDead || Phaser.Math.Distance.Between(px, py, target.x, target.y) > 420) {
        target = this.findNearestEnemyForNpc(px, py, 380);
        f.targetEnemy = target;
      }

      // Tính lực tách giãn khoảng cách (Separation Repulsion) để các Hiệp Khách KHÔNG CHỒNG LÊN NHAU
      let pushVx = 0, pushVy = 0;
      for (let j = 0; j < this.partyFollowers.length; j++) {
        if (i === j) continue;
        const other = this.partyFollowers[j];
        if (!other || !other.sprite || other.isDead) continue;
        const d = Phaser.Math.Distance.Between(sx, sy, other.sprite.x, other.sprite.y);
        if (d > 0 && d < 44) {
          const pFactor = (44 - d) / 44;
          pushVx += ((sx - other.sprite.x) / d) * 75 * pFactor;
          pushVy += ((sy - other.sprite.y) / d) * 75 * pFactor;
        }
      }
      const distToP = Phaser.Math.Distance.Between(sx, sy, px, py);
      if (distToP > 0 && distToP < 34) {
        pushVx += ((sx - px) / distToP) * 55;
        pushVy += ((sy - py) / distToP) * 55;
      }

      // 2. Hành vi: Hỗ trợ đánh quái hoặc bám theo Player
      if (target && target.active && !target.isDead) {
        // Tọa độ tiếp cận quái theo 4 hướng khác nhau để 4 Hiệp Khách vây quanh quái, không tụ thành 1 điểm
        const attackOffsets = [
          { x: -45, y: -20 },
          { x: 45, y: -20 },
          { x: -45, y: 20 },
          { x: 45, y: 20 }
        ];
        const off = attackOffsets[i % attackOffsets.length];
        const targetApproachX = target.x + off.x;
        const targetApproachY = target.y + off.y;
        const distToEnemy = Phaser.Math.Distance.Between(sx, sy, target.x, target.y);

        if (distToEnemy > f.attackRange) {
          if (time >= f.attackUntil) {
            const angle = Phaser.Math.Angle.Between(sx, sy, targetApproachX, targetApproachY);
            const vx = Math.cos(angle) * f.speed + pushVx;
            const vy = Math.sin(angle) * f.speed + pushVy;
            f.sprite.setVelocity(vx, vy);
            f.sprite.setFlipX(vx < 0);
            f.sprite.play(`${f.modelType}_run`, true);
          }
        } else {
          // Vào tầm đánh quái
          f.sprite.setVelocity(pushVx * 0.5, pushVy * 0.5);
          f.sprite.setFlipX(target.x < sx);

          if (time >= f.lastAttack + f.atkInterval && time >= f.attackUntil) {
            f.lastAttack = time;
            f.attackUntil = time + 360;
            f.sprite.play(`${f.modelType}_attack`, true);

            this.time.delayedCall(160, () => {
              if (target && target.active && !target.isDead && f && !f.isDead) {
                const isCrit = Math.random() < 0.2;
                let dmg = f.dmg || 3;
                if (isCrit) dmg = Math.floor(dmg * 1.85);
                this.damageEnemy(target, dmg, isCrit, {
                  type: 'party_npc',
                  name: f.name,
                  title: f.title || 'Hiệp Khách',
                  ref: f
                });
                this.spawnVfx(target.x, target.y, 0, 0.45, { tint: f.tint, duration: 180 });

                if (target.isDead || target.hp <= 0) {
                  f.targetEnemy = null;
                }
              }
            });
          }
        }
      } else {
        // Không có quái -> Bám theo vị trí đội hình quanh Player
        const formX = px + f.offsetX;
        const formY = py + f.offsetY;
        const distToForm = Phaser.Math.Distance.Between(sx, sy, formX, formY);

        if (distToForm > 28 || Math.abs(pushVx) > 5 || Math.abs(pushVy) > 5) {
          if (time >= f.attackUntil) {
            const angle = Phaser.Math.Angle.Between(sx, sy, formX, formY);
            const moveSpeed = distToForm > 180 ? f.speed * 1.35 : f.speed;
            const vx = Math.cos(angle) * moveSpeed + pushVx;
            const vy = Math.sin(angle) * moveSpeed + pushVy;
            f.sprite.setVelocity(vx, vy);
            f.sprite.setFlipX(vx < 0);
            f.sprite.play(`${f.modelType}_run`, true);
          }
        } else {
          f.sprite.setVelocity(0, 0);
          if (time >= f.attackUntil) {
            f.sprite.play(`${f.modelType}_idle`, true);
            // Hồi HP khi đứng yên (1.5% maxHp/s)
            if (f.hp < f.maxHp) {
              f.hp = Math.min(f.maxHp, f.hp + Math.max(1, Math.floor(f.maxHp * 0.015)));
              const ratio = Math.max(0, f.hp / f.maxHp);
              if (f.hpBar) f.hpBar.width = ratio * f.barW;
            }
          }
        }
      }
    }
  },

  takePartyFollowerDamage(follower, rawDmg = 15) {
    if (!follower || follower.isDead) return;
    const dmg = Math.max(1, Math.floor(rawDmg));
    follower.hp = Math.max(0, follower.hp - dmg);

    const ratio = Math.max(0, follower.hp / follower.maxHp);
    if (follower.hpBar) follower.hpBar.width = ratio * follower.barW;

    this.showFloatingText(follower.sprite.x, follower.sprite.y - 30, `-${dmg}`, '#ff8888', '10px');

    if (follower.hp <= 0) {
      follower.isDead = true;
      follower.targetEnemy = null;
      follower.respawnTime = this.time.now + 7000;
      follower.sprite.setVelocity(0, 0).setAlpha(0.3);
      if (follower.hpBar) follower.hpBar.setVisible(false);
      if (follower.hpBg) follower.hpBg.setVisible(false);
      this.showFloatingText(follower.sprite.x, follower.sprite.y - 45, `[Tổ Đội · ${follower.name}] Tạm Lui!`, '#fca5a5', '10px');
    }
  },

  // =========================================================================
  // 3. MAIN UPDATE LOOP CHO TOÀN BỘ FELLOW & PARTY NPCS
  // =========================================================================
  updateFellowNpcs(time, delta) {
    // Cập nhật Party Followers (nếu có)
    this.updatePartyFollowers(time, delta);

    // Cập nhật Wild Fellow NPCs
    if (!this.fellowNpcs || this.fellowNpcs.length === 0 || !this.player || !this.player.active) return;

    const CULL_RANGE_X = 950;
    const playerX = this.player.x;

    for (let i = 0; i < this.fellowNpcs.length; i++) {
      const npc = this.fellowNpcs[i];
      if (!npc || !npc.sprite) continue;

      const distToPlayerX = Math.abs(npc.sprite.x - playerX);

      // 1. Proximity Culling: Ẩn và dừng xử lý khi ở xa (>950px)
      if (distToPlayerX > CULL_RANGE_X) {
        if (npc.sprite.visible) {
          npc.sprite.setVisible(false);
          if (npc.sprite.body) {
            npc.sprite.body.enable = false;
            npc.sprite.setVelocity(0, 0);
          }
          npc.shadow.setVisible(false);
          npc.nameTag.setVisible(false);
          npc.hpBg.setVisible(false);
          npc.hpBar.setVisible(false);
        }
        continue;
      }

      // Khi lại gần, bật hiển thị lại
      if (!npc.sprite.visible && !npc.isDead) {
        npc.sprite.setVisible(true);
        if (npc.sprite.body) npc.sprite.body.enable = true;
        npc.shadow.setVisible(true);
        npc.nameTag.setVisible(true);
        npc.hpBg.setVisible(true);
        npc.hpBar.setVisible(true);
      }

      // Cập nhật vị trí UI đi theo sprite
      const sx = npc.sprite.x;
      const sy = npc.sprite.y;
      const pScale = 0.72 * this.perspective(sy);
      npc.sprite.setScale(pScale).setDepth(Math.floor(sy));
      npc.shadow.setPosition(sx, sy + 30 * pScale).setScale(pScale).setDepth(Math.floor(sy) - 1);
      npc.nameTag.setPosition(sx, sy - 48).setDepth(Math.floor(sy) + 3);
      npc.hpBg.setPosition(sx, sy - 37).setDepth(Math.floor(sy) + 1);
      npc.hpBar.setPosition(sx - npc.barW / 2, sy - 37).setDepth(Math.floor(sy) + 2);

      // 2. Xử lý Hồi Sinh khi Chết
      if (npc.isDead) {
        if (time >= npc.respawnTime) {
          this.respawnFellowNpc(npc);
        }
        continue;
      }

      // 3. AI Tự Động Quét Tìm Quái Vật
      let target = npc.targetEnemy;
      if (!target || !target.active || target.isDead || Math.abs(target.x - sx) > npc.searchRange) {
        target = this.findNearestEnemyForNpc(sx, sy, npc.searchRange);
        npc.targetEnemy = target;
      }

      // Tính lực tách giãn (Separation) giữa các Tán Tu để không đứng đè lên nhau
      let wildPushVx = 0, wildPushVy = 0;
      for (let j = 0; j < this.fellowNpcs.length; j++) {
        if (i === j) continue;
        const otherNpc = this.fellowNpcs[j];
        if (!otherNpc || !otherNpc.sprite || otherNpc.isDead || !otherNpc.sprite.visible) continue;
        const d = Phaser.Math.Distance.Between(sx, sy, otherNpc.sprite.x, otherNpc.sprite.y);
        if (d > 0 && d < 48) {
          const factor = (48 - d) / 48;
          wildPushVx += ((sx - otherNpc.sprite.x) / d) * 70 * factor;
          wildPushVy += ((sy - otherNpc.sprite.y) / d) * 70 * factor;
        }
      }

      // 4. Di chuyển & Tấn công Mục tiêu
      if (target && target.active && !target.isDead) {
        const dist = Phaser.Math.Distance.Between(sx, sy, target.x, target.y);

        if (dist > npc.attackRange) {
          if (time >= npc.attackUntil) {
            const angle = Phaser.Math.Angle.Between(sx, sy, target.x, target.y);
            const vx = Math.cos(angle) * npc.speed + wildPushVx;
            const vy = Math.sin(angle) * npc.speed + wildPushVy;
            npc.sprite.setVelocity(vx, vy);
            npc.sprite.setFlipX(vx < 0);
            npc.sprite.play(`${npc.modelType}_run`, true);
          }
        } else {
          npc.sprite.setVelocity(wildPushVx * 0.4, wildPushVy * 0.4);
          npc.sprite.setFlipX(target.x < sx);

          if (time >= npc.lastAttack + npc.atkInterval && time >= npc.attackUntil) {
            npc.lastAttack = time;
            npc.attackUntil = time + 380;
            npc.sprite.play(`${npc.modelType}_attack`, true);

            this.time.delayedCall(160, () => {
              if (target && target.active && !target.isDead && npc && !npc.isDead) {
                const isCrit = Math.random() < 0.15;
                let dmg = npc.dmg || 2;
                if (isCrit) dmg = Math.floor(dmg * 1.8);
                this.damageEnemy(target, dmg, isCrit, {
                  type: 'wild_npc',
                  name: npc.name,
                  title: npc.titlePrefix || 'Tán Tu',
                  ref: npc
                });
                this.spawnVfx(target.x, target.y, 0, 0.45, { tint: 0x99eeff, duration: 180 });

                if (target.isDead || target.hp <= 0) {
                  npc.targetEnemy = null;
                }
              }
            });
          }
        }
      } else {
        npc.sprite.setVelocity(wildPushVx * 0.5, wildPushVy * 0.5);
        if (time >= npc.attackUntil) {
          npc.sprite.play(`${npc.modelType}_idle`, true);
          // Hồi HP tự động khi không chiến đấu (2% maxHp/s ≈ mỗi frame 60fps ~= 0.033% mọi 16ms)
          if (npc.hp < npc.maxHp) {
            npc.hp = Math.min(npc.maxHp, npc.hp + Math.max(1, Math.floor(npc.maxHp * 0.02)));
            const ratio = Math.max(0, npc.hp / npc.maxHp);
            if (npc.hpBar) npc.hpBar.width = ratio * npc.barW;
          }
        }
      }
    }
  },

  findNearestEnemyForNpc(x, y, maxDist = 550) {
    if (!this.enemies || this.enemies.length === 0) return null;
    let nearest = null;
    let minDist = maxDist;

    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (!e || !e.active || e.isDead) continue;
      const d = Phaser.Math.Distance.Between(x, y, e.x, e.y);
      if (d < minDist) {
        minDist = d;
        nearest = e;
      }
    }
    return nearest;
  },

  takeFellowNpcDamage(npc, rawDmg = 15) {
    if (!npc || npc.isDead) return;
    const dmg = Math.max(1, Math.floor(rawDmg));
    npc.hp = Math.max(0, npc.hp - dmg);

    const ratio = Math.max(0, npc.hp / npc.maxHp);
    if (npc.hpBar) npc.hpBar.width = ratio * npc.barW;

    this.showFloatingText(npc.sprite.x, npc.sprite.y - 30, `-${dmg}`, '#ff8888', '11px');

    if (npc.hp <= 0) {
      this.killFellowNpc(npc);
    }
  },

  killFellowNpc(npc) {
    if (!npc || npc.isDead) return;
    npc.isDead = true;
    npc.targetEnemy = null;
    npc.respawnTime = this.time.now + 6000;

    npc.sprite.setVelocity(0, 0);
    npc.sprite.setTint(0x666666).setAlpha(0.35);
    if (npc.hpBar) npc.hpBar.setVisible(false);
    if (npc.hpBg) npc.hpBg.setVisible(false);

    this.showFloatingText(npc.sprite.x, npc.sprite.y - 45, `[${npc.name}] Bại Trận!`, '#fca5a5', '11px');
    this.spawnVfx(npc.sprite.x, npc.sprite.y, 0, 0.5, { tint: 0x94a3b8, duration: 250 });
  },

  respawnFellowNpc(npc) {
    if (!npc || !npc.sprite) return;
    npc.isDead = false;
    npc.name = this.getRandomSinoVietName(npc.name);
    
    // Tự động thay đổi màu sắc trang phục mới khi tái sinh
    const newOutfit = this.getRandomOutfit();
    npc.tint = newOutfit.tint;
    npc.outfitName = newOutfit.name;
    npc.vfxColor = newOutfit.vfxColor;

    npc.nameTag.setText(`${npc.titlePrefix} · ${npc.name}`);
    npc.nameTag.setColor(newOutfit.titleColor || '#7dd3fc');

    npc.hp = npc.maxHp;
    if (npc.hpBar) {
      npc.hpBar.width = npc.barW;
      npc.hpBar.setVisible(true);
    }
    if (npc.hpBg) npc.hpBg.setVisible(true);

    npc.sprite.setPosition(npc.homeX + Phaser.Math.Between(-20, 20), npc.homeY + Phaser.Math.Between(-15, 15))
      .setVelocity(0, 0)
      .clearTint()
      .setTint(npc.tint)
      .setAlpha(1);

    npc.sprite.play(`${npc.modelType}_idle`, true);
    this.spawnVfx(npc.sprite.x, npc.sprite.y, 0, 0.6, { tint: npc.vfxColor || 0x38bdf8, duration: 300 });
    this.showFloatingText(npc.sprite.x, npc.sprite.y - 50, `[${npc.name}] Tái Sinh (${newOutfit.name})!`, newOutfit.titleColor || '#67e8f9', '11px');
  }
};
