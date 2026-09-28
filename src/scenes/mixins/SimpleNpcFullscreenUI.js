import { NPCS_DATA } from '../../config/npcData.js?v=20260928-thanh-van-image-hub-v3';
import { W, H } from '../constants.js';
import { fitSingleLine, stopPointer } from './UiModalManager.js';

const FONT = 'Be Vietnam Pro, sans-serif';

function shortText(value, max = 76) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function createShell(scene, npc) {
  return scene.createModalShell(
    `${npc.icon || '☯'} ${npc.title || ''} ${npc.name || ''}`,
    shortText(npc.greeting, 68),
    {
      bgStroke: npc.tagBorder || 0x67e8ff,
      headerFill: npc.tagBg || 0x0b4560,
      headerStroke: npc.tagBorder || 0x4de9ff,
      titleColor: npc.color || '#ffe45c'
    }
  );
}

function addNpcCard(scene, panel, npc) {
  const y = -300;
  const card = scene.add.rectangle(0, y, 474, 132, 0x0d3449, 1)
    .setStrokeStyle(2, npc.tagBorder || 0x55e6ff, 1);
  const avatarBg = scene.add.rectangle(-190, y, 82, 98, npc.tagBg || 0x102337, 1)
    .setStrokeStyle(2, npc.tagBorder || 0x55e6ff, 1);
  let avatar;
  if (npc.spriteKey && scene.textures.exists(npc.spriteKey)) {
    avatar = scene.add.image(-190, y, npc.spriteKey).setDisplaySize(76, 76);
  } else {
    avatar = scene.add.text(-190, y, npc.icon || '☯', { fontSize: '34px' }).setOrigin(0.5);
  }
  const name = scene.add.text(-132, y - 25, npc.name, {
    fontFamily: FONT, fontSize: '18px', fontStyle: 'bold', color: npc.color || '#ffe45c'
  }).setOrigin(0, 0.5);
  const greet = scene.add.text(-132, y + 19, shortText(npc.greeting, 58), {
    fontFamily: FONT, fontSize: '12px', color: '#dff8ff'
  }).setOrigin(0, 0.5);
  fitSingleLine(name, 330, 13);
  fitSingleLine(greet, 330, 10);
  panel.add([card, avatarBg, avatar, name, greet]);
}

function addAction(scene, panel, action, y, statusText) {
  const color = Phaser.Display.Color.HexStringToColor(action.color || '#38bdf8').color;
  const box = scene.add.rectangle(0, y, 474, 104, 0x0d2638, 1)
    .setStrokeStyle(2.5, color, 1)
    .setInteractive({ useHandCursor: true });
  const title = scene.add.text(-218, y - 19, action.label, {
    fontFamily: FONT, fontSize: '17px', fontStyle: 'bold', color: action.color || '#7cecff'
  }).setOrigin(0, 0.5);
  const desc = scene.add.text(-218, y + 20, shortText(action.desc, 72), {
    fontFamily: FONT, fontSize: '12px', color: '#c8eaf6'
  }).setOrigin(0, 0.5);
  const arrow = scene.add.text(218, y, '›', {
    fontFamily: FONT, fontSize: '34px', fontStyle: 'bold', color: action.color || '#7cecff'
  }).setOrigin(0.5);
  fitSingleLine(title, 405, 12);
  fitSingleLine(desc, 405, 10);

  box.on('pointerdown', pointer => {
    stopPointer(scene, pointer);
    const before = scene.activeModal;
    const result = action.execute?.(scene);
    if (result?.msg && statusText?.active && scene.activeModal === before) {
      statusText.setText(shortText(result.msg, 66));
      statusText.setColor(result.success ? '#83ffd0' : '#ff9aaa');
      fitSingleLine(statusText, 440, 10);
    }
  });
  box.on('pointerover', () => box.setFillStyle(0x123b52, 1));
  box.on('pointerout', () => box.setFillStyle(0x0d2638, 1));
  panel.add([box, title, desc, arrow]);
}

export const NpcDialogUI = {
  openNpcDialogModal(npcId) {
    const npc = NPCS_DATA.find(n => n.id === npcId);
    if (!npc) return;
    const panel = createShell(this, npc);
    addNpcCard(this, panel, npc);

    const statusBg = this.add.rectangle(0, 365, 474, 58, 0x0a2030, 1)
      .setStrokeStyle(1.5, 0x2c6d86, 1);
    const status = this.add.text(0, 365, 'Chọn một mục để xem hoặc thực hiện.', {
      fontFamily: FONT, fontSize: '12px', fontStyle: 'bold', color: '#8eeeff'
    }).setOrigin(0.5);
    panel.add([statusBg, status]);

    const actions = npc.actions || [];
    const startY = -158;
    const gap = actions.length <= 2 ? 142 : 126;
    actions.slice(0, 4).forEach((action, idx) => addAction(this, panel, action, startY + idx * gap, status));
  }
};

export function installNpcDialogUI(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__npcDialogUiInstalled) return;
  const proto = MainGameScene.prototype;
  proto.__npcDialogUiInstalled = true;
  proto.__simpleNpcFullscreenInstalled = true;

  Object.assign(proto, NpcDialogUI);
}

export const installSimpleNpcFullscreenUI = installNpcDialogUI;

