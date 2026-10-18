(() => {
  "use strict";
  const R = window.PlayerPartRegistry;
  const M = cm => cm / 100;

  R.register({
    id: "body_adventurer_01",
    slot: "body",
    type: "procedural",
    label: "Celestial Cultivator Martial Physique 175cm",
    build({ rig, materials: m, part, B }) {
      const n = rig.nodes, V = B.Vector3;

      // 1. Khung xuong chau & hông (Pelvis & lower torso foundation)
      part("CreateCapsule", "body_pelvis", { height: M(22), radius: M(15), tessellation: 14 }, new V(0, 0, 0), m.clothDark, n.pelvis, null, new V(1, 1, 0.67));

      // 2. Bung & Nguc noi gia (Dark under-armor foundation to avoid z-fighting)
      part("CreateCapsule", "body_abdomen", { height: M(28), radius: M(14.5), tessellation: 14 }, new V(0, M(5), 0), m.clothDark, n.spineLower, null, new V(1, 1, 0.62));
      part("CreateCapsule", "body_chestBase", { height: M(34), radius: M(18), tessellation: 14 }, new V(0, M(7), 0), m.clothDark, n.spineUpper, null, new V(1, 1, 0.50));

      // 3. Tay & Chan (Arms & Legs with Xianxia martial layering)
      for (const side of [-1, 1]) {
        const s = side < 0 ? "L" : "R";

        // Bap tay tren (Upper arm - inner silk sleeve)
        part("CreateCapsule", `body_upperArm_${s}`, { height: M(30), radius: M(6.2), tessellation: 10 }, new V(0, -M(15), 0), m.cloth, n[`upperArm${s}`]);
        // Vong kim loai boc bap tay (Gold arm band on bicep)
        part("CreateTorus", `body_arm_ring_${s}`, { diameter: M(12.8), thickness: M(0.8), tessellation: 12 }, new V(0, -M(8), 0), m.gold, n[`upperArm${s}`]);

        // Cang tay duoi (Forearm - wrapped martial sleeve)
        part("CreateCapsule", `body_forearm_${s}`, { height: M(25), radius: M(5.2), tessellation: 10 }, new V(0, -M(12.5), 0), m.clothDark, n[`forearm${s}`]);

        // Bap dui quan vo gia (Thigh - martial cultivator pants)
        part("CreateCapsule", `body_thigh_${s}`, { height: M(43), radius: M(8.8), tessellation: 12 }, new V(0, -M(21.5), 0), m.clothDark, n[`thigh${s}`]);
        // Dai quan trang tri quanh dui (Gold thigh ribbon band)
        part("CreateTorus", `body_thigh_ring_${s}`, { diameter: M(18), thickness: M(0.7), tessellation: 12 }, new V(0, -M(14), 0), m.gold, n[`thigh${s}`]);

        // Bap chan bo chat giay (Lower leg / shin - wrapped gaiters)
        part("CreateCapsule", `body_shin_${s}`, { height: M(41), radius: M(6.8), tessellation: 12 }, new V(0, -M(20.5), 0), m.leather, n[`shin${s}`]);
      }
    }
  });
})();
