export function createWorldAdapter({territories=[],regions=[],continents=[]}={}){
  const territoryById=new Map(territories.map(x=>[x.id,x]));
  return Object.freeze({
    getTerritory:id=>territoryById.get(id)||null,
    getTerritories:()=>Object.freeze([...territories]),
    getRegions:()=>Object.freeze([...regions]),
    getContinents:()=>Object.freeze([...continents]),
    getContinentKeyForTerritory:id=>territoryById.get(id)?.continentKey||'south',
    getCivilizationDensity:id=>Number(territoryById.get(id)?.civilizationDensity||1),
    getImportance:id=>Number(territoryById.get(id)?.importance||1)
  });
}
