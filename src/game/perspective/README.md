# Perspective rendering

The game simulation stores normalized world coordinates independently from screen coordinates:

- `worldX`: horizontal lane in the range -1..1.
- `worldZ`: normalized depth; 0 is the horizon and 1 is closest to the camera.
- `elevation`: vertical offset in world units.

`PerspectiveProjector` maps the world point to the portrait viewport. All combat and target selection must use world-space distances, never projected pixel distances.

This is a 2.5D sprite projection layer for Phaser 3, not a full 3D renderer.
