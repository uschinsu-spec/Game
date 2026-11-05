# Cinematic Visual Upgrade v0.4

## Art direction

The visual target is a coherent, premium xianxia presentation rather than a collection of unrelated glow effects. The prototype remains 2.5D and mobile-first.

## Delivered

- Layered mountain silhouettes establish atmospheric perspective behind the existing sea plane.
- A floating immortal island and hall create a recognizable focal point near the horizon.
- Three drifting cloud forms and eighteen lightweight spirit motes add ambient motion.
- Warm atmospheric light bridges the skyline and reflective water.
- New hand-authored SVG hero portrait and four skill emblems replace the generic avatar glyph and emoji-only skill art.
- HUD framing, material gradients, skill states and modal surfaces have a more consistent gold / jade / midnight palette.
- The environment is updated each frame and its static layers are disposed and rebuilt on resize.

## Performance choices

- Vector Graphics and SVG keep assets crisp across phone densities.
- Ambient particle count is capped at eighteen.
- Clouds use simple containers and tween-free position updates.
- No post-processing pipeline or expensive full-screen shader was introduced.
- Existing gameplay systems and perspective projection remain unchanged.

## QA checklist

- [ ] `npm ci && npm run build`
- [ ] Confirm all five new SVG files load without 404s.
- [ ] Verify the sanctuary and cloud drift at 320×640, 360×800, 390×844 and 430×932.
- [ ] Resize while running; confirm scenery rebuilds without duplicated layers.
- [ ] Confirm monster projection, auto attacks, skills, ultimate, loot and HUD remain functional.
- [ ] Check a mid-range mobile device for stable frame pacing.
- [ ] Check landscape resize and return to portrait.

A successful CI build is necessary but does not replace manual browser/device QA. This upgrade improves the prototype's art direction; it does not claim AAA production asset fidelity or full 3D rendering.
