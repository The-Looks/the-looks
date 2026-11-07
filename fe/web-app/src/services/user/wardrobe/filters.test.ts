import { describe, expect, it } from 'vitest';
import { changeWardrobeFilter, readWardrobeFilters } from './filters';

describe('wardrobe URL filters', () => {
  it('restores every filter and pagination from a shared URL', () => {
    expect(readWardrobeFilters(new URLSearchParams('status=CONFIRMED&category=TOP&color=white&season=SUMMER&style=casual&q=cotton&sort=LEAST_RECENTLY_WORN&page=2&size=48')))
      .toEqual({ status: 'CONFIRMED', category: 'TOP', color: 'white', season: 'SUMMER', style: 'casual', q: 'cotton', sort: 'LEAST_RECENTLY_WORN', page: 2, size: 48 });
  });
  it('sanitizes invalid enum and pagination values', () => {
    const f = readWardrobeFilters(new URLSearchParams('status=bad&category=bad&season=bad&sort=bad&page=-1&size=500'));
    expect(f).toMatchObject({ status: undefined, category: undefined, season: undefined, sort: 'NEWEST', page: 0, size: 24 });
    expect(readWardrobeFilters(new URLSearchParams('page=1.5')).page).toBe(0);
  });
  it('resets pagination on filter changes and preserves filters during paging', () => {
    const current = new URLSearchParams('category=TOP&color=white&page=3');
    const changed = changeWardrobeFilter(current, 'season', 'SUMMER');
    expect(changed.get('page')).toBeNull(); expect(changed.get('category')).toBe('TOP'); expect(changed.get('color')).toBe('white');
    const paged = changeWardrobeFilter(changed, 'page', '1');
    expect(paged.get('season')).toBe('SUMMER'); expect(paged.get('page')).toBe('1');
    expect(changeWardrobeFilter(paged, 'color', '').has('color')).toBe(false);
    expect(current.get('page')).toBe('3');
  });
});
