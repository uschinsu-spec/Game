import { createInfluenceVector } from './factionInfluence.js';
import { hash32 } from '../generation/factionGenerator.js';
import { FACTION_ARCHETYPES } from '../core/factionConstants.js';

const ROLE_BIAS=Object.freeze({
  [FACTION_ARCHETYPES.DYNASTY]:{political:28,territorial:18,military:14,infrastructure:10},
  [FACTION_ARCHETYPES.CITY_STATE]:{political:24,territorial:16,military:12,infrastructure:14},
  [FACTION_ARCHETYPES.ADMINISTRATION]:{political:32,territorial:14,infrastructure:18,military:8},
  [FACTION_ARCHETYPES.SECT]:{cultivation:30,military:12,prestige:16},
  [FACTION_ARCHETYPES.CULTIVATION_FAMILY]:{cultivation:18,political:12,economic:8,prestige:10},
  [FACTION_ARCHETYPES.ANCIENT_CLAN]:{cultivation:25,political:15,prestige:16},
  [FACTION_ARCHETYPES.MERCHANT_GUILD]:{economic:38,infrastructure:18,intelligence:8},
  [FACTION_ARCHETYPES.PROFESSION_GUILD]:{economic:20,cultivation:12,infrastructure:14,prestige:8},
  [FACTION_ARCHETYPES.MILITARY_ORDER]:{military:40,territorial:12,political:8},
  [FACTION_ARCHETYPES.INTELLIGENCE_NETWORK]:{intelligence:45,political:6},
  [FACTION_ARCHETYPES.UNDERWORLD]:{underworld:70,intelligence:24,economic:8},
  [FACTION_ARCHETYPES.DEMONIC_FACTION]:{underworld:32,cultivation:20,military:16},
  [FACTION_ARCHETYPES.LOOSE_CULTIVATOR_ALLIANCE]:{cultivation:8,economic:8,prestige:6},
  [FACTION_ARCHETYPES.ACADEMY]:{cultivation:16,intelligence:12,prestige:18},
  [FACTION_ARCHETYPES.NON_HUMAN_FACTION]:{cultivation:16,military:16,territorial:12}
});
export function influenceBaselineForFaction(faction,territory,{hasBranch=false,isVassal=false}={}){
 const tid=typeof territory==='string'?territory:territory?.id;const seed=hash32(`${faction.id}:${tid}`),base=faction.basePower||{},j=s=>((seed>>>s)%17)-8,home=faction.homeTerritoryId===tid?20:0,branch=hasBranch?16:0,vassal=isVassal?9:0,bias=ROLE_BIAS[faction.archetype]||{};
 const val=(k,d=35)=>Number(base[k]??d)+Number(bias[k]||0);
 return createInfluenceVector({territorial:val('territorial')+j(1)+home+vassal,military:val('military',40)+j(3)+home*.45+branch*.3,cultivation:val('cultivation',45)+j(5)+home*.45+branch*.5,economic:val('economic',40)+j(7)+branch*.6,political:val('political')+j(9)+home*.45+branch*.35,intelligence:val('intelligence')+j(11)+branch*.4,infrastructure:val('infrastructure')+j(13)+branch*.6,prestige:val('prestige',45)+j(15)+branch*.3,resourceControl:val('resourceControl',30)+j(2)+home*.35,underworld:Math.max(val('underworld',0),faction.archetype===FACTION_ARCHETYPES.UNDERWORLD?82:faction.archetype===FACTION_ARCHETYPES.DEMONIC_FACTION?35:4)+j(4)});
}
export function buildTerritoryInfluenceBaseline(territory,factions=[],context={}){const tid=typeof territory==='string'?territory:territory?.id;const branchParents=new Set((context.branches||[]).map(b=>b.parentFactionId));const vassals=new Set((context.vassals||[]).map(v=>v.vassalId));return Object.freeze(factions.map(f=>Object.freeze({factionId:f.id,archetype:f.archetype,powerTier:f.powerTier,territoryId:tid,influence:influenceBaselineForFaction(f,territory,{hasBranch:branchParents.has(f.id),isVassal:vassals.has(f.id)})})));}
export function factionRelevanceScore(entry){const v=entry?.influence||{};return (v.political||0)*1.1+(v.cultivation||0)*1.1+(v.economic||0)+(v.military||0)*.9+(v.intelligence||0)*.65+(v.underworld||0)*.55+(v.prestige||0)*.6;}
