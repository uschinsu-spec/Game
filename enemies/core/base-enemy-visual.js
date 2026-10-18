(() => {
  "use strict";

  const B = window.BABYLON;
  if (!B) return;

  const color = value => value instanceof B.Color3 ? value : new B.Color3(value[0], value[1], value[2]);

  /**
   * BaseEnemyVisual: Lớp cơ sở quản lý mesh, material, node hierarchy và chu kỳ animation cho quái vật
   */
  class BaseEnemyVisual {
    constructor(scene, parent, id, level, config) {
      this.scene = scene;
      this.parent = parent;
      this.id = id;
      this.kind = config.kind;
      this.level = level;
      this.config = config;
      this.parts = [];
      this.pivots = [];
      this.refs = {};
      this.root = new B.TransformNode(`mobVisual_${id}`, scene);
      this.root.parent = parent;
      this.state = "Spawn";
      this.stateTime = 0;
      this.stateDuration = config.animation?.spawnDuration || 0.45;
      this.elapsed = Math.random() * 10;
      this.attackVariant = 0;
      this.baseScale = 1 + (level - 1) * (config.visual?.scalePerLevel || 0.05);
      this.materials = this._materials();
      this.build();
      this._captureBase();
      this._applyScale(0.35);
    }

    _materials() {
      BaseEnemyVisual._matCache = BaseEnemyVisual._matCache || new Map();
      if (BaseEnemyVisual._matCache.has(this.kind)) return BaseEnemyVisual._matCache.get(this.kind);
      const palette = this.config.palette || {};

      const make = (slot, baseColor = [0.8, 0.8, 0.8], { roughness = 0.65, metallic = 0.0, emissive = null, specular = 0.15 } = {}) => {
        let m;
        if (B.PBRMaterial) {
          m = new B.PBRMaterial(`mob_${this.kind}_${slot}`, this.scene);
          m.albedoColor = color(baseColor);
          m.roughness = roughness;
          m.metallic = metallic;
          m.directIntensity = 1.35;
          m.environmentIntensity = 1.25;
          if (emissive) {
            m.emissiveColor = color(emissive);
            m.emissiveIntensity = 2.0;
          }
        } else {
          m = new B.StandardMaterial(`mob_${this.kind}_${slot}`, this.scene);
          m.diffuseColor = color(baseColor);
          m.ambientColor = new B.Color3(0.45, 0.45, 0.45);
          m.specularColor = new B.Color3(specular, specular, specular);
          m.specularPower = 28;
          if (emissive) m.emissiveColor = color(emissive);
        }
        m.metadata = { monsterTextureSlot: slot, monsterKind: this.kind };
        return m;
      };

      const mats = {
        skin: make("skin", palette.skin || [0.7, 0.7, 0.7], { roughness: 0.72, metallic: 0.0, specular: 0.08 }),
        secondary: make("secondary", palette.secondary || [0.85, 0.85, 0.85], { roughness: 0.75, metallic: 0.0, specular: 0.08 }),
        armor: make("armor", palette.armor || [0.5, 0.5, 0.5], { roughness: 0.42, metallic: 0.35, specular: 0.25 }),
        bone: make("bone", palette.bone || [0.9, 0.9, 0.85], { roughness: 0.28, metallic: 0.05, specular: 0.45 }),
        claw: make("claw", palette.claw || [0.3, 0.3, 0.3], { roughness: 0.32, metallic: 0.30, specular: 0.35 }),
        eye: make("eye", palette.eyeBase || [0.4, 0.15, 0.05], { roughness: 0.10, metallic: 0.1, emissive: palette.eyeGlow || [1, 0.5, 0.1], specular: 0.95 }),
        accent: make("accent", palette.accent || [0.9, 0.5, 0.1], { roughness: 0.20, metallic: 0.2, emissive: palette.accentGlow || palette.accent, specular: 0.65 })
      };
      BaseEnemyVisual._matCache.set(this.kind, mats);
      return mats;
    }

    _node(name, pos, parent = this.root) {
      const n = new B.TransformNode(`mob_${this.id}_${name}`, this.scene);
      n.parent = parent;
      n.position.copyFrom(pos);
      this.pivots.push(n);
      return n;
    }

    _part(type, name, opts, pos, mat, parent = this.root, rot = null, scale = null) {
      const x = B.MeshBuilder[type](`mob_${this.id}_${name}`, opts, this.scene);
      x.parent = parent;
      x.position.copyFrom(pos);
      if (rot) x.rotation.copyFrom(rot);
      if (scale) x.scaling.copyFrom(scale);
      x.material = mat;
      x.isPickable = true;
      x.metadata = {
        monsterVisual: true,
        monsterKind: this.kind,
        monsterId: this.id,
        textureSlot: mat?.metadata?.monsterTextureSlot || null
      };
      this.parts.push(x);
      return x;
    }

    _captureBase() {
      this.pivots.forEach(n => n._mobBase = { p: n.position.clone(), r: n.rotation.clone() });
    }

    _resetPose() {
      for (const n of this.pivots) {
        if (n._mobBase) {
          n.position.copyFrom(n._mobBase.p);
          n.rotation.copyFrom(n._mobBase.r);
        }
      }
      this.root.position.set(0, 0, 0);
      this.root.rotation.set(0, 0, 0);
    }

    _applyScale(s) {
      const v = this.baseScale * s;
      this.root.scaling.set(v, v, v);
    }

    trigger(state) {
      const a = this.config.animation || {};
      if (state === "Death") {
        this.state = "Death";
        this.stateTime = 0;
        this.stateDuration = a.deathDuration || 1.2;
        return;
      }
      if (this.state === "Death") return;
      this.state = state;
      this.stateTime = 0;
      this.stateDuration = state === "Attack" ? (a.attackDuration || 0.8) : state === "Hit" ? (a.hitDuration || 0.35) : state === "Spawn" ? (a.spawnDuration || 0.45) : 0.2;
      if (state === "Attack") this.attackVariant = (this.attackVariant + 1) % 2;
    }

    reset() {
      this.state = "Spawn";
      this.stateTime = 0;
      this.stateDuration = this.config.animation?.spawnDuration || 0.45;
      this.root.setEnabled(true);
      this._resetPose();
      this._applyScale(0.35);
    }

    update(dt, moving) {
      const a = this.config.animation || {};
      this.elapsed += dt;
      this.stateTime += dt;
      if (!["Attack", "Hit", "Death", "Spawn"].includes(this.state)) {
        this.state = moving ? "Run" : "Idle";
      } else if (this.state !== "Death" && this.stateTime >= this.stateDuration) {
        this.state = moving ? "Run" : "Idle";
        this.stateTime = 0;
      }
      this._resetPose();
      const p = Math.min(1, this.stateDuration ? this.stateTime / this.stateDuration : 0);
      if (this.state === "Spawn") {
        const q = 1 - Math.pow(1 - p, 3);
        const overshoot = Math.sin(p * Math.PI) * 0.12;
        this._applyScale(0.35 + q * 0.65 + overshoot);
        this.root.position.y = Math.sin(p * Math.PI) * 0.16;
        this.root.rotation.y = (1 - p) * 0.35;
        return;
      }
      this._applyScale(1);
      const cycle = this.elapsed * (a.runCycle || 8.0);
      const stride = Math.sin(cycle);
      const counter = Math.sin(cycle + Math.PI);
      const breath = Math.sin(this.elapsed * 2.2);
      this.pose(stride, counter, breath, p);
      if (this.state === "Hit") {
        const e = Math.sin(p * Math.PI);
        this.root.position.z -= e * 0.24;
        this.root.rotation.x = -e * 0.18;
        this.root.rotation.z = Math.sin(p * Math.PI * 2) * 0.07;
      }
      if (this.state === "Death") {
        const e = 1 - Math.pow(1 - p, 2);
        this.root.rotation.z = (this.id % 2 ? 1 : -1) * e * 1.34;
        this.root.rotation.x = e * 0.20;
        this.root.position.y = -e * 0.42;
        this.root.position.z = -e * 0.18;
      }
    }

    setTexture(slot, url, options = {}) {
      const mat = this.materials[slot];
      if (!mat || !url) return false;
      const tex = new B.Texture(url, this.scene, false, false);
      if (options.uScale) tex.uScale = options.uScale;
      if (options.vScale) tex.vScale = options.vScale;
      
      if ("albedoTexture" in mat) {
        mat.albedoColor = new B.Color3(1.0, 1.0, 1.0);
        mat.albedoTexture = tex;
        if (slot === "eye" || slot === "accent") mat.emissiveTexture = tex;
      } else {
        mat.diffuseColor = new B.Color3(1.0, 1.0, 1.0);
        mat.diffuseTexture = tex;
        if (slot === "eye" || slot === "accent") mat.emissiveTexture = tex;
      }
      return true;
    }

    build() {}
    pose() {}
  }

  window.BaseEnemyVisual = BaseEnemyVisual;
})();
