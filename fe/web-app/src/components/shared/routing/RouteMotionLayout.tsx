import { useLayoutEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router-dom';

/** Keep transition direction in sync with both browser history and in-page Back links. */
export function RouteMotionLayout() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const previousIndex = useRef<number | null>(null);

  useLayoutEffect(() => {
    const index = window.history.state?.idx;
    const backLink = (location.state as { backNavigation?: boolean } | null)?.backNavigation === true;
    const browserBack = typeof index === 'number' && previousIndex.current !== null && index < previousIndex.current;
    const goingBack = navigationType === 'POP' ? browserBack : backLink;
    document.documentElement.dataset.routeDirection = goingBack ? 'back' : 'forward';
    previousIndex.current = typeof index === 'number' ? index : null;
  }, [location.key, location.state, navigationType]);

  return <Outlet />;
}
