// KIẾM KHÍ VFX — BLUE ARC SWORD QI BARRAGE
// Nhiều tia kiếm khí xanh bay theo quỹ đạo vòng cung và hội tụ vào enemy.
(() => {
  'use strict';

  const registry = window.SkillVfxRegistry;
  if (!registry) throw new Error('[SkillVfx] registry.js must load before skill modules.');

  registry.register({
    id: 'kiem_khi',
    aliases: [0, 'kiem-khi', 'sword_qi'],
    file: 'kiem-khi.js',

    run(vfx, ctx) {
      const { B, start, origin, end, ground, dir } = ctx;

      // Palette riêng cho Kiếm Khí: xanh dương rõ nét, không quá chói.
      const blue = {
        core:   B.Color3.FromHexString('#c9efff'),
        main:   B.Color3.FromHexString('#338cff'),
        accent: B.Color3.FromHexString('#69c7ff'),
        deep:   B.Color3.FromHexString('#1756d6')
      };

      const right = new B.Vector3(-dir.z, 0, dir.x);
      const target = end.add(new B.Vector3(0, 0.95, 0));

      // 1) Tụ khí: nhỏ, gọn, làm nền cho đợt kiếm khí.
      vfx.castCircle(origin, blue.main, 0, 2.65, {
        life: 0.42,
        alpha: 0.18,
        spin: 3.0
      });
      vfx.plane('slashCross', start.clone(), 1.55, blue.accent, 0.23, {
        alpha: 0.34,
        startScale: 0.18,
        endScale: 0.88,
        spin: 0.22,
        fadeOut: 0.34
      });

      // Quadratic Bezier cho đường bay cong mượt.
      const bezier = (p0, p1, p2, t) => {
        const a = B.Vector3.Lerp(p0, p1, t);
        const b = B.Vector3.Lerp(p1, p2, t);
        return B.Vector3.Lerp(a, b, t);
      };

      // 2) Barrage: nhiều tia xếp thành hình cánh cung rồi hội tụ vào enemy.
      const rayCount = vfx.mobile ? 6 : 9;
      const half = Math.max(1, (rayCount - 1) / 2);

      for (let i = 0; i < rayCount; i++) {
        const u = (i - half) / half;              // -1 ... 1
        const absU = Math.abs(u);
        const fanAngle = u * 0.82;

        // Các tia xuất phát trên một cung tròn trước mặt player.
        const p0 = start
          .add(right.scale(Math.sin(fanAngle) * 1.75))
          .add(dir.scale(0.30 + Math.cos(fanAngle) * 0.42))
          .add(new B.Vector3(0, 0.10 + (1 - absU) * 0.42, 0));

        // Điểm điều khiển bẻ cong đường bay ra ngoài rồi kéo về mục tiêu.
        const mid = B.Vector3.Lerp(p0, target, 0.46);
        const p1 = mid
          .add(right.scale(u * (2.35 + absU * 0.65)))
          .add(new B.Vector3(0, 1.05 + (1 - absU) * 0.70, 0));

        // Mỗi tia chạm enemy lệch nhẹ để thấy rõ "chùm kiếm khí".
        const p2 = target
          .add(right.scale(u * 0.20))
          .add(new B.Vector3(0, (1 - absU) * 0.20, 0));

        // Tia giữa đậm hơn; hai mép cung tối hơn để giữ silhouette.
        const color =
          absU < 0.20 ? blue.core :
          absU < 0.72 ? blue.main :
          blue.deep;

        const delay = 0.075 + absU * 0.045 + i * 0.006;
        const life = 0.50 + absU * 0.035;
        const size = 2.05 + (1 - absU) * 0.38;

        // Main sword-qi crescent.
        vfx.plane('slashCrescent', p0.clone(), size, color, life, {
          delay,
          alpha: absU < 0.20 ? 0.60 : 0.50,
          startScale: 0.34,
          endScale: 0.92,
          fadeIn: 0.035,
          fadeOut: 0.66,
          spin: u * 0.17,
          uvSpin: -u * 0.10,
          uvZoom: 0.04,
          update: (mesh, t) => {
            const e = vfx._easeInOut(t);
            mesh.position.copyFrom(bezier(p0, p1, p2, e));

            // Giữ dáng kiếm khí theo cung, không xoay loạn.
            mesh.rotation.z =
              u * 0.36 +
              Math.sin(e * Math.PI) * (-u * 0.20) +
              (i % 2 ? 0.035 : -0.035);
          }
        });

        // Afterimage theo sau từng tia, tạo chiều sâu mà không tăng độ chói nhiều.
        vfx.plane('slashCrescent', p0.clone(), size * 0.82, blue.accent, life * 0.96, {
          delay: delay + 0.038,
          alpha: 0.22,
          startScale: 0.30,
          endScale: 0.82,
          fadeIn: 0.025,
          fadeOut: 0.54,
          spin: u * 0.12,
          uvSpin: u * 0.08,
          uvZoom: 0.05,
          update: (mesh, t) => {
            const e = vfx._easeInOut(t);
            mesh.position.copyFrom(bezier(p0, p1, p2, e));
            mesh.rotation.z = u * 0.34 + Math.sin(e * Math.PI) * (-u * 0.16);
          }
        });
      }

      // 3) Hai kiếm khí lõi nhanh hơn chạy ở giữa cung để tạo cảm giác "xuyên tâm".
      for (let j = 0; j < 2; j++) {
        const side = j === 0 ? -0.22 : 0.22;
        const p0 = start.add(right.scale(side)).add(new B.Vector3(0, 0.28, 0));
        const p1 = B.Vector3.Lerp(p0, target, 0.48)
          .add(right.scale(side * 1.8))
          .add(new B.Vector3(0, 1.35, 0));
        const p2 = target.add(right.scale(side * 0.10));

        vfx.plane('slashCrescent', p0.clone(), 2.30, blue.core, 0.46, {
          delay: 0.105 + j * 0.025,
          alpha: 0.54,
          startScale: 0.28,
          endScale: 0.88,
          fadeIn: 0.02,
          fadeOut: 0.60,
          spin: side * 0.18,
          update: (mesh, t) => {
            const e = vfx._easeInOut(t);
            mesh.position.copyFrom(bezier(p0, p1, p2, e));
            mesh.rotation.z = side * 0.65;
          }
        });
      }

      // 4) Impact: gọn, rõ, tập trung đúng enemy.
      const impactDelay = 0.57;
      vfx.plane('impactBurst', target.clone(), 3.05, blue.core, 0.31, {
        delay: impactDelay,
        alpha: 0.46,
        startScale: 0.10,
        endScale: 1.18,
        spin: 0.34,
        fadeOut: 0.38
      });

      vfx.plane('slashCross', target.clone(), 2.75, blue.main, 0.36, {
        delay: impactDelay + 0.015,
        alpha: 0.38,
        startScale: 0.18,
        endScale: 1.28,
        spin: -0.48,
        fadeOut: 0.42
      });

      vfx.ring(ground, 0, 2.85, 0.40, {
        delay: impactDelay,
        startRadius: 0.42,
        thickness: 0.045,
        spin: 5.0
      });

      vfx.spark(target, 0, 9, 4.2, 0.40, {
        delay: impactDelay + 0.01,
        up: 1.15,
        gravity: 4.8
      });
    }
  });
})();
