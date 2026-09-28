/**
 * AdminTestModal.js
 * Quản lý: openAdminTestModal (Menu GM / Test Game)
 */
import { REALMS } from '../../config/realmsData.js';
import { ELEMENTAL_SKILLS, SKILL_MASTERY_TIERS } from '../../config/skillsData.js';
import { ALL_HERBS } from '../../config/herbsData.js';
import { gameState } from '../../state/gameState.js';
import { CONG_PHAP_LIST, CONG_PHAP_GRADES } from '../../config/congPhapData.js';
import { ensureCurrencies, addCurrency } from '../../config/currencyData.js';
import { W, H } from '../constants.js';

export const AdminTestModal = {
  openAdminTestModal(activeTab = 'realm', subTab = 'sword', cpElemFilter = 'all', cpPage = 0) {
    this.closeModal();
    this.enterUiHardPause?.();

    const OVERLAY_DEPTH = 999998;
    const PANEL_DEPTH = 1000000;
    const FONT = 'Be Vietnam Pro, sans-serif';

    const overlay = this.fixed(
      this.add.rectangle(W / 2, H / 2, W + 16, H + 16, 0x010811, 0.88),
      OVERLAY_DEPTH
    ).setInteractive({ useHandCursor: false });

    const panel = this.fixed(this.add.container(W / 2, H / 2), PANEL_DEPTH);
    this.activeModal = panel;
    this.activeModalOverlay = overlay;

    const stopPtr = (p) => {
      this?.input?.stopPropagation?.();
      p?.event?.stopPropagation?.();
      p?.event?.preventDefault?.();
    };

    overlay.on('pointerdown', stopPtr);
    overlay.on('pointerup', stopPtr);

    // Modal Outer Frame
    const bg = this.add.rectangle(0, 0, W - 6, H - 6, 0x061e2e, 1)
      .setStrokeStyle(3, 0xf43f5e, 1);
    const header = this.add.rectangle(0, -420, W - 24, 92, 0x180d22, 1)
      .setStrokeStyle(2, 0xf43f5e, 1);
    
    const curRealm = REALMS[gameState.realmIdx] || REALMS[0];
    const curHp = Math.round(this.playerHp || 0);
    const maxHp = Math.round(this.playerHpMax || curRealm.hp || 100);

    const titleTxt = this.add.text(0, -438, '⚡ BẢNG ĐIỀU KHIỂN ADMIN / TEST GAME ⚡', {
      fontFamily: FONT, fontSize: '17px', fontStyle: 'bold', color: '#ffd000'
    }).setOrigin(0.5);

    const subTxt = this.add.text(0, -406, `Cảnh giới: ${curRealm.name}  •  HP: ${curHp}/${maxHp}  •  MP: ${Math.round(gameState.mana || 0)}/${Math.round(gameState.manaMax || 100)}`, {
      fontFamily: FONT, fontSize: '11px', fontStyle: 'bold', color: '#93c5fd'
    }).setOrigin(0.5);

    panel.add([bg, header, titleTxt, subTxt]);
    this.createModalCloseBtn(panel, 205, -420);

    // Helper: Add Button
    const makeBtn = (x, y, w, h, label, onClick, opts = {}) => {
      const fill = opts.fill ?? 0x0f2a3f;
      const stroke = opts.stroke ?? 0x38bdf8;
      const strokeW = opts.strokeW ?? 1.5;
      const textColor = opts.color ?? '#f8fafc';
      const fontSize = opts.fontSize ?? '13px';

      const btnBg = this.add.rectangle(x, y, w, h, fill, 1)
        .setStrokeStyle(strokeW, stroke, 1)
        .setInteractive({ useHandCursor: true });
      
      const btnTxt = this.add.text(x, y, label, {
        fontFamily: FONT, fontSize, fontStyle: 'bold', color: textColor, align: 'center'
      }).setOrigin(0.5);

      btnBg.on('pointerdown', (p) => {
        stopPtr(p);
        onClick?.();
      });

      btnBg.on('pointerover', () => {
        btnBg.setFillStyle(opts.hoverFill ?? (fill + 0x0a0a0a), 1);
      });
      btnBg.on('pointerout', () => {
        btnBg.setFillStyle(fill, 1);
      });

      panel.add([btnBg, btnTxt]);
      return { btnBg, btnTxt };
    };

    // Tab Navigation Bar
    const tabs = [
      { id: 'realm', label: '👑 CẢNH GIỚI' },
      { id: 'skills', label: '⚔️ KỸ NĂNG' },
      { id: 'mastery', label: '🌟 THUẦN THỤC' },
      { id: 'items', label: '💎 TÀI NGUYÊN' }
    ];

    const tabWidth = 110;
    const tabY = -350;
    const tabStartX = -165;

    tabs.forEach((tab, idx) => {
      const isActive = activeTab === tab.id;
      const tx = tabStartX + idx * tabWidth;
      makeBtn(
        tx, tabY, 106, 36, tab.label,
        () => this.openAdminTestModal(tab.id),
        {
          fill: isActive ? 0xf43f5e : 0x0f2738,
          stroke: isActive ? 0xfecdd3 : 0x334155,
          color: isActive ? '#ffffff' : '#94a3b8',
          fontSize: '12px'
        }
      );
    });

    // ============================================================
    // TAB 1: CẢNH GIỚI / CẤP ĐỘ
    // ============================================================
    if (activeTab === 'realm') {
      const applyRealm = (targetIdx, fullExp = false) => {
        targetIdx = Math.max(0, Math.min(REALMS.length - 1, targetIdx));
        gameState.realmIdx = targetIdx;
        gameState.exp = fullExp ? (REALMS[targetIdx].expReq || 999999) : 0;
        this.playerHpMax = this.calcPlayerMaxHp();
        this.playerHp = this.playerHpMax;
        if (REALMS[targetIdx]) {
          gameState.manaMax = REALMS[targetIdx].manaMax || 100;
          gameState.mana = gameState.manaMax;
          gameState.spiritualSense = REALMS[targetIdx].spiritualSense || 10;
        }
        this.updateHUD?.();
        this.createSkillBar?.();
        this.showFloatingText(this.player.x, this.player.y - 70, `⚡ Cảnh giới: [${REALMS[targetIdx].name}]!`, '#38bdf8');
        this.openAdminTestModal('realm');
      };

      // Current Realm Info Card
      const infoBox = this.add.rectangle(0, -295, 450, 60, 0x0c273b, 1)
        .setStrokeStyle(1.5, 0x38bdf8, 1);
      const infoTitle = this.add.text(0, -310, `CẢNH GIỚI: ${curRealm.name} (Bậc ${gameState.realmIdx}/${REALMS.length - 1})`, {
        fontFamily: FONT, fontSize: '13px', fontStyle: 'bold', color: '#fde047'
      }).setOrigin(0.5);
      const infoStats = this.add.text(0, -288, `EXP: ${gameState.exp}/${curRealm.expReq} • Công: ${curRealm.dmg} • Thủ: ${curRealm.def} • HP: ${curRealm.hp}`, {
        fontFamily: FONT, fontSize: '10.5px', color: '#93c5fd'
      }).setOrigin(0.5);
      panel.add([infoBox, infoTitle, infoStats]);

      // Quick Major Realm Grid
      const titleSec1 = this.add.text(0, -252, '— CHỌN NHANH ĐẠI CẢNH GIỚI —', {
        fontFamily: FONT, fontSize: '11px', fontStyle: 'bold', color: '#e2e8f0'
      }).setOrigin(0.5);
      panel.add(titleSec1);

      const realmButtons = [
        { name: '👤 Phàm Nhân (Cấp 0)', idx: 0, fill: 0x1e293b, stroke: 0x94a3b8 },
        { name: '💨 Luyện Khí Tầng 1', idx: 1, fill: 0x143528, stroke: 0x22c55e },
        { name: '💨 Luyện Khí Tầng 6', idx: 6, fill: 0x143528, stroke: 0x22c55e },
        { name: '💨 Luyện Khí Tầng 12', idx: 12, fill: 0x143528, stroke: 0x22c55e },
        { name: '🌿 Trúc Cơ Sơ Kỳ', idx: 13, fill: 0x0c4a6e, stroke: 0x0284c7 },
        { name: '🌿 Trúc Cơ Đỉnh Phong', idx: 16, fill: 0x0c4a6e, stroke: 0x0284c7 },
        { name: '🟡 Kim Đan Sơ Kỳ', idx: 17, fill: 0x713f12, stroke: 0xeab308 },
        { name: '🟡 Kim Đan Đỉnh Phong', idx: 20, fill: 0x713f12, stroke: 0xeab308 },
        { name: '🟣 Nguyên Anh Sơ Kỳ', idx: 21, fill: 0x581c87, stroke: 0xa855f7 },
        { name: '🟣 Nguyên Anh Đỉnh Phong', idx: 24, fill: 0x581c87, stroke: 0xa855f7 },
        { name: '🔴 Hóa Thần Sơ Kỳ', idx: 25, fill: 0x7f1d1d, stroke: 0xef4444 },
        { name: '🔴 Hóa Thần Đỉnh Phong', idx: 28, fill: 0x831843, stroke: 0xf43f5e }
      ];

      const startY = -225;
      const rowHeight = 36;
      realmButtons.forEach((r, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const bx = col === 0 ? -115 : 115;
        const by = startY + row * rowHeight;
        const isCurrent = gameState.realmIdx === r.idx;
        makeBtn(
          bx, by, 220, 32,
          isCurrent ? `👉 ${r.name}` : r.name,
          () => applyRealm(r.idx),
          {
            fill: isCurrent ? 0x059669 : r.fill,
            stroke: isCurrent ? 0x6ee7b7 : r.stroke,
            color: isCurrent ? '#ffffff' : '#f1f5f9',
            fontSize: '11px'
          }
        );
      });

      // Quick Step & Utility Controls
      const titleSec2 = this.add.text(0, 10, '— ĐIỀU CHỈNH CHI TIẾT & TIỆN ÍCH —', {
        fontFamily: FONT, fontSize: '11px', fontStyle: 'bold', color: '#e2e8f0'
      }).setOrigin(0.5);
      panel.add(titleSec2);

      // +1 Realm / -1 Realm
      makeBtn(-115, 45, 220, 42, '🔼 TĂNG +1 CẢNH GIỚI', () => applyRealm(gameState.realmIdx + 1), {
        fill: 0x14532d, stroke: 0x4ade80, color: '#bbf7d0', fontSize: '12px'
      });
      makeBtn(115, 45, 220, 42, '🔽 GIẢM -1 CẢNH GIỚI', () => applyRealm(gameState.realmIdx - 1), {
        fill: 0x7c2d12, stroke: 0xfb923c, color: '#fed7aa', fontSize: '12px'
      });

      // Max EXP / Full HP-MP
      makeBtn(-115, 96, 220, 42, '✨ MAX TU VI (ĐẦY EXP)', () => applyRealm(gameState.realmIdx, true), {
        fill: 0x713f12, stroke: 0xfacc15, color: '#fef08a', fontSize: '12px'
      });
      makeBtn(115, 96, 220, 42, '❤️ HỒI ĐẦY FULL HP / MP', () => {
        this.playerHpMax = this.calcPlayerMaxHp();
        this.playerHp = this.playerHpMax;
        gameState.mana = gameState.manaMax || 100;
        this.activeSkillCds = {};
        this.updateHUD?.();
        this.showFloatingText(this.player.x, this.player.y - 70, '❤️ Đã hồi phục đầy 100% HP và MP!', '#22c55e');
        this.openAdminTestModal('realm');
      }, {
        fill: 0x064e3b, stroke: 0x34d399, color: '#a7f3d0', fontSize: '12px'
      });

      // Max Everything Fast Button
      makeBtn(0, 150, 450, 44, '🌟 MAX LEVEL: HÓA THẦN ĐỈNH PHONG (CẤP 28)', () => applyRealm(28, true), {
        fill: 0x4c0519, stroke: 0xf43f5e, color: '#ffe4e6', fontSize: '13px'
      });
    }

    // ============================================================
    // TAB 2: KỸ NĂNG & CÔNG PHÁP (HỌC TẤT CẢ MỌI HỆ)
    // ============================================================
    else if (activeTab === 'skills') {
      const allSkills = ELEMENTAL_SKILLS || [];
      const allSkillIds = allSkills.map(s => s.id);
      const allCpList = CONG_PHAP_LIST || [];

      // Master Learn All Button (All 45 Skills + All 33 Cong Phap)
      makeBtn(0, -305, 450, 36, '👑 HỌC TẤT CẢ 45 SKILL & 33 CÔNG PHÁP (MAX VIÊN MÃN)', () => {
        // Unlock all 45 skills
        if (!Array.isArray(gameState.unlockedSkillIds)) gameState.unlockedSkillIds = [];
        if (!gameState.skillMastery) gameState.skillMastery = {};
        allSkillIds.forEach(id => {
          if (!gameState.unlockedSkillIds.includes(id)) gameState.unlockedSkillIds.push(id);
          gameState.skillMastery[id] = { tierIdx: 3, exp: 999999 };
        });
        // Learn all 33 Cong Phap
        if (!Array.isArray(gameState.learnedCongPhapIds)) gameState.learnedCongPhapIds = [];
        if (!gameState.congPhapMastery) gameState.congPhapMastery = {};
        allCpList.forEach(cp => {
          if (!gameState.learnedCongPhapIds.includes(cp.id)) gameState.learnedCongPhapIds.push(cp.id);
          gameState.congPhapMastery[cp.id] = { tierIdx: 3, exp: 999999 };
        });
        if (!gameState.activeCongPhapId) gameState.activeCongPhapId = 'cp_kiem_thien';
        if (gameState.equippedSkillIds.length === 0) gameState.equippedSkillIds = ['kiem_1', 'kiem_2', 'kiem_3', 'kiem_4', 'kiem_5'];

        this.playerHpMax = this.calcPlayerMaxHp();
        this.playerHp = this.playerHpMax;
        this.createSkillBar?.();
        this.updateHUD?.();
        this.showFloatingText(this.player.x, this.player.y - 70, '👑 Đã lĩnh ngộ toàn bộ 45 Kỹ Năng & 33 Công Pháp!', '#ffd700');
        this.openAdminTestModal('skills', subTab, cpElemFilter, cpPage);
      }, { fill: 0x4c0519, stroke: 0xf43f5e, color: '#fef08a', fontSize: '11.5px' });

      // Sub-Tabs: 45 Skills by 9 Elements VS 33 Cong Phap
      const subTabs = [
        { id: 'skills_elem', label: '⚔️ 45 KỸ NĂNG (9 ĐẠI HỆ)' },
        { id: 'congphap', label: '📜 33 CÔNG PHÁP 8 HỆ' }
      ];

      const activeSub = (subTab === 'sword' || subTab === 'skills_elem') ? 'skills_elem' : 'congphap';

      subTabs.forEach((st, idx) => {
        const isSubActive = activeSub === st.id;
        const sx = -115 + idx * 230;
        makeBtn(sx, -265, 220, 32, st.label, () => {
          this.openAdminTestModal('skills', st.id, cpElemFilter, 0);
        }, {
          fill: isSubActive ? 0x0284c7 : 0x0f2738,
          stroke: isSubActive ? 0x38bdf8 : 0x334155,
          color: isSubActive ? '#ffffff' : '#94a3b8',
          fontSize: '11.5px'
        });
      });

      // ----------------------------------------------------
      // SUBTAB 1: 45 KỸ NĂNG (9 ĐẠI HỆ)
      // ----------------------------------------------------
      if (activeSub === 'skills_elem') {
        const elemList = ['Kiếm', 'Kim', 'Hỏa', 'Thủy', 'Thổ', 'Mộc', 'Phong', 'Lôi', 'Vật Lý'];
        const curSkillElem = (cpElemFilter && cpElemFilter !== 'all' && elemList.includes(cpElemFilter)) ? cpElemFilter : 'Kiếm';

        // 9 Element Filter Buttons (2 rows)
        elemList.forEach((elem, idx) => {
          const row = Math.floor(idx / 5);
          const col = idx % 5;
          const ex = -176 + col * 88;
          const ey = -230 + row * 26;
          const isFilterActive = curSkillElem === elem;
          makeBtn(ex, ey, 84, 23, elem, () => {
            this.openAdminTestModal('skills', 'skills_elem', elem, 0);
          }, {
            fill: isFilterActive ? 0x059669 : 0x0c1f2e,
            stroke: isFilterActive ? 0x34d399 : 0x1e3a4e,
            color: isFilterActive ? '#ffffff' : '#94a3b8',
            fontSize: '10.5px'
          });
        });

        // Quick Batch Buttons for Selected Element (3 buttons)
        const elemSkills = allSkills.filter(s => s.elem === curSkillElem);
        const elemSkillIds = elemSkills.map(s => s.id);

        makeBtn(-145, -172, 140, 26, `⚡ Lắp 5 Ô [${curSkillElem}]`, () => {
          if (!Array.isArray(gameState.unlockedSkillIds)) gameState.unlockedSkillIds = [];
          elemSkillIds.forEach(id => {
            if (!gameState.unlockedSkillIds.includes(id)) gameState.unlockedSkillIds.push(id);
          });
          gameState.equippedSkillIds = [...elemSkillIds];
          this.createSkillBar?.();
          this.showFloatingText(this.player.x, this.player.y - 70, `⚡ Đã trang bị 5 kỹ năng hệ ${curSkillElem} vào Ô 1-5!`, '#38bdf8');
          this.openAdminTestModal('skills', 'skills_elem', curSkillElem);
        }, { fill: 0x1e3a8a, stroke: 0x3b82f6, color: '#bfdbfe', fontSize: '9.5px' });

        makeBtn(0, -172, 140, 26, `📖 Học 5 Skill [${curSkillElem}]`, () => {
          if (!Array.isArray(gameState.unlockedSkillIds)) gameState.unlockedSkillIds = [];
          elemSkillIds.forEach(id => {
            if (!gameState.unlockedSkillIds.includes(id)) gameState.unlockedSkillIds.push(id);
            if (!gameState.skillMastery[id]) gameState.skillMastery[id] = { tierIdx: 3, exp: 999999 };
          });
          this.showFloatingText(this.player.x, this.player.y - 70, `📖 Đã mở khóa 5 kỹ năng hệ ${curSkillElem}!`, '#34d399');
          this.openAdminTestModal('skills', 'skills_elem', curSkillElem);
        }, { fill: 0x064e3b, stroke: 0x34d399, color: '#a7f3d0', fontSize: '9.5px' });

        makeBtn(145, -172, 140, 26, `🗑️ Quên/Gỡ [${curSkillElem}]`, () => {
          gameState.equippedSkillIds = (gameState.equippedSkillIds || []).filter(id => !elemSkillIds.includes(id));
          gameState.unlockedSkillIds = (gameState.unlockedSkillIds || []).filter(id => !elemSkillIds.includes(id));
          this.createSkillBar?.();
          this.showFloatingText(this.player.x, this.player.y - 70, `🗑️ Đã xóa 5 kỹ năng hệ ${curSkillElem}!`, '#f87171');
          this.openAdminTestModal('skills', 'skills_elem', curSkillElem);
        }, { fill: 0x7f1d1d, stroke: 0xef4444, color: '#fecaca', fontSize: '9.5px' });

        // List 5 Skills of Selected Element
        const learnedList = this.getLearnedSkills?.() || [];
        const learnedSet = new Set(learnedList.map(s => s.id));
        (gameState.unlockedSkillIds || []).forEach(id => learnedSet.add(id));

        const startY = -125;
        const cardGap = 68;

        elemSkills.forEach((skill, idx) => {
          const sy = startY + idx * cardGap;
          const isLearned = learnedSet.has(skill.id);
          const isEquipped = (gameState.equippedSkillIds || []).includes(skill.id);
          const mastery = this.getSkillMastery ? this.getSkillMastery(skill.id) : { tier: { name: 'Sơ Nhập', color: '#aaddff' } };
          const curTierIdx = mastery.tierIdx ?? 0;

          const box = this.add.rectangle(0, sy, 450, 62, isEquipped ? 0x0e3b52 : 0x0d2232, 1)
            .setStrokeStyle(1.5, isEquipped ? 0x38bdf8 : (isLearned ? 0x1e5a7a : 0x334155), 1);

          const sName = this.add.text(-215, sy - 17, `${idx + 1}. [${skill.stage}] ${skill.name}`, {
            fontFamily: FONT, fontSize: '12px', fontStyle: 'bold', color: isLearned ? '#fde047' : '#94a3b8'
          }).setOrigin(0, 0.5);

          const sDmg = this.add.text(-215, sy - 2, `Sát thương: x${skill.dmgMul} ST • Hồi: ${skill.cd ? skill.cd/1000 + 's' : '0s'}${skill.isAoE ? ' • AOE' : ''}`, {
            fontFamily: FONT, fontSize: '9.5px', color: '#7dd3fc'
          }).setOrigin(0, 0.5);

          const sStatus = this.add.text(-215, sy + 13, `${isLearned ? '✅ ĐÃ HỌC' : '❌ CHƯA HỌC'}  •  ${isEquipped ? `⚡ Ô ${gameState.equippedSkillIds.indexOf(skill.id) + 1}` : 'Chưa trang bị'}  •  [${mastery.tier.name}]`, {
            fontFamily: FONT, fontSize: '9.5px', fontStyle: 'bold', color: isEquipped ? '#4ade80' : (isLearned ? '#a5f3fc' : '#f87171')
          }).setOrigin(0, 0.5);

          panel.add([box, sName, sDmg, sStatus]);

          // Button: Toggle Learn
          makeBtn(85, sy, 62, 26, isLearned ? 'Quên' : 'Học', () => {
            if (!Array.isArray(gameState.unlockedSkillIds)) gameState.unlockedSkillIds = [];
            if (isLearned) {
              gameState.unlockedSkillIds = gameState.unlockedSkillIds.filter(id => id !== skill.id);
              gameState.equippedSkillIds = (gameState.equippedSkillIds || []).filter(id => id !== skill.id);
            } else {
              if (!gameState.unlockedSkillIds.includes(skill.id)) gameState.unlockedSkillIds.push(skill.id);
              if (!gameState.skillMastery[skill.id]) gameState.skillMastery[skill.id] = { tierIdx: 0, exp: 0 };
            }
            this.createSkillBar?.();
            this.openAdminTestModal('skills', 'skills_elem', curSkillElem);
          }, {
            fill: isLearned ? 0x450a0a : 0x064e3b,
            stroke: isLearned ? 0xf87171 : 0x34d399,
            color: isLearned ? '#fecaca' : '#a7f3d0',
            fontSize: '10.5px'
          });

          // Button: Toggle Equip
          makeBtn(150, sy, 62, 26, isEquipped ? 'Gỡ' : 'Trang bị', () => {
            if (!Array.isArray(gameState.equippedSkillIds)) gameState.equippedSkillIds = [];
            if (isEquipped) {
              gameState.equippedSkillIds = gameState.equippedSkillIds.filter(id => id !== skill.id);
            } else {
              if (!Array.isArray(gameState.unlockedSkillIds)) gameState.unlockedSkillIds = [];
              if (!gameState.unlockedSkillIds.includes(skill.id)) gameState.unlockedSkillIds.push(skill.id);
              const ids = gameState.equippedSkillIds.filter(id => id !== skill.id);
              if (ids.length < 6) ids.push(skill.id);
              else ids[4] = skill.id;
              gameState.equippedSkillIds = ids;
            }
            this.createSkillBar?.();
            this.openAdminTestModal('skills', 'skills_elem', curSkillElem);
          }, {
            fill: isEquipped ? 0x7c2d12 : 0x1e3a8a,
            stroke: isEquipped ? 0xfb923c : 0x60a5fa,
            color: isEquipped ? '#fed7aa' : '#dbeafe',
            fontSize: '10.5px'
          });

          // Button: Cycle Mastery Tier
          makeBtn(208, sy, 50, 26, `⭐ ${SKILL_MASTERY_TIERS[curTierIdx]?.name[0] || 'S'}`, () => {
            if (!gameState.skillMastery) gameState.skillMastery = {};
            const nextTierIdx = (curTierIdx + 1) % 4;
            gameState.skillMastery[skill.id] = {
              tierIdx: nextTierIdx,
              exp: SKILL_MASTERY_TIERS[nextTierIdx].expReq || 0
            };
            this.createSkillBar?.();
            this.showFloatingText(this.player.x, this.player.y - 70, `⭐ [${skill.name}] -> ${SKILL_MASTERY_TIERS[nextTierIdx].name}!`, SKILL_MASTERY_TIERS[nextTierIdx].color);
            this.openAdminTestModal('skills', 'skills_elem', curSkillElem);
          }, {
            fill: 0x3b1c54,
            stroke: 0xc084fc,
            color: '#f3e8ff',
            fontSize: '10px'
          });
        });
      }

      // ----------------------------------------------------
      // SUBTAB 2: 33 CÔNG PHÁP 8 ĐẠI HỆ
      // ----------------------------------------------------
      else if (activeSub === 'congphap') {
        const elemCategories = [
          { key: 'all', label: 'Tất Cả' },
          { key: 'Kiếm', label: 'Kiếm' },
          { key: 'Hỏa', label: 'Hỏa' },
          { key: 'Lôi', label: 'Lôi' },
          { key: 'Kim', label: 'Kim' },
          { key: 'Thủy', label: 'Thủy' },
          { key: 'Phong', label: 'Phong' },
          { key: 'Mộc', label: 'Mộc' },
          { key: 'Thổ', label: 'Thổ' },
          { key: 'Vật Lý', label: 'Thể Tu' }
        ];

        // Element filter buttons (2 rows)
        elemCategories.forEach((cat, idx) => {
          const row = Math.floor(idx / 5);
          const col = idx % 5;
          const ex = -176 + col * 88;
          const ey = -230 + row * 28;
          const isFilterActive = cpElemFilter === cat.key;
          makeBtn(ex, ey, 84, 24, cat.label, () => {
            this.openAdminTestModal('skills', 'congphap', cat.key, 0);
          }, {
            fill: isFilterActive ? 0x059669 : 0x0c1f2e,
            stroke: isFilterActive ? 0x34d399 : 0x1e3a4e,
            color: isFilterActive ? '#ffffff' : '#94a3b8',
            fontSize: '10.5px'
          });
        });

        // Filter list
        const filteredCp = allCpList.filter(cp => {
          if (cpElemFilter === 'all') return true;
          return cp.elem === cpElemFilter || (cpElemFilter === 'Vật Lý' && (cp.elem === 'Vật Lý' || cp.elem === 'Thể Tu'));
        });

        const perPage = 4;
        const totalPages = Math.max(1, Math.ceil(filteredCp.length / perPage));
        const curPage = Math.max(0, Math.min(totalPages - 1, cpPage));
        const pageItems = filteredCp.slice(curPage * perPage, curPage * perPage + perPage);

        // Render Paginated Công Pháp Cards
        const startY = -140;
        const cardGap = 72;

        pageItems.forEach((cp, idx) => {
          const cy = startY + idx * cardGap;
          const isLearned = (gameState.learnedCongPhapIds || []).includes(cp.id);
          const isActiveCp = gameState.activeCongPhapId === cp.id;
          const gradeInfo = CONG_PHAP_GRADES[cp.grade] || CONG_PHAP_GRADES['Hoàng Giai'];

          const box = this.add.rectangle(0, cy, 450, 66, isActiveCp ? 0x143528 : (isLearned ? 0x0e2b3d : 0x0d1f2b), 1)
            .setStrokeStyle(1.5, isActiveCp ? 0x22c55e : (isLearned ? (gradeInfo.colorHex || 0x38bdf8) : 0x263c4f), 1);

          const title = this.add.text(-215, cy - 18, `${cp.name} [${cp.elem}]`, {
            fontFamily: FONT, fontSize: '12px', fontStyle: 'bold', color: gradeInfo.color || '#38bdf8'
          }).setOrigin(0, 0.5);

          const gradeText = this.add.text(-215, cy - 2, `${cp.grade} • Tốc độ tu luyện: x${cp.speed || 1} • Tối đa: ${cp.maxStage || 'Hóa Thần'}`, {
            fontFamily: FONT, fontSize: '9.5px', color: '#94a3b8'
          }).setOrigin(0, 0.5);

          const statusText = this.add.text(-215, cy + 14, `${isActiveCp ? '🌟 ĐANG TU LUYỆN' : (isLearned ? '✅ ĐÃ HỌC' : '🔒 CHƯA HỌC')}  •  Hệ: ${cp.elem}`, {
            fontFamily: FONT, fontSize: '9.5px', fontStyle: 'bold', color: isActiveCp ? '#4ade80' : (isLearned ? '#38bdf8' : '#64748b')
          }).setOrigin(0, 0.5);

          panel.add([box, title, gradeText, statusText]);

          // Action 1: Learn / Forget
          makeBtn(140, cy - 13, 76, 25, isLearned ? 'Quên' : 'Học', () => {
            if (!Array.isArray(gameState.learnedCongPhapIds)) gameState.learnedCongPhapIds = [];
            if (isLearned) {
              gameState.learnedCongPhapIds = gameState.learnedCongPhapIds.filter(id => id !== cp.id);
              if (gameState.activeCongPhapId === cp.id) gameState.activeCongPhapId = null;
            } else {
              if (!gameState.learnedCongPhapIds.includes(cp.id)) gameState.learnedCongPhapIds.push(cp.id);
              if (!gameState.activeCongPhapId) gameState.activeCongPhapId = cp.id;
            }
            this.updateHUD?.();
            this.openAdminTestModal('skills', 'congphap', cpElemFilter, curPage);
          }, {
            fill: isLearned ? 0x450a0a : 0x064e3b,
            stroke: isLearned ? 0xf87171 : 0x34d399,
            color: isLearned ? '#fecaca' : '#a7f3d0',
            fontSize: '11px'
          });

          // Action 2: Activate
          makeBtn(140, cy + 15, 76, 25, isActiveCp ? 'Đang kích hoạt' : 'Kích hoạt', () => {
            if (!Array.isArray(gameState.learnedCongPhapIds)) gameState.learnedCongPhapIds = [];
            if (!gameState.learnedCongPhapIds.includes(cp.id)) gameState.learnedCongPhapIds.push(cp.id);
            gameState.activeCongPhapId = cp.id;
            this.updateHUD?.();
            this.openAdminTestModal('skills', 'congphap', cpElemFilter, curPage);
          }, {
            fill: isActiveCp ? 0x14532d : 0x1e3a8a,
            stroke: isActiveCp ? 0x22c55e : 0x3b82f6,
            color: isActiveCp ? '#86efac' : '#bfdbfe',
            fontSize: '10.5px'
          });
        });

        // Pagination Bar
        const pageInfo = this.add.text(0, 160, `Trang ${curPage + 1} / ${totalPages} (${filteredCp.length} công pháp)`, {
          fontFamily: FONT, fontSize: '11px', color: '#94a3b8'
        }).setOrigin(0.5);
        panel.add(pageInfo);

        makeBtn(-130, 160, 95, 30, '◀ Trước', () => {
          if (curPage > 0) this.openAdminTestModal('skills', 'congphap', cpElemFilter, curPage - 1);
        }, { fill: 0x0f2738, stroke: 0x334155, fontSize: '11px' });

        makeBtn(130, 160, 95, 30, 'Sau ▶', () => {
          if (curPage < totalPages - 1) this.openAdminTestModal('skills', 'congphap', cpElemFilter, curPage + 1);
        }, { fill: 0x0f2738, stroke: 0x334155, fontSize: '11px' });
      }
    }

    // ============================================================
    // TAB 3: THUẦN THỤC KỸ NĂNG & CÔNG PHÁP (SƠ NHẬP -> VIÊN MÃN)
    // ============================================================
    else if (activeTab === 'mastery') {
      const allSkills = ELEMENTAL_SKILLS || [];
      const allCpList = CONG_PHAP_LIST || [];

      const setAllMastery = (tierIdx) => {
        if (!gameState.skillMastery) gameState.skillMastery = {};
        allSkills.forEach(skill => {
          gameState.skillMastery[skill.id] = {
            tierIdx,
            exp: SKILL_MASTERY_TIERS[tierIdx].expReq || 0
          };
        });
        if (!gameState.congPhapMastery) gameState.congPhapMastery = {};
        allCpList.forEach(cp => {
          gameState.congPhapMastery[cp.id] = {
            tierIdx,
            exp: SKILL_MASTERY_TIERS[tierIdx].expReq || 0
          };
        });
        this.createSkillBar?.();
        this.showFloatingText(this.player.x, this.player.y - 70, `🌟 Toàn bộ 45 Kỹ Năng & 33 Công Pháp -> [${SKILL_MASTERY_TIERS[tierIdx].name}]!`, SKILL_MASTERY_TIERS[tierIdx].color);
        this.openAdminTestModal('mastery', subTab, cpElemFilter);
      };

      // Bulk Tier Setters
      const titleSec = this.add.text(0, -315, '— THIẾT LẬP NHANH TOÀN BỘ 45 KỸ NĂNG & 33 CÔNG PHÁP —', {
        fontFamily: FONT, fontSize: '11px', fontStyle: 'bold', color: '#e2e8f0'
      }).setOrigin(0.5);
      panel.add(titleSec);

      const bulkTiers = [
        { label: '⚪ Sơ Nhập (+0%)', tier: 0, fill: 0x1e293b, stroke: 0x94a3b8, color: '#e2e8f0' },
        { label: '🟢 Tiểu Thành (+35%)', tier: 1, fill: 0x143528, stroke: 0x22c55e, color: '#86efac' },
        { label: '🟡 Đại Thành (+80%)', tier: 2, fill: 0x713f12, stroke: 0xeab308, color: '#fef08a' },
        { label: '🟣 Viên Mãn (+150%)', tier: 3, fill: 0x581c87, stroke: 0xd946ef, color: '#f5d0fe' }
      ];

      bulkTiers.forEach((bt, i) => {
        const bx = -165 + i * 110;
        makeBtn(bx, -270, 105, 36, bt.label, () => setAllMastery(bt.tier), {
          fill: bt.fill, stroke: bt.stroke, color: bt.color, fontSize: '10px'
        });
      });

      // Element Selector for Individual Mastery View
      const elemList = ['Kiếm', 'Kim', 'Hỏa', 'Thủy', 'Thổ', 'Mộc', 'Phong', 'Lôi', 'Vật Lý'];
      const curMasteryElem = (cpElemFilter && cpElemFilter !== 'all' && elemList.includes(cpElemFilter)) ? cpElemFilter : 'Kiếm';

      elemList.forEach((elem, idx) => {
        const row = Math.floor(idx / 5);
        const col = idx % 5;
        const ex = -176 + col * 88;
        const ey = -215 + row * 24;
        const isFilterActive = curMasteryElem === elem;
        makeBtn(ex, ey, 84, 21, elem, () => {
          this.openAdminTestModal('mastery', subTab, elem);
        }, {
          fill: isFilterActive ? 0x059669 : 0x0c1f2e,
          stroke: isFilterActive ? 0x34d399 : 0x1e3a4e,
          color: isFilterActive ? '#ffffff' : '#94a3b8',
          fontSize: '10px'
        });
      });

      // Per-Skill Mastery Row for selected element
      const skillsOfElem = allSkills.filter(s => s.elem === curMasteryElem);
      const startY = -155;
      const cardGap = 65;

      skillsOfElem.forEach((skill, idx) => {
        const sy = startY + idx * cardGap;
        const currentData = this.getSkillMastery ? this.getSkillMastery(skill.id) : { tierIdx: 0, tier: SKILL_MASTERY_TIERS[0] };
        const curTierIdx = currentData.tierIdx ?? 0;
        const curTier = SKILL_MASTERY_TIERS[curTierIdx] || SKILL_MASTERY_TIERS[0];

        const box = this.add.rectangle(0, sy, 450, 60, 0x0d2232, 1)
          .setStrokeStyle(1.5, curTier.badgeBg || 0x334155, 1);

        const title = this.add.text(-215, sy - 16, `${idx + 1}. [${skill.elem}] ${skill.name}`, {
          fontFamily: FONT, fontSize: '12px', fontStyle: 'bold', color: '#f8fafc'
        }).setOrigin(0, 0.5);

        const badge = this.add.text(215, sy - 16, `[${curTier.name} +${Math.round(curTier.dmgBonus * 100)}% ST]`, {
          fontFamily: FONT, fontSize: '10.5px', fontStyle: 'bold', color: curTier.color
        }).setOrigin(1, 0.5);

        panel.add([box, title, badge]);

        // 4 Tier Selection Buttons for this skill
        SKILL_MASTERY_TIERS.forEach((tier, tIdx) => {
          const isSelected = curTierIdx === tIdx;
          const bx = -157 + tIdx * 105;
          const by = sy + 13;

          makeBtn(bx, by, 100, 24, `${isSelected ? '✔ ' : ''}${tier.name}`, () => {
            if (!gameState.skillMastery) gameState.skillMastery = {};
            gameState.skillMastery[skill.id] = {
              tierIdx: tIdx,
              exp: tier.expReq || 0
            };
            this.createSkillBar?.();
            this.showFloatingText(this.player.x, this.player.y - 70, `🌟 [${skill.name}] -> ${tier.name}!`, tier.color);
            this.openAdminTestModal('mastery', subTab, curMasteryElem);
          }, {
            fill: isSelected ? (tier.badgeBg || 0x0369a1) : 0x091c29,
            stroke: isSelected ? (tier.color || 0x38bdf8) : 0x1e3a4e,
            color: isSelected ? '#ffffff' : '#94a3b8',
            fontSize: '11px'
          });
        });
      });
    }
    // ============================================================
    // TAB 4: TÀI NGUYÊN & TIỆN ÍCH
    // ============================================================
    else if (activeTab === 'items') {
      ensureCurrencies(gameState);

      // Section 1: Tiền Tệ
      const titleSec1 = this.add.text(0, -315, '— TIỀN TỆ & LINH THẠCH —', {
        fontFamily: FONT, fontSize: '11px', fontStyle: 'bold', color: '#e2e8f0'
      }).setOrigin(0.5);
      panel.add(titleSec1);

      makeBtn(-115, -280, 220, 38, '🪙 +1.000.000 Bạc', () => {
        addCurrency(gameState, 'silver', 1000000);
        this.updateHUD?.();
        this.showFloatingText(this.player.x, this.player.y - 70, '+1.000.000 Bạc!', '#cbd5e1');
        this.openAdminTestModal('items');
      }, { fill: 0x1e293b, stroke: 0x94a3b8, color: '#f8fafc', fontSize: '12px' });

      makeBtn(115, -280, 220, 38, '💎 +10.000 Linh Thạch Hạ', () => {
        addCurrency(gameState, 'low', 10000);
        this.updateHUD?.();
        this.showFloatingText(this.player.x, this.player.y - 70, '+10.000 Linh Thạch Hạ Phẩm!', '#38bdf8');
        this.openAdminTestModal('items');
      }, { fill: 0x0c4a6e, stroke: 0x38bdf8, color: '#e0f2fe', fontSize: '12px' });

      makeBtn(-115, -235, 220, 38, '🔮 +1.000 Linh Thạch Trung', () => {
        addCurrency(gameState, 'mid', 1000);
        this.updateHUD?.();
        this.showFloatingText(this.player.x, this.player.y - 70, '+1.000 Linh Thạch Trung Phẩm!', '#c084fc');
        this.openAdminTestModal('items');
      }, { fill: 0x581c87, stroke: 0xc084fc, color: '#f3e8ff', fontSize: '12px' });

      makeBtn(115, -235, 220, 38, '👑 +100 Linh Thạch Cực Phẩm', () => {
        addCurrency(gameState, 'extreme', 100);
        this.updateHUD?.();
        this.showFloatingText(this.player.x, this.player.y - 70, '+100 Linh Thạch Cực Phẩm!', '#f43f5e');
        this.openAdminTestModal('items');
      }, { fill: 0x831843, stroke: 0xf43f5e, color: '#ffe4e6', fontSize: '12px' });

      // Section 2: Dược Liệu & Nguyên Liệu
      const titleSec2 = this.add.text(0, -195, '— DƯỢC LIỆU & NGUYÊN LIỆU —', {
        fontFamily: FONT, fontSize: '11px', fontStyle: 'bold', color: '#e2e8f0'
      }).setOrigin(0.5);
      panel.add(titleSec2);

      makeBtn(0, -160, 450, 40, '🌿 +99 TẤT CẢ 50 LOẠI LINH THẢO (Phẩm 1 -> 5)', () => {
        if (!gameState.herbs) gameState.herbs = {};
        ALL_HERBS.forEach(herb => {
          gameState.herbs[herb.name] = (gameState.herbs[herb.name] || 0) + 99;
        });
        this.showFloatingText(this.player.x, this.player.y - 70, '🌿 Đã thêm +99 cho toàn bộ 50 loại Linh Thảo!', '#4ade80');
        this.openAdminTestModal('items');
      }, { fill: 0x14532d, stroke: 0x22c55e, color: '#bbf7d0', fontSize: '12.5px' });

      makeBtn(-115, -112, 220, 38, '⛏️ +99 Quặng Khoáng Thạch', () => {
        gameState.ores = (gameState.ores || 0) + 99;
        this.showFloatingText(this.player.x, this.player.y - 70, '+99 Quặng Khoáng Thạch!', '#facc15');
        this.openAdminTestModal('items');
      }, { fill: 0x713f12, stroke: 0xfacc15, color: '#fef08a', fontSize: '12px' });

      makeBtn(115, -112, 220, 38, '🐾 +99 Vật Liệu Yêu Thú', () => {
        if (!gameState.materials) gameState.materials = {};
        gameState.materials.beastPelts = (gameState.materials.beastPelts || 0) + 99;
        gameState.materials.beastFurs = (gameState.materials.beastFurs || 0) + 99;
        gameState.materials.beastClaws = (gameState.materials.beastClaws || 0) + 99;
        gameState.materials.beastBlood = (gameState.materials.beastBlood || 0) + 99;
        gameState.materials.beastHorns = (gameState.materials.beastHorns || 0) + 99;
        this.showFloatingText(this.player.x, this.player.y - 70, '+99 Tất cả Vật Liệu Yêu Thú!', '#fb923c');
        this.openAdminTestModal('items');
      }, { fill: 0x7c2d12, stroke: 0xfb923c, color: '#fed7aa', fontSize: '12px' });

      // Section 3: Đan Dược Đột Phá & Tiện Ích
      const titleSec3 = this.add.text(0, -72, '— ĐAN DƯỢC & HỒI PHỤC —', {
        fontFamily: FONT, fontSize: '11px', fontStyle: 'bold', color: '#e2e8f0'
      }).setOrigin(0.5);
      panel.add(titleSec3);

      makeBtn(0, -35, 450, 42, '💊 +20 ĐAN ĐỘT PHÁ CÁC ĐẠI CẢNH GIỚI', () => {
        if (!gameState.inventory) gameState.inventory = {};
        if (!gameState.inventory.pills) gameState.inventory.pills = {};
        gameState.inventory.pills['Nhất Phẩm Cực Phẩm Trúc Cơ Đan'] = (gameState.inventory.pills['Nhất Phẩm Cực Phẩm Trúc Cơ Đan'] || 0) + 20;
        gameState.inventory.pills['Nhị Phẩm Cực Phẩm Ngưng Đan Đan'] = (gameState.inventory.pills['Nhị Phẩm Cực Phẩm Ngưng Đan Đan'] || 0) + 20;
        gameState.inventory.pills['Tam Phẩm Cực Phẩm Hóa Anh Đan'] = (gameState.inventory.pills['Tam Phẩm Cực Phẩm Hóa Anh Đan'] || 0) + 20;
        gameState.inventory.pills['Tứ Phẩm Cực Phẩm Hóa Thần Đan'] = (gameState.inventory.pills['Tứ Phẩm Cực Phẩm Hóa Thần Đan'] || 0) + 20;
        this.showFloatingText(this.player.x, this.player.y - 70, '💊 +20 Đan Đột Phá (Trúc Cơ/Ngưng Đan/Hóa Anh/Hóa Thần)!', '#a855f7');
        this.openAdminTestModal('items');
      }, { fill: 0x4c1d95, stroke: 0xa855f7, color: '#f3e8ff', fontSize: '12px' });

      makeBtn(0, 15, 450, 42, '💖 HỒI ĐẦY 100% HP & MP (XÓA COOLDOWN)', () => {
        this.playerHpMax = this.calcPlayerMaxHp();
        this.playerHp = this.playerHpMax;
        gameState.mana = gameState.manaMax || 100;
        this.activeSkillCds = {};
        this.updateHUD?.();
        this.showFloatingText(this.player.x, this.player.y - 70, '💖 Đã phục hồi tối đa sinh mệnh & linh lực!', '#ec4899');
        this.openAdminTestModal('items');
      }, { fill: 0x831843, stroke: 0xf43f5e, color: '#ffe4e6', fontSize: '12px' });

      makeBtn(0, 65, 450, 42, '🎁 RESET NHẬN QUÀ TÂN THỦ (TRƯỞNG THÔN)', () => {
        gameState.claimedStarterGift = false;
        if (this.claimedStarterGift !== undefined) this.claimedStarterGift = false;
        this.showFloatingText(this.player.x, this.player.y - 70, '🎁 Đã reset trạng thái Quà Tân Thủ Trưởng Thôn!', '#22c55e');
        this.openAdminTestModal('items');
      }, { fill: 0x134e4a, stroke: 0x14b8a6, color: '#ccfbf1', fontSize: '12px' });
    }
  },
};
