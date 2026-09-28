import { gameState } from '../../state/gameState.js';
import { getCongPhapById } from '../../config/congPhapData.js';
import { fitSingleLine, stopPointer } from './UiModalManager.js';

const FONT = 'Be Vietnam Pro, sans-serif';
const CP_PAGE_SIZE = 4;
const SKILL_PAGE_SIZE = 5;

function addText(scene, panel, x, y, value, style = {}) {
  const item = scene.add.text(x, y, value, { fontFamily: FONT, ...style }).setOrigin(0, 0.5);
  panel.add(item);
  return item;
}

function addSectionTitle(scene, panel, y, title, count) {
  const bg = scene.add.rectangle(0, y, 474, 34, 0x0b5067, 1).setStrokeStyle(1, 0x58d9ec);
  panel.add(bg);
  addText(scene, panel, -219, y, title, { fontSize: '15px', fontStyle: 'bold', color: '#d8faff' });
  const total = scene.add.text(216, y, `${count} đã học`, {
    fontFamily: FONT, fontSize: '11px', color: '#9fecc9'
  }).setOrigin(1, 0.5);
  panel.add(total);
}

function addEntry(scene, panel, y, name, detail, active = false) {
  const bg = scene.add.rectangle(0, y, 474, 51, active ? 0x155647 : 0x0d3043, 1)
    .setStrokeStyle(1, active ? 0x6cf0b3 : 0x315f76);
  panel.add(bg);
  const title = addText(scene, panel, -216, y - 10, name, {
    fontSize: '14px', fontStyle: 'bold', color: active ? '#a5ffce' : '#e9faff'
  });
  const subtitle = addText(scene, panel, -216, y + 12, detail, {
    fontSize: '10.5px', color: active ? '#a9ebd0' : '#a9d7e8'
  });
  fitSingleLine(title, 425, 11);
  fitSingleLine(subtitle, 425, 9);
}

function addPager(scene, panel, y, page, pages, onChange) {
  if (pages <= 1) return;
  const label = scene.add.text(0, y, `Trang ${page + 1}/${pages}`, {
    fontFamily: FONT, fontSize: '11px', color: '#cceafa'
  }).setOrigin(0.5);
  panel.add(label);
  [[-105, '‹', -1], [105, '›', 1]].forEach(([x, arrow, delta]) => {
    const enabled = page + delta >= 0 && page + delta < pages;
    const button = scene.add.rectangle(x, y, 54, 30, enabled ? 0x18536b : 0x263946, 1)
      .setStrokeStyle(1, enabled ? 0x6adff0 : 0x526776)
      .setInteractive({ useHandCursor: enabled });
    const text = scene.add.text(x, y, arrow, {
      fontFamily: FONT, fontSize: '21px', color: enabled ? '#e5fbff' : '#667c88'
    }).setOrigin(0.5);
    if (enabled) button.on('pointerdown', pointer => {
      stopPointer(scene, pointer);
      onChange(page + delta);
    });
    panel.add([button, text]);
  });
}

export function installSimpleCongPhapHomeUI(MainGameScene) {
  if (!MainGameScene?.prototype || MainGameScene.prototype.__simpleCongPhapHomeInstalled) return;
  const proto = MainGameScene.prototype;
  proto.__simpleCongPhapHomeInstalled = true;

  proto.openCongPhapHome = function openCongPhapHome(cpPage = 0, skillPage = 0) {
    const panel = this.createModalShell('CÔNG PHÁP', 'CÔNG PHÁP & KỸ NĂNG ĐÃ HỌC');
    const cpIds = [...new Set(gameState.learnedCongPhapIds || [])];
    const manuals = cpIds.map(id => getCongPhapById(id)).filter(Boolean);
    const skills = this.getLearnedSkills?.() || [];
    const cpPages = Math.max(1, Math.ceil(manuals.length / CP_PAGE_SIZE));
    const skillPages = Math.max(1, Math.ceil(skills.length / SKILL_PAGE_SIZE));
    cpPage = Math.min(Math.max(0, cpPage), cpPages - 1);
    skillPage = Math.min(Math.max(0, skillPage), skillPages - 1);

    addSectionTitle(this, panel, -339, 'CÔNG PHÁP ĐÃ HỌC', manuals.length);
    if (!manuals.length) addText(this, panel, -212, -291, 'Chưa học công pháp nào.', { fontSize: '13px', color: '#a9bdc9' });
    manuals.slice(cpPage * CP_PAGE_SIZE, (cpPage + 1) * CP_PAGE_SIZE).forEach((cp, index) => {
      const active = gameState.activeCongPhapId === cp.id;
      addEntry(this, panel, -293 + index * 58, cp.name,
        `${cp.elem || 'Toàn Hệ'} • ${cp.grade || 'Công pháp'}${active ? ' • ĐANG VẬN HÀNH' : ''}`, active);
    });
    addPager(this, panel, -51, cpPage, cpPages, next => this.openCongPhapHome(next, skillPage));

    addSectionTitle(this, panel, -12, 'KỸ NĂNG ĐÃ HỌC', skills.length);
    if (!skills.length) addText(this, panel, -212, 39, 'Chưa học kỹ năng nào.', { fontSize: '13px', color: '#a9bdc9' });
    skills.slice(skillPage * SKILL_PAGE_SIZE, (skillPage + 1) * SKILL_PAGE_SIZE).forEach((skill, index) => {
      const equipped = (gameState.equippedSkillIds || []).includes(skill.id);
      addEntry(this, panel, 36 + index * 58, skill.name,
        `${skill.elem || 'Kiếm'} • ${skill.stage || 'Kỹ năng'}${equipped ? ' • ĐANG TRANG BỊ' : ''}`, equipped);
    });
    addPager(this, panel, 350, skillPage, skillPages, next => this.openCongPhapHome(cpPage, next));
    return panel;
  };

  proto.openCongPhapPanel = function openCongPhapPanelUnified(activeGrade = 'Hoàng Giai', activeTab = null, pageIdx = 0) {
    if (activeTab === 'manuals') return this.openCongPhapManuals(activeGrade, pageIdx);
    if (activeTab === 'exchange') return this.openCongPhapExchange(activeGrade);
    if (activeTab === 'skills') return this.openSkillPanel('Kiếm');
    return this.openCongPhapHome();
  };
}
