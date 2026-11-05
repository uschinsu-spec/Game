# Gameplay Systems v0.8

## Core loop
- Enemy waves scale their HP, attack, defence and rewards against the player's current level.
- Each active enemy has an independent attack interval and only fires while the player is within its configured attack range.
- Basic attacks and skills use a scaled combat clock, so x2/x3 affects attacks and cooldowns consistently.
- Death pauses wave spawning and incoming combat until the player's existing respawn state completes.

## Cultivation and economy
- Manual cultivation costs 5 spirit stones and 5 MP for 15 cultivation EXP.
- Realm breakthrough requires the next realm's EXP threshold, character level gate and spirit-stone cost from the realm table.
- Bồi Nguyên Đan crafting consumes one Thanh Trúc Dược Thảo, 30 silver and 3 spirit stones.
- Daily welfare is claimable once per local calendar day: 100 silver, 5 spirit stones and 50 EXP.
- Every 10 lifetime kills unlock one repeatable quest claim: 120 silver, 8 spirit stones and 80 EXP.

## Inventory and equipment
- Materials stack by item identity.
- Equipment drops from enemies (higher chance from bosses), occupies weapon/armor/accessory slots and modifies derived combat stats.
- Equipment can be equipped and removed from the bag; recovery pills restore HP and MP.
- Equipment, materials, potions and equipped slots are included in the local save.

## Boss challenge
- Manual Boss summon consumes 50 spirit stones.
- A manual summon has a 60-second cooldown and is rejected if a Boss is already active.
- Automatic world Boss waves remain part of the normal progression.

## Persistence and AFK
- Browser localStorage stores stats, EXP, resources, realm, kill progress, quest claims, inventory, equipment and daily claim date.
- Saves occur on stat changes, every 15 seconds while visible, and when the page is hidden or closed.
- Offline rewards are capped at 12 hours: 5 EXP and 4 silver per minute, plus 1 spirit stone per 8 minutes.
- This is a local browser save, not an account/cloud save; clearing browser storage clears the save.

## UI and intentionally unavailable systems
- Main HUD controls, inventory, quests, cultivation, alchemy, skills, welfare, equipment and Boss summon have real actions.
- Payment, cross-server, sect/social/companion and other backend-dependent panels are labelled unavailable until a real backend exists; they do not award simulated currency or items.
