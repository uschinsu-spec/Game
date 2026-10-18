(() => {
  "use strict";
  const R = window.PlayerPartRegistry;
  const M = cm => cm / 100;

  R.register({
    id: "legs_blue_guard_01",
    slot: "legs",
    type: "procedural",
    label: "Dragon Knee-Guards & Silk Leggings",
    build({ rig, materials: m, part, B }) {
      const V = B.Vector3;

      for (const side of [-1, 1]) {
        const s = side < 0 ? "L" : "R";
        const thNode = rig.nodes[`thigh${s}`];
        const shNode = rig.nodes[`shin${s}`];

        // 1. Lop quan vai gam thuong hang (Silk leggings shell)
        part("CreateCapsule", `legArmor_${s}`, { height: M(43), radius: M(9.2), tessellation: 12 }, new V(0, -M(21.5), 0), m.clothDark, thNode);

        // 2. Giap dau goi dau rong hoang kim (Dragon-face golden knee guard)
        part("CreateSphere", `knee_guard_${s}`, { diameter: M(14), segments: 12 }, new V(0, M(0.5), M(2.8)), m.armor, shNode, null, new V(1, 0.75, 0.9));
        part("CreateBox", `knee_gold_horn_${s}`, { width: M(4), height: M(8), depth: M(2.5) }, new V(0, M(4.2), M(4.5)), m.gold, shNode, new V(0.2, 0, 0));
        part("CreateSphere", `knee_jade_${s}`, { diameter: M(2.6), segments: 8 }, new V(0, M(0.5), M(6.2)), m.jade || m.magic, shNode);
      }
    }
  });
})();
