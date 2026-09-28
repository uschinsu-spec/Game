import { W, H } from '../constants.js';

function applyTransparentBottomMenu(scene) {
  const container = scene?.menuContainer;
  if (!container?.active || !Array.isArray(container.list)) return;

  // Only remove the large black/nav background. Keep every icon, label and
  // invisible interactive hit area untouched so mobile controls behave exactly
  // as before.
  const navBg = container.list.find(obj => {
    if (!obj || obj.type !== 'Rectangle') return false;
    const width = Number(obj.width || obj.displayWidth || 0);
    const height = Number(obj.height || obj.displayHeight || 0);
    return width >= W - 100 && height >= 50 && Math.abs((obj.y || 0) - (H - 36)) <= 8;
  });

  if (navBg) {
    navBg.setFillStyle?.(0x000000, 0);
    navBg.setStrokeStyle?.(0, 0x000000, 0);
    navBg.setAlpha?.(0);
  }

  // Keep labels readable over bright maps without recreating a dark bar.
  container.list.forEach(obj => {
    if (obj?.type !== 'Text') return;
    if ((obj.y || 0) < H - 65) return;
    obj.setStroke?.('#173246', 3);
  });
}

export function installTransparentBottomMenuOptimization(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__transparentBottomMenuInstalled) return;
  const proto = MainGameScene.prototype;
  proto.__transparentBottomMenuInstalled = true;

  const original = proto.createBottomNav;
  if (typeof original !== 'function') return;

  proto.createBottomNav = function createBottomNavWithoutBlackBackground(...args) {
    const result = original.apply(this, args);
    applyTransparentBottomMenu(this);
    return result;
  };

  proto.refreshTransparentBottomMenu = function refreshTransparentBottomMenu() {
    applyTransparentBottomMenu(this);
  };
}
