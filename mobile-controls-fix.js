// iPhone/iOS Chrome touch controls hardening: joystick + pinch zoom.
(() => {
  const app = document.getElementById('gameApp');
  const canvas = document.getElementById('renderCanvas');
  const runtime = window.GameRuntime;
  if (!app || !canvas || !runtime?.player || !runtime?.camera || !runtime?.scene || !runtime?.engine) return;

  const { player, camera, scene, engine } = runtime;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  // Disable the legacy window-level pointer controller in idle-adventure.js.
  // It remains loaded for gameplay, but these capture-phase handlers stop pointer
  // events before they reach its window listeners on mobile/touch devices.
  const coarse = matchMedia?.('(pointer: coarse)')?.matches ?? true;
  if (!coarse && navigator.maxTouchPoints < 1) return;

  canvas.style.touchAction = 'none';
  app.style.touchAction = 'none';
  app.style.webkitUserSelect = 'none';

  const layer = document.querySelector('.virtual-joystick-layer');
  const base = document.getElementById('joystickBase');
  const knob = document.getElementById('joystickKnob');
  if (layer) layer.style.pointerEvents = 'none';

  const pointers = new Map();
  let joyPointer = null;
  let startX = 0, startY = 0;
  let joyX = 0, joyZ = 0;
  let pinchStartDistance = 0;
  let pinchStartRadius = camera.radius;
  let pinching = false;
  const JOY_RADIUS = 48;
  const DEAD_ZONE = 5;
  const MIN_ZOOM = 8;
  const MAX_ZOOM = 200;

  const interactiveSelector = [
    'button','a','input','select','textarea',
    '.ulala-dock-tab','.ulala-skill-card','.ulala-currency-pill',
    '#bossChallenge','#quickBattleBtn','#stageChest',
    '.modal-backdrop','.system-modal','.system-sheet','.gear-card','.pet-card','.clatter-grid'
  ].join(',');

  const isInteractive = (target) => !!target?.closest?.(interactiveSelector);
  const resetJoystick = () => {
    joyPointer = null;
    joyX = 0;
    joyZ = 0;
    base?.classList.remove('active');
    if (knob) knob.style.transform = 'translate(0px, 0px)';
  };

  const showJoystick = (clientX, clientY) => {
    const rect = app.getBoundingClientRect();
    startX = clientX - rect.left;
    startY = clientY - rect.top;
    if (base) {
      base.style.left = `${startX}px`;
      base.style.top = `${startY}px`;
      base.classList.add('active');
    }
    if (knob) knob.style.transform = 'translate(0px, 0px)';
  };

  const updateJoystick = (clientX, clientY) => {
    const rect = app.getBoundingClientRect();
    const dx = (clientX - rect.left) - startX;
    const dy = (clientY - rect.top) - startY;
    const distance = Math.hypot(dx, dy);
    if (distance <= DEAD_ZONE) {
      joyX = joyZ = 0;
      if (knob) knob.style.transform = 'translate(0px, 0px)';
      return;
    }
    const scale = Math.min(distance, JOY_RADIUS) / distance;
    const kx = dx * scale;
    const ky = dy * scale;
    if (knob) knob.style.transform = `translate(${kx}px, ${ky}px)`;
    joyX = -kx / JOY_RADIUS;
    joyZ = ky / JOY_RADIUS;
  };

  const startPinch = () => {
    if (pointers.size < 2) return;
    const pts = [...pointers.values()].slice(0, 2);
    pinchStartDistance = Math.max(1, Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y));
    pinchStartRadius = camera.radius;
    pinching = true;
    resetJoystick();
  };

  const updatePinch = () => {
    if (!pinching || pointers.size < 2) return;
    const pts = [...pointers.values()].slice(0, 2);
    const distance = Math.max(1, Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y));
    camera.radius = clamp(pinchStartRadius * (pinchStartDistance / distance), MIN_ZOOM, MAX_ZOOM);
  };

  const swallow = (e) => {
    if (e.pointerType === 'touch' || e.pointerType === 'pen') {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  };

  app.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
    if (isInteractive(e.target)) return;
    swallow(e);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try { app.setPointerCapture(e.pointerId); } catch (_) {}

    if (pointers.size >= 2) {
      startPinch();
      return;
    }
    pinching = false;
    joyPointer = e.pointerId;
    showJoystick(e.clientX, e.clientY);
  }, { capture: true, passive: false });

  app.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    swallow(e);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size >= 2 || pinching) {
      if (!pinching) startPinch();
      updatePinch();
      return;
    }
    if (e.pointerId === joyPointer) updateJoystick(e.clientX, e.clientY);
  }, { capture: true, passive: false });

  const endPointer = (e) => {
    if (!pointers.has(e.pointerId)) return;
    swallow(e);
    pointers.delete(e.pointerId);
    try { app.releasePointerCapture(e.pointerId); } catch (_) {}

    if (pointers.size < 2) pinching = false;
    if (pointers.size === 0) {
      resetJoystick();
      return;
    }

    // Do not instantly turn the remaining finger into movement after a pinch.
    // Re-touch with one finger to start the joystick again; this avoids the
    // common iPhone bug where releasing one pinch finger makes the player run.
    resetJoystick();
  };

  app.addEventListener('pointerup', endPointer, { capture: true, passive: false });
  app.addEventListener('pointercancel', endPointer, { capture: true, passive: false });
  app.addEventListener('lostpointercapture', (e) => {
    pointers.delete(e.pointerId);
    if (pointers.size === 0) resetJoystick();
    if (pointers.size < 2) pinching = false;
  }, true);

  // iOS gesture events are WebKit-specific. Blocking them prevents browser page
  // magnification from competing with the game's own camera pinch zoom.
  for (const name of ['gesturestart','gesturechange','gestureend']) {
    app.addEventListener(name, (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, { capture: true, passive: false });
  }

  // Movement is applied separately from the legacy controller, camera-relative
  // to the fixed isometric view so the joystick direction matches the screen.
  scene.onBeforeRenderObservable.add(() => {
    const mag = Math.hypot(joyX, joyZ);
    if (pinching || mag <= 0.08) return;
    let x = joyX, z = joyZ;
    if (mag > 1) { x /= mag; z /= mag; }
    const dt = Math.min(0.033, engine.getDeltaTime() / 1000);
    const speed = 8.8;
    let nx = player.position.x + x * speed * dt;
    let nz = player.position.z + z * speed * dt;
    const radius = Math.hypot(nx, nz);
    const maxRadius = 1200;
    if (radius > maxRadius) {
      nx = nx / radius * maxRadius;
      nz = nz / radius * maxRadius;
    }
    player.position.x = nx;
    player.position.z = nz;
    window.isPlayerMoving = true;
    window.PLAYER_MOTION_STATE = 'moving';
    const angle = Math.atan2(x, z);
    if (window.setPlayerTargetAngle) window.setPlayerTargetAngle(angle);
    else player.rotation.y = angle;
  });

  window.addEventListener('blur', () => {
    pointers.clear();
    pinching = false;
    resetJoystick();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      pointers.clear();
      pinching = false;
      resetJoystick();
    }
  });

  console.info('[MobileControlsFix] iPhone joystick + pinch zoom enabled');
})();
