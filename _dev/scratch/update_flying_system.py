import os

def update_main_scene():
    with open('src/scenes/MainScene.js', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Preload flying enemies
    old_enemy_preload = """    for (let i = 1; i <= 16; i++) {
      this.load.image(`enemy_${i}_idle_0`, `${A}characters/enemies/ground/enemy_${i}/idle_0.png`);
      this.load.image(`enemy_${i}_idle_1`, `${A}characters/enemies/ground/enemy_${i}/idle_1.png`);
      for (let r = 0; r < 4; r++) this.load.image(`enemy_${i}_run_${r}`, `${A}characters/enemies/ground/enemy_${i}/run_${r}.png`);
      for (let a = 0; a < 4; a++) this.load.image(`enemy_${i}_attack_${a}`, `${A}characters/enemies/ground/enemy_${i}/attack_${a}.png`);
    }"""

    new_enemy_preload = """    for (let i = 1; i <= 16; i++) {
      this.load.image(`enemy_${i}_idle_0`, `${A}characters/enemies/ground/enemy_${i}/idle_0.png`);
      this.load.image(`enemy_${i}_idle_1`, `${A}characters/enemies/ground/enemy_${i}/idle_1.png`);
      for (let r = 0; r < 4; r++) this.load.image(`enemy_${i}_run_${r}`, `${A}characters/enemies/ground/enemy_${i}/run_${r}.png`);
      for (let a = 0; a < 4; a++) this.load.image(`enemy_${i}_attack_${a}`, `${A}characters/enemies/ground/enemy_${i}/attack_${a}.png`);
    }

    for (let i = 1; i <= 10; i++) {
      this.load.image(`enemy_fly_${i}_idle_0`, `${A}characters/enemies/flying/enemy_${i}/idle_0.png`);
      this.load.image(`enemy_fly_${i}_idle_1`, `${A}characters/enemies/flying/enemy_${i}/idle_1.png`);
      for (let r = 0; r < 4; r++) this.load.image(`enemy_fly_${i}_run_${r}`, `${A}characters/enemies/flying/enemy_${i}/run_${r}.png`);
      for (let a = 0; a < 4; a++) this.load.image(`enemy_fly_${i}_attack_${a}`, `${A}characters/enemies/flying/enemy_${i}/attack_${a}.png`);
    }"""

    if old_enemy_preload in content:
        content = content.replace(old_enemy_preload, new_enemy_preload)
        print("Updated enemy preload in MainScene.js")
    else:
        print("Could not find old_enemy_preload in MainScene.js")

    # 2. Create animations for flying enemies & NPC fly
    old_anims = """    for (let i = 1; i <= 16; i++) {
      const t = 'enemy_' + i;
      if (!this.anims.exists('e_' + t + '_idle')) this.anims.create({ key: 'e_' + t + '_idle', frames: [{ key: `${t}_idle_0` }, { key: `${t}_idle_1` }], frameRate: 4, repeat: -1 });
      if (!this.anims.exists('e_' + t + '_run')) this.anims.create({ key: 'e_' + t + '_run', frames: [0, 1, 2, 3].map(r => ({ key: `${t}_run_${r}` })), frameRate: 8, repeat: -1 });
      if (!this.anims.exists('e_' + t + '_attack')) this.anims.create({ key: 'e_' + t + '_attack', frames: [0, 1, 2, 3].map(a => ({ key: `${t}_attack_${a}` })), frameRate: 10, repeat: 0 });
    }
    ['dai_han', 'tho_san'].forEach(npcType => {
      if (!this.anims.exists(`${npcType}_idle`)) this.anims.create({ key: `${npcType}_idle`, frames: [1,2,3,4,5,6,7,8].map(f => ({ key: `${npcType}_idle_${f}` })), frameRate: 8, repeat: -1 });
      if (!this.anims.exists(`${npcType}_run`)) this.anims.create({ key: `${npcType}_run`, frames: [1,2,3,4,5,6,7,8].map(f => ({ key: `${npcType}_run_${f}` })), frameRate: 12, repeat: -1 });
      if (!this.anims.exists(`${npcType}_attack`)) this.anims.create({ key: `${npcType}_attack`, frames: [1,2,3,4,5,6,7,8].map(f => ({ key: `${npcType}_attack_${f}` })), frameRate: 14, repeat: 0 });
    });"""

    new_anims = """    for (let i = 1; i <= 16; i++) {
      const t = 'enemy_' + i;
      if (!this.anims.exists('e_' + t + '_idle')) this.anims.create({ key: 'e_' + t + '_idle', frames: [{ key: `${t}_idle_0` }, { key: `${t}_idle_1` }], frameRate: 4, repeat: -1 });
      if (!this.anims.exists('e_' + t + '_run')) this.anims.create({ key: 'e_' + t + '_run', frames: [0, 1, 2, 3].map(r => ({ key: `${t}_run_${r}` })), frameRate: 8, repeat: -1 });
      if (!this.anims.exists('e_' + t + '_attack')) this.anims.create({ key: 'e_' + t + '_attack', frames: [0, 1, 2, 3].map(a => ({ key: `${t}_attack_${a}` })), frameRate: 10, repeat: 0 });
    }
    for (let i = 1; i <= 10; i++) {
      const t = 'enemy_fly_' + i;
      if (!this.anims.exists('e_' + t + '_idle')) this.anims.create({ key: 'e_' + t + '_idle', frames: [{ key: `${t}_idle_0` }, { key: `${t}_idle_1` }], frameRate: 5, repeat: -1 });
      if (!this.anims.exists('e_' + t + '_run')) this.anims.create({ key: 'e_' + t + '_run', frames: [0, 1, 2, 3].map(r => ({ key: `${t}_run_${r}` })), frameRate: 9, repeat: -1 });
      if (!this.anims.exists('e_' + t + '_attack')) this.anims.create({ key: 'e_' + t + '_attack', frames: [0, 1, 2, 3].map(a => ({ key: `${t}_attack_${a}` })), frameRate: 11, repeat: 0 });
    }
    ['dai_han', 'tho_san'].forEach(npcType => {
      if (!this.anims.exists(`${npcType}_idle`)) this.anims.create({ key: `${npcType}_idle`, frames: [1,2,3,4,5,6,7,8].map(f => ({ key: `${npcType}_idle_${f}` })), frameRate: 8, repeat: -1 });
      if (!this.anims.exists(`${npcType}_run`)) this.anims.create({ key: `${npcType}_run`, frames: [1,2,3,4,5,6,7,8].map(f => ({ key: `${npcType}_run_${f}` })), frameRate: 12, repeat: -1 });
      if (!this.anims.exists(`${npcType}_attack`)) this.anims.create({ key: `${npcType}_attack`, frames: [1,2,3,4,5,6,7,8].map(f => ({ key: `${npcType}_attack_${f}` })), frameRate: 14, repeat: 0 });
      if (!this.anims.exists(`${npcType}_fly`)) this.anims.create({ key: `${npcType}_fly`, frames: [1,2,3,4,5,6,7,8].map(f => ({ key: `${npcType}_fly_${f}` })), frameRate: 10, repeat: -1 });
    });"""

    if old_anims in content:
        content = content.replace(old_anims, new_anims)
        print("Updated anims in MainScene.js")
    else:
        print("Could not find old_anims in MainScene.js")

    # 3. Enemy loop animation prefix
    old_enemy_anim = "if (!isEnemyAttacking) { const moving = Math.abs(evx) > 3 || Math.abs(evy) > 3; const animKey = 'e_enemy_' + enemy.enemySpriteNum + (moving ? '_run' : '_idle'); if (enemy.anims?.currentAnim?.key !== animKey) enemy.play(animKey, true); }"
    new_enemy_anim = "if (!isEnemyAttacking) { const moving = Math.abs(evx) > 3 || Math.abs(evy) > 3; const pfx = enemy.isFlying ? ('e_enemy_fly_' + enemy.enemySpriteNum) : ('e_enemy_' + enemy.enemySpriteNum); const animKey = pfx + (moving ? '_run' : '_idle'); if (enemy.anims?.currentAnim?.key !== animKey && this.anims.exists(animKey)) enemy.play(animKey, true); }"

    if old_enemy_anim in content:
        content = content.replace(old_enemy_anim, new_enemy_anim)
        print("Updated enemy loop anim in MainScene.js")
    else:
        print("Could not find old_enemy_anim in MainScene.js")

    with open('src/scenes/MainScene.js', 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)

update_main_scene()
