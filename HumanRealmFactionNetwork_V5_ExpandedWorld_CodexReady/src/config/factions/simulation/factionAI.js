import { chooseFactionGoals } from './factionGoals.js';

export function decideFactionAction(context={}){
  const goals=chooseFactionGoals(context);
  const primary=goals.primary;
  const map={Expand:'seek_territory',Defend:'reinforce_assets',Recruit:'recruit',Trade:'open_trade',AcquireResource:'contest_resource',AcquireSecretRealm:'explore_secret_realm',Research:'fund_research',BuildBranch:'build_branch',FormAlliance:'seek_alliance',BreakAlliance:'break_alliance',Subjugate:'demand_vassalage',War:'prepare_war',Recover:'cut_expenses',Hide:'reduce_visibility'};
  return Object.freeze({goal:primary,action:map[primary]||'hold',secondaryGoals:goals.secondary});
}
