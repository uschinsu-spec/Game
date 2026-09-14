(function(global) {
  'use strict';

  // Vietnamese Display Names & Archetypes
  const VI_NAMES = {
    'big_alien': 'Dị Nhân Hư Không',
    'big_birb': 'Kim Sí Yêu Điểu',
    'big_bluedemon': 'Thanh Ma Quỷ Vương',
    'big_bunny': 'Yêu Thỏ Cuồng Nộ',
    'big_cactoro': 'Tiên Nhân Thạch Quái',
    'big_demon': 'Hắc Dạ Ma Tôn',
    'big_dino': 'Viễn Cổ Cự Long',
    'big_fish': 'Hải Quái Ba Thao',
    'big_frog': 'Cóc Vàng Vạn Độc',
    'big_monkroose': 'Linh Miêu Quái',
    'big_mushroomking': 'Nấm Vương Thần Mộc',
    'big_ninja': 'Ám Dạ Nhẫn Giả',
    'big_orc': 'Thú Tộc Chiến Thần',
    'big_orc_skull': 'Khô Lâu Thú Vương',
    'big_tribal': 'Thổ Trứ Ma Tộc',
    'big_yeti': 'Băng Nguyên Tuyết Quái',
    
    'blob_alien': 'Ấu Thể Dị Nhân',
    'blob_birb': 'Tiểu Điểu Yêu',
    'blob_cactoro': 'Tiểu Xương Rồng',
    'blob_cat': 'Linh Miêu Quậy',
    'blob_chicken': 'Gà Yêu Tinh Nghịch',
    'blob_dog': 'Khuyển Yêu Trung Thành',
    'blob_fish': 'Cá Con Tinh Nghịch',
    'blob_greenblob': 'Thạch Lựu Lục Thể',
    'blob_greenspikyblob': 'Gai Quái Lục Bảo',
    'blob_mushnub': 'Nấm Độc Nhỏ',
    'blob_mushnub_evolved': 'Nấm Độc Biến Dị',
    'blob_ninja': 'Tiểu Nhẫn Giả',
    'blob_orc': 'Ấu Thú Tộc',
    'blob_pigeon': 'Bồ Câu Ma Thuật',
    'blob_pinkblob': 'Thạch Lựu Hồng Phấn',
    'blob_wizard': 'Tiểu Pháp Sư Tinh Linh',
    'blob_yeti': 'Ấu Băng Quái',

    'flying_alpaking': 'Thiên Dực Lạc Đà',
    'flying_alpaking_evolved': 'Thần Dực Lạc Đà',
    'flying_armabee': 'Phi Thiên Ong Độc',
    'flying_armabee_evolved': 'Ma Ong Chúa Hoàng',
    'flying_demon': 'Ác Ma Dạ Xoa',
    'flying_dragon': 'Thanh Lôi Hỏa Long',
    'flying_dragon_evolved': 'Thái Cổ Cự Long',
    'flying_ghost': 'U Linh Phiêu Đãng',
    'flying_ghost_skull': 'Bạch Cốt Oan Hồn',
    'flying_glub': 'Tiểu Tinh Cầu Bay',
    'flying_glub_evolved': 'Tinh Cầu Cực Quang',
    'flying_goleling': 'Bạch Thạch Dực Quái',
    'flying_goleling_evolved': 'Thần Thạch Cự Dực',
    'flying_hywirl': 'Cuồng Phong Quỷ Điểu',
    'flying_pigeon': 'Linh Điểu Thiên Không',
    'flying_squidle': 'Mực Ma Không Gian',
    'flying_tribal': 'Tù Trưởng Phi Hành'
  };

  // ─── Collider defaults by category ────────────────────────────────────────
  // These are applied via Object.assign at registry-build time.
  // Individual entries may override any field.
  const COLLIDER_DEFAULTS = {
    big:    { groundOffset: 0.0,  height: 2.0, radius: 0.45, colliderHeight: 1.8, colliderRadius: 0.4 },
    blob:   { groundOffset: 0.0,  height: 1.0, radius: 0.35, colliderHeight: 0.8, colliderRadius: 0.32 },
    flying: { groundOffset: 2.5,  height: 1.5, radius: 0.5,  colliderHeight: 1.2, colliderRadius: 0.45 }
  };

  // ─── Combat timing defaults by category ───────────────────────────────────
  // All times are NORMALIZED (0.0 = animation start, 1.0 = animation end).
  //
  //  attackRange    - distance at which enemy enters attack state (metres)
  //  attackWindup   - normalised time before enemy can cancel into another anim
  //  hitTime        - normalised time when damage is actually applied (hit frame)
  //  recoveryTime   - normalised time when movement/AI resumes after attack
  //  footstepTimes  - array of normalised times that fire 'onFootstep' events
  //
  // Example: 1-second animation, hitTime 0.42 → damage fires 420ms into clip.
  const COMBAT_DEFAULTS = {
    big: {
      attackRange:   3.0,
      attackWindup:  0.15,   // 15% in = enemy committed
      hitTime:       0.42,   // 42% = mid-swing impact
      recoveryTime:  0.75,   // 75% = can act again
      footstepTimes: [0.25, 0.70]
    },
    blob: {
      attackRange:   2.0,
      attackWindup:  0.10,
      hitTime:       0.38,
      recoveryTime:  0.65,
      footstepTimes: [0.30, 0.75]
    },
    flying: {
      attackRange:   4.0,
      attackWindup:  0.20,
      hitTime:       0.50,   // breathing/shoot = mid-clip
      recoveryTime:  0.80,
      footstepTimes: []      // flying enemies have no footsteps
    }
  };

  const ENEMIES = {
    // === BIG CATEGORY (16 models) ===
    'big_alien': {
      id: 'big_alien', name: 'Dị Nhân Hư Không', codeName: 'Alien', cat: 'big', icon: '👾',
      modelPath: './assets/enemies/big/alien.glb', hp: 1200, damage: 95, speed: 2.2, scale: 1.0,
      anims: ['Death', 'Duck', 'HitReact', 'Idle', 'Jump', 'Jump_Idle', 'Jump_Land', 'Punch', 'Run', 'Walk', 'Wave', 'Weapon'],
      groundOffset: 0.0, height: 2.1, radius: 0.42, colliderHeight: 1.9, colliderRadius: 0.38
    },
    'big_birb': {
      id: 'big_birb', name: 'Kim Sí Yêu Điểu', codeName: 'Birb', cat: 'big', icon: '🦅',
      modelPath: './assets/enemies/big/birb.glb', hp: 1050, damage: 85, speed: 2.5, scale: 1.0,
      anims: ['Death', 'Duck', 'HitReact', 'Idle', 'Jump', 'Punch', 'Run', 'Walk', 'Weapon'],
      groundOffset: 0.0, height: 2.0, radius: 0.4, colliderHeight: 1.8, colliderRadius: 0.36
    },
    'big_bluedemon': {
      id: 'big_bluedemon', name: 'Thanh Ma Quỷ Vương', codeName: 'BlueDemon', cat: 'big', icon: '👿',
      modelPath: './assets/enemies/big/bluedemon.glb', hp: 1500, damage: 120, speed: 2.1, scale: 1.05,
      anims: ['Death', 'Duck', 'HitReact', 'Idle', 'Jump', 'Punch', 'Run', 'Walk', 'Weapon'],
      groundOffset: 0.0, height: 2.2, radius: 0.46, colliderHeight: 2.0, colliderRadius: 0.42
    },
    'big_bunny': {
      id: 'big_bunny', name: 'Yêu Thỏ Cuồng Nộ', codeName: 'Bunny', cat: 'big', icon: '🐰',
      modelPath: './assets/enemies/big/bunny.glb', hp: 950, damage: 75, speed: 3.2, scale: 0.95,
      anims: ['Death', 'Duck', 'HitReact', 'Idle', 'Jump', 'Punch', 'Run', 'Walk', 'Weapon'],
      groundOffset: 0.0, height: 1.9, radius: 0.38, colliderHeight: 1.7, colliderRadius: 0.34
    },
    'big_cactoro': {
      id: 'big_cactoro', name: 'Tiên Nhân Thạch Quái', codeName: 'Cactoro', cat: 'big', icon: '🌵',
      modelPath: './assets/enemies/big/cactoro.glb', hp: 1400, damage: 90, speed: 2.0, scale: 1.0,
      anims: ['Death', 'Duck', 'HitReact', 'Idle', 'Jump', 'Punch', 'Run', 'Walk', 'Weapon'],
      groundOffset: 0.0, height: 2.3, radius: 0.44, colliderHeight: 2.1, colliderRadius: 0.4
    },
    'big_demon': {
      id: 'big_demon', name: 'Hắc Dạ Ma Tôn', codeName: 'Demon', cat: 'big', icon: '👹',
      modelPath: './assets/enemies/big/demon.glb', hp: 1600, damage: 130, speed: 2.2, scale: 1.1,
      anims: ['Death', 'Duck', 'HitReact', 'Idle', 'Jump', 'Punch', 'Run', 'Walk', 'Weapon'],
      groundOffset: 0.0, height: 2.4, radius: 0.5, colliderHeight: 2.2, colliderRadius: 0.45
    },
    'big_dino': {
      id: 'big_dino', name: 'Viễn Cổ Cự Long', codeName: 'Dino', cat: 'big', icon: '🦖',
      modelPath: './assets/enemies/big/dino.glb', hp: 1800, damage: 140, speed: 1.9, scale: 1.15,
      anims: ['Death', 'Duck', 'HitReact', 'Idle', 'Jump', 'Punch', 'Run', 'Walk', 'Weapon'],
      groundOffset: 0.0, height: 2.6, radius: 0.6, colliderHeight: 2.3, colliderRadius: 0.55
    },
    'big_fish': {
      id: 'big_fish', name: 'Hải Quái Ba Thao', codeName: 'Fish', cat: 'big', icon: '🐟',
      modelPath: './assets/enemies/big/fish.glb', hp: 1100, damage: 85, speed: 2.3, scale: 1.0,
      anims: ['Death', 'Duck', 'HitReact', 'Idle', 'Jump', 'Punch', 'Run', 'Walk', 'Weapon'],
      groundOffset: 0.0, height: 1.8, radius: 0.55, colliderHeight: 1.5, colliderRadius: 0.5
    },
    'big_frog': {
      id: 'big_frog', name: 'Cóc Vàng Vạn Độc', codeName: 'Frog', cat: 'big', icon: '🐸',
      modelPath: './assets/enemies/big/frog.glb', hp: 1250, damage: 90, speed: 2.4, scale: 1.0,
      anims: ['Death', 'Duck', 'HitReact', 'Idle', 'Jump', 'Punch', 'Run', 'Walk', 'Weapon'],
      groundOffset: 0.0, height: 1.6, radius: 0.5, colliderHeight: 1.4, colliderRadius: 0.45
    },
    'big_monkroose': {
      id: 'big_monkroose', name: 'Linh Miêu Quái', codeName: 'Monkroose', cat: 'big', icon: '🦝',
      modelPath: './assets/enemies/big/monkroose.glb', hp: 1000, damage: 80, speed: 2.6, scale: 1.0,
      anims: ['Death', 'Duck', 'HitReact', 'Idle', 'Jump', 'Punch', 'Run', 'Walk', 'Weapon'],
      groundOffset: 0.0, height: 1.9, radius: 0.4, colliderHeight: 1.7, colliderRadius: 0.36
    },
    'big_mushroomking': {
      id: 'big_mushroomking', name: 'Nấm Vương Thần Mộc', codeName: 'MushroomKing', cat: 'big', icon: '🍄',
      modelPath: './assets/enemies/big/mushroomking.glb', hp: 1700, damage: 110, speed: 1.8, scale: 1.1,
      anims: ['Death', 'Duck', 'HitReact', 'Idle', 'Jump', 'Punch', 'Run', 'Walk', 'Weapon'],
      groundOffset: 0.0, height: 2.5, radius: 0.55, colliderHeight: 2.2, colliderRadius: 0.5
    },
    'big_ninja': {
      id: 'big_ninja', name: 'Ám Dạ Nhẫn Giả', codeName: 'Ninja', cat: 'big', icon: '🥷',
      modelPath: './assets/enemies/big/ninja.glb', hp: 1150, damage: 115, speed: 3.0, scale: 1.0,
      anims: ['Death', 'Duck', 'HitReact', 'Idle', 'Jump', 'Punch', 'Run', 'Walk', 'Weapon'],
      groundOffset: 0.0, height: 2.0, radius: 0.38, colliderHeight: 1.85, colliderRadius: 0.34
    },
    'big_orc': {
      id: 'big_orc', name: 'Thú Tộc Chiến Thần', codeName: 'Orc', cat: 'big', icon: '🧌',
      modelPath: './assets/enemies/big/orc.glb', hp: 1650, damage: 125, speed: 2.0, scale: 1.1,
      anims: ['Death', 'Duck', 'HitReact', 'Idle', 'Jump', 'Punch', 'Run', 'Walk', 'Weapon'],
      groundOffset: 0.0, height: 2.3, radius: 0.55, colliderHeight: 2.1, colliderRadius: 0.5
    },
    'big_orc_skull': {
      id: 'big_orc_skull', name: 'Khô Lâu Thú Vương', codeName: 'Orc_Skull', cat: 'big', icon: '💀',
      modelPath: './assets/enemies/big/orc_skull.glb', hp: 1750, damage: 135, speed: 2.1, scale: 1.1,
      anims: ['Death', 'Duck', 'HitReact', 'Idle', 'Jump', 'Punch', 'Run', 'Walk', 'Weapon'],
      groundOffset: 0.0, height: 2.3, radius: 0.52, colliderHeight: 2.1, colliderRadius: 0.47
    },
    'big_tribal': {
      id: 'big_tribal', name: 'Thổ Trứ Ma Tộc', codeName: 'Tribal', cat: 'big', icon: '🗿',
      modelPath: './assets/enemies/big/tribal.glb', hp: 1300, damage: 100, speed: 2.3, scale: 1.0,
      anims: ['Death', 'Duck', 'HitReact', 'Idle', 'Jump', 'Punch', 'Run', 'Walk', 'Weapon'],
      groundOffset: 0.0, height: 2.0, radius: 0.45, colliderHeight: 1.8, colliderRadius: 0.4
    },
    'big_yeti': {
      id: 'big_yeti', name: 'Băng Nguyên Tuyết Quái', codeName: 'Yeti', cat: 'big', icon: '🦍',
      modelPath: './assets/enemies/big/yeti.glb', hp: 2000, damage: 150, speed: 1.8, scale: 1.25,
      anims: ['Death', 'Duck', 'HitReact', 'Idle', 'Jump', 'Punch', 'Run', 'Walk', 'Weapon'],
      groundOffset: 0.0, height: 2.8, radius: 0.7, colliderHeight: 2.5, colliderRadius: 0.65
    },

    // === BLOB CATEGORY (17 models) ===
    'blob_alien': {
      id: 'blob_alien', name: 'Ấu Thể Dị Nhân', codeName: 'Alien', cat: 'blob', icon: '👾',
      modelPath: './assets/enemies/blob/alien.glb', hp: 450, damage: 40, speed: 2.9, scale: 0.85,
      anims: ['Death', 'HitReact', 'Idle', 'Jump', 'Run', 'Walk']
    },
    'blob_birb': {
      id: 'blob_birb', name: 'Tiểu Điểu Yêu', codeName: 'Birb', cat: 'blob', icon: '🐥',
      modelPath: './assets/enemies/blob/birb.glb', hp: 400, damage: 35, speed: 3.2, scale: 0.85,
      anims: ['Death', 'HitReact', 'Idle', 'Jump', 'Run', 'Walk']
    },
    'blob_cactoro': {
      id: 'blob_cactoro', name: 'Tiểu Xương Rồng', codeName: 'Cactoro', cat: 'blob', icon: '🌵',
      modelPath: './assets/enemies/blob/cactoro.glb', hp: 520, damage: 48, speed: 2.6, scale: 0.85,
      anims: ['Death', 'HitReact', 'Idle', 'Jump', 'Run', 'Walk']
    },
    'blob_cat': {
      id: 'blob_cat', name: 'Linh Miêu Quậy', codeName: 'Cat', cat: 'blob', icon: '🐱',
      modelPath: './assets/enemies/blob/cat.glb', hp: 500, damage: 50, speed: 3.4, scale: 0.85,
      anims: ['Death', 'HitReact', 'Idle', 'Jump', 'Run', 'Walk']
    },
    'blob_chicken': {
      id: 'blob_chicken', name: 'Gà Yêu Tinh Nghịch', codeName: 'Chicken', cat: 'blob', icon: '🐔',
      modelPath: './assets/enemies/blob/chicken.glb', hp: 420, damage: 40, speed: 3.1, scale: 0.85,
      anims: ['Death', 'HitReact', 'Idle', 'Jump', 'Run', 'Walk']
    },
    'blob_dog': {
      id: 'blob_dog', name: 'Khuyển Yêu Trung Thành', codeName: 'Dog', cat: 'blob', icon: '🐶',
      modelPath: './assets/enemies/blob/dog.glb', hp: 550, damage: 55, speed: 3.2, scale: 0.85,
      anims: ['Death', 'HitReact', 'Idle', 'Jump', 'Run', 'Walk']
    },
    'blob_fish': {
      id: 'blob_fish', name: 'Cá Con Tinh Nghịch', codeName: 'Fish', cat: 'blob', icon: '🐟',
      modelPath: './assets/enemies/blob/fish.glb', hp: 440, damage: 38, speed: 3.0, scale: 0.85,
      anims: ['Death', 'HitReact', 'Idle', 'Jump', 'Run', 'Walk']
    },
    'blob_greenblob': {
      id: 'blob_greenblob', name: 'Thạch Lựu Lục Thể', codeName: 'GreenBlob', cat: 'blob', icon: '🟢',
      modelPath: './assets/enemies/blob/greenblob.glb', hp: 450, damage: 40, speed: 2.8, scale: 0.85,
      anims: ['Death', 'HitReact', 'Idle', 'Jump', 'Run', 'Walk']
    },
    'blob_greenspikyblob': {
      id: 'blob_greenspikyblob', name: 'Gai Quái Lục Bảo', codeName: 'GreenSpikyBlob', cat: 'blob', icon: '❇️',
      modelPath: './assets/enemies/blob/greenspikyblob.glb', hp: 600, damage: 55, speed: 2.6, scale: 0.9,
      anims: ['Death', 'HitReact', 'Idle', 'Jump', 'Run', 'Walk']
    },
    'blob_mushnub': {
      id: 'blob_mushnub', name: 'Nấm Độc Nhỏ', codeName: 'Mushnub', cat: 'blob', icon: '🍄',
      modelPath: './assets/enemies/blob/mushnub.glb', hp: 480, damage: 45, speed: 2.7, scale: 0.85,
      anims: ['Death', 'HitReact', 'Idle', 'Jump', 'Run', 'Walk']
    },
    'blob_mushnub_evolved': {
      id: 'blob_mushnub_evolved', name: 'Nấm Độc Biến Dị', codeName: 'Mushnub_Evolved', cat: 'blob', icon: '🍄',
      modelPath: './assets/enemies/blob/mushnub_evolved.glb', hp: 750, damage: 65, speed: 2.9, scale: 0.95,
      anims: ['Death', 'HitReact', 'Idle', 'Jump', 'Run', 'Walk']
    },
    'blob_ninja': {
      id: 'blob_ninja', name: 'Tiểu Nhẫn Giả', codeName: 'Ninja', cat: 'blob', icon: '🥷',
      modelPath: './assets/enemies/blob/ninja.glb', hp: 520, damage: 60, speed: 3.5, scale: 0.85,
      anims: ['Death', 'HitReact', 'Idle', 'Jump', 'Run', 'Walk']
    },
    'blob_orc': {
      id: 'blob_orc', name: 'Ấu Thú Tộc', codeName: 'Orc', cat: 'blob', icon: '🧌',
      modelPath: './assets/enemies/blob/orc.glb', hp: 580, damage: 58, speed: 2.8, scale: 0.9,
      anims: ['Death', 'HitReact', 'Idle', 'Jump', 'Run', 'Walk']
    },
    'blob_pigeon': {
      id: 'blob_pigeon', name: 'Bồ Câu Ma Thuật', codeName: 'Pigeon', cat: 'blob', icon: '🐦',
      modelPath: './assets/enemies/blob/pigeon.glb', hp: 410, damage: 36, speed: 3.3, scale: 0.85,
      anims: ['Death', 'HitReact', 'Idle', 'Jump', 'Run', 'Walk']
    },
    'blob_pinkblob': {
      id: 'blob_pinkblob', name: 'Thạch Lựu Hồng Phấn', codeName: 'PinkBlob', cat: 'blob', icon: '🌸',
      modelPath: './assets/enemies/blob/pinkblob.glb', hp: 400, damage: 35, speed: 3.0, scale: 0.85,
      anims: ['Death', 'HitReact', 'Idle', 'Jump', 'Run', 'Walk']
    },
    'blob_wizard': {
      id: 'blob_wizard', name: 'Tiểu Pháp Sư Tinh Linh', codeName: 'Wizard', cat: 'blob', icon: '🧙‍♂️',
      modelPath: './assets/enemies/blob/wizard.glb', hp: 620, damage: 70, speed: 2.5, scale: 0.9,
      anims: ['Death', 'HitReact', 'Idle', 'Jump', 'Run', 'Walk']
    },
    'blob_yeti': {
      id: 'blob_yeti', name: 'Ấu Băng Quái', codeName: 'Yeti', cat: 'blob', icon: '🦍',
      modelPath: './assets/enemies/blob/yeti.glb', hp: 700, damage: 68, speed: 2.4, scale: 0.95,
      anims: ['Death', 'HitReact', 'Idle', 'Jump', 'Run', 'Walk']
    },

    // === FLYING CATEGORY (17 models) ===
    'flying_alpaking': {
      id: 'flying_alpaking', name: 'Thiên Dực Lạc Đà', codeName: 'Alpaking', cat: 'flying', icon: '🦙',
      modelPath: './assets/enemies/flying/alpaking.glb', hp: 1200, damage: 80, speed: 3.0, scale: 1.0,
      anims: ['Death', 'Flying', 'Flying_Idle', 'HitReact', 'Idle', 'Shoot']
    },
    'flying_alpaking_evolved': {
      id: 'flying_alpaking_evolved', name: 'Thần Dực Lạc Đà', codeName: 'Alpaking_Evolved', cat: 'flying', icon: '🦙',
      modelPath: './assets/enemies/flying/alpaking_evolved.glb', hp: 1600, damage: 110, speed: 3.2, scale: 1.15,
      anims: ['Death', 'Flying', 'Flying_Idle', 'HitReact', 'Idle', 'Shoot']
    },
    'flying_armabee': {
      id: 'flying_armabee', name: 'Phi Thiên Ong Độc', codeName: 'Armabee', cat: 'flying', icon: '🐝',
      modelPath: './assets/enemies/flying/armabee.glb', hp: 700, damage: 65, speed: 3.8, scale: 0.9,
      anims: ['Death', 'Flying', 'Flying_Idle', 'HitReact', 'Idle', 'Shoot'],
      groundOffset: 1.8, height: 0.9, radius: 0.4, colliderHeight: 0.7, colliderRadius: 0.35
    },
    'flying_armabee_evolved': {
      id: 'flying_armabee_evolved', name: 'Ma Ong Chúa Hoàng', codeName: 'Armabee_Evolved', cat: 'flying', icon: '🐝',
      modelPath: './assets/enemies/flying/armabee_evolved.glb', hp: 1100, damage: 95, speed: 4.0, scale: 1.05,
      anims: ['Death', 'Flying', 'Flying_Idle', 'HitReact', 'Idle', 'Shoot'],
      groundOffset: 2.2, height: 1.2, radius: 0.5, colliderHeight: 0.9, colliderRadius: 0.4
    },
    'flying_demon': {
      id: 'flying_demon', name: 'Ác Ma Dạ Xoa', codeName: 'Demon', cat: 'flying', icon: '👿',
      modelPath: './assets/enemies/flying/demon.glb', hp: 1500, damage: 130, speed: 3.3, scale: 1.05,
      anims: ['Death', 'Flying', 'Flying_Idle', 'HitReact', 'Idle', 'Shoot']
    },
    'flying_dragon': {
      id: 'flying_dragon', name: 'Thanh Lôi Hỏa Long', codeName: 'Dragon', cat: 'flying', icon: '🐉',
      modelPath: './assets/enemies/flying/dragon.glb', hp: 2200, damage: 160, speed: 3.2, scale: 1.1,
      anims: ['Death', 'Flying', 'Flying_Idle', 'HitReact', 'Idle', 'Shoot'],
      groundOffset: 3.0, height: 1.8, radius: 0.8, colliderHeight: 1.4, colliderRadius: 0.75
    },
    'flying_dragon_evolved': {
      id: 'flying_dragon_evolved', name: 'Thái Cổ Cự Long', codeName: 'Dragon_Evolved', cat: 'flying', icon: '🐲',
      modelPath: './assets/enemies/flying/dragon_evolved.glb', hp: 3000, damage: 220, speed: 3.5, scale: 1.3,
      anims: ['Death', 'Flying', 'Flying_Idle', 'HitReact', 'Idle', 'Shoot'],
      groundOffset: 3.5, height: 2.2, radius: 1.0, colliderHeight: 1.8, colliderRadius: 0.9
    },
    'flying_ghost': {
      id: 'flying_ghost', name: 'U Linh Phiêu Đãng', codeName: 'Ghost', cat: 'flying', icon: '👻',
      modelPath: './assets/enemies/flying/ghost.glb', hp: 850, damage: 75, speed: 3.0, scale: 0.95,
      anims: ['Death', 'Flying', 'Flying_Idle', 'HitReact', 'Idle', 'Shoot'],
      groundOffset: 2.0, height: 1.5, radius: 0.45, colliderHeight: 1.2, colliderRadius: 0.4
    },
    'flying_ghost_skull': {
      id: 'flying_ghost_skull', name: 'Bạch Cốt Oan Hồn', codeName: 'Ghost_Skull', cat: 'flying', icon: '💀',
      modelPath: './assets/enemies/flying/ghost_skull.glb', hp: 950, damage: 85, speed: 3.1, scale: 1.0,
      anims: ['Death', 'Flying', 'Flying_Idle', 'HitReact', 'Idle', 'Shoot'],
      groundOffset: 2.2, height: 1.5, radius: 0.45, colliderHeight: 1.2, colliderRadius: 0.4
    },
    'flying_glub': {
      id: 'flying_glub', name: 'Tiểu Tinh Cầu Bay', codeName: 'Glub', cat: 'flying', icon: '🛸',
      modelPath: './assets/enemies/flying/glub.glb', hp: 650, damage: 55, speed: 3.2, scale: 0.85,
      anims: ['Death', 'Flying', 'Flying_Idle', 'HitReact', 'Idle', 'Shoot']
    },
    'flying_glub_evolved': {
      id: 'flying_glub_evolved', name: 'Tinh Cầu Cực Quang', codeName: 'Glub_Evolved', cat: 'flying', icon: '🛸',
      modelPath: './assets/enemies/flying/glub_evolved.glb', hp: 950, damage: 78, speed: 3.4, scale: 0.95,
      anims: ['Death', 'Flying', 'Flying_Idle', 'HitReact', 'Idle', 'Shoot']
    },
    'flying_goleling': {
      id: 'flying_goleling', name: 'Bạch Thạch Dực Quái', codeName: 'Goleling', cat: 'flying', icon: '🗿',
      modelPath: './assets/enemies/flying/goleling.glb', hp: 1350, damage: 105, speed: 2.7, scale: 1.0,
      anims: ['Death', 'Flying', 'Flying_Idle', 'HitReact', 'Idle', 'Shoot']
    },
    'flying_goleling_evolved': {
      id: 'flying_goleling_evolved', name: 'Thần Thạch Cự Dực', codeName: 'Goleling_Evolved', cat: 'flying', icon: '🗿',
      modelPath: './assets/enemies/flying/goleling_evolved.glb', hp: 1850, damage: 140, speed: 2.9, scale: 1.2,
      anims: ['Death', 'Flying', 'Flying_Idle', 'HitReact', 'Idle', 'Shoot']
    },
    'flying_hywirl': {
      id: 'flying_hywirl', name: 'Cuồng Phong Quỷ Điểu', codeName: 'Hywirl', cat: 'flying', icon: '🦅',
      modelPath: './assets/enemies/flying/hywirl.glb', hp: 900, damage: 80, speed: 3.6, scale: 0.95,
      anims: ['Death', 'Flying', 'Flying_Idle', 'HitReact', 'Idle', 'Shoot']
    },
    'flying_pigeon': {
      id: 'flying_pigeon', name: 'Linh Điểu Thiên Không', codeName: 'Pigeon', cat: 'flying', icon: '🕊️',
      modelPath: './assets/enemies/flying/pigeon.glb', hp: 600, damage: 50, speed: 3.8, scale: 0.85,
      anims: ['Death', 'Flying', 'Flying_Idle', 'HitReact', 'Idle', 'Shoot']
    },
    'flying_squidle': {
      id: 'flying_squidle', name: 'Mực Ma Không Gian', codeName: 'Squidle', cat: 'flying', icon: '🦑',
      modelPath: './assets/enemies/flying/squidle.glb', hp: 1100, damage: 95, speed: 2.9, scale: 1.0,
      anims: ['Death', 'Flying', 'Flying_Idle', 'HitReact', 'Idle', 'Shoot'],
      groundOffset: 2.5, height: 1.4, radius: 0.5, colliderHeight: 1.1, colliderRadius: 0.45
    },
    'flying_tribal': {
      id: 'flying_tribal', name: 'Tù Trưởng Phi Hành', codeName: 'Tribal', cat: 'flying', icon: '🎭',
      modelPath: './assets/enemies/flying/tribal.glb', hp: 1250, damage: 100, speed: 3.1, scale: 1.0,
    }
  };

  // Apply category-level defaults for any fields not explicitly set
  for (const [, entry] of Object.entries(ENEMIES)) {
    const colDefaults    = COLLIDER_DEFAULTS[entry.cat] || {};
    const combatDefaults = COMBAT_DEFAULTS[entry.cat]   || {};
    const allDefaults    = Object.assign({}, colDefaults, combatDefaults);
    for (const key of Object.keys(allDefaults)) {
      if (entry[key] === undefined) entry[key] = allDefaults[key];
    }
  }


  // Populate any missing from the 50 full list automatically
  global.EnemyRegistry = {
    getAll: () => Object.values(ENEMIES),
    get: (id) => ENEMIES[id] || null,
    getCategories: () => ['all', 'big', 'blob', 'flying'],
    getByCategory: (cat) => cat === 'all' ? Object.values(ENEMIES) : Object.values(ENEMIES).filter(e => e.cat === cat),
    /**
     * Returns capsule collider definition for an enemy.
     * Scaled by the enemy's scale value.
     * @param {string} id
     * @param {number} [overrideScale] - optional scale override
     */
    getColliderDef: (id, overrideScale) => {
      const info = ENEMIES[id];
      if (!info) return null;
      const s = overrideScale !== undefined ? overrideScale : (info.scale || 1.0);
      return {
        groundOffset:   (info.groundOffset   || 0.0) * s,
        height:         (info.height          || 2.0) * s,
        radius:         (info.radius          || 0.45) * s,
        colliderHeight: (info.colliderHeight  || 1.8) * s,
        colliderRadius: (info.colliderRadius  || 0.4) * s
      };
    },
    catalog: ENEMIES
  };

})(typeof window !== 'undefined' ? window : this);

