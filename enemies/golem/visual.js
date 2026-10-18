(() => {
  "use strict";
  const B = window.BABYLON;
  const Base = window.BaseEnemyVisual;
  if (!B || !Base) return;

  class GolemVisual extends Base {
    constructor(scene, parent, id, level, config) {
      super(scene, parent, id, level, config);
      this._initTextures();
    }

    _initTextures() {
      const texPath = "./enemies/golem/textures/";
      this.setTexture("skin", `${texPath}golem_stone.png`, { uScale: 2.0, vScale: 2.0 });
      this.setTexture("secondary", `${texPath}golem_slate.png`, { uScale: 1.5, vScale: 1.5 });
      this.setTexture("armor", `${texPath}golem_armor.png`, { uScale: 1.0, vScale: 1.0 });
      this.setTexture("bone", `${texPath}golem_crystal.png`, { uScale: 1.0, vScale: 1.0 });
      this.setTexture("claw", `${texPath}golem_rock_fist.png`, { uScale: 1.0, vScale: 1.0 });
      this.setTexture("eye", `${texPath}golem_core_eye.png`, { uScale: 1.0, vScale: 1.0 });
      this.setTexture("accent", `${texPath}golem_rune.png`, { uScale: 1.0, vScale: 1.0 });

      if (this.materials.eye) {
        if ("emissiveIntensity" in this.materials.eye) this.materials.eye.emissiveIntensity = 2.2;
        this.materials.eye.emissiveColor = new B.Color3(0.20, 0.95, 1.0);
      }
      if (this.materials.accent) {
        if ("emissiveIntensity" in this.materials.accent) this.materials.accent.emissiveIntensity = 1.8;
        this.materials.accent.emissiveColor = new B.Color3(0.12, 0.70, 0.95);
      }
    }

    build() {
      const m = this.materials;
      const V = B.Vector3;

      // === 1. THÂN THẠCH TITAN NGUYÊN KHỐI & LÕI MA THẠCH (MONOLITHIC TORSO & CORE) ===
      const body = this.refs.body = this._node("golem_body", new V(0, 0.22, 0));
      
      // Thân ngực đá tảng chính vát cạnh mạnh mẽ (Faceted Monolith Torso)
      this._part("CreateCapsule", "golem_chest", { height: 1.35, radius: 0.58, tessellation: 12 }, 
        new V(0, 0.22, 0), m.skin, body, null, new V(1.20, 0.95, 0.95));

      // Giáp phiến đá ngực trên vát cạnh (Upper Armor Plate)
      this._part("CreateCapsule", "golem_plate_upper", { height: 1.18, radius: 0.22, tessellation: 10 }, 
        new V(0, 0.48, 0.40), m.armor, body, new V(0, 0, Math.PI / 2), new V(1.0, 0.9, 1.15));

      // Lõi Ma Thạch Cổ Đại Phát Quang (Pulsing Mana Core)
      this._part("CreateSphere", "golem_core", { diameter: 0.46, segments: 14 }, 
        new V(0, 0.18, 0.48), m.eye, body, null, new V(1.0, 1.0, 0.90));

      // Khung xương đá sườn ôm trọn bảo vệ lõi năng lượng (Protective Rib Brackets)
      [-1, 1].forEach(side => {
        const bracket = this._part("CreateCapsule", `golem_core_bracket_${side}`, { height: 0.56, radius: 0.10, tessellation: 8 }, 
          new V(0.30 * side, 0.18, 0.44), m.secondary, body, new V(0, 0, 0.35 * side));
      });

      // Bụng & Khối xương chậu đá đen (Basalt Pelvis)
      this._part("CreateCapsule", "golem_pelvis", { height: 1.05, radius: 0.38, tessellation: 10 }, 
        new V(0, -0.52, 0), m.secondary, body, new V(0, 0, Math.PI / 2), new V(0.95, 0.90, 1.05));

      // Cụm gai tinh thể & thạch nhũ sắc nhọn sau lưng (Back Crystal Spine Outcrops)
      const spineSpikes = [
        { y: 0.56, z: -0.46, h: 0.52, r: 0.15, rot: -0.32 },
        { y: 0.26, z: -0.48, h: 0.60, r: 0.17, rot: -0.20 },
        { y: -0.04, z: -0.46, h: 0.46, r: 0.14, rot: -0.08 }
      ];
      spineSpikes.forEach((sp, idx) => {
        this._part("CreateCylinder", `golem_spine_crystal_${idx}`, { height: sp.h, diameterTop: 0, diameterBottom: sp.r * 2, tessellation: 6 }, 
          new V(0, sp.y, sp.z), m.bone, body, new V(sp.rot, 0, 0));
      });

      // Phù ấn cổ ngữ phát sáng trên giáp vai/ngực
      const runePositions = [
        [-0.48, 0.62, 0.42, 0.35],
        [0.48, 0.62, 0.42, -0.35],
        [-0.45, -0.12, 0.45, -0.25],
        [0.45, -0.12, 0.45, 0.25]
      ];
      runePositions.forEach(([rx, ry, rz, rotZ], idx) => {
        const rune = this._part("CreateCylinder", `golem_rune_${idx}`, { height: 0.24, diameterTop: 0.10, diameterBottom: 0.14, tessellation: 5 }, 
          new V(rx, ry, rz), m.accent, body, new V(Math.PI / 2, 0, rotZ));
        rune.scaling.z = 0.25;
      });

      // === 2. ĐẦU ĐÁ KHỐI SENTINEL & GỜ MÀY ĐÁ TẢNG (CHISELED SENTINEL HEAD) ===
      const head = this.refs.head = this._node("golem_head", new V(0, 1.10, 0.05), body);
      
      // Hộp sọ đá góc cạnh
      this._part("CreateCapsule", "golem_headMesh", { height: 0.82, radius: 0.35, tessellation: 10 }, 
        new V(0, 0, 0), m.armor, head, new V(0.12, 0, 0), new V(1.08, 0.95, 1.05));

      // Gờ mày đá tảng đè nặng đe dọa (Heavy Monolithic Brow)
      this._part("CreateCapsule", "golem_brow", { height: 0.84, radius: 0.10, tessellation: 8 }, 
        new V(0, 0.12, 0.36), m.secondary, head, new V(0, 0, Math.PI / 2), new V(1.0, 0.9, 1.2));

      // Quai hàm đá tảng (Chiseled Jaw Slab)
      this._part("CreateCapsule", "golem_jaw", { height: 0.68, radius: 0.12, tessellation: 8 }, 
        new V(0, -0.22, 0.18), m.secondary, head, new V(0, 0, Math.PI / 2));

      // Mắt ma thuật cổ đại phát sáng (Glowing Dual Cyan Optics)
      [-1, 1].forEach(side => {
        this._part("CreateSphere", `golem_eye_${side}`, { diameter: 0.14, segments: 8 }, 
          new V(0.20 * side, 0.04, 0.36), m.eye, head, null, new V(1.2, 0.8, 1.0));
      });

      // Sừng tinh thể trên đỉnh đầu (Crown Crystal Horns)
      [-1, 1].forEach(side => {
        this._part("CreateCylinder", `golem_horn_${side}`, { height: 0.46, diameterTop: 0, diameterBottom: 0.17, tessellation: 6 }, 
          new V(0.30 * side, 0.44, -0.06), m.bone, head, new V(-0.25, 0, 0.28 * side));
      });

      // === 3. HAI CÁNH TAY ĐÁ TẢNG & NẮM ĐẤM BÚA TẠ (BOULDER ARMS & FISTS) ===
      [-1, 1].forEach(side => {
        const sideKey = side < 0 ? "armL" : "armR";
        const foreKey = side < 0 ? "foreL" : "foreR";
        
        // Khớp vai tảng đá khổng lồ
        const shoulder = this.refs[sideKey] = this._node(`golem_shoulder_${side}`, new V(0.88 * side, 0.46, 0), body);
        
        // Cầu vai đá giáp tròn vạm vỡ
        this._part("CreateSphere", `golem_pauldron_${side}`, { diameter: 0.68, segments: 12 }, 
          new V(0, 0.18, 0), m.armor, shoulder, null, new V(1.08, 0.95, 1.18));

        // Gai tinh thể nhô ra từ cầu vai
        this._part("CreateCylinder", `golem_shoulder_spike_${side}`, { height: 0.54, diameterTop: 0, diameterBottom: 0.18, tessellation: 6 }, 
          new V(0.26 * side, 0.38, 0), m.bone, shoulder, new V(0, 0, -0.55 * side));

        // Bắp tay trên đá cột
        this._part("CreateCapsule", `golem_upper_${side}`, { height: 0.72, radius: 0.21, tessellation: 10 }, 
          new V(0.10 * side, -0.24, 0), m.skin, shoulder);

        // Khớp cẳng tay
        const fore = this.refs[foreKey] = this._node(`golem_fore_${side}`, new V(0.12 * side, -0.58, 0), shoulder);

        // Khiên đá cẳng tay
        this._part("CreateCapsule", `golem_foreMesh_${side}`, { height: 0.68, radius: 0.24, tessellation: 10 }, 
          new V(0, -0.20, 0), m.secondary, fore, null, new V(1.05, 1.0, 1.12));

        // Nẹp giáp cẳng tay ngoài
        this._part("CreateCapsule", `golem_fore_plate_${side}`, { height: 0.54, radius: 0.12, tessellation: 8 }, 
          new V(0.24 * side, -0.20, 0), m.armor, fore);

        // Nắm đấm búa tạ nghiền nát (Megalith Fist)
        this._part("CreateSphere", `golem_fist_${side}`, { diameter: 0.62, segments: 10 }, 
          new V(0, -0.58, 0.04), m.claw, fore, null, new V(1.15, 0.95, 1.30));

        // Khớp ngón đá đốt tảng (Stone Knuckles)
        [-0.14, 0, 0.14].forEach((kx, kIdx) => {
          this._part("CreateSphere", `golem_knuckle_${side}_${kIdx}`, { diameter: 0.18, segments: 6 }, 
            new V(kx, -0.68, 0.24), m.armor, fore);
        });
      });

      // === 4. ĐÔI CHÂN CỘT ĐÁ SƯỢNG VỮNG CHẮC (MONOLITHIC PILLAR LEGS & BEDROCK FEET) ===
      [-1, 1].forEach(side => {
        const legKey = side < 0 ? "legL" : "legR";
        const kneeKey = side < 0 ? "kneeL" : "kneeR";

        const leg = this.refs[legKey] = this._node(`golem_leg_${side}`, new V(0.36 * side, -0.42, 0), body);

        // Đùi cột đá vững chắc
        this._part("CreateCapsule", `golem_thigh_${side}`, { height: 0.68, radius: 0.22, tessellation: 10 }, 
          new V(0, -0.34, 0), m.skin, leg);

        // Khớp đầu gối & Bọc gối đá
        const knee = this.refs[kneeKey] = this._node(`golem_knee_${side}`, new V(0, -0.66, 0), leg);
        this._part("CreateSphere", `golem_knee_guard_${side}`, { diameter: 0.38, segments: 8 }, 
          new V(0, 0, 0.18), m.armor, knee);

        // Cẳng chân dưới
        this._part("CreateCapsule", `golem_shin_${side}`, { height: 0.58, radius: 0.23, tessellation: 10 }, 
          new V(0, -0.28, -0.02), m.secondary, knee);

        // Bàn chân đá tảng móng bè (Bedrock Foot)
        this._part("CreateCapsule", `golem_foot_${side}`, { height: 0.82, radius: 0.22, tessellation: 8 }, 
          new V(0, -0.58, 0.12), m.armor, knee, new V(Math.PI / 2, 0, 0), new V(1.15, 0.85, 1.0));
      });
    }

    pose(stride, counter, breath, p) {
      const r = this.refs;
      if (!r.body || !r.head) return;

      const corePulse = 1.0 + Math.sin(this.elapsed * 3.5) * 0.15;
      if (this.materials.eye && "emissiveColor" in this.materials.eye) {
        this.materials.eye.emissiveColor.set(0.15 * corePulse, 0.85 * corePulse, 1.0 * corePulse);
      }

      if (this.state === "Idle") {
        r.body.position.y += breath * 0.028;
        r.body.rotation.x = breath * 0.012;

        r.head.rotation.y = Math.sin(this.elapsed * 0.42) * 0.14;
        r.head.rotation.x = Math.sin(this.elapsed * 0.6) * 0.04;

        r.armL.rotation.z = 0.08 + breath * 0.03;
        r.armR.rotation.z = -0.08 - breath * 0.03;
        r.armL.rotation.x = Math.sin(this.elapsed * 0.8) * 0.05;
        r.armR.rotation.x = -Math.sin(this.elapsed * 0.8) * 0.05;

      } else if (this.state === "Run") {
        const strideY = Math.abs(stride) * 0.065;
        r.body.position.y += strideY;
        r.body.rotation.z = stride * 0.055;
        r.body.rotation.x = 0.04;

        r.legL.rotation.x = stride * 0.34;
        r.legR.rotation.x = counter * 0.34;
        if (r.kneeL) r.kneeL.rotation.x = Math.max(0, -stride * 0.28);
        if (r.kneeR) r.kneeR.rotation.x = Math.max(0, -counter * 0.28);

        r.armL.rotation.x = counter * 0.32;
        r.armR.rotation.x = stride * 0.32;
        if (r.foreL) r.foreL.rotation.x = 0.15 + Math.max(0, -counter * 0.22);
        if (r.foreR) r.foreR.rotation.x = 0.15 + Math.max(0, -stride * 0.22);

        r.head.rotation.x = -0.04;
        r.head.rotation.y = stride * 0.04;

      } else if (this.state === "Attack") {
        if (this.attackVariant === 0) {
          const wind = Math.sin(Math.min(1, p * 1.5) * Math.PI * 0.5);
          const slam = Math.sin(Math.max(0, (p - 0.38) / 0.62) * Math.PI);

          r.body.rotation.x = -wind * 0.22 + slam * 0.42;
          this.root.position.z += slam * 0.32;
          this.root.position.y -= slam * 0.15;

          const armAngle = -wind * 1.35 + slam * 1.85;
          r.armL.rotation.x = armAngle;
          r.armR.rotation.x = armAngle;
          r.armL.rotation.z = -0.15 + slam * 0.25;
          r.armR.rotation.z = 0.15 - slam * 0.25;

          if (r.foreL) r.foreL.rotation.x = -wind * 0.55 + slam * 0.95;
          if (r.foreR) r.foreR.rotation.x = -wind * 0.55 + slam * 0.95;

          r.head.rotation.x = wind * 0.25 - slam * 0.35;

        } else {
          const wind = Math.sin(Math.min(1, p * 1.4) * Math.PI * 0.5);
          const strike = Math.sin(Math.max(0, (p - 0.32) / 0.68) * Math.PI);

          const twist = -wind * 0.35 + strike * 0.55;
          r.body.rotation.y = twist;
          this.root.position.z += strike * 0.28;

          r.armR.rotation.x = -wind * 1.15 + strike * 1.75;
          r.armR.rotation.y = -strike * 0.45;
          if (r.foreR) r.foreR.rotation.x = -wind * 0.45 + strike * 0.85;

          r.armL.rotation.x = wind * 0.45 - strike * 0.35;
          r.armL.rotation.z = 0.35;

          r.head.rotation.y = twist * 0.65;
        }

      } else if (this.state === "Hit") {
        const e = Math.sin(p * Math.PI);
        r.body.rotation.x = -e * 0.16;
        r.head.rotation.x = -e * 0.22;
        r.armL.rotation.x = -e * 0.25;
        r.armR.rotation.x = -e * 0.25;
      }
    }
  }

  window.EnemyRegistry.registerVisual("golem", GolemVisual);
})();
