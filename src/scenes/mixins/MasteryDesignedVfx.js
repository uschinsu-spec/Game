// MasteryDesignedVfx.js
// Dùng lại bộ VFX đã có trong GitHub theo đúng bậc thuần thục.
// TUYỆT ĐỐI không chọn VFX theo chuỗi universal cũ proj_1/proj_2/array_3/swarm_4/colossus_5.

const ELEMENT_KEY = Object.freeze({
  'Kiếm': 'kiem',
  'Kim': 'kim',
  'Hỏa': 'hoa',
  'Thủy': 'thuy',
  'Thổ': 'tho',
  'Mộc': 'moc',
  'Phong': 'phong',
  'Lôi': 'loi',
  'Vật Lý': 'ly'
});

const ELEMENT_TINT = Object.freeze({
  kiem: 0xffea66,
  kim: 0xffd700,
  hoa: 0xff6622,
  thuy: 0x33ccff,
  tho: 0xd8a84e,
  moc: 0x44dd66,
  phong: 0x66ffcc,
  loi: 0xbb66ff,
  ly: 0xffe6d5
});

const MASTERY_PROFILE = Object.freeze([
  { idx: 0, name: 'Sơ Nhập',   projectiles: 1, formationUnits: 6,  swarmUnits: 10, scale: 0.72, pulseCount: 0, range: 250 },
  { idx: 1, name: 'Tiểu Thành', projectiles: 2, formationUnits: 8,  swarmUnits: 14, scale: 0.84, pulseCount: 1, range: 350 },
  { idx: 2, name: 'Đại Thành',  projectiles: 4, formationUnits: 10, swarmUnits: 18, scale: 1.00, pulseCount: 2, range: 460 },
  { idx: 3, name: 'Viên Mãn',   projectiles: 6, formationUnits: 12, swarmUnits: 22, scale: 1.16, pulseCount: 3, range: 600 }
]);

const ELEMENT_ASSET_PATHS = Object.freeze({
  hoa:  { base: 'vfx/skills/vfx_hoa.png',  mid: 'vfx/skills/vfx_mid_hoa.png',  ult: 'vfx/ultimates/vfx_ult_hoa.png' },
  loi:  { base: 'vfx/skills/vfx_loi.png',  mid: 'vfx/skills/vfx_mid_loi.png',  ult: 'vfx/ultimates/vfx_ult_loi.png' },
  kim:  { base: 'vfx/skills/vfx_kim.png',  mid: 'vfx/skills/vfx_mid_kim.png',  ult: 'vfx/ultimates/vfx_ult_kim.png' },
  thuy: { base: 'vfx/skills/vfx_thuy.png', mid: 'vfx/skills/vfx_mid_thuy.png', ult: 'vfx/ultimates/vfx_ult_thuy.png' },
  phong:{ base: 'vfx/skills/vfx_phong.png',mid: 'vfx/skills/vfx_mid_phong.png',ult: 'vfx/ultimates/vfx_ult_phong.png' },
  moc:  { base: 'vfx/skills/vfx_moc.png',  mid: 'vfx/skills/vfx_mid_moc.png',  ult: 'vfx/ultimates/vfx_ult_moc.png' },
  tho:  { base: 'vfx/skills/vfx_tho.png',  mid: 'vfx/skills/vfx_mid_tho.png',  ult: 'vfx/ultimates/vfx_ult_tho.png' },
  ly:   { base: 'vfx/skills/vfx_ly.png',   mid: 'vfx/skills/vfx_mid_ly.png',   ult: 'vfx/ultimates/vfx_ult_ly.png' }
});

function clampMasteryIdx(mastery) {
  const idx = Number(mastery?.tierIdx ?? mastery?.tier?.idx ?? 0);
  return Math.max(0, Math.min(3, Number.isFinite(idx) ? idx : 0));
}

function getSkillLevel(skill) {
  const stage = String(skill?.stage || '');
  if (stage === 'Hóa Thần') return 5;
  if (stage === 'Nguyên Anh') return 4;
  if (stage === 'Kim Đan') return 3;
  if (stage === 'Trúc Cơ') return 2;
  if (stage === 'Luyện Khí') return 1;
  const minRealm = Number(skill?.minRealm) || 0;
  if (minRealm >= 16) return 5;
  if (minRealm >= 12) return 4;
  if (minRealm >= 8) return 3;
  if (minRealm >= 4) return 2;
  return 1;
}

function designedTextureKey(skill, elemKey) {
  if (elemKey === 'kiem') {
    const id = String(skill?.id || 'kiem_1');
    if (id === 'kiem_2') return 'designed_kiem_2';
    if (id === 'kiem_3') return 'designed_kiem_3';
    if (id === 'kiem_4') return 'designed_kiem_4';
    if (id === 'kiem_5') return 'designed_kiem_5';
    return 'designed_kiem_1';
  }

  const level = getSkillLevel(skill);
  const family = level <= 1 ? 'base' : (level === 2 ? 'mid' : 'ult');
  return `designed_${elemKey}_${family}`;
}

function isVisibleEnemy(scene, enemy, padding = 40) {
  if (!enemy || !enemy.active || enemy.isDead) return false;
  return typeof scene.isEnemyOnScreen === 'function' ? scene.isEnemyOnScreen(enemy, padding) : true;
}

function clampTargetToCamera(scene, x, y) {
  const cam = scene.cameras?.main;
  if (!cam) return { x, y };
  const view = cam.worldView;
  const minX = (view ? view.x : cam.scrollX) + 35;
  const maxX = (view ? view.right : cam.scrollX + cam.width) - 35;
  const minY = (view ? view.y : cam.scrollY) + 55;
  const maxY = (view ? view.bottom : cam.scrollY + cam.height) - 55;
  return {
    x: Phaser.Math.Clamp(x, minX, maxX),
    y: Phaser.Math.Clamp(y, minY, maxY)
  };
}

function makeDesignedImage(scene, x, y, key, scale, tint, depth = 50, alpha = 1) {
  if (!scene.textures?.exists(key)) return null;
  return scene.add.image(x, y, key)
    .setDepth(depth)
    .setBlendMode(Phaser.BlendModes.ADD)
    .setScale(scale)
    .setAlpha(alpha)
    .setTint(tint);
}

function pulseAt(scene, x, y, key, tint, baseScale, pulseCount) {
  const total = Math.max(1, pulseCount + 1);
  for (let i = 0; i < total; i++) {
    scene.time.delayedCall(i * 85, () => {
      const img = makeDesignedImage(scene, x, y, key, baseScale * (0.72 + i * 0.08), tint, Math.floor(y) + 80 + i, Math.max(0.22, 0.72 - i * 0.12));
      if (!img) return;
      scene.tweens.add({
        targets: img,
        scaleX: baseScale * (1.15 + i * 0.10),
        scaleY: baseScale * (1.15 + i * 0.10),
        alpha: 0,
        angle: (i % 2 === 0 ? 1 : -1) * (18 + i * 9),
        duration: 260 + i * 45,
        ease: 'Cubic.easeOut',
        onComplete: () => img.destroy()
      });
    });
  }
}

function renderProjectileSkill(scene, skill, target, baseDmg, key, tint, profile) {
  const facing = scene.player?.flipX ? -1 : 1;
  const startX = scene.player?.x ?? 270;
  const startY = (scene.player?.y ?? 620) - 18;
  const rawTx = target && target.active ? target.x : startX + facing * 220;
  const rawTy = target && target.active ? target.y - 10 : startY;
  const end = clampTargetToCamera(scene, rawTx, rawTy);
  const dist = Phaser.Math.Distance.Between(startX, startY, end.x, end.y);
  const duration = Math.max(100, Math.min(650, Math.round((dist / 320) * 1000)));
  const count = profile.projectiles;
  const perHitDmg = Math.max(1, Math.floor(baseDmg / count));
  const offsetsByCount = {
    1: [0],
    2: [-34, 34],
    4: [-66, -22, 22, 66],
    6: [-92, -56, -20, 20, 56, 92]
  };
  const offsets = offsetsByCount[count] || [0];

  for (let i = 0; i < count; i++) {
    scene.time.delayedCall(i * 28, () => {
      const offset = offsets[i] || 0;
      const angle = Phaser.Math.Angle.Between(startX, startY, end.x, end.y);
      const nx = -Math.sin(angle);
      const ny = Math.cos(angle);
      const img = makeDesignedImage(scene, startX + nx * offset * 0.20, startY + ny * offset * 0.20, key, 0.38 * profile.scale, tint, Math.floor(startY) + 70 + i, i === 0 ? 1 : 0.86);
      if (!img) return;
      img.setRotation(angle);
      const proxy = { t: 0 };
      scene.tweens.add({
        targets: proxy,
        t: 1,
        duration,
        ease: 'Quad.easeInOut',
        onUpdate: () => {
          const liveX = target && target.active ? target.x : end.x;
          const liveY = target && target.active ? target.y - 10 : end.y;
          const a = Phaser.Math.Angle.Between(startX, startY, liveX, liveY);
          const px = -Math.sin(a), py = Math.cos(a);
          const ctrlX = (startX + liveX) * 0.5 + px * offset;
          const ctrlY = (startY + liveY) * 0.5 + py * offset;
          const t = proxy.t, omt = 1 - t;
          const bx = omt * omt * startX + 2 * omt * t * ctrlX + t * t * liveX;
          const by = omt * omt * startY + 2 * omt * t * ctrlY + t * t * liveY;
          img.setPosition(bx, by);
          const dx = 2 * omt * (ctrlX - startX) + 2 * t * (liveX - ctrlX);
          const dy = 2 * omt * (ctrlY - startY) + 2 * t * (liveY - ctrlY);
          img.setRotation(Math.atan2(dy, dx));
        },
        onComplete: () => {
          const hx = target && target.active ? target.x : end.x;
          const hy = target && target.active ? target.y - 10 : end.y;
          img.destroy();
          pulseAt(scene, hx, hy, key, tint, 0.34 * profile.scale, profile.idx >= 2 ? 1 : 0);
          if (target && isVisibleEnemy(scene, target, 25)) scene.damageEnemy(target, perHitDmg, profile.idx >= 2 && i === 0);
        }
      });
    });
  }
}

function renderSingleStrike(scene, skill, target, baseDmg, key, tint, profile) {
  const facing = scene.player?.flipX ? -1 : 1;
  const sx = scene.player?.x ?? 270;
  const sy = (scene.player?.y ?? 620) - 15;
  const rawTx = target && target.active ? target.x : sx + facing * 230;
  const rawTy = target && target.active ? target.y - 10 : sy;
  const end = clampTargetToCamera(scene, rawTx, rawTy);
  const img = makeDesignedImage(scene, sx, sy, key, 0.46 * profile.scale, tint, Math.floor(sy) + 75, 1);
  if (!img) return;
  img.setRotation(Phaser.Math.Angle.Between(sx, sy, end.x, end.y));
  const dist = Phaser.Math.Distance.Between(sx, sy, end.x, end.y);
  scene.tweens.add({
    targets: img,
    x: end.x,
    y: end.y,
    scaleX: 0.72 * profile.scale,
    scaleY: 0.72 * profile.scale,
    duration: Math.max(120, Math.min(650, Math.round((dist / 330) * 1000))),
    ease: 'Quad.easeInOut',
    onComplete: () => {
      img.destroy();
      pulseAt(scene, end.x, end.y, key, tint, 0.56 * profile.scale, profile.pulseCount);
      if (target && isVisibleEnemy(scene, target, 25)) scene.damageEnemy(target, baseDmg, profile.idx >= 2);
    }
  });
}

function damageEllipse(scene, cx, cy, rx, ry, dmg, crit = false) {
  [...(scene.enemies || [])].forEach(enemy => {
    if (!isVisibleEnemy(scene, enemy, 50)) return;
    const nx = (enemy.x - cx) / Math.max(1, rx);
    const ny = (enemy.y - cy) / Math.max(1, ry);
    if (nx * nx + ny * ny <= 1) scene.damageEnemy(enemy, dmg, crit);
  });
}

function renderFormation(scene, skill, target, baseDmg, key, tint, profile) {
  const fallbackX = (scene.player?.x ?? 270) + (scene.player?.flipX ? -1 : 1) * 180;
  const fallbackY = scene.player?.y ?? 620;
  const center = clampTargetToCamera(scene, target && target.active ? target.x : fallbackX, target && target.active ? target.y : fallbackY);
  const rx = 145, ry = 82;
  const main = makeDesignedImage(scene, center.x, center.y, key, 0.72 * profile.scale, tint, Math.floor(center.y) + 35, 0.88);
  if (main) {
    scene.tweens.add({ targets: main, angle: 160, scaleX: 1.05 * profile.scale, scaleY: 1.05 * profile.scale, alpha: 0, duration: 3000, onComplete: () => main.destroy() });
  }

  for (let i = 0; i < profile.formationUnits; i++) {
    const theta = (i / profile.formationUnits) * Math.PI * 2;
    const px = center.x + Math.cos(theta) * rx;
    const py = center.y + Math.sin(theta) * ry;
    scene.time.delayedCall(i * 28, () => pulseAt(scene, px, py, key, tint, 0.22 * profile.scale, 0));
  }

  const perTick = Math.max(1, Math.floor(baseDmg / 6));
  for (let tick = 0; tick < 6; tick++) {
    scene.time.delayedCall(tick * 500, () => {
      pulseAt(scene, center.x, center.y, key, tint, 0.48 * profile.scale, profile.idx >= 2 ? 1 : 0);
      damageEllipse(scene, center.x, center.y, rx + 18, ry + 18, perTick, profile.idx >= 2 && tick % 2 === 0);
    });
  }
}

function renderSwarm(scene, skill, target, baseDmg, key, tint, profile) {
  const fallbackX = (scene.player?.x ?? 270) + (scene.player?.flipX ? -1 : 1) * 180;
  const fallbackY = scene.player?.y ?? 620;
  const center = clampTargetToCamera(scene, target && target.active ? target.x : fallbackX, target && target.active ? target.y : fallbackY);
  const visualCount = Math.min(profile.swarmUnits, 14); // Giữ đúng cấp độ nhưng giới hạn object để nhẹ mobile.
  const radiusX = 92, radiusY = 46;

  for (let i = 0; i < visualCount; i++) {
    scene.time.delayedCall(i * 48, () => {
      const theta = (i / Math.max(1, visualCount)) * Math.PI * 2;
      const sx = center.x + Math.cos(theta) * radiusX;
      const sy = center.y - 110 + Math.sin(theta) * radiusY;
      const img = makeDesignedImage(scene, sx, sy, key, 0.28 * profile.scale, tint, Math.floor(center.y) + 65 + i, 0.88);
      if (!img) return;
      const dir = i % 2 === 0 ? 1 : -1;
      scene.tweens.add({
        targets: img,
        x: center.x + dir * 130,
        y: center.y + (i % 3 - 1) * 45,
        angle: dir * 220,
        duration: 720,
        yoyo: true,
        repeat: 2,
        ease: 'Sine.easeInOut',
        onComplete: () => img.destroy()
      });
    });
  }

  // 3 lượt quét: tổng sát thương vẫn bằng baseDmg, không nhân theo số VFX.
  const perPass = Math.max(1, Math.floor(baseDmg / 3));
  for (let pass = 0; pass < 3; pass++) {
    scene.time.delayedCall(680 + pass * 520, () => {
      pulseAt(scene, center.x, center.y, key, tint, 0.68 * profile.scale, profile.pulseCount);
      damageEllipse(scene, center.x, center.y, 120, 100, perPass, profile.idx >= 2 && pass === 2);
    });
  }
}

function renderColossus(scene, skill, target, baseDmg, key, tint, profile) {
  const fallbackX = (scene.player?.x ?? 270) + (scene.player?.flipX ? -1 : 1) * 170;
  const fallbackY = scene.player?.y ?? 620;
  const center = clampTargetToCamera(scene, target && target.active ? target.x : fallbackX, target && target.active ? target.y : fallbackY);
  const strike = makeDesignedImage(scene, center.x, center.y - 320, key, 0.52 * profile.scale, tint, Math.floor(center.y) + 100, 0.95);
  if (strike) {
    scene.tweens.add({
      targets: strike,
      y: center.y,
      scaleX: 1.08 * profile.scale,
      scaleY: 1.08 * profile.scale,
      duration: 520,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        pulseAt(scene, center.x, center.y, key, tint, 1.0 * profile.scale, profile.pulseCount + 1);
        strike.destroy();
      }
    });
  }

  // Hóa Thần: 40% đòn giáng + 10 nhịp 6% = 100% baseDmg.
  scene.time.delayedCall(520, () => damageEllipse(scene, center.x, center.y, profile.range, profile.range * 0.62, Math.max(1, Math.floor(baseDmg * 0.40)), true));
  const perTick = Math.max(1, Math.floor(baseDmg * 0.06));
  for (let tick = 0; tick < 10; tick++) {
    scene.time.delayedCall(700 + tick * 480, () => {
      pulseAt(scene, center.x, center.y, key, tint, 0.72 * profile.scale, profile.idx >= 2 ? 1 : 0);
      damageEllipse(scene, center.x, center.y, profile.range, profile.range * 0.62, perTick, profile.idx >= 2 && tick % 3 === 0);
    });
  }
}

export function installMasteryDesignedVfx(MainGameScene) {
  const proto = MainGameScene?.prototype;
  if (!proto || proto.__masteryDesignedVfxInstalled) return;
  proto.__masteryDesignedVfxInstalled = true;

  const originalPreload = proto.preload;
  proto.preload = function preloadDesignedMasteryVfx(...args) {
    if (typeof originalPreload === 'function') originalPreload.apply(this, args);
    const A = './assets/';

    Object.entries(ELEMENT_ASSET_PATHS).forEach(([elem, paths]) => {
      this.load.image(`designed_${elem}_base`, A + paths.base);
      this.load.image(`designed_${elem}_mid`, A + paths.mid);
      this.load.image(`designed_${elem}_ult`, A + paths.ult);
    });

    // Bộ Kiếm đã thiết kế riêng trong GitHub. Nạp bằng key riêng để runtime mới không phụ thuộc key universal cũ.
    this.load.image('designed_kiem_1', A + 'vfx/sword/kiem_khi.png');
    this.load.image('designed_kiem_2', A + 'vfx/sword/kim_2_frame_0.png');
    this.load.image('designed_kiem_3', A + 'vfx/sword/kim_3_frame_0.png');
    this.load.image('designed_kiem_4', A + 'vfx/sword/kiem_khi.png');
    this.load.image('designed_kiem_5', A + 'vfx/sword/giant_tru_tien_sword.png');
  };

  // Ghi đè renderer universal cũ sau khi SkillMasteryRealmGuard đã cài xong.
  // Damage/cooldown vẫn do CombatMixin xử lý; ở đây chỉ quyết định choreography + thời điểm damage theo từng loại skill.
  proto.castElementalSkill = function castElementalSkillByMasteryDesign(skill, target, baseDmg, elemColors, mastery = { tierIdx: 0, tier: { idx: 0, name: 'Sơ Nhập', color: '#aaddff' } }) {
    const elemName = skill?.elem || skill?.element || 'Kiếm';
    const elemKey = ELEMENT_KEY[elemName] || 'kiem';
    const masteryIdx = clampMasteryIdx(mastery);
    const profile = MASTERY_PROFILE[masteryIdx];
    const skillLevel = getSkillLevel(skill);
    const textureKey = designedTextureKey(skill, elemKey);
    const tint = ELEMENT_TINT[elemKey] || 0xffffff;
    const tierName = mastery?.tier?.name || profile.name;
    const textColor = mastery?.tier?.color || elemColors?.[elemName] || '#fef08a';

    if (skillLevel === 1) renderProjectileSkill(this, skill, target, baseDmg, textureKey, tint, profile);
    else if (skillLevel === 2) renderSingleStrike(this, skill, target, baseDmg, textureKey, tint, profile);
    else if (skillLevel === 3) renderFormation(this, skill, target, baseDmg, textureKey, tint, profile);
    else if (skillLevel === 4) renderSwarm(this, skill, target, baseDmg, textureKey, tint, profile);
    else renderColossus(this, skill, target, baseDmg, textureKey, tint, profile);

    this.showFloatingText?.(
      this.player?.x ?? 270,
      (this.player?.y ?? 620) - 70,
      `[${elemName} • ${tierName}] ${skill?.name || 'Kỹ Năng'}!`,
      textColor,
      skillLevel >= 3 ? '15px' : '13px'
    );
  };
}
