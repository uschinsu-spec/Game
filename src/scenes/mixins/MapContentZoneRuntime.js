/**
 * MapContentZoneRuntime.js
 * =========================================================================
 * UNIFIED MAP CONTENT & ZONE RUNTIME ADAPTER
 * =========================================================================
 * Phân bổ nội dung (Enemy, Herb, Mineral, Roaming NPC) hoàn toàn dựa trên:
 * - Zone geometry từ worldRegistry
 * - map.realmRange & zone.realmRange
 * - map.locationKind & biome
 * - Profile density (Low / Medium / High / Extreme)
 *
 * Áp dụng thống nhất cho toàn bộ các map (Thành Vực, Dã Ngoại, Bí Cảnh, Cấm Địa).
 */
import { MONSTER_RANKS } from '../../config/monstersData.js';
import { getHerbsByRank } from '../../config/herbsData.js';
import { ELEMENTAL_SKILLS } from '../../config/skillsData.js';
import { REALMS } from '../../config/realmsData.js';
import { getNpcProgressionForMap, getNpcZoneConfig } from '../../config/world/mapNpcProgressions.js?v=20260930-dynamic-npc-progression-v6';
import { CANONICAL_MAP_KEYS } from '../../config/world/masterMapManifest.js?v=20260930-special-map-overrides-v5-unified';
import {
  getMapById,
  getMapZones,
  getMapZoneNumberAtX
} from '../../config/world/worldRegistry.js?v=20260930-canonical-geography-v1';
import { gameState } from '../../state/gameState.js';

const OWNER = 'MapContentZoneRuntime';

export const DENSITY_PROFILES = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  EXTREME: 'extreme'
});

export const MINERAL_STEP_PROFILES = Object.freeze({
  [DENSITY_PROFILES.LOW]: Object.freeze([
    Object.freeze([1400, 1800]),
    Object.freeze([1100, 1400]),
    Object.freeze([850, 1100]),
    Object.freeze([650, 850])
  ]),
  [DENSITY_PROFILES.MEDIUM]: Object.freeze([
    Object.freeze([1050, 1350]),
    Object.freeze([760, 980]),
    Object.freeze([560, 760]),
    Object.freeze([420, 600])
  ]),
  [DENSITY_PROFILES.HIGH]: Object.freeze([
    Object.freeze([800, 1050]),
    Object.freeze([580, 780]),
    Object.freeze([420, 580]),
    Object.freeze([300, 440])
  ]),
  [DENSITY_PROFILES.EXTREME]: Object.freeze([
    Object.freeze([550, 750]),
    Object.freeze([400, 550]),
    Object.freeze([280, 400]),
    Object.freeze([200, 300])
  ])
});

export const HERB_STEP_PROFILES = Object.freeze({
  [DENSITY_PROFILES.LOW]: Object.freeze([
    Object.freeze([1100, 1500]),
    Object.freeze([750, 1100]),
    Object.freeze([500, 750]),
    Object.freeze([350, 520])
  ]),
  [DENSITY_PROFILES.MEDIUM]: Object.freeze([
    Object.freeze([850, 1200]),
    Object.freeze([520, 780]),
    Object.freeze([340, 520]),
    Object.freeze([220, 360])
  ]),
  [DENSITY_PROFILES.HIGH]: Object.freeze([
    Object.freeze([600, 900]),
    Object.freeze([380, 580]),
    Object.freeze([250, 380]),
    Object.freeze([160, 260])
  ]),
  [DENSITY_PROFILES.EXTREME]: Object.freeze([
    Object.freeze([400, 650]),
    Object.freeze([260, 420]),
    Object.freeze([170, 270]),
    Object.freeze([110, 190])
  ])
});

export const ENEMY_STEP_PROFILES = Object.freeze({
  [DENSITY_PROFILES.LOW]: Object.freeze([600, 450, 350, 260]),
  [DENSITY_PROFILES.MEDIUM]: Object.freeze([450, 300, 220, 160]),
  [DENSITY_PROFILES.HIGH]: Object.freeze([320, 220, 160, 120]),
  [DENSITY_PROFILES.EXTREME]: Object.freeze([220, 150, 110, 80])
});

const MAX_STATIC_ENEMIES = 96;

/**
 * Phân giải mức độ mật độ tài nguyên/quái vật theo metadata map & zone
 */
export function resolveMapDensityLevel(map, zone = null) {
  if (!map) return DENSITY_PROFILES.MEDIUM;

  const kind = String(map.locationKind || map.type || '').toLowerCase();
  const minRealm = Number(zone?.realmRange?.[0] ?? map.realmRange?.[0] ?? map.minRealm ?? 0);

  // Bí cảnh, cấm địa, dungeon nguy hiểm -> EXTREME / HIGH
  if (kind.includes('forbidden') || kind.includes('dungeon') || kind.includes('cấm') || minRealm >= 16) {
    return DENSITY_PROFILES.EXTREME;
  }
  if (kind.includes('secret') || kind.includes('bí cảnh') || kind.includes('deep') || minRealm >= 8) {
    return DENSITY_PROFILES.HIGH;
  }
  if (kind.includes('starter') || kind.includes('outskirt') || minRealm <= 1) {
    return DENSITY_PROFILES.MEDIUM;
  }
  return DENSITY_PROFILES.MEDIUM;
}

export function getMineralProfile(map, zone = null) {
  const density = resolveMapDensityLevel(map, zone);
  return MINERAL_STEP_PROFILES[density] || MINERAL_STEP_PROFILES[DENSITY_PROFILES.MEDIUM];
}

export function getHerbProfile(map, zone = null) {
  const density = resolveMapDensityLevel(map, zone);
  return HERB_STEP_PROFILES[density] || HERB_STEP_PROFILES[DENSITY_PROFILES.MEDIUM];
}

export function getEnemyProfile(map, zone = null) {
  const density = resolveMapDensityLevel(map, zone);
  return ENEMY_STEP_PROFILES[density] || ENEMY_STEP_PROFILES[DENSITY_PROFILES.MEDIUM];
}

function clampZoneNumber(zoneNumber, count = 4) {
  return Math.max(1, Math.min(count, Number(zoneNumber) || 1));
}

function reduceEvenly(points, maxCount) {
  if (points.length <= maxCount) return points;
  const result = [];
  const stride = points.length / maxCount;
  for (let i = 0; i < maxCount; i++) result.push(points[Math.floor(i * stride)]);
  return result;
}

function buildEnemySpawnPoints(map) {
  const points = [];
  const zones = getMapZones(map.id);
  const enemySteps = getEnemyProfile(map);
  zones.forEach((zone, index) => {
    const step = enemySteps[Math.min(index, enemySteps.length - 1)];
    const start = Math.max(Number(map.field?.left || 60) + 80, Math.ceil(zone.x0));
    const end = Math.min(Number(map.field?.right || map.worldWidth - 60) - 100, Math.floor(zone.x1));
    for (let x = start; x < end; x += step) points.push({ x, zone: index + 1 });
  });
  return reduceEvenly(points, MAX_STATIC_ENEMIES);
}

function buildVariableZonePoints(map, stepProfile, edgePadding = 100) {
  const points = [];
  const zones = getMapZones(map.id);
  zones.forEach((zone, index) => {
    const [stepMin, stepMax] = stepProfile[Math.min(index, stepProfile.length - 1)];
    const start = Math.max(Number(map.field?.left || 60), Math.ceil(zone.x0)) + edgePadding;
    const end = Math.min(Number(map.field?.right || map.worldWidth - 60), Math.floor(zone.x1)) - edgePadding;
    for (let x = start; x < end; x += Phaser.Math.Between(stepMin, stepMax)) {
      points.push({ x, zone: index + 1 });
    }
  });
  return points;
}

function installEnemyZoneRuntime(proto) {
  proto.getEnemySpawnConfig = function getEnemySpawnConfigFromUnifiedMap(mapId, zone = 1, slotIndex = 0) {
    const map = getMapById(mapId);
    const zones = getMapZones(map?.id) || [];
    const strictZone = clampZoneNumber(zone, Math.max(1, zones.length));
    const currentZoneDef = zones[strictZone - 1];

    // Realm and ranks driven by zone/map realmRange
    const minRealm = Number(currentZoneDef?.realmRange?.[0] ?? map?.realmRange?.[0] ?? map?.minRealm ?? 0);
    const maxRealm = Number(currentZoneDef?.realmRange?.[1] ?? map?.realmRange?.[1] ?? (minRealm + 3));
    const rankOffset = strictZone === 1 ? (slotIndex % 2) : (strictZone === 2 ? (slotIndex % 3) : (1 + (slotIndex % 3)));
    const mIdx = Math.min(MONSTER_RANKS.length - 1, (map?.monsterIdxStart || Math.min(12, minRealm)) + rankOffset);
    const monsterData = MONSTER_RANKS[mIdx];
    const isFlying = minRealm >= 4 && (slotIndex % 2 === 1);
    const enemySpriteNum = isFlying ? ((slotIndex % 10) + 1) : (monsterData?.spriteNum || ((mIdx % 16) + 1));
    const displayName = isFlying ? `[Phi Thiên] ${monsterData?.name || 'Yêu Thú'}` : (monsterData?.name || 'Yêu Thú');

    return {
      monsterData,
      isFlying,
      spriteNum: enemySpriteNum,
      baseScale: isFlying ? 0.52 : 0.50,
      displayName,
      nameColor: isFlying ? '#67e8f9' : '#ffd700',
      nameFontSize: '9px'
    };
  };
}

function installResourceZoneRuntime(proto) {
  proto.initHerbs = function initHerbsFromUnifiedZones() {
    if (this.herbsGroup) {
      this.herbsGroup.forEach(h => {
        h.container?.destroy?.(true);
        h.hitZone?.destroy?.();
      });
    }
    this.herbsGroup = [];
    this.herbTarget = null;

    const map = getMapById(gameState.currentMapId ?? this.currentMap?.id);
    if (!map || map.isPeaceZone || map.id === CANONICAL_MAP_KEYS.THANH_VAN_THON) {
      this.initMineralNodes();
      return;
    }

    const mapRank = Math.min(5, Math.max(1, Math.floor((map.minRealm || 0) / 3) + 1));
    const availableHerbs = getHerbsByRank(mapRank);
    if (!availableHerbs?.length) {
      this.initMineralNodes();
      return;
    }

    const herbProfile = getHerbProfile(map);
    buildVariableZonePoints(map, herbProfile, 100).forEach((sp, index) => {
      const y = Phaser.Math.Between(this.field.top + 35, this.field.bottom - 35);
      const herbDef = availableHerbs[index % availableHerbs.length] || availableHerbs[0];
      this.spawnOneHerb(sp.x, y, sp.zone, index, herbDef);
    });

    this.initMineralNodes();
  };

  proto.initMineralNodes = function initMineralNodesFromUnifiedZones() {
    if (Array.isArray(this.mineralNodes)) {
      this.mineralNodes.forEach(node => {
        node?.container?.destroy?.(true);
        node?.hitZone?.destroy?.();
      });
    }
    this.mineralNodes = [];
    this.mineralTarget = null;

    const map = getMapById(gameState.currentMapId ?? this.currentMap?.id);
    if (!map || map.isPeaceZone) return;

    const mineralProfile = getMineralProfile(map);
    buildVariableZonePoints(map, mineralProfile, 180).forEach((sp, index) => {
      const y = Phaser.Math.Between(this.field.top + 42, this.field.bottom - 38);
      this.spawnMineralNode(sp.x, y, sp.zone, index);
    });
  };
}

function installNpcZoneRuntime(proto) {
  proto.getNpcSpawnConfig = function getNpcSpawnConfigFromUnifiedZones(mapId, homeX, elementIdx = -1) {
    const elemCfg = this.getNpcElement(elementIdx);
    const map = getMapById(mapId);
    const zoneNumber = getMapZoneNumberAtX(map.id, homeX);
    const zoneCfg = getNpcZoneConfig(map, zoneNumber);

    const realmIdx = Math.max(0, Math.min(REALMS.length - 1, zoneCfg.realmIdx ?? 0));
    const realmData = REALMS[realmIdx] || REALMS[0];
    let tierLevel = 1;
    let isFlying = false;

    if (realmIdx >= 13 && realmIdx <= 16) {
      tierLevel = 2;
      isFlying = true;
    } else if (realmIdx >= 17 && realmIdx <= 20) {
      tierLevel = 3;
      isFlying = true;
    } else if (realmIdx >= 21 && realmIdx <= 24) {
      tierLevel = 4;
      isFlying = true;
    } else if (realmIdx >= 25) {
      tierLevel = 5;
      isFlying = true;
    }

    const skillPrefix = elemCfg.isSword ? 'kiem' : elemCfg.eKey;
    const skillId = `${skillPrefix}_${tierLevel}`;
    const skillDef = ELEMENTAL_SKILLS.find(s => s.id === skillId)
      || ELEMENTAL_SKILLS.find(s => s.id === `${skillPrefix}_1`)
      || ELEMENTAL_SKILLS[0];

    return {
      mapId: map.id,
      canonicalKey: map.canonicalKey || map.id,
      zone: zoneNumber,
      realmIdx,
      realmMajor: realmData.major,
      stageLabel: realmData.name,
      tierLevel,
      isFlying,
      masteryName: zoneCfg.masteryName,
      masteryBonus: zoneCfg.masteryBonus,
      vfxMul: zoneCfg.vfxMul,
      masteryColor: zoneCfg.masteryColor,
      elem: elemCfg.elem,
      elemTitle: elemCfg.title,
      elemColor: elemCfg.color,
      eKey: elemCfg.eKey,
      isSword: elemCfg.isSword || false,
      isMelee: elemCfg.isMelee || false,
      skillId: skillDef.id,
      skillName: skillDef.name,
      dmgMul: skillDef.dmgMul || 1.6,
      atkInterval: skillDef.cd > 0 ? skillDef.cd : 2000,
      attackRange: elemCfg.baseRange || 240,
      maxHp: realmData.hp,
      dmg: realmData.dmg,
      def: realmData.def,
      manaMax: realmData.manaMax,
      spiritualSense: realmData.spiritualSense,
      tint: elemCfg.tint,
      titlePrefix: `[${realmData.name} · ${elemCfg.title}]`,
      titleColor: elemCfg.color
    };
  };
}

export function installMapContentZoneRuntime(MainGameScene) {
  const proto = MainGameScene?.prototype;
  if (!proto || proto.__mapContentZoneRuntimeInstalled) return;
  if (proto.__mapContentZoneOwner && proto.__mapContentZoneOwner !== OWNER) {
    throw new Error(`Map content zone conflict: ${proto.__mapContentZoneOwner} vs ${OWNER}`);
  }

  proto.__mapContentZoneOwner = OWNER;
  proto.__mapContentZoneRuntimeInstalled = true;
  installEnemyZoneRuntime(proto);
  installResourceZoneRuntime(proto);
  installNpcZoneRuntime(proto);
}
