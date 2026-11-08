import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import type { Look } from '../../../services/user/onboarding/look';
import { saveLook } from '../../../services/user/onboarding/progress';
import { MascotAvatar } from './MascotAvatar';
import { accountAvatar, accountLook } from './accountAvatar';

afterEach(() => { cleanup(); localStorage.clear(); });

it('names the mascot and its accessories for screen readers', () => {
  const { getByRole } = render(<MascotAvatar look={{ mascot: 'fox', hat: 'cap', glasses: 'round' }} />);
  expect(getByRole('img').getAttribute('aria-label')).toBe('Cáo Phố, Mũ lưỡi trai, Kính tròn');
});

it('uses the frog without its own beret only when another hat is worn', () => {
  const href = (look: Look) => render(<MascotAvatar look={look} />).container.querySelector('image')!.getAttribute('href');
  expect(href({ mascot: 'frog' })).toBe('/illustrations/frog.svg');
  expect(href({ mascot: 'frog', hat: 'crown' })).toBe('/illustrations/frog-bare.svg');
});

it('widens the portrait upwards so a hat is not cut off', () => {
  const box = (look: Look) => render(<MascotAvatar look={look} portrait />).container
    .querySelector('svg')!.getAttribute('viewBox')!.split(' ').map(Number);
  const [, plainTop = 0] = box({ mascot: 'penguin' });
  const [, hatTop = 0, size = 0] = box({ mascot: 'penguin', hat: 'beanie' });
  expect(hatTop).toBeLessThan(plainTop);
  expect(hatTop + size).toBe(128); // đáy khung giữ nguyên
});

it('prefers the uploaded photo, otherwise shows the account mascot', () => {
  saveLook('lan', { mascot: 'cat', hat: 'beret' });
  const uploaded = { username: 'Lan', hasAvatar: true, avatarUpdatedAt: '2026-11-08T10:00:00Z' };
  expect(accountAvatar('lan', uploaded)).toBe('/api/app/me/avatar?v=2026-11-08T10%3A00%3A00Z');
  const { container } = render(<>{accountAvatar('lan', { ...uploaded, hasAvatar: false })}</>);
  expect(container.querySelector('svg')).not.toBeNull();
  expect(accountAvatar('other')).toBeFalsy();
});

it('uses the account mascot over an older browser choice and keeps matching accessories', () => {
  saveLook('lan', { mascot: 'cat', hat: 'beret' });
  expect(accountLook('lan', { username: 'Lan', hasAvatar: false, mascotId: 'panda' })).toEqual({ mascot: 'panda' });
  saveLook('lan', { mascot: 'panda', hat: 'beret' });
  expect(accountLook('lan', { username: 'Lan', hasAvatar: false, mascotId: 'panda' })).toEqual({ mascot: 'panda', hat: 'beret' });
});

it('draws a dressable mascot in code and names its clothes', () => {
  const { container, getByRole } = render(<MascotAvatar look={{ mascot: 'panda', top: 'hoodie', bottom: 'jeans', shoes: 'boots', hat: 'cap' }} />);
  expect(container.querySelector('image')).toBeNull();
  expect(getByRole('img').getAttribute('aria-label')).toBe('Trúc Mập, Hoodie, Quần jean, Bốt, Mũ lưỡi trai');
});

it('puts the original head on the shared body once clothes are picked', () => {
  const hrefs = (look: Look) => [...render(<MascotAvatar look={look} />).container.querySelectorAll('image')].map((i) => i.getAttribute('href'));
  expect(hrefs({ mascot: 'fox' })).toEqual(['/illustrations/fox.svg']);
  expect(hrefs({ mascot: 'fox', top: 'tee' })).toEqual(['/illustrations/parts/fox-tail.svg', '/illustrations/parts/fox-head.svg']);
  expect(hrefs({ mascot: 'frog', top: 'tee', hat: 'cap' })).toEqual(['/illustrations/parts/frog-head-bare.svg']);
});
