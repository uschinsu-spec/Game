import { LIFECYCLE_STATES } from '../core/factionConstants.js';

export function nextLifecycleState(current, metrics={}) {
  const {growth=0,stability=.5,treasuryHealth=.5,leaderCrisis=false,vassalized=false,collapsed=false,revival=false}=metrics;
  if(collapsed) return LIFECYCLE_STATES.COLLAPSED;
  if(revival) return LIFECYCLE_STATES.REVIVAL;
  if(vassalized) return LIFECYCLE_STATES.VASSALIZED;
  if(leaderCrisis||stability<.2||treasuryHealth<.15) return LIFECYCLE_STATES.CRISIS;
  if(growth>.7&&stability>.7&&treasuryHealth>.7) return LIFECYCLE_STATES.GOLDEN_AGE;
  if(growth>.25) return LIFECYCLE_STATES.GROWTH;
  if(growth<-.35) return LIFECYCLE_STATES.DECLINE;
  return current===LIFECYCLE_STATES.FOUNDING?LIFECYCLE_STATES.GROWTH:LIFECYCLE_STATES.STABLE;
}
