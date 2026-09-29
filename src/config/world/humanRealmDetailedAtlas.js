/**
 * humanRealmDetailedAtlas.js
 * DATA ONLY: detailed exploration/gameplay blueprint for every canonical node in Nhân Giới.
 *
 * Profiles are deterministic and generated lazily on first access so the complete
 * atlas does not inflate mobile boot. This module never creates runtime maps/assets.
 */
import {
  HUMAN_REALM_ROOT_ID,
  HUMAN_REALM_WORLD_NODES
} from './humanRealmWorld.js?v=20260929-human-realm-v3';
import {
  getProvinceAtlasProfile,
  getRegionAtlasProfile
} from './namLangProvinceAtlas.js?v=20260929-atlas-v1';

export const HUMAN_REALM_DETAIL_VERSION = '20260929-human-realm-detailed-atlas-v1';

const CONTINENT_STYLE = Object.freeze({
  south: Object.freeze({
    name: 'Nam Lăng Đại Lục',
    biomes: ['linh điền', 'sơn lâm', 'đại giang', 'kiếm sơn', 'cổ thành', 'hoang dã'],
    terrain: ['đồi núi xen đồng bằng', 'thung lũng linh mạch', 'rừng núi liên hoàn', 'cao nguyên và đại hà'],
    architecture: ['thành quách ngói xanh', 'tông môn bám sườn núi', 'phường thị ven sông', 'thôn trấn quanh linh điền'],
    weather: ['linh vũ', 'sương núi', 'mưa phùn', 'gió mùa', 'lôi vân cục bộ'],
    hazards: ['thú triều', 'sơn tặc tu sĩ', 'độc chướng', 'linh mạch bạo động', 'cổ trận thức tỉnh'],
    events: ['tông môn tuyển đồ', 'linh dược thành thục', 'yêu thú công thành', 'bí cảnh mở cửa', 'thương hội liên châu'],
    travel: ['quan đạo', 'phi kiếm tuyến', 'linh chu đường sông', 'truyền tống trận cấp thành'],
    conflict: 'hoàng triều, tông môn, gia tộc và yêu tộc tranh linh mạch cùng tài nguyên',
    ambience: ['chuông tông môn', 'tiếng suối', 'gió trúc', 'chợ tu sĩ', 'thú rừng xa']
  }),
  east: Object.freeze({
    name: 'Đông Huyền Đại Lục',
    biomes: ['hải vực', 'long mạch', 'kiếm sơn', 'lôi trạch', 'thần mộc', 'quần đảo'],
    terrain: ['sơn hải giao thoa', 'đảo nổi và vách biển', 'long mạch chạy dọc bờ đông', 'kiếm phong dựng đứng'],
    architecture: ['đạo thành ven hải', 'kiếm các trên huyền nhai', 'long cung thủy phủ', 'lôi đài bằng huyền thạch'],
    weather: ['hải vụ', 'linh vũ', 'lôi bạo', 'hải triều linh khí', 'cuồng phong'],
    hazards: ['hải yêu triều', 'lôi bạo thiên nhiên', 'kiếm ý loạn lưu', 'long uy áp chế', 'hải vực xoáy linh lực'],
    events: ['hải thú tập kích', 'long mạch thức tỉnh', 'kiếm hội liên đạo', 'lôi kiếp dị thường', 'thương đoàn vượt hải'],
    travel: ['hải thuyền linh lực', 'phi kiếm tuyến', 'long môn thủy đạo', 'truyền tống trận Huyền Vực'],
    conflict: 'đạo thống, hải tộc, long duệ, kiếm tông và thương minh tranh quyền trên sơn hải',
    ambience: ['hải triều', 'kiếm minh', 'sấm xa', 'hải âu linh thú', 'chuông cảng']
  }),
  west: Object.freeze({
    name: 'Tây Mạc Đại Lục',
    biomes: ['sa hải', 'ốc đảo', 'thạch lâm', 'địa hỏa', 'cổ mộ', 'huyễn sa'],
    terrain: ['đại mạc vô tận', 'thạch lâm cắt xẻ', 'cồn cát linh lực', 'hỏa sơn khô cằn'],
    architecture: ['cổ thành sa thạch', 'thần điện bán ngầm', 'ốc đảo thương trấn', 'bộ tộc thành lũy'],
    weather: ['sa bạo', 'nhiệt phong', 'hỏa vũ', 'ảo quang', 'đêm cực lạnh'],
    hazards: ['sa trùng', 'lạc đường huyễn cảnh', 'địa hỏa phun trào', 'cổ mộ âm khí', 'cướp đoàn tu sĩ'],
    events: ['sa hải đổi dòng', 'cổ thành xuất thế', 'ốc đảo linh tuyền bộc phát', 'thần điện mở cửa', 'bộ tộc đại hội'],
    travel: ['sa chu', 'linh thú đoàn', 'cổ lộ bia đá', 'truyền tống trận ốc đảo'],
    conflict: 'cổ quốc, thần điện, bộ tộc và thương minh tranh ốc đảo, mỏ cổ và đường thương lữ',
    ambience: ['gió cát', 'chuông lạc đà linh thú', 'trống bộ tộc', 'địa hỏa rền', 'tiếng cát trượt']
  }),
  north: Object.freeze({
    name: 'Bắc Minh Đại Lục',
    biomes: ['băng nguyên', 'tuyết sơn', 'hàn hồ', 'băng hải', 'cực quang', 'băng động'],
    terrain: ['băng nguyên nứt vỡ', 'tuyết sơn liên miên', 'hàn hồ đóng băng', 'bờ Bắc Minh hải'],
    architecture: ['băng thành', 'hàn cung', 'phủ thành đá đen', 'tuyết bảo quanh hàn mạch'],
    weather: ['bão tuyết', 'hàn triều', 'cực quang linh lực', 'băng vụ', 'gió cắt'],
    hazards: ['đóng băng linh lực', 'tuyết lở', 'băng nứt', 'cổ yêu săn mồi', 'hàn độc'],
    events: ['cực quang bùng phát', 'hàn triều tràn bờ', 'băng cung xuất thế', 'tuyết thú di cư', 'Bắc Minh hải mở khe'],
    travel: ['tuyết xa linh thú', 'băng chu', 'hàn kiếm phi hành', 'truyền tống trận Phủ'],
    conflict: 'hàn tông, cổ yêu, băng tộc và Bắc Minh thủy phủ tranh hàn mạch cùng cổ huyết',
    ambience: ['gió rít', 'băng nứt', 'chuông băng', 'sóng băng hải', 'tiếng thú vọng xa']
  }),
  central: Object.freeze({
    name: 'Trung Vực Đại Lục',
    biomes: ['thánh thành', 'thiên hà', 'tinh vực', 'hư không khe', 'đan cốc', 'đạo nguyên'],
    terrain: ['siêu cấp linh mạch', 'thành vực liên hoàn', 'huyền không đảo', 'thiên hà xuyên lục địa'],
    architecture: ['thánh thành nhiều tầng', 'đạo cung huyền không', 'cổ tộc thành trì', 'tháp trận liên vực'],
    weather: ['tử khí', 'tinh quang', 'pháp tắc triều', 'linh vũ cao cấp', 'hư không nhiễu động'],
    hazards: ['pháp tắc áp chế', 'hư không khe nứt', 'thánh thú tuần vực', 'cổ trận tự vệ', 'thiên kiếp dị tượng'],
    events: ['thánh địa đại hội', 'vạn tông luận đạo', 'tinh môn mở cửa', 'đan hội Nhân Giới', 'cổ tộc tranh thiên mệnh'],
    travel: ['đại truyền tống trận', 'tiên hà linh chu', 'huyền không đạo', 'liên vực phi thành'],
    conflict: 'thánh địa, cổ tộc, đạo cung và siêu cấp hoàng triều tranh pháp tắc, thiên mệnh và quyền điều phối Nhân Giới',
    ambience: ['đạo âm', 'chuông thánh thành', 'tinh phong', 'linh chu', 'trận pháp ngân vang']
  })
});

const QUEST_VERBS = Object.freeze(['điều tra', 'hộ tống', 'trấn áp', 'thu thập', 'giải cứu', 'khảo sát', 'phá trận', 'săn đuổi']);
const ZONE_ROLES = Object.freeze(['cửa ngõ an toàn', 'vùng tài nguyên', 'địa bàn thế lực', 'hoang dã nguy hiểm', 'bí cảnh ngoại vi', 'boss territory']);
const SERVICE_POOL = Object.freeze(['phường thị', 'đan dược', 'luyện khí', 'phù trận', 'truyền tống', 'ngự thú', 'nhiệm vụ tông môn', 'đấu giá']);

const nodeById = new Map(HUMAN_REALM_WORLD_NODES.map(node => [node.id, node]));
const childrenByParent = new Map();
for (const node of HUMAN_REALM_WORLD_NODES) {
  const key = node.parentId ?? '__root__';
  if (!childrenByParent.has(key)) childrenByParent.set(key, []);
  childrenByParent.get(key).push(node);
}
const detailCache = new Map();

function freeze(value) {
  if (Array.isArray(value)) return Object.freeze(value.map(freeze));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, child] of Object.entries(value)) out[key] = freeze(child);
    return Object.freeze(out);
  }
  return value;
}

function hashString(value) {
  let hash = 2166136261;
  for (const ch of String(value)) {
    hash ^= ch.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function pick(list, seed, offset = 0) {
  if (!Array.isArray(list) || list.length === 0) return null;
  return list[(Math.abs(seed) + offset) % list.length];
}

function unique(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function siblingsOf(node, type = null) {
  return (childrenByParent.get(node.parentId) || []).filter(item => !type || item.type === type);
}

function continentKeyForNode(node) {
  let cursor = node;
  while (cursor) {
    if (cursor.humanRealmContinentId) return cursor.humanRealmContinentId;
    if (cursor.id === 'nl') return 'south';
    if (String(cursor.id).startsWith('hr.continent.east')) return 'east';
    if (String(cursor.id).startsWith('hr.continent.west')) return 'west';
    if (String(cursor.id).startsWith('hr.continent.north')) return 'north';
    if (String(cursor.id).startsWith('hr.continent.central')) return 'central';
    cursor = cursor.parentId ? nodeById.get(cursor.parentId) : null;
  }
  return 'south';
}

function namLangRegionId(node) {
  if (!node) return null;
  if (node.type === 'great_region' && String(node.id).startsWith('nl.gr.')) return String(node.id).split('.')[2] || null;
  if (node.type === 'province' && String(node.parentId || '').startsWith('nl.gr.')) return String(node.parentId).split('.')[2] || null;
  return null;
}

function baseRegionData(node) {
  const regionId = namLangRegionId(node);
  if (regionId) {
    const atlas = getRegionAtlasProfile(regionId);
    if (atlas) return { climate: atlas.climate, products: atlas.products, minerals: atlas.minerals, enemies: atlas.enemies, elements: atlas.elements, realm: atlas.realm };
  }
  return {
    climate: node.climate || node.desc || 'linh khí biến động theo địa hình',
    products: node.signatureProducts || node.products || [],
    minerals: node.signatureMinerals || node.minerals || [],
    enemies: node.signatureEnemies || node.enemyProfile?.commonEnemies || [],
    elements: node.dominantElements || node.enemyProfile?.dominantElements || [],
    realm: node.enemyProfile ? [node.enemyProfile.minRealmIdx, node.enemyProfile.maxRealmIdx] : null
  };
}

function baseTerritoryData(node) {
  const regionId = namLangRegionId(node);
  if (regionId) {
    const siblings = siblingsOf(node, 'province');
    const index = Math.max(0, siblings.findIndex(item => item.id === node.id));
    const atlas = getProvinceAtlasProfile(regionId, node.name, index);
    if (atlas) return {
      climate: atlas.climate, capital: node.capital || atlas.capital,
      cities: atlas.notableCities, towns: atlas.notableTowns, villages: atlas.notableVillages,
      secrets: atlas.secretRealms, forbidden: atlas.forbiddenZones,
      products: atlas.products, minerals: atlas.minerals, enemyProfile: atlas.enemyProfile
    };
  }
  return {
    climate: node.climate || 'linh khí biến động theo địa thế',
    capital: node.capital || `${node.name} Chủ Thành`,
    cities: node.notableCities || [], towns: node.notableTowns || [], villages: node.notableVillages || [],
    secrets: node.secretRealms || [], forbidden: node.forbiddenZones || [],
    products: node.products || node.signatureProducts || [], minerals: node.minerals || node.signatureMinerals || [],
    enemyProfile: node.enemyProfile || null
  };
}

function realmRangeFromChildren(node) {
  const values = (childrenByParent.get(node.id) || []).map(child => baseTerritoryData(child).enemyProfile).filter(Boolean);
  if (!values.length) return [0, 28];
  return [Math.min(...values.map(item => Number(item.minRealmIdx || 0))), Math.max(...values.map(item => Number(item.maxRealmIdx || 0)))];
}

function makeRealmDetail() {
  return freeze({
    version: HUMAN_REALM_DETAIL_VERSION, scope: 'realm',
    identity: {
      summary: 'Một đại thế giới phàm tục-tu chân gồm 5 Đại Lục có cấu trúc lãnh thổ, văn minh, sinh thái và quy tắc tu luyện khác nhau.',
      coreLoop: 'khám phá → tu luyện → gia nhập thế lực → tranh tài nguyên → mở bí cảnh → vượt đại lục',
      progressionRule: 'mỗi vùng có dải cảnh giới, tài nguyên, enemy và thế lực riêng; chỉ materialize map khi gameplay cần'
    },
    macroBiomes: unique(Object.values(CONTINENT_STYLE).flatMap(item => item.biomes)),
    intercontinentalTravel: ['siêu cấp truyền tống trận', 'linh chu xuyên hải', 'cổ lộ liên lục địa', 'không gian môn'],
    globalEvents: ['vạn tông đại hội', 'thú triều cấp đại lục', 'thiên tượng linh khí', 'thượng cổ bí cảnh liên lục địa', 'ma tai Nhân Giới'],
    worldRules: ['runtime map chỉ sinh khi được materialize', 'enemy và loot bám cảnh giới vùng', 'bí cảnh/cấm địa dùng rule riêng', 'atlas không tự tải asset']
  });
}

function makeContinentDetail(node) {
  const style = CONTINENT_STYLE[continentKeyForNode(node)];
  const seed = hashString(node.id);
  return freeze({
    version: HUMAN_REALM_DETAIL_VERSION, scope: 'continent',
    identity: {
      summary: `${node.name} có bản sắc địa hình và văn minh riêng; ${style.conflict}.`,
      terrainSignature: pick(style.terrain, seed), architecture: pick(style.architecture, seed, 1),
      ambience: unique([pick(style.ambience, seed), pick(style.ambience, seed, 2), pick(style.ambience, seed, 4)])
    },
    macroBiomes: unique(style.biomes),
    climateCycle: unique([pick(style.weather, seed), pick(style.weather, seed, 1), pick(style.weather, seed, 3)]),
    politics: {
      dominantConflict: style.conflict,
      powerCenters: ['đại tông', 'hoàng triều/địa phương', 'tu tiên gia tộc', 'thương minh', 'dị tộc bản địa'],
      borderPressure: pick(style.hazards, seed, 2)
    },
    economy: {
      signatureProducts: node.signatureProducts || [], signatureMinerals: node.signatureMinerals || [],
      tradePattern: `${pick(style.travel, seed)} kết nối các vùng trọng yếu và đầu mối thương mại.`
    },
    travel: { modes: unique(style.travel), strategicHubRule: 'mỗi vùng cấp cao có ít nhất một đầu mối truyền tống hoặc thương lộ chính', dangerousTravel: pick(style.hazards, seed, 1) },
    worldEvents: unique(style.events), hazards: unique(style.hazards),
    materializationBlueprint: {
      primaryRegionRule: 'mỗi vùng cấp cao có visual identity riêng, biome riêng và boss ecology riêng',
      secondLevelRule: 'mỗi đơn vị cấp hai được chia zone theo thành thị, tài nguyên, hoang dã, bí cảnh và boss territory'
    }
  });
}

function makeRegionDetail(node) {
  const style = CONTINENT_STYLE[continentKeyForNode(node)];
  const seed = hashString(node.id);
  const base = baseRegionData(node);
  const realm = base.realm || realmRangeFromChildren(node);
  const elements = unique(base.elements), products = unique(base.products), minerals = unique(base.minerals), enemies = unique(base.enemies);
  const themeBiome = String(node.theme || '').replace(/_/g, ' ');
  return freeze({
    version: HUMAN_REALM_DETAIL_VERSION, scope: 'primary_region',
    identity: {
      summary: `${node.name}: ${node.desc || node.climate || pick(style.terrain, seed)}.`,
      terrainSignature: `${pick(style.terrain, seed)}; ${node.climate || base.climate}`,
      visualIdentity: `${pick(style.architecture, seed)} kết hợp ${pick(style.biomes, seed, 2)}`,
      settlementCulture: `${pick(style.architecture, seed, 1)}; cư dân và tu sĩ thích nghi với ${pick(style.weather, seed)}`
    },
    biomes: unique([themeBiome, pick(style.biomes, seed), pick(style.biomes, seed, 2), pick(style.biomes, seed, 4)]),
    climateCycle: { baseline: base.climate, weather: unique([pick(style.weather, seed), pick(style.weather, seed, 1), pick(style.weather, seed, 3)]), anomaly: pick(style.weather, seed, 4) },
    spiritQi: {
      density: realm[1] >= 24 ? 'cực thịnh' : realm[1] >= 18 ? 'thịnh' : realm[1] >= 10 ? 'trung-cao' : 'trung bình',
      elements, phenomenon: `${pick(elements.length ? elements : ['Ngũ Hành'], seed)} linh khí dễ tụ thành địa mạch và thiên tượng đặc hữu.`
    },
    civilization: {
      settlementPattern: `${pick(style.architecture, seed)} phân bố quanh linh mạch, tài nguyên và tuyến giao thông.`,
      transport: unique([pick(style.travel, seed), pick(style.travel, seed, 1)]),
      economy: unique([...products.slice(0, 3), ...minerals.slice(0, 2)]), conflict: style.conflict
    },
    resources: { products, minerals, rareDropTheme: `${pick(products, seed) || 'linh vật'} / ${pick(minerals, seed, 1) || 'linh khoáng'} tinh luyện` },
    combat: {
      recommendedRealmRange: realm, enemyArchetypes: enemies,
      packRule: `enemy thường chiếm hoang dã; tinh anh giữ tài nguyên; boss kiểm soát ${pick(style.biomes, seed, 3)} hoặc cấm địa`,
      eliteModifier: pick(['cuồng bạo', 'hộ giáp linh lực', 'nguyên tố tăng cường', 'triệu hồi đồng loại', 'dị biến huyết mạch'], seed),
      bossRule: `boss vùng cao hơn enemy thường 1–2 bậc cảnh giới và có cơ chế gắn với ${pick(elements.length ? elements : ['địa hình'], seed, 1)}`
    },
    exploration: {
      landmarkThemes: unique([`${node.name} chủ thành`, `${pick(style.biomes, seed)} linh mạch`, `${pick(style.biomes, seed, 2)} cổ địa`, `${pick(style.terrain, seed)} quan ải`]),
      dungeonArchetypes: unique(['bí cảnh truyền thừa', 'động phủ cổ tu', pick(['cổ chiến trường', 'yêu sào', 'huyền mộ', 'địa cung'], seed)]),
      hazards: unique([pick(style.hazards, seed), pick(style.hazards, seed, 2), pick(style.hazards, seed, 4)]),
      worldEvents: unique([pick(style.events, seed), pick(style.events, seed, 1), pick(style.events, seed, 3)]),
      questThemes: unique([`${pick(QUEST_VERBS, seed)} ${pick(style.hazards, seed)}`, `${pick(QUEST_VERBS, seed, 2)} ${pick(products, seed) || 'linh dược quý'}`, `${pick(QUEST_VERBS, seed, 4)} bí cảnh của ${node.name}`])
    },
    audioVisual: {
      ambience: unique([pick(style.ambience, seed), pick(style.ambience, seed, 1), pick(style.ambience, seed, 3)]),
      panoramaDirection: `${pick(style.terrain, seed)} làm silhouette chính; ${pick(style.weather, seed, 2)} tạo lớp nền động`,
      vfxDirection: `${elements.join('/') || 'Ngũ Hành'} dùng làm màu/nhịp VFX chủ đạo, không preload ngoài vùng`
    },
    materializationBlueprint: { suggestedZoneCount: 5 + (seed % 2), zoneRoles: unique(ZONE_ROLES.slice(0, 5 + (seed % 2))), streamingRule: 'chỉ stream asset zone hiện tại và zone kế cận' }
  });
}

function makeTerritoryDetail(node) {
  const style = CONTINENT_STYLE[continentKeyForNode(node)];
  const seed = hashString(node.id);
  const base = baseTerritoryData(node), enemy = base.enemyProfile || {};
  const parentRegion = nodeById.get(node.parentId);
  const regionDetail = parentRegion ? makeRegionDetail(parentRegion) : null;
  const products = unique(base.products), minerals = unique(base.minerals), commonEnemies = unique(enemy.commonEnemies || []);
  const realmRange = [Number(enemy.minRealmIdx || 0), Number(enemy.maxRealmIdx || Math.max(2, Number(enemy.bossRealmIdx || 2) - 1))];
  const bossRealm = Number(enemy.bossRealmIdx || Math.min(28, realmRange[1] + 1));
  const mainBiome = pick(regionDetail?.biomes || style.biomes, seed), secondaryBiome = pick(regionDetail?.biomes || style.biomes, seed, 2);
  const capital = base.capital || `${node.name} Chủ Thành`;
  const cities = unique(base.cities), towns = unique(base.towns), villages = unique(base.villages), secrets = unique(base.secrets), forbidden = unique(base.forbidden);
  const zoneCount = 5 + (seed % 2);
  const naturalLandmarks = [
    `${node.name} ${pick(['Linh Mạch', 'Cổ Lâm', 'Thiên Hồ', 'Huyền Cốc', 'Thạch Nhai'], seed)}`,
    `${node.name} ${pick(['Quan', 'Cổ Lộ', 'Linh Tuyền', 'Dược Cốc', 'Khoáng Tràng'], seed, 2)}`
  ];

  return freeze({
    version: HUMAN_REALM_DETAIL_VERSION, scope: 'second_level_territory',
    mapIdentity: {
      summary: `${node.name} lấy ${mainBiome} làm biome chính, ${secondaryBiome} làm biome phụ; trung tâm là ${capital}.`,
      terrain: `${pick(style.terrain, seed)}; ${base.climate}`,
      biomes: unique([mainBiome, secondaryBiome, pick(style.biomes, seed, 4)]),
      visual: `${pick(style.architecture, seed)} nổi bật trên nền ${pick(style.weather, seed)}`,
      settlementStyle: pick(style.architecture, seed, 1),
      explorationLoop: 'vào thành nhận tin → theo tuyến tài nguyên → gặp enemy/biến cố → mở bí cảnh/cấm địa → đánh boss → quay về thành'
    },
    landmarks: unique([capital, ...cities.slice(0, 2), ...secrets.slice(0, 1), ...forbidden.slice(0, 1), ...naturalLandmarks]),
    settlements: {
      capital, cities, towns, villages,
      infrastructure: unique([pick(style.travel, seed), pick(style.travel, seed, 1), `${pick(SERVICE_POOL, seed)} đầu mối`]),
      services: unique([pick(SERVICE_POOL, seed), pick(SERVICE_POOL, seed, 2), pick(SERVICE_POOL, seed, 4), pick(SERVICE_POOL, seed, 6)])
    },
    routes: {
      entryRoutes: unique([`${pick(style.travel, seed)} từ vùng lân cận`, `${pick(style.travel, seed, 2)} nối ${capital}`]),
      internalTravel: unique([pick(style.travel, seed), pick(style.travel, seed, 1)]),
      dangerousPassages: unique([`${pick(style.hazards, seed)} tại ${naturalLandmarks[0]}`, `${pick(style.hazards, seed, 3)} gần ${naturalLandmarks[1]}`]),
      waypointStyle: `${capital} là waypoint chính; trấn lớn và bí cảnh chỉ mở waypoint sau khi khám phá`
    },
    resourceProfile: {
      products, minerals,
      gatherZones: unique([`${mainBiome} dược khu`, `${secondaryBiome} khoáng khu`, `${naturalLandmarks[1]} tài nguyên hiếm`]),
      rareResource: pick([...products, ...minerals], seed, 1) || 'linh vật địa phương',
      economy: `${capital} thu mua ${pick(products, seed) || 'linh dược'} và ${pick(minerals, seed, 1) || 'linh khoáng'}; giá biến động theo sự kiện vùng.`
    },
    enemyEcology: {
      recommendedRealmRange: realmRange, bossRealmIdx: bossRealm, commonEnemies,
      eliteEnemy: enemy.eliteEnemy || `${node.name} Tinh Anh`, fieldBoss: enemy.fieldBoss || `${node.name} Vực Chủ Yêu`,
      spawnHabitats: unique([mainBiome, secondaryBiome, pick(style.biomes, seed, 3)]),
      behavior: unique([
        pick(['đi tuần theo bầy', 'mai phục gần tài nguyên', 'chiếm cứ đường hẹp', 'săn mồi theo giờ', 'bảo vệ lãnh địa'], seed),
        pick(['tăng hung tính ban đêm', 'tăng số lượng khi có sự kiện', 'tinh anh xuất hiện gần tài nguyên hiếm', 'boss có lãnh địa cố định'], seed, 2)
      ]),
      weatherModifier: `${pick(style.weather, seed)} tăng mật độ hoặc sức mạnh một nhóm enemy phù hợp nguyên tố`,
      nightModifier: pick(['enemy âm hệ tăng', 'yêu thú săn mồi tăng', 'tầm nhìn giảm', 'tinh anh dễ xuất hiện', 'không thay đổi lớn'], seed)
    },
    dungeonProfile: {
      secretRealms: secrets.map((name, index) => freeze({
        name, type: pick(['truyền thừa', 'tài nguyên', 'thí luyện', 'cổ tu động phủ'], seed, index),
        recommendedRealm: Math.min(28, realmRange[0] + Math.floor((realmRange[1] - realmRange[0]) * 0.65) + index),
        rewardTheme: pick([...products, ...minerals], seed, index) || 'công pháp/tài nguyên địa phương'
      })),
      forbiddenZones: forbidden.map((name, index) => freeze({
        name, danger: pick(style.hazards, seed, index),
        recommendedRealm: Math.min(28, Math.max(realmRange[1], bossRealm - 1 + index)),
        bossTheme: enemy.fieldBoss || `${node.name} Cấm Địa Boss`
      }))
    },
    hazards: unique([pick(style.hazards, seed), pick(style.hazards, seed, 2), `${pick(style.weather, seed, 1)} làm thay đổi tầm nhìn/di chuyển`, `linh lực địa phương gây áp chế nếu thấp hơn cảnh giới ${realmRange[0]}`]),
    events: unique([
      pick(style.events, seed), pick(style.events, seed, 1),
      `${pick(commonEnemies.length ? commonEnemies : ['yêu thú'], seed)} bạo động tại ${naturalLandmarks[0]}`,
      `${pick(['thương hội', 'tông môn', 'gia tộc', 'hoàng triều'], seed)} tranh chấp ${pick(products, seed) || 'tài nguyên hiếm'}`
    ]),
    questHooks: unique([
      `${pick(QUEST_VERBS, seed)} ${pick(style.hazards, seed)} trên tuyến vào ${capital}`,
      `${pick(QUEST_VERBS, seed, 1)} ${pick(products, seed) || 'linh dược'} tại ${naturalLandmarks[1]}`,
      `${pick(QUEST_VERBS, seed, 2)} ${enemy.eliteEnemy || 'tinh anh địa phương'}`,
      `${pick(QUEST_VERBS, seed, 3)} bí mật trong ${secrets[0] || naturalLandmarks[0]}`,
      `${pick(QUEST_VERBS, seed, 4)} đoàn thương nhân qua ${pick(style.travel, seed)}`,
      `${pick(QUEST_VERBS, seed, 5)} âm mưu tranh quyền giữa các thế lực tại ${capital}`
    ]),
    factionConflict: {
      dominantFaction: node.factionProfile?.factions?.[1]?.name || node.cultivationFactions?.[0] || 'thế lực bá chủ địa phương',
      contestedAssets: unique([pick(products, seed), pick(minerals, seed, 1), secrets[0], forbidden[0]]), conflict: style.conflict
    },
    dayNight: {
      day: `${capital} và thương lộ hoạt động mạnh; gatherer/NPC đông hơn`,
      night: `${mainBiome} nguy hiểm hơn; elite/boss event có xác suất cao hơn`,
      dawnDusk: `${pick(style.weather, seed, 2)} dễ xuất hiện và tạo buff/debuff môi trường`
    },
    weatherPattern: {
      common: unique([pick(style.weather, seed), pick(style.weather, seed, 1)]), rare: pick(style.weather, seed, 4),
      gameplayEffect: 'weather chỉ kích hoạt asset/VFX khi người chơi ở đúng map hoặc zone'
    },
    recommendedProgression: {
      enterRealmIdx: realmRange[0], farmRealmRange: realmRange, challengeBossRealmIdx: bossRealm,
      exitCondition: `hoàn thành boss/waypoint chính và đạt tối thiểu cảnh giới ${Math.min(28, realmRange[1])}`
    },
    materializationBlueprint: {
      suggestedZoneCount: zoneCount,
      zones: Array.from({ length: zoneCount }, (_, index) => freeze({
        order: index + 1, role: ZONE_ROLES[Math.min(index, ZONE_ROLES.length - 1)],
        biome: pick([mainBiome, secondaryBiome, ...style.biomes], seed, index),
        landmark: index === 0 ? capital : pick([...naturalLandmarks, ...secrets, ...forbidden], seed, index),
        streamPriority: index <= 1 ? 'near-player-high' : 'lazy'
      })),
      assetRule: 'panorama/props/enemy/NPC/VFX chỉ tải theo map + zone hiện tại',
      bootRule: 'không thêm atlas asset vào boot; atlas chỉ là metadata'
    }
  });
}

function makeLocalDetail(node) {
  const style = CONTINENT_STYLE[continentKeyForNode(node)];
  const seed = hashString(node.id);
  const parent = node.parentId ? nodeById.get(node.parentId) : null;
  return freeze({
    version: HUMAN_REALM_DETAIL_VERSION, scope: node.type,
    identity: {
      summary: node.desc || `${node.name} là địa điểm thuộc ${parent?.name || style.name}.`,
      role: node.locationKind || node.type, terrain: pick(style.terrain, seed),
      ambience: unique([pick(style.ambience, seed), pick(style.ambience, seed, 2)])
    },
    localGameplay: {
      services: unique(node.services || node.capitalServices || [pick(SERVICE_POOL, seed), pick(SERVICE_POOL, seed, 2)]),
      hazards: unique([pick(style.hazards, seed), pick(style.weather, seed, 1)]),
      events: unique([pick(style.events, seed), pick(style.events, seed, 2)]),
      questHooks: unique([
        `${pick(QUEST_VERBS, seed)} biến cố tại ${node.name}`,
        `${pick(QUEST_VERBS, seed, 2)} tài nguyên quanh ${node.name}`,
        `${pick(QUEST_VERBS, seed, 4)} tuyến đường nối ${parent?.name || style.name}`
      ])
    },
    runtimeIntent: node.playableMapId != null
      ? freeze({ playableMapId: node.playableMapId, status: 'materialized_runtime_map' })
      : freeze({ status: 'world_data_only' })
  });
}

function buildDetail(node) {
  if (node.id === HUMAN_REALM_ROOT_ID) return makeRealmDetail();
  if (node.type === 'continent') return makeContinentDetail(node);
  if (node.type === 'great_region') return makeRegionDetail(node);
  if (node.type === 'province') return makeTerritoryDetail(node);
  return makeLocalDetail(node);
}

export const HUMAN_REALM_DETAIL_COUNTS = Object.freeze({
  totalNodes: HUMAN_REALM_WORLD_NODES.length,
  continents: HUMAN_REALM_WORLD_NODES.filter(node => node.type === 'continent').length,
  primaryRegions: HUMAN_REALM_WORLD_NODES.filter(node => node.type === 'great_region').length,
  secondLevelTerritories: HUMAN_REALM_WORLD_NODES.filter(node => node.type === 'province').length,
  playableLocations: HUMAN_REALM_WORLD_NODES.filter(node => node.playableMapId != null).length
});

export function hasHumanRealmDetailBlueprint(nodeId) {
  return nodeById.has(nodeId);
}

export function getHumanRealmDetailProfile(nodeId) {
  if (detailCache.has(nodeId)) return detailCache.get(nodeId);
  const node = nodeById.get(nodeId);
  if (!node) return null;
  const detail = buildDetail(node);
  detailCache.set(nodeId, detail);
  return detail;
}

export function getAllHumanRealmDetailProfiles() {
  return HUMAN_REALM_WORLD_NODES.map(node => getHumanRealmDetailProfile(node.id));
}
