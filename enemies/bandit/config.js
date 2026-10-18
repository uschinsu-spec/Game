(() => {
  "use strict";
  window.EnemyRegistry.registerConfig("bandit", {
    kind: "bandit",
    name: "Ma rừng",
    stats: { hpBase: 42, hpPerLevel: 18 },
    combat: { attackType: "dash_strike", attackRange: 3.25, attackCooldown: 1.6, damageBase: 3, damagePerLevel: 0.5 },
    movement: { speed: 2.7 },
    visual: { scalePerLevel: 0.055, rootYOffset: 0.85 },
    animation: { spawnDuration: 0.55, attackDuration: 0.58, hitDuration: 0.30, deathDuration: 0.86, runCycle: 7.2 },
    textureSlots: ["skin", "secondary", "armor", "bone", "claw", "eye", "accent"],
    palette: {
      skin: [0.85, 0.22, 0.28], secondary: [0.48, 0.45, 0.52], armor: [0.75, 0.50, 0.35],
      bone: [0.94, 0.86, 0.74], claw: [0.88, 0.90, 0.94], eyeBase: [0.55, 0.12, 0.12],
      eyeGlow: [1.00, 0.38, 0.12], accent: [1.00, 0.68, 0.18], accentGlow: [1.00, 0.52, 0.12]
    }
  });
})();
