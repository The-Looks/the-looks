import { useSyncExternalStore } from 'react';

const listeners = new Set<() => void>();
let token: string | null = null;
let refreshing: Promise<string | null> | null = null;

function emit() {
  listeners.forEach((l) => l());
}

function expiry(jwt: string): number | null {
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1]!.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

/** Access token chỉ tồn tại trong bộ nhớ; refresh token ở cookie httpOnly. */
export const session = {
  getToken: () => token,
  setToken(next: string) {
    token = next;
    emit();
  },
  clear() {
    token = null;
    emit();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  isValid(t: string | null = token) {
    if (!t) return false;
    const exp = expiry(t);
    return exp !== null && exp * 1000 > Date.now() + 15_000;
  },
  async refresh(): Promise<string | null> {
    if (refreshing) return refreshing;
    const request = async (): Promise<string | null> => {
      try {
        const response = await fetch('/api/public/auth/refresh', { method: 'POST', credentials: 'same-origin' });
        if (!response.ok) {
          session.clear();
          return null;
        }
        const body = (await response.json()) as { accessToken?: string };
        if (!body.accessToken) {
          session.clear();
          return null;
        }
        session.setToken(body.accessToken);
        return body.accessToken;
      } catch {
        session.clear();
        return null;
      }
    };
    // Các tab dùng chung refresh cookie. Khoá liên tab tránh gửi đồng thời token cũ.
    refreshing = (async () => {
      try {
        return navigator.locks
          ? await navigator.locks.request('thelooks-refresh-token', request)
          : await request();
      } finally {
        refreshing = null;
      }
    })();
    return refreshing;
  },
  async validToken() {
    return session.isValid() ? token : session.refresh();
  },
  async logout() {
    try {
      await fetch('/api/public/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } catch {
      // Mất kết nối vẫn xoá access token khỏi bộ nhớ.
    } finally {
      session.clear();
    }
  },
};

export function useSession() {
  const current = useSyncExternalStore(session.subscribe, session.getToken);
  return { token: current, isAuthenticated: session.isValid(current) };
}
