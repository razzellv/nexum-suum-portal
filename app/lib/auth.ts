export type Tier = 'boiler' | 'chiller' | 'facility' | 'playbook';

export interface FILiteUser {
  email: string;
  name: string;
  company: string;
  tier: Tier;
  registeredAt: string;
}

const STORAGE_KEY = 'fi_lite_user';
const TOKEN_KEY = 'fi_lite_token';

export function saveUser(user: FILiteUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function loadUser(): FILiteUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearUser(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function loadToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function canAccessTier(userTier: Tier, requiredTier: Tier): boolean {
  if (userTier === 'facility') return true;
  return userTier === requiredTier;
}

export function isUnlocked(requiredTier: Tier): boolean {
  if (requiredTier === 'playbook') return true;
  const user = loadUser();
  if (!user) return false;
  return user.tier === 'facility' || user.tier === requiredTier;
}

export const TIER_PRICE_IDS: Record<'boiler' | 'chiller' | 'facility', string> = {
  boiler:   'price_1SzoS9Dfw4bOR2dfaWJ6UqkB',
  chiller:  'price_1SzoSoDfw4bOR2dfTqTf3dJN',
  facility: 'price_1SzoTkDfw4bOR2dfFzvTjft8',
};

export const TIER_LABELS: Record<Tier, string> = {
  boiler:   'Boiler Intelligence',
  chiller:  'Chiller Intelligence',
  facility: 'Facility Intelligence Lite',
  playbook: 'FI PMO Playbook',
};
