import { Outlet } from 'react-router-dom';
import { useSession } from '../shared/lib/session';
import { PublicDashboardPage } from './PublicDashboardPage';

/** The same URL shows a dashboard preview for guests and live personal data after sign-in. */
export function HomeEntry() {
  const { isAuthenticated } = useSession();
  return isAuthenticated ? <Outlet /> : <PublicDashboardPage />;
}
