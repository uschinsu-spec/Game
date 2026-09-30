/**
 * MapZoneAssetStreaming.js
 * P0 map/zone asset streaming:
 * - Map 0 never pulls combat enemy/NPC/VFX catalogs.
 * - Combat maps load only the active zone's enemy/NPC models.
 * - The next/previous zone is prefetched near a zone boundary, but not spawned
 *   until the player actually enters it.
 * - Uses the canonical worldRegistry zone geometry; no parallel zone system.
 */
import { gameState } from '../../state/gameState.js';
import {
  getMapById,
  getMapZones,
  getMapZoneNumberAtX
} from '../../config/world/worldRegistry.js?v=20260929-single-map-system-v1';

const OWNER = 'MapZoneAssetStreaming';
const A = './assets/';
const PRELOAD_MARGIN = 1200;
const ZONE_POLL_MS = 220;
const ENEMY_ZONE_STEPS = Object.freeze([450, 300, 220, 160]);
const MAX_ENEMIES_PER_ACTIVE_ZONE = 28;
const MAX_FELLOWS_PER_ACTIVE_ZONE = 10;

function isQueued(scene, key) {
  const entries = scene?.load?.list?.entries;
  return Array.isArray(entries) && entries.some(file => file?.key === key);
}

function queueImage(scene, key, url, required) {
  if (!key || !url) return;
  required.add(key);
  if (scene.textures?.exists?.(key) || isQueued(scene, key)) return;
  scene.load.image(key, url);
}

function queueSpriteSheet(scene, key, url, config, required) {
  if (!key || !url) return;
  required.add(key);
  if (scene.textures?.exists?.(key) || isQueued(scene, key)) return;
  scene.load.spritesheet(key, url, config);
}

function waitForRequiredTextures(scene, batchKey, required, batchStore) {
  const missingNow = [...required].filter(key => !scene.textures?.exists?.(key));
  if (missingNow.length === 0) return Promise.resolve(true);
  if (batchStore.has(batchKey)) return batchStore.get(batchKey);

  const promise = new Promise((resolve, reject) => {
    const onComplete = () => {
      cleanup();
      const missing = [...required].filter(key => !scene.textures?.exists?.(key));
      if (missing.length) reject(new Error(`Thiếu asset: ${missing.slice(0, 4).join(', ')}`));
      else resolve(true);
    };
    const cleanup = () => {
      scene.load.off('complete', onComplete);
    };
    scene.load.once('complete', onComplete);

    const busy = typeof scene.load.isLoading === 'function' ? scene.load.isLoading() : false;
    if (!busy) scene.load.start();
  }).finally(() => batchStore.delete(batchKey));

  batchStore.set(batchKey, promise);
  return promise;
}

function queueCombatSharedAssets(scene) {
  const required = new Set();

  // World/resource textures used by active combat maps.
  ['beast_pelt', 'beast_fur', 'beast_claw', 'beast_blood', 'beast_horn', 'herb', 'ore']
    .forEach(m => queueImage(scene, `mat_${m}`, `${A}icons/materials/${m}.png`, required));
  for (let h = 1; h <= 7; h++) queueImage(scene, `herb_${h}`, `${A}icons/materials/herb_${h}.png`, required);

  // Combat VFX is delayed until the first combat map. Map 0 never downloads it.
  const elemDirs = {
    hoa: 'fire', loi: 'lightning', kim: 'metal', thuy: 'water',
    phong: 'wind', moc: 'wood', tho: 'earth', ly: 'physical'
  };
  Object.entries(elemDirs).forEach(([elemKey, dirName]) => {
    queueImage(scene, `vfx_${elemKey}_1`, `${A}vfx/elemental/${dirName}/proj_1.png`, required);
    for (let f = 0; f < 8; f++) queueImage(scene, `vfx_${elemKey}_1_${f}`, `${A}vfx/elemental/${dirName}/frame_${f}.png`, required);
    queueImage(scene, `vfx_${elemKey}_2`, `${A}vfx/elemental/${dirName}/proj_2.png`, required);
    queueImage(scene, `vfx_${elemKey}_3`, `${A}vfx/elemental/${dirName}/array_3.png`, required);
    queueImage(scene, `vfx_${elemKey}_4`, `${A}vfx/elemental/${dirName}/swarm_4.png`, required);
    queueImage(scene, `vfx_${elemKey}_5`, `${A}vfx/elemental/${dirName}/colossus_5.png`, required);
    queueImage(scene, `vfx_${elemKey}_shockwave`, `${A}vfx/elemental/${dirName}/shockwave.png`, required);
    queueImage(scene, `vfx_${elemKey}_impact`, `${A}vfx/elemental/${dirName}/impact.png`, required);
  });

  for (let i = 0; i < 8; i++) {
    queueImage(scene, `vfx_kim_1_${i}`, `${A}vfx/sword/kim_1_frame_${i}.png`, required);
    queueImage(scene, `vfx_kim_2_${i}`, `${A}vfx/sword/kim_2_frame_${i}.png`, required);
  }
  queueImage(scene, 'vfx_kim_3_0', `${A}vfx/sword/kim_3_frame_0.png`, required);
  queueImage(scene, 'vfx_tru_tien_shockwave', `${A}vfx/sword/tru_tien_shockwave.png`, required);
  queueImage(scene, 'vfx_sword_impact_frame7', `${A}vfx/atlas/frame_7.png`, required);
  queueImage(scene, 'vfx_impact_frame7', `${A}vfx/atlas/frame_7.png`, required);
  queueImage(scene, 'vfx_sword_kiem_khi', `${A}vfx/sword/kiem_khi.png`, required);
  queueImage(scene, 'vfx_giant_tru_tien_sword', `${A}vfx/sword/giant_tru_tien_sword.png`, required);
  queueImage(scene, 'vfx_loi', `${A}vfx/sword/vfx_loi.png`, required);
  queueImage(scene, 'vfx_heal', `${A}vfx/skills/vfx_heal.png`, required);
  queueImage(scene, 'vfx_shield', `${A}vfx/skills/vfx_shield.png`, required);
  queueImage(scene, 'vfx_speed', `${A}vfx/skills/vfx_speed.png`, required);
  queueImage(scene, 'vfx_divine', `${A}vfx/ultimates/vfx_divine.png`, required);
  queueSpriteSheet(scene, 'vfx', `${A}vfx/atlas/vfx_atlas.png`, { frameWidth: 128, frameHeight: 128 }, required);

  return required;
}

function getZoneEnemyModels(scene, mapId, zoneNumber) {
  const unique = new Map();
  // 0..11 covers modulo-10 flying variants and modulo-2/3 rank choices.
  for (let slot = 0; slot < 12; slot++) {
    const cfg = scene.getEnemySpawnConfig?.(mapId, zoneNumber, slot);
    if (!cfg) continue;
    const key = `${cfg.isFlying ? 'fly' : 'ground'}:${cfg.spriteNum}`;
    unique.set(key, { isFlying: !!cfg.isFlying, spriteNum: Number(cfg.spriteNum) || 1 });
  }
  return [...unique.values()];
}

function queueEnemyModel(scene, def, required) {
  const n = def.spriteNum;
  if (def.isFlying) {
    queueImage(scene, `enemy_fly_${n}_idle_0`, `${A}characters/enemies/flying/enemy_${n}/idle_0.png`, required);
    queueImage(scene, `enemy_fly_${n}_idle_1`, `${A}characters/enemies/flying/enemy_${n}/idle_1.png`, required);
    for (let r = 0; r < 4; r++) queueImage(scene, `enemy_fly_${n}_run_${r}`, `${A}characters/enemies/flying/enemy_${n}/run_${r}.png`, required);
    for (let a = 0; a < 4; a++) queueImage(scene, `enemy_fly_${n}_attack_${a}`, `${A}characters/enemies/flying/enemy_${n}/attack_${a}.png`, required);
    return;
  }

  queueImage(scene, `enemy_${n}_idle_0`, `${A}characters/enemies/ground/enemy_${n}/idle_0.png`, required);
  queueImage(scene, `enemy_${n}_idle_1`, `${A}characters/enemies/ground/enemy_${n}/idle_1.png`, required);
  for (let r = 0; r < 4; r++) queueImage(scene, `enemy_${n}_run_${r}`, `${A}characters/enemies/ground/enemy_${n}/run_${r}.png`, required);
  for (let a = 0; a < 4; a++) queueImage(scene, `enemy_${n}_attack_${a}`, `${A}characters/enemies/ground/enemy_${n}/attack_${a}.png`, required);
}

function getFlyingNpcModelIds(zoneNumber) {
  const start = ((Math.max(1, zoneNumber) - 1) * 5) % 20;
  return Array.from({ length: 5 }, (_, i) => ((start + i) % 20) + 1);
}

function queueGroundNpcModels(scene, required) {
  for (let f = 1; f <= 8; f++) {
    const pad = String(f).padStart(2, '0');
    queueImage(scene, `dai_han_idle_${f}`, `${A}characters/npc/animated/dai_han_dao/dai_han_3d_idle_${pad}.png`, required);
    queueImage(scene, `dai_han_run_${f}`, `${A}characters/npc/animated/dai_han_dao/dai_han_3d_run_${pad}.png`, required);
    queueImage(scene, `dai_han_attack_${f}`, `${A}characters/npc/animated/dai_han_dao/dai_han_3d_attack_${pad}.png`, required);
    queueImage(scene, `dai_han_fly_${f}`, `${A}characters/npc/animated/dai_han_dao/dai_han_3d_fly_${pad}.png`, required);
    queueImage(scene, `tho_san_idle_${f}`, `${A}characters/npc/animated/tho_san_riu/tho_san_riu_3d_idle_${pad}.png`, required);
    queueImage(scene, `tho_san_run_${f}`, `${A}characters/npc/animated/tho_san_riu/tho_san_riu_3d_run_${pad}.png`, required);
    queueImage(scene, `tho_san_attack_${f}`, `${A}characters/npc/animated/tho_san_riu/tho_san_riu_3d_attack_${pad}.png`, required);
    queueImage(scene, `tho_san_fly_${f}`, `${A}characters/npc/animated/tho_san_riu/tho_san_riu_3d_fly_${pad}.png`, required);
  }
}

function queueFlyingNpcModels(scene, ids, required) {
  ids.forEach(id => {
    for (let f = 1; f <= 8; f++) {
      const pad = String(f).padStart(2, '0');
      queueImage(scene, `npc_fly_${id}_attack_${f}`, `${A}characters/npc/flying/npc_${id}/attack_${pad}.png`, required);
      queueImage(scene, `npc_fly_${id}_fly_${f}`, `${A}characters/npc/flying/npc_${id}/fly_${pad}.png`, required);
    }
  });
}

function queueZoneNpcModels(scene, mapId, zoneNumber, required) {
  const zones = getMapZones(mapId);
  const zone = zones[zoneNumber - 1] || zones[0];
  if (!zone) return { isFlying: false, flyingIds: [] };
  const midX = (Number(zone.x0) + Number(zone.x1)) / 2;
  const sample = scene.getNpcSpawnConfig?.(mapId, midX, 0);
  const isFlying = !!sample?.isFlying;
  const flyingIds = isFlying ? getFlyingNpcModelIds(zoneNumber) : [];

  if (isFlying) queueFlyingNpcModels(scene, flyingIds, required);
  else queueGroundNpcModels(scene, required);

  // Party followers always use the two ground model families.
  if (gameState.party?.isFormed) queueGroundNpcModels(scene, required);
  return { isFlying, flyingIds };
}

function registerEnemyAnimations(scene, models) {
  models.forEach(def => {
    const n = def.spriteNum;
    const t = def.isFlying ? `enemy_fly_${n}` : `enemy_${n}`;
    const prefix = `e_${t}`;
    if (!scene.anims.exists(`${prefix}_idle`)) {
      scene.anims.create({ key: `${prefix}_idle`, frames: [{ key: `${t}_idle_0` }, { key: `${t}_idle_1` }], frameRate: def.isFlying ? 5 : 4, repeat: -1 });
    }
    if (!scene.anims.exists(`${prefix}_run`)) {
      scene.anims.create({ key: `${prefix}_run`, frames: [0, 1, 2, 3].map(r => ({ key: `${t}_run_${r}` })), frameRate: def.isFlying ? 9 : 8, repeat: -1 });
    }
    if (!scene.anims.exists(`${prefix}_attack`)) {
      scene.anims.create({ key: `${prefix}_attack`, frames: [0, 1, 2, 3].map(a => ({ key: `${t}_attack_${a}` })), frameRate: def.isFlying ? 11 : 10, repeat: 0 });
    }
  });
}

function registerGroundNpcAnimations(scene) {
  ['dai_han', 'tho_san'].forEach(type => {
    const frames = action => [1,2,3,4,5,6,7,8].map(f => ({ key: `${type}_${action}_${f}` }));
    if (!scene.anims.exists(`${type}_idle`)) scene.anims.create({ key: `${type}_idle`, frames: frames('idle'), frameRate: 8, repeat: -1 });
    if (!scene.anims.exists(`${type}_run`)) scene.anims.create({ key: `${type}_run`, frames: frames('run'), frameRate: 12, repeat: -1 });
    if (!scene.anims.exists(`${type}_attack`)) scene.anims.create({ key: `${type}_attack`, frames: frames('attack'), frameRate: 14, repeat: 0 });
    if (!scene.anims.exists(`${type}_fly`)) scene.anims.create({ key: `${type}_fly`, frames: frames('fly'), frameRate: 10, repeat: -1 });
  });
}

function registerFlyingNpcAnimations(scene, ids) {
  ids.forEach(id => {
    const type = `npc_fly_${id}`;
    const flyFrames = [1,2,3,4,5,6,7,8].map(f => ({ key: `${type}_fly_${f}` }));
    const attackFrames = [1,2,3,4,5,6,7,8].map(f => ({ key: `${type}_attack_${f}` }));
    if (!scene.anims.exists(`${type}_fly`)) scene.anims.create({ key: `${type}_fly`, frames: flyFrames, frameRate: 10, repeat: -1 });
    if (!scene.anims.exists(`${type}_idle`)) scene.anims.create({ key: `${type}_idle`, frames: flyFrames, frameRate: 10, repeat: -1 });
    if (!scene.anims.exists(`${type}_run`)) scene.anims.create({ key: `${type}_run`, frames: flyFrames, frameRate: 10, repeat: -1 });
    if (!scene.anims.exists(`${type}_attack`)) scene.anims.create({ key: `${type}_attack`, frames: attackFrames, frameRate: 14, repeat: 0 });
  });
}

function registerCombatVfxAnimations(scene) {
  ['hoa', 'loi', 'kim', 'thuy', 'phong', 'moc', 'tho', 'ly'].forEach(elemKey => {
    const animKey = `anim_vfx_${elemKey}_1`;
    if (!scene.anims.exists(animKey)) scene.anims.create({ key: animKey, frames: [0,1,2,3,4,5,6].map(f => ({ key: `vfx_${elemKey}_1_${f}` })), frameRate: 9, repeat: -1 });
  });
  if (!scene.anims.exists('anim_vfx_kiem_1')) scene.anims.create({ key: 'anim_vfx_kiem_1', frames: [0,1,2,3,4,5,6].map(f => ({ key: `vfx_kim_1_${f}` })), frameRate: 9, repeat: -1 });
  if (!scene.anims.exists('anim_vfx_kim_2_fly')) scene.anims.create({ key: 'anim_vfx_kim_2_fly', frames: [0,1].map(f => ({ key: `vfx_kim_2_${f}` })), frameRate: 8, repeat: -1 });
  if (!scene.anims.exists('anim_vfx_kim_2_hit')) scene.anims.create({ key: 'anim_vfx_kim_2_hit', frames: [2,3,4,5,6,7].map(f => ({ key: `vfx_kim_2_${f}` })), frameRate: 14, repeat: 0 });
}

function clearEnemyObjects(scene) {
  if (scene.enemyGroup) {
    scene.enemyGroup.getChildren().forEach(e => {
      e.hpBar?.destroy?.();
      e.hpBg?.destroy?.();
      e.nameText?.destroy?.();
    });
    scene.enemyGroup.clear(true, true);
  }
  scene.enemies = [];
}

function clearFellowObjects(scene) {
  (scene.fellowNpcs || []).forEach(npc => {
    npc.sprite?.destroy?.();
    npc.shadow?.destroy?.();
    npc.nameTag?.destroy?.();
    npc.hpBg?.destroy?.();
    npc.hpBar?.destroy?.();
    npc.flyingSword?.destroy?.();
  });
  scene.fellowNpcs = [];
}

function spawnEnemiesForZone(scene, map, zoneNumber) {
  clearEnemyObjects(scene);
  const zones = getMapZones(map.id);
  const zone = zones[zoneNumber - 1];
  if (!zone) return;

  const step = ENEMY_ZONE_STEPS[Math.min(zoneNumber - 1, ENEMY_ZONE_STEPS.length - 1)];
  const start = Math.max(Number(map.field?.left || 60) + 80, Math.ceil(zone.x0));
  const end = Math.min(Number(map.field?.right || map.worldWidth - 60) - 100, Math.floor(zone.x1));
  const points = [];
  for (let x = start; x < end; x += step) points.push(x);
  const stride = Math.max(1, Math.ceil(points.length / MAX_ENEMIES_PER_ACTIVE_ZONE));
  const selected = points.filter((_, index) => index % stride === 0).slice(0, MAX_ENEMIES_PER_ACTIVE_ZONE);

  selected.forEach((x, index) => {
    const y = Phaser.Math.Between(scene.field.top + 35, scene.field.bottom - 35);
    scene.spawnOneFixedEnemy(x, y, index, zoneNumber);
  });
}

function spawnFellowsForZone(scene, map, zoneNumber, npcModelInfo) {
  clearFellowObjects(scene);
  scene.initPartyFollowers?.();

  const zones = getMapZones(map.id);
  const zone = zones[zoneNumber - 1];
  if (!zone) return;
  const start = Math.max(Number(zone.x0) + 220, Number(map.field?.left || 60) + 220);
  const end = Math.min(Number(zone.x1) - 220, Number(map.field?.right || map.worldWidth - 60) - 220);
  if (end <= start) return;

  const span = Math.max(1, end - start);
  const count = Math.min(MAX_FELLOWS_PER_ACTIVE_ZONE, Math.max(2, Math.floor(span / 950)));
  for (let i = 0; i < count; i++) {
    const x = start + ((i + 0.5) / count) * span;
    const y = Phaser.Math.Between(scene.field.top + 40, scene.field.bottom - 40);
    let modelType;
    if (npcModelInfo.isFlying) {
      const ids = npcModelInfo.flyingIds;
      modelType = `npc_fly_${ids[i % ids.length]}`;
    } else {
      modelType = i % 2 === 0 ? 'dai_han' : 'tho_san';
    }
    scene.spawnOneFellowNpc?.(x, y, modelType, i % 9);
  }
}

export function installMapZoneAssetStreaming(MainGameScene) {
  const proto = MainGameScene?.prototype;
  if (!proto || proto.__mapZoneAssetStreamingInstalled) return;
  proto.__mapZoneAssetStreamingInstalled = true;
  proto.__mapZoneAssetStreamingOwner = OWNER;

  const originalInitHerbs = proto.initHerbs;
  const originalCastSkill = proto.castSkill;
  const originalBasicAttack = proto.basicAttack;
  const originalSpawnVfx = proto.spawnVfx;
  const originalUpdate = proto.update;

  proto.ensureCombatSharedAssets = function ensureCombatSharedAssets() {
    const map = getMapById(gameState.currentMapId);
    if (!map || map.isPeaceZone || Number(map.id) === 0) return Promise.resolve(false);
    if (this.__combatAssetsReady) return Promise.resolve(true);
    if (this.__combatSharedPromise) return this.__combatSharedPromise;

    if (!this.__assetBatchPromises) this.__assetBatchPromises = new Map();
    const required = queueCombatSharedAssets(this);
    this.__combatSharedPromise = waitForRequiredTextures(this, 'combat-shared', required, this.__assetBatchPromises)
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
        console.warn('[P0 zone stream] Combat shared assets failed:', error);
        return false;
      });
    return this.__combatSharedPromise;
  };

  proto.ensureMapZoneAssets = function ensureMapZoneAssets(mapId, zoneNumber) {
    const map = getMapById(mapId);
    if (!map || map.isPeaceZone || Number(map.id) === 0) return Promise.resolve(false);
    const zones = getMapZones(map.id);
    const zone = Math.max(1, Math.min(zones.length, Number(zoneNumber) || 1));
    const zoneKey = `${map.id}:${zone}`;

    if (!this.__loadedCombatZones) this.__loadedCombatZones = new Set();
    if (!this.__zoneAssetPromises) this.__zoneAssetPromises = new Map();
    if (this.__loadedCombatZones.has(zoneKey)) return this.ensureCombatSharedAssets().then(() => true);
    if (this.__zoneAssetPromises.has(zoneKey)) return this.__zoneAssetPromises.get(zoneKey);
    if (!this.__assetBatchPromises) this.__assetBatchPromises = new Map();

    const required = new Set();
    const enemyModels = getZoneEnemyModels(this, map.id, zone);
    enemyModels.forEach(def => queueEnemyModel(this, def, required));
    const npcModelInfo = queueZoneNpcModels(this, map.id, zone, required);

    const promise = Promise.all([
      this.ensureCombatSharedAssets(),
      waitForRequiredTextures(this, `zone:${zoneKey}`, required, this.__assetBatchPromises)
    ]).then(([sharedOk]) => {
      if (!sharedOk) return false;
      registerEnemyAnimations(this, enemyModels);
      if (npcModelInfo.isFlying) registerFlyingNpcAnimations(this, npcModelInfo.flyingIds);
      else registerGroundNpcAnimations(this);
      if (gameState.party?.isFormed) registerGroundNpcAnimations(this);
      this.__loadedCombatZones.add(zoneKey);
      return true;
    }).catch(error => {
      console.warn(`[P0 zone stream] Zone ${zoneKey} assets failed:`, error);
      return false;
    }).finally(() => this.__zoneAssetPromises.delete(zoneKey));

    this.__zoneAssetPromises.set(zoneKey, promise);
    return promise;
  };

  proto.activateCombatZone = function activateCombatZone(zoneNumber) {
    const map = getMapById(gameState.currentMapId);
    if (!map || map.isPeaceZone || Number(map.id) === 0) return Promise.resolve(false);
    const zones = getMapZones(map.id);
    const zone = Math.max(1, Math.min(zones.length, Number(zoneNumber) || 1));
    const token = `${map.id}:${zone}:${Date.now()}`;
    this.__zoneActivationToken = token;

    return this.ensureMapZoneAssets(map.id, zone).then(ok => {
      if (!ok || this.__zoneActivationToken !== token) return false;
      if (Number(gameState.currentMapId) !== Number(map.id)) return false;

      const zoneDef = zones[zone - 1];
      const midX = zoneDef ? (Number(zoneDef.x0) + Number(zoneDef.x1)) / 2 : (this.player?.x || 350);
      const npcSample = this.getNpcSpawnConfig?.(map.id, midX, 0);
      const npcModelInfo = { isFlying: !!npcSample?.isFlying, flyingIds: npcSample?.isFlying ? getFlyingNpcModelIds(zone) : [] };

      spawnEnemiesForZone(this, map, zone);
      spawnFellowsForZone(this, map, zone, npcModelInfo);
      originalInitHerbs?.call(this);
      this.__activeStreamMapId = Number(map.id);
      this.__activeStreamZone = zone;
      this.__combatAssetsReady = true;
      return true;
    });
  };

  proto.ensureActiveMapZoneAssets = function ensureActiveMapZoneAssets() {
    const map = getMapById(gameState.currentMapId);
    if (!map || map.isPeaceZone || Number(map.id) === 0) return Promise.resolve(false);
    const x = this.player?.x ?? map.spawn?.x ?? 350;
    const zone = getMapZoneNumberAtX(map.id, x);
    return this.activateCombatZone(zone);
  };

  proto.initBattlefield = function streamedInitBattlefield() {
    this.cleanupBattlefield?.();
    const map = getMapById(gameState.currentMapId);
    if (!map || map.isPeaceZone || Number(map.id) === 0) {
      this.__combatAssetsReady = false;
      return;
    }
    this.ensureActiveMapZoneAssets();
  };

  proto.initFellowNpcs = function streamedInitFellowNpcs() {
    const map = getMapById(gameState.currentMapId);
    if (!map || map.isPeaceZone || Number(map.id) === 0) {
      clearFellowObjects(this);
      return;
    }
    this.ensureActiveMapZoneAssets();
  };

  proto.initHerbs = function streamedInitHerbs() {
    const map = getMapById(gameState.currentMapId);
    if (!map || map.isPeaceZone || Number(map.id) === 0) return originalInitHerbs?.call(this);
    if (!this.__combatAssetsReady) {
      this.ensureActiveMapZoneAssets();
      return;
    }
    return originalInitHerbs?.call(this);
  };

  if (typeof originalCastSkill === 'function') {
    proto.castSkill = function streamedCastSkill(...args) {
      if (Number(gameState.currentMapId) !== 0 && !this.__combatAssetsReady) return false;
      return originalCastSkill.apply(this, args);
    };
  }
  if (typeof originalBasicAttack === 'function') {
    proto.basicAttack = function streamedBasicAttack(...args) {
      if (Number(gameState.currentMapId) !== 0 && !this.__combatAssetsReady) return false;
      return originalBasicAttack.apply(this, args);
    };
  }
  if (typeof originalSpawnVfx === 'function') {
    proto.spawnVfx = function streamedSpawnVfx(...args) {
      if (Number(gameState.currentMapId) !== 0 && !this.__combatAssetsReady) return null;
      return originalSpawnVfx.apply(this, args);
    };
  }

  proto.updateZoneStreaming = function updateZoneStreaming(time, delta) {
    const map = getMapById(gameState.currentMapId);
    if (!map || map.isPeaceZone || Number(map.id) === 0 || !this.player?.active) return;

    const now = Number(time || 0);
    if (now < Number(this.__nextZoneStreamCheckAt || 0)) return;
    this.__nextZoneStreamCheckAt = now + ZONE_POLL_MS;

    const zones = getMapZones(map.id);
    const currentZone = getMapZoneNumberAtX(map.id, this.player.x);
    if (Number(this.__activeStreamMapId) !== Number(map.id) || Number(this.__activeStreamZone) !== Number(currentZone)) {
      this.activateCombatZone(currentZone);
      return;
    }

    const def = zones[currentZone - 1];
    if (!def) return;
    const x = Number(this.player.x);
    if (currentZone < zones.length && Number(def.x1) - x <= PRELOAD_MARGIN) this.ensureMapZoneAssets(map.id, currentZone + 1);
    if (currentZone > 1 && x - Number(def.x0) <= PRELOAD_MARGIN) this.ensureMapZoneAssets(map.id, currentZone - 1);
  };
}
