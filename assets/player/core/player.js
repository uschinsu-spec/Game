(() => {
  "use strict";
  const B = window.BABYLON, CFG = window.PlayerConfig;

  /**
   * PlayerController: Hệ thống điều khiển nhân vật MMORPG chuẩn mượt mà:
   * - Quán tính vận tốc, gia tốc/hãm đà, xoay hướng mượt (Angular Slerp), ôm cua (Corner Cutting), nghiêng người (Body Banking).
   * - Input Buffering & Combo Chaining: Hủy đòn hồi chiêu để chém chuỗi combo 3 đòn liên hoàn linh hoạt.
   * - Phản hồi dính đòn theo hướng tấn công (Directional Hit Reaction).
   * - Đồng bộ bước chân Foot-lock & Strafe / Backpedal 2D Matrix.
   */
  class PlayerController {
    constructor(scene) {
      this.scene = scene;
      this.root = new B.TransformNode("player", scene);
      this.visual = new window.PlayerVisual(scene);
      this.visual.root.parent = this.root;

      this.speed = CFG.stats.moveSpeed || 7.0;
      this.maxHp = CFG.stats.maxHp || 180;
      this.hp = this.maxHp;
      this.gold = 0;
      this.dead = false;
      this.respawn = 0;
      this.path = [];
      this.invulnerable = 0;
      this.storageKey = "babylon-mmorpg-player-loadout-v3";

      // Logical movement is owned by PlayerMotor. Visual banking is applied only
      // to player_visualRoot so collision/navigation always use an upright root.
      if (!window.PlayerMotor) throw new Error("PlayerMotor chưa được tải trước PlayerController");
      this.motor = new window.PlayerMotor(this.root, {
        maxSpeed: this.speed, accel: 22.0, decel: 26.0, turnSpeed: 16.5, bankStrength: 0.18
      });

      // === COMBO CHAINING & INPUT BUFFER ===
      this._comboIndex = 0;
      this._inputBuffer = null;
    }

    async create(pos) {
      this.spawn = pos.clone();
      this.root.position.copyFrom(pos);
      this.motor.reset(pos, this.root.rotation.y || 0);
      await this.visual.load();
      await this._restoreEquipment();
    }

    get position() { return this.root.position; }
    getSocket(name) { return this.visual.getSocket(name); }

    // Lock character yaw to the combat target while an attack/cast is active.
    faceTarget(targetPosition) {
      if (!targetPosition || this.dead) return false;
      this._combatFacingTarget = targetPosition;
      const dx = targetPosition.x - this.position.x;
      const dz = targetPosition.z - this.position.z;
      if (dx * dx + dz * dz < 1e-6) return false;
      const yaw = Math.atan2(dx, dz);
      this.motor.currentYaw = yaw;
      this.root.rotation.x = 0;
      this.root.rotation.y = yaw;
      this.root.rotation.z = 0;
      return true;
    }

    async equip(slot, itemId) { const ok = await this.visual.equip(slot, itemId); this._saveEquipment(); return ok; }
    async unequip(slot) { const ok = await this.visual.unequip(slot); this._saveEquipment(); return ok; }
    async applyLoadout(loadout) { await this.visual.equipment.equipLoadout(loadout); this._saveEquipment(); return this.getEquipment(); }
    async resetEquipment() { await this.visual.equipment.equipLoadout(CFG.defaultLoadout); this._saveEquipment(); return this.getEquipment(); }

    _saveEquipment() { try { if (typeof localStorage !== "undefined" && !this.visual?.isGlbLoaded) localStorage.setItem(this.storageKey, JSON.stringify(this.getEquipment())); } catch {} }
    async _restoreEquipment() {
      try {
        if (typeof localStorage === "undefined") return;
        if (this.visual?.isGlbLoaded) {
          // GLB character model is active: ignore any legacy procedural parts from localStorage!
          return;
        }
        const raw = localStorage.getItem(this.storageKey);
        if (!raw) return;
        const saved = JSON.parse(raw);
        await this.visual.equipment.equipLoadout(saved);
      } catch {}
    }

    getEquipment() { return this.visual.getLoadout(); }
    listEquipment(slot) { return this.visual.listEquipment(slot); }

    update(dt, move, camera, world) {
      this.invulnerable = Math.max(0, (this.invulnerable || 0) - dt);

      // Xử lý trạng thái tử vong
      if (this.dead) {
        this.path = [];
        this.motor.stop();
        this.respawn -= dt;
        this.visual.update(dt, false, 0);
        if (this.respawn <= 0) {
          this.dead = false;
          this.hp = this.maxHp;
          this.motor.reset(this.spawn, 0);
          this.visual.root.rotation.set(0, 0, 0);
          this.visual.setState("Respawn");
          this.invulnerable = 2;
        }
        return;
      }

      let desiredDir = new B.Vector3(0, 0, 0);
      let inputMagnitude = 0;

      // 1. Điều khiển trực tiếp bằng Bàn phím / Phím ảo Joystick
      if (move && move.lengthSquared() >= 0.001) {
        this.path = []; // Hủy đường đi click chuột khi người chơi dùng phím
        const f = camera.getForwardRay().direction.clone();
        f.y = 0;
        f.normalize();
        const r = B.Vector3.Cross(B.Vector3.Up(), f).normalize();
        desiredDir = f.scale(move.y).add(r.scale(move.x));
        desiredDir.y = 0;
        inputMagnitude = Math.min(1.0, move.length());
        if (desiredDir.lengthSquared() > 0.001) desiredDir.normalize();
      }
      // 2. Điều khiển Click-to-Move với Look-ahead Steering & Corner Cutting
      else if (this.path.length > 0) {
        let targetPt = this.path[0];
        let toTarget = targetPt.subtract(this.position);
        toTarget.y = 0;
        let dist = toTarget.length();

        // Ôm cua thông minh (Corner Cutting)
        if (dist < 0.75 && this.path.length > 1) {
          this.path.shift();
          targetPt = this.path[0];
          toTarget = targetPt.subtract(this.position);
          toTarget.y = 0;
          dist = toTarget.length();
        }

        if (dist < 0.06 && this.path.length === 1) {
          this.path.shift();
          desiredDir.set(0, 0, 0);
          inputMagnitude = 0;
        } else {
          desiredDir = toTarget.normalize();
          // Look-ahead path steering: blend toward the following corner before
          // reaching the current waypoint to avoid robotic stop-turn-go motion.
          if (this.path.length > 1) {
            const next = this.path[1].subtract(this.position);
            next.y = 0;
            if (next.lengthSquared() > 0.001) {
              next.normalize();
              const lookAhead = Math.max(0, Math.min(0.42, (2.8 - dist) / 2.8 * 0.42));
              desiredDir = desiredDir.scale(1 - lookAhead).add(next.scale(lookAhead)).normalize();
            }
          }
          const arrival = this.path.length === 1 ? Math.min(1.0, dist / 0.75) : 1.0;
          inputMagnitude = Math.max(0.18, arrival);
        }
      }

      // 3. Character motor: translation, world constraint and logical yaw.
      // Analog response: small joystick motion walks, full deflection runs.
      if (inputMagnitude > 0 && inputMagnitude < 0.999) {
        const dead = 0.12;
        const t = Math.max(0, Math.min(1, (inputMagnitude - dead) / (1 - dead)));
        inputMagnitude = t * t * (3 - 2 * t);
      }

      const motion = this.motor.update(dt, desiredDir, inputMagnitude, world);
      const currentSpeed = motion.currentSpeed;
      const isMoving = motion.isMoving;
      let currentYaw = motion.yaw;

      // Combat facing takes priority over locomotion yaw during attack/cast.
      const animator = this.visual.animator;
      if (this._combatFacingTarget && animator?.action && !this.dead) {
        const dx = this._combatFacingTarget.x - this.position.x;
        const dz = this._combatFacingTarget.z - this.position.z;
        if (dx * dx + dz * dz >= 1e-6) {
          currentYaw = Math.atan2(dx, dz);
          this.motor.currentYaw = currentYaw;
          this.root.rotation.x = 0;
          this.root.rotation.y = currentYaw;
          this.root.rotation.z = 0;
        }
      } else {
        this._combatFacingTarget = null;
      }

      // Visual-only banking. Never rotate the logical root on Z.
      this.visual.root.rotation.z = motion.bank;

      // 4. Tính toán hướng di chuyển tương đối so với hướng mặt nhân vật (2D Blend Space input)
      let strafeX = 0, strafeZ = 1;
      if (isMoving && currentSpeed > 0.05) {
        const velDir = this.motor.currentVelocity.clone().normalize();
        const fX = Math.sin(currentYaw), fZ = Math.cos(currentYaw);
        const rX = Math.cos(currentYaw), rZ = -Math.sin(currentYaw);
        strafeZ = velDir.x * fX + velDir.z * fZ;
        strafeX = velDir.x * rX + velDir.z * rZ;
      }

      // 5. Xử lý Input Buffer cho đòn đánh kế tiếp (Combo Chaining)
      if (this._inputBuffer) {
        this._inputBuffer.time -= dt;
        if (this._inputBuffer.time <= 0) {
          this._inputBuffer = null;
        } else if (this.visual.animator.canCancelCombo()) {
          const buf = this._inputBuffer;
          this._inputBuffer = null;
          if (buf.type === "attack") this.playAttack();
          else if (buf.type === "skill") this.playSkill(buf.index);
        }
      }

      // 6. Đồng bộ hoạt ảnh theo vận tốc và hướng thực tế
      const speedNorm = motion.speedNorm;
      this.visual.update(dt, isMoving, speedNorm, {
        strafeX, strafeZ, yawDiff: motion.yawDiff, distance: motion.distance,
        velocity: this.motor.currentVelocity
      });
    }

    playAttack() {
      const animator = this.visual.animator;
      // Nếu đang trong đòn đánh cũ nhưng chưa đến lúc cancel -> buffer lại 200ms
      if (animator.action && animator.action.startsWith("Attack") && !animator.canCancelCombo()) {
        this._inputBuffer = { type: "attack", time: 0.25 };
        return;
      }

      // Chuỗi combo 3 đòn liên hoàn mượt mà (Attack1 -> Attack2 -> Attack3)
      this._comboIndex = ((this._comboIndex || 0) % 3) + 1;
      const stateName = `Attack${this._comboIndex}`;
      this.visual.setState(stateName);
    }

    playSkill(index) {
      const state = CFG.animation?.skillAnimationMap?.[index] || "Attack1";
      const animator = this.visual.animator;
      if (animator.action && !animator.canCancelCombo()) {
        this._inputBuffer = { type: "skill", index, time: 0.25 };
        return;
      }
      this.visual.setState(state);
    }

    takeDamage(v, sourcePos = null) {
      if (this.dead || this.invulnerable > 0) return;
      this.hp = Math.max(0, this.hp - v);
      if (this.hp <= 0) {
        this.dead = true;
        this.respawn = CFG.stats.respawnSeconds;
        this.visual.setState("Death");
      } else {
        // Tính toán hướng dính đòn (Directional Hit Reaction)
        let hitDirection = "Front";
        if (sourcePos) {
          const toSource = sourcePos.subtract(this.position);
          toSource.y = 0;
          toSource.normalize();
          const fX = Math.sin(this.motor.currentYaw), fZ = Math.cos(this.motor.currentYaw);
          const rX = Math.cos(this.motor.currentYaw), rZ = -Math.sin(this.motor.currentYaw);
          const dotF = toSource.x * fX + toSource.z * fZ;
          const dotR = toSource.x * rX + toSource.z * rZ;
          if (dotF < -0.4) hitDirection = "Back";
          else if (dotR > 0.45) hitDirection = "Right";
          else if (dotR < -0.45) hitDirection = "Left";
          else hitDirection = "Front";
        }
        this.visual.setState("Hit", { hitDirection });
      }
    }
  }

  window.PlayerController = PlayerController;
})();
