(() => {
  "use strict";
  const B = window.BABYLON;

  /**
   * PlayerMotor owns logical translation + yaw. Visual lean/bank stays outside the
   * collision root so world constraints always operate on an upright character.
   */
  class PlayerMotor {
    constructor(root, opts = {}) {
      this.root = root;
      this.maxSpeed = opts.maxSpeed || 7;
      this.accel = opts.accel || 22;
      this.decel = opts.decel || 26;
      this.turnSpeed = opts.turnSpeed || 16.5;
      this.bankStrength = opts.bankStrength || 0.18;
      this.currentVelocity = new B.Vector3(0, 0, 0);
      this.targetVelocity = new B.Vector3(0, 0, 0);
      this.currentYaw = root.rotation.y || 0;
      this.currentBank = 0;
      this.lastStepDistance = 0;
    }

    reset(position = null, yaw = 0) {
      if (position) this.root.position.copyFrom(position);
      this.currentVelocity.set(0, 0, 0);
      this.targetVelocity.set(0, 0, 0);
      this.currentYaw = yaw;
      this.currentBank = 0;
      this.lastStepDistance = 0;
      this.root.rotation.x = 0;
      this.root.rotation.y = yaw;
      this.root.rotation.z = 0;
    }

    stop() {
      this.currentVelocity.set(0, 0, 0);
      this.targetVelocity.set(0, 0, 0);
      this.lastStepDistance = 0;
    }

    update(dt, desiredDir, inputMagnitude, world) {
      const mag = Math.max(0, Math.min(1, inputMagnitude || 0));
      const targetSpeed = this.maxSpeed * mag;
      this.targetVelocity = desiredDir && desiredDir.lengthSquared() > 1e-6
        ? desiredDir.scale(targetSpeed)
        : new B.Vector3(0, 0, 0);

      const accelRate = mag > 0.001 ? this.accel : this.decel;
      const lerpFactor = Math.min(1, accelRate * dt);
      this.currentVelocity = B.Vector3.Lerp(this.currentVelocity, this.targetVelocity, lerpFactor);

      let currentSpeed = this.currentVelocity.length();
      const isMoving = currentSpeed > 0.06;
      this.lastStepDistance = 0;
      let yawDiff = 0;

      if (isMoving) {
        const before = this.root.position.clone();
        this.root.position.addInPlace(this.currentVelocity.scale(dt));
        if (world?.constrain) world.constrain(this.root.position);
        this.lastStepDistance = B.Vector3.Distance(before, this.root.position);

        // Collision correction can shorten/redirect a step. Rebuild horizontal
        // velocity from the accepted displacement to keep animation honest.
        if (dt > 1e-5 && this.lastStepDistance > 1e-6) {
          const accepted = this.root.position.subtract(before).scale(1 / dt);
          accepted.y = 0;
          this.currentVelocity.copyFrom(accepted);
          currentSpeed = this.currentVelocity.length();
        }

        if (currentSpeed > 0.02) {
          const targetYaw = Math.atan2(this.currentVelocity.x, this.currentVelocity.z);
          yawDiff = targetYaw - this.currentYaw;
          while (yawDiff < -Math.PI) yawDiff += Math.PI * 2;
          while (yawDiff > Math.PI) yawDiff -= Math.PI * 2;
          const alpha = 1 - Math.exp(-this.turnSpeed * dt);
          this.currentYaw += yawDiff * alpha;
          this.root.rotation.y = this.currentYaw;
        }

        const targetBank = -yawDiff * this.bankStrength * Math.min(1, currentSpeed / (this.maxSpeed * 0.7));
        const bankAlpha = 1 - Math.exp(-14 * dt);
        this.currentBank += (targetBank - this.currentBank) * bankAlpha;
      } else {
        const bankAlpha = 1 - Math.exp(-16 * dt);
        this.currentBank += (0 - this.currentBank) * bankAlpha;
        if (this.currentVelocity.lengthSquared() < 0.0001) this.currentVelocity.set(0, 0, 0);
      }

      // Never bank the logical/collision root.
      this.root.rotation.x = 0;
      this.root.rotation.z = 0;

      return {
        isMoving,
        currentSpeed,
        speedNorm: this.maxSpeed > 0 ? Math.min(1, currentSpeed / this.maxSpeed) : 0,
        yaw: this.currentYaw,
        yawDiff,
        bank: this.currentBank,
        distance: this.lastStepDistance,
        velocity: this.currentVelocity
      };
    }
  }

  window.PlayerMotor = PlayerMotor;
})();
