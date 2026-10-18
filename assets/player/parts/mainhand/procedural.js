(() => {
  "use strict";
  const R = window.PlayerPartRegistry;
  const M = cm => cm / 100;

  R.register({
    id: "weapon_sword_01",
    slot: "mainhand",
    type: "procedural",
    label: "Thanh Tieu Divine Soul Sword 115cm",
    build({ rig, materials: m, part, B }) {
      const V = B.Vector3, ws = rig.nodes.weaponSocket;

      // 1. Chuoi kiem gao moc to vang (Braided golden grip & rings)
      part("CreateCylinder", "sword_grip", { height: M(16), diameter: M(2.8), tessellation: 12 }, new V(0, 0, 0), m.clothDark, ws);
      // Cac vong kim loai hoang kim tren chuoi (Gold ring spacers on grip)
      [-M(5), 0, M(5)].forEach((y, idx) => {
        part("CreateTorus", `sword_grip_ring_${idx}`, { diameter: M(3.1), thickness: M(0.4), tessellation: 12 }, new V(0, y, 0), m.gold, ws);
      });

      // 2. Duoi chuoi kiem Hoa Sen Vang & Tua Rua Do (Golden Lotus Pommel & Divine Tassel)
      part("CreateCylinder", "sword_pommel_lotus", { height: M(2.5), diameterTop: M(5.5), diameterBottom: M(3.2), tessellation: 10 }, new V(0, -M(8.8), 0), m.gold, ws);
      part("CreateSphere", "sword_pommel_jade", { diameter: M(3.0), segments: 8 }, new V(0, -M(10.2), 0), m.jade || m.magic, ws);
      // Tua rua do linh luc buong ru (Flowing crimson spiritual tassel)
      part("CreateCapsule", "sword_tassel_rope", { height: M(10), radius: M(0.6), tessellation: 6 }, new V(0, -M(15.5), 0), m.ruby || m.magic, ws);
      part("CreateCapsule", "sword_tassel_end", { height: M(12), radius: M(1.4), tessellation: 8 }, new V(0, -M(23), 0), m.ruby || m.magic, ws);

      // 3. Ho Kiem Long Thu Hoang Kim (Dragon-Head Golden Crossguard)
      part("CreateBox", "sword_guard_center", { width: M(10), height: M(4.2), depth: M(5.5) }, new V(0, M(8.8), 0), m.gold, ws);
      // Mat ngoc linh hon phat quang o trung tam kiem (Central glowing soul jade in guard)
      part("CreateSphere", "sword_guard_eye", { diameter: M(3.2), segments: 10 }, new V(0, M(8.8), M(2.5)), m.jade || m.magic, ws);
      part("CreateSphere", "sword_guard_eye_back", { diameter: M(3.2), segments: 10 }, new V(0, M(8.8), -M(2.5)), m.jade || m.magic, ws);
      // Canh kiem uon luon hai ben (Winged guard extensions)
      [-1, 1].forEach(side => {
        part("CreateBox", `sword_guard_wing_${side}`, { width: M(11), height: M(3.5), depth: M(3.2) }, new V(M(9) * side, M(10.5), 0), m.gold, ws, new V(0, 0, side * 0.28));
        part("CreateSphere", `sword_guard_tip_${side}`, { diameter: M(2.8), segments: 8 }, new V(M(14.5) * side, M(12.5), 0), m.jade || m.magic, ws);
      });

      // 4. Luoi Kiem Thanh Tieu Than Kiem (Exquisite Soul Blade with player_blade.jpg texture)
      // Song kiem chinh (Core blade with runic texture)
      part("CreateBox", "sword_blade_core", { width: M(5.8), height: M(82), depth: M(2.2) }, new V(0, M(51), 0), m.weapon || m.metal, ws);
      // Ranh kiem phat quang xanh lam ruc ro (Luminous azure rune fuller groove)
      part("CreateBox", "sword_blade_fuller", { width: M(2.2), height: M(76), depth: M(2.5) }, new V(0, M(49), 0), m.magic, ws);
      // Hai mep luoi kiem ben ngoai (Dual razor edges)
      [-1, 1].forEach(side => {
        part("CreateBox", `sword_edge_${side}`, { width: M(1.4), height: M(80), depth: M(1.2) }, new V(M(3.4) * side, M(50), 0), m.metal, ws, new V(0, 0, side * 0.12));
      });

      // 5. Mui kiem vuot nhon kieu co kiem (Tapered diamond piercer sword tip)
      const tip = part("CreateCylinder", "sword_tip", { height: M(12), diameterTop: 0, diameterBottom: M(6.2), tessellation: 4 }, new V(0, M(96), 0), m.weapon || m.metal, ws);
      tip.rotation.y = Math.PI / 4;
      // Mui kiem diem linh khi (Luminous tip point)
      part("CreateSphere", "sword_tip_glow", { diameter: M(1.4), segments: 6 }, new V(0, M(101), 0), m.magic, ws);

      // 6. Kiem khi hao quang xung quanh doc chuoi (Ethereal sword aura ring at guard)
      part("CreateTorus", "sword_aura_ring", { diameter: M(14), thickness: M(0.5), tessellation: 16 }, new V(0, M(10), 0), m.magic, ws, new V(Math.PI / 2, 0, 0));
    }
  });

  R.register({
    id: "weapon_staff_01",
    slot: "mainhand",
    type: "procedural",
    label: "Celestial Dragon Staff 175cm",
    build({ rig, materials: m, part, B }) {
      const V = B.Vector3, ws = rig.nodes.weaponSocket;
      part("CreateCylinder", "staffShaft", { height: M(165), diameter: M(3.4), tessellation: 12 }, new V(0, M(48), 0), m.leather, ws);
      part("CreateCylinder", "staffGoldRings", { height: M(14), diameter: M(4.2), tessellation: 10 }, new V(0, M(122), 0), m.gold, ws);
      part("CreateSphere", "staffCore", { diameter: M(18), segments: 14 }, new V(0, M(132), 0), m.magic, ws);
      part("CreateTorus", "staffOrbit", { diameter: M(26), thickness: M(1.2), tessellation: 16 }, new V(0, M(132), 0), m.jade || m.magic, ws);
    }
  });
})();
