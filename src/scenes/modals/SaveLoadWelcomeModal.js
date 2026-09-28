/**
 * SaveLoadWelcomeModal.js
 * Quản lý: openSaveGameModal, promptManualLoad
 */
import { exportSaveCode, importSaveCode } from '../../state/saveSystem.js';
import { W, H } from '../constants.js';

export const SaveLoadWelcomeModal = {
  // ----------------------------------------------------------------
  // BẢNG XUẤT MÃ LƯU GAME (SAVE GAME CODE MODAL)

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
  }
};
