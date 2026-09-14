// ============================================================================
// THANH VÂN TIÊN VỰC - 360° ARENA WAVE DEFENSE & IDLE CULTIVATION ENGINE
// Central Player, Isometric Top-Down Camera, 360-Degree Surrounding Monster Swarms
// ============================================================================
(()=>{
  const SAVE = 'thanh-van-solo-idle-v2', OFFLINE_CAP = 12 * 3600;
  const legacy = JSON.parse(localStorage.getItem('thanh-van-idle-v1') || '{}');
  const state = Object.assign({ stage: 1, realm: 0, layer: 1, xp: 0, stones: 0, power: 120, lastSeen: Date.now() }, legacy, JSON.parse(localStorage.getItem(SAVE) || '{}'));
  const realms = ['Luyện Khí', 'Trúc Cơ', 'Kim Đan', 'Nguyên Anh', 'Hóa Thần', 'Luyện Hư', 'Hợp Thể', 'Đại Thừa', 'Độ Kiếp', 'Phi Thăng'];
  const zones = ['Thanh Vân Sơn', 'Trúc Hải', 'Vạn Yêu Cốc', 'Huyền Thiên Thành', 'Ma Vực', 'Thiên Kiếm Sơn'];
  
  const stageEl = document.getElementById('idleStage');
  const realmEl = document.getElementById('realmLabel');
  const expRateEl = document.getElementById('expRate');
  const goldRateEl = document.getElementById('goldRate');
  const stageCounterEl = document.getElementById('stageCounter');
  const stageChestEl = document.getElementById('stageChest');
  const segments = document.querySelectorAll('#stageSegments .ulala-segment');
  
  const bossBtn = document.getElementById('bossChallenge');
  const offline = document.getElementById('offlineReward');
  const targetPanel = document.getElementById('targetPanel');
  const targetName = document.getElementById('targetName');
  const targetHp = document.getElementById('targetHp');
  const targetElement = document.getElementById('targetElement');
  
  const playerHpBar = document.querySelector('.ulala-hp-gauge i');
  const coinEl = document.getElementById('coinCount');
  const jadeEl = document.getElementById('jadeCount');
  const totalPowerEl = document.getElementById('totalPower');
  const levelBadgeEl = document.getElementById('playerLevelBadge');
  const skillSlots = document.querySelectorAll('.ulala-skill-card');
  const castGauge = document.getElementById('castGauge');
  const quickBattleBtn = document.getElementById('quickBattleBtn');
  const hud = document.getElementById('hud');

  let maxPlayerHp = 100, playerHp = 100;
  let kills = 0, isBossBattle = false, bossTimer = 0;
  let activeMonsters = [];
  let spawnSerial = 0;
  let lastSkillCast = 0;
  let currentSkillIndex = 0;

  const zone = () => zones[Math.floor((state.stage - 1) / 20) % zones.length];
  const xpPerMin = () => Math.floor(18 + state.stage * 2.4);
  const stonesPerMin = () => Math.floor(8 + state.stage * 1.15);

  const save = () => { state.lastSeen = Date.now(); localStorage.setItem(SAVE, JSON.stringify(state)); };
  window.IdleCore = { state, save, refresh };

  // Floating Damage Numbers
  function spawnDamage(val, isCrit, pos3D) {
    if (!hud) return;
    const el = document.createElement('div');
    el.className = 'damage-number' + (isCrit ? ' crit' : '');
    el.textContent = (isCrit ? '⚡CRIT! ' : '-') + Math.round(val).toLocaleString();
    
    // Project 3D position to 2D screen coordinates
    let screenX = 50 + (Math.random() * 10 - 5);
    let screenY = 45 + (Math.random() * 8 - 4);
    if (pos3D && scene.activeCamera) {
      const p = BABYLON.Vector3.Project(pos3D, BABYLON.Matrix.Identity(), scene.getTransformMatrix(), scene.activeCamera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight()));
      if (p) {
        screenX = (p.x / engine.getRenderWidth()) * 100;
        screenY = (p.y / engine.getRenderHeight()) * 100 - 4;
      }
    }

    el.style.left = Math.max(10, Math.min(90, screenX)) + '%';
    el.style.top = Math.max(15, Math.min(85, screenY)) + '%';
    hud.appendChild(el);
    setTimeout(() => el.remove(), 800);
  }

  function toast(x) {
    let e = document.getElementById('lootToast');
    if (!e) {
      e = document.createElement('div');
      e.id = 'lootToast';
      e.className = 'loot-toast';
      hud.appendChild(e);
    }
    e.textContent = x;
    e.classList.add('show');
    clearTimeout(e.h);
    e.h = setTimeout(() => e.classList.remove('show'), 1200);
  }

  function refresh() {
    if (stageEl) stageEl.textContent = `${zone()} ${state.stage}`;
    if (realmEl) realmEl.textContent = `${realms[state.realm]} · ${state.layer}`;
    if (expRateEl) expRateEl.textContent = `EXP +${xpPerMin()}/p`;
    if (goldRateEl) goldRateEl.textContent = `Đá +${stonesPerMin()}/p`;
    if (stageCounterEl) stageCounterEl.textContent = `${kills}/10`;
    
    // Segmented 10-step progress ticks
    segments.forEach((seg, i) => {
      if (i < kills) seg.classList.add('active');
      else seg.classList.remove('active');
    });

    if (stageChestEl) {
      if (kills >= 10) stageChestEl.classList.add('ready');
      else stageChestEl.classList.remove('ready');
    }

    if (levelBadgeEl) levelBadgeEl.textContent = state.stage;
    
    const bonus = typeof window.getProgressionPower === 'function' ? window.getProgressionPower() : 0;
    if (totalPowerEl) totalPowerEl.textContent = Math.round(state.power + bonus).toLocaleString();

    if (bossBtn) {
      bossBtn.disabled = isBossBattle;
      const label = bossBtn.querySelector('.label');
      if (label) label.textContent = isBossBattle ? 'CHIẾN' : 'BOSS';
    }
    if (coinEl) coinEl.textContent = Math.floor(state.stones).toLocaleString();
    if (jadeEl) jadeEl.textContent = Math.floor(state.xp).toLocaleString();

    // Skill Levels
    const prog = window.SoloProgression;
    if (prog) {
      document.querySelectorAll('.ulala-skill-lv').forEach(el => {
        el.textContent = `Lv.${prog.skill}`;
      });
    }
  }

  function cultivate(xp, stones) {
    state.xp += xp; state.stones += stones;
    let guard = 20;
    while (guard--) {
      const need = 160 * (state.realm + 1) * state.layer;
      if (state.xp < need) break;
      state.xp -= need;
      state.layer++;
      state.power *= 1.13;
      if (state.layer > 9) {
        state.layer = 1;
        state.realm = Math.min(realms.length - 1, state.realm + 1);
      }
    }
    refresh();
  }

  function grantOffline() {
    const now = Date.now(), seconds = Math.min(OFFLINE_CAP, Math.max(0, (now - (state.lastSeen || now)) / 1000));
    if (seconds < 90) return;
    const xp = seconds * xpPerMin() / 60, stones = seconds * stonesPerMin() / 60;
    state.xp += xp; state.stones += stones;
    if (offline) {
      offline.innerHTML = `<strong>Bế quan ${Math.floor(seconds / 3600)}g ${Math.floor(seconds % 3600 / 60)}p</strong><span>+${Math.floor(xp).toLocaleString()} EXP</span><span>+${Math.floor(stones).toLocaleString()} Linh thạch</span><button>Nhận Thưởng</button>`;
      offline.classList.add('show');
      offline.querySelector('button').onclick = () => offline.classList.remove('show');
    }
    save(); refresh();
  }
  grantOffline();

  // Quick Battle 2-Hour Fast Forward
  if (quickBattleBtn) {
    quickBattleBtn.onclick = () => {
      const xp = xpPerMin() * 120, stones = stonesPerMin() * 120;
      cultivate(xp, stones);
      toast(`⚡ Đấu Nhanh 2h: +${xp.toLocaleString()} EXP, +${stones.toLocaleString()} Đá!`);
      save();
    };
  }

  // Floating Spirit Pet
  const petRoot = new BABYLON.TransformNode('SoloSpiritPet', scene);
  petRoot.parent = player; petRoot.position.set(-1.1, 0.25, 0.75);
  const petMat = mat('soloPet', '#77c7cf');
  const petBody = BABYLON.MeshBuilder.CreateSphere('SoloPetBody', { diameter: 0.55, segments: 8 }, scene);
  petBody.parent = petRoot; petBody.position.y = 0.45; petBody.material = petMat;
  const petHead = BABYLON.MeshBuilder.CreateSphere('SoloPetHead', { diameter: 0.38, segments: 8 }, scene);
  petHead.parent = petRoot; petHead.position.set(0, 0.72, -0.28); petHead.material = petMat;

  window.setPetVisible = function(visible) {
    if (petRoot) petRoot.setEnabled(visible);
    localStorage.setItem('tv_pet_visible', visible ? '1' : '0');
  };
  window.isPetVisible = function() {
    return localStorage.getItem('tv_pet_visible') !== '0';
  };
  if (!window.isPetVisible()) petRoot.setEnabled(false);

  // ---------------------------------------------------------------------------
  // 360° ARENA MONSTER WAVE SPAWNER
  // ---------------------------------------------------------------------------
  function spawnArenaMonster(isBoss = false) {
    if (!window.ArenaMonsterEngine) return;
    spawnSerial++;
    const entry = window.ArenaMonsterEngine.chooseCatalogEntry(isBoss, state.stage, spawnSerial);
    if (!entry) return;

    // Pick random angle in 360 degrees around player
    const angle = Math.random() * Math.PI * 2;
    const dist = isBoss ? 35.0 : (28.0 + Math.random() * 8.0);

    const monster = window.ArenaMonsterEngine.spawnMonster3D(entry, isBoss, angle, dist, state.stage, player.position);
    if (monster) {
      activeMonsters.push(monster);
      if (isBoss && targetPanel) {
        targetPanel.classList.add('show');
        if (targetName) targetName.textContent = entry.name;
        if (targetHp) targetHp.style.width = '100%';
        if (targetElement) targetElement.textContent = '👑 BOSS';
      }
    }
  }

  // Populate initial wave
  function checkAndRefillMonsters() {
    if (isBossBattle) return;
    const targetCount = Math.min(8, 4 + Math.floor(state.stage / 3));
    while (activeMonsters.length < targetCount) {
      spawnArenaMonster(false);
    }
  }

  function startBossWave() {
    // Clear regular mobs
    for (const m of activeMonsters) {
      if (m.root) m.root.dispose();
    }
    activeMonsters = [];
    isBossBattle = true;
    bossTimer = 0;

    // Spawn Boss + 3 Elite guards
    spawnArenaMonster(true);
    spawnArenaMonster(false);
    spawnArenaMonster(false);
    spawnArenaMonster(false);
    refresh();
  }

  if (bossBtn) bossBtn.onclick = startBossWave;

  // Skills
  const arts = [
    { n: 'Thanh Vân Kiếm', m: 1.0, type: 'single' },
    { n: 'Hộ Thể Kim Quang', m: 0.85, type: 'shield_aoe' },
    { n: 'Thiên Lôi Thần Trảm', m: 1.35, type: 'lightning' },
    { n: 'Vạn Kiếm Quy Tông', m: 1.65, type: 'radial_aoe' }
  ];

  function setSkillSlotActive(idx) {
    skillSlots.forEach((slot, i) => {
      if (i === idx) slot.classList.add('active');
      else slot.classList.remove('active');
    });
  }

  function executePlayerAttack() {
    if (activeMonsters.length === 0) return;

    // Find closest monster
    let closest = null;
    let minDist = 999;
    activeMonsters.forEach(m => {
      if (m.isDying) return;
      const d = BABYLON.Vector3.Distance(player.position, m.root.position);
      if (d < minDist) {
        minDist = d;
        closest = m;
      }
    });

    if (!closest) return;

    // Rotate player to face target
    const dx = closest.root.position.x - player.position.x;
    const dz = closest.root.position.z - player.position.z;
    const angle = Math.atan2(dx, dz);
    if (window.setPlayerTargetAngle) window.setPlayerTargetAngle(angle);

    // Trigger attack animation
    attackT = 0.28;

    const skill = arts[currentSkillIndex % arts.length];
    setSkillSlotActive(currentSkillIndex % arts.length);
    currentSkillIndex++;

    const bonus = typeof window.getProgressionPower === 'function' ? window.getProgressionPower() : 0;
    const baseDmg = (state.power + bonus) * skill.m * 0.22;

    if (skill.type === 'radial_aoe') {
      // 360 Radial Sword Barrage: hits all active monsters!
      activeMonsters.forEach(m => {
        if (!m.isDying) damageMonster(m, baseDmg * 0.8);
      });
      if (window.spawnSwordSlashProjectile) {
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          const target = new BABYLON.Vector3(Math.cos(a) * 10, 1.0, Math.sin(a) * 10);
          window.spawnSwordSlashProjectile(player.position, target);
        }
      }
    } else if (skill.type === 'shield_aoe') {
      // Shield shockwave: hits all nearby monsters within 4m
      activeMonsters.forEach(m => {
        if (!m.isDying && BABYLON.Vector3.Distance(player.position, m.root.position) < 4.5) {
          damageMonster(m, baseDmg * 1.1);
        }
      });
      damageMonster(closest, baseDmg);
    } else if (skill.type === 'lightning') {
      // Smites 2 random targets
      damageMonster(closest, baseDmg * 1.2);
      const others = activeMonsters.filter(m => m !== closest && !m.isDying);
      if (others.length > 0) {
        const rTarget = others[Math.floor(Math.random() * others.length)];
        damageMonster(rTarget, baseDmg * 1.0);
      }
    } else {
      // Single Target Sword Slash
      damageMonster(closest, baseDmg);
      if (window.spawnSwordSlashProjectile) {
        window.spawnSwordSlashProjectile(player.position, closest.root.position);
      }
    }
  }

  function damageMonster(monster, amount) {
    if (!monster || monster.isDying) return;
    monster.hp -= amount;
    monster.hurtTimer = 0.2;

    // Update floating 3D HP bar above head
    if (monster.hpFill) {
      const pct = Math.max(0, monster.hp / monster.maxHp);
      monster.hpFill.scaling.x = pct;
      monster.hpFill.position.x = -(1 - pct) * 0.65;
    }

    if (monster.isBoss && targetHp) {
      targetHp.style.width = `${Math.max(0, monster.hp / monster.maxHp * 100)}%`;
    }

    const isCrit = Math.random() < 0.28;
    const finalDmg = isCrit ? amount * 1.6 : amount;
    spawnDamage(finalDmg, isCrit, monster.root.position);

    if (monster.hp <= 0) {
      killMonster(monster);
    }
  }

  function killMonster(monster) {
    monster.isDying = true;
    const wasBoss = monster.isBoss;

    if (wasBoss) {
      const cleared = state.stage;
      state.stage++;
      kills = 0;
      isBossBattle = false;
      if (targetPanel) targetPanel.classList.remove('show');
      cultivate(100 + state.stage * 8, 40 + state.stage * 3);
      dispatchEvent(new CustomEvent('idle:bossWin', { detail: { stage: cleared } }));
      toast(`🎉 CHIẾN THẮNG YÊU VƯƠNG! Tiến vào Ải ${state.stage}!`);
    } else {
      kills = Math.min(10, kills + 1);
      cultivate(12 + state.stage * 1.4, 5 + state.stage * 0.6);
      dispatchEvent(new CustomEvent('idle:mobWin', { detail: { stage: state.stage, kills } }));
    }

    // Shrink and remove monster mesh
    setTimeout(() => {
      const idx = activeMonsters.indexOf(monster);
      if (idx >= 0) activeMonsters.splice(idx, 1);
      if (monster.root) monster.root.dispose();
    }, 350);

    save();
    refresh();
  }

  function hitPlayer(amount) {
    playerHp = Math.max(0, playerHp - amount);
    if (playerHpBar) playerHpBar.style.width = `${playerHp}%`;
    if (playerHp <= 0) {
      // Revive in center
      playerHp = maxPlayerHp;
      if (playerHpBar) playerHpBar.style.width = '100%';
      if (isBossBattle) {
        isBossBattle = false;
        if (targetPanel) targetPanel.classList.remove('show');
        toast('⚔️ Bị Yêu Vương đánh bại! Rút lui hồi phục sinh lực.');
      }
      // Reset wave
      for (const m of activeMonsters) if (m.root) m.root.dispose();
      activeMonsters = [];
    }
  }

  // ============================================================================
  // MOBILE TOUCH VIRTUAL JOYSTICK & KEYBOARD CONTROLS
  // ============================================================================
  const joystickLayer = document.createElement('div');
  joystickLayer.className = 'virtual-joystick-layer';
  joystickLayer.innerHTML = `
    <div id="joystickBase" class="joystick-base">
      <div id="joystickKnob" class="joystick-knob"></div>
      <div class="joystick-ring"></div>
      <div class="joystick-arrows">
        <span class="j-arrow j-up">▲</span>
        <span class="j-arrow j-right">▶</span>
        <span class="j-arrow j-down">▼</span>
        <span class="j-arrow j-left">◀</span>
      </div>
    </div>
  `;
  const gameAppEl = document.getElementById('gameApp') || document.body;
  gameAppEl.appendChild(joystickLayer);

  const joystickBase = document.getElementById('joystickBase');
  const joystickKnob = document.getElementById('joystickKnob');

  let activePointerId = null;
  let joyStartX = 0, joyStartY = 0;
  let joyVecX = 0, joyVecZ = 0;
  let keyVecX = 0, keyVecZ = 0;
  const JOY_MAX_RADIUS = 48;

  // Multi-Touch Pointer Tracking for 2-Finger Pinch to Zoom
  const activeTouchPointers = new Map();
  let initialPinchDist = 0;
  let initialPinchCamRadius = 50.0;
  let isPinchZooming = false;

  function isInteractiveElement(target) {
    if (!target) return false;
    return !!target.closest('button, a, input, select, textarea, .ulala-dock-tab, .ulala-skill-card, .ulala-currency-pill, #bossChallenge, #quickBattleBtn, #stageChest, .modal-backdrop, .system-modal, .gear-card, .pet-card, .clatter-grid');
  }

  window.addEventListener('pointerdown', (e) => {
    if (isInteractiveElement(e.target)) return;

    activeTouchPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // 2-Finger Pinch Zoom Mode Trigger
    if (activeTouchPointers.size >= 2) {
      isPinchZooming = true;
      activePointerId = null;
      joyVecX = 0;
      joyVecZ = 0;
      if (joystickBase) joystickBase.classList.remove('active');
      if (joystickKnob) joystickKnob.style.transform = 'translate(0px, 0px)';

      const pts = Array.from(activeTouchPointers.values());
      initialPinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      initialPinchCamRadius = camera ? camera.radius : 50.0;
      return;
    }

    // 1-Finger Virtual Joystick Mode
    if (activeTouchPointers.size === 1 && !isPinchZooming) {
      activePointerId = e.pointerId;
      const rect = gameAppEl.getBoundingClientRect();
      joyStartX = e.clientX - rect.left;
      joyStartY = e.clientY - rect.top;

      if (joystickBase) {
        joystickBase.style.left = `${joyStartX}px`;
        joystickBase.style.top = `${joyStartY}px`;
        joystickBase.classList.add('active');
      }
      if (joystickKnob) {
        joystickKnob.style.transform = 'translate(0px, 0px)';
      }
      joyVecX = 0;
      joyVecZ = 0;
    }
  }, { passive: true });

  window.addEventListener('pointermove', (e) => {
    if (activeTouchPointers.has(e.pointerId)) {
      activeTouchPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    // Handle 2-Finger Pinch to Zoom (Zoom In / Zoom Out)
    if (activeTouchPointers.size >= 2 && camera) {
      const pts = Array.from(activeTouchPointers.values());
      const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);

      if (initialPinchDist > 6) {
        const zoomRatio = currentDist / initialPinchDist;
        const newRadius = initialPinchCamRadius / zoomRatio;
        // Smoothly clamp camera radius between 16m (close-up) and 95m (epic open world view)
        camera.radius = Math.max(16.0, Math.min(95.0, newRadius));
      }
      return;
    }

    // Handle 1-Finger Virtual Joystick Drag
    if (e.pointerId === activePointerId && !isPinchZooming) {
      const rect = gameAppEl.getBoundingClientRect();
      const curX = e.clientX - rect.left;
      const curY = e.clientY - rect.top;

      const dx = curX - joyStartX;
      const dy = curY - joyStartY;
      const dist = Math.hypot(dx, dy);

      if (dist > 6) {
        const clamped = Math.min(dist, JOY_MAX_RADIUS);
        const angle = Math.atan2(dy, dx);
        const knobX = Math.cos(angle) * clamped;
        const knobY = Math.sin(angle) * clamped;

        if (joystickKnob) {
          joystickKnob.style.transform = `translate(${knobX}px, ${knobY}px)`;
        }

        joyVecX = -knobX / JOY_MAX_RADIUS; // Screen right is 3D -X from camera perspective
        joyVecZ = knobY / JOY_MAX_RADIUS;   // Screen up (dy < 0) is 3D -Z forward away from camera
      } else {
        if (joystickKnob) joystickKnob.style.transform = 'translate(0px, 0px)';
        joyVecX = 0;
        joyVecZ = 0;
      }
    }
  }, { passive: true });

  const releaseJoystick = (e) => {
    if (e && activeTouchPointers.has(e.pointerId)) {
      activeTouchPointers.delete(e.pointerId);
    }

    if (activeTouchPointers.size < 2) {
      isPinchZooming = false;
    }

    if (activeTouchPointers.size === 0 || (e && e.pointerId === activePointerId)) {
      activePointerId = null;
      joyVecX = 0;
      joyVecZ = 0;
      if (joystickBase) joystickBase.classList.remove('active');
      if (joystickKnob) joystickKnob.style.transform = 'translate(0px, 0px)';
    }
  };

  window.addEventListener('pointerup', releaseJoystick, { passive: true });
  window.addEventListener('pointercancel', releaseJoystick, { passive: true });

  // Mouse Wheel Zoom Support (Desktop / Testing)
  window.addEventListener('wheel', (e) => {
    if (camera) {
      camera.radius = Math.max(16.0, Math.min(95.0, camera.radius + e.deltaY * 0.05));
    }
  }, { passive: true });

  // Keyboard controls for PC / testing (W/A/S/D & Arrow keys)
  const keysDown = new Set();
  function updateKeyVector() {
    let kx = 0, kz = 0;
    if (keysDown.has('KeyA') || keysDown.has('ArrowLeft')) kx += 1;  // Screen left -> 3D +X
    if (keysDown.has('KeyD') || keysDown.has('ArrowRight')) kx -= 1; // Screen right -> 3D -X
    if (keysDown.has('KeyW') || keysDown.has('ArrowUp')) kz -= 1;    // Screen up -> 3D -Z
    if (keysDown.has('KeyS') || keysDown.has('ArrowDown')) kz += 1;  // Screen down -> 3D +Z
    const len = Math.hypot(kx, kz);
    if (len > 0) {
      keyVecX = kx / len;
      keyVecZ = kz / len;
    } else {
      keyVecX = 0;
      keyVecZ = 0;
    }
  }
  window.addEventListener('keydown', (e) => {
    keysDown.add(e.code);
    updateKeyVector();
  });
  window.addEventListener('keyup', (e) => {
    keysDown.delete(e.code);
    updateKeyVector();
  });

  const ATTACK_INTERVAL = 680;

  // Main Render & Game Loop
  scene.onBeforeRenderObservable.add(() => {
    const dt = Math.min(0.033, engine.getDeltaTime() / 1000);
    const now = performance.now();

    // Passive Player HP Regen
    if (playerHp < maxPlayerHp) {
      playerHp = Math.min(maxPlayerHp, playerHp + dt * 4.0);
      if (playerHpBar) playerHpBar.style.width = `${playerHp}%`;
    }

    // -------------------------------------------------------------------------
    // Player Movement Physics (Touch Joystick & Keyboard)
    // -------------------------------------------------------------------------
    let moveX = joyVecX + keyVecX;
    let moveZ = joyVecZ + keyVecZ;
    const moveMagnitude = Math.hypot(moveX, moveZ);
    const isMoving = moveMagnitude > 0.08;
    window.isPlayerMoving = isMoving;

    if (isMoving) {
      if (moveMagnitude > 1.0) {
        moveX /= moveMagnitude;
        moveZ /= moveMagnitude;
      }
      const playerSpeed = 8.8; // agile swift movement across 100x open world
      let nextPosX = player.position.x + moveX * playerSpeed * dt;
      let nextPosZ = player.position.z + moveZ * playerSpeed * dt;

      // Arena boundary circular clamp (radius 1200m open world)
      const arenaDist = Math.hypot(nextPosX, nextPosZ);
      const MAX_ARENA_RADIUS = 1200.0;
      if (arenaDist > MAX_ARENA_RADIUS) {
        nextPosX = (nextPosX / arenaDist) * MAX_ARENA_RADIUS;
        nextPosZ = (nextPosZ / arenaDist) * MAX_ARENA_RADIUS;
      }

      player.position.x = nextPosX;
      player.position.z = nextPosZ;

      // Face direction of movement
      const moveAngle = Math.atan2(moveX, moveZ);
      if (window.setPlayerTargetAngle) {
        window.setPlayerTargetAngle(moveAngle);
      } else {
        player.rotation.y = moveAngle;
      }
      window.PLAYER_MOTION_STATE = 'moving';
    } else {
      if (attackT <= 0) {
        window.PLAYER_MOTION_STATE = 'idle';
      }
    }

    // Camera Tracking: Always keep player perfectly centered in the screen
    if (camera) {
      if (camera.lockedTarget !== player) {
        camera.lockedTarget = player;
      }
    }

    // Refill monsters if needed
    checkAndRefillMonsters();

    // Update active monsters: move towards player's current position
    for (let i = activeMonsters.length - 1; i >= 0; i--) {
      const m = activeMonsters[i];
      if (!m.root) continue;

      if (m.isDying) {
        m.root.scaling.scaleInPlace(Math.max(0, 1 - dt * 4.0));
        m.root.position.y += dt * 1.5;
        continue;
      }

      // Calculate distance to player's current position
      const dx = player.position.x - m.root.position.x;
      const dz = player.position.z - m.root.position.z;
      const dist = Math.hypot(dx, dz);

      // Leash wrap: If player dashes far away (> 75m), wrap monster in front to maintain action at 60 FPS
      if (dist > 75) {
        const wrapAng = Math.random() * Math.PI * 2;
        const wrapDist = 32.0;
        m.root.position.x = player.position.x + Math.cos(wrapAng) * wrapDist;
        m.root.position.z = player.position.z + Math.sin(wrapAng) * wrapDist;
        continue;
      }

      // Face player
      m.root.rotation.y = Math.atan2(dx, dz);

      if (dist > 1.45) {
        // Walk towards player
        const moveStep = m.speed * dt;
        m.root.position.x += (dx / dist) * moveStep;
        m.root.position.z += (dz / dist) * moveStep;
        // Walking bob animation
        m.root.position.y = 0.5 + Math.abs(Math.sin(now * 0.008 * m.speed)) * 0.15;
      } else {
        // Melee Combat Attack Range
        m.root.position.y = 0.5;
        if (now - m.lastAttack > m.attackCooldown * 1000) {
          m.lastAttack = now;
          hitPlayer(m.isBoss ? (7 + state.stage * 0.3) : (2.0 + state.stage * 0.1));
          // Attack lunge animation
          m.root.position.x += (dx / dist) * 0.3;
          m.root.position.z += (dz / dist) * 0.3;
        }
      }

      // Hurt flash timer
      if (m.hurtTimer > 0) {
        m.hurtTimer -= dt;
      }
    }

    // Player Auto-Attack Loop
    const castProgress = Math.min(1, (now - lastSkillCast) / ATTACK_INTERVAL);
    if (castGauge) castGauge.style.width = `${castProgress * 100}%`;

    if (now - lastSkillCast > ATTACK_INTERVAL) {
      lastSkillCast = now;
      executePlayerAttack();
    }

    // Boss Timeout Check
    if (isBossBattle) {
      bossTimer += dt;
      if (bossTimer > 25) {
        isBossBattle = false;
        if (targetPanel) targetPanel.classList.remove('show');
        toast('⏱️ Hết thời gian khiêu chiến Boss!');
        for (const m of activeMonsters) if (m.root) m.root.dispose();
        activeMonsters = [];
      }
    }

    // Pet floating gentle animation
    petRoot.position.y = 0.25 + Math.sin(now * 0.004) * 0.06;
  });

  setInterval(save, 10000);
  addEventListener('pagehide', save);
  refresh();
})();