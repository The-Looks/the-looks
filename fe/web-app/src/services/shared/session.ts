import { useSyncExternalStore } from 'react';

// Remove the token left by the older localStorage-based client. Never read it back.
function clearLegacyAccessToken() {
  try { localStorage.removeItem('thelooks.accessToken'); } catch { /* Storage may be unavailable. */ }
}
clearLegacyAccessToken();

const listeners = new Set<() => void>();
let expiresAt = 0;
let refreshing: Promise<boolean> | null = null;
const emit = () => listeners.forEach((listener) => listener());

/** The browser sends HttpOnly access and refresh cookies; JavaScript stores only expiry. */
export const session = {
  getExpiry: () => expiresAt,
  start(nextExpiresAt: string) {
    const parsed = Date.parse(nextExpiresAt);
    expiresAt = Number.isFinite(parsed) ? parsed : 0;
    emit();
  },
  clear() {
    expiresAt = 0;
    clearLegacyAccessToken();
    emit();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  isValid(value = expiresAt) { return value > Date.now() + 15_000; },
  async refresh(): Promise<boolean> {
    if (refreshing) return refreshing;
    const request = async () => {
      try {
        const response = await fetch('/api/public/auth/refresh', { method: 'POST', credentials: 'same-origin' });
        if (!response.ok) { session.clear(); return false; }
        const body = (await response.json()) as { expiresAt?: string };
        if (!body.expiresAt) { session.clear(); return false; }
        session.start(body.expiresAt);
        return session.isValid();
      } catch {
        session.clear();
        return false;
      }
    };
    // Multiple tabs share the refresh cookie. Serialize refresh to avoid rotating it twice.
    refreshing = (async () => {
      try {
        return navigator.locks
          ? await navigator.locks.request('thelooks-refresh-token', request)
          : await request();
      } finally { refreshing = null; }
    })();
    return refreshing;
  },
  async ensureValid() { return session.isValid() || session.refresh(); },
  async logout() {
    try { await fetch('/api/public/auth/logout', { method: 'POST', credentials: 'same-origin' }); }
    catch { /* Clear local session state even if the network is down. */ }
    finally { session.clear(); }
  },
};

export function useSession() {
  const current = useSyncExternalStore(session.subscribe, session.getExpiry);
  return { isAuthenticated: session.isValid(current) };
}
