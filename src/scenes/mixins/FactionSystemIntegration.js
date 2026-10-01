import { FactionRuntime } from '../../config/factions/runtime/factionRuntime.js';
import { createFactionRuntimeCoordinator } from '../../config/factions/runtime/FactionRuntimeCoordinator.js';
import { assertFactionBootAssetPolicy } from '../../config/factions/runtime/factionBootGuard.js';
import { attachFactionContextToScene } from '../../config/factions/game/mapRuntimeBridge.js';
import { installFactionUI } from './FactionUI.js?v=20260930-faction-teleport-v30';
import { installFactionSearchUI } from './FactionSearchUI.js?v=20260930-canonical-local-v2';
import { installPlayerFactionUI } from './PlayerFactionUI.js';
import { installWorldMapFactionOverlay } from './WorldMapFactionOverlay.js?v=20261001-fixed-rulers-v2';

export function installFactionSystemIntegration(MainGameScene, { network, worldAdapter, mapAdapter, gameState } = {}) {
  if (!MainGameScene?.prototype || !network || !worldAdapter || !gameState) return null;
  const runtime = new FactionRuntime(network, { maxActive: 12, minActive: 5 });
  const coordinator = createFactionRuntimeCoordinator({ network, worldAdapter, gameState, maxActiveFactions: 60 });
  const p = MainGameScene.prototype;

  if (!p.__factionSystemInstalled) {
    p.__factionSystemInstalled = true;
    p.__factionRuntime = runtime;
    p.__factionCoordinator = coordinator;
    p.getFactionRuntime = () => runtime;
    p.getFactionRuntimeCoordinator = () => coordinator;
    p.reloadFactionState = () => coordinator.reloadFromGameState();

    p.refreshFactionContext = function refreshFactionContext(mapOrIdentifier, worldNode = null) {
      const context = attachFactionContextToScene(this, { network, worldAdapter, mapAdapter, mapOrIdentifier, worldNode, runtime });
      if (context?.territoryId) coordinator.enterTerritory(context.territoryId);
      return context;
    };
    p.refreshFactionContextForWorldNode = function refreshFactionContextForWorldNode(nodeId) {
      this.__factionContext = network.getFactionContextForWorldNode(nodeId);
      const territory = worldAdapter.getTerritoryForWorldNode?.(nodeId);
      if (territory?.id) coordinator.enterTerritory(territory.id);
      return this.__factionContext;
    };
    p.getCurrentFactionContext = function getCurrentFactionContext() { return this.__factionContext || null; };
    p.getCurrentFactionControllers = function getCurrentFactionControllers() { return this.__factionContext?.controllers || null; };
    p.clearFactionContext = function clearFactionContext() { runtime.leaveTerritory(); this.__factionContext = null; };
    p.assertFactionBootAssets = function assertFactionBootAssets() { return assertFactionBootAssetPolicy(this); };

    p.runFactionTick = options => coordinator.pulse(Date.now(), { force: true, ...options });
    p.getFactionDynamicDetail = id => coordinator.materializeFactionSystems(id);
    p.setPlayerAffiliation = (...args) => coordinator.setPlayerAffiliation(...args);
    p.clearPlayerAffiliation = (...args) => coordinator.clearPlayerAffiliation(...args);
    p.updateFactionReputation = (...args) => coordinator.updateFactionReputation(...args);
    p.addFactionMemory = (...args) => coordinator.addFactionMemory(...args);
    p.acceptFactionContract = (...args) => coordinator.acceptFactionContract(...args);
    p.clearFactionContract = (...args) => coordinator.clearFactionContract(...args);
    p.addWantedLevel = (...args) => coordinator.addWantedLevel(...args);
    p.createPlayerFaction = (...args) => coordinator.createPlayerFaction(...args);
    p.negotiatePlayerFaction = (...args) => coordinator.negotiatePlayerFaction(...args);
    p.commitPlayerFactionDiplomacy = (...args) => coordinator.commitPlayerFactionDiplomacy(...args);
    p.getFactionQuestHooks = (...args) => coordinator.getQuestHooks(...args);

    const oldApply = p.applyMapRuntimeConfig;
    if (typeof oldApply === 'function' && !p.__factionWrappedMapApply) {
      p.__factionWrappedMapApply = true;
      p.applyMapRuntimeConfig = function applyMapRuntimeConfigWithFaction(...args) {
        const result = oldApply.apply(this, args);
        this.refreshFactionContext?.(this.currentMap || this.gameState?.currentMapId);
        return result;
      };
    }

    const oldCreate = p.create;
    if (typeof oldCreate === 'function' && !p.__factionWrappedCreate) {
      p.__factionWrappedCreate = true;
      p.create = function createWithFactionCoordinator(...args) {
        const result = oldCreate.apply(this, args);
        coordinator.simulateOffline(Date.now());
        if (!this.__factionTickEvent && this.time?.addEvent) {
          this.__factionTickEvent = this.time.addEvent({
            delay: 120000,
            loop: true,
            callback: () => coordinator.pulse(Date.now())
          });
        }
        return result;
      };
    }
  }

  installFactionUI(MainGameScene, { network, gameState, coordinator });
  installFactionSearchUI(MainGameScene, { network, coordinator });
  installPlayerFactionUI(MainGameScene, { network, gameState, coordinator });
  installWorldMapFactionOverlay(MainGameScene, { network, worldAdapter, coordinator });
  return Object.freeze({ runtime, coordinator });
}
