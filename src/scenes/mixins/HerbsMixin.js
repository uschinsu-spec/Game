/**
 * HerbsMixin.js
 * Quản lý Hệ thống Linh Thảo / Thảo Dược Xuất hiện Ngẫu nhiên trên Map.
 * - Thu Hái: Click vào cây linh thảo từ xa (auto di chuyển đến hái)
 *            hoặc ấn nút [Thu Hái] khi đứng gần (proximity ≤ 90px)
 * - Mật độ tăng dần theo độ sâu map
 * - Linh Thảo CHỈ thu được bằng cách hái tay (KHÔNG rơi từ giết quái)
 */
import { gameState } from '../../state/gameState.js';
import { ALL_MAPS } from '../../config/regionsData.js';
import { ALL_HERBS, getHerbsByRank } from '../../config/herbsData.js';

export const HerbsMixin = {

  initHerbs() {
    if (this.herbsGroup) {
      this.herbsGroup.forEach(h => {
        if (h.container) h.container.destroy(true);
        if (h.hitZone) h.hitZone.destroy();
      });
    }
    this.herbsGroup = [];
    this.herbTarget = null; // Pending herb để auto-move đến hái

    const curMapId = gameState.currentMapId ?? 0;
    const map = ALL_MAPS.find(m => m.id === curMapId) || ALL_MAPS[0];

    // Trong thôn (map 0 an toàn) không sinh linh thảo hoang dã
    if (map.isPeaceZone || curMapId === 0) return;

    const totalW = this.worldW || 32000;
    const herbSpawnPoints = [];

    // MẬT ĐỘ TĂNG DẦN THEO ĐỘ SÂU BẢN ĐỒ (CÀNG VÀO SÂU CÀNG NHIỀU LINH THẢO)
    // 1. Vùng 1: Đầu map (750 -> 4000px): Mật độ vừa (~850 - 1200px)
    for (let x = 750; x < 4000; x += Phaser.Math.Between(850, 1200)) {
      herbSpawnPoints.push({ x, zone: 1 });
    }
    // 2. Vùng 2: Trung gian (4000 -> 12000px): Mật độ khá (~520 - 780px)
    for (let x = 4200; x < 12000; x += Phaser.Math.Between(520, 780)) {
      herbSpawnPoints.push({ x, zone: 2 });
    }
    // 3. Vùng 3: Thâm sâu (12000 -> 22000px): Mật độ cao (~340 - 520px)
    for (let x = 12200; x < 22000; x += Phaser.Math.Between(340, 520)) {
      herbSpawnPoints.push({ x, zone: 3 });
    }
    // 4. Vùng 4: Tận cùng cấm địa (22000 -> 31500px): Dày đặc nhất (~220 - 360px)
    for (let x = 22200; x < totalW - 400; x += Phaser.Math.Between(220, 360)) {
      herbSpawnPoints.push({ x, zone: 4 });
    }

    // Xác định phẩm cấp linh thảo của map hiện tại (Map 1 -> Rank 1, Map 2 -> Rank 2, ...)
    const mapRank = Math.min(5, Math.max(1, curMapId));
    const availableHerbs = getHerbsByRank(mapRank);

    herbSpawnPoints.forEach((sp, idx) => {
      const y = Phaser.Math.Between(this.field.top + 35, this.field.bottom - 35);
      const herbDef = availableHerbs[idx % availableHerbs.length] || availableHerbs[0];
      this.spawnOneHerb(sp.x, y, sp.zone, idx, herbDef);
    });
  },

  spawnOneHerb(x, y, zone = 1, idx = 0, herbDef = null) {
    if (!herbDef) {
      const mapRank = Math.min(5, Math.max(1, gameState.currentMapId ?? 1));
      const pool = getHerbsByRank(mapRank);
      herbDef = pool[idx % pool.length] || pool[0];
    }

    const herbTex = `herb_${(idx % 7) + 1}`;
    const container = this.add.container(x, y).setDepth(Math.floor(y) + 4);

    // 1. Bóng dưới gốc
    const shadow = this.add.ellipse(0, 12, 28, 9, 0x000000, 0.35);

    // 2. Vòng hào quang linh khí lấp lánh
    const auraColorHex = parseInt((herbDef.color || '#34d399').replace('#', ''), 16);
    const aura = this.add.ellipse(0, 8, 32, 14, auraColorHex, 0.45);
    this.tweens.add({
      targets: aura,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0.15,
      yoyo: true,
      repeat: -1,
      duration: 700 + Math.random() * 300
    });

    // 3. Sprite Cây Thảo Dược
    const sprite = this.add.image(0, -6, this.textures.exists(herbTex) ? herbTex : 'mat_herb')
      .setDisplaySize(32, 32);

    this.tweens.add({
      targets: sprite,
      angle: { from: -4, to: 4 },
      y: '-=2',
      duration: 1200 + Math.random() * 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 4. Nhãn tên linh thảo chi tiết
    const tagBg = this.add.rectangle(0, -32, 116, 17, 0x081c15, 0.9)
      .setStrokeStyle(1.2, auraColorHex);
    const tagTxt = this.add.text(0, -32, `${herbDef.emoji} ${herbDef.name}`, {
      fontFamily: 'sans-serif',
      fontSize: '8px',
      fontStyle: 'bold',
      color: herbDef.color || '#86efac'
    }).setOrigin(0.5);

    // 5. Nút Thu Hái (ẩn mặc định, chỉ hiện khi player gần hoặc targetted)
    const btnPrompt = this.add.rectangle(0, -50, 74, 15, 0x14532d, 0.95)
      .setStrokeStyle(1, 0xfacc15)
      .setVisible(false);
    const btnTxt = this.add.text(0, -50, '✨ [Thu Hái]', {
      fontFamily: 'sans-serif',
      fontSize: '7.5px',
      fontStyle: 'bold',
      color: '#fef08a'
    }).setOrigin(0.5).setVisible(false);

    this.tweens.add({
      targets: [btnPrompt, btnTxt],
      y: '-=3',
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    container.add([shadow, aura, sprite, tagBg, tagTxt, btnPrompt, btnTxt]);

    // ── HITZONE: Rectangle vô hình trong thế giới (không thuộc container) ──
    const hitZone = this.add.rectangle(x, y - 20, 110, 60, 0x000000, 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(Math.floor(y) + 5);

    const herbData = {
      x,
      y,
      zone,
      idx,
      herbDef,
      container,
      hitZone,
      sprite,
      tagBg,
      btnPrompt,
      btnTxt,
      isHarvested: false,
      respawnTime: 0
    };

    // Click vào hitzone: Auto-move đến hái (hoặc hái ngay nếu đang gần)
    hitZone.on('pointerdown', (pointer) => {
      if (pointer?.event) pointer.event.stopPropagation();
      this.interactWithHerb(herbData);
    });

    // Proximity Culling: Ẩn khi ở quá xa (>950px)
    const playerX = this.player ? this.player.x : 350;
    const isNear = Math.abs(x - playerX) <= 950;
    container.setVisible(isNear);
    hitZone.setVisible(isNear);

    this.herbsGroup.push(herbData);
    return herbData;
  },

  interactWithHerb(herb) {
    if (!herb || herb.isHarvested || !this.player || !this.player.active) return;

    // Nếu đang dưỡng sức -> tắt dưỡng sức trước khi di chuyển
    if (gameState.isResting) {
      gameState.isResting = false;
      if (this.createSideToggleButtons) this.createSideToggleButtons();
    }

    const px = this.player.x;
    const py = this.player.y;
    const dist = Phaser.Math.Distance.Between(px, py, herb.x, herb.y);

    if (dist <= 90) {
      // Đã ở cạnh cây linh thảo -> Thu hái ngay
      this.harvestHerb(herb);
    } else {
      // Ở xa -> Tự động di chuyển đến gần để thu hái
      this.herbTarget = herb;
      const hName = herb.herbDef?.name || 'Linh Thảo';
      this.showFloatingText(this.player.x, this.player.y - 40, `🌿 Đang tiến lại hái ${hName}...`, '#86efac', '11px');
      this.moveTarget = {
        x: herb.x,
        y: herb.y,
        onArrive: () => {
          this.herbTarget = null;
          this.harvestHerb(herb);
        }
      };
    }
  },

  harvestHerb(herb) {
    if (!herb || herb.isHarvested || !this.player || !this.player.active) return;
    herb.isHarvested = true;
    this.herbTarget = null;

    // Ẩn nút Thu Hái
    if (herb.btnPrompt) herb.btnPrompt.setVisible(false);
    if (herb.btnTxt) herb.btnTxt.setVisible(false);

    const herbDef = herb.herbDef || ALL_HERBS[0];

    // Số lượng linh thảo thu được (vùng sâu nhận nhiều hơn)
    const count = herb.zone >= 3 ? Phaser.Math.Between(2, 3) : Phaser.Math.Between(1, 2);

    // Lưu vào gameState.herbs (Lưu theo từng loại linh thảo riêng biệt)
    if (typeof gameState.herbs !== 'object' || gameState.herbs === null) {
      gameState.herbs = {};
    }
    gameState.herbs[herbDef.name] = (gameState.herbs[herbDef.name] || 0) + count;

    // Hiệu ứng thu hái linh thảo
    if (this.spawnVfx) {
      this.spawnVfx(herb.x, herb.y, 0, 0.7, { tint: 0x34d399, duration: 350 });
      this.spawnVfx(this.player.x, this.player.y, 0, 0.5, { tint: 0x67e8f9, duration: 300 });
    }

    // Floating text thông báo
    this.showFloatingText(
      this.player.x,
      this.player.y - 65,
      `${herbDef.emoji} HÁI ĐƯỢC: +${count} [${herbDef.name}] (${herbDef.rankName})!`,
      herbDef.color || '#4ade80',
      '13px'
    );

    this.updateHUD();

    // Hiệu ứng biến mất của cây thảo dược
    this.tweens.add({
      targets: herb.container,
      scaleX: 0.1,
      scaleY: 0.1,
      alpha: 0,
      duration: 300,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        herb.container.setVisible(false);
        if (herb.hitZone) herb.hitZone.setVisible(false);
      }
    });

    // Tự động HỒI SINH (RESPAWN) sau 25-40 giây
    const respawnDelay = Phaser.Math.Between(25000, 40000);
    herb.respawnTime = this.time.now + respawnDelay;

    this.time.delayedCall(respawnDelay, () => {
      if (!herb || !this.scene || !this.scene.isActive()) return;
      this.respawnHerb(herb);
    });
  },

  respawnHerb(herb) {
    if (!herb) return;
    herb.isHarvested = false;
    herb.container.setScale(1).setAlpha(1);

    const playerX = this.player ? this.player.x : 350;
    const isNear = Math.abs(herb.x - playerX) <= 950;
    herb.container.setVisible(isNear);
    if (herb.hitZone) herb.hitZone.setVisible(isNear);

    if (isNear && this.spawnVfx) {
      this.spawnVfx(herb.x, herb.y, 0, 0.5, { tint: 0x34d399, duration: 250 });
    }
  },

  updateHerbs(time, delta) {
    if (!this.herbsGroup || this.herbsGroup.length === 0 || !this.player || !this.player.active) return;
    const px = this.player.x;
    const py = this.player.y;

    for (let i = 0; i < this.herbsGroup.length; i++) {
      const h = this.herbsGroup[i];
      if (!h || !h.container) continue;

      if (h.isHarvested) {
        if (h.container.visible) h.container.setVisible(false);
        if (h.hitZone && h.hitZone.visible) h.hitZone.setVisible(false);
        continue;
      }

      // Culling theo khoảng cách X
      const isNear = Math.abs(h.x - px) <= 950;
      if (h.container.visible !== isNear) {
        h.container.setVisible(isNear);
        if (h.hitZone) h.hitZone.setVisible(isNear);
      }

      if (!isNear) continue;

      // Hiển thị nút [Thu Hái] khi player đứng gần (≤ 120px)
      const dist = Phaser.Math.Distance.Between(px, py, h.x, h.y);
      const showBtn = dist <= 120;
      if (h.btnPrompt && h.btnPrompt.visible !== showBtn) {
        h.btnPrompt.setVisible(showBtn);
        h.btnTxt?.setVisible(showBtn);
      }
    }
  }
};
