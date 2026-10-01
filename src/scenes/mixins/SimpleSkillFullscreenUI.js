import { ELEMENTAL_SKILLS } from '../../config/skillsData.js?v=20260928-sword-only-v1';
import { gameState } from '../../state/gameState.js';
import { W, H } from '../constants.js';
import { fitSingleLine, stopPointer } from './UiModalManager.js';

const FONT = 'Be Vietnam Pro, sans-serif';
const OVERLAY_DEPTH = 999998;
const PANEL_DEPTH = 1000000;
const ELEMENTS = ['Kiếm'];

const PALETTES = {
  'Kiếm': [0x0b5f79, 0x67e8f9, '#a5f3fc']
};

function createShell(scene, title, subtitle = '') {
  return scene.createModalShell(title, subtitle, {
    headerY: -420,
    headerH: 94,
    titleFontSize: '22px',
    titleY: -437,
    subY: -402,
    subtitleColor: '#9af5ff'
  });
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

export function getAvailableSkillsForCurrentArea(scene, activeElem = 'Kiếm') {
  return ELEMENTAL_SKILLS.filter(skill => {
    const isTargetElem = (skill.id === 'basic_attack') || (skill.elem === activeElem) || (activeElem === 'Kiếm' && String(skill.id).startsWith('kiem_'));
    if (!isTargetElem) return false;
    return true;
  });
}

function renderElementTabs(scene, panel, activeElem) {
  const [fill, stroke, color] = PALETTES['Kiếm'];
  const tabTitle = 'KIẾM ĐẠO — THANH VÂN TRẤN';
  addButton(scene, panel, 0, -320, 474, 44, tabTitle, null, {
    fill,
    stroke,
    color,
    fontSize: '14px'
  });
}

function learnedSet(scene) {
  return new Set((scene.getLearnedSkills?.() || []).map(s => s.id));
}

function renderList(scene, panel, activeElem) {
  renderElementTabs(scene, panel, activeElem);
  const learned = learnedSet(scene);
  const skills = getAvailableSkillsForCurrentArea(scene, activeElem);

  skills.forEach((skill, idx) => {
    const y = -235 + idx * 93;
    const isLearned = learned.has(skill.id);
    const isEquipped = (gameState.equippedSkillIds || []).includes(skill.id);
    const [fill, stroke, color] = PALETTES['Kiếm'];
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
      scene.openSkillPanel('Kiếm', skill.id);
    });
    panel.add([box, name, status, arrow]);
  });

  addButton(scene, panel, 0, 275, 474, 48, 'THÁO TOÀN BỘ KỸ NĂNG', () => {
    gameState.equippedSkillIds = [];
    scene.createSkillBar?.();
    scene.openSkillPanel('Kiếm');
  }, { fill: 0x6b1b2c, stroke: 0xfb7185, color: '#ffe4e8', fontSize: '13px' });
}

function renderDetail(scene, panel, activeElem, skill) {
  const learned = learnedSet(scene).has(skill.id);
  const equipped = (gameState.equippedSkillIds || []).includes(skill.id);
  const [fill, stroke, color] = PALETTES['Kiếm'];

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
  const desc = scene.add.text(-215, -165, skill.desc || 'Kiếm đạo thần thông.', {
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
      scene.openSkillPanel('Kiếm', skill.id);
    }, { fill: 0x6b1b2c, stroke: 0xfb7185, color: '#ffe4e8', fontSize: '15px' });
  } else {
    addButton(scene, panel, 0, 95, 474, 58, 'XÁC NHẬN TRANG BỊ', () => {
      const swordIds = new Set(ELEMENTAL_SKILLS.filter(s => s.elem === 'Kiếm' || String(s.id).startsWith('kiem_')).map(s => s.id));
      const ids = [...(gameState.equippedSkillIds || [])].filter(id => swordIds.has(id) && id !== skill.id);
      if (ids.length < 6) ids.push(skill.id);
      else ids[4] = skill.id;
      gameState.equippedSkillIds = ids;
      scene.createSkillBar?.();
      scene.openSkillPanel('Kiếm', skill.id);
    }, { fill: 0x146044, stroke: 0x61ffc0, color: '#d5ffeb', fontSize: '15px' });
  }

  addButton(scene, panel, 0, 174, 474, 52, '‹ QUAY LẠI DANH SÁCH', () => scene.openSkillPanel('Kiếm'), {
    fill: 0x293f50, stroke: 0x82c6df, color: '#e9faff', fontSize: '13px'
  });
}

export function installSimpleSkillFullscreenUI(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__simpleSkillFullscreenInstalled) return;
  const proto = MainGameScene.prototype;
  proto.__simpleSkillFullscreenInstalled = true;

  proto.openSkillPanel = function openSimpleSkillPanel(activeElem = 'Kiếm', selectedSkillId = null) {
    activeElem = 'Kiếm';
    const allowedIds = new Set(ELEMENTAL_SKILLS.map(s => s.id));
    gameState.equippedSkillIds = (gameState.equippedSkillIds || []).map(id => (id && allowedIds.has(id)) ? id : null);

    const availableSkills = getAvailableSkillsForCurrentArea(this, activeElem);
    const availableIds = new Set(availableSkills.map(s => s.id));
    const targetSkill = selectedSkillId && availableIds.has(selectedSkillId)
      ? availableSkills.find(s => s.id === selectedSkillId)
      : null;

    const mapId = Number(gameState.currentMapId ?? this?.currentMap?.id ?? 0);
    const isThanhVan = mapId <= 1;
    const subTitle = targetSkill
      ? 'CHI TIẾT THẦN THÔNG KIẾM'
      : (isThanhVan ? 'THẦN THÔNG KIẾM (THANH VÂN TRẤN)' : '5 THẦN THÔNG KIẾM GỐC');

    const panel = createShell(this, 'TÀNG KINH CÁC — KIẾM ĐẠO', subTitle);
    if (targetSkill) {
      renderDetail(this, panel, 'Kiếm', targetSkill);
    } else {
      renderList(this, panel, 'Kiếm');
    }
  };
}
