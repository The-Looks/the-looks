import { beforeEach, expect, it } from 'vitest';
import { ACCESSORIES, decodeLook, encodeLook, normalizeLook, randomLook } from './look';
import { readLook, saveLook, updateOnboarding } from './progress';

beforeEach(() => localStorage.clear());

it('round-trips a look through the compact text form', () => {
  const look = { mascot: 'frog' as const, hat: 'crown', glasses: 'heart', background: 'mint' };
  expect(encodeLook(look)).toBe('frog|hat:crown|glasses:heart|background:mint');
  expect(decodeLook(encodeLook(look))).toEqual(look);
});

it('drops unknown mascots and accessories', () => {
  expect(normalizeLook({ mascot: 'dragon' })).toBeUndefined();
  expect(normalizeLook({ mascot: 'cat', hat: 'helmet', glasses: 'round' })).toEqual({ mascot: 'cat', glasses: 'round' });
  expect(decodeLook('')).toBeUndefined();
});

it('random looks only use real accessories', () => {
  let seed = 0;
  const random = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 50; i++) {
    const look = randomLook(random);
    expect(normalizeLook(look)).toEqual(look);
    if (look.hat) expect(ACCESSORIES.hat.map((a) => a.id)).toContain(look.hat);
  }
});

it('keeps old accounts that only saved a mascot and stores a look per account', () => {
  updateOnboarding('lan', { mascot: 'bear' });
  expect(readLook('lan')).toEqual({ mascot: 'bear' });
  saveLook('lan', { mascot: 'fox', neck: 'scarf' });
  expect(readLook('lan')).toEqual({ mascot: 'fox', neck: 'scarf' });
  expect(readLook('other')).toBeUndefined();
});
