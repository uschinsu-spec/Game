(() => {
  "use strict";

  const B = window.BABYLON;
  const Base = window.BaseEnemyVisual;
  if (!B || !Base) return;

  // Cache container toàn cục cho từng model URL để không bao giờ phải tải lại file
  const _containerCache = new Map();

  function loadModelContainer(scene, modelPath) {
    if (!B.SceneLoader || !B.SceneLoader.LoadAssetContainerAsync) {
      return Promise.resolve(null);
    }
    if (!_containerCache.has(modelPath)) {
      // Phân tách thư mục và tên file
      const lastSlash = Math.max(modelPath.lastIndexOf("/"), modelPath.lastIndexOf("\\"));
      const rootUrl = lastSlash >= 0 ? modelPath.substring(0, lastSlash + 1) : "./";
      const filename = lastSlash >= 0 ? modelPath.substring(lastSlash + 1) : modelPath;

      const promise = B.SceneLoader.LoadAssetContainerAsync(rootUrl, filename, scene)
        .catch(err => {
          console.error(`[GlbEnemyVisual] Lỗi khi nạp GLB: ${modelPath}`, err);
          return null;
        });
      _containerCache.set(modelPath, promise);
    }
    return _containerCache.get(modelPath);
  }

  /**
   * Helper set weight an toàn cho Babylon AnimationGroup
   */
  function setAgWeight(ag, weight) {
    if (!ag) return;
    const w = Math.max(0, Math.min(1, weight));
    ag.weight = w;
    if (typeof ag.setWeightForAllAnimatables === "function") {
      ag.setWeightForAllAnimatables(w);
    }
  }

  /**
   * GlbEnemyVisual: Universal 3D GLB Engine cho mọi kẻ địch dùng mô hình 3D GLB.
   * Tự động cache asset, map khung xương, crossfade animation chuyển trạng thái mượt mà,
   * đồng bộ speedRatio theo tốc độ di chuyển thực tế (chống trượt chân).
   */
  class GlbEnemyVisual extends Base {
    constructor(scene, parent, id, level, config) {
      super(scene, parent, id, level, config);
      this.modelRoot = null;
      this.animGroups = {};
      this.anims = null;
      this.activeAnimName = null;
      this.activeAg = null;
      this.fadingOutAgs = []; // Danh sách AG đang mờ dần [{ ag, weight, speed }]
      this.state = "Idle";
      this.glbConfig = config.model || {};
      this.crossFadeDuration = this.glbConfig.crossFadeDuration || 0.18; // 180ms MMORPG blend
      this._loadGlb();
    }

    build() {
      // Mesh được tạo thông qua GLB Asset Container, không tạo procedural
    }

    _loadGlb() {
      const path = this.glbConfig.path;
      if (!path) return;

      loadModelContainer(this.scene, path).then(container => {
        if (!container || !this.root) return;

        // Nhân bản model trực tiếp từ container sang scene
        const entries = container.instantiateModelsToScene(
          name => `${name}_mob_${this.id}`,
          false,
          { doNotInstantiate: false }
        );

        // Dừng tất cả animation ban đầu
        if (entries.animationGroups) {
          entries.animationGroups.forEach(ag => {
            ag.stop();
            setAgWeight(ag, 0);
          });
        }

        // Gắn root node vào quái vật
        const importedRoot = entries.rootNodes[0] || entries.transformNodes[0];
        if (importedRoot) {
          importedRoot.parent = this.root;
          const pos = this.glbConfig.positionOffset || [0, 0, 0];
          importedRoot.position.set(pos[0], pos[1], pos[2]);

          const rotY = this.glbConfig.rotationY !== undefined ? this.glbConfig.rotationY : Math.PI;
          importedRoot.rotation.set(0, rotY, 0);

          const scale = (this.glbConfig.scale || 1.0) * this.baseScale;
          importedRoot.scaling.setAll(scale);
          this.modelRoot = importedRoot;
        }

        // Gắn mesh vào parts để nhận click/damage
        entries.transformNodes.forEach(node => {
          if (node.getChildMeshes) {
            node.getChildMeshes().forEach(m => {
              m.isPickable = true;
              m.metadata = { monsterVisual: true, monsterKind: this.kind, monsterId: this.id };
              this.parts.push(m);
            });
          }
        });

        // Map animation groups theo tên gốc
        entries.animationGroups.forEach(ag => {
          const rawName = ag.name.replace(new RegExp(`_mob_${this.id}$`), "");
          this.animGroups[rawName] = ag;
        });

        // Map animation theo config hoặc fallback mặc định chuẩn hóa MMORPG
        const customMap = this.glbConfig.animations || {};
        this.anims = {
          Idle: this._findAnim(customMap.Idle || ["idle", "stand", "breath", "breathing", "wait"]),
          Run: this._findAnim(customMap.Run || ["run", "sprint", "move", "walk", "loco", "forward"]),
          Attack: this._findAnim(customMap.Attack || ["attack", "bite", "slash", "strike", "hit_attack", "action"]),
          Hit: this._findAnim(customMap.Hit || ["hit", "impact", "hurt", "damage", "get_hit", "flinch"]),
          Death: this._findAnim(customMap.Death || ["death", "die", "dead", "fall", "collapse"]),
          Spawn: this._findAnim(customMap.Spawn || ["spawn", "idle", "stand", "birth"])
        };

        // Bắt đầu phát hoạt ảnh trạng thái ban đầu
        this._playStateAnim(this.state, true);
      });
    }

    _findAnim(candidates) {
      if (!Array.isArray(candidates)) candidates = [candidates];
      for (const name of candidates) {
        if (this.animGroups[name]) return this.animGroups[name];
        for (const k in this.animGroups) {
          if (k.toLowerCase().includes(name.toLowerCase())) return this.animGroups[k];
        }
      }
      return Object.values(this.animGroups)[0] || null;
    }

    _playStateAnim(stateName, instant = false) {
      if (!this.anims) return;
      const targetAg = this.anims[stateName] || this.anims["Idle"];
      if (!targetAg) return;

      if (this.activeAnimName === stateName && targetAg.isPlaying) return;

      const prevAg = this.activeAg;
      if (prevAg && prevAg !== targetAg) {
        if (instant) {
          prevAg.stop();
          setAgWeight(prevAg, 0);
        } else {
          // Đưa vào danh sách mờ dần (crossfade out)
          this.fadingOutAgs.push({ ag: prevAg, weight: prevAg.weight !== undefined ? prevAg.weight : 1.0 });
        }
      }

      this.activeAnimName = stateName;
      this.activeAg = targetAg;

      const isLoop = (stateName === "Idle" || stateName === "Run");
      const speeds = this.glbConfig.animationSpeeds || {};
      const speed = speeds[stateName] || (stateName === "Run" ? 1.35 : stateName === "Attack" ? 1.25 : 1.0);
      targetAg.speedRatio = speed;

      if (instant) {
        setAgWeight(targetAg, 1.0);
      } else {
        setAgWeight(targetAg, 0.0);
      }

      if (!targetAg.isPlaying) {
        targetAg.play(isLoop);
      }
    }

    trigger(state) {
      const a = this.config.animation || {};
      if (this.state === "Death" && state !== "Death") return;
      this.state = state;
      this.stateTime = 0;
      if (state === "Death") {
        this.stateDuration = a.deathDuration || 1.4;
      } else if (state === "Attack") {
        this.stateDuration = a.attackDuration || 0.85;
      } else if (state === "Hit") {
        this.stateDuration = a.hitDuration || 0.35;
      } else {
        this.stateDuration = a.spawnDuration || 0.25;
      }
      this._playStateAnim(state);
    }

    reset() {
      // Stop every previous clip and discard pending crossfades before replaying Idle.
      // Otherwise a recycled GLB can keep a fading Death/Attack clip on its skeleton.
      for (const ag of Object.values(this.animGroups)) {
        ag.stop();
        setAgWeight(ag, 0);
      }
      this.fadingOutAgs.length = 0;
      this.activeAnimName = null;
      this.activeAg = null;
      this.state = "Idle";
      this.stateTime = 0;
      this.stateDuration = 0;
      this.root.setEnabled(true);
      this.root.position.set(0, 0, 0);
      this.root.rotation.set(0, 0, 0);
      this._applyScale(1);
      this._playStateAnim("Idle", true);
    }

    update(dt, moving, currentSpeed = null) {
      this.elapsed += dt;
      this.stateTime += dt;

      if (this.state === "Death") {
        // Giữ trạng thái chết
      } else if (this.state === "Attack" || this.state === "Hit" || this.state === "Spawn") {
        if (this.stateTime >= this.stateDuration) {
          this.state = moving ? "Run" : "Idle";
          this.stateTime = 0;
          this._playStateAnim(this.state);
        }
      } else {
        const nextState = moving ? "Run" : "Idle";
        if (this.state !== nextState || (this.activeAg && !this.activeAg.isPlaying)) {
          this.state = nextState;
          this._playStateAnim(this.state);
        }
      }

      // Xử lý Crossfade Blending mượt mà giữa các animation groups
      const fadeStep = dt / Math.max(0.05, this.crossFadeDuration);

      if (this.activeAg) {
        const currentWeight = this.activeAg.weight !== undefined ? this.activeAg.weight : 1.0;
        if (currentWeight < 1.0) {
          const nextWeight = Math.min(1.0, currentWeight + fadeStep);
          setAgWeight(this.activeAg, nextWeight);
        }
      }

      for (let i = this.fadingOutAgs.length - 1; i >= 0; i--) {
        const item = this.fadingOutAgs[i];
        item.weight -= fadeStep;
        if (item.weight <= 0.001) {
          item.ag.stop();
          setAgWeight(item.ag, 0);
          this.fadingOutAgs.splice(i, 1);
        } else {
          setAgWeight(item.ag, item.weight);
        }
      }

      // Chống trượt chân: Đồng bộ speedRatio của Run theo tốc độ di chuyển thực tế
      if (this.state === "Run" && this.activeAg) {
        const baseSpeed = this.config.movement?.speed || 4.5;
        const speedMultiplier = (currentSpeed !== null && currentSpeed !== undefined && baseSpeed > 0)
          ? Math.max(0.4, Math.min(2.5, currentSpeed / baseSpeed))
          : 1.0;
        const configSpeed = (this.glbConfig.animationSpeeds?.Run) || 1.35;
        this.activeAg.speedRatio = configSpeed * speedMultiplier;
      }

      this.root.position.set(0, 0, 0);
      this.root.rotation.set(0, 0, 0);
      this._applyScale(1);
    }

    pose() {
      // GLB skeletal animation tự động điều khiển khung xương
    }
  }

  window.GlbEnemyVisual = GlbEnemyVisual;
})();
