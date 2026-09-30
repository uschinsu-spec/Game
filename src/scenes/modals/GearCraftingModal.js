/**
 * GearCraftingModal.js
 * Quản lý logic trang bị (equipGearItem, unequipGear) & Popup chi tiết vật phẩm (_showItemPopup).
 *
 * Ghi chú kiến trúc:
 * - openCraftingPanel UI do SimpleCraftingUI.js quản lý duy nhất.
 * - openGearPanel UI do InventoryGridUI.js quản lý duy nhất.
 */
import { CRAFTING_SYSTEM } from '../../config/craftingData.js';
import { getHerbByName } from '../../config/herbsData.js';
import { gameState } from '../../state/gameState.js';
import { ensureCurrencies, addCurrency } from '../../config/currencyData.js';
import { W, H } from '../constants.js';

export const GearCraftingModal = {
  equipGearItem(item) {
    if (!item) return;
    if (!gameState.equipped) gameState.equipped = {};
    if (!gameState.inventory) gameState.inventory = { items: [], pills: {}, talismans: {}, formations: [] };
    if (!gameState.inventory.items) gameState.inventory.items = [];

    const slotKey = item.type; // 'weapon', 'armor', 'helm', 'boots', 'amulet', 'shield', 'ring', 'cloak'
    if (gameState.equipped[slotKey]) {
      gameState.inventory.items.push(gameState.equipped[slotKey]);
    }
    const idx = gameState.inventory.items.findIndex(i => i.id === item.id || i.name === item.name);
    if (idx !== -1) gameState.inventory.items.splice(idx, 1);

    gameState.equipped[slotKey] = item;
    this.updateHUD?.();
    this.openGearPanel?.();
    this.showFloatingText?.(this.player?.x || 0, (this.player?.y || 0) - 60, `Đã trang bị: ${item.name}!`, '#ffd700');
  },

  unequipGear(slotKey) {
    if (!gameState.equipped || !gameState.equipped[slotKey]) return;
    if (!gameState.inventory) gameState.inventory = { items: [], pills: {}, talismans: {}, formations: [] };
    if (!gameState.inventory.items) gameState.inventory.items = [];

    const item = gameState.equipped[slotKey];
    gameState.equipped[slotKey] = null;
    gameState.inventory.items.push(item);
    this.updateHUD?.();
    this.openGearPanel?.();
    this.showFloatingText?.(this.player?.x || 0, (this.player?.y || 0) - 60, `Đã tháo: ${item.name} về túi!`, '#94a3b8');
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
    const countTxt = this.add.text(-75, -30, `Số Lượng Đang Có: ${(slot.count || 1).toLocaleString()} cái`, {
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
        const res = this.consumePill ? this.consumePill(slot.name) : { success: true };
        if (res.success) {
          popup.destroy(true);
          this._itemPopup = null;
          this.openGearPanel?.(page);
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
        this.openGearPanel?.(page);
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
        this.showFloatingText?.(this.player?.x || 0, (this.player?.y || 0) - 60, `Đã bán 1 [${slot.name}] +${sellPrice} Bạc!`, '#fef08a');
        this.updateHUD?.();
        popup.destroy(true);
        this._itemPopup = null;
        this.openGearPanel?.(page);
      });

      const totalSellPrice = sellPrice * (slot.count || 1);
      const sellAllBtn = this.add.rectangle(75, btnY, 140, 30, 0x064e3b).setStrokeStyle(1.5, 0x10b981).setInteractive({ useHandCursor: true });
      const sellAllTxt = this.add.text(75, btnY, `💰 Bán Hết (+${totalSellPrice} Bạc)`, { fontSize: '10px', fontStyle: 'bold', color: '#86efac' }).setOrigin(0.5);
      sellAllBtn.on('pointerdown', (pointer) => {
        if (pointer?.event) pointer.event.stopPropagation();
        if (!gameState.herbs || !gameState.herbs[slot.name] || gameState.herbs[slot.name] <= 0) return;
        const count = gameState.herbs[slot.name];
        delete gameState.herbs[slot.name];
        addCurrency(gameState, 'silver', sellPrice * count);
        this.showFloatingText?.(this.player?.x || 0, (this.player?.y || 0) - 60, `Đã bán ${count} [${slot.name}] +${sellPrice * count} Bạc!`, '#86efac');
        this.updateHUD?.();
        popup.destroy(true);
        this._itemPopup = null;
        this.openGearPanel?.(page);
      });

      popup.add([sell1Btn, sell1Txt, sellAllBtn, sellAllTxt]);

    } else {
      const closeSimpleBtn = this.add.rectangle(0, btnY, 160, 30, 0x1e293b).setStrokeStyle(1.2, 0x64748b).setInteractive({ useHandCursor: true });
      const closeSimpleTxt = this.add.text(0, btnY, '✕ ĐÓNG THÔNG TIN', { fontSize: '10.5px', fontStyle: 'bold', color: '#cbd5e1' }).setOrigin(0.5);
      closeSimpleBtn.on('pointerdown', doClosePopup);
      popup.add([closeSimpleBtn, closeSimpleTxt]);
    }

    popup.setScrollFactor(0, 0);
    popup.list.forEach(child => child.setScrollFactor?.(0, 0));
    panel.add(popup);
    this._itemPopup = popup;
  }
};
