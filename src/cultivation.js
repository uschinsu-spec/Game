import {CultivationEngine as Engine, REALMS, CONG_PHAP_LIST, CONG_PHAP_GRADES, SKILLS, SKILL_MASTERY_TIERS} from '../cultivation_engine.js';
export {Engine, REALMS, CONG_PHAP_LIST, CONG_PHAP_GRADES, SKILLS, SKILL_MASTERY_TIERS};

// The forest is a training ground: each major realm brings a stronger wave.
export function enemyStats(kind, realmIdx) {
  const stage=[0,1,13,17,21,25].filter(i=>i<=realmIdx).at(-1);
  const base=REALMS[stage], factor={wolf:1,deer:.5}[kind];
  return {hp:Math.round(base.hp*.85*factor),def:Math.round(base.def*.45),
    attack:kind==='deer'?0:Math.max(5,Math.round(base.hp*.065*factor)),
    exp:Math.max(10,Math.round(base.expReq*.12*factor)),gold:Math.round((18+stage*12)*factor)};
}
export function syncStats(p, refill=false) {
  p.maxHp=Engine.calcMaxHp(p);p.maxMp=Engine.calcMaxMp(p);
  p.hp=refill?p.maxHp:Math.min(p.hp,p.maxHp);p.mp=refill?p.maxMp:Math.min(p.mp,p.maxMp);
}
// Luyen Khi 1-3 / 4-6 / 7-9 / 10-12 correspond to early/mid/late/peak.
export function npcRealmForFloor(floor){return Math.min(28,Math.max(0,floor-1))}
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
export function pillCost(p) {return {herbs:20+Math.max(0,p.realmIdx-12)*5,gold:300+Math.max(0,p.realmIdx-12)*150}}
