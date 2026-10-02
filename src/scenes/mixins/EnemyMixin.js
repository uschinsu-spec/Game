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
import { ELEMENTAL_SKILLS } from '../../config/skillsData.js';

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

    const totalW = this.worldW || 32000;

    if ((this.worldH || 0) > 1500) {
      // Bản đồ 2.5D Isometric (3584x3584px): Rải quái theo lưới 2 chiều
      const stepX = 350;
      const stepY = 350;
      let slot = 0;
      for (let x = 350; x < totalW - 350; x += stepX) {
        for (let y = this.field.top + 80; y < this.field.bottom - 80; y += stepY) {
          const distToSpawn = Math.hypot(x - 1792, y - 1792);
          if (distToSpawn < 280) continue;
          const jitterX = x + Phaser.Math.Between(-50, 50);
          const jitterY = y + Phaser.Math.Between(-50, 50);
          const zone = distToSpawn < 900 ? 1 : (distToSpawn < 1600 ? 2 : 3);
          this.spawnOneFixedEnemy(jitterX, jitterY, slot++, zone);
        }
      }
      return;
    }

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
    const initialTex = isFlying ? `enemy_fly_${enemySpriteNum}` : `enemy_${enemySpriteNum}`;
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
    const idleAnim = (enemy.isFlying ? 'e_enemy_fly_' : 'e_enemy_') + enemy.enemySpriteNum + '_idle';
    if (this.anims.exists(idleAnim)) enemy.play(idleAnim, true);

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

  enemyCastSkill(enemy, skillId = 'basic_attack', target = null, cooldown = 1800) {
    if (!enemy || !enemy.active || enemy.isDead) return;

    const skillDef = ELEMENTAL_SKILLS.find(s => s.id === skillId) || ELEMENTAL_SKILLS[0];
    const targetObj = target || (this.player ? { type: 'player', x: this.player.x, y: this.player.y, ref: this.player } : null);
    if (!targetObj) return;

    const targetX = targetObj.x;
    const targetY = targetObj.y;
    enemy.setFlipX(targetX < enemy.x);

    // Tốc độ animation tỷ lệ thuận với tốc độ đánh (nếu đánh chậm thì animation cũng chậm rõ nét)
    const atkCooldown = typeof cooldown === 'number' ? cooldown : (enemy.attackInterval || 1800);
    const atkDuration = Math.max(400, Math.min(1600, Math.round(atkCooldown * 0.65)));
    enemy.attackUntil = this.time.now + atkDuration;

    const atkAnim = `e_${enemy.isFlying ? 'enemy_fly_' : 'enemy_'}${enemy.enemySpriteNum}_attack`;
    if (this.anims.exists(atkAnim)) {
      enemy.play(atkAnim, true);
      // Base animation là 12 frame @ 12 fps = 1000ms base
      if (enemy.anims) {
        enemy.anims.timeScale = 1000 / atkDuration;
      }
    }

    // Thời điểm va chạm trúng đích ở đỉnh điểm đòn cắn / trảm (48% thời lượng animation)
    const hitDelay = Math.round(atkDuration * 0.48);
    this.time.delayedCall(hitDelay, () => {
      if (!enemy || !enemy.active || enemy.isDead) return;

      const baseDmg = enemy.dmg || 20;
      const skillDmgMul = Number(skillDef.dmgMul || 1.0);
      const enemyDmg = Math.max(1, Math.round(baseDmg * skillDmgMul));

      // Kiểm tra cự ly trúng đòn
      const curDist = Math.hypot(targetX - enemy.x, targetY - enemy.y);
      const maxHitRange = skillDef.isAoE ? 240 : 135;
      if (curDist > maxHitRange) return;

      // Hiệu ứng va chạm đòn đánh vật lý
      this.spawnVfx?.(targetX, targetY - 10, 0, 0.55, { tint: 0xff3344, duration: 200, grow: 1.2 });

      // Gây sát thương lên mục tiêu tương ứng
      if (targetObj.type === 'player' && this.player && this.player.active && !this.dead) {
        this.takePlayerDamage?.(enemyDmg);
      } else if (targetObj.type === 'party_follower' && targetObj.ref && !targetObj.ref.isDead) {
        this.takePartyFollowerDamage?.(targetObj.ref, enemyDmg * 0.75);
      } else if (targetObj.type === 'fellow_npc' && targetObj.ref && !targetObj.ref.isDead) {
        this.takeFellowNpcDamage?.(targetObj.ref, enemyDmg * 0.8);
      } else if (targetObj.type === 'map_npc' && targetObj.ref) {
        this.showFloatingText?.(targetX, targetY - 60, `🛡️ Hộ Thể!`, '#38bdf8', '11px');
        this.spawnVfx?.(targetX, targetY, 0, 0.4, { tint: 0x38bdf8, duration: 200 });
      }
    });
  },

  enemyAttack(enemy, target = null, cooldown = 1800) {
    const sId = enemy.equippedSkillId || enemy.skillId || 'basic_attack';
    return this.enemyCastSkill(enemy, sId, target, cooldown);
  }
};