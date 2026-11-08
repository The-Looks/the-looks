import type { StylePreferences, WardrobeItem } from '../../../interface/dto/types';
import type { MascotId } from './mascots';

type Progress = { mascot?: MascotId; dismissed?: boolean };
const fallback = new Map<string, Progress>();
const storageKey = (id: string) => `thelooks.onboarding.${id}`;

// Keep onboarding choices browser-local until profile storage is available.
export function readOnboarding(id: string): Progress {
  const inMemory = fallback.get(id);
  if (inMemory) return inMemory;
  try {
    const stored = localStorage.getItem(storageKey(id));
    if (stored) return JSON.parse(stored) ?? {};
  } catch { /* A browser may disable storage. */ }
  return {};
}

export function updateOnboarding(id: string, patch: Progress) {
  const next = { ...readOnboarding(id), ...patch };
  try {
    localStorage.setItem(storageKey(id), JSON.stringify(next));
    fallback.delete(id);
  } catch {
    fallback.set(id, next);
  }
}

export function needsOnboarding(preferences: StylePreferences, items: WardrobeItem[]) {
  return items.length === 0 && !preferences.gender && !preferences.budget &&
    !preferences.styles?.length && !preferences.colors?.length;
}
