(() => {
  "use strict";
  const defs=new Map();
  const slots=new Map();
  const api={
    register(def){
      if(!def?.id||!def?.slot)throw new Error("PlayerPartRegistry.register cần id và slot");
      defs.set(def.id,Object.freeze({...def}));
      if(!slots.has(def.slot))slots.set(def.slot,[]);
      const arr=slots.get(def.slot);if(!arr.includes(def.id))arr.push(def.id);
      return def.id;
    },
    get(id){return defs.get(id)||null;},
    list(slot){return (slots.get(slot)||[]).map(id=>defs.get(id));},
    has(id){return defs.has(id);},
    slots(){return [...slots.keys()];}
  };
  window.PlayerPartRegistry=api;
})();
