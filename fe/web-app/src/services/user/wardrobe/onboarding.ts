import type { WardrobeItem } from '../../../interface/dto/types';

export function wardrobeReadiness(items: WardrobeItem[]) {
  const confirmed = items.filter((item) => item.status === 'CONFIRMED');
  const has = (category: WardrobeItem['category']) => confirmed.some((item) => item.category === category);
  const canCompose = has('DRESS') || (has('TOP') && has('BOTTOM'));
  return { count: confirmed.length, ready: confirmed.length >= 3 && canCompose,
    canCompose, hasTop: has('TOP'), hasBottom: has('BOTTOM'), hasShoes: has('SHOES'), hasDress: has('DRESS') };
}
