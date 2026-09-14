# Quaternius Ultimate Monsters

Enemy visuals in this project use **Quaternius Ultimate Monsters**.

- Author: Quaternius
- Official pack: https://quaternius.com/packs/ultimatemonsters.html
- License: CC0 1.0
- Runtime mirror: `brornski/ashenhold-dragonfall`
- Pinned mirror commit: `7380bcd7005e99f1ad690d5dd4015f215d8673bf`
- Runtime mirror folder: `assets/models/quaternius-monsters/`

The verified runtime catalog currently includes these 12 models from the Ultimate Monsters pack: Alien, Birb, Blue Demon, Cactoro, Demon, Fish, Frog, Monkroose, Orc Skull, Orc, Tribal and Yeti.

The game keeps its lightweight procedural `Demon` meshes as invisible combat hosts/hitboxes. When a rigged monster loads successfully, the host becomes invisible and the imported animated monster is parented to it. If the network asset cannot load, the host is shown as a fallback so combat can continue.

The model files are loaded at runtime from the pinned public GitHub mirror; binary model files are not vendored into this repository.