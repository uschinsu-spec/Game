export function factionAppearanceDescriptor(faction){
  const tag=faction.archetype;
  return Object.freeze({
    costumeFamily: tag==='DYNASTY'?'official':tag==='MERCHANT_GUILD'?'merchant':tag==='UNDERWORLD'?'underworld':tag==='NON_HUMAN_FACTION'?'nonhuman':'cultivator',
    armorWeight: faction.basePower?.military>70?'heavy':'light',
    weaponTheme:faction.meta?.elem||faction.dna?.doctrine||'mixed',
    emblemId:faction.id
  });
}
