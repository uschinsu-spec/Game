(() => {
  "use strict";

  const B = window.BABYLON;

  /**
   * Hệ thống Attack Logic: Cho phép mỗi loại quái vật (GLB hoặc Procedural) sở hữu cơ chế tấn công riêng biệt.
   */
  const AttackHandlers = {
    /**
     * Tấn công cận chiến chuẩn (Melee)
     */
    melee(monster, player, damagePlayer, world, scene) {
      monster.visual.trigger("Attack");
      const damage = monster.damageBase + monster.level * monster.damagePerLevel;
      
      // Delay nhẹ theo animation đánh để trúng đòn chân thực
      const hitDelay = (monster.definition?.animation?.hitDelay || 0.25) * 1000;
      setTimeout(() => {
        if (!monster.alive) return;
        const dist = B.Vector3.Distance(monster.mesh.position, player.position);
        if (dist <= monster.attackRange + 1.2) {
          damagePlayer(damage, monster.mesh.position);
        }
      }, hitDelay);
    },

    /**
     * Tấn công tầm xa bắn đạn ma pháp / cung tiễn (Ranged Projectile)
     */
    ranged_projectile(monster, player, damagePlayer, world, scene) {
      monster.visual.trigger("Attack");
      const damage = monster.damageBase + monster.level * monster.damagePerLevel;

      if (!B || !scene) {
        damagePlayer(damage, monster.mesh.position);
        return;
      }

      // Tạo viên đạn bay từ quái đến người chơi
      const spawnPos = monster.mesh.position.clone().add(new B.Vector3(0, 1.2, 0));
      const proj = B.MeshBuilder.CreateSphere(`mob_proj_${monster.id}_${Date.now()}`, { diameter: 0.45, segments: 8 }, scene);
      proj.position.copyFrom(spawnPos);

      // Material đạn phát quang
      let mat = new B.StandardMaterial(`mob_proj_mat_${monster.id}`, scene);
      mat.diffuseColor = new B.Color3(1.0, 0.2, 0.1);
      mat.emissiveColor = new B.Color3(1.0, 0.5, 0.1);
      proj.material = mat;

      const targetPos = player.position.clone().add(new B.Vector3(0, 0.9, 0));
      const speed = 18.0; // Tốc độ bay
      let elapsed = 0;
      const totalDist = B.Vector3.Distance(spawnPos, targetPos);
      const duration = Math.max(0.2, totalDist / speed);

      const obs = scene.onBeforeRenderObservable.add(() => {
        elapsed += scene.getEngine().getDeltaTime() / 1000;
        const progress = Math.min(1.0, elapsed / duration);
        proj.position = B.Vector3.Lerp(spawnPos, targetPos, progress);

        if (progress >= 1.0) {
          scene.onBeforeRenderObservable.remove(obs);
          proj.dispose();
          mat.dispose();

          const curDist = B.Vector3.Distance(targetPos, player.position);
          if (curDist < 2.5) {
            damagePlayer(damage, spawnPos);
          }
        }
      });
    },

    /**
     * Đòn dậm đất nổ AOE xung kích (Area Slam)
     */
    area_slam(monster, player, damagePlayer, world, scene) {
      monster.visual.trigger("Attack");
      const damage = (monster.damageBase + monster.level * monster.damagePerLevel) * 1.35;
      const aoeRadius = monster.definition?.combat?.aoeRadius || 4.5;

      setTimeout(() => {
        if (!monster.alive) return;
        const dist = B.Vector3.Distance(monster.mesh.position, player.position);
        if (dist <= aoeRadius) {
          damagePlayer(damage, monster.mesh.position);
        }

        // Tạo vòng sóng xung kích tỏa ra
        if (B && scene) {
          const wave = B.MeshBuilder.CreateTorus(`mob_slam_${monster.id}`, { diameter: 1.0, thickness: 0.15, tessellation: 24 }, scene);
          wave.position.copyFrom(monster.mesh.position);
          wave.position.y = 0.1;

          let wMat = new B.StandardMaterial(`slam_mat_${monster.id}`, scene);
          wMat.emissiveColor = new B.Color3(0.2, 0.8, 1.0);
          wMat.alpha = 0.9;
          wave.material = wMat;

          let wTime = 0;
          const wObs = scene.onBeforeRenderObservable.add(() => {
            wTime += scene.getEngine().getDeltaTime() / 1000;
            const wp = wTime / 0.45;
            wave.scaling.setAll(1.0 + wp * (aoeRadius * 2));
            wMat.alpha = 0.9 * (1.0 - wp);
            if (wp >= 1.0) {
              scene.onBeforeRenderObservable.remove(wObs);
              wave.dispose();
              wMat.dispose();
            }
          });
        }
      }, 400);
    },

    /**
     * Lướt nhanh xuyên người chơi (Dash Strike)
     */
    dash_strike(monster, player, damagePlayer, world, scene) {
      monster.visual.trigger("Attack");
      const damage = (monster.damageBase + monster.level * monster.damagePerLevel) * 1.2;
      const dir = player.position.subtract(monster.mesh.position);
      dir.y = 0;
      dir.normalize();

      // Lướt quái vật về phía trước
      monster.mesh.position.addInPlace(dir.scale(2.2));
      world?.constrain(monster.mesh.position);

      setTimeout(() => {
        if (!monster.alive) return;
        damagePlayer(damage, monster.mesh.position);
      }, 200);
    }
  };

  const AttackSystem = {
    /**
     * Thực thi đòn tấn công cho quái vật
     */
    execute(monster, player, damagePlayer, world, scene) {
      const kind = monster.kind;
      const customLogic = window.EnemyRegistry?.getAttackLogic(kind);
      
      if (typeof customLogic === "function") {
        customLogic(monster, player, damagePlayer, world, scene);
        return;
      } else if (customLogic && typeof customLogic.execute === "function") {
        customLogic.execute(monster, player, damagePlayer, world, scene);
        return;
      }

      const attackType = monster.definition?.combat?.attackType || "melee";
      const handler = AttackHandlers[attackType] || AttackHandlers.melee;
      handler(monster, player, damagePlayer, world, scene);
    },

    /**
     * Đăng ký handler tùy biến mới
     */
    registerHandler(name, fn) {
      AttackHandlers[name] = fn;
    }
  };

  window.AttackSystem = AttackSystem;
})();
