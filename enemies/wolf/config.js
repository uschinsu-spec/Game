(() => {
  "use strict";
  window.EnemyRegistry.registerConfig("wolf", {
    kind: "wolf",
    name: "Sói hoang dã",
    stats: { hpBase: 36, hpPerLevel: 18 },
    combat: { attackRange: 2.8, attackCooldown: 1.25, damageBase: 3, damagePerLevel: 0.55 },
    movement: { speed: 3.8 },
    visual: { scalePerLevel: 0.05, rootYOffset: 0.85 },
    animation: { spawnDuration: 0.55, attackDuration: 0.75, hitDuration: 0.35, deathDuration: 1.15, runCycle: 9.6 },
    textureSlots: ["skin", "secondary", "armor", "bone", "claw", "eye", "accent"],
    palette: {
      skin: [0.75, 0.48, 0.28], secondary: [0.92, 0.86, 0.76], armor: [0.55, 0.34, 0.22],
      bone: [0.94, 0.90, 0.82], claw: [0.28, 0.28, 0.32], eyeBase: [0.45, 0.18, 0.05],
      eyeGlow: [1.00, 0.55, 0.08], accent: [1.00, 0.65, 0.12], accentGlow: [1.00, 0.50, 0.08]
    }
  });
})();
