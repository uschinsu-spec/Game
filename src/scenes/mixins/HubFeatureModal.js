import { W, H } from '../constants.js';

export function openHubFeatureModal(scene, {
  title,
  subtitle = '',
  body = '',
  button = 'MỞ',
  accent = 0x38bdf8,
  onPress = null
} = {}) {
  if (!scene) return null;
  scene.closeModal?.();

  const overlay = scene.add.rectangle(W / 2, H / 2, W, H, 0x020617, 0.72)
    .setDepth(9998).setScrollFactor(0).setInteractive();
  const panel = scene.add.container(W / 2, H / 2).setDepth(9999).setScrollFactor(0);
  const bg = scene.add.rectangle(0, 0, 470, 360, 0x071b25, 0.98).setStrokeStyle(2, accent, 0.95);
  const titleTxt = scene.add.text(0, -135, title || 'CHỨC NĂNG', {
    fontFamily: 'Be Vietnam Pro, sans-serif', fontSize: '18px', fontStyle: 'bold', color: '#fde68a',
    align: 'center', wordWrap: { width: 410 }
  }).setOrigin(0.5);
  const subtitleTxt = scene.add.text(0, -98, subtitle, {
    fontFamily: 'Be Vietnam Pro, sans-serif', fontSize: '11px', color: '#93c5fd',
    align: 'center', wordWrap: { width: 400 }
  }).setOrigin(0.5);
  const bodyTxt = scene.add.text(0, -10, body, {
    fontFamily: 'Be Vietnam Pro, sans-serif', fontSize: '12px', color: '#e2e8f0',
    align: 'center', lineSpacing: 5, wordWrap: { width: 400 }
  }).setOrigin(0.5);
  const btnBg = scene.add.rectangle(0, 120, 260, 46, accent, 0.95)
    .setStrokeStyle(1.5, 0xffffff, 0.45).setInteractive({ useHandCursor: true });
  const btnTxt = scene.add.text(0, 120, button, {
    fontFamily: 'Be Vietnam Pro, sans-serif', fontSize: '13px', fontStyle: 'bold', color: '#ffffff'
  }).setOrigin(0.5);
  const closeBg = scene.add.circle(205, -145, 17, 0x7f1d1d, 0.95)
    .setStrokeStyle(1.2, 0xfca5a5).setInteractive({ useHandCursor: true });
  const closeTxt = scene.add.text(205, -145, '×', { fontSize: '22px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);

  panel.add([bg, titleTxt, subtitleTxt, bodyTxt, btnBg, btnTxt, closeBg, closeTxt]);

  const close = () => {
    panel.destroy(true);
    overlay.destroy();
    if (scene.activeModal === panel) scene.activeModal = null;
    if (scene.activeModalOverlay === overlay) scene.activeModalOverlay = null;
  };
  const run = () => {
    close();
    try { onPress?.(); } catch (err) { scene.showToast?.(`⚠️ ${err?.message || 'Không thể mở chức năng.'}`); }
  };

  overlay.on('pointerdown', close);
  closeBg.on('pointerdown', close);
  closeTxt.setInteractive({ useHandCursor: true }).on('pointerdown', close);
  btnBg.on('pointerdown', run);
  btnTxt.setInteractive({ useHandCursor: true }).on('pointerdown', run);

  scene.activeModal = panel;
  scene.activeModalOverlay = overlay;
  return panel;
}
