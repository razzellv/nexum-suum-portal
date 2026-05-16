const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('fi_lite_token');
}

export async function apiPost<T = unknown>(path: string, body: unknown): Promise<T> {
  const token = getToken();
  if (!API_BASE) {
    // Offline mode — store locally
    const key = `fi_offline${path.replace(/\//g, '_')}`;
    const existing: unknown[] = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push({ ...(body as object), _ts: Date.now() });
    localStorage.setItem(key, JSON.stringify(existing));
    return { ok: true, offline: true } as unknown as T;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function apiGet<T = unknown>(path: string): Promise<T> {
  const token = getToken();
  if (!API_BASE) {
    const key = `fi_offline${path.replace(/\//g, '_')}`;
    return JSON.parse(localStorage.getItem(key) || '[]') as T;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}
