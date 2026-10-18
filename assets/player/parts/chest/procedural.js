(() => {
  "use strict";
  const R = window.PlayerPartRegistry;
  const M = cm => cm / 100;

  R.register({
    id: "chest_blue_guard_01",
    slot: "chest",
    type: "procedural",
    label: "Blockbuster Xianxia Celestial Longcoat & Pauldrons",
    build({ rig, materials: m, part, B }) {
      const n = rig.nodes, V = B.Vector3;

      // 1. Ao bo than tren V-taper (Fitted upper martial tunic with V-taper)
      part("CreateCapsule", "tunic_upper", { height: M(34), radius: M(18.5), tessellation: 16 }, new V(0, M(7), 0), m.clothDark, n.spineUpper, null, new V(1, 1, 0.54));

      // 2. Co ao giao linh lua trang thanh tao (Inner white silk lapels crossed diagonally)
      part("CreateBox", "lapel_inner_l", { width: M(5), height: M(28), depth: M(1.4) }, new V(-M(4.5), M(9), M(9.8)), m.cloth, n.spineUpper, new V(0.08, 0, 0.28));
      part("CreateBox", "lapel_inner_r", { width: M(5), height: M(28), depth: M(1.4) }, new V(M(4.5), M(9), M(9.8)), m.cloth, n.spineUpper, new V(0.08, 0, -0.28));
      // Duong vien kim chi vang chay doc vien ao (Gold piping along collar lapels)
      part("CreateBox", "lapel_trim_l", { width: M(0.8), height: M(28), depth: M(1.8) }, new V(-M(6.8), M(9), M(10.0)), m.gold, n.spineUpper, new V(0.08, 0, 0.28));
      part("CreateBox", "lapel_trim_r", { width: M(0.8), height: M(28), depth: M(1.8) }, new V(M(6.8), M(9), M(10.0)), m.gold, n.spineUpper, new V(0.08, 0, -0.28));

      // 3. Phu phuc ho tam ngoc bích giua nguc (Celestial Heart-Mirror Brooch & Emblem)
      part("CreateCylinder", "chest_brooch_gold", { height: M(1.4), diameter: M(8.2), tessellation: 16 }, new V(0, M(9.5), M(10.4)), m.gold, n.spineUpper, new V(Math.PI / 2, 0, 0));
      part("CreateSphere", "chest_brooch_jade", { diameter: M(5.5), segments: 12 }, new V(0, M(9.5), M(11.0)), m.jade, n.spineUpper);

      // 4. Giap vai kieu canh phuong vuon nhe (Sleek aerodynamic feathered pauldron wings - NOT spheres!)
      for (const side of [-1, 1]) {
        const s = side < 0 ? "L" : "R";
        const cNode = n[`clavicle${s}`];

        // Tam giap vai tren cong vut (Upper pauldron blade plate)
        part("CreateBox", `pauldron_plate_main_${s}`, { width: M(16), height: M(3.2), depth: M(18) }, new V(M(7.5) * side, M(2.8), 0), m.armor, cNode, new V(0, 0, -side * 0.38));
        // Vien vang tren mep giap vai (Gold trim edge)
        part("CreateBox", `pauldron_gold_edge_${s}`, { width: M(16.5), height: M(1.4), depth: M(18.5) }, new V(M(7.5) * side, M(4.2), 0), m.gold, cNode, new V(0, 0, -side * 0.38));
        // Ngoc ho the dinh tren vai (Glowing shoulder jade gem)
        part("CreateSphere", `pauldron_gem_${s}`, { diameter: M(3.0), segments: 10 }, new V(M(14) * side, M(5.2), 0), m.magic, cNode);
        // Lop giap vai phu thu hai ben duoi (Secondary lower tier plate)
        part("CreateBox", `pauldron_sub_tier_${s}`, { width: M(13), height: M(2.8), depth: M(16) }, new V(M(6.5) * side, -M(1.8), 0), m.clothDark, cNode, new V(0, 0, -side * 0.32));
      }

      // 5. That lung Can Khon & Khoa ngoc (Waist sash with gold border & jade buckle)
      part("CreateCylinder", "belt_band", { height: M(7.5), diameter: M(33), tessellation: 20 }, new V(0, -M(4.5), M(0.5)), m.leather, n.spineLower, null, new V(1, 1, 0.65));
      part("CreateTorus", "belt_gold_top", { diameter: M(33.2), thickness: M(0.7), tessellation: 20 }, new V(0, -M(1.0), M(0.5)), m.gold, n.spineLower, null, new V(1, 1, 0.65));
      part("CreateTorus", "belt_gold_bot", { diameter: M(33.2), thickness: M(0.7), tessellation: 20 }, new V(0, -M(8.0), M(0.5)), m.gold, n.spineLower, null, new V(1, 1, 0.65));
      // Khoa dai ngoc boi Càn Khôn (Central jade buckle)
      part("CreateBox", "belt_clasp_frame", { width: M(8), height: M(8), depth: M(2.8) }, new V(0, -M(4.5), M(11.2)), m.gold, n.spineLower);
      part("CreateSphere", "belt_clasp_core", { diameter: M(5.2), segments: 10 }, new V(0, -M(4.5), M(12.4)), m.jade, n.spineLower);

      // 6. Dai lua ru truoc bung (Twin slender silk sash ribbons draping in front)
      [-1, 1].forEach(side => {
        part("CreateBox", `sash_front_${side}`, { width: M(4.2), height: M(36), depth: M(0.6) }, new V(M(3.5) * side, -M(22), M(10.8)), m.cloth, n.pelvis, new V(0.06, side * 0.04, side * 0.08));
        part("CreateBox", `sash_front_gold_${side}`, { width: M(4.5), height: M(2.5), depth: M(0.9) }, new V(M(3.5) * side, -M(39), M(11.8)), m.gold, n.pelvis, new V(0.06, side * 0.04, side * 0.08));
      });

      // 7. Giap hong 2 ben nhe nhang (Slender curved hip tassets)
      [-1, 1].forEach(side => {
        part("CreateBox", `hip_guard_${side}`, { width: M(6), height: M(18), depth: M(14) }, new V(M(15.5) * side, -M(12), 0), m.armor, n.pelvis, new V(0, 0, -side * 0.18));
        part("CreateBox", `hip_gold_trim_${side}`, { width: M(1.0), height: M(18.5), depth: M(14.5) }, new V(M(16.0) * side, -M(12), 0), m.gold, n.pelvis, new V(0, 0, -side * 0.18));
      });

      // 8. Hai vat ao sau xoe rong kieu Ao Choang Tiên Hiep (Flared dual split coat tails)
      [-1, 1].forEach(side => {
        // Ta ao sau om theo hong va xoe rong ve sau (Sweeping back coat tail)
        part("CreateBox", `coat_tail_${side}`, { width: M(12), height: M(48), depth: M(1.2) }, new V(M(8.5) * side, -M(28), -M(9.5)), m.clothDark, n.pelvis, new V(-0.18, side * 0.12, -side * 0.15));
        // Vien kim chi vang cuoi ta ao (Gold border on coat tail hem)
        part("CreateBox", `coat_tail_gold_${side}`, { width: M(12.5), height: M(2.8), depth: M(1.8) }, new V(M(8.5) * side, -M(51), -M(13.8)), m.gold, n.pelvis, new V(-0.18, side * 0.12, -side * 0.15));
      });
    }
  });

  R.register({
    id: "chest_robe_01",
    slot: "chest",
    type: "procedural",
    label: "Mystic Taoist Robe Human Fit",
    build({ rig, materials: m, part, B }) {
      const n = rig.nodes, V = B.Vector3;
      part("CreateCapsule", "robeTorso", { height: M(37), radius: M(20), tessellation: 14 }, new V(0, M(6), 0), m.cloth, n.spineUpper, null, new V(1, 1, 0.58));
      part("CreateBox", "robeSash", { width: M(34), height: M(8), depth: M(22) }, new V(0, -M(5), M(1)), m.gold, n.spineLower);
      part("CreateBox", "robeLongFront", { width: M(30), height: M(54), depth: M(2) }, new V(0, -M(33), M(10)), m.cloth, n.pelvis, new V(0.05, 0, 0));
    }
  });
})();
