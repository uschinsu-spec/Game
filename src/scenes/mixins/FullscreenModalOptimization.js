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

function parseHexColor(value) {
  if (typeof value !== 'string') return null;
  const match = value.trim().match(/^#([0-9a-f]{6})$/i);
  if (!match) return null;
  const n = parseInt(match[1], 16);
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255
  };
}

function colorBrightness(color) {
  if (!color) return 255;
  return (color.r * 299 + color.g * 587 + color.b * 114) / 1000;
}

function brightenTextColor(obj, fontPx) {
  if (!obj?.style || typeof obj.setColor !== 'function') return;
  const current = parseHexColor(obj.style.color);
  if (!current || colorBrightness(current) >= 155) return;

  const text = String(obj.text || '').toLowerCase();
  if (text.includes('lỗi') || text.includes('không đủ') || text.includes('thất bại')) {
    obj.setColor('#FF8A9A');
    return;
  }
  if (text.includes('thành công') || text.includes('đang bật') || text.includes('đã học')) {
    obj.setColor('#7CFFD5');
    return;
  }
  if ((fontPx || 0) >= 18) {
    obj.setColor('#FFE88A');
  } else if (obj.style.fontStyle === 'bold' || (fontPx || 0) >= 15) {
    obj.setColor('#8FE9FF');
  } else {
    obj.setColor('#E4F7FF');
  }
}

function getSafeWrapWidth(obj) {
  const PANEL_LEFT = -248;
  const PANEL_RIGHT = 248;
  const EDGE_PAD = 14;
  const x = Number.isFinite(obj?.x) ? obj.x : 0;
  const originX = Number.isFinite(obj?.originX) ? obj.originX : 0;

  let width;
  if (originX >= 0.4 && originX <= 0.6) {
    const half = Math.max(70, Math.min(PANEL_RIGHT - x, x - PANEL_LEFT) - EDGE_PAD);
    width = half * 2;
  } else if (originX > 0.6) {
    width = x - PANEL_LEFT - EDGE_PAD;
  } else {
    width = PANEL_RIGHT - x - EDGE_PAD;
  }

  return Math.max(110, Math.min(468, Math.floor(width)));
}

function optimizeTextObject(obj) {
  if (!obj || typeof obj.setFontSize !== 'function') return;

  const current = getFontPx(obj);
  const next = readableFontSize(current);
  if (next && (!current || next > current)) {
    obj.setFontSize(next);
  }

  const finalPx = getFontPx(obj) || next || current || 13;
  const wrapWidth = getSafeWrapWidth(obj);

  // Tất cả text trong modal đều có giới hạn chiều rộng riêng theo vị trí.
  // Advanced wrap giúp xuống dòng theo từ/cụm từ, tránh cắt chữ giữa chừng.
  obj.setWordWrapWidth?.(wrapWidth, true);

  // Tăng khoảng cách dòng để text 2–4 dòng vẫn dễ đọc trên điện thoại.
  const currentSpacing = Number(obj.lineSpacing || obj.style?.lineSpacing || 0);
  const desiredSpacing = finalPx >= 18 ? 6 : finalPx >= 15 ? 5 : 4;
  if (typeof obj.setLineSpacing === 'function' && currentSpacing < desiredSpacing) {
    obj.setLineSpacing(desiredSpacing);
  }

  // Căn trái cho đoạn mô tả dài; giữ căn giữa cho tiêu đề/nút ngắn.
  const text = String(obj.text || '');
  const isLongText = text.length > 42 || text.includes('\n');
  if (isLongText && typeof obj.setAlign === 'function') {
    obj.setAlign(obj.originX >= 0.4 && obj.originX <= 0.6 ? 'center' : 'left');
  }

  brightenTextColor(obj, finalPx);
  obj.__fullscreenFontSized = true;
  obj.__fullscreenWrapped = true;
}

function makeOverlayFullscreen(scene) {
  const overlay = scene?.activeModalOverlay;
  if (!overlay || !overlay.active) return;

  if (typeof overlay.setPosition === 'function') overlay.setPosition(W / 2, H / 2);
  if (typeof overlay.setScrollFactor === 'function') overlay.setScrollFactor(0);
  if (typeof overlay.setDepth === 'function') overlay.setDepth(Math.max(289, overlay.depth || 0));

  if (overlay.type === 'Rectangle') {
    if (typeof overlay.setDisplaySize === 'function') overlay.setDisplaySize(W + 8, H + 8);
    if (typeof overlay.setFillStyle === 'function') overlay.setFillStyle(0x03101a, 0.99);
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

  if (typeof panel.setPosition === 'function') panel.setPosition(W / 2, H / 2);
  if (typeof panel.setScrollFactor === 'function') panel.setScrollFactor(0);

  const firstPass = !panel.__fullscreenOptimized;
  panel.__fullscreenOptimized = true;

  const topLevel = Array.isArray(panel.list) ? panel.list : [];
  const background = topLevel.find(isLargePanelBackground);
  if (background) {
    background.setPosition?.(0, 0);
    background.setDisplaySize?.(W - 10, H - 12);
    background.setFillStyle?.(0x082638, 0.995);
    background.setStrokeStyle?.(2.5, 0x63E6FF, 0.98);
  }

  // Chỉ giãn vị trí đúng một lần để tránh panel bị phóng dần khi wrapper chạy lại.
  if (firstPass) {
    topLevel.forEach(child => {
      if (!child || child === background) return;
      if (Number.isFinite(child.x)) child.x *= 1.04;
      if (Number.isFinite(child.y)) child.y *= 1.16;
    });
  }

  // Luôn quét lại text vì một số panel thêm nội dung sau khi mở.
  walkDisplayTree(panel, obj => {
    if (!obj || typeof obj.setFontSize !== 'function') return;
    optimizeTextObject(obj);
  });

  // Nâng vùng chạm tối thiểu cho control nhỏ trên mobile.
  walkDisplayTree(panel, obj => {
    if (!obj?.input || !obj.input.hitArea) return;
    const area = obj.input.hitArea;
    if (area && typeof area.width === 'number' && typeof area.height === 'number') {
      if (area.width < 72) area.width = 72;
      if (area.height < 46) area.height = 46;
    }
  });
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
        this.time.delayedCall(60, () => optimizePanel(this));
      } else if (typeof queueMicrotask === 'function') {
        queueMicrotask(() => optimizePanel(this));
      }
      return result;
    };
    wrapped.__fullscreenModalWrapped = true;
    proto[name] = wrapped;
  });
}
