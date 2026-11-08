import { NavigationType } from 'react-router-dom';
import { expect, it } from 'vitest';
import { backDelta, previousScreen, screenKey, type HistoryVisit } from './backHistory';

const page = (index: number, screen: string, authenticated = true): HistoryVisit =>
  ({ index, screen, authenticated, key: String(index) });

it('goes back across filter updates to the previous distinct page', () => {
  const home = page(0, '/');
  const wardrobe = page(1, '/wardrobe');
  wardrobe.back = previousScreen(wardrobe, NavigationType.Push, home);
  const filtered = page(2, screenKey({ pathname: '/wardrobe', search: '?category=TOP' }));
  const back = previousScreen(filtered, NavigationType.Push, wardrobe);

  expect(backDelta(filtered, back)).toBe(-2);
});

it('keeps the originating route on replace and restores it after a reload', () => {
  const wardrobe = page(2, '/wardrobe');
  const item = page(3, '/wardrobe/item');
  item.back = previousScreen(item, NavigationType.Push, wardrobe);
  const replacement = page(3, '/wardrobe/stats');
  const back = previousScreen(replacement, NavigationType.Replace, item);

  expect(backDelta(replacement, previousScreen(replacement, NavigationType.Pop, undefined, back))).toBe(-1);
  expect(backDelta(page(0, '/wardrobe/stats'))).toBeUndefined();
});

it('avoids redirect pages and accepts the previous wizard step when present', () => {
  const outfit = page(4, screenKey({ pathname: '/onboarding/wardrobe', search: '?step=outfit' }));
  const wardrobe = page(3, '/onboarding/wardrobe');
  expect(backDelta(outfit, wardrobe, '/onboarding/wardrobe')).toBe(-1);
  expect(backDelta(outfit, page(3, '/onboarding'), '/onboarding/wardrobe')).toBeUndefined();
  expect(backDelta(outfit, page(3, '/onboarding/check'))).toBeUndefined();
  expect(backDelta(outfit, page(3, '/login', false))).toBeUndefined();
  expect(backDelta(page(4, '/login', false), page(3, '/wardrobe'))).toBeUndefined();
});
