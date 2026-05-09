export type Tier = 'boiler' | 'chiller' | 'facility';

export interface FILiteUser {
  email: string;
  name: string;
  company: string;
  tier: Tier;
  registeredAt: string;
}

const STORAGE_KEY = 'fi_lite_user';

const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxmbYPEuVIRL_pb2BJxcjnli5UYyUe0M2kI6NedHk9bBu3FuYhex1lAuDYv1psACGL9/exec';

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
}

export async function registerUser(user: FILiteUser): Promise<void> {
  saveUser(user);
  try {
    // Sends to "Prospect Buyers" tab via GAS
    await fetch(GAS_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify({
        system: 'buyer',
        name: user.name,
        company: user.company,
        email: user.email,
        product: `FI Lite — ${user.tier.charAt(0).toUpperCase() + user.tier.slice(1)} Tier`,
        status: 'FI Lite Registration',
        notes: `Registered ${new Date().toISOString()}`,
      }),
    });
  } catch {
    // Silently fail — user is stored locally regardless
  }
}

export function canAccessTier(userTier: Tier, requiredTier: Tier): boolean {
  if (userTier === 'facility') return true;
  return userTier === requiredTier;
}

export const TIER_PRICE_IDS: Record<Tier, string> = {
  boiler:   'price_1SzoS9Dfw4bOR2dfaWJ6UqkB',
  chiller:  'price_1SzoSoDfw4bOR2dfTqTf3dJN',
  facility: 'price_1SzoTkDfw4bOR2dfFzvTjft8',
};

export const TIER_LABELS: Record<Tier, string> = {
  boiler:   'Boiler Intelligence',
  chiller:  'Chiller Intelligence',
  facility: 'Facility Intelligence',
};
