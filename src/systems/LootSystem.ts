import Phaser from 'phaser';
import { LootItem } from '../entities/LootItem';
import { Monster } from '../entities/Monster';
import { Player } from '../entities/Player';
import { LootQuality, PlayerStateEnum, type LootItemData } from '../core/Types';
import { EventBus, GameEvents } from '../core/EventBus';

export class LootSystem {
  private scene: Phaser.Scene;
  private player: Player;
  private lootItems: LootItem[] = [];

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;

    EventBus.on(GameEvents.LOOT_COLLECTED, (item: LootItemData) => {
      this.handleLootCollected(item);
    });
  }

  public dropLootForMonster(monster: Monster): void {
    const x = monster.x;
    const y = monster.y - 10;

    // 1. Gold drop
    const goldAmount = Math.max(1, Math.round(monster.config.goldReward * Phaser.Math.FloatBetween(0.8, 1.2)));
    this.createLootItem(x - 15, y, {
      id: `gold_${Date.now()}_${Math.random()}`,
      name: 'Bạc',
      type: 'gold',
      amount: goldAmount,
      quality: LootQuality.COMMON,
      iconText: '💰',
      color: 0xffd700
    });

    // 2. Spirit stone drop
    if (monster.config.spiritReward > 0) {
      this.createLootItem(x + 15, y, {
        id: `spirit_${Date.now()}_${Math.random()}`,
        name: 'Linh Thạch',
        type: 'spirit',
        amount: monster.config.spiritReward,
        quality: monster.config.isBoss ? LootQuality.RARE : LootQuality.FINE,
        iconText: '💎',
        color: 0x44d7ff
      });
    }

    // 3. Rare material or equipment drop
    const dropRate = monster.config.isBoss ? 0.85 : 0.25;
    // Every boss kill guarantees its crafting core; regular monsters retain a chance-based material drop.
    if (monster.config.isBoss || Math.random() < dropRate) {
      const isBossDrop = monster.config.isBoss;
      this.createLootItem(x, y - 5, {
        id: `mat_${Date.now()}_${Math.random()}`,
        name: isBossDrop ? 'Thiên Mục Ma Hạch' : 'Thanh Trúc Dược Thảo',
        type: 'material',
        amount: 1,
        quality: isBossDrop ? LootQuality.EPIC : LootQuality.FINE,
        iconText: isBossDrop ? '🔮' : '🌿',
        color: isBossDrop ? 0xbb55ff : 0x55ff55
      });
    }

    // Equipment is a meaningful but uncommon reward; Bosses have a much higher chance.
    const equipmentRate = monster.config.isBoss ? 0.45 : 0.08;
    if (Math.random() < equipmentRate) {
      const slots = ['weapon', 'armor', 'accessory'] as const;
      const slot = slots[Phaser.Math.Between(0, slots.length - 1)];
      const quality = monster.config.isBoss ? LootQuality.EPIC : LootQuality.RARE;
      const tier = monster.config.isBoss ? 2 : 1;
      const names = { weapon: 'Phi Kiếm', armor: 'Tiên Giáp', accessory: 'Linh Phù' };
      const icons = { weapon: '🗡️', armor: '🛡️', accessory: '📿' };
      this.createLootItem(x + 4, y - 18, {
        id: 'equip_' + slot + '_' + monster.config.id + '_' + Date.now(),
        name: names[slot] + (monster.config.isBoss ? ' Ma Quân' : ' Thanh Trúc'),
        type: 'equip', amount: 1, quality, iconText: icons[slot], color: 0xb77cff,
        slot, atk: slot === 'weapon' ? 8 * tier : 0,
        def: slot === 'armor' ? 5 * tier : 0,
        hp: slot === 'armor' ? 35 * tier : slot === 'accessory' ? 15 * tier : 0,
        mp: slot === 'accessory' ? 12 * tier : 0
      });
    }
    EventBus.emit(GameEvents.LOOT_DROPPED, { x, y });
  }

  private createLootItem(x: number, y: number, data: LootItemData): void {
    const item = new LootItem(this.scene, x, y, data);
    this.lootItems.push(item);
  }

  public update(_time: number, delta: number): void {
    const isPlayerLooting = this.player.stateMachine.getCurrentStateName() === PlayerStateEnum.LOOTING;
    const magnetRadius = isPlayerLooting ? 320 : 110;
    const playerX = this.player.x;
    const playerY = this.player.y - 25;

    for (let i = this.lootItems.length - 1; i >= 0; i--) {
      const item = this.lootItems[i];
      if (!item.active || item.collected) {
        this.lootItems.splice(i, 1);
        continue;
      }

      const dist = Phaser.Math.Distance.Between(playerX, playerY, item.x, item.y);
      if (dist <= magnetRadius || isPlayerLooting) {
        item.attractTo(playerX, playerY, delta);
      }
    }
  }

  public hasUncollectedLootNear(playerX: number, range = 240): boolean {
    return this.lootItems.some(item => !item.collected && Math.abs(item.x - playerX) <= range);
  }

  private handleLootCollected(item: LootItemData): void {
    switch (item.type) {
      case 'gold':
        this.player.gold += item.amount;
        EventBus.emit(GameEvents.BATTLE_LOG, `Nhận được +${item.amount} Bạc`);
        break;
      case 'spirit':
        this.player.spirit += item.amount;
        EventBus.emit(GameEvents.BATTLE_LOG, `Thu thập +${item.amount} Linh Thạch`);
        break;
      case 'material':
        this.player.addInventoryItem({ id: item.name, name: item.name, type: 'material', amount: item.amount, quality: item.quality, iconText: item.iconText });
        EventBus.emit(GameEvents.BATTLE_LOG, `Thu được kỳ bảo: [${item.name}]!`);
        EventBus.emit(GameEvents.TOAST_MESSAGE, `Thu được [${item.name}]!`);
        break;
      case 'equip':
        this.player.addInventoryItem({ id: item.id, name: item.name, type: 'equipment', amount: 1, quality: item.quality, iconText: item.iconText, slot: item.slot, atk: item.atk, def: item.def, hp: item.hp, mp: item.mp });
        EventBus.emit(GameEvents.TOAST_MESSAGE, 'Nhận trang bị: ' + item.name + '!');
        break;
    }
    EventBus.emit(GameEvents.PLAYER_STATS_CHANGED, this.player.stats);
  }

  public cleanup(): void {
    this.lootItems.forEach(item => item.destroy());
    this.lootItems = [];
  }
}
