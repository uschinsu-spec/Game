/**
 * EnemyMixin.js
 * Quản lý: initBattlefield, spawnOneEnemy, killEnemy,
 *           enemyAttack, enemyShootProjectile
 */
import { MONSTER_RANKS } from '../../config/monstersData.js';
import { getMapById } from '../../config/world/worldRegistry.js?v=20260930-canonical-geography-v1';
import { gameState } from '../../state/gameState.js';
import { getCongPhapById } from '../../config/congPhapData.js';
import { ensureCurrencies, addCurrency } from '../../config/currencyData.js';
import { getItemDef } from '../../config/itemCatalog.js?v=20261001-item-icons-v4';
import { generateEnemyLoot, awardLoot } from './ItemSystem.js?v=20261001-item-icons-v4';

export const EnemyMixin = {

  cleanupBattlefield() {
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

    if (this.elementalGroundDrops) {
      this.elementalGroundDrops.forEach(drop => drop?.destroy?.());
      this.elementalGroundDrops = [];
    }
  },

  initBattlefield() {
    this.cleanupBattlefield();

    const map = this.currentMap || getMapById(gameState.currentMapId);
    if (map?.isPeaceZone) {
      // Khu vực an toàn / hòa bình, không sinh quái thú
      return;
    }

    if (typeof this.ensureActiveMapZoneAssets === 'function') {
      this.ensureActiveMapZoneAssets();
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
    const map = getMapById(mapId);
    const zones = map?.zones || [];
    const strictZone = Math.max(1, Math.min(zones.length || 4, Number(zone) || 1));
    const currentZoneDef = zones[strictZone - 1];

    const minRealm = Number(currentZoneDef?.realmRange?.[0] ?? map?.realmRange?.[0] ?? map?.minRealm ?? 0);
    let rankOffset = 0;
    if (strictZone === 1) rankOffset = (slotIndex % 2);
    else if (strictZone === 2) rankOffset = (slotIndex % 3);
    else if (strictZone >= 3) rankOffset = 1 + (slotIndex % 3);

    const mIdx = Math.min(MONSTER_RANKS.length - 1, (map?.monsterIdxStart || Math.min(12, minRealm)) + rankOffset);
    const monsterData = MONSTER_RANKS[mIdx];
    
    // Quái bay xuất hiện khi cảnh giới từ Trúc Cơ (minRealm >= 4)
    const isFlying = (minRealm >= 4) && (slotIndex % 2 === 1);
    const enemySpriteNum = isFlying ? ((slotIndex % 10) + 1) : (monsterData?.spriteNum || ((mIdx % 16) + 1));
    const displayName = isFlying ? `[Phi Thiên] ${monsterData?.name || 'Yêu Thú'}` : (monsterData?.name || 'Yêu Thú');

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
    return { items: generateEnemyLoot(enemy) };
  },

  killEnemy(enemy) {
    if (!enemy || enemy.isDead) return;
    enemy.isDead = true;

    const isParty = !!gameState.party?.isFormed;
    const dropBundle = this.buildEnemyDropTable(enemy);

    let playerTeamDmg = 0;
    let wildTop = { totalDmg: 0, name: 'Tán Tu', ref: null };
    if (enemy.damageDealers) {
      for (const dealer of Object.values(enemy.damageDealers)) {
        if (dealer.type === 'player' || dealer.type === 'party_npc') playerTeamDmg += dealer.totalDmg;
        else if (dealer.type === 'wild_npc' && dealer.totalDmg > wildTop.totalDmg) wildTop = dealer;
      }
    } else playerTeamDmg = 1;

    const winnerInfo = playerTeamDmg >= wildTop.totalDmg
      ? { winnerType: isParty ? 'party' : 'player', winnerName: isParty ? 'Tổ Đội 5 Người' : 'Bạn', ref: this.player }
      : { winnerType:'wild_npc', winnerName:wildTop.name || 'Tán Tu', ref:wildTop.ref };

    this.spawnGroundLootDrop(enemy.x, enemy.y, dropBundle, winnerInfo, isParty);
    this.spawnVfx?.(enemy.x, enemy.y, 0, 0.55, { duration:260, grow:1.2, tint:0xff3344 });
    enemy.setVelocity(0,0); enemy.setVisible(false); if(enemy.body) enemy.body.enable=false;
    enemy.hpBar?.setVisible(false); enemy.hpBg?.setVisible(false); enemy.nameText?.setVisible(false);
    this.updateHUD?.();
    this.time.delayedCall(5000,()=>{ if(enemy && this.scene?.isActive()) this.respawnEnemy(enemy); });
  },

  spawnGroundLootDrop(x, y, dropBundle, winnerInfo, isParty) {
    if (!this.groundDrops) this.groundDrops=[];
    const drops=(dropBundle?.items||[]).filter(d=>d?.itemId && d.qty>0);
    if(!drops.length) return;
    const container=this.add.container(x,y-6).setDepth(Math.floor(y)+12);
    const playerTeam=['player','party'].includes(winnerInfo.winnerType);
    const rare=drops.map(d=>getItemDef(d.itemId)).find(d=>['core','blueprint','key'].includes(d?.kind));
    const color=rare?.color ? Phaser.Display.Color.HexStringToColor(rare.color).color : (playerTeam ? (isParty?0x34d399:0xfde047) : 0x60a5fa);
    const aura=this.add.ellipse(0,10,36,14,color,.45); this.tweens.add({targets:aura,scaleX:1.3,scaleY:1.3,alpha:.15,yoyo:true,repeat:-1,duration:480});
    const icon=this.add.text(0,-10,rare?.kind==='core'?'🔮':'🎒',{fontSize:'20px'}).setOrigin(.5); this.tweens.add({targets:icon,y:{from:-28,to:-6},ease:'Bounce.easeOut',duration:380});
    const bg=this.add.rectangle(0,-32,160,22,0x09111e,.9).setStrokeStyle(1,color);
    const topDef=rare || getItemDef(drops[0].itemId);
    const label=this.add.text(0,-38,`${rare?'✨':'🎁'} ${topDef?.name||'Chiến Lợi Phẩm'} (2s)`,{fontFamily:'sans-serif',fontSize:'7.5px',fontStyle:'bold',color:rare?.color||'#f8fafc'}).setOrigin(.5);
    const sub=this.add.text(0,-26,`👑 Top Dmg: ${winnerInfo.winnerName}`,{fontFamily:'sans-serif',fontSize:'7.5px',color:playerTeam?'#fde047':'#93c5fd'}).setOrigin(.5);
    container.add([aura,icon,bg,label,sub]); this.groundDrops.push(container);

    this.time.delayedCall(2000,()=>{
      if(!container?.active||!this.scene?.isActive()) return;
      const idx=this.groundDrops.indexOf(container); if(idx>=0)this.groundDrops.splice(idx,1);
      if(winnerInfo.winnerType==='wild_npc') {
        const sx=winnerInfo.ref?.sprite?.x??x, sy=(winnerInfo.ref?.sprite?.y??y)-20;
        this.tweens.add({targets:container,x:sx,y:sy,scaleX:.15,scaleY:.15,alpha:.2,duration:300,onComplete:()=>{container.destroy();this.showFloatingText?.(sx,sy-40,`[Tán Tu] ${winnerInfo.winnerName} đã nhặt chiến lợi phẩm`,'#93c5fd','10px');}}); return;
      }
      let received=drops;
      if(isParty) {
        received=[];
        for(const d of drops){
          const def=getItemDef(d.itemId);
          if(['core','blueprint','key'].includes(def?.kind)) { if(Phaser.Math.Between(0,4)===0) received.push({...d,qty:1}); continue; }
          const base=Math.floor(d.qty/5), rem=d.qty%5; const qty=base+(Phaser.Math.Between(0,4)<rem?1:0); if(qty>0)received.push({...d,qty});
        }
      }
      const px=this.player?.x??x, py=(this.player?.y??y)-25;
      this.tweens.add({targets:container,x:px,y:py,scaleX:.15,scaleY:.15,alpha:.2,duration:320,onComplete:()=>{
        container.destroy(); awardLoot(received);
        if(gameState.afkStats) gameState.afkStats.kills=(gameState.afkStats.kills||0)+1;
        this.updateAfkBanner?.(); this.updateHUD?.();
        const text=received.slice(0,4).map(d=>`+${d.qty} ${getItemDef(d.itemId)?.name||d.itemId}`).join(' • ');
        this.showFloatingText?.(px,py-35,`${isParty?'[Tổ Đội]':'[100% Đơn Hành]'} ${text||'Không nhận phần chia'}`,isParty?'#34d399':'#fde047','10px');
        this.spawnVfx?.(px,py,0,.45,{tint:color,duration:220});
      }});
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