import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AuthMotionBackground } from './AuthMotionBackground';

export type AuthTransitionContext = { previousPath: '/login' | '/register' | null };

/** Keep the previous auth screen while the two routes replace each other. */
export function AuthTransitionLayout() {
  const location = useLocation();
  const previousPath = useRef<AuthTransitionContext['previousPath']>(null);
  const context: AuthTransitionContext = { previousPath: previousPath.current };

  useEffect(() => {
    if (location.pathname === '/login' || location.pathname === '/register') {
      previousPath.current = location.pathname;
    }
  }, [location.pathname]);

  return <div className="auth-route-stage"><AuthMotionBackground /><Outlet context={context} /></div>;
}
