/**
 * SkillCongPhapModal.js
 * Quản lý: getLearnedSkills, openQuickSkillSelectModal, openCongPhapPanel, openSkillPanel
 */
import { ELEMENTAL_SKILLS, SKILL_MASTERY_TIERS } from '../../config/skillsData.js';
import { gameState } from '../../state/gameState.js';
import { CONG_PHAP_LIST, CONG_PHAP_GRADES, getCongPhapById } from '../../config/congPhapData.js';
import { ensureCurrencies, addCurrency, deductCurrency, hasCurrency } from '../../config/currencyData.js';
import { W, H } from '../constants.js';

export const SkillCongPhapModal = {
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
    learnedIds.add('basic_attack');

    return ELEMENTAL_SKILLS.filter(s => learnedIds.has(s.id));
  },

  // ----------------------------------------------------------------
  // Quick Skill Select (long-press on skill slot)

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
        gameState.equippedSkillIds[slotIndex] = null;
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
      gameState.equippedSkillIds = [null, null, null, null, null, null];
      this.createSkillBar();
      this.openQuickSkillSelectModal(slotIndex);
      this.showFloatingText(this.player.x, this.player.y - 60, 'Đã tháo toàn bộ kỹ năng khỏi 5 ô!', '#ff5555', '14px');
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
            const existingIdx = gameState.equippedSkillIds.indexOf(skill.id);
            if (existingIdx !== -1) {
              gameState.equippedSkillIds[existingIdx] = null;
            }
            this.createSkillBar();
            this.openQuickSkillSelectModal(slotIndex);
            this.showFloatingText(this.player.x, this.player.y - 60, `Đã bỏ chọn [${skill.name}]!`, '#ff7777');
          } else {
            // Xóa skill nếu đang ở ô khác
            const existingIdx = gameState.equippedSkillIds.indexOf(skill.id);
            if (existingIdx !== -1) {
              gameState.equippedSkillIds[existingIdx] = null;
            }
            while (gameState.equippedSkillIds.length < 6) {
              gameState.equippedSkillIds.push(null);
            }
            gameState.equippedSkillIds[slotIndex] = skill.id;
            this.createSkillBar();
            this.openQuickSkillSelectModal(slotIndex);
            this.showFloatingText(this.player.x, this.player.y - 60, `Đã gắn [${skill.name}] vào Ô ${slotIndex + 1}!`, '#66ffcc');
          }
        });

        panel.add([itemBox, icon, sName, sDesc, actionBtn, actionTxt]);
      });
    }

    this.activeModal = panel;
    this.activeModalOverlay = overlay;
  },

  // ----------------------------------------------------------------
  // Sect & Cong Phap Panels

  openCongPhapManuals(activeGrade = 'Hoàng Giai', pageIdx = 0) {
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
      const isAct = (tab.key === 'manuals');
      const tabBg = this.add.rectangle(tx, -265, 130, 28, isAct ? 0x224870 : 0x111e30).setStrokeStyle(1.5, isAct ? 0x66ccff : 0x2d4466).setInteractive({ useHandCursor: true });
      const tabTxt = this.add.text(tx, -265, tab.label, { fontSize: '9.5px', fontStyle: 'bold', color: isAct ? '#ffffff' : '#88aacc' }).setOrigin(0.5);
      tabBg.on('pointerdown', (pointer) => {
        if (pointer?.event) pointer.event.stopPropagation();
        if (tab.key === 'skills') {
          this.openSkillPanel('Kiếm');
        } else if (tab.key === 'exchange') {
          this.openCongPhapExchange(activeGrade);
        } else {
          this.openCongPhapManuals(activeGrade, 0);
        }
      });
      panel.add([tabBg, tabTxt]);
    });

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
        this.openCongPhapManuals(gKey, 0);
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
      this.openCongPhapManuals(activeGrade, pageIdx);
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
          this.openCongPhapManuals(activeGrade, curPage);
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

            if (!gameState.congPhapMastery) gameState.congPhapMastery = {};
            if (!gameState.congPhapMastery[cp.id]) gameState.congPhapMastery[cp.id] = { tierIdx: 0, uses: 0 };

            this.playerHpMax = this.calcPlayerMaxHp();
            this.updateHUD();
            this.openCongPhapManuals(activeGrade, curPage);
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
        if (curPage > 0) this.openCongPhapManuals(activeGrade, curPage - 1);
      });

      const pageLabel = this.add.text(0, 230, `${curPage + 1} / ${totalPages}`, { fontSize: '10px', fontStyle: 'bold', color: '#ffd700' }).setOrigin(0.5);

      const nextBtn = this.add.rectangle(80, 230, 100, 26, curPage < totalPages - 1 ? 0x1e3a5f : 0x111e2e)
        .setStrokeStyle(1, curPage < totalPages - 1 ? 0x38bdf8 : 0x334455)
        .setInteractive({ useHandCursor: curPage < totalPages - 1 });
      const nextTxt = this.add.text(80, 230, 'TRANG SAU ▶', { fontSize: '9px', fontStyle: 'bold', color: curPage < totalPages - 1 ? '#ffffff' : '#64748b' }).setOrigin(0.5);
      nextBtn.on('pointerdown', (pointer) => {
        if (pointer?.event) pointer.event.stopPropagation();
        if (curPage < totalPages - 1) this.openCongPhapManuals(activeGrade, curPage + 1);
      });

      panel.add([prevBtn, prevTxt, pageLabel, nextBtn, nextTxt]);
    }

    // Bottom Note
    const note = this.add.text(0, 280, '💡 Công Pháp Hoàng Giai giá 10.000 Lượng Bạc. Da Lông Thú bán 1 Bạc/cái.', {
      fontSize: '8.8px', color: '#94a3b8'
    }).setOrigin(0.5);
    panel.add(note);

    this.activeModal = panel;
    this.activeModalOverlay = overlay;
  },

  openCongPhapExchange(activeGrade = 'Hoàng Giai') {
    this.closeModal();
    const overlay = this.fixed(this.add.rectangle(W / 2, H / 2, W, H, 0x041019, 0.28), 290);
    const panel = this.fixed(this.add.container(W / 2, H / 2), 291);

    const bg = this.add.rectangle(0, 0, 480, 660, 0x071b25, 0.94).setStrokeStyle(2, 0xcaa765);
    panel.add(bg);
    const title = this.add.text(0, -305, '🏪 TIỆM DA THÚ & LINH THẢO (THU MUA BẠC)', { fontSize: '15px', fontStyle: 'bold', color: '#ffd700' }).setOrigin(0.5);
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
      const isAct = (tab.key === 'exchange');
      const tabBg = this.add.rectangle(tx, -265, 130, 28, isAct ? 0x224870 : 0x111e30).setStrokeStyle(1.5, isAct ? 0x66ccff : 0x2d4466).setInteractive({ useHandCursor: true });
      const tabTxt = this.add.text(tx, -265, tab.label, { fontSize: '9.5px', fontStyle: 'bold', color: isAct ? '#ffffff' : '#88aacc' }).setOrigin(0.5);
      tabBg.on('pointerdown', (pointer) => {
        if (pointer?.event) pointer.event.stopPropagation();
        if (tab.key === 'skills') {
          this.openSkillPanel('Kiếm');
        } else if (tab.key === 'manuals') {
          this.openCongPhapManuals(activeGrade, 0);
        } else {
          this.openCongPhapExchange(activeGrade);
        }
      });
      panel.add([tabBg, tabTxt]);
    });

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
      this.openCongPhapExchange(activeGrade);
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
          this.openCongPhapExchange(activeGrade);
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
        this.openCongPhapExchange(activeGrade);
      });

      panel.add([dBox, dName, dCost, dDesc, dBtn, dBtnTxt]);
    });

    const bottomNote = this.add.text(0, 280, '💡 Tích lũy đủ 10.000 Lượng Bạc từ săn dã thú (1 Bạc/cái) để mua Công Pháp Hoàng Giai nhập môn.', {
      fontSize: '8.8px', color: '#94a3b8'
    }).setOrigin(0.5);
    panel.add(bottomNote);

    this.activeModal = panel;
    this.activeModalOverlay = overlay;
  },

  openCongPhapPanel(activeGrade = 'Hoàng Giai', activeTab = null, pageIdx = 0) {
    if (activeTab === 'manuals') {
      return this.openCongPhapManuals(activeGrade, pageIdx);
    }
    if (activeTab === 'exchange') {
      return this.openCongPhapExchange(activeGrade);
    }
    if (activeTab === 'skills') {
      return this.openSkillPanel('Kiếm');
    }
    if (typeof this.openCongPhapHome === 'function') {
      return this.openCongPhapHome();
    }
    return this.openCongPhapManuals(activeGrade, pageIdx);
  },

  // ----------------------------------------------------------------
  // Map Panel

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
            // BỎ CHỌN SKILL: Đặt ô tương ứng thành null (trống)
            const existingIdx = gameState.equippedSkillIds.indexOf(skill.id);
            if (existingIdx !== -1) {
              gameState.equippedSkillIds[existingIdx] = null;
            }
            this.showFloatingText(this.player.x, this.player.y - 60, `Đã bỏ chọn [${skill.name}]!`, '#ff7777');
          } else {
            // CHỌN SKILL: Tìm ô trống đầu tiên hoặc gán vào ô cuối
            let targetSlot = gameState.equippedSkillIds.findIndex(id => !id);
            if (targetSlot === -1) {
              if (gameState.equippedSkillIds.length < 6) {
                targetSlot = gameState.equippedSkillIds.length;
              } else {
                targetSlot = 4;
              }
            }
            while (gameState.equippedSkillIds.length <= targetSlot) {
              gameState.equippedSkillIds.push(null);
            }
            gameState.equippedSkillIds[targetSlot] = skill.id;
            this.showFloatingText(this.player.x, this.player.y - 60, `Đã gắn [${skill.name}] vào Ô ${targetSlot + 1}!`, '#66ffcc');
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
};
