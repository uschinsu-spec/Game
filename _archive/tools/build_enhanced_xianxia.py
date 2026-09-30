import os

# -------------------------------------------------------------
# 1. CONFIG: regionsData.js (Đại Bản Đồ Nhân Giới phân khu)
# -------------------------------------------------------------
regionsData = """// HỆ THỐNG ĐẠI BẢN ĐỒ NHÂN GIỚI (5 ĐẠI VỰC & 15 TIÊN CẢNH)
export const WORLD_REGIONS = [
  {
    id: 'nam_lang',
    name: 'Nam Lăng Đại Lục',
    desc: 'Vùng đất khởi nguyên tu chân giới, núi non trùng điệp, sơn môn san sát.',
    stages: [
      { id: 0, name: 'Thanh Vân Tông Cổ Lạc', sub: 'Nhất Phẩm Sơn Môn', minRealm: 0, monsterIdxStart: 0, icon: 'stage_0' },
      { id: 1, name: 'Vạn Thú Sâm Lâm', sub: 'Nhất Phẩm Thâm Xứ', minRealm: 2, monsterIdxStart: 2, icon: 'stage_1' },
      { id: 2, name: 'Huyết Lạc Cấm Địa', sub: 'Nhị Phẩm Cấm Khu', minRealm: 4, monsterIdxStart: 4, icon: 'stage_2' }
    ]
  },
  {
    id: 'van_tinh_hai',
    name: 'Vạn Tinh Hải Vực',
    desc: 'Đại dương vô tận với hàng vạn tiên đảo và sào huyệt yêu thú ngàn năm.',
    stages: [
      { id: 3, name: 'Thiên Tinh Hải Thành', sub: 'Nhị Phẩm Đảo Thành', minRealm: 6, monsterIdxStart: 6, icon: 'stage_3' },
      { id: 4, name: 'Ngoại Hải Săn Yêu', sub: 'Tam Phẩm Hải Uyên', minRealm: 8, monsterIdxStart: 8, icon: 'stage_4' },
      { id: 5, name: 'Hư Không Cổ Điện', sub: 'Tam Phẩm Di Tích', minRealm: 10, monsterIdxStart: 10, icon: 'stage_5' }
    ]
  },
  {
    id: 'than_chau',
    name: 'Thần Châu Thánh Địa',
    desc: 'Trung tâm tu tiên phồn hoa cực thịnh, nơi ngự trị của các Thái Cổ Đại Tông.',
    stages: [
      { id: 6, name: 'Côn Lôn Tiên Lạc', sub: 'Tứ Phẩm Thánh Sơn', minRealm: 12, monsterIdxStart: 12, icon: 'stage_6' },
      { id: 7, name: 'Thái Hư Kiếm Cốc', sub: 'Tứ Phẩm Kiếm Trủng', minRealm: 14, monsterIdxStart: 14, icon: 'stage_7' },
      { id: 8, name: 'Hoàng Cực Thần Điện', sub: 'Tứ Phẩm Đế Đô', minRealm: 15, monsterIdxStart: 14, icon: 'stage_8' }
    ]
  },
  {
    id: 'man_hoang',
    name: 'Man Hoang Cổ Vực',
    desc: 'Vùng đất nguyên thủy cấm kỵ, cổ ma tàn tích và linh thú thời thái cổ.',
    stages: [
      { id: 9, name: 'U Minh Quỷ Quật', sub: 'Ngũ Phẩm Ma Cảnh', minRealm: 16, monsterIdxStart: 16, icon: 'stage_9' },
      { id: 10, name: 'Thần Ma Cổ Chiến Trường', sub: 'Ngũ Phẩm Cổ Địa', minRealm: 17, monsterIdxStart: 17, icon: 'stage_10' }
    ]
  },
  {
    id: 'thai_hu',
    name: 'Thái Hư Tiên Đạo',
    desc: 'Bí cảnh nối liền Thiên Địa, nơi hội tụ Thiên Kiếp và cánh cổng phi thăng.',
    stages: [
      { id: 11, name: 'Cửu Trọng Thiên Đạo', sub: 'Ngũ Phẩm Hóa Thần Cực Hạn', minRealm: 18, monsterIdxStart: 18, icon: 'stage_10' },
      { id: 12, name: 'Phi Thăng Tiên Môn', sub: 'Ngũ Phẩm Đỉnh Phong', minRealm: 19, monsterIdxStart: 18, icon: 'stage_11' }
    ]
  }
];

export const ALL_STAGES = WORLD_REGIONS.flatMap(r => r.stages);
"""
with open('H:/GOOGLE DRIVER/GAME/src/config/regionsData.js', 'w', encoding='utf-8') as f:
    f.write(regionsData)

# -------------------------------------------------------------
# 2. CONFIG: sectsData.js (8 Đại Tông Môn theo 8 Hệ)
# -------------------------------------------------------------
sectsData = """// 8 ĐẠI TÔNG MÔN TU TIÊN THEO 8 HỆ NGUYÊN TỐ
export const SECTS = [
  {
    id: 'van_kiem_tong',
    elem: 'Kim',
    name: 'Vạn Kiếm Tông',
    title: 'Kiếm Đạo Chí Tôn',
    desc: 'Chuyên tu Canh Kim Kiếm Khí, lấy kiếm nhập đạo, vạn kiếm quy tông sát phạt vô song.',
    buffDesc: '+15% Sát Thương Hệ Kim, +5% Bạo Kích',
    bonusDmgMul: 1.15,
    critBonus: 5,
    icon: 'skill_0'
  },
  {
    id: 'liet_diem_cung',
    elem: 'Hỏa',
    name: 'Liệt Diễm Thần Cung',
    title: 'Hỏa Pháp Phần Thiên',
    desc: 'Thuần thục ngự hỏa chi thuật, chân hỏa thiêu rụi kinh mạch đối phương.',
    buffDesc: '+15% Sát Thương Hệ Hỏa, Thiêu đốt giảm 10% Giáp',
    bonusDmgMul: 1.15,
    burnBonus: 10,
    icon: 'skill_3'
  },
  {
    id: 'bang_phach_cac',
    elem: 'Thủy',
    name: 'Băng Phách Tiên Các',
    title: 'Băng Tuyết U Hàn',
    desc: 'Hấp thu hàn khí cửu u, đóng băng vạn dặm và phòng ngự hàn băng tuyệt đỉnh.',
    buffDesc: '+15% Sát Thương Hệ Thủy, +10% Hộ Thể Chân Khí',
    bonusDmgMul: 1.15,
    defBonus: 10,
    icon: 'skill_4'
  },
  {
    id: 'hau_tho_mon',
    elem: 'Thổ',
    name: 'Hậu Thổ Huyền Tông',
    title: 'Bàn Thạch Bất Diệt',
    desc: 'Hợp nhất với đại địa, khí tức trầm ổn, phòng ngự vững chắc không thể phá vỡ.',
    buffDesc: '+25% Sinh Mệnh Tối Đa, +20% Giáp Hộ Thể',
    hpBonus: 25,
    defBonus: 20,
    icon: 'skill_8'
  },
  {
    id: 'thanh_moc_cac',
    elem: 'Mộc',
    name: 'Thanh Mộc Dược Các',
    title: 'Trường Sinh Linh Dược',
    desc: 'Nắm giữ bí quyết Luyện Đan và Thảo Mộc sinh linh, tự hồi phục liên tục.',
    buffDesc: '+20% Hiệu Quả Đan Dược & Hồi Máu, +30% Linh Thảo Dược Điền',
    healBonus: 20,
    herbBonus: 30,
    icon: 'skill_7'
  },
  {
    id: 'phong_loi_cac',
    elem: 'Phong',
    name: 'Thiên Phong Thần Tông',
    title: 'Ngự Phong Thần Hành',
    desc: 'Thân pháp phiêu dật như gió bão, thoắt ẩn thoắt hiện né tránh đòn đánh.',
    buffDesc: '+25% Tốc Độ Xuất Chiêu, +15% Tỷ Lệ Né Tránh',
    spdBonus: 25,
    dodgeBonus: 15,
    icon: 'skill_5'
  },
  {
    id: 'cuu_tieu_loi_dien',
    elem: 'Lôi',
    name: 'Cửu Tiêu Lôi Điện',
    title: 'Thiên Kiếp Thần Lôi',
    desc: 'Chưởng quản sấm sét thiên kiếp, Tịch Tà Thần Lôi khắc chế vạn ma tà đạo.',
    buffDesc: '+20% Sát Thương Hệ Lôi, Sét giáng gây tê liệt',
    bonusDmgMul: 1.20,
    paralyzeBonus: 10,
    icon: 'skill_1'
  },
  {
    id: 'thanh_the_tong',
    elem: 'Vật Lý',
    name: 'Cửu Chuyển Thánh Thể Tông',
    title: 'Nhục Thân Thành Thánh',
    desc: 'Thể tu chí tôn, tôi luyện nhục thân đao thương bất nhập, dời non lấp biển.',
    buffDesc: '+20% Công Kích Vật Lý, +15% Kháng Sát Thương',
    bonusDmgMul: 1.20,
    dmgReduct: 15,
    icon: 'skill_9'
  }
];

export const SECT_RANKS = [
  { id: 0, name: 'Đệ Tử Ngoại Môn', salaryGold: 100, salaryHerb: 5, salaryOre: 2, reqContrib: 0 },
  { id: 1, name: 'Đệ Tử Nội Môn', salaryGold: 300, salaryHerb: 15, salaryOre: 6, reqContrib: 200 },
  { id: 2, name: 'Đệ Tử Chân Truyền', salaryGold: 800, salaryHerb: 35, salaryOre: 15, reqContrib: 600 },
  { id: 3, name: 'Chấp Sự Trưởng Lão', salaryGold: 2000, salaryHerb: 80, salaryOre: 35, reqContrib: 1500 },
  { id: 4, name: 'Thái Thượng Trưởng Lão', salaryGold: 5000, salaryHerb: 200, salaryOre: 80, reqContrib: 3500 }
];
"""
with open('H:/GOOGLE DRIVER/GAME/src/config/sectsData.js', 'w', encoding='utf-8') as f:
    f.write(sectsData)

# -------------------------------------------------------------
# 3. STATE: gameState.js (Bổ sung Tông Môn, Căn Cốt, Thần Thức)
# -------------------------------------------------------------
gameStateCode = """// QUẢN LÝ TOÀN BỘ TRẠNG THÁI NGƯỜI CHƠI & DỮ LIỆU TU TIÊN
export const gameState = {
  // Cảnh giới & Tu vi
  realmIdx: 0,
  exp: 0,
  
  // Thuộc tính Tu Tiên
  spiritualSense: 10, // Thần Thức (tăng bạo kích & cảm ứng cơ duyên)
  manaMax: 500,       // Chân Nguyên / Linh Lực
  mana: 500,
  aptitude: 'Ngũ Hành Linh Căn', // Căn Cốt
  
  // Tài nguyên
  gold: 500,
  herbs: 30,
  ores: 15,

  // Tông môn
  sectId: null,       // 'van_kiem_tong', 'liet_diem_cung', ...
  sectRankIdx: 0,     // 0: Ngoại Môn -> 4: Thái Thượng Trưởng Lão
  sectContrib: 0,     // Điểm cống hiến môn phái
  lastSalaryClaim: 0, // Thời gian nhận bổng lộc

  // Túi trữ vật
  inventory: {
    pills: {},
    talismans: {},
    formations: []
  },

  // Bí cảnh hiện tại
  currentStageId: 0,
  
  // Tôi luyện & Kỹ năng
  gearPlus: 0,
  equippedSkillIds: ['kim_1', 'hoa_1', 'loi_1', 'ly_1'],
  autoFight: true,
  gardenTimer: 0
};
"""
with open('H:/GOOGLE DRIVER/GAME/src/state/gameState.js', 'w', encoding='utf-8') as f:
    f.write(gameStateCode)

# -------------------------------------------------------------
# 4. SCENE: MainScene.js (Tích hợp Tông Môn, Đại Bản Đồ & Bảng Thuộc Tính)
# -------------------------------------------------------------
mainSceneCode = r"""import { REALMS } from '../config/realmsData.js';
import { MONSTER_RANKS } from '../config/monstersData.js';
import { WORLD_REGIONS, ALL_STAGES } from '../config/regionsData.js';
import { ELEMENTAL_SKILLS } from '../config/skillsData.js';
import { CRAFTING_SYSTEM } from '../config/craftingData.js';
import { INITIAL_ITEMS } from '../config/itemsData.js';
import { SECTS, SECT_RANKS } from '../config/sectsData.js';
import { gameState } from '../state/gameState.js';

export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;

export class MainGameScene extends Phaser.Scene {
  constructor() {
    super('MainGameScene');
  }

  preload() {
    // Icons Skills (10 skills)
    for (let i = 0; i < 10; i++) {
      this.load.image(`skill_${i}`, `assets/icons/skills/skill_${i}.png`);
    }

    // Icons Items (18 items)
    for (let i = 0; i < 18; i++) {
      this.load.image(`item_${i}`, `assets/icons/items/item_${i}.png`);
    }

    // Icons Stages (12 stages)
    for (let i = 0; i < 12; i++) {
      this.load.image(`stage_${i}`, `assets/icons/stages/stage_${i}.png`);
    }

    // UI Icons
    const uiIcons = ['bag', 'realm', 'skills', 'auto', 'settings', 'close', 'map', 'gold', 'pill', 'quest'];
    uiIcons.forEach(icon => {
      this.load.image(`ui_${icon}`, `assets/icons/ui/${icon}.png`);
    });

    // Sprites
    this.load.image('player_avatar', 'assets/sprites/player/player_avatar.png');
    this.load.image('player_idle', 'assets/sprites/player/player_idle_0.png');
    this.load.image('enemy_boss', 'assets/sprites/enemies/enemy_boss.png');
    this.load.image('enemy_wolf', 'assets/sprites/enemies/enemy_wolf.png');
    this.load.image('enemy_bat', 'assets/sprites/enemies/enemy_bat.png');
    this.load.image('enemy_snake', 'assets/sprites/enemies/enemy_snake.png');
    this.load.image('enemy_monkey', 'assets/sprites/enemies/enemy_monkey.png');
    this.load.image('enemy_bull', 'assets/sprites/enemies/enemy_bull.png');
    this.load.image('enemy_dragon', 'assets/sprites/enemies/enemy_dragon.png');
    this.load.image('enemy_octopus', 'assets/sprites/enemies/enemy_octopus.png');
    this.load.image('map_bg', 'assets/maps/map_background.png');
  }

  create() {
    this.cameras.main.setBackgroundColor('#090e18');

    this.bg = this.add.image(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20, 'map_bg')
      .setDisplaySize(CANVAS_WIDTH, CANVAS_HEIGHT - 60)
      .setAlpha(0.4);

    this.createAuraParticles();

    this.playerHpMax = this.calcPlayerMaxHp();
    this.playerHp = this.playerHpMax;
    this.playerDmg = this.calcPlayerDmg();

    // Player Sprite
    this.playerSprite = this.add.image(280, 270, 'player_idle')
      .setScale(0.9)
      .setOrigin(0.5, 0.8);
    
    this.tweens.add({
      targets: this.playerSprite,
      y: 262,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.playerNameText = this.add.text(280, 178, 'Tiên Hữu', {
      fontSize: '15px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.playerRealmTag = this.add.text(280, 200, REALMS[gameState.realmIdx].name, {
      fontSize: '11px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#88ddff',
      backgroundColor: '#0a1a2fdd',
      padding: { x: 8, y: 3 }
    }).setOrigin(0.5);

    this.playerHpBg = this.add.rectangle(280, 220, 130, 8, 0x222222).setOrigin(0.5);
    this.playerHpBar = this.add.rectangle(280 - 65, 220, 130, 8, 0x00ee66).setOrigin(0, 0.5);

    this.enemies = [];
    this.skillCooldowns = {};

    this.spawnEnemies();

    this.createTopHUD();
    this.createBottomNav();
    this.createSkillBar();

    this.modalLayer = this.add.container(0, 0).setDepth(200);

    this.time.addEvent({
      delay: 1000,
      callback: this.onSecondTick,
      callbackScope: this,
      loop: true
    });
  }

  calcPlayerMaxHp() {
    const realm = REALMS[gameState.realmIdx];
    let hp = realm.hp + gameState.gearPlus * 150;
    
    // Tông môn buff
    if (gameState.sectId) {
      const sect = SECTS.find(s => s.id === gameState.sectId);
      if (sect && sect.hpBonus) hp = Math.floor(hp * (1 + sect.hpBonus / 100));
    }

    // Trận pháp buff
    gameState.inventory.formations.forEach(fName => {
      const fObj = CRAFTING_SYSTEM.formations.find(f => f.name === fName);
      if (fObj && fObj.bonusHp) hp += fObj.bonusHp;
    });
    return hp;
  }

  calcPlayerDmg() {
    const realm = REALMS[gameState.realmIdx];
    let dmg = realm.dmg + gameState.gearPlus * 25;
    
    // Tông môn buff
    if (gameState.sectId) {
      const sect = SECTS.find(s => s.id === gameState.sectId);
      if (sect && sect.bonusDmgMul) dmg = Math.floor(dmg * sect.bonusDmgMul);
    }

    // Trận pháp buff
    gameState.inventory.formations.forEach(fName => {
      const fObj = CRAFTING_SYSTEM.formations.find(f => f.name === fName);
      if (fObj && fObj.bonusDmg) dmg += fObj.bonusDmg;
    });
    return dmg;
  }

  calcPlayerDef() {
    const realm = REALMS[gameState.realmIdx];
    let def = realm.def + gameState.gearPlus * 10;
    
    if (gameState.sectId) {
      const sect = SECTS.find(s => s.id === gameState.sectId);
      if (sect && sect.defBonus) def = Math.floor(def * (1 + sect.defBonus / 100));
    }

    gameState.inventory.formations.forEach(fName => {
      const fObj = CRAFTING_SYSTEM.formations.find(f => f.name === fName);
      if (fObj && fObj.bonusDef) def += fObj.bonusDef;
    });
    return def;
  }

  createAuraParticles() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x88ccff, 0.6);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('aura_dot', 8, 8);
    graphics.destroy();

    this.auraEmitter = this.add.particles(280, 270, 'aura_dot', {
      speed: { min: 20, max: 50 },
      angle: { min: 220, max: 320 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 1200,
      frequency: 200
    });
  }

  // TOP HUD (Hiển thị Cảnh Giới, Tông Môn, Tu Vi, Tài Nguyên, Bí Cảnh)
  createTopHUD() {
    this.topHudContainer = this.add.container(0, 0).setDepth(100);

    const topBarBg = this.add.rectangle(CANVAS_WIDTH / 2, 28, CANVAS_WIDTH - 24, 46, 0x090f1d, 0.92)
      .setStrokeStyle(1.5, 0x2a3e5c);
    this.topHudContainer.add(topBarBg);

    const avatar = this.add.image(36, 28, 'player_avatar').setDisplaySize(38, 38)
      .setInteractive({ useHandCursor: true });
    avatar.on('pointerdown', () => this.openCharacterPanel());
    this.topHudContainer.add(avatar);

    this.hudRealmText = this.add.text(64, 16, REALMS[gameState.realmIdx].name, {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#ffdd66'
    });
    this.topHudContainer.add(this.hudRealmText);

    // EXP Bar
    this.hudExpBg = this.add.rectangle(130, 36, 130, 8, 0x1a2638).setOrigin(0.5);
    this.hudExpBar = this.add.rectangle(65, 36, 0, 8, 0x33bbff).setOrigin(0, 0.5);
    this.topHudContainer.add([this.hudExpBg, this.hudExpBar]);

    this.hudExpText = this.add.text(202, 32, '0%', {
      fontSize: '10px',
      fontFamily: 'sans-serif',
      color: '#aaddee'
    });
    this.topHudContainer.add(this.hudExpText);

    // Tông Môn Tag
    this.hudSectText = this.add.text(260, 20, gameState.sectId ? `🏛️ ${SECTS.find(s => s.id === gameState.sectId).name}` : '🏛️ Chưa Nhập Môn', {
      fontSize: '11px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#66ffcc'
    });
    this.topHudContainer.add(this.hudSectText);

    // Tài Nguyên
    const goldIcon = this.add.image(410, 28, 'ui_gold').setDisplaySize(20, 20);
    this.hudGoldText = this.add.text(425, 20, `${gameState.gold}`, {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      color: '#ffcc00'
    });

    const herbIcon = this.add.image(490, 28, 'item_6').setDisplaySize(20, 20);
    this.hudHerbText = this.add.text(505, 20, `${gameState.herbs}`, {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      color: '#88ee88'
    });

    const oreIcon = this.add.image(560, 28, 'item_8').setDisplaySize(20, 20);
    this.hudOreText = this.add.text(575, 20, `${gameState.ores}`, {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      color: '#66ccff'
    });
    this.topHudContainer.add([goldIcon, this.hudGoldText, herbIcon, this.hudHerbText, oreIcon, this.hudOreText]);

    const stage = ALL_STAGES[gameState.currentStageId] || ALL_STAGES[0];
    this.hudStageText = this.add.text(CANVAS_WIDTH - 30, 20, `📍 ${stage.name} (${stage.sub})`, {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#aaddff'
    }).setOrigin(1, 0);
    this.topHudContainer.add(this.hudStageText);

    this.updateHUD();
  }

  updateHUD() {
    const realm = REALMS[gameState.realmIdx];
    const nextReq = realm.expReq;
    const pct = Math.min(100, Math.floor((gameState.exp / nextReq) * 100));

    this.hudRealmText.setText(realm.name);
    this.playerRealmTag.setText(realm.name);
    this.hudExpBar.width = (pct / 100) * 130;
    this.hudExpText.setText(`${pct}%`);
    
    if (gameState.sectId) {
      const sect = SECTS.find(s => s.id === gameState.sectId);
      this.hudSectText.setText(`🏛️ ${sect.name} (${SECT_RANKS[gameState.sectRankIdx].name})`);
    } else {
      this.hudSectText.setText('🏛️ Chưa Nhập Môn');
    }

    this.hudGoldText.setText(`${gameState.gold}`);
    this.hudHerbText.setText(`${gameState.herbs}`);
    this.hudOreText.setText(`${gameState.ores}`);
    
    const stage = ALL_STAGES[gameState.currentStageId] || ALL_STAGES[0];
    this.hudStageText.setText(`📍 ${stage.name} (${stage.sub})`);

    this.playerHpMax = this.calcPlayerMaxHp();
    this.playerDmg = this.calcPlayerDmg();
    const hpRatio = Math.max(0, this.playerHp / this.playerHpMax);
    this.playerHpBar.width = hpRatio * 130;
  }

  // BOTTOM NAVIGATION (7 Nút: Hành Trang, Cảnh Giới, Tông Môn, Bách Nghệ, Công Pháp, Tự Động, Bản Đồ)
  createBottomNav() {
    this.bottomNavContainer = this.add.container(0, 0).setDepth(100);

    const navBg = this.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 32, CANVAS_WIDTH - 24, 52, 0x070c16, 0.95)
      .setStrokeStyle(1.5, 0x22354d);
    this.bottomNavContainer.add(navBg);

    const navItems = [
      { key: 'bag', label: 'HÀNH TRANG', icon: 'ui_bag', action: () => this.openGearPanel() },
      { key: 'realm', label: 'CẢNH GIỚI', icon: 'ui_realm', action: () => this.openCharacterPanel() },
      { key: 'sect', label: 'TÔNG MÔN', icon: 'item_16', action: () => this.openSectPanel() },
      { key: 'craft', label: 'BÁCH NGHỆ', icon: 'item_7', action: () => this.openCraftingPanel('pills') },
      { key: 'skills', label: 'CÔNG PHÁP', icon: 'ui_skills', action: () => this.openSkillPanel('Kim') },
      { key: 'auto', label: 'TỰ ĐỘNG', icon: 'ui_auto', action: () => this.toggleAutoFight() },
      { key: 'map', label: 'BẢN ĐỒ', icon: 'ui_map', action: () => this.openMapPanel() }
    ];

    const startX = 75;
    const gap = 135;

    navItems.forEach((btn, idx) => {
      const x = startX + idx * gap;
      const y = CANVAS_HEIGHT - 32;

      const itemContainer = this.add.container(x, y);

      const btnBox = this.add.rectangle(0, 0, 118, 42, 0x111e30, 0.8)
        .setStrokeStyle(1, 0x2a4466)
        .setInteractive({ useHandCursor: true });

      const iconImg = this.add.image(-38, 0, btn.icon).setDisplaySize(22, 22);

      const labelTxt = this.add.text(6, 0, btn.label, {
        fontSize: '11px',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        color: '#d4e6ff'
      }).setOrigin(0.5);

      if (btn.key === 'auto') {
        this.autoBtnBg = btnBox;
        this.autoBtnLabel = labelTxt;
        this.updateAutoBtnVisual();
      }

      btnBox.on('pointerover', () => {
        btnBox.setFillStyle(0x1a3355, 0.95);
        btnBox.setStrokeStyle(1.5, 0x4488ff);
      });

      btnBox.on('pointerout', () => {
        if (btn.key === 'auto' && gameState.autoFight) {
          btnBox.setFillStyle(0x1a4028, 0.95);
          btnBox.setStrokeStyle(1.5, 0x33cc66);
        } else {
          btnBox.setFillStyle(0x111e30, 0.8);
          btnBox.setStrokeStyle(1, 0x2a4466);
        }
      });

      btnBox.on('pointerdown', btn.action);

      itemContainer.add([btnBox, iconImg, labelTxt]);
      this.bottomNavContainer.add(itemContainer);
    });
  }

  updateAutoBtnVisual() {
    if (gameState.autoFight) {
      this.autoBtnBg.setFillStyle(0x1a4028, 0.95);
      this.autoBtnBg.setStrokeStyle(1.5, 0x33cc66);
      this.autoBtnLabel.setColor('#66ff88');
      this.autoBtnLabel.setText('ĐANG TREO');
    } else {
      this.autoBtnBg.setFillStyle(0x111e30, 0.8);
      this.autoBtnBg.setStrokeStyle(1, 0x2a4466);
      this.autoBtnLabel.setColor('#d4e6ff');
      this.autoBtnLabel.setText('THỦ CÔNG');
    }
  }

  toggleAutoFight() {
    gameState.autoFight = !gameState.autoFight;
    this.updateAutoBtnVisual();
    this.showFloatingText(280, 160, gameState.autoFight ? 'ĐÃ BẬT TỰ ĐỘNG TU LUYỆN' : 'CHUYỂN SANG ĐIỀU KHIỂN TAY', '#66ffaa');
  }

  // 4 SLOTS SKILL BAR
  createSkillBar() {
    if (this.skillBarContainer) this.skillBarContainer.destroy();
    this.skillBarContainer = this.add.container(0, 0).setDepth(100);

    const startX = 370;
    const y = CANVAS_HEIGHT - 80;
    const gap = 58;

    this.skillSlots = [];

    for (let i = 0; i < 4; i++) {
      const x = startX + i * gap;
      const skillId = gameState.equippedSkillIds[i];
      const slotContainer = this.add.container(x, y);

      const slotBg = this.add.rectangle(0, 0, 48, 48, 0x111a28, 0.9)
        .setStrokeStyle(1.5, 0x335577)
        .setInteractive({ useHandCursor: true });

      let icon = null;
      let cdOverlay = null;

      if (skillId) {
        const skill = ELEMENTAL_SKILLS.find(s => s.id === skillId);
        if (skill) {
          icon = this.add.image(0, 0, skill.icon).setDisplaySize(40, 40);

          cdOverlay = this.add.rectangle(0, 0, 48, 48, 0x000000, 0.65).setVisible(false);
          const cdText = this.add.text(0, 0, '', {
            fontSize: '12px',
            fontFamily: 'sans-serif',
            fontStyle: 'bold',
            color: '#ffffff'
          }).setOrigin(0.5);

          slotBg.on('pointerdown', () => this.castSkill(skill.id));

          slotContainer.add([slotBg, icon, cdOverlay, cdText]);
          this.skillSlots.push({ container: slotContainer, skillId: skill.id, cdOverlay, cdText, slotBg });
        }
      } else {
        const lockText = this.add.text(0, 0, '+', { fontSize: '20px', color: '#556677' }).setOrigin(0.5);
        slotContainer.add([slotBg, lockText]);
        this.skillSlots.push({ container: slotContainer, skillId: null });
      }

      this.skillBarContainer.add(slotContainer);
    }
  }

  // SPAWN MONSTERS
  spawnEnemies() {
    const stage = ALL_STAGES[gameState.currentStageId] || ALL_STAGES[0];
    const enemyCount = 3;

    for (let i = 0; i < enemyCount; i++) {
      const isBoss = (i === 1);
      const mIdx = Math.min(MONSTER_RANKS.length - 1, stage.monsterIdxStart + (isBoss ? 1 : (i % 2)));
      const monsterData = MONSTER_RANKS[mIdx];

      const x = 540 + i * 140;
      const y = 260 + (i % 2) * 35;

      const sprite = this.add.image(x, y, this.textures.exists(monsterData.sprite) ? monsterData.sprite : 'enemy_wolf')
        .setScale(isBoss ? 0.95 : 0.75)
        .setOrigin(0.5, 0.8);

      const maxHp = monsterData.hp;
      const enemyObj = {
        data: monsterData,
        sprite: sprite,
        name: monsterData.name,
        rank: monsterData.rank,
        hp: maxHp,
        maxHp: maxHp,
        dmg: monsterData.dmg,
        isBoss: isBoss,
        hpBg: this.add.rectangle(x, y - 65, 85, 6, 0x222222).setOrigin(0.5),
        hpBar: this.add.rectangle(x - 42, y - 65, 85, 6, isBoss ? 0xff2244 : 0xee5533).setOrigin(0, 0.5),
        nameText: this.add.text(x, y - 76, `${isBoss ? '👑 ' : ''}${monsterData.name} (${monsterData.rank})`, {
          fontSize: '10px',
          fontFamily: 'sans-serif',
          fontStyle: 'bold',
          color: isBoss ? '#ff4466' : '#ffd700',
          stroke: '#000',
          strokeThickness: 2
        }).setOrigin(0.5),
        atkTimer: 1000 + Math.random() * 800
      };

      this.enemies.push(enemyObj);

      this.tweens.add({
        targets: sprite,
        y: y - 8,
        duration: 1200 + i * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  onSecondTick() {
    gameState.gardenTimer++;
    if (gameState.gardenTimer >= 10) {
      gameState.gardenTimer = 0;
      let herbsGain = 3;
      if (gameState.sectId === 'thanh_moc_cac') herbsGain += 1;
      gameState.herbs += herbsGain;
      this.updateHUD();
    }

    const passiveExp = Math.floor(12 * (1 + gameState.realmIdx * 1.2));
    this.gainExp(passiveExp, false);

    if (gameState.autoFight && this.enemies.length > 0) {
      let casted = false;
      for (let i = 0; i < gameState.equippedSkillIds.length; i++) {
        const sId = gameState.equippedSkillIds[i];
        if (sId && (!this.skillCooldowns[sId] || this.skillCooldowns[sId] <= 0)) {
          this.castSkill(sId);
          casted = true;
          break;
        }
      }
      if (!casted) {
        this.playerNormalAttack();
      }
    }

    this.enemies.forEach(enemy => {
      enemy.atkTimer -= 1000;
      if (enemy.atkTimer <= 0) {
        enemy.atkTimer = 2200 + Math.random() * 1000;
        this.enemyAttack(enemy);
      }
    });

    Object.keys(this.skillCooldowns).forEach(k => {
      if (this.skillCooldowns[k] > 0) this.skillCooldowns[k] -= 1000;
    });
    this.updateSkillCooldownUI();
  }

  updateSkillCooldownUI() {
    this.skillSlots.forEach(slot => {
      if (slot && slot.skillId && slot.cdOverlay) {
        const cdLeft = this.skillCooldowns[slot.skillId] || 0;
        if (cdLeft > 0) {
          slot.cdOverlay.setVisible(true);
          slot.cdText.setText(`${Math.ceil(cdLeft / 1000)}s`);
        } else {
          slot.cdOverlay.setVisible(false);
          slot.cdText.setText('');
        }
      }
    });
  }

  playerNormalAttack() {
    if (this.enemies.length === 0) return;
    const target = this.enemies[0];

    const slash = this.add.rectangle(target.sprite.x, target.sprite.y - 20, 60, 6, 0x88ddff)
      .setRotation(Phaser.Math.DegToRad(45))
      .setDepth(150);

    this.tweens.add({
      targets: slash,
      scaleX: 1.5,
      alpha: 0,
      duration: 250,
      onComplete: () => slash.destroy()
    });

    // Thần Thức tăng tỷ lệ bạo kích
    const critRate = 0.15 + (gameState.spiritualSense * 0.005);
    const isCrit = Math.random() < critRate;
    let dmg = this.playerDmg;
    if (isCrit) dmg = Math.floor(dmg * 1.85);

    this.damageEnemy(target, dmg, isCrit);
  }

  castSkill(skillId) {
    if (this.skillCooldowns[skillId] > 0) return;
    const skill = ELEMENTAL_SKILLS.find(s => s.id === skillId);
    if (!skill) return;

    this.skillCooldowns[skillId] = skill.cd;
    this.updateSkillCooldownUI();

    const elemColors = {
      'Kim': '#ffd700',
      'Hỏa': '#ff4422',
      'Thủy': '#44aaff',
      'Thổ': '#aa8844',
      'Mộc': '#44dd66',
      'Phong': '#66ffcc',
      'Lôi': '#ffee33',
      'Vật Lý': '#ff88aa'
    };

    const baseDmg = Math.floor(this.playerDmg * skill.dmgMul);
    if (skill.isAoE) {
      this.enemies.slice().forEach(target => {
        this.damageEnemy(target, baseDmg, true);
      });
      this.showFloatingText(280, 160, `💥 [${skill.elem}] ${skill.name}!`, elemColors[skill.elem] || '#ffd700');
    } else if (this.enemies.length > 0) {
      this.damageEnemy(this.enemies[0], baseDmg, true);
      this.showFloatingText(280, 160, `⚡ [${skill.elem}] ${skill.name}!`, elemColors[skill.elem] || '#ffd700');
    }
  }

  damageEnemy(enemy, dmg, isCrit) {
    enemy.hp -= dmg;
    this.showFloatingText(enemy.sprite.x, enemy.sprite.y - 40, `-${dmg}`, isCrit ? '#ff3344' : '#ffffff', isCrit ? '17px' : '13px');

    const ratio = Math.max(0, enemy.hp / enemy.maxHp);
    enemy.hpBar.width = ratio * 85;

    enemy.sprite.setTint(0xff5555);
    this.time.delayedCall(120, () => enemy.sprite.clearTint());

    if (enemy.hp <= 0) {
      this.killEnemy(enemy);
    }
  }

  killEnemy(enemy) {
    const data = enemy.data;
    this.gainExp(data.exp, true);
    gameState.gold += data.gold;
    gameState.ores += data.ore;

    // Tích lũy điểm cống hiến môn phái khi diệt quái
    if (gameState.sectId) {
      gameState.sectContrib += 1;
    }

    this.showFloatingText(enemy.sprite.x, enemy.sprite.y - 20, `+${data.exp} Tu Vi  +${data.gold} L.Thạch  +${data.ore} Khoáng`, '#ffdd44');

    enemy.sprite.destroy();
    enemy.hpBg.destroy();
    enemy.hpBar.destroy();
    enemy.nameText.destroy();

    const idx = this.enemies.indexOf(enemy);
    if (idx !== -1) this.enemies.splice(idx, 1);

    this.updateHUD();

    if (this.enemies.length === 0) {
      this.time.delayedCall(1000, () => this.spawnEnemies());
    }
  }

  enemyAttack(enemy) {
    if (this.playerHp <= 0) return;
    const def = this.calcPlayerDef();
    const dmg = Math.max(1, enemy.dmg - def);
    this.playerHp = Math.max(0, this.playerHp - dmg);

    this.showFloatingText(280, 240, `-${dmg}`, '#ff7777');
    this.updateHUD();

    this.playerSprite.setTint(0xff6666);
    this.time.delayedCall(120, () => this.playerSprite.clearTint());
  }

  gainExp(amt, showVisual = false) {
    const realm = REALMS[gameState.realmIdx];
    gameState.exp += amt;

    if (gameState.exp >= realm.expReq) {
      if (realm.bottleneck) {
        gameState.exp = realm.expReq;
      } else {
        if (gameState.realmIdx < REALMS.length - 1) {
          gameState.realmIdx++;
          gameState.exp = 0;
          gameState.spiritualSense += 5; // Tăng thần thức mỗi cấp
          this.playerHp = this.calcPlayerMaxHp();
          this.showFloatingText(280, 140, `🎉 ĐỘT PHÁ: ${REALMS[gameState.realmIdx].name}!`, '#ffff44', '20px');
        }
      }
    }
    this.updateHUD();
  }

  showFloatingText(x, y, text, color = '#ffffff', fontSize = '13px') {
    const txt = this.add.text(x, y, text, {
      fontSize: fontSize,
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: color,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(180);

    this.tweens.add({
      targets: txt,
      y: y - 45,
      alpha: 0,
      duration: 1100,
      ease: 'Cubic.easeOut',
      onComplete: () => txt.destroy()
    });
  }

  // ==============================================================
  // 🏛️ 1. MODAL TÔNG MÔN (8 ĐẠI PHÁI, BÁI SƯ, BỔNG LỘC, THĂNG CHỨC)
  // ==============================================================
  openSectPanel() {
    this.closeModal();

    const overlay = this.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.8)
      .setInteractive();

    const panel = this.add.container(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

    const bg = this.add.rectangle(0, 0, 780, 450, 0x0a1220, 0.98)
      .setStrokeStyle(2, 0x2a5078);

    const title = this.add.text(0, -200, '🏛️ HỆ THỐNG 8 ĐẠI TÔNG MÔN TU CHÂN GIỚI', {
      fontSize: '16px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#ffd700'
    }).setOrigin(0.5);

    const closeBtn = this.add.image(360, -200, 'ui_close')
      .setDisplaySize(26, 26)
      .setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeModal());

    // Nếu đã gia nhập môn phái
    if (gameState.sectId) {
      const sect = SECTS.find(s => s.id === gameState.sectId);
      const rank = SECT_RANKS[gameState.sectRankIdx];
      const nextRank = SECT_RANKS[gameState.sectRankIdx + 1];

      const sectIcon = this.add.image(-220, -110, sect.icon).setDisplaySize(64, 64);

      const sectName = this.add.text(-170, -130, `${sect.name} (${sect.title})`, {
        fontSize: '16px',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        color: '#66ffcc'
      });

      const sectInfo = this.add.text(-170, -105, 
        `Đẳng Cấp Chức Vị: ${rank.name}\n` +
        `Điểm Cống Hiến Môn Phái: ${gameState.sectContrib} Điểm\n` +
        `Trấn Phái Gia Trì: ${sect.buffDesc}`, {
        fontSize: '11px',
        fontFamily: 'sans-serif',
        color: '#cceeff',
        lineSpacing: 5
      });

      // Nhận Bổng Lộc Hằng Ngày
      const salaryBox = this.add.rectangle(180, -100, 320, 110, 0x111e33, 0.9)
        .setStrokeStyle(1.5, 0x336699);

      const salaryTitle = this.add.text(180, -135, '🎁 Bổng Lộc Môn Phái', {
        fontSize: '13px',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        color: '#ffaa44'
      }).setOrigin(0.5);

      const salaryDesc = this.add.text(180, -105, `Nhận mỗi chu kỳ: +${rank.salaryGold} L.Thạch, +${rank.salaryHerb} Thảo, +${rank.salaryOre} Khoáng`, {
        fontSize: '10px',
        fontFamily: 'sans-serif',
        color: '#99bbdd'
      }).setOrigin(0.5);

      const claimBtn = this.add.rectangle(180, -70, 160, 30, 0x1b4d3e)
        .setStrokeStyle(1.5, 0x33cc88)
        .setInteractive({ useHandCursor: true });
      const claimTxt = this.add.text(180, -70, 'Lãnh Bổng Lộc', { fontSize: '11px', fontStyle: 'bold', color: '#fff' }).setOrigin(0.5);

      claimBtn.on('pointerdown', () => {
        gameState.gold += rank.salaryGold;
        gameState.herbs += rank.salaryHerb;
        gameState.ores += rank.salaryOre;
        this.updateHUD();
        this.showFloatingText(CANVAS_WIDTH / 2, 120, `🎁 Nhận bổng lộc: +${rank.salaryGold} L.Thạch, +${rank.salaryHerb} Thảo, +${rank.salaryOre} Khoáng!`, '#66ffcc');
      });

      // Thăng Chức Môn Phái
      const canPromote = (nextRank && gameState.sectContrib >= nextRank.reqContrib);
      const promoteBtn = this.add.rectangle(0, 5, 340, 36, canPromote ? 0x884400 : 0x223344)
        .setStrokeStyle(1.5, canPromote ? 0xffaa00 : 0x445566)
        .setInteractive({ useHandCursor: canPromote });

      const promoteTxt = this.add.text(0, 5, nextRank ? `Thăng Chức [${nextRank.name}] (Cần ${nextRank.reqContrib} Cống Hiến)` : 'ĐÃ ĐẠT CHỨC VỊ CAO NHẤT', {
        fontSize: '11px',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        color: canPromote ? '#ffffff' : '#8899aa'
      }).setOrigin(0.5);

      promoteBtn.on('pointerdown', () => {
        if (canPromote) {
          gameState.sectRankIdx++;
          this.updateHUD();
          this.openSectPanel();
          this.showFloatingText(CANVAS_WIDTH / 2, 120, `🎉 Chúc mừng thăng tiến: ${nextRank.name}!`, '#ffd700');
        }
      });

      // Nút Rời Môn Phái
      const leaveBtn = this.add.rectangle(0, 180, 160, 28, 0x551111)
        .setStrokeStyle(1, 0xaa3333)
        .setInteractive({ useHandCursor: true });
      const leaveTxt = this.add.text(0, 180, 'Rời Khỏi Môn Phái', { fontSize: '10px', fontStyle: 'bold', color: '#ffaaaa' }).setOrigin(0.5);
      leaveBtn.on('pointerdown', () => {
        gameState.sectId = null;
        gameState.sectRankIdx = 0;
        gameState.sectContrib = 0;
        this.updateHUD();
        this.openSectPanel();
      });

      panel.add([sectIcon, sectName, sectInfo, salaryBox, salaryTitle, salaryDesc, claimBtn, claimTxt, promoteBtn, promoteTxt, leaveBtn, leaveTxt]);
    } else {
      // Danh sách 8 Tông Môn để Bái Sư
      SECTS.forEach((st, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const sx = -190 + col * 380;
        const sy = -120 + row * 82;

        const cardBg = this.add.rectangle(sx, sy, 360, 72, 0x122035)
          .setStrokeStyle(1.5, 0x2a5078);

        const icon = this.add.image(sx - 145, sy, st.icon).setDisplaySize(40, 40);

        const sTitle = this.add.text(sx - 115, sy - 24, `${st.name} [Hệ ${st.elem}]`, {
          fontSize: '12px',
          fontFamily: 'sans-serif',
          fontStyle: 'bold',
          color: '#ffd700'
        });

        const sBuff = this.add.text(sx - 115, sy - 8, st.buffDesc, {
          fontSize: '10px',
          fontFamily: 'sans-serif',
          color: '#66ffcc'
        });

        const sDesc = this.add.text(sx - 115, sy + 8, st.desc, {
          fontSize: '9px',
          fontFamily: 'sans-serif',
          color: '#99bbdd',
          wordWrap: { width: 210 }
        });

        const joinBtn = this.add.rectangle(sx + 130, sy, 68, 30, 0x1b4d3e)
          .setStrokeStyle(1.5, 0x33cc88)
          .setInteractive({ useHandCursor: true });
        const joinTxt = this.add.text(sx + 130, sy, 'Bái Sư', { fontSize: '11px', fontStyle: 'bold', color: '#fff' }).setOrigin(0.5);

        joinBtn.on('pointerdown', () => {
          gameState.sectId = st.id;
          gameState.sectRankIdx = 0;
          gameState.sectContrib = 50;
          this.updateHUD();
          this.openSectPanel();
          this.showFloatingText(CANVAS_WIDTH / 2, 120, `🏮 Bái nhập ${st.name} thành công!`, '#ffd700');
        });

        panel.add([cardBg, icon, sTitle, sBuff, sDesc, joinBtn, joinTxt]);
      });
    }

    panel.add([bg, title, closeBtn]);
    this.modalLayer.add([overlay, panel]);
  }

  // ==============================================================
  // 🧘 2. MODAL THÔNG TIN TU SĨ & CẢNH GIỚI (BẢNG CHỈ SỐ TU TIÊN)
  // ==============================================================
  openCharacterPanel() {
    this.closeModal();

    const overlay = this.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.8)
      .setInteractive();

    const panel = this.add.container(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

    const bg = this.add.rectangle(0, 0, 720, 440, 0x0a1220, 0.98)
      .setStrokeStyle(2, 0x2a5078);

    const title = this.add.text(0, -190, '🧘 BẢNG THÔNG TIN TU SĨ & THUỘC TÍNH TU TIÊN', {
      fontSize: '16px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#ffd700'
    }).setOrigin(0.5);

    const closeBtn = this.add.image(330, -190, 'ui_close')
      .setDisplaySize(26, 26)
      .setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeModal());

    const currentRealm = REALMS[gameState.realmIdx];
    const sect = gameState.sectId ? SECTS.find(s => s.id === gameState.sectId) : null;

    // Left Column: Avatar & Cảnh Giới
    const avatar = this.add.image(-220, -90, 'player_avatar').setDisplaySize(80, 80);
    const realmName = this.add.text(-220, -35, `${currentRealm.major} Kỳ • ${currentRealm.tier}`, {
      fontSize: '16px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#66ccff'
    }).setOrigin(0.5);

    const sectTag = this.add.text(-220, -12, sect ? `🏛️ ${sect.name} [${SECT_RANKS[gameState.sectRankIdx].name}]` : '🏛️ Tán Tu Tự Do', {
      fontSize: '11px',
      fontFamily: 'sans-serif',
      color: '#ffd700'
    }).setOrigin(0.5);

    // Right Column: Chi Tiết Chỉ Số Tu Chân
    const critRate = 15 + (gameState.spiritualSense * 0.5);
    const statsText = this.add.text(80, -60,
      `❤️ Khí Huyết (HP): ${this.calcPlayerMaxHp()}\n` +
      `🌀 Linh Lực / Chân Nguyên: ${gameState.mana} / ${gameState.manaMax}\n` +
      `⚔️ Kiếm Kình / Công Kích: ${this.calcPlayerDmg()}\n` +
      `🛡️ Hộ Thể Chân Khí (Giáp): ${this.calcPlayerDef()}\n` +
      `👁️ Thần Thức Cảm Ứng: ${gameState.spiritualSense} Điểm (+${critRate.toFixed(1)}% Bạo Kích)\n` +
      `🌱 Linh Căn Bản Mệnh: ${gameState.aptitude}\n` +
      `✨ Tu Vi Tích Lũy: ${gameState.exp} / ${currentRealm.expReq}`, {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      color: '#d4e6ff',
      lineSpacing: 8
    }).setOrigin(0.5);

    // Đột Phá Bình Cảnh Button
    let btnText = 'TỰ ĐỘNG HẤP THU LINH KHÍ';
    let canBreak = false;
    let requiredPill = null;

    if (gameState.exp >= currentRealm.expReq) {
      if (currentRealm.bottleneck) {
        requiredPill = currentRealm.pillNeeded;
        btnText = `CẮN [${requiredPill}] ĐỂ ĐỘT PHÁ`;
        canBreak = (gameState.inventory.pills[requiredPill] > 0);
      } else {
        btnText = 'LẬP TỨC ĐỘT PHÁ';
        canBreak = true;
      }
    }

    const breakBtn = this.add.rectangle(0, 135, 380, 44, canBreak ? 0x226633 : 0x223344)
      .setStrokeStyle(1.5, canBreak ? 0x44ff88 : 0x556677)
      .setInteractive({ useHandCursor: canBreak });

    const breakBtnTxt = this.add.text(0, 135, btnText, {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: canBreak ? '#ffffff' : '#8899aa'
    }).setOrigin(0.5);

    breakBtn.on('pointerdown', () => {
      if (!canBreak) {
        if (requiredPill && !gameState.inventory.pills[requiredPill]) {
          this.showFloatingText(CANVAS_WIDTH / 2, 120, `Cần luyện chế [${requiredPill}] tại mục Bách Nghệ!`, '#ff5555');
        }
        return;
      }

      if (requiredPill) {
        gameState.inventory.pills[requiredPill]--;
      }

      if (gameState.realmIdx < REALMS.length - 1) {
        gameState.realmIdx++;
        gameState.exp = 0;
        gameState.spiritualSense += 8;
        this.playerHp = this.calcPlayerMaxHp();
        this.updateHUD();
        this.openCharacterPanel();
        this.showFloatingText(CANVAS_WIDTH / 2, 100, `🎉 ĐỘT PHÁ THÀNH CÔNG: ${REALMS[gameState.realmIdx].name}!`, '#ffd700', '20px');
      }
    });

    panel.add([bg, title, closeBtn, avatar, realmName, sectTag, statsText, breakBtn, breakBtnTxt]);
    this.modalLayer.add([overlay, panel]);
  }

  // ==============================================================
  // 🗺️ 3. MODAL ĐẠI BẢN ĐỒ NHÂN GIỚI (5 ĐẠI VỰC & CÁC BÍ CẢNH)
  // ==============================================================
  openMapPanel(activeRegionId = 'nam_lang') {
    this.closeModal();

    const overlay = this.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.8)
      .setInteractive();

    const panel = this.add.container(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

    const bg = this.add.rectangle(0, 0, 780, 450, 0x0a1220, 0.98)
      .setStrokeStyle(2, 0x2a5078);

    const title = this.add.text(0, -200, '🗺️ ĐẠI BẢN ĐỒ NHÂN GIỚI - 5 ĐẠI VỰC TU CHÂN KỲ VĨ', {
      fontSize: '16px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#ffd700'
    }).setOrigin(0.5);

    const closeBtn = this.add.image(360, -200, 'ui_close')
      .setDisplaySize(26, 26)
      .setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeModal());

    // 5 Region Tabs
    WORLD_REGIONS.forEach((reg, idx) => {
      const rx = -310 + idx * 155;
      const isAct = (reg.id === activeRegionId);

      const regBg = this.add.rectangle(rx, -160, 145, 30, isAct ? 0x224870 : 0x111e30)
        .setStrokeStyle(1.5, isAct ? 0x66ccff : 0x2d4466)
        .setInteractive({ useHandCursor: true });

      const regTxt = this.add.text(rx, -160, reg.name, {
        fontSize: '11px',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        color: isAct ? '#ffffff' : '#88aacc'
      }).setOrigin(0.5);

      regBg.on('pointerdown', () => this.openMapPanel(reg.id));
      panel.add([regBg, regTxt]);
    });

    const activeReg = WORLD_REGIONS.find(r => r.id === activeRegionId);

    // Render Stages of the active Region
    activeReg.stages.forEach((stg, idx) => {
      const sx = -220 + idx * 220;
      const sy = -20;

      const isCurrent = (stg.id === gameState.currentStageId);
      const isUnlocked = (gameState.realmIdx >= stg.minRealm);

      const cardBg = this.add.rectangle(sx, sy, 200, 180, isCurrent ? 0x1d3855 : 0x111c2b)
        .setStrokeStyle(1.5, isCurrent ? 0x44ff88 : (isUnlocked ? 0x336699 : 0x333333))
        .setInteractive({ useHandCursor: isUnlocked });

      const icon = this.add.image(sx, sy - 40, stg.icon).setDisplaySize(56, 56);
      if (!isUnlocked) icon.setTint(0x555555);

      const sName = this.add.text(sx, sy + 5, stg.name, {
        fontSize: '12px',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        color: isUnlocked ? '#ffd700' : '#778899'
      }).setOrigin(0.5);

      const sSub = this.add.text(sx, sy + 25, stg.sub, {
        fontSize: '10px',
        fontFamily: 'sans-serif',
        color: '#99bbdd'
      }).setOrigin(0.5);

      const statusTxt = this.add.text(sx, sy + 60, isCurrent ? '📍 ĐANG Ở ĐÂY' : (isUnlocked ? 'TIẾN VÀO BÍ CẢNH' : `Yêu cầu: ${REALMS[stg.minRealm].name}`), {
        fontSize: '10px',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        color: isCurrent ? '#44ff88' : (isUnlocked ? '#66ccff' : '#ff6666')
      }).setOrigin(0.5);

      cardBg.on('pointerdown', () => {
        if (!isUnlocked) {
          this.showFloatingText(CANVAS_WIDTH / 2, 120, `Cảnh giới chưa đủ để vào ${stg.name}!`, '#ff5555');
          return;
        }
        gameState.currentStageId = stg.id;
        this.updateHUD();
        this.closeModal();
        this.enemies.forEach(e => {
          e.sprite.destroy();
          e.hpBg.destroy();
          e.hpBar.destroy();
          e.nameText.destroy();
        });
        this.enemies = [];
        this.spawnEnemies();
        this.showFloatingText(CANVAS_WIDTH / 2, 120, `🚀 Đã tiến vào: ${stg.name}!`, '#66ffcc');
      });

      panel.add([cardBg, icon, sName, sSub, statusTxt]);
    });

    panel.add([bg, title, closeBtn]);
    this.modalLayer.add([overlay, panel]);
  }

  // ==============================================================
  // 📜 MODAL TÀNG KINH CÁC
  // ==============================================================
  openSkillPanel(activeElem = 'Kim') {
    this.closeModal();

    const overlay = this.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.8)
      .setInteractive();

    const panel = this.add.container(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

    const bg = this.add.rectangle(0, 0, 780, 450, 0x0a1220, 0.98)
      .setStrokeStyle(2, 0x2a5078);

    const title = this.add.text(0, -200, '📜 TÀNG KINH CÁC: 8 ĐẠI HỆ NGUYÊN TỐ & 40 THẦN THÔNG', {
      fontSize: '16px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#ffd700'
    }).setOrigin(0.5);

    const closeBtn = this.add.image(360, -200, 'ui_close')
      .setDisplaySize(26, 26)
      .setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeModal());

    const elements = ['Kim', 'Hỏa', 'Thủy', 'Thổ', 'Mộc', 'Phong', 'Lôi', 'Vật Lý'];
    elements.forEach((elem, idx) => {
      const ex = -315 + idx * 90;
      const isAct = (elem === activeElem);

      const elemBg = this.add.rectangle(ex, -160, 84, 30, isAct ? 0x224870 : 0x111e30)
        .setStrokeStyle(1.5, isAct ? 0x66ccff : 0x2d4466)
        .setInteractive({ useHandCursor: true });

      const elemTxt = this.add.text(ex, -160, elem, {
        fontSize: '12px',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        color: isAct ? '#ffffff' : '#88aacc'
      }).setOrigin(0.5);

      elemBg.on('pointerdown', () => this.openSkillPanel(elem));
      panel.add([elemBg, elemTxt]);
    });

    const skillsOfElem = ELEMENTAL_SKILLS.filter(s => s.elem === activeElem);

    skillsOfElem.forEach((skill, idx) => {
      const sy = -105 + idx * 62;
      const isUnlocked = (gameState.realmIdx >= skill.minRealm);
      const isEquipped = gameState.equippedSkillIds.includes(skill.id);

      const cardBg = this.add.rectangle(0, sy, 730, 54, isEquipped ? 0x182c44 : 0x111c2a)
        .setStrokeStyle(1.5, isEquipped ? 0x44ff88 : (isUnlocked ? 0x336699 : 0x333333));

      const icon = this.add.image(-320, sy, skill.icon).setDisplaySize(42, 42);
      if (!isUnlocked) icon.setTint(0x555555);

      const sStage = this.add.text(-280, sy - 14, `[${skill.stage}]`, {
        fontSize: '11px',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        color: '#ffaa00'
      });

      const sName = this.add.text(-190, sy - 14, skill.name, {
        fontSize: '13px',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        color: isUnlocked ? '#ffffff' : '#778899'
      });

      const sDesc = this.add.text(-280, sy + 6, `${skill.desc} (Hồi: ${skill.cd / 1000}s, x${skill.dmgMul} Sát Thương${skill.isAoE ? ' AoE' : ''})`, {
        fontSize: '10px',
        fontFamily: 'sans-serif',
        color: '#88bbdd'
      });

      if (isUnlocked) {
        const btnBg = this.add.rectangle(300, sy, 76, 30, isEquipped ? 0x335533 : 0x1a3a5a)
          .setStrokeStyle(1, isEquipped ? 0x55aa55 : 0x3377bb)
          .setInteractive({ useHandCursor: true });
        const btnTxt = this.add.text(300, sy, isEquipped ? 'Gỡ' : 'Lắp', {
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#fff'
        }).setOrigin(0.5);

        btnBg.on('pointerdown', () => {
          if (isEquipped) {
            gameState.equippedSkillIds = gameState.equippedSkillIds.filter(id => id !== skill.id);
          } else {
            if (gameState.equippedSkillIds.length < 4) {
              gameState.equippedSkillIds.push(skill.id);
            } else {
              this.showFloatingText(CANVAS_WIDTH / 2, 120, 'Tối đa gắn 4 Thần Thông!', '#ff5555');
              return;
            }
          }
          this.createSkillBar();
          this.openSkillPanel(activeElem);
        });

        panel.add([btnBg, btnTxt]);
      } else {
        const reqTxt = this.add.text(300, sy, `Yêu cầu: ${skill.stage}`, {
          fontSize: '10px',
          fontFamily: 'sans-serif',
          color: '#ff6666'
        }).setOrigin(0.5);
        panel.add(reqTxt);
      }

      panel.add([cardBg, icon, sStage, sName, sDesc]);
    });

    panel.add([bg, title, closeBtn]);
    this.modalLayer.add([overlay, panel]);
  }

  // ==============================================================
  // 💊 MODAL BÁCH NGHỆ
  // ==============================================================
  openCraftingPanel(currentTab = 'pills') {
    this.closeModal();

    const overlay = this.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.8)
      .setInteractive();

    const panel = this.add.container(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

    const bg = this.add.rectangle(0, 0, 780, 450, 0x0a1220, 0.98)
      .setStrokeStyle(2, 0x2a5078);

    const title = this.add.text(0, -200, '🏮 BÁCH NGHỆ TU TIÊN: ĐAN DƯỢC • PHÙ LỤC • TRẬN PHÁP', {
      fontSize: '16px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#ffd700'
    }).setOrigin(0.5);

    const closeBtn = this.add.image(360, -200, 'ui_close')
      .setDisplaySize(26, 26)
      .setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeModal());

    const tabs = [
      { key: 'pills', label: '💊 ĐAN DƯỢC (1~5 Phẩm)' },
      { key: 'talismans', label: '📜 PHÙ LỤC (1~5 Phẩm)' },
      { key: 'formations', label: '🌌 TRẬN PHÁP (1~5 Phẩm)' }
    ];

    tabs.forEach((tb, idx) => {
      const tx = -240 + idx * 240;
      const isAct = (tb.key === currentTab);

      const tabBg = this.add.rectangle(tx, -165, 220, 32, isAct ? 0x224870 : 0x111e30)
        .setStrokeStyle(1.5, isAct ? 0x66ccff : 0x2d4466)
        .setInteractive({ useHandCursor: true });

      const tabTxt = this.add.text(tx, -165, tb.label, {
        fontSize: '12px',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        color: isAct ? '#ffffff' : '#88aacc'
      }).setOrigin(0.5);

      tabBg.on('pointerdown', () => this.openCraftingPanel(tb.key));
      panel.add([tabBg, tabTxt]);
    });

    const recipeList = CRAFTING_SYSTEM[currentTab] || [];

    recipeList.slice(0, 5).forEach((item, idx) => {
      const iy = -105 + idx * 58;

      const itemBox = this.add.rectangle(0, iy, 740, 50, 0x122035)
        .setStrokeStyle(1.5, item.grade === 'Cực Phẩm' ? 0xffaa00 : (item.grade === 'Thượng Phẩm' ? 0xcc44cc : (item.grade === 'Trung Phẩm' ? 0x3399ff : 0x44aa44)));

      const gradeColor = (item.grade === 'Cực Phẩm') ? '#ffaa00' : (item.grade === 'Thượng Phẩm' ? '#ff77ff' : (item.grade === 'Trung Phẩm' ? '#66ccff' : '#66ff66'));
      const gradeBadge = this.add.text(-350, iy - 14, `[${item.rank} • ${item.grade}]`, {
        fontSize: '11px',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        color: gradeColor
      });

      const iName = this.add.text(-220, iy - 14, item.name, {
        fontSize: '12px',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        color: '#ffffff'
      });

      const iDesc = this.add.text(-350, iy + 6, `${item.desc} | Chi phí: ${item.costHerbs} Thảo, ${item.costOres || 0} Khoáng, ${item.costGold} L.Thạch`, {
        fontSize: '10px',
        fontFamily: 'sans-serif',
        color: '#88bbdd'
      });

      const canCraft = (gameState.herbs >= item.costHerbs && gameState.ores >= (item.costOres || 0) && gameState.gold >= item.costGold);
      const actionBtn = this.add.rectangle(310, iy, 90, 32, canCraft ? 0x884400 : 0x223344)
        .setStrokeStyle(1.5, canCraft ? 0xffaa00 : 0x445566)
        .setInteractive({ useHandCursor: canCraft });

      const btnLabel = currentTab === 'formations' ? (gameState.inventory.formations.includes(item.name) ? 'Đã Có' : 'Bố Trí') : 'Luyện Chế';
      const actionTxt = this.add.text(310, iy, btnLabel, {
        fontSize: '11px',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        color: canCraft ? '#ffffff' : '#778899'
      }).setOrigin(0.5);

      actionBtn.on('pointerdown', () => {
        if (!canCraft) {
          this.showFloatingText(CANVAS_WIDTH / 2, 120, 'Không đủ nguyên liệu hoặc Linh Thạch!', '#ff5555');
          return;
        }

        gameState.herbs -= item.costHerbs;
        gameState.ores -= (item.costOres || 0);
        gameState.gold -= item.costGold;

        if (currentTab === 'pills') {
          gameState.inventory.pills[item.name] = (gameState.inventory.pills[item.name] || 0) + 1;
          this.showFloatingText(CANVAS_WIDTH / 2, 120, `🔥 Luyện thành công 1 viên [${item.name}]!`, '#ffd700');
        } else if (currentTab === 'talismans') {
          gameState.inventory.talismans[item.name] = (gameState.inventory.talismans[item.name] || 0) + 1;
          this.showFloatingText(CANVAS_WIDTH / 2, 120, `📜 Vẽ thành công 1 tấm [${item.name}]!`, '#66ffcc');
        } else if (currentTab === 'formations') {
          if (!gameState.inventory.formations.includes(item.name)) {
            gameState.inventory.formations.push(item.name);
          }
          this.showFloatingText(CANVAS_WIDTH / 2, 120, `🌌 Bố trí thành công [${item.name}]!`, '#ffd700');
        }

        this.updateHUD();
        this.openCraftingPanel(currentTab);
      });

      panel.add([itemBox, gradeBadge, iName, iDesc, actionBtn, actionTxt]);
    });

    panel.add([bg, title, closeBtn]);
    this.modalLayer.add([overlay, panel]);
  }

  // ==============================================================
  // 🎒 MODAL HÀNH TRANG
  // ==============================================================
  openGearPanel() {
    this.closeModal();

    const overlay = this.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.8)
      .setInteractive();

    const panel = this.add.container(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

    const bg = this.add.rectangle(0, 0, 720, 420, 0x0a1220, 0.98)
      .setStrokeStyle(2, 0x2a5078);

    const title = this.add.text(0, -180, '🎒 HÀNH TRANG & TÔI LUYỆN PHÁP BẢO', {
      fontSize: '17px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#ffd700'
    }).setOrigin(0.5);

    const closeBtn = this.add.image(330, -180, 'ui_close')
      .setDisplaySize(26, 26)
      .setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeModal());

    INITIAL_ITEMS.slice(0, 6).forEach((item, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const ix = -225 + col * 110;
      const iy = -80 + row * 80;

      const slotBg = this.add.rectangle(ix, iy, 76, 64, 0x16263e)
        .setStrokeStyle(1, 0x335577);
      const icon = this.add.image(ix, iy - 8, item.icon).setDisplaySize(38, 38);
      const lbl = this.add.text(ix, iy + 18, `+${gameState.gearPlus}`, {
        fontSize: '11px',
        fontFamily: 'sans-serif',
        fontStyle: 'bold',
        color: '#ffcc00'
      }).setOrigin(0.5);

      panel.add([slotBg, icon, lbl]);
    });

    const forgeBox = this.add.rectangle(170, 0, 310, 310, 0x111e33, 0.9)
      .setStrokeStyle(1.5, 0x336699);

    const forgeTitle = this.add.text(170, -135, '🔨 Luyện Khí Các (Tôi Luyện)', {
      fontSize: '14px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#ff9944'
    }).setOrigin(0.5);

    const forgeDesc = this.add.text(170, -30,
      `Cấp Tôi Luyện: +${gameState.gearPlus}\n` +
      `Khoáng Thạch: ${gameState.ores} viên\n` +
      `Chi phí: 3 Khoáng Thạch + 50 L.Thạch\n\n` +
      `Hiệu quả mỗi cấp:\n` +
      `⚔️ +25 Công Kích\n` +
      `❤️ +150 Sinh Mệnh\n` +
      `🛡️ +10 Phòng Ngự`, {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      align: 'center',
      color: '#cceeff',
      lineSpacing: 5
    }).setOrigin(0.5);

    const forgeBtn = this.add.rectangle(170, 95, 230, 38, 0x884400)
      .setStrokeStyle(1.5, 0xffaa00)
      .setInteractive({ useHandCursor: true });
    const forgeBtnTxt = this.add.text(170, 95, '🔨 Tôi Luyện Pháp Bảo (+1)', {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    forgeBtn.on('pointerdown', () => {
      if (gameState.ores >= 3 && gameState.gold >= 50) {
        gameState.ores -= 3;
        gameState.gold -= 50;
        gameState.gearPlus += 1;
        this.updateHUD();
        this.openGearPanel();
        this.showFloatingText(CANVAS_WIDTH / 2, 120, `✨ Tôi Luyện Thành Công: Pháp Bảo +${gameState.gearPlus}!`, '#ffd700');
      } else {
        this.showFloatingText(CANVAS_WIDTH / 2, 120, 'Không đủ Khoáng Thạch hoặc Linh Thạch!', '#ff5555');
      }
    });

    panel.add([bg, title, closeBtn, forgeBox, forgeTitle, forgeDesc, forgeBtn, forgeBtnTxt]);
    this.modalLayer.add([overlay, panel]);
  }

  closeModal() {
    this.modalLayer.removeAll(true);
  }
}
"""
with open('H:/GOOGLE DRIVER/GAME/src/scenes/MainScene.js', 'w', encoding='utf-8') as f:
    f.write(mainSceneCode)

print("Saved Enhanced Xianxia World with Sects, Regions, and Stats successfully!")
