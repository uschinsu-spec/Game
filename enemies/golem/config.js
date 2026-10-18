(() => {
  "use strict";
  window.EnemyRegistry.registerConfig("golem", {
    kind: "golem",
    name: "Thạch quái",
    stats: { hpBase: 42, hpPerLevel: 18 },
    combat: { attackType: "area_slam", attackRange: 3.5, attackCooldown: 1.6, damageBase: 3, damagePerLevel: 0.5, aoeRadius: 4.2 },
    movement: { speed: 2.7 },
    visual: { scalePerLevel: 0.055, rootYOffset: 0.85 },
    animation: { spawnDuration: 0.55, attackDuration: 0.58, hitDuration: 0.30, deathDuration: 0.86, runCycle: 5.8 },
    textureSlots: ["skin", "secondary", "armor", "bone", "claw", "eye", "accent"],
    palette: {
      skin: [0.75, 0.78, 0.84], secondary: [0.55, 0.60, 0.68], armor: [0.82, 0.84, 0.88],
      bone: [0.45, 0.92, 1.00], claw: [0.48, 0.52, 0.58], eyeBase: [0.15, 0.50, 0.70],
      eyeGlow: [0.20, 0.95, 1.00], accent: [0.30, 0.90, 1.00], accentGlow: [0.20, 0.80, 1.00]
    }
  });
})();
