/**
 * NpcMixin.js
 * Quản lý Toàn bộ Hệ Thống NPC Thế Giới & Tương Tác Thao Tác (Mobile & PC)
 */
import { NPCS_DATA } from '../../config/npcData.js';
import { gameState } from '../../state/gameState.js';
import { ensureCurrencies, addCurrency, deductCurrency } from '../../config/currencyData.js';
import { W, H } from '../constants.js';

export const NpcMixin = {

  createNpcs() {
    // Xóa NPC cũ nếu có
    if (this.npcsGroup) {
      this.npcsGroup.forEach(npc => {
        if (npc.container) npc.container.destroy(true);
      });
    }
    this.npcsGroup = [];

    const curMapId = gameState.currentMapId;
    const currentNpcs = NPCS_DATA.filter(n => n.mapId === curMapId);

    currentNpcs.forEach(npcData => {
      const container = this.add.container(npcData.x, npcData.y).setDepth(Math.floor(npcData.y) + 5);

      // 1. Bóng dưới chân
      const shadow = this.add.ellipse(0, 44, 48, 16, 0x000000, 0.45);

      // 2. Sprite NPC 3D Tối Ưu (Với hoạt ảnh thở nhịp nhàng)
      const spriteKey = npcData.spriteKey || 'player_idle';
      const sprite = this.add.sprite(0, -6, spriteKey, 0)
        .setScale(0.70)
        .setInteractive({ useHandCursor: true });

      this.tweens.add({
        targets: sprite,
        scaleY: 0.68,
        y: -4,
        duration: 1200 + Math.random() * 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // 3. Bảng Tên & Chức Danh trên đầu (Title Plate - Nhỏ gọn, Chữ Vàng Nổi Bật)
      const tagBg = this.add.rectangle(0, -70, 116, 19, 0x091422, 0.92)
        .setStrokeStyle(1.4, 0xfacc15)
        .setInteractive({ useHandCursor: true });

      const tagTxt = this.add.text(0, -70, `${npcData.icon} ${npcData.title}`, {
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 2.2
      }).setOrigin(0.5);

      const nameTxt = this.add.text(0, -54, npcData.name, {
        fontSize: '8px',
        fontStyle: 'bold',
        color: '#fef08a',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);

      // 4. Nút bấm chạm tương tác nổi trên đầu (Dành cho điện thoại / Mobile - Gọn gàng)
      const promptBtn = this.add.rectangle(0, -88, 74, 14, 0x143528, 0.92)
        .setStrokeStyle(1.2, 0x4ade80)
        .setInteractive({ useHandCursor: true });
      const promptTxt = this.add.text(0, -88, '💬 [Chạm]', {
        fontSize: '7.5px',
        fontStyle: 'bold',
        color: '#fde047',
        stroke: '#000000',
        strokeThickness: 1.5
      }).setOrigin(0.5);

      this.tweens.add({
        targets: [promptBtn, promptTxt],
        y: '-=3',
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Bắt sự kiện Click / Touch vào NPC
      const onInteract = () => {
        this.openNpcDialogModal(npcData.id);
      };

      sprite.on('pointerdown', onInteract);
      tagBg.on('pointerdown', onInteract);
      promptBtn.on('pointerdown', onInteract);

      container.add([shadow, sprite, tagBg, tagTxt, nameTxt, promptBtn, promptTxt]);
      this.npcsGroup.push({ data: npcData, container, sprite, tagBg });
    });
  },

  // ----------------------------------------------------------------
  // BẢNG ĐỐI THOẠI & THAO TÁC VỚI NPC (MOBILE-OPTIMIZED MODAL)
  // ----------------------------------------------------------------
  openNpcDialogModal(npcId) {
    this.closeModal();
    const npc = NPCS_DATA.find(n => n.id === npcId);
    if (!npc) return;

    const overlay = this.fixed(this.add.rectangle(W / 2, H / 2, W, H, 0x041019, 0.28), 9999);
    const panel = this.fixed(this.add.container(W / 2, H / 2), 10000);
    this.activeModal = panel;
    this.activeModalOverlay = overlay;

    const bg = this.add.rectangle(0, 0, 480, 590, 0x071b25, 0.94).setStrokeStyle(2, npc.tagBorder);
    panel.add(bg);

    // Header NPC
    const title = this.add.text(0, -260, `${npc.icon} ${npc.title} ${npc.name.toUpperCase()}`, {
      fontSize: '15px', fontStyle: 'bold', color: npc.color
    }).setOrigin(0.5);
    panel.add(title);
    this.createModalCloseBtn(panel, 215, -260);

    // Khung Lời Thoại / Speech Box (Hiển thị Avatar 3D Chân Dung NPC)
    const speechBg = this.add.rectangle(0, -180, 440, 95, 0x111e30, 0.95).setStrokeStyle(1.2, 0x334e68);
    const speechAvatarBg = this.add.rectangle(-175, -180, 64, 76, npc.tagBg || 0x0f1826, 1).setStrokeStyle(2, npc.tagBorder || 0x38bdf8);
    
    let speechAvatarImg;
    if (npc.spriteKey && this.textures.exists(npc.spriteKey)) {
      speechAvatarImg = this.add.image(-175, -180, npc.spriteKey).setDisplaySize(60, 60);
    } else {
      speechAvatarImg = this.add.text(-175, -180, npc.icon, { fontSize: '26px' }).setOrigin(0.5);
    }
    
    const speechTxt = this.add.text(-132, -180, `"${npc.greeting}"`, {
      fontSize: '10.5px',
      color: '#e2e8f0',
      wordWrap: { width: 335 },
      lineSpacing: 4,
      fontStyle: 'italic'
    }).setOrigin(0, 0.5);
    panel.add([speechBg, speechAvatarBg, speechAvatarImg, speechTxt]);

    // Danh Sách Nút Thao Tác (To, Dễ Bấm Bằng Cảm Ứng Trên Điện Thoại)
    const actions = npc.actions || [];
    actions.forEach((act, idx) => {
      const ay = -85 + idx * 82;
      const actBox = this.add.rectangle(0, ay, 440, 70, 0x0f1b2b, 0.95)
        .setStrokeStyle(1.5, Phaser.Display.Color.HexStringToColor(act.color).color)
        .setInteractive({ useHandCursor: true });

      const actTitle = this.add.text(-200, ay - 16, act.label, {
        fontSize: '12px', fontStyle: 'bold', color: act.color
      });
      const actDesc = this.add.text(-200, ay + 12, act.desc, {
        fontSize: '9.5px', color: '#94a3b8'
      });
      const enterIcon = this.add.text(190, ay, '▶', {
        fontSize: '14px', fontStyle: 'bold', color: act.color
      }).setOrigin(0.5);

      actBox.on('pointerover', () => actBox.setFillStyle(0x182c44, 1));
      actBox.on('pointerout', () => actBox.setFillStyle(0x0f1b2b, 0.95));
      actBox.on('pointerdown', () => {
        const res = act.execute(this);
        if (res && res.msg) {
          this.showFloatingText(this.player.x, this.player.y - 70, res.msg, res.success ? '#4ade80' : '#ff5555');
        }
      });

      panel.add([actBox, actTitle, actDesc, enterIcon]);
    });

    const bottomNote = this.add.text(0, 255, '💡 Chạm vào các tùy chọn trên để thực hiện giao dịch, nhận quà hoặc học hỏi.', {
      fontSize: '9px', color: '#64748b'
    }).setOrigin(0.5);
    panel.add(bottomNote);

    this.activeModal = panel;
    this.activeModalOverlay = overlay;
  },

  // ----------------------------------------------------------------
  // QUÀ TÂN THỦ & HƯỚNG DẪN NHẬP MÔN
  // ----------------------------------------------------------------
  hasClaimedStarterGift() {
    return !!gameState.claimedStarterGift;
  },

  claimStarterGift() {
    gameState.claimedStarterGift = true;
    addCurrency(gameState, 'silver', 1000);
    if (typeof gameState.herbs !== 'object' || gameState.herbs === null) gameState.herbs = {};
    gameState.herbs['Ngưng Khí Thảo'] = (gameState.herbs['Ngưng Khí Thảo'] || 0) + 10;
    gameState.ores = (gameState.ores || 0) + 5;
    if (!gameState.materials) gameState.materials = {};
    gameState.materials.beastPelts = (gameState.materials.beastPelts || 0) + 5;

    // Tặng kèm Dẫn Khí Quyết nếu chưa có
    if (!gameState.learnedCongPhapIds) gameState.learnedCongPhapIds = [];
    if (!gameState.learnedCongPhapIds.includes('dan_khi_quyet')) {
      gameState.learnedCongPhapIds.push('dan_khi_quyet');
      gameState.activeCongPhapId = 'dan_khi_quyet';
    }

    this.spawnSpellVfx(this.player.x, this.player.y, 'vfx_heal', 1.2, 800, false);
    this.showFloatingText(this.player.x, this.player.y - 80, '🎉 Nhận Quà Tân Thủ: +1.000 Bạc, +10 Thảo, +5 Khoáng, +5 Da Thú, +[Dẫn Khí Quyết]!', '#ffd700', '14px');
    this.updateHUD();
    this.closeModal();
  },

  openNpcGuideModal() {
    this.closeModal();
    const overlay = this.fixed(this.add.rectangle(W / 2, H / 2, W, H, 0x041019, 0.28), 9999);
    const panel = this.fixed(this.add.container(W / 2, H / 2), 10000);
    this.activeModal = panel;
    this.activeModalOverlay = overlay;

    const bg = this.add.rectangle(0, 0, 480, 580, 0x071b25, 0.94).setStrokeStyle(2, 0xcaa765);
    panel.add(bg);

    const title = this.add.text(0, -255, '📜 BÍ KÍP NHẬP MÔN TU TIÊN CHO PHÀM NHÂN', { fontSize: '13.5px', fontStyle: 'bold', color: '#ffd700' }).setOrigin(0.5);
    panel.add(title);
    this.createModalCloseBtn(panel, 215, -255);

    const steps = [
      { num: '1', title: 'SĂN BẮT THÚ HOANG', desc: 'Dùng đòn [ĐÁNH THƯỜNG (F)] săn Thỏ Rừng, Sói Hoang ở bãi cỏ Thanh Vân Thôn để thu thập Da Thú, Lông Thú.' },
      { num: '2', title: 'LĨNH NGỘ DẪN KHÍ QUYẾT', desc: 'Đến [Thương Hội] hoặc gặp [Trưởng Thôn] nhận Dẫn Khí Quyết nhập môn để khai mở kinh mạch tu tiên.' },
      { num: '3', title: 'TĨNH TỌA TỤ KHÍ (PHÍM T)', desc: 'Bật [🧘 TĨNH TỌA] để tụ khí (tăng gấp 3 tốc độ). Tu vi đạt 150 điểm sẽ đột phá bước vào [Luyện Khí Sơ Kỳ].' },
      { num: '4', title: 'DÙNG ĐAN DƯỢC & THẦN THÔNG', desc: 'Khi đạt Luyện Khí, đến [Dược Điếm] luyện Tụ Khí Đan và mở [Tàng Kinh Các] để gắn 5 hệ thần thông chiến đấu.' }
    ];

    steps.forEach((st, idx) => {
      const sy = -160 + idx * 95;
      const sBox = this.add.rectangle(0, sy, 440, 80, 0x101f30).setStrokeStyle(1.2, 0x2563eb);
      const sBadge = this.add.circle(-190, sy, 18, 0x1d4ed8).setStrokeStyle(1.5, 0x60a5fa);
      const sNum = this.add.text(-190, sy, st.num, { fontSize: '12px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
      const sTitle = this.add.text(-160, sy - 18, st.title, { fontSize: '11px', fontStyle: 'bold', color: '#93c5fd' });
      const sDesc = this.add.text(-160, sy + 10, st.desc, { fontSize: '9px', color: '#cbd5e1', wordWrap: { width: 340 }, lineSpacing: 3 });
      panel.add([sBox, sBadge, sNum, sTitle, sDesc]);
    });

    this.activeModal = panel;
    this.activeModalOverlay = overlay;
  },

  // ----------------------------------------------------------------
  // GIAO DỊCH VỚI NPC (MUA / BÁN TÀI NGUYÊN)
  // ----------------------------------------------------------------
  tradeWithNpc(type, payload) {
    const c = ensureCurrencies(gameState);

    if (type === 'buy_ores') {
      if (c.silver < payload.costSilver) {
        this.showFloatingText(this.player.x, this.player.y - 60, `Không đủ Bạc! Cần ${payload.costSilver} Bạc.`, '#ff5555');
        return { success: false, msg: 'Không đủ Bạc' };
      }
      deductCurrency(gameState, 'silver', payload.costSilver);
      gameState.ores = (gameState.ores || 0) + payload.addOres;
      this.updateHUD();
      this.showFloatingText(this.player.x, this.player.y - 60, `+${payload.addOres} Khoáng Thạch!`, '#38bdf8');
      return { success: true, msg: `Đã mua ${payload.addOres} Khoáng Thạch!` };
    }

    if (type === 'sell_ores') {
      if ((gameState.ores || 0) < payload.costOres) {
        this.showFloatingText(this.player.x, this.player.y - 60, `Không đủ ${payload.costOres} Khoáng Thạch để bán!`, '#ff5555');
        return { success: false, msg: 'Không đủ Khoáng Thạch' };
      }
      gameState.ores -= payload.costOres;
      addCurrency(gameState, 'silver', payload.addSilver);
      this.updateHUD();
      this.showFloatingText(this.player.x, this.player.y - 60, `+${payload.addSilver} Bạc!`, '#ffd700');
      return { success: true, msg: `Đã bán 5 Khoáng nhận ${payload.addSilver} Bạc!` };
    }

    if (type === 'buy_herbs') {
      if (c.silver < payload.costSilver) {
        this.showFloatingText(this.player.x, this.player.y - 60, `Không đủ Bạc! Cần ${payload.costSilver} Bạc.`, '#ff5555');
        return { success: false, msg: 'Không đủ Bạc' };
      }
      deductCurrency(gameState, 'silver', payload.costSilver);
      if (typeof gameState.herbs !== 'object' || gameState.herbs === null) gameState.herbs = {};
      const herbName = payload.herbName || 'Ngưng Khí Thảo';
      gameState.herbs[herbName] = (gameState.herbs[herbName] || 0) + payload.addHerbs;
      this.updateHUD();
      this.showFloatingText(this.player.x, this.player.y - 60, `+${payload.addHerbs} ${herbName}!`, '#4ade80');
      return { success: true, msg: `Đã mua ${payload.addHerbs} ${herbName}!` };
    }

    return { success: false };
  },

  // ----------------------------------------------------------------
  // UỐNG RƯỢU TẠI TỬU LẦU
  // ----------------------------------------------------------------
  drinkWineAtTavern(costSilver) {
    const c = ensureCurrencies(gameState);
    if (c.silver < costSilver) {
      this.showFloatingText(this.player.x, this.player.y - 60, `Không đủ Bạc! Cần ${costSilver} Bạc để uống rượu.`, '#ff5555');
      return { success: false, msg: 'Không đủ Bạc' };
    }
    deductCurrency(gameState, 'silver', costSilver);
    gameState.mana = gameState.manaMax;
    gameState.activePillBuff = {
      name: 'Trúc Diệp Thanh (Linh Tửu)',
      speed: 2,
      rank: 1,
      durationLeft: 180,
      expiresAt: Date.now() + 180000
    };
    this.updateHUD();
    this.spawnSpellVfx(this.player.x, this.player.y, 'vfx_heal', 1.0, 700, false);
    this.showFloatingText(this.player.x, this.player.y - 70, '🍶 Uống Trúc Diệp Thanh: Hồi 100% MP & Tụ Khí +2/s (180s)!', '#f472b6', '14px');
    return { success: true, msg: 'Đã thưởng thức Trúc Diệp Thanh!' };
  }
};
