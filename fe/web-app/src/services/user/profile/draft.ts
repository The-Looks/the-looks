const DRAFT_KEY_PREFIX = 'thelooks.draft.profile.v1.';

export type ProfileDraft = { username: string; city: string; updatedAt: string };

const keyFor = (userId: string) => `${DRAFT_KEY_PREFIX}${userId}`;

export function readProfileDraft(userId: string): ProfileDraft | null {
  try {
    const raw = localStorage.getItem(keyFor(userId));
    if (!raw) return null;
    const draft: unknown = JSON.parse(raw);
    if (!draft || typeof draft !== 'object') return null;
    const value = draft as Record<string, unknown>;
    if (typeof value.username !== 'string' || typeof value.city !== 'string' ||
        typeof value.updatedAt !== 'string' || !Number.isFinite(Date.parse(value.updatedAt))) return null;
    return { username: value.username, city: value.city, updatedAt: value.updatedAt };
  } catch { return null; }
}

export function writeProfileDraft(userId: string, username: string, city: string): boolean {
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify({ username, city, updatedAt: new Date().toISOString() }));
    return true;
  } catch { return false; }
}

export function clearProfileDraft(userId: string): void {
  try { localStorage.removeItem(keyFor(userId)); } catch { /* Storage may be unavailable. */ }
}
