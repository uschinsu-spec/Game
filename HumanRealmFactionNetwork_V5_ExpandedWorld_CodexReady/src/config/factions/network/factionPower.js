const KEYS = ['cultivationPower','militaryPower','economicPower','politicalPower','territorialPower','intelligencePower','infrastructurePower','prestige','resourceControl'];
const W = { cultivationPower:.2,militaryPower:.16,economicPower:.12,politicalPower:.1,territorialPower:.1,intelligencePower:.08,infrastructurePower:.08,prestige:.08,resourceControl:.08 };

export function createPowerVector(input={}) {
  const out={}; for(const k of KEYS) out[k]=Math.max(0,Math.min(100,Number(input[k]??0)));
  out.strategicPower = Math.round(KEYS.reduce((s,k)=>s+out[k]*W[k],0)*100)/100;
  return Object.freeze(out);
}

export function powerFromFaction(faction, modifiers={}) {
  const b=faction?.basePower||{};
  return createPowerVector({
    cultivationPower:(b.cultivation??50)+(modifiers.cultivation||0), militaryPower:(b.military??50)+(modifiers.military||0),
    economicPower:(b.economic??50)+(modifiers.economic||0), politicalPower:(b.political??50)+(modifiers.political||0),
    territorialPower:(b.territorial??40)+(modifiers.territorial||0), intelligencePower:(b.intelligence??40)+(modifiers.intelligence||0),
    infrastructurePower:(b.infrastructure??40)+(modifiers.infrastructure||0), prestige:(b.prestige??50)+(modifiers.prestige||0), resourceControl:(b.resourceControl??40)+(modifiers.resourceControl||0)
  });
}
