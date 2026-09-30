/**
 * WorldMapRuntime.js
 * SINGLE MAP RUNTIME OWNER.
 *
 * All active map runtime behavior lives here:
 * registry config, panorama loading/rendering, switching maps and portals.
 * MainScene contains no competing map runtime.
 */
import { REALMS } from '../../config/realmsData.js';
import {
  canEnterMap,
  getMapById,
  getTravelRoutesForMap,
  resolvePanoramaMap
} from '../../config/world/worldRegistry.js?v=20260929-single-map-system-v1';
import { gameState } from '../../state/gameState.js';
import { ensureWorldProgress, markMapVisited } from '../../state/worldProgress.js';

const MAP_RUNTIME_OWNER = 'WorldMapRuntime';
const A = './assets/';

function sameMapId(a, b) {
  return String(a) === String(b);
}

function buildPortalVisual(scene, def) {
  const container = scene.add.container(def.x, def.y).setDepth(Math.floor(def.y) - 5);
  const groundGfx = scene.add.graphics().setScale(1.25, 0.46);
  const rainbowColors = [0x00ffff, 0xff00ff, 0xffd700, 0x00ff88, 0x9d4edd, 0xff6b00];
  for (let r = 92; r >= 20; r -= 14) {
    groundGfx.lineStyle(3, rainbowColors[(r / 14) % rainbowColors.length], 0.75);
    groundGfx.strokeCircle(0, 0, r);
  }
  groundGfx.fillStyle(0x00ffff, 0.18).fillCircle(0, 0, 96);
  container.add(groundGfx);

  const hit = scene.add.ellipse(0, 0, 240, 90, 0x00ffff, 0.001).setInteractive({ useHandCursor: true });
  hit.on('pointerdown', pointer => {
    pointer?.event?.stopPropagation?.();
    scene.input?.stopPropagation?.();
    scene.triggerPortalTeleport(def);
  });
  container.add(hit);
  scene.tweens.add({ targets: groundGfx, angle: 360, duration: 11000, repeat: -1, ease: 'Linear' });

  const sign = scene.add.container(0, -225);
  const bg = scene.add.graphics();
  bg.fillStyle(0x061426, 0.9).fillRoundedRect(-145, -34, 290, 68, 14);
  bg.lineStyle(2.5, 0x00ffff, 0.95).strokeRoundedRect(-145, -34, 290, 68, 14);
  sign.add(bg);
  sign.add(scene.add.text(0, -12, `🌀 ${def.title} 🌀`, {
    fontFamily: 'sans-serif', fontSize: '17px', fontStyle: 'bold', color: '#fff', stroke: '#003366', strokeThickness: 4
  }).setOrigin(0.5));
  sign.add(scene.add.text(0, 14, `[ ${def.sub} ]`, {
    fontFamily: 'sans-serif', fontSize: '10.5px', fontStyle: 'bold', color: '#66ffcc', stroke: '#000', strokeThickness: 2
  }).setOrigin(0.5));
  container.add(sign);
  return container;
}

function isPanoramaQueued(scene, key) {
  const entries = scene?.load?.list?.entries;
  return Array.isArray(entries) && entries.some(file => file?.key === key);
}

function fitSharedPanorama(scene, map) {
  if (!map?.useSharedWildernessPanorama || !scene?.bg) return;
  const frame = scene.textures?.getFrame?.(map.panoramaKey);
  const sourceHeight = Number(frame?.realHeight || frame?.height || map.panoramaSourceHeight || 960);
  if (!Number.isFinite(sourceHeight) || sourceHeight <= 0) return;
  const scale = Number(scene.worldH || map.worldHeight || 960) / sourceHeight;
  if (typeof scene.bg.setTileScale === 'function') scene.bg.setTileScale(scale, scale);
  else {
    scene.bg.tileScaleX = scale;
    scene.bg.tileScaleY = scale;
  }
}

function createPanoramaBackground(scene, map) {
  const panoramaKey = scene.getMapPanoramaKey(map);

  // Không phá nền cũ cho tới khi texture đích thực sự tồn tại. Đây là guard
  // chống màn hình đen khi mobile chưa kịp nạp panorama của Châu/Đạo/Lĩnh/Phủ.
  if (!panoramaKey || !scene.textures?.exists?.(panoramaKey)) {
    console.warn('[Map runtime] Panorama texture chưa sẵn sàng:', panoramaKey, map?.id);
    return scene.bg || null;
  }

  const oldBg = scene.bg;
  const isHub = map?.isPeaceZone === true || map?.uiMode === 'village_hub' || map?.uiMode === 'city_hub' || map?.uiMode === 'sect_hub';
  const shouldRepeat = !!map?.runtime?.repeatPanorama && !map?.noRepeat && !isHub && Number(scene.worldW || 0) > 2880;

  let nextBg;
  if (shouldRepeat) {
    nextBg = scene.add.tileSprite(
      scene.worldW / 2,
      scene.worldH / 2,
      scene.worldW,
      scene.worldH,
      panoramaKey
    ).setDepth(-10);
  } else {
    nextBg = scene.add.image(scene.worldW / 2, scene.worldH / 2, panoramaKey)
      .setDisplaySize(scene.worldW, scene.worldH)
      .setDepth(-10);
  }

  scene.bg = nextBg;
  oldBg?.destroy?.();
  if (shouldRepeat) fitSharedPanorama(scene, map);
  return scene.bg;
}

export function installWorldMapRuntime(MainGameScene) {
  if (!MainGameScene?.prototype) return;
  const proto = MainGameScene.prototype;
  if (proto.__worldMapRuntimeInstalled) return;

  if (proto.__mapRuntimeOwner && proto.__mapRuntimeOwner !== MAP_RUNTIME_OWNER) {
    throw new Error(`Map runtime conflict: ${proto.__mapRuntimeOwner} vs ${MAP_RUNTIME_OWNER}`);
  }
  proto.__mapRuntimeOwner = MAP_RUNTIME_OWNER;
  proto.__worldMapRuntimeInstalled = true;

  proto.applyMapRuntimeConfig = function applyMapRuntimeConfig(mapId) {
    ensureWorldProgress(gameState);
    const map = getMapById(mapId);
    this.currentMap = map;
    this.worldW = Number(map?.worldWidth || 2880);
    this.worldH = Number(map?.worldHeight || 960);
    this.field = { ...(map?.field || {
      left: 60,
      right: this.worldW - 60,
      top: 350,
      bottom: Math.min(900, this.worldH - 60)
    }) };
    return map;
  };

  proto.getMapPanoramaKey = function getMapPanoramaKey(map = this.currentMap) {
    const sourceMap = resolvePanoramaMap(map);
    if (sourceMap?.panoramaKey && this.textures.exists(sourceMap.panoramaKey)) return sourceMap.panoramaKey;
    if (map?.panoramaKey && this.textures.exists(map.panoramaKey)) return map.panoramaKey;
    if (this.textures.exists('map_panorama_wilderness_shared') && !map?.isPeaceZone) return 'map_panorama_wilderness_shared';
    if (this.textures.exists('map_panorama_0')) return 'map_panorama_0';
    return sourceMap?.panoramaKey || map?.panoramaKey || 'map_panorama_0';
  };

  proto.ensurePanoramaLoaded = function ensurePanoramaLoaded(mapId) {
    const map = getMapById(mapId);
    const sourceMap = resolvePanoramaMap(map);
    const key = sourceMap?.panoramaKey;
    const asset = sourceMap?.panoramaAsset;
    if (!key || !asset) return Promise.resolve(sourceMap || map);
    if (this.textures?.exists?.(key)) return Promise.resolve(sourceMap);

    if (!this.__panoramaLoadPromises) this.__panoramaLoadPromises = new Map();
    if (this.__panoramaLoadPromises.has(key)) return this.__panoramaLoadPromises.get(key);

    const promise = new Promise((resolve, reject) => {
      const fileEvent = `filecomplete-image-${key}`;
      const onComplete = () => {
        cleanup();
        resolve(sourceMap);
      };
      const onError = file => {
        if (file?.key !== key) return;
        cleanup();
        reject(new Error(`Không tải được panorama ${key}`));
      };
      const cleanup = () => {
        this.load.off(fileEvent, onComplete);
        this.load.off('loaderror', onError);
      };

      this.load.once(fileEvent, onComplete);
      this.load.on('loaderror', onError);
      if (!isPanoramaQueued(this, key)) this.load.image(key, A + asset);

      const busy = typeof this.load.isLoading === 'function' ? this.load.isLoading() : false;
      if (!busy) this.load.start();
    }).finally(() => this.__panoramaLoadPromises.delete(key));

    this.__panoramaLoadPromises.set(key, promise);
    return promise;
  };

  proto.createWorld = function createWorldFromRegistry() {
    const map = this.currentMap || this.applyMapRuntimeConfig(gameState.currentMapId);
    return createPanoramaBackground(this, map);
  };

  proto.getDirectMapRoute = function getDirectMapRoute(fromMapId, toMapId) {
    return getTravelRoutesForMap(fromMapId).find(route => sameMapId(route.targetMapId, toMapId)) || null;
  };

  const commitMapSwitch = function commitMapSwitch(map, spawnX, spawnY) {
    const fromMapId = gameState.currentMapId;
    const linkedRoute = this.getDirectMapRoute(fromMapId, map.id);
    const sx = linkedRoute?.targetSpawnX ?? spawnX ?? map.spawn?.x ?? 270;
    const sy = linkedRoute?.targetSpawnY ?? spawnY ?? map.spawn?.y ?? 620;

    this.applyMapRuntimeConfig(map.id);
    gameState.currentMapId = map.id;
    this.__combatAssetsReady = false;
    this.__activeStreamMapId = null;
    this.__activeStreamZone = null;
    this.__zoneActivationPendingKey = null;
    this.__zoneActivationPromise = null;

    this.physics.world.setBounds(0, 0, this.worldW, this.worldH);
    this.cameras.main.setBounds(0, 0, this.worldW, this.worldH);

    const isHub = map?.isPeaceZone === true || map?.uiMode === 'village_hub' || map?.uiMode === 'city_hub' || map?.uiMode === 'sect_hub';
    if (isHub) {
      this.cameras.main.stopFollow();
      this.cameras.main.setScroll(0, 0);
    } else if (this.player) {
      this.cameras.main.startFollow(this.player, true, 0.08, 0.08, 0, 40);
    }

    const bg = createPanoramaBackground(this, map);
    if (!bg) {
      console.warn('[Map runtime] Không tạo được background cho map:', map.id);
    }

    if (this.player) this.player.setPosition(sx, sy).setVelocity(0, 0);
    this.moveTarget = null;

    this.createNpcs?.();
    this.createMapPortals?.();
    this.syncVillageHubMode?.();
    this.initBattlefield?.();
    this.initFellowNpcs?.();
    this.initHerbs?.();
    this.updateHUD?.();

    markMapVisited(gameState, map.id, { unlockWaypoint: true });
    this.resetJoy?.();
    return map;
  };

  proto.switchMap = function switchMapFromRegistry(mapId, spawnX, spawnY) {
    this.resetJoy?.();
    this.moveTarget = null;

    const access = canEnterMap(mapId, gameState);
    if (!access.ok) return this.currentMap || getMapById(gameState.currentMapId);

    const fromMapId = gameState.currentMapId;
    const map = access.map;
    const now = Number(this.time?.now || 0);

    if (sameMapId(map.id, 0) && !sameMapId(fromMapId, 0) && now < Number(this.villageReentryBlockedUntil || 0)) {
      return this.currentMap || getMapById(fromMapId);
    }

    const sourceMap = resolvePanoramaMap(map);
    const panoramaKey = sourceMap?.panoramaKey;
    if (panoramaKey && !this.textures?.exists?.(panoramaKey)) {
      const token = `${String(fromMapId)}->${String(map.id)}:${Date.now()}`;
      this.__pendingMapSwitchToken = token;
      this.ensurePanoramaLoaded(map.id)
        .then(() => {
          if (this.__pendingMapSwitchToken !== token) return;
          if (!sameMapId(gameState.currentMapId, fromMapId)) return;
          this.__pendingMapSwitchToken = null;
          commitMapSwitch.call(this, map, spawnX, spawnY);
        })
        .catch(error => {
          if (this.__pendingMapSwitchToken === token) this.__pendingMapSwitchToken = null;
          console.warn('[Map runtime] Panorama lazy-load failed:', error);
          this.showFloatingText?.(
            this.player?.x || 270,
            (this.player?.y || 620) - 70,
            'Không tải được bản đồ. Hãy thử lại.',
            '#ff7777',
            '13px'
          );
        });
      return this.currentMap || getMapById(fromMapId);
    }

    return commitMapSwitch.call(this, map, spawnX, spawnY);
  };

  proto.createMapPortals = function createMapPortalsFromRegistry() {
    if (this.activePortals) this.activePortals.forEach(portal => portal.container?.destroy());
    this.activePortals = [];
    getTravelRoutesForMap(gameState.currentMapId)
      .filter(def => def.portalVisible !== false)
      .forEach(def => {
        const container = buildPortalVisual(this, def);
        this.activePortals.push({ ...def, container });
      });
  };

  proto.getPortalCooldownKey = function getPortalCooldownKey(fromMapId, toMapId) {
    return `portal_${String(fromMapId)}_${String(toMapId)}`;
  };

  proto.triggerPortalTeleport = function triggerPortalTeleportFromRegistry(portal) {
    const targetMapId = portal?.targetMapId;
    const access = canEnterMap(targetMapId, gameState);
    if (!access.ok) {
      if (access.reason === 'REALM') {
        const realmName = REALMS[access.requiredRealmIdx]?.name || 'cảnh giới cao hơn';
        this.showFloatingText?.(
          this.player?.x || 270,
          (this.player?.y || 620) - 70,
          `Tu vi chưa đủ! Cần [${realmName}] để tiến vào.`,
          '#ff5555',
          '14px'
        );
      }
      return;
    }

    const now = Number(this.time?.now || 0);
    const fromMapId = gameState.currentMapId;
    const key = this.getPortalCooldownKey(fromMapId, targetMapId);
    if ((this[key] || 0) > now) return;
    this[key] = now + 3500;

    this.switchMap(targetMapId, portal.targetSpawnX, portal.targetSpawnY);
  };

  const originalCreate = proto.create;
  if (typeof originalCreate === 'function') {
    proto.create = function createWithSingleMapRuntime(...args) {
      ensureWorldProgress(gameState);
      const result = originalCreate.apply(this, args);
      fitSharedPanorama(this, this.currentMap);
      markMapVisited(gameState, gameState.currentMapId, { unlockWaypoint: true });
      return result;
    };
  }
}
