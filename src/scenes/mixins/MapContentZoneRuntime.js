/**
 * MapContentZoneRuntime.js
 *
 * Single active adapter for map-dependent gameplay content.
 * Enemy, herb, mineral and roaming-NPC zone selection all consume the exact
 * same zone geometry from worldRegistry. No active gameplay system owns its
 * own x-threshold map geometry anymore.
 */
import { MONSTER_RANKS } from '../../config/monstersData.js';
import { getHerbsByRank } from '../../config/herbsData.js';
import { ELEMENTAL_SKILLS } from '../../config/skillsData.js';
import { REALMS } from '../../config/realmsData.js';
import { getNpcProgressionForMap } from '../../config/world/mapNpcProgressions.js?v=20260929-single-map-system-v2';
import {
  getMapById,
  getMapZones,
  getMapZoneNumberAtX
} from '../../config/world/worldRegistry.js?v=20260929-single-map-system-v1';
import { gameState } from '../../state/gameState.js';

const OWNER = 'MapContentZoneRuntime';
const ENEMY_ZONE_STEPS = Object.freeze([450, 300, 220, 160]);
const HERB_ZONE_STEPS = Object.freeze([
  Object.freeze([850, 1200]),
  Object.freeze([520, 780]),
  Object.freeze([340, 520]),
  Object.freeze([220, 360])
]);
const MINERAL_STEPS = Object.freeze({
  1: Object.freeze([
    Object.freeze([1050, 1350]),
    Object.freeze([760, 980]),
    Object.freeze([560, 760]),
    Object.freeze([420, 600])
  ]),
  2: Object.freeze([
    Object.freeze([900, 1150]),
    Object.freeze([650, 850]),
    Object.freeze([460, 620]),
    Object.freeze([300, 430])
  ])
});
const MAX_STATIC_ENEMIES = 96;

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
  zones.forEach((zone, index) => {
    const step = ENEMY_ZONE_STEPS[Math.min(index, ENEMY_ZONE_STEPS.length - 1)];
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
  proto.initBattlefield = function initBattlefieldFromUnifiedZones() {
    if (this.enemyGroup) {
      this.enemyGroup.getChildren().forEach(e => {
        e.hpBar?.destroy?.();
        e.hpBg?.destroy?.();
        e.nameText?.destroy?.();
      });
      this.enemyGroup.clear(true, true);
    }
    this.enemies = [];

    if (this.groundDrops) {
      this.groundDrops.forEach(gd => gd?.active && gd.destroy());
      this.groundDrops = [];
    }

    const map = getMapById(gameState.currentMapId);
    if (map.isPeaceZone || map.id === 0) return;

    buildEnemySpawnPoints(map).forEach((sp, index) => {
      const y = Phaser.Math.Between(this.field.top + 35, this.field.bottom - 35);
      this.spawnOneFixedEnemy(sp.x, y, index, sp.zone);
    });
  };

  proto.getEnemySpawnConfig = function getEnemySpawnConfigFromUnifiedMap(mapId, zone = 1, slotIndex = 0) {
    const map = getMapById(mapId);
    const mapNum = Number(map.id) || 0;
    const strictZone = clampZoneNumber(zone, Math.max(1, getMapZones(map.id).length));

    // Vạn Mộc keeps its authored four monster stages; geometry comes from registry.
    if (mapNum === 2) {
      const vanMocZoneConfigs = {
        1: { monsterId: 'm_1_1', spriteNum: 5, stageLabel: 'Sơ Kỳ', color: '#a7f3d0', sizeMultiplier: 1.2 },
        2: { monsterId: 'm_1_2', spriteNum: 4, stageLabel: 'Trung Kỳ', color: '#fde68a', sizeMultiplier: 1.4 },
        3: { monsterId: 'm_1_3', spriteNum: 9, stageLabel: 'Hậu Kỳ', color: '#fdba74', sizeMultiplier: 1.6 },
        4: { monsterId: 'm_1_4', spriteNum: 7, stageLabel: 'Đỉnh Phong', color: '#fb7185', sizeMultiplier: 1.8 }
      };
      const cfg = vanMocZoneConfigs[clampZoneNumber(strictZone, 4)];
      const monsterData = MONSTER_RANKS.find(m => m.id === cfg.monsterId) || MONSTER_RANKS[4];
      return {
        monsterData,
        spriteNum: cfg.spriteNum,
        baseScale: 0.50 * cfg.sizeMultiplier,
        displayName: `${monsterData.name} • ${cfg.stageLabel}`,
        nameColor: cfg.color,
        nameFontSize: strictZone === 4 ? '10px' : (strictZone === 3 ? '9.5px' : '9px'),
        vanMocZone: strictZone,
        vanMocStage: cfg.stageLabel,
        vanMocSizeMultiplier: cfg.sizeMultiplier
      };
    }

    let rankOffset = 0;
    if (strictZone === 1) rankOffset = slotIndex % 2;
    else if (strictZone === 2) rankOffset = slotIndex % 3;
    else rankOffset = 1 + (slotIndex % 3);

    const mIdx = Math.min(MONSTER_RANKS.length - 1, (map.monsterIdxStart || 0) + rankOffset);
    const monsterData = MONSTER_RANKS[mIdx];
    const spriteNum = monsterData.spriteNum || ((mIdx % 16) + 1);

    return {
      monsterData,
      isFlying: false,
      spriteNum,
      baseScale: 0.50,
      displayName: monsterData.name,
      nameColor: '#ffd700',
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

    const map = getMapById(gameState.currentMapId ?? this.currentMap?.id ?? 0);
    if (map.isPeaceZone || map.id === 0) {
      this.initMineralNodes();
      return;
    }

    const mapRank = Math.min(5, Math.max(1, Number(map.id)));
    const availableHerbs = getHerbsByRank(mapRank);
    if (!availableHerbs?.length) {
      this.initMineralNodes();
      return;
    }

    buildVariableZonePoints(map, HERB_ZONE_STEPS, 100).forEach((sp, index) => {
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

    const map = getMapById(gameState.currentMapId ?? this.currentMap?.id ?? 0);
    const profile = MINERAL_STEPS[Number(map.id)];
    if (!profile) return;

    buildVariableZonePoints(map, profile, 180).forEach((sp, index) => {
      const y = Phaser.Math.Between(this.field.top + 42, this.field.bottom - 38);
      this.spawnMineralNode(sp.x, y, sp.zone, index);
    });
  };
}

function installNpcZoneRuntime(proto) {
  proto.getNpcSpawnConfig = function getNpcSpawnConfigFromUnifiedZones(mapId, homeX, elementIdx = -1) {
    const elemCfg = this.getNpcElement(elementIdx);
    const map = getMapById(mapId);
    const mapNum = Number(map.id) || 0;
    const progression = getNpcProgressionForMap(mapNum);
    const zoneNumber = clampZoneNumber(getMapZoneNumberAtX(mapNum, homeX), progression.length);
    const zoneCfg = progression[zoneNumber - 1] || progression[progression.length - 1];

    const realmIdx = Math.max(0, Math.min(REALMS.length - 1, zoneCfg.realmIdx ?? 0));
    const realmData = REALMS[realmIdx] || REALMS[0];
    let tierLevel = 1;
    let isFlying = false;

    // Tier behavior is realm-driven, never map-ID-driven. This keeps future
    // materialized Nam Lăng locations compatible without inventing hidden maps.
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
      mapId: mapNum,
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
