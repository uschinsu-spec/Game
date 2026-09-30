/**
 * NpcMixin.js
 * Quản lý Toàn bộ Hệ Thống NPC Thế Giới & Tương Tác Thao Tác (Mobile & PC)
 */
import { NPCS_DATA, VILLAGE_HOTSPOTS, VILLAGE_DECORATIONS } from '../../config/npcData.js?v=20260929-village-thon-tran-v2';
import { gameState } from '../../state/gameState.js';
import { ensureCurrencies, addCurrency, deductCurrency } from '../../config/currencyData.js';
import { W, H } from '../constants.js';

export const NpcMixin = {

  leaveThanhVanVillageDirect() {
    this.closeModal?.();
    this.moveTarget = null;

    const now = Number(this.time?.now || 0);
    const blockedUntil = now + 5000;
    this.villageReentryBlockedUntil = blockedUntil;
    this.portalCooldownUntil = Math.max(Number(this.portalCooldownUntil || 0), blockedUntil);

    // Xuất hiện an toàn ngoài cổng dịch chuyển tại Ngoại Vi (Map 1)
    this.switchMap?.(1, 420, 620);
    return true;
  },

  createNpcs() {
    // Xóa NPC cũ nếu có
    if (this.npcsGroup) {
      this.npcsGroup.forEach(npc => {
        if (npc.container) npc.container.destroy(true);
      });
    }
    this.npcsGroup = [];

    const curMapId = gameState.currentMapId;
    const isHub = Number(curMapId) === 0 || this.currentMap?.isPeaceZone === true || this.currentMap?.uiMode === 'village_hub' || this.currentMap?.uiMode === 'city_hub' || this.currentMap?.uiMode === 'sect_hub';
    if (isHub) return;

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

  clearVillageImageHotspots() {
    if (this.villageHotspotObjects) {
      this.villageHotspotObjects.forEach(obj => obj?.destroy?.());
    }
    this.villageHotspotObjects = [];
  },

  createVillageImageHotspots() {
    this.clearVillageImageHotspots?.();
    const mapId = Number(gameState.currentMapId ?? 0);
    const map = this.currentMap;
    const isHub = mapId === 0 || map?.isPeaceZone === true || map?.uiMode === 'village_hub' || map?.uiMode === 'city_hub' || map?.uiMode === 'sect_hub';
    if (!isHub) return;

    this.villageHotspotObjects = [];

    // Cấu hình tọa độ Touch Zone trực tiếp khớp với các công trình trên hình nền
    let HUB_ELEMENTS = [];

    if (mapId === 0 || map?.uiMode === 'village_hub' || map?.type === 'safe_village') {
      // 1. THÔN TRẤN (Background: THON TRAN.png)
      HUB_ELEMENTS = [
        { npcId: 'truong_thon', name: 'Trưởng thôn',    x: 225, y: 125, width: 160, height: 110 },
        { npcId: 'nong_phu',    name: 'Nông phu',       x: 385, y: 215, width: 140, height: 100 },
        { npcId: 'tho_ren',     name: 'Thợ rèn',        x: 105, y: 315, width: 140, height: 110 },
        { npcId: 'thuong_hoi',  name: 'Thương nhân',    x: 210, y: 405, width: 150, height: 115 },
        { npcId: 'duoc_diem',   name: 'Dược nương',     x: 130, y: 585, width: 140, height: 115 },
        { npcId: 'tuu_lau',     name: 'Chủ tửu quán',   x: 300, y: 550, width: 150, height: 120 },
        { npcId: 'tho_xay',     name: 'Thợ xay',        x: 380, y: 755, width: 130, height: 95 },
        { npcId: 've_si_cong',  name: 'Vệ sĩ cổng',     x: 230, y: 825, width: 170, height: 110 }
      ];
    } else if (map?.uiMode === 'city_hub' || map?.type === 'safe_city') {
      // 2. THÀNH THỊ (Background: THANH THI.PNG)
      HUB_ELEMENTS = [
        { npcId: 'truong_thon', name: 'Phủ Thành Chủ',   x: 270, y: 120, width: 180, height: 115 },
        { npcId: 'thuong_hoi',  name: 'Đấu Giá Các',     x: 120, y: 250, width: 150, height: 115 },
        { npcId: 'nong_phu',    name: 'Tiền Trang',      x: 420, y: 250, width: 150, height: 115 },
        { npcId: 'thuong_hoi',  name: 'Vạn Bảo Thương Hội',x: 270, y: 390, width: 180, height: 115 },
        { npcId: 'tuu_lau',     name: 'Túy Tiên Lầu',    x: 120, y: 530, width: 150, height: 115 },
        { npcId: 'duoc_diem',   name: 'Thiên Đan Các',   x: 420, y: 530, width: 150, height: 115 },
        { npcId: 'tho_ren',     name: 'Thần Khí Phường', x: 120, y: 670, width: 150, height: 115 },
        { npcId: 'vo_quan',     name: 'Thiên Đô Võ Đài', x: 420, y: 670, width: 150, height: 115 },
        { npcId: 've_si_cong',  name: 'Cổng Thành',      x: 270, y: 835, width: 185, height: 115 }
      ];
    } else if (map?.uiMode === 'sect_hub' || map?.type === 'safe_sect') {
      // 3. TÔNG MÔN (Background: TONG MON.PNG)
      HUB_ELEMENTS = [
        { npcId: 'truong_thon', name: 'Đại Điện Chưởng Môn', x: 270, y: 120, width: 180, height: 115 },
        { npcId: 'vo_quan',     name: 'Tàng Kinh Các',       x: 120, y: 250, width: 150, height: 115 },
        { npcId: 'duoc_diem',   name: 'Luyện Đan Điện',      x: 420, y: 250, width: 150, height: 115 },
        { npcId: 'tho_ren',     name: 'Luyện Khí Phường',    x: 120, y: 410, width: 150, height: 115 },
        { npcId: 'truong_thon', name: 'Chấp Pháp Đường',     x: 420, y: 410, width: 150, height: 115 },
        { npcId: 'tuu_lau',     name: 'Nhiệm Vụ Đường',      x: 270, y: 540, width: 180, height: 115 },
        { npcId: 'nong_phu',    name: 'Linh Thú Viên',       x: 120, y: 670, width: 150, height: 115 },
        { npcId: 'vo_quan',     name: 'Diễn Võ Trường',      x: 420, y: 670, width: 150, height: 115 },
        { npcId: 've_si_cong',  name: 'Sơn Môn Xuất Hành',   x: 270, y: 835, width: 185, height: 115 }
      ];
    }

    const resetZone = (zone) => {
      if (!zone || zone.scene == null || zone.active === false) return;
      zone.setFillStyle(0xffe7a0, 0.001);
      zone.setStrokeStyle();
    };

    HUB_ELEMENTS.forEach(el => {
      // Vùng tương tác trong suốt bao phủ toàn bộ công trình và biển hiệu chữ trên hình nền
      if (el.npcId) {
        const zone = this.add.rectangle(el.x, el.y, el.width || 180, el.height || 140, 0xffe7a0, 0.001)
          .setDepth(500)
          .setScrollFactor(0)
          .setInteractive({ useHandCursor: true });

        zone.on('pointerover', () => {
          zone.setFillStyle(0xffe57f, 0.08).setStrokeStyle(2, 0xffe57f, 0.6);
        });

        zone.on('pointerout', () => resetZone(zone));
        zone.on('pointerup', () => resetZone(zone));
        zone.on('pointercancel', () => resetZone(zone));

        zone.on('pointerdown', pointer => {
          this.input?.stopPropagation?.();
          pointer?.event?.stopPropagation?.();
          pointer?.event?.preventDefault?.();
          this.moveTarget = null;

          // Xóa highlight cũ
          this.villageHotspotObjects?.forEach(obj => {
            if (obj?.input) resetZone(obj);
          });

          // Hiệu ứng chớp sáng vàng kim phản hồi tương tác
          zone.setFillStyle(0xffffff, 0.25).setStrokeStyle(3, 0xffd700, 1);
          this.time?.delayedCall?.(150, () => resetZone(zone));

          // Chạm vào Cổng: rời Hub ngay lập tức
          if (el.npcId === 've_si_cong') {
            this.leaveThanhVanVillageDirect?.();
            return;
          }

          // Mở modal tương tác NPC tương ứng
          if (typeof this.openNpcDialogModal === 'function') {
            this.openNpcDialogModal(el.npcId);
          }
        });

        this.villageHotspotObjects.push(zone);
      }
    });

    // ---------------------------------------------------------------
    // THANH TIÊU ĐỀ HIỂN THỊ TÊN MAP AN TOÀN PHÍA TRÊN CÙNG
    // ---------------------------------------------------------------
    const mapName = (map?.name || 'KHU AN TOÀN').toUpperCase();
    let typeBadge = '🏮 THÔN TRẤN';
    let badgeColor = 0x166534; // green-800
    let strokeColor = 0x4ade80; // green-400
    let titleColor = '#fef08a';

    if (map?.uiMode === 'sect_hub' || map?.type === 'safe_sect') {
      typeBadge = '⛩️ TÔNG MÔN';
      badgeColor = 0x581c87; // purple-900
      strokeColor = 0xc084fc; // purple-400
      titleColor = '#f3e8ff';
    } else if (map?.uiMode === 'city_hub' || map?.type === 'safe_city') {
      typeBadge = '🏰 THÀNH THỊ';
      badgeColor = 0x1e3a8a; // blue-900
      strokeColor = 0x60a5fa; // blue-400
      titleColor = '#e0f2fe';
    }

    const headerContainer = this.add.container(W / 2, 34).setDepth(600).setScrollFactor(0);
    
    // Khung nền sang trọng
    const plateWidth = Math.min(480, Math.max(300, mapName.length * 11 + 130));
    const plateHeight = 40;
    const headerBg = this.add.graphics();
    headerBg.fillStyle(0x071b25, 0.92);
    headerBg.fillRoundedRect(-plateWidth / 2, -plateHeight / 2, plateWidth, plateHeight, 8);
    headerBg.lineStyle(1.8, strokeColor, 0.95);
    headerBg.strokeRoundedRect(-plateWidth / 2, -plateHeight / 2, plateWidth, plateHeight, 8);

    // Tag Loại Map (Tông Môn / Thành Thị / Thôn Trấn)
    const badgeGfx = this.add.graphics();
    badgeGfx.fillStyle(badgeColor, 0.95);
    badgeGfx.fillRoundedRect(-plateWidth / 2 + 8, -14, 98, 28, 6);
    badgeGfx.lineStyle(1.2, strokeColor, 0.85);
    badgeGfx.strokeRoundedRect(-plateWidth / 2 + 8, -14, 98, 28, 6);

    const badgeTxt = this.add.text(-plateWidth / 2 + 57, 0, typeBadge, {
      fontFamily: 'Be Vietnam Pro, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Tên Map Nổi Bật
    const maxTextWidth = plateWidth - 125;
    const nameTxt = this.add.text(-plateWidth / 2 + 114, 0, mapName, {
      fontFamily: 'Be Vietnam Pro, sans-serif',
      fontSize: mapName.length > 25 ? '11.5px' : '13px',
      fontStyle: 'bold',
      color: titleColor,
      stroke: '#000000',
      strokeThickness: 2.2,
      wordWrap: { width: maxTextWidth, useAdvancedWrap: true }
    }).setOrigin(0, 0.5);

    headerContainer.add([headerBg, badgeGfx, badgeTxt, nameTxt]);
    this.villageHotspotObjects.push(headerContainer);
  },

  syncVillageHubMode() {
    const mapId = Number(gameState.currentMapId ?? 0);
    const map = this.currentMap;
    const isHub = mapId === 0 || map?.isPeaceZone === true || map?.uiMode === 'village_hub' || map?.uiMode === 'city_hub' || map?.uiMode === 'sect_hub';

    if (isHub) this.enforceVillageHubPresentation();
    else {
      if (this.player) {
        this.player.setVisible(true);
        if (this.player.body) this.player.body.enable = true;
      }
      this.topHudElements?.forEach(el => el?.setVisible?.(this.topHudVisible !== false));
      this.minimapElements?.forEach(el => el?.setVisible?.(this.topHudVisible !== false));
      this.mini?.setVisible?.(this.topHudVisible !== false);
      this.miniMapLabel?.setVisible?.(false);
      this.toggleUiBtnBg?.setVisible?.(true);
      this.toggleUiBtnTxt?.setVisible?.(true);
      this.skillContainer?.setVisible?.(this.skillsVisible !== false);
      this.sideToggleContainer?.setVisible?.(true);
    }

    if (isHub) this.createVillageImageHotspots();
    else this.clearVillageImageHotspots();
  },

  enforceVillageHubPresentation() {
    if (this.player) {
      this.player.setVisible(false).setVelocity?.(0, 0);
      if (this.player.body) this.player.body.enable = false;
    }
    this.moveTarget = null;
    if (this.joy) {
      this.joy.active = false;
      this.joy.id = null;
      this.joy.x = 0;
      this.joy.y = 0;
    }
    if (this.cameras?.main) {
      this.cameras.main.stopFollow();
      this.cameras.main.setScroll(0, 0);
    }

    this.topHudElements?.forEach(el => el?.setVisible?.(false));
    this.minimapElements?.forEach(el => el?.setVisible?.(this.topHudVisible !== false));
    this.mini?.setVisible?.(this.topHudVisible !== false);
    this.miniMapLabel?.setVisible?.(this.topHudVisible !== false);
    this.toggleUiBtnBg?.setVisible?.(false);
    this.toggleUiBtnTxt?.setVisible?.(false);
    this.skillContainer?.setVisible?.(false);
    this.sideToggleContainer?.setVisible?.(false);
    this.joyBase?.setVisible?.(false);
    this.joyKnob?.setVisible?.(false);
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
