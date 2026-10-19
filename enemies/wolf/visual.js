(() => {
  "use strict";

  const B = window.BABYLON;
  const Base = window.BaseEnemyVisual;

  if (!B || !Base) {
    console.warn("[WolfVisual] BABYLON hoặc BaseEnemyVisual chưa được tải.");
    return;
  }

  /**
   * WolfVisual
   *
   * Dire Wolf procedural 3D cao cấp dành cho Babylon.js.
   *
   * Tính năng:
   * - Hình thể sói 4 chân theo hướng digitigrade.
   * - Vai trước cao, lồng ngực lớn, bụng thon, hông khỏe.
   * - Đầu, mõm, hàm dưới, tai, lông má và lông mày tách riêng.
   * - Bờm cổ và bờm ngực nhiều lớp.
   * - Mắt hổ phách phát sáng.
   * - Ấn ký săn mồi phát quang.
   * - Bàn chân có ngón và móng vuốt riêng.
   * - Đuôi xù 6 khớp với secondary motion.
   * - Idle, Run, Attack, Hit, Death.
   * - Chuyển trạng thái an toàn, hạn chế lưu rotation từ state cũ.
   *
   * Yêu cầu từ BaseEnemyVisual:
   * - this._node(name, position, parent?)
   * - this._part(builderName, name, options, position, material,
   *              parent, rotation?, scaling?)
   * - this.setTexture(key, url, options?)
   * - this.refs
   * - this.materials
   * - this.state
   * - this.elapsed
   * - this.config
   * - this.id
   */
  class WolfVisual extends Base {
    constructor(scene, parent, id, level, config) {
      super(scene, parent, id, level, config);

      this.scene = scene;
      this.wolfId = id;
      this.level = level || 1;

      this._previousState = null;
      this._blinkTimer = 0;
      this._nextBlinkTime = 2.4 + this._stableNoise(id || 1) * 2.5;

      this._initTextures();
      this._configureMaterials();
    }

    // ============================================================
    // 1. TIỆN ÍCH NỘI BỘ
    // ============================================================

    _stableNoise(seed) {
      const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
      return value - Math.floor(value);
    }

    _safeNumber(value, fallback) {
      return Number.isFinite(value) ? value : fallback;
    }

    _animationConfig(key, fallback) {
      const animation = this.config && this.config.animation;
      if (!animation) return fallback;

      return this._safeNumber(animation[key], fallback);
    }

    _setMaterialProperty(material, property, value) {
      if (!material || !(property in material)) return;
      material[property] = value;
    }

    _configurePBRMaterial(material, options = {}) {
      if (!material) return;

      const {
        metallic = 0,
        roughness = 0.8,
        directIntensity = 1,
        environmentIntensity = 0.75,
        emissiveIntensity = 0,
        emissiveColor = null,
        backFaceCulling = true
      } = options;

      this._setMaterialProperty(material, "metallic", metallic);
      this._setMaterialProperty(material, "roughness", roughness);
      this._setMaterialProperty(material, "directIntensity", directIntensity);
      this._setMaterialProperty(
        material,
        "environmentIntensity",
        environmentIntensity
      );
      this._setMaterialProperty(
        material,
        "emissiveIntensity",
        emissiveIntensity
      );
      this._setMaterialProperty(
        material,
        "backFaceCulling",
        backFaceCulling
      );

      if (emissiveColor && "emissiveColor" in material) {
        material.emissiveColor = emissiveColor;
      }

      if ("useRadianceOverAlpha" in material) {
        material.useRadianceOverAlpha = true;
      }

      if ("useSpecularOverAlpha" in material) {
        material.useSpecularOverAlpha = true;
      }
    }

    _nodeRotation(node, x = 0, y = 0, z = 0) {
      if (!node) return;

      node.rotation.x = x;
      node.rotation.y = y;
      node.rotation.z = z;
    }

    _lerp(a, b, t) {
      return a + (b - a) * t;
    }

    _smoothStep(t) {
      const x = Math.max(0, Math.min(1, t));
      return x * x * (3 - 2 * x);
    }

    _easeOutCubic(t) {
      const x = Math.max(0, Math.min(1, t));
      return 1 - Math.pow(1 - x, 3);
    }

    _pulse(t, center, width) {
      const distance = Math.abs(t - center);
      return Math.max(0, 1 - distance / width);
    }

    // ============================================================
    // 2. TEXTURE VÀ VẬT LIỆU
    // ============================================================

    _initTextures() {
      const texPath = "./enemies/wolf/textures/";

      this.setTexture("skin", `${texPath}wolf_fur.png`, {
        uScale: 2.4,
        vScale: 2.4
      });

      this.setTexture("secondary", `${texPath}wolf_underbelly.png`, {
        uScale: 2.0,
        vScale: 2.0
      });

      this.setTexture("armor", `${texPath}wolf_armor.png`, {
        uScale: 1.2,
        vScale: 1.2
      });

      this.setTexture("bone", `${texPath}wolf_bone.png`, {
        uScale: 1.0,
        vScale: 1.0
      });

      this.setTexture("claw", `${texPath}wolf_claw.png`, {
        uScale: 1.0,
        vScale: 1.0
      });

      this.setTexture("eye", `${texPath}wolf_eye.png`, {
        uScale: 1.0,
        vScale: 1.0
      });

      this.setTexture("accent", `${texPath}wolf_accent.png`, {
        uScale: 1.0,
        vScale: 1.0
      });
    }

    _configureMaterials() {
      const m = this.materials || {};

      this._configurePBRMaterial(m.skin, {
        metallic: 0.02,
        roughness: 0.88,
        directIntensity: 1.1,
        environmentIntensity: 0.65
      });

      this._configurePBRMaterial(m.secondary, {
        metallic: 0,
        roughness: 0.94,
        directIntensity: 1.0,
        environmentIntensity: 0.55
      });

      this._configurePBRMaterial(m.armor, {
        metallic: 0.42,
        roughness: 0.46,
        directIntensity: 1.2,
        environmentIntensity: 1.0
      });

      this._configurePBRMaterial(m.bone, {
        metallic: 0,
        roughness: 0.58,
        directIntensity: 1.15,
        environmentIntensity: 0.8
      });

      this._configurePBRMaterial(m.claw, {
        metallic: 0.18,
        roughness: 0.31,
        directIntensity: 1.25,
        environmentIntensity: 1.05
      });

      this._configurePBRMaterial(m.eye, {
        metallic: 0,
        roughness: 0.06,
        directIntensity: 1.3,
        environmentIntensity: 1.2,
        emissiveIntensity: 4.5,
        emissiveColor: new B.Color3(1.0, 0.55, 0.06)
      });

      this._configurePBRMaterial(m.accent, {
        metallic: 0.12,
        roughness: 0.24,
        directIntensity: 1.2,
        environmentIntensity: 1.1,
        emissiveIntensity: 3.4,
        emissiveColor: new B.Color3(1.0, 0.28, 0.025)
      });

      if (m.eye && "alpha" in m.eye) {
        m.eye.alpha = 1;
      }
    }

    // ============================================================
    // 3. HÀM TẠO CHI TIẾT HÌNH HỌC
    // ============================================================

    _createFurSpike(name, position, material, parent, options = {}) {
      const V = B.Vector3;

      const height = options.height || 0.32;
      const width = options.width || 0.12;
      const rotation = options.rotation || new V(0, 0, 0);
      const scaling = options.scaling || new V(1, 1, 1);

      return this._part(
        "CreateCylinder",
        name,
        {
          height,
          diameterTop: 0,
          diameterBottom: width,
          tessellation: options.tessellation || 6
        },
        position,
        material,
        parent,
        rotation,
        scaling
      );
    }

    _createToeClaws(prefix, foot, material, direction = 1) {
      const V = B.Vector3;
      const toeXs = [-0.105, 0, 0.105];

      toeXs.forEach((x, index) => {
        const toe = this._node(
          `${prefix}_toeNode_${index}`,
          new V(x, -0.015, 0.10 * direction),
          foot
        );

        this._part(
          "CreateCapsule",
          `${prefix}_toe_${index}`,
          {
            height: 0.22,
            radius: 0.052,
            tessellation: 8
          },
          new V(0, 0, 0.07 * direction),
          material,
          toe,
          new V(Math.PI / 2, 0, 0),
          new V(1.0, 0.80, 1.0)
        );

        const claw = this._createFurSpike(
          `${prefix}_claw_${index}`,
          new V(0, -0.018, 0.19 * direction),
          material,
          toe,
          {
            height: 0.16,
            width: 0.055,
            tessellation: 7,
            rotation: new V(
              direction > 0 ? Math.PI / 2.38 : -Math.PI / 2.38,
              0,
              0
            ),
            scaling: new V(0.70, 1.0, 1.0)
          }
        );

        if (claw) {
          claw.isPickable = false;
        }
      });
    }

    _createLeg(side, isFront, body, materials) {
      const V = B.Vector3;
      const sideName = side < 0 ? "L" : "R";
      const prefix = isFront ? `front${sideName}` : `back${sideName}`;

      const hipPosition = isFront
        ? new V(0.39 * side, 0.17, 0.43)
        : new V(0.36 * side, 0.12, -0.50);

      const hip = this.refs[`${prefix}_hip`] = this._node(
        `wolf_${prefix}_hip`,
        hipPosition,
        body
      );

      if (isFront) {
        // Khối cơ vai
        this._part(
          "CreateSphere",
          `wolf_${prefix}_shoulderMuscle`,
          {
            diameter: 0.45,
            segments: 12
          },
          new V(0, -0.03, 0.01),
          materials.skin,
          hip,
          null,
          new V(0.95, 1.22, 0.96)
        );

        // Bắp chân trên
        this._part(
          "CreateCapsule",
          `wolf_${prefix}_upperLeg`,
          {
            height: 0.59,
            radius: 0.175,
            tessellation: 12
          },
          new V(0, -0.22, -0.01),
          materials.skin,
          hip,
          new V(0.10, 0, -0.045 * side),
          new V(1.0, 1.0, 1.08)
        );

        const knee = this.refs[`${prefix}_knee`] = this._node(
          `wolf_${prefix}_knee`,
          new V(0, -0.45, -0.045),
          hip
        );

        this._part(
          "CreateSphere",
          `wolf_${prefix}_kneeJoint`,
          {
            diameter: 0.25,
            segments: 9
          },
          new V(0, 0, 0),
          materials.secondary,
          knee,
          null,
          new V(0.92, 1.05, 0.92)
        );

        this._part(
          "CreateCapsule",
          `wolf_${prefix}_lowerLeg`,
          {
            height: 0.63,
            radius: 0.115,
            tessellation: 10
          },
          new V(0, -0.25, 0.025),
          materials.secondary,
          knee,
          new V(-0.08, 0, 0),
          new V(0.95, 1.0, 0.95)
        );

        const foot = this.refs[`${prefix}_foot`] = this._node(
          `wolf_${prefix}_foot`,
          new V(0, -0.54, 0.075),
          knee
        );

        this._part(
          "CreateCapsule",
          `wolf_${prefix}_paw`,
          {
            height: 0.34,
            radius: 0.145,
            tessellation: 10
          },
          new V(0, 0, 0.105),
          materials.secondary,
          foot,
          new V(Math.PI / 2, 0, 0),
          new V(1.20, 0.79, 1.0)
        );

        this._createToeClaws(
          `wolf_${prefix}`,
          foot,
          materials.claw,
          1
        );
      } else {
        // Khối cơ đùi sau
        this._part(
          "CreateSphere",
          `wolf_${prefix}_thighMuscle`,
          {
            diameter: 0.53,
            segments: 12
          },
          new V(0, -0.10, -0.005),
          materials.skin,
          hip,
          null,
          new V(0.96, 1.25, 1.13)
        );

        this._part(
          "CreateCapsule",
          `wolf_${prefix}_upperLeg`,
          {
            height: 0.65,
            radius: 0.19,
            tessellation: 12
          },
          new V(0, -0.22, -0.055),
          materials.skin,
          hip,
          new V(-0.36, 0, 0.055 * side),
          new V(1.0, 1.0, 1.17)
        );

        const knee = this.refs[`${prefix}_knee`] = this._node(
          `wolf_${prefix}_knee`,
          new V(0, -0.46, -0.18),
          hip
        );

        this._part(
          "CreateSphere",
          `wolf_${prefix}_hockJoint`,
          {
            diameter: 0.27,
            segments: 9
          },
          new V(0, 0, 0),
          materials.secondary,
          knee,
          null,
          new V(0.90, 1.08, 0.90)
        );

        this._part(
          "CreateCapsule",
          `wolf_${prefix}_lowerLeg`,
          {
            height: 0.64,
            radius: 0.12,
            tessellation: 10
          },
          new V(0, -0.24, 0.12),
          materials.secondary,
          knee,
          new V(0.43, 0, 0),
          new V(0.93, 1.0, 0.93)
        );

        const foot = this.refs[`${prefix}_foot`] = this._node(
          `wolf_${prefix}_foot`,
          new V(0, -0.50, 0.24),
          knee
        );

        this._part(
          "CreateCapsule",
          `wolf_${prefix}_paw`,
          {
            height: 0.35,
            radius: 0.15,
            tessellation: 10
          },
          new V(0, 0, 0.105),
          materials.secondary,
          foot,
          new V(Math.PI / 2, 0, 0),
          new V(1.18, 0.80, 1.0)
        );

        this._createToeClaws(
          `wolf_${prefix}`,
          foot,
          materials.claw,
          1
        );
      }
    }

    _createTail(body, materials) {
      const V = B.Vector3;

      const tailDefinitions = [
        {
          name: "tail0",
          anchor: new V(0, 0.18, -0.72),
          local: new V(0, -0.16, -0.15),
          height: 0.51,
          radius: 0.175,
          rotation: -0.71,
          material: materials.skin,
          scale: new V(1.02, 1.0, 1.08)
        },
        {
          name: "tail1",
          anchor: new V(0, -0.31, -0.31),
          local: new V(0, -0.16, -0.13),
          height: 0.49,
          radius: 0.185,
          rotation: -0.58,
          material: materials.skin,
          scale: new V(1.10, 1.0, 1.12)
        },
        {
          name: "tail2",
          anchor: new V(0, -0.31, -0.26),
          local: new V(0, -0.15, -0.11),
          height: 0.46,
          radius: 0.175,
          rotation: -0.49,
          material: materials.secondary,
          scale: new V(1.12, 1.0, 1.12)
        },
        {
          name: "tail3",
          anchor: new V(0, -0.29, -0.22),
          local: new V(0, -0.14, -0.09),
          height: 0.42,
          radius: 0.15,
          rotation: -0.41,
          material: materials.secondary,
          scale: new V(1.09, 1.0, 1.09)
        },
        {
          name: "tail4",
          anchor: new V(0, -0.26, -0.18),
          local: new V(0, -0.12, -0.07),
          height: 0.36,
          radius: 0.12,
          rotation: -0.33,
          material: materials.secondary,
          scale: new V(1.05, 1.0, 1.05)
        },
        {
          name: "tail5",
          anchor: new V(0, -0.22, -0.14),
          local: new V(0, -0.10, -0.05),
          height: 0.30,
          radius: 0.085,
          rotation: -0.25,
          material: materials.accent,
          scale: new V(1.02, 1.0, 1.02)
        }
      ];

      let parent = body;

      tailDefinitions.forEach((segment, index) => {
        const node = this.refs[segment.name] = this._node(
          `wolf_${segment.name}`,
          segment.anchor,
          parent
        );

        this._part(
          "CreateCapsule",
          `wolf_${segment.name}_mesh`,
          {
            height: segment.height,
            radius: segment.radius,
            tessellation: 10
          },
          segment.local,
          segment.material,
          node,
          new V(segment.rotation, 0, 0),
          segment.scale
        );

        if (index >= 1 && index <= 4) {
          [-1, 1].forEach((side) => {
            this._createFurSpike(
              `wolf_${segment.name}_fur_${side}`,
              new V(
                side * segment.radius * 0.55,
                -segment.height * 0.17,
                -segment.radius * 0.15
              ),
              segment.material,
              node,
              {
                height: 0.21 - index * 0.015,
                width: 0.09,
                rotation: new V(
                  -0.9,
                  0,
                  side * 0.34
                ),
                scaling: new V(0.82, 1.0, 1.0)
              }
            );
          });
        }

        parent = node;
      });
    }

    // ============================================================
    // 4. XÂY DỰNG MÔ HÌNH
    // ============================================================

    build() {
      const m = this.materials;
      const V = B.Vector3;

      // ----------------------------------------------------------
      // BODY ROOT
      // ----------------------------------------------------------

      const body = this.refs.body = this._node(
        "wolf_body",
        new V(0, 0.05, 0)
      );

      // Trục lồng ngực
      this._part(
        "CreateCapsule",
        "wolf_chestCore",
        {
          height: 1.30,
          radius: 0.42,
          tessellation: 18
        },
        new V(0, 0.15, 0.27),
        m.skin,
        body,
        new V(Math.PI / 2.28, 0, 0),
        new V(1.12, 0.96, 1.20)
      );

      // Khối xương sườn
      this._part(
        "CreateSphere",
        "wolf_ribcage",
        {
          diameter: 0.88,
          segments: 18
        },
        new V(0, 0.13, 0.22),
        m.skin,
        body,
        null,
        new V(1.06, 0.91, 1.25)
      );

      // Vai trước cao và khỏe
      this._part(
        "CreateSphere",
        "wolf_shoulders",
        {
          diameter: 0.78,
          segments: 16
        },
        new V(0, 0.23, 0.40),
        m.skin,
        body,
        null,
        new V(1.25, 0.94, 0.95)
      );

      // Bụng thon
      this._part(
        "CreateCapsule",
        "wolf_abdomen",
        {
          height: 1.03,
          radius: 0.29,
          tessellation: 15
        },
        new V(0, 0.07, -0.27),
        m.secondary,
        body,
        new V(Math.PI / 2.10, 0, 0),
        new V(0.94, 0.89, 1.09)
      );

      // Hông sau
      this._part(
        "CreateSphere",
        "wolf_pelvis",
        {
          diameter: 0.67,
          segments: 16
        },
        new V(0, 0.13, -0.57),
        m.skin,
        body,
        null,
        new V(1.03, 0.92, 1.14)
      );

      // Dải bụng dưới
      this._part(
        "CreateCapsule",
        "wolf_underbelly",
        {
          height: 0.96,
          radius: 0.19,
          tessellation: 12
        },
        new V(0, -0.16, -0.11),
        m.secondary,
        body,
        new V(Math.PI / 2.08, 0, 0),
        new V(1.12, 0.75, 1.0)
      );

      // ----------------------------------------------------------
      // BỜM NGỰC VÀ LÔNG VAI
      // ----------------------------------------------------------

      this._part(
        "CreateCapsule",
        "wolf_maneCore",
        {
          height: 0.91,
          radius: 0.36,
          tessellation: 14
        },
        new V(0, 0.28, 0.48),
        m.secondary,
        body,
        new V(Math.PI / 2.70, 0, 0),
        new V(1.18, 0.94, 0.88)
      );

      const chestFur = [
        {
          x: 0,
          y: 0.12,
          z: 0.67,
          h: 0.40,
          w: 0.18,
          rz: 0
        },
        {
          x: -0.13,
          y: 0.10,
          z: 0.61,
          h: 0.37,
          w: 0.15,
          rz: -0.24
        },
        {
          x: 0.13,
          y: 0.10,
          z: 0.61,
          h: 0.37,
          w: 0.15,
          rz: 0.24
        },
        {
          x: -0.24,
          y: 0.19,
          z: 0.51,
          h: 0.32,
          w: 0.13,
          rz: -0.42
        },
        {
          x: 0.24,
          y: 0.19,
          z: 0.51,
          h: 0.32,
          w: 0.13,
          rz: 0.42
        },
        {
          x: -0.31,
          y: 0.28,
          z: 0.40,
          h: 0.27,
          w: 0.12,
          rz: -0.58
        },
        {
          x: 0.31,
          y: 0.28,
          z: 0.40,
          h: 0.27,
          w: 0.12,
          rz: 0.58
        }
      ];

      chestFur.forEach((fur, index) => {
        this._createFurSpike(
          `wolf_chestFur_${index}`,
          new V(fur.x, fur.y, fur.z),
          m.secondary,
          body,
          {
            height: fur.h,
            width: fur.w,
            rotation: new V(Math.PI / 2.35, 0, fur.rz)
          }
        );
      });

      // ----------------------------------------------------------
      // GAI SỐNG LƯNG
      // ----------------------------------------------------------

      const dorsalRidge = [
        { y: 0.51, z: 0.43, h: 0.36, w: 0.18, rx: -0.18 },
        { y: 0.49, z: 0.19, h: 0.42, w: 0.19, rx: -0.11 },
        { y: 0.43, z: -0.07, h: 0.39, w: 0.17, rx: -0.03 },
        { y: 0.37, z: -0.31, h: 0.34, w: 0.15, rx: 0.07 },
        { y: 0.32, z: -0.51, h: 0.28, w: 0.13, rx: 0.13 }
      ];

      dorsalRidge.forEach((spike, index) => {
        this._createFurSpike(
          `wolf_dorsalRidge_${index}`,
          new V(0, spike.y, spike.z),
          m.armor,
          body,
          {
            height: spike.h,
            width: spike.w,
            rotation: new V(spike.rx, 0, 0),
            tessellation: 7,
            scaling: new V(0.58, 1.0, 1.0)
          }
        );
      });

      // ----------------------------------------------------------
      // ẤN KÝ HAI BÊN SƯỜN
      // ----------------------------------------------------------

      [-1, 1].forEach((side) => {
        const runeRoot = this.refs[
          side < 0 ? "rune_L" : "rune_R"
        ] = this._node(
          `wolf_runeRoot_${side}`,
          new V(0.418 * side, 0.17, 0.08),
          body
        );

        this._part(
          "CreateTorus",
          `wolf_runeRing_${side}`,
          {
            diameter: 0.25,
            thickness: 0.04,
            tessellation: 16
          },
          new V(0, 0, 0),
          m.accent,
          runeRoot,
          new V(0, 0, Math.PI / 2)
        );

        this._part(
          "CreateSphere",
          `wolf_runeCore_${side}`,
          {
            diameter: 0.11,
            segments: 10
          },
          new V(0.012 * side, 0, 0),
          m.accent,
          runeRoot,
          null,
          new V(0.32, 1.0, 1.0)
        );

        for (let index = 0; index < 3; index += 1) {
          const angle = index * (Math.PI * 2 / 3);

          this._createFurSpike(
            `wolf_runeRay_${side}_${index}`,
            new V(
              0.006 * side,
              Math.sin(angle) * 0.14,
              Math.cos(angle) * 0.14
            ),
            m.accent,
            runeRoot,
            {
              height: 0.12,
              width: 0.045,
              rotation: new V(0, 0, angle),
              scaling: new V(0.45, 1.0, 1.0)
            }
          );
        }
      });

      // ----------------------------------------------------------
      // CỔ
      // ----------------------------------------------------------

      const neck = this.refs.neck = this._node(
        "wolf_neck",
        new V(0, 0.35, 0.65),
        body
      );

      this._part(
        "CreateCapsule",
        "wolf_neckCore",
        {
          height: 0.78,
          radius: 0.30,
          tessellation: 16
        },
        new V(0, 0.15, 0.10),
        m.skin,
        neck,
        new V(Math.PI / 3.28, 0, 0),
        new V(1.05, 1.02, 1.08)
      );

      // Bờm cổ hai bên
      [-1, 1].forEach((side) => {
        for (let index = 0; index < 4; index += 1) {
          this._createFurSpike(
            `wolf_neckFur_${side}_${index}`,
            new V(
              side * (0.20 + index * 0.025),
              0.18 - index * 0.055,
              0.10 - index * 0.045
            ),
            m.secondary,
            neck,
            {
              height: 0.30 - index * 0.025,
              width: 0.13,
              rotation: new V(
                0.65 + index * 0.08,
                0,
                side * (0.38 + index * 0.06)
              ),
              scaling: new V(0.75, 1.0, 1.0)
            }
          );
        }
      });

      // ----------------------------------------------------------
      // ĐẦU
      // ----------------------------------------------------------

      const head = this.refs.head = this._node(
        "wolf_head",
        new V(0, 0.31, 0.25),
        neck
      );

      this._part(
        "CreateSphere",
        "wolf_cranium",
        {
          diameter: 0.59,
          segments: 18
        },
        new V(0, 0.075, 0.08),
        m.skin,
        head,
        null,
        new V(0.98, 0.95, 1.15)
      );

      // Gò má
      [-1, 1].forEach((side) => {
        this._part(
          "CreateSphere",
          `wolf_cheek_${side}`,
          {
            diameter: 0.30,
            segments: 12
          },
          new V(0.205 * side, -0.01, 0.21),
          m.secondary,
          head,
          null,
          new V(0.82, 0.94, 1.15)
        );

        this._createFurSpike(
          `wolf_cheekFurTop_${side}`,
          new V(0.28 * side, 0.015, 0.15),
          m.secondary,
          head,
          {
            height: 0.28,
            width: 0.13,
            rotation: new V(
              Math.PI / 2.2,
              0,
              side * 0.82
            ),
            scaling: new V(0.73, 1.0, 1.0)
          }
        );

        this._createFurSpike(
          `wolf_cheekFurBottom_${side}`,
          new V(0.26 * side, -0.10, 0.18),
          m.secondary,
          head,
          {
            height: 0.24,
            width: 0.11,
            rotation: new V(
              Math.PI / 2.15,
              0,
              side * 1.00
            ),
            scaling: new V(0.68, 1.0, 1.0)
          }
        );
      });

      // Trán
      this._part(
        "CreateSphere",
        "wolf_forehead",
        {
          diameter: 0.42,
          segments: 14
        },
        new V(0, 0.18, 0.13),
        m.skin,
        head,
        null,
        new V(1.06, 0.73, 1.10)
      );

      // Mõm trên
      this._part(
        "CreateCapsule",
        "wolf_upperSnout",
        {
          height: 0.67,
          radius: 0.155,
          tessellation: 14
        },
        new V(0, -0.025, 0.42),
        m.skin,
        head,
        new V(Math.PI / 2.04, 0, 0),
        new V(0.98, 0.87, 1.0)
      );

      // Mõm dưới sáng màu
      this._part(
        "CreateCapsule",
        "wolf_muzzleLight",
        {
          height: 0.48,
          radius: 0.12,
          tessellation: 12
        },
        new V(0, -0.10, 0.40),
        m.secondary,
        head,
        new V(Math.PI / 2.03, 0, 0),
        new V(1.10, 0.78, 1.0)
      );

      // Mũi
      this._part(
        "CreateSphere",
        "wolf_nose",
        {
          diameter: 0.175,
          segments: 14
        },
        new V(0, 0.005, 0.735),
        m.claw,
        head,
        null,
        new V(1.12, 0.80, 0.92)
      );

      // Lỗ mũi
      [-1, 1].forEach((side) => {
        this._part(
          "CreateSphere",
          `wolf_nostril_${side}`,
          {
            diameter: 0.035,
            segments: 7
          },
          new V(0.052 * side, 0.018, 0.806),
          m.claw,
          head,
          null,
          new V(1.0, 0.62, 0.42)
        );
      });

      // ----------------------------------------------------------
      // HÀM DƯỚI
      // ----------------------------------------------------------

      const jaw = this.refs.jaw = this._node(
        "wolf_jaw",
        new V(0, -0.095, 0.23),
        head
      );

      this._part(
        "CreateCapsule",
        "wolf_lowerJaw",
        {
          height: 0.55,
          radius: 0.125,
          tessellation: 13
        },
        new V(0, -0.015, 0.235),
        m.secondary,
        jaw,
        new V(Math.PI / 2.08, 0, 0),
        new V(0.92, 0.74, 1.0)
      );

      // Nanh trên
      [-1, 1].forEach((side) => {
        this._createFurSpike(
          `wolf_upperFang_${side}`,
          new V(0.088 * side, -0.075, 0.525),
          m.bone,
          head,
          {
            height: 0.235,
            width: 0.078,
            rotation: new V(Math.PI, 0, side * 0.06),
            scaling: new V(0.74, 1.0, 0.74)
          }
        );

        this._createFurSpike(
          `wolf_lowerFang_${side}`,
          new V(0.075 * side, 0.035, 0.34),
          m.bone,
          jaw,
          {
            height: 0.19,
            width: 0.064,
            rotation: new V(0, 0, side * 0.05),
            scaling: new V(0.72, 1.0, 0.72)
          }
        );
      });

      // Răng phụ
      [-0.13, -0.045, 0.045, 0.13].forEach((x, index) => {
        this._createFurSpike(
          `wolf_upperTooth_${index}`,
          new V(x, -0.067, 0.44),
          m.bone,
          head,
          {
            height: 0.115,
            width: 0.042,
            rotation: new V(Math.PI, 0, 0),
            scaling: new V(0.70, 1.0, 0.70)
          }
        );
      });

      // ----------------------------------------------------------
      // MẮT VÀ LÔNG MÀY
      // ----------------------------------------------------------

      [-1, 1].forEach((side) => {
        const eyeRoot = this.refs[
          side < 0 ? "eye_L" : "eye_R"
        ] = this._node(
          `wolf_eyeRoot_${side}`,
          new V(0.188 * side, 0.145, 0.305),
          head
        );

        this._part(
          "CreateSphere",
          `wolf_eyeOrb_${side}`,
          {
            diameter: 0.145,
            segments: 14
          },
          new V(0, 0, 0),
          m.eye,
          eyeRoot,
          null,
          new V(1.28, 0.76, 0.82)
        );

        this._part(
          "CreateSphere",
          `wolf_eyePupil_${side}`,
          {
            diameter: 0.066,
            segments: 10
          },
          new V(0, 0.003, 0.058),
          m.claw,
          eyeRoot,
          null,
          new V(0.48, 1.22, 0.42)
        );

        const brow = this.refs[
          side < 0 ? "brow_L" : "brow_R"
        ] = this._node(
          `wolf_browRoot_${side}`,
          new V(0.175 * side, 0.245, 0.255),
          head
        );

        this._createFurSpike(
          `wolf_brow_${side}`,
          new V(0, 0, 0),
          m.skin,
          brow,
          {
            height: 0.25,
            width: 0.105,
            rotation: new V(
              Math.PI / 2,
              0,
              side * 1.08
            ),
            scaling: new V(0.72, 1.0, 1.0)
          }
        );
      });

      // ----------------------------------------------------------
      // TAI HAI LỚP
      // ----------------------------------------------------------

      [-1, 1].forEach((side) => {
        const sideName = side < 0 ? "L" : "R";

        const ear = this.refs[`ear_${sideName}`] = this._node(
          `wolf_ear_${sideName}`,
          new V(0.205 * side, 0.315, -0.015),
          head
        );

        this._createFurSpike(
          `wolf_outerEar_${sideName}`,
          new V(0, 0.19, 0),
          m.skin,
          ear,
          {
            height: 0.48,
            width: 0.255,
            rotation: new V(-0.34, 0, side * 0.19),
            scaling: new V(0.48, 1.0, 1.0)
          }
        );

        const innerEar = this.refs[
          `innerEar_${sideName}`
        ] = this._createFurSpike(
          `wolf_innerEar_${sideName}`,
          new V(0, 0.175, 0.029),
          m.accent,
          ear,
          {
            height: 0.32,
            width: 0.135,
            rotation: new V(-0.34, 0, side * 0.19),
            scaling: new V(0.40, 1.0, 0.82)
          }
        );

        if (innerEar) {
          innerEar.isPickable = false;
        }
      });

      // ----------------------------------------------------------
      // CHÂN
      // ----------------------------------------------------------

      this._createLeg(-1, true, body, m);
      this._createLeg(1, true, body, m);
      this._createLeg(-1, false, body, m);
      this._createLeg(1, false, body, m);

      // ----------------------------------------------------------
      // ĐUÔI
      // ----------------------------------------------------------

      this._createTail(body, m);

      // ----------------------------------------------------------
      // ĐIỂM HIỆU ỨNG
      // ----------------------------------------------------------

      this.refs.fxMouth = this._node(
        "wolf_fxMouth",
        new V(0, -0.08, 0.76),
        head
      );

      this.refs.fxChest = this._node(
        "wolf_fxChest",
        new V(0, 0.16, 0.57),
        body
      );

      this.refs.fxBack = this._node(
        "wolf_fxBack",
        new V(0, 0.53, 0.05),
        body
      );

      this._resetPose();
    }

    // ============================================================
    // 5. RESET POSE
    // ============================================================

    _resetPose() {
      const r = this.refs;
      if (!r || !r.body) return;

      r.body.position.x = 0;
      r.body.position.y = 0.05;
      r.body.position.z = 0;

      this._nodeRotation(r.body);
      this._nodeRotation(r.neck);
      this._nodeRotation(r.head);
      this._nodeRotation(r.jaw);

      this._nodeRotation(r.ear_L);
      this._nodeRotation(r.ear_R);
      this._nodeRotation(r.brow_L);
      this._nodeRotation(r.brow_R);

      this._nodeRotation(r.frontL_hip);
      this._nodeRotation(r.frontR_hip);
      this._nodeRotation(r.backL_hip);
      this._nodeRotation(r.backR_hip);

      this._nodeRotation(r.frontL_knee);
      this._nodeRotation(r.frontR_knee);
      this._nodeRotation(r.backL_knee);
      this._nodeRotation(r.backR_knee);

      this._nodeRotation(r.frontL_foot);
      this._nodeRotation(r.frontR_foot);
      this._nodeRotation(r.backL_foot);
      this._nodeRotation(r.backR_foot);

      for (let index = 0; index < 6; index += 1) {
        this._nodeRotation(r[`tail${index}`]);
      }

      if (r.rune_L) {
        r.rune_L.scaling.set(1, 1, 1);
      }

      if (r.rune_R) {
        r.rune_R.scaling.set(1, 1, 1);
      }
    }

    // ============================================================
    // 6. SECONDARY MOTION
    // ============================================================

    _animateTail(time, options = {}) {
      const r = this.refs;

      const speed = options.speed || 1.8;
      const amplitude = options.amplitude || 0.2;
      const lift = options.lift || -0.15;
      const lag = options.lag || 0.42;
      const verticalAmplitude = options.verticalAmplitude || 0.04;

      for (let index = 0; index < 6; index += 1) {
        const tail = r[`tail${index}`];
        if (!tail) continue;

        const attenuation = 1 + index * 0.18;
        const phase = time * speed - index * lag;

        tail.rotation.y =
          Math.sin(phase) * amplitude * attenuation;

        tail.rotation.x =
          lift +
          Math.sin(phase * 0.72 + index * 0.25) *
            verticalAmplitude *
            attenuation;

        tail.rotation.z =
          Math.cos(phase * 0.55) *
          amplitude *
          0.14 *
          attenuation;
      }
    }

    _animateRunTail(time, phase) {
      const r = this.refs;

      for (let index = 0; index < 6; index += 1) {
        const tail = r[`tail${index}`];
        if (!tail) continue;

        const lag = index * 0.31;
        const amplitude = 0.16 + index * 0.055;

        tail.rotation.x =
          0.40 -
          index * 0.035 +
          Math.sin(phase - lag) * 0.055;

        tail.rotation.y =
          Math.sin(time * 5.4 - lag) * amplitude;

        tail.rotation.z =
          Math.cos(time * 4.2 - lag) *
          amplitude *
          0.16;
      }
    }

    _animateRunePulse(time, strength = 1) {
      const r = this.refs;
      const pulse = 1 + Math.sin(time * 4.8) * 0.07 * strength;

      if (r.rune_L) {
        r.rune_L.scaling.set(pulse, pulse, pulse);
        r.rune_L.rotation.x = Math.sin(time * 1.7) * 0.06;
      }

      if (r.rune_R) {
        r.rune_R.scaling.set(pulse, pulse, pulse);
        r.rune_R.rotation.x = -Math.sin(time * 1.7) * 0.06;
      }
    }

    _animateBlink(time) {
      const r = this.refs;

      this._blinkTimer += Math.max(0, time || 0);

      const blinking = this._blinkTimer >= this._nextBlinkTime;
      const blinkDuration = 0.13;

      if (blinking) {
        const blinkTime = this._blinkTimer - this._nextBlinkTime;
        const blinkPhase = Math.min(1, blinkTime / blinkDuration);
        const eyeScaleY = Math.max(
          0.1,
          Math.abs(Math.cos(blinkPhase * Math.PI))
        );

        if (r.eye_L) r.eye_L.scaling.y = eyeScaleY;
        if (r.eye_R) r.eye_R.scaling.y = eyeScaleY;

        if (blinkPhase >= 1) {
          if (r.eye_L) r.eye_L.scaling.y = 1;
          if (r.eye_R) r.eye_R.scaling.y = 1;

          this._blinkTimer = 0;

          const seed =
            (this.id || 1) +
            Math.floor(this.elapsed * 10) +
            this._nextBlinkTime;

          this._nextBlinkTime =
            2.2 + this._stableNoise(seed) * 3.2;
        }
      } else {
        if (r.eye_L) r.eye_L.scaling.y = 1;
        if (r.eye_R) r.eye_R.scaling.y = 1;
      }
    }

    // ============================================================
    // 7. IDLE
    // ============================================================

    _poseIdle(breath) {
      const r = this.refs;
      const time = this.elapsed;

      const breathing = this._safeNumber(breath, Math.sin(time * 2.1));
      const alertWave = Math.sin(time * 0.72);
      const headNoise = Math.sin(time * 0.31 + this.id * 0.7);

      r.body.position.y = 0.05 + breathing * 0.035;
      r.body.position.z = 0;

      r.body.rotation.x = breathing * 0.018;
      r.body.rotation.y = 0;
      r.body.rotation.z = Math.sin(time * 0.42) * 0.012;

      r.neck.rotation.x =
        -0.025 +
        breathing * 0.055 +
        alertWave * 0.018;

      r.neck.rotation.y =
        Math.sin(time * 0.36) * 0.055;

      r.head.rotation.x =
        -breathing * 0.038 +
        Math.sin(time * 0.58) * 0.018;

      r.head.rotation.y =
        alertWave * 0.12 +
        headNoise * 0.035;

      r.head.rotation.z =
        Math.sin(time * 0.47) * 0.025;

      r.jaw.rotation.x =
        0.035 +
        Math.max(0, breathing) * 0.075;

      // Tai lắng nghe
      r.ear_L.rotation.x = Math.sin(time * 1.15) * 0.035;
      r.ear_L.rotation.y = Math.sin(time * 1.74) * 0.16;
      r.ear_L.rotation.z = -0.035;

      r.ear_R.rotation.x = Math.cos(time * 1.09) * 0.035;
      r.ear_R.rotation.y = Math.cos(time * 1.58) * 0.16;
      r.ear_R.rotation.z = 0.035;

      // Chân giữ trọng tâm tự nhiên
      r.frontL_hip.rotation.x = 0.025;
      r.frontR_hip.rotation.x = -0.018;
      r.backL_hip.rotation.x = -0.035;
      r.backR_hip.rotation.x = 0.025;

      r.frontL_knee.rotation.x = 0.02;
      r.frontR_knee.rotation.x = 0.015;
      r.backL_knee.rotation.x = 0.055;
      r.backR_knee.rotation.x = 0.045;

      r.frontL_foot.rotation.x = 0;
      r.frontR_foot.rotation.x = 0;
      r.backL_foot.rotation.x = -0.02;
      r.backR_foot.rotation.x = -0.02;

      this._animateTail(time, {
        speed: 1.55,
        amplitude: 0.15,
        lift: -0.17 + breathing * 0.025,
        lag: 0.43,
        verticalAmplitude: 0.035
      });

      this._animateRunePulse(time, 0.75);
    }

    // ============================================================
    // 8. RUN
    // ============================================================

    _poseRun(stride) {
      const r = this.refs;
      const time = this.elapsed;

      const runCycle = this._animationConfig("runCycle", 9.6);
      const phase = time * runCycle;

      const gait = Number.isFinite(stride)
        ? stride
        : Math.sin(phase);

      const frontLeft = Math.sin(phase);
      const frontRight = Math.sin(phase + Math.PI);

      const backLeft = Math.sin(phase + Math.PI * 0.72);
      const backRight = Math.sin(phase + Math.PI * 1.72);

      // Keep the wolf's body close to its grounded height. The old large
      // airborne bounce made all four paws visibly leave the terrain each cycle.
      const extension = Math.cos(phase * 2);
      const bounce = Math.max(0, extension) * 0.025;
      const impact = Math.max(0, -extension) * 0.008;

      r.body.position.y = 0.09 + bounce - impact;
      r.body.position.z = 0;

      // Co duỗi trục cột sống
      r.body.rotation.x =
        -0.035 +
        Math.sin(phase * 2) * 0.085;

      r.body.rotation.y = 0;

      r.body.rotation.z =
        Math.sin(phase) * 0.035;

      r.neck.rotation.x =
        -0.14 -
        Math.sin(phase * 2 + 0.35) * 0.085;

      r.neck.rotation.y =
        Math.sin(phase) * 0.025;

      r.head.rotation.x =
        0.10 +
        Math.sin(phase * 2 + 0.82) * 0.065;

      r.head.rotation.y = 0;
      r.head.rotation.z = -Math.sin(phase) * 0.025;

      r.jaw.rotation.x =
        0.16 +
        Math.abs(Math.sin(phase)) * 0.085;

      // Tai ép ra sau khi chạy nhanh
      r.ear_L.rotation.x = 0.38;
      r.ear_L.rotation.y = -0.18;
      r.ear_L.rotation.z = 0.08;

      r.ear_R.rotation.x = 0.38;
      r.ear_R.rotation.y = 0.18;
      r.ear_R.rotation.z = -0.08;

      // Chân trước
      r.frontL_hip.rotation.x = frontLeft * 0.62;
      r.frontR_hip.rotation.x = frontRight * 0.62;

      r.frontL_knee.rotation.x =
        Math.max(0, -frontLeft) * 0.52 -
        Math.max(0, frontLeft) * 0.12;

      r.frontR_knee.rotation.x =
        Math.max(0, -frontRight) * 0.52 -
        Math.max(0, frontRight) * 0.12;

      // Chân sau
      r.backL_hip.rotation.x =
        backLeft * 0.72 - 0.05;

      r.backR_hip.rotation.x =
        backRight * 0.72 - 0.05;

      r.backL_knee.rotation.x =
        Math.max(0, backLeft) * 0.56 +
        Math.max(0, -backLeft) * 0.16;

      r.backR_knee.rotation.x =
        Math.max(0, backRight) * 0.56 +
        Math.max(0, -backRight) * 0.16;

      // Bàn chân bù góc tiếp đất
      r.frontL_foot.rotation.x =
        -frontLeft * 0.16;

      r.frontR_foot.rotation.x =
        -frontRight * 0.16;

      r.backL_foot.rotation.x =
        -backLeft * 0.19;

      r.backR_foot.rotation.x =
        -backRight * 0.19;

      // Gait đầu vào vẫn ảnh hưởng nhẹ để tương thích Base
      r.body.rotation.z += gait * 0.012;

      this._animateRunTail(time, phase);
      this._animateRunePulse(time, 1.15);
    }

    // ============================================================
    // 9. ATTACK
    // ============================================================

    _poseAttack(progress) {
      const r = this.refs;
      const p = Math.max(0, Math.min(1, progress || 0));

      const crouch = this._smoothStep(Math.min(1, p / 0.22));
      const launch = this._pulse(p, 0.46, 0.28);
      const bite = this._pulse(p, 0.63, 0.19);
      const recovery = this._smoothStep(
        Math.max(0, (p - 0.70) / 0.30)
      );

      // Hạ thấp trước khi bật, sau đó lao về trước
      r.body.position.z =
        launch * 0.68 -
        recovery * 0.05;

      r.body.position.y =
        0.05 -
        crouch * 0.10 +
        launch * 0.37 -
        recovery * 0.08;

      r.body.rotation.x =
        crouch * 0.13 -
        launch * 0.42 +
        recovery * 0.24;

      r.body.rotation.z =
        Math.sin(p * Math.PI) * 0.035;

      // Cổ kéo về rồi phóng ra
      r.neck.rotation.x =
        crouch * 0.20 +
        launch * 0.34 -
        bite * 0.48;

      r.head.rotation.x =
        -crouch * 0.12 -
        launch * 0.16 +
        bite * 0.28;

      r.head.rotation.y =
        Math.sin(p * Math.PI * 2) * 0.055;

      // Hàm mở nhanh, đóng ở cuối cú cắn
      const jawOpen =
        Math.min(1, bite * 1.65) *
        (1 - this._smoothStep(Math.max(0, (p - 0.72) / 0.18)));

      r.jaw.rotation.x =
        jawOpen * 0.92 +
        launch * 0.12;

      // Hai chân trước chụp mồi không hoàn toàn đồng bộ
      r.frontL_hip.rotation.x =
        -launch * 1.16 +
        bite * 0.18;

      r.frontR_hip.rotation.x =
        -launch * 0.98 +
        bite * 0.10;

      r.frontL_knee.rotation.x =
        launch * 0.54 +
        bite * 0.22;

      r.frontR_knee.rotation.x =
        launch * 0.48 +
        bite * 0.27;

      r.frontL_foot.rotation.x =
        -launch * 0.32;

      r.frontR_foot.rotation.x =
        -launch * 0.28;

      // Chân sau nén rồi duỗi đẩy
      r.backL_hip.rotation.x =
        -crouch * 0.40 +
        launch * 0.83;

      r.backR_hip.rotation.x =
        -crouch * 0.35 +
        launch * 0.78;

      r.backL_knee.rotation.x =
        crouch * 0.74 -
        launch * 0.25;

      r.backR_knee.rotation.x =
        crouch * 0.68 -
        launch * 0.22;

      // Tai ép xuống khi tấn công
      r.ear_L.rotation.x = launch * 0.50;
      r.ear_L.rotation.y = -launch * 0.25;
      r.ear_L.rotation.z = launch * 0.12;

      r.ear_R.rotation.x = launch * 0.50;
      r.ear_R.rotation.y = launch * 0.25;
      r.ear_R.rotation.z = -launch * 0.12;

      // Lông mày tạo vẻ hung dữ
      r.brow_L.rotation.z = -bite * 0.25;
      r.brow_R.rotation.z = bite * 0.25;

      // Đuôi dùng để giữ thăng bằng
      for (let index = 0; index < 6; index += 1) {
        const tail = r[`tail${index}`];
        if (!tail) continue;

        tail.rotation.x =
          -launch * (0.34 - index * 0.025);

        tail.rotation.y =
          Math.sin(
            this.elapsed * 7.2 - index * 0.36
          ) *
          launch *
          (0.11 + index * 0.035);

        tail.rotation.z =
          Math.cos(
            this.elapsed * 5.4 - index * 0.28
          ) *
          launch *
          0.035;
      }

      this._animateRunePulse(this.elapsed, 1.9);
    }

    // ============================================================
    // 10. HIT
    // ============================================================

    _poseHit(progress) {
      const r = this.refs;
      const p = Math.max(0, Math.min(1, progress || 0));

      const recoil = Math.sin(p * Math.PI);
      const shake = Math.sin(p * Math.PI * 7) * (1 - p);

      r.body.position.y = 0.05 + recoil * 0.08;
      r.body.position.z = -recoil * 0.41;

      r.body.rotation.x = recoil * 0.16;
      r.body.rotation.y = shake * 0.045;
      r.body.rotation.z =
        (this.id % 2 === 0 ? 1 : -1) *
        recoil *
        0.16;

      r.neck.rotation.x = recoil * 0.23;
      r.neck.rotation.y = -shake * 0.22;

      r.head.rotation.x = recoil * 0.51;
      r.head.rotation.y = shake * 0.30;
      r.head.rotation.z = -shake * 0.15;

      r.jaw.rotation.x =
        recoil * 0.54;

      r.frontL_hip.rotation.x =
        recoil * 0.30;

      r.frontR_hip.rotation.x =
        recoil * 0.36;

      r.frontL_knee.rotation.x =
        recoil * 0.19;

      r.frontR_knee.rotation.x =
        recoil * 0.22;

      r.backL_hip.rotation.x =
        -recoil * 0.15;

      r.backR_hip.rotation.x =
        -recoil * 0.12;

      r.ear_L.rotation.x = recoil * 0.35;
      r.ear_R.rotation.x = recoil * 0.35;

      for (let index = 0; index < 6; index += 1) {
        const tail = r[`tail${index}`];
        if (!tail) continue;

        tail.rotation.x =
          -recoil * (0.28 + index * 0.035);

        tail.rotation.y =
          shake * (0.18 + index * 0.04);
      }

      this._animateRunePulse(this.elapsed, 1.6);
    }

    // ============================================================
    // 11. DEATH
    // ============================================================

    _poseDeath(progress) {
      const r = this.refs;
      const p = Math.max(0, Math.min(1, progress || 0));

      const fall = this._easeOutCubic(p);
      const collapse = this._smoothStep(
        Math.min(1, p / 0.72)
      );

      const side = this.id % 2 === 0 ? 1 : -1;

      r.body.position.y =
        0.05 - fall * 0.49;

      r.body.position.z =
        -fall * 0.08;

      r.body.rotation.x =
        fall * 0.25;

      r.body.rotation.y =
        side * fall * 0.10;

      r.body.rotation.z =
        side * fall * 1.42;

      r.neck.rotation.x =
        -fall * 0.31;

      r.neck.rotation.y =
        side * fall * 0.24;

      r.head.rotation.x =
        -fall * 0.55;

      r.head.rotation.y =
        side * fall * 0.18;

      r.head.rotation.z =
        -side * fall * 0.16;

      r.jaw.rotation.x =
        fall * 0.57;

      r.ear_L.rotation.x =
        fall * 0.46;

      r.ear_R.rotation.x =
        fall * 0.46;

      // Chân co lại bất đối xứng
      r.frontL_hip.rotation.x =
        collapse * 0.71;

      r.frontR_hip.rotation.x =
        collapse * 0.42;

      r.backL_hip.rotation.x =
        -collapse * 0.54;

      r.backR_hip.rotation.x =
        -collapse * 0.33;

      r.frontL_knee.rotation.x =
        collapse * 0.68;

      r.frontR_knee.rotation.x =
        collapse * 0.52;

      r.backL_knee.rotation.x =
        collapse * 0.79;

      r.backR_knee.rotation.x =
        collapse * 0.61;

      for (let index = 0; index < 6; index += 1) {
        const tail = r[`tail${index}`];
        if (!tail) continue;

        tail.rotation.x =
          -fall * (0.46 + index * 0.04);

        tail.rotation.y =
          side *
          fall *
          (0.10 + index * 0.075);

        tail.rotation.z =
          side *
          fall *
          (0.04 + index * 0.025);
      }

      const runeScale = Math.max(0.08, 1 - fall * 0.92);

      if (r.rune_L) {
        r.rune_L.scaling.set(
          runeScale,
          runeScale,
          runeScale
        );
      }

      if (r.rune_R) {
        r.rune_R.scaling.set(
          runeScale,
          runeScale,
          runeScale
        );
      }
    }

    // ============================================================
    // 12. POSE SOLVER CHÍNH
    // ============================================================

    pose(stride, counter, breath, progress) {
      const r = this.refs;

      if (!r || !r.body) return;

      const state = this.state || "Idle";
      const p = this._safeNumber(progress, 0);

      // Reset khi chuyển trạng thái để tránh rotation của state cũ
      // ảnh hưởng state mới.
      if (this._previousState !== state) {
        this._resetPose();
        this._previousState = state;
      }

      switch (state) {
        case "Idle":
          this._poseIdle(breath);
          break;

        case "Run":
          this._poseRun(stride);
          break;

        case "Attack":
          this._poseAttack(p);
          break;

        case "Hit":
          this._poseHit(p);
          break;

        case "Death":
          this._poseDeath(p);
          break;

        default:
          this._poseIdle(breath);
          break;
      }

      if (state !== "Death") {
        const delta =
          this.scene && this.scene.getEngine
            ? this.scene.getEngine().getDeltaTime() / 1000
            : 1 / 60;

        this._animateBlink(delta);
      }
    }
  }

  // ==============================================================
  // 13. ĐĂNG KÝ VISUAL
  // ==============================================================

  if (
    window.EnemyRegistry &&
    typeof window.EnemyRegistry.registerVisual === "function"
  ) {
    window.EnemyRegistry.registerVisual("wolf", WolfVisual);
  } else {
    console.warn(
      "[WolfVisual] EnemyRegistry.registerVisual không tồn tại."
    );
  }
})();