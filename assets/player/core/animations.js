(() => {
  "use strict";
  const CFG = window.PlayerConfig;

  // Danh sách các node phân chia thân trên và thân dưới cho Animation Layering
  const LOWER_NODES = new Set(["pelvis", "hipL", "hipR", "thighL", "thighR", "shinL", "shinR", "footL", "footR", "toeL", "toeR"]);
  const UPPER_NODES = new Set(["spineLower", "spineUpper", "chest", "neck", "head", "clavicleL", "clavicleR", "upperArmL", "upperArmR", "forearmL", "forearmR", "handL", "handR"]);
  const ACTION_PRIORITY = Object.freeze({
    Death: 100, Respawn: 90, Knockdown: 80, Hit: 70, Stun: 65,
    CastMeteor: 55, CastBeam: 55, CastBurst: 55, Cast: 55,
    Attack3: 52, Attack2: 51, Attack1: 50
  });

  /**
   * PlayerAnimator: Hệ thống hoạt ảnh MMORPG chuẩn AAA cao cấp:
   * 1. Pose Buffer Crossfade (150ms): Nội suy mượt mà 100% giữa mọi trạng thái, loại bỏ hoàn toàn hiện tượng giật/snap hình.
   * 2. Animation Layering: Tách biệt thân trên (Upper) và thân dưới (Lower), vừa chạy vừa chém/cast chiêu không bị khựng chân.
   * 3. Foot-Lock Gait: Tần số bước chân đồng bộ 1:1 theo quãng đường di chuyển thực tế (Distance-traveled), triệt tiêu foot skating.
   * 4. 2D Strafe / Backpedal Matrix: Nhận diện hướng di chuyển tiến/lùi/ngang theo hướng mặt nhân vật.
   * 5. Directional Hit Reaction: Phản xạ dính đòn theo 4 hướng (Trước, Sau, Trái, Phải).
   * 6. Combo-Cancel Window: Cho phép hủy đòn hồi chiêu ở 65% frame để chuỗi combo kiếm hiệp chém liên hoàn 3 đòn.
   */
  class PlayerAnimator {
    constructor(rig) {
      this.rig = rig;
      this.state = "Idle";
      this.locomotion = "Idle";
      this.action = null;
      this.actionTime = 0;
      this.elapsed = 0;
      this.speedNorm = 0;

      // === FOOT-LOCK & DISTANCE-TRAVELED GAIT ENGINE ===
      this.gaitPhase = 0;
      this.strafeX = 0; // -1 (trái) -> +1 (phải)
      this.strafeZ = 1; // +1 (tiến) -> -1 (lùi)

      // === POSE BUFFER CROSSFADE ENGINE ===
      this._prevPose = null;
      this._targetPose = {};
      this._transitionTime = 0;
      this._transitionDuration = 0.15; // 150ms blend window
      this._isBlending = false;

      // === DIRECTIONAL HIT CONTEXT ===
      this.hitDirection = "Front"; // Front | Back | Left | Right

      // === COMBO CHAINING ===
      this.comboStage = 0; // 0: None, 1: Attack1, 2: Attack2, 3: Attack3
      this.onEvent = null;
      this._lastActionProgress = 0;
    }

    setLocomotion(state) {
      if (this.action === "Death") return;
      const next = state === "Run" ? "Run" : state === "Walk" ? "Walk" : "Idle";
      if (this.locomotion !== next) {
        if (!this.action) this._startCrossfade();
        this.locomotion = next;
      }
      if (!this.action) this.state = this.locomotion;
    }

    trigger(state, context = null) {
      if (this.action === "Death" && state !== "Respawn") return;
      if (state === "Idle" || state === "Walk" || state === "Run") {
        this.setLocomotion(state);
        return;
      }

      // Xử lý góc dính đòn
      if (state === "Hit" && context?.hitDirection) {
        this.hitDirection = context.hitDirection;
      }

      // Priority arbitration: reaction/death states cannot be accidentally
      // overwritten by a lower-priority attack/cast from another subsystem.
      if (this.action) {
        const currentPriority = ACTION_PRIORITY[this.action] || 0;
        const nextPriority = ACTION_PRIORITY[state] || 0;
        const comboOverride = this.action.startsWith("Attack") && state.startsWith("Attack") && this.canCancelCombo();
        if (nextPriority < currentPriority && !comboOverride) return;
      }

      // Khởi động Crossfade mượt mà sang Action mới
      this._startCrossfade();
      this.action = state;
      this.state = state;
      this.actionTime = 0;
      this._lastActionProgress = 0;
    }

    _startCrossfade() {
      // Lưu lại snapshot tư thế hiện tại của tất cả các node làm điểm bắt đầu blend
      this._prevPose = {};
      for (const name in this.rig.nodes) {
        const node = this.rig.nodes[name];
        this._prevPose[name] = {
          p: node.position.clone(),
          r: node.rotation.clone(),
          s: node.scaling.clone()
        };
      }
      this._transitionTime = 0;
      this._isBlending = true;
    }

    _duration(state) {
      return CFG.animation?.durations?.[state] || 0.5;
    }

    /**
     * Kiểm tra khung thời gian cho phép Cancel đòn sang combo tiếp theo (Cancel Window > 60%)
     */
    canCancelCombo() {
      if (!this.action || !this.action.startsWith("Attack")) return false;
      const d = this._duration(this.action);
      const progress = d ? this.actionTime / d : 1;
      const marks = CFG.animation?.markers?.[this.action];
      const open = marks?.comboOpen ?? 0.60;
      const close = marks?.comboClose ?? 1.0;
      return progress >= open && progress <= close;
    }

    update(dt, speedNorm = 0, locomotionContext = null) {
      this.elapsed += dt;
      this.speedNorm = speedNorm;

      // Cập nhật ngữ cảnh di chuyển 2D (Strafe & Backpedal)
      if (locomotionContext) {
        this.strafeX = locomotionContext.strafeX !== undefined ? locomotionContext.strafeX : 0;
        this.strafeZ = locomotionContext.strafeZ !== undefined ? locomotionContext.strafeZ : 1;
      }

      // Đồng bộ bước chân theo khoảng cách di chuyển thực tế (Foot-Lock)
      const isMoving = this.speedNorm > 0.05;
      if (isMoving) {
        const isRun = this.locomotion === "Run";
        const moveSpeed = this.speedNorm * (CFG.stats.moveSpeed || 7.0);
        const strideLength = isRun ? 1.75 : 1.15; // Chu kỳ bước chân
        const travelled = locomotionContext?.distance !== undefined ? locomotionContext.distance : moveSpeed * dt;
        const deltaPhase = (travelled * Math.PI * 2) / strideLength;
        this.gaitPhase = (this.gaitPhase + deltaPhase) % (Math.PI * 2);
      } else {
        // Trả pha chân êm dịu về trạng thái nghỉ khi đứng yên
        this.gaitPhase *= Math.max(0, 1.0 - 12.0 * dt);
      }

      // Xử lý thời gian action
      if (this.action) {
        const activeAction = this.action;
        const d = this._duration(activeAction);
        const previousProgress = d ? Math.min(1, this.actionTime / d) : 0;
        this.actionTime += dt;
        const progress = d ? Math.min(1, this.actionTime / d) : 1;
        this._emitMarkers(activeAction, previousProgress, progress);
        this._lastActionProgress = progress;
        if (this.action !== "Death" && this.actionTime >= d) {
          this._startCrossfade();
          this.action = null;
          this.actionTime = 0;
          this._lastActionProgress = 0;
          this.state = this.locomotion;
        }
      }

      // Reset rig về base pose trước khi tính toán frame mới
      this.rig.resetPose();
      const n = this.rig.nodes;

      // =========================================================================
      // ANIMATION LAYERING: TÁCH THÂN TRÊN & THÂN DƯỚI KHI VỪA ĐI VỪA ĐÁNH
      // =========================================================================
      const isLayeredAction = this.action && !["Death", "Respawn"].includes(this.action) && isMoving;

      if (isLayeredAction) {
        // 1. Solve locomotion first and snapshot the lower-body result.
        this._solveGait(this.locomotion === "Run");
        const lowerPose = this._captureNodes(LOWER_NODES);

        // 2. Evaluate the action, then restore the locomotion lower-body mask.
        // This makes LOWER_NODES/UPPER_NODES a real animation layer instead of
        // merely documentation: attacks/casts can no longer overwrite the legs.
        this._evaluateActionPose(this.action);
        this._restoreNodes(lowerPose);
      } else {
        // Khi đứng yên hoặc không có action: Áp dụng toàn thân
        const activeState = this.action || this.locomotion;
        this.state = activeState;

        if (activeState === "Idle") this._idle();
        else if (activeState === "Walk") this._solveGait(false);
        else if (activeState === "Run") this._solveGait(true);
        else this._evaluateActionPose(activeState);
      }

      // =========================================================================
      // POSE BUFFER CROSSFADE BLEND ENGINE (150ms Smooth Interpolation)
      // =========================================================================
      if (this._isBlending && this._prevPose) {
        this._transitionTime += dt;
        const progress = Math.min(1.0, this._transitionTime / this._transitionDuration);
        // Hermite Smoothstep S-curve
        const blend = progress * progress * (3.0 - 2.0 * progress);

        for (const name in n) {
          const targetNode = n[name];
          const prev = this._prevPose[name];
          if (prev) {
            targetNode.position.x = prev.p.x + (targetNode.position.x - prev.p.x) * blend;
            targetNode.position.y = prev.p.y + (targetNode.position.y - prev.p.y) * blend;
            targetNode.position.z = prev.p.z + (targetNode.position.z - prev.p.z) * blend;

            // Quaternion slerp avoids Euler wrap/gimbal artifacts on wide sword
            // swings and spin attacks while keeping the procedural rig Euler API.
            const q0 = BABYLON.Quaternion.FromEulerAngles(prev.r.x, prev.r.y, prev.r.z);
            const q1 = BABYLON.Quaternion.FromEulerAngles(targetNode.rotation.x, targetNode.rotation.y, targetNode.rotation.z);
            const e = BABYLON.Quaternion.Slerp(q0, q1, blend).toEulerAngles();
            targetNode.rotation.copyFrom(e);
          }
        }

        if (progress >= 1.0) {
          this._isBlending = false;
          this._prevPose = null;
        }
      }
    }

    _captureNodes(mask) {
      const out = {};
      for (const name of mask) {
        const node = this.rig.nodes[name];
        if (!node) continue;
        out[name] = { p: node.position.clone(), r: node.rotation.clone(), s: node.scaling.clone() };
      }
      return out;
    }

    _restoreNodes(pose) {
      for (const name in pose) {
        const node = this.rig.nodes[name], v = pose[name];
        if (!node) continue;
        node.position.copyFrom(v.p);
        node.rotation.copyFrom(v.r);
        node.scaling.copyFrom(v.s);
      }
    }

    _emitMarkers(action, from, to) {
      const markers = CFG.animation?.markers?.[action];
      if (!markers || to < from) return;
      for (const [name, at] of Object.entries(markers)) {
        if (at > from && at <= to) this.onEvent?.({ action, name, progress: at });
      }
    }

    _evaluateActionPose(action) {
      if (action === "Attack1") this._attack1();
      else if (action === "Attack2") this._attack2();
      else if (action === "Attack3") this._attack3();
      else if (action === "Cast" || action === "CastMeteor") this._castMeteor();
      else if (action === "CastBeam") this._castBeam();
      else if (action === "CastBurst") this._castBurst();
      else if (action === "Hit") this._hit();
      else if (action === "Death") this._death();
      else if (action === "Respawn") this._respawn();
    }

    _p() {
      const d = this._duration(this.action || this.state);
      return Math.min(1, d ? this.actionTime / d : 0);
    }

    _n() {
      return this.rig.nodes;
    }

    // =========================================================================
    // 1. IDLE - DÁNG ĐỨNG THỞ SÂU VỚI VI CHUYỂN ĐỘNG TRỌNG LƯỢNG
    // =========================================================================
    _idle() {
      const n = this._n(), t = this.elapsed;
      const breathe = Math.sin(t * 2.2);
      const sway = Math.sin(t * 0.75);
      const shift = Math.sin(t * 0.42);

      n.pelvis.position.y += breathe * 0.010;
      n.pelvis.position.x += shift * 0.009;
      n.pelvis.rotation.z = shift * 0.014;
      n.pelvis.rotation.y = sway * 0.012;

      n.spineLower.rotation.z = -shift * 0.010;
      n.spineUpper.rotation.x = breathe * 0.020;
      n.chest.rotation.y = -sway * 0.018;

      n.head.rotation.y = Math.sin(t * 0.38) * 0.075 + Math.sin(t * 1.1) * 0.025;
      n.head.rotation.x = Math.sin(t * 0.55) * 0.030;

      // Tư thế đứng oai vệ chuẩn game bom tấn MMORPG (Heroic stance, feet slightly apart)
      n.thighL.rotation.z = -0.07;
      n.thighR.rotation.z = 0.07;
      n.shinL.rotation.z = 0.07;
      n.shinR.rotation.z = -0.07;

      // Tay trái thả lỏng tự nhiên, tay phải cầm kiếm hướng xuống đất chếch nhẹ ra ngoài
      n.upperArmL.rotation.z = 0.18 + breathe * 0.012;
      n.upperArmL.rotation.x = 0.04 + sway * 0.02;
      n.upperArmR.rotation.z = -0.18 - breathe * 0.012;
      n.upperArmR.rotation.x = -0.14 - sway * 0.02;

      n.forearmL.rotation.x = -0.28;
      n.forearmR.rotation.x = 0.08;
      n.handR.rotation.x = -0.15;
      n.handR.rotation.y = 0.22;
      n.handL.rotation.y = -0.15;
    }

    // =========================================================================
    // 2. BIOMECHANICAL GAIT (FOOT-LOCKING & 2D STRAFE/BACKPEDAL MATRIX)
    // =========================================================================
    _solveGait(isRun) {
      const n = this._n();
      const factor = Math.max(0.25, Math.min(1.25, this.speedNorm || (isRun ? 1.0 : 0.55)));
      const basePhase = this.gaitPhase;

      const isBackpedal = this.strafeZ < -0.25;
      const isStrafe = Math.abs(this.strafeX) > 0.45;

      // Điều chỉnh biên độ bước theo tốc độ và kiểu đi
      const maxThighFront = (isRun ? 0.88 : 0.44) * (isBackpedal ? 0.7 : 1.0);
      const maxThighBack  = (isRun ? 0.76 : 0.38) * (isBackpedal ? 0.9 : 1.0);
      const maxKneeFlex   = isRun ? 1.05 : 0.62;
      const armSwingAmp   = (isRun ? 0.82 : 0.38) * (isBackpedal ? 0.5 : 1.0);
      const forwardLean   = isBackpedal ? -0.05 : (isRun ? (0.12 + factor * 0.06) : 0.035);

      // --- Khung chậu & Thân mình ---
      const bounceAmp = isRun ? (0.038 + factor * 0.022) : 0.016;
      const swayAmp   = isRun ? 0.022 : 0.018;
      const twistAmp  = isRun ? 0.082 : 0.038;

      n.pelvis.position.y += Math.abs(Math.sin(basePhase)) * bounceAmp - (isRun ? 0.015 : 0.005);
      n.pelvis.position.x += Math.sin(basePhase) * swayAmp + this.strafeX * 0.015;
      n.pelvis.rotation.y = Math.sin(basePhase) * twistAmp + this.strafeX * 0.08;
      n.pelvis.rotation.z = -Math.sin(basePhase) * (isRun ? 0.035 : 0.022) - this.strafeX * 0.04;

      n.spineLower.rotation.x = forwardLean;
      n.spineUpper.rotation.x = forwardLean * 0.5;
      n.chest.rotation.x = forwardLean * 0.3;
      n.chest.rotation.y = -Math.sin(basePhase) * (twistAmp * 1.25) - this.strafeX * 0.06;
      n.neck.rotation.x = -forwardLean * 0.7;
      n.head.rotation.x = -forwardLean * 0.3;

      // --- 2 Chân phi đối xứng chuẩn bám đất Foot-lock ---
      for (const side of [-1, 1]) {
        const s = side < 0 ? "L" : "R";
        const phaseOffset = side < 0 ? 0 : Math.PI;
        let p = (basePhase + phaseOffset) % (Math.PI * 2);
        if (p < 0) p += Math.PI * 2;
        const u = p / (Math.PI * 2);

        let thighX = 0, shinX = 0, footX = 0, toeX = 0;
        let thighZ = side * 0.02 + this.strafeX * 0.05;

        // Đi lùi (Backpedal)
        if (isBackpedal) {
          if (u < 0.60) {
            const prog = u / 0.60;
            thighX = -maxThighBack * (1.0 - 2.0 * prog);
            shinX = -0.05 - Math.sin(prog * Math.PI) * 0.15;
            footX = -0.12 * (1.0 - prog);
          } else {
            const prog = (u - 0.60) / 0.40;
            const swingEase = 0.5 - 0.5 * Math.cos(prog * Math.PI);
            thighX = maxThighFront - (maxThighFront + maxThighBack) * swingEase;
            shinX = -Math.sin(prog * Math.PI) * (maxKneeFlex * 0.85);
            footX = -0.15 * Math.sin(prog * Math.PI);
          }
        } 
        // Đi tiến / Chạy (Forward / Sprint)
        else {
          if (u < 0.60) {
            const prog = u / 0.60;
            thighX = maxThighFront * (1.0 - 2.0 * prog);
            shinX = -0.04 - Math.sin(prog * Math.PI) * (isRun ? 0.24 : 0.10);

            if (prog < 0.25) {
              footX = 0.14 * (1.0 - prog / 0.25);
              toeX = 0.05;
            } else if (prog < 0.75) {
              footX = 0.0;
              toeX = 0.0;
            } else {
              const push = (prog - 0.75) / 0.25;
              footX = -0.22 * push;
              toeX = 0.28 * push;
            }
          } else {
            const prog = (u - 0.60) / 0.40;
            const swingEase = 0.5 - 0.5 * Math.cos(prog * Math.PI);
            thighX = -maxThighBack + (maxThighFront + maxThighBack) * swingEase;
            const kneeCurve = Math.sin(prog * Math.PI);
            shinX = -kneeCurve * maxKneeFlex;
            footX = 0.18 * kneeCurve;
            toeX = 0.10 * kneeCurve;
            thighZ += side * (kneeCurve * 0.045);
          }
        }

        n[`thigh${s}`].rotation.x = thighX;
        n[`thigh${s}`].rotation.z = thighZ;
        n[`shin${s}`].rotation.x = shinX;
        n[`foot${s}`].rotation.x = footX;
        n[`toe${s}`].rotation.x = toeX;

        // --- 2 Tay vung động có gập khuỷu tay ---
        const armPhase = p + Math.PI;
        const armSwing = Math.sin(armPhase);

        n[`clavicle${s}`].rotation.z = side * (armSwing * (isRun ? 0.075 : 0.035));
        n[`clavicle${s}`].rotation.y = -side * (armSwing * (isRun ? 0.060 : 0.025));

        n[`upperArm${s}`].rotation.x = armSwing * armSwingAmp;
        n[`upperArm${s}`].rotation.z = side * (0.10 + Math.max(0, armSwing) * 0.08);
        n[`upperArm${s}`].rotation.y = -side * (0.05 + armSwing * 0.08);

        const baseElbow = isRun ? -0.65 : -0.22;
        const forwardFlex = Math.max(0, armSwing) * (isRun ? 0.48 : 0.28);
        const backwardExtend = Math.max(0, -armSwing) * (isRun ? 0.25 : 0.12);
        n[`forearm${s}`].rotation.x = baseElbow - forwardFlex + backwardExtend;

        const handLag = Math.sin(armPhase - 0.45);
        n[`hand${s}`].rotation.x = handLag * (isRun ? 0.24 : 0.12);
        n[`hand${s}`].rotation.y = side * 0.08;
      }
    }

    // =========================================================================
    // 3. COMBO 1: KIẾM KHÍ TRẢM (CRESCENT SLASH)
    // =========================================================================
    _attack1() {
      const n = this._n(), p = this._p();
      const wind = Math.sin(Math.min(1, p * 3.5) * Math.PI * 0.5);
      const slash = Math.sin(Math.max(0, (p - 0.28) / 0.72) * Math.PI);

      n.pelvis.position.y -= wind * 0.035;
      n.pelvis.position.z += slash * 0.09;
      n.pelvis.rotation.y = -wind * 0.38 + slash * 0.65;
      n.pelvis.rotation.z = -slash * 0.08;

      n.spineLower.rotation.x = wind * 0.05 + slash * 0.18;
      n.spineUpper.rotation.x = slash * 0.12;
      n.chest.rotation.y = -wind * 0.62 + slash * 1.15;
      n.chest.rotation.z = -wind * 0.10 + slash * 0.15;

      n.clavicleR.rotation.z = -wind * 0.22 + slash * 0.35;
      n.upperArmR.rotation.x = -wind * 1.55 + slash * 2.15;
      n.upperArmR.rotation.z = -wind * 0.55 + slash * 0.45;
      n.upperArmR.rotation.y = -wind * 0.35 + slash * 0.65;

      n.forearmR.rotation.x = -wind * 0.95 + slash * 0.45;
      n.handR.rotation.z = -wind * 0.42 + slash * 0.65;
      n.handR.rotation.y = slash * 0.45;

      n.upperArmL.rotation.x = wind * 0.55 - slash * 0.45;
      n.upperArmL.rotation.z = wind * 0.35 + slash * 0.25;
      n.forearmL.rotation.x = -0.35;

      n.thighL.rotation.x = -wind * 0.15 - slash * 0.22;
      n.thighR.rotation.x = wind * 0.25 + slash * 0.28;
      n.shinL.rotation.x = -slash * 0.25;
    }

    // =========================================================================
    // 4. COMBO 2: PHONG LUÂN KIẾM BÃO (360 CYCLONE SPIN)
    // =========================================================================
    _attack2() {
      const n = this._n(), p = this._p();
      const wind = Math.sin(Math.min(1, p * 3.3) * Math.PI * 0.5);
      const spin = Math.sin(Math.max(0, (p - 0.30) / 0.70) * Math.PI);
      const fullSpin = p * Math.PI * 2.2;

      n.pelvis.position.y += -wind * 0.05 + spin * 0.08;
      n.pelvis.rotation.y = wind * 0.55 - spin * 1.65;
      n.chest.rotation.y = wind * 0.85 - spin * 2.10;
      n.chest.rotation.x = wind * 0.08 + spin * 0.15;

      n.clavicleR.rotation.z = -wind * 0.15 + spin * 0.25;
      n.upperArmR.rotation.x = -wind * 0.95 + spin * 1.65;
      n.upperArmR.rotation.z = -wind * 1.25 + spin * 1.45;
      n.upperArmR.rotation.y = spin * 0.85;

      n.forearmR.rotation.x = -wind * 1.25 + spin * 0.65;
      n.handR.rotation.y = wind * 0.55 - spin * 0.95;

      n.upperArmL.rotation.x = -wind * 0.45 - spin * 0.55;
      n.upperArmL.rotation.z = wind * 0.35 + spin * 0.95;
      n.forearmL.rotation.x = -0.45;

      n.thighL.rotation.x = Math.sin(fullSpin) * 0.35;
      n.thighR.rotation.x = Math.sin(fullSpin + Math.PI) * 0.35;
      n.head.rotation.y = -spin * 0.75;
    }

    // =========================================================================
    // 5. COMBO 3: THIÊN KIẾM BỔ TRẢM (OVERHEAD FINISHER SMASH)
    // =========================================================================
    _attack3() {
      const n = this._n(), p = this._p();
      const rise = Math.sin(Math.min(1, p * 2.5) * Math.PI * 0.5);
      const strike = Math.sin(Math.max(0, (p - 0.40) / 0.60) * Math.PI);

      n.pelvis.position.y += rise * 0.12 - strike * 0.10;
      n.pelvis.position.z += strike * 0.18;
      n.spineLower.rotation.x = -rise * 0.15 + strike * 0.35;
      n.chest.rotation.x = -rise * 0.22 + strike * 0.45;

      n.upperArmR.rotation.x = -rise * 2.15 + strike * 1.85;
      n.upperArmL.rotation.x = -rise * 1.85 + strike * 1.45;
      n.upperArmR.rotation.z = -rise * 0.15 + strike * 0.15;
      n.upperArmL.rotation.z = rise * 0.25 - strike * 0.15;

      n.forearmR.rotation.x = -rise * 0.45 + strike * 0.35;
      n.forearmL.rotation.x = -rise * 0.65 + strike * 0.35;
      n.handR.rotation.x = strike * 0.45;

      n.thighL.rotation.x = -strike * 0.35;
      n.thighR.rotation.x = strike * 0.35;
      n.shinL.rotation.x = -strike * 0.35;
    }

    // =========================================================================
    // 6. CAST METEOR - THIÊN THẠCH TRẢM (EARTH SHATTERER)
    // =========================================================================
    _castMeteor() {
      const n = this._n(), p = this._p();
      const charge = Math.sin(Math.min(1, p * 2.2) * Math.PI * 0.5);
      const smash = Math.sin(Math.max(0, (p - 0.45) / 0.55) * Math.PI);
      const vibrate = Math.sin(p * Math.PI * 14) * (1 - p) * 0.02;

      n.pelvis.position.y += -charge * 0.06 + smash * 0.12 - (p > 0.65 ? (p - 0.65) * 0.35 : 0) + vibrate;
      n.pelvis.position.z += smash * 0.15;
      n.spineLower.rotation.x = -charge * 0.22 + smash * 0.48;
      n.spineUpper.rotation.x = -charge * 0.28 + smash * 0.55;
      n.chest.rotation.x = -charge * 0.35 + smash * 0.62;

      n.neck.rotation.x = -charge * 0.38 + smash * 0.25;
      n.head.rotation.x = -charge * 0.42 + smash * 0.28;

      n.clavicleL.rotation.z = -charge * 0.25 + smash * 0.15;
      n.clavicleR.rotation.z = charge * 0.25 - smash * 0.15;

      n.upperArmR.rotation.x = -charge * 2.35 + smash * 1.85;
      n.upperArmL.rotation.x = -charge * 2.35 + smash * 1.85;
      n.upperArmR.rotation.z = -charge * 0.25 + smash * 0.12;
      n.upperArmL.rotation.z = charge * 0.25 - smash * 0.12;

      n.forearmR.rotation.x = -charge * 0.45 + smash * 0.25;
      n.forearmL.rotation.x = -charge * 0.45 + smash * 0.25;

      n.handR.rotation.x = -charge * 0.55 + smash * 0.35;
      n.handL.rotation.x = -charge * 0.55 + smash * 0.35;

      n.thighL.rotation.z = -0.18;
      n.thighR.rotation.z = 0.18;
      n.thighL.rotation.x = -charge * 0.15 + smash * 0.42;
      n.thighR.rotation.x = charge * 0.12 - smash * 0.28;
      n.shinL.rotation.x = -smash * 0.45;
      n.shinR.rotation.x = -smash * 0.35;
    }

    // =========================================================================
    // 7. CAST BEAM - LÔI KÍCH ĐỘT KÍCH (LIGHTNING THRUST)
    // =========================================================================
    _castBeam() {
      const n = this._n(), p = this._p();
      const chamber = Math.sin(Math.min(1, p * 3.1) * Math.PI * 0.5);
      const thrust = Math.sin(Math.max(0, (p - 0.32) / 0.68) * Math.PI);
      const recoilVibrate = Math.sin(p * Math.PI * 18) * thrust * 0.035;

      n.pelvis.position.z += thrust * 0.18;
      n.pelvis.position.y -= thrust * 0.04;
      n.pelvis.rotation.y = -chamber * 0.25 + thrust * 0.12;
      n.chest.rotation.y = -chamber * 0.52 + thrust * 0.25;
      n.spineUpper.rotation.x = -chamber * 0.05 + thrust * 0.25;

      n.clavicleR.rotation.z = -chamber * 0.18;
      n.upperArmR.rotation.x = -chamber * 0.45 - thrust * 1.58;
      n.upperArmR.rotation.z = -chamber * 0.25;
      n.forearmR.rotation.x = -chamber * 1.55 + thrust * 1.48 + recoilVibrate;
      n.handR.rotation.x = -0.05 + recoilVibrate;
      n.handR.rotation.z = -chamber * 0.22;

      n.upperArmL.rotation.x = chamber * 0.45 - thrust * 0.35;
      n.upperArmL.rotation.z = chamber * 0.45;
      n.forearmL.rotation.x = -chamber * 1.35;
      n.handL.rotation.y = chamber * 0.85;

      n.thighL.rotation.x = -thrust * 0.45;
      n.thighR.rotation.x = thrust * 0.38;
      n.shinL.rotation.x = -thrust * 0.42;

      n.head.rotation.y = chamber * 0.22;
    }

    // =========================================================================
    // 8. CAST BURST - LIÊN HOA TRẢM (LOTUS FLOURISH)
    // =========================================================================
    _castBurst() {
      const n = this._n(), p = this._p();
      const gather = Math.sin(Math.min(1, p * 2.4) * Math.PI * 0.5);
      const bloom = Math.sin(Math.max(0, (p - 0.42) / 0.58) * Math.PI);

      n.pelvis.position.y += gather * 0.16 - bloom * 0.08;
      n.spineUpper.rotation.x = -gather * 0.16 + bloom * 0.12;
      n.chest.rotation.x = -gather * 0.24 + bloom * 0.15;
      n.chest.rotation.y = Math.sin(p * Math.PI * 2) * 0.12;

      n.upperArmR.rotation.x = -gather * 0.85 - bloom * 0.55;
      n.upperArmR.rotation.z = -gather * 0.55 - bloom * 1.15;
      n.forearmR.rotation.x = -gather * 1.35 + bloom * 0.65;
      n.handR.rotation.y = gather * 0.85 - bloom * 0.45;

      n.upperArmL.rotation.x = -gather * 0.75 - bloom * 0.45;
      n.upperArmL.rotation.z = gather * 0.55 + bloom * 1.15;
      n.forearmL.rotation.x = -gather * 1.25 + bloom * 0.55;

      n.thighL.rotation.x = -gather * 0.22;
      n.thighR.rotation.x = -gather * 0.22;
      n.footL.rotation.x = gather * 0.28;
      n.footR.rotation.x = gather * 0.28;
    }

    // =========================================================================
    // 9. DIRECTIONAL HIT REACTION (PHẢN HỒI THEO HƯỚNG BỊ TẤN CÔNG)
    // =========================================================================
    _hit() {
      const n = this._n(), p = this._p();
      const e = Math.sin(p * Math.PI);

      if (this.hitDirection === "Back") {
        // Bị đánh từ sau lưng: chúi người về trước
        n.pelvis.position.z += e * 0.18;
        n.spineLower.rotation.x = e * 0.28;
        n.spineUpper.rotation.x = e * 0.24;
        n.head.rotation.x = -e * 0.22;
      } else if (this.hitDirection === "Left") {
        // Bị đánh từ bên trái: nghiêng giật sang phải
        n.pelvis.position.x += e * 0.15;
        n.spineLower.rotation.z = -e * 0.25;
        n.chest.rotation.z = -e * 0.22;
        n.head.rotation.z = -e * 0.18;
      } else if (this.hitDirection === "Right") {
        // Bị đánh từ bên phải: nghiêng giật sang trái
        n.pelvis.position.x -= e * 0.15;
        n.spineLower.rotation.z = e * 0.25;
        n.chest.rotation.z = e * 0.22;
        n.head.rotation.z = e * 0.18;
      } else {
        // Bị đánh từ phía trước (Front): giật ngửa ra sau
        n.pelvis.position.z -= e * 0.18;
        n.spineLower.rotation.x = -e * 0.26;
        n.spineUpper.rotation.z = Math.sin(p * Math.PI * 2) * e * 0.08;
        n.head.rotation.x = e * 0.26;
        n.upperArmL.rotation.x = e * 0.35;
        n.upperArmR.rotation.x = e * 0.42;
      }
    }

    // =========================================================================
    // 10. DEATH & RESPAWN
    // =========================================================================
    _death() {
      const n = this._n(), p = this._p(), e = 1 - Math.pow(1 - p, 2);
      n.pelvis.rotation.x = e * 1.25;
      n.pelvis.position.y -= e * 0.65;
      n.pelvis.position.z -= e * 0.30;
      n.spineLower.rotation.x = e * 0.35;
      n.spineUpper.rotation.x = e * 0.30;
      n.head.rotation.x = e * 0.45;
      n.upperArmL.rotation.z = e * 0.60;
      n.upperArmR.rotation.z = -e * 0.48;
      n.forearmL.rotation.x = e * 0.35;
      n.forearmR.rotation.x = e * 0.30;
      n.thighL.rotation.x = -e * 0.22;
      n.thighR.rotation.x = e * 0.18;
    }

    _respawn() {
      const n = this._n(), p = this._p(), rise = 1 - Math.pow(1 - p, 3), wave = Math.sin(p * Math.PI);
      const s = 0.72 + rise * 0.28;
      n.pelvis.position.y -= (1 - rise) * 0.65;
      n.pelvis.scaling.set(s, s, s);
      n.chest.rotation.x = -wave * 0.12;
      n.upperArmL.rotation.z = wave * 0.38;
      n.upperArmR.rotation.z = -0.38 * wave;
    }
  }

  window.PlayerAnimator = PlayerAnimator;
})();
