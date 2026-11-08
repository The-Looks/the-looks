import { beforeEach, expect, it } from 'vitest';
import { ACCESSORIES, decodeLook, encodeLook, isDressed, normalizeLook, randomLook } from './look';
import { isModular, MASCOTS } from './mascots';
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
  expect(normalizeLook({ mascot: 'fox', top: 'hoodie' })).toEqual({ mascot: 'fox', top: 'hoodie' });
  expect(normalizeLook({ mascot: 'panda', top: 'hoodie', bottom: 'jeans', shoes: 'boots' }))
    .toEqual({ mascot: 'panda', top: 'hoodie', bottom: 'jeans', shoes: 'boots' });
  expect(decodeLook('')).toBeUndefined();
});

it('random looks only use real accessories', () => {
  let seed = 0;
  const random = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 50; i++) {
    const look = randomLook(random);
    expect(normalizeLook(look)).toEqual(look);
    if (look.hat) expect(ACCESSORIES.hat.map((a) => a.id)).toContain(look.hat);
    if (isModular(look.mascot)) expect(look.top && look.bottom && look.shoes).toBeTruthy(); // tự phối luôn có đồ
  }
});

it('keeps old accounts that only saved a mascot and stores a look per account', () => {
  updateOnboarding('lan', { mascot: 'bear' });
  expect(readLook('lan')).toEqual({ mascot: 'bear' });
  saveLook('lan', { mascot: 'fox', neck: 'scarf' });
  expect(readLook('lan')).toEqual({ mascot: 'fox', neck: 'scarf' });
  expect(readLook('other')).toBeUndefined();
});

it('offers 16 mascots; drawn ones keep their own outfit until clothes are picked', () => {
  expect(MASCOTS).toHaveLength(16);
  expect(MASCOTS.filter((m) => isModular(m.id))).toHaveLength(10);
  expect(isDressed({ mascot: 'fox' })).toBe(false);
  expect(isDressed({ mascot: 'fox', shoes: 'boots' })).toBe(true);
  expect(isDressed({ mascot: 'dog' })).toBe(true);
});
