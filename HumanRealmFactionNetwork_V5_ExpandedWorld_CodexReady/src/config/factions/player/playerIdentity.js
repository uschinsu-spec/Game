export function createIdentityState(input={}) {
  return Object.freeze({ trueIdentity:input.trueIdentity||'player', activeIdentity:input.activeIdentity||input.trueIdentity||'player', disguiseQuality:Math.max(0,Math.min(100,Number(input.disguiseQuality||0))), knownBy:Object.freeze({...input.knownBy}), suspectedBy:Object.freeze({...input.suspectedBy}), confirmedCrimes:Object.freeze([...(input.confirmedCrimes||[])]) });
}

export function canFactionPierceDisguise(identity,intelligenceScore=0){ return Number(intelligenceScore)>=identity.disguiseQuality; }
