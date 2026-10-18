(() => {
  "use strict";
  const R = window.PlayerPartRegistry;
  const M = cm => cm / 100;

  R.register({
    id: "offhand_shield_01",
    slot: "offhand",
    type: "procedural",
    label: "Bagua Celestial Spirit Shield 65cm",
    build({ rig, materials: m, part, B }) {
      const V = B.Vector3, s = rig.nodes.offhandSocket;

      // 1. Mat thuẫn Bat Quai hinh bat giac (Octagonal Bagua shield body)
      part("CreateCylinder", "shield", { height: M(4.5), diameter: M(64), tessellation: 8 }, new V(0, M(4), M(7)), m.armor, s, new V(Math.PI / 2, 0, 0), new V(0.85, 1, 0.98));
      // Vien hoang kim bao quanh mat thuan (Gold dragon rim)
      part("CreateTorus", "shield_rim_gold", { diameter: M(64.2), thickness: M(1.8), tessellation: 8 }, new V(0, M(4), M(7.5)), m.gold, s, new V(Math.PI / 2, 0, 0));

      // 2. Tam guong Bat Quai Am Duong ngoc bich phat quang (Central Yin-Yang Jade Core)
      part("CreateCylinder", "shield_boss_gold", { height: M(5.5), diameter: M(22), tessellation: 16 }, new V(0, M(4), M(9.2)), m.gold, s, new V(Math.PI / 2, 0, 0));
      part("CreateSphere", "shield_core_jade", { diameter: M(14), segments: 12 }, new V(0, M(4), M(11)), m.jade || m.magic, s);
      part("CreateTorus", "shield_aura_ring", { diameter: M(24), thickness: M(0.8), tessellation: 16 }, new V(0, M(4), M(9.5)), m.magic, s, new V(Math.PI / 2, 0, 0));

      s.rotation.x = 0.18;
      s.rotation.z = 0.18;
    }
  });
})();
