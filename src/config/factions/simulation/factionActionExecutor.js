const COOLDOWNS = Object.freeze({
  seek_territory: 6, reinforce_assets: 3, recruit: 3, open_trade: 6,
  contest_resource: 6, explore_secret_realm: 12, fund_research: 6,
  build_branch: 12, seek_alliance: 12, break_alliance: 12,
  demand_vassalage: 18, prepare_war: 18, cut_expenses: 3,
  reduce_visibility: 6, hold: 1
});

function relationTarget(network, factionId, activeFactions) {
  return activeFactions.find(f => f.id !== factionId && network.getFaction(f.id)) || null;
}

export function executeFactionAction({ action, faction, cycle, territoryId, activeFactions = [], network, worldState, economyByFaction, resourcesByFaction, diplomacy, history, lifecycleByFaction, actionCooldowns }) {
  if (!action || !faction || !territoryId) return Object.freeze({ ok: false, reason: 'INVALID_ACTION' });
  const status = lifecycleByFaction.get(faction.id);
  if (status === 'COLLAPSED') return Object.freeze({ ok: false, reason: 'COLLAPSED' });
  const availableAt = Number(actionCooldowns.get(faction.id) || 0);
  if (cycle < availableAt) return Object.freeze({ ok: false, reason: 'COOLDOWN', availableAt });
  const type = action.action || 'hold';
  const target = relationTarget(network, faction.id, activeFactions);
  const influence = delta => worldState.addInfluenceDelta(territoryId, faction.id, delta);
  const event = { type: 'ai-action', action: type, factionId: faction.id, territoryId, cycle };
  let effect = null;
  switch (type) {
    case 'seek_territory': effect = influence({ territorial: 3, political: 2 }); break;
    case 'reinforce_assets': effect = influence({ military: 3, infrastructure: 3 }); break;
    case 'recruit': effect = influence({ military: 2, cultivation: 2 }); break;
    case 'open_trade': effect = influence({ economic: 4, infrastructure: 1 }); break;
    case 'contest_resource': effect = influence({ resourceControl: 4, territorial: 1 }); break;
    case 'explore_secret_realm': effect = influence({ cultivation: 3, prestige: 2 }); break;
    case 'fund_research': effect = influence({ intelligence: 3, cultivation: 1 }); break;
    case 'build_branch': network.ensureBranchesForTerritory?.(territoryId); effect = influence({ economic: 2, infrastructure: 3 }); break;
    case 'seek_alliance': if (target) effect = diplomacy.apply(network.getFactionRelation(faction.id, target.id), faction.id, target.id, { trustDelta: 4, respectDelta: 2 }, cycle); break;
    case 'break_alliance': if (target) effect = diplomacy.apply(network.getFactionRelation(faction.id, target.id), faction.id, target.id, { trustDelta: -6, grievanceDelta: 3 }, cycle); break;
    case 'demand_vassalage': if (target) effect = diplomacy.apply(network.getFactionRelation(faction.id, target.id), faction.id, target.id, { fearDelta: 5, grievanceDelta: 2 }, cycle); break;
    case 'prepare_war': if (target) effect = diplomacy.apply(network.getFactionRelation(faction.id, target.id), faction.id, target.id, { fearDelta: 4, grievanceDelta: 4 }, cycle); influence({ military: 2 }); break;
    case 'cut_expenses': {
      const economy = economyByFaction.get(faction.id);
      if (economy) economyByFaction.set(faction.id, Object.freeze({ ...economy, upkeep: Math.max(0, Number(economy.upkeep || 0) - 1) }));
      effect = 'economy';
      break;
    }
    case 'reduce_visibility': effect = influence({ intelligence: 1, underworld: 1 }); break;
    default: effect = 'hold';
  }
  actionCooldowns.set(faction.id, cycle + (COOLDOWNS[type] || COOLDOWNS.hold));
  history.add({ ...event, effect: typeof effect === 'string' ? effect : type });
  network.invalidateDynamicTerritory?.(territoryId);
  return Object.freeze({ ok: true, ...event, effect });
}
