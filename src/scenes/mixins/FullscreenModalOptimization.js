import { W, H } from '../constants.js';

function stopPointer(pointer) {
  const evt = pointer?.event;
  if (!evt) return;
  if (typeof evt.stopPropagation === 'function') evt.stopPropagation();
  if (typeof evt.preventDefault === 'function') evt.preventDefault();
}

function resetWorldTouch(scene) {
  if (!scene) return;
  scene.moveTarget = null;
  if (scene.player?.body?.setVelocity) scene.player.setVelocity(0, 0);
  if (!scene.joy) return;
  scene.joy.active = false;
  scene.joy.id = null;
  scene.joy.x = 0;
  scene.joy.y = 0;
  if (scene.joyBase?.setVisible) scene.joyBase.setVisible(false);
  if (scene.joyKnob?.setVisible) scene.joyKnob.setVisible(false);
}

function isLargePanelBackground(obj) {
  if (!obj || obj.type !== 'Rectangle') return false;
  const w = Number(obj.width || obj.displayWidth || 0);
  const h = Number(obj.height || obj.displayHeight || 0);
  return w >= 400 && h >= 260;
}

function makeOverlayFullscreen(scene) {
  const overlay = scene?.activeModalOverlay;
  if (!overlay || !overlay.active) return;

  overlay.setPosition?.(W / 2, H / 2);
  overlay.setScrollFactor?.(0);
  overlay.setDepth?.(9998);

  if (overlay.type === 'Rectangle') {
    overlay.setDisplaySize?.(W + 12, H + 12);
    overlay.setFillStyle?.(0x020912, 0.995);
  }

  if (!overlay.input && typeof overlay.setInteractive === 'function') {
    overlay.setInteractive({ useHandCursor: false });
  }

  if (!overlay.__fullscreenInputGuard) {
    overlay.__fullscreenInputGuard = true;
    overlay.on?.('pointerdown', pointer => {
      stopPointer(pointer);
      resetWorldTouch(scene);
    });
    overlay.on?.('pointerup', pointer => stopPointer(pointer));
    overlay.on?.('pointermove', pointer => stopPointer(pointer));
  }
}

function optimizePanel(scene) {
  const panel = scene?.activeModal;
  if (!panel || !panel.active) {
    makeOverlayFullscreen(scene);
    return;
  }

  resetWorldTouch(scene);
  makeOverlayFullscreen(scene);

  panel.setPosition?.(W / 2, H / 2);
  panel.setScrollFactor?.(0);
  panel.setDepth?.(10000);

  // Fullscreen only changes the frame/background. Never scale or reposition
  // existing child text/rows: that caused the overlapping UI seen on mobile.
  const topLevel = Array.isArray(panel.list) ? panel.list : [];
  const background = topLevel.find(isLargePanelBackground);
  if (background && !background.__fullscreenFrameApplied) {
    background.__fullscreenFrameApplied = true;
    background.setPosition?.(0, 0);
    background.setDisplaySize?.(W - 8, H - 8);
    background.setFillStyle?.(0x082638, 1);
    background.setStrokeStyle?.(2.5, 0x63e6ff, 1);
  }

  // While a modal is open, pause Arcade Physics so enemy collision/combat cannot
  // steal or disturb UI input. Input and scene UI remain fully interactive.
  if (!scene.__uiWorldPaused && scene.physics?.world?.pause) {
    scene.physics.world.pause();
    scene.__uiWorldPaused = true;
  }
}

export function installFullscreenModalOptimization(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__fullscreenModalOptimizationInstalled) return;
  const proto = MainGameScene.prototype;
  proto.__fullscreenModalOptimizationInstalled = true;

  proto.optimizeActiveModalForMobile = function optimizeActiveModalForMobile() {
    optimizePanel(this);
  };

  Object.getOwnPropertyNames(proto).forEach(name => {
    if (!/^open[A-Z]/.test(name)) return;
    const original = proto[name];
    if (typeof original !== 'function' || original.__fullscreenModalWrapped) return;

    const wrapped = function fullscreenModalWrapper(...args) {
      resetWorldTouch(this);
      const result = original.apply(this, args);
      optimizePanel(this);
      if (this.time?.delayedCall) {
        this.time.delayedCall(0, () => optimizePanel(this));
      }
      return result;
    };

    wrapped.__fullscreenModalWrapped = true;
    proto[name] = wrapped;
  });
}
