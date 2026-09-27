/**
 * npcData.js
 * Quản lý Danh sách và Dữ liệu Tương tác của các NPC trong Game
 */
import { gameState } from '../state/gameState.js';

export const NPCS_DATA = [
  {
    id: 'truong_thon',
    name: 'Trưởng Thôn (Triệu Lão Gia)',
    title: '[TRƯỞNG THÔN]',
    mapId: 0,
    x: 270,
    y: 120,
    icon: '📜',
    color: '#ffd700',
    tagBg: 0x221a08,
    tagBorder: 0xffd700,
    spriteKey: 'npc_2',
    avatar: 'npc_2',
    greeting: 'Chào mừng tiểu hữu đến với Thanh Vân Thôn! Nơi đây phong thủy hữu tình, linh khí ôn hòa, là vùng đất khởi nguyên lý tưởng cho phàm nhân bước chân vào con đường tu tiên vấn đạo.',
    actions: [
      {
        id: 'starter_gift',
        label: '🎁 Nhận Quà Tân Thủ Nhập Môn',
        desc: 'Tặng 1.000 Bạc + 10 Linh Thảo + 5 Khoáng + 5 Da Thú (Chỉ nhận 1 lần)',
        color: '#22c55e',
        execute: (scene) => {
          if (scene.hasClaimedStarterGift()) {
            scene.showFloatingText(scene.player.x, scene.player.y - 70, 'Tiểu hữu đã nhận Quà Tân Thủ rồi!', '#ffaa55');
            return { success: false, msg: 'Đã nhận quà trước đó' };
          }
          scene.claimStarterGift();
          return { success: true, msg: 'Đã nhận thành công Quà Tân Thủ!' };
        }
      },
      {
        id: 'guide_cultivation',
        label: '📖 Hướng Dẫn Tu Luyện Phàm Nhân',
        desc: 'Lộ trình từ Phàm Nhân đột phá Luyện Khí Sơ Kỳ',
        color: '#38bdf8',
        execute: (scene) => {
          scene.openNpcGuideModal();
          return { success: true };
        }
      },
      {
        id: 'village_lore',
        label: '📜 Nghe Chuyện Thanh Vân Thôn',
        desc: 'Tìm hiểu về nguồn gốc của 8 Đại Tông Môn và Vạn Mộc Sâm Lâm',
        color: '#c084fc',
        execute: (scene) => {
          scene.showFloatingText(scene.player.x, scene.player.y - 70, 'Trưởng thôn: "Phía đông thôn có Vạn Mộc Sâm Lâm ngập tràn linh mộc..."', '#e0e7ff');
          return { success: true };
        }
      }
    ]
  },

  {
    id: 'tho_ren',
    name: 'Thợ Rèn (Lý Thiết Tượng)',
    title: '[THỢ RÈN]',
    mapId: 0,
    x: 130,
    y: 340,
    icon: '🔨',
    color: '#f97316',
    tagBg: 0x2b1308,
    tagBorder: 0xf97316,
    spriteKey: 'npc_6',
    avatar: 'npc_6',
    greeting: 'Leng keng! Lò rèn này cung cấp đủ loại khoáng thạch và hỗ trợ các vị đạo hữu rèn đúc pháp khí, bảo cụ.',
    actions: [
      {
        id: 'craft_gear',
        label: '⚒️ Bách Nghệ Các (Đúc Binh Khí & Phù Trận)',
        desc: 'Mở Bách Nghệ Các để luyện chế đan dược, phù lục, trận pháp',
        color: '#ea580c',
        execute: (scene) => {
          scene.openCraftingPanel('pills');
          return { success: true };
        }
      },
      {
        id: 'buy_ores',
        label: '💎 Mua 5 Khoáng Thạch (Giá: 100 Bạc)',
        desc: 'Mua khoáng thạch thô để phục vụ chế tác đúc pháp bảo',
        color: '#38bdf8',
        execute: (scene) => {
          return scene.tradeWithNpc('buy_ores', { costSilver: 100, addOres: 5 });
        }
      },
      {
        id: 'sell_ores',
        label: '🪙 Bán 5 Khoáng Thạch (Thu: 80 Bạc)',
        desc: 'Bán khoáng thạch dư thừa lấy ngân lượng',
        color: '#eab308',
        execute: (scene) => {
          return scene.tradeWithNpc('sell_ores', { costOres: 5, addSilver: 80 });
        }
      }
    ]
  },

  {
    id: 'duoc_diem',
    name: 'Dược Điếm (Liễu Dược Sư)',
    title: '[DƯỢC ĐIẾM]',
    mapId: 0,
    x: 410,
    y: 220,
    icon: '💊',
    color: '#06b6d4',
    tagBg: 0x082026,
    tagBorder: 0x06b6d4,
    spriteKey: 'npc_7',
    avatar: 'npc_7',
    greeting: 'Thuốc đắng dã tật, linh đan trợ tu vi! Ở đây ta có đủ các loại dược liệu, đan phương bồi nguyên tụ khí và cứu chữa vết thương.',
    actions: [
      {
        id: 'craft_pills',
        label: '💊 Bách Nghệ: Luyện Đan Dược Tụ Khí',
        desc: 'Luyện Nhất Phẩm Tụ Khí Đan, Bồi Nguyên Đan, Trúc Cơ Đan...',
        color: '#0284c7',
        execute: (scene) => {
          scene.openCraftingPanel('pills');
          return { success: true };
        }
      },
      {
        id: 'free_heal',
        label: '💖 Trị Liệu & Thanh Lọc (Miễn Phí Cho Tân Thủ)',
        desc: 'Hồi phục ngay lập tức 100% Khí Huyết (HP) và Linh Lực (MP)',
        color: '#16a34a',
        execute: (scene) => {
          scene.playerHp = scene.calcPlayerMaxHp();
          scene.gameState.mana = scene.gameState.manaMax;
          scene.updateHUD();
          scene.spawnSpellVfx(scene.player.x, scene.player.y, 'vfx_heal', 1.0, 700, false);
          scene.showFloatingText(scene.player.x, scene.player.y - 70, '✨ Liễu Dược Sư đã hồi phục 100% HP & MP cho bạn!', '#4ade80', '14px');
          return { success: true, msg: 'Đã hồi phục 100% HP & MP!' };
        }
      },
      {
        id: 'buy_herbs',
        label: '🌿 Mua 10 Linh Thảo (Giá: 200 Bạc)',
        desc: 'Bổ sung thảo dược quý để luyện chế đan dược tụ khí',
        color: '#10b981',
        execute: (scene) => {
          return scene.tradeWithNpc('buy_herbs', { costSilver: 200, addHerbs: 10 });
        }
      }
    ]
  },

  {
    id: 'tuu_lau',
    name: 'Tửu Lầu (Túy Tiên Quán)',
    title: '[TỬU LẦU]',
    mapId: 0,
    x: 360,
    y: 570,
    icon: '🍶',
    color: '#ec4899',
    tagBg: 0x280d1d,
    tagBorder: 0xec4899,
    spriteKey: 'npc_12',
    avatar: 'npc_12',
    greeting: 'Rượu ngon Túy Tiên Lâu uống vào ấm áp đan điền, linh khí cuồn cuộn! Khách quan vào trong làm một vò Trúc Diệp Thanh hay muốn nghe ngóng tin tức tu tiên?',
    actions: [
      {
        id: 'drink_wine',
        label: '🍶 Uống 1 Vò Trúc Diệp Thanh (100 Bạc)',
        desc: 'Hồi phục 100% MP + Nhận buff Tụ Khí (+2 Tu Vi/s trong 180s)',
        color: '#db2777',
        execute: (scene) => {
          return scene.drinkWineAtTavern(100);
        }
      },
      {
        id: 'gossip_news',
        label: '🗣️ Nghe Ngóng Tin Đồn Tu Chân Giới',
        desc: 'Tin đồn về Cấm Địa Huyết Lạc và Linh Thảo nghìn năm',
        color: '#a855f7',
        execute: (scene) => {
          const rumors = [
            'Tin đồn: Đi sâu vào Vạn Mộc Sâm Lâm sẽ gặp yêu thú Mộc Linh mang theo linh quả quý hiếm.',
            'Tin đồn: Ở Huyết Lạc Cấm Địa có Trúc Cơ Đan phương thất truyền từ ngàn năm trước.',
            'Tin đồn: Gia nhập Tông Môn đúng linh căn sẽ nhận được bổng lộc và trấn phái thần công cực mạnh!'
          ];
          const r = rumors[Math.floor(Math.random() * rumors.length)];
          scene.showFloatingText(scene.player.x, scene.player.y - 70, r, '#f472b6', '12px');
          return { success: true };
        }
      }
    ]
  },

  {
    id: 'thuong_hoi',
    name: 'Thương Hội (Vạn Bảo Các)',
    title: '[THƯƠNG HỘI]',
    mapId: 0,
    x: 140,
    y: 540,
    icon: '🏦',
    color: '#22c55e',
    tagBg: 0x082613,
    tagBorder: 0x22c55e,
    spriteKey: 'npc_4',
    avatar: 'npc_4',
    greeting: 'Vạn Bảo Các mua bán công bằng, tỷ lệ quy đổi chuẩn thiên địa! Có da lông săn bắt hay cần đổi Bạc lấy Linh Thạch cứ việc tìm ta.',
    actions: [
      {
        id: 'exchange_pelt_shop',
        label: '🏪 Tiệm Thu Mua Da Thú (Đổi Lấy Bạc)',
        desc: 'Bán da lông yêu thú săn được để thu về Ngân Lượng (Bạc)',
        color: '#0d9488',
        execute: (scene) => {
          scene.openCongPhapPanel('Hoàng Giai', 'exchange');
          return { success: true };
        }
      },
      {
        id: 'buy_village_cong_phap',
        label: '📜 Mua Công Pháp Tu Luyện Cấp Thấp (Bằng Bạc)',
        desc: 'Dùng Bạc mua 9 môn Công Pháp Hoàng Giai nhập môn của thôn dã',
        color: '#eab308',
        execute: (scene) => {
          scene.openCongPhapPanel('Hoàng Giai', 'manuals');
          return { success: true };
        }
      },
      {
        id: 'exchange_currency',
        label: '🏦 Tiền Trang: Quy Đổi Linh Thạch (Tỷ Lệ 1:10000)',
        desc: 'Đổi Bạc ⇄ Linh Thạch Sơ Cấp ⇄ Trung Cấp ⇄ Thượng Phẩm ⇄ Cực Phẩm',
        color: '#15803d',
        execute: (scene) => {
          scene.openCurrencyExchangeModal();
          return { success: true };
        }
      }
    ]
  },

  {
    id: 'vo_quan',
    name: 'Võ Quán (Tần Quán Chủ)',
    title: '[VÕ QUÁN]',
    mapId: 0,
    x: 390,
    y: 380,
    icon: '🥋',
    color: '#ffd700',
    tagBg: 0x221a08,
    tagBorder: 0xffd700,
    spriteKey: 'npc_5',
    avatar: 'npc_5',
    greeting: 'Ha ha! Muốn ra ngoài Thanh Vân Thôn săn dã thú mà sợ nguy hiểm đơn độc? Võ Quán ta có 4 đệ tử thiện chiến (Đại Hán Đao & Thợ Săn Rìu) sẵn sàng kết thành Tổ Đội 5 Người cùng ngươi xuất chiến! Chiến lợi phẩm chia đều 5 phần công bằng!',
    actions: [
      {
        id: 'join_party',
        label: '⚔️ LẬP TỔ ĐỘI 4 HIỆP KHÁCH (CHIA 5 CHIẾN LỢI PHẨM)',
        desc: 'Chiêu mộ 4 hiệp khách (2 Đao, 2 Rìu) hộ vệ theo sau diệt quái. Chiến lợi phẩm chia 5.',
        color: '#22c55e',
        execute: (scene) => {
          if (gameState.party?.isFormed) {
            scene.showFloatingText(scene.player.x, scene.player.y - 70, 'Tiểu hữu đã có Tổ Đội 4 Hiệp Khách rồi!', '#ffaa55');
            return { success: false, msg: 'Đã trong tổ đội' };
          }
          if (!gameState.party) gameState.party = {};
          gameState.party.isFormed = true;
          if (scene.initPartyFollowers) scene.initPartyFollowers();
          scene.showFloatingText(scene.player.x, scene.player.y - 70, '🎉 Đã lập Tổ Đội 5 Người! 4 Hiệp Khách sẽ theo sau bảo vệ bạn ngoài thôn!', '#ffd700', '14px');
          if (scene.updateHUD) scene.updateHUD();
          scene.closeModal();
          return { success: true, msg: 'Đã lập tổ đội thành công!' };
        }
      },
      {
        id: 'leave_party',
        label: '❌ GIẢI TÁN TỔ ĐỘI (ĐI ĐƠN 100% CHIẾN LỢI PHẨM)',
        desc: 'Rời đội, đi một mình nhận toàn bộ 100% EXP, Bạc và Da Thú',
        color: '#ef4444',
        execute: (scene) => {
          if (!gameState.party?.isFormed) {
            scene.showFloatingText(scene.player.x, scene.player.y - 70, 'Bạn đang đi đơn độc hành, chưa có tổ đội!', '#94a3b8');
            return { success: false, msg: 'Chưa có tổ đội' };
          }
          gameState.party.isFormed = false;
          if (scene.destroyPartyFollowers) scene.destroyPartyFollowers();
          scene.showFloatingText(scene.player.x, scene.player.y - 70, 'Đã giải tán tổ đội, trở lại đi đơn (100% chiến lợi phẩm)!', '#38bdf8');
          if (scene.updateHUD) scene.updateHUD();
          scene.closeModal();
          return { success: true, msg: 'Đã giải tán tổ đội!' };
        }
      },
      {
        id: 'party_lore',
        label: '📜 Quy Tắc Phân Chia Chiến Lợi Phẩm Tổ Đội',
        desc: '4 Hiệp khách bảo vệ, quái bị diệt thì EXP & Da Lông Thú chia 5 phần.',
        color: '#a855f7',
        execute: (scene) => {
          scene.showFloatingText(scene.player.x, scene.player.y - 70, 'Tần Quán Chủ: "Có 4 huynh đệ bảo kê diệt quái thần tốc, chiến lợi phẩm chia 5 rất có lợi cho tân thủ!"', '#fde047', '12px');
          return { success: true };
        }
      }
    ]
  }
];
