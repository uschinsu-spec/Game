import { gameState } from '../../state/gameState.js';

const CORE_DEFS = {
  m_1_1: { key: 'nhat_pham_so_ky', name: 'Nội Đan Nhất Phẩm Sơ Kỳ', chance: 0.20, color: 0x6ee7b7, textColor: '#a7f3d0' },
  m_1_2: { key: 'nhat_pham_trung_ky', name: 'Nội Đan Nhất Phẩm Trung Kỳ', chance: 0.30, color: 0x38bdf8, textColor: '#7dd3fc' },
  m_1_3: { key: 'nhat_pham_hau_ky', name: 'Nội Đan Nhất Phẩm Hậu Kỳ', chance: 0.45, color: 0xc084fc, textColor: '#d8b4fe' },
  m_1_4: { key: 'nhat_pham_dinh_phong', name: 'Nội Đan Nhất Phẩm Đỉnh Phong', chance: 0.70, color: 0xfbbf24, textColor: '#fde68a' }
};

function ensureCoreBag() {
  if (!gameState.materials || typeof gameState.materials !== 'object') gameState.materials = {};
  if (!gameState.materials.beastCores || typeof gameState.materials.beastCores !== 'object') {
    gameState.materials.beastCores = {};
  }
  Object.values(CORE_DEFS).forEach(def => {
    if (!Number.isFinite(gameState.materials.beastCores[def.key])) gameState.materials.beastCores[def.key] = 0;
  });
  return gameState.materials.beastCores;
}

function coreForEnemy(enemy) {
  const data = enemy?.monsterData;
  const def = data ? CORE_DEFS[data.id] : null;
  if (!def) return null;
  return { ...def, monsterId: data.id, monsterName: data.name, rank: data.rank };
}

function stopTrackingDrop(scene, drop) {
  if (!Array.isArray(scene.groundDrops)) return;
  const idx = scene.groundDrops.indexOf(drop);
  if (idx >= 0) scene.groundDrops.splice(idx, 1);
}

function giveCoreToPlayer(scene, core, x, y, prefix = '') {
  const bag = ensureCoreBag();
  bag[core.key] = (bag[core.key] || 0) + 1;
  scene.updateHUD?.();
  scene.showFloatingText?.(x, y - 42, `${prefix}🔮 +1 ${core.name}`, core.textColor, '12px');
  scene.spawnVfx?.(x, y, 0, 0.55, { tint: core.color, duration: 320, grow: 1.25 });
}

function spawnCoreDrop(scene, x, y, core, winnerInfo, isParty) {
  if (!scene || !core) return;
  if (!Array.isArray(scene.groundDrops)) scene.groundDrops = [];

  const drop = scene.add.container(x + 18, y - 18).setDepth(Math.floor(y) + 18);
  const aura = scene.add.circle(0, 4, 16, core.color, 0.34).setStrokeStyle(1.5, core.color, 0.95);
  const orb = scene.add.circle(0, -7, 8, core.color, 0.98).setStrokeStyle(2, 0xffffff, 0.9);
  const glow = scene.add.circle(0, -7, 13, core.color, 0.20);
  const tagBg = scene.add.rectangle(0, -38, 172, 22, 0x07131d, 0.92).setStrokeStyle(1, core.color, 1);
  const tag = scene.add.text(0, -38, `🔮 ${core.name}`, {
    fontFamily: 'sans-serif', fontSize: '8px', fontStyle: 'bold', color: core.textColor,
    stroke: '#000000', strokeThickness: 2
  }).setOrigin(0.5);
  drop.add([aura, glow, orb, tagBg, tag]);
  scene.groundDrops.push(drop);

  scene.tweens.add({ targets: [aura, glow], scaleX: 1.35, scaleY: 1.35, alpha: 0.08, yoyo: true, repeat: -1, duration: 520 });
  scene.tweens.add({ targets: orb, y: -14, yoyo: true, repeat: -1, duration: 650, ease: 'Sine.easeInOut' });

  scene.time.delayedCall(2150, () => {
    if (!drop?.active || !scene.scene?.isActive()) return;
    stopTrackingDrop(scene, drop);

    if (winnerInfo?.winnerType === 'wild_npc') {
      const sprite = winnerInfo.ref?.sprite;
      const tx = sprite?.x ?? x;
      const ty = sprite?.y ?? y;
      scene.tweens.add({
        targets: drop, x: tx, y: ty, scaleX: 0.1, scaleY: 0.1, alpha: 0.15, duration: 300,
        onComplete: () => {
          drop.destroy();
          scene.showFloatingText?.(tx, ty - 44, `[Tán Tu] nhặt ${core.name}`, '#93c5fd', '10px');
        }
      });
      return;
    }

    const px = scene.player?.x ?? x;
    const py = (scene.player?.y ?? y) - 20;

    if (isParty) {
      const receiver = Phaser.Math.Between(0, 4);
      scene.tweens.add({
        targets: drop, x: px, y: py, scaleX: 0.1, scaleY: 0.1, alpha: 0.15, duration: 300,
        onComplete: () => {
          drop.destroy();
          if (receiver === 0) {
            giveCoreToPlayer(scene, core, px, py, '[Chia đội] ');
          } else {
            const follower = scene.partyFollowers?.[receiver - 1];
            const fx = follower?.sprite?.x ?? px;
            const fy = follower?.sprite?.y ?? py;
            scene.showFloatingText?.(fx, fy - 40, `🔮 Đồng đội nhận ${core.name}`, '#a7f3d0', '10px');
          }
        }
      });
      return;
    }

    scene.tweens.add({
      targets: drop, x: px, y: py, scaleX: 0.1, scaleY: 0.1, alpha: 0.15, duration: 300,
      onComplete: () => {
        drop.destroy();
        giveCoreToPlayer(scene, core, px, py);
      }
    });
  });
}

export function installRankOneBeastCoreDrops(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__rankOneBeastCoreDropsInstalled) return;
  const proto = MainGameScene.prototype;
  proto.__rankOneBeastCoreDropsInstalled = true;
  ensureCoreBag();

  const originalKillEnemy = proto.killEnemy;
  const originalGroundDrop = proto.spawnGroundLootDrop;
  if (typeof originalKillEnemy !== 'function' || typeof originalGroundDrop !== 'function') return;

  proto.killEnemy = function killEnemyWithRankOneCoreContext(enemy) {
    const core = coreForEnemy(enemy);
    this.__rankOneCoreContext = core;
    this.__rankOneCoreShouldDrop = !!core && Math.random() < core.chance;
    try {
      return originalKillEnemy.call(this, enemy);
    } finally {
      this.__rankOneCoreContext = null;
      this.__rankOneCoreShouldDrop = false;
    }
  };

  proto.spawnGroundLootDrop = function spawnGroundLootWithRankOneCore(x, y, dropBundle, winnerInfo, isParty) {
    const core = this.__rankOneCoreContext;
    const shouldDropCore = !!this.__rankOneCoreShouldDrop;

    // Yêu thú Nhất Phẩm luôn có ít nhất Da + Lông + Huyết.
    if (core && dropBundle) {
      dropBundle.beastPelts = Math.max(1, Number(dropBundle.beastPelts || 0));
      dropBundle.beastFurs = Math.max(1, Number(dropBundle.beastFurs || 0));
      dropBundle.beastBlood = Math.max(1, Number(dropBundle.beastBlood || 0));
    }

    const result = originalGroundDrop.call(this, x, y, dropBundle, winnerInfo, isParty);
    if (core && shouldDropCore) spawnCoreDrop(this, x, y, core, winnerInfo, isParty);
    return result;
  };

  proto.getRankOneBeastCoreCounts = function getRankOneBeastCoreCounts() {
    return { ...ensureCoreBag() };
  };
}
