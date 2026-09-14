// ============================================================================
// THANH VÂN TIÊN VỰC - 3D GLB MONSTER ARENA WAVE SYSTEM
// 3 Real 3D Monsters from Assets:
// 1. blob_cactoro  (Tiểu Xương Rồng - Mob)
// 2. flying_dragon (Thanh Lôi Hỏa Long - Flying Elite)
// 3. big_demon     (Hắc Dạ Ma Tôn - Boss Monster)
// ============================================================================
(()=>{
  const scene = BABYLON.EngineStore.LastCreatedScene;
  if (!scene) return;

  // 3 Selected 3D Monsters from assets/enemies
  const catalog = [
    {
      id: 'blob_cactoro',
      enemyId: 'blob_cactoro',
      name: 'Tiểu Xương Rồng (Thổ)',
      role: 'mob',
      category: 'blob',
      modelPath: './assets/enemies/blob/cactoro.glb',
      hpMult: 1.0,
      speed: 2.6,
      scale: 1.15,
      yOffset: 0.0,
      attackRange: 2.2,
      attackAnim: 'Bite_Front',
      walkAnim: 'Walk',
      idleAnim: 'Idle',
      hitAnim: 'HitRecieve',
      deathAnim: 'Death'
    },
    {
      id: 'flying_dragon',
      enemyId: 'flying_dragon',
      name: 'Thanh Lôi Hỏa Long (Lôi)',
      role: 'elite',
      category: 'flying',
      modelPath: './assets/enemies/flying/dragon.glb',
      hpMult: 2.4,
      speed: 3.2,
      scale: 1.25,
      yOffset: 1.8,
      attackRange: 3.5,
      attackAnim: 'Headbutt',
      walkAnim: 'Fast_Flying',
      idleAnim: 'Flying_Idle',
      hitAnim: 'HitReact',
      deathAnim: 'Death'
    },
    {
      id: 'big_demon',
      enemyId: 'big_demon',
      name: 'Hắc Dạ Ma Tôn (Ma Vực)',
      role: 'boss',
      category: 'big',
      modelPath: './assets/enemies/big/demon.glb',
      hpMult: 7.5,
      speed: 2.0,
      scale: 1.45,
      yOffset: 0.0,
      attackRange: 3.2,
      attackAnim: 'Punch',
      walkAnim: 'Walk',
      idleAnim: 'Idle',
      hitAnim: 'HitReact',
      deathAnim: 'Death'
    }
  ];

  const lists = {
    mob: catalog.filter(x => x.role === 'mob'),
    elite: catalog.filter(x => x.role === 'elite'),
    boss: catalog.filter(x => x.role === 'boss')
  };

  // Preload 3 3D models into cache for instant zero-lag spawning
  if (window.EnemyLoader) {
    catalog.forEach(c => {
      window.EnemyLoader.loadModel(c.enemyId, scene).catch(e => {
        console.warn('[ArenaMonsters] Preload warning for', c.enemyId, e);
      });
    });
  }

  // Material cache for 3D floating HP bars
  const hpBgMat = new BABYLON.StandardMaterial('HpBgMat', scene);
  hpBgMat.diffuseColor = BABYLON.Color3.FromHexString('#111827');
  const hpFillMat = new BABYLON.StandardMaterial('HpFillMat', scene);
  hpFillMat.diffuseColor = BABYLON.Color3.FromHexString('#22c55e');
  hpFillMat.emissiveColor = BABYLON.Color3.FromHexString('#15803d');

  const monstersRoot = new BABYLON.TransformNode('MonstersContainer', scene);

  function spawnMonster3D(entry, isBoss, angle, dist, stage, centerPos = null) {
    const uid = 'Mob_' + entry.id + '_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const root = new BABYLON.TransformNode(uid, scene);
    root.parent = monstersRoot;

    const cx = centerPos ? centerPos.x : 0;
    const cz = centerPos ? centerPos.z : 0;
    const x = cx + Math.cos(angle) * dist;
    const z = cz + Math.sin(angle) * dist;
    const y = entry.yOffset || 0;
    root.position.set(x, y, z);

    const scale = (entry.scale || 1.0) * (isBoss ? 1.2 : 1.0);
    root.scaling.setAll(scale);

    // Calculate monster stats
    const baseHp = (isBoss ? (500 + stage * 75) : (entry.role === 'elite' ? (160 + stage * 22) : (50 + stage * 8))) * (entry.hpMult || 1.0);

    // 3D Floating HP Bar above monster head
    const hpBarRoot = new BABYLON.TransformNode('HpBarRoot_' + uid, scene);
    hpBarRoot.parent = root;
    hpBarRoot.position.set(0, isBoss ? 2.8 : (entry.category === 'flying' ? 2.2 : 1.7), 0);

    const hpBg = BABYLON.MeshBuilder.CreatePlane('HpBg_' + uid, { width: 1.4, height: 0.18 }, scene);
    hpBg.parent = hpBarRoot;
    hpBg.material = hpBgMat;
    hpBg.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    hpBg.isPickable = false;

    const hpFill = BABYLON.MeshBuilder.CreatePlane('HpFill_' + uid, { width: 1.35, height: 0.13 }, scene);
    hpFill.parent = hpBarRoot;
    hpFill.position.z = -0.01;
    hpFill.material = hpFillMat;
    hpFill.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    hpFill.isPickable = false;

    const monsterObj = {
      root: root,
      hpFill: hpFill,
      id: entry.id,
      name: entry.name,
      role: entry.role,
      category: entry.category,
      isBoss: isBoss,
      maxHp: Math.round(baseHp),
      hp: Math.round(baseHp),
      speed: entry.speed * (isBoss ? 0.95 : 1.0),
      attackRange: entry.attackRange || 2.2,
      attackCooldown: 1.2,
      lastAttack: 0,
      hurtTimer: 0,
      isDying: false,
      animCtrl: null,
      visualMeshes: [],
      currentState: 'walk',
      playAnim: function(name, loop = true, speed = 1.0, onEnd = null) {
        if (!this.animCtrl) return;
        this.animCtrl.play(name, loop, speed, onEnd);
      }
    };

    // Asynchronously instantiate real 3D GLB model and bind animation
    (async () => {
      try {
        let container = null;
        if (window.EnemyLoader) {
          container = await window.EnemyLoader.loadModel(entry.enemyId, scene);
        }
        if (!container) return;

        const instance = container.instantiateModelsToScene(
          (name) => `${name}_${uid}`,
          false,
          { doNotInstantiate: true }
        );

        // Parent all visual root nodes to root transform
        for (const rootMesh of instance.rootNodes) {
          rootMesh.parent = root;
          rootMesh.setEnabled(true);
        }

        // Add visual meshes to shadow generator & list
        const shadowGen = window.GameRuntime && window.GameRuntime.shadow;
        for (const rootMesh of instance.rootNodes) {
          rootMesh.getChildMeshes(false).forEach(m => {
            m.setEnabled(true);
            m.isVisible = true;
            m.isPickable = true;
            m.checkCollisions = false;
            monsterObj.visualMeshes.push(m);
            if (shadowGen && entry.category !== 'flying') {
              shadowGen.addShadowCaster(m);
            }
          });
        }

        // Initialize Animation Controller
        if (window.EnemyAnimationController) {
          monsterObj.animCtrl = new window.EnemyAnimationController(instance.animationGroups);
          // Play initial moving/flying animation
          const initialAnim = entry.walkAnim || 'walk';
          monsterObj.animCtrl.play(initialAnim, true, 1.0);
        }
      } catch (err) {
        console.error('[ArenaMonsters] Error instantiating 3D model for:', entry.id, err);
      }
    })();

    return monsterObj;
  }

  function chooseCatalogEntry(isBoss, stage, serial) {
    if (isBoss) return lists.boss[0] || catalog[2];
    const s = Math.max(1, stage || 1);
    // Alternate between Small Mob (blob_cactoro) and Flying Elite (flying_dragon)
    const isElite = (s >= 3 && serial % 3 === 0) || (serial % 4 === 0);
    return isElite ? lists.elite[0] : lists.mob[0];
  }

  window.ArenaMonsterEngine = {
    spawnMonster3D,
    chooseCatalogEntry,
    catalog,
    lists
  };

  console.info('Arena Monster Engine: Đã kích hoạt 3 mẫu quái vật 3D thực thụ từ Assets (Cactoro, Dragon, Demon)!');
})();