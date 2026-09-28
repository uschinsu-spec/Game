with open(r'H:\GOOGLE DRIVER\GAME\src\scenes\MainScene.js', 'r', encoding='utf-8') as f:
    text = f.read()

old_march = """      } else if (mode === 'march') {
        vx = baseSpeed * 0.85; this.player.setFlipX(false);
        const target = this.nearestEnemy(480, true);
        if (target && target.active && target.x >= this.player.x - 50) {
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, target.x, target.y);
          let casted = false;
          if (gameState.afkSettings?.autoSkill && !isAttacking) {
            for (const sId of gameState.equippedSkillIds) if (sId && !(this.activeSkillCds[sId] > 0)) { if (this.isFlyingSword) this.isFlyingSword = false; this.castSkill(sId); casted = true; break; }
          }
          if (!casted && dist <= 115 && !isAttacking) { if (this.isFlyingSword) this.isFlyingSword = false; this.basicAttack(); }
        }
      } else if (this.enemies.length > 0) {
        const target = this.nearestEnemy(3000, false);
        if (target && target.active) {
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, target.x, target.y);
          const onScreen = this.isEnemyOnScreen ? this.isEnemyOnScreen(target, 20) : dist <= 420;
          let casted = false;
          if (gameState.afkSettings?.autoSkill && onScreen && dist <= 420 && !isAttacking) {
            for (const sId of gameState.equippedSkillIds) if (sId && !(this.activeSkillCds[sId] > 0)) { if (this.isFlyingSword) this.isFlyingSword = false; this.player.setFlipX(target.x < this.player.x); this.castSkill(sId); casted = true; break; }
          }
          if (!casted) {
            if (dist > 220) {
              if (gameState.afkSettings?.autoFly && !this.isFlyingSword) this.isFlyingSword = true;
              if (!isAttacking) { const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y); vx = Math.cos(angle) * baseSpeed; vy = Math.sin(angle) * baseSpeed; }
            } else if (dist > 85) {
              if (this.isFlyingSword) this.isFlyingSword = false;
              if (!isAttacking) { const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y); vx = Math.cos(angle) * baseSpeed * 0.9; vy = Math.sin(angle) * baseSpeed * 0.9; }
            } else {
              if (this.isFlyingSword) this.isFlyingSword = false;
              vx = 0; vy = 0; this.player.setFlipX(target.x < this.player.x); if (!isAttacking) this.basicAttack();
            }
          }
        }
      }"""

new_march = """      } else if (mode === 'march') {
        vx = baseSpeed * 0.85; this.player.setFlipX(false);
        const target = this.nearestEnemy(480, true);
        if (target && target.active && target.x >= this.player.x - 50) {
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, target.x, target.y);
          let casted = false;
          if (gameState.afkSettings?.autoSkill && !isAttacking) {
            for (const sId of gameState.equippedSkillIds) if (sId && !(this.activeSkillCds[sId] > 0)) { if (this.isFlyingSword) this.isFlyingSword = false; this.castSkill(sId); casted = true; break; }
          }
          const hasBasicEquipped = gameState.equippedSkillIds.includes('basic_attack');
          if (!casted && hasBasicEquipped && dist <= 115 && !isAttacking) { if (this.isFlyingSword) this.isFlyingSword = false; this.basicAttack(); }
        }
      } else if (this.enemies.length > 0) {
        const target = this.nearestEnemy(3000, false);
        if (target && target.active) {
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, target.x, target.y);
          const onScreen = this.isEnemyOnScreen ? this.isEnemyOnScreen(target, 20) : dist <= 420;
          let casted = false;
          if (gameState.afkSettings?.autoSkill && onScreen && dist <= 420 && !isAttacking) {
            for (const sId of gameState.equippedSkillIds) if (sId && !(this.activeSkillCds[sId] > 0)) { if (this.isFlyingSword) this.isFlyingSword = false; this.player.setFlipX(target.x < this.player.x); this.castSkill(sId); casted = true; break; }
          }
          if (!casted) {
            const hasBasicEquipped = gameState.equippedSkillIds.includes('basic_attack');
            const hasSkillsEquipped = gameState.equippedSkillIds && gameState.equippedSkillIds.length > 0;
            const stopDist = hasBasicEquipped ? 85 : (hasSkillsEquipped ? 220 : 85);
            
            if (dist > stopDist) {
              if (gameState.afkSettings?.autoFly && !this.isFlyingSword) this.isFlyingSword = true;
              if (!isAttacking) { const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y); vx = Math.cos(angle) * baseSpeed; vy = Math.sin(angle) * baseSpeed; }
            } else if (dist > 85 && hasBasicEquipped) {
              if (this.isFlyingSword) this.isFlyingSword = false;
              if (!isAttacking) { const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y); vx = Math.cos(angle) * baseSpeed * 0.9; vy = Math.sin(angle) * baseSpeed * 0.9; }
            } else {
              if (this.isFlyingSword) this.isFlyingSword = false;
              vx = 0; vy = 0;
              this.player.setFlipX(target.x < this.player.x);
              if (hasBasicEquipped && !isAttacking) {
                this.basicAttack();
              }
            }
          }
        }
      }"""

text_norm = text.replace('\r\n', '\n')
old_norm = old_march.replace('\r\n', '\n')
new_norm = new_march.replace('\r\n', '\n')

if old_norm in text_norm:
    text_norm = text_norm.replace(old_norm, new_norm, 1)
    with open(r'H:\GOOGLE DRIVER\GAME\src\scenes\MainScene.js', 'w', encoding='utf-8') as f:
        f.write(text_norm)
    print("Updated MainScene.js auto-combat to strictly respect unequipped basic attack!")
else:
    print("Could not find old_march in MainScene.js")
