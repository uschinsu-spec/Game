(() => {
  "use strict";
  const R = window.PlayerPartRegistry;
  const M = cm => cm / 100;

  R.register({
    id: "back_cape_blue_01",
    slot: "back",
    type: "procedural",
    label: "Blockbuster Celestial Dragon Scabbard & Split Silk Mantle",
    build({ rig, materials: m, part, B }) {
      const V = B.Vector3, b = rig.nodes.backSocket;

      // 1. Kiem Bao Than Khi deo cheo sau lung (Exquisite Diagonal Dragon Scabbard)
      // Than vo kiem (Scabbard body in obsidian)
      part("CreateBox", "scabbard_body", { width: M(6.2), height: M(92), depth: M(3.6) }, new V(M(2.5), -M(6), -M(5.8)), m.armor, b, new V(0, 0, 0.48));
      // Mieng vo kiem boc vang hoang gia (Gold throat fitting with dragon crest)
      part("CreateBox", "scabbard_throat", { width: M(7.5), height: M(7.5), depth: M(4.8) }, new V(-M(16.5), M(29), -M(5.8)), m.gold, b, new V(0, 0, 0.48));
      // Chao vo kiem duoi dinh vang (Gold chape tip)
      part("CreateBox", "scabbard_chape", { width: M(7.2), height: M(9.5), depth: M(4.5) }, new V(M(20.5), -M(40), -M(5.8)), m.gold, b, new V(0, 0, 0.48));
      // Ngoc thach phong an tren vo kiem (Glowing soul jade emblem)
      part("CreateSphere", "scabbard_jade_seal", { diameter: M(3.4), segments: 10 }, new V(M(2.5), -M(6), -M(8.2)), m.jade, b);

      // 2. Ao choang phong cach Tien Hiep: Xẻ đôi 2 tà bay bổng (Split dual-wing silk mantle)
      // Mang vai tren (Shoulder drape band connecting the mantle)
      part("CreateBox", "mantle_shoulder_yoke", { width: M(38), height: M(7.5), depth: M(2.2) }, new V(0, M(5), -M(4.2)), m.clothDark, b);
      part("CreateBox", "mantle_yoke_gold", { width: M(38.5), height: M(1.2), depth: M(2.6) }, new V(0, M(8.5), -M(4.2)), m.gold, b);

      // Hai ta ao choang xe doi hai ben lung (Dual split flowing cape wings)
      [-1, 1].forEach(side => {
        // Ta ao choang thon dai uon cong (Tapered flowing cape wing)
        part("CreateBox", `cape_wing_${side}`, { width: M(16), height: M(76), depth: M(1.2) }, new V(M(14) * side, -M(32), -M(5.8)), m.clothDark, b, new V(-0.16, side * 0.08, side * 0.14));
        // Vien kim chi vang cuoi ta ao (Gold trim edge)
        part("CreateBox", `cape_wing_gold_${side}`, { width: M(16.5), height: M(3.5), depth: M(1.8) }, new V(M(14) * side, -M(69), -M(11.8)), m.gold, b, new V(-0.16, side * 0.08, -side * 0.14));

        // Dai lua trang tien gia tha bay tu vai (Flowing white silk streamer ribbon)
        part("CreateBox", `cape_ribbon_${side}`, { width: M(3.5), height: M(62), depth: M(0.6) }, new V(M(19) * side, -M(26), -M(5.2)), m.cloth, b, new V(-0.20, side * 0.12, side * 0.18));
        part("CreateSphere", `cape_ribbon_gold_tip_${side}`, { diameter: M(2.0), segments: 8 }, new V(M(24.5) * side, -M(56), -M(11.5)), m.gold, b);
      });
    }
  });

  R.register({
    id: "back_banner_01",
    slot: "back",
    type: "procedural",
    label: "Guild War Flying Banner 175cm",
    build({ rig, materials: m, part, B }) {
      const V = B.Vector3, b = rig.nodes.backSocket;
      part("CreateBox", "bannerPole", { width: M(3.2), height: M(142), depth: M(3.2) }, new V(M(18), -M(12), -M(4.5)), m.gold, b);
      part("CreateBox", "bannerCloth", { width: M(38), height: M(68), depth: M(1.5) }, new V(0, -M(6), -M(6.5)), m.cloth, b);
    }
  });
})();
