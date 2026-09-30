export class FactionWorldState {
  constructor(seed='default'){this.worldSeed=seed;this.overrides=new Map();this.influenceDeltas=new Map();this.dynamicRelations=new Map();this.events=[];}
  setOverride(targetType,targetId,path,value,meta={}){const key=`${targetType}:${targetId}:${path}`;this.overrides.set(key,Object.freeze({targetType,targetId,path,value,...meta}));return this.overrides.get(key);}
  getOverride(targetType,targetId,path){return this.overrides.get(`${targetType}:${targetId}:${path}`)||null;}
  addInfluenceDelta(territoryId,factionId,delta){const key=`${territoryId}:${factionId}`;const old=this.influenceDeltas.get(key)||{};const next={...old};for(const[k,v]of Object.entries(delta||{}))next[k]=Number(old[k]||0)+Number(v||0);this.influenceDeltas.set(key,Object.freeze(next));return next;}
  pushEvent(event){this.events.push(event);return event;}
}

export function createFactionWorldState(seed = 'default') {
  return new FactionWorldState(seed);
}
