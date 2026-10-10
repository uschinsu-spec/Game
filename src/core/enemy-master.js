import ENEMY_DATA from '../data/enemies.json' with {type:'json'};

// Edit src/data/enemies.json to manage enemies. Derived runtime views stay in sync.
export const ENEMY_MASTER=Object.freeze(Object.fromEntries(
  Object.entries(ENEMY_DATA.enemies).map(([id,entry])=>[id,Object.freeze({
    ...ENEMY_DATA.animation,...ENEMY_DATA.groups[entry.category],...entry,id,asset:id
  })])
));
export const ENEMY_SPECIES=Object.freeze(Object.fromEntries(
  Object.entries(ENEMY_DATA.kindSprites).map(([kind,id])=>{
    const entry=ENEMY_MASTER[id];
    if(!entry)throw new Error(`Enemy kind ${kind}: missing sprite ${id}`);
    return [kind,Object.freeze({...entry,sprite:id,frames:entry.columns})];
  })
));
export function enemyKindForFloor(floor){
  const rule=ENEMY_DATA.floorRules.find(r=>floor>=r.from&&(r.to===null||floor<=r.to));
  if(!rule||!ENEMY_SPECIES[rule.kind])throw new Error(`Missing enemy rule for floor ${floor}`);
  return rule.kind;
}

export function enemyVisual(enemy,species){
  const asset=enemy.sprite||species.sprite||enemy.kind;
  const master=ENEMY_MASTER[asset];
  const frames=master?.columns||species.frames||8;
  const attacking=enemy.attackAnim>0;
  const column=attacking
    ?Math.max(0,Math.min(frames-1,Math.floor((enemy.attackAge||0)/(master?.attackDuration||.6)*frames)))
    :enemy.walk?Math.floor(enemy.moveAge||0)%frames:(master?.idleColumn||0);
  return {asset,row:attacking?(master?.attackRow??1):enemy.walk?(master?.movementRow??0):(master?.idleRow??0),column,frames,hoverHeight:master?.hoverHeight||0,
    shadowWidthRatio:master?.shadowWidthRatio??.57,shadowHeight:master?.shadowHeight??12,shadowOpacity:master?.shadowOpacity??1};
}
