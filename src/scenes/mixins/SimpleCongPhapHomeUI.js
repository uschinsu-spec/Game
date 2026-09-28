import { W, H } from '../constants.js';

const FONT = 'Be Vietnam Pro, sans-serif';

function stopPointer(pointer) {
  const evt = pointer?.event;
  if (!evt) return;
  evt.stopPropagation?.();
  evt.preventDefault?.();
}

function pauseWorld(scene) {
  scene.moveTarget = null;
  if (scene.player?.body?.setVelocity) scene.player.setVelocity(0, 0);
  if (scene.joy) {
    scene.joy.active = false;
    scene.joy.id = null;
    scene.joy.x = 0;
    scene.joy.y = 0;
  }
  scene.joyBase?.setVisible?.(false);
  scene.joyKnob?.setVisible?.(false);
  if (!scene.__uiWorldPaused && scene.physics?.world?.pause) {
    scene.physics.world.pause();
    scene.__uiWorldPaused = true;
  }
}

function fitSingleLine(textObj, maxWidth, minPx = 11) {
  let size = parseFloat(textObj?.style?.fontSize || 16);
  while (textObj && textObj.width > maxWidth && size > minPx) {
    size -= 1;
    textObj.setFontSize(size);
  }
  return textObj;
}

function createShell(scene) {
  scene.closeModal();
  const overlay = scene.fixed(scene.add.rectangle(W / 2, H / 2, W + 12, H + 12, 0x020912, 1), 9998)
    .setInteractive({ useHandCursor: false });
  const panel = scene.fixed(scene.add.container(W / 2, H / 2), 10000);
  scene.activeModal = panel;
  scene.activeModalOverlay = overlay;
  pauseWorld(scene);

  overlay.on('pointerdown', stopPointer);
  overlay.on('pointerup', stopPointer);
  overlay.on('pointermove', stopPointer);

  const bg = scene.add.rectangle(0, 0, W - 8, H - 8, 0x062a3b, 1)
    .setStrokeStyle(3, 0x63e6ff, 1);
  const header = scene.add.rectangle(0, -427, W - 20, 88, 0x0b4560, 1)
    .setStrokeStyle(1.5, 0x4de9ff, 0.95);
  const title = scene.add.text(-238, -445, 'CÔNG PHÁP', {
    fontFamily: FONT, fontSize: '24px', fontStyle: 'bold', color: '#ffe45c'
  }).setOrigin(0, 0.5);
  const sub = scene.add.text(-238, -414, 'CHỌN MỘT NỘI DUNG', {
    fontFamily: FONT, fontSize: '13px', fontStyle: 'bold', color: '#7ff4ff'
  }).setOrigin(0, 0.5);
  panel.add([bg, header, title, sub]);
  scene.createModalCloseBtn(panel);
  return panel;
}

function addCard(scene, panel, y, icon, title, desc, palette, action) {
  const bg = scene.add.rectangle(0, y, 474, 142, palette.fill, 1)
    .setStrokeStyle(2.5, palette.stroke, 1)
    .setInteractive({ useHandCursor: true });
  const iconTxt = scene.add.text(-198, y, icon, { fontSize: '36px' }).setOrigin(0.5);
  const titleTxt = scene.add.text(-150, y - 24, title, {
    fontFamily: FONT, fontSize: '19px', fontStyle: 'bold', color: palette.title
  }).setOrigin(0, 0.5);
  const descTxt = scene.add.text(-150, y + 20, desc, {
    fontFamily: FONT, fontSize: '13px', color: palette.sub
  }).setOrigin(0, 0.5);
  const arrow = scene.add.text(215, y, '›', {
    fontFamily: FONT, fontSize: '36px', fontStyle: 'bold', color: '#d9fbff'
  }).setOrigin(0.5);

  fitSingleLine(titleTxt, 330, 14);
  fitSingleLine(descTxt, 330, 10);

  bg.on('pointerdown', pointer => {
    stopPointer(pointer);
    action();
  });
  bg.on('pointerover', () => bg.setFillStyle(palette.hover, 1));
  bg.on('pointerout', () => bg.setFillStyle(palette.fill, 1));
  panel.add([bg, iconTxt, titleTxt, descTxt, arrow]);
}

export function installSimpleCongPhapHomeUI(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__simpleCongPhapHomeInstalled) return;
  const proto = MainGameScene.prototype;
  proto.__simpleCongPhapHomeInstalled = true;

  const legacyOpenCongPhapPanel = proto.openCongPhapPanel;
  if (typeof legacyOpenCongPhapPanel !== 'function') return;
  proto.__legacyOpenCongPhapPanel = legacyOpenCongPhapPanel;

  proto.openCongPhapPanel = function openSimpleCongPhapHome() {
    const panel = createShell(this);

    addCard(this, panel, -245, '📜', 'CÔNG PHÁP TU LUYỆN', 'Học và chọn công pháp đang vận hành.', {
      fill: 0x07566c, hover: 0x0b718b, stroke: 0x55efff, title: '#a9fbff', sub: '#d7fbff'
    }, () => legacyOpenCongPhapPanel.call(this, 'Hoàng Giai', 'manuals', 0));

    addCard(this, panel, -70, '🏪', 'TIỆM DA THÚ', 'Bán nguyên liệu săn quái để lấy Bạc.', {
      fill: 0x12523d, hover: 0x176a4e, stroke: 0x68f5ae, title: '#b8ffd6', sub: '#dcffea'
    }, () => legacyOpenCongPhapPanel.call(this, 'Hoàng Giai', 'exchange', 0));

    addCard(this, panel, 105, '⚡', 'TÀNG KINH THẦN THÔNG', 'Chọn hệ và sắp xếp kỹ năng chiến đấu.', {
      fill: 0x5b4513, hover: 0x725717, stroke: 0xffdc63, title: '#fff09a', sub: '#fff5c7'
    }, () => this.openSkillPanel('Kiếm'));

    const note = this.add.text(0, 270, 'BẤM MỤC ĐỂ XEM CHI TIẾT VÀ XÁC NHẬN', {
      fontFamily: FONT, fontSize: '13px', fontStyle: 'bold', color: '#a9eaff'
    }).setOrigin(0.5);
    fitSingleLine(note, 440, 10);
    panel.add(note);
  };
}
