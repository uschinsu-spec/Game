export const STRATEGIC_RESOURCES = Object.freeze(['spiritStone','herbs','ores','monsterMaterials','formationMaterials','pillIngredients','weaponMaterials','rareTreasures']);

export function createResourceStock(input={}) {
  const out={}; for(const k of STRATEGIC_RESOURCES) out[k]=Math.max(0,Number(input[k]||0)); return Object.freeze(out);
}
export function resourceDelta(stock,delta={}) { const out={}; for(const k of STRATEGIC_RESOURCES) out[k]=Math.max(0,Number(stock?.[k]||0)+Number(delta[k]||0)); return Object.freeze(out); }
