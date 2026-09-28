import { CRAFTING_SYSTEM } from '../../config/craftingData.js';
import { gameState } from '../../state/gameState.js';
import { W, H } from '../constants.js';

const FONT = 'Be Vietnam Pro, sans-serif';

const RANK_TO_REALM = Object.freeze({
  'Nhất Phẩm': { min: 1, max: 12, label: 'Luyện Khí' },
  'Nhị Phẩm': { min: 13, max: 16, label: 'Trúc Cơ' },
  'Tam Phẩm': { min: 17, max: 20, label: 'Kim Đan' },
  'Tứ Phẩm': { min: 21, max: 24, label: 'Nguyên Anh' },
  'Ngũ Phẩm': { min: 25, max: 28, label: 'Hóa Thần' }
});

const SHOP_PRICE_MULTIPLIER = 2.5;

function getPlayerRankName() {
  const idx = Math.max(0, Number(gameState.realmIdx) || 0);
  if (idx <= 0) return 'Nhất Phẩm';
  if (idx <= 12) return 'Nhất Phẩm';
  if (idx <= 16) return 'Nhị Phẩm';
  if (idx <= 20) return 'Tam Phẩm';
  if (idx <= 24) return 'Tứ Phẩm';
  return 'Ngũ Phẩm';
}

function ensureInventory() {
  if (!gameState.inventory) gameState.inventory = {};
  if (!gameState.inventory.talismans || typeof gameState.inventory.talismans !== 'object') gameState.inventory.talismans = {};
  if (!Array.isArray(gameState.inventory.formations)) gameState.inventory.formations = [];
  if (!gameState.currencies) gameState.currencies = { silver: 0, low: gameState.gold || 0, mid: 0, high: 0, extreme: 0 };
  if (gameState.currencies.low === undefined) gameState.currencies.low = gameState.gold || 0;
}

function getLowStone() {
  ensureInventory();
  return Math.max(0, Number(gameState.currencies.low ?? gameState.gold ?? 0) || 0);
}

function setLowStone(v) {
  ensureInventory();
  const n = Math.max(0, Math.floor(Number(v) || 0));
  gameState.currencies.low = n;
  gameState.gold = n;
}

function shopPrice(item) {
  const base = Math.max(1, Number(item.costGold) || 1);
  return Math.max(1, Math.floor(base * SHOP_PRICE_MULTIPLIER));
}

function stopPointer(pointer) {
  const evt = pointer?.event;
  evt?.stopPropagation?.();
  evt?.preventDefault?.();
}

function pauseWorld(scene) {
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
  if (!scene.__uiWorldPaused && scene.physics?.world?.pause) {
    scene.physics.world.pause();
    scene.__uiWorldPaused = true;
  }
}

function createShell(scene, title, subtitle) {
  scene.closeModal?.();
  const overlay = scene.fixed(scene.add.rectangle(W / 2, H / 2, W + 16, H + 16, 0x010811, 1), 999998)
    .setInteractive({ useHandCursor: false });
  const panel = scene.fixed(scene.add.container(W / 2, H / 2), 1000000);
  scene.activeModal = panel;
  scene.activeModalOverlay = overlay;
  pauseWorld(scene);
  overlay.on('pointerdown', stopPointer);
  overlay.on('pointerup', stopPointer);
  overlay.on('pointermove', stopPointer);

  const bg = scene.add.rectangle(0, 0, W - 8, H - 8, 0x082638, 1).setStrokeStyle(2.5, 0x61ffc0, 1);
  const header = scene.add.rectangle(0, -424, W - 20, 92, 0x0a3a31, 1).setStrokeStyle(1.5, 0x61ffc0, 0.95);
  const t = scene.add.text(-238, -444, title, { fontFamily: FONT, fontSize: '22px', fontStyle: 'bold', color: '#fff19a' }).setOrigin(0, 0.5);
  const s = scene.add.text(-238, -410, subtitle, { fontFamily: FONT, fontSize: '12px', color: '#b7ffe0' }).setOrigin(0, 0.5);
  panel.add([bg, header, t, s]);
  scene.createModalCloseBtn?.(panel);
  return panel;
}

function button(scene, panel, x, y, w, h, label, onPress, enabled = true) {
  const bg = scene.add.rectangle(x, y, w, h, enabled ? 0x0f5a48 : 0x26373a, 1)
    .setStrokeStyle(2, enabled ? 0x61ffc0 : 0x56666a, 1)
    .setInteractive({ useHandCursor: enabled });
  const txt = scene.add.text(x, y, label, {
    fontFamily: FONT, fontSize: '14px', fontStyle: 'bold', color: enabled ? '#ffffff' : '#8a999c',
    align: 'center', wordWrap: { width: w - 18, useAdvancedWrap: true }
  }).setOrigin(0.5);
  if (enabled) bg.on('pointerdown', p => { stopPointer(p); onPress?.(); });
  panel.add([bg, txt]);
}

function getStock(type) {
  const rank = getPlayerRankName();
  const source = type === 'formations' ? CRAFTING_SYSTEM.formations : CRAFTING_SYSTEM.talismans;
  return (source || []).filter(item => item.rank === rank);
}

export function installMerchantTalismanFormationShop(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__merchantTalismanFormationShopInstalled) return;
  const proto = MainGameScene.prototype;
  proto.__merchantTalismanFormationShopInstalled = true;

  proto.buyMerchantSpecialItem = function buyMerchantSpecialItem(type, item) {
    ensureInventory();
    if (!item) return { success: false, msg: 'Vật phẩm không hợp lệ.' };
    const price = shopPrice(item);
    const have = getLowStone();
    if (have < price) return { success: false, msg: `Không đủ Linh Thạch Sơ Cấp. Cần ${price}.` };

    if (type === 'formations' && gameState.inventory.formations.includes(item.name)) {
      return { success: false, msg: 'Bạn đã sở hữu trận pháp này.' };
    }

    setLowStone(have - price);
    if (type === 'talismans') {
      gameState.inventory.talismans[item.name] = (gameState.inventory.talismans[item.name] || 0) + 1;
    } else {
      gameState.inventory.formations.push(item.name);
    }
    this.updateHUD?.();
    return { success: true, msg: `Đã mua ${item.name}.` };
  };

  proto.openMerchantSpecialShop = function openMerchantSpecialShop(type = 'talismans') {
    ensureInventory();
    const rank = getPlayerRankName();
    const realmLabel = RANK_TO_REALM[rank]?.label || rank;
    const isFormation = type === 'formations';
    const title = isFormation ? '☸ VẠN BẢO CÁC • TRẬN PHÁP' : '📜 VẠN BẢO CÁC • PHÙ LỤC';
    const panel = createShell(this, title, `${rank} • phù hợp ${realmLabel} • Giá bán đã gồm phí thương hội`);

    button(this, panel, -120, -346, 220, 48, '📜 PHÙ LỤC', () => this.openMerchantSpecialShop('talismans'), !(!isFormation));
    button(this, panel, 120, -346, 220, 48, '☸ TRẬN PHÁP', () => this.openMerchantSpecialShop('formations'), !(isFormation));

    const wallet = this.add.text(-220, -300, `✨ Linh Thạch Sơ Cấp: ${getLowStone()}`, {
      fontFamily: FONT, fontSize: '14px', fontStyle: 'bold', color: '#ffe77a'
    }).setOrigin(0, 0.5);
    panel.add(wallet);

    const items = getStock(type);
    if (!items.length) {
      const empty = this.add.text(0, -40, `Vạn Bảo Các chưa có ${rank} ${isFormation ? 'trận pháp' : 'phù lục'}.`, {
        fontFamily: FONT, fontSize: '17px', color: '#c8f4ff'
      }).setOrigin(0.5);
      panel.add(empty);
      return;
    }

    items.slice(0, 6).forEach((item, idx) => {
      const y = -230 + idx * 104;
      const price = shopPrice(item);
      const owned = isFormation
        ? (gameState.inventory.formations.includes(item.name) ? 1 : 0)
        : (gameState.inventory.talismans[item.name] || 0);
      const box = this.add.rectangle(0, y, 474, 86, 0x0d3347, 1).setStrokeStyle(1.5, 0x3c91aa, 1);
      const name = this.add.text(-218, y - 22, item.name, {
        fontFamily: FONT, fontSize: '15px', fontStyle: 'bold', color: '#ffffff', wordWrap: { width: 310, useAdvancedWrap: true }
      }).setOrigin(0, 0.5);
      const meta = this.add.text(-218, y + 6, `${item.desc || ''}`, {
        fontFamily: FONT, fontSize: '11px', color: '#bfefff', wordWrap: { width: 310, useAdvancedWrap: true }
      }).setOrigin(0, 0.5);
      const own = this.add.text(-218, y + 30, `Có: ${owned}`, { fontFamily: FONT, fontSize: '11px', color: '#8fffd0' }).setOrigin(0, 0.5);
      panel.add([box, name, meta, own]);

      const canBuy = getLowStone() >= price && (!isFormation || owned === 0);
      button(this, panel, 164, y, 126, 52, isFormation && owned ? 'ĐÃ CÓ' : `MUA\n${price} ✨`, () => {
        const result = this.buyMerchantSpecialItem(type, item);
        this.showFloatingText?.(this.player?.x ?? 270, (this.player?.y ?? 620) - 70, result.msg, result.success ? '#61ffc0' : '#ff8b9a', '13px');
        this.openMerchantSpecialShop(type);
      }, canBuy);
    });
  };
}
