import { GOAL_TYPES } from '../core/factionConstants.js';

export function chooseFactionGoals({ dna={}, economy={}, power={}, threats=0, shortages=0 }={}) {
  const scores = new Map(Object.values(GOAL_TYPES).map(g=>[g,0]));
  scores.set(GOAL_TYPES.EXPAND,(dna.expansionism||0)*100 + (power.strategicPower||0)*.3);
  scores.set(GOAL_TYPES.DEFEND,threats*100 + (1-(dna.riskTolerance||.5))*30);
  scores.set(GOAL_TYPES.TRADE,(economy.debt||0)>0?80:30);
  scores.set(GOAL_TYPES.ACQUIRE_RESOURCE,shortages*100);
  scores.set(GOAL_TYPES.RECOVER,(economy.debt||0)>0?70:10);
  scores.set(GOAL_TYPES.HIDE,(dna.secrecy||0)*70);
  scores.set(GOAL_TYPES.RESEARCH,(dna.researchPriority?.length||0)*20+20);
  scores.set(GOAL_TYPES.FORM_ALLIANCE,threats*60+(dna.diplomacyStyle==='pragmatic'?30:0));
  scores.set(GOAL_TYPES.RECRUIT,40+(dna.loyaltyCulture||0)*20);
  const ranked=[...scores.entries()].sort((a,b)=>b[1]-a[1]).map(([goal])=>goal);
  return Object.freeze({primary:ranked[0],secondary:Object.freeze(ranked.slice(1,3))});
}
