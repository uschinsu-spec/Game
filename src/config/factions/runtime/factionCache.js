export class BoundedFactionCache{
  constructor(limit=128){this.limit=limit;this.map=new Map();}
  get(key){if(!this.map.has(key))return null;const v=this.map.get(key);this.map.delete(key);this.map.set(key,v);return v;}
  set(key,value){if(this.map.has(key))this.map.delete(key);this.map.set(key,value);while(this.map.size>this.limit)this.map.delete(this.map.keys().next().value);return value;}
  delete(key){return this.map.delete(key);} clear(){this.map.clear();} get size(){return this.map.size;}
}
