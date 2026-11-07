# Release v1.2 — Production foundation

## Added

- Isolated Node.js API with PostgreSQL persistence for account identity and AFK wallet balances.
- Password hashing with bcrypt, signed seven-day JWT sessions, Helmet headers, CORS allow-list, JSON size cap, and rate limits.
- AFK settlement uses database time, a row lock, a 12-hour cap, and server-calculated rewards. Repeated claims cannot settle the same interval twice.
- API setup, environment configuration, and security boundaries documented in `server/README.md`.

## Run

See `server/README.md`. The browser game remains runnable independently with `npm run dev`.

## Release gates not yet satisfied

- The existing game is Phaser 3 2.5D, not PlayCanvas 3D. A full 3D migration requires a separately scoped renderer/asset conversion and must not be described as completed here.
- The account API is not yet wired into the existing HUD/SaveSystem. The current local progression remains local-only.
- Combat, drops, inventory, equipment, cultivation and dungeon rewards are not yet server-authoritative.
- No production database, domain, HTTPS deployment, secrets, backups, or real-device QA have been configured by this commit.
- Production anime character rigs, skeletal animation, voice/music licensing and final environment assets still need approved source assets.

Do not publish as a production MMORPG until the gates above are implemented and tested.
