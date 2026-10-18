(() => {
  "use strict";
  const R = window.PlayerPartRegistry;
  const M = cm => cm / 100;

  R.register({
    id: "head_adventurer_01",
    slot: "head",
    type: "procedural",
    label: "Blockbuster Anime Cultivator Head 175cm",
    build({ rig, materials: m, part, B }) {
      const n = rig.nodes, V = B.Vector3;

      // 1. Co ao dung phong cach Tien Hiep (High mandarin collar with gold piping)
      part("CreateCylinder", "collar_inner", { height: M(6.5), diameter: M(11.8), tessellation: 18 }, new V(0, -M(3.2), 0), m.cloth, n.neck);
      part("CreateCylinder", "collar_outer", { height: M(6.8), diameter: M(12.5), tessellation: 18 }, new V(0, -M(3.2), 0), m.clothDark, n.neck);
      part("CreateTorus", "collar_gold_rim", { diameter: M(12.6), thickness: M(0.7), tessellation: 18 }, new V(0, -M(0.2), 0), m.gold, n.neck);

      // 2. Co & Khung mat thanh tu (Neck & sculpted anime face)
      part("CreateCapsule", "neck", { height: M(10), radius: M(4.8), tessellation: 12 }, new V(0, -M(5), 0), m.skin, n.neck);
      // Hop so (Cranium)
      part("CreateSphere", "cranium", { diameter: 1, segments: 18 }, new V(0, M(1.2), -M(0.5)), m.skin, n.head, null, new V(M(14.8), M(21.5), M(18.5)));
      // Khuon mat & go ma (Face & cheekbones)
      part("CreateSphere", "face_contour", { diameter: 1, segments: 14 }, new V(0, -M(1.8), M(4.2)), m.skin, n.head, null, new V(M(13.2), M(16), M(12.5)));
      // Cam V-line thanh nha (Refined anime V-line chin)
      part("CreateCylinder", "chin_cone", { height: M(6), diameterTop: M(8.5), diameterBottom: M(2.8), tessellation: 10 }, new V(0, -M(8.2), M(6.5)), m.skin, n.head, new V(0.18, 0, 0));

      // 3. Doi mat Anime sac sao & phat quang (Luminous anime spiritual eyes)
      [-1, 1].forEach(side => {
        // Vien mi mat den sac sao (Dark anime eyeliner)
        part("CreateBox", `eye_lash_${side}`, { width: M(3.4), height: M(0.7), depth: M(0.8) }, new V(M(3.5) * side, M(1.4), M(9.5)), m.hair, n.head, new V(0, side * 0.12, -side * 0.15));
        // Long trang (Eye sclera)
        part("CreateSphere", `eye_white_${side}`, { diameter: M(2.0), segments: 8 }, new V(M(3.5) * side, M(0.8), M(9.4)), m.cloth, n.head, null, new V(1.2, 0.9, 0.5));
        // Dong tu ngoc bích phat quang linh khi (Glowing celestial iris)
        part("CreateSphere", `eye_iris_${side}`, { diameter: M(1.4), segments: 8 }, new V(M(3.5) * side, M(0.8), M(9.65)), m.eye, n.head, null, new V(1, 1, 0.5));
        // Diem sang dong tu (White pupil catchlight shine)
        part("CreateSphere", `eye_shine_${side}`, { diameter: M(0.5), segments: 6 }, new V(M(3.3) * side, M(1.1), M(9.8)), m.cloth, n.head);
        // Chan may kiem thanh manh (Sharp sword eyebrows)
        part("CreateBox", `eyebrow_${side}`, { width: M(3.8), height: M(0.5), depth: M(0.6) }, new V(M(3.6) * side, M(2.6), M(9.5)), m.hair, n.head, new V(0, 0, side * 0.22));
      });

      // 4. Song mui & bieu cam (Nose bridge & subtle mouth)
      part("CreateCylinder", "nose_ridge", { height: M(3.8), diameterTop: M(0.5), diameterBottom: M(1.4), tessellation: 6 }, new V(0, -M(1.2), M(10.0)), m.skin, n.head, new V(0.2, 0, 0));
      part("CreateBox", "mouth", { width: M(2.2), height: M(0.4), depth: M(0.6) }, new V(0, -M(5.2), M(9.2)), m.skinShadow, n.head);

      // 5. Chu Sa Thien An giua tran (Cinnabar forehead mark - glowing ruby aura)
      part("CreateSphere", "forehead_mark_core", { diameter: M(1.2), segments: 8 }, new V(0, M(4.2), M(9.7)), m.ruby, n.head, null, new V(0.6, 1.5, 0.4));
      part("CreateSphere", "forehead_mark_glow", { diameter: M(0.6), segments: 6 }, new V(0, M(5.6), M(9.65)), m.magic, n.head);

      // 6. Tram quan kim co vang tren tran (Golden brow diadem / circlet)
      part("CreateTorus", "circlet_gold", { diameter: M(17.2), thickness: M(0.65), tessellation: 20 }, new V(0, M(3.2), M(0.2)), m.gold, n.head, new V(0.12, 0, 0));
      part("CreateSphere", "circlet_jade_gem", { diameter: M(1.6), segments: 8 }, new V(0, M(3.6), M(9.4)), m.jade, n.head);
    }
  });
})();
