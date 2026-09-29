/**
 * elementalItemCatalog.js
 * Catalog mở rộng cho hệ item duy nhất của game.
 *
 * Thiết kế V2:
 * - Trang bị + Phù Chú: đầy đủ 9 hệ x 6 bậc.
 * - Đan Dược: dùng 5 dòng công dụng dùng chung/định hướng hệ, tránh nhân bản 9 lần.
 * - Linh Thảo + Khoáng Thạch: 8 thuộc tính tự nhiên (Linh, Kim, Hỏa, Thủy, Thổ, Mộc, Phong, Lôi),
 *   không tạo vật liệu giả kiểu "Kiếm Linh Thảo" hay "Vật Lý Linh Khoáng".
 * - ID/icon ổn định, có migration từ catalog V1 cho save cũ.
 */

export const ELEMENTAL_SYSTEMS = [
  { key:'kiem', name:'Kiếm', code:'KĐ', color:'#f5d76e', dark:'#6b4f12', theme:'Kiếm Đạo', essence:'kiếm ý sắc bén, tăng khả năng xuyên phá và bạo kích' },
  { key:'kim', name:'Kim', code:'K', color:'#e8edf5', dark:'#596575', theme:'Canh Kim', essence:'kim linh cương mãnh, thiên về công kích và phá giáp' },
  { key:'hoa', name:'Hỏa', code:'H', color:'#ff754c', dark:'#7a2415', theme:'Liệt Hỏa', essence:'hỏa linh bùng nổ, thiên về sát thương và thiêu đốt' },
  { key:'thuy', name:'Thủy', code:'T', color:'#59b9ff', dark:'#164a73', theme:'Huyền Thủy', essence:'thủy linh nhu hòa, thiên về hồi phục và khống chế' },
  { key:'tho', name:'Thổ', code:'TH', color:'#c49a62', dark:'#60401f', theme:'Huyền Hoàng', essence:'thổ linh trầm hậu, thiên về sinh lực và phòng ngự' },
  { key:'moc', name:'Mộc', code:'M', color:'#65d889', dark:'#1f6134', theme:'Thanh Mộc', essence:'mộc linh sinh sôi, thiên về hồi phục và sinh mệnh' },
  { key:'phong', name:'Phong', code:'P', color:'#89e5df', dark:'#276a6b', theme:'Thiên Phong', essence:'phong linh nhẹ nhanh, thiên về tốc độ và né tránh' },
  { key:'loi', name:'Lôi', code:'L', color:'#b38cff', dark:'#4b2875', theme:'Tử Tiêu', essence:'lôi linh bá đạo, thiên về bạo phát và tê liệt' },
  { key:'ly', name:'Vật Lý', code:'VL', color:'#f0b27a', dark:'#713b1d', theme:'Thể Tu', essence:'khí huyết cường hoành, thiên về cận chiến và thể phách' }
];

export const ITEM_REALMS = [
  { rank:0, rankName:'Phàm Cấp', displayRank:'Phàm Phẩm', realm:'Phàm Nhân', color:'#9ca3af', scale:1, grade:'Hạ Phẩm' },
  { rank:1, rankName:'Nhất Phẩm', displayRank:'Nhất Phẩm', realm:'Luyện Khí', color:'#60a5fa', scale:5, grade:'Trung Phẩm' },
  { rank:2, rankName:'Nhị Phẩm', displayRank:'Nhị Phẩm', realm:'Trúc Cơ', color:'#4ade80', scale:22, grade:'Thượng Phẩm' },
  { rank:3, rankName:'Tam Phẩm', displayRank:'Tam Phẩm', realm:'Kim Đan', color:'#facc15', scale:95, grade:'Thượng Phẩm' },
  { rank:4, rankName:'Tứ Phẩm', displayRank:'Tứ Phẩm', realm:'Nguyên Anh', color:'#f97316', scale:420, grade:'Cực Phẩm' },
  { rank:5, rankName:'Ngũ Phẩm', displayRank:'Ngũ Phẩm', realm:'Hóa Thần', color:'#f43f5e', scale:1900, grade:'Cực Phẩm' }
];

export const ELEMENTAL_EQUIPMENT_SLOTS = [
  { slot:'weapon', label:'Linh Khí', iconCode:'VK', dmg:1.00, hp:0.00, def:0.00, spd:0.12 },
  { slot:'armor', label:'Đạo Bào', iconCode:'GP', dmg:0.00, hp:8.00, def:0.65, spd:0.00 },
  { slot:'helm', label:'Đạo Quán', iconCode:'MU', dmg:0.06, hp:2.60, def:0.36, spd:0.00 },
  { slot:'boots', label:'Ngự Hài', iconCode:'HA', dmg:0.00, hp:1.20, def:0.12, spd:0.75 },
  { slot:'amulet', label:'Ngọc Bội', iconCode:'NB', dmg:0.42, hp:2.40, def:0.08, spd:0.08 },
  { slot:'shield', label:'Linh Thuẫn', iconCode:'TH', dmg:0.00, hp:4.20, def:0.90, spd:0.00 },
  { slot:'ring', label:'Pháp Nhẫn', iconCode:'NH', dmg:0.32, hp:1.10, def:0.12, spd:0.16 },
  { slot:'cloak', label:'Phong Bào', iconCode:'BA', dmg:0.08, hp:2.20, def:0.22, spd:0.48 }
];

export const RESOURCE_AFFINITIES = [
  { key:'linh', name:'Linh', code:'L', color:'#d8d6ff', dark:'#4c4a75', herb:'Tụ Linh Thảo', ore:'Linh Tinh Khoáng', systems:['kiem','kim','hoa','thuy','tho','moc','phong','loi','ly'] },
  { key:'kim', name:'Kim', code:'K', color:'#e8edf5', dark:'#596575', herb:'Kim Ti Thảo', ore:'Canh Kim Khoáng', systems:['kiem','kim','ly'] },
  { key:'hoa', name:'Hỏa', code:'H', color:'#ff754c', dark:'#7a2415', herb:'Hỏa Diễm Hoa', ore:'Xích Hỏa Tinh', systems:['hoa','loi'] },
  { key:'thuy', name:'Thủy', code:'T', color:'#59b9ff', dark:'#164a73', herb:'Hàn Thủy Liên', ore:'Huyền Thủy Tinh', systems:['thuy','moc'] },
  { key:'tho', name:'Thổ', code:'TH', color:'#c49a62', dark:'#60401f', herb:'Địa Linh Căn', ore:'Huyền Hoàng Thạch', systems:['tho','ly'] },
  { key:'moc', name:'Mộc', code:'M', color:'#65d889', dark:'#1f6134', herb:'Thanh Mộc Chi', ore:'Mộc Linh Ngọc', systems:['moc','thuy'] },
  { key:'phong', name:'Phong', code:'P', color:'#89e5df', dark:'#276a6b', herb:'Phong Linh Thảo', ore:'Thanh Phong Tinh', systems:['phong','kiem'] },
  { key:'loi', name:'Lôi', code:'LĐ', color:'#b38cff', dark:'#4b2875', herb:'Lôi Văn Hoa', ore:'Tử Lôi Tinh', systems:['loi','kim','phong'] }
];

export const PILL_FAMILIES = [
  { key:'hoi_nguyen', name:'Hồi Nguyên Đan', code:'HG', color:'#8ee7c0', affinities:['linh','thuy'], systems:['kiem','kim','hoa','thuy','tho','moc','phong','loi','ly'], role:'heal' },
  { key:'cong_phat', name:'Công Phạt Đan', code:'CP', color:'#ff8b68', affinities:['kim','hoa'], systems:['kiem','kim','hoa','loi','ly'], role:'attack' },
  { key:'sinh_tuc', name:'Sinh Tức Đan', code:'ST', color:'#7ce69d', affinities:['moc','thuy'], systems:['thuy','moc'], role:'vitality' },
  { key:'ho_the', name:'Hộ Thể Đan', code:'HT', color:'#d7b27c', affinities:['tho','kim'], systems:['tho','kim','ly'], role:'defense' },
  { key:'tat_phong', name:'Tật Phong Đan', code:'TP', color:'#8ce8df', affinities:['phong','loi'], systems:['phong','kiem','loi'], role:'speed' }
];

const BASE_POWER = [8, 58, 320, 2100, 15000, 115000];
const BASE_PRICE = [18, 280, 2600, 23000, 240000, 2600000];
const KIND_ICON_CODES = { pill:'DD', talisman:'PC', herb:'LT', ore:'KT' };
const SYSTEM_TO_RESOURCE = { kiem:'kim', kim:'kim', hoa:'hoa', thuy:'thuy', tho:'tho', moc:'moc', phong:'phong', loi:'loi', ly:'tho' };
const SYSTEM_TO_PILL = { kiem:'cong_phat', kim:'cong_phat', hoa:'cong_phat', thuy:'sinh_tuc', tho:'ho_the', moc:'sinh_tuc', phong:'tat_phong', loi:'tat_phong', ly:'ho_the' };

function safeId(value) {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}
function iconKey(id) { return `elem_item_${safeId(id)}`; }
function realmPrefix(realm) { return realm.rank === 0 ? 'Phàm Phẩm' : `${realm.realm} ${realm.rankName}`; }
function itemBase(id, kind, realm, color, iconCode) {
  return { id, catalogItemId:id, kind, rank:realm.rank, rankName:realm.rankName, displayRank:realm.displayRank, realm:realm.realm, grade:realm.grade, icon:iconKey(id), iconCode, color };
}
function elementBias(system) {
  switch (system.key) {
    case 'kiem': return { dmg:1.18, hp:0.95, def:0.92, spd:1.08 };
    case 'kim': return { dmg:1.12, hp:1.00, def:1.08, spd:0.96 };
    case 'hoa': return { dmg:1.20, hp:0.92, def:0.90, spd:1.02 };
    case 'thuy': return { dmg:0.94, hp:1.12, def:1.04, spd:1.00 };
    case 'tho': return { dmg:0.90, hp:1.22, def:1.24, spd:0.86 };
    case 'moc': return { dmg:0.96, hp:1.18, def:1.00, spd:0.96 };
    case 'phong': return { dmg:1.00, hp:0.90, def:0.88, spd:1.30 };
    case 'loi': return { dmg:1.24, hp:0.90, def:0.88, spd:1.10 };
    default: return { dmg:1.08, hp:1.14, def:1.08, spd:1.02 };
  }
}

function buildGear(system, realm, blueprint) {
  const power = BASE_POWER[realm.rank];
  const bias = elementBias(system);
  const id = `elem_${system.key}_r${realm.rank}_gear_${blueprint.slot}`;
  return {
    ...itemBase(id, 'gear', realm, system.color, blueprint.iconCode),
    category:'equipment', type:blueprint.slot, element:system.key, elementName:system.name,
    name:`${realmPrefix(realm)} ${system.theme} ${blueprint.label}`,
    bonusDmg:Math.max(0, Math.round(power * blueprint.dmg * bias.dmg)),
    bonusHp:Math.max(0, Math.round(power * blueprint.hp * bias.hp * 10)),
    bonusDef:Math.max(0, Math.round(power * blueprint.def * bias.def)),
    bonusSpd:Math.max(0, Math.round((6 + realm.rank * 14) * blueprint.spd * bias.spd)),
    price:Math.round(BASE_PRICE[realm.rank] * (1 + ELEMENTAL_EQUIPMENT_SLOTS.indexOf(blueprint) * 0.08)),
    stackable:false,
    desc:`[Hệ ${system.name} • ${realm.realm}] ${blueprint.label} hội tụ ${system.essence}. Phẩm chất ${realm.grade}.`
  };
}

function buildHerb(affinity, realm) {
  const id = `elem_res_${affinity.key}_r${realm.rank}_herb`;
  return {
    ...itemBase(id, 'herb', realm, affinity.color, KIND_ICON_CODES.herb),
    category:'material', type:'herb', affinity:affinity.key, affinityName:affinity.name,
    compatibleSystems:[...affinity.systems], emoji:'🌿', name:`${realmPrefix(realm)} ${affinity.herb}`,
    price:Math.round(BASE_PRICE[realm.rank] * 0.35), stackable:true, maxStack:9999,
    alchemyPower:Math.round(10 * realm.scale),
    desc:`[Thuộc tính ${affinity.name} • ${realm.realm}] Linh thảo tự nhiên dùng chung cho các công thức ${affinity.systems.map(k => ELEMENTAL_SYSTEMS.find(s => s.key === k)?.name).filter(Boolean).join(', ')}.`
  };
}

function buildOre(affinity, realm) {
  const id = `elem_res_${affinity.key}_r${realm.rank}_ore`;
  return {
    ...itemBase(id, 'ore', realm, affinity.color, KIND_ICON_CODES.ore),
    category:'material', type:'ore', affinity:affinity.key, affinityName:affinity.name,
    compatibleSystems:[...affinity.systems], emoji:'⛏️', name:`${realmPrefix(realm)} ${affinity.ore}`,
    price:Math.round(BASE_PRICE[realm.rank] * 0.48), stackable:true, maxStack:9999,
    forgingPower:Math.round(14 * realm.scale),
    desc:`[Thuộc tính ${affinity.name} • ${realm.realm}] Khoáng tự nhiên dùng rèn/chế tạo cho nhiều hệ tương thích.`
  };
}

function buildPill(family, realm) {
  const id = `elem_pill_${family.key}_r${realm.rank}`;
  const hp = Math.round((120 + realm.rank * 180) * realm.scale);
  const common = {
    ...itemBase(id, 'pill', realm, family.color, family.code),
    category:'consumable', type:`pill_${family.role}`, pillRank:realm.rank,
    family:family.key, compatibleSystems:[...family.systems], name:`${realmPrefix(realm)} ${family.name}`,
    durationSec:180, price:Math.round(BASE_PRICE[realm.rank] * 0.92), stackable:true, maxStack:999,
    recipeAffinityKeys:[...family.affinities], costOres:1 + realm.rank * 2, costGold:Math.round(BASE_PRICE[realm.rank] * 0.58)
  };
  if (family.role === 'heal') Object.assign(common, { healHp:Math.round(hp * 1.25), desc:`Hồi ${Math.round(hp * 1.25).toLocaleString('vi-VN')} HP; mọi hệ đều sử dụng được.` });
  if (family.role === 'attack') Object.assign(common, { elementalBonusPct:10 + realm.rank * 6, desc:`Tăng công kích các hệ ${family.systems.map(k => ELEMENTAL_SYSTEMS.find(s => s.key === k)?.name).join(', ')} trong 180 giây.` });
  if (family.role === 'vitality') Object.assign(common, { healHp:hp, hpBonusPct:8 + realm.rank * 4, desc:`Tăng sinh lực và hồi phục, chuyên cho Thủy/Mộc.` });
  if (family.role === 'defense') Object.assign(common, { defBonusPct:9 + realm.rank * 5, desc:`Tăng phòng ngự và thể phách, phù hợp Thổ/Kim/Vật Lý.` });
  if (family.role === 'speed') Object.assign(common, { speedBuff:Math.round((2 + realm.rank * 4) * realm.scale), desc:`Tăng tốc độ vận chuyển linh lực, phù hợp Phong/Kiếm/Lôi.` });
  return common;
}

function buildTalisman(system, realm) {
  const id = `elem_${system.key}_r${realm.rank}_talisman`;
  const damage = Math.round((160 + realm.rank * 260) * realm.scale);
  const affinity = SYSTEM_TO_RESOURCE[system.key] || 'linh';
  return {
    ...itemBase(id, 'talisman', realm, system.color, KIND_ICON_CODES.talisman),
    category:'consumable', type:'talisman', pillRank:realm.rank, element:system.key, elementName:system.name,
    name:`${realmPrefix(realm)} ${system.theme} Chiến Phù`, dmg:damage, aoe:realm.rank >= 2,
    elementalBonusPct:8 + realm.rank * 5, recipeAffinityKeys:['linh', affinity],
    costOres:1 + realm.rank * 2, costGold:Math.round(BASE_PRICE[realm.rank] * 0.55),
    price:Math.round(BASE_PRICE[realm.rank] * 0.85), stackable:true, maxStack:999,
    desc:`[Hệ ${system.name} • ${realm.realm}] Kích phát ${system.theme}, gây ${damage.toLocaleString('vi-VN')} sát thương${realm.rank >= 2 ? ' diện rộng' : ''}.`
  };
}

const gear = [];
const herbs = [];
const ores = [];
const pills = [];
const talismans = [];
for (const realm of ITEM_REALMS) {
  for (const affinity of RESOURCE_AFFINITIES) {
    herbs.push(buildHerb(affinity, realm));
    ores.push(buildOre(affinity, realm));
  }
  for (const family of PILL_FAMILIES) pills.push(buildPill(family, realm));
  for (const system of ELEMENTAL_SYSTEMS) {
    talismans.push(buildTalisman(system, realm));
    ELEMENTAL_EQUIPMENT_SLOTS.forEach(slot => gear.push(buildGear(system, realm, slot)));
  }
}

// Liên kết công thức sau khi toàn bộ tài nguyên đã được sinh, để UI chế tạo cũ vẫn dùng được.
const herbByAffinityRank = new Map(herbs.map(i => [`${i.affinity}:${i.rank}`, i]));
const oreByAffinityRank = new Map(ores.map(i => [`${i.affinity}:${i.rank}`, i]));
for (const item of [...pills, ...talismans]) {
  const keys = [...new Set(item.recipeAffinityKeys || ['linh'])];
  item.recipeHerbs = keys.map((key, idx) => ({
    name:herbByAffinityRank.get(`${key}:${item.rank}`)?.name,
    count:Math.max(1, 1 + item.rank + idx)
  })).filter(x => x.name);
  item.recipeMinerals = keys.slice(0, 1).map(key => ({
    id:oreByAffinityRank.get(`${key}:${item.rank}`)?.id,
    count:Math.max(1, 1 + Math.floor(item.rank / 2))
  })).filter(x => x.id);
}

export const ELEMENTAL_GEAR_ITEMS = Object.freeze(gear);
export const ELEMENTAL_HERBS = Object.freeze(herbs);
export const ELEMENTAL_ORES = Object.freeze(ores);
export const ELEMENTAL_PILLS = Object.freeze(pills);
export const ELEMENTAL_TALISMANS = Object.freeze(talismans);
export const ALL_ELEMENTAL_ITEMS = Object.freeze([...gear, ...pills, ...talismans, ...herbs, ...ores]);

export const ELEMENTAL_CATALOG_STATS = Object.freeze({
  systems:ELEMENTAL_SYSTEMS.length,
  realms:ITEM_REALMS.length,
  resourceAffinities:RESOURCE_AFFINITIES.length,
  pillFamilies:PILL_FAMILIES.length,
  equipment:ELEMENTAL_GEAR_ITEMS.length,
  pills:ELEMENTAL_PILLS.length,
  talismans:ELEMENTAL_TALISMANS.length,
  herbs:ELEMENTAL_HERBS.length,
  ores:ELEMENTAL_ORES.length,
  total:ALL_ELEMENTAL_ITEMS.length
});

const BY_ID = new Map();
const BY_NAME = new Map();
const IDENTITY_ERRORS = [];
for (const item of ALL_ELEMENTAL_ITEMS) {
  if (BY_ID.has(item.id)) IDENTITY_ERRORS.push(`ID trùng: ${item.id}`); else BY_ID.set(item.id, item);
  if (BY_NAME.has(item.name)) IDENTITY_ERRORS.push(`Tên trùng: ${item.name}`); else BY_NAME.set(item.name, item);
}
if (IDENTITY_ERRORS.length) throw new Error(`[ElementalItemCatalog] ${IDENTITY_ERRORS.join('; ')}`);

export function getElementalItemById(id) { return BY_ID.get(id) || null; }
export function getElementalItemByName(name) { return BY_NAME.get(name) || null; }
export function getElementalItems({ element=null, affinity=null, rank=null, kind=null, type=null } = {}) {
  return ALL_ELEMENTAL_ITEMS.filter(item =>
    (element == null || item.element === element) &&
    (affinity == null || item.affinity === affinity) &&
    (rank == null || item.rank === Number(rank)) &&
    (kind == null || item.kind === kind) &&
    (type == null || item.type === type)
  );
}
export function getRealmRankFromMonsterTier(tier=0) {
  const t = Math.max(0, Number(tier) || 0);
  if (t <= 0) return 0;
  return Math.min(5, Math.ceil(t / 4));
}
function pick(list, rng=Math.random) {
  if (!Array.isArray(list) || !list.length) return null;
  return list[Math.min(list.length - 1, Math.floor(rng() * list.length))];
}
function poolKey(a, b) { return `${a}:${b}`; }
const GEAR_POOLS = new Map();
const TALISMAN_POOLS = new Map();
const HERB_POOLS = new Map();
const ORE_POOLS = new Map();
const PILL_POOLS = new Map();
for (const system of ELEMENTAL_SYSTEMS) for (const realm of ITEM_REALMS) {
  GEAR_POOLS.set(poolKey(system.key, realm.rank), gear.filter(i => i.element === system.key && i.rank === realm.rank));
  TALISMAN_POOLS.set(poolKey(system.key, realm.rank), talismans.filter(i => i.element === system.key && i.rank === realm.rank));
  PILL_POOLS.set(poolKey(system.key, realm.rank), pills.filter(i => i.rank === realm.rank && i.compatibleSystems.includes(system.key)));
}
for (const affinity of RESOURCE_AFFINITIES) for (const realm of ITEM_REALMS) {
  HERB_POOLS.set(poolKey(affinity.key, realm.rank), herbs.filter(i => i.affinity === affinity.key && i.rank === realm.rank));
  ORE_POOLS.set(poolKey(affinity.key, realm.rank), ores.filter(i => i.affinity === affinity.key && i.rank === realm.rank));
}

export function rollElementalItemDrop(enemy, rng=Math.random) {
  const tier = Number(enemy?.monsterData?.tier ?? 0);
  const rank = getRealmRankFromMonsterTier(tier);
  const bossBonus = tier > 0 && tier % 4 === 0 ? 0.14 : 0;
  const chance = Math.min(0.58, 0.22 + rank * 0.025 + bossBonus);
  if (rng() > chance) return null;

  const system = pick(ELEMENTAL_SYSTEMS, rng);
  const affinityKey = SYSTEM_TO_RESOURCE[system.key] || 'linh';
  const roll = rng();
  if (roll < 0.43) return pick(GEAR_POOLS.get(poolKey(system.key, rank)), rng);
  if (roll < 0.60) return pick(HERB_POOLS.get(poolKey(affinityKey, rank)), rng);
  if (roll < 0.75) return pick(ORE_POOLS.get(poolKey(affinityKey, rank)), rng);
  if (roll < 0.87) return pick(PILL_POOLS.get(poolKey(system.key, rank)), rng);
  return pick(TALISMAN_POOLS.get(poolKey(system.key, rank)), rng);
}

export function getElementalIconMeta(item) {
  const system = item?.element ? ELEMENTAL_SYSTEMS.find(s => s.key === item.element) : null;
  const affinity = item?.affinity ? RESOURCE_AFFINITIES.find(a => a.key === item.affinity) : null;
  const family = item?.family ? PILL_FAMILIES.find(f => f.key === item.family) : null;
  const realm = ITEM_REALMS[Math.max(0, Math.min(ITEM_REALMS.length - 1, Number(item?.rank) || 0))];
  return {
    icon:item?.icon || iconKey(item?.id || 'unknown'),
    systemCode:system?.code || affinity?.code || family?.code || 'IT',
    systemColor:system?.color || affinity?.color || family?.color || '#d8d6ff',
    systemDark:system?.dark || affinity?.dark || '#34304e',
    rankColor:realm.color,
    rankLabel:realm.rank === 0 ? 'P' : String(realm.rank),
    kindCode:item?.iconCode || KIND_ICON_CODES[item?.kind] || 'IT'
  };
}

/** Migration V1 -> V2. Gear/phù giữ nguyên ID; chỉ đổi đan, thảo và khoáng. */
const legacyHerbNameMap = new Map();
const legacyPillNameMap = new Map();
const legacyOreIdMap = new Map();
for (const system of ELEMENTAL_SYSTEMS) for (const realm of ITEM_REALMS) {
  const affinityKey = SYSTEM_TO_RESOURCE[system.key] || 'linh';
  const pillKey = SYSTEM_TO_PILL[system.key] || 'hoi_nguyen';
  const herbTarget = HERB_POOLS.get(poolKey(affinityKey, realm.rank))?.[0];
  const pillTarget = pills.find(i => i.family === pillKey && i.rank === realm.rank);
  const oreTarget = ORE_POOLS.get(poolKey(affinityKey, realm.rank))?.[0];
  legacyHerbNameMap.set(`${realmPrefix(realm)} ${system.theme} Linh Thảo`, herbTarget?.name || null);
  legacyPillNameMap.set(`${realmPrefix(realm)} ${system.theme} Linh Đan`, pillTarget?.name || null);
  legacyOreIdMap.set(`elem_${system.key}_r${realm.rank}_ore`, oreTarget?.id || null);
}
export const LEGACY_ELEMENTAL_MIGRATION = Object.freeze({
  herbNames:legacyHerbNameMap,
  pillNames:legacyPillNameMap,
  oreIds:legacyOreIdMap
});
