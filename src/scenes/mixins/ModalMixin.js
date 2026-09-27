/**
 * ModalMixin.js
 * Quản lý: openQuickSkillSelectModal, openSectPanel, openCharacterPanel,
 *           openMapPanel, openSkillPanel, openCraftingPanel, openGearPanel, closeModal
 */
import { REALMS } from '../../config/realmsData.js';
import { ELEMENTAL_SKILLS, SKILL_MASTERY_TIERS } from '../../config/skillsData.js';
import { CRAFTING_SYSTEM, calculatePillEfficiency, getPlayerPillRank, canCraftRecipe, deductCraftMaterials } from '../../config/craftingData.js';
import { ALL_HERBS, getHerbByName } from '../../config/herbsData.js';
import { INITIAL_ITEMS } from '../../config/itemsData.js';
import { SECTS, SECT_RANKS } from '../../config/sectsData.js';
import { WORLD_REGIONS, ALL_MAPS } from '../../config/regionsData.js';
import { gameState } from '../../state/gameState.js';
import { exportSaveCode, importSaveCode, resetToNewGame, hasLocalSave, loadFromLocalStorage } from '../../state/saveSystem.js';
import { CONG_PHAP_LIST, CONG_PHAP_GRADES, getCongPhapById } from '../../config/congPhapData.js';
import { CURRENCY_TIERS, CURRENCY_MAP, CURRENCY_RATIO, ensureCurrencies, addCurrency, deductCurrency, hasCurrency, exchangeUp, exchangeDown, formatCurrencySummary } from '../../config/currencyData.js';
import { W, H } from '../constants.js';

export const ModalMixin = {
  isModalOpen() {
    return !!(this.activeModal || this.activeModalOverlay || (this.modalLayer && this.modalLayer.list && this.modalLayer.list.length > 0));
  },

  createModalCloseBtn(panel, x = 215, y = -280) {
    const btnBg = this.add.rectangle(x, y, 54, 54, 0xb91c1c, 1)
      .setStrokeStyle(2.5, 0xfecaca)
      .setInteractive({ hitArea: new Phaser.Geom.Rectangle(0, 0, 54, 54), hitAreaCallback: Phaser.Geom.Rectangle.Contains, useHandCursor: true });
    const btnTxt = this.add.text(x, y, '✕', { fontSize: '26px', fontFamily: 'sans-serif', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
    const doClose = pointer => {
      if (pointer?.event) {
        pointer.event.stopPropagation();
        if (pointer.event.preventDefault) pointer.event.preventDefault();
      }
      if (!this.gameplayStarted && (this.activeModal === panel || this.activeModalOverlay)) {
        this.openWelcomeScreenModal();
        return;
      }
      this.closeModal();
    };
    btnBg.on('pointerdown', doClose);
    panel.add([btnBg, btnTxt]);
    return btnBg;
  },

  startNewGameFromWelcome() {
    resetToNewGame();
    this.closeModal();
    this.startGameplayFromState({ forceVillage: true });
    this.showFloatingText(this.player.x, this.player.y - 90, '✨ Chào mừng Đạo Hữu bước vào Thanh Vân Thôn!', '#ffd700', '14px');
  },

  finishLoadedGameFromWelcome() {
    this.closeModal();
    this.startGameplayFromState({ forceVillage: false });
    this.showFloatingText(this.player.x, this.player.y - 90, '⚔️ Khôi phục tiến trình tu tiên thành công!', '#2ecc71', '14px');
  },

  openWelcomeScreenModal() {
    this.closeModal();
    const overlay = this.fixed(this.add.rectangle(W / 2, H / 2, W, H, 0x041019, 1), 290);
    const panel = this.fixed(this.add.container(W / 2, H / 2), 291);
    const bg = this.add.rectangle(0, 0, 480, 580, 0x071b25, 1).setStrokeStyle(2, 0xcaa765);
    panel.add(bg);

    const mainTitle = this.add.text(0, -245, '☯ LINH SƠN PHI KIẾM 3D ☯', { fontSize: '18px', fontStyle: 'bold', color: '#ffd700' }).setStroke('#0a1b24', 3).setOrigin(0.5);
    const subTitle = this.add.text(0, -218, '◈ HÀNH TRÌNH NGHỊCH THIÊN TU TIÊN ◈', { fontSize: '10.5px', fontStyle: 'bold', color: '#88ddff' }).setOrigin(0.5);
    panel.add([mainTitle, subTitle]);

    const opt1Y = -135;
    const opt1Box = this.add.rectangle(0, opt1Y, 440, 84, 0x0a2236, 0.95).setStrokeStyle(1.8, 0x38bdf8).setInteractive({ useHandCursor: true });
    const opt1Icon = this.add.text(-190, opt1Y, '✨', { fontSize: '26px' }).setOrigin(0.5);
    const opt1Title = this.add.text(-160, opt1Y - 18, 'TẠO NHÂN VẬT MỚI', { fontSize: '12.5px', fontStyle: 'bold', color: '#67e8f9' });
    const opt1Desc = this.add.text(-160, opt1Y + 12, 'Khởi đầu tại Thanh Vân Thôn. Dữ liệu cũ trên thiết bị sẽ được thay bằng nhân vật mới.', { fontSize: '9.5px', color: '#94a3b8', wordWrap: { width: 340 } });
    opt1Box.on('pointerdown', pointer => { if (pointer?.event) pointer.event.stopPropagation(); this.startNewGameFromWelcome(); });
    panel.add([opt1Box, opt1Icon, opt1Title, opt1Desc]);

    const opt2Y = -35;
    const opt2Box = this.add.rectangle(0, opt2Y, 440, 84, 0x221634, 0.95).setStrokeStyle(1.8, 0xa855f7).setInteractive({ useHandCursor: true });
    const opt2Icon = this.add.text(-190, opt2Y, '📜', { fontSize: '26px' }).setOrigin(0.5);
    const opt2Title = this.add.text(-160, opt2Y - 18, 'LOAD SAVE / NHẬP MÃ LƯU', { fontSize: '12.5px', fontStyle: 'bold', color: '#d8b4fe' });
    const opt2Desc = this.add.text(-160, opt2Y + 12, 'Khôi phục cảnh giới, vật phẩm, công pháp và bản đồ đã lưu trước khi vào game.', { fontSize: '9.5px', color: '#cbd5e1', wordWrap: { width: 340 } });
    opt2Box.on('pointerdown', pointer => { if (pointer?.event) pointer.event.stopPropagation(); this.openLoadSaveModal(); });
    panel.add([opt2Box, opt2Icon, opt2Title, opt2Desc]);

    const isLocalSave = hasLocalSave();
    const opt3Y = 60;
    const opt3Box = this.add.rectangle(0, opt3Y, 440, 72, isLocalSave ? 0x0d2d22 : 0x0c1622, 0.95)
      .setStrokeStyle(1.8, isLocalSave ? 0x34d399 : 0x27435f)
      .setInteractive({ useHandCursor: isLocalSave });
    const opt3Icon = this.add.text(-190, opt3Y, isLocalSave ? '⚔️' : '💡', { fontSize: '24px' }).setOrigin(0.5);
    const opt3Title = this.add.text(-160, opt3Y - 14, isLocalSave ? 'TIẾP TỤC BẢN LƯU GẦN NHẤT' : 'CHƯA CÓ BẢN LƯU CỤC BỘ', { fontSize: '11.5px', fontStyle: 'bold', color: isLocalSave ? '#6ee7b7' : '#94a3b8' });
    const opt3Desc = this.add.text(-160, opt3Y + 12, isLocalSave ? 'Tải dữ liệu đang lưu trên trình duyệt này rồi mới vào thế giới.' : 'Bạn có thể tạo nhân vật mới hoặc nhập mã save.', { fontSize: '9px', color: isLocalSave ? '#a7f3d0' : '#64748b' });
    if (isLocalSave) {
      opt3Box.on('pointerdown', pointer => {
        if (pointer?.event) pointer.event.stopPropagation();
        const res = loadFromLocalStorage();
        if (res.success) this.finishLoadedGameFromWelcome();
      });
    }
    panel.add([opt3Box, opt3Icon, opt3Title, opt3Desc]);

    const footerTxt = this.add.text(0, 240, 'Chọn Tạo mới hoặc Load Save trước khi vào Thanh Vân Thôn', { fontSize: '9.5px', color: '#557396' }).setOrigin(0.5);
    panel.add(footerTxt);
    this.activeModal = panel;
    this.activeModalOverlay = overlay;
  },

  openLoadSaveModal() {
    this.closeModal();
    const overlay = this.fixed(this.add.rectangle(W / 2, H / 2, W, H, 0x041019, 1), 290);
    const panel = this.fixed(this.add.container(W / 2, H / 2), 291);
    const bg = this.add.rectangle(0, 0, 480, 520, 0x071b25, 1).setStrokeStyle(2, 0xcaa765);
    panel.add(bg);

    const title = this.add.text(0, -225, '📜 LOAD SAVE TRƯỚC KHI VÀO GAME', { fontSize: '15px', fontStyle: 'bold', color: '#ffd700' }).setOrigin(0.5);
    panel.add(title);

    const pasteBtn = this.add.rectangle(0, -125, 440, 46, 0x164e63, 0.95).setStrokeStyle(1.8, 0x06b6d4).setInteractive({ useHandCursor: true });
    const pasteBtnTxt = this.add.text(0, -125, '📋 DÁN MÃ SAVE TỪ CLIPBOARD', { fontSize: '11.5px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
    pasteBtn.on('pointerdown', pointer => {
      if (pointer?.event) pointer.event.stopPropagation();
      if (navigator.clipboard?.readText) {
        navigator.clipboard.readText().then(text => {
          const res = importSaveCode((text || '').trim());
          if (res.success) this.finishLoadedGameFromWelcome();
          else this.promptManualLoad(res.error);
        }).catch(() => this.promptManualLoad());
      } else this.promptManualLoad();
    });
    panel.add([pasteBtn, pasteBtnTxt]);

    const manualBtn = this.add.rectangle(0, -65, 440, 46, 0x3730a3, 0.95).setStrokeStyle(1.8, 0x818cf8).setInteractive({ useHandCursor: true });
    const manualBtnTxt = this.add.text(0, -65, '⌨️ NHẬP / DÁN MÃ SAVE BẰNG TAY', { fontSize: '11.5px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
    manualBtn.on('pointerdown', pointer => { if (pointer?.event) pointer.event.stopPropagation(); this.promptManualLoad(); });
    panel.add([manualBtn, manualBtnTxt]);

    const backBtn = this.add.rectangle(0, 0, 440, 42, 0x1e293b, 0.95).setStrokeStyle(1.2, 0x475569).setInteractive({ useHandCursor: true });
    const backBtnTxt = this.add.text(0, 0, '↩ QUAY LẠI MÀN HÌNH KHỞI ĐẦU', { fontSize: '11px', fontStyle: 'bold', color: '#94a3b8' }).setOrigin(0.5);
    backBtn.on('pointerdown', pointer => { if (pointer?.event) pointer.event.stopPropagation(); this.openWelcomeScreenModal(); });
    panel.add([backBtn, backBtnTxt]);

    const noteTxt = this.add.text(0, 100, 'Sau khi load thành công, game mới khởi tạo map/player và đưa bạn vào đúng tiến trình đã lưu.', { fontSize: '10px', color: '#94a3b8', align: 'center', wordWrap: { width: 410 } }).setOrigin(0.5);
    panel.add(noteTxt);
    this.activeModal = panel;
    this.activeModalOverlay = overlay;
  },

  promptManualLoad(prevError = null) {
    const msg = prevError ? `${prevError}\n\nDán mã lưu game (LSPK_...)` : 'Dán mã lưu game (LSPK_...)';
    const code = window.prompt(msg, '');
    if (!code || !code.trim()) return;
    const res = importSaveCode(code.trim());
    if (res.success) this.finishLoadedGameFromWelcome();
    else alert(res.error || 'Mã lưu không hợp lệ!');
  },

  openSaveGameModal() {
    const saveCode = exportSaveCode();
    window.prompt('Mã lưu game của bạn:', saveCode);
  },

  getLearnedSkills() {
    const learnedIds = new Set(gameState.unlockedSkillIds || []);
    const cpIds = gameState.learnedCongPhapIds || [];
    const cpToSkillsMap = {
      'cp_dan_khi':['kiem_1','ly_1'],'dan_khi_quyet':['kiem_1','ly_1'],'cp_kiem_hoang':['kiem_1'],'cp_kiem_huyen':['kiem_1','kiem_2'],'cp_kiem_dia':['kiem_1','kiem_2','kiem_3','kiem_4'],'cp_kiem_thien':['kiem_1','kiem_2','kiem_3','kiem_4','kiem_5']
    };
    cpIds.forEach(id => { if (cpToSkillsMap[id]) cpToSkillsMap[id].forEach(sId => learnedIds.add(sId)); });
    return ELEMENTAL_SKILLS.filter(s => learnedIds.has(s.id));
  },

  closeModal() {
    if (this._itemPopup) { this._itemPopup.destroy(true); this._itemPopup = null; }
    if (this.activeModalOverlay) { this.activeModalOverlay.destroy(true); this.activeModalOverlay = null; }
    if (this.activeModal) { this.activeModal.destroy(true); this.activeModal = null; }
    if (this.modalLayer) {
      if (this.modalLayer.list && this.modalLayer.list.length > 0) {
        const children = [...this.modalLayer.list];
        children.forEach(c => { if (c && c.destroy) c.destroy(true); });
      }
      this.modalLayer.removeAll(true);
    }
  },
};
