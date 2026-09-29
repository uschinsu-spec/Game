/**
 * mapTemplates.js
 * Bộ khung map dùng lại cho toàn bộ thế giới.
 * Panorama chuẩn chỉ giữ nền xa + mặt đất. Landmark/NPC/quái/tài nguyên là asset rời.
 */

export const PANORAMA_STANDARD = Object.freeze({
  sourceWidth: 2048,
  sourceHeight: 960,
  groundRatio: 0.70,
  horizonRatio: 0.30,
  horizonYRatio: 0.30,
  composition: 'GROUND_HORIZON_ONLY',
  largeLandmarksInBase: false,
  vegetationInBase: 'minimal',
  gameplayObjectsInBase: false,
  layers: Object.freeze([
    'sky',
    'horizon',
    'ground',
    'terrainDecor',
    'worldAssets',
    'gameplay',
    'foreground',
    'ui'
  ])
});

export const MAP_RUNTIME_PROFILE = Object.freeze({
  hub: Object.freeze({ worldWidth: 540, worldHeight: 960, chunkWidth: 540, activeChunkRadius: 0, defaultZones: 1 }),
  field: Object.freeze({ worldWidth: 32000, worldHeight: 960, chunkWidth: 1024, activeChunkRadius: 1, defaultZones: 4 }),
  dungeon: Object.freeze({ worldWidth: 16000, worldHeight: 960, chunkWidth: 1024, activeChunkRadius: 1, defaultZones: 4 }),
  boss: Object.freeze({ worldWidth: 8000, worldHeight: 960, chunkWidth: 1024, activeChunkRadius: 1, defaultZones: 2 })
});

function makeTemplate(id, type, biome, extra = {}) {
  const runtime = MAP_RUNTIME_PROFILE[type] || MAP_RUNTIME_PROFILE.field;
  return Object.freeze({
    id,
    type,
    biome,
    worldWidth: extra.worldWidth ?? runtime.worldWidth,
    worldHeight: extra.worldHeight ?? runtime.worldHeight,
    zoneCount: extra.zoneCount ?? runtime.defaultZones,
    visual: Object.freeze({
      basePolicy: 'GROUND_HORIZON_ONLY',
      groundRatio: PANORAMA_STANDARD.groundRatio,
      horizonRatio: PANORAMA_STANDARD.horizonRatio,
      allowLargeLandmarks: false,
      modularAssets: true,
      tintable: true,
      weatherReady: true,
      dayNightReady: true,
      ...(extra.visual || {})
    }),
    runtime: Object.freeze({
      chunkWidth: extra.chunkWidth ?? runtime.chunkWidth,
      activeChunkRadius: extra.activeChunkRadius ?? runtime.activeChunkRadius,
      objectPooling: extra.objectPooling ?? (type !== 'hub'),
      seedDrivenDecor: extra.seedDrivenDecor ?? (type !== 'hub'),
      lazyAssets: true
    })
  });
}

const templateSpecs = [
  ['HUB_VILLAGE_01', 'hub', 'village'], ['HUB_VILLAGE_02', 'hub', 'village'],
  ['HUB_VILLAGE_03', 'hub', 'village'], ['HUB_VILLAGE_04', 'hub', 'village'],
  ['HUB_TOWN_01', 'hub', 'town'], ['HUB_TOWN_02', 'hub', 'town'], ['HUB_TOWN_03', 'hub', 'town'],
  ['HUB_CITY_SMALL_01', 'hub', 'city'], ['HUB_CITY_SMALL_02', 'hub', 'city'], ['HUB_CITY_SMALL_03', 'hub', 'city'],
  ['HUB_CITY_LARGE_01', 'hub', 'city'], ['HUB_CITY_LARGE_02', 'hub', 'city'], ['HUB_CAPITAL_01', 'hub', 'capital'],

  ['FIELD_GRASSLAND_01', 'field', 'grassland'], ['FIELD_GRASSLAND_02', 'field', 'grassland'],
  ['FIELD_FOREST_01', 'field', 'forest'], ['FIELD_FOREST_02', 'field', 'forest'], ['FIELD_FOREST_03', 'field', 'forest'],
  ['FIELD_ANCIENT_FOREST_01', 'field', 'ancient_forest'], ['FIELD_ANCIENT_FOREST_02', 'field', 'ancient_forest'],
  ['FIELD_MOUNTAIN_01', 'field', 'mountain'], ['FIELD_MOUNTAIN_02', 'field', 'mountain'], ['FIELD_MOUNTAIN_03', 'field', 'mountain'],
  ['FIELD_VALLEY_01', 'field', 'valley'], ['FIELD_VALLEY_02', 'field', 'valley'],
  ['FIELD_RIVER_01', 'field', 'river'], ['FIELD_LAKE_01', 'field', 'lake'],
  ['FIELD_SWAMP_01', 'field', 'swamp'], ['FIELD_SWAMP_02', 'field', 'swamp'],
  ['FIELD_DESERT_01', 'field', 'desert'], ['FIELD_DESERT_02', 'field', 'desert'],
  ['FIELD_SNOW_01', 'field', 'snow'], ['FIELD_SNOW_02', 'field', 'snow'],
  ['FIELD_COAST_01', 'field', 'coast'], ['FIELD_ISLAND_01', 'field', 'island'],

  ['DUNGEON_CAVE_01', 'dungeon', 'cave'], ['DUNGEON_CAVE_02', 'dungeon', 'cave'],
  ['DUNGEON_MINE_01', 'dungeon', 'mine'], ['DUNGEON_RUINS_01', 'dungeon', 'ruins'],
  ['DUNGEON_RUINS_02', 'dungeon', 'ruins'], ['DUNGEON_TOMB_01', 'dungeon', 'tomb'],
  ['DUNGEON_TEMPLE_01', 'dungeon', 'temple'],

  ['FIELD_BATTLEFIELD_01', 'field', 'battlefield'], ['FIELD_DARKLAND_01', 'field', 'darkland'],
  ['FIELD_IMMORTAL_01', 'field', 'immortal'], ['DUNGEON_SECRET_REALM_01', 'dungeon', 'secret_realm'],
  ['DUNGEON_ABYSS_01', 'dungeon', 'abyss']
];

export const MAP_TEMPLATES = Object.freeze(Object.fromEntries(
  templateSpecs.map(spec => {
    const [id, type, biome] = spec;
    return [id, makeTemplate(id, type, biome)];
  })
));

export function getMapTemplate(templateId) {
  return MAP_TEMPLATES[templateId] || MAP_TEMPLATES.FIELD_GRASSLAND_01;
}

export function getTemplatesByBiome(biome) {
  return Object.values(MAP_TEMPLATES).filter(template => template.biome === biome);
}
