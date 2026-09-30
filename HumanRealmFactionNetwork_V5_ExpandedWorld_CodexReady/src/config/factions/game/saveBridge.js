import { createEmptyFactionGameState, ensureFactionGameState } from './gameStateBridge.js';
function clone(v){return JSON.parse(JSON.stringify(v));}
export function serializeGameFactionState(gameState){return clone(ensureFactionGameState(gameState));}
export const serializeFactionState=serializeGameFactionState;
export function hydrateFactionState(gameState,saved){gameState.factionState=saved&&typeof saved==='object'&&Number(saved.version)===5?clone(saved):createEmptyFactionGameState();return gameState.factionState;}
