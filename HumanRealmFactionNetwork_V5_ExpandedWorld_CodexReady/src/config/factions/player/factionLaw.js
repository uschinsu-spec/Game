export function createLawProfile(input={}) {
  return Object.freeze({ murderPenalty:Number(input.murderPenalty??100),theftPenalty:Number(input.theftPenalty??25),duelPolicy:input.duelPolicy||'licensed',sectConflictPolicy:input.sectConflictPolicy||'restricted',contraband:Object.freeze([...(input.contraband||[])]),taxRate:Math.max(0,Math.min(1,Number(input.taxRate??0.05))),cityWeaponPolicy:input.cityWeaponPolicy||'allowed_but_restricted',wantedRules:Object.freeze({...input.wantedRules}) });
}
