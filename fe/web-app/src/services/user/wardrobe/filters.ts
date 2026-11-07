import type { Category, ItemStatus } from '../../../interface/dto/types';

export type WardrobeFilters = {
  status?: ItemStatus; category?: Category; color?: string; season?: 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER';
  style?: string; q?: string; sort: 'NEWEST' | 'LEAST_RECENTLY_WORN'; page: number; size: number;
};
const choice = <T extends string>(value: string | null, choices: readonly T[]): T | undefined => choices.find((item) => item === value);
export function readWardrobeFilters(params: URLSearchParams): WardrobeFilters {
  const page = Number(params.get('page') ?? 0);
  const size = Number(params.get('size') ?? 24);
  return {
    status: choice(params.get('status'), ['PROCESSING', 'PENDING_REVIEW', 'CONFIRMED', 'RECOGNITION_FAILED'] as const),
    category: choice(params.get('category'), ['TOP', 'BOTTOM', 'DRESS', 'OUTERWEAR', 'SHOES', 'BAG', 'ACCESSORY'] as const),
    color: params.get('color')?.slice(0, 30) || undefined,
    season: choice(params.get('season'), ['SPRING', 'SUMMER', 'AUTUMN', 'WINTER'] as const),
    style: params.get('style')?.slice(0, 30) || undefined, q: params.get('q')?.slice(0, 100) || undefined,
    sort: choice(params.get('sort'), ['NEWEST', 'LEAST_RECENTLY_WORN'] as const) ?? 'NEWEST',
    page: Number.isInteger(page) && page >= 0 && page <= 1_000_000 ? page : 0,
    size: [12, 24, 48, 100].includes(size) ? size : 24,
  };
}
export function changeWardrobeFilter(params: URLSearchParams, key: keyof WardrobeFilters, value: string) {
  const next = new URLSearchParams(params);
  if (!value || (key === 'sort' && value === 'NEWEST') || (key === 'page' && value === '0')) next.delete(key);
  else next.set(key, value);
  if (key !== 'page') next.delete('page');
  return next;
}
