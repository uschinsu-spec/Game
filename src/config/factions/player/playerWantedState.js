export function createWantedState(input={}) {
  return Object.freeze({ cityWanted:Object.freeze({...input.cityWanted}), territoryWanted:Object.freeze({...input.territoryWanted}), nationWanted:Object.freeze({...input.nationWanted}), continentWanted:Object.freeze({...input.continentWanted}), humanRealmWanted:Number(input.humanRealmWanted||0) });
}

export function addWanted(state, scope, id, amount=1) {
  if(scope==='humanRealm') return createWantedState({...state,humanRealmWanted:Math.max(0,state.humanRealmWanted+amount)});
  const field=`${scope}Wanted`; const table={...(state[field]||{})}; table[id]=Math.max(0,Number(table[id]||0)+amount); return createWantedState({...state,[field]:table});
}
