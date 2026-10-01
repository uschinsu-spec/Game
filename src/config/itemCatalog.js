/**
 * itemCatalog.js — Canonical Item Catalog V3
 * Một nguồn dữ liệu duy nhất cho toàn bộ vật phẩm GAME.
 * Không phụ thuộc registry V1/V2, không giữ catalog song song.
 */

export const ITEM_SCHEMA_VERSION = 3;

export const ITEM_RANKS = Object.freeze([
  { rank:0, key:'pham', name:'Phàm Phẩm', realm:'Phàm Nhân', color:'#9ca3af', power:1, currencyKey:'silver' },
  { rank:1, key:'nhat', name:'Nhất Phẩm', realm:'Luyện Khí', color:'#60a5fa', power:5, currencyKey:'low' },
  { rank:2, key:'nhi', name:'Nhị Phẩm', realm:'Trúc Cơ', color:'#4ade80', power:22, currencyKey:'mid' },
  { rank:3, key:'tam', name:'Tam Phẩm', realm:'Kim Đan', color:'#facc15', power:95, currencyKey:'high' },
  { rank:4, key:'tu', name:'Tứ Phẩm', realm:'Nguyên Anh', color:'#f97316', power:420, currencyKey:'extreme' },
  { rank:5, key:'ngu', name:'Ngũ Phẩm', realm:'Hóa Thần', color:'#f43f5e', power:1900, currencyKey:'extreme' }
]);

export const ITEM_GRADES = Object.freeze([
  { key:'ha', name:'Hạ Phẩm', mult:1.00, affixes:0, sockets:0 },
  { key:'trung', name:'Trung Phẩm', mult:1.22, affixes:1, sockets:1 },
  { key:'thuong', name:'Thượng Phẩm', mult:1.55, affixes:2, sockets:2 },
  { key:'cuc', name:'Cực Phẩm', mult:2.05, affixes:3, sockets:3 }
]);

export const ITEM_SYSTEMS = Object.freeze([
  { key:'kiem', name:'Kiếm', theme:'Kiếm Đạo', color:'#f5d76e', stats:{ critRate:1.5, armorPen:2 } },
  { key:'kim', name:'Kim', theme:'Canh Kim', color:'#e8edf5', stats:{ dmgPct:5, armorPen:3 } },
  { key:'hoa', name:'Hỏa', theme:'Liệt Hỏa', color:'#ff754c', stats:{ dmgPct:7, elementDamage:5 } },
  { key:'thuy', name:'Thủy', theme:'Huyền Thủy', color:'#59b9ff', stats:{ mpPct:8, controlPower:5 } },
  { key:'tho', name:'Thổ', theme:'Huyền Hoàng', color:'#c49a62', stats:{ hpPct:8, defPct:8, damageReduction:2 } },
  { key:'moc', name:'Mộc', theme:'Thanh Mộc', color:'#65d889', stats:{ hpPct:5, healPower:8 } },
  { key:'phong', name:'Phong', theme:'Thiên Phong', color:'#89e5df', stats:{ attackSpeed:4, dodge:2, spd:3 } },
  { key:'loi', name:'Lôi', theme:'Tử Tiêu', color:'#b38cff', stats:{ critRate:2, critDamage:8 } },
  { key:'ly', name:'Vật Lý', theme:'Thể Tu', color:'#f0b27a', stats:{ dmgPct:4, hpPct:4, lifeSteal:1 } }
]);

export const RESOURCE_AFFINITIES = Object.freeze([
  { key:'linh', name:'Linh', color:'#d8f3ff' },
  { key:'kim', name:'Kim', color:'#e8edf5' },
  { key:'hoa', name:'Hỏa', color:'#ff754c' },
  { key:'thuy', name:'Thủy', color:'#59b9ff' },
  { key:'tho', name:'Thổ', color:'#c49a62' },
  { key:'moc', name:'Mộc', color:'#65d889' },
  { key:'phong', name:'Phong', color:'#89e5df' },
  { key:'loi', name:'Lôi', color:'#b38cff' }
]);

export const EQUIPMENT_SLOTS = Object.freeze([
  { key:'weapon', name:'Vũ Khí', code:'VK', base:{ dmg:12 } },
  { key:'armor', name:'Giáp', code:'GP', base:{ hp:120, def:4 } },
  { key:'helm', name:'Mũ', code:'MU', base:{ hp:55, def:4 } },
  { key:'boots', name:'Giày', code:'GI', base:{ spd:4, dodge:1 } },
  { key:'amulet', name:'Hộ Phù', code:'HP', base:{ dmg:5, hp:55, mp:25 } },
  { key:'shield', name:'Hộ Thuẫn', code:'HT', base:{ hp:75, def:8, damageReduction:1 } },
  { key:'ring', name:'Nhẫn', code:'NH', base:{ dmg:4, critRate:1.5 } },
  { key:'cloak', name:'Pháp Bào', code:'PB', base:{ hp:40, spd:5, dodge:1 } }
]);

export const ITEM_KINDS = Object.freeze([
  'gear','herb','ore','beast_material','core','pill','talisman','formation',
  'blueprint','token','key','manual','quest'
]);

const ITEM_ICON_ROOT = 'assets/icons';
const GAME_ICON_ROOT = `${ITEM_ICON_ROOT}/game_icons`;
const GEAR_ICON_BANKS = Object.freeze({
  weapon:'01_vu_khi', armor:'02_ao_giap', helm:'03_mu_non', boots:'05_giay',
  amulet:'06_trang_suc', ring:'06_trang_suc', shield:'07_phap_bao', cloak:'07_phap_bao'
});
const KIND_ICON_BANKS = Object.freeze({
  core:'16_yeu_thu_do_giam', talisman:'09_phu_luc_tran_phap', formation:'09_phu_luc_tran_phap',
  blueprint:'20_bach_nghe_che_tao', token:'19_tien_te_phan_thuong', key:'18_ban_do_cong_dich_chuyen',
  manual:'12_cong_phap_tam_phap', quest:'14_nhiem_vu_thanh_tuu'
});
const SYSTEM_ICON_INDEX = Object.freeze(Object.fromEntries(ITEM_SYSTEMS.map((x,i)=>[x.key,i])));
const AFFINITY_ICON_INDEX = Object.freeze(Object.fromEntries(RESOURCE_AFFINITIES.map((x,i)=>[x.key,i])));

function bankIconFile(row, col) {
  row = Math.max(1, Math.min(7, Number(row)||1));
  col = Math.max(1, Math.min(7, Number(col)||1));
  const index = (row - 1) * 7 + col;
  return `${String(index).padStart(2,'0')}_r${row}c${col}.png`;
}
function bankIconPath(folder, item) {
  const row = Math.max(1, Math.min(7, (Number(item?.rank)||0) + 1));
  const systemIndex = SYSTEM_ICON_INDEX[item?.system] ?? AFFINITY_ICON_INDEX[item?.affinity] ?? 0;
  const gradeIndex = Math.max(0, ITEM_GRADES.findIndex(g=>g.key===item?.gradeKey));
  const idSeed = Array.from(String(item?.id||'')).reduce((n,ch)=>(n+ch.charCodeAt(0))%97,0);
  const col = ((systemIndex * 2 + gradeIndex + idSeed) % 7) + 1;
  return `${GAME_ICON_ROOT}/${folder}/${bankIconFile(row,col)}`;
}
function resolveItemIconPath(item) {
  if (!item) return `${ITEM_ICON_ROOT}/items/item_0.png`;
  if (item.kind === 'gear') return bankIconPath(GEAR_ICON_BANKS[item.slot] || '07_phap_bao', item);
  if (item.kind === 'herb') return `${ITEM_ICON_ROOT}/materials/herb_${Math.max(1,Math.min(7,(Number(item.rank)||0)+1))}.png`;
  if (item.kind === 'ore') return `${ITEM_ICON_ROOT}/materials/ore.png`;
  if (item.kind === 'beast_material') {
    const part = (item.tags||[]).find(x=>['hide','fur','claw','blood','bone'].includes(x)) || String(item.id).split('_').pop();
    const file = {hide:'beast_pelt.png',fur:'beast_fur.png',claw:'beast_claw.png',blood:'beast_blood.png',bone:'beast_horn.png'}[part] || 'beast_pelt.png';
    return `${ITEM_ICON_ROOT}/materials/${file}`;
  }
  if (item.kind === 'pill') {
    if ((item.tags||[]).includes('breakthrough')) return `${ITEM_ICON_ROOT}/pills/pill_breakthrough.png`;
    if ((item.tags||[]).includes('heal')) return `${ITEM_ICON_ROOT}/pills/pill_heal.png`;
    if ((item.tags||[]).includes('cultivation')) return `${ITEM_ICON_ROOT}/pills/pill_cultivation.png`;
    return `${ITEM_ICON_ROOT}/pills/pill_golden.png`;
  }
  const bank = KIND_ICON_BANKS[item.kind];
  if (bank) return bankIconPath(bank,item);
  return bankIconPath('20_bach_nghe_che_tao',item);
}

const defs = [];
const recipes = [];
const byId = new Map();
const byName = new Map();
const recipeById = new Map();

function round(n) { return Math.max(0, Math.round(Number(n) || 0)); }
function cloneStats(stats={}) { return Object.fromEntries(Object.entries(stats).map(([k,v]) => [k, Number(v) || 0])); }
function addDef(def) {
  if (!def?.id || byId.has(def.id)) throw new Error(`[ItemCatalogV3] Duplicate item id: ${def?.id}`);
  if (!def?.name || byName.has(def.name)) throw new Error(`[ItemCatalogV3] Duplicate item name: ${def?.name}`);
  const base = { stackable:true, maxStack:9999, tags:[], sources:[], ...def };
  const frozen = Object.freeze({ ...base, iconPath:base.iconPath || resolveItemIconPath(base) });
  defs.push(frozen); byId.set(frozen.id, frozen); byName.set(frozen.name, frozen); return frozen;
}
function addRecipe(recipe) {
  if (!recipe?.id || recipeById.has(recipe.id)) throw new Error(`[ItemCatalogV3] Duplicate recipe id: ${recipe?.id}`);
  const frozen = Object.freeze({ inputs:[], currency:{}, outputQty:1, ...recipe });
  recipes.push(frozen); recipeById.set(frozen.id, frozen); return frozen;
}
function scaleStats(base, power, gradeMult, systemStats={}) {
  const out = {};
  Object.entries(base || {}).forEach(([key,value]) => {
    if (['critRate','dodge','lifeSteal'].includes(key)) out[key] = +(value * gradeMult * (1 + power * 0.01)).toFixed(2);
    else out[key] = round(value * power * gradeMult);
  });
  Object.entries(systemStats || {}).forEach(([key,value]) => {
    const scaled = ['dmgPct','hpPct','defPct','mpPct','critRate','critDamage','armorPen','elementDamage','damageReduction','controlPower','healPower','attackSpeed','dodge','lifeSteal','spd'].includes(key)
      ? +(value * (1 + Math.max(0, power - 1) * 0.015)).toFixed(2)
      : value;
    out[key] = +(Number(out[key] || 0) + Number(scaled || 0)).toFixed(2);
  });
  return out;
}

// ---------------------------------------------------------------------------
// Gear: 6 bậc × 9 hệ × 8 slot × 4 phẩm = 1.728 definition.
// ---------------------------------------------------------------------------
for (const realm of ITEM_RANKS) {
  for (const system of ITEM_SYSTEMS) {
    for (const slot of EQUIPMENT_SLOTS) {
      for (const grade of ITEM_GRADES) {
        const id = `gear_${realm.key}_${system.key}_${slot.key}_${grade.key}`;
        const stats = scaleStats(slot.base, realm.power, grade.mult, system.stats);
        const def = addDef({
          id, name:`${realm.name} ${grade.name} ${system.theme} ${slot.name}`,
          kind:'gear', category:'gear', rank:realm.rank, rankName:realm.name, realm:realm.realm,
          grade:grade.name, gradeKey:grade.key, system:system.key, systemName:system.name,
          slot:slot.key, icon:`item_${id}`, color:system.color, rankColor:realm.color,
          stackable:false, maxStack:1, baseStats:stats, socketCount:grade.sockets,
          affixCount:grade.affixes, durabilityMax:100 + realm.rank * 20,
          price:round(35 * realm.power * grade.mult),
          tags:['equipment',slot.key,system.key,grade.key],
          sources:['crafting','boss_blueprint','sect_shop'],
          desc:`${slot.name} ${system.theme} ${grade.name}, thích hợp ${realm.realm}.`
        });
        const affinity = RESOURCE_AFFINITIES.find(a => a.key === system.key) || RESOURCE_AFFINITIES[0];
        const oreId = `ore_${realm.key}_${affinity.key}`;
        const beastId = `beast_${realm.key}_bone`;
        addRecipe({
          id:`recipe_${id}`, category:'gear', rank:realm.rank, outputId:def.id,
          outputQty:1,
          inputs:[
            { itemId:oreId, qty:Math.max(2, 3 + realm.rank * 2 + ITEM_GRADES.indexOf(grade) * 2) },
            { itemId:beastId, qty:Math.max(1, 1 + realm.rank + ITEM_GRADES.indexOf(grade)) }
          ],
          currency:{ key:realm.currencyKey, amount:round(20 * realm.power * grade.mult) },
          desc:`Luyện khí ${def.name}`
        });
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Natural resources: 48 herbs + 48 ores.
// ---------------------------------------------------------------------------
const herbRoots = { linh:'Ngưng Linh Thảo', kim:'Canh Kim Chi', hoa:'Xích Diễm Hoa', thuy:'Huyền Thủy Liên', tho:'Địa Mạch Căn', moc:'Thanh Mộc Diệp', phong:'Tật Phong Thảo', loi:'Tử Lôi Hoa' };
const oreRoots = { linh:'Linh Tinh Khoáng', kim:'Canh Kim Khoáng', hoa:'Hỏa Tinh Thạch', thuy:'Huyền Băng Khoáng', tho:'Địa Tâm Thạch', moc:'Mộc Linh Tinh', phong:'Phong Linh Sa', loi:'Lôi Tinh Khoáng' };
for (const realm of ITEM_RANKS) {
  for (const affinity of RESOURCE_AFFINITIES) {
    addDef({
      id:`herb_${realm.key}_${affinity.key}`, name:`${realm.name} ${herbRoots[affinity.key]}`,
      kind:'herb', category:'material', rank:realm.rank, rankName:realm.name, realm:realm.realm,
      affinity:affinity.key, affinityName:affinity.name, icon:`item_herb_${realm.key}_${affinity.key}`,
      color:affinity.color, rankColor:realm.color, price:round(5 * realm.power),
      tags:['material','herb',affinity.key], sources:['gathering','monster'],
      desc:`Linh thảo thuộc tính ${affinity.name}, nguyên liệu luyện đan/phù bậc ${realm.name}.`
    });
    addDef({
      id:`ore_${realm.key}_${affinity.key}`, name:`${realm.name} ${oreRoots[affinity.key]}`,
      kind:'ore', category:'material', rank:realm.rank, rankName:realm.name, realm:realm.realm,
      affinity:affinity.key, affinityName:affinity.name, icon:`item_ore_${realm.key}_${affinity.key}`,
      color:affinity.color, rankColor:realm.color, price:round(7 * realm.power),
      tags:['material','ore',affinity.key], sources:['mining','monster'],
      desc:`Khoáng thạch thuộc tính ${affinity.name}, nguyên liệu luyện khí bậc ${realm.name}.`
    });
  }
}

// ---------------------------------------------------------------------------
// Beast materials: 5 parts × 6 ranks.
// ---------------------------------------------------------------------------
const beastParts = [
  ['hide','Da Yêu Thú','🐺'], ['fur','Lông Yêu Thú','🪶'], ['claw','Móng Yêu Thú','🐾'],
  ['blood','Tinh Huyết Yêu Thú','🩸'], ['bone','Yêu Cốt','🦴']
];
for (const realm of ITEM_RANKS) {
  for (const [part,name,emoji] of beastParts) {
    addDef({
      id:`beast_${realm.key}_${part}`, name:`${realm.name} ${name}`, kind:'beast_material', category:'material',
      rank:realm.rank, rankName:realm.name, realm:realm.realm, icon:`item_beast_${realm.key}_${part}`, emoji,
      color:realm.color, rankColor:realm.color, price:round(6 * realm.power),
      tags:['material','beast',part], sources:['monster'], desc:`Nguyên liệu yêu thú ${realm.name}, dùng luyện khí và bách nghệ.`
    });
  }
}

// ---------------------------------------------------------------------------
// Beast cores / sockets: 8 affinities × 6 ranks.
// ---------------------------------------------------------------------------
const coreStats = {
  linh:{ spiritualSense:3, mpPct:3 }, kim:{ armorPen:2, dmgPct:2 }, hoa:{ elementDamage:4, dmgPct:2 },
  thuy:{ mpPct:5, controlPower:3 }, tho:{ defPct:5, hpPct:3 }, moc:{ hpPct:4, healPower:4 },
  phong:{ attackSpeed:3, dodge:2 }, loi:{ critRate:2, critDamage:5 }
};
for (const realm of ITEM_RANKS) {
  for (const affinity of RESOURCE_AFFINITIES) {
    addDef({
      id:`core_${realm.key}_${affinity.key}`, name:`${realm.name} ${affinity.name} Nội Đan`,
      kind:'core', category:'core', rank:realm.rank, rankName:realm.name, realm:realm.realm,
      affinity:affinity.key, affinityName:affinity.name, icon:`item_core_${realm.key}_${affinity.key}`,
      color:affinity.color, rankColor:realm.color, price:round(18 * realm.power),
      socketStats:scaleStats({}, realm.power, 1, coreStats[affinity.key]),
      tags:['core','socket',affinity.key], sources:['elite','boss'],
      desc:`Nội đan ${affinity.name} dùng khảm vào trang bị, tăng thuộc tính vĩnh viễn khi đang trang bị.`
    });
  }
}

// ---------------------------------------------------------------------------
// Pills — common functional families + exact bottleneck pill names used by REALMS.
// ---------------------------------------------------------------------------
const pillFamilies = [
  { key:'heal', label:'Hồi Nguyên Đan', effect:'heal' },
  { key:'mana', label:'Dưỡng Linh Đan', effect:'mana' },
  { key:'cultivation', label:'Tụ Khí Đan', effect:'cultivation' },
  { key:'body', label:'Hộ Thể Đan', effect:'buff' },
  { key:'sense', label:'Ngưng Thần Đan', effect:'sense' }
];
for (const realm of ITEM_RANKS) {
  for (const family of pillFamilies) {
    const id = `pill_${realm.key}_${family.key}`;
    const effect = family.effect === 'heal' ? { type:'heal', value:round(100 * realm.power) }
      : family.effect === 'mana' ? { type:'mana', value:round(90 * realm.power) }
      : family.effect === 'cultivation' ? { type:'cultivation', speed:Math.max(1, round(realm.power * 1.8)), durationSec:180 }
      : family.effect === 'sense' ? { type:'sense', value:Math.max(1, 2 + realm.rank * 4) }
      : { type:'buff', durationSec:120, stats:{ hpPct:4 + realm.rank * 2, defPct:4 + realm.rank * 2 } };
    const def = addDef({
      id, name:`${realm.name} ${family.label}`, kind:'pill', category:'consumable', rank:realm.rank, rankName:realm.name,
      realm:realm.realm, grade:'Trung Phẩm', icon:`item_${id}`, color:realm.color, rankColor:realm.color,
      price:round(12 * realm.power), effect, cooldownGroup:family.key, cooldownMs:2000,
      tags:['consumable','pill',family.key], sources:['crafting','medicine_shop'],
      desc:`${family.label} ${realm.name}, dùng trực tiếp từ túi hoặc ô dùng nhanh.`
    });
    addRecipe({
      id:`recipe_${id}`, category:'pills', rank:realm.rank, outputId:def.id, outputQty:1,
      inputs:[
        { itemId:`herb_${realm.key}_linh`, qty:2 + realm.rank },
        { itemId:`herb_${realm.key}_${['moc','thuy','hoa','tho','loi'][pillFamilies.indexOf(family)]}`, qty:1 + Math.floor(realm.rank/2) }
      ],
      currency:{ key:realm.currencyKey, amount:round(4 * realm.power) }, desc:`Luyện ${def.name}`
    });
  }
}

const breakthroughNames = [
  null,
  'Nhất Phẩm Cực Phẩm Trúc Cơ Đan',
  'Nhị Phẩm Cực Phẩm Ngưng Đan Đan',
  'Tam Phẩm Cực Phẩm Hóa Anh Đan',
  'Tứ Phẩm Cực Phẩm Hóa Thần Đan'
];
for (let rank=1; rank<=4; rank++) {
  const realm = ITEM_RANKS[rank];
  const id = `pill_${realm.key}_breakthrough`;
  const def = addDef({
    id, name:breakthroughNames[rank], kind:'pill', category:'consumable', rank, rankName:realm.name, realm:realm.realm,
    grade:'Cực Phẩm', icon:`item_${id}`, color:realm.color, rankColor:realm.color, price:round(80 * realm.power),
    effect:{ type:'breakthrough' }, cooldownGroup:'breakthrough', cooldownMs:0,
    tags:['consumable','pill','breakthrough'], sources:['crafting','boss'],
    desc:`Đan phá bình cảnh Cực Phẩm dùng khi đạt đỉnh phong ${realm.realm}.`
  });
  addRecipe({
    id:`recipe_${id}`, category:'pills', rank, outputId:def.id, outputQty:1,
    inputs:[
      { itemId:`herb_${realm.key}_linh`, qty:8 + rank * 3 },
      { itemId:`herb_${realm.key}_loi`, qty:4 + rank * 2 },
      { itemId:`core_${realm.key}_linh`, qty:1 }
    ],
    currency:{ key:realm.currencyKey, amount:round(45 * realm.power) }, desc:`Luyện ${def.name}`
  });
}

// ---------------------------------------------------------------------------
// Talismans: attack/heal/shield per system/rank + universal teleport.
// ---------------------------------------------------------------------------
const talismanTypes = [
  { key:'attack', label:'Công Phạt Phù', effect:(r,s)=>({type:'combat_damage', power:round(90*r.power), system:s.key}) },
  { key:'heal', label:'Hồi Sinh Phù', effect:(r)=>({type:'heal', value:round(130*r.power)}) },
  { key:'shield', label:'Hộ Thể Phù', effect:(r)=>({type:'buff', durationSec:30, stats:{defPct:8+r.rank*2,hpPct:5+r.rank}}) }
];
for (const realm of ITEM_RANKS) {
  for (const system of ITEM_SYSTEMS) {
    for (const tt of talismanTypes) {
      const id = `talisman_${realm.key}_${system.key}_${tt.key}`;
      const def = addDef({
        id, name:`${realm.name} ${system.theme} ${tt.label}`, kind:'talisman', category:'consumable', rank:realm.rank,
        rankName:realm.name, realm:realm.realm, system:system.key, systemName:system.name, icon:`item_${id}`,
        color:system.color, rankColor:realm.color, price:round(16 * realm.power), effect:tt.effect(realm,system),
        cooldownGroup:`talisman_${tt.key}`, cooldownMs:2500,
        tags:['consumable','talisman',tt.key,system.key], sources:['crafting','merchant'], desc:`${tt.label} ${system.theme} ${realm.name}.`
      });
      addRecipe({
        id:`recipe_${id}`, category:'talismans', rank:realm.rank, outputId:def.id, outputQty:1,
        inputs:[
          { itemId:`herb_${realm.key}_${RESOURCE_AFFINITIES.find(a=>a.key===system.key)?.key || 'linh'}`, qty:2 + realm.rank },
          { itemId:`ore_${realm.key}_linh`, qty:1 + realm.rank }
        ],
        currency:{ key:realm.currencyKey, amount:round(7 * realm.power) }, desc:`Chế ${def.name}`
      });
    }
  }
  const id = `talisman_${realm.key}_teleport`;
  const def = addDef({
    id, name:`${realm.name} Truyền Tống Phù`, kind:'talisman', category:'consumable', rank:realm.rank, rankName:realm.name,
    realm:realm.realm, icon:`item_${id}`, color:'#67e8f9', rankColor:realm.color, price:round(22 * realm.power),
    effect:{type:'teleport_home'}, cooldownGroup:'teleport', cooldownMs:15000,
    tags:['consumable','talisman','teleport'], sources:['crafting','merchant'], desc:'Dùng để hồi về điểm an toàn đã định.'
  });
  addRecipe({ id:`recipe_${id}`, category:'talismans', rank:realm.rank, outputId:def.id, inputs:[
    {itemId:`herb_${realm.key}_phong`,qty:2+realm.rank},{itemId:`ore_${realm.key}_linh`,qty:2+realm.rank}
  ], currency:{key:realm.currencyKey,amount:round(10*realm.power)}, desc:`Chế ${def.name}` });
}

// ---------------------------------------------------------------------------
// Formations: one per system/rank. Stackable consumable that activates timed area buff.
// ---------------------------------------------------------------------------
for (const realm of ITEM_RANKS) {
  for (const system of ITEM_SYSTEMS) {
    const id = `formation_${realm.key}_${system.key}`;
    const def = addDef({
      id, name:`${realm.name} ${system.theme} Hộ Đạo Trận`, kind:'formation', category:'formation', rank:realm.rank,
      rankName:realm.name, realm:realm.realm, system:system.key, systemName:system.name, icon:`item_${id}`,
      color:system.color, rankColor:realm.color, price:round(35 * realm.power),
      effect:{ type:'formation', durationSec:180, radius:600, stats:scaleStats({},realm.power,1,{...system.stats,hpPct:4+realm.rank,defPct:4+realm.rank}) },
      cooldownGroup:'formation', cooldownMs:5000,
      tags:['formation',system.key], sources:['crafting','merchant'], desc:`Trận pháp ${system.theme}, duy trì 180 giây.`
    });
    addRecipe({ id:`recipe_${id}`, category:'formations', rank:realm.rank, outputId:def.id, inputs:[
      {itemId:`ore_${realm.key}_linh`,qty:4+realm.rank*2},
      {itemId:`herb_${realm.key}_linh`,qty:3+realm.rank},
      {itemId:`beast_${realm.key}_blood`,qty:2+realm.rank}
    ], currency:{key:realm.currencyKey,amount:round(15*realm.power)}, desc:`Bố trí ${def.name}` });
  }
}

// ---------------------------------------------------------------------------
// World / progression items.
// ---------------------------------------------------------------------------
for (const realm of ITEM_RANKS) {
  addDef({ id:`blueprint_${realm.key}_gear`, name:`${realm.name} Luyện Khí Đồ Phổ`, kind:'blueprint', category:'special', rank:realm.rank, rankName:realm.name, realm:realm.realm,
    icon:`item_blueprint_${realm.key}`, color:realm.color, rankColor:realm.color, price:round(50*realm.power), tags:['blueprint'], sources:['boss','dungeon'], desc:'Đồ phổ hiếm dùng mở khóa/lore chế tạo trang bị cùng bậc.' });
  addDef({ id:`key_${realm.key}_dungeon`, name:`${realm.name} Bí Cảnh Lệnh`, kind:'key', category:'special', rank:realm.rank, rankName:realm.name, realm:realm.realm,
    icon:`item_key_${realm.key}`, color:realm.color, rankColor:realm.color, price:round(30*realm.power), tags:['key','dungeon'], sources:['boss','quest','sect_shop'], desc:'Lệnh bài dùng cho cổng bí cảnh/dungeon cùng bậc.' });
  addDef({ id:`token_${realm.key}_sect`, name:`${realm.name} Tông Môn Lệnh`, kind:'token', category:'special', rank:realm.rank, rankName:realm.name, realm:realm.realm,
    icon:`item_token_sect_${realm.key}`, color:realm.color, rankColor:realm.color, price:0, tags:['token','sect'], sources:['sect_quest'], desc:'Điểm vật phẩm trao đổi tại Tông Môn.' });
  addDef({ id:`token_${realm.key}_clan`, name:`${realm.name} Gia Tộc Lệnh`, kind:'token', category:'special', rank:realm.rank, rankName:realm.name, realm:realm.realm,
    icon:`item_token_clan_${realm.key}`, color:realm.color, rankColor:realm.color, price:0, tags:['token','clan'], sources:['clan_quest'], desc:'Điểm vật phẩm trao đổi tại Gia Tộc.' });
}

export const ALL_ITEM_DEFS = Object.freeze(defs.slice());
export const ALL_ITEM_RECIPES = Object.freeze(recipes.slice());

export const ITEM_CATALOG_STATS = Object.freeze({
  total:ALL_ITEM_DEFS.length,
  recipes:ALL_ITEM_RECIPES.length,
  byKind:Object.freeze(ALL_ITEM_DEFS.reduce((acc,item)=>(acc[item.kind]=(acc[item.kind]||0)+1,acc),{}))
});

export function getItemDef(id) { return byId.get(id) || null; }
export function getItemByName(name) { return byName.get(name) || null; }
export function getRecipe(id) { return recipeById.get(id) || null; }
export function listItems(filter={}) {
  return ALL_ITEM_DEFS.filter(item => {
    if (filter.kind && item.kind !== filter.kind) return false;
    if (filter.category && item.category !== filter.category) return false;
    if (filter.rank !== undefined && Number(item.rank) !== Number(filter.rank)) return false;
    if (filter.system && item.system !== filter.system) return false;
    if (filter.slot && item.slot !== filter.slot) return false;
    if (filter.tag && !(item.tags || []).includes(filter.tag)) return false;
    return true;
  });
}
export function listRecipes(category=null, rank=null) {
  return ALL_ITEM_RECIPES.filter(r => (!category || r.category === category) && (rank === null || rank === undefined || Number(r.rank) === Number(rank)));
}
export function getItemsByRankAndKind(rank, kind) { return listItems({rank,kind}); }
export function getRankMeta(rank=0) { return ITEM_RANKS[Math.max(0,Math.min(5,Number(rank)||0))]; }
export function getGradeMeta(gradeKey='ha') { return ITEM_GRADES.find(g=>g.key===gradeKey) || ITEM_GRADES[0]; }
export function getSystemMeta(key='kiem') { return ITEM_SYSTEMS.find(s=>s.key===key) || ITEM_SYSTEMS[0]; }
export function getRealmItemRank(realmIdx=0) {
  const idx = Math.max(0, Number(realmIdx) || 0);
  if (idx <= 0) return 0;
  if (idx <= 12) return 1;
  if (idx <= 16) return 2;
  if (idx <= 20) return 3;
  if (idx <= 24) return 4;
  return 5;
}

export function getItemIconAsset(itemOrId) {
  const item = typeof itemOrId === 'string' ? getItemDef(itemOrId) : itemOrId;
  if (!item) return null;
  return Object.freeze({ key:item.icon, path:item.iconPath || resolveItemIconPath(item), itemId:item.id, kind:item.kind });
}

export function getItemIconMeta(itemOrId) {
  const item = typeof itemOrId === 'string' ? getItemDef(itemOrId) : itemOrId;
  if (!item) return { kindCode:'?', systemCode:'', systemColor:'#cbd5e1', rankColor:'#9ca3af', rankLabel:'0' };
  const system = getSystemMeta(item.system || item.affinity || 'kiem');
  const rank = getRankMeta(item.rank);
  const kindCode = {gear:'⚔',herb:'🌿',ore:'◆',beast_material:'獣',core:'●',pill:'丹',talisman:'符',formation:'阵',blueprint:'卷',token:'令',key:'钥',manual:'书',quest:'任'}[item.kind] || '•';
  return { kindCode, systemCode:system.name?.slice(0,1) || '', systemColor:item.color || system.color, rankColor:item.rankColor || rank.color, rankLabel:String(item.rank ?? 0) };
}

function pick(arr, rng=Math.random) { return arr?.length ? arr[Math.min(arr.length-1, Math.floor(rng()*arr.length))] : null; }

/**
 * Loot V3: normal enemies drop materials/herbs/ores; elite/boss may also drop cores/blueprints.
 * Never directly drops completed gear from normal monsters.
 */
export function rollEnemyLoot(enemy, rng=Math.random) {
  const data = enemy?.monsterData || enemy || {};
  const tier = Math.max(0, Number(data.tier) || 0);
  const rank = Math.max(0, Math.min(5, tier <= 0 ? 0 : Math.ceil(tier / 4)));
  const realm = getRankMeta(rank);
  const isBoss = !!data.isBoss || tier > 0 && tier % 4 === 0;
  const isElite = !!data.isElite || tier > 0 && tier % 4 === 3;
  const affinity = pick(RESOURCE_AFFINITIES, rng) || RESOURCE_AFFINITIES[0];
  const drops = [];
  const add = (itemId, qty=1) => { if (getItemDef(itemId) && qty > 0) drops.push({itemId,qty:Math.floor(qty)}); };

  add(`beast_${realm.key}_hide`, 1 + Math.floor(rng() * (2 + rank)));
  if (rng() < 0.70) add(`beast_${realm.key}_fur`, 1 + Math.floor(rng() * 2));
  if (rng() < 0.55) add(`beast_${realm.key}_claw`, 1);
  if (rng() < 0.50) add(`beast_${realm.key}_blood`, 1 + (isBoss ? 1 : 0));
  if (rng() < 0.35 + rank * 0.03) add(`beast_${realm.key}_bone`, 1);
  if (rng() < 0.42) add(`herb_${realm.key}_${affinity.key}`, 1 + (isBoss ? 1 : 0));
  if (rng() < 0.48) add(`ore_${realm.key}_${affinity.key}`, 1 + Math.floor(rng() * (1 + (isBoss ? 2 : 1))));
  if ((isElite || isBoss) && rng() < (isBoss ? 0.62 : 0.22)) add(`core_${realm.key}_${affinity.key}`, 1);
  if (isBoss && rng() < 0.20) add(`blueprint_${realm.key}_gear`, 1);
  if (isBoss && rng() < 0.15) add(`key_${realm.key}_dungeon`, 1);
  return drops;
}

export function assertItemCatalogIntegrity() {
  const errors = [];
  if (byId.size !== ALL_ITEM_DEFS.length) errors.push('ID catalog không duy nhất.');
  if (byName.size !== ALL_ITEM_DEFS.length) errors.push('Tên item catalog không duy nhất.');
  for (const item of ALL_ITEM_DEFS) {
    if (!ITEM_KINDS.includes(item.kind)) errors.push(`${item.id}: kind không hợp lệ ${item.kind}`);
    if (item.rank < 0 || item.rank > 5) errors.push(`${item.id}: rank ngoài 0..5`);
    if (!item.icon) errors.push(`${item.id}: thiếu icon key`);
    if (!item.iconPath || !String(item.iconPath).startsWith('assets/icons/')) errors.push(`${item.id}: thiếu iconPath asset thật`);
  }
  for (const recipe of ALL_ITEM_RECIPES) {
    if (!getItemDef(recipe.outputId)) errors.push(`${recipe.id}: output không tồn tại ${recipe.outputId}`);
    for (const req of recipe.inputs || []) if (!getItemDef(req.itemId)) errors.push(`${recipe.id}: input không tồn tại ${req.itemId}`);
  }
  if (errors.length) throw new Error(`[ItemCatalogV3] ${errors.slice(0,20).join(' | ')}`);
  return { ok:true, ...ITEM_CATALOG_STATS };
}

assertItemCatalogIntegrity();
