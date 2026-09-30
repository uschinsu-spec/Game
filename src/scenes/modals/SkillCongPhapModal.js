/**
 * SkillCongPhapModal.js
 * Quản lý logic kỹ năng đã học (getLearnedSkills) & Modal chọn nhanh kỹ năng vào ô phím tắt (openQuickSkillSelectModal).
 *
 * Ghi chú kiến trúc:
 * - openSkillPanel UI do SimpleSkillFullscreenUI.js quản lý duy nhất.
 * - openCongPhapPanel / openCongPhapHome UI do SimpleCongPhapHomeUI.js quản lý duy nhất.
 */
import { ELEMENTAL_SKILLS, SKILL_MASTERY_TIERS } from '../../config/skillsData.js';
import { gameState } from '../../state/gameState.js';
import { W, H } from '../constants.js';

export const CP_TO_SKILLS_MAP = {
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

export function resolveLearnedSkillList(state = gameState) {
  const learnedIds = new Set(state?.unlockedSkillIds || []);
  const cpIds = state?.learnedCongPhapIds || [];

  cpIds.forEach(id => {
    if (CP_TO_SKILLS_MAP[id]) {
      CP_TO_SKILLS_MAP[id].forEach(sId => learnedIds.add(sId));
    }
  });
  learnedIds.add('basic_attack');

  return ELEMENTAL_SKILLS.filter(s => learnedIds.has(s.id));
}

export const SkillCongPhapModal = {
  getLearnedSkills() {
    return resolveLearnedSkillList(gameState);
  },

  // ----------------------------------------------------------------
  // Quick Skill Select (Chạm / Giữ ô phím tắt kỹ năng)
  openQuickSkillSelectModal(slotIndex) {
    this.closeModal?.();
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
    const currentSkillId = gameState.equippedSkillIds?.[slotIndex];
    
    // Nút 1: Bỏ chọn ô này
    const unequipSlotBtn = this.add.rectangle(-112, -240, 216, 34, currentSkillId ? 0x3d1515 : 0x1a222d)
      .setStrokeStyle(1.5, currentSkillId ? 0xff4444 : 0x475569)
      .setInteractive({ useHandCursor: !!currentSkillId });
    const unequipSlotTxt = this.add.text(-112, -240, currentSkillId ? `❌ BỎ CHỌN Ô [${slotIndex + 1}]` : `Ô [${slotIndex + 1}] ĐANG TRỐNG`, {
      fontSize: '10px', fontStyle: 'bold', color: currentSkillId ? '#ff8888' : '#64748b'
    }).setOrigin(0.5);

    unequipSlotBtn.on('pointerdown', () => {
      if (gameState.equippedSkillIds?.[slotIndex]) {
        gameState.equippedSkillIds[slotIndex] = null;
        this.createSkillBar?.();
        this.openQuickSkillSelectModal(slotIndex);
        this.showFloatingText?.(this.player?.x || 0, (this.player?.y || 0) - 60, `Đã làm trống Ô ${slotIndex + 1}!`, '#ff7777');
      }
    });

    // Nút 2: Tháo toàn bộ ô skill
    const hasAnySkill = Array.isArray(gameState.equippedSkillIds) && gameState.equippedSkillIds.some(Boolean);
    const clearAllBtn = this.add.rectangle(112, -240, 216, 34, hasAnySkill ? 0x581c1c : 0x1a222d)
      .setStrokeStyle(1.5, hasAnySkill ? 0xf43f5e : 0x475569)
      .setInteractive({ useHandCursor: hasAnySkill });
    const clearAllTxt = this.add.text(112, -240, hasAnySkill ? '🗑️ THÁO TOÀN BỘ SKILL' : 'ĐÃ TRỐNG TOÀN BỘ SKILL', {
      fontSize: '9.5px', fontStyle: 'bold', color: hasAnySkill ? '#fca5a5' : '#64748b'
    }).setOrigin(0.5);

    clearAllBtn.on('pointerdown', () => {
      gameState.equippedSkillIds = [null, null, null, null, null, null];
      this.createSkillBar?.();
      this.openQuickSkillSelectModal(slotIndex);
      this.showFloatingText?.(this.player?.x || 0, (this.player?.y || 0) - 60, 'Đã tháo toàn bộ kỹ năng khỏi các ô!', '#ff5555', '14px');
    });

    panel.add([unequipSlotBtn, unequipSlotTxt, clearAllBtn, clearAllTxt]);

    // CHỈ HIỂN THỊ KỸ NĂNG ĐÃ HỌC
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
        '2. Vào [Thương Hội (Vạn Bảo Các)] mua Công Pháp Hoàng Giai.\n' +
        '3. Lĩnh ngộ công pháp sẽ lập tức mở khóa Thần Thông tương ứng!',
        { fontSize: '9.5px', color: '#cceeff', align: 'center', lineSpacing: 4 }
      ).setOrigin(0.5);
      panel.add([lockBox, lockIcon, lockTitle, lockDesc]);
    } else {
      learnedSkills.slice(0, 8).forEach((skill, idx) => {
        const sy = -196 + idx * 54;
        const isEquippedAnywhere = Array.isArray(gameState.equippedSkillIds) && gameState.equippedSkillIds.includes(skill.id);
        const equippedSlotIdx = isEquippedAnywhere ? gameState.equippedSkillIds.indexOf(skill.id) : -1;
        const mastery = this.getSkillMastery ? this.getSkillMastery(skill.id) : { tier: { name: 'Sơ Nhập', color: '#94a3b8', dmgBonus: 0 } };

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
          if (!Array.isArray(gameState.equippedSkillIds)) {
            gameState.equippedSkillIds = [];
          }
          if (isEquippedAnywhere) {
            const existingIdx = gameState.equippedSkillIds.indexOf(skill.id);
            if (existingIdx !== -1) {
              gameState.equippedSkillIds[existingIdx] = null;
            }
            this.createSkillBar?.();
            this.openQuickSkillSelectModal(slotIndex);
            this.showFloatingText?.(this.player?.x || 0, (this.player?.y || 0) - 60, `Đã bỏ chọn [${skill.name}]!`, '#ff7777');
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
            this.createSkillBar?.();
            this.openQuickSkillSelectModal(slotIndex);
            this.showFloatingText?.(this.player?.x || 0, (this.player?.y || 0) - 60, `Đã gắn [${skill.name}] vào Ô ${slotIndex + 1}!`, '#66ffcc');
          }
        });

        panel.add([itemBox, icon, sName, sDesc, actionBtn, actionTxt]);
      });
    }

    this.activeModal = panel;
    this.activeModalOverlay = overlay;
  }
};
