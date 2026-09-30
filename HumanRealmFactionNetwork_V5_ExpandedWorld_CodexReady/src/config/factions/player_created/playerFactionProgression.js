export const PLAYER_FACTION_STAGES=Object.freeze(['Local Group','Minor Faction','Regional Faction','Major Faction','Territory Overlord','Regional Overlord','Continental Power','Human Realm Power']);
const R=Object.freeze([
 {members:5,experts:0,territories:0,treasury:0,prestige:0,resources:0,alliances:0,formation:0,headquarters:0},
 {members:20,experts:1,territories:0,treasury:1000,prestige:50,resources:1,alliances:0,formation:0,headquarters:1},
 {members:80,experts:3,territories:1,treasury:10000,prestige:150,resources:2,alliances:1,formation:1,headquarters:1},
 {members:300,experts:10,territories:2,treasury:50000,prestige:300,resources:4,alliances:2,formation:2,headquarters:1},
 {members:800,experts:20,territories:5,treasury:150000,prestige:500,resources:6,alliances:3,formation:3,headquarters:1},
 {members:2000,experts:40,territories:12,treasury:500000,prestige:700,resources:10,alliances:4,formation:4,headquarters:1},
 {members:6000,experts:80,territories:30,treasury:1500000,prestige:850,resources:18,alliances:6,formation:5,headquarters:1},
 {members:15000,experts:150,territories:80,treasury:5000000,prestige:950,resources:30,alliances:10,formation:6,headquarters:1}
]);
function meets(m,r){return Object.entries(r).every(([k,v])=>(Number(m[k])||0)>=v);}
export function playerFactionStage(metrics={}){let stage=0;for(let i=0;i<R.length;i++)if(meets(metrics,R[i]))stage=i;return Object.freeze({index:stage,name:PLAYER_FACTION_STAGES[stage],next:PLAYER_FACTION_STAGES[stage+1]||null,requirements:R[stage+1]||null});}
