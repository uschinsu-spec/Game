/**
 * BootAssetOptimization.js
 * P0 startup optimization:
 * - preload only current-map panorama + player + visible HUD/menu assets
 * - release window.__GAME_BOOT__.ready() through the normal scene create path
 * - defer enemy/NPC/item/VFX catalogs until after the first playable frame
 * - lazy-load panoramas for maps only when the player actually enters them
 */
import { ELEMENTAL_SKILLS } from '../../config/skillsData.js?v=20260928-skill-mastery-vfx-v4';
import { loadAllItemIcons } from '../../config/iconManifest.js?v=20260928-game-icons-v1';
import {
  getMapById,
  resolvePanoramaMap
} from '../../config/world/worldRegistry.js?v=20260929-single-map-system-v1';
import { gameState } from '../../state/gameState.js';

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

  // Current map only. Other panoramas are loaded on first entry.
  const currentMap = getMapById(gameState.currentMapId);
  const panoramaMap = resolvePanoramaMap(currentMap);
  if (panoramaMap?.panoramaKey && panoramaMap?.panoramaAsset) {
    queueImage(scene, panoramaMap.panoramaKey, A + panoramaMap.panoramaAsset);
  }

  // Player assets required to render and control the first frame.
  queueImage(scene, 'flying_sword', A + 'characters/player/flying_sword.png');
  queueSpriteSheet(scene, 'player_idle', A + 'characters/player/player_idle.png', { frameWidth: 128, frameHeight: 128 });
  queueSpriteSheet(scene, 'player_run', A + 'characters/player/player_run.png', { frameWidth: 128, frameHeight: 128 });
  queueSpriteSheet(scene, 'player_attack', A + 'characters/player/player_attack.png', { frameWidth: 128, frameHeight: 128 });
  queueSpriteSheet(scene, 'player_fly', A + 'characters/player/player_fly.png', { frameWidth: 128, frameHeight: 128 });

  // HUD shell and only the icons visible on the first screen.
  queueImage(scene, 'hud_skin', A + 'ui/hud_skin.png');
  queueImage(scene, 'hud_portrait', A + 'ui/hud_portrait.png');
  ['bag', 'realm', 'craft', 'skills', 'auto'].forEach(icon => {
    queueImage(scene, `xianxia_${icon}`, A + `icons/ui/xianxia_${icon}_bright.png`);
  });

  // Only equipped skill icons are boot-critical. The full skill catalog is deferred.
  const equipped = new Set((gameState.equippedSkillIds || []).filter(Boolean));
  ELEMENTAL_SKILLS.forEach(skill => {
    if (equipped.has(skill.id)) queueImage(scene, skill.icon, A + `icons/skills/unique/${skill.id}.png`);
  });
}

function queueDeferredRuntimeAssets(scene) {
  const A = ASSET_ROOT;

  // Enemies are not part of the boot gate.
  for (let i = 1; i <= 16; i++) {
    queueImage(scene, `enemy_${i}_idle_0`, `${A}characters/enemies/ground/enemy_${i}/idle_0.png`);
    queueImage(scene, `enemy_${i}_idle_1`, `${A}characters/enemies/ground/enemy_${i}/idle_1.png`);
    for (let r = 0; r < 4; r++) queueImage(scene, `enemy_${i}_run_${r}`, `${A}characters/enemies/ground/enemy_${i}/run_${r}.png`);
    for (let a = 0; a < 4; a++) queueImage(scene, `enemy_${i}_attack_${a}`, `${A}characters/enemies/ground/enemy_${i}/attack_${a}.png`);
  }

  for (let i = 1; i <= 10; i++) {
    queueImage(scene, `enemy_fly_${i}_idle_0`, `${A}characters/enemies/flying/enemy_${i}/idle_0.png`);
    queueImage(scene, `enemy_fly_${i}_idle_1`, `${A}characters/enemies/flying/enemy_${i}/idle_1.png`);
    for (let r = 0; r < 4; r++) queueImage(scene, `enemy_fly_${i}_run_${r}`, `${A}characters/enemies/flying/enemy_${i}/run_${r}.png`);
    for (let a = 0; a < 4; a++) queueImage(scene, `enemy_fly_${i}_attack_${a}`, `${A}characters/enemies/flying/enemy_${i}/attack_${a}.png`);
  }

  // NPC catalogs are deferred until after first paint.
  for (let f = 1; f <= 8; f++) {
    const pad = String(f).padStart(2, '0');
    queueImage(scene, `dai_han_idle_${f}`, `${A}characters/npc/animated/dai_han_dao/dai_han_3d_idle_${pad}.png`);
    queueImage(scene, `dai_han_run_${f}`, `${A}characters/npc/animated/dai_han_dao/dai_han_3d_run_${pad}.png`);
    queueImage(scene, `dai_han_attack_${f}`, `${A}characters/npc/animated/dai_han_dao/dai_han_3d_attack_${pad}.png`);
    queueImage(scene, `dai_han_fly_${f}`, `${A}characters/npc/animated/dai_han_dao/dai_han_3d_fly_${pad}.png`);
    queueImage(scene, `tho_san_idle_${f}`, `${A}characters/npc/animated/tho_san_riu/tho_san_riu_3d_idle_${pad}.png`);
    queueImage(scene, `tho_san_run_${f}`, `${A}characters/npc/animated/tho_san_riu/tho_san_riu_3d_run_${pad}.png`);
    queueImage(scene, `tho_san_attack_${f}`, `${A}characters/npc/animated/tho_san_riu/tho_san_riu_3d_attack_${pad}.png`);
    queueImage(scene, `tho_san_fly_${f}`, `${A}characters/npc/animated/tho_san_riu/tho_san_riu_3d_fly_${pad}.png`);
  }

  for (let i = 1; i <= 20; i++) {
    for (let f = 1; f <= 8; f++) {
      const pad = String(f).padStart(2, '0');
      queueImage(scene, `npc_fly_${i}_attack_${f}`, `${A}characters/npc/flying/npc_${i}/attack_${pad}.png`);
      queueImage(scene, `npc_fly_${i}_fly_${f}`, `${A}characters/npc/flying/npc_${i}/fly_${pad}.png`);
    }
  }
  for (let n = 1; n <= 16; n++) queueImage(scene, `npc_${n}`, `${A}characters/npc/portraits/npc_${n}.png`);

  // Full icon catalogs are UI-on-demand/background assets, not boot assets.
  for (let i = 0; i < 10; i++) queueImage(scene, `skill_${i}`, A + `icons/skills/skill_${i}.png`);
  ELEMENTAL_SKILLS.forEach(skill => queueImage(scene, skill.icon, A + `icons/skills/unique/${skill.id}.png`));
  for (let i = 0; i < 18; i++) queueImage(scene, `item_${i}`, A + `icons/items/item_${i}.png`);

  ['beast_pelt', 'beast_fur', 'beast_claw', 'beast_blood', 'beast_horn', 'herb', 'ore']
    .forEach(m => queueImage(scene, `mat_${m}`, A + `icons/materials/${m}.png`));
  for (let h = 1; h <= 7; h++) queueImage(scene, `herb_${h}`, A + `icons/materials/herb_${h}.png`);
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

  // VFX catalog is entirely post-boot.
  const elemDirs = { hoa: 'fire', loi: 'lightning', kim: 'metal', thuy: 'water', phong: 'wind', moc: 'wood', tho: 'earth', ly: 'physical' };
  Object.entries(elemDirs).forEach(([elemKey, dirName]) => {
    queueImage(scene, `vfx_${elemKey}_1`, `${A}vfx/elemental/${dirName}/proj_1.png`);
    for (let f = 0; f < 8; f++) queueImage(scene, `vfx_${elemKey}_1_${f}`, `${A}vfx/elemental/${dirName}/frame_${f}.png`);
    queueImage(scene, `vfx_${elemKey}_2`, `${A}vfx/elemental/${dirName}/proj_2.png`);
    queueImage(scene, `vfx_${elemKey}_3`, `${A}vfx/elemental/${dirName}/array_3.png`);
    queueImage(scene, `vfx_${elemKey}_4`, `${A}vfx/elemental/${dirName}/swarm_4.png`);
    queueImage(scene, `vfx_${elemKey}_5`, `${A}vfx/elemental/${dirName}/colossus_5.png`);
    queueImage(scene, `vfx_${elemKey}_shockwave`, `${A}vfx/elemental/${dirName}/shockwave.png`);
    queueImage(scene, `vfx_${elemKey}_impact`, `${A}vfx/elemental/${dirName}/impact.png`);
  });

  for (let i = 0; i < 8; i++) {
    queueImage(scene, `vfx_kim_1_${i}`, `${A}vfx/sword/kim_1_frame_${i}.png`);
    queueImage(scene, `vfx_kim_2_${i}`, `${A}vfx/sword/kim_2_frame_${i}.png`);
  }
  queueImage(scene, 'vfx_kim_3_0', `${A}vfx/sword/kim_3_frame_0.png`);
  queueImage(scene, 'vfx_tru_tien_shockwave', `${A}vfx/sword/tru_tien_shockwave.png`);
  queueImage(scene, 'vfx_sword_impact_frame7', `${A}vfx/atlas/frame_7.png`);
  queueImage(scene, 'vfx_impact_frame7', `${A}vfx/atlas/frame_7.png`);
  queueImage(scene, 'vfx_sword_kiem_khi', `${A}vfx/sword/kiem_khi.png`);
  queueImage(scene, 'vfx_giant_tru_tien_sword', `${A}vfx/sword/giant_tru_tien_sword.png`);
  queueImage(scene, 'vfx_loi', `${A}vfx/sword/vfx_loi.png`);
  queueImage(scene, 'vfx_heal', A + 'vfx/skills/vfx_heal.png');
  queueImage(scene, 'vfx_shield', A + 'vfx/skills/vfx_shield.png');
  queueImage(scene, 'vfx_speed', A + 'vfx/skills/vfx_speed.png');
  queueImage(scene, 'vfx_divine', A + 'vfx/ultimates/vfx_divine.png');
  queueSpriteSheet(scene, 'vfx', A + 'vfx/atlas/vfx_atlas.png', { frameWidth: 128, frameHeight: 128 });
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

function activateDeferredRuntime(scene, saved) {
  if (!scene?.sys || scene.sys.isDestroyed) return;
  restoreRuntimeMethods(scene, saved);

  // Register enemy/NPC/VFX animations only after their textures exist.
  saved.createAnimations?.call(scene);

  if (scene.vfxPool?.destroy) scene.vfxPool.destroy(true);
  saved.createVfxPool?.call(scene);
  saved.createNpcs?.call(scene);
  saved.initBattlefield?.call(scene);
  saved.initFellowNpcs?.call(scene);
  saved.initHerbs?.call(scene);
  scene.syncVillageHubMode?.();
  scene.updateHUD?.();
  scene.__runtimeAssetsReady = true;
  scene.__runtimeAssetState = 'ready';
}

function startDeferredRuntimeLoad(scene, saved) {
  if (!scene?.sys || scene.sys.isDestroyed || scene.__runtimeAssetState !== 'scheduled') return;
  scene.__runtimeAssetState = 'loading';

  queueDeferredRuntimeAssets(scene);

  const finish = () => activateDeferredRuntime(scene, saved);
  scene.load.once('complete', finish);
  scene.load.on('loaderror', file => {
    console.warn('[P0 boot] Deferred asset failed:', file?.key || file?.src || 'unknown');
  });

  const busy = typeof scene.load.isLoading === 'function' ? scene.load.isLoading() : false;
  if (!busy) scene.load.start();
}

function scheduleDeferredRuntimeLoad(scene, saved) {
  scene.__runtimeAssetsReady = false;
  scene.__runtimeAssetState = 'scheduled';
  const run = () => startDeferredRuntimeLoad(scene, saved);
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(run, { timeout: 700 });
  } else {
    window.setTimeout(run, 120);
  }
}

function ensurePanoramaThenSwitch(scene, originalSwitchMap, args) {
  const [mapId] = args;
  const map = getMapById(mapId);
  const panoramaMap = resolvePanoramaMap(map);
  const key = panoramaMap?.panoramaKey;
  const asset = panoramaMap?.panoramaAsset;

  if (!key || !asset || scene.textures?.exists?.(key)) {
    return originalSwitchMap.apply(scene, args);
  }

  scene.__pendingMapTransition = { args };
  if (scene.__panoramaLoads?.has(key)) return scene.currentMap || getMapById(gameState.currentMapId);
  if (!scene.__panoramaLoads) scene.__panoramaLoads = new Set();
  scene.__panoramaLoads.add(key);

  const fileEvent = `filecomplete-image-${key}`;
  const cleanup = () => {
    scene.__panoramaLoads?.delete(key);
    scene.load.off(fileEvent, onComplete);
    scene.load.off('loaderror', onError);
  };
  const finishTransition = () => {
    cleanup();
    const pending = scene.__pendingMapTransition;
    if (!pending || Number(pending.args?.[0]) !== Number(mapId)) return;
    scene.__pendingMapTransition = null;
    originalSwitchMap.apply(scene, pending.args);
  };
  const onComplete = () => finishTransition();
  const onError = file => {
    if (file?.key !== key) return;
    console.warn('[P0 boot] Panorama failed, using runtime fallback:', key);
    finishTransition();
  };

  scene.load.once(fileEvent, onComplete);
  scene.load.on('loaderror', onError);
  queueImage(scene, key, ASSET_ROOT + asset);

  const busy = typeof scene.load.isLoading === 'function' ? scene.load.isLoading() : false;
  if (!busy) scene.load.start();
  return scene.currentMap || getMapById(gameState.currentMapId);
}

export function installBootAssetOptimization(MainGameScene) {
  if (!MainGameScene?.prototype) return;
  const proto = MainGameScene.prototype;
  if (proto.__bootAssetOptimizationInstalled) return;
  proto.__bootAssetOptimizationInstalled = true;
  proto.__bootAssetOwner = BOOT_OWNER;

  // WorldMapRuntime is installed before this mixin. Replacing preload here is
  // intentional: it removes both the old all-assets preload and the old all-map panorama preload.
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
  const originalSwitchMap = proto.switchMap;

  proto.create = function p0BootCreate(...args) {
    const saved = {
      createAnimations: this.createAnimations,
      createNpcs: this.createNpcs,
      createVfxPool: this.createVfxPool,
      initBattlefield: this.initBattlefield,
      initFellowNpcs: this.initFellowNpcs,
      initHerbs: this.initHerbs,
      spawnVfx: this.spawnVfx
    };

    // Allow the normal scene create path to build the map, player and HUD now,
    // while heavy gameplay systems stay dormant until their assets are loaded.
    this.createAnimations = () => createBootPlayerAnimations(this);
    this.createNpcs = () => {};
    this.createVfxPool = () => { this.vfxPool = this.add.group(); };
    this.initBattlefield = () => { this.enemies = []; };
    this.initFellowNpcs = () => {};
    this.initHerbs = () => {};
    this.spawnVfx = () => null;

    const result = originalCreate.apply(this, args);

    const handlers = this.__p0BootLoaderHandlers;
    if (handlers) {
      this.load.off('progress', handlers.onProgress);
      this.load.off('loaderror', handlers.onError);
      this.__p0BootLoaderHandlers = null;
    }

    // MainScene calls window.__GAME_BOOT__.ready() inside originalCreate.
    // Only after that first playable frame do we consume the heavy catalogs.
    scheduleDeferredRuntimeLoad(this, saved);
    return result;
  };

  if (typeof originalSwitchMap === 'function') {
    proto.switchMap = function p0LazyPanoramaSwitch(...args) {
      return ensurePanoramaThenSwitch(this, originalSwitchMap, args);
    };
  }
}
