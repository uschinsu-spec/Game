import { createWorldTickScheduler } from '../simulation/factionWorldTick.js';
import { decideFactionAction } from '../simulation/factionAI.js';
import { chooseFactionGoals } from '../simulation/factionGoals.js';
import { nextLifecycleState } from '../simulation/factionLifecycle.js';
import { evaluateFactionEvents, applyFactionEvent } from '../simulation/factionEvents.js';
import { simulateOffline } from '../simulation/factionOfflineSimulation.js';
import { executeFactionAction } from '../simulation/factionActionExecutor.js';
import { createWar, calculateWarScore, resolveWarOutcome, applyWarResolution } from '../simulation/factionWar.js';
import { createSiegeTarget, siegeDefenseScore, applySiegeAction } from '../simulation/factionSiege.js';
import { resolvePowerVacuum } from '../simulation/factionPowerVacuum.js';
import { resolveSuccession } from '../simulation/factionSuccession.js';
import { splitFaction, mergeFactions, reviveFaction } from '../simulation/factionEvolution.js';
import { createFactionRemnants, remnantQuestHooks } from '../simulation/factionRemnants.js';

import { createEconomy, tickEconomy } from '../network/factionEconomy.js';
import { createResourceStock, resourceDelta } from '../network/factionResources.js';
import { buildHumanRealmTradeNetwork } from '../network/humanRealmTradeNetwork.js';
import { createTradeRoute, effectiveRouteCapacity } from '../network/tradeNetwork.js';
import { createSupplyChain, supplyMultiplier } from '../network/factionSupplyChain.js';
import { marketModifier } from '../network/factionMarketRules.js';
import { FactionDiplomacyState } from '../network/factionDiplomacyState.js';
import { createMarriageAlliance } from '../network/factionMarriage.js';
import { createInternalBloc, blocTension } from '../network/factionInternalPolitics.js';
import { powerFromFaction } from '../network/factionPower.js';
import { createFactionAsset } from '../network/factionAssets.js';
import { createPopulation } from '../network/factionPopulation.js';
import { createCultivatorDistribution } from '../network/factionCultivators.js';
import { factionIntelView, purchaseIntel } from '../network/intelligenceServices.js';

import { buildJurisdictionSummary } from '../hierarchy/jurisdictionSummary.js';
import { buildSimulationBubble } from './factionSimulationBubble.js';
import { BoundedFactionCache } from './factionCache.js';
import { factionAppearanceDescriptor } from './factionAppearance.js';
import { emblemDescriptor } from './factionEmblems.js';

import { createPlayerFaction as buildPlayerFaction } from '../player_created/playerCreatedFactions.js';
import { playerFactionStage } from '../player_created/playerFactionProgression.js';
import { createRecruitCandidate, recruitmentScore } from '../player_created/playerFactionRecruitment.js';
import { canPlayerFactionNegotiate, proposePlayerFactionRelation, declarePlayerFactionWar } from '../player_created/playerFactionDiplomacy.js';

import { createPlayerFactionRelation, updatePlayerFactionRelation } from '../player/playerFactionRelations.js';
import { createFactionMemory, memoryImpact } from '../player/factionMemory.js';
import { setAffiliation } from '../player/playerAffiliations.js';
import { createFactionContract, isContractExpired } from '../player/factionContracts.js';
import { createWantedState, addWanted } from '../player/playerWantedState.js';
import { createIdentityState, canFactionPierceDisguise } from '../player/playerIdentity.js';
import { createUnderworldState, updateUnderworldHeat } from '../player/playerUnderworldState.js';
import { createLawProfile } from '../player/factionLaw.js';
import { SECT_RANKS_EXTENDED, FAMILY_RANKS, DYNASTY_RANKS, MERCHANT_RANKS } from '../player/factionRanks.js';

import { questHooksFromFaction } from '../quests/factionQuestGenerator.js';
import { createFactionWorldState } from '../state/factionWorldState.js';
import { FactionHistoryLog } from '../state/factionHistory.js';
import { serializeFactionState } from '../state/factionSaveState.js';
import { ensureFactionGameState } from '../game/gameStateBridge.js';
import * as FactionV5Modules from '../index.js';

const SHORT_TICK_MS = 120000;
const MAX_OFFLINE_CYCLES = 2160;
const STATE_BINDINGS = new WeakMap();

function observeFactionState(gameState, listener) {
  let binding = STATE_BINDINGS.get(gameState);
  if (!binding) {
    binding = { value: gameState.factionState, listeners: new Set() };
    const descriptor = Object.getOwnPropertyDescriptor(gameState, 'factionState');
    if (!descriptor || descriptor.configurable) {
      Object.defineProperty(gameState, 'factionState', {
        configurable: true, enumerable: true,
        get: () => binding.value,
        set: next => {
          if (next === binding.value) return;
          binding.value = next;
          for (const notify of binding.listeners) notify(next);
        }
      });
    }
    STATE_BINDINGS.set(gameState, binding);
  }
  binding.listeners.add(listener);
}

function asEntries(value) {
  if (value instanceof Map) return [...value.entries()];
  if (Array.isArray(value)) return value;
  return Object.entries(value || {});
}

function restoreWorldState(saved, seed) {
  if (saved?.overrides instanceof Map) return saved;
  const world = createFactionWorldState(seed);
  for (const [key, value] of asEntries(saved?.overrides || saved?.factionDynamicOverrides)) world.overrides.set(key, value);
  for (const [key, value] of asEntries(saved?.influenceDeltas)) world.influenceDeltas.set(key, value);
  for (const [key, value] of asEntries(saved?.dynamicRelations)) world.dynamicRelations.set(key, value);
  world.events = [...(saved?.events || saved?.majorEvents || [])].slice(-200);
  return world;
}

export class FactionRuntimeCoordinator {
  constructor({ network, worldAdapter, gameState, maxActiveFactions = 60 } = {}) {
    if (!network || !worldAdapter || !gameState) throw new Error('[FACTION V5] coordinator dependencies missing');
    this.network = network;
    this.worldAdapter = worldAdapter;
    this.gameState = gameState;
    this.detailCache = new BoundedFactionCache(64);
    this.goalsByFaction = new Map();
    this.marketByFaction = new Map();
    this.tradeRoutes = null;
    this.currentTerritoryId = null;
    this.bubble = Object.freeze({ territories: Object.freeze([]), factionIds: Object.freeze([]) });
    this.maxActiveFactions = maxActiveFactions;
    this.boundPlayerFactionIds = new Set();
    this.rebindState(ensureFactionGameState(gameState));
    observeFactionState(gameState, next => this.rebindState(next));
    this.activeModuleSurface = Object.freeze(Object.keys(FactionV5Modules));
  }

  rebindState(nextState = ensureFactionGameState(this.gameState)) {
    const previousPlayerIds = this.boundPlayerFactionIds || new Set();
    this.state = nextState;
    this.state.world = restoreWorldState(this.state.world, this.state.worldSeed || this.network.worldSeed);
    this.history = new FactionHistoryLog(200);
    for (const entry of this.state.history || []) this.history.add(entry);
    this.diplomacy = new FactionDiplomacyState(this.state.dynamicRelations || []);
    this.scheduler = createWorldTickScheduler({ startCycle: Number(this.state.lastWorldTick || 0) });
    this.economyByFaction = new Map(asEntries(this.state.economyByFaction));
    this.resourcesByFaction = new Map(asEntries(this.state.resourcesByFaction));
    this.lifecycleByFaction = new Map(asEntries(this.state.lifecycleByFaction));
    this.actionCooldowns = new Map(asEntries(this.state.actionCooldowns));
    this.factionStatuses = new Map(asEntries(this.state.factionStatuses));
    this.remnantsByFaction = new Map(asEntries(this.state.remnantsByFaction));
    this.powerVacuumByTerritory = new Map(asEntries(this.state.powerVacuumByTerritory));
    this.activeWars = [...(this.state.activeWars || [])];
    this.activeEvents = [...(this.state.activeEvents || [])];
    this.cycle = Number(this.state.lastWorldTick || 0);
    this.lastPulseAt = Number(this.state.lastPulseAt || Date.now());
    const nextPlayerIds = new Set((this.state.playerCreatedFactions || []).map(f => f.id));
    for (const id of previousPlayerIds) if (!nextPlayerIds.has(id)) this.network.unregisterDynamicFaction?.(id);
    for (const faction of this.state.playerCreatedFactions || []) this.network.registerDynamicFaction?.(faction);
    this.boundPlayerFactionIds = nextPlayerIds;
    this.network.setDynamicWorldState?.(this.state.world);
    this.detailCache.clear();
    return this.state;
  }

  reloadFromGameState() { return this.rebindState(ensureFactionGameState(this.gameState)); }
  _ensureBoundState() { const latest = ensureFactionGameState(this.gameState); if (latest !== this.state) this.rebindState(latest); return this.state; }

  getPlayerRelatedFactionIds() {
    const ids = new Set();
    for (const membership of Object.values(this.state.affiliations || {})) if (membership?.factionId) ids.add(membership.factionId);
    for (const id of Object.keys(this.state.relations || {})) ids.add(id);
    for (const faction of this.state.playerCreatedFactions || []) ids.add(faction.id);
    return [...ids];
  }

  enterTerritory(territoryId) {
    this._ensureBoundState();
    if (!territoryId) return null;
    this.currentTerritoryId = territoryId;
    this.network.ensureBranchesForTerritory?.(territoryId);
    this.network.ensureVassalsForTerritory?.(territoryId);
    const neighbors = (this.worldAdapter.getNeighbors?.(territoryId) || []).map(item => item?.id || item).filter(Boolean);
    this.bubble = buildSimulationBubble({
      currentTerritoryId: territoryId,
      neighborTerritoryIds: neighbors,
      playerRelatedFactionIds: this.getPlayerRelatedFactionIds(),
      territoryFactionProvider: id => this.network.getRelevantFactionsForTerritory(id, { limit: 12 }),
      maxTerritories: 5,
      maxFactions: this.maxActiveFactions
    });
    const context = this.network.getJurisdictionFactionContext(territoryId);
    this.currentSummary = context ? buildJurisdictionSummary(context.jurisdiction, context) : null;
    return Object.freeze({ territoryId, bubble: this.bubble, summary: this.currentSummary });
  }

  getActiveFactions() {
    return this.bubble.factionIds.map(id => this.network.getFaction(id)).filter(Boolean);
  }

  getActiveModuleSurface() { return this.activeModuleSurface; }

  materializeFactionSystems(factionId) {
    this._ensureBoundState();
    const cached = this.detailCache.get(factionId);
    if (cached) return cached;
    const faction = this.network.getFaction(factionId);
    if (!faction) return null;
    const detail = Object.freeze({
      faction,
      power: powerFromFaction(faction),
      population: createPopulation(faction.population || {}),
      cultivators: createCultivatorDistribution(faction.cultivators || {}),
      economy: this._economyFor(faction),
      resources: this._resourcesFor(faction),
      law: createLawProfile(faction.law || {}),
      appearance: factionAppearanceDescriptor(faction),
      emblem: emblemDescriptor(faction),
      internalBloc: createInternalBloc({ id: `bloc.${faction.id}.core`, name: 'Core', influence: 60, loyalty: 70 }),
      sampleAsset: createFactionAsset({ factionId: faction.id, type: 'sectMountain', worldNodeId: faction.homeTerritoryId || this.currentTerritoryId }),
      ranks: faction.archetype === 'DYNASTY' ? DYNASTY_RANKS : faction.archetype === 'MERCHANT_GUILD' ? MERCHANT_RANKS : faction.archetype?.includes?.('FAMILY') ? FAMILY_RANKS : SECT_RANKS_EXTENDED
    });
    return this.detailCache.set(factionId, detail);
  }

  _economyFor(faction) {
    if (!this.economyByFaction.has(faction.id)) this.economyByFaction.set(faction.id, createEconomy(faction.economy || faction.baseEconomy || {}));
    return this.economyByFaction.get(faction.id);
  }

  _resourcesFor(faction) {
    if (!this.resourcesByFaction.has(faction.id)) this.resourcesByFaction.set(faction.id, createResourceStock(faction.resources || {}));
    return this.resourcesByFaction.get(faction.id);
  }

  pulse(now = Date.now(), { force = false } = {}) {
    this._ensureBoundState();
    if (!force && now - this.lastPulseAt < SHORT_TICK_MS) return null;
    const steps = force ? 1 : Math.max(1, Math.min(6, Math.floor((now - this.lastPulseAt) / SHORT_TICK_MS)));
    let result = null;
    for (let i = 0; i < steps; i += 1) result = this.runCycle();
    this.lastPulseAt = now;
    this.syncToGameState();
    return result;
  }

  runCycle() {
    this.cycle += 1;
    const due = this.scheduler.consumeDue(this.cycle);
    const result = { cycle: this.cycle, due, short: this.runShortTick() };
    if (due.includes('daily')) result.economy = this.runEconomyTick();
    if (due.includes('monthly')) result.diplomacy = this.runDiplomacyTick();
    if (due.includes('seasonal') || due.includes('yearly')) result.major = this.runMajorWorldTick();
    this.state.lastWorldTick = this.cycle;
    return Object.freeze(result);
  }

  runShortTick() {
    const factions = this.getActiveFactions().filter(f => this.factionStatuses.get(f.id) !== 'COLLAPSED').slice(0, this.maxActiveFactions);
    const actions = [];
    for (const faction of factions) {
      const economy = this._economyFor(faction);
      const goals = chooseFactionGoals({ dna: faction.dna || {}, economy, power: powerFromFaction(faction) });
      this.goalsByFaction.set(faction.id, goals);
      const action = Object.freeze({ factionId: faction.id, ...decideFactionAction({ dna: faction.dna || {}, economy, power: powerFromFaction(faction) }) });
      const execution = executeFactionAction({ action, faction, cycle: this.cycle, territoryId: this.currentTerritoryId, activeFactions: factions, network: this.network, worldState: this.state.world, economyByFaction: this.economyByFaction, resourcesByFaction: this.resourcesByFaction, diplomacy: this.diplomacy, history: this.history, lifecycleByFaction: this.factionStatuses, actionCooldowns: this.actionCooldowns });
      actions.push(Object.freeze({ ...action, execution }));
    }
    const events = evaluateFactionEvents({ cycle: this.cycle, factions, economyByFaction: this.economyByFaction, lifecycleByFaction: this.lifecycleByFaction, territoryId: this.currentTerritoryId, maxEvents: 3 });
    for (const event of events) this.applyEvent(event);
    return Object.freeze({ factionCount: factions.length, actions: Object.freeze(actions), events });
  }

  runEconomyTick() {
    if (!this.tradeRoutes) this.tradeRoutes = buildHumanRealmTradeNetwork(this.worldAdapter, { worldSeed: this.network.worldSeed });
    const output = [];
    for (const faction of this.getActiveFactions().slice(0, this.maxActiveFactions)) {
      const route = this.tradeRoutes.find(r => r.origin === this.currentTerritoryId || r.destination === this.currentTerritoryId);
      const capacity = route ? effectiveRouteCapacity(route) : 1;
      const chain = createSupplyChain({ id: `supply.${faction.id}`, inputResource: 'spirit_stone', outputResource: 'market_goods', marketTerritoryIds: [this.currentTerritoryId], efficiency: .8 });
      const supply = supplyMultiplier({ production: chain.efficiency, routeCapacity: Math.max(.25, capacity / 100), warDisruption: this.activeWars.length ? .2 : 0 });
      const next = tickEconomy(this._economyFor(faction), { incomeMul: .9 + supply * .2, expenseMul: this.activeWars.some(w => w.participants.includes(faction.id)) ? 1.2 : 1 });
      this.economyByFaction.set(faction.id, next);
      this.resourcesByFaction.set(faction.id, resourceDelta(this._resourcesFor(faction), { spiritStone: Math.round((supply - .5) * 10) }));
      const market = marketModifier({ supply, war: this.activeWars.some(w => w.participants.includes(faction.id)), economicInfluence: faction.basePower?.economic || 0 });
      this.marketByFaction.set(faction.id, market);
      output.push(Object.freeze({ factionId: faction.id, economy: next, supply, market }));
    }
    return Object.freeze(output);
  }

  runDiplomacyTick() {
    this.diplomacy.decay(this.cycle);
    const factions = this.getActiveFactions();
    if (factions.length > 1) {
      const a = factions[0], b = factions[1];
      const base = this.network.getFactionRelation(a.id, b.id);
      const trade = (this.marketByFaction.get(a.id)?.availabilityMul || 1) > .8;
      this.diplomacy.apply(base, a.id, b.id, { trustDelta: trade ? 1 : -1, economicDependencyDelta: trade ? 1 : 0 }, this.cycle);
    }
    return Object.freeze(this.diplomacy.toJSON());
  }

  runMajorWorldTick() {
    const changes = [];
    for (const faction of this.getActiveFactions().slice(0, this.maxActiveFactions)) {
      const economy = this._economyFor(faction);
      const current = this.lifecycleByFaction.get(faction.id) || 'STABLE';
      const next = nextLifecycleState(current, { treasuryHealth: economy.debt > economy.treasury ? .1 : .7, stability: .6, growth: economy.income >= economy.upkeep ? .3 : -.2 });
      this.lifecycleByFaction.set(faction.id, next);
      if (next !== current) {
        const entry = { type: 'lifecycle', factionId: faction.id, from: current, to: next, cycle: this.cycle };
        this.history.add(entry); changes.push(entry);
      }
    }
    return Object.freeze(changes);
  }

  applyEvent(event) {
    this.activeEvents.push(event);
    if (this.activeEvents.length > 100) this.activeEvents.splice(0, this.activeEvents.length - 100);
    this.state.world.pushEvent(event);
    applyFactionEvent(event, {
      influence: effect => this.state.world.addInfluenceDelta(event.territoryId, effect.factionId, { [effect.dimension || 'political']: effect.delta }),
      economy: effect => { const faction = this.network.getFaction(effect.factionId); if (!faction) return null; const econ = this._economyFor(faction); const next = createEconomy({ ...econ, [effect.field]: Number(econ[effect.field] || 0) + Number(effect.delta || 0) }); this.economyByFaction.set(faction.id, next); return next; },
      power: effect => this.state.world.setOverride('faction', effect.factionId, `power.${effect.dimension}`, effect.delta, { cycle: this.cycle }),
      history: value => this.history.add({ type: 'event', factionId: value.participants?.[0] || null, participants: value.participants, eventType: value.type, territoryId: value.territoryId, cycle: this.cycle })
    });
    this.network.invalidateDynamicTerritory?.(event.territoryId);
    return event;
  }

  startWar(factionA, factionB, options = {}) {
    if (!factionA || !factionB || factionA === factionB) throw new Error('[FACTION V5] invalid war participants');
    const war = createWar({ participants: [factionA, factionB], startCycle: this.cycle, ...options });
    this.activeWars.push(war);
    this.history.add({ type: 'war', participants: war.participants, warId: war.id, cycle: this.cycle });
    return war;
  }

  updateWar(warId, inputs = {}) {
    const war = this.activeWars.find(w => w.id === warId);
    if (!war) return null;
    const scoreA = calculateWarScore(inputs.a || {}), scoreB = calculateWarScore(inputs.b || {});
    return Object.freeze({ war, scoreA, scoreB });
  }

  resolveWar(warId, inputs = {}) {
    const index = this.activeWars.findIndex(w => w.id === warId);
    if (index < 0) return null;
    const war = this.activeWars[index];
    const resolution = resolveWarOutcome(war, inputs);
    applyWarResolution(resolution, {
      vassalize: term => this.network.vassals.push(Object.freeze({ ...term, type: 'VASSAL', sinceCycle: this.cycle })),
      territoryTransfer: term => this.state.world.setOverride('territory', term.territoryId, 'politicalController', term.toFactionId, { cycle: this.cycle }),
      tribute: term => this.state.world.setOverride('war', war.id, 'tribute', term.rate, { cycle: this.cycle }),
      diplomacy: value => this.history.add({ type: 'peace', participants: war.participants, resolution: value.type, cycle: this.cycle }),
      history: () => {}
    });
    this.network.invalidateDynamicTerritory?.();
    this.activeWars.splice(index, 1);
    return resolution;
  }

  createSiege(input) { const target = createSiegeTarget(input); return Object.freeze({ target, defenseScore: siegeDefenseScore(target) }); }
  applySiege(target, action) { const next = applySiegeAction(target, action); return Object.freeze({ target: next, defenseScore: siegeDefenseScore(next) }); }

  collapseFaction(factionId, territoryId = this.currentTerritoryId) {
    const faction = this.network.getFaction(factionId); if (!faction) return null;
    const remnant = createFactionRemnants(faction, { cycle: this.cycle, lastTerritoryId: territoryId });
    const contenders = this.network.getRelevantFactionsForTerritory(territoryId, { limit: 6 }).map(f => f.id).filter(id => id !== factionId);
    const vacuum = resolvePowerVacuum({ territoryId, candidates: contenders });
    this.factionStatuses.set(factionId, 'COLLAPSED');
    this.lifecycleByFaction.set(factionId, 'COLLAPSED');
    this.remnantsByFaction.set(factionId, remnant);
    this.powerVacuumByTerritory.set(territoryId, vacuum);
    this.state.world.setOverride('faction', factionId, 'status', 'COLLAPSED', { cycle: this.cycle });
    this.state.world.setOverride('territory', territoryId, 'powerVacuum', true, { cycle: this.cycle });
    this.state.world.addInfluenceDelta(territoryId, factionId, { political: -100, cultivation: -100, economic: -100, military: -100, intelligence: -100, territorial: -100 });
    for (const contenderId of contenders.slice(0, 3)) this.state.world.addInfluenceDelta(territoryId, contenderId, { political: 6, territorial: 4 });
    for (const branch of this.network.getFactionBranches?.(factionId) || []) this.state.world.setOverride('branch', branch.id, 'status', 'abandoned', { cycle: this.cycle });
    for (const vassal of this.network.getFactionVassals?.(factionId) || []) this.state.world.setOverride('vassal', vassal.vassalId, 'status', 'independent', { cycle: this.cycle });
    this.network.invalidateDynamicTerritory?.(territoryId);
    const result = Object.freeze({ remnant, vacuum, questHooks: remnantQuestHooks(remnant) });
    this.history.add({ type: 'collapse', factionId, territoryId, cycle: this.cycle });
    return result;
  }

  resolveSuccession(input) { return resolveSuccession(input); }
  splitFaction(parent, options) { const change = splitFaction(parent, { ...options, cycle: this.cycle }); this.history.add(change); return change; }
  mergeFactions(ids, newId, options) { const change = mergeFactions(ids, newId, { ...options, cycle: this.cycle }); this.history.add(change); return change; }
  reviveFaction(id, options) { const change = reviveFaction(id, { ...options, cycle: this.cycle }); this.factionStatuses.set(id, 'REVIVED'); this.lifecycleByFaction.set(id, 'STABLE'); this.state.world.setOverride('faction', id, 'status', 'REVIVED', { cycle: this.cycle }); this.history.add(change); return change; }

  setPlayerAffiliation(slot, factionId, membership = {}) {
    const faction = this.network.getFaction(factionId);
    if (!faction) throw new Error(`[FACTION V5] unknown faction ${factionId}`);
    this.state.affiliations = setAffiliation(this.state.affiliations, slot, { ...membership, factionId, faction }, { relationProvider: (a, b) => this.network.getFactionRelation(a, b) });
    return this.state.affiliations;
  }

  clearPlayerAffiliation(slot) { this.state.affiliations = setAffiliation(this.state.affiliations, slot, null); return this.state.affiliations; }

  updateFactionReputation(factionId, delta = {}) {
    const current = this.state.relations[factionId] || createPlayerFactionRelation(factionId);
    const next = updatePlayerFactionRelation(current, delta);
    this.state.relations = { ...this.state.relations, [factionId]: next };
    return next;
  }

  addFactionMemory(factionId, type, input = {}) {
    const memory = createFactionMemory({ factionId, type, cycle: this.cycle, ...input });
    const list = [...(this.state.memories[factionId] || []), memory].slice(-50);
    this.state.memories = { ...this.state.memories, [factionId]: list };
    this.updateFactionReputation(factionId, memoryImpact([memory]));
    return memory;
  }

  acceptFactionContract(input) { const contract = createFactionContract({ startCycle: this.cycle, ...input }); this.state.contracts = [...this.state.contracts, contract].slice(-50); return contract; }
  clearFactionContract(id) { this.state.contracts = this.state.contracts.filter(c => c.id !== id); return this.state.contracts; }
  expireContracts() { this.state.contracts = this.state.contracts.map(c => isContractExpired(c, this.cycle) ? Object.freeze({ ...c, status: 'expired' }) : c); return this.state.contracts; }
  addWantedLevel(scope, id, amount = 1) { this.state.wanted = addWanted(createWantedState(this.state.wanted), scope, id, amount); return this.state.wanted; }
  updateUnderworldHeat(delta) { this.state.underworld = updateUnderworldHeat(createUnderworldState(this.state.underworld), delta); return this.state.underworld; }
  setPlayerIdentity(input) { this.state.identity = createIdentityState(input); return this.state.identity; }
  canPiercePlayerDisguise(score) { return canFactionPierceDisguise(createIdentityState(this.state.identity), score); }

  buyIntelligence(input) {
    const faction = this.network.getFaction(input.factionId); if (!faction) return Object.freeze({ ok: false, reason: 'UNKNOWN_FACTION' });
    const result = purchaseIntel({ ...input, faction });
    if (result.ok) this.state.intel = { ...this.state.intel, [faction.id]: result.newIntelLevel };
    return result;
  }
  getFactionIntel(factionId) { const faction = this.network.getFaction(factionId); return factionIntelView(faction, this.state.intel[factionId] || 0, { history: this.history.forFaction(factionId), relations: this.diplomacy.toJSON().filter(r => r.a === factionId || r.b === factionId), assets: this.network.getFactionAssets?.(factionId) || [], branches: this.network.getFactionBranches?.(factionId) || [], status: this.factionStatuses.get(factionId) || 'STABLE' }); }

  createPlayerFaction(input) {
    this._ensureBoundState();
    const faction = buildPlayerFaction(input);
    this.network.registerDynamicFaction?.(faction);
    this.state.playerCreatedFactions = [...this.state.playerCreatedFactions.filter(f => f.id !== faction.id), faction];
    this.boundPlayerFactionIds.add(faction.id);
    this.history.add({ type: 'founding', factionId: faction.id, cycle: this.cycle });
    return faction;
  }
  getPlayerFactionStage(factionId, metrics = {}) { return playerFactionStage({ ...(this.network.getFaction(factionId)?.meta?.metrics || {}), ...metrics }); }
  evaluateRecruitment(input, offer) { const candidate = createRecruitCandidate(input); return Object.freeze({ candidate, score: recruitmentScore(candidate, offer) }); }
  negotiatePlayerFaction(playerFactionId, targetFactionId, action = 'alliance', relationType = 'ALLIED') { const a = this.network.getFaction(playerFactionId), b = this.network.getFaction(targetFactionId); const check = canPlayerFactionNegotiate(a, b, action); return check.ok ? Object.freeze({ ...check, proposalId: `proposal.${this.cycle}.${playerFactionId}.${targetFactionId}.${action}`, relation: proposePlayerFactionRelation(a, b, relationType), action }) : check; }
  commitPlayerFactionDiplomacy(proposal, { accepted = true, reason = null } = {}) {
    const relation = proposal?.relation;
    if (!relation || !this.network.getFaction(relation.a) || !this.network.getFaction(relation.b)) return Object.freeze({ ok: false, reason: 'UNKNOWN_FACTION' });
    if (!accepted) { const rejected = Object.freeze({ ok: false, rejected: true, reason: reason || 'REJECTED', cooldownUntil: this.cycle + 24 }); this.state.diplomacyProposals = [...(this.state.diplomacyProposals || []), { ...proposal, ...rejected }].slice(-50); return rejected; }
    const committed = this.diplomacy.apply(relation, relation.a, relation.b, {}, this.cycle);
    this.state.diplomacyProposals = [...(this.state.diplomacyProposals || []), { ...proposal, accepted: true, committedCycle: this.cycle }].slice(-50);
    this.history.add({ type: 'player-diplomacy', proposalId: proposal.proposalId, participants: [relation.a, relation.b], relationType: relation.type, cycle: this.cycle });
    this.syncToGameState();
    return Object.freeze({ ok: true, relation: committed });
  }
  declarePlayerWar(playerFactionId, targetFactionId, options) { const war = declarePlayerFactionWar(this.network.getFaction(playerFactionId), this.network.getFaction(targetFactionId), { cycle: this.cycle, ...options }); this.activeWars.push(war); return war; }

  getQuestHooks(factionId, event = null) { const faction = this.network.getFaction(factionId); return questHooksFromFaction({ faction, territoryId: this.currentTerritoryId, event, assets: this.network.getFactionAssets(factionId) }); }
  createTradeRoute(input) { return createTradeRoute(input); }
  createMarriage(input) { return createMarriageAlliance(input); }
  getBlocTension(blocs) { return blocTension(blocs); }

  simulateOffline(now = Date.now()) {
    this._ensureBoundState();
    const elapsed = Math.max(0, Math.min(MAX_OFFLINE_CYCLES, Math.floor((now - Number(this.state.lastActiveAt || now)) / SHORT_TICK_MS)));
    const startCycle = this.cycle;
    const result = simulateOffline({ elapsedCycles: elapsed, maxMajorEvents: 8, aggregateTick: ({ to }) => {
      this.cycle = startCycle + to;
      const due = this.scheduler.consumeDue(this.cycle);
      const short = this.runShortTick();
      if (due.includes('daily')) this.runEconomyTick();
      if (due.includes('monthly')) this.runDiplomacyTick();
      if (due.includes('seasonal') || due.includes('yearly')) this.runMajorWorldTick();
      this.state.lastWorldTick = this.cycle;
      return { events: short.events };
    } });
    this.state.lastActiveAt = now;
    this.syncToGameState();
    return result;
  }

  syncToGameState() {
    this._ensureBoundState();
    this.state.world = this.state.world;
    this.state.history = this.history.compact();
    this.state.dynamicRelations = this.diplomacy.toJSON();
    this.state.economyByFaction = [...this.economyByFaction.entries()];
    this.state.resourcesByFaction = [...this.resourcesByFaction.entries()];
    this.state.lifecycleByFaction = [...this.lifecycleByFaction.entries()];
    this.state.actionCooldowns = [...this.actionCooldowns.entries()];
    this.state.factionStatuses = [...this.factionStatuses.entries()];
    this.state.remnantsByFaction = [...this.remnantsByFaction.entries()];
    this.state.powerVacuumByTerritory = [...this.powerVacuumByTerritory.entries()];
    this.state.activeWars = [...this.activeWars];
    this.state.activeEvents = [...this.activeEvents];
    this.state.scheduler = this.scheduler.toJSON();
    this.state.lastWorldTick = this.cycle;
    this.state.lastPulseAt = this.lastPulseAt;
    this.state.lastActiveAt = Date.now();
    this.gameState.factionState = this.state;
    return serializeFactionState({
      worldSeed: this.state.worldSeed,
      worldState: this.state.world,
      playerRelations: this.state.relations,
      affiliations: this.state.affiliations,
      contracts: this.state.contracts,
      wantedState: this.state.wanted,
      history: this.state.history,
      createdFactions: this.state.playerCreatedFactions
    });
  }
}

export function createFactionRuntimeCoordinator(options) { return new FactionRuntimeCoordinator(options); }
