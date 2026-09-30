export class FactionRuntime {
  constructor(network, { maxActive = 12, minActive = 5 } = {}) {
    this.network = network; this.maxActive = maxActive; this.minActive = minActive;
    this.currentTerritoryId = null; this.activeFactions = Object.freeze([]); this.activeControllers = null;
  }
  enterTerritory(territoryId, { limit = this.maxActive } = {}) {
    this.currentTerritoryId = territoryId;
    const desired = Math.max(this.minActive, Math.min(this.maxActive, limit));
    this.activeFactions = this.network.getRelevantFactionsForTerritory(territoryId, { limit: desired });
    this.activeControllers = this.network.getTerritoryControllers(territoryId);
    return Object.freeze({ territoryId, activeFactions: this.activeFactions, controllers: this.activeControllers });
  }
  leaveTerritory() { this.currentTerritoryId = null; this.activeFactions = Object.freeze([]); this.activeControllers = null; }
  getActiveFaction(id) { return this.activeFactions.find(f => f.id === id) || null; }
}
