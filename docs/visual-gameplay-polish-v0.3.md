# Visual & Gameplay Polish v0.3 — QA checklist

## Implemented scope
- Original vector-illustrated SVG art: cultivator, standard demon, elite demon and demon lord.
- Horizon spawn depth starts between 0.025 and 0.075; existing WorldMotion advances enemies toward the combat band and PerspectiveProjector scales them with depth.
- Sword projectile includes cyan glow, trail, and a short impact flash before hit resolution.
- Water surface has additional depth shading, sun reflection highlight and wider foreground glints.
- HUD exposes HP/MP and radial cooldown feedback for four auto skills plus the ultimate.

## Responsive viewport matrix
Run the game in a real browser at these portrait viewports. Verify no horizontal overflow, clipped labels, overlapping controls, or inaccessible touch targets.

| Profile | CSS viewport | Checks |
|---|---:|---|
| Compact Android | 320 × 640 | header currencies, skill names, bottom dock |
| Common Android | 360 × 800 | HUD spacing, safe areas, combat field |
| iPhone portrait | 390 × 844 | notch/home indicator, modal bounds |
| Tall phone | 430 × 932 | vertical rhythm and bottom dock |
| Small tablet / narrow desktop | 520 × 900 | centered game frame and canvas scaling |

Also rotate to landscape once to confirm the portrait-first layout remains usable and does not trap the page in horizontal scrolling. The game is designed primarily for portrait.

## Functional smoke tests
1. Start a fresh session and confirm all four SVG sprite assets load without 404s.
2. Observe a wave from spawn: enemies should be tiny near the horizon and grow smoothly as they approach.
3. Enable auto combat; confirm sword projectiles travel to the selected target and damage is applied once on impact.
4. Enable each auto-skill slot, then disable it; verify active state and cooldown sweep update independently.
5. Cast the ultimate and confirm the cooldown overlay and MP meter update.
6. Observe water highlights and waves at both narrow and wide viewports.
7. Resize the browser while running; confirm player and cauldron remain centered and the combat loop continues.

## Automated validation
- CI workflow: .github/workflows/build.yml runs npm ci and npm run build for feature/** pushes and PRs into main.
- A successful TypeScript/Vite build does not replace the viewport and gameplay smoke tests above.
