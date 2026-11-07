# Vạn Tiên Lục API

This optional Node.js API adds account registration/login and server-clock AFK wallet settlement. The browser prototype remains playable without it.

## Requirements

- Node.js 20+
- PostgreSQL 14+
- A private `JWT_SECRET` with at least 32 characters

## Run locally

1. Create a PostgreSQL database named `van_tien_luc`.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`, `JWT_SECRET`, and `CORS_ORIGINS`.
3. From the repository root run:

```bash
npm install
npm run server:dev
```

The API listens on `http://localhost:8787`. Database tables are created at startup.

## Endpoints

- `GET /health`
- `POST /api/auth/register` — `{ "username": "...", "password": "at least 10 characters" }`
- `POST /api/auth/login` — same payload
- `GET /api/player/me` — Bearer token required
- `POST /api/afk/claim` — Bearer token required; settles up to 12 hours using the server clock

The AFK endpoint serializes claims with a PostgreSQL row lock, so repeated requests cannot claim the same elapsed period twice. Reward amounts are calculated by the server; clients cannot submit their own elapsed time or reward values.

## Important scope boundary

This is a production foundation, not a fully server-authoritative MMORPG backend. Combat, inventory, equipment, cultivation, and character progression in the existing Phaser client are still local prototype systems. Do not treat localStorage or client-side state as trusted for competitive play, trading, purchases, or valuable progression. A future server-authoritative combat/progression service must own those state transitions before public economy features are enabled.

Use HTTPS and managed PostgreSQL in deployment. Keep `.env` out of source control, rotate secrets if exposed, configure exact production origins, and back up the database.
