import { gameState } from '../../state/gameState.js';
import { ALL_ITEMS } from '../../config/itemsData.js';
import { ALL_HERBS } from '../../config/herbsData.js';
import { ALL_MINERALS } from '../../config/mineralsData.js';
import { CRAFTING_SYSTEM } from '../../config/craftingData.js';
import {
  ALL_ELEMENTAL_ITEMS,
  ELEMENTAL_GEAR_ITEMS,
  ELEMENTAL_HERBS,
  ELEMENTAL_ORES,
  ELEMENTAL_PILLS,
  ELEMENTAL_TALISMANS,
  ELEMENTAL_CATALOG_STATS,
  getElementalIconMeta,
  rollElementalItemDrop
} from '../../config/elementalItemCatalog.js';

let registered = false;

function pushUnique(target, additions) {
  if (!Array.isArray(target)) return;
  const ids = new Set(target.map(item => item?.id).filter(Boolean));
  additions.forEach(item => {
    if (!ids.has(item.id)) {
      target.push(item);
      ids.add(item.id);
    }
  });
}

/**
 * Gắn catalog mới vào các registry cũ để toàn bộ UI hiện tại (túi đồ, luyện đan,
 * phù lục, linh thảo, khoáng thạch, trang bị) dùng chung dữ liệu mà không cần
 * tạo thêm một hệ inventory song song.
 */
export function registerElementalItemDefinitions() {
  if (registered) return ELEMENTAL_CATALOG_STATS;
  registered = true;

  pushUnique(ALL_ITEMS, ELEMENTAL_GEAR_ITEMS);
  pushUnique(ALL_HERBS, ELEMENTAL_HERBS);
  pushUnique(ALL_MINERALS, ELEMENTAL_ORES);
  if (!Array.isArray(CRAFTING_SYSTEM.pills)) CRAFTING_SYSTEM.pills = [];
  if (!Array.isArray(CRAFTING_SYSTEM.talismans)) CRAFTING_SYSTEM.talismans = [];
  pushUnique(CRAFTING_SYSTEM.pills, ELEMENTAL_PILLS);
  pushUnique(CRAFTING_SYSTEM.talismans, ELEMENTAL_TALISMANS);

  return ELEMENTAL_CATALOG_STATS;
}

function ensureStores() {
  if (!gameState.inventory || typeof gameState.inventory !== 'object') {
    gameState.inventory = { items: [], pills: {}, talismans: {}, formations: [] };
  }
  if (!Array.isArray(gameState.inventory.items)) gameState.inventory.items = [];
  if (!gameState.inventory.pills || typeof gameState.inventory.pills !== 'object') gameState.inventory.pills = {};
  if (!gameState.inventory.talismans || typeof gameState.inventory.talismans !== 'object') gameState.inventory.talismans = {};
  if (!gameState.herbs || typeof gameState.herbs !== 'object') gameState.herbs = {};
  if (!gameState.materials || typeof gameState.materials !== 'object') gameState.materials = {};
  if (!gameState.materials.minerals || typeof gameState.materials.minerals !== 'object') gameState.materials.minerals = {};
}

function addCount(store, key, amount=1) {
  store[key] = Math.max(0, Number(store[key]) || 0) + Math.max(1, Number(amount) || 1);
}

export function addElementalItemToInventory(item, amount=1) {
  if (!item) return false;
  ensureStores();
  const qty = Math.max(1, Math.floor(Number(amount) || 1));

  switch (item.kind) {
    case 'gear':
      for (let i = 0; i < qty; i += 1) gameState.inventory.items.push({ ...item });
      break;
    case 'pill':
      addCount(gameState.inventory.pills, item.name, qty);
      break;
    case 'talisman':
      addCount(gameState.inventory.talismans, item.name, qty);
      break;
    case 'herb':
      addCount(gameState.herbs, item.name, qty);
      break;
    case 'ore':
      addCount(gameState.materials.minerals, item.id, qty);
      break;
    default:
      return false;
  }
  return true;
}

function roundedRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/**
 * Tạo icon vector 48x48 ngay trong runtime.
 * Không thêm hàng trăm PNG vào repo, nhưng mỗi item vẫn có texture key riêng,
 * màu hệ + viền phẩm + ký hiệu loại vật phẩm rõ ràng trên mobile.
 */
export function ensureElementalItemTexture(scene, item) {
  if (!scene?.textures || !item?.icon || scene.textures.exists(item.icon)) return item?.icon || null;
  if (typeof document === 'undefined') return null;

  const meta = getElementalIconMeta(item);
  const canvas = document.createElement('canvas');
  canvas.width = 48;
  canvas.height = 48;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const gradient = ctx.createLinearGradient(0, 0, 48, 48);
  gradient.addColorStop(0, meta.systemDark);
  gradient.addColorStop(0.65, '#101820');
  gradient.addColorStop(1, '#05090d');
  roundedRect(ctx, 1.5, 1.5, 45, 45, 8);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = meta.rankColor;
  ctx.stroke();

  ctx.fillStyle = meta.systemColor;
  ctx.globalAlpha = 0.24;
  ctx.beginPath();
  ctx.arc(24, 22, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 15px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(meta.kindCode, 24, 21);

  ctx.font = '700 8px sans-serif';
  ctx.fillStyle = meta.systemColor;
  ctx.fillText(meta.systemCode, 15, 38);

  ctx.fillStyle = meta.rankColor;
  ctx.beginPath();
  ctx.arc(39, 38, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = '700 7px sans-serif';
  ctx.fillStyle = '#071014';
  ctx.fillText(meta.rankLabel, 39, 38.5);

  scene.textures.addCanvas(item.icon, canvas);
  return item.icon;
}

export function createAllElementalItemTextures(scene) {
  ALL_ELEMENTAL_ITEMS.forEach(item => ensureElementalItemTexture(scene, item));
}

function itemDropColor(item) {
  const meta = getElementalIconMeta(item);
  const hex = String(meta.systemColor || '#ffd166').replace('#', '');
  return Number.parseInt(hex, 16) || 0xffd166;
}

function awardLabel(item) {
  const kind = { gear:'Trang Bị', pill:'Đan Dược', talisman:'Phù Chú', herb:'Linh Thảo', ore:'Khoáng Thạch' }[item.kind] || 'Vật Phẩm';
  return `${kind} • Hệ ${item.elementName} • ${item.realm}`;
}

function spawnCatalogGroundDrop(scene, x, y, item, winnerInfo={}, isParty=false) {
  if (!scene?.add || !item) return null;
  ensureElementalItemTexture(scene, item);
  if (!scene.elementalGroundDrops) scene.elementalGroundDrops = [];

  const color = itemDropColor(item);
  const container = scene.add.container(x + 32, y - 9).setDepth(Math.floor(y) + 18);
  const aura = scene.add.ellipse(0, 12, 44, 16, color, 0.34);
  const iconBg = scene.add.rectangle(0, -8, 39, 39, 0x071017, 0.92).setStrokeStyle(2, color, 1);
  const icon = scene.textures.exists(item.icon)
    ? scene.add.image(0, -8, item.icon).setDisplaySize(35, 35)
    : scene.add.text(0, -8, '✦', { fontSize:'24px', color:item.color || '#fff' }).setOrigin(0.5);
  const labelBg = scene.add.rectangle(0, -42, 190, 24, 0x071017, 0.91).setStrokeStyle(1, color, 0.95);
  const label = scene.add.text(0, -42, item.name, {
    fontFamily:'sans-serif', fontSize:'8px', fontStyle:'bold', color:'#fff9dc',
    align:'center', wordWrap:{ width:182, useAdvancedWrap:true }
  }).setOrigin(0.5);
  const sub = scene.add.text(0, -27, awardLabel(item), {
    fontFamily:'sans-serif', fontSize:'7px', color:item.color || '#d9f7ff'
  }).setOrigin(0.5);

  container.add([aura, iconBg, icon, labelBg, label, sub]);
  scene.elementalGroundDrops.push(container);

  scene.tweens.add({ targets:aura, scaleX:1.35, scaleY:1.35, alpha:0.12, duration:520, yoyo:true, repeat:-1 });
  scene.tweens.add({ targets:icon, y:{ from:-26, to:-8 }, duration:420, ease:'Bounce.easeOut' });

  const playerOwns = winnerInfo.winnerType === 'player' || winnerInfo.winnerType === 'party';
  const playerReceivesPartyShare = !isParty || Math.random() < 0.20;

  scene.time.delayedCall(2300, () => {
    if (!container?.active || !scene.scene?.isActive()) return;
    const idx = scene.elementalGroundDrops.indexOf(container);
    if (idx >= 0) scene.elementalGroundDrops.splice(idx, 1);

    if (!playerOwns || !playerReceivesPartyShare) {
      const msg = !playerOwns
        ? `${winnerInfo.winnerName || 'Tán Tu'} đã nhặt ${item.name}`
        : `Đồng đội nhận ${item.name}`;
      scene.showFloatingText?.(x, y - 55, msg, '#a7c7e7', '10px');
      container.destroy();
      return;
    }

    const px = scene.player?.x ?? x;
    const py = (scene.player?.y ?? y) - 26;
    scene.tweens.add({
      targets:container, x:px, y:py, scaleX:0.16, scaleY:0.16, alpha:0.15,
      duration:330, ease:'Cubic.easeIn',
      onComplete:() => {
        addElementalItemToInventory(item, 1);
        container.destroy();
        scene.showFloatingText?.(px, py - 34, `+1 ${item.name}`, item.color || '#fde68a', '11px');
        scene.updateHUD?.();
      }
    });
  });

  return container;
}

export function installElementalItemSystem(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__elementalItemSystemInstalled) return;
  registerElementalItemDefinitions();

  const proto = MainGameScene.prototype;
  proto.__elementalItemSystemInstalled = true;
  proto.elementalItemCatalogStats = ELEMENTAL_CATALOG_STATS;
  proto.addElementalItemToInventory = function(item, amount=1) {
    const ok = addElementalItemToInventory(item, amount);
    if (ok) ensureElementalItemTexture(this, item);
    return ok;
  };
  proto.spawnElementalItemGroundDrop = function(x, y, item, winnerInfo, isParty) {
    return spawnCatalogGroundDrop(this, x, y, item, winnerInfo, isParty);
  };

  // Sinh texture trước khi người chơi có thể mở túi đồ.
  const originalCreate = proto.create;
  proto.create = function elementalItemsCreateWrapper(...args) {
    const result = originalCreate.apply(this, args);
    createAllElementalItemTextures(this);
    return result;
  };

  // Bổ sung vật phẩm theo hệ vào drop table hiện có, giữ nguyên toàn bộ loot cũ.
  const originalBuildDropTable = proto.buildEnemyDropTable;
  if (typeof originalBuildDropTable === 'function') {
    proto.buildEnemyDropTable = function elementalBuildDropTable(enemy) {
      const bundle = originalBuildDropTable.call(this, enemy) || {};
      bundle.elementalItem = rollElementalItemDrop(enemy);
      return bundle;
    };
  }

  // Ground loot cũ vẫn hoạt động; item theo hệ xuất hiện cạnh túi chiến lợi phẩm với icon thật.
  const originalSpawnGroundLootDrop = proto.spawnGroundLootDrop;
  if (typeof originalSpawnGroundLootDrop === 'function') {
    proto.spawnGroundLootDrop = function elementalGroundLootWrapper(x, y, dropBundle, winnerInfo, isParty) {
      const result = originalSpawnGroundLootDrop.call(this, x, y, dropBundle, winnerInfo, isParty);
      const item = dropBundle?.elementalItem;
      if (item) this.spawnElementalItemGroundDrop(x, y, item, winnerInfo, isParty);
      return result;
    };
  }

  // Dọn item rơi khi đổi/khởi tạo lại battlefield, tránh icon tồn tại trên map cũ.
  const originalInitBattlefield = proto.initBattlefield;
  if (typeof originalInitBattlefield === 'function') {
    proto.initBattlefield = function elementalBattlefieldWrapper(...args) {
      (this.elementalGroundDrops || []).forEach(drop => drop?.destroy?.());
      this.elementalGroundDrops = [];
      return originalInitBattlefield.apply(this, args);
    };
  }
}
