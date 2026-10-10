import ENEMY_DATA from './data/enemies.json' with {type:'json'};
import {CultivationEngine as Engine, REALMS, CONG_PHAP_LIST, CONG_PHAP_GRADES, SKILLS, SKILL_MASTERY_TIERS} from '../cultivation_engine.js';
export {Engine, REALMS, CONG_PHAP_LIST, CONG_PHAP_GRADES, SKILLS, SKILL_MASTERY_TIERS};

// Combat, labels and core drops share the same beast rank and substage.
export function enemyStats(kind, beastRank=kind==='deer'?0:1, beastStage=0) {
  const rank=Math.max(0,Math.min(5,Math.floor(Number(beastRank)||0)));
  const stage=rank?Math.max(0,Math.min(3,Math.floor(Number(beastStage)||0))):-1;
  const level=ENEMY_DATA.combatLevels.find(e=>e.rank===rank&&e.stage===stage);
  if(!level)throw new Error(`Missing beast combat level ${rank}:${stage}`);
  const asset=ENEMY_DATA.kindSprites[kind]||kind;
  const entry=ENEMY_DATA.enemies[asset];
  const modifier=ENEMY_DATA.groups[entry?.category]?.combat||{};
  return {hp:modifier.hpOverride??Math.round(level.hp*(modifier.hpMultiplier??1)*100)/100,
    attack:Math.ceil(level.attack*(modifier.attackMultiplier??1)),def:level.def};
}
export function syncStats(p, refill=false) {
  if(p.realmIdx>=1&&!p.activeCongPhapId){
    p.activeCongPhapId='cp_dan_khi';
    if(Array.isArray(p.ownedManuals)&&!p.ownedManuals.includes('cp_dan_khi'))p.ownedManuals.push('cp_dan_khi');
    if(!p.congPhapMastery)p.congPhapMastery=0.35;
  }
  p.maxHp=Engine.calcMaxHp(p);p.maxMp=Engine.calcMaxMp(p);
  p.hp=refill?p.maxHp:Math.min(p.hp,p.maxHp);p.mp=refill?p.maxMp:Math.min(p.mp,p.maxMp);
}
// Luyen Khi 1-3 / 4-6 / 7-9 / 10-12 correspond to early/mid/late/peak.
export function npcRealmForFloor(floor){return floor===2?0:Math.min(28,Math.max(0,floor-1))}
export function npcMasteryCap(p,id){
  const sk=SKILLS.find(s=>s.id===id);
  if(!sk||sk.minRealm>p.realmIdx)return -1;
  if(sk.tier===0)return 3;
  const start=[0,1,13,17,21,25].filter(n=>n<=p.realmIdx).at(-1);
  if(sk.minRealm<start)return 3;
  return p.realmIdx<=12?Math.floor((p.realmIdx-1)/3):p.realmIdx-start;
}
export function npcComboSkills(p){
  return availableSkills(p).filter(sk=>sk.elem===p.skillElement).sort((a,b)=>b.tier-a.tier);
}
export function trainSkill(p,id) {
  p.skillExp[id]=(p.skillExp[id]||0)+1;
  let tier=p.skillMastery[id]||0;
  const cap=p.isNPC?Math.max(0,npcMasteryCap(p,id)):3;
  tier=Math.min(tier,cap);
  while(tier<cap&&p.skillExp[id]>=SKILL_MASTERY_TIERS[tier].expReq){
    p.skillExp[id]-=SKILL_MASTERY_TIERS[tier].expReq;tier++;
  }
  p.skillMastery[id]=tier;
  if(p.isNPC&&tier===cap)p.skillExp[id]=Math.min(p.skillExp[id],SKILL_MASTERY_TIERS[tier].expReq-1);
}
export function availableSkills(p) {return SKILLS.filter(s=>s.tier>0&&s.minRealm<=p.realmIdx)}
export function manualCost(cp) {return {'Hoàng Giai':80,'Huyền Giai':600,'Địa Giai':2400,'Thiên Giai':8000}[cp.grade]}
export function pillCost(p) {return {gold:550+Math.max(0,p.realmIdx-12)*210}}

/** One cultivation pill family per major realm. Breakthrough pills remain distinct. */
export const CULTIVATION_PILLS = Object.freeze([
  {id:'tu_vi_pham',name:'Phàm Nguyên Đan',minRealm:0,maxRealm:0,gold:35,expPct:.12},
  {id:'tu_vi_luyen_khi',name:'Luyện Khí Tụ Linh Đan',minRealm:1,maxRealm:12,gold:75,expPct:.12},
  {id:'tu_vi_truc_co',name:'Trúc Cơ Dưỡng Nguyên Đan',minRealm:13,maxRealm:16,gold:240,expPct:.12},
  {id:'tu_vi_kim_dan',name:'Kim Đan Ngưng Nguyên Đan',minRealm:17,maxRealm:20,gold:900,expPct:.12},
  {id:'tu_vi_nguyen_anh',name:'Nguyên Anh Hóa Linh Đan',minRealm:21,maxRealm:24,gold:3200,expPct:.12},
  {id:'tu_vi_hoa_than',name:'Hóa Thần Ngộ Đạo Đan',minRealm:25,maxRealm:28,gold:10000,expPct:.12}
]);
export function cultivationPillForRealm(realmIdx){
  return CULTIVATION_PILLS.find(p=>realmIdx>=p.minRealm&&realmIdx<=p.maxRealm);
}
export function cultivationPillExp(char, pill=cultivationPillForRealm(char.realmIdx)){
  const pct = pill?.expPct ?? cultivationPillForRealm(char.realmIdx)?.expPct ?? 0.12;
  return Math.max(1, Math.ceil(Engine.getRealm(char).expReq * pct));
}
