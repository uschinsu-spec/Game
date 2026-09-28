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
  if (!scene.joy) return;
  scene.joy.active = false;
  scene.joy.id = null;
  scene.joy.x = 0;
  scene.joy.y = 0;
  if (scene.joyBase?.setVisible) scene.joyBase.setVisible(false);
  if (scene.joyKnob?.setVisible) scene.joyKnob.setVisible(false);
}

function getFontPx(textObj) {
  const value = textObj?.style?.fontSize;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function readableFontSize(px) {
  if (!Number.isFinite(px)) return null;
  if (px <= 9.5) return 12;
  if (px <= 11) return 13;
  if (px <= 13) return 15;
  if (px <= 16) return 18;
  return Math.min(24, Math.round(px + 2));
}

function walkDisplayTree(node, visit, seen = new Set()) {
  if (!node || seen.has(node)) return;
  seen.add(node);
  visit(node);
  if (Array.isArray(node.list)) {
    node.list.forEach(child => walkDisplayTree(child, visit, seen));
  }
}

function isLargePanelBackground(obj) {
  if (!obj || obj.type !== 'Rectangle') return false;
  const w = Number(obj.width || obj.displayWidth || 0);
  const h = Number(obj.height || obj.displayHeight || 0);
  return w >= 400 && h >= 300;
}

function makeOverlayFullscreen(scene) {
  const overlay = scene?.activeModalOverlay;
  if (!overlay || !overlay.active) return;

  if (typeof overlay.setPosition === 'function') overlay.setPosition(W / 2, H / 2);
  if (typeof overlay.setScrollFactor === 'function') overlay.setScrollFactor(0);
  if (typeof overlay.setDepth === 'function') overlay.setDepth(Math.max(289, overlay.depth || 0));

  if (overlay.type === 'Rectangle') {
    if (typeof overlay.setDisplaySize === 'function') overlay.setDisplaySize(W + 8, H + 8);
    if (typeof overlay.setFillStyle === 'function') overlay.setFillStyle(0x02070d, 0.985);
  }

  // Biến phần nền thành lớp chặn input toàn màn hình. Khi UI mở,
  // không touch nào được phép xuyên xuống joystick / map / combat.
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
  if (!panel || !panel.active || panel.__fullscreenOptimized) {
    makeOverlayFullscreen(scene);
    return;
  }

  panel.__fullscreenOptimized = true;
  resetWorldTouch(scene);
  makeOverlayFullscreen(scene);

  if (typeof panel.setPosition === 'function') panel.setPosition(W / 2, H / 2);
  if (typeof panel.setScrollFactor === 'function') panel.setScrollFactor(0);

  // Nền panel chiếm gần toàn bộ màn hình, thay vì hộp nhỏ giữa màn hình.
  const topLevel = Array.isArray(panel.list) ? panel.list : [];
  const background = topLevel.find(isLargePanelBackground);
  if (background) {
    background.setPosition?.(0, 0);
    background.setDisplaySize?.(W - 10, H - 12);
    background.setFillStyle?.(0x071621, 0.995);
    background.setStrokeStyle?.(2, 0xcaa765, 0.95);
  }

  // Tận dụng chiều cao 960px: giãn các hàng UI ra để chữ lớn không chồng nhau.
  topLevel.forEach(child => {
    if (!child || child === background) return;
    if (Number.isFinite(child.x)) child.x *= 1.04;
    if (Number.isFinite(child.y)) child.y *= 1.16;
  });

  // Tăng cỡ chữ có chọn lọc. Các mô tả 9px -> 12px, label 11px -> 13px,
  // tiêu đề 13px -> 15px, tiêu đề lớn 16px -> 18px.
  walkDisplayTree(panel, obj => {
    if (!obj || typeof obj.setFontSize !== 'function') return;
    if (obj.__fullscreenFontSized) return;
    const current = getFontPx(obj);
    const next = readableFontSize(current);
    if (!next || next <= current) return;
    obj.__fullscreenFontSized = true;
    obj.setFontSize(next);
    if (obj.style && Number.isFinite(obj.style.wordWrapWidth) && obj.style.wordWrapWidth > 0) {
      obj.setWordWrapWidth?.(Math.min(470, obj.style.wordWrapWidth), true);
    }
  });

  // Nâng vùng chạm tối thiểu cho các control nhỏ trên mobile.
  walkDisplayTree(panel, obj => {
    if (!obj?.input || !obj.input.hitArea) return;
    const area = obj.input.hitArea;
    if (area && typeof area.width === 'number' && typeof area.height === 'number') {
      if (area.width < 64) area.width = 64;
      if (area.height < 44) area.height = 44;
    }
  });
}

export function installFullscreenModalOptimization(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__fullscreenModalOptimizationInstalled) return;
  const proto = MainGameScene.prototype;
  proto.__fullscreenModalOptimizationInstalled = true;

  // Public helper để các modal được tạo bất đồng bộ cũng có thể gọi lại nếu cần.
  proto.optimizeActiveModalForMobile = function optimizeActiveModalForMobile() {
    optimizePanel(this);
  };

  // Bọc toàn bộ open* của hệ thống UI hiện tại, không sửa logic nội bộ từng panel.
  Object.getOwnPropertyNames(proto).forEach(name => {
    if (!/^open[A-Z]/.test(name)) return;
    const original = proto[name];
    if (typeof original !== 'function' || original.__fullscreenModalWrapped) return;

    const wrapped = function fullscreenModalWrapper(...args) {
      resetWorldTouch(this);
      const result = original.apply(this, args);
      optimizePanel(this);

      // Một số panel tạo nội dung ở cuối event loop; chạy thêm một lượt an toàn.
      if (this.time?.delayedCall) {
        this.time.delayedCall(0, () => optimizePanel(this));
      } else if (typeof queueMicrotask === 'function') {
        queueMicrotask(() => optimizePanel(this));
      }
      return result;
    };
    wrapped.__fullscreenModalWrapped = true;
    proto[name] = wrapped;
  });
}
