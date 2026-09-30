import { createEmptyFactionGameState, ensureFactionGameState } from './gameStateBridge.js';
import { createFactionWorldState } from '../state/factionWorldState.js';

function clone(value) { return value === undefined ? undefined : JSON.parse(JSON.stringify(value)); }
const entries = value => value instanceof Map ? [...value.entries()] : Array.isArray(value) ? value : Object.entries(value || {});

function serializeWorld(world) {
  return {
    factionDynamicOverrides: entries(world?.overrides),
    influenceDeltas: entries(world?.influenceDeltas),
    dynamicRelations: entries(world?.dynamicRelations),
    majorEvents: clone(world?.events || [])
  };
}

function hydrateWorld(saved, seed) {
  const world = createFactionWorldState(seed);
  for (const [key, value] of entries(saved?.factionDynamicOverrides || saved?.overrides)) world.overrides.set(key, value);
  for (const [key, value] of entries(saved?.influenceDeltas)) world.influenceDeltas.set(key, value);
  for (const [key, value] of entries(saved?.dynamicRelations)) world.dynamicRelations.set(key, value);
  world.events = clone(saved?.majorEvents || saved?.events || []).slice(-200);
  return world;
}

export function serializeGameFactionState(gameState) {
  const state = ensureFactionGameState(gameState);
  return clone({
    version: 5, worldSeed: state.worldSeed,
    affiliations: state.affiliations, relations: state.relations, memories: state.memories,
    contracts: state.contracts, wanted: state.wanted, intel: state.intel,
    underworld: state.underworld, identity: state.identity,
    world: serializeWorld(state.world), history: (state.history || []).slice(-200),
    dynamicRelations: state.dynamicRelations || [], economyByFaction: state.economyByFaction || [],
    resourcesByFaction: state.resourcesByFaction || [], lifecycleByFaction: state.lifecycleByFaction || [],
    activeWars: state.activeWars || [], activeEvents: (state.activeEvents || []).slice(-100),
    playerCreatedFactions: state.playerCreatedFactions || [], scheduler: state.scheduler,
    lastWorldTick: state.lastWorldTick || 0, lastPulseAt: state.lastPulseAt || 0,
    lastActiveAt: state.lastActiveAt || Date.now()
  });
}

export const serializeFactionState = serializeGameFactionState;

export function hydrateFactionState(gameState, saved) {
  if (!saved || typeof saved !== 'object' || Number(saved.version) !== 5) {
    gameState.factionState = createEmptyFactionGameState();
    return gameState.factionState;
  }
  const state = { ...createEmptyFactionGameState(), ...clone(saved) };
  state.world = hydrateWorld(saved.world, state.worldSeed);
  state.history = [...(saved.history || [])].slice(-200);
  state.activeEvents = [...(saved.activeEvents || [])].slice(-100);
  gameState.factionState = state;
  return state;
}
