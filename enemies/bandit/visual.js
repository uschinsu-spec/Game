(() => {
  "use strict";
  const B = window.BABYLON;
  const Base = window.BaseEnemyVisual;
  if (!B || !Base) return;

  class BanditVisual extends Base {
    constructor(scene, parent, id, level, config) {
      super(scene, parent, id, level, config);
      this._initTextures();
    }

    _initTextures() {
      const texPath = "./enemies/bandit/textures/";
      this.setTexture("skin", `${texPath}bandit_cloth.png`, { uScale: 2.0, vScale: 2.0 });
      this.setTexture("secondary", `${texPath}bandit_shroud.png`, { uScale: 1.5, vScale: 1.5 });
      this.setTexture("armor", `${texPath}bandit_armor.png`, { uScale: 1.0, vScale: 1.0 });
      this.setTexture("bone", `${texPath}bandit_bone.png`, { uScale: 1.0, vScale: 1.0 });
      this.setTexture("claw", `${texPath}bandit_claw.png`, { uScale: 1.0, vScale: 1.0 });
      this.setTexture("eye", `${texPath}bandit_eye.png`, { uScale: 1.0, vScale: 1.0 });
      this.setTexture("accent", `${texPath}bandit_accent.png`, { uScale: 1.0, vScale: 1.0 });

      if (this.materials.eye) {
        if ("emissiveIntensity" in this.materials.eye) this.materials.eye.emissiveIntensity = 2.0;
        this.materials.eye.emissiveColor = new B.Color3(1.0, 0.28, 0.05);
      }
      if (this.materials.accent) {
        if ("emissiveIntensity" in this.materials.accent) this.materials.accent.emissiveIntensity = 1.5;
        this.materials.accent.emissiveColor = new B.Color3(0.88, 0.42, 0.08);
      }
    }

    build() {
      const m = this.materials;
      const V = B.Vector3;

      // === 1. THÂN THỂ SÁT THỦ & ÁO CHOÀNG BÓNG MA (TORSO & CLOAK) ===
      const torso = this.refs.body = this._node("bandit_torso", new V(0, 0.20, 0));
      
      // Thân chính thon gọn
      this._part("CreateCapsule", "bandit_body", { height: 1.25, radius: 0.35, tessellation: 12 }, 
        new V(0, 0.10, 0), m.skin, torso, null, new V(1.05, 1.0, 0.92));

      // Giáp ngực da thuộc nẹp khóa (Hardened Leather Vest)
      this._part("CreateCapsule", "bandit_chestArmor", { height: 0.72, radius: 0.28, tessellation: 10 }, 
        new V(0, 0.20, 0.16), m.armor, torso, null, new V(1.18, 0.95, 0.85));

      // Thắt lưng bùa chú & Cổ ngữ phát sáng (Talisman Belt)
      this._part("CreateCapsule", "bandit_belt", { height: 0.76, radius: 0.18, tessellation: 8 }, 
        new V(0, -0.40, 0), m.accent, torso, new V(0, 0, Math.PI / 2), new V(1.0, 0.85, 1.35));

      // Khóa đai phù ấn ma quái
      this._part("CreateSphere", "bandit_belt_buckle", { diameter: 0.18, segments: 8 }, 
        new V(0, -0.40, 0.28), m.accent, torso);

      // Vạt áo choàng rách bay lướt phía sau (Tattered Cloak Tails)
      [-0.18, 0.18].forEach((cx, idx) => {
        const cape = this.refs[`cape_${idx}`] = this._node(`bandit_cape_${idx}`, new V(cx, 0.20, -0.28), torso);
        this._part("CreateCapsule", `bandit_capeMesh_${idx}`, { height: 0.95, radius: 0.14, tessellation: 8 }, 
          new V(0, -0.42, -0.06), m.skin, cape, new V(-0.15, 0, cx * 0.4), new V(1.1, 1.0, 0.35));
      });

      // === 2. ĐẦU TRÙM MŨ ÁM SÁT, MẶT NẠ MA RỪNG & MẮT ĐỎ RỰC (HOOD, MASK & EYES) ===
      const head = this.refs.head = this._node("bandit_head", new V(0, 0.98, 0), torso);
      
      // Mặt nạ bóng ma bên trong (Phantom Mask)
      this._part("CreateSphere", "bandit_face", { diameter: 0.58, segments: 12 }, 
        new V(0, 0, 0.04), m.secondary, head, null, new V(0.92, 1.06, 0.96));

      // Mũ trùm đầu sâu thẳm bí ẩn (Deep Assassin Hood)
      const hood = this._part("CreateSphere", "bandit_hood", { diameter: 0.76, segments: 12 }, 
        new V(0, 0.06, -0.04), m.skin, head);
      hood.scaling.y = 1.12;
      hood.scaling.z = 1.04;

      // Vành mũ trùm nhô che bóng mặt
      this._part("CreateCapsule", "bandit_hood_brim", { height: 0.68, radius: 0.14, tessellation: 8 }, 
        new V(0, 0.28, 0.20), m.skin, head, new V(0, 0, Math.PI / 2), new V(1.0, 0.65, 1.25));

      // Đôi mắt ma quái rực lửa nhìn xuyên bóng tối (Glowing Crimson Eyes)
      [-1, 1].forEach(side => {
        this._part("CreateSphere", `bandit_eye_${side}`, { diameter: 0.12, segments: 8 }, 
          new V(0.16 * side, 0.04, 0.28), m.eye, head, null, new V(1.2, 0.8, 1.0));
      });

      // Cặp sừng quỷ rừng cong vút phía sau (Curved Forest Demon Horns)
      [-1, 1].forEach(side => {
        this._part("CreateCylinder", `bandit_horn_${side}`, { height: 0.58, diameterTop: 0, diameterBottom: 0.17, tessellation: 6 }, 
          new V(0.24 * side, 0.46, -0.10), m.bone, head, new V(-0.45, 0, 0.25 * side));
      });

      // === 3. HAI CÁNH TAY SÁT THỦ & SONG ĐAO MÓNG VUỐT (ARMS & DUAL CLAW BLADES) ===
      [-1, 1].forEach(side => {
        const sideKey = side < 0 ? "armL" : "armR";
        const foreKey = side < 0 ? "foreL" : "foreR";

        const arm = this.refs[sideKey] = this._node(`bandit_arm_${side}`, new V(0.50 * side, 0.40, 0), torso);
        
        // Giáp bọc vai nẹp đinh
        this._part("CreateSphere", `bandit_pauldron_${side}`, { diameter: 0.35, segments: 8 }, 
          new V(0, 0.08, 0), m.armor, arm);

        // Bắp tay trên
        this._part("CreateCapsule", `bandit_upper_${side}`, { height: 0.64, radius: 0.12, tessellation: 8 }, 
          new V(0, -0.22, 0), m.skin, arm);

        // Khớp cẳng tay
        const fore = this.refs[foreKey] = this._node(`bandit_fore_${side}`, new V(0, -0.50, 0), arm);

        // Giáp cẳng tay bọc vải quấn
        this._part("CreateCapsule", `bandit_foreMesh_${side}`, { height: 0.58, radius: 0.11, tessellation: 8 }, 
          new V(0, -0.18, 0), m.secondary, fore);

        // Song đao móng vuốt sát thủ lưỡi cong sắc bén (Assassin Curved Claw Blade)
        const blade = this._part("CreateCylinder", `bandit_blade_${side}`, { height: 0.72, diameterTop: 0, diameterBottom: 0.12, tessellation: 5 }, 
          new V(0.04 * side, -0.46, 0.26), m.claw, fore, new V(0.45, 0, -0.12 * side));
        blade.scaling.z = 0.35;

        // Lưỡi phụ cẳng tay
        const subBlade = this._part("CreateCylinder", `bandit_sub_blade_${side}`, { height: 0.36, diameterTop: 0, diameterBottom: 0.08, tessellation: 5 }, 
          new V(0.06 * side, -0.26, -0.18), m.claw, fore, new V(-0.65, 0, 0));
        subBlade.scaling.z = 0.35;
      });

      // === 4. ĐÔI CHÂN NHANH NHẸN & BỐT DA (LEGS & STALKER BOOTS) ===
      [-1, 1].forEach(side => {
        const legKey = side < 0 ? "legL" : "legR";
        const kneeKey = side < 0 ? "kneeL" : "kneeR";

        const leg = this.refs[legKey] = this._node(`bandit_leg_${side}`, new V(0.22 * side, -0.38, 0), torso);

        // Đùi thon gọn bọc vải sẫm
        this._part("CreateCapsule", `bandit_thigh_${side}`, { height: 0.66, radius: 0.13, tessellation: 8 }, 
          new V(0, -0.24, 0), m.secondary, leg);

        // Khớp đầu gối & Bắp chân
        const knee = this.refs[kneeKey] = this._node(`bandit_knee_${side}`, new V(0, -0.52, 0), leg);
        this._part("CreateCapsule", `bandit_shin_${side}`, { height: 0.60, radius: 0.115, tessellation: 8 }, 
          new V(0, -0.18, 0), m.secondary, knee);

        // Bốt da sát thủ bịt mũi thép (Stalker Boots)
        this._part("CreateCapsule", `bandit_boot_${side}`, { height: 0.48, radius: 0.12, tessellation: 8 }, 
          new V(0, -0.48, 0.08), m.claw, knee, new V(Math.PI / 2, 0, 0), new V(1.0, 0.85, 1.15));
      });
    }

    pose(stride, counter, breath, p) {
      const r = this.refs;
      if (!r.body || !r.head) return;

      if (this.state === "Idle") {
        r.body.position.y += breath * 0.024;
        r.body.rotation.x = 0.06 + breath * 0.015;

        r.head.rotation.y = Math.sin(this.elapsed * 1.1) * 0.18;
        r.head.rotation.z = Math.cos(this.elapsed * 0.7) * 0.06;

        r.armL.rotation.z = 0.14 + breath * 0.03;
        r.armR.rotation.z = -0.14 - breath * 0.03;
        r.armL.rotation.x = 0.20 + Math.sin(this.elapsed * 1.4) * 0.06;
        r.armR.rotation.x = 0.20 - Math.sin(this.elapsed * 1.4) * 0.06;
        if (r.foreL) r.foreL.rotation.x = -0.45;
        if (r.foreR) r.foreR.rotation.x = -0.45;

        if (r.cape_0) r.cape_0.rotation.x = Math.sin(this.elapsed * 2.2) * 0.12;
        if (r.cape_1) r.cape_1.rotation.x = Math.sin(this.elapsed * 2.2 + 0.4) * 0.12;

      } else if (this.state === "Run") {
        const strideY = Math.abs(stride) * 0.07;
        r.body.position.y += strideY;
        r.body.rotation.x = 0.14;
        r.body.rotation.z = stride * 0.045;

        r.legL.rotation.x = stride * 0.58;
        r.legR.rotation.x = counter * 0.58;
        if (r.kneeL) r.kneeL.rotation.x = Math.max(0, -stride * 0.45);
        if (r.kneeR) r.kneeR.rotation.x = Math.max(0, -counter * 0.45);

        r.armL.rotation.x = counter * 0.50;
        r.armR.rotation.x = stride * 0.50;
        if (r.foreL) r.foreL.rotation.x = -0.35 + Math.abs(counter) * 0.25;
        if (r.foreR) r.foreR.rotation.x = -0.35 + Math.abs(stride) * 0.25;

        r.head.rotation.x = -0.10;
        r.head.rotation.y = stride * 0.06;

        if (r.cape_0) r.cape_0.rotation.x = -0.42 + stride * 0.15;
        if (r.cape_1) r.cape_1.rotation.x = -0.42 + counter * 0.15;

      } else if (this.state === "Attack") {
        const e = Math.sin(p * Math.PI);

        if (this.attackVariant === 0) {
          const leap = Math.sin(p * Math.PI);
          this.root.position.z += leap * 0.46;
          this.root.position.y += Math.sin(p * Math.PI) * 0.15;

          r.body.rotation.x = -leap * 0.20;

          r.armL.rotation.x = -e * 1.35;
          r.armR.rotation.x = -e * 1.35;
          r.armL.rotation.z = -e * 0.65;
          r.armR.rotation.z = e * 0.65;

          if (r.foreL) r.foreL.rotation.x = -e * 0.85;
          if (r.foreR) r.foreR.rotation.x = -e * 0.85;

          r.head.rotation.x = -e * 0.35;

        } else {
          const spin = Math.sin(p * Math.PI * 2) * 0.45;
          this.root.position.z += e * 0.35;
          r.body.rotation.y = spin * 1.2;

          r.armR.rotation.x = -e * 1.45;
          r.armR.rotation.z = e * 0.55;
          if (r.foreR) r.foreR.rotation.x = -e * 0.65;

          r.armL.rotation.x = e * 0.65;
          r.armL.rotation.z = -0.35;

          r.head.rotation.y = spin * 0.8;
        }

      } else if (this.state === "Hit") {
        const e = Math.sin(p * Math.PI);
        r.body.rotation.x = -e * 0.24;
        r.head.rotation.x = e * 0.32;
        r.armL.rotation.x = e * 0.45;
        r.armR.rotation.x = e * 0.45;
      }
    }
  }

  window.EnemyRegistry.registerVisual("bandit", BanditVisual);
})();
