/**
 * BootAssetOptimizationV3.js
 * P0 startup optimization:
 * - boot only the current panorama + player + visible HUD/menu assets
 * - call window.__GAME_BOOT__.ready() through the normal first scene create
 * - keep enemy/NPC/VFX catalogs out of Map 0 boot and out of global preload
 * - NEVER enumerate GAME_ITEM_ICONS during boot/post-boot; item textures are
 *   owned by ItemIconStreaming and requested only by inventory/drop demand
 */
import { ELEMENTAL_SKILLS } from '../../config/skillsData.js?v=20260928-skill-mastery-vfx-v4';
import {
  getMapById,
  resolvePanoramaMap
} from '../../config/world/worldRegistry.js?v=20260930-canonical-geography-v1';
import { gameState } from '../../state/gameState.js';

const ASSET_ROOT = './assets/';
const BOOT_OWNER = 'BootAssetOptimizationV3';

function isQueued(scene, key) {
  const entries = scene?.load?.list?.entries;
  return Array.isArray(entries) && entries.some(file => file?.key === key);
}

function queueImage(scene, key, url) {
  if (!key || !url || scene.textures?.exists?.(key) || isQueued(scene, key)) return false;
  scene.load.image(key, url);
  return true;
}

function queueSpriteSheet(scene, key, url, config) {
  if (!key || !url || scene.textures?.exists?.(key) || isQueued(scene, key)) return false;
  scene.load.spritesheet(key, url, config);
  return true;
}

function queueBootAssets(scene) {
  const A = ASSET_ROOT;
  const currentMap = getMapById(gameState.currentMapId);
  const panoramaMap = resolvePanoramaMap(currentMap);

  // Exactly one panorama: the map used for the first playable frame.
  if (panoramaMap?.panoramaKey && panoramaMap?.panoramaAsset) {
    queueImage(scene, panoramaMap.panoramaKey, A + panoramaMap.panoramaAsset);
  }

  // Player assets required to render/control the first frame (12-frame 192x192 sheets).

  queueSpriteSheet(scene, 'player_idle', A + 'characters/player/player_idle.webp', { frameWidth: 192, frameHeight: 192 });
  queueSpriteSheet(scene, 'player_run', A + 'characters/player/player_run.webp', { frameWidth: 192, frameHeight: 192 });
  queueSpriteSheet(scene, 'player_attack', A + 'characters/player/player_attack.webp', { frameWidth: 192, frameHeight: 192 });
  queueSpriteSheet(scene, 'player_fly', A + 'characters/player/player_fly.webp', { frameWidth: 192, frameHeight: 192 });
  queueSpriteSheet(scene, 'player_fly_attack', A + 'characters/player/player_fly_attack.webp', { frameWidth: 192, frameHeight: 192 });

  // Core Hub background assets (Thôn Trấn / Thành Thị / Tông Môn / Gia Tộc)
  queueImage(scene, 'bg_village_hub', A + 'environment/THON TRAN.webp');
  queueImage(scene, 'bg_city_hub', A + 'environment/THANH THI.webp');
  queueImage(scene, 'bg_sect_hub', A + 'environment/TONG MON.webp');
  queueImage(scene, 'bg_clan_hub', A + 'environment/GIA TOC.webp');

  // Visible HUD/menu shell only.
  queueImage(scene, 'hud_skin', A + 'ui/hud_skin.webp');
  queueImage(scene, 'hud_portrait', A + 'ui/hud_portrait.webp');
  // Map UI and Atlas assets (Active assets only)
  queueImage(scene, 'human_realm_atlas', A + 'ui/map/human_realm_atlas.webp');
  queueImage(scene, 'sub_level_atlas', A + 'ui/map/sub_level_atlas.webp');
  queueImage(scene, 'world_map_ui_skin', A + 'ui/world_map/world_map_ui_skin.webp');
  ['info_card', 'action_gold', 'back_button', 'close_button']
    .forEach(name => queueImage(scene, `map_ui_${name}`, A + `ui/world_map/kit/${name}.webp`));
  ['bag', 'realm', 'craft', 'skills', 'auto'].forEach(icon => {
    queueImage(scene, `xianxia_${icon}`, A + `icons/ui/xianxia_${icon}_bright.webp`);
  });

  // Only equipped skill icons are needed to draw the initial skill bar.
  const equipped = new Set((gameState.equippedSkillIds || []).filter(Boolean));
  ELEMENTAL_SKILLS.forEach(skill => {
    if (equipped.has(skill.id)) queueImage(scene, skill.icon, A + `icons/skills/unique/${skill.id}.webp`);
  });
}

function queueDeferredUiAssets(scene) {
  const A = ASSET_ROOT;

  // Post-boot UI shell/catalog assets. IMPORTANT: do not call loadAllItemIcons()
  // here. Inventory/drop item images are pulled by ItemIconStreaming on demand.
  for (let i = 0; i < 10; i++) queueImage(scene, `skill_${i}`, A + `icons/skills/skill_${i}.webp`);
  ELEMENTAL_SKILLS.forEach(skill => queueImage(scene, skill.icon, A + `icons/skills/unique/${skill.id}.webp`));
  for (let i = 0; i < 18; i++) queueImage(scene, `item_${i}`, A + `icons/items/item_${i}.webp`);

  ['silver', 'spirit_stone_low', 'spirit_stone_mid', 'spirit_stone_high', 'spirit_stone_top']
    .forEach(c => queueImage(scene, `curr_${c}`, A + `icons/currencies/${c}.webp`));
  ['pill_heal', 'pill_cultivation', 'pill_breakthrough', 'pill_golden']
    .forEach(p => queueImage(scene, `icon_${p}`, A + `icons/pills/${p}.webp`));
  ['manual_hoang', 'manual_huyen', 'manual_dia', 'manual_thien', 'manual_than']
    .forEach(m => queueImage(scene, `icon_${m}`, A + `icons/manuals/${m}.webp`));
  for (let i = 0; i < 12; i++) queueImage(scene, `stage_${i}`, A + `icons/stages/stage_${i}.webp`);
  ['bag', 'realm', 'skills', 'auto', 'settings', 'close', 'map', 'gold', 'pill', 'quest']
    .forEach(icon => queueImage(scene, `ui_${icon}`, A + `icons/ui/${icon}.webp`));
  ['bag', 'realm', 'skills', 'sect', 'craft', 'map', 'attack', 'auto', 'gold']
    .forEach(icon => queueImage(scene, `xianxia_${icon}`, A + `icons/ui/xianxia_${icon}_bright.webp`));
}

function createBootPlayerAnimations(scene) {
  const make = (key, tex, start, end, rate, repeat = -1, yoyo = false) => {
    if (!scene.anims.exists(key)) {
      scene.anims.create({
        key,
        frames: scene.anims.generateFrameNumbers(tex, { start, end }),
        frameRate: rate,
        repeat,
        yoyo
      });
    }
  };
  make('p_idle', 'player_idle', 0, 11, 10, -1);
  make('p_run', 'player_run', 0, 11, 12, -1);
  make('p_attack', 'player_attack', 0, 11, 16, 0);
  make('p_fly', 'player_fly', 0, 11, 12, -1);
  make('p_fly_attack', 'player_fly_attack', 0, 11, 16, 0);
}

function restoreRuntimeMethods(scene, saved) {
  Object.entries(saved).forEach(([name, fn]) => {
    if (typeof fn === 'function') scene[name] = fn;
    else delete scene[name];
  });
}

function startDeferredUiLoad(scene) {
  if (!scene?.sys || scene.sys.isDestroyed || scene.__deferredUiAssetState === 'loading' || scene.__deferredUiAssetState === 'ready') return;
  scene.__deferredUiAssetState = 'loading';
  queueDeferredUiAssets(scene);

  const onError = file => console.warn('[P0 boot] Deferred UI asset failed:', file?.key || file?.src || 'unknown');
  const finish = () => {
    scene.load.off('loaderror', onError);
    scene.__deferredUiAssetState = 'ready';
  };
  scene.load.once('complete', finish);
  scene.load.on('loaderror', onError);

  const busy = typeof scene.load.isLoading === 'function' ? scene.load.isLoading() : false;
  if (!busy) scene.load.start();
}

function scheduleDeferredUiLoad(scene) {
  scene.__deferredUiAssetState = 'scheduled';
  const run = () => startDeferredUiLoad(scene);
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(run, { timeout: 900 });
  else window.setTimeout(run, 160);
}

export function installBootAssetOptimizationV3(MainGameScene) {
  if (!MainGameScene?.prototype) return;
  const proto = MainGameScene.prototype;
  if (proto.__bootAssetOptimizationInstalled) return;
  proto.__bootAssetOptimizationInstalled = true;
  proto.__bootAssetOwner = BOOT_OWNER;

  // Replace every legacy preload wrapper. This queue is the single boot gate.
  proto.preload = function p0BootPreload() {
    const bootUi = window.__GAME_BOOT__;
    bootUi?.stage('Đang tải tài nguyên khởi động...');

    const onProgress = value => bootUi?.progress(value);
    const onError = () => bootUi?.assetError();
    this.__p0BootLoaderHandlers = { onProgress, onError };
    this.load.on('progress', onProgress);
    this.load.on('loaderror', onError);

    queueBootAssets(this);
  };

  const originalCreate = proto.create;
  proto.create = function p0BootCreate(...args) {
    const saved = {
      createAnimations: this.createAnimations,
      createNpcs: this.createNpcs,
      createVfxPool: this.createVfxPool,
      initBattlefield: this.initBattlefield,
      initFellowNpcs: this.initFellowNpcs,
      initHerbs: this.initHerbs,
      spawnVfx: this.spawnVfx,
      castSkill: this.castSkill,
      basicAttack: this.basicAttack,
      updateFellowNpcs: this.updateFellowNpcs,
      updateHerbs: this.updateHerbs
    };

    // Let normal create() construct only the first playable shell.
    this.npcsGroup = [];
    this.fellowNpcs = [];
    this.herbsGroup = [];
    this.mineralNodes = [];
    this.partyFollowers = this.partyFollowers || [];

    this.createAnimations = () => createBootPlayerAnimations(this);
    this.createNpcs = () => {};
    this.createVfxPool = () => { this.vfxPool = this.add.group(); };
    this.initBattlefield = () => { this.enemies = []; };
    this.initFellowNpcs = () => {};
    this.initHerbs = () => {};
    this.spawnVfx = () => null;
    this.castSkill = () => false;
    this.basicAttack = () => false;
    this.updateFellowNpcs = () => {};
    this.updateHerbs = () => {};

    const result = originalCreate.apply(this, args);

    const handlers = this.__p0BootLoaderHandlers;
    if (handlers) {
      this.load.off('progress', handlers.onProgress);
      this.load.off('loaderror', handlers.onError);
      this.__p0BootLoaderHandlers = null;
    }

    // ready() has already been called by MainScene.create(). Restore real methods
    // immediately; MapZoneAssetStreaming itself gates combat until assets exist.
    restoreRuntimeMethods(this, saved);
    this.__runtimeAssetsReady = true;
    this.__runtimeAssetState = 'ready';

    this.createNpcs?.();
    this.syncVillageHubMode?.();
    this.updateHUD?.();

    const map = getMapById(gameState.currentMapId);
    if (map && !map.isPeaceZone) {
      this.ensureActiveMapZoneAssets?.();
    } else {
      this.__combatAssetsReady = false;
    }

    // Everything below happens after the boot overlay is released.
    scheduleDeferredUiLoad(this);
    return result;
  };
}
