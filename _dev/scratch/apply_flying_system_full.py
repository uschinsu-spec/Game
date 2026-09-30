import os

def update_enemy_mixin():
    with open('src/scenes/mixins/EnemyMixin.js', 'r', encoding='utf-8') as f:
        content = f.read()

    old_cfg = """    // Generic spawn config for all other maps
    const map = ALL_MAPS[mapId] || ALL_MAPS[0];
    let rankOffset = 0;
    if (zone === 1) rankOffset = (slotIndex % 2);
    else if (zone === 2) rankOffset = (slotIndex % 3);
    else if (zone >= 3) rankOffset = 1 + (slotIndex % 3);

    const mIdx = Math.min(MONSTER_RANKS.length - 1, (map.monsterIdxStart || 0) + rankOffset);
    const monsterData = MONSTER_RANKS[mIdx];
    const enemySpriteNum = monsterData.spriteNum || ((mIdx % 16) + 1);

    return {
      monsterData,
      spriteNum: enemySpriteNum,
      baseScale: 0.50,
      displayName: monsterData.name,
      nameColor: '#ffd700',
      nameFontSize: '9px'
    };"""

    new_cfg = """    // Generic spawn config for all other maps
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
    };"""

    if old_cfg in content:
        content = content.replace(old_cfg, new_cfg)
        print("Updated getEnemySpawnConfig in EnemyMixin.js")
    else:
        print("Could not find old_cfg in EnemyMixin.js")

    old_spawn = """    const enemy = this.enemyGroup.create(homeX, homeY, 'enemy_' + enemySpriteNum + '_idle_0')
      .setScale(baseEnemyScale * this.perspective(homeY))
      .setDepth(Math.floor(homeY));

    // Thuộc tính cố định
    enemy.homeX = homeX;
    enemy.homeY = homeY;
    enemy.isDead = false;
    enemy.monsterData = monsterData;
    enemy.isRanged = monsterData.isRanged || [3, 6, 8, 13, 15, 16].includes(enemySpriteNum);
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
    enemy.play('e_enemy_' + enemySpriteNum + '_idle', true);"""

    new_spawn = """    const isFlying = config.isFlying || false;
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
    }"""

    if old_spawn in content:
        content = content.replace(old_spawn, new_spawn)
        print("Updated spawnOneFixedEnemy in EnemyMixin.js")
    else:
        print("Could not find old_spawn in EnemyMixin.js")

    with open('src/scenes/mixins/EnemyMixin.js', 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)

def update_fellow_npc_mixin():
    with open('src/scenes/mixins/FellowNpcMixin.js', 'r', encoding='utf-8') as f:
        content = f.read()

    # In getNpcSpawnConfig: Add isFlying
    old_spawn_cfg = """    const titlePrefix = `[${zoneCfg.stageLabel} · ${elemCfg.title}]`;

    return {
      mapId: mapNum,
      zone: zoneCfg.zone,
      realmMajor: zoneCfg.realmMajor,
      stageLabel: zoneCfg.stageLabel,
      tierLevel,
      masteryName: zoneCfg.masteryName,
      masteryBonus: zoneCfg.masteryBonus,
      vfxMul: zoneCfg.vfxMul,
      masteryColor: zoneCfg.masteryColor,
      elem: elemCfg.elem,
      elemTitle: elemCfg.title,
      elemColor: elemCfg.color,
      eKey: elemCfg.eKey,
      isSword: elemCfg.isSword || false,
      isMelee: elemCfg.isMelee || false,
      skillId: skillDef.id,
      skillName: skillDef.name,
      dmgMul: skillDef.dmgMul || 1.6,
      atkInterval: skillDef.cd > 0 ? skillDef.cd : 2000,
      attackRange: elemCfg.baseRange || 240,
      maxHp,
      dmg: baseDmg,
      def: baseDef,
      tint: elemCfg.tint,
      titlePrefix,
      titleColor: elemCfg.color
    };"""

    new_spawn_cfg = """    const titlePrefix = `[${zoneCfg.stageLabel} · ${elemCfg.title}]`;
    // Từ Trúc Cơ (Map 3 hoặc tierLevel >= 2) trở lên: NPC luôn Ngự Kiếm Phi Hành (Bay trên trời, không chạy bộ)
    const isFlying = (mapNum >= 3 || tierLevel >= 2);

    return {
      mapId: mapNum,
      zone: zoneCfg.zone,
      realmMajor: zoneCfg.realmMajor,
      stageLabel: zoneCfg.stageLabel,
      tierLevel,
      isFlying,
      masteryName: zoneCfg.masteryName,
      masteryBonus: zoneCfg.masteryBonus,
      vfxMul: zoneCfg.vfxMul,
      masteryColor: zoneCfg.masteryColor,
      elem: elemCfg.elem,
      elemTitle: elemCfg.title,
      elemColor: elemCfg.color,
      eKey: elemCfg.eKey,
      isSword: elemCfg.isSword || false,
      isMelee: elemCfg.isMelee || false,
      skillId: skillDef.id,
      skillName: skillDef.name,
      dmgMul: skillDef.dmgMul || 1.6,
      atkInterval: skillDef.cd > 0 ? skillDef.cd : 2000,
      attackRange: elemCfg.baseRange || 240,
      maxHp,
      dmg: baseDmg,
      def: baseDef,
      tint: elemCfg.tint,
      titlePrefix,
      titleColor: elemCfg.color
    };"""

    if old_spawn_cfg in content:
        content = content.replace(old_spawn_cfg, new_spawn_cfg)
        print("Updated getNpcSpawnConfig in FellowNpcMixin.js")
    else:
        print("Could not find old_spawn_cfg in FellowNpcMixin.js")

    # In spawnOneFellowNpc: Support flying sword & flying anim
    old_spawn_one = """    const curMapId = gameState.currentMapId ?? 0;
    const name = this.getRandomSinoVietName();
    const cfg = this.getNpcSpawnConfig(curMapId, homeX, elementIdx);
    const initialAnim = `${modelType}_idle`;

    const sprite = this.physics.add.sprite(homeX, homeY, `${modelType}_idle_1`)
      .setScale(0.72)
      .setTint(cfg.tint)
      .setDepth(Math.floor(homeY));
    sprite.setCollideWorldBounds(true);
    sprite.body.setSize(44, 70).setOffset(42, 40);
    if (this.anims.exists(initialAnim)) sprite.play(initialAnim);

    const shadow = this.add.ellipse(homeX, homeY + 30, 36, 12, 0x000000, 0.4).setDepth(Math.floor(homeY) - 1);"""

    new_spawn_one = """    const curMapId = gameState.currentMapId ?? 0;
    const name = this.getRandomSinoVietName();
    const cfg = this.getNpcSpawnConfig(curMapId, homeX, elementIdx);
    const initialAnim = cfg.isFlying ? `${modelType}_fly` : `${modelType}_idle`;

    const sprite = this.physics.add.sprite(homeX, homeY, `${modelType}_idle_1`)
      .setScale(0.72)
      .setTint(cfg.tint)
      .setDepth(Math.floor(homeY));
    sprite.setCollideWorldBounds(true);
    sprite.body.setSize(44, 70).setOffset(42, 40);
    if (this.anims.exists(initialAnim)) sprite.play(initialAnim);

    const shadow = this.add.ellipse(homeX, homeY + 30, 36, 12, 0x000000, 0.4).setDepth(Math.floor(homeY) - 1);
    
    // Phi Kiếm ngự dưới chân NPC nếu là cảnh giới Trúc Cơ trở lên
    let flyingSword = null;
    if (cfg.isFlying && this.textures.exists('flying_sword')) {
      flyingSword = this.add.image(homeX, homeY + 22, 'flying_sword')
        .setScale(0.55)
        .setDepth(Math.floor(homeY) - 1)
        .setTint(cfg.tint);
    }"""

    if old_spawn_one in content:
        content = content.replace(old_spawn_one, new_spawn_one)
        print("Updated spawnOneFellowNpc in FellowNpcMixin.js")
    else:
        print("Could not find old_spawn_one in FellowNpcMixin.js")

    # In npcData: add flying properties
    old_npc_data = """      isDead: false,
      respawnTime: 0
    };

    this.fellowNpcs.push(npcData);"""

    new_npc_data = """      isDead: false,
      respawnTime: 0,
      isFlying: cfg.isFlying,
      flyingSword
    };

    this.fellowNpcs.push(npcData);"""

    if old_npc_data in content:
        content = content.replace(old_npc_data, new_npc_data)
        print("Updated npcData in FellowNpcMixin.js")
    else:
        print("Could not find old_npc_data in FellowNpcMixin.js")

    # In updateFellowNpcs: Update culling, hover position and animation for flying NPCs
    old_cull_hide = """          npc.hpBg.setVisible(false);
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
      npc.hpBar.setPosition(sx - npc.barW / 2, sy - 37).setDepth(Math.floor(sy) + 2);"""

    new_cull_hide = """          npc.hpBg.setVisible(false);
          npc.hpBar.setVisible(false);
          if (npc.flyingSword) npc.flyingSword.setVisible(false);
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
        if (npc.flyingSword) npc.flyingSword.setVisible(true);
      }

      // Cập nhật vị trí UI & Phi Kiếm đi theo sprite
      const sx = npc.sprite.x;
      const sy = npc.sprite.y;
      const pScale = 0.72 * this.perspective(sy);
      
      if (npc.isFlying) {
        const hoverOffset = Math.sin(time * 0.0035 + (npc.homeX || 0)) * 5;
        const flyY = sy - 24 + hoverOffset;
        npc.sprite.setScale(pScale).setDepth(Math.floor(sy) + 10);
        npc.shadow.setPosition(sx, sy + 30 * pScale).setScale(pScale * 0.85).setDepth(Math.floor(sy) - 1);
        npc.nameTag.setPosition(sx, flyY - 48).setDepth(Math.floor(sy) + 15);
        npc.hpBg.setPosition(sx, flyY - 37).setDepth(Math.floor(sy) + 12);
        npc.hpBar.setPosition(sx - npc.barW / 2, flyY - 37).setDepth(Math.floor(sy) + 13);
        if (npc.flyingSword) {
          npc.flyingSword.setPosition(sx, flyY + 24 * pScale).setScale(0.55 * pScale).setDepth(Math.floor(sy) + 9);
          npc.flyingSword.setFlipX(npc.sprite.flipX);
        }
      } else {
        npc.sprite.setScale(pScale).setDepth(Math.floor(sy));
        npc.shadow.setPosition(sx, sy + 30 * pScale).setScale(pScale).setDepth(Math.floor(sy) - 1);
        npc.nameTag.setPosition(sx, sy - 48).setDepth(Math.floor(sy) + 3);
        npc.hpBg.setPosition(sx, sy - 37).setDepth(Math.floor(sy) + 1);
        npc.hpBar.setPosition(sx - npc.barW / 2, sy - 37).setDepth(Math.floor(sy) + 2);
        if (npc.flyingSword) npc.flyingSword.setVisible(false);
      }"""

    if old_cull_hide in content:
        content = content.replace(old_cull_hide, new_cull_hide)
        print("Updated cull/hover in FellowNpcMixin.js")
    else:
        print("Could not find old_cull_hide in FellowNpcMixin.js")

    # In updateFellowNpcs: movement & idle animation
    old_move_anim = """            const angle = Phaser.Math.Angle.Between(sx, sy, target.x, target.y);
            const vx = Math.cos(angle) * npc.speed + wildPushVx;
            const vy = Math.sin(angle) * npc.speed + wildPushVy;
            npc.sprite.setVelocity(vx, vy);
            npc.sprite.setFlipX(vx < 0);
            npc.sprite.play(`${npc.modelType}_run`, true);"""

    new_move_anim = """            const angle = Phaser.Math.Angle.Between(sx, sy, target.x, target.y);
            const vx = Math.cos(angle) * npc.speed + wildPushVx;
            const vy = Math.sin(angle) * npc.speed + wildPushVy;
            npc.sprite.setVelocity(vx, vy);
            npc.sprite.setFlipX(vx < 0);
            const moveAnim = npc.isFlying ? `${npc.modelType}_fly` : `${npc.modelType}_run`;
            npc.sprite.play(moveAnim, true);"""

    if old_move_anim in content:
        content = content.replace(old_move_anim, new_move_anim)
        print("Updated move_anim in FellowNpcMixin.js")
    else:
        print("Could not find old_move_anim in FellowNpcMixin.js")

    old_idle_anim = """        npc.sprite.setVelocity(wildPushVx * 0.5, wildPushVy * 0.5);
        if (time >= npc.attackUntil) {
          npc.sprite.play(`${npc.modelType}_idle`, true);"""

    new_idle_anim = """        npc.sprite.setVelocity(wildPushVx * 0.5, wildPushVy * 0.5);
        if (time >= npc.attackUntil) {
          const idleAnim = npc.isFlying ? `${npc.modelType}_fly` : `${npc.modelType}_idle`;
          npc.sprite.play(idleAnim, true);"""

    if old_idle_anim in content:
        content = content.replace(old_idle_anim, new_idle_anim)
        print("Updated idle_anim in FellowNpcMixin.js")
    else:
        print("Could not find old_idle_anim in FellowNpcMixin.js")

    # In killFellowNpc & respawnFellowNpc
    old_kill = """    npc.sprite.setVelocity(0, 0);
    npc.sprite.setTint(0x666666).setAlpha(0.35);
    if (npc.hpBar) npc.hpBar.setVisible(false);
    if (npc.hpBg) npc.hpBg.setVisible(false);"""

    new_kill = """    npc.sprite.setVelocity(0, 0);
    npc.sprite.setTint(0x666666).setAlpha(0.35);
    if (npc.hpBar) npc.hpBar.setVisible(false);
    if (npc.hpBg) npc.hpBg.setVisible(false);
    if (npc.flyingSword) npc.flyingSword.setVisible(false);"""

    if old_kill in content:
        content = content.replace(old_kill, new_kill)
        print("Updated kill in FellowNpcMixin.js")
    else:
        print("Could not find old_kill in FellowNpcMixin.js")

    old_respawn = """    npc.sprite.play(`${npc.modelType}_idle`, true);
    this.spawnVfx(npc.sprite.x, npc.sprite.y, 0, 0.6, { tint: cfg.tint || 0x38bdf8, duration: 300 });"""

    new_respawn = """    npc.isFlying = cfg.isFlying;
    if (npc.flyingSword) {
      npc.flyingSword.setTint(cfg.tint).setVisible(cfg.isFlying);
    } else if (cfg.isFlying && this.textures.exists('flying_sword')) {
      npc.flyingSword = this.add.image(npc.homeX, npc.homeY + 22, 'flying_sword').setScale(0.55).setDepth(Math.floor(npc.homeY) - 1).setTint(cfg.tint);
    }
    const respawnAnim = cfg.isFlying ? `${npc.modelType}_fly` : `${npc.modelType}_idle`;
    npc.sprite.play(respawnAnim, true);
    this.spawnVfx(npc.sprite.x, npc.sprite.y, 0, 0.6, { tint: cfg.tint || 0x38bdf8, duration: 300 });"""

    if old_respawn in content:
        content = content.replace(old_respawn, new_respawn)
        print("Updated respawn in FellowNpcMixin.js")
    else:
        print("Could not find old_respawn in FellowNpcMixin.js")

    # In initFellowNpcs: destroy flyingSword
    old_init = """    if (this.fellowNpcs) {
      this.fellowNpcs.forEach(npc => {
        if (npc.sprite) npc.sprite.destroy();
        if (npc.shadow) npc.shadow.destroy();
        if (npc.nameTag) npc.nameTag.destroy();
        if (npc.hpBg) npc.hpBg.destroy();
        if (npc.hpBar) npc.hpBar.destroy();
      });
    }"""

    new_init = """    if (this.fellowNpcs) {
      this.fellowNpcs.forEach(npc => {
        if (npc.sprite) npc.sprite.destroy();
        if (npc.shadow) npc.shadow.destroy();
        if (npc.nameTag) npc.nameTag.destroy();
        if (npc.hpBg) npc.hpBg.destroy();
        if (npc.hpBar) npc.hpBar.destroy();
        if (npc.flyingSword) npc.flyingSword.destroy();
      });
    }"""

    if old_init in content:
        content = content.replace(old_init, new_init)
        print("Updated init in FellowNpcMixin.js")
    else:
        print("Could not find old_init in FellowNpcMixin.js")

    with open('src/scenes/mixins/FellowNpcMixin.js', 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)

update_enemy_mixin()
update_fellow_npc_mixin()
