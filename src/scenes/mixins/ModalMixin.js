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

  // Helper: check if any modal is currently open
  isModalOpen() {
    return !!(
      this.activeModal ||
      this.activeModalOverlay ||
      (this.modalLayer && this.modalLayer.list && this.modalLayer.list.length > 0)
    );
  },

  // Helper: creates a prominent, responsive close button with hover/tap effect (optimized for mobile touch & PC)
  createModalCloseBtn(panel, x = 215, y = -280) {
    const btnBg = this.add.rectangle(x, y, 54, 54, 0xb91c1c, 1)
      .setStrokeStyle(2.5, 0xfecaca)
      .setInteractive({
        hitArea: new Phaser.Geom.Rectangle(0, 0, 54, 54),
        hitAreaCallback: Phaser.Geom.Rectangle.Contains,
        useHandCursor: true
      });

    const btnTxt = this.add.text(x, y, '✕', {
      fontSize: '26px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    const doClose = (pointer) => {
      if (pointer?.event) {
        pointer.event.stopPropagation();
        if (pointer.event.preventDefault) pointer.event.preventDefault();
      }
      this.closeModal();
    };

    btnBg.on('pointerover', () => {
      btnBg.setFillStyle(0xdc2626, 1);
      btnTxt.setColor('#fef08a');
    });
    btnBg.on('pointerout', () => {
      btnBg.setFillStyle(0xb91c1c, 1);
      btnTxt.setColor('#ffffff');
    });
    btnBg.on('pointerdown', doClose);
    btnBg.on('pointerup', doClose);

    panel.add([btnBg, btnTxt]);
    return btnBg;
  },

  getLearnedSkills() {
    const learnedIds = new Set(gameState.unlockedSkillIds || []);
    const cpIds = gameState.learnedCongPhapIds || [];

    const cpToSkillsMap = {
      'cp_dan_khi': ['kiem_1', 'ly_1'],
      'dan_khi_quyet': ['kiem_1', 'ly_1'],
      'cp_kiem_hoang': ['kiem_1'],
      'cp_kiem_huyen': ['kiem_1', 'kiem_2'],
      'cp_kiem_dia': ['kiem_1', 'kiem_2', 'kiem_3', 'kiem_4'],
      'cp_kiem_thien': ['kiem_1', 'kiem_2', 'kiem_3', 'kiem_4', 'kiem_5'],
      'cp_hoa_hoang': ['hoa_1'],
      'cp_hoa_huyen': ['hoa_1', 'hoa_2'],
      'cp_hoa_dia': ['hoa_1', 'hoa_2', 'hoa_3', 'hoa_4'],
      'cp_hoa_thien': ['hoa_1', 'hoa_2', 'hoa_3', 'hoa_4', 'hoa_5'],
      'cp_loi_hoang': ['loi_1'],
      'cp_loi_huyen': ['loi_1', 'loi_2'],
      'cp_loi_dia': ['loi_1', 'loi_2', 'loi_3', 'loi_4'],
      'cp_loi_thien': ['loi_1', 'loi_2', 'loi_3', 'loi_4', 'loi_5'],
      'cp_kim_hoang': ['kim_1'],
      'cp_kim_huyen': ['kim_1', 'kim_2'],
      'cp_kim_dia': ['kim_1', 'kim_2', 'kim_3', 'kim_4'],
      'cp_kim_thien': ['kim_1', 'kim_2', 'kim_3', 'kim_4', 'kim_5'],
      'cp_thuy_hoang': ['thuy_1'],
      'cp_thuy_huyen': ['thuy_1', 'thuy_2'],
      'cp_thuy_dia': ['thuy_1', 'thuy_2', 'thuy_3', 'thuy_4'],
      'cp_thuy_thien': ['thuy_1', 'thuy_2', 'thuy_3', 'thuy_4', 'thuy_5'],
      'cp_phong_hoang': ['phong_1'],
      'cp_phong_huyen': ['phong_1', 'phong_2'],
      'cp_phong_dia': ['phong_1', 'phong_2', 'phong_3', 'phong_4'],
      'cp_phong_thien': ['phong_1', 'phong_2', 'phong_3', 'phong_4', 'phong_5'],
      'cp_moc_hoang': ['moc_1'],
      'cp_moc_huyen': ['moc_1', 'moc_2'],
      'cp_moc_dia': ['moc_1', 'moc_2', 'moc_3', 'moc_4'],
      'cp_moc_thien': ['moc_1', 'moc_2', 'moc_3', 'moc_4', 'moc_5'],
      'cp_tho_hoang': ['tho_1'],
      'cp_tho_huyen': ['tho_1', 'tho_2'],
      'cp_tho_dia': ['tho_1', 'tho_2', 'tho_3', 'tho_4'],
      'cp_tho_thien': ['tho_1', 'tho_2', 'tho_3', 'tho_4', 'tho_5'],
      'cp_ly_hoang': ['ly_1'],
      'cp_ly_huyen': ['ly_1', 'ly_2'],
      'cp_ly_dia': ['ly_1', 'ly_2', 'ly_3', 'ly_4'],
      'cp_ly_thien': ['ly_1', 'ly_2', 'ly_3', 'ly_4', 'ly_5']
    };

    cpIds.forEach(id => {
      if (cpToSkillsMap[id]) {
        cpToSkillsMap[id].forEach(sId => learnedIds.add(sId));
      }
    });

    return ELEMENTAL_SKILLS.filter(s => learnedIds.has(s.id));
  },

  // ----------------------------------------------------------------
  // Quick Skill Select (long-press on skill slot)
  // ----------------------------------------------------------------
  openQuickSkillSelectModal(slotIndex) {
    this.closeModal();
    const overlay = this.fixed(this.add.rectangle(W / 2, H / 2, W, H, 0x041019, 0.28), 9999);
    const panel = this.fixed(this.add.container(W / 2, H / 2), 10000);
    this.activeModal = panel;
    this.activeModalOverlay = overlay;

    const bg = this.add.rectangle(0, 0, 480, 620, 0x071b25, 0.94).setStrokeStyle(2, 0x2a5078);
    panel.add(bg);
    const title = this.add.text(0, -280, `CHỌN THẦN THÔNG ĐÃ HỌC Ô [${slotIndex + 1}]`, { fontSize: '15px', fontStyle: 'bold', color: '#ffd700' }).setOrigin(0.5);
    panel.add(title);
    this.createModalCloseBtn(panel, 215, -280);

    // Hàng 2 Nút Hành Động Đầu Bảng: Bỏ chọn ô này / Tháo toàn bộ skill
    const currentSkillId = gameState.equippedSkillIds[slotIndex];
    
    // Nút 1: Bỏ chọn ô này
    const unequipSlotBtn = this.add.rectangle(-112, -240, 216, 34, currentSkillId ? 0x3d1515 : 0x1a222d)
      .setStrokeStyle(1.5, currentSkillId ? 0xff4444 : 0x475569)
      .setInteractive({ useHandCursor: !!currentSkillId });
    const unequipSlotTxt = this.add.text(-112, -240, currentSkillId ? `❌ BỎ CHỌN Ô [${slotIndex + 1}]` : `Ô [${slotIndex + 1}] ĐANG TRỐNG`, {
      fontSize: '10px', fontStyle: 'bold', color: currentSkillId ? '#ff8888' : '#64748b'
    }).setOrigin(0.5);

    unequipSlotBtn.on('pointerdown', () => {
      if (gameState.equippedSkillIds[slotIndex]) {
        gameState.equippedSkillIds = gameState.equippedSkillIds.filter((_, idx) => idx !== slotIndex);
        this.createSkillBar();
        this.openQuickSkillSelectModal(slotIndex);
        this.showFloatingText(this.player.x, this.player.y - 60, `Đã làm trống Ô ${slotIndex + 1}!`, '#ff7777');
      }
    });

    // Nút 2: Tháo toàn bộ 5 ô skill
    const hasAnySkill = (gameState.equippedSkillIds && gameState.equippedSkillIds.length > 0);
    const clearAllBtn = this.add.rectangle(112, -240, 216, 34, hasAnySkill ? 0x581c1c : 0x1a222d)
      .setStrokeStyle(1.5, hasAnySkill ? 0xf43f5e : 0x475569)
      .setInteractive({ useHandCursor: hasAnySkill });
    const clearAllTxt = this.add.text(112, -240, hasAnySkill ? '🗑️ THÁO TOÀN BỘ SKILL (LÀM TRỐNG HẾT)' : 'ĐÃ TRỐNG TOÀN BỘ SKILL', {
      fontSize: '9.5px', fontStyle: 'bold', color: hasAnySkill ? '#fca5a5' : '#64748b'
    }).setOrigin(0.5);

    clearAllBtn.on('pointerdown', () => {
      if (gameState.equippedSkillIds && gameState.equippedSkillIds.length > 0) {
        gameState.equippedSkillIds = [];
        this.createSkillBar();
        this.openQuickSkillSelectModal(slotIndex);
        this.showFloatingText(this.player.x, this.player.y - 60, 'Đã tháo toàn bộ kỹ năng khỏi 5 ô!', '#ff5555', '14px');
      }
    });

    panel.add([unequipSlotBtn, unequipSlotTxt, clearAllBtn, clearAllTxt]);

    // CHỈ HIỂN THỊ KỸ NĂNG ĐÃ HỌC (KỸ NĂNG CHƯA HỌC SẼ KHÔNG XUẤT HIỆN)
    const learnedSkills = this.getLearnedSkills();
    if (learnedSkills.length === 0) {
      const lockBox = this.add.rectangle(0, -50, 440, 200, 0x111c2a, 0.95).setStrokeStyle(1.5, 0xcaa765);
      const lockIcon = this.add.text(0, -115, '🔒', { fontSize: '26px' }).setOrigin(0.5);
      const lockTitle = this.add.text(0, -80, 'CHƯA HỌC THẦN THÔNG TU TIÊN NÀO', { fontSize: '13px', fontStyle: 'bold', color: '#ffd700' }).setOrigin(0.5);
      const lockDesc = this.add.text(0, -10,
        'Hiện tại Đạo Hữu chưa học công pháp nào nên chưa có Thần Thông.\n' +
        'Các kỹ năng chưa học sẽ không xuất hiện tại bảng chọn này.\n\n' +
        '💡 HƯỚNG DẪN HỌC THẦN THÔNG:\n' +
        '1. Đánh quái hoặc thu hái Linh Thảo tại ngoại vi mang về bán lấy Bạc.\n' +
        '2. Vào [Thương Hội (Vạn Bảo Các)] mua 9 Môn Công Pháp Hoàng Giai.\n' +
        '3. Lĩnh ngộ công pháp sẽ lập tức mở khóa Thần Thông tương ứng!',
        { fontSize: '9.5px', color: '#cceeff', align: 'center', lineSpacing: 4 }
      ).setOrigin(0.5);
      panel.add([lockBox, lockIcon, lockTitle, lockDesc]);
    } else {
      learnedSkills.slice(0, 8).forEach((skill, idx) => {
        const sy = -196 + idx * 54;
        const isEquippedAnywhere = gameState.equippedSkillIds.includes(skill.id);
        const equippedSlotIdx = gameState.equippedSkillIds.indexOf(skill.id);
        const mastery = this.getSkillMastery(skill.id);

        const itemBox = this.add.rectangle(0, sy, 440, 48, isEquippedAnywhere ? 0x182c44 : 0x111c2a)
          .setStrokeStyle(1.5, isEquippedAnywhere ? 0x38bdf8 : 0x336699);
        const icon = this.add.image(-190, sy, skill.icon).setDisplaySize(48, 48);
        const sName = this.add.text(-160, sy - 11, `[${skill.elem}] ${skill.name}  [${mastery.tier.name}]`, { fontSize: '11px', fontStyle: 'bold', color: mastery.tier.color });
        const cdLabel = skill.cd > 0 ? `Hồi ${skill.cd / 1000}s` : 'Tốc Đánh (0s)';
        const masteryDmgBonus = Math.round(mastery.tier.dmgBonus * 100);
        
        let equipTagStr = `${cdLabel} • x${skill.dmgMul} ST (+${masteryDmgBonus}%)`;
        if (isEquippedAnywhere) {
          equipTagStr += ` • [Ô ${equippedSlotIdx + 1}]`;
        }
        const sDesc = this.add.text(-160, sy + 6, equipTagStr, { fontSize: '9px', color: isEquippedAnywhere ? '#7dd3fc' : '#88bbdd' });
        
        // Nút Thao Tác Bên Phải: Bỏ Chọn (Đỏ) hoặc Chọn Gắn (Xanh)
        const actionBtn = this.add.rectangle(175, sy, 84, 30, isEquippedAnywhere ? 0x4a1822 : 0x143528)
          .setStrokeStyle(1.2, isEquippedAnywhere ? 0xff4455 : 0x44ff88)
          .setInteractive({ useHandCursor: true });
        const actionTxt = this.add.text(175, sy, isEquippedAnywhere ? '❌ BỎ CHỌN' : `➕ GẮN Ô ${slotIndex + 1}`, {
          fontSize: '9.5px', fontStyle: 'bold', color: isEquippedAnywhere ? '#ff8888' : '#88ffbb'
        }).setOrigin(0.5);

        actionBtn.on('pointerdown', () => {
          if (isEquippedAnywhere) {
            gameState.equippedSkillIds = gameState.equippedSkillIds.filter(id => id !== skill.id);
            this.createSkillBar();
            this.openQuickSkillSelectModal(slotIndex);
            this.showFloatingText(this.player.x, this.player.y - 60, `Đã bỏ chọn [${skill.name}]!`, '#ff7777');
          } else {
            gameState.equippedSkillIds = gameState.equippedSkillIds.filter(id => id !== skill.id);
            if (slotIndex < gameState.equippedSkillIds.length) {
              gameState.equippedSkillIds[slotIndex] = skill.id;
            } else {
              gameState.equippedSkillIds.push(skill.id);
            }
            gameState.equippedSkillIds = gameState.equippedSkillIds.filter(Boolean);
            this.createSkillBar();
            this.openQuickSkillSelectModal(slotIndex);
            this.showFloatingText(this.player.x, this.player.y - 60, `Đã gắn [${skill.name}] vào Ô ${gameState.equippedSkillIds.indexOf(skill.id) + 1}!`, '#66ffcc');
          }
        });

        panel.add([itemBox, icon, sName, sDesc, actionBtn, actionTxt]);
      });
    }

    this.activeModal = panel;
    this.activeModalOverlay = overlay;
  },

  // ----------------------------------------------------------------
  // Sect Panel
  // ----------------------------------------------------------------
  openSectPanel() {
    this.closeModal();
    const overlay = this.fixed(this.add.rectangle(W / 2, H / 2, W, H, 0x041019, 0.28), 9999);
    const panel = this.fixed(this.add.container(W / 2, H / 2), 10000);
    this.activeModal = panel;
    this.activeModalOverlay = overlay;

    const bg = this.add.rectangle(0, 0, 480, 660, 0x071b25, 0.94).setStrokeStyle(2, 0x2a5078);
    panel.add(bg);
    const title = this.add.text(0, -305, 'HỆ THỐNG 8 ĐẠI TÔNG MÔN', { fontSize: '15px', fontStyle: 'bold', color: '#ffd700' }).setOrigin(0.5);
    panel.add(title);
    this.createModalCloseBtn(panel, 215, -305);

    if (gameState.sectId) {
      const sect = SECTS.find(s => s.id === gameState.sectId);
      const rank = SECT_RANKS[gameState.sectRankIdx];
      const nextRank = SECT_RANKS[gameState.sectRankIdx + 1];

      const sectIcon = this.add.image(-160, -220, sect.icon).setDisplaySize(56, 56);
      const sectName = this.add.text(-115, -235, `${sect.name} (${sect.title})`, { fontSize: '14px', fontStyle: 'bold', color: '#66ffcc' });
      const sectInfo = this.add.text(-115, -210, `Chức Vị: ${rank.name}\nCống Hiến: ${gameState.sectContrib} Điểm\nTrấn Phái: ${sect.buffDesc}`, { fontSize: '11px', color: '#cceeff', lineSpacing: 4 });

      const salaryBox = this.add.rectangle(0, -110, 440, 100, 0x111e33, 0.9).setStrokeStyle(1.5, 0x336699);
      const salaryTitle = this.add.text(0, -145, 'Bổng Lộc Môn Phái Hàng Ngày', { fontSize: '12px', fontStyle: 'bold', color: '#ffaa44' }).setOrigin(0.5);
      const salaryDesc = this.add.text(0, -120, `+${rank.salaryGold} L.Thạch, +${rank.salaryHerb} Thảo, +${rank.salaryOre} Khoáng`, { fontSize: '11px', color: '#99bbdd' }).setOrigin(0.5);

      const claimBtn = this.add.rectangle(0, -85, 180, 32, 0x1b4d3e).setStrokeStyle(1.5, 0x33cc88).setInteractive({ useHandCursor: true });
      const claimTxt = this.add.text(0, -85, 'Lãnh Bổng Lộc', { fontSize: '11px', fontStyle: 'bold', color: '#fff' }).setOrigin(0.5);
      claimBtn.on('pointerdown', () => {
        gameState.gold += rank.salaryGold;
        if (typeof gameState.herbs !== 'object' || gameState.herbs === null) gameState.herbs = {};
        const sHerb = 'Ngưng Khí Thảo';
        gameState.herbs[sHerb] = (gameState.herbs[sHerb] || 0) + (rank.salaryHerb || 0);
        gameState.ores += rank.salaryOre;
        this.updateHUD();
        this.showFloatingText(this.player.x, this.player.y - 60, `Nhận bổng lộc: +${rank.salaryGold} L.Thạch!`, '#66ffcc');
      });

      const canPromote = (nextRank && gameState.sectContrib >= nextRank.reqContrib);
      const promoteBtn = this.add.rectangle(0, -20, 440, 38, canPromote ? 0x884400 : 0x223344).setStrokeStyle(1.5, canPromote ? 0xffaa00 : 0x445566).setInteractive({ useHandCursor: canPromote });
      const promoteTxt = this.add.text(0, -20, nextRank ? `Thăng Chức [${nextRank.name}] (Cần ${nextRank.reqContrib} Cống Hiến)` : 'ĐÃ ĐẠT CHỨC VỊ CAO NHẤT', { fontSize: '11px', fontStyle: 'bold', color: canPromote ? '#ffffff' : '#8899aa' }).setOrigin(0.5);
      promoteBtn.on('pointerdown', () => {
        if (canPromote) { gameState.sectRankIdx++; this.updateHUD(); this.openSectPanel(); this.showFloatingText(this.player.x, this.player.y - 60, `Thăng tiến: ${nextRank.name}!`, '#ffd700'); }
      });

      const leaveBtn = this.add.rectangle(0, 270, 160, 28, 0x551111).setStrokeStyle(1, 0xaa3333).setInteractive({ useHandCursor: true });
      const leaveTxt = this.add.text(0, 270, 'Rời Khỏi Môn Phái', { fontSize: '10px', fontStyle: 'bold', color: '#ffaaaa' }).setOrigin(0.5);
      leaveBtn.on('pointerdown', () => {
        gameState.sectId = null; gameState.sectRankIdx = 0; gameState.sectContrib = 0;
        this.updateHUD(); this.openSectPanel();
      });

      panel.add([sectIcon, sectName, sectInfo, salaryBox, salaryTitle, salaryDesc, claimBtn, claimTxt, promoteBtn, promoteTxt, leaveBtn, leaveTxt]);
    } else {
      SECTS.slice(0, 5).forEach((st, idx) => {
        const sy = -220 + idx * 95;
        const cardBg = this.add.rectangle(0, sy, 440, 84, 0x122035).setStrokeStyle(1.5, 0x2a5078);
        const icon = this.add.image(-185, sy, st.icon).setDisplaySize(40, 40);
        const sTitle = this.add.text(-150, sy - 28, `${st.name} [Hệ ${st.elem}]`, { fontSize: '12px', fontStyle: 'bold', color: '#ffd700' });
        const sBuff = this.add.text(-150, sy - 10, st.buffDesc, { fontSize: '10px', color: '#66ffcc' });
        const sDesc = this.add.text(-150, sy + 8, st.desc, { fontSize: '9px', color: '#99bbdd', wordWrap: { width: 260 } });
        const joinBtn = this.add.rectangle(175, sy, 68, 30, 0x1b4d3e).setStrokeStyle(1.5, 0x33cc88).setInteractive({ useHandCursor: true });
        const joinTxt = this.add.text(175, sy, 'Bái Sư', { fontSize: '11px', fontStyle: 'bold', color: '#fff' }).setOrigin(0.5);
        joinBtn.on('pointerdown', () => {
          gameState.sectId = st.id; gameState.sectRankIdx = 0; gameState.sectContrib = 50;
          this.updateHUD(); this.openSectPanel();
          this.showFloatingText(this.player.x, this.player.y - 60, `Bái nhập ${st.name} thành công!`, '#ffd700');
        });
        panel.add([cardBg, icon, sTitle, sBuff, sDesc, joinBtn, joinTxt]);
      });
    }

    this.activeModal = panel;
    this.activeModalOverlay = overlay;
  },

  // ----------------------------------------------------------------
  // Character Panel
  // ----------------------------------------------------------------
  openCharacterPanel() {
    this.closeModal();
    const overlay = this.fixed(this.add.rectangle(W / 2, H / 2, W, H, 0x041019, 0.28), 9999);
    const panel = this.fixed(this.add.container(W / 2, H / 2), 10000);
    this.activeModal = panel;
    this.activeModalOverlay = overlay;

    const bg = this.add.rectangle(0, 0, 480, 660, 0x071b25, 0.94).setStrokeStyle(2, 0x2a5078);
    panel.add(bg);
    const title = this.add.text(0, -305, 'THÔNG TIN TU SĨ & CẢNH GIỚI', { fontSize: '15px', fontStyle: 'bold', color: '#ffd700' }).setOrigin(0.5);
    panel.add(title);
    this.createModalCloseBtn(panel, 215, -305);

    const currentRealm = REALMS[gameState.realmIdx] || REALMS[0];
    const sect = gameState.sectId ? SECTS.find(s => s.id === gameState.sectId) : null;
    const activeCp = gameState.activeCongPhapId ? getCongPhapById(gameState.activeCongPhapId) : null;
    const c = ensureCurrencies(gameState);

    const avatar = this.add.image(-150, -220, 'player_idle', 0).setDisplaySize(68, 68);
    const realmName = this.add.text(5, -240, `${currentRealm.name}`, { fontSize: '15px', fontStyle: 'bold', color: '#66ccff' });
    const sectTag = this.add.text(5, -220, sect ? `${sect.name} [${SECT_RANKS[gameState.sectRankIdx].name}]` : 'Tán Tu Tự Do', { fontSize: '11px', color: '#ffd700' });
    const cpTag = this.add.text(5, -200, activeCp ? `📜 ${activeCp.name} (Hệ ${activeCp.elem} • ${activeCp.grade})` : '⚠️ Chưa Luyện Công Pháp', {
      fontSize: '10.5px', fontStyle: 'bold', color: activeCp ? '#55ff99' : '#ff7777'
    });

    const maxHp = this.calcPlayerMaxHp();
    const maxMp = this.calcPlayerMaxMp();
    const sense = this.calcPlayerSpiritualSense();
    const atkInterval = this.calcPlayerAtkInterval();
    const atkSpeedSec = (1000 / atkInterval).toFixed(1);
    const critRate = (15 + (sense * 0.5)).toFixed(1);
    const totalDmg = this.calcPlayerDmg();
    const totalDef = this.calcPlayerDef();

    // Khung Thông Số Cơ Bản
    const statsBox = this.add.rectangle(0, -95, 440, 120, 0x111e33, 0.9).setStrokeStyle(1.5, 0x336699);
    
    const cpSpeed = activeCp ? `${activeCp.speed}/s (Tĩnh Tọa: +${activeCp.speed * 3}/s)` : '0/s (Chưa Học)';
    const curInfo = `🪙 ${c.silver.toLocaleString()} Bạc  |  💎 ${c.low.toLocaleString()} Sơ  |  🔮 ${c.mid.toLocaleString()} Trung  |  ✨ ${c.high.toLocaleString()} Thượng  |  👑 ${c.extreme.toLocaleString()} Cực`;

    const statsText = this.add.text(-205, -145,
      `❤️ Khí Huyết (HP): ${maxHp}   |   🔷 Pháp Lực (MP): ${gameState.mana || maxMp} / ${maxMp}\n` +
      `⚡ Thần Thức: ${sense} (Tốc đánh: ${atkSpeedSec} đòn/s, Bạo kích: +${critRate}%)\n` +
      `⚔️ Tổng Công Kích: ${totalDmg}   |   🛡️ Hộ Thể Giáp: ${totalDef}\n` +
      `🧘 Tốc Độ Tụ Khí: +${cpSpeed}   |   Tu Vi: ${gameState.exp} / ${currentRealm.expReq}\n` +
      `💰 Tiền Tệ: ${curInfo}`,
      { fontSize: '9.5px', color: '#d4e6ff', lineSpacing: 4 }
    );

    // BẢNG CHI TIẾT CÔNG & GIÁP 9 HỆ (Tu luyện hệ nào tăng Công & Thủ hệ đó, Lên cấp tăng Giáp toàn hệ)
    const elemBox = this.add.rectangle(0, 10, 440, 100, 0x0e1b2e, 0.95).setStrokeStyle(1.2, 0x24496b);
    const elemBoxTitle = this.add.text(-205, -34, '✦ CHI TIẾT CÔNG & GIÁP NGUYÊN TỐ (Lên cấp tăng Giáp mọi hệ | Công pháp cường hóa hệ tu luyện):', {
      fontSize: '8.5px', fontStyle: 'bold', color: '#ffd700'
    });

    const elements = [
      { name: 'Vật Lý', icon: '⚔️' },
      { name: 'Kiếm', icon: '🗡️' },
      { name: 'Kim', icon: '🟡' },
      { name: 'Mộc', icon: '🟢' },
      { name: 'Thủy', icon: '🔵' },
      { name: 'Hỏa', icon: '🔴' },
      { name: 'Thổ', icon: '🟤' },
      { name: 'Phong', icon: '🍃' },
      { name: 'Lôi', icon: '⚡' }
    ];

    const elemElements = [];
    elements.forEach((el, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const ex = -140 + col * 140;
      const ey = -16 + row * 22;
      const dmg = this.calcPlayerElementalDmg(el.name);
      const def = this.calcPlayerElementalDef(el.name);
      const isBoosted = activeCp && (activeCp.elem === el.name || activeCp.elem === 'Toàn Hệ' || (activeCp.elem === 'Kiếm' && el.name === 'Kim') || (activeCp.elem === 'Kim' && el.name === 'Kiếm'));
      const txtColor = isBoosted ? '#55ff99' : '#b0c4de';
      const elText = this.add.text(ex, ey, `${el.icon} ${el.name}: ${dmg} Công / ${def} Giáp`, {
        fontSize: '8.5px', fontStyle: isBoosted ? 'bold' : 'normal', color: txtColor
      }).setOrigin(0.5);
      elemElements.push(elText);
    });

    // Nút Tiền Trang, Công Pháp & Tĩnh Tọa (3 nút cân đối)
    const bankBtn = this.add.rectangle(-145, 95, 135, 34, 0x1e3a1e).setStrokeStyle(1.5, 0x4ade80).setInteractive({ useHandCursor: true });
    const bankTxt = this.add.text(-145, 95, '🏦 TIỀN TRANG', { fontSize: '9.5px', fontStyle: 'bold', color: '#86efac' }).setOrigin(0.5);
    bankBtn.on('pointerdown', () => {
      this.closeModal();
      this.openCurrencyExchangeModal();
    });

    const cpBtn = this.add.rectangle(0, 95, 135, 34, 0x18334d).setStrokeStyle(1.5, 0x00d4ff).setInteractive({ useHandCursor: true });
    const cpBtnTxt = this.add.text(0, 95, '📜 CÔNG PHÁP', { fontSize: '9.5px', fontStyle: 'bold', color: '#00ffff' }).setOrigin(0.5);
    cpBtn.on('pointerdown', () => {
      this.closeModal();
      this.openCongPhapPanel('Hoàng Giai', 'manuals');
    });

    const meditateBtn = this.add.rectangle(145, 95, 135, 34, gameState.isMeditating ? 0x4a1822 : 0x143528)
      .setStrokeStyle(1.5, gameState.isMeditating ? 0xff4455 : 0x44ff88)
      .setInteractive({ useHandCursor: true });
    const medTxt = this.add.text(145, 95, gameState.isMeditating ? '⚔ DỪNG TỌA' : '🧘 TĨNH TỌA (T)', {
      fontSize: '9.5px', fontStyle: 'bold', color: gameState.isMeditating ? '#ff8888' : '#88ffbb'
    }).setOrigin(0.5);
    meditateBtn.on('pointerdown', () => {
      this.toggleMeditation();
      this.openCharacterPanel();
    });

    let btnText = 'TỰ ĐỘNG HẤP THU LINH KHÍ';
    let canBreak = false, requiredPill = null;
    
    // Kiểm tra giới hạn công pháp
    if (activeCp && gameState.realmIdx >= activeCp.maxRealmIdx) {
      btnText = `⛔ CÔNG PHÁP ĐẠT GIỚI HẠN [${activeCp.maxStage}] - HÃY ĐỔI CÔNG PHÁP CAO HƠN!`;
      canBreak = false;
    } else if (gameState.exp >= currentRealm.expReq) {
      if (currentRealm.bottleneck) {
        requiredPill = currentRealm.pillNeeded;
        btnText = `CẦN [${requiredPill}] ĐỘT PHÁ`;
        canBreak = (gameState.inventory.pills[requiredPill] > 0);
      } else { btnText = 'LẬP TỨC ĐỘT PHÁ'; canBreak = true; }
    }

    const breakBtn = this.add.rectangle(0, 160, 440, 44, canBreak ? 0x226633 : 0x223344)
      .setStrokeStyle(1.5, canBreak ? 0x44ff88 : 0x556677).setInteractive({ useHandCursor: canBreak });
    const breakBtnTxt = this.add.text(0, 160, btnText, { fontSize: '11px', fontStyle: 'bold', color: canBreak ? '#ffffff' : '#8899aa' }).setOrigin(0.5);
    breakBtn.on('pointerdown', () => {
      if (!canBreak) {
        if (requiredPill && !gameState.inventory.pills[requiredPill]) {
          this.showFloatingText(this.player.x, this.player.y - 60, `Cần luyện chế [${requiredPill}] tại mục Bách Nghệ!`, '#ff5555');
        }
        return;
      }
      if (requiredPill) gameState.inventory.pills[requiredPill]--;
      if (gameState.realmIdx < REALMS.length - 1) {
        gameState.realmIdx++;
        gameState.exp = 0;
        this.playerHp = this.calcPlayerMaxHp();
        gameState.mana = this.calcPlayerMaxMp();
        this.updateHUD();
        this.openCharacterPanel();
        this.showFloatingText(this.player.x, this.player.y - 60, `ĐỘT PHÁ: ${REALMS[gameState.realmIdx].name}!`, '#ffd700', '18px');
      }
    });

    panel.add([
      avatar, realmName, sectTag, cpTag,
      statsBox, statsText,
      elemBox, elemBoxTitle, ...elemElements,
      bankBtn, bankTxt, cpBtn, cpBtnTxt, meditateBtn, medTxt, breakBtn, breakBtnTxt
    ]);
    this.activeModal = panel;
    this.activeModalOverlay = overlay;
  },

  // ----------------------------------------------------------------
  // Tiền Trang Tu Tiên - Quy Đổi Tiền Tệ Tỷ Lệ 1:10000
  // ----------------------------------------------------------------
  openCurrencyExchangeModal() {
    this.closeModal();
    const overlay = this.fixed(this.add.rectangle(W / 2, H / 2, W, H, 0x041019, 0.28), 9999);
    const panel = this.fixed(this.add.container(W / 2, H / 2), 10000);
    this.activeModal = panel;
    this.activeModalOverlay = overlay;

    const bg = this.add.rectangle(0, 0, 480, 660, 0x071b25, 0.94).setStrokeStyle(2, 0xcaa765);
    panel.add(bg);
    const title = this.add.text(0, -305, '🏦 TIỀN TRANG TU TIÊN & QUY ĐỔI LINH THẠCH', { fontSize: '14.5px', fontStyle: 'bold', color: '#ffd700' }).setOrigin(0.5);
    const subTitle = this.add.text(0, -282, 'Tỷ lệ quy đổi chuẩn thiên địa: 10.000 : 1', { fontSize: '10px', color: '#a5f3fc' }).setOrigin(0.5);
    panel.add([title, subTitle]);
    this.createModalCloseBtn(panel, 215, -305);

    const c = ensureCurrencies(gameState);

    // Khung hiển thị 5 loại tiền tệ
    const curCardsBox = this.add.rectangle(0, -225, 440, 72, 0x111e30, 0.95).setStrokeStyle(1.2, 0x334e68);
    panel.add(curCardsBox);

    const curDisplay = [
      { name: 'Bạc', val: c.silver, icon: '🪙', color: '#cbd5e1' },
      { name: 'Sơ Cấp', val: c.low, icon: '💎', color: '#38bdf8' },
      { name: 'Trung Cấp', val: c.mid, icon: '🔮', color: '#c084fc' },
      { name: 'Thượng Phẩm', val: c.high, icon: '✨', color: '#fde047' },
      { name: 'Cực Phẩm', val: c.extreme, icon: '👑', color: '#f43f5e' }
    ];

    curDisplay.forEach((cd, idx) => {
      const cx = -170 + idx * 85;
      const cy = -225;
      const cIcon = this.add.text(cx, cy - 14, cd.icon, { fontSize: '14px' }).setOrigin(0.5);
      const cName = this.add.text(cx, cy + 2, cd.name, { fontSize: '8.5px', color: '#94a3b8' }).setOrigin(0.5);
      const cVal = this.add.text(cx, cy + 18, cd.val.toLocaleString(), { fontSize: '10px', fontStyle: 'bold', color: cd.color }).setOrigin(0.5);
      panel.add([cIcon, cName, cVal]);
    });

    // 4 Cặp Quy Đổi Liền Kề
    const exchangePairs = [
      {
        title: '🪙 10.000 Bạc  ⇄  💎 1 Linh Thạch Sơ Cấp',
        lowKey: 'silver',
        highKey: 'low',
        lowName: 'Bạc',
        highName: 'LT Sơ Cấp',
        color: '#38bdf8'
      },
      {
        title: '💎 10.000 Sơ Cấp  ⇄  🔮 1 Linh Thạch Trung Cấp',
        lowKey: 'low',
        highKey: 'mid',
        lowName: 'LT Sơ',
        highName: 'LT Trung',
        color: '#c084fc'
      },
      {
        title: '🔮 10.000 Trung Cấp  ⇄  ✨ 1 Linh Thạch Thượng Phẩm',
        lowKey: 'mid',
        highKey: 'high',
        lowName: 'LT Trung',
        highName: 'LT Thượng',
        color: '#fde047'
      },
      {
        title: '✨ 10.000 Thượng Phẩm  ⇄  👑 1 Linh Thạch Cực Phẩm',
        lowKey: 'high',
        highKey: 'extreme',
        lowName: 'LT Thượng',
        highName: 'LT Cực Phẩm',
        color: '#f43f5e'
      }
    ];

    exchangePairs.forEach((pair, idx) => {
      const sy = -135 + idx * 95;
      const pairBox = this.add.rectangle(0, sy, 440, 84, 0x0f1826, 0.95).setStrokeStyle(1.2, 0x224870);
      const pairTitle = this.add.text(-205, sy - 28, pair.title, { fontSize: '10.5px', fontStyle: 'bold', color: pair.color });
      panel.add([pairBox, pairTitle]);

      const lowBal = c[pair.lowKey] || 0;
      const highBal = c[pair.highKey] || 0;

      // Nút 1: Đổi Lên 1 (Hợp Thành: 10,000 Thấp ➔ 1 Cao)
      const canUp1 = lowBal >= CURRENCY_RATIO;
      const btnUp1 = this.add.rectangle(-135, sy + 10, 130, 28, canUp1 ? 0x166534 : 0x1e293b)
        .setStrokeStyle(1.2, canUp1 ? 0x22c55e : 0x475569).setInteractive({ useHandCursor: canUp1 });
      const txtUp1 = this.add.text(-135, sy + 10, `⬆ Đổi 1 ${pair.highName}`, { fontSize: '8.5px', fontStyle: 'bold', color: canUp1 ? '#ffffff' : '#64748b' }).setOrigin(0.5);
      btnUp1.on('pointerdown', () => {
        if (!canUp1) return;
        const res = exchangeUp(gameState, pair.lowKey, 1);
        this.updateHUD();
        this.openCurrencyExchangeModal();
        this.showFloatingText(this.player.x, this.player.y - 60, res.msg, res.success ? '#4ade80' : '#ff5555');
      });

      // Nút 2: Đổi Hết Lên (Max Hợp Thành)
      const maxUp = Math.floor(lowBal / CURRENCY_RATIO);
      const canUpMax = maxUp > 0;
      const btnUpMax = this.add.rectangle(5, sy + 10, 130, 28, canUpMax ? 0x1e3a5f : 0x1e293b)
        .setStrokeStyle(1.2, canUpMax ? 0x38bdf8 : 0x475569).setInteractive({ useHandCursor: canUpMax });
      const txtUpMax = this.add.text(5, sy + 10, canUpMax ? `⬆ Đổi Hết (+${maxUp})` : '⬆ Đổi Hết', { fontSize: '8.5px', fontStyle: 'bold', color: canUpMax ? '#ffffff' : '#64748b' }).setOrigin(0.5);
      btnUpMax.on('pointerdown', () => {
        if (!canUpMax) return;
        const res = exchangeUp(gameState, pair.lowKey, maxUp);
        this.updateHUD();
        this.openCurrencyExchangeModal();
        this.showFloatingText(this.player.x, this.player.y - 60, res.msg, res.success ? '#4ade80' : '#ff5555');
      });

      // Nút 3: Tách Xuống 1 (1 Cao ➔ 10,000 Thấp)
      const canDown1 = highBal >= 1;
      const btnDown1 = this.add.rectangle(145, sy + 10, 130, 28, canDown1 ? 0x7c2d12 : 0x1e293b)
        .setStrokeStyle(1.2, canDown1 ? 0xf97316 : 0x475569).setInteractive({ useHandCursor: canDown1 });
      const txtDown1 = this.add.text(145, sy + 10, `⬇ Tách 1 ➔ 10K ${pair.lowName}`, { fontSize: '8px', fontStyle: 'bold', color: canDown1 ? '#ffffff' : '#64748b' }).setOrigin(0.5);
      btnDown1.on('pointerdown', () => {
        if (!canDown1) return;
        const res = exchangeDown(gameState, pair.highKey, 1);
        this.updateHUD();
        this.openCurrencyExchangeModal();
        this.showFloatingText(this.player.x, this.player.y - 60, res.msg, res.success ? '#fb923c' : '#ff5555');
      });

      panel.add([btnUp1, txtUp1, btnUpMax, txtUpMax, btnDown1, txtDown1]);
    });

    const bottomNote = this.add.text(0, 285, '💡 Mẹo: Có thể nhấn trực tiếp vào ô Tiền Tệ ở đầu màn hình bất kỳ lúc nào để mở Tiền Trang.', {
      fontSize: '8.5px', color: '#94a3b8'
    }).setOrigin(0.5);
    panel.add(bottomNote);

    this.activeModal = panel;
    this.activeModalOverlay = overlay;
  },

  // ----------------------------------------------------------------
  // Công Pháp & Tu Luyện Panel (Manuals, Skills, Exchange)
  // ----------------------------------------------------------------
  openCongPhapPanel(activeGrade = 'Hoàng Giai', activeTab = 'manuals', pageIdx = 0) {
    this.closeModal();
    const overlay = this.fixed(this.add.rectangle(W / 2, H / 2, W, H, 0x041019, 0.28), 290);
    const panel = this.fixed(this.add.container(W / 2, H / 2), 291);

    const bg = this.add.rectangle(0, 0, 480, 660, 0x071b25, 0.94).setStrokeStyle(2, 0xcaa765);
    panel.add(bg);
    const title = this.add.text(0, -305, '📜 CÔNG PHÁP TU TIÊN & TĨNH TỌA', { fontSize: '15px', fontStyle: 'bold', color: '#ffd700' }).setOrigin(0.5);
    panel.add(title);
    this.createModalCloseBtn(panel, 215, -305);

    // 3 Tab chính
    const mainTabs = [
      { key: 'manuals', label: '📜 CÔNG PHÁP TU LUYỆN' },
      { key: 'exchange', label: '🏪 TIỆM DA THÚ (BÁN BẠC)' },
      { key: 'skills', label: '⚡ TÀNG KINH THẦN THÔNG' }
    ];

    mainTabs.forEach((tab, idx) => {
      const tx = -140 + idx * 140;
      const isAct = (tab.key === activeTab);
      const tabBg = this.add.rectangle(tx, -265, 130, 28, isAct ? 0x224870 : 0x111e30).setStrokeStyle(1.5, isAct ? 0x66ccff : 0x2d4466).setInteractive({ useHandCursor: true });
      const tabTxt = this.add.text(tx, -265, tab.label, { fontSize: '9.5px', fontStyle: 'bold', color: isAct ? '#ffffff' : '#88aacc' }).setOrigin(0.5);
      tabBg.on('pointerdown', (pointer) => {
        if (pointer?.event) pointer.event.stopPropagation();
        if (tab.key === 'skills') {
          this.openSkillPanel('Kiếm');
        } else {
          this.openCongPhapPanel(activeGrade, tab.key, 0);
        }
      });
      panel.add([tabBg, tabTxt]);
    });

    if (activeTab === 'manuals') {
      // 4 Phẩm Cấp Tabs
      const gradeKeys = ['Hoàng Giai', 'Huyền Giai', 'Địa Giai', 'Thiên Giai'];
      gradeKeys.forEach((gKey, idx) => {
        const gx = -165 + idx * 110;
        const isAct = (gKey === activeGrade);
        const gInfo = CONG_PHAP_GRADES[gKey] || { colorHex: 0x38bdf8, color: '#38bdf8' };
        const gBg = this.add.rectangle(gx, -230, 102, 26, isAct ? 0x183a54 : 0x0e1927).setStrokeStyle(1.5, isAct ? (gInfo.colorHex || 0x66ccff) : 0x2d4466).setInteractive({ useHandCursor: true });
        const gTxt = this.add.text(gx, -230, `${gKey}`, { fontSize: '10px', fontStyle: 'bold', color: isAct ? gInfo.color : '#8899aa' }).setOrigin(0.5);
        gBg.on('pointerdown', (pointer) => {
          if (pointer?.event) pointer.event.stopPropagation();
          this.openCongPhapPanel(gKey, 'manuals', 0);
        });
        panel.add([gBg, gTxt]);
      });

      // Active Cultivation Banner & Meditate Toggle
      const activeCp = gameState.activeCongPhapId ? getCongPhapById(gameState.activeCongPhapId) : null;
      const bannerBg = this.add.rectangle(0, -188, 440, 42, 0x112233).setStrokeStyle(1.2, 0x336699);
      const bannerTxt = this.add.text(-205, -196, activeCp ? `Đang Vận Hành: [${activeCp.name}] - Phẩm: ${activeCp.grade} (Max: ${activeCp.maxStage})` : '⚠️ Chưa học Công Pháp! Hãy mua 1 môn Hoàng Giai bên dưới để bắt đầu tụ khí.', {
        fontSize: '9.5px', fontStyle: 'bold', color: activeCp ? '#66ffcc' : '#ffaa55'
      });
      const speedTxt = this.add.text(-205, -180, activeCp ? `Tụ Khí: +${activeCp.speed}/s (Tĩnh Tọa: +${activeCp.speed * 3}/s) • Trạng thái: ${gameState.isMeditating ? '🧘 ĐANG TĨNH TỌA' : '⚔ BÌNH THƯỜNG'}` : '💡 Thôn chỉ bán Công Pháp Hoàng Giai sơ cấp. Săn Da Thú đổi ra Bạc để mua!', {
        fontSize: '8.5px', color: '#99ccff'
      });

      const medBtn = this.add.rectangle(165, -188, 90, 28, gameState.isMeditating ? 0x4a1822 : 0x143528).setStrokeStyle(1.2, gameState.isMeditating ? 0xff4455 : 0x44ff88).setInteractive({ useHandCursor: true });
      const medBtnTxt = this.add.text(165, -188, gameState.isMeditating ? 'DỪNG' : '🧘 TĨNH TỌA', { fontSize: '9px', fontStyle: 'bold', color: gameState.isMeditating ? '#ff8888' : '#88ffbb' }).setOrigin(0.5);
      medBtn.on('pointerdown', (pointer) => {
        if (pointer?.event) pointer.event.stopPropagation();
        this.toggleMeditation();
        this.openCongPhapPanel(activeGrade, 'manuals', pageIdx);
      });

      panel.add([bannerBg, bannerTxt, speedTxt, medBtn, medBtnTxt]);

      // Danh sách công pháp của Grade hiện tại
      const gradeList = CONG_PHAP_LIST.filter(c => c.grade === activeGrade);
      const PAGE_SIZE = 4;
      const totalPages = Math.ceil(gradeList.length / PAGE_SIZE) || 1;
      const curPage = Math.min(pageIdx, totalPages - 1);
      const displayedList = gradeList.slice(curPage * PAGE_SIZE, (curPage + 1) * PAGE_SIZE);

      if (activeGrade !== 'Hoàng Giai') {
        const lockNoteBg = this.add.rectangle(0, -145, 440, 26, 0x271216).setStrokeStyle(1, 0xf43f5e);
        const lockNoteTxt = this.add.text(0, -145, `🔒 Ở Thôn không bán! Công Pháp ${activeGrade} chỉ có thể lĩnh ngộ tại Tiên Môn sau khi gia nhập Môn Phái.`, {
          fontSize: '8.5px', fontStyle: 'bold', color: '#fca5a5'
        }).setOrigin(0.5);
        panel.add([lockNoteBg, lockNoteTxt]);
      }

      displayedList.forEach((cp, idx) => {
        const sy = (activeGrade === 'Hoàng Giai' ? -135 : -115) + idx * 82;
        const isLearned = (gameState.learnedCongPhapIds || []).includes(cp.id);
        const isActive = (gameState.activeCongPhapId === cp.id);

        const cardBg = this.add.rectangle(0, sy, 440, 74, isActive ? 0x183344 : (isLearned ? 0x122436 : 0x0f1826))
          .setStrokeStyle(1.5, isActive ? 0x44ff88 : (isLearned ? 0x00d4ff : 0x334466));
        panel.add(cardBg);

        const elemColor = (CONG_PHAP_GRADES[cp.grade] || {}).color || '#ffd700';
        const cName = this.add.text(-205, sy - 24, `[${cp.elem}] ${cp.name}`, { fontSize: '11.5px', fontStyle: 'bold', color: elemColor });
        const cCap = this.add.text(10, sy - 24, `[Max: ${cp.maxStage}]`, { fontSize: '9px', fontStyle: 'bold', color: '#ffaa00' });
        
        let statStr = `+${cp.speed} Tu Vi/s`;
        if (cp.bonusHpPct) statStr += ` • HP +${cp.bonusHpPct}%`;
        if (cp.bonusDmgPct) statStr += ` • Công +${cp.bonusDmgPct}%`;
        if (cp.bonusDefPct) statStr += ` • Giáp +${cp.bonusDefPct}%`;
        if (cp.bonusCritPct) statStr += ` • Bạo +${cp.bonusCritPct}%`;

        const cStats = this.add.text(-205, sy - 6, statStr, { fontSize: '9px', fontStyle: 'bold', color: '#a5f3fc' });
        const cDesc = this.add.text(-205, sy + 12, cp.desc, { fontSize: '8.2px', color: '#7dd3fc', wordWrap: { width: 280 } });
        panel.add([cName, cCap, cStats, cDesc]);

        // Action Button
        if (isActive) {
          const actLabel = this.add.text(160, sy, '⭐ ĐANG DÙNG', { fontSize: '10px', fontStyle: 'bold', color: '#44ff88' }).setOrigin(0.5);
          panel.add(actLabel);
        } else if (isLearned) {
          const equipBtn = this.add.rectangle(160, sy, 90, 32, 0x1b3b5a).setStrokeStyle(1.2, 0x38bdf8).setInteractive({ useHandCursor: true });
          const equipTxt = this.add.text(160, sy, '▶ VẬN HÀNH', { fontSize: '10px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
          equipBtn.on('pointerdown', (pointer) => {
            if (pointer?.event) pointer.event.stopPropagation();
            gameState.activeCongPhapId = cp.id;
            this.playerHpMax = this.calcPlayerMaxHp();
            this.updateHUD();
            this.openCongPhapPanel(activeGrade, 'manuals', curPage);
            this.showFloatingText(this.player.x, this.player.y - 60, `Đã chuyển vận hành: [${cp.name}]!`, '#55ff99');
          });
          panel.add([equipBtn, equipTxt]);
        } else {
          // Chưa học -> Kiểm tra điều kiện mua tại Thôn bằng 10.000 LƯỢNG BẠC
          const currencies = ensureCurrencies(gameState);
          const silverCost = cp.costSilver || 10000;
          const hasSilver = (currencies.silver >= silverCost);
          const canBuy = hasSilver && (cp.villageAvailable !== false);
          const costStr = `${silverCost.toLocaleString()} Bạc`;

          if (cp.villageAvailable === false) {
            const lockBtn = this.add.rectangle(160, sy, 96, 32, 0x1e1e24).setStrokeStyle(1, 0x475569);
            const lockTxt = this.add.text(160, sy, '🔒 TÔNG MÔN', { fontSize: '9px', fontStyle: 'bold', color: '#94a3b8' }).setOrigin(0.5);
            panel.add([lockBtn, lockTxt]);
          } else {
            const buyBtn = this.add.rectangle(160, sy, 96, 32, canBuy ? 0x166534 : 0x2a2a35)
              .setStrokeStyle(1.2, canBuy ? 0x4ade80 : 0x556677)
              .setInteractive({ useHandCursor: canBuy });
            const buyTxt1 = this.add.text(160, sy - 7, '📖 MUA BÍ KÍP', { fontSize: '9px', fontStyle: 'bold', color: canBuy ? '#ffffff' : '#888899' }).setOrigin(0.5);
            const buyTxt2 = this.add.text(160, sy + 7, costStr, { fontSize: '8px', color: canBuy ? '#fef08a' : '#ff7777' }).setOrigin(0.5);

            buyBtn.on('pointerdown', (pointer) => {
              if (pointer?.event) pointer.event.stopPropagation();
              if (!canBuy) {
                this.showFloatingText(this.player.x, this.player.y - 60, `Chưa đủ Ngân Lượng! Cần: ${costStr}. Hãy săn da thú đổi 1 Bạc/cái!`, '#ff5555');
                return;
              }
              deductCurrency(gameState, 'silver', silverCost);

              if (!gameState.learnedCongPhapIds) gameState.learnedCongPhapIds = [];
              gameState.learnedCongPhapIds.push(cp.id);
              gameState.activeCongPhapId = cp.id;

              this.playerHpMax = this.calcPlayerMaxHp();
              this.updateHUD();
              this.openCongPhapPanel(activeGrade, 'manuals', curPage);
              this.showFloatingText(this.player.x, this.player.y - 70, `🎉 Lĩnh ngộ thành công [${cp.name}]!`, '#ffd700', '16px');
            });
            panel.add([buyBtn, buyTxt1, buyTxt2]);
          }
        }
      });

      // Pagination Controls (Trang Trước / Trang Sau)
      if (totalPages > 1) {
        const prevBtn = this.add.rectangle(-80, 230, 100, 26, curPage > 0 ? 0x1e3a5f : 0x111e2e)
          .setStrokeStyle(1, curPage > 0 ? 0x38bdf8 : 0x334455)
          .setInteractive({ useHandCursor: curPage > 0 });
        const prevTxt = this.add.text(-80, 230, '◀ TRANG TRƯỚC', { fontSize: '9px', fontStyle: 'bold', color: curPage > 0 ? '#ffffff' : '#64748b' }).setOrigin(0.5);
        prevBtn.on('pointerdown', (pointer) => {
          if (pointer?.event) pointer.event.stopPropagation();
          if (curPage > 0) this.openCongPhapPanel(activeGrade, 'manuals', curPage - 1);
        });

        const pageLabel = this.add.text(0, 230, `${curPage + 1} / ${totalPages}`, { fontSize: '10px', fontStyle: 'bold', color: '#ffd700' }).setOrigin(0.5);

        const nextBtn = this.add.rectangle(80, 230, 100, 26, curPage < totalPages - 1 ? 0x1e3a5f : 0x111e2e)
          .setStrokeStyle(1, curPage < totalPages - 1 ? 0x38bdf8 : 0x334455)
          .setInteractive({ useHandCursor: curPage < totalPages - 1 });
        const nextTxt = this.add.text(80, 230, 'TRANG SAU ▶', { fontSize: '9px', fontStyle: 'bold', color: curPage < totalPages - 1 ? '#ffffff' : '#64748b' }).setOrigin(0.5);
        nextBtn.on('pointerdown', (pointer) => {
          if (pointer?.event) pointer.event.stopPropagation();
          if (curPage < totalPages - 1) this.openCongPhapPanel(activeGrade, 'manuals', curPage + 1);
        });

        panel.add([prevBtn, prevTxt, pageLabel, nextBtn, nextTxt]);
      }

      // Bottom Note
      const note = this.add.text(0, 280, '💡 Công Pháp Hoàng Giai giá 10.000 Lượng Bạc. Da Lông Thú bán 1 Bạc/cái.', {
        fontSize: '8.8px', color: '#94a3b8'
      }).setOrigin(0.5);
      panel.add(note);

    } else if (activeTab === 'exchange') {
      // TAB TIỆM BÁN DA THÚ & LINH THẢO LẤY BẠC (LINH THẢO THEO PHẨM CẤP, NGUYÊN LIỆU THÚ 1 BẠC/CÁI)
      const c = ensureCurrencies(gameState);
      const mats = gameState.materials || { beastPelts: 0, beastFurs: 0, beastClaws: 0, beastBlood: 0, beastHorns: 0 };
      
      let herbsCount = 0;
      let herbSilverValue = 0;
      if (typeof gameState.herbs === 'object' && gameState.herbs !== null) {
        Object.entries(gameState.herbs).forEach(([hName, count]) => {
          if (count > 0) {
            herbsCount += count;
            const hDef = getHerbByName(hName);
            herbSilverValue += count * (hDef?.sellPrice || 50);
          }
        });
      } else if (typeof gameState.herbs === 'number') {
        herbsCount = gameState.herbs;
        herbSilverValue = herbsCount * 50;
      }
      
      const pelts = mats.beastPelts || 0;
      const furs = mats.beastFurs || 0;
      const claws = mats.beastClaws || 0;
      const blood = mats.beastBlood || 0;
      const horns = mats.beastHorns || 0;

      const headerBox = this.add.rectangle(0, -225, 440, 36, 0x132338).setStrokeStyle(1.2, 0x38bdf8);
      const headerTxt = this.add.text(0, -225, `🪙 ${c.silver.toLocaleString()} Bạc | 🌿 ${herbsCount} Thảo (${herbSilverValue.toLocaleString()} Bạc) | 📦 ${pelts} Da | ${furs} Lông`, {
        fontSize: '9px', fontStyle: 'bold', color: '#fef08a'
      }).setOrigin(0.5);
      panel.add([headerBox, headerTxt]);

      // Nút Lớn: BÁN TẤT CẢ LINH THẢO & NGUYÊN LIỆU
      const totalSilverSellValue = herbSilverValue + (pelts * 1) + (furs * 1) + (claws * 1) + (blood * 1) + (horns * 1);
      const canSellAll = totalSilverSellValue > 0;
      const sellAllBtn = this.add.rectangle(0, -182, 440, 36, canSellAll ? 0x064e3b : 0x1e293b)
        .setStrokeStyle(1.5, canSellAll ? 0x10b981 : 0x475569)
        .setInteractive({ useHandCursor: canSellAll });
      const sellAllTxt = this.add.text(0, -182, canSellAll ? `💰 BÁN HẾT LINH THẢO & NGUYÊN LIỆU (+${totalSilverSellValue.toLocaleString()} BẠC)` : '📦 Túi chưa có Linh Thảo hoặc Da Lông Thú để bán!', {
        fontSize: '9.8px', fontStyle: 'bold', color: canSellAll ? '#ecfdf5' : '#64748b'
      }).setOrigin(0.5);

      sellAllBtn.on('pointerdown', (pointer) => {
        if (pointer?.event) pointer.event.stopPropagation();
        if (!canSellAll) return;
        addCurrency(gameState, 'silver', totalSilverSellValue);
        gameState.herbs = {};
        gameState.materials = { beastPelts: 0, beastFurs: 0, beastClaws: 0, beastBlood: 0, beastHorns: 0, herbs: 0 };
        this.updateHUD();
        this.openCongPhapPanel(activeGrade, 'exchange');
        this.showFloatingText(this.player.x, this.player.y - 70, `🎉 Đã bán hết Linh Thảo & Nguyên Liệu, nhận +${totalSilverSellValue.toLocaleString()} Bạc!`, '#ffd700', '15px');
      });
      panel.add([sellAllBtn, sellAllTxt]);

      const exchangeDeals = [
        {
          name: '🌿 Bán Tất Cả Linh Thảo Thu Bạc',
          cost: `${herbsCount} Linh Thảo`,
          can: herbsCount >= 1,
          desc: `Thương Hội thu mua toàn bộ linh thảo các phẩm cấp trong hành trang (+${herbSilverValue.toLocaleString()} Lượng Bạc).`,
          action: () => {
            addCurrency(gameState, 'silver', herbSilverValue);
            gameState.herbs = {};
            this.updateHUD();
            this.openCongPhapPanel(activeGrade, 'exchange');
            this.showFloatingText(this.player.x, this.player.y - 60, `+${herbSilverValue.toLocaleString()} Bạc!`, '#ffd700');
          }
        },
        {
          name: 'Bán 10 Da Thú ➔ Thu 10 Lượng Bạc',
          cost: '10 Da Thú',
          can: pelts >= 10,
          desc: 'Bán 10 Da Thú thu về 10 lượng bạc (1 Bạc/cái).',
          action: () => {
            gameState.materials.beastPelts -= 10;
            addCurrency(gameState, 'silver', 10);
            this.showFloatingText(this.player.x, this.player.y - 60, '+10 Bạc!', '#cbd5e1');
          }
        },
        {
          name: 'Bán 10 Lông Thú ➔ Thu 10 Lượng Bạc',
          cost: '10 Lông Thú',
          can: furs >= 10,
          desc: 'Lông thú phàm nhân bán giá 1 lượng bạc / cái.',
          action: () => {
            gameState.materials.beastFurs -= 10;
            addCurrency(gameState, 'silver', 10);
            this.showFloatingText(this.player.x, this.player.y - 60, '+10 Bạc!', '#cbd5e1');
          }
        },
        {
          name: 'Bán 10 Móng Vuốt ➔ Thu 10 Lượng Bạc',
          cost: '10 Móng Vuốt',
          can: claws >= 10,
          desc: 'Móng vuốt dã thú bán giá 1 lượng bạc / cái.',
          action: () => {
            gameState.materials.beastClaws -= 10;
            addCurrency(gameState, 'silver', 10);
            this.showFloatingText(this.player.x, this.player.y - 60, '+10 Bạc!', '#cbd5e1');
          }
        },
        {
          name: 'Bán 10 Huyết Thú ➔ Thu 10 Lượng Bạc',
          cost: '10 Huyết Thú',
          can: blood >= 10,
          desc: 'Huyết tinh dã thú phàm trần bán giá 1 lượng bạc / cái.',
          action: () => {
            gameState.materials.beastBlood -= 10;
            addCurrency(gameState, 'silver', 10);
            this.showFloatingText(this.player.x, this.player.y - 60, '+10 Bạc!', '#cbd5e1');
          }
        }
      ];

      exchangeDeals.forEach((deal, idx) => {
        const sy = -125 + idx * 66;
        const dBox = this.add.rectangle(0, sy, 440, 58, 0x0f1826).setStrokeStyle(1.2, 0x224870);
        const dName = this.add.text(-205, sy - 15, deal.name, { fontSize: '10.5px', fontStyle: 'bold', color: '#e2e8f0' });
        const dCost = this.add.text(-205, sy, `Chi phí: ${deal.cost}`, { fontSize: '9px', fontStyle: 'bold', color: '#38bdf8' });
        const dDesc = this.add.text(-205, sy + 14, deal.desc, { fontSize: '8px', color: '#94a3b8' });

        const dBtn = this.add.rectangle(160, sy, 88, 30, deal.can ? 0x166534 : 0x1e293b)
          .setStrokeStyle(1.2, deal.can ? 0x22c55e : 0x475569)
          .setInteractive({ useHandCursor: deal.can });
        const dBtnTxt = this.add.text(160, sy, 'BÁN', { fontSize: '9.5px', fontStyle: 'bold', color: deal.can ? '#ffffff' : '#64748b' }).setOrigin(0.5);

        dBtn.on('pointerdown', (pointer) => {
          if (pointer?.event) pointer.event.stopPropagation();
          if (!deal.can) return;
          deal.action();
          this.updateHUD();
          this.openCongPhapPanel(activeGrade, 'exchange');
        });

        panel.add([dBox, dName, dCost, dDesc, dBtn, dBtnTxt]);
      });

      const bottomNote = this.add.text(0, 280, '💡 Tích lũy đủ 10.000 Lượng Bạc từ săn dã thú (1 Bạc/cái) để mua Công Pháp Hoàng Giai nhập môn.', {
        fontSize: '8.8px', color: '#94a3b8'
      }).setOrigin(0.5);
      panel.add(bottomNote);
    }

    this.activeModal = panel;
    this.activeModalOverlay = overlay;
  },

  // ----------------------------------------------------------------
  // Map Panel
  // ----------------------------------------------------------------
  openMapPanel(activeRegionId = 'nam_lang') {
    this.closeModal();
    const overlay = this.fixed(this.add.rectangle(W / 2, H / 2, W, H, 0x041019, 0.28), 9999);
    const panel = this.fixed(this.add.container(W / 2, H / 2), 10000);
    this.activeModal = panel;
    this.activeModalOverlay = overlay;

    const bg = this.add.rectangle(0, 0, 480, 660, 0x071b25, 0.94).setStrokeStyle(2, 0x2a5078);
    panel.add(bg);
    const title = this.add.text(0, -305, 'ĐẠI BẢN ĐỒ NHÂN GIỚI - 5 ĐẠI VỰC', { fontSize: '15px', fontStyle: 'bold', color: '#ffd700' }).setOrigin(0.5);
    panel.add(title);
    this.createModalCloseBtn(panel, 215, -305);

    WORLD_REGIONS.forEach((reg, idx) => {
      const rx = -180 + (idx % 3) * 120;
      const ry = -260 + Math.floor(idx / 3) * 35;
      const isAct = (reg.id === activeRegionId);
      const regBg = this.add.rectangle(rx, ry, 110, 28, isAct ? 0x224870 : 0x111e30).setStrokeStyle(1.5, isAct ? 0x66ccff : 0x2d4466).setInteractive({ useHandCursor: true });
      const regTxt = this.add.text(rx, ry, reg.name, { fontSize: '10px', fontStyle: 'bold', color: isAct ? '#ffffff' : '#88aacc' }).setOrigin(0.5);
      regBg.on('pointerdown', () => this.openMapPanel(reg.id));
      panel.add([regBg, regTxt]);
    });

    const activeReg = WORLD_REGIONS.find(r => r.id === activeRegionId);
    activeReg.maps.forEach((map, idx) => {
      const sy = -160 + idx * 120;
      const isCurrent = (map.id === gameState.currentMapId);
      const isUnlocked = (gameState.realmIdx >= map.minRealm);
      const cardBg = this.add.rectangle(0, sy, 440, 100, isCurrent ? 0x1d3855 : 0x111c2b)
        .setStrokeStyle(1.5, isCurrent ? 0x44ff88 : (isUnlocked ? 0x336699 : 0x333333)).setInteractive({ useHandCursor: isUnlocked });
      const icon = this.add.image(-170, sy, map.icon).setDisplaySize(48, 48);
      if (!isUnlocked) icon.setTint(0x555555);
      const sName = this.add.text(-130, sy - 22, map.name, { fontSize: '13px', fontStyle: 'bold', color: isUnlocked ? '#ffd700' : '#778899' });
      const sSub = this.add.text(-130, sy, map.sub, { fontSize: '10px', color: '#99bbdd' });
      const statusTxt = this.add.text(140, sy, isCurrent ? 'ĐANG Ở ĐÂY' : (isUnlocked ? 'DỊCH CHUYỂN' : `Y/c: ${REALMS[map.minRealm].name}`), {
        fontSize: '10px', fontStyle: 'bold', color: isCurrent ? '#44ff88' : (isUnlocked ? '#66ccff' : '#ff6666')
      }).setOrigin(0.5);
      cardBg.on('pointerdown', () => {
        if (!isUnlocked) { this.showFloatingText(this.player.x, this.player.y - 60, `Cảnh giới chưa đủ để vào ${map.name}!`, '#ff5555'); return; }
        this.closeModal();
        const enteredMap = this.switchMap(map.id);
        this.showFloatingText(this.player.x, this.player.y - 60, `Đã tiến vào: ${enteredMap.name}!`, '#66ffcc');
      });
      panel.add([cardBg, icon, sName, sSub, statusTxt]);
    });

    this.activeModal = panel;
    this.activeModalOverlay = overlay;
  },

  // ----------------------------------------------------------------
  // Skill / Tàng Kinh Panel
  // ----------------------------------------------------------------
  openSkillPanel(activeElem = 'Kiếm') {
    this.closeModal();
    const overlay = this.fixed(this.add.rectangle(W / 2, H / 2, W, H, 0x041019, 0.28), 9999);
    const panel = this.fixed(this.add.container(W / 2, H / 2), 10000);
    this.activeModal = panel;
    this.activeModalOverlay = overlay;

    const bg = this.add.rectangle(0, 0, 480, 660, 0x071b25, 0.94).setStrokeStyle(2, 0x2a5078);
    panel.add(bg);
    const title = this.add.text(0, -305, 'TÀNG KINH CÁC: 9 ĐẠI HỆ THẦN THÔNG', { fontSize: '15px', fontStyle: 'bold', color: '#ffd700' }).setOrigin(0.5);
    panel.add(title);
    this.createModalCloseBtn(panel, 215, -305);

    // Hàng 1 (5 hệ): Kiếm, Kim, Hỏa, Thủy, Thổ
    const row1 = ['Kiếm', 'Kim', 'Hỏa', 'Thủy', 'Thổ'];
    row1.forEach((elem, idx) => {
      const ex = -170 + idx * 85;
      const ey = -266;
      const isAct = (elem === activeElem);
      const elemBg = this.add.rectangle(ex, ey, 80, 26, isAct ? 0x224870 : 0x111e30).setStrokeStyle(1.5, isAct ? 0x66ccff : 0x2d4466).setInteractive({ useHandCursor: true });
      const elemTxt = this.add.text(ex, ey, elem, { fontSize: '11px', fontStyle: 'bold', color: isAct ? '#ffffff' : '#88aacc' }).setOrigin(0.5);
      elemBg.on('pointerdown', () => this.openSkillPanel(elem));
      panel.add([elemBg, elemTxt]);
    });

    // Hàng 2 (4 hệ): Mộc, Phong, Lôi, Vật Lý
    const row2 = ['Mộc', 'Phong', 'Lôi', 'Vật Lý'];
    row2.forEach((elem, idx) => {
      const ex = -135 + idx * 90;
      const ey = -236;
      const isAct = (elem === activeElem);
      const elemBg = this.add.rectangle(ex, ey, 84, 26, isAct ? 0x224870 : 0x111e30).setStrokeStyle(1.5, isAct ? 0x66ccff : 0x2d4466).setInteractive({ useHandCursor: true });
      const elemTxt = this.add.text(ex, ey, elem, { fontSize: '11px', fontStyle: 'bold', color: isAct ? '#ffffff' : '#88aacc' }).setOrigin(0.5);
      elemBg.on('pointerdown', () => this.openSkillPanel(elem));
      panel.add([elemBg, elemTxt]);
    });

    // Hàng 3: Phím Nhanh Lắp 5 Hệ Luyện Khí & Nút Tháo Toàn Bộ Skill
    const preset1 = this.add.rectangle(-150, -204, 130, 24, 0x182c44).setStrokeStyle(1.2, 0x00ffff).setInteractive({ useHandCursor: true });
    const preset1Txt = this.add.text(-150, -204, '⚡ 5 Hệ A (Kiếm-Hỏa...)', { fontSize: '8.5px', fontStyle: 'bold', color: '#00ffff' }).setOrigin(0.5);
    preset1.on('pointerdown', () => {
      gameState.equippedSkillIds = ['kiem_1', 'hoa_1', 'loi_1', 'thuy_1', 'moc_1'];
      this.createSkillBar();
      this.openSkillPanel(activeElem);
      this.showFloatingText(this.player.x, this.player.y - 60, 'Đã lắp 5 Hệ [Kiếm, Hỏa, Lôi, Thủy, Mộc]!', '#66ffcc');
    });

    const preset2 = this.add.rectangle(-10, -204, 130, 24, 0x182c44).setStrokeStyle(1.2, 0xffd700).setInteractive({ useHandCursor: true });
    const preset2Txt = this.add.text(-10, -204, '⚡ 5 Hệ B (Phong-Thổ...)', { fontSize: '8.5px', fontStyle: 'bold', color: '#ffd700' }).setOrigin(0.5);
    preset2.on('pointerdown', () => {
      gameState.equippedSkillIds = ['phong_1', 'tho_1', 'ly_1', 'kim_1', 'kiem_1'];
      this.createSkillBar();
      this.openSkillPanel(activeElem);
      this.showFloatingText(this.player.x, this.player.y - 60, 'Đã lắp 5 Hệ [Phong, Thổ, Vật Lý, Kim, Kiếm]!', '#ffd700');
    });

    const clearAllBtn = this.add.rectangle(140, -204, 130, 24, 0x3d151c).setStrokeStyle(1.2, 0xff4455).setInteractive({ useHandCursor: true });
    const clearAllTxt = this.add.text(140, -204, '🗑️ THÁO HẾT SKILL', { fontSize: '8.5px', fontStyle: 'bold', color: '#ff7777' }).setOrigin(0.5);
    clearAllBtn.on('pointerdown', () => {
      gameState.equippedSkillIds = [];
      this.createSkillBar();
      this.openSkillPanel(activeElem);
      this.showFloatingText(this.player.x, this.player.y - 60, 'Đã tháo toàn bộ kỹ năng khỏi các ô!', '#ff7777');
    });

    panel.add([preset1, preset1Txt, preset2, preset2Txt, clearAllBtn, clearAllTxt]);

    const learnedSkills = this.getLearnedSkills();
    const learnedSkillIds = learnedSkills.map(s => s.id);

    const skillsOfElem = ELEMENTAL_SKILLS.filter(s => s.elem === activeElem);
    skillsOfElem.forEach((skill, idx) => {
      const sy = -160 + idx * 72;
      const isLearned = learnedSkillIds.includes(skill.id);
      const isEquipped = gameState.equippedSkillIds.includes(skill.id);
      const mastery = this.getSkillMastery(skill.id);

      const cardBg = this.add.rectangle(0, sy, 440, 68, isEquipped ? 0x182c44 : 0x111c2a)
        .setStrokeStyle(1.5, isEquipped ? 0x44ff88 : (isLearned ? 0x336699 : 0x242d3d));
      panel.add(cardBg);

      const icon = this.add.image(-185, sy, skill.icon).setDisplaySize(52, 52);
      if (!isLearned) icon.setTint(0x444444);

      const sStage = this.add.text(-155, sy - 21, `[${skill.stage}]`, { fontSize: '10px', fontStyle: 'bold', color: isLearned ? '#ffaa00' : '#64748b' });
      const sName = this.add.text(-88, sy - 21, skill.name, { fontSize: '12px', fontStyle: 'bold', color: isLearned ? '#ffffff' : '#64748b' });
      const sMastery = this.add.text(32, sy - 21, isLearned ? `[${mastery.tier.name}]` : '[Chưa Học]', { fontSize: '10.5px', fontStyle: 'bold', color: isLearned ? mastery.tier.color : '#ef4444' });

      const masteryStats = isLearned ? `Sát Thương +${Math.round(mastery.tier.dmgBonus * 100)}%` : 'Cần mua Công Pháp tại Thương Hội để học';
      const expText = isLearned ? (mastery.isMax ? 'VIÊN MÃN' : `Thuần Thục: ${mastery.exp}/${mastery.tier.expReq}`) : 'Chưa Mở Khóa';
      const sDesc = this.add.text(-155, sy - 3, `${skill.desc}`, { fontSize: '9px', color: isLearned ? '#88bbdd' : '#475569', wordWrap: { width: 175 } });
      const sProf = this.add.text(-155, sy + 14, isLearned ? `${expText} • ${masteryStats}` : `🔒 ${masteryStats}`, { fontSize: '9px', fontStyle: isLearned ? 'bold' : 'normal', color: isLearned ? mastery.tier.color : '#f87171' });
      panel.add([icon, sStage, sName, sMastery, sDesc, sProf]);

      if (isLearned) {
        // 1. Nút Thử Chiêu (Test Skill tức thì)
        const testBtn = this.add.rectangle(72, sy, 46, 28, 0x132a3a).setStrokeStyle(1.2, 0x00ffff).setInteractive({ useHandCursor: true });
        const testTxt = this.add.text(72, sy, '⚡ Thử', { fontSize: '9.5px', fontStyle: 'bold', color: '#00ffff' }).setOrigin(0.5);
        testBtn.on('pointerdown', () => {
          this.showFloatingText(this.player.x, this.player.y - 70, `⚡ Thử Nghiệm: [${skill.name}]`, '#00ffff');
          this.castSkill(skill.id);
        });

        // 2. Nút Tu Luyện (+15 EXP thuần thục)
        const trainBtn = this.add.rectangle(125, sy, 48, 28, 0x2d1b4d).setStrokeStyle(1.2, 0xaa55ff).setInteractive({ useHandCursor: true });
        const trainTxt = this.add.text(125, sy, 'Tu Luyện', { fontSize: '9px', fontStyle: 'bold', color: '#ddaaff' }).setOrigin(0.5);
        trainBtn.on('pointerdown', () => {
          if (mastery.isMax) {
            this.showFloatingText(this.player.x, this.player.y - 60, 'Kỹ năng đã đạt VIÊN MÃN tối thượng!', '#ff44dd');
            return;
          }
          if (gameState.gold < 25) {
            this.showFloatingText(this.player.x, this.player.y - 60, 'Cần 25 Linh Thạch để Bế Quan Tu Luyện!', '#ff5555');
            return;
          }
          gameState.gold -= 25;
          this.gainSkillExp(skill.id, 15);
          this.updateHUD();
          this.openSkillPanel(activeElem);
        });

        // 3. Nút Chọn / Bỏ Chọn Skill (Deselect / Unequip Toggle)
        const btnBg = this.add.rectangle(185, sy, 58, 28, isEquipped ? 0x4a1822 : 0x143528)
          .setStrokeStyle(1.2, isEquipped ? 0xff4455 : 0x44ff88)
          .setInteractive({ useHandCursor: true });
        const btnTxt = this.add.text(185, sy, isEquipped ? '❌ Bỏ Chọn' : '➕ Chọn Skill', {
          fontSize: '9px',
          fontStyle: 'bold',
          color: isEquipped ? '#ff8888' : '#88ffbb'
        }).setOrigin(0.5);

        btnBg.on('pointerdown', () => {
          if (isEquipped) {
            // BỎ CHỌN SKILL
            gameState.equippedSkillIds = gameState.equippedSkillIds.filter(id => id !== skill.id);
            this.showFloatingText(this.player.x, this.player.y - 60, `Đã bỏ chọn [${skill.name}]!`, '#ff7777');
          } else {
            // CHỌN SKILL
            if (gameState.equippedSkillIds.length < 5) {
              gameState.equippedSkillIds.push(skill.id);
            } else {
              gameState.equippedSkillIds[4] = skill.id; // Thay vào ô 5
            }
            this.showFloatingText(this.player.x, this.player.y - 60, `Đã gắn [${skill.name}] vào Ô ${gameState.equippedSkillIds.indexOf(skill.id) + 1}!`, '#66ffcc');
          }
          this.createSkillBar();
          this.openSkillPanel(activeElem);
        });
        panel.add([testBtn, testTxt, trainBtn, trainTxt, btnBg, btnTxt]);
      } else {
        const buyBtn = this.add.rectangle(170, sy, 84, 28, 0x1e293b).setStrokeStyle(1.2, 0x64748b).setInteractive({ useHandCursor: true });
        const buyTxt = this.add.text(170, sy, '🛒 Mua Công Pháp', { fontSize: '8.5px', fontStyle: 'bold', color: '#94a3b8' }).setOrigin(0.5);
        buyBtn.on('pointerdown', () => {
          this.openCongPhapPanel('Hoàng Giai', 'manuals');
        });
        panel.add([buyBtn, buyTxt]);
      }
    });

    this.activeModal = panel;
    this.activeModalOverlay = overlay;
  },

  // ----------------------------------------------------------------
  // Crafting Panel (Pills / Talismans / Formations)
  // ----------------------------------------------------------------
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
  // ----------------------------------------------------------------
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
        { key: 'shield', name: 'Linh Thuẫn', icon: '🛡️', emoji: '🛡️' }
      ];
      if (!gameState.equipped) gameState.equipped = {};

      const slotW = 148, slotH = 80, cols = 3;
      const startX = -195, startY = -200;

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
            icon: null, count: cnt, type: 'talisman',
            color: '#f59e0b', desc: tDef?.desc || 'Phù lục chiến đấu',
            talismanRef: tDef
          });
        });

        // E. Trận Pháp trong túi
        (gameState.inventory?.formations || []).forEach(fName => {
          const fDef = CRAFTING_SYSTEM.formations?.find(f => f.name === fName);
          slots.push({
            id: 'formation_' + fName, name: fName, emoji: '☸️',
            icon: null, count: 1, type: 'formation',
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

  // ── Popup chi tiết khi click vào ô vật phẩm (Không tự tắt túi đồ) ───────────
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
    const iconImg = this.add.image(-125, -28, slot.iconKey || 'item_default').setDisplaySize(56, 56);
    if (!this.textures.exists(slot.iconKey)) {
      iconImg.setTexture('item_6');
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

    panel.add(popup);
    this._itemPopup = popup;
  },

  // ----------------------------------------------------------------
  // BẢNG CHÀO MỪNG / KHỞI ĐẦU GAME (TẠO MỚI / TẢI SAVE)
  // ----------------------------------------------------------------
  openWelcomeScreenModal() {
    this.closeModal();
    const overlay = this.fixed(this.add.rectangle(W / 2, H / 2, W, H, 0x041019, 0.28), 290);
    const panel = this.fixed(this.add.container(W / 2, H / 2), 291);

    const bg = this.add.rectangle(0, 0, 480, 580, 0x071b25, 0.94).setStrokeStyle(2, 0xcaa765);
    panel.add(bg);

    // Header Tiên Hiệp
    const mainTitle = this.add.text(0, -245, '☯ LINH SƠN PHI KIẾM 3D ☯', {
      fontSize: '18px', fontStyle: 'bold', color: '#ffd700'
    }).setStroke('#0a1b24', 3).setOrigin(0.5);

    const subTitle = this.add.text(0, -218, '◈ HÀNH TRÌNH NGHỊCH THIÊN TU TIÊN ◈', {
      fontSize: '10.5px', fontStyle: 'bold', color: '#88ddff'
    }).setOrigin(0.5);

    panel.add([mainTitle, subTitle]);

    // TÙY CHỌN 1: BẮT ĐẦU MỚI (TẠO NHÂN VẬT MỚI)
    const opt1Y = -135;
    const opt1Box = this.add.rectangle(0, opt1Y, 440, 84, 0x0a2236, 0.95)
      .setStrokeStyle(1.8, 0x38bdf8)
      .setInteractive({ useHandCursor: true });
    const opt1Icon = this.add.text(-190, opt1Y, '✨', { fontSize: '26px' }).setOrigin(0.5);
    const opt1Title = this.add.text(-160, opt1Y - 18, 'TẠO NHÂN VẬT MỚI (BẮT ĐẦU MỚI)', {
      fontSize: '12.5px', fontStyle: 'bold', color: '#67e8f9'
    });
    const opt1Desc = this.add.text(-160, opt1Y + 12, 'Khởi đầu là Phàm Nhân (Chưa Tu Luyện) tại Thanh Vân Thôn, chưa có skill hay pháp bảo.\nSăn bắt thú hoang gom Da Thú đổi Công Pháp, tĩnh tọa tụ khí bước vào Luyện Khí Kỳ.', {
      fontSize: '9px', color: '#94a3b8', lineSpacing: 3
    });

    opt1Box.on('pointerover', () => opt1Box.setFillStyle(0x113454, 1));
    opt1Box.on('pointerout', () => opt1Box.setFillStyle(0x0a2236, 0.95));
    opt1Box.on('pointerdown', (pointer) => {
      if (pointer?.event) pointer.event.stopPropagation();
      resetToNewGame();
      this.updateHUD();
      this.createSkillBar();
      this.closeModal();
      this.showFloatingText(W / 2, H / 2 - 120, '✨ Chào mừng Đạo Hữu bước vào Tu Tiên Giới!', '#ffd700', '14px');
    });

    panel.add([opt1Box, opt1Icon, opt1Title, opt1Desc]);

    // TÙY CHỌN 2: NHẬP MÃ LƯU GAME (TẢI TIẾN TRÌNH)
    const opt2Y = -35;
    const opt2Box = this.add.rectangle(0, opt2Y, 440, 84, 0x221634, 0.95)
      .setStrokeStyle(1.8, 0xa855f7)
      .setInteractive({ useHandCursor: true });
    const opt2Icon = this.add.text(-190, opt2Y, '📜', { fontSize: '26px' }).setOrigin(0.5);
    const opt2Title = this.add.text(-160, opt2Y - 18, 'NHẬP MÃ LƯU GAME (TẢI TIẾN TRÌNH)', {
      fontSize: '12.5px', fontStyle: 'bold', color: '#d8b4fe'
    });
    const opt2Desc = this.add.text(-160, opt2Y + 12, 'Dán mã code save để khôi phục cảnh giới, kho đồ & công pháp cũ.\nDễ dàng tiếp tục tu luyện trên bất kỳ thiết bị nào.', {
      fontSize: '9.5px', color: '#cbd5e1', lineSpacing: 3
    });

    opt2Box.on('pointerover', () => opt2Box.setFillStyle(0x351e54, 1));
    opt2Box.on('pointerout', () => opt2Box.setFillStyle(0x221634, 0.95));
    opt2Box.on('pointerdown', (pointer) => {
      if (pointer?.event) pointer.event.stopPropagation();
      this.openLoadSaveModal();
    });

    panel.add([opt2Box, opt2Icon, opt2Title, opt2Desc]);

    // TÙY CHỌN 3: TIẾP TỤC BẢN LƯU GẦN NHẤT TRÊN THIẾT BỊ NÀY (NẾU CÓ)
    const isLocalSave = hasLocalSave();
    const opt3Y = 60;
    const opt3Box = this.add.rectangle(0, opt3Y, 440, 72, isLocalSave ? 0x0d2d22 : 0x0c1622, 0.95)
      .setStrokeStyle(1.8, isLocalSave ? 0x34d399 : 0x27435f)
      .setInteractive({ useHandCursor: isLocalSave });
    const opt3Icon = this.add.text(-190, opt3Y, isLocalSave ? '⚔️' : '💡', { fontSize: '24px' }).setOrigin(0.5);
    const opt3Title = this.add.text(-160, opt3Y - 14, isLocalSave ? 'TIẾP TỤC TU LUYỆN (TẢI BẢN LƯU GẦN NHẤT)' : 'TỰ ĐỘNG SAO LƯU TIẾN TRÌNH', {
      fontSize: '11.5px', fontStyle: 'bold', color: isLocalSave ? '#6ee7b7' : '#94a3b8'
    });
    const opt3Desc = this.add.text(-160, opt3Y + 12, isLocalSave ? 'Phát hiện tiến trình đã lưu trên trình duyệt này. Nhấn để chơi tiếp ngay.' : 'Trong lúc chơi, nhấn [💾 LƯU TIẾN TRÌNH] ở góc phải để lấy mã sao lưu bất kỳ lúc nào.', {
      fontSize: '9px', color: isLocalSave ? '#a7f3d0' : '#64748b'
    });

    if (isLocalSave) {
      opt3Box.on('pointerover', () => opt3Box.setFillStyle(0x134e3a, 1));
      opt3Box.on('pointerout', () => opt3Box.setFillStyle(0x0d2d22, 0.95));
      opt3Box.on('pointerdown', (pointer) => {
        if (pointer?.event) pointer.event.stopPropagation();
        const res = loadFromLocalStorage();
        if (res.success) {
          this.updateHUD();
          this.createSkillBar();
          this.closeModal();
          this.showFloatingText(W / 2, H / 2 - 120, '⚔️ Đã tải tiến trình tu tiên thành công!', '#34d399', '14px');
        } else {
          this.showFloatingText(W / 2, H / 2 - 120, res.error, '#ff5555', '14px');
        }
      });
    }

    panel.add([opt3Box, opt3Icon, opt3Title, opt3Desc]);

    // Footer
    const footerTxt = this.add.text(0, 240, 'Phiên Bản Tu Tiên 3D • Ngũ Hành Linh Căn & 125 Bản Đồ', {
      fontSize: '9.5px', color: '#557396'
    }).setOrigin(0.5);
    panel.add(footerTxt);

    this.activeModal = panel;
    this.activeModalOverlay = overlay;
  },

  // ----------------------------------------------------------------
  // BẢNG XUẤT MÃ LƯU GAME (SAVE GAME CODE MODAL)
  // ----------------------------------------------------------------
  openSaveGameModal() {
    this.closeModal();
    const overlay = this.fixed(this.add.rectangle(W / 2, H / 2, W, H, 0x041019, 0.28), 290);
    const panel = this.fixed(this.add.container(W / 2, H / 2), 291);

    const bg = this.add.rectangle(0, 0, 480, 600, 0x071b25, 0.94).setStrokeStyle(2, 0xcaa765);
    panel.add(bg);

    const title = this.add.text(0, -260, '💾 LƯU TIẾN TRÌNH TU TIÊN', {
      fontSize: '15px', fontStyle: 'bold', color: '#ffd700'
    }).setOrigin(0.5);
    panel.add(title);
    this.createModalCloseBtn(panel, 215, -260);

    const saveCode = exportSaveCode();

    const descTxt = this.add.text(0, -225, 'Dữ liệu cảnh giới, linh thạch, công pháp & trang bị đã được mã hóa thành mã code:', {
      fontSize: '9.5px', color: '#9ee9d8', align: 'center', wordWrap: { width: 440 }
    }).setOrigin(0.5);
    panel.add(descTxt);

    // Khung hiển thị Save Code (chia dòng nhỏ mỗi 36 ký tự để không tràn ngang màn hình)
    const codeBox = this.add.rectangle(0, -155, 440, 90, 0x060e18, 0.95).setStrokeStyle(1.5, 0x1f3c5b);
    const chunks = (saveCode.slice(0, 108).match(/.{1,36}/g) || []).join('\n');
    const codeSnippet = `${chunks}\n... [Tổng độ dài: ${saveCode.length} ký tự]`;
    const codeTxt = this.add.text(0, -155, codeSnippet, {
      fontSize: '10px', color: '#a5f3fc', align: 'center', lineSpacing: 3
    }).setOrigin(0.5);
    panel.add([codeBox, codeTxt]);

    // Nút 1: SAO CHÉP TỰ ĐỘNG (CLIPBOARD)
    const copyBtn = this.add.rectangle(0, -80, 440, 44, 0x145a32, 0.95)
      .setStrokeStyle(1.8, 0x2ecc71)
      .setInteractive({ useHandCursor: true });
    const copyBtnTxt = this.add.text(0, -80, '📋 SAO CHÉP MÃ LƯU (TỰ ĐỘNG VÀO BỘ NHỚ TẠM)', {
      fontSize: '11px', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    const handleCopy = (pointer) => {
      if (pointer?.event) {
        pointer.event.stopPropagation();
        if (pointer.event.preventDefault) pointer.event.preventDefault();
      }
      let copied = false;
      // 1. Navigator Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(saveCode).catch(() => {});
        copied = true;
      }
      // 2. Mobile DOM Textarea copy fallback (iOS Safari / Android)
      try {
        const ta = document.createElement('textarea');
        ta.value = saveCode;
        ta.removeAttribute('readonly');
        ta.style.position = 'fixed';
        ta.style.top = '0';
        ta.style.left = '0';
        ta.style.opacity = '0.01';
        ta.style.zIndex = '99999';
        ta.style.fontSize = '16px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        ta.setSelectionRange(0, saveCode.length);
        const res = document.execCommand('copy');
        if (res) copied = true;
        document.body.removeChild(ta);
      } catch (e) {}

      copyBtnTxt.setText('✔ ĐÃ SAO CHÉP MÃ LƯU!');
      copyBtn.setFillStyle(0x239b56);
      this.showFloatingText(W / 2, H / 2 - 120, '✔ Đã sao chép mã lưu game vào bộ nhớ tạm!', '#2ecc71', '13px');
    };

    copyBtn.on('pointerover', () => copyBtn.setFillStyle(0x196f3d));
    copyBtn.on('pointerout', () => copyBtn.setFillStyle(0x145a32));
    copyBtn.on('pointerdown', handleCopy);

    panel.add([copyBtn, copyBtnTxt]);

    // Nút 2: MỞ HỘP THOẠI ĐỂ XEM/CHÉP TAY (DÀNH CHO ĐIỆN THOẠI / PROMPT COPY)
    const promptCopyBtn = this.add.rectangle(0, -30, 440, 42, 0x1e3a8a, 0.95)
      .setStrokeStyle(1.5, 0x60a5fa)
      .setInteractive({ useHandCursor: true });
    const promptCopyTxt = this.add.text(0, -30, '📱 HIỆN MÃ ĐỂ CHÉP TAY (HỘP THOẠI POPUP)', {
      fontSize: '11px', fontStyle: 'bold', color: '#93c5fd'
    }).setOrigin(0.5);

    promptCopyBtn.on('pointerover', () => promptCopyBtn.setFillStyle(0x1e40af));
    promptCopyBtn.on('pointerout', () => promptCopyBtn.setFillStyle(0x1e3a8a));
    promptCopyBtn.on('pointerdown', (pointer) => {
      if (pointer?.event) pointer.event.stopPropagation();
      window.prompt('Mã lưu game của bạn (nhấn giữ để chọn tất cả và sao chép):', saveCode);
    });

    panel.add([promptCopyBtn, promptCopyTxt]);

    // Nút 3: TẢI BẢN LƯU KHÁC (LOAD SAVE)
    const loadBtn = this.add.rectangle(0, 20, 440, 42, 0x1f2937, 0.95)
      .setStrokeStyle(1.5, 0xa78bfa)
      .setInteractive({ useHandCursor: true });
    const loadBtnTxt = this.add.text(0, 20, '📥 NHẬP MÃ LƯU KHÁC (TẢI TIẾN TRÌNH)', {
      fontSize: '11px', fontStyle: 'bold', color: '#c4b5fd'
    }).setOrigin(0.5);

    loadBtn.on('pointerover', () => loadBtn.setFillStyle(0x374151));
    loadBtn.on('pointerout', () => loadBtn.setFillStyle(0x1f2937));
    loadBtn.on('pointerdown', (pointer) => {
      if (pointer?.event) pointer.event.stopPropagation();
      this.openLoadSaveModal();
    });

    panel.add([loadBtn, loadBtnTxt]);

    // Khung Hướng Dẫn & Thông Tin
    const infoBox = this.add.rectangle(0, 145, 440, 150, 0x091422, 0.95).setStrokeStyle(1.2, 0x1e3a5f);
    const infoContent =
      `💡 HƯỚNG DẪN BẢO QUẢN TIẾN TRÌNH:\n\n` +
      `1. Nhấn nút [Sao Chép Mã Lưu] và dán lưu lại vào Ghi chú điện thoại / Máy tính.\n\n` +
      `2. Khi mở game trên thiết bị mới, chọn [Nhập Mã Lưu Khác] và dán đoạn mã này vào là khôi phục 100% nhân vật.\n\n` +
      `3. Game cũng tự động lưu bản sao dự phòng vào bộ nhớ trình duyệt (LocalStorage).`;

    const infoTxt = this.add.text(0, 145, infoContent, {
      fontSize: '9.5px', color: '#94a3b8', align: 'left', wordWrap: { width: 410 }, lineSpacing: 4
    }).setOrigin(0.5);

    panel.add([infoBox, infoTxt]);
    this.activeModal = panel;
    this.activeModalOverlay = overlay;
  },

  // ----------------------------------------------------------------
  // BẢNG NHẬP MÃ LƯU TIẾN TRÌNH (LOAD SAVE CODE MODAL)
  // ----------------------------------------------------------------
  openLoadSaveModal() {
    this.closeModal();
    const overlay = this.fixed(this.add.rectangle(W / 2, H / 2, W, H, 0x041019, 0.28), 290);
    const panel = this.fixed(this.add.container(W / 2, H / 2), 291);

    const bg = this.add.rectangle(0, 0, 480, 520, 0x071b25, 0.94).setStrokeStyle(2, 0xcaa765);
    panel.add(bg);

    const title = this.add.text(0, -225, '📜 NHẬP MÃ LƯU TIẾN TRÌNH', {
      fontSize: '15px', fontStyle: 'bold', color: '#ffd700'
    }).setOrigin(0.5);
    panel.add(title);
    this.createModalCloseBtn(panel, 215, -225);

    const subTitle = this.add.text(0, -188, 'Dán hoặc nhập đoạn mã code lưu game (bắt đầu bằng LSPK_...):', {
      fontSize: '10px', color: '#a5f3fc', align: 'center'
    }).setOrigin(0.5);
    panel.add(subTitle);

    // Cách 1: DÁN TỪ BỘ NHỚ TẠM (CLIPBOARD TỰ ĐỘNG)
    const pasteBtn = this.add.rectangle(0, -125, 440, 46, 0x164e63, 0.95)
      .setStrokeStyle(1.8, 0x06b6d4)
      .setInteractive({ useHandCursor: true });
    const pasteBtnTxt = this.add.text(0, -125, '📋 DÁN TỪ CLIPBOARD (BỘ NHỚ TẠM)', {
      fontSize: '11.5px', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    pasteBtn.on('pointerover', () => pasteBtn.setFillStyle(0x155e75));
    pasteBtn.on('pointerout', () => pasteBtn.setFillStyle(0x164e63));
    pasteBtn.on('pointerdown', (pointer) => {
      if (pointer?.event) pointer.event.stopPropagation();
      if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText().then(text => {
          if (text && text.trim()) {
            const res = importSaveCode(text.trim());
            if (res.success) {
              this.playerHpMax = this.calcPlayerMaxHp();
              this.playerHp = this.playerHpMax;
              if (this.initPartyFollowers) this.initPartyFollowers();
              this.updateHUD();
              this.createSkillBar();
              this.closeModal();
              this.showFloatingText(W / 2, H / 2 - 120, '⚔️ Khôi phục tiến trình tu tiên thành công!', '#2ecc71', '14px');
            } else {
              this.promptManualLoad(res.error);
            }
          } else {
            this.promptManualLoad();
          }
        }).catch(() => {
          this.promptManualLoad();
        });
      } else {
        this.promptManualLoad();
      }
    });

    panel.add([pasteBtn, pasteBtnTxt]);

    // Cách 2: NHẬP BẰNG HỘP THOẠI (PROMPT DIALOG)
    const manualBtn = this.add.rectangle(0, -70, 440, 46, 0x3730a3, 0.95)
      .setStrokeStyle(1.8, 0x818cf8)
      .setInteractive({ useHandCursor: true });
    const manualBtnTxt = this.add.text(0, -70, '⌨️ NHẬP / DÁN MÃ BẰNG TAY (HỘP THOẠI)', {
      fontSize: '11.5px', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    manualBtn.on('pointerover', () => manualBtn.setFillStyle(0x4338ca));
    manualBtn.on('pointerout', () => manualBtn.setFillStyle(0x3730a3));
    manualBtn.on('pointerdown', (pointer) => {
      if (pointer?.event) pointer.event.stopPropagation();
      this.promptManualLoad();
    });

    panel.add([manualBtn, manualBtnTxt]);

    // Nút Quay Lại Menu Bắt Đầu
    const backBtn = this.add.rectangle(0, -15, 440, 40, 0x1e293b, 0.95)
      .setStrokeStyle(1.2, 0x475569)
      .setInteractive({ useHandCursor: true });
    const backBtnTxt = this.add.text(0, -15, '↩ QUAY LẠI TRANG CHỦ BẮT ĐẦU', {
      fontSize: '11px', fontStyle: 'bold', color: '#94a3b8'
    }).setOrigin(0.5);

    backBtn.on('pointerdown', (pointer) => {
      if (pointer?.event) pointer.event.stopPropagation();
      this.openWelcomeScreenModal();
    });
    panel.add([backBtn, backBtnTxt]);

    // Ghi chú
    const noteBox = this.add.rectangle(0, 110, 440, 140, 0x091422, 0.95).setStrokeStyle(1.2, 0x1e293b);
    const noteTxt = this.add.text(0, 110,
      `📌 LƯU Ý:\n\n` +
      `• Mã lưu hợp lệ có dạng: LSPK_eyJ2ZXJzaW9uIjoyLC...\n` +
      `• Khi nạp mã thành công, toàn bộ Cảnh Giới, Công Pháp, Tổ Đội, Bạc, Linh Thạch và Da Lông Thú sẽ được phục hồi nguyên vẹn 100%.`,
      { fontSize: '9.5px', color: '#64748b', wordWrap: { width: 410 }, lineSpacing: 4 }
    ).setOrigin(0.5);

    panel.add([noteBox, noteTxt]);
    this.activeModal = panel;
    this.activeModalOverlay = overlay;
  },

  // Hộp thoại nhập mã bằng tay
  promptManualLoad(prevError = null) {
    const msg = prevError ? `${prevError}\n\nHãy dán đoạn mã lưu game (bắt đầu bằng LSPK_...) vào ô bên dưới:` : 'Hãy dán đoạn mã lưu game (bắt đầu bằng LSPK_...) vào ô bên dưới:';
    const code = window.prompt(msg, '');
    if (code && code.trim()) {
      const res = importSaveCode(code.trim());
      if (res.success) {
        this.playerHpMax = this.calcPlayerMaxHp();
        this.playerHp = this.playerHpMax;
        if (this.initPartyFollowers) this.initPartyFollowers();
        this.updateHUD();
        this.createSkillBar();
        this.closeModal();
        this.showFloatingText(W / 2, H / 2 - 120, '⚔️ Khôi phục tiến trình tu tiên thành công!', '#2ecc71', '14px');
      } else {
        alert(res.error || 'Mã lưu không hợp lệ!');
      }
    }
  },

  closeModal() {
    if (this._itemPopup) {
      this._itemPopup.destroy(true);
      this._itemPopup = null;
    }
    if (this.activeModalOverlay) {
      this.activeModalOverlay.destroy(true);
      this.activeModalOverlay = null;
    }
    if (this.activeModal) {
      this.activeModal.destroy(true);
      this.activeModal = null;
    }
    if (this.modalLayer) {
      if (this.modalLayer.list && this.modalLayer.list.length > 0) {
        const children = [...this.modalLayer.list];
        children.forEach(c => {
          if (c && c.destroy) c.destroy(true);
        });
      }
      this.modalLayer.removeAll(true);
    }
  },
};
