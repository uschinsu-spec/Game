(() => {
  "use strict";

  // Canonical player scale: 1 Babylon world unit = 1 metre.
  // All anthropometry values below are centimetres and form the single source of truth
  // for procedural body parts and future modular GLB authoring.
  window.PlayerConfig = Object.freeze({
    version: "3.1.0-human-175cm",
    name: "Adventurer",
    units: { worldUnitsPerMeter: 1, centimetersPerWorldUnit: 100 },
    anthropometry: Object.freeze({
      reference: "adult_humanoid_neutral_175cm",
      heightCm: 175,
      eyeHeightCm: 164,
      chinHeightCm: 152,
      shoulderHeightCm: 143,
      shoulderJointWidthCm: 36,
      outerShoulderWidthCm: 44,
      chestWidthCm: 38,
      chestDepthCm: 20,
      waistWidthCm: 31,
      hipWidthCm: 30,
      hipJointHeightCm: 92,
      kneeHeightCm: 49,
      ankleHeightCm: 8,
      headHeightCm: 23,
      headWidthCm: 15.5,
      headDepthCm: 19.5,
      neckLengthCm: 10,
      upperArmLengthCm: 30,
      forearmLengthCm: 25,
      handLengthCm: 18,
      handWidthCm: 9,
      thighLengthCm: 43,
      lowerLegLengthCm: 41,
      footLengthCm: 27,
      footWidthCm: 10.5
    }),
    stats: { moveSpeed: 7, maxHp: 180, respawnSeconds: 3, spawnInvulnerability: 6 },
    visual: {
      rootYOffset: 0,
      scale: 1,
      height: 1.75,
      eyeHeight: 1.64,
      cameraTargetHeight: 1.30,
      shadowRadius: 0.38,
      useGlbModel: true,
      modelPath: "./assets/player/models/player_male.glb"
    },
    palette: {
      skin: "#FCE7D6", skinShadow: "#E2B89D", hair: "#12141D",
      cloth: "#F8FAFC", clothDark: "#0B132B", clothAccent: "#0284C7",
      armor: "#1E293B", armorDark: "#0F172A",
      metal: "#E2E8F0", gold: "#F59E0B", leather: "#1E293B", boot: "#0A0E17",
      eye: "#38BDF8", magic: "#00F0FF", jade: "#10B981", ruby: "#F43F5E"
    },
    textureSlots: {
      skin: null, face: null, hair: null,
      cloth: null,
      armor: null,
      metal: null,
      leather: null,
      weapon: "./assets/player/textures/player_blade.jpg"
    },
    sockets: [
      "weaponSocket","offhandSocket","backSocket","headSocket",
      "vfxHandR","vfxHandL","vfxChest","vfxFootR","vfxFootL"
    ],
    equipmentSlots: ["body","head","hair","chest","hands","legs","boots","mainhand","offhand","back","accessory"],
    defaultLoadout: {
      body:"body_adventurer_01", head:"head_adventurer_01", hair:"hair_warrior_01",
      chest:"chest_blue_guard_01", hands:"hands_blue_guard_01", legs:"legs_blue_guard_01",
      boots:"boots_blue_guard_01", mainhand:"weapon_sword_01", offhand:null,
      back:"back_cape_blue_01", accessory:null
    },
    animation: {
      idleSpeed: 1, walkSpeed: 5.2, runSpeed: 8.2,
      durations: {
        Attack1: 0.52,
        Attack2: 0.64,
        Attack3: 0.74,
        Cast: 0.78,
        CastBeam: 0.68,
        CastBurst: 0.72,
        CastMeteor: 0.88,
        Hit: 0.34,
        Death: 1.05,
        Respawn: 0.82
      },
      skillAnimationMap: ["Attack1", "Attack2", "CastBeam", "CastBurst", "CastMeteor"],
      // Normalized animation markers. Combat/VFX/SFX may subscribe to
      // PlayerAnimator.onEvent instead of hard-coding frame percentages.
      markers: {
        Attack1: { hitStart: 0.32, hit: 0.46, comboOpen: 0.60, comboClose: 0.90 },
        Attack2: { hitStart: 0.30, hit: 0.48, comboOpen: 0.60, comboClose: 0.90 },
        Attack3: { hitStart: 0.42, hit: 0.58, comboOpen: 0.68, comboClose: 0.92 },
        CastBeam: { cast: 0.46 },
        CastBurst: { cast: 0.52 },
        CastMeteor: { cast: 0.58 }
      }
    }
  });
})();
