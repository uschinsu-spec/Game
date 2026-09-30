const clamp = (v,min=-1000,max=1000)=>Math.max(min,Math.min(max,Number(v||0)));

export function createPlayerFactionRelation(factionId, input={}) {
  return Object.freeze({
    factionId,
    reputation:clamp(input.reputation), trust:clamp(input.trust), loyalty:clamp(input.loyalty), contribution:Math.max(0,Number(input.contribution||0)),
    prestige:clamp(input.prestige), fear:clamp(input.fear), notoriety:clamp(input.notoriety), debt:Math.max(0,Number(input.debt||0)),
    membershipRank:input.membershipRank??null, professionRank:input.professionRank??null, politicalRank:input.politicalRank??null,
    contractStatus:input.contractStatus??null, wantedLevel:Math.max(0,Number(input.wantedLevel||0))
  });
}

export function updatePlayerFactionRelation(rel, delta={}) {
  return createPlayerFactionRelation(rel.factionId, {
    ...rel,
    reputation:(rel.reputation||0)+(delta.reputation||0), trust:(rel.trust||0)+(delta.trust||0), loyalty:(rel.loyalty||0)+(delta.loyalty||0),
    contribution:(rel.contribution||0)+(delta.contribution||0), prestige:(rel.prestige||0)+(delta.prestige||0), fear:(rel.fear||0)+(delta.fear||0),
    notoriety:(rel.notoriety||0)+(delta.notoriety||0), debt:(rel.debt||0)+(delta.debt||0),
    membershipRank:delta.membershipRank ?? rel.membershipRank, professionRank:delta.professionRank ?? rel.professionRank, politicalRank:delta.politicalRank ?? rel.politicalRank,
    contractStatus:delta.contractStatus ?? rel.contractStatus, wantedLevel:delta.wantedLevel ?? rel.wantedLevel
  });
}

export function reputationBand(value) {
  const v=Number(value||0);
  if(v<=-800)return'Tử Thù'; if(v<=-400)return'Thù Địch'; if(v<=-100)return'Ác Cảm'; if(v<100)return'Trung Lập'; if(v<300)return'Thiện Cảm'; if(v<600)return'Hữu Hảo'; if(v<900)return'Tôn Kính'; return'Sùng Kính';
}
