export interface CloudPlayer {
  id?: string;
  username: string;
  exp: number;
  gold: number;
  spirit: number;
  last_afk_claim_at?: string;
}

export interface AfkClaim {
  rewards: { exp: number; gold: number; spirit: number };
  elapsedSeconds: number;
  serverTime: string;
  player: CloudPlayer;
}

interface AuthResponse { token: string; player: CloudPlayer }

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787').replace(/\/$/, '');
const TOKEN_KEY = 'van-tien-luc-session-v1';

export class CloudAccount {
  static get isSignedIn(): boolean { return Boolean(localStorage.getItem(TOKEN_KEY)); }

  static logout(): void { localStorage.removeItem(TOKEN_KEY); }

  static async register(username: string, password: string): Promise<CloudPlayer> {
    return this.authenticate('/api/auth/register', username, password);
  }

  static async login(username: string, password: string): Promise<CloudPlayer> {
    return this.authenticate('/api/auth/login', username, password);
  }

  private static async authenticate(path: string, username: string, password: string): Promise<CloudPlayer> {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await this.read<AuthResponse>(response);
    localStorage.setItem(TOKEN_KEY, data.token);
    return data.player;
  }

  static async me(): Promise<CloudPlayer> {
    return this.request<{ player: CloudPlayer }>('/api/player/me').then(data => data.player);
  }

  static claimAfk(): Promise<AfkClaim> {
    return this.request<AfkClaim>('/api/afk/claim', { method: 'POST' });
  }

  private static async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) throw new Error('Bạn chưa đăng nhập tài khoản máy chủ.');
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...init.headers }
    });
    return this.read<T>(response);
  }

  private static async read<T>(response: Response): Promise<T> {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = typeof data.error === 'string' ? data.error : `HTTP_${response.status}`;
      throw new Error(error);
    }
    return data as T;
  }
}
