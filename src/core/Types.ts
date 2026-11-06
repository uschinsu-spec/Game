export enum PlayerStateEnum {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  DETECTING = 'DETECTING',
  COMBAT = 'COMBAT',
  LOOTING = 'LOOTING',
  RESUMING = 'RESUMING',
  BOSS_COMBAT = 'BOSS_COMBAT',
  DEAD = 'DEAD'
}

export enum MonsterStateEnum {
  IDLE = 'IDLE',
  CHASE = 'CHASE',
  ATTACK = 'ATTACK',
  HURT = 'HURT',
  DEAD = 'DEAD'
}

export enum SkillType {
  SINGLE = 'SINGLE',
  AOE = 'AOE',
  BUFF = 'BUFF',
  ULTIMATE = 'ULTIMATE'
}

export enum LootQuality {
  COMMON = 'COMMON',       // Thường (Trắng)
  FINE = 'FINE',           // Tốt (Lục)
  RARE = 'RARE',           // Hiếm (Lam)
  EPIC = 'EPIC',           // Sử Thi (Tím)
  LEGENDARY = 'LEGENDARY', // Truyền Thuyết (Cam)
  MYTHIC = 'MYTHIC'        // Thần Khí (Đỏ)
}

export interface CharacterStats {
  level: number;
  maxHp: number;
  hp: number;
  maxMp: number;
  mp: number;
  atk: number;
  def: number;
  critRate: number;      // e.g. 0.15 = 15%
  critDmg: number;       // e.g. 1.5 = 150%
  attackSpeed: number;   // attacks per second or interval modifier
  moveSpeed: number;
  penetration: number;
  combatPower: number;
}

export interface SkillConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: SkillType;
  damageMultiplier: number;
  cooldown: number; // in milliseconds
  mpCost: number;
  range: number;
  targetCount: number;
  color: number;
  lastUsedTime: number;
  priority: number;
  autoEnabled: boolean;
  level: number;
}

export interface DamageResult {
  damage: number;
  isCrit: boolean;
  isDead: boolean;
  targetX: number;
  targetY: number;
}

export interface MonsterConfig {
  id: string;
  name: string;
  title: string;
  level: number;
  maxHp: number;
  atk: number;
  def: number;
  expReward: number;
  goldReward: number;
  spiritReward: number;
  attackInterval: number;
  attackRange: number;
  textureKey: string;
  scale?: number;
  isBoss?: boolean;
}

export interface LootItemData {
  id: string;
  name: string;
  type: 'gold' | 'spirit' | 'exp' | 'equip' | 'material';
  amount: number;
  quality: LootQuality;
  iconText: string;
  color: number;
  slot?: EquipmentSlot;
  atk?: number;
  def?: number;
  hp?: number;
  mp?: number;
  critRate?: number;
  critDmg?: number;
  penetration?: number;
  attackSpeed?: number;
}

export interface CultivationRealm {
  id: number;
  name: string;
  stage: string;
  expRequired: number;
  levelRequired: number;
  goldRequired: number;
  spiritRequired: number;
  materialRequired: number;
  bonusHp: number;
  bonusAtk: number;
  bonusDef: number;
}


export type EquipmentSlot = 'weapon' | 'armor' | 'accessory';
export interface InventoryEntry {
  id: string;
  name: string;
  type: 'material' | 'potion' | 'equipment';
  amount: number;
  quality: LootQuality;
  iconText: string;
  slot?: EquipmentSlot;
  atk?: number;
  def?: number;
  hp?: number;
  mp?: number;
}
