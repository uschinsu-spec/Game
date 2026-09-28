/**
 * GearCraftingModal.js
 * Quản lý: openCraftingPanel, equipGearItem, unequipGear, openGearPanel, _showItemPopup
 */
import { CRAFTING_SYSTEM, calculatePillEfficiency, getPlayerPillRank, canCraftRecipe, deductCraftMaterials } from '../../config/craftingData.js';
import { ALL_HERBS, getHerbByName } from '../../config/herbsData.js';
import { INITIAL_ITEMS } from '../../config/itemsData.js';
import { gameState } from '../../state/gameState.js';
import { ensureCurrencies, addCurrency, deductCurrency, hasCurrency } from '../../config/currencyData.js';
import { W, H } from '../constants.js';

export const GearCraftingModal = {
  openCraftingPanel(currentTab = 'pills', pillRankFilter = null) {
    this.closeModal();
    const overlay = this.fixed(this.add.rectangle(W / 2, H / 2, W, H, 0x041019, 0.28), 9999);
    const panel = this.fixed(this.add.container(W / 2, H / 2), 10000);
    this.activeModal = panel;
    this.activeModalOverlay = overlay;

    const bg = this.add.rectangle(0, 0, 480, 660, 0x071b25, 0.94).setStrokeStyle(2, 0x2a5078);
    panel.add(bg);
    const title = this.add.text(0, -305, 'BÁCH NGHỆ: ĐAN - PHÙ - TRẬN', { fontSize: '15px', fontStyle: 'bold', color: '#ffd700' }).setOrigin(0.5);
    panel.add(title);
    this.createModalCloseBtn(panel, 215, -305);

    // 3 Tab Chính
    [{ key: 'pills', label: 'ĐAN DƯỢC' }, { key: 'talismans', label: 'PHÙ LỤC' }, { key: 'formations', label: 'TRẬN PHÁP' }]
      .forEach((tb, idx) => {
        const tx = -140 + idx * 140;
        const isAct = (tb.key === currentTab);
        const tabBg = this.add.rectangle(tx, -265, 130, 28, isAct ? 0x224870 : 0x111e30).setStrokeStyle(1.5, isAct ? 0x66ccff : 0x2d4466).setInteractive({ useHandCursor: true });
        const tabTxt = this.add.text(tx, -265, tb.label, { fontSize: '11px', fontStyle: 'bold', color: isAct ? '#ffffff' : '#88aacc' }).setOrigin(0.5);
        tabBg.on('pointerdown', () => this.openCraftingPanel(tb.key));
        panel.add([tabBg, tabTxt]);
      });

    if (currentTab === 'pills') {
      const playerRank = getPlayerPillRank(gameState.realmIdx);
      const activeRank = pillRankFilter || (playerRank >= 1 ? playerRank : 1);

      // Sub-tabs: 5 Phẩm Cấp Đan Dược
      const rankTabs = [
        { rank: 1, label: 'Nhất Phẩm (Luyện Khí)' },
        { rank: 2, label: 'Nhị Phẩm (Trúc Cơ)' },
        { rank: 3, label: 'Tam Phẩm (Kim Đan)' },
        { rank: 4, label: 'Tứ Phẩm (Nguyên Anh)' },
        { rank: 5, label: 'Ngũ Phẩm (Hóa Thần)' }
      ];

      rankTabs.forEach((rt, idx) => {
        const rx = -176 + (idx % 3) * 176;
        const ry = -230 + Math.floor(idx / 3) * 26;
        const isAct = (rt.rank === activeRank);
        const rBg = this.add.rectangle(rx, ry, 170, 22, isAct ? 0x183a54 : 0x0e1927).setStrokeStyle(1.2, isAct ? 0x38bdf8 : 0x2d4466).setInteractive({ useHandCursor: true });
        const rTxt = this.add.text(rx, ry, rt.label, { fontSize: '9px', fontStyle: 'bold', color: isAct ? '#ffffff' : '#8899aa' }).setOrigin(0.5);
        rBg.on('pointerdown', () => this.openCraftingPanel('pills', rt.rank));
        panel.add([rBg, rTxt]);
      });

      // Active Pill Buff Banner
      const buffBg = this.add.rectangle(0, -188, 440, 32, 0x112233).setStrokeStyle(1.2, 0x336699);
      const buffText = gameState.activePillBuff
        ? `💊 DƯỢC LỰC: [${gameState.activePillBuff.name}]  ·  +${gameState.activePillBuff.speed} Tu Vi/s (Còn ${gameState.activePillBuff.durationLeft}s)`
        : `💊 Trạng thái: Chưa dùng đan dược tăng tốc độ tụ khí. (Cấp nào dùng đan dược cấp đó)`;
      const buffTxt = this.add.text(0, -188, buffText, {
        fontSize: '9.5px', fontStyle: 'bold', color: gameState.activePillBuff ? '#38bdf8' : '#94a3b8'
      }).setOrigin(0.5);
      panel.add([buffBg, buffTxt]);

      const filteredPills = (CRAFTING_SYSTEM.pills || []).filter(p => p.pillRank === activeRank);
      filteredPills.forEach((item, idx) => {
        const iy = -135 + idx * 75;
        const owned = gameState.inventory.pills[item.name] || 0;
        const gradeColor = { 'Cực Phẩm': '#ffaa00', 'Thượng Phẩm': '#ff77ff', 'Trung Phẩm': '#66ccff' }[item.grade] || '#66ff66';
        const itemBox = this.add.rectangle(0, iy, 440, 68, 0x122035).setStrokeStyle(1.5, parseInt(gradeColor.replace('#', ''), 16));
        
        const gradeBadge = this.add.text(-205, iy - 22, `[${item.rank} • ${item.grade}]`, { fontSize: '9.5px', fontStyle: 'bold', color: gradeColor });
        const iName = this.add.text(-105, iy - 22, item.name, { fontSize: '11px', fontStyle: 'bold', color: '#ffffff' });
        const iOwned = this.add.text(60, iy - 22, `📦 Có: x${owned}`, { fontSize: '9.5px', fontStyle: 'bold', color: owned > 0 ? '#4ade80' : '#64748b' });

        // Hiệu quả đan dược
        let effStr = item.desc;
        let effColor = '#88bbdd';
        if (item.type === 'cultivation') {
          const check = calculatePillEfficiency(item, gameState.realmIdx);
          if (!check.canUse) {
            effStr = `❌ ${check.reason}`;
            effColor = '#ff5555';
          } else if (check.efficiency < 1.0) {
            effStr = `⚠️ Cảnh giới cao hơn: Dược lực giảm còn ${(check.efficiency * 100).toFixed(1)}% (+${check.effectiveSpeed} Tu Vi/s trong ${item.durationSec}s)`;
            effColor = '#f59e0b';
          } else {
            effStr = `✨ Tương thích hoàn mỹ: +${check.effectiveSpeed} Tu Vi/s (Duy trì ${item.durationSec}s)`;
            effColor = '#38bdf8';
          }
        }
        const iDesc = this.add.text(-205, iy - 7, effStr, { fontSize: '8.5px', color: effColor, wordWrap: { width: 255 } });

        // Hiển thị 3 loại linh thảo yêu cầu kèm số lượng hiện có/cần
        let herbRecipeStr = '';
        if (Array.isArray(item.recipeHerbs)) {
          herbRecipeStr = item.recipeHerbs.map(rh => {
            const hHave = (typeof gameState.herbs === 'object' && gameState.herbs) ? (gameState.herbs[rh.name] || 0) : 0;
            const hIcon = getHerbByName(rh.name)?.emoji || '🌿';
            return `${hIcon}${rh.name}(${hHave}/${rh.count})`;
          }).join('  ');
        } else {
          herbRecipeStr = `${item.costHerbs || 0} Thảo`;
        }
        const costStr = `Dược liệu: ${herbRecipeStr} | ${item.costOres || 0} Khoáng | ${item.costGold || 0} LT`;
        const iCost = this.add.text(-205, iy + 11, costStr, { fontSize: '8px', color: '#ffcc66', wordWrap: { width: 310 } });

        // Nút 1: Luyện Đan (Kiểm tra đủ 3 linh thảo)
        const canCraft = canCraftRecipe(item, gameState);
        const craftBtn = this.add.rectangle(125, iy, 56, 30, canCraft ? 0x884400 : 0x1e293b)
          .setStrokeStyle(1.2, canCraft ? 0xffaa00 : 0x475569)
          .setInteractive({ useHandCursor: canCraft });
        const craftTxt = this.add.text(125, iy, 'Luyện', { fontSize: '10px', fontStyle: 'bold', color: canCraft ? '#ffffff' : '#64748b' }).setOrigin(0.5);

        craftBtn.on('pointerdown', () => {
          if (!canCraftRecipe(item, gameState)) {
            this.showFloatingText(this.player.x, this.player.y - 60, 'Không đủ 3 loại linh thảo hoặc nguyên liệu luyện đan!', '#ff5555');
            return;
          }
          deductCraftMaterials(item, gameState);
          gameState.inventory.pills[item.name] = (gameState.inventory.pills[item.name] || 0) + 1;
          this.showFloatingText(this.player.x, this.player.y - 60, `Luyện thành 1 viên [${item.name}]!`, '#ffd700');
          this.updateHUD();
          this.openCraftingPanel('pills', activeRank);
        });

        // Nút 2: Nuốt Đan / Dùng (Hiện sáng nếu có đan trong túi)
        const canUse = (owned > 0);
        const useBtn = this.add.rectangle(185, iy, 52, 30, canUse ? 0x155e75 : 0x1e293b)
          .setStrokeStyle(1.2, canUse ? 0x38bdf8 : 0x475569)
          .setInteractive({ useHandCursor: canUse });
        const useTxt = this.add.text(185, iy, 'DÙNG', { fontSize: '10px', fontStyle: 'bold', color: canUse ? '#ffffff' : '#64748b' }).setOrigin(0.5);

        useBtn.on('pointerdown', () => {
          if (!canUse) return;
          const res = this.consumePill(item.name);
          if (res.success) {
            this.openCraftingPanel('pills', activeRank);
          }
        });

        panel.add([itemBox, gradeBadge, iName, iOwned, iDesc, iCost, craftBtn, craftTxt, useBtn, useTxt]);
      });

      const bottomHelp = this.add.text(0, 275, '💡 Phối dược: Mỗi loại đan dược cần phối chuẩn xác 3 loại Linh Thảo tương ứng của từng phẩm cấp.', {
        fontSize: '8.5px', color: '#94a3b8'
      }).setOrigin(0.5);
      panel.add(bottomHelp);

    } else {
      // Formations & Talismans
      (CRAFTING_SYSTEM[currentTab] || []).slice(0, 5).forEach((item, idx) => {
        const iy = -180 + idx * 80;
        const gradeColor = { 'Cực Phẩm': '#ffaa00', 'Thượng Phẩm': '#ff77ff', 'Trung Phẩm': '#66ccff' }[item.grade] || '#66ff66';
        const itemBox = this.add.rectangle(0, iy, 440, 70, 0x122035).setStrokeStyle(1.5, parseInt(gradeColor.replace('#', ''), 16));
        const gradeBadge = this.add.text(-205, iy - 22, `[${item.rank} • ${item.grade}]`, { fontSize: '10px', fontStyle: 'bold', color: gradeColor });
        const iName = this.add.text(-105, iy - 22, item.name, { fontSize: '12px', fontStyle: 'bold', color: '#ffffff' });
        const iDesc = this.add.text(-205, iy - 5, item.desc, { fontSize: '9px', color: '#88bbdd' });

        let herbRecipeStr = '';
        if (Array.isArray(item.recipeHerbs)) {
          herbRecipeStr = item.recipeHerbs.map(rh => {
            const hHave = (typeof gameState.herbs === 'object' && gameState.herbs) ? (gameState.herbs[rh.name] || 0) : 0;
            const hIcon = getHerbByName(rh.name)?.emoji || '🌿';
            return `${hIcon}${rh.name}(${hHave}/${rh.count})`;
          }).join(' ');
        } else {
          herbRecipeStr = `${item.costHerbs || 0} Thảo`;
        }
        const iCost = this.add.text(-205, iy + 13, `Cần: ${herbRecipeStr} | ${item.costOres || 0} Khoáng | ${item.costGold} LT`, { fontSize: '8px', color: '#ffcc66', wordWrap: { width: 360 } });

        const canCraft = canCraftRecipe(item, gameState);
        const actionBtn = this.add.rectangle(170, iy, 75, 30, canCraft ? 0x884400 : 0x223344).setStrokeStyle(1.5, canCraft ? 0xffaa00 : 0x445566).setInteractive({ useHandCursor: canCraft });
        const btnLabel = currentTab === 'formations' ? (gameState.inventory.formations.includes(item.name) ? 'Đã Có' : 'Bố Trí') : 'Luyện';
        const actionTxt = this.add.text(170, iy, btnLabel, { fontSize: '11px', fontStyle: 'bold', color: canCraft ? '#ffffff' : '#778899' }).setOrigin(0.5);

        actionBtn.on('pointerdown', () => {
          if (!canCraftRecipe(item, gameState)) {
            this.showFloatingText(this.player.x, this.player.y - 60, 'Không đủ nguyên liệu phối chế!', '#ff5555');
            return;
          }
          deductCraftMaterials(item, gameState);
          if (currentTab === 'talismans') {
            gameState.inventory.talismans[item.name] = (gameState.inventory.talismans[item.name] || 0) + 1;
            this.showFloatingText(this.player.x, this.player.y - 60, `Vẽ thành 1 tấm [${item.name}]!`, '#66ffcc');
          } else if (currentTab === 'formations') {
            if (!gameState.inventory.formations.includes(item.name)) gameState.inventory.formations.push(item.name);
            this.showFloatingText(this.player.x, this.player.y - 60, `Bố trí thành công [${item.name}]!`, '#ffd700');
          }
          this.updateHUD();
          this.openCraftingPanel(currentTab);
        });
        panel.add([itemBox, gradeBadge, iName, iDesc, iCost, actionBtn, actionTxt]);
      });
    }

    this.activeModal = panel;
    this.activeModalOverlay = overlay;
  },

  // ----------------------------------------------------------------
  // ----------------------------------------------------------------
  // Gear & Inventory Panel (Hành Trang, Trang Bị & Túi Trữ Vật)

  equipGearItem(item) {
    if (!gameState.equipped) gameState.equipped = {};
    if (!gameState.inventory) gameState.inventory = { items: [], pills: {}, talismans: {}, formations: [] };
    if (!gameState.inventory.items) gameState.inventory.items = [];

    const slotKey = item.type; // 'weapon', 'armor', 'helm', 'boots', 'amulet', 'shield'
    if (gameState.equipped[slotKey]) {
      gameState.inventory.items.push(gameState.equipped[slotKey]);
    }
    const idx = gameState.inventory.items.findIndex(i => i.id === item.id || i.name === item.name);
    if (idx !== -1) gameState.inventory.items.splice(idx, 1);

    gameState.equipped[slotKey] = item;
    this.updateHUD();
    this.openGearPanel();
    this.showFloatingText(this.player.x, this.player.y - 60, `Đã trang bị: ${item.name}!`, '#ffd700');
  },

  unequipGear(slotKey) {
    if (!gameState.equipped || !gameState.equipped[slotKey]) return;
    if (!gameState.inventory) gameState.inventory = { items: [], pills: {}, talismans: {}, formations: [] };
    if (!gameState.inventory.items) gameState.inventory.items = [];

    const item = gameState.equipped[slotKey];
    gameState.equipped[slotKey] = null;
    gameState.inventory.items.push(item);
    this.updateHUD();
    this.openGearPanel();
    this.showFloatingText(this.player.x, this.player.y - 60, `Đã tháo: ${item.name} về túi!`, '#94a3b8');
  },

  openGearPanel(initPage = 0) {
    this.closeModal();
    const overlay = this.fixed(this.add.rectangle(W / 2, H / 2, W, H, 0x041019, 0.28), 9999);
    const panel = this.fixed(this.add.container(W / 2, H / 2), 10000);
    this.activeModal = panel;
    this.activeModalOverlay = overlay;

    // ── NỀN PANEL ────────────────────────────────────────────────────────────
    const bg = this.add.rectangle(0, 0, 490, 700, 0x071b25, 0.94).setStrokeStyle(2, 0xcaa765);
    const headerBg = this.add.rectangle(0, -324, 490, 52, 0x0d2836, 0.96).setStrokeStyle(0);
    const titleTxt = this.add.text(0, -329, '🎒 HÀNH TRANG', { fontSize: '18px', fontStyle: 'bold', color: '#ffd700', fontFamily: 'Be Vietnam Pro, sans-serif' }).setOrigin(0.5);
    const subtitleTxt = this.add.text(0, -309, 'Trang Bị Thân Thể · Túi Trữ Vật Tu Tiên', { fontSize: '11px', color: '#86efac', fontFamily: 'sans-serif' }).setOrigin(0.5);
    panel.add([bg, headerBg, titleTxt, subtitleTxt]);
    this.createModalCloseBtn(panel, 220, -329);

    // ── TAB BUTTONS ───────────────────────────────────────────────────────────
    let activeTab = initPage < 0 ? 'equip' : 'bag'; // 'equip' | 'bag'
    if (initPage === -1) activeTab = 'equip';

    const makeTab = (label, tabKey, tx) => {
      const isActive = activeTab === tabKey;
      const tabBg = this.add.rectangle(tx, -283, 110, 26, isActive ? 0x1e4060 : 0x0d1a2c, 1)
        .setStrokeStyle(1.5, isActive ? 0x38bdf8 : 0x334466)
        .setInteractive({ useHandCursor: true });
      const tabTxt = this.add.text(tx, -283, label, {
        fontSize: '11px', fontStyle: 'bold', color: isActive ? '#ffffff' : '#64748b'
      }).setOrigin(0.5);
      tabBg.on('pointerdown', () => {
        this.openGearPanel(tabKey === 'equip' ? -1 : 0);
      });
      panel.add([tabBg, tabTxt]);
    };
    makeTab('⚔️ TRANG BỊ', 'equip', -110);
    makeTab('🎒 HÀNH TRANG', 'bag', 80);

    // Tiền tệ nhỏ dưới tab
    const c = ensureCurrencies(gameState);
    const curTxt = this.add.text(0, -260, `🪙 ${(c.silver || 0).toLocaleString()} Bạc   💎 ${(c.low || 0).toLocaleString()} Linh Thạch`, {
      fontSize: '11px', color: '#fde68a', fontFamily: 'sans-serif'
    }).setOrigin(0.5);
    panel.add(curTxt);

    // ─────────────────────────────────────────────────────────────────────────
    // TAB A: TRANG BỊ TRÊN NGƯỜI
    // ─────────────────────────────────────────────────────────────────────────
    if (activeTab === 'equip') {
      const GEAR_SLOTS = [
        { key: 'weapon', name: 'Vũ Khí',     icon: '🗡️', emoji: '🗡️' },
        { key: 'armor',  name: 'Đạo Bào',    icon: '🥋', emoji: '🥋' },
        { key: 'helm',   name: 'Đạo Quán',   icon: '👑', emoji: '👑' },
        { key: 'boots',  name: 'Ngự Hài',    icon: '👟', emoji: '👟' },
        { key: 'amulet', name: 'Ngọc Bội',   icon: '📿', emoji: '📿' },
        { key: 'shield', name: 'Linh Thuẫn', icon: '🛡️', emoji: '🛡️' },
        { key: 'ring',   name: 'Giới Chỉ',   icon: '💍', emoji: '💍' },
        { key: 'cloak',  name: 'Phi Phong',  icon: '🧥', emoji: '🧥' }
      ];
      if (!gameState.equipped) gameState.equipped = {};

      const slotW = 112, slotH = 76, cols = 4;
      const startX = -232, startY = -200;

      GEAR_SLOTS.forEach((slot, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const sx = startX + col * (slotW + 6);
        const sy = startY + row * (slotH + 8);
        const eq = gameState.equipped[slot.key];

        const slotBg = this.add.rectangle(sx + slotW / 2, sy + slotH / 2, slotW, slotH,
          eq ? 0x132a42 : 0x0a1422, 1)
          .setStrokeStyle(1.5, eq ? 0x38bdf8 : 0x1f354d);

        // Slot label (loại trang bị)
        const slotLabel = this.add.text(sx + 6, sy + 6, slot.name, {
          fontSize: '9px', color: '#64748b', fontStyle: 'bold'
        });

        if (eq) {
          const iconEl = (eq.icon && this.textures.exists(eq.icon))
            ? this.add.image(sx + 24, sy + slotH / 2 + 4, eq.icon).setDisplaySize(36, 36)
            : this.add.text(sx + 24, sy + slotH / 2 + 4, slot.emoji, { fontSize: '26px' }).setOrigin(0.5);

          let statStr = '';
          if (eq.bonusDmg)  statStr = `⚔ +${eq.bonusDmg} Công`;
          else if (eq.bonusHp)  statStr = `❤ +${eq.bonusHp} HP`;
          else if (eq.bonusDef) statStr = `🛡 +${eq.bonusDef} Giáp`;
          else if (eq.bonusSpd) statStr = `💨 +${eq.bonusSpd} Tốc`;

          const eqName = this.add.text(sx + 48, sy + 26, eq.name, {
            fontSize: '9.5px', fontStyle: 'bold', color: '#fef08a'
          });
          const eqStat = this.add.text(sx + 48, sy + 44, statStr, {
            fontSize: '9px', color: '#86efac'
          });
          const unBtn = this.add.rectangle(sx + slotW - 24, sy + slotH - 14, 42, 18, 0x3f1d24)
            .setStrokeStyle(1, 0xf87171).setInteractive({ useHandCursor: true });
          const unTxt = this.add.text(sx + slotW - 24, sy + slotH - 14, 'Tháo', {
            fontSize: '8px', fontStyle: 'bold', color: '#fca5a5'
          }).setOrigin(0.5);
          unBtn.on('pointerdown', (pointer) => {
            if (pointer?.event) pointer.event.stopPropagation();
            this.unequipGear(slot.key);
          });
          panel.add([slotBg, slotLabel, iconEl, eqName, eqStat, unBtn, unTxt]);
        } else {
          const emptyIcon = this.add.text(sx + 24, sy + slotH / 2 + 4, slot.emoji, {
            fontSize: '26px', alpha: 0.22
          }).setOrigin(0.5);
          const emptyLbl = this.add.text(sx + 48, sy + slotH / 2, '[Trống]', {
            fontSize: '9px', fontStyle: 'italic', color: '#334155'
          }).setOrigin(0, 0.5);
          panel.add([slotBg, slotLabel, emptyIcon, emptyLbl]);
        }
      });

      // Chỉ số tổng quát của nhân vật
      const statsY = 245;
      const statsBg = this.add.rectangle(0, statsY, 450, 52, 0x0c1828, 1).setStrokeStyle(1, 0x2a4a6a);
      const maxHp = this.calcPlayerMaxHp ? this.calcPlayerMaxHp() : 0;
      const maxMp = this.calcPlayerMaxMp ? this.calcPlayerMaxMp() : 0;
      const dmg   = this.calcPlayerDmg  ? this.calcPlayerDmg()   : 0;
      const statsTxt = this.add.text(0, statsY,
        `❤ HP: ${maxHp}   💧 MP: ${maxMp}   ⚔ Công: ${dmg}`,
        { fontSize: '12px', fontStyle: 'bold', color: '#a7eddb', fontFamily: 'Be Vietnam Pro, sans-serif' }
      ).setOrigin(0.5);
      panel.add([statsBg, statsTxt]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TAB B: HÀNH TRANG - GRID INVENTORY VỚI PHÂN TRANG (SHEETS)
    // ─────────────────────────────────────────────────────────────────────────
    if (activeTab === 'bag') {
      // Tạo danh sách tất cả vật phẩm có trong túi (dạng slot = { id, name, icon, emoji, count, type })
      const buildInventorySlots = () => {
        const slots = [];

        // A. Nguyên liệu yêu thú & Khoáng thạch từ đánh quái (Xếp chồng)
        const mats = [
          { id: 'ore',   name: 'Khoáng Thạch', emoji: '💎', icon: 'mat_ore',         count: gameState.ores  || 0,                    type: 'material', color: '#67e8f9', desc: 'Khoáng thạch tinh luyện rèn đúc' },
          { id: 'pelt',  name: 'Da Thú',        emoji: '🐺', icon: 'mat_beast_pelt',  count: gameState.materials?.beastPelts || 0,    type: 'material', color: '#fbbf24', desc: 'Lột từ dã thú dã ngoại' },
          { id: 'fur',   name: 'Lông Thú',      emoji: '🪶', icon: 'mat_beast_fur',   count: gameState.materials?.beastFurs  || 0,    type: 'material', color: '#e2e8f0', desc: 'Thu thập từ phi cầm dã quái' },
          { id: 'claw',  name: 'Móng Vuốt',     emoji: '🐾', icon: 'mat_beast_claw',  count: gameState.materials?.beastClaws || 0,    type: 'material', color: '#f87171', desc: 'Móng vuốt hung thú trảm quái' },
          { id: 'blood', name: 'Huyết Thú',     emoji: '🩸', icon: 'mat_beast_blood', count: gameState.materials?.beastBlood || 0,    type: 'material', color: '#f43f5e', desc: 'Tinh huyết yêu thú thuần khiết' },
          { id: 'horn',  name: 'Sừng Thú',      emoji: '🦏', icon: 'mat_beast_horn',  count: gameState.materials?.beastHorns || 0,    type: 'material', color: '#c084fc', desc: 'Sừng yêu thú quý hiếm' }
        ];
        mats.forEach(m => { if (m.count > 0) slots.push(m); });

        // B. 50 Loại Linh Thảo Tu Tiên hái được (Mỗi loại chiếm 1 ô riêng biệt & Xếp chồng)
        if (typeof gameState.herbs === 'object' && gameState.herbs !== null) {
          Object.entries(gameState.herbs).forEach(([hName, cnt]) => {
            if (cnt <= 0) return;
            const hDef = getHerbByName(hName);
            slots.push({
              id: 'herb_' + hName,
              name: hName,
              emoji: hDef?.emoji || '🌿',
              icon: hDef?.icon || 'mat_herb',
              count: cnt,
              type: 'herb',
              color: hDef?.color || '#86efac',
              desc: `[${hDef?.rankName || 'Linh Thảo'}] ${hDef?.desc || 'Thảo dược luyện đan'}\nGiá trị: ${hDef?.price || 50} Bạc/cây`,
              herbRef: hDef
            });
          });
        } else if (typeof gameState.herbs === 'number' && gameState.herbs > 0) {
          // Fallback cho save cũ
          slots.push({
            id: 'herb_legacy',
            name: 'Ngưng Khí Thảo',
            emoji: '🌿',
            icon: 'mat_herb',
            count: gameState.herbs,
            type: 'herb',
            color: '#86efac',
            desc: '[Nhất Phẩm] Tụ tập thiên địa linh khí sơ cấp · 30 Bạc/cây',
            herbRef: getHerbByName('Ngưng Khí Thảo')
          });
        }

        // C. Đan dược trong túi (Xếp chồng)
        Object.entries(gameState.inventory?.pills || {}).forEach(([pName, cnt]) => {
          if (cnt <= 0) return;
          const pDef = CRAFTING_SYSTEM.pills.find(p => p.name === pName);
          slots.push({
            id: 'pill_' + pName, name: pName, emoji: '💊',
            icon: pDef?.icon || null, count: cnt, type: 'pill',
            color: '#38bdf8', desc: pDef?.desc || 'Đan dược tu luyện',
            pillRef: pDef
          });
        });

        // D. Phù Lục trong túi (Xếp chồng)
        Object.entries(gameState.inventory?.talismans || {}).forEach(([tName, cnt]) => {
          if (cnt <= 0) return;
          const tDef = CRAFTING_SYSTEM.talismans?.find(t => t.name === tName);
          slots.push({
            id: 'talisman_' + tName, name: tName, emoji: '📜',
            icon: tDef?.icon || null, count: cnt, type: 'talisman',
            color: '#f59e0b', desc: tDef?.desc || 'Phù lục chiến đấu',
            talismanRef: tDef
          });
        });

        // E. Trận Pháp trong túi
        (gameState.inventory?.formations || []).forEach(fName => {
          const fDef = CRAFTING_SYSTEM.formations?.find(f => f.name === fName);
          slots.push({
            id: 'formation_' + fName, name: fName, emoji: '☸️',
            icon: fDef?.icon || null, count: 1, type: 'formation',
            color: '#c084fc', desc: fDef?.desc || 'Trận pháp hộ thể',
            formationRef: fDef
          });
        });

        // F. Trang bị trong túi (chưa mang)
        (gameState.inventory?.items || []).forEach(item => {
          let statStr = '';
          if (item.bonusDmg)  statStr = `⚔+${item.bonusDmg} Công`;
          else if (item.bonusHp)  statStr = `❤+${item.bonusHp} HP`;
          else if (item.bonusDef) statStr = `🛡+${item.bonusDef} Giáp`;
          else if (item.bonusSpd) statStr = `💨+${item.bonusSpd} Tốc`;
          slots.push({
            id: 'gear_' + (item.id ?? item.name), name: item.name, emoji: '⚔️',
            icon: item.icon || null, count: 1, type: 'gear',
            color: '#fef08a', desc: statStr || 'Trang bị',
            itemRef: item
          });
        });

        return slots;
      };

      const allSlots = buildInventorySlots();

      // Kích thước lưới hành trang: 7 cột x 5 hàng = 35 ô/trang (sheet)
      const COLS = 7, ROWS = 5;
      const PAGE_SIZE = COLS * ROWS; // 35 ô/trang
      const CELL = 58;               // Kích thước 1 ô (px)
      const GRID_X = -202;           // Tọa độ trái lưới
      const GRID_Y = -235;           // Tọa độ trên lưới

      // Số trang: Mặc định tối thiểu 4 trang (140 ô chứa), tự mở rộng nếu đầy
      const totalPages = Math.max(4, Math.ceil(allSlots.length / PAGE_SIZE));
      let currentPage = typeof initPage === 'number' && initPage >= 0 ? Math.min(initPage, totalPages - 1) : 0;
      const TOTAL_DISPLAY_SLOTS = PAGE_SIZE * totalPages;

      // Hàm render trang hiện tại
      const renderPage = (page) => {
        // Xóa các ô đã render trước
        if (this._bagCells) {
          this._bagCells.forEach(c => c.destroy(true));
        }
        this._bagCells = [];

        // Header trang thông tin
        const ph = this.add.text(0, -250, `📄 Trang ${page + 1} / ${totalPages}  ·  Đang chứa ${allSlots.length}/${TOTAL_DISPLAY_SLOTS} ô`, {
          fontSize: '10.5px', fontStyle: 'bold', color: '#94a3b8', fontFamily: 'sans-serif'
        }).setOrigin(0.5);
        panel.add(ph);
        this._bagCells.push(ph);

        for (let row = 0; row < ROWS; row++) {
          for (let col = 0; col < COLS; col++) {
            const cellIdx = page * PAGE_SIZE + row * COLS + col;
            const cx = GRID_X + col * (CELL + 3);
            const cy = GRID_Y + row * (CELL + 3);
            const slot = allSlots[cellIdx];

            // Ô nền
            const cellBg = this.add.rectangle(cx + CELL / 2, cy + CELL / 2, CELL, CELL,
              slot ? 0x0f1f35 : 0x080e1c, 1)
              .setStrokeStyle(1, slot ? 0x2a4060 : 0x131d2e);
            if (slot) {
              cellBg.setInteractive({ useHandCursor: true });

              // Hover highlight
              cellBg.on('pointerover', () => cellBg.setStrokeStyle(2, 0x38bdf8));
              cellBg.on('pointerout', () => cellBg.setStrokeStyle(1, 0x2a4060));
            }

            panel.add(cellBg);
            this._bagCells.push(cellBg);

            if (!slot) continue;

            // Icon vật phẩm
            let iconEl;
            if (slot.icon && this.textures.exists(slot.icon)) {
              iconEl = this.add.image(cx + CELL / 2, cy + CELL / 2 - 6, slot.icon)
                .setDisplaySize(36, 36);
            } else {
              iconEl = this.add.text(cx + CELL / 2, cy + CELL / 2 - 6, slot.emoji, {
                fontSize: '26px'
              }).setOrigin(0.5);
            }
            panel.add(iconEl);
            this._bagCells.push(iconEl);

            // Tên ngắn dưới icon
            const shortName = slot.name.split(' ').slice(-1)[0]; // lấy từ cuối
            const nameLbl = this.add.text(cx + CELL / 2, cy + CELL - 14, shortName, {
              fontSize: '7px', color: slot.color || '#cbd5e1', fontStyle: 'bold'
            }).setOrigin(0.5);
            panel.add(nameLbl);
            this._bagCells.push(nameLbl);

            // Số lượng (xếp chồng) ở góc dưới phải
            if (slot.count > 1) {
              const cntBg = this.add.rectangle(cx + CELL - 10, cy + CELL - 12, 24, 15, 0x000000, 0.78);
              const cntTxt = this.add.text(cx + CELL - 10, cy + CELL - 12, `x${slot.count > 999 ? (slot.count / 1000).toFixed(1) + 'k' : slot.count}`, {
                fontSize: '8.5px', fontStyle: 'bold', color: '#fde047'
              }).setOrigin(0.5);
              panel.add([cntBg, cntTxt]);
              this._bagCells.push(cntBg, cntTxt);
            }

            // Click vào ô: Hiện popup nhanh
            cellBg.on('pointerdown', (pointer) => {
              if (pointer?.event) pointer.event.stopPropagation();
              this._showItemPopup(panel, cx, cy, slot, page);
            });
          }
        }

        // Nút ← → điều hướng trang / sheet
        const prevBtn = this.add.rectangle(-195, 285, 58, 34, page > 0 ? 0x1a3048 : 0x0a1422, 1)
          .setStrokeStyle(1.5, page > 0 ? 0x38bdf8 : 0x222222)
          .setInteractive({ useHandCursor: true });
        const prevTxt = this.add.text(-195, 285, '◀', {
          fontSize: '18px', color: page > 0 ? '#7dd3fc' : '#334155'
        }).setOrigin(0.5);
        prevBtn.on('pointerdown', () => {
          if (page > 0) this.openGearPanel(page - 1);
        });

        const nextBtn = this.add.rectangle(195, 285, 58, 34, page < totalPages - 1 ? 0x1a3048 : 0x0a1422, 1)
          .setStrokeStyle(1.5, page < totalPages - 1 ? 0x38bdf8 : 0x222222)
          .setInteractive({ useHandCursor: true });
        const nextTxt = this.add.text(195, 285, '▶', {
          fontSize: '18px', color: page < totalPages - 1 ? '#7dd3fc' : '#334155'
        }).setOrigin(0.5);
        nextBtn.on('pointerdown', () => {
          if (page < totalPages - 1) this.openGearPanel(page + 1);
        });

        // Chấm tròn biểu thị trang (căn giữa)
        const numDots = Math.min(totalPages, 8);
        const dotSpacing = 28;
        const startDotX = -((numDots - 1) * dotSpacing) / 2;

        for (let pi = 0; pi < numDots; pi++) {
          const dx = startDotX + pi * dotSpacing;
          const isCurrent = pi === page;
          const dot = this.add.circle(dx, 285, isCurrent ? 7 : 4,
            isCurrent ? 0x38bdf8 : 0x334466, 1);
          panel.add(dot);
          this._bagCells.push(dot);
          dot.setInteractive({ useHandCursor: true });
          dot.on('pointerdown', () => this.openGearPanel(pi));
        }

        panel.add([prevBtn, prevTxt, nextBtn, nextTxt]);
        this._bagCells.push(prevBtn, prevTxt, nextBtn, nextTxt);
      };

      renderPage(currentPage);

      // Ghi chú túi (nếu trống)
      if (allSlots.length === 0) {
        const emptyTxt = this.add.text(0, 30,
          '🎒 Túi hành trang đang trống.\nHãy đi hái Linh Thảo và săn Dã Thú để tích lũy nguyên liệu!',
          { fontSize: '12px', color: '#475569', align: 'center', lineSpacing: 6 }
        ).setOrigin(0.5);
        panel.add(emptyTxt);
      }
    }

    this.activeModal = panel;
    this.activeModalOverlay = overlay;
  },

  _showItemPopup(panel, cx, cy, slot, page = 0) {
    // Xóa popup cũ nếu đang mở
    if (this._itemPopup) {
      this._itemPopup.destroy(true);
      this._itemPopup = null;
    }

    const popup = this.add.container(0, 10).setDepth(200);

    // Khung Card Thông Tin Vật Phẩm (Chính Giữa Bảng Hành Trang)
    const cardW = 380;
    const cardH = 260;
    const pbg = this.add.rectangle(0, 0, cardW, cardH, 0x071b28, 0.98)
      .setStrokeStyle(2, 0x38bdf8)
      .setInteractive({ useHandCursor: false }); // chặn click xuyên ra ngoài
    pbg.on('pointerdown', (p) => { if (p?.event) p.event.stopPropagation(); });

    // Thanh Header Tiêu Đề
    const headerBar = this.add.rectangle(0, -cardH / 2 + 22, cardW, 42, 0x0e2838, 1);
    const pName = this.add.text(-cardW / 2 + 20, -cardH / 2 + 22, `${slot.emoji || '📦'} ${slot.name}`, {
      fontSize: '13px', fontStyle: 'bold', color: slot.color || '#fde047', fontFamily: 'Be Vietnam Pro, sans-serif'
    }).setOrigin(0, 0.5);

    // Nút X đóng popup chi tiết (không đóng túi đồ)
    const closeBtnBg = this.add.circle(cardW / 2 - 22, -cardH / 2 + 22, 14, 0x991b1b, 1)
      .setStrokeStyle(1.2, 0xfca5a5)
      .setInteractive({ useHandCursor: true });
    const closeBtnTxt = this.add.text(cardW / 2 - 22, -cardH / 2 + 22, '✕', {
      fontSize: '12px', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);
    const doClosePopup = (pointer) => {
      if (pointer?.event) pointer.event.stopPropagation();
      popup.destroy(true);
      this._itemPopup = null;
    };
    closeBtnBg.on('pointerdown', doClosePopup);
    closeBtnTxt.on('pointerdown', doClosePopup);

    // Khung Icon Lớn & Thông Tin Căn Bản
    const iconBox = this.add.rectangle(-125, -28, 68, 68, 0x112c3c, 1).setStrokeStyle(1.5, 0x4ade80);
    const effectiveIcon = slot.icon || slot.iconKey;
    let iconImg;
    if (effectiveIcon && this.textures.exists(effectiveIcon)) {
      iconImg = this.add.image(-125, -28, effectiveIcon).setDisplaySize(56, 56);
    } else {
      iconImg = this.add.text(-125, -28, slot.emoji || '📦', { fontSize: '36px' }).setOrigin(0.5);
    }

    const typeBadgeTxt = this.add.text(-75, -50, `Phân Loại: ${slot.type === 'herb' ? '🌿 Linh Thảo' : (slot.type === 'gear' ? '⚔ Trang Bị' : (slot.type === 'pill' ? '💊 Đan Dược' : '📦 Nguyên Liệu'))}`, {
      fontSize: '10px', fontStyle: 'bold', color: '#7dd3fc'
    });
    const countTxt = this.add.text(-75, -30, `Số Lượng Đang Có: ${slot.count.toLocaleString()} cái`, {
      fontSize: '10.5px', fontStyle: 'bold', color: '#fef08a'
    });

    // Khung Mô Tả Chi Tiết & Thuộc Tính
    const descBox = this.add.rectangle(0, 36, cardW - 30, 60, 0x091b26, 0.95).setStrokeStyle(1, 0x224866);
    const descTxt = this.add.text(-cardW / 2 + 25, 36, slot.desc || 'Vật phẩm tu tiên thu thập trong thế giới.', {
      fontSize: '9.5px', color: '#cbd5e1', wordWrap: { width: cardW - 50 }, lineSpacing: 3
    }).setOrigin(0, 0.5);

    popup.add([pbg, headerBar, pName, closeBtnBg, closeBtnTxt, iconBox, iconImg, typeBadgeTxt, countTxt, descBox, descTxt]);

    // Các Nút Hành Động Ở Chân Card
    const btnY = cardH / 2 - 28;

    if (slot.type === 'pill' && slot.pillRef) {
      const useBtn = this.add.rectangle(0, btnY, 200, 30, 0x166534).setStrokeStyle(1.5, 0x4ade80).setInteractive({ useHandCursor: true });
      const useTxt = this.add.text(0, btnY, '💊 SỬ DỤNG ĐAN DƯỢC', { fontSize: '11px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
      useBtn.on('pointerdown', (pointer) => {
        if (pointer?.event) pointer.event.stopPropagation();
        const res = this.consumePill(slot.name);
        if (res.success) {
          popup.destroy(true);
          this._itemPopup = null;
          this.openGearPanel(page);
        }
      });
      popup.add([useBtn, useTxt]);

    } else if (slot.type === 'gear' && slot.itemRef) {
      const eqBtn = this.add.rectangle(-70, btnY, 130, 30, 0x155e75).setStrokeStyle(1.5, 0x38bdf8).setInteractive({ useHandCursor: true });
      const eqTxt = this.add.text(-70, btnY, '⚔ TRANG BỊ NGAY', { fontSize: '10.5px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
      eqBtn.on('pointerdown', (pointer) => {
        if (pointer?.event) pointer.event.stopPropagation();
        this.equipGearItem(slot.itemRef);
        popup.destroy(true);
        this._itemPopup = null;
      });

      const dropBtn = this.add.rectangle(80, btnY, 110, 30, 0x4c1d24).setStrokeStyle(1.5, 0xf87171).setInteractive({ useHandCursor: true });
      const dropTxt = this.add.text(80, btnY, '🗑️ VỨT BỎ', { fontSize: '10.5px', fontStyle: 'bold', color: '#fca5a5' }).setOrigin(0.5);
      dropBtn.on('pointerdown', (pointer) => {
        if (pointer?.event) pointer.event.stopPropagation();
        const idx = gameState.inventory.items.indexOf(slot.itemRef);
        if (idx !== -1) gameState.inventory.items.splice(idx, 1);
        popup.destroy(true);
        this._itemPopup = null;
        this.openGearPanel(page);
      });
      popup.add([eqBtn, eqTxt, dropBtn, dropTxt]);

    } else if (slot.type === 'herb') {
      const sellPrice = (slot.herbRef?.price || 50);

      const sell1Btn = this.add.rectangle(-80, btnY, 130, 30, 0x78350f).setStrokeStyle(1.5, 0xf59e0b).setInteractive({ useHandCursor: true });
      const sell1Txt = this.add.text(-80, btnY, `🪙 Bán 1 (+${sellPrice} Bạc)`, { fontSize: '10px', fontStyle: 'bold', color: '#fef08a' }).setOrigin(0.5);
      sell1Btn.on('pointerdown', (pointer) => {
        if (pointer?.event) pointer.event.stopPropagation();
        if (!gameState.herbs || !gameState.herbs[slot.name] || gameState.herbs[slot.name] <= 0) return;
        gameState.herbs[slot.name]--;
        if (gameState.herbs[slot.name] <= 0) delete gameState.herbs[slot.name];
        addCurrency(gameState, 'silver', sellPrice);
        this.showFloatingText(this.player.x, this.player.y - 60, `Đã bán 1 [${slot.name}] +${sellPrice} Bạc!`, '#fef08a');
        this.updateHUD();
        popup.destroy(true);
        this._itemPopup = null;
        this.openGearPanel(page);
      });

      const totalSellPrice = sellPrice * slot.count;
      const sellAllBtn = this.add.rectangle(75, btnY, 140, 30, 0x064e3b).setStrokeStyle(1.5, 0x10b981).setInteractive({ useHandCursor: true });
      const sellAllTxt = this.add.text(75, btnY, `💰 Bán Hết (+${totalSellPrice} Bạc)`, { fontSize: '10px', fontStyle: 'bold', color: '#86efac' }).setOrigin(0.5);
      sellAllBtn.on('pointerdown', (pointer) => {
        if (pointer?.event) pointer.event.stopPropagation();
        if (!gameState.herbs || !gameState.herbs[slot.name] || gameState.herbs[slot.name] <= 0) return;
        const count = gameState.herbs[slot.name];
        delete gameState.herbs[slot.name];
        addCurrency(gameState, 'silver', sellPrice * count);
        this.showFloatingText(this.player.x, this.player.y - 60, `Đã bán ${count} [${slot.name}] +${sellPrice * count} Bạc!`, '#86efac');
        this.updateHUD();
        popup.destroy(true);
        this._itemPopup = null;
        this.openGearPanel(page);
      });

      popup.add([sell1Btn, sell1Txt, sellAllBtn, sellAllTxt]);

    } else {
      const closeSimpleBtn = this.add.rectangle(0, btnY, 160, 30, 0x1e293b).setStrokeStyle(1.2, 0x64748b).setInteractive({ useHandCursor: true });
      const closeSimpleTxt = this.add.text(0, btnY, '✕ ĐÓNG THÔNG TIN', { fontSize: '10.5px', fontStyle: 'bold', color: '#cbd5e1' }).setOrigin(0.5);
      closeSimpleBtn.on('pointerdown', doClosePopup);
      popup.add([closeSimpleBtn, closeSimpleTxt]);
    }

    // The inventory can be fixed to the screen while the camera scrolls across
    // combat maps. Phaser hit tests popup children using their own scroll factor.
    popup.setScrollFactor(0, 0);
    popup.list.forEach(child => child.setScrollFactor?.(0, 0));
    panel.add(popup);
    this._itemPopup = popup;
  },

  // ----------------------------------------------------------------
  // BẢNG CHÀO MỪNG / KHỞI ĐẦU GAME (TẠO MỚI / TẢI SAVE)
};
