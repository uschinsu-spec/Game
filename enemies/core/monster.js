(() => {
  "use strict";

  const B = window.BABYLON;
  let MONSTER_ID = 1;

  /**
   * Monster: Thực thể quái vật độc lập, xử lý AI di chuyển, định tuyến, nhận sát thương và điều khiển hoạt ảnh.
   */
  class Monster {
    constructor(scene, pos, level, kind, name) {
      const def = window.EnemyRegistry.get(kind);
      if (!def) throw new Error(`[Monster] Thiếu config enemy: "${kind}"`);

      this.scene = scene;
      this.id = MONSTER_ID++;
      this.spawn = pos.clone();
      this.level = level;
      this.kind = kind;
      this.definition = def;
      this.name = name || def.name;

      this.maxHp = def.stats.hpBase + level * def.stats.hpPerLevel;
      this.hp = this.maxHp;
      this.alive = true;
      this.respawnTimer = 0;
      this.attackCd = Math.random();
      this.onDeath = null;
      this.route = [];
      this.routeTimer = 0;
      this.deathHideTimer = 0;

      this.attackRange = def.combat.attackRange;
      this.moveSpeed = def.movement.speed;
      this.attackCooldown = def.combat.attackCooldown;
      this.damageBase = def.combat.damageBase;
      this.damagePerLevel = def.combat.damagePerLevel;
      this.rootYOffset = def.visual?.rootYOffset ?? 0.85;

      this.mesh = new B.TransformNode(`mob_${this.id}`, scene);
      this.mesh.position = pos.add(new B.Vector3(0, this.rootYOffset, 0));
      this.mesh.metadata = { monsterId: this.id, monsterKind: kind };

      this.visual = window.EnemyRegistry.createVisual(kind, scene, this.mesh, this.id, level);
      this.parts = this.visual.parts;
    }

    damageBy(v) {
      if (!this.alive) return 0;
      const amount = Math.min(this.hp, v);
      this.hp -= v;

      if (this.hp <= 0) {
        this.hp = 0;
        this.alive = false;
        this.respawnTimer = 6 + Math.random() * 3;
        this.deathHideTimer = 0.92;
        this.visual.trigger("Death");
        this.onDeath?.(this);
      } else {
        this.visual.trigger("Hit");
      }
      return amount;
    }

    update(dt, player, damagePlayer, world) {
      const playerPos = player.position || player;

      if (!this.alive) {
        this.visual.update(dt, false);
        this.deathHideTimer -= dt;
        if (this.deathHideTimer <= 0 && this.mesh.isEnabled()) {
          this.mesh.setEnabled(false);
        }
        this.respawnTimer -= dt;
        if (this.respawnTimer <= 0) {
          const a = Math.random() * Math.PI * 2, r = 28 + Math.random() * 16;
          this.spawn = playerPos.add(new B.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
          this.spawn.y = 0;
          world.constrain(this.spawn);
          this.respawn();
        }
        return;
      }

      this.attackCd = Math.max(0, this.attackCd - dt);
      const p = this.mesh.position, d = playerPos.subtract(p);
      d.y = 0;
      const dist = d.length();
      let moving = false;
      let currentSpeed = 0;

      if (dist > this.attackRange) {
        this.routeTimer = (this.routeTimer || 0) - dt;
        if (this.routeTimer <= 0) {
          this.route = world.findPath(p, playerPos);
          this.routeTimer = 1.1 + (this.id % 5) * 0.15;
        }
        while (this.route?.length && B.Vector3.Distance(this.route[0], p) < 0.5) {
          this.route.shift();
        }
        const direction = this.route?.length ? this.route[0].subtract(p) : d;
        direction.y = 0;
        if (direction.lengthSquared() > 0.001) {
          const maxAdvance = Math.max(0, dist - this.attackRange), speed = this.moveSpeed;
          const step = Math.min(direction.length(), speed * dt, maxAdvance);
          if (step > 0.0001) {
            moving = true;
            currentSpeed = step / dt;

            // Derive facing from the actual world-space displacement, not the
            // requested waypoint vector. Path steering and world constraints
            // can alter the final movement direction; using the pre-constraint
            // vector can make the wolf appear to run sideways.
            direction.normalize();
            const previousX = p.x;
            const previousZ = p.z;
            p.addInPlace(direction.scale(step));
            world.constrain(p);

            const movedX = p.x - previousX;
            const movedZ = p.z - previousZ;
            if (movedX * movedX + movedZ * movedZ > 1e-6) {
              this.mesh.rotation.y = Math.atan2(movedX, movedZ);
            }
          }
        }
      } else {
        this.route = [];
        this.routeTimer = 0;
        this.mesh.rotation.y = Math.atan2(d.x, d.z);
        if (this.attackCd <= 0) {
          if (window.AttackSystem) {
            window.AttackSystem.execute(this, player, (dmg, src) => damagePlayer(dmg, src || this.mesh.position), world, this.scene);
          } else {
            this.visual.trigger("Attack");
            damagePlayer(this.damageBase + this.level * this.damagePerLevel, this.mesh.position);
          }
          this.attackCd = this.attackCooldown;
        }
      }

      this.visual.update(dt, moving, currentSpeed);
    }

    respawn() {
      this.hp = this.maxHp;
      this.alive = true;
      this.route = [];
      this.routeTimer = 0;
      this.attackCd = 0.5 + Math.random();
      this.deathHideTimer = 0;
      this.mesh.position.copyFrom(this.spawn.add(new B.Vector3(0, this.rootYOffset, 0)));
      this.mesh.rotation.set(0, 0, 0);
      this.mesh.setEnabled(true);
      this.visual.reset();
    }
  }

  window.Monster = Monster;
})();
