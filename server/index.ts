import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Pool, type PoolClient } from 'pg';
import { z } from 'zod';

const PORT = Number(process.env.API_PORT || 8787);
const DATABASE_URL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET;
if (!DATABASE_URL) throw new Error('DATABASE_URL is required');
if (!JWT_SECRET || JWT_SECRET.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters');

const pool = new Pool({ connectionString: DATABASE_URL, ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false } });
const app = express();
app.disable('x-powered-by');
app.use(helmet());
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map(v => v.trim()).filter(Boolean);
app.use(cors({ origin: (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error('Origin not allowed'));
}, credentials: false }));
app.use(express.json({ limit: '32kb' }));
app.use('/api', rateLimit({ windowMs: 60_000, limit: 90, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60_000, limit: 12, standardHeaders: 'draft-7', legacyHeaders: false }));

type AuthedRequest = Request & { userId?: string };
const registerSchema = z.object({ username: z.string().trim().min(3).max(24).regex(/^[a-zA-Z0-9_-]+$/), password: z.string().min(10).max(72) });
const loginSchema = z.object({ username: z.string().trim().min(3).max(24), password: z.string().min(1).max(72) });
const MAX_OFFLINE_SECONDS = 12 * 60 * 60;

async function migrate(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS players (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(24) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      exp BIGINT NOT NULL DEFAULT 0 CHECK (exp >= 0),
      gold BIGINT NOT NULL DEFAULT 120 CHECK (gold >= 0),
      spirit BIGINT NOT NULL DEFAULT 35 CHECK (spirit >= 0),
      last_afk_claim_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

function issueToken(id: string): string {
  return jwt.sign({ sub: id }, JWT_SECRET!, { expiresIn: '7d', issuer: 'van-tien-luc-api', audience: 'van-tien-luc-client' });
}

function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const token = req.header('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) { res.status(401).json({ error: 'AUTH_REQUIRED' }); return; }
  try {
    const payload = jwt.verify(token, JWT_SECRET!, { issuer: 'van-tien-luc-api', audience: 'van-tien-luc-client' }) as jwt.JwtPayload;
    if (typeof payload.sub !== 'string') throw new Error('Invalid subject');
    req.userId = payload.sub;
    next();
  } catch { res.status(401).json({ error: 'INVALID_TOKEN' }); }
}

async function wallet(client: PoolClient, id: string) {
  const result = await client.query('SELECT username, exp, gold, spirit, last_afk_claim_at FROM players WHERE id = $1', [id]);
  return result.rows[0];
}

app.get('/health', (_req, res) => res.json({ ok: true, service: 'van-tien-luc-api' }));

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: 'INVALID_INPUT', details: parsed.error.flatten() }); return; }
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const result = await pool.query(
      'INSERT INTO players (username, password_hash) VALUES ($1, $2) RETURNING id, username, exp, gold, spirit',
      [parsed.data.username, passwordHash]
    );
    const player = result.rows[0];
    res.status(201).json({ token: issueToken(player.id), player });
  } catch (error: any) {
    if (error?.code === '23505') { res.status(409).json({ error: 'USERNAME_TAKEN' }); return; }
    next(error);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: 'INVALID_INPUT' }); return; }
    const result = await pool.query('SELECT id, username, password_hash, exp, gold, spirit FROM players WHERE username = $1', [parsed.data.username]);
    const player = result.rows[0];
    if (!player || !(await bcrypt.compare(parsed.data.password, player.password_hash))) {
      res.status(401).json({ error: 'INVALID_CREDENTIALS' }); return;
    }
    res.json({ token: issueToken(player.id), player: { id: player.id, username: player.username, exp: player.exp, gold: player.gold, spirit: player.spirit } });
  } catch (error) { next(error); }
});

app.get('/api/player/me', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const result = await pool.query('SELECT id, username, exp, gold, spirit, last_afk_claim_at FROM players WHERE id = $1', [req.userId]);
    if (!result.rowCount) { res.status(404).json({ error: 'PLAYER_NOT_FOUND' }); return; }
    res.json({ player: result.rows[0] });
  } catch (error) { next(error); }
});

/** Server-clock AFK settlement. Client clocks and client-supplied reward amounts are never trusted. */
app.post('/api/afk/claim', requireAuth, async (req: AuthedRequest, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      'SELECT exp, gold, spirit, last_afk_claim_at, NOW() AS server_now FROM players WHERE id = $1 FOR UPDATE',
      [req.userId]
    );
    if (!result.rowCount) { await client.query('ROLLBACK'); res.status(404).json({ error: 'PLAYER_NOT_FOUND' }); return; }
    const row = result.rows[0];
    const elapsedSeconds = Math.max(0, Math.min(MAX_OFFLINE_SECONDS, Math.floor((Date.now() - new Date(row.last_afk_claim_at).getTime()) / 1000)));
    const minutes = Math.floor(elapsedSeconds / 60);
    const rewards = { exp: minutes * 5, gold: minutes * 4, spirit: Math.floor(minutes / 8) };
    await client.query(
      'UPDATE players SET exp = exp + $1, gold = gold + $2, spirit = spirit + $3, last_afk_claim_at = NOW(), updated_at = NOW() WHERE id = $4',
      [rewards.exp, rewards.gold, rewards.spirit, req.userId]
    );
    const updated = await wallet(client, req.userId!);
    await client.query('COMMIT');
    res.json({ rewards, elapsedSeconds, serverTime: row.server_now, player: updated });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    next(error);
  } finally { client.release(); }
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  // Keep secrets and database details out of client responses.
  console.error('[api]', error instanceof Error ? error.message : 'Unknown error');
  res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
});

migrate().then(() => {
  app.listen(PORT, '0.0.0.0', () => console.log(`Vạn Tiên Lục API listening on :${PORT}`));
}).catch(error => {
  console.error('Database migration failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
