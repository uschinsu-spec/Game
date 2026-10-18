(() => {
  "use strict";
  const R = window.PlayerPartRegistry;
  const M = cm => cm / 100;

  R.register({
    id: "accessory_headcrest_01",
    slot: "accessory",
    type: "procedural",
    label: "Celestial Immortal Halo & Golden Dragon Crest",
    build({ rig, materials: m, part, B }) {
      const V = B.Vector3, h = rig.nodes.headSocket;

      // 1. Tram kim phung vuon cao (Elevated golden dragon crown crest)
      const c = part("CreateCylinder", "headCrest", { height: M(18), diameterTop: 0, diameterBottom: M(8), tessellation: 6 }, new V(0, M(7), 0), m.gold, h);
      c.rotation.x = Math.PI;

      // 2. Vong linh quang hao quang phat sang sau dau (Floating celestial halo ring)
      part("CreateTorus", "celestial_halo_outer", { diameter: M(34), thickness: M(0.8), tessellation: 24 }, new V(0, M(2), -M(12)), m.magic, h, new V(0.18, 0, 0));
      part("CreateTorus", "celestial_halo_gold", { diameter: M(28), thickness: M(0.6), tessellation: 20 }, new V(0, M(2), -M(12)), m.gold, h, new V(0.18, 0, 0));

      // 3. Hat ngoc phat quang quanh vong hao quang (Orbital spirit jade gems)
      [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].forEach((angle, idx) => {
        const ox = Math.cos(angle) * M(15.5);
        const oy = Math.sin(angle) * M(15.5) + M(2);
        part("CreateSphere", `halo_gem_${idx}`, { diameter: M(2.2), segments: 8 }, new V(ox, oy, -M(12)), m.jade || m.magic, h);
      });
    }
  });
})();
