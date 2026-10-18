(() => {
  "use strict";
  const R = window.PlayerPartRegistry;
  const M = cm => cm / 100;

  R.register({
    id: "hands_blue_guard_01",
    slot: "hands",
    type: "procedural",
    label: "Dragon-Scale Vambraces & Martial Gauntlets",
    build({ rig, materials: m, part, B }) {
      const V = B.Vector3;

      for (const side of [-1, 1]) {
        const s = side < 0 ? "L" : "R";
        const faNode = rig.nodes[`forearm${s}`];
        const hNode = rig.nodes[`hand${s}`];

        // 1. Ho Uyen bọc cẳng tay (Dragon-scale vambrace / bracer)
        part("CreateCapsule", `bracer_shell_${s}`, { height: M(21), radius: M(6.2), tessellation: 12 }, new V(0, -M(13.5), 0), m.armor, faNode, null, new V(1.08, 1, 0.92));
        // Song kim loai hoang kim tren mu tay (Gold forearm ridge)
        part("CreateBox", `bracer_ridge_${s}`, { width: M(2.8), height: M(20), depth: M(2.2) }, new V(M(1.2) * side, -M(13.5), M(6.0)), m.gold, faNode);
        // Ngoc ho the o co tay (Glowing wrist jade gemstone)
        part("CreateSphere", `bracer_gem_${s}`, { diameter: M(2.4), segments: 8 }, new V(M(1.2) * side, -M(21), M(5.8)), m.jade || m.magic, faNode);

        // 2. Gang tay vo gia bao ve ban tay (Martial gloves with knuckle guards)
        part("CreateCapsule", `hand_palm_${s}`, { height: M(14), radius: M(4.6), tessellation: 10 }, new V(0, -M(7.5), 0), m.leather, hNode, null, new V(1, 1, 0.58));
        // Khop ngon tay boc kim loai (Gold knuckle protector)
        part("CreateBox", `knuckle_plate_${s}`, { width: M(7.8), height: M(2.8), depth: M(2.0) }, new V(0, -M(7.2), M(3.0)), m.gold, hNode);
        // Ngon tay vo thuat (Fingers section)
        part("CreateCapsule", `fingers_${s}`, { height: M(8), radius: M(3.8), tessellation: 8 }, new V(0, -M(14), 0), m.skin, hNode, null, new V(1, 1, 0.55));
      }
    }
  });
})();
