/**
 * UiModalManager.js
 * Unified Modal, Pause & Input Isolation Manager for Xianxia Game Scene
 * 
 * Manages the complete UI lifecycle:
 *   open -> pause world -> isolate input -> fullscreen shell -> close button -> close -> restore input -> resume world
 */
import { W, H } from '../constants.js';

export const UI_OVERLAY_DEPTH = 1999998;
export const UI_PANEL_DEPTH = 2000000;
export const UI_LAYER_DEPTH = 2000002;
const FONT = 'Be Vietnam Pro, sans-serif';

export function stopPointer(scene, pointer) {
  scene?.input?.stopPropagation?.();
  const evt = pointer?.event;
  evt?.stopPropagation?.();
  evt?.preventDefault?.();
}

export function resetWorldTouch(scene) {
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

function walkTree(root, fn, seen = new Set()) {
  if (!root || seen.has(root)) return seen;
  seen.add(root);
  fn(root);
  if (Array.isArray(root.list)) {
    root.list.forEach(child => walkTree(child, fn, seen));
  }
  return seen;
}

function keepPanelInputOnScreen(panel) {
  if (!panel || panel.__screenSpaceAddWrapped) return;
  panel.__screenSpaceAddWrapped = true;
  const originalAdd = panel.add.bind(panel);
  panel.add = children => {
    const result = originalAdd(children);
    const added = Array.isArray(children) ? children : [children];
    added.forEach(child => walkTree(child, obj => obj.setScrollFactor?.(0, 0)));
    return result;
  };
  walkTree(panel, obj => obj.setScrollFactor?.(0, 0));
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

export function freezeWorld(scene) {
  if (!scene) return;
  resetWorldTouch(scene);
  scene.gameplayPaused = true;
  scene.__uiHardPaused = true;
  scene.__uiWorldPaused = true;

  if (scene.physics?.world?.pause && !scene.physics.world.isPaused) {
    scene.physics.world.pause();
  }
  if (!scene.__uiTweensPaused && scene.tweens?.pauseAll) {
    scene.tweens.pauseAll();
    scene.__uiTweensPaused = true;
  }
  if (!scene.__uiAnimationsPaused && scene.anims?.pauseAll) {
    scene.anims.pauseAll();
    scene.__uiAnimationsPaused = true;
  }
}

export function resumeWorld(scene) {
  if (!scene || (scene.__uiTransitionDepth || 0) > 0) return;
  if (modalIsOpen(scene)) return;

  if (scene.physics?.world?.isPaused && scene.physics.world.resume) {
    scene.physics.world.resume();
  }
  if (scene.__uiTweensPaused && scene.tweens?.resumeAll) {
    scene.tweens.resumeAll();
  }
  if (scene.__uiAnimationsPaused && scene.anims?.resumeAll) {
    scene.anims.resumeAll();
  }

  scene.gameplayPaused = false;
  scene.__uiHardPaused = false;
  scene.__uiWorldPaused = false;
  scene.__uiTweensPaused = false;
  scene.__uiAnimationsPaused = false;
}

export function isolateWorldInput(scene) {
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

export function restoreWorldInput(scene) {
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

export function fitSingleLine(textObj, maxWidth, minPx = 10) {
  if (!textObj) return textObj;
  let size = parseFloat(textObj.style?.fontSize || 16);
  while (textObj.width > maxWidth && size > minPx) {
    size -= 1;
    textObj.setFontSize(size);
  }
  return textObj;
}

export function activateModalInput(scene, panel) {
  walkTree(panel, obj => obj.setScrollFactor?.(0, 0));
  isolateWorldInput(scene);
  freezeWorld(scene);
  return panel;
}

export const ModalCore = {
  isModalOpen() {
    return modalIsOpen(this);
  },

  isGameplayPaused() {
    return !!(this.gameplayPaused || this.__uiHardPaused);
  },

  enterUiHardPause() {
    freezeWorld(this);
  },

  exitUiHardPause() {
    resumeWorld(this);
  },

  createModalCloseBtn(panel, x = 205, y = -432, opts = {}) {
    keepPanelInputOnScreen(panel);
    panel?.setDepth?.(UI_PANEL_DEPTH);
    queueMicrotask(() => {
      if (this.activeModal !== panel || !panel?.active) return;
      const overlay = this.activeModalOverlay;
      overlay?.setDepth?.(UI_OVERLAY_DEPTH);
      overlay?.setScrollFactor?.(0, 0);
      if (overlay && !overlay.input) overlay.setInteractive?.({ useHandCursor: false });
      isolateWorldInput(this);
      freezeWorld(this);
    });
    const width = opts.width || 108;
    const height = opts.height || 52;
    const label = opts.label || 'ĐÓNG';

    const btnBg = this.add.rectangle(x, y, width, height, opts.bgColor || 0xc01835, 1)
      .setStrokeStyle(opts.strokeWidth || 3, opts.borderColor || 0xffc7d0, 1)
      .setInteractive({ useHandCursor: true });

    const btnTxt = this.add.text(x, y, label, {
      fontSize: opts.fontSize || '16px',
      fontFamily: FONT,
      fontStyle: 'bold',
      color: opts.textColor || '#ffffff'
    }).setStroke(opts.strokeColor || '#5b0816', 2).setOrigin(0.5);

    let closed = false;
    const closeNow = (pointer) => {
      stopPointer(this, pointer);
      if (closed) return;
      closed = true;
      resetWorldTouch(this);
      this.closeModal();
    };

    btnBg.on('pointerdown', closeNow);
    btnBg.on('pointerup', pointer => stopPointer(this, pointer));
    btnBg.on('pointerover', () => {
      if (btnBg?.active) btnBg.setFillStyle(opts.hoverColor || 0xe11d48, 1);
      if (btnTxt?.active) btnTxt.setColor('#fff4a8');
    });
    btnBg.on('pointerout', () => {
      if (btnBg?.active) btnBg.setFillStyle(opts.bgColor || 0xc01835, 1);
      if (btnTxt?.active) btnTxt.setColor(opts.textColor || '#ffffff');
    });

    panel?.add?.([btnBg, btnTxt]);
    return btnBg;
  },

  createModalShell(title, subtitle, opts = {}) {
    this.closeModal();

    // 1. Freeze world
    freezeWorld(this);

    // 2. Transparent interactive blocker overlay (UI_OVERLAY_DEPTH)
    const overlay = this.fixed(
      this.add.rectangle(W / 2, H / 2, W + 24, H + 24, 0x000000, opts.overlayAlpha ?? 0.001),
      UI_OVERLAY_DEPTH
    ).setInteractive({ useHandCursor: false }).setScrollFactor(0, 0);

    overlay.on('pointerdown', p => {
      stopPointer(this, p);
      resetWorldTouch(this);
    });
    overlay.on('pointerup', p => stopPointer(this, p));
    overlay.on('pointermove', p => stopPointer(this, p));

    // 3. Panel Container (UI_PANEL_DEPTH)
    const panel = this.fixed(this.add.container(W / 2, H / 2), UI_PANEL_DEPTH).setScrollFactor(0, 0);
    keepPanelInputOnScreen(panel);

    this.activeModal = panel;
    this.activeModalOverlay = overlay;

    // 4. Fullscreen Background Frame
    const bg = this.add.rectangle(0, 0, W - 6, H - 6, opts.bgFill || 0x062a3b, opts.bgAlpha ?? 1)
      .setStrokeStyle(3, opts.bgStroke || 0x67e8ff, 1);

    const header = this.add.rectangle(0, -414, W - 24, 106, opts.headerFill || 0x0b4560, 1)
      .setStrokeStyle(2, opts.headerStroke || 0x4de9ff, 1);

    const titleTxt = this.add.text(-238, -436, title || '', {
      fontFamily: FONT,
      fontSize: '23px',
      fontStyle: 'bold',
      color: opts.titleColor || '#ffe45c'
    }).setOrigin(0, 0.5);

    const subtitleTxt = this.add.text(-238, -397, subtitle || '', {
      fontFamily: FONT,
      fontSize: '12px',
      fontStyle: 'bold',
      color: opts.subtitleColor || '#c8f7ff'
    }).setOrigin(0, 0.5);

    fitSingleLine(titleTxt, 365, 15);
    fitSingleLine(subtitleTxt, 430, 10);

    panel.add([bg, header, titleTxt, subtitleTxt]);
    panel.bg = bg;
    panel.header = header;
    panel.titleTxt = titleTxt;
    panel.subtitleTxt = subtitleTxt;
    panel.overlay = overlay;

    // 5. Close Button (Top-Right)
    if (opts.noCloseBtn !== true) {
      this.createModalCloseBtn(panel, opts.closeX || 205, opts.closeY || -432, opts.closeOpts);
    }

    // 6. Force entire modal tree into screen-space (scrollFactor 0) and isolate world input
    walkTree(panel, obj => obj.setScrollFactor?.(0, 0));
    isolateWorldInput(this);

    return panel;
  },

  closeModal() {
    if (this._itemPopup) {
      this._itemPopup.destroy(true);
      this._itemPopup = null;
    }
    if (this.activeModalOverlay) {
      this.activeModalOverlay.destroy(true);
      this.activeModalOverlay = null;
    }
    if (this.activeModal) {
      this.activeModal.destroy(true);
      this.activeModal = null;
    }
    if (this.modalLayer) {
      if (this.modalLayer.list && this.modalLayer.list.length > 0) {
        const children = [...this.modalLayer.list];
        children.forEach(c => {
          if (c && c.destroy) c.destroy(true);
        });
      }
      this.modalLayer.removeAll(true);
    }

    // Restore input & resume world
    restoreWorldInput(this);
    resumeWorld(this);
  }
};

export function installUiModalManager(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__uiModalManagerInstalled) return;
  const proto = MainGameScene.prototype;
  proto.__uiModalManagerInstalled = true;

  Object.assign(proto, ModalCore);

  const originalUpdate = proto.update;
  if (typeof originalUpdate === 'function' && !originalUpdate.__modalManagerUpdateWrapped) {
    proto.update = function updateGuardedByModalManager(...args) {
      if (this.isGameplayPaused?.()) {
        resetWorldTouch(this);
        return;
      }
      return originalUpdate.apply(this, args);
    };
    proto.update.__modalManagerUpdateWrapped = true;
  }
}
