import type { MonsterConfig } from '../core/Types';

export const MONSTERS_DATA: Record<string, MonsterConfig> = {
  eye_normal: {
    id: 'eye_normal',
    name: '千目妖 · Thiên Mục Yêu',
    title: 'U minh ma vật',
    level: 1,
    maxHp: 110,
    atk: 8,
    def: 3,
    expReward: 70,
    goldReward: 12,
    spiritReward: 1,
    attackInterval: 2200,
    attackRange: 200,
    textureKey: 'monster_eye',
    scale: 0.95,
    isBoss: false
  },
  eye_elite: {
    id: 'eye_elite',
    name: '千目统领 · Thiên Mục Thống Lĩnh',
    title: 'Hắc ám tinh anh',
    level: 3,
    maxHp: 320,
    atk: 16,
    def: 8,
    expReward: 210,
    goldReward: 35,
    spiritReward: 5,
    attackInterval: 1800,
    attackRange: 220,
    textureKey: 'monster_eye_elite',
    scale: 1.25,
    isBoss: false
  },
  eye_boss: {
    id: 'eye_boss',
    name: '千目魔君 · Thiên Mục Ma Quân',
    title: 'Hư Không Yêu Vương',
    level: 5,
    maxHp: 950,
    atk: 32,
    def: 15,
    expReward: 560,
    goldReward: 120,
    spiritReward: 20,
    attackInterval: 1500,
    attackRange: 250,
    textureKey: 'monster_eye_boss',
    scale: 1.6,
    isBoss: true
  }
};
