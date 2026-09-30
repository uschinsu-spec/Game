import { createAffiliations } from '../player/playerAffiliations.js';
import { createFactionWorldState } from '../state/factionWorldState.js';
export const FACTION_GAME_STATE_VERSION=5;
export function createEmptyFactionGameState(){const worldSeed='linh-son-phi-kiem-human-realm-v5-expanded';return {version:FACTION_GAME_STATE_VERSION,worldSeed,affiliations:createAffiliations(),relations:{},memories:{},contracts:[],wanted:{},intel:{},underworld:{heat:0},identity:null,world:createFactionWorldState(worldSeed),history:[],dynamicRelations:[],economyByFaction:[],resourcesByFaction:[],lifecycleByFaction:[],actionCooldowns:[],factionStatuses:[],remnantsByFaction:[],powerVacuumByTerritory:[],diplomacyProposals:[],activeWars:[],activeEvents:[],playerCreatedFactions:[],scheduler:null,lastWorldTick:0,lastPulseAt:0,lastActiveAt:Date.now()};}
export const createInitialFactionGameState=createEmptyFactionGameState;
export function ensureFactionGameState(gameState){if(!gameState.factionState||Number(gameState.factionState.version)!==FACTION_GAME_STATE_VERSION)gameState.factionState=createEmptyFactionGameState();return gameState.factionState;}
