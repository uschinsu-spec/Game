(() => {
  "use strict";
  const R = window.PlayerPartRegistry;
  const M = cm => cm / 100;

  R.register({
    id: "hair_warrior_01",
    slot: "hair",
    type: "procedural",
    label: "Blockbuster Xianxia Ponytail & Jade Crown",
    build({ rig, materials: m, part, B }) {
      const n = rig.nodes, V = B.Vector3;

      // 1. Khoi toc chinh om sat dau (Sculpted hair volume contouring cranium)
      part("CreateSphere", "hair_cap_main", { diameter: 1, segments: 18 }, new V(0, M(5.5), -M(0.8)), m.hair, n.head, null, new V(M(16.2), M(11.8), M(19.8)));

      // 2. Toc mai re ngoi uon luon (Layered swept anime bangs framing the brow)
      // Mai giua (Center split bangs)
      part("CreateBox", "bang_center_l", { width: M(2.8), height: M(6.5), depth: M(1.2) }, new V(-M(1.8), M(4.2), M(9.2)), m.hair, n.head, new V(0.18, -0.15, 0.22));
      part("CreateBox", "bang_center_r", { width: M(3.4), height: M(7.5), depth: M(1.2) }, new V(M(2.4), M(3.8), M(9.3)), m.hair, n.head, new V(0.18, 0.15, -0.28));
      // Mai hai ben (Side swept fringe)
      [-1, 1].forEach(side => {
        part("CreateBox", `bang_side_${side}`, { width: M(4.2), height: M(8.5), depth: M(1.5) }, new V(M(5.5) * side, M(3.2), M(8.5)), m.hair, n.head, new V(0.15, side * 0.18, -side * 0.35));
        // Lon toc mai dai buong truoc vai (Long cheek locks framing face)
        part("CreateCapsule", `hair_lock_${side}`, { height: M(24), radius: M(1.2), tessellation: 8 }, new V(M(7.8) * side, -M(4.5), M(5.2)), m.hair, n.head, new V(0.2, 0, -side * 0.15));
      });

      // 3. Tram quan vang ngoc giu duoi toc (Golden lotus hair crown & jade pin)
      part("CreateCylinder", "hair_crown_base", { height: M(4.5), diameter: M(5.8), tessellation: 14 }, new V(0, M(10.5), -M(6.5)), m.gold, n.head, new V(-0.35, 0, 0));
      part("CreateSphere", "hair_crown_gem", { diameter: M(2.2), segments: 8 }, new V(0, M(11.5), -M(5.5)), m.jade, n.head);
      // Cay tram vang xuyen ngang (Golden hair pin)
      part("CreateCylinder", "hair_pin_rod", { height: M(14), diameter: M(0.6), tessellation: 6 }, new V(0, M(10.8), -M(6.5)), m.gold, n.head, new V(0, 0, Math.PI / 2));
      part("CreateSphere", "hair_pin_end", { diameter: M(1.4), segments: 6 }, new V(M(7.2), M(10.8), -M(6.5)), m.ruby, n.head);

      // 4. Duoi ngua cao uon luon 3 tang (High dynamic tiered ponytail)
      part("CreateCapsule", "ponytail_tier1", { height: M(20), radius: M(3.5), tessellation: 10 }, new V(0, M(5.5), -M(11.0)), m.hair, n.head, new V(-0.55, 0, 0));
      part("CreateCapsule", "ponytail_tier2", { height: M(24), radius: M(2.6), tessellation: 8 }, new V(0, -M(5.5), -M(14.0)), m.hair, n.head, new V(-0.35, 0, 0));
      part("CreateCapsule", "ponytail_tier3", { height: M(22), radius: M(1.6), tessellation: 8 }, new V(0, -M(18.5), -M(16.5)), m.hair, n.head, new V(-0.15, 0, 0));

      // 5. Hai dai lua tien buong tha sau dau (Twin flowing white silk ribbon streamers)
      [-1, 1].forEach(side => {
        part("CreateBox", `ribbon_${side}`, { width: M(2.0), height: M(28), depth: M(0.4) }, new V(M(2.2) * side, -M(2), -M(11.5)), m.cloth, n.head, new V(-0.4, side * 0.1, side * 0.2));
        part("CreateBox", `ribbon_tip_${side}`, { width: M(2.2), height: M(2.5), depth: M(0.6) }, new V(M(2.2) * side, -M(14.5), -M(15.5)), m.gold, n.head, new V(-0.4, side * 0.1, side * 0.2));
      });
    }
  });

  R.register({
    id: "hair_short_01",
    slot: "hair",
    type: "procedural",
    label: "Short Cultivator Hair 175cm",
    build({ rig, materials: m, part, B }) {
      part("CreateSphere", "hairShort", { diameter: 1, segments: 14 }, new B.Vector3(0, M(5.8), -M(0.5)), m.hair, rig.nodes.head, null, new B.Vector3(M(16.4), M(11.2), M(20.1)));
    }
  });
})();
