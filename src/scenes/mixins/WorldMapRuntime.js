/**
 * WorldMapRuntime.js
 * Nối World Registry vào MainScene mà không làm phình MainScene.js.
 */
import { REALMS } from '../../config/realmsData.js';
import {
  canEnterMap,
  getMapById,
  getTravelRoutesForMap,
  resolvePanoramaMap,
  getPanoramaPreloadEntries
} from '../../config/regionsData.js?v=20260929-shared-panorama-v1';
import { gameState } from '../../state/gameState.js';
import { ensureWorldProgress, markMapVisited } from '../../state/worldProgress.js';

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

export function installWorldMapRuntime(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__worldMapRuntimeInstalled) return;
  const proto = MainGameScene.prototype;
  proto.__worldMapRuntimeInstalled = true;

  // Bảo đảm panorama từ registry mới luôn được preload, kể cả khi MainScene cũ còn cache ALL_MAPS.
  const originalPreload = proto.preload;
  if (typeof originalPreload === 'function') {
    proto.preload = function preloadWorldPanoramas(...args) {
      const result = originalPreload.apply(this, args);
      const A = './assets/';
      getPanoramaPreloadEntries().forEach(({ key, asset }) => {
        if (!key || !asset || this.textures?.exists?.(key) || isPanoramaQueued(this, key)) return;
        this.load.image(key, A + asset);
      });
      return result;
    };
  }

  // Runtime luôn dùng đúng kích thước World Registry.
  // Map chiến đấu panorama chung = 32.000x960, không còn ép map 4–13 về 2.880px.
  proto.applyMapRuntimeConfig = function applyMapRuntimeConfigFromRegistry(mapId) {
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

  const originalCreate = proto.create;
  if (typeof originalCreate === 'function') {
    proto.create = function createWithWorldProgress(...args) {
      ensureWorldProgress(gameState);
      const result = originalCreate.apply(this, args);
      markMapVisited(gameState, gameState.currentMapId, { unlockWaypoint: true });
      return result;
    };
  }

  const originalSwitchMap = proto.switchMap;
  if (typeof originalSwitchMap === 'function') {
    proto.switchMap = function switchMapWithWorldProgress(mapId, spawnX, spawnY) {
      const entered = originalSwitchMap.call(this, mapId, spawnX, spawnY);
      markMapVisited(gameState, entered?.id ?? mapId, { unlockWaypoint: true });
      return entered;
    };
  }

  proto.getMapPanoramaKey = function getMapPanoramaKey(map = this.currentMap) {
    const sourceMap = resolvePanoramaMap(map);
    if (sourceMap?.panoramaKey && this.textures.exists(sourceMap.panoramaKey)) return sourceMap.panoramaKey;
    if (this.textures.exists('map_panorama_0')) return 'map_panorama_0';
    return sourceMap?.panoramaKey || map?.panoramaKey || 'map_panorama_0';
  };

  proto.createMapPortals = function createMapPortalsFromRegistry() {
    if (this.activePortals) this.activePortals.forEach(portal => portal.container?.destroy());
    this.activePortals = [];
    const defs = getTravelRoutesForMap(gameState.currentMapId);
    defs.forEach(def => {
      const container = buildPortalVisual(this, def);
      this.activePortals.push({ ...def, container });
    });
  };

  proto.triggerPortalTeleport = function triggerPortalTeleportFromRegistry(portal) {
    const targetMapId = Number(portal?.targetMapId);
    const access = canEnterMap(targetMapId, gameState);
    if (!access.ok) {
      if (access.reason === 'REALM') {
        const realmName = REALMS[access.requiredRealmIdx]?.name || 'cảnh giới cao hơn';
        this.showFloatingText?.(this.player?.x || 270, (this.player?.y || 620) - 70, `Tu vi chưa đủ! Cần [${realmName}] để tiến vào.`, '#ff5555', '14px');
      }
      return;
    }

    const now = Number(this.time?.now || 0);
    if (targetMapId === 0 && now < Number(this.villageReentryBlockedUntil || 0)) return;

    const fromMapId = Number(gameState.currentMapId);
    const key = this.getPortalCooldownKey ? this.getPortalCooldownKey(fromMapId, targetMapId) : `portal_${fromMapId}_${targetMapId}`;
    if ((this[key] || 0) > now) return;
    this[key] = now + 3500;

    const targetMap = getMapById(targetMapId);
    this.switchMap(targetMap.id, portal.targetSpawnX, portal.targetSpawnY);
  };
}
