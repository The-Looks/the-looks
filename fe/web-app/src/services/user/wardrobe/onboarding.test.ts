import { expect, it } from 'vitest';
import type { WardrobeItem } from '../../../interface/dto/types';
import { wardrobeReadiness } from './onboarding';
const item = (category: WardrobeItem['category'], status: WardrobeItem['status'] = 'CONFIRMED'): WardrobeItem => ({ id: crypto.randomUUID(), category, status, createdAt: '2026-11-06T00:00:00Z' });
it('counts only confirmed items and requires three items with a usable combination', () => {
  expect(wardrobeReadiness([item('TOP'), item('BOTTOM')]).ready).toBe(false);
  expect(wardrobeReadiness([item('TOP'), item('BOTTOM'), item('SHOES', 'PENDING_REVIEW')]).count).toBe(2);
  expect(wardrobeReadiness([item('TOP'), item('BOTTOM'), item('SHOES')]).ready).toBe(true);
  expect(wardrobeReadiness([item('BAG'), item('SHOES'), item('ACCESSORY')]).ready).toBe(false);
  expect(wardrobeReadiness([item('DRESS'), item('BAG'), item('SHOES')]).ready).toBe(true);
});
