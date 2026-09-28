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

  const bg = scene.add.rectangle(0, 0, W - 8, H - 8, 0x082638, 1)
    .setStrokeStyle(2.5, 0x63e6ff, 1);
  const header = scene.add.rectangle(0, -427, W - 20, 88, 0x0b3247, 1)
    .setStrokeStyle(1.5, 0x3dd9ff, 0.9);
  const title = scene.add.text(-238, -445, 'CÔNG PHÁP', {
    fontFamily: FONT, fontSize: '22px', fontStyle: 'bold', color: '#ffe77a'
  }).setOrigin(0, 0.5);
  const sub = scene.add.text(-238, -414, 'Chọn nội dung cần xem', {
    fontFamily: FONT, fontSize: '12px', color: '#9aeaff'
  }).setOrigin(0, 0.5);
  panel.add([bg, header, title, sub]);
  scene.createModalCloseBtn(panel);
  return panel;
}

function addCard(scene, panel, y, icon, title, desc, color, action) {
  const bg = scene.add.rectangle(0, y, 470, 150, 0x0d3347, 1)
    .setStrokeStyle(2, color, 1)
    .setInteractive({ useHandCursor: true });
  const iconTxt = scene.add.text(-198, y, icon, { fontSize: '34px' }).setOrigin(0.5);
  const titleTxt = scene.add.text(-150, y - 28, title, {
    fontFamily: FONT, fontSize: '18px', fontStyle: 'bold', color: '#ffffff'
  }).setOrigin(0, 0.5);
  const descTxt = scene.add.text(-150, y + 18, desc, {
    fontFamily: FONT, fontSize: '13px', color: '#bcefff', lineSpacing: 4,
    wordWrap: { width: 330, useAdvancedWrap: true }
  }).setOrigin(0, 0.5);
  const arrow = scene.add.text(215, y, '›', {
    fontFamily: FONT, fontSize: '34px', fontStyle: 'bold', color: '#7cf3ff'
  }).setOrigin(0.5);

  bg.on('pointerdown', pointer => {
    stopPointer(pointer);
    action();
  });
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

    addCard(this, panel, -255, '📜', 'CÔNG PHÁP TU LUYỆN',
      'Xem công pháp theo phẩm cấp, học và chọn công pháp đang vận hành.',
      0x55e6ff,
      () => legacyOpenCongPhapPanel.call(this, 'Hoàng Giai', 'manuals', 0));

    addCard(this, panel, -75, '🏪', 'TIỆM DA THÚ',
      'Bán nguyên liệu săn quái để đổi Bạc và chuẩn bị mua công pháp.',
      0x67f5a0,
      () => legacyOpenCongPhapPanel.call(this, 'Hoàng Giai', 'exchange', 0));

    addCard(this, panel, 105, '⚡', 'TÀNG KINH THẦN THÔNG',
      'Xem kỹ năng đã học, chọn hệ và sắp xếp kỹ năng chiến đấu.',
      0xffd86a,
      () => this.openSkillPanel('Kiếm'));

    const note = this.add.text(0, 265,
      'Mỗi màn chi tiết chỉ mở sau khi bạn chọn mục tương ứng.', {
        fontFamily: FONT, fontSize: '13px', color: '#a9eaff', align: 'center',
        wordWrap: { width: 430, useAdvancedWrap: true }
      }).setOrigin(0.5);
    panel.add(note);
  };
}
