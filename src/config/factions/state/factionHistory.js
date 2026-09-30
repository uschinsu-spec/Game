export class FactionHistoryLog{
  constructor(maxEntries=200){this.maxEntries=maxEntries;this.entries=[];}
  add(entry){this.entries.push(Object.freeze({...entry}));if(this.entries.length>this.maxEntries)this.entries.splice(0,this.entries.length-this.maxEntries);return entry;}
  forFaction(factionId){return this.entries.filter(e=>e.factionId===factionId||e.participants?.includes?.(factionId));}
  compact(){return Object.freeze([...this.entries]);}
}
