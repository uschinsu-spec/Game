// V5 compatibility surface only. Canonical data lives in config/factions/core/playerSects.js.
import { PLAYER_SECT_CATALOG, PLAYER_SECT_RANKS, getPlayerSectGameplayData } from './factions/core/playerSects.js';
export const SECTS = PLAYER_SECT_CATALOG;
export const SECT_RANKS = PLAYER_SECT_RANKS;
export const getSectById = getPlayerSectGameplayData;
