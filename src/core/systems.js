/** Register systems without allowing one feature to overwrite another silently. */
export function installSystems(Game, systems){
  for(const system of systems){
    for(const [name,method] of Object.entries(system)){
      if(name in Game.prototype)throw new Error(`Duplicate game method: ${name}`);
      if(typeof method!=='function')throw new TypeError(`Invalid game method: ${name}`);
      Object.defineProperty(Game.prototype,name,{value:method,writable:true,configurable:true});
    }
  }
}
