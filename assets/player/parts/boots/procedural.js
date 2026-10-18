(() => {
  "use strict";
  const R = window.PlayerPartRegistry;
  const M = cm => cm / 100;

  R.register({
    id: "boots_blue_guard_01",
    slot: "boots",
    type: "procedural",
    label: "Cloud-Walker Immortal Greaves & Boots",
    build({ rig, materials: m, part, B }) {
      const V = B.Vector3;

      for (const side of [-1, 1]) {
        const s = side < 0 ? "L" : "R";
        const fNode = rig.nodes[`foot${s}`];
        const tNode = rig.nodes[`toe${s}`];
        const sNode = rig.nodes[`shin${s}`];

        // 1. Giap ong chan che bap chan duoi (Shin armor & golden guard)
        part("CreateCapsule", `greave_guard_${s}`, { height: M(26), radius: M(7.5), tessellation: 12 }, new V(0, -M(14), M(1.8)), m.armor, sNode, null, new V(1.05, 1, 0.85));
        part("CreateBox", `greave_gold_crest_${s}`, { width: M(3.5), height: M(24), depth: M(2.5) }, new V(0, -M(14), M(8.2)), m.gold, sNode);
        part("CreateSphere", `greave_jade_${s}`, { diameter: M(2.8), segments: 8 }, new V(0, -M(8), M(9.2)), m.jade || m.magic, sNode);

        // 2. Co giay kieu chien ngoa cao co (High boot shaft with gold cuff)
        part("CreateCylinder", `boot_cuff_${s}`, { height: M(8), diameter: M(15.2), tessellation: 14 }, new V(0, M(4.5), -M(0.5)), m.boot, fNode, null, new V(1, 1, 0.85));
        part("CreateTorus", `boot_cuff_gold_${s}`, { diameter: M(15.4), thickness: M(0.8), tessellation: 14 }, new V(0, M(7.8), -M(0.5)), m.gold, fNode, null, new V(1, 1, 0.85));

        // 3. Than giay & Got giay (Main boot body & heel)
        part("CreateBox", `boot_${s}`, { width: M(11.8), height: M(11), depth: M(26) }, new V(0, -M(2.5), M(8.0)), m.boot, fNode);
        part("CreateBox", `boot_heel_${s}`, { width: M(11.2), height: M(3.5), depth: M(9.5) }, new V(0, -M(6.5), -M(1.5)), m.gold, fNode);

        // 4. Mui giay vat nhon kieu co trang & nap mui vang (Upturned pointed toe guard & gold toe cap)
        part("CreateBox", `toe_${s}`, { width: M(11.2), height: M(8.5), depth: M(14) }, new V(0, -M(1), M(7)), m.boot, tNode);
        part("CreateBox", `toe_gold_cap_${s}`, { width: M(11.4), height: M(4.2), depth: M(7.5) }, new V(0, -M(2.2), M(10.5)), m.gold, tNode, new V(-0.18, 0, 0));
      }
    }
  });
})();
