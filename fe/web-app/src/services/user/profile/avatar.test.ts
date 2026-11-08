import { beforeEach, expect, it } from 'vitest';
import { updateOnboarding } from '../onboarding/progress';
import { accountAvatarSource, accountMascot } from './avatar';

beforeEach(() => localStorage.clear());

it('uses a portrait of the selected mascot only for its own account', () => {
  updateOnboarding('lan', { mascot: 'fox' });

  expect(accountAvatarSource('lan')).toBe('/illustrations/portraits/fox.svg');
  expect(accountAvatarSource('other')).toBeUndefined();
});

it('prefers the uploaded photo and returns to the portrait when it is removed', () => {
  updateOnboarding('lan', { mascot: 'cat' });
  const uploaded = { username: 'Lan', hasAvatar: true, avatarUpdatedAt: '2026-11-08T10:00:00Z' };

  expect(accountAvatarSource('lan', uploaded)).toBe('/api/app/me/avatar?v=2026-11-08T10%3A00%3A00Z');
  expect(accountAvatarSource('lan', { ...uploaded, hasAvatar: false })).toBe('/illustrations/portraits/cat.svg');
});

it('uses the saved account mascot over an older browser choice', () => {
  updateOnboarding('lan', { mascot: 'cat' });
  const profile = { username: 'Lan', hasAvatar: false, mascotId: 'fox' as const };

  expect(accountMascot('lan', profile)?.id).toBe('fox');
  expect(accountAvatarSource('lan', profile)).toBe('/illustrations/portraits/fox.svg');
});
