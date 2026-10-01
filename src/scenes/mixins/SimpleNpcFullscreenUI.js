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

function getContextualNpc(scene, npc) {
  if (!npc) return null;
  const mode = scene?.currentMap?.uiMode;
  const mapName = scene?.currentMap?.name || 'Gia Tộc';

  if (mode === 'clan_hub') {
    if (npc.id === 'truong_thon') {
      return {
        ...npc,
        title: '[TỘC TRƯỞNG]',
        name: `Tộc Trưởng (${mapName})`,
        icon: '🏛️',
        color: '#f59e0b',
        tagBg: 0x3d1d06,
        tagBorder: 0xf59e0b,
        greeting: `Huyết mạch đồng tâm! Chào mừng tộc nhân trở về Tổ Địa ${mapName}. Hãy nỗ lực tu hành vì sự hưng thịnh của gia tộc!`
      };
    }
    if (npc.id === 'vo_quan') {
      return {
        ...npc,
        title: '[TÀNG THƯ CÁC]',
        name: 'Trưởng Lão Truyền Công',
        icon: '📖',
        color: '#fbbf24',
        tagBg: 0x3d1d06,
        tagBorder: 0xf59e0b,
        greeting: 'Nơi lưu giữ toàn bộ bí pháp gia truyền và công pháp tu luyện khai sáng của các bậc tiền bối gia tộc.'
      };
    }
    if (npc.id === 'duoc_diem') {
      return {
        ...npc,
        title: '[ĐAN DƯỢC PHÒNG]',
        name: 'Đan Sư Gia Tộc',
        icon: '🌿',
        color: '#34d399',
        tagBg: 0x063024,
        tagBorder: 0x34d399,
        greeting: 'Luyện chế linh đan bồi dưỡng huyết mạch tinh anh và hỗ trợ tộc nhân vượt qua bình cảnh đột phá.'
      };
    }
    if (npc.id === 'tho_ren') {
      return {
        ...npc,
        title: '[LÒ RÈN GIA TỘC]',
        name: 'Đúc Khí Trưởng Lão',
        icon: '⚒️',
        color: '#fb923c',
        tagBg: 0x381907,
        tagBorder: 0xfb923c,
        greeting: 'Rèn đúc thần binh, tôi luyện pháp bảo gia truyền để bảo vệ sản nghiệp và địa bàn của thế gia.'
      };
    }
    if (npc.id === 'tuu_lau') {
      return {
        ...npc,
        title: '[NHIỆM VỤ TỘC NHÂN]',
        name: 'Chấp Sự Gia Tộc',
        icon: '📜',
        color: '#38bdf8',
        tagBg: 0x08293d,
        tagBorder: 0x38bdf8,
        greeting: 'Bảng ủy thác gia tộc: Tiếp nhận nhiệm vụ tuần tra, thu thập tài nguyên và tích lũy điểm cống hiến.'
      };
    }
    if (npc.id === 'nong_phu') {
      return {
        ...npc,
        title: '[LINH ĐIỀN DƯỢC VIÊN]',
        name: 'Chưởng Quản Điền Trang',
        icon: '🌾',
        color: '#a3e635',
        tagBg: 0x1d3606,
        tagBorder: 0xa3e635,
        greeting: 'Quản lý linh điền, dược trang và nguồn cung ứng linh thảo, khoáng thạch cho toàn bộ tộc nhân.'
      };
    }
    if (npc.id === 'thuong_hoi') {
      return {
        ...npc,
        title: '[THƯƠNG HỘI GIA TỘC]',
        name: 'Chưởng Quỹ Gia Tộc',
        icon: '💰',
        color: '#facc15',
        tagBg: 0x3d3206,
        tagBorder: 0xfacc15,
        greeting: 'Trao đổi ngân quỹ, bổng lộc tộc nhân và cung ứng các loại tài nguyên tu luyện quý giá.'
      };
    }
  } else if (mode === 'sect_hub') {
    if (npc.id === 'truong_thon') {
      return {
        ...npc,
        title: '[CHƯỞNG MÔN]',
        name: `Chưởng Môn (${mapName})`,
        icon: '⛩️',
        color: '#c084fc',
        tagBg: 0x2e0854,
        tagBorder: 0xc084fc,
        greeting: `Đạo tâm như nhất! Chào mừng đệ tử/đạo hữu đến với Sơn Môn ${mapName}. Vấn đạo cầu trường sinh!`
      };
    }
    if (npc.id === 'vo_quan') {
      return {
        ...npc,
        title: '[TÀNG KINH CÁC]',
        name: 'Trưởng Lão Tàng Kinh',
        icon: '📜',
        color: '#a855f7',
        tagBg: 0x2e0854,
        tagBorder: 0xa855f7,
        greeting: 'Vạn quyển đạo thư, tâm pháp thượng thừa và thần thông ngũ hành truyền thừa ngàn năm của bản tông.'
      };
    }
    if (npc.id === 'duoc_diem') {
      return {
        ...npc,
        title: '[LUYỆN ĐAN ĐIỆN]',
        name: 'Đan Đạo Trưởng Lão',
        icon: '🧪',
        color: '#2dd4bf',
        tagBg: 0x06332c,
        tagBorder: 0x2dd4bf,
        greeting: 'Đan phương thượng thừa, linh đan thánh phẩm phụng sự đệ tử tông môn đột phá cảnh giới.'
      };
    }
    if (npc.id === 'tho_ren') {
      return {
        ...npc,
        title: '[LUYỆN KHÍ PHƯỜNG]',
        name: 'Khí Đạo Trưởng Lão',
        icon: '⚔️',
        color: '#e879f9',
        tagBg: 0x3d0745,
        tagBorder: 0xe879f9,
        greeting: 'Luyện chế phi kiếm bản mệnh, tôi đúc hộ thân pháp bảo uy lực trấn phái.'
      };
    }
    if (npc.id === 'tuu_lau') {
      return {
        ...npc,
        title: '[NHIỆM VỤ ĐƯỜNG]',
        name: 'Chấp Sự Tông Môn',
        icon: '📋',
        color: '#60a5fa',
        tagBg: 0x0b254d,
        tagBorder: 0x60a5fa,
        greeting: 'Bảng nhiệm vụ tông môn: Trừ ma vệ đạo, thu thập linh tài, tích lũy công đức đổi pháp bảo.'
      };
    }
  }

  return npc;
}

export const NpcDialogUI = {
  openNpcDialogModal(npcId) {
    const rawNpc = NPCS_DATA.find(n => n.id === npcId);
    if (!rawNpc) return;
    const npc = getContextualNpc(this, rawNpc);
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

