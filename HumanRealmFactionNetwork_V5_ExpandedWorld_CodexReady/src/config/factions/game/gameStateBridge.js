import { createAffiliations } from '../player/playerAffiliations.js';
import { createFactionWorldState } from '../state/factionWorldState.js';
export const FACTION_GAME_STATE_VERSION=5;
export function createEmptyFactionGameState(){return {version:FACTION_GAME_STATE_VERSION,worldSeed:'linh-son-phi-kiem-human-realm-v5',affiliations:createAffiliations(),relations:{},memories:{},contracts:[],wanted:{},intel:{},underworld:{heat:0},world:createFactionWorldState(),playerCreatedFactions:[],scheduler:null,lastWorldTick:0};}
export const createInitialFactionGameState=createEmptyFactionGameState;
export function ensureFactionGameState(gameState){if(!gameState.factionState||Number(gameState.factionState.version)!==FACTION_GAME_STATE_VERSION)gameState.factionState=createEmptyFactionGameState();return gameState.factionState;}
