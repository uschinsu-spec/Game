import { ELEMENTAL_SKILLS } from '../../config/skillsData.js';
import { gameState } from '../../state/gameState.js';
import { W, H } from '../constants.js';

const FONT = 'Be Vietnam Pro, sans-serif';
const OVERLAY_DEPTH = 999998;
const PANEL_DEPTH = 1000000;
const ELEMENTS = ['Kiếm', 'Kim', 'Hỏa', 'Thủy', 'Thổ', 'Mộc', 'Phong', 'Lôi', 'Vật Lý'];

const PALETTES = {
  'Kiếm': [0x0b5f79, 0x67e8f9, '#a5f3fc'],
  'Kim': [0x665415, 0xfde047, '#fef08a'],
  'Hỏa': [0x7a271a, 0xfb7185, '#fecdd3'],
  'Thủy': [0x164e8a, 0x60a5fa, '#bfdbfe'],
  'Thổ': [0x6b4218, 0xfbbf24, '#fde68a'],
  'Mộc': [0x14532d, 0x4ade80, '#bbf7d0'],
  'Phong': [0x155e75, 0x22d3ee, '#cffafe'],
  'Lôi': [0x581c87, 0xc084fc, '#e9d5ff'],
  'Vật Lý': [0x3f3f46, 0xd4d4d8, '#f4f4f5']
};

function stopPointer(scene, pointer) {
  scene?.input?.stopPropagation?.();
  pointer?.event?.stopPropagation?.();
  pointer?.event?.preventDefault?.();
}

function fitSingleLine(textObj, maxWidth, minPx = 10) {
  if (!textObj) return;
  let size = parseFloat(textObj.style?.fontSize || 16);
  while (textObj.width > maxWidth && size > minPx) {
    size -= 1;
    textObj.setFontSize(size);
  }
}

function createShell(scene, title, subtitle = '') {
  scene.closeModal();
  const overlay = scene.fixed(
    scene.add.rectangle(W / 2, H / 2, W + 16, H + 16, 0x010811, 1),
    OVERLAY_DEPTH
  ).setInteractive({ useHandCursor: false });
  const panel = scene.fixed(scene.add.container(W / 2, H / 2), PANEL_DEPTH);
  scene.activeModal = panel;
  scene.activeModalOverlay = overlay;
  scene.enterUiHardPause?.();
  overlay.on('pointerdown', p => stopPointer(scene, p));
  overlay.on('pointerup', p => stopPointer(scene, p));
  overlay.on('pointermove', p => stopPointer(scene, p));

  const bg = scene.add.rectangle(0, 0, W - 6, H - 6, 0x062a3b, 1)
    .setStrokeStyle(3, 0x67e8ff, 1);
  const header = scene.add.rectangle(0, -420, W - 24, 94, 0x0b4560, 1)
    .setStrokeStyle(2, 0x4de9ff, 1);
  const titleTxt = scene.add.text(-238, -437, title, {
    fontFamily: FONT, fontSize: '22px', fontStyle: 'bold', color: '#ffe45c'
  }).setOrigin(0, 0.5);
  const subTxt = scene.add.text(-238, -402, subtitle, {
    fontFamily: FONT, fontSize: '12px', fontStyle: 'bold', color: '#9af5ff'
  }).setOrigin(0, 0.5);
  fitSingleLine(titleTxt, 360, 15);
  fitSingleLine(subTxt, 360, 10);
  panel.add([bg, header, titleTxt, subTxt]);
  scene.createModalCloseBtn(panel);
  return panel;
}

function addButton(scene, panel, x, y, w, h, label, action, opts = {}) {
  const enabled = opts.enabled !== false;
  const bg = scene.add.rectangle(x, y, w, h, enabled ? (opts.fill ?? 0x0d526c) : 0x263744, 1)
    .setStrokeStyle(2, enabled ? (opts.stroke ?? 0x5ee7ff) : 0x52636f, 1)
    .setInteractive({ useHandCursor: enabled });
  const txt = scene.add.text(x, y, label, {
    fontFamily: FONT, fontSize: opts.fontSize || '14px', fontStyle: 'bold',
    color: enabled ? (opts.color || '#f4fdff') : '#81919d'
  }).setOrigin(0.5);
  fitSingleLine(txt, w - 16, 9);
  if (enabled && action) {
    bg.on('pointerdown', p => { stopPointer(scene, p); action(); });
  }
  panel.add([bg, txt]);
  return bg;
}

function renderElementTabs(scene, panel, activeElem) {
  ELEMENTS.forEach((elem, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = -160 + col * 160;
    const y = -338 + row * 52;
    const [fill, stroke, color] = PALETTES[elem] || PALETTES['Kiếm'];
    addButton(scene, panel, x, y, 148, 42, elem, () => scene.openSkillPanel(elem), {
      fill: elem === activeElem ? fill : 0x102536,
      stroke: elem === activeElem ? stroke : 0x31546a,
      color: elem === activeElem ? color : '#9bb6c6',
      fontSize: '13px'
    });
  });
}

function learnedSet(scene) {
  return new Set((scene.getLearnedSkills?.() || []).map(s => s.id));
}

function renderList(scene, panel, activeElem) {
  renderElementTabs(scene, panel, activeElem);
  const learned = learnedSet(scene);
  const skills = ELEMENTAL_SKILLS.filter(s => s.elem === activeElem).slice(0, 5);

  skills.forEach((skill, idx) => {
    const y = -142 + idx * 93;
    const isLearned = learned.has(skill.id);
    const isEquipped = (gameState.equippedSkillIds || []).includes(skill.id);
    const [fill, stroke, color] = PALETTES[activeElem] || PALETTES['Kiếm'];
    const box = scene.add.rectangle(0, y, 474, 78, isEquipped ? fill : 0x0d293a, 1)
      .setStrokeStyle(2, isEquipped ? stroke : 0x35627a, 1)
      .setInteractive({ useHandCursor: true });
    const name = scene.add.text(-216, y - 13, `${skill.name}`, {
      fontFamily: FONT, fontSize: '17px', fontStyle: 'bold', color: isLearned ? color : '#d4dde3'
    }).setOrigin(0, 0.5);
    const status = scene.add.text(-216, y + 18,
      `${skill.stage}  •  ${isLearned ? (isEquipped ? 'ĐANG TRANG BỊ' : 'ĐÃ HỌC') : 'CHƯA HỌC'}`, {
        fontFamily: FONT, fontSize: '11px', fontStyle: 'bold',
        color: isLearned ? (isEquipped ? '#7cffc5' : '#a9efff') : '#ff9caa'
      }).setOrigin(0, 0.5);
    const arrow = scene.add.text(218, y, '›', { fontFamily: FONT, fontSize: '32px', color: '#7cecff' }).setOrigin(0.5);
    fitSingleLine(name, 390, 12);
    fitSingleLine(status, 390, 9);
    box.on('pointerdown', p => {
      stopPointer(scene, p);
      scene.openSkillPanel(activeElem, skill.id);
    });
    panel.add([box, name, status, arrow]);
  });

  addButton(scene, panel, 0, 360, 474, 48, 'THÁO TOÀN BỘ KỸ NĂNG', () => {
    gameState.equippedSkillIds = [];
    scene.createSkillBar?.();
    scene.openSkillPanel(activeElem);
  }, { fill: 0x6b1b2c, stroke: 0xfb7185, color: '#ffe4e8', fontSize: '13px' });
}

function renderDetail(scene, panel, activeElem, skill) {
  const learned = learnedSet(scene).has(skill.id);
  const equipped = (gameState.equippedSkillIds || []).includes(skill.id);
  const [fill, stroke, color] = PALETTES[activeElem] || PALETTES['Kiếm'];

  const badge = scene.add.rectangle(0, -310, 474, 74, fill, 1).setStrokeStyle(2, stroke, 1);
  const title = scene.add.text(0, -320, skill.name, {
    fontFamily: FONT, fontSize: '23px', fontStyle: 'bold', color
  }).setOrigin(0.5);
  const status = scene.add.text(0, -287,
    `${skill.stage} • ${learned ? (equipped ? 'ĐANG TRANG BỊ' : 'ĐÃ HỌC') : 'CHƯA HỌC'}`, {
      fontFamily: FONT, fontSize: '12px', fontStyle: 'bold', color: learned ? '#a7ffd3' : '#ffb0bc'
    }).setOrigin(0.5);
  fitSingleLine(title, 430, 15);
  panel.add([badge, title, status]);

  const infoBg = scene.add.rectangle(0, -105, 474, 278, 0x0d293a, 1).setStrokeStyle(2, 0x35627a, 1);
  const meta = scene.add.text(-215, -210,
    `Sát thương: x${skill.dmgMul}   •   Hồi chiêu: ${skill.cd ? `${skill.cd / 1000}s` : '0s'}${skill.isAoE ? '   •   AOE' : ''}`, {
      fontFamily: FONT, fontSize: '13px', fontStyle: 'bold', color: '#8feeff'
    }).setOrigin(0, 0.5);
  fitSingleLine(meta, 430, 10);
  const desc = scene.add.text(-215, -165, skill.desc || 'Thần thông tu tiên.', {
    fontFamily: FONT, fontSize: '15px', color: '#e5f8ff', lineSpacing: 7,
    wordWrap: { width: 430, useAdvancedWrap: true }
  }).setOrigin(0, 0);
  panel.add([infoBg, meta, desc]);

  if (!learned) {
    addButton(scene, panel, 0, 95, 474, 58, 'ĐẾN CÔNG PHÁP ĐỂ HỌC', () => {
      scene.openCongPhapPanel('Hoàng Giai', 'manuals', 0);
    }, { fill: 0x6b4d10, stroke: 0xfde047, color: '#fff6ae', fontSize: '15px' });
  } else if (equipped) {
    addButton(scene, panel, 0, 95, 474, 58, 'THÁO KỸ NĂNG', () => {
      gameState.equippedSkillIds = (gameState.equippedSkillIds || []).filter(id => id !== skill.id);
      scene.createSkillBar?.();
      scene.openSkillPanel(activeElem, skill.id);
    }, { fill: 0x6b1b2c, stroke: 0xfb7185, color: '#ffe4e8', fontSize: '15px' });
  } else {
    addButton(scene, panel, 0, 95, 474, 58, 'XÁC NHẬN TRANG BỊ', () => {
      const ids = [...(gameState.equippedSkillIds || [])].filter(id => id !== skill.id);
      if (ids.length < 5) ids.push(skill.id);
      else ids[4] = skill.id;
      gameState.equippedSkillIds = ids;
      scene.createSkillBar?.();
      scene.openSkillPanel(activeElem, skill.id);
    }, { fill: 0x146044, stroke: 0x61ffc0, color: '#d5ffeb', fontSize: '15px' });
  }

  addButton(scene, panel, 0, 174, 474, 52, '‹ QUAY LẠI DANH SÁCH', () => scene.openSkillPanel(activeElem), {
    fill: 0x293f50, stroke: 0x82c6df, color: '#e9faff', fontSize: '13px'
  });
}

export function installSimpleSkillFullscreenUI(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__simpleSkillFullscreenInstalled) return;
  const proto = MainGameScene.prototype;
  proto.__simpleSkillFullscreenInstalled = true;

  proto.openSkillPanel = function openSimpleSkillPanel(activeElem = 'Kiếm', selectedSkillId = null) {
    if (!ELEMENTS.includes(activeElem)) activeElem = 'Kiếm';
    const panel = createShell(this, 'TÀNG KINH CÁC', selectedSkillId ? `${activeElem} • CHI TIẾT THẦN THÔNG` : '9 ĐẠI HỆ THẦN THÔNG');
    if (selectedSkillId) {
      const skill = ELEMENTAL_SKILLS.find(s => s.id === selectedSkillId && s.elem === activeElem);
      if (skill) renderDetail(this, panel, activeElem, skill);
      else renderList(this, panel, activeElem);
    } else {
      renderList(this, panel, activeElem);
    }
  };
}
