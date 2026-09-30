/**
 * CharacterSectModal.js
 * Quản lý: openCurrencyExchangeModal (Tiền Trang Tu Tiên & Quy Đổi Linh Thạch)
 * (Toàn bộ logic tông môn cũ đã được dọn sạch để chuẩn bị thiết kế hệ thống mới)
 */
import { gameState } from '../../state/gameState.js';
import { CURRENCY_TIERS, CURRENCY_MAP, CURRENCY_RATIO, ensureCurrencies, addCurrency, deductCurrency, hasCurrency, exchangeUp, exchangeDown, formatCurrencySummary } from '../../config/currencyData.js';
import { W, H } from '../constants.js';

export const CharacterSectModal = {
  // ----------------------------------------------------------------
  // Tiền Trang Tu Tiên - Quy Đổi Tiền Tệ Tỷ Lệ 1:10000

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

    const bottomNote = this.add.text(0, 285, '💡 Mẹo: Nhấn vào chân dung nhân vật ở đầu màn hình để mở Tiền Trang.', {
      fontSize: '8.5px', color: '#94a3b8'
    }).setOrigin(0.5);
    panel.add(bottomNote);

    this.activeModal = panel;
    this.activeModalOverlay = overlay;
  }
};
