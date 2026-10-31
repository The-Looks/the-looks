import { useSyncExternalStore } from 'react';

// ponytail: access token trong localStorage — script lạ (XSS) đọc được. Chuyển sang refresh token
// trong cookie httpOnly khi identity-service hỗ trợ.
const KEY = 'thelooks.accessToken';
const listeners = new Set<() => void>();

function read(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

let token = read();

function emit() {
  listeners.forEach((l) => l());
}

/** Giây hết hạn (claim exp) của JWT; null nếu không đọc được. */
function expiry(jwt: string): number | null {
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1]!.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

export const session = {
  getToken: () => token,
  setToken(next: string) {
    token = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* chế độ riêng tư: chỉ giữ trong bộ nhớ */
    }
    emit();
  },
  clear() {
    token = null;
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* bỏ qua */
    }
    emit();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  isValid(t: string | null = token) {
    if (!t) return false;
    const exp = expiry(t);
    return exp === null || exp * 1000 > Date.now();
  },
};

export function useSession() {
  const current = useSyncExternalStore(session.subscribe, session.getToken);
  return { token: current, isAuthenticated: session.isValid(current) };
}
