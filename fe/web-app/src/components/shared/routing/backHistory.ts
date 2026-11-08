import type { Location, NavigationType } from 'react-router-dom';

export type HistoryPage = { index: number; screen: string; authenticated: boolean };
export type HistoryVisit = HistoryPage & { key: string; back?: HistoryPage };

export function screenKey({ pathname, search }: Pick<Location, 'pathname' | 'search'>) {
  const path = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  // The wardrobe wizard has two screens on the same route.
  return path === '/onboarding/wardrobe' && new URLSearchParams(search).get('step') === 'outfit'
    ? path + '?step=outfit' : path;
}

export function previousScreen(
  current: HistoryPage,
  navigation: NavigationType,
  previous?: HistoryVisit,
  stored?: HistoryPage,
) {
  if (navigation === 'POP') return stored;
  if (!previous) return undefined;
  if (previous.index >= current.index || previous.screen === current.screen) return previous.back;
  const { index, screen, authenticated } = previous;
  return { index, screen, authenticated };
}

export function backDelta(current: HistoryPage, previous?: HistoryPage, requiredScreen?: string) {
  if (!previous || previous.index >= current.index || previous.screen === current.screen) return undefined;
  if (requiredScreen && previous.screen !== requiredScreen) return undefined;
  if (previous.screen === '/onboarding/check' || previous.screen === '/auth/callback') return undefined;
  if (!current.authenticated && previous.authenticated) return undefined;
  if (current.authenticated && (previous.screen === '/login' || previous.screen === '/register')) return undefined;
  return previous.index - current.index;
}
