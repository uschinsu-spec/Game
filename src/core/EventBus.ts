import Phaser from 'phaser';

/**
 * Event names constants for decoupled communication
 */
export const GameEvents = {
  PLAYER_STATS_CHANGED: 'player:stats_changed',
  PLAYER_STATE_CHANGED: 'player:state_changed',
  PLAYER_DAMAGE_TAKEN: 'player:damage_taken',
  PLAYER_DIED: 'player:died',
  PLAYER_RESPAWNED: 'player:respawned',
  
  MONSTER_SPAWNED: 'monster:spawned',
  MONSTER_DAMAGED: 'monster:damaged',
  MONSTER_DIED: 'monster:died',
  
  SKILL_CAST: 'skill:cast',
  ULTIMATE_TRIGGERED: 'skill:ultimate_triggered',
  
  LOOT_DROPPED: 'loot:dropped',
  LOOT_COLLECTED: 'loot:collected',
  
  TOAST_MESSAGE: 'ui:toast',
  BATTLE_LOG: 'ui:battle_log',
  QUEST_UPDATED: 'ui:quest_updated',
  LEVEL_UP: 'player:level_up',
  DUNGEON_COMPLETED: 'dungeon:completed'
} as const;

export type GameEventType = typeof GameEvents[keyof typeof GameEvents];

export const EventBus = new Phaser.Events.EventEmitter();
