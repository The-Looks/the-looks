import { useLayoutEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router-dom';
import { useSession } from '../../../services/shared/session';
import { previousScreen, screenKey, type HistoryVisit } from './backHistory';

/** Keep transition direction in sync with both browser history and in-page Back links. */
export function RouteMotionLayout() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const { isAuthenticated } = useSession();
  const previous = useRef<HistoryVisit>();

  useLayoutEffect(() => {
    const entry = window.history.state;
    const index = entry?.idx;
    if (typeof index !== 'number') return;
    if (previous.current?.key === location.key) {
      previous.current.authenticated = isAuthenticated;
      return;
    }
    const current = { index, screen: screenKey(location), authenticated: isAuthenticated, key: location.key };
    const backLink = (location.state as { backNavigation?: boolean } | null)?.backNavigation === true;
    const browserBack = previous.current !== undefined && index < previous.current.index;
    const goingBack = navigationType === 'POP' ? browserBack : backLink;
    document.documentElement.dataset.routeDirection = goingBack ? 'back' : 'forward';

    // Store the previous distinct screen on this browser entry so reloads keep it.
    const back = previousScreen(current, navigationType, previous.current, entry.theLooksBack);
    if (back !== entry.theLooksBack) window.history.replaceState({ ...entry, theLooksBack: back }, '');
    previous.current = { ...current, back };
  }, [isAuthenticated, location, navigationType]);

  return <Outlet />;
}
