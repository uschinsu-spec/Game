/**
 * WorldMapRuntime.js
 * SINGLE MAP RUNTIME OWNER.
 *
 * All active map runtime behavior lives here:
 * registry config, panorama loading/rendering, switching maps and portals.
 * MainScene legacy methods are replaced at bootstrap and are never chained.
 */
import { REALMS } from '../../config/realmsData.js';
import {
  canEnterMap,
  getMapById,
  getTravelRoutesForMap,
  resolvePanoramaMap,
  getPanoramaPreloadEntries
} from '../../config/world/worldRegistry.js';
import { gameState } from '../../state/gameState.js';
import { ensureWorldProgress, markMapVisited } from '../../state/worldProgress.js';

const MAP_RUNTIME_OWNER = 'WorldMapRuntime';

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
  if (scene.bg) {
    scene.bg.destroy();
    scene.bg = null;
  }

  const panoramaKey = scene.getMapPanoramaKey(map);
  const shouldRepeat = !!map?.runtime?.repeatPanorama &&
    !map?.noRepeat && !map?.isPeaceZone && Number(scene.worldW || 0) > 2880;

  if (shouldRepeat) {
    scene.bg = scene.add.tileSprite(
      scene.worldW / 2,
      scene.worldH / 2,
      scene.worldW,
      scene.worldH,
      panoramaKey
    ).setDepth(-10);
    fitSharedPanorama(scene, map);
  } else {
    scene.bg = scene.add.image(scene.worldW / 2, scene.worldH / 2, panoramaKey)
      .setDisplaySize(scene.worldW, scene.worldH)
      .setDepth(-10);
  }
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

  // Keep MainScene's non-map asset preload, then add the authoritative registry panoramas once.
  const originalPreload = proto.preload;
  if (typeof originalPreload === 'function') {
    proto.preload = function preloadWithWorldRegistry(...args) {
      const result = originalPreload.apply(this, args);
      const A = './assets/';
      getPanoramaPreloadEntries().forEach(({ key, asset }) => {
        if (!key || !asset || this.textures?.exists?.(key) || isPanoramaQueued(this, key)) return;
        this.load.image(key, A + asset);
      });
      return result;
    };
  }

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
    if (this.textures.exists('map_panorama_0')) return 'map_panorama_0';
    return sourceMap?.panoramaKey || map?.panoramaKey || 'map_panorama_0';
  };

  proto.createWorld = function createWorldFromRegistry() {
    const map = this.currentMap || this.applyMapRuntimeConfig(gameState.currentMapId);
    return createPanoramaBackground(this, map);
  };

  // Direct implementation: never calls/chains MainScene's legacy switchMap.
  proto.switchMap = function switchMapFromRegistry(mapId, spawnX, spawnY) {
    this.resetJoy?.();
    this.moveTarget = null;

    const map = this.applyMapRuntimeConfig(mapId);
    gameState.currentMapId = map.id;

    this.physics.world.setBounds(0, 0, this.worldW, this.worldH);
    this.cameras.main.setBounds(0, 0, this.worldW, this.worldH);
    createPanoramaBackground(this, map);

    const sx = spawnX ?? map.spawn?.x ?? 350;
    const sy = spawnY ?? map.spawn?.y ?? 620;
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

  proto.createMapPortals = function createMapPortalsFromRegistry() {
    if (this.activePortals) this.activePortals.forEach(portal => portal.container?.destroy());
    this.activePortals = [];
    getTravelRoutesForMap(gameState.currentMapId).forEach(def => {
      const container = buildPortalVisual(this, def);
      this.activePortals.push({ ...def, container });
    });
  };

  proto.getPortalCooldownKey = function getPortalCooldownKey(fromMapId, toMapId) {
    return `portal_${Number(fromMapId)}_${Number(toMapId)}`;
  };

  proto.triggerPortalTeleport = function triggerPortalTeleportFromRegistry(portal) {
    const targetMapId = Number(portal?.targetMapId);
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
    if (targetMapId === 0 && now < Number(this.villageReentryBlockedUntil || 0)) return;

    const fromMapId = Number(gameState.currentMapId);
    const key = this.getPortalCooldownKey(fromMapId, targetMapId);
    if ((this[key] || 0) > now) return;
    this[key] = now + 3500;

    const targetMap = getMapById(targetMapId);
    this.switchMap(targetMap.id, portal.targetSpawnX, portal.targetSpawnY);
  };

  // Preserve the scene lifecycle only; all map calls made inside create() resolve to methods above.
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
