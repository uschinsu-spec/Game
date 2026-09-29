/**
 * ItemIconStreaming.js
 * P0 item texture streaming:
 * - never preload GAME_ITEM_ICONS as a catalog
 * - inventory requests only icon keys for items the player actually owns
 * - ground loot requests only the icon shown by that live drop
 * - combat shared assets no longer preload beast material icons
 */
import { GAME_ITEM_ICONS } from '../../config/iconManifest.js?v=20260929-item-icon-stream-v1';
import { gameState } from '../../state/gameState.js';
import { CRAFTING_SYSTEM } from '../../config/craftingData.js';
import { getHerbByName } from '../../config/herbsData.js';
import { ALL_MINERALS } from '../../config/mineralsData.js';
import { getMapById } from '../../config/world/worldRegistry.js?v=20260929-single-map-system-v1';

const OWNER = 'ItemIconStreaming';
const A = './assets/';
const ICON_PATH_BY_KEY = new Map(GAME_ITEM_ICONS);

function isQueued(scene, key) {
  const entries = scene?.load?.list?.entries;
  return Array.isArray(entries) && entries.some(file => file?.key === key);
}

function iconKeyOf(item) {
  if (!item) return null;
  if (typeof item === 'string') return item;
  return item.iconKey || item.icon || item.textureKey || null;
}

function waitForImage(scene, key, path) {
  if (!key || !path) return Promise.resolve(null);
  if (scene.textures?.exists?.(key)) return Promise.resolve(key);

  if (!scene.__itemIconPromises) scene.__itemIconPromises = new Map();
  if (scene.__itemIconPromises.has(key)) return scene.__itemIconPromises.get(key);

  const promise = new Promise(resolve => {
    const fileEvent = `filecomplete-image-${key}`;
    const cleanup = () => {
      scene.load.off(fileEvent, onComplete);
      scene.load.off('loaderror', onError);
    };
    const onComplete = () => {
      cleanup();
      resolve(scene.textures?.exists?.(key) ? key : null);
    };
    const onError = file => {
      if (file?.key !== key) return;
      cleanup();
      console.warn('[ItemIconStreaming] Icon load failed:', key, file?.src || path);
      resolve(null);
    };

    scene.load.once(fileEvent, onComplete);
    scene.load.on('loaderror', onError);
    if (!isQueued(scene, key)) scene.load.image(key, A + path);
    const busy = typeof scene.load.isLoading === 'function' ? scene.load.isLoading() : false;
    if (!busy) scene.load.start();
  }).finally(() => scene.__itemIconPromises?.delete?.(key));

  scene.__itemIconPromises.set(key, promise);
  return promise;
}

function positive(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) && n > 0;
}

function collectOwnedFileBackedIcons() {
  const keys = new Set();
  const add = (key, count = 1) => {
    if (positive(count) && key && ICON_PATH_BY_KEY.has(key)) keys.add(key);
  };

  add('mat_ore', gameState.ores);
  add('mat_beast_pelt', gameState.materials?.beastPelts);
  add('mat_beast_fur', gameState.materials?.beastFurs);
  add('mat_beast_claw', gameState.materials?.beastClaws);
  add('mat_beast_blood', gameState.materials?.beastBlood);
  add('mat_beast_horn', gameState.materials?.beastHorns);

  if (gameState.herbs && typeof gameState.herbs === 'object') {
    Object.entries(gameState.herbs).forEach(([name, count]) => {
      const def = getHerbByName(name);
      add(def?.icon || 'mat_herb', count);
    });
  } else {
    add('mat_herb', gameState.herbs);
  }

  Object.entries(gameState.inventory?.pills || {}).forEach(([name, count]) => {
    const def = CRAFTING_SYSTEM.pills?.find(item => item.name === name);
    add(def?.icon, count);
  });
  Object.entries(gameState.inventory?.talismans || {}).forEach(([name, count]) => {
    const def = CRAFTING_SYSTEM.talismans?.find(item => item.name === name);
    add(def?.icon, count);
  });

  const formationCounts = new Map();
  (gameState.inventory?.formations || []).forEach(name => formationCounts.set(name, (formationCounts.get(name) || 0) + 1));
  formationCounts.forEach((count, name) => {
    const def = CRAFTING_SYSTEM.formations?.find(item => item.name === name);
    add(def?.icon, count);
  });

  (gameState.inventory?.items || []).forEach(item => add(item?.icon, 1));

  Object.entries(gameState.materials?.beastCores || {}).forEach(([key, count]) => add(`core_${key}`, count));
  Object.entries(gameState.materials?.minerals || {}).forEach(([key, count]) => {
    const def = ALL_MINERALS.find(item => item.id === key || item.id === `ore_${key}`);
    add(def?.icon || 'mat_ore', count);
  });

  return [...keys];
}

function queueRequiredImage(scene, key, url, required) {
  if (!key || !url) return;
  required.add(key);
  if (!scene.textures?.exists?.(key) && !isQueued(scene, key)) scene.load.image(key, url);
}

function queueRequiredSheet(scene, key, url, config, required) {
  if (!key || !url) return;
  required.add(key);
  if (!scene.textures?.exists?.(key) && !isQueued(scene, key)) scene.load.spritesheet(key, url, config);
}

function waitForRequiredTextures(scene, batchKey, required) {
  const missing = [...required].filter(key => !scene.textures?.exists?.(key));
  if (!missing.length) return Promise.resolve(true);
  if (!scene.__itemStreamBatchPromises) scene.__itemStreamBatchPromises = new Map();
  if (scene.__itemStreamBatchPromises.has(batchKey)) return scene.__itemStreamBatchPromises.get(batchKey);

  const promise = new Promise((resolve, reject) => {
    const onComplete = () => {
      cleanup();
      const stillMissing = [...required].filter(key => !scene.textures?.exists?.(key));
      if (stillMissing.length) reject(new Error(`Thiếu asset: ${stillMissing.slice(0, 4).join(', ')}`));
      else resolve(true);
    };
    const cleanup = () => scene.load.off('complete', onComplete);
    scene.load.once('complete', onComplete);
    const busy = typeof scene.load.isLoading === 'function' ? scene.load.isLoading() : false;
    if (!busy) scene.load.start();
  }).finally(() => scene.__itemStreamBatchPromises?.delete?.(batchKey));

  scene.__itemStreamBatchPromises.set(batchKey, promise);
  return promise;
}

function queueCombatSharedAssetsWithoutLootIcons(scene) {
  const required = new Set();

  // World resource visuals are needed by the active combat map. Beast loot icons
  // are deliberately excluded and are loaded only when a matching drop exists.
  queueRequiredImage(scene, 'mat_herb', `${A}icons/materials/herb.png`, required);
  queueRequiredImage(scene, 'mat_ore', `${A}icons/materials/ore.png`, required);
  for (let h = 1; h <= 7; h++) queueRequiredImage(scene, `herb_${h}`, `${A}icons/materials/herb_${h}.png`, required);

  const elemDirs = {
    hoa: 'fire', loi: 'lightning', kim: 'metal', thuy: 'water',
    phong: 'wind', moc: 'wood', tho: 'earth', ly: 'physical'
  };
  Object.entries(elemDirs).forEach(([elemKey, dirName]) => {
    queueRequiredImage(scene, `vfx_${elemKey}_1`, `${A}vfx/elemental/${dirName}/proj_1.png`, required);
    for (let f = 0; f < 8; f++) queueRequiredImage(scene, `vfx_${elemKey}_1_${f}`, `${A}vfx/elemental/${dirName}/frame_${f}.png`, required);
    queueRequiredImage(scene, `vfx_${elemKey}_2`, `${A}vfx/elemental/${dirName}/proj_2.png`, required);
    queueRequiredImage(scene, `vfx_${elemKey}_3`, `${A}vfx/elemental/${dirName}/array_3.png`, required);
    queueRequiredImage(scene, `vfx_${elemKey}_4`, `${A}vfx/elemental/${dirName}/swarm_4.png`, required);
    queueRequiredImage(scene, `vfx_${elemKey}_5`, `${A}vfx/elemental/${dirName}/colossus_5.png`, required);
    queueRequiredImage(scene, `vfx_${elemKey}_shockwave`, `${A}vfx/elemental/${dirName}/shockwave.png`, required);
    queueRequiredImage(scene, `vfx_${elemKey}_impact`, `${A}vfx/elemental/${dirName}/impact.png`, required);
  });

  for (let i = 0; i < 8; i++) {
    queueRequiredImage(scene, `vfx_kim_1_${i}`, `${A}vfx/sword/kim_1_frame_${i}.png`, required);
    queueRequiredImage(scene, `vfx_kim_2_${i}`, `${A}vfx/sword/kim_2_frame_${i}.png`, required);
  }
  queueRequiredImage(scene, 'vfx_kim_3_0', `${A}vfx/sword/kim_3_frame_0.png`, required);
  queueRequiredImage(scene, 'vfx_tru_tien_shockwave', `${A}vfx/sword/tru_tien_shockwave.png`, required);
  queueRequiredImage(scene, 'vfx_sword_impact_frame7', `${A}vfx/atlas/frame_7.png`, required);
  queueRequiredImage(scene, 'vfx_impact_frame7', `${A}vfx/atlas/frame_7.png`, required);
  queueRequiredImage(scene, 'vfx_sword_kiem_khi', `${A}vfx/sword/kiem_khi.png`, required);
  queueRequiredImage(scene, 'vfx_giant_tru_tien_sword', `${A}vfx/sword/giant_tru_tien_sword.png`, required);
  queueRequiredImage(scene, 'vfx_loi', `${A}vfx/sword/vfx_loi.png`, required);
  queueRequiredImage(scene, 'vfx_heal', `${A}vfx/skills/vfx_heal.png`, required);
  queueRequiredImage(scene, 'vfx_shield', `${A}vfx/skills/vfx_shield.png`, required);
  queueRequiredImage(scene, 'vfx_speed', `${A}vfx/skills/vfx_speed.png`, required);
  queueRequiredImage(scene, 'vfx_divine', `${A}vfx/ultimates/vfx_divine.png`, required);
  queueRequiredSheet(scene, 'vfx', `${A}vfx/atlas/vfx_atlas.png`, { frameWidth: 128, frameHeight: 128 }, required);
  return required;
}

function registerCombatVfxAnimations(scene) {
  ['hoa', 'loi', 'kim', 'thuy', 'phong', 'moc', 'tho', 'ly'].forEach(elemKey => {
    const animKey = `anim_vfx_${elemKey}_1`;
    if (!scene.anims.exists(animKey)) {
      scene.anims.create({ key: animKey, frames: [0,1,2,3,4,5,6].map(f => ({ key: `vfx_${elemKey}_1_${f}` })), frameRate: 9, repeat: -1 });
    }
  });
  if (!scene.anims.exists('anim_vfx_kiem_1')) scene.anims.create({ key: 'anim_vfx_kiem_1', frames: [0,1,2,3,4,5,6].map(f => ({ key: `vfx_kim_1_${f}` })), frameRate: 9, repeat: -1 });
  if (!scene.anims.exists('anim_vfx_kim_2_fly')) scene.anims.create({ key: 'anim_vfx_kim_2_fly', frames: [0,1].map(f => ({ key: `vfx_kim_2_${f}` })), frameRate: 8, repeat: -1 });
  if (!scene.anims.exists('anim_vfx_kim_2_hit')) scene.anims.create({ key: 'anim_vfx_kim_2_hit', frames: [2,3,4,5,6,7].map(f => ({ key: `vfx_kim_2_${f}` })), frameRate: 14, repeat: 0 });
}

function replaceDropPlaceholder(scene, container, iconKey) {
  if (!container?.active || !scene.textures?.exists?.(iconKey)) return;
  const placeholder = (container.list || []).find(child => child?.type === 'Text' && (child.text === '🔮' || child.text === '🎒'));
  if (!placeholder) return;
  const x = placeholder.x;
  const y = placeholder.y;
  const alpha = placeholder.alpha;
  placeholder.destroy();
  const image = scene.add.image(x, y, iconKey).setDisplaySize(28, 28).setAlpha(alpha);
  container.add(image);
}

export function installItemIconStreaming(MainGameScene) {
  const proto = MainGameScene?.prototype;
  if (!proto || proto.__itemIconStreamingInstalled) return;
  proto.__itemIconStreamingInstalled = true;
  proto.__itemIconStreamingOwner = OWNER;

  proto.ensureItemIconLoaded = function ensureItemIconLoaded(item) {
    const key = iconKeyOf(item);
    if (!key) return Promise.resolve(null);
    if (this.textures?.exists?.(key)) return Promise.resolve(key);
    const path = ICON_PATH_BY_KEY.get(key);
    if (!path) return Promise.resolve(null);
    return waitForImage(this, key, path);
  };

  proto.ensureItemIconsLoaded = function ensureItemIconsLoaded(items) {
    const unique = new Map();
    (items || []).forEach(item => {
      const key = iconKeyOf(item);
      if (key && !unique.has(key)) unique.set(key, item);
    });
    return Promise.all([...unique.values()].map(item => this.ensureItemIconLoaded(item)));
  };

  proto.ensureOwnedInventoryIconsLoaded = function ensureOwnedInventoryIconsLoaded() {
    const keys = collectOwnedFileBackedIcons();
    return this.ensureItemIconsLoaded(keys);
  };

  // Replace MapZoneAssetStreaming's combat-shared gate so beast material icons
  // are not downloaded until a concrete ground drop asks for one.
  proto.ensureCombatSharedAssets = function ensureCombatSharedAssetsWithoutLootIcons() {
    const map = getMapById(gameState.currentMapId);
    if (!map || map.isPeaceZone || Number(map.id) === 0) return Promise.resolve(false);
    if (this.__combatAssetsReady) return Promise.resolve(true);
    if (this.__combatSharedPromise) return this.__combatSharedPromise;

    const required = queueCombatSharedAssetsWithoutLootIcons(this);
    this.__combatSharedPromise = waitForRequiredTextures(this, 'combat-shared-no-loot-icons', required)
      .then(() => {
        registerCombatVfxAnimations(this);
        if (!this.__combatVfxPoolReady && this.textures?.exists?.('vfx')) {
          if (this.vfxPool?.destroy) this.vfxPool.destroy(true);
          this.createVfxPool?.();
          this.__combatVfxPoolReady = true;
        }
        this.__combatAssetsReady = true;
        return true;
      })
      .catch(error => {
        this.__combatSharedPromise = null;
        console.warn('[ItemIconStreaming] Combat shared assets failed:', error);
        return false;
      });
    return this.__combatSharedPromise;
  };

  const originalOpenGearPanel = proto.openGearPanel;
  if (typeof originalOpenGearPanel === 'function') {
    proto.openGearPanel = function streamedInventoryIcons(...args) {
      const view = args[0];
      if (view === -1 || view === 'equip') return originalOpenGearPanel.apply(this, args);

      const missing = collectOwnedFileBackedIcons().filter(key => !this.textures?.exists?.(key));
      const requestId = (this.__inventoryIconRequestId || 0) + 1;
      this.__inventoryIconRequestId = requestId;
      const result = originalOpenGearPanel.apply(this, args);
      const panel = this.activeModal;

      if (missing.length) {
        this.ensureItemIconsLoaded(missing).then(() => {
          if (!this.scene?.isActive?.()) return;
          if (this.__inventoryIconRequestId !== requestId) return;
          if (this.activeModal !== panel) return;
          originalOpenGearPanel.apply(this, args);
        });
      }
      return result;
    };
  }

  const originalSpawnGroundLootDrop = proto.spawnGroundLootDrop;
  if (typeof originalSpawnGroundLootDrop === 'function') {
    proto.spawnGroundLootDrop = function streamedGroundLootIcon(x, y, dropBundle, winnerInfo, isParty) {
      const core = dropBundle?.beastCore;
      const iconKey = core ? `core_${core.key}` : 'mat_beast_pelt';
      const result = originalSpawnGroundLootDrop.call(this, x, y, dropBundle, winnerInfo, isParty);
      const container = this.groundDrops?.[this.groundDrops.length - 1];

      if (container?.active && !this.textures?.exists?.(iconKey)) {
        this.ensureItemIconLoaded(iconKey).then(loadedKey => {
          if (loadedKey) replaceDropPlaceholder(this, container, loadedKey);
        });
      }
      return result;
    };
  }
}
