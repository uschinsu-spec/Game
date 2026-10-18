(() => {
  "use strict";

  const B = window.BABYLON;

  /**
   * EnemyManager: Trình quản lý toàn bộ hệ thống quái vật trong thế giới game.
   * Xử lý spawn quái, cập nhật batch, vật lý đẩy chống lồng nhau, truy vấn quái gần nhất và tìm kiếm theo mesh.
   */
  class EnemyManager {
    constructor(scene, world) {
      this.scene = scene;
      this.world = world;
      this.monsters = [];
      this.wasDead = false;
    }

    /**
     * Khởi tạo và sinh quái vật ban đầu
     * @param {number} totalCount - Số lượng quái (mặc định 16)
     */
    spawn(totalCount = 16) {
      const kinds = window.EnemyRegistry.list();
      if (!kinds.length) {
        console.warn("[EnemyManager] Không có loại quái nào được đăng ký trong EnemyRegistry.");
        return;
      }

      for (let i = 0; i < totalCount; i++) {
        const a = (i / totalCount) * Math.PI * 2;
        const r = 22 + (i % 4) * 7;
        const p = new B.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r);
        this.world.constrain(p);

        // Lấy loại quái luân phiên từ registry
        const kind = kinds[i % kinds.length];
        const name = window.EnemyRegistry.get(kind)?.name || kind;
        const level = 1 + (i % 3);

        const monster = new window.Monster(this.scene, p, level, kind, name);
        this.monsters.push(monster);
      }
    }

    /**
     * Thêm một quái vật tùy ý tại vị trí chỉ định
     */
    spawnOne(kind, position, level = 1, customName = null) {
      const name = customName || window.EnemyRegistry.get(kind)?.name || kind;
      const monster = new window.Monster(this.scene, position, level, kind, name);
      this.monsters.push(monster);
      return monster;
    }

    /**
     * Cập nhật toàn bộ quái vật mỗi khung hình
     */
    update(dt, player, damage) {
      if (player.dead) {
        this.wasDead = true;
        return;
      }

      if (this.wasDead) {
        this.wasDead = false;
        player.invulnerable = 4;
        this.monsters.forEach((m, i) => {
          const a = (i / this.monsters.length) * Math.PI * 2;
          m.spawn = player.position.add(new B.Vector3(Math.cos(a) * 30, 0, Math.sin(a) * 30));
          m.spawn.y = 0;
          this.world.constrain(m.spawn);
          m.respawn();
          m.route = [];
          m.routeTimer = 0;
        });
      }

      // Cập nhật từng quái vật
      this.monsters.forEach(m => m.update(dt, player, damage, this.world));

      // Vật lý đẩy chống quái chồng lấn lên nhau
      const len = this.monsters.length;
      for (let i = 0; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
          const a = this.monsters[i], b = this.monsters[j];
          if (!a.alive || !b.alive) continue;

          const dx = a.mesh.position.x - b.mesh.position.x;
          const dz = a.mesh.position.z - b.mesh.position.z;
          const distSq = dx * dx + dz * dz;

          if (distSq > 0.0001 && distSq < 1.5625) {
            const length = Math.sqrt(distSq);
            const pushMag = Math.min((1.25 - length) * 0.5, dt * 2) / length;
            const px = dx * pushMag, pz = dz * pushMag;

            a.mesh.position.x += px;
            a.mesh.position.z += pz;
            b.mesh.position.x -= px;
            b.mesh.position.z -= pz;

            this.world.constrain(a.mesh.position);
            this.world.constrain(b.mesh.position);
          }
        }
      }
    }

    /**
     * Tìm quái vật từ Mesh được click/chạm
     */
    byMesh(mesh) {
      let n = mesh;
      while (n) {
        if (n.metadata?.monsterId) {
          return this.monsters.find(m => m.id === n.metadata.monsterId);
        }
        n = n.parent;
      }
      return null;
    }

    /**
     * Tìm quái vật còn sống gần nhất trong phạm vi max bán kính
     */
    nearest(p, max = 8) {
      let best = null;
      let maxSq = max * max;

      for (const m of this.monsters) {
        if (!m.alive) continue;
        const dx = p.x - m.mesh.position.x;
        const dz = p.z - m.mesh.position.z;
        const distSq = dx * dx + dz * dz;
        if (distSq < maxSq) {
          maxSq = distSq;
          best = m;
        }
      }
      return best;
    }

    /**
     * Lấy danh sách quái vật còn sống
     */
    getAliveMonsters() {
      return this.monsters.filter(m => m.alive);
    }
  }

  window.EnemyManager = EnemyManager;
  // Alias giữ tương thích ngược 100% với code cũ
  window.Entities = EnemyManager;
})();
