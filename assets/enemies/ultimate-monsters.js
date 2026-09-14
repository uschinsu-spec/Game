// ============================================================================
// THANH VÂN TIÊN VỰC - MULTI-MONSTER 360° ARENA WAVE SPAWNING SYSTEM
// ============================================================================
(()=>{
  const scene = BABYLON.EngineStore.LastCreatedScene;
  if (!scene) return;

  const catalog = [
    { id: 'frog', name: 'Linh Oa (Mộc)', role: 'mob', color: '#44bb66', emissive: '#114422', shape: 'crystal', hpMult: 1.0, speed: 2.4 },
    { id: 'birb', name: 'Yêu Điểu (Phong)', role: 'mob', color: '#55ccdd', emissive: '#114455', shape: 'orb', hpMult: 0.85, speed: 3.2 },
    { id: 'fish', name: 'Thủy Yêu (Thủy)', role: 'mob', color: '#3388ee', emissive: '#0b2b55', shape: 'crystal', hpMult: 1.1, speed: 2.2 },
    { id: 'cactoro', name: 'Mộc Linh (Thổ)', role: 'mob', color: '#cc9944', emissive: '#443311', shape: 'box', hpMult: 1.3, speed: 2.0 },
    { id: 'alien', name: 'Dị Linh (Lôi)', role: 'mob', color: '#bb55ff', emissive: '#3b1155', shape: 'orb', hpMult: 0.9, speed: 3.0 },
    { id: 'monkroose', name: 'Sơn Yêu Tinh Anh', role: 'elite', color: '#dd7733', emissive: '#55220b', shape: 'golem', hpMult: 2.2, speed: 2.0 },
    { id: 'tribal', name: 'Man Yêu Tinh Anh', role: 'elite', color: '#dd4466', emissive: '#551122', shape: 'golem', hpMult: 2.5, speed: 1.9 },
    { id: 'orc', name: 'Cự Nha Yêu Tinh Anh', role: 'elite', color: '#9944cc', emissive: '#331155', shape: 'golem', hpMult: 2.8, speed: 1.8 },
    { id: 'orc-skull', name: 'Khô Lâu Yêu Vương', role: 'boss', color: '#ee3344', emissive: '#771122', shape: 'demon', hpMult: 6.5, speed: 1.6 },
    { id: 'demon', name: 'Xích Ma Vương', role: 'boss', color: '#ff4422', emissive: '#88110b', shape: 'demon', hpMult: 8.0, speed: 1.5 },
    { id: 'blue-demon', name: 'U Lam Ma Vương', role: 'boss', color: '#2277ff', emissive: '#0b2b88', shape: 'demon', hpMult: 7.5, speed: 1.6 },
    { id: 'yeti', name: 'Hàn Sơn Yêu Vương', role: 'boss', color: '#44ddff', emissive: '#115577', shape: 'demon', hpMult: 9.0, speed: 1.4 }
  ];

  const lists = {
    mob: catalog.filter(x => x.role === 'mob'),
    elite: catalog.filter(x => x.role === 'elite'),
    boss: catalog.filter(x => x.role === 'boss')
  };

  // Material cache
  const mats = new Map();
  function getMaterial(colorHex, emissiveHex) {
    const key = colorHex + '_' + emissiveHex;
    if (mats.has(key)) return mats.get(key);
    const m = new BABYLON.StandardMaterial('EnemyMat_' + key, scene);
    m.diffuseColor = BABYLON.Color3.FromHexString(colorHex);
    m.emissiveColor = BABYLON.Color3.FromHexString(emissiveHex);
    m.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    mats.set(key, m);
    return m;
  }

  const hurtMat = new BABYLON.StandardMaterial('EnemyHurtMat', scene);
  hurtMat.diffuseColor = BABYLON.Color3.FromHexString('#ff3333');
  hurtMat.emissiveColor = BABYLON.Color3.FromHexString('#ff6666');

  const hpBgMat = new BABYLON.StandardMaterial('HpBgMat', scene);
  hpBgMat.diffuseColor = BABYLON.Color3.FromHexString('#111827');
  const hpFillMat = new BABYLON.StandardMaterial('HpFillMat', scene);
  hpFillMat.diffuseColor = BABYLON.Color3.FromHexString('#22c55e');
  hpFillMat.emissiveColor = BABYLON.Color3.FromHexString('#15803d');

  const monstersRoot = new BABYLON.TransformNode('MonstersContainer', scene);

  function spawnMonster3D(entry, isBoss, angle, dist, stage, centerPos = null) {
    const root = new BABYLON.TransformNode('Mob_' + Date.now() + '_' + Math.floor(Math.random() * 1000), scene);
    root.parent = monstersRoot;

    const cx = centerPos ? centerPos.x : 0;
    const cz = centerPos ? centerPos.z : 0;
    const x = cx + Math.cos(angle) * dist;
    const z = cz + Math.sin(angle) * dist;
    root.position.set(x, 0.5, z);

    const scale = isBoss ? 1.75 : (entry.role === 'elite' ? 1.35 : 1.0);
    root.scaling.setAll(scale);

    const baseMat = getMaterial(entry.color, entry.emissive);
    const meshes = [];

    // Body Mesh
    if (entry.shape === 'demon') {
      const body = BABYLON.MeshBuilder.CreateBox('BossBody', { width: 1.3, height: 1.8, depth: 1.0 }, scene);
      body.position.y = 1.0; body.material = baseMat; body.parent = root;
      meshes.push(body);
      // Horns
      [-1, 1].forEach(s => {
        const horn = BABYLON.MeshBuilder.CreateCylinder('Horn_' + s, { height: 0.8, diameterTop: 0.05, diameterBottom: 0.25 }, scene);
        horn.position.set(s * 0.45, 2.0, 0); horn.rotation.z = -s * 0.5; horn.material = hurtMat; horn.parent = root;
        meshes.push(horn);
      });
    } else if (entry.shape === 'golem' || entry.shape === 'box') {
      const body = BABYLON.MeshBuilder.CreateBox('MobBody', { width: 1.1, height: 1.3, depth: 1.0 }, scene);
      body.position.y = 0.75; body.material = baseMat; body.parent = root;
      meshes.push(body);
    } else {
      const body = BABYLON.MeshBuilder.CreateSphere('MobBody', { diameter: 1.1, segments: 8 }, scene);
      body.position.y = 0.7; body.material = baseMat; body.parent = root;
      meshes.push(body);
      // Orbiting energy crystal
      const orb = BABYLON.MeshBuilder.CreateSphere('MobOrb', { diameter: 0.35, segments: 4 }, scene);
      orb.position.set(0.65, 0.9, 0); orb.material = hurtMat; orb.parent = root;
      meshes.push(orb);
    }

    // 3D Floating HP Bar above monster head
    const hpBarRoot = new BABYLON.TransformNode('HpBarRoot', scene);
    hpBarRoot.parent = root;
    hpBarRoot.position.set(0, isBoss ? 2.6 : 1.8, 0);

    const hpBg = BABYLON.MeshBuilder.CreatePlane('HpBg', { width: 1.4, height: 0.18 }, scene);
    hpBg.parent = hpBarRoot;
    hpBg.material = hpBgMat;
    hpBg.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    hpBg.isPickable = false;

    const hpFill = BABYLON.MeshBuilder.CreatePlane('HpFill', { width: 1.35, height: 0.13 }, scene);
    hpFill.parent = hpBarRoot;
    hpFill.position.z = -0.01;
    hpFill.material = hpFillMat;
    hpFill.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    hpFill.isPickable = false;

    // Calculate monster stats
    const baseHp = (entry.role === 'boss' ? (480 + stage * 65) : (50 + stage * 8)) * entry.hpMult;

    const monsterObj = {
      root: root,
      meshes: meshes,
      baseMat: baseMat,
      hpFill: hpFill,
      id: entry.id,
      name: entry.name,
      role: entry.role,
      isBoss: isBoss,
      maxHp: Math.round(baseHp),
      hp: Math.round(baseHp),
      speed: entry.speed * (isBoss ? 0.9 : 1.0),
      attackCooldown: 1.2,
      lastAttack: 0,
      hurtTimer: 0,
      isDying: false
    };

    return monsterObj;
  }

  function chooseCatalogEntry(isBoss, stage, serial) {
    const s = Math.max(1, stage || 1);
    if (isBoss) return lists.boss[(s - 1) % lists.boss.length];
    const isElite = s >= 5 && (serial % 4 === 0);
    const pool = isElite ? lists.elite : lists.mob;
    return pool[(s * 3 + serial) % pool.length];
  }

  window.ArenaMonsterEngine = {
    spawnMonster3D,
    chooseCatalogEntry,
    catalog,
    lists
  };

  console.info('Arena Monster Engine: Sẵn sàng điều khiển quái vật 360 độ!');
})();