import type { CultivationRealm } from '../core/Types';

export const CULTIVATION_REALMS: CultivationRealm[] = [
  { id: 1, name: 'Luyện Khí', stage: 'Sơ Kỳ', expRequired: 100, bonusHp: 0, bonusAtk: 0, bonusDef: 0 },
  { id: 2, name: 'Luyện Khí', stage: 'Trung Kỳ', expRequired: 250, bonusHp: 30, bonusAtk: 8, bonusDef: 4 },
  { id: 3, name: 'Luyện Khí', stage: 'Hậu Kỳ', expRequired: 500, bonusHp: 70, bonusAtk: 18, bonusDef: 10 },
  { id: 4, name: 'Luyện Khí', stage: 'Viên Mãn', expRequired: 900, bonusHp: 120, bonusAtk: 30, bonusDef: 18 },
  { id: 5, name: 'Trúc Cơ', stage: 'Sơ Kỳ', expRequired: 1600, bonusHp: 200, bonusAtk: 50, bonusDef: 30 },
  { id: 6, name: 'Trúc Cơ', stage: 'Trung Kỳ', expRequired: 2600, bonusHp: 300, bonusAtk: 75, bonusDef: 45 },
  { id: 7, name: 'Trúc Cơ', stage: 'Hậu Kỳ', expRequired: 4000, bonusHp: 450, bonusAtk: 110, bonusDef: 65 },
  { id: 8, name: 'Trúc Cơ', stage: 'Viên Mãn', expRequired: 6000, bonusHp: 650, bonusAtk: 160, bonusDef: 95 },
  { id: 9, name: 'Kim Đan', stage: 'Sơ Kỳ', expRequired: 9000, bonusHp: 950, bonusAtk: 230, bonusDef: 140 },
  { id: 10, name: 'Kim Đan', stage: 'Viên Mãn', expRequired: 14000, bonusHp: 1400, bonusAtk: 330, bonusDef: 200 }
];
