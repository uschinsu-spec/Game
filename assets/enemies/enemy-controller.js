/**
 * enemy-controller.js
 * ====================
 * Full enemy AI + combat controller for Babylon.js.
 *
 * Features:
 *  - 3-tier LOD performance system (Near / Medium / Far)
 *  - Hit-frame accurate damage (attackWindup, hitTime, recoveryTime)
 *  - Animation event system via EnemyAnimationController.events
 *  - Floating HP bar & damage numbers
 *  - Capsule collider management
 *  - Pool-friendly reset / recycle support
 */
(function(global) {
  'use strict';

  class EnemyController {
    constructor(params) {
      this.uid          = params.uid;
      this.enemyId      = params.enemyId;
      this.info         = params.info || {};
      this.rootNode     = params.rootNode;
      this.colliderMesh = params.colliderMesh || null;
      this.scene        = params.scene;
      this.anim         = params.animationController;
      this.instanceData = params.instanceData;
      this.options      = params.options || {};

      // ── Stats ────────────────────────────────────────────────────────────
      this.maxHp    = this.options.hp     || this.info.hp     || 1000;
      this.hp       = this.maxHp;
      this.damage   = this.options.damage || this.info.damage || 80;
      this.moveSpeed= this.options.speed  || this.info.speed  || 2.2;

      // ── Combat timing from registry ──────────────────────────────────────
      this.attackRange   = this.info.attackRange   || 3.0;
      this.attackWindup  = this.info.attackWindup  || 0.15;
      this.hitTime       = this.info.hitTime       || 0.42;
      this.recoveryTime  = this.info.recoveryTime  || 0.75;
      this.footstepTimes = this.info.footstepTimes || [];

      // ── State ─────────────────────────────────────────────────────────────
      this.isDead        = false;
      this.target        = null;
      this.state         = 'idle';
      this._inWindup     = false;
      this._hitDealt     = false;

      // Pool reuse flags
      this._deathRecycleScheduled = false;
      this._managedByPool         = false;
      this._playerProxy           = null;
      // _spawnY: Y position at spawn time, used to anchor flying enemies
      this._spawnY                = params.options && params.options.position
                                    ? (params.options.position.y || 0)
                                    : 0;

      // ── HP bar ───────────────────────────────────────────────────────────
      this.hpBarMesh = null;
      this.hpBarFill = null;
      this.initHpBar();

      // ── Visual meshes ─────────────────────────────────────────────────────
      // Prefer the pre-built list from EnemyLoader (avoids re-scan).
      // Fallback: scan hierarchy, exclude HP planes and collider.
      if (params.visualMeshes && params.visualMeshes.length > 0) {
        this.visualMeshes = params.visualMeshes;
      } else {
        this.visualMeshes = [];
        if (this.rootNode) {
          this.rootNode.getChildMeshes(false).forEach(m => {
            if (!m.name.startsWith('HP_') && !m.name.startsWith('Collider_')) {
              this.visualMeshes.push(m);
            }
          });
        }
      }
      // Legacy alias (used by Tier LOD shadow toggle inside this file)
      this.meshes = this.visualMeshes;

      // ── Performance tier ─────────────────────────────────────────────────
      this.performanceTier      = 1;
      this.aiTickInterval       = 0;
      this.aiAccumulator        = Math.random() * 0.1;
      this.tierCheckAccumulator = Math.random() * 0.3;
      this.shadowsEnabled       = true;

      // ── Hook animation events ─────────────────────────────────────────────
      this._hookAnimEvents();
    }


    // ── Attach standard animation events ─────────────────────────────────────
    // Uses anim._internalEvents — permanent layer, never cleared on pool recycle.
    _hookAnimEvents() {
      if (!this.anim) return;
      const ev = this.anim._internalEvents; // ← permanent, not cleared by reset()

      // onAttackHit — apply damage at hit frame
      ev.on('onAttackHit', (payload) => {
        if (this.isDead || !this.target) return;
        if (this._hitDealt) return;
        this._hitDealt = true;

        const dmg = payload && payload.damage != null ? payload.damage : this.damage;
        if (this.target.takeDamage) {
          this.target.takeDamage(dmg, false);
        }
        if (this.onAttackHit) this.onAttackHit({ controller: this, target: this.target, damage: dmg });
      });

      // onFootstep — consumed by audio / dust VFX
      ev.on('onFootstep', () => {
        if (this.onFootstep) this.onFootstep({ controller: this });
      });

      // onDeath — for loot, VFX, analytics
      ev.on('onDeath', () => {
        if (this.onDeathEvent) this.onDeathEvent({ controller: this });
      });

      // onAnimationEnd — generic end callback
      ev.on('onAnimationEnd', ({ name }) => {
        if (this.onAnimationEnd) this.onAnimationEnd({ controller: this, animName: name });
      });
    }

    // ── 3-Tier LOD ───────────────────────────────────────────────────────────
    updatePerformanceTier(dist) {
      let targetTier = 1;
      if (dist > 40.0)      targetTier = 3;
      else if (dist > 18.0) targetTier = 2;

      if (this.performanceTier === targetTier) return;
      this.performanceTier = targetTier;

      if (targetTier === 1) {
        // NEAR (<18m) — full quality
        this.aiTickInterval = 0;
        if (this.anim && this.anim.currentAnim && !this.anim.currentAnim.isPlaying && !this.isDead) {
          this.anim.restart();
        }
        this.setShadows(true);
        if (this.hpBarMesh) this.hpBarMesh.setEnabled(true);
        if (this.colliderMesh) this.colliderMesh.checkCollisions = true;

      } else if (targetTier === 2) {
        // MEDIUM (18m–40m) — throttled AI, no shadows
        this.aiTickInterval = 0.15;
        this.setShadows(false);
        if (this.hpBarMesh) this.hpBarMesh.setEnabled(this.hp < this.maxHp);

      } else if (targetTier === 3) {
        // FAR (>40m) — frozen animation, no collision, low-freq AI
        this.aiTickInterval = 0.6;
        this.setShadows(false);
        if (this.anim && !this.isDead) this.anim.pause();
        if (this.hpBarMesh) this.hpBarMesh.setEnabled(false);
        if (this.colliderMesh) this.colliderMesh.checkCollisions = false;
      }
    }

    setShadows(enable) {
      if (this.shadowsEnabled === enable) return;
      this.shadowsEnabled = enable;
      for (const m of this.meshes) {
        m.receiveShadows = enable;
      }
    }

    // ── HP bar ───────────────────────────────────────────────────────────────
    initHpBar() {
      if (!this.scene) return;
      const barRoot = new BABYLON.TransformNode('HPBarRoot_' + this.uid, this.scene);
      barRoot.parent = this.rootNode;
      barRoot.position.y = (this.info.cat === 'big' ? 2.6 : 1.8) * (this.info.scale || 1.0);
      barRoot.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

      const bg = BABYLON.MeshBuilder.CreatePlane('HP_BG_' + this.uid, { width: 1.2, height: 0.15 }, this.scene);
      bg.parent = barRoot;
      const bgMat = new BABYLON.StandardMaterial('HP_BGMat_' + this.uid, this.scene);
      bgMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
      bgMat.emissiveColor = new BABYLON.Color3(0.05, 0.05, 0.05);
      bg.material = bgMat;

      const fill = BABYLON.MeshBuilder.CreatePlane('HP_Fill_' + this.uid, { width: 1.16, height: 0.11 }, this.scene);
      fill.parent = barRoot;
      fill.position.z = -0.01;
      const fillMat = new BABYLON.StandardMaterial('HP_FillMat_' + this.uid, this.scene);
      fillMat.diffuseColor = new BABYLON.Color3(0.85, 0.2, 0.2);
      fillMat.emissiveColor = new BABYLON.Color3(0.9, 0.25, 0.25);
      fill.material = fillMat;

      this.hpBarMesh = barRoot;
      this.hpBarFill = fill;
    }

    updateHpBar() {
      if (!this.hpBarFill || this.hpBarFill.isDisposed()) return;
      const pct = Math.max(0, Math.min(1, this.hp / this.maxHp));
      this.hpBarFill.scaling.x = pct;
      this.hpBarFill.position.x = -(1.16 * (1 - pct)) / 2;
    }

    // ── Combat ───────────────────────────────────────────────────────────────
    play(animName, loop = true, speedRatio = 1.0, onEnd = null, timeEvents = []) {
      if (this.isDead && animName.toLowerCase() !== 'death') return;
      return this.anim ? this.anim.play(animName, loop, speedRatio, onEnd, timeEvents) : null;
    }

    /**
     * Begin an attack swing with frame-accurate damage and events.
     * Fires:
     *   onAttackHit  at hitTime  (normalised)
     *   onFootstep   at each footstepTime (only if chase is active via advanceEvents)
     */
    _beginAttack() {
      if (this.state === 'attack' && this._inWindup) return;

      this.state     = 'attack';
      this._inWindup = true;
      this._hitDealt = false;

      const timeEvents = [
        { normalizedTime: this.hitTime,      eventName: 'onAttackHit',      payload: { damage: this.damage } },
        { normalizedTime: this.recoveryTime, eventName: '_attackRecovery',  payload: null }
      ];

      // _attackRecovery wires to _internalEvents with a once guard.
      // Use _internalEvents so recycle doesn't remove it.
      if (this.anim) {
        this.anim._internalEvents.once('_attackRecovery', () => {
          this._inWindup = false;
        });
      }

      this.play('Attack', false, 1.0, () => {
        if (!this.isDead) {
          this._inWindup = false;
          this.state     = 'idle';
          this.play('Idle', true);
        }
      }, timeEvents);
    }

    takeDamage(amount, isCrit = false) {
      if (this.isDead) return;

      this.hp = Math.max(0, this.hp - amount);
      this.updateHpBar();
      if (this.hpBarMesh) this.hpBarMesh.setEnabled(true);

      this.spawnDamageNumber(amount, isCrit);

      if (this.hp <= 0) {
        this.die();
      } else {
        this.state     = 'hit';
        this._inWindup = false; // interrupted
        this.play('Hit', false, 1.2, () => {
          if (!this.isDead) {
            this.state = 'idle';
            this.play('Idle', true);
          }
        });
      }
    }

    die() {
      if (this.isDead) return;
      this.isDead    = true;
      this.state     = 'dead';
      this._inWindup = false;

      if (this.hpBarMesh) this.hpBarMesh.dispose();

      if (this.colliderMesh && !this.colliderMesh.isDisposed()) {
        this.colliderMesh.checkCollisions = false;
        this.colliderMesh.setEnabled(false);
      }

      // Fire death event for loot / VFX
      if (this.anim) this.anim.events.emit('onDeath', { controller: this });

      this.play('Death', false, 1.0, () => {
        // Pool recycle is handled by EnemyPool.update()
        // If no pool, dispose after 2.5s
        if (!this._managedByPool) {
          setTimeout(() => this.dispose(), 2500);
        }
      });
    }

    // ── Floating damage text ──────────────────────────────────────────────────
    spawnDamageNumber(amount, isCrit = false) {
      if (!this.scene) return;
      const textPlane = BABYLON.MeshBuilder.CreatePlane('DmgText_' + Date.now(), { size: 1.5 }, this.scene);
      textPlane.position.copyFrom(this.rootNode.position);
      textPlane.position.y += 2.2 + Math.random() * 0.4;
      textPlane.position.x += (Math.random() - 0.5) * 0.6;
      textPlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

      const dynamicTexture = new BABYLON.DynamicTexture('DmgTex_' + Date.now(), { width: 256, height: 128 }, this.scene, true);
      dynamicTexture.hasAlpha = true;
      const font  = `bold ${isCrit ? '60px' : '48px'} Arial`;
      const color = isCrit ? '#ffdd00' : '#ff4444';
      dynamicTexture.drawText((isCrit ? '!!! ' : '-') + amount, null, 80, font, color, 'transparent', true);

      const mat = new BABYLON.StandardMaterial('DmgMat_' + Date.now(), this.scene);
      mat.diffuseTexture = dynamicTexture;
      mat.emissiveColor  = new BABYLON.Color3(1, 1, 1);
      mat.specularColor  = new BABYLON.Color3(0, 0, 0);
      textPlane.material = mat;

      let elapsed = 0;
      const obs = this.scene.onBeforeRenderObservable.add(() => {
        elapsed += 0.02;
        textPlane.position.y += 0.035;
        mat.alpha = Math.max(0, 1.0 - elapsed * 1.5);
        if (elapsed >= 0.7) {
          this.scene.onBeforeRenderObservable.remove(obs);
          textPlane.dispose();
          mat.dispose();
          dynamicTexture.dispose();
        }
      });
    }

    setTarget(targetNode) {
      this.target = targetNode;
    }

    // ── Main update loop ──────────────────────────────────────────────────────
    update(dt) {
      if (this.isDead || this.state === 'dead') return;

      // ── Advance animation time events (hit frame, footstep, etc.) ─────────
      if (this.anim) this.anim.advanceEvents(dt);

      if (this.state === 'hit') return; // let hit-react finish

      // ── Distance to target or camera ─────────────────────────────────────
      let dist = 10.0, dx = 0, dz = 0;

      if (this.target) {
        dx   = this.target.position.x - this.rootNode.position.x;
        dz   = this.target.position.z - this.rootNode.position.z;
        dist = Math.sqrt(dx * dx + dz * dz);
      } else if (this.scene && this.scene.activeCamera) {
        const cdx = this.scene.activeCamera.position.x - this.rootNode.position.x;
        const cdz = this.scene.activeCamera.position.z - this.rootNode.position.z;
        dist = Math.sqrt(cdx * cdx + cdz * cdz);
      }

      // ── LOD tier check (every 0.25s) ──────────────────────────────────────
      this.tierCheckAccumulator += dt;
      if (this.tierCheckAccumulator > 0.25) {
        this.tierCheckAccumulator = 0;
        this.updatePerformanceTier(dist);
      }

      if (this.performanceTier === 3 && dist > 50.0) return;

      // ── AI throttle ───────────────────────────────────────────────────────
      if (this.aiTickInterval > 0) {
        this.aiAccumulator += dt;
        if (this.aiAccumulator < this.aiTickInterval) return;
        dt = this.aiAccumulator;
        this.aiAccumulator = 0;
      }

      if (!this.target) return;

      // ── Face target ───────────────────────────────────────────────────────
      this.rootNode.rotation.y = Math.atan2(dx, dz);

      // ── Movement / attack state machine ───────────────────────────────────
      if (dist > this.attackRange) {
        // Chase
        if (this.state !== 'chase') {
          this.state = 'chase';
          const stepEvents = this.footstepTimes.map(t => ({
            normalizedTime: t,
            eventName:      'onFootstep',
            payload:        null
          }));
          this.play('Walk', true, 1.2, null, stepEvents);
        }
        if (!this._inWindup) {
          const speed = this.moveSpeed * dt;
          const nx = (dx / dist) * speed;
          const nz = (dz / dist) * speed;

          // Fix #5: Use moveWithCollisions so capsule collider stops at walls/obstacles.
          // Flying enemies (groundOffset > 0) keep their Y — only move on XZ.
          if (this.colliderMesh && this.colliderMesh.checkCollisions) {
            const displacement = new BABYLON.Vector3(nx, 0, nz);
            this.colliderMesh.moveWithCollisions(displacement);
            // Sync rootNode to collider position (collider is child of rootNode
            // so only move rootNode directly when collider has no parent collision offset)
            this.rootNode.position.x += nx;
            this.rootNode.position.z += nz;
          } else {
            // Fallback: direct position (flying enemies without collisions, or Tier 3)
            this.rootNode.position.x += nx;
            this.rootNode.position.z += nz;
          }

          // Fix #6: Maintain flying Y — snap to groundOffset above spawn Y.
          // groundOffset is in world units (set at spawn, never zero for flying cat).
          if (this.info.cat === 'flying' && this.info.groundOffset > 0) {
            this.rootNode.position.y = this._spawnY + this.info.groundOffset;
          }
        }

      } else {
        if (!this._inWindup) {
          this._beginAttack();
        }
      }
    }

    // ── Dispose ───────────────────────────────────────────────────────────────
    dispose() {
      if (this.colliderMesh && !this.colliderMesh.isDisposed()) {
        this.colliderMesh.dispose();
      }
      if (this.rootNode && !this.rootNode.isDisposed()) {
        this.rootNode.dispose(false, true);
      }
      if (this.instanceData) {
        this.instanceData.animationGroups.forEach(ag => ag.dispose());
      }
      if (this.anim) {
        this.anim.reset();
      }
    }
  }

  global.EnemyController = EnemyController;
})(typeof window !== 'undefined' ? window : this);
