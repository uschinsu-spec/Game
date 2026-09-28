/**
 * npcData.js
 * Quản lý Danh sách và Dữ liệu Tương tác của các NPC trong Game
 */
import { gameState } from '../state/gameState.js';

export const VILLAGE_HOTSPOTS = Object.freeze([
  { npcId: 'truong_thon', x: 270, y: 118, width: 205, height: 92 },
  { npcId: 'nong_phu',    x: 478, y: 205, width: 124, height: 118 },
  { npcId: 'tho_ren',     x: 100, y: 326, width: 165, height: 145 },
  { npcId: 'thuong_hoi',  x: 270, y: 405, width: 178, height: 126 },
  { npcId: 'tuu_lau',     x: 367, y: 526, width: 184, height: 128 },
  { npcId: 'duoc_diem',   x: 126, y: 590, width: 188, height: 142 },
  { npcId: 'tho_xay',     x: 473, y: 747, width: 132, height: 128 },
  { npcId: 've_si_cong',  x: 270, y: 825, width: 190, height: 150 }
]);

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
        id: 'admin_test_panel',
        label: '⚡ [ADMIN] Menu Test Game',
        desc: 'Tùy chỉnh Cảnh giới, Học Skill, Đổi Bậc Thuần thục (Sơ Nhập -> Viên Mãn), Hack Bạc / Linh Thạch',
        color: '#f43f5e',
        execute: (scene) => {
          scene.openAdminTestModal?.();
          return { success: true };
        }
      },
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
    name: 'Dược Nương (Liễu Dược Sư)',
    title: '[DƯỢC NƯƠNG]',
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
    name: 'Chủ Tửu Quán (Túy Tiên Quán)',
    title: '[CHỦ TỬU QUÁN]',
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
    name: 'Thương Nhân (Vạn Bảo Các)',
    title: '[THƯƠNG NHÂN]',
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
        id: 'buy_talismans',
        label: '📜 Mua Phù Lục Theo Cảnh Giới',
        desc: 'Vạn Bảo Các bán phù lục đúng phẩm cấp hiện tại của đạo hữu',
        color: '#38bdf8',
        execute: (scene) => {
          scene.openMerchantSpecialShop('talismans');
          return { success: true };
        }
      },
      {
        id: 'buy_formations',
        label: '☸ Mua Trận Pháp Theo Cảnh Giới',
        desc: 'Mua trận pháp đúng phẩm cấp cảnh giới hiện tại, cao hơn sẽ không hiện bán',
        color: '#a855f7',
        execute: (scene) => {
          scene.openMerchantSpecialShop('formations');
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
    id: 'nong_phu',
    name: 'Nông Phu (Điền Bá)',
    title: '[NÔNG PHU]',
    mapId: 0,
    x: 478,
    y: 205,
    icon: '🌾',
    color: '#86efac',
    tagBg: 0x12351f,
    tagBorder: 0x4ade80,
    spriteKey: 'npc_9',
    avatar: 'npc_9',
    greeting: 'Ruộng linh điền của Thanh Vân Thôn chuyên gieo trồng dược thảo phổ thông. Có thảo dược muốn bán hoặc cần giống cây thì cứ tìm ta.',
    actions: [
      {
        id: 'sell_common_herbs',
        label: '🌿 Bán Linh Thảo Phổ Thông',
        desc: 'Mở kho thảo dược và bán các cây thuốc đã thu hái ngoài thôn',
        color: '#22c55e',
        execute: (scene) => {
          scene.openCommonHerbSellPanel?.();
          return { success: true };
        }
      },
      {
        id: 'buy_farm_herbs',
        label: '🧺 Mua 10 Linh Thảo (Giá: 200 Bạc)',
        desc: 'Mua thảo dược phổ thông dùng làm nguyên liệu luyện đan',
        color: '#eab308',
        execute: (scene) => scene.tradeWithNpc('buy_herbs', { costSilver: 200, addHerbs: 10 })
      }
    ]
  },

  {
    id: 'tho_xay',
    name: 'Thợ Xây (Lỗ Công)',
    title: '[THỢ XÂY]',
    mapId: 0,
    x: 473,
    y: 747,
    icon: '🏗️',
    color: '#fbbf24',
    tagBg: 0x35230a,
    tagBorder: 0xf59e0b,
    spriteKey: 'npc_14',
    avatar: 'npc_14',
    greeting: 'Ta phụ trách cầu đường và các công trình nối Thanh Vân Thôn với những vùng đất bên ngoài. Muốn xem lộ trình thì mở bản đồ thế giới.',
    actions: [
      {
        id: 'open_world_map',
        label: '🗺️ Xem Bản Đồ & Công Trình Liên Vùng',
        desc: 'Mở bản đồ để xem các khu vực, điều kiện và đường đi đã mở khóa',
        color: '#38bdf8',
        execute: (scene) => {
          scene.openMapPanel('nam_lang');
          return { success: true };
        }
      }
    ]
  },

  {
    id: 've_si_cong',
    name: 'Vệ Sĩ Cổng (Hộ Vệ Thanh Vân)',
    title: '[VỆ SĨ CỔNG]',
    mapId: 0,
    x: 270,
    y: 825,
    icon: '🛡️',
    color: '#fca5a5',
    tagBg: 0x351215,
    tagBorder: 0xef4444,
    spriteKey: 'npc_16',
    avatar: 'npc_16',
    greeting: 'Bên ngoài cổng là Thanh Vân Ngoại Vi, nơi dã thú và yêu vật xuất hiện. Hãy chuẩn bị đầy đủ trước khi rời khu an toàn.',
    actions: [
      {
        id: 'leave_village',
        label: '⚔️ Rời Thôn — Đến Thanh Vân Ngoại Vi',
        desc: 'Đi qua cổng là vào khu chiến đấu và có thể bị quái vật tấn công',
        color: '#ef4444',
        execute: (scene) => {
          scene.closeModal();
          scene.portalCooldownUntil = (scene.time?.now || 0) + 3500;
          scene.switchMap(1, 420, 620);
          return { success: true };
        }
      },
      {
        id: 'inspect_route',
        label: '🗺️ Xem Bản Đồ Trước Khi Khởi Hành',
        desc: 'Kiểm tra khu vực, cảnh giới yêu cầu và lộ trình tiếp theo',
        color: '#38bdf8',
        execute: (scene) => {
          scene.openMapPanel('nam_lang', 1);
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
