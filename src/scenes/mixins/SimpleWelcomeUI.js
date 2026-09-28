import { W, H } from '../constants.js';
import { gameState } from '../../state/gameState.js';
import { fitSingleLine, stopPointer } from './UiModalManager.js';
import {
  resetToNewGame,
  importSaveCode,
  hasLocalSave,
  loadFromLocalStorage
} from '../../state/saveSystem.js';

const FONT = 'Be Vietnam Pro, sans-serif';

function createScreen(scene, title, subtitle) {
  const panel = scene.createModalShell(title, subtitle, {
    noCloseBtn: true,
    titleOriginX: 0.5,
    titleX: 0,
    titleY: -430,
    titleFontSize: '28px',
    subOriginX: 0.5,
    subX: 0,
    subY: -388,
    subFontSize: '14px',
    headerY: -405,
    headerH: 126
  });
  return panel;
}

function addChoice(scene, panel, y, icon, title, subtitle, palette, onPress, enabled = true) {
  const fill = enabled ? palette.fill : 0x223544;
  const stroke = enabled ? palette.stroke : 0x51616c;
  const titleColor = enabled ? palette.title : '#94a3b8';
  const subColor = enabled ? palette.sub : '#64748b';

  const box = scene.add.rectangle(0, y, 474, 112, fill, 1)
    .setStrokeStyle(2.5, stroke, 1)
    .setInteractive({ useHandCursor: enabled });
  const iconTxt = scene.add.text(-198, y, icon, { fontSize: '38px' }).setOrigin(0.5);
  const titleTxt = scene.add.text(-154, y - 18, title, {
    fontFamily: FONT,
    fontSize: '19px',
    fontStyle: 'bold',
    color: titleColor
  }).setOrigin(0, 0.5);
  const subTxt = scene.add.text(-154, y + 20, subtitle, {
    fontFamily: FONT,
    fontSize: '12px',
    color: subColor
  }).setOrigin(0, 0.5);
  const arrow = scene.add.text(210, y, enabled ? '›' : '—', {
    fontFamily: FONT,
    fontSize: '36px',
    fontStyle: 'bold',
    color: enabled ? '#d9fbff' : '#64748b'
  }).setOrigin(0.5);

  fitSingleLine(titleTxt, 332, 14);
  fitSingleLine(subTxt, 332, 10);

  if (enabled && typeof onPress === 'function') {
    box.on('pointerdown', pointer => {
      stopPointer(scene, pointer);
      onPress();
    });
    box.on('pointerover', () => box.setFillStyle(palette.hover ?? palette.fill, 1));
    box.on('pointerout', () => box.setFillStyle(palette.fill, 1));
  }

  panel.add([box, iconTxt, titleTxt, subTxt, arrow]);
  return box;
}

function syncLoadedState(scene, message) {
  const targetMapId = Number.isFinite(gameState.currentMapId) ? gameState.currentMapId : 0;
  scene.playerHpMax = scene.calcPlayerMaxHp?.() ?? scene.playerHpMax;
  scene.playerHp = scene.playerHpMax;
  const maxMp = scene.calcPlayerMaxMp?.() ?? gameState.manaMax ?? 500;
  gameState.mana = Math.max(0, Math.min(gameState.mana ?? maxMp, maxMp));

  scene.updateHUD?.();
  scene.createSkillBar?.();
  scene.closeModal();

  if (scene.currentMap?.id !== targetMapId && scene.switchMap) {
    scene.switchMap(targetMapId);
  }
  if (gameState.party?.isFormed) scene.initFellowNpcs?.();

  if (scene.player && message) {
    scene.showFloatingText?.(scene.player.x, scene.player.y - 65, message, '#7cffd5', '15px');
  }
}

function startNewGame(scene) {
  resetToNewGame();
  syncLoadedState(scene, 'Đã bắt đầu hành trình mới!');
}

function continueLocalSave(scene) {
  const result = loadFromLocalStorage();
  if (!result?.success) {
    scene.openLoadSaveModal(result?.error || 'Không tìm thấy bản lưu.');
    return;
  }
  syncLoadedState(scene, 'Đã khôi phục bản lưu gần nhất!');
}

function importCode(scene, code) {
  const result = importSaveCode(code || '');
  if (!result?.success) return result;
  syncLoadedState(scene, 'Tải tiến trình thành công!');
  return result;
}

export const SimpleWelcomeModal = {
  openWelcomeScreenModal() {
    const panel = createScreen(this, '☯ LINH SƠN PHI KIẾM 3D ☯', 'TU TIÊN · SĂN YÊU · PHI KIẾM');
    const localSave = hasLocalSave();

    addChoice(this, panel, -190, '✨', 'TẠO NHÂN VẬT MỚI', 'Bắt đầu từ Thanh Vân Thôn', {
      fill: 0x07566c, hover: 0x0b718b, stroke: 0x55efff, title: '#a9fbff', sub: '#d7fbff'
    }, () => startNewGame(this));

    addChoice(this, panel, -48, '📜', 'NHẬP MÃ LƯU GAME', 'Khôi phục tiến trình bằng Save Code', {
      fill: 0x47266b, hover: 0x60318d, stroke: 0xc16cff, title: '#f3c6ff', sub: '#e8dbff'
    }, () => this.openLoadSaveModal());

    addChoice(this, panel, 94, '💾', localSave ? 'TIẾP TỤC BẢN LƯU' : 'CHƯA CÓ BẢN LƯU',
      localSave ? 'Khôi phục tiến trình gần nhất trên máy' : 'Hãy tạo nhân vật mới hoặc nhập Save Code', {
        fill: 0x12523d, hover: 0x176a4e, stroke: 0x68f5ae, title: '#b8ffd6', sub: '#dcffea'
      }, () => continueLocalSave(this), localSave);

    const noteBg = this.add.rectangle(0, 280, 474, 76, 0x0b3d50, 1)
      .setStrokeStyle(1.5, 0x35c8e6, 0.9);
    const note = this.add.text(0, 270, 'TỰ ĐỘNG SAO LƯU TIẾN TRÌNH', {
      fontFamily: FONT, fontSize: '15px', fontStyle: 'bold', color: '#ffe978'
    }).setOrigin(0.5);
    const note2 = this.add.text(0, 296, 'Game lưu định kỳ khi đang chơi', {
      fontFamily: FONT, fontSize: '12px', color: '#9df4ff'
    }).setOrigin(0.5);
    panel.add([noteBg, note, note2]);
  },

  openLoadSaveModal(initialStatus = '') {
    const panel = createScreen(this, 'TẢI TIẾN TRÌNH', 'CHỌN MỘT CÁCH KHÔI PHỤC');
    let statusText = null;

    const setStatus = (text, ok = false) => {
      if (!statusText?.active) return;
      statusText.setText(String(text || ''));
      statusText.setColor(ok ? '#7cffc7' : '#ff9aaa');
      fitSingleLine(statusText, 440, 10);
    };

    const manualImport = () => {
      const code = window.prompt('Dán Save Code vào đây:');
      if (!code) return;
      const result = importCode(this, code);
      if (!result?.success) setStatus(result?.error || 'Mã lưu không hợp lệ.');
    };

    addChoice(this, panel, -190, '📋', 'DÁN TỪ CLIPBOARD', 'Đọc Save Code đã sao chép', {
      fill: 0x07566c, hover: 0x0b718b, stroke: 0x55efff, title: '#a9fbff', sub: '#d7fbff'
    }, async () => {
      try {
        setStatus('Đang đọc clipboard...', true);
        const code = await navigator.clipboard.readText();
        const result = importCode(this, code);
        if (!result?.success) setStatus(result?.error || 'Clipboard không có Save Code.');
      } catch (e) {
        setStatus('Trình duyệt chưa cho phép đọc clipboard.');
      }
    });

    addChoice(this, panel, -48, '⌨️', 'NHẬP MÃ THỦ CÔNG', 'Dán Save Code bằng bàn phím', {
      fill: 0x47266b, hover: 0x60318d, stroke: 0xc16cff, title: '#f3c6ff', sub: '#e8dbff'
    }, manualImport);

    const localSave = hasLocalSave();
    addChoice(this, panel, 94, '💾', localSave ? 'BẢN LƯU TRÊN MÁY' : 'KHÔNG CÓ BẢN LƯU',
      localSave ? 'Tải ngay tiến trình gần nhất' : 'Chưa tìm thấy dữ liệu lưu cục bộ', {
        fill: 0x12523d, hover: 0x176a4e, stroke: 0x68f5ae, title: '#b8ffd6', sub: '#dcffea'
      }, () => continueLocalSave(this), localSave);

    const back = this.add.rectangle(0, 330, 474, 54, 0x263849, 1)
      .setStrokeStyle(2, 0x91cfe4, 1)
      .setInteractive({ useHandCursor: true });
    const backTxt = this.add.text(0, 330, '‹ QUAY LẠI', {
      fontFamily: FONT, fontSize: '15px', fontStyle: 'bold', color: '#ecfbff'
    }).setOrigin(0.5);
    back.on('pointerdown', pointer => {
      stopPointer(this, pointer);
      this.openWelcomeScreenModal();
    });

    statusText = this.add.text(0, 392, initialStatus || '', {
      fontFamily: FONT, fontSize: '12px', fontStyle: 'bold', color: '#ff9aaa'
    }).setOrigin(0.5);
    fitSingleLine(statusText, 440, 10);
    panel.add([back, backTxt, statusText]);
  }
};

export function installSimpleWelcomeUI(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__simpleWelcomeUiInstalled) return;
  const proto = MainGameScene.prototype;
  proto.__simpleWelcomeUiInstalled = true;

  Object.assign(proto, SimpleWelcomeModal);
}
