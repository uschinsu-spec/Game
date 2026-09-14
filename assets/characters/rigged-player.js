// Procedural Placeholder Player - 100% Local & Zero External Network Dependencies
(()=>{
  const scene = BABYLON.EngineStore.LastCreatedScene;
  if (!scene || !window.GameRuntime) return;

  const player = window.GameRuntime.player;
  const bodyRoot = scene.getTransformNodeByName('SkeletonRoot') || player;
  
  // Materials
  const mat = (name, color, emissive) => {
    const m = new BABYLON.StandardMaterial(name, scene);
    m.diffuseColor = BABYLON.Color3.FromHexString(color);
    m.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    if (emissive) m.emissiveColor = BABYLON.Color3.FromHexString(emissive);
    return m;
  };

  const skinMat = mat('ph_Skin', '#f5d3b3');
  const robeMat = mat('ph_Robe', '#3a8ee6', '#103055');
  const beltMat = mat('ph_Belt', '#d4af37', '#554410');
  const hairMat = mat('ph_Hair', '#222228');
  const bladeMat = mat('ph_Blade', '#66e0ff', '#1a6088');
  const hiltMat = mat('ph_Hilt', '#e6c875', '#443510');

  // Root Placeholder Model
  const modelRoot = new BABYLON.TransformNode('PlaceholderPlayerRoot', scene);
  modelRoot.parent = bodyRoot;
  modelRoot.position.set(0, 0, 0);

  // 1. Torso / Robe
  const torso = BABYLON.MeshBuilder.CreateCylinder('PlayerTorso', { height: 1.1, diameterTop: 0.55, diameterBottom: 0.75, tessellation: 12 }, scene);
  torso.parent = modelRoot;
  torso.position.set(0, 0.95, 0);
  torso.material = robeMat;

  // Belt
  const belt = BABYLON.MeshBuilder.CreateCylinder('PlayerBelt', { height: 0.16, diameter: 0.68, tessellation: 12 }, scene);
  belt.parent = modelRoot;
  belt.position.set(0, 0.85, 0);
  belt.material = beltMat;

  // 2. Head
  const head = BABYLON.MeshBuilder.CreateSphere('PlayerHead', { diameter: 0.52, segments: 10 }, scene);
  head.parent = modelRoot;
  head.position.set(0, 1.72, 0);
  head.material = skinMat;

  // Hair / Topknot (Búi tóc tu tiên)
  const hair = BABYLON.MeshBuilder.CreateSphere('PlayerHair', { diameter: 0.48, segments: 8 }, scene);
  hair.parent = head;
  hair.position.set(0, 0.12, -0.06);
  hair.material = hairMat;

  const topknot = BABYLON.MeshBuilder.CreateCylinder('PlayerTopknot', { height: 0.28, diameterTop: 0.18, diameterBottom: 0.24, tessellation: 8 }, scene);
  topknot.parent = head;
  topknot.position.set(0, 0.38, -0.05);
  topknot.material = hairMat;

  // 3. Floating Xianxia Sword (Phi kiếm hộ thể & trảm yêu)
  const swordRoot = new BABYLON.TransformNode('PlayerSwordRoot', scene);
  swordRoot.parent = modelRoot;
  swordRoot.position.set(0.65, 1.15, 0.2);

  const blade = BABYLON.MeshBuilder.CreateBox('PlayerSwordBlade', { width: 0.08, height: 1.15, depth: 0.03 }, scene);
  blade.parent = swordRoot;
  blade.position.set(0, 0.35, 0);
  blade.material = bladeMat;

  const guard = BABYLON.MeshBuilder.CreateBox('PlayerSwordGuard', { width: 0.28, height: 0.06, depth: 0.08 }, scene);
  guard.parent = swordRoot;
  guard.position.set(0, -0.22, 0);
  guard.material = hiltMat;

  const handle = BABYLON.MeshBuilder.CreateCylinder('PlayerSwordHandle', { height: 0.28, diameter: 0.06, tessellation: 8 }, scene);
  handle.parent = swordRoot;
  handle.position.set(0, -0.38, 0);
  handle.material = hairMat;

  // 4. Xianxia Energy Shield Bubble (Hộ Thể Kim Quang)
  const shieldMat = new BABYLON.StandardMaterial('PlayerShieldMat', scene);
  shieldMat.diffuseColor = BABYLON.Color3.FromHexString('#38bdf8');
  shieldMat.emissiveColor = BABYLON.Color3.FromHexString('#0ea5e9');
  shieldMat.alpha = 0.28;
  shieldMat.backFaceCulling = false;

  const shieldSphere = BABYLON.MeshBuilder.CreateSphere('PlayerShieldBubble', { diameter: 2.35, segments: 12 }, scene);
  shieldSphere.parent = modelRoot;
  shieldSphere.position.set(0, 1.05, 0);
  shieldSphere.material = shieldMat;
  shieldSphere.isPickable = false;

  // Ground Qi Circle (Linh Trận Dưới Chân)
  const qiCircleMat = new BABYLON.StandardMaterial('PlayerQiCircleMat', scene);
  qiCircleMat.diffuseColor = BABYLON.Color3.FromHexString('#fbbf24');
  qiCircleMat.emissiveColor = BABYLON.Color3.FromHexString('#f59e0b');
  qiCircleMat.alpha = 0.45;
  const qiCircle = BABYLON.MeshBuilder.CreateDisc('PlayerQiCircle', { radius: 1.4, tessellation: 24 }, scene);
  qiCircle.parent = modelRoot;
  qiCircle.position.set(0, 0.025, 0);
  qiCircle.rotation.x = Math.PI / 2;
  qiCircle.material = qiCircleMat;
  qiCircle.isPickable = false;

  // Shadows
  const sun = scene.lights.find(l => l.name === 'sun');
  const shadow = sun?.getShadowGenerator?.() || null;
  [torso, head, hair, blade, guard].forEach(m => {
    m.isPickable = false;
    m.receiveShadows = true;
    if (shadow) shadow.addShadowCaster(m);
  });

  window.__RIGGED_PLAYER_ACTIVE__ = true;
  window.PLAYER_MOTION_STATE = 'idle';

  // Procedural Animation Loop
  let swordSlashTime = 0;
  let targetAngle = 0;

  window.setPlayerTargetAngle = function(angle) {
    targetAngle = angle;
  };

  // Flying Sword Projectiles Pool
  const projectiles = [];
  const projMat = mat('SwordProjMat', '#38bdf8', '#0284c7');

  window.spawnSwordSlashProjectile = function(fromPos, toPos) {
    const proj = BABYLON.MeshBuilder.CreateBox('SwordProj_' + Date.now(), { width: 0.12, height: 0.04, depth: 0.8 }, scene);
    proj.position.copyFrom(fromPos);
    proj.position.y = 1.0;
    proj.material = projMat;
    proj.isPickable = false;

    const dir = toPos.subtract(fromPos).normalize();
    proj.rotation.y = Math.atan2(dir.x, dir.z);

    projectiles.push({
      mesh: proj,
      dir: dir,
      life: 0.90,
      speed: 42.0
    });
  };

  scene.onBeforeRenderObservable.add(() => {
    const dt = Math.max(0.001, Math.min(0.05, scene.getEngine().getDeltaTime() / 1000));
    const now = performance.now() * 0.001;

    // Smoothly rotate player towards current target monster
    if (typeof targetAngle === 'number') {
      let diff = targetAngle - player.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      player.rotation.y += diff * Math.min(1.0, dt * 12);
    }

    // Shield pulse & ground circle spin
    shieldSphere.scaling.setAll(1.0 + Math.sin(now * 3.5) * 0.04);
    qiCircle.rotation.z = now * 0.8;

    // Update active sword projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.life -= dt;
      p.mesh.position.addInPlace(p.dir.scale(p.speed * dt));
      if (p.life <= 0) {
        p.mesh.dispose();
        projectiles.splice(i, 1);
      }
    }

    // Attack State, Running Movement, or Combat Idle
    if (typeof attackT !== 'undefined' && attackT > 0) {
      attackT = Math.max(0, attackT - dt);
      swordSlashTime += dt * 16;
      window.PLAYER_MOTION_STATE = 'attack';

      // Sword slash swing animation
      swordRoot.position.set(
        0.2 + Math.sin(swordSlashTime) * 0.8,
        1.1 + Math.cos(swordSlashTime) * 0.4,
        0.5 + Math.sin(swordSlashTime) * 0.6
      );
      swordRoot.rotation.x = Math.PI * 0.4 + Math.sin(swordSlashTime) * 1.4;
      swordRoot.rotation.y = Math.sin(swordSlashTime * 1.5) * 0.9;
      swordRoot.rotation.z = -0.4;
      torso.rotation.y = Math.sin(swordSlashTime) * 0.4;
    } else if (window.PLAYER_MOTION_STATE === 'moving' || window.isPlayerMoving) {
      // Running / Dodging Animation (Tu chân khinh công ngự phong)
      const runBob = Math.abs(Math.sin(now * 14)) * 0.08;
      torso.position.y = 0.95 + runBob;
      head.position.y = 1.72 + runBob;
      torso.rotation.x = 0.14; // Forward aerodynamic tilt
      torso.rotation.z = Math.sin(now * 14) * 0.05;
      torso.rotation.y = 0;

      // Sword trails gracefully beside/behind player like a flying sword
      swordRoot.position.set(0.48, 1.12 + Math.sin(now * 10) * 0.05, -0.32);
      swordRoot.rotation.x = 0.52 + Math.sin(now * 8) * 0.08;
      swordRoot.rotation.y = -0.15;
      swordRoot.rotation.z = -0.1;
    } else {
      // Idle Breathing in Combat Stance
      window.PLAYER_MOTION_STATE = 'idle';
      const idleBob = Math.sin(now * 3.2) * 0.035;
      torso.position.y = 0.95 + idleBob;
      head.position.y = 1.72 + idleBob;
      torso.rotation.x = 0;
      torso.rotation.z = 0;
      torso.rotation.y = 0;

      // Sword hovering ready in front-right
      swordRoot.position.set(0.55, 1.2 + Math.sin(now * 4) * 0.06, 0.25);
      swordRoot.rotation.x = 0.25 + Math.sin(now * 2) * 0.05;
      swordRoot.rotation.y = Math.sin(now * 1.5) * 0.1;
      swordRoot.rotation.z = -0.2;
    }
  });

  console.info('Placeholder Player: Đã cấu hình Đấu Trường Trảm Yêu (Central Arena Ready).');
})();