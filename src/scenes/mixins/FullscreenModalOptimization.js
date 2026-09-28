import { W, H } from '../constants.js';

const UI_OVERLAY_DEPTH = 999998;
const UI_PANEL_DEPTH = 1000000;

function stopPointer(scene, pointer) {
  scene?.input?.stopPropagation?.();
  const evt = pointer?.event;
  evt?.stopPropagation?.();
  evt?.preventDefault?.();
}

function resetWorldTouch(scene) {
  if (!scene) return;
  scene.moveTarget = null;
  scene.player?.setVelocity?.(0, 0);
  if (!scene.joy) return;
  scene.joy.active = false;
  scene.joy.id = null;
  scene.joy.x = 0;
  scene.joy.y = 0;
  scene.joyBase?.setVisible?.(false);
  scene.joyKnob?.setVisible?.(false);
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
  overlay.setDepth?.(UI_OVERLAY_DEPTH);

  if (overlay.type === 'Rectangle') {
    overlay.setDisplaySize?.(W + 16, H + 16);
    // Transparent blocker: keeps all world touch/input blocked without putting a
    // black veil behind Bag/Crafting/Skills/Map panels.
    overlay.setFillStyle?.(0x000000, 0.001);
  }

  if (!overlay.input && overlay.setInteractive) overlay.setInteractive({ useHandCursor: false });
  if (!overlay.__fullscreenInputGuard) {
    overlay.__fullscreenInputGuard = true;
    overlay.on?.('pointerdown', pointer => {
      stopPointer(scene, pointer);
      resetWorldTouch(scene);
    });
    overlay.on?.('pointerup', pointer => stopPointer(scene, pointer));
    overlay.on?.('pointermove', pointer => stopPointer(scene, pointer));
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
  panel.setDepth?.(UI_PANEL_DEPTH);

  const topLevel = Array.isArray(panel.list) ? panel.list : [];
  const background = topLevel.find(isLargePanelBackground);
  if (background && !background.__fullscreenFrameApplied) {
    background.__fullscreenFrameApplied = true;
    background.setPosition?.(0, 0);
    background.setDisplaySize?.(W - 6, H - 6);
    // Bright jade-blue fullscreen panel instead of near-black/navy.
    background.setFillStyle?.(0x124766, 0.96);
    background.setStrokeStyle?.(3, 0x9cf7ff, 1);
  }

  scene.enterUiHardPause?.();
}

export function installFullscreenModalOptimization(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__fullscreenModalOptimizationInstalledV2) return;
  const proto = MainGameScene.prototype;
  proto.__fullscreenModalOptimizationInstalledV2 = true;

  proto.optimizeActiveModalForMobile = function optimizeActiveModalForMobile() {
    optimizePanel(this);
  };

  Object.getOwnPropertyNames(proto).forEach(name => {
    if (!/^open[A-Z]/.test(name)) return;
    const original = proto[name];
    if (typeof original !== 'function' || original.__fullscreenModalWrappedV2) return;
    const wrapped = function fullscreenModalWrapper(...args) {
      resetWorldTouch(this);
      const result = original.apply(this, args);
      optimizePanel(this);
      return result;
    };
    wrapped.__fullscreenModalWrappedV2 = true;
    proto[name] = wrapped;
  });
}
