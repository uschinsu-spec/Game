/**
 * ARCHIVE / DEPRECATED: BootAssetOptimization.js (V1)
 * Superseded by: src/scenes/mixins/BootAssetOptimizationV3.js
 *
 * Archived on: 2026-09-29
 * Reason: V3 includes core hub background preloading (THON TRAN, THANH THI, TONG MON)
 * and lazy streaming of item icons to prevent duplicate boot enumeration.
 */
import { ELEMENTAL_SKILLS } from '../../src/config/skillsData.js?v=20260928-skill-mastery-vfx-v4';
import { loadAllItemIcons } from '../../src/config/iconManifest.js?v=20260928-game-icons-v1';
import {
  getMapById,
  resolvePanoramaMap
} from '../../src/config/world/worldRegistry.js?v=20260929-single-map-system-v1';
import { gameState } from '../../src/state/gameState.js';

const ASSET_ROOT = './assets/';
const BOOT_OWNER = 'BootAssetOptimization';

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

  // Player assets required to render/control the first frame.
  queueImage(scene, 'flying_sword', A + 'characters/player/flying_sword.png');
  queueSpriteSheet(scene, 'player_idle', A + 'characters/player/player_idle.png', { frameWidth: 128, frameHeight: 128 });
  queueSpriteSheet(scene, 'player_run', A + 'characters/player/player_run.png', { frameWidth: 128, frameHeight: 128 });
  queueSpriteSheet(scene, 'player_attack', A + 'characters/player/player_attack.png', { frameWidth: 128, frameHeight: 128 });
  queueSpriteSheet(scene, 'player_fly', A + 'characters/player/player_fly.png', { frameWidth: 128, frameHeight: 128 });

  // Visible HUD/menu shell only.
  queueImage(scene, 'hud_skin', A + 'ui/hud_skin.png');
  queueImage(scene, 'hud_portrait', A + 'ui/hud_portrait.png');
  ['bag', 'realm', 'craft', 'skills', 'auto'].forEach(icon => {
    queueImage(scene, `xianxia_${icon}`, A + `icons/ui/xianxia_${icon}_bright.png`);
  });

  // Only equipped skill icons are needed to draw the initial skill bar.
  const equipped = new Set((gameState.equippedSkillIds || []).filter(Boolean));
  ELEMENTAL_SKILLS.forEach(skill => {
    if (equipped.has(skill.id)) queueImage(scene, skill.icon, A + `icons/skills/unique/${skill.id}.png`);
  });
}

function queueDeferredUiAssets(scene) {
  const A = ASSET_ROOT;

  // Post-boot UI/catalog assets. Enemy/NPC/VFX are intentionally NOT here.
  for (let i = 0; i < 10; i++) queueImage(scene, `skill_${i}`, A + `icons/skills/skill_${i}.png`);
  ELEMENTAL_SKILLS.forEach(skill => queueImage(scene, skill.icon, A + `icons/skills/unique/${skill.id}.png`));
  for (let i = 0; i < 18; i++) queueImage(scene, `item_${i}`, A + `icons/items/item_${i}.png`);

  ['silver', 'spirit_stone_low', 'spirit_stone_mid', 'spirit_stone_high', 'spirit_stone_top']
    .forEach(c => queueImage(scene, `curr_${c}`, A + `icons/currencies/${c}.png`));
  ['pill_heal', 'pill_cultivation', 'pill_breakthrough', 'pill_golden']
    .forEach(p => queueImage(scene, `icon_${p}`, A + `icons/pills/${p}.png`));
  ['manual_hoang', 'manual_huyen', 'manual_dia', 'manual_thien', 'manual_than']
    .forEach(m => queueImage(scene, `icon_${m}`, A + `icons/manuals/${m}.png`));
  for (let i = 0; i < 12; i++) queueImage(scene, `stage_${i}`, A + `icons/stages/stage_${i}.png`);
  ['bag', 'realm', 'skills', 'auto', 'settings', 'close', 'map', 'gold', 'pill', 'quest']
    .forEach(icon => queueImage(scene, `ui_${icon}`, A + `icons/ui/${icon}.png`));
  ['bag', 'realm', 'skills', 'sect', 'craft', 'map', 'attack', 'auto', 'gold']
    .forEach(icon => queueImage(scene, `xianxia_${icon}`, A + `icons/ui/xianxia_${icon}_bright.png`));

  loadAllItemIcons(scene, A);
}

function createBootPlayerAnimations(scene) {
  const make = (key, tex, start, end, rate, repeat = -1) => {
    if (!scene.anims.exists(key)) {
      scene.anims.create({
        key,
        frames: scene.anims.generateFrameNumbers(tex, { start, end }),
        frameRate: rate,
        repeat
      });
    }
  };
  make('p_idle', 'player_idle', 0, 7, 8);
  make('p_run', 'player_run', 0, 7, 12);
  make('p_attack', 'player_attack', 0, 7, 15, 0);
  make('p_fly', 'player_fly', 0, 7, 10);
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

export function installBootAssetOptimization(MainGameScene) {
  if (!MainGameScene?.prototype) return;
  const proto = MainGameScene.prototype;
  if (proto.__bootAssetOptimizationInstalled) return;
  proto.__bootAssetOptimizationInstalled = true;
  proto.__bootAssetOwner = BOOT_OWNER;

  // Replace every legacy preload wrapper. WorldMapRuntime no longer owns preload;
  // this queue is the single boot gate for the game.
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

    // Let the normal create() construct only the first playable shell.
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
    if (map && !map.isPeaceZone && Number(map.id) !== 0) {
      this.ensureActiveMapZoneAssets?.();
    } else {
      this.__combatAssetsReady = false;
    }

    // Everything below happens after the boot overlay is released.
    scheduleDeferredUiLoad(this);
    return result;
  };
}
