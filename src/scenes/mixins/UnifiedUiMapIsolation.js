import { W, H } from '../constants.js';

const UI_OVERLAY_DEPTH = 1999998;
const UI_PANEL_DEPTH = 2000000;
const UI_LAYER_DEPTH = 2000002;

function resetWorldTouch(scene) {
  if (!scene) return;
  scene.moveTarget = null;
  scene.player?.setVelocity?.(0, 0);
  if (scene.joy) {
    scene.joy.active = false;
    scene.joy.id = null;
    scene.joy.x = 0;
    scene.joy.y = 0;
  }
  scene.joyBase?.setVisible?.(false);
  scene.joyKnob?.setVisible?.(false);
}

function stopPointer(scene, pointer) {
  scene?.input?.stopPropagation?.();
  const evt = pointer?.event;
  evt?.stopPropagation?.();
  evt?.preventDefault?.();
}

function walkTree(root, fn, seen = new Set()) {
  if (!root || seen.has(root)) return seen;
  seen.add(root);
  fn(root);
  if (Array.isArray(root.list)) {
    root.list.forEach(child => walkTree(child, fn, seen));
  }
  return seen;
}

function modalIsOpen(scene) {
  return !!(
    scene?.activeModal?.active ||
    scene?.activeModalOverlay?.active ||
    (scene?.modalLayer?.list && scene.modalLayer.list.length > 0)
  );
}

function collectUiObjects(scene) {
  const ui = new Set();
  const addRoot = root => walkTree(root, obj => ui.add(obj), ui);

  if (scene?.activeModalOverlay?.active) addRoot(scene.activeModalOverlay);
  if (scene?.activeModal?.active) addRoot(scene.activeModal);

  if (scene?.modalLayer?.list?.length) {
    ui.add(scene.modalLayer);
    scene.modalLayer.list.forEach(child => addRoot(child));
  }

  return ui;
}

function isLargePanelBackground(obj) {
  if (!obj || obj.type !== 'Rectangle') return false;
  const w = Number(obj.width || obj.displayWidth || 0);
  const h = Number(obj.height || obj.displayHeight || 0);
  return w >= 400 && h >= 260;
}

function normalizeModalToScreen(scene) {
  if (!scene) return;
  resetWorldTouch(scene);

  const overlay = scene.activeModalOverlay;
  if (overlay?.active) {
    overlay.setScrollFactor?.(0, 0);
    overlay.setPosition?.(W / 2, H / 2);
    overlay.setDepth?.(UI_OVERLAY_DEPTH);
    if (overlay.type === 'Rectangle') {
      overlay.setDisplaySize?.(W + 24, H + 24);
      // Keep the blocker interactive but visually transparent. This is especially
      // important on 32,000px combat maps: world input stays isolated without a
      // black fullscreen veil appearing behind the UI.
      overlay.setFillStyle?.(0x000000, 0.001);
    }
    if (!overlay.input && overlay.setInteractive) {
      overlay.setInteractive({ useHandCursor: false });
    }
    if (!overlay.__mapIsolationGuard) {
      overlay.__mapIsolationGuard = true;
      overlay.on?.('pointerdown', pointer => {
        stopPointer(scene, pointer);
        resetWorldTouch(scene);
      });
      overlay.on?.('pointerup', pointer => stopPointer(scene, pointer));
      overlay.on?.('pointermove', pointer => stopPointer(scene, pointer));
    }
  }

  const panel = scene.activeModal;
  if (panel?.active) {
    panel.setScrollFactor?.(0, 0);
    panel.setPosition?.(W / 2, H / 2);
    panel.setDepth?.(UI_PANEL_DEPTH);

    // IMPORTANT: Phaser hit testing uses each interactive child's own scroll factor.
    // Map 0 is 540px wide so camera.scrollX stays ~0 and legacy modal buttons appear fine.
    // Combat maps are up to 32000px wide; child scrollFactor=1 shifts their hit areas by
    // camera scroll even when the parent Container renders fixed. Force the ENTIRE modal
    // tree into screen-space so visual position and touch/click hit area are identical.
    walkTree(panel, obj => obj.setScrollFactor?.(0, 0));

    // Apply the same bright fullscreen theme to every final modal implementation,
    // including simplified panels installed after FullscreenModalOptimization.
    const topLevel = Array.isArray(panel.list) ? panel.list : [];
    const background = topLevel.find(isLargePanelBackground);
    if (background) {
      background.setPosition?.(0, 0);
      background.setDisplaySize?.(W - 6, H - 6);
      background.setFillStyle?.(0x124766, 0.96);
      background.setStrokeStyle?.(3, 0x9cf7ff, 1);
    }
  }

  if (scene.modalLayer?.list?.length) {
    scene.modalLayer.setScrollFactor?.(0, 0);
    scene.modalLayer.setDepth?.(UI_LAYER_DEPTH);
    scene.modalLayer.list.forEach(child => {
      walkTree(child, obj => obj.setScrollFactor?.(0, 0));
    });
  }
}

function isolateWorldInput(scene) {
  if (!scene || !modalIsOpen(scene)) return;

  const uiObjects = collectUiObjects(scene);
  let state = scene.__uiMapIsolationState;
  if (!state) {
    state = {
      disabledInputs: [],
      disabledSet: new Set(),
      previousTopOnly: scene.input?.topOnly
    };
    scene.__uiMapIsolationState = state;
  }

  if (scene.input?.setTopOnly) scene.input.setTopOnly(true);
  else if (scene.input) scene.input.topOnly = true;

  const disableTree = root => {
    if (!root || uiObjects.has(root)) return;

    if (root.input && root.input.enabled !== false && !state.disabledSet.has(root)) {
      state.disabledSet.add(root);
      state.disabledInputs.push(root);
      root.input.enabled = false;
    }

    if (Array.isArray(root.list)) {
      root.list.forEach(child => disableTree(child));
    }
  };

  const displayList = scene.children?.list || [];
  displayList.forEach(obj => disableTree(obj));
}

function restoreWorldInput(scene) {
  const state = scene?.__uiMapIsolationState;
  if (!scene || !state) return;

  state.disabledInputs.forEach(obj => {
    if (obj?.active !== false && obj.input) obj.input.enabled = true;
  });

  if (scene.input) {
    if (scene.input.setTopOnly) scene.input.setTopOnly(state.previousTopOnly !== false);
    else scene.input.topOnly = state.previousTopOnly !== false;
  }

  scene.__uiMapIsolationState = null;
}

function enforceUiIsolation(scene) {
  if (!modalIsOpen(scene)) return;
  normalizeModalToScreen(scene);
  isolateWorldInput(scene);
  scene.enterUiHardPause?.();
}

export function installUnifiedUiMapIsolation(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__unifiedUiMapIsolationInstalled) return;
  const proto = MainGameScene.prototype;
  proto.__unifiedUiMapIsolationInstalled = true;

  proto.enforceUnifiedUiIsolation = function enforceUnifiedUiIsolation() {
    enforceUiIsolation(this);
  };

  // Install LAST so every current/future simplified open* implementation gets the same
  // camera-space normalization and world-input isolation on every map.
  Object.getOwnPropertyNames(proto).forEach(name => {
    if (!/^open[A-Z]/.test(name)) return;
    const original = proto[name];
    if (typeof original !== 'function' || original.__unifiedMapUiWrapped) return;

    const wrapped = function openWithUnifiedMapUi(...args) {
      this.__uiMapTransitionDepth = (this.__uiMapTransitionDepth || 0) + 1;
      resetWorldTouch(this);
      try {
        return original.apply(this, args);
      } finally {
        this.__uiMapTransitionDepth = Math.max(0, (this.__uiMapTransitionDepth || 1) - 1);
        if (modalIsOpen(this)) enforceUiIsolation(this);
        else if ((this.__uiMapTransitionDepth || 0) === 0) restoreWorldInput(this);
      }
    };

    wrapped.__unifiedMapUiWrapped = true;
    proto[name] = wrapped;
  });

  const originalCloseModal = proto.closeModal;
  if (typeof originalCloseModal === 'function' && !originalCloseModal.__unifiedMapUiWrapped) {
    const wrappedClose = function closeWithUnifiedMapUi(...args) {
      const result = originalCloseModal.apply(this, args);

      if ((this.__uiMapTransitionDepth || 0) > 0 || modalIsOpen(this)) {
        if (modalIsOpen(this)) enforceUiIsolation(this);
      } else {
        restoreWorldInput(this);
      }
      return result;
    };
    wrappedClose.__unifiedMapUiWrapped = true;
    proto.closeModal = wrappedClose;
  }

  // Safety net for nested/late-created UI children. This runs only while a modal exists.
  const originalCreate = proto.create;
  if (typeof originalCreate === 'function' && !originalCreate.__unifiedMapUiCreateWrapped) {
    const wrappedCreate = function createWithUnifiedMapUi(...args) {
      const result = originalCreate.apply(this, args);
      this.events?.on?.('postupdate', () => {
        if (modalIsOpen(this)) enforceUiIsolation(this);
      });
      return result;
    };
    wrappedCreate.__unifiedMapUiCreateWrapped = true;
    proto.create = wrappedCreate;
  }
}
