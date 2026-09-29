/**
 * elementalItemCatalog.js
 * Hệ vật phẩm theo 9 hệ thần thông và 6 bậc tiến triển từ Phàm Nhân -> Hóa Thần.
 *
 * Mục tiêu:
 * - Một nguồn dữ liệu duy nhất cho Trang Bị, Đan Dược, Phù Chú, Linh Thảo, Khoáng Thạch.
 * - Mỗi hệ x mỗi bậc đều có đủ vật phẩm.
 * - Mỗi item có icon key riêng để dùng đồng nhất trong túi đồ và vật phẩm rơi ngoài bản đồ.
 * - Sinh dữ liệu bằng blueprint để mở rộng dễ, tránh hard-code hàng trăm object lặp lại.
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

const BASE_POWER = [8, 58, 320, 2100, 15000, 115000];
const BASE_PRICE = [18, 280, 2600, 23000, 240000, 2600000];
const KIND_ICON_CODES = { pill:'DD', talisman:'PC', herb:'LT', ore:'KT' };

function safeId(value) {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function iconKey(id) { return `elem_item_${safeId(id)}`; }

function realmPrefix(realm) {
  return realm.rank === 0 ? 'Phàm Phẩm' : `${realm.realm} ${realm.rankName}`;
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
  const bonusDmg = Math.max(0, Math.round(power * blueprint.dmg * bias.dmg));
  const bonusHp = Math.max(0, Math.round(power * blueprint.hp * bias.hp * 10));
  const bonusDef = Math.max(0, Math.round(power * blueprint.def * bias.def));
  const bonusSpd = Math.max(0, Math.round((6 + realm.rank * 14) * blueprint.spd * bias.spd));
  return {
    id, catalogItemId:id, kind:'gear', category:'equipment', type:blueprint.slot,
    element:system.key, elementName:system.name, realm:realm.realm, rank:realm.rank,
    rankName:realm.rankName, displayRank:realm.displayRank, grade:realm.grade,
    name:`${realmPrefix(realm)} ${system.theme} ${blueprint.label}`,
    icon:iconKey(id), iconCode:blueprint.iconCode, color:system.color,
    bonusDmg, bonusHp, bonusDef, bonusSpd,
    price:Math.round(BASE_PRICE[realm.rank] * (1 + ELEMENTAL_EQUIPMENT_SLOTS.indexOf(blueprint) * 0.08)),
    stackable:false,
    desc:`[Hệ ${system.name} • ${realm.realm}] ${blueprint.label} hội tụ ${system.essence}. Phẩm chất ${realm.grade}; phù hợp tu sĩ ${realm.realm}.`
  };
}

function buildHerb(system, realm) {
  const id = `elem_${system.key}_r${realm.rank}_herb`;
  return {
    id, catalogItemId:id, kind:'herb', category:'material', type:'herb',
    element:system.key, elementName:system.name, realm:realm.realm, rank:realm.rank,
    rankName:realm.rankName, displayRank:realm.displayRank, grade:realm.grade,
    name:`${realmPrefix(realm)} ${system.theme} Linh Thảo`,
    icon:iconKey(id), iconCode:KIND_ICON_CODES.herb, emoji:'🌿', color:system.color,
    price:Math.round(BASE_PRICE[realm.rank] * 0.35), stackable:true, maxStack:9999,
    alchemyPower:Math.round(10 * realm.scale),
    desc:`[Hệ ${system.name} • ${realm.realm}] Linh thảo hấp thu ${system.essence}; dùng làm chủ dược cho đan dược và phù chú cùng hệ.`
  };
}

function buildOre(system, realm) {
  const id = `elem_${system.key}_r${realm.rank}_ore`;
  return {
    id, catalogItemId:id, kind:'ore', category:'material', type:'ore',
    element:system.key, elementName:system.name, realm:realm.realm, rank:realm.rank,
    rankName:realm.rankName, displayRank:realm.displayRank, grade:realm.grade,
    name:`${realmPrefix(realm)} ${system.theme} Linh Khoáng`,
    icon:iconKey(id), iconCode:KIND_ICON_CODES.ore, emoji:'⛏️', color:system.color,
    price:Math.round(BASE_PRICE[realm.rank] * 0.48), stackable:true, maxStack:9999,
    forgingPower:Math.round(14 * realm.scale),
    desc:`[Hệ ${system.name} • ${realm.realm}] Khoáng thạch kết tinh ${system.essence}; nguyên liệu rèn trang bị ${system.name} đồng cấp.`
  };
}

function buildPill(system, realm, herb, ore) {
  const id = `elem_${system.key}_r${realm.rank}_pill`;
  const hp = Math.round((120 + realm.rank * 180) * realm.scale);
  return {
    id, catalogItemId:id, kind:'pill', category:'consumable', type:'elemental_buff',
    element:system.key, elementName:system.name, realm:realm.realm, rank:realm.rank,
    rankName:realm.rankName, displayRank:realm.displayRank, pillRank:realm.rank, grade:realm.grade,
    name:`${realmPrefix(realm)} ${system.theme} Linh Đan`,
    icon:iconKey(id), iconCode:KIND_ICON_CODES.pill, color:system.color,
    healHp:hp, speedBuff:Math.round((1 + realm.rank * 4) * realm.scale), durationSec:180,
    elementalBonusPct:10 + realm.rank * 6,
    recipeHerbs:[{ name:herb.name, count:2 + realm.rank }],
    recipeMinerals:[{ id:ore.id, count:1 + Math.floor(realm.rank / 2) }],
    costOres:1 + realm.rank * 2, costGold:Math.round(BASE_PRICE[realm.rank] * 0.60),
    price:Math.round(BASE_PRICE[realm.rank] * 0.95), stackable:true, maxStack:999,
    desc:`[Hệ ${system.name} • ${realm.realm}] Hồi ${hp.toLocaleString('vi-VN')} HP và cường hóa sức mạnh hệ ${system.name} +${10 + realm.rank * 6}% trong 180 giây.`
  };
}

function buildTalisman(system, realm, herb, ore) {
  const id = `elem_${system.key}_r${realm.rank}_talisman`;
  const damage = Math.round((160 + realm.rank * 260) * realm.scale);
  return {
    id, catalogItemId:id, kind:'talisman', category:'consumable', type:'talisman',
    element:system.key, elementName:system.name, realm:realm.realm, rank:realm.rank,
    rankName:realm.rankName, displayRank:realm.displayRank, pillRank:realm.rank, grade:realm.grade,
    name:`${realmPrefix(realm)} ${system.theme} Chiến Phù`,
    icon:iconKey(id), iconCode:KIND_ICON_CODES.talisman, color:system.color,
    dmg:damage, aoe:realm.rank >= 2, elementalBonusPct:8 + realm.rank * 5,
    recipeHerbs:[{ name:herb.name, count:1 + realm.rank }],
    recipeMinerals:[{ id:ore.id, count:1 + realm.rank }],
    costOres:1 + realm.rank * 2, costGold:Math.round(BASE_PRICE[realm.rank] * 0.55),
    price:Math.round(BASE_PRICE[realm.rank] * 0.85), stackable:true, maxStack:999,
    desc:`[Hệ ${system.name} • ${realm.realm}] Kích phát ${system.theme}, gây ${damage.toLocaleString('vi-VN')} sát thương${realm.rank >= 2 ? ' diện rộng' : ''}; sức mạnh tăng theo cảnh giới.`
  };
}

const gear = [];
const herbs = [];
const ores = [];
const pills = [];
const talismans = [];

for (const system of ELEMENTAL_SYSTEMS) {
  for (const realm of ITEM_REALMS) {
    const herb = buildHerb(system, realm);
    const ore = buildOre(system, realm);
    herbs.push(herb);
    ores.push(ore);
    pills.push(buildPill(system, realm, herb, ore));
    talismans.push(buildTalisman(system, realm, herb, ore));
    ELEMENTAL_EQUIPMENT_SLOTS.forEach(slot => gear.push(buildGear(system, realm, slot)));
  }
}

export const ELEMENTAL_GEAR_ITEMS = gear;
export const ELEMENTAL_HERBS = herbs;
export const ELEMENTAL_ORES = ores;
export const ELEMENTAL_PILLS = pills;
export const ELEMENTAL_TALISMANS = talismans;
export const ALL_ELEMENTAL_ITEMS = [...gear, ...pills, ...talismans, ...herbs, ...ores];

export const ELEMENTAL_CATALOG_STATS = Object.freeze({
  systems:ELEMENTAL_SYSTEMS.length,
  realms:ITEM_REALMS.length,
  equipment:ELEMENTAL_GEAR_ITEMS.length,
  pills:ELEMENTAL_PILLS.length,
  talismans:ELEMENTAL_TALISMANS.length,
  herbs:ELEMENTAL_HERBS.length,
  ores:ELEMENTAL_ORES.length,
  total:ALL_ELEMENTAL_ITEMS.length
});

const BY_ID = new Map(ALL_ELEMENTAL_ITEMS.map(item => [item.id, item]));
export function getElementalItemById(id) { return BY_ID.get(id) || null; }

export function getElementalItems({ element=null, rank=null, kind=null, type=null } = {}) {
  return ALL_ELEMENTAL_ITEMS.filter(item =>
    (element == null || item.element === element) &&
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

/**
 * Roll vật phẩm cùng cấp với yêu thú.
 * Boss/Đỉnh Phong (tier chia hết cho 4) có thêm tỷ lệ rơi.
 */
export function rollElementalItemDrop(enemy, rng=Math.random) {
  const tier = Number(enemy?.monsterData?.tier ?? 0);
  const rank = getRealmRankFromMonsterTier(tier);
  const bossBonus = tier > 0 && tier % 4 === 0 ? 0.14 : 0;
  const chance = Math.min(0.58, 0.22 + rank * 0.025 + bossBonus);
  if (rng() > chance) return null;

  const system = pick(ELEMENTAL_SYSTEMS, rng);
  const roll = rng();
  let pool;
  if (roll < 0.40) pool = ELEMENTAL_GEAR_ITEMS.filter(i => i.element === system.key && i.rank === rank);
  else if (roll < 0.58) pool = ELEMENTAL_HERBS.filter(i => i.element === system.key && i.rank === rank);
  else if (roll < 0.74) pool = ELEMENTAL_ORES.filter(i => i.element === system.key && i.rank === rank);
  else if (roll < 0.87) pool = ELEMENTAL_PILLS.filter(i => i.element === system.key && i.rank === rank);
  else pool = ELEMENTAL_TALISMANS.filter(i => i.element === system.key && i.rank === rank);
  return pick(pool, rng);
}

export function getElementalIconMeta(item) {
  const system = ELEMENTAL_SYSTEMS.find(s => s.key === item?.element) || ELEMENTAL_SYSTEMS[0];
  const realm = ITEM_REALMS[Math.max(0, Math.min(ITEM_REALMS.length - 1, Number(item?.rank) || 0))];
  return {
    icon:item?.icon || iconKey(item?.id || 'unknown'),
    systemCode:system.code,
    systemColor:system.color,
    systemDark:system.dark,
    rankColor:realm.color,
    rankLabel:realm.rank === 0 ? 'P' : String(realm.rank),
    kindCode:item?.iconCode || KIND_ICON_CODES[item?.kind] || 'IT'
  };
}
