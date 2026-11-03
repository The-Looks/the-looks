import { Outlet } from 'react-router-dom';
import { useSession } from '../services/shared/session';
import { PublicDashboardPage } from '../pages/guest/home/PublicDashboardPage';

/** The same URL shows a dashboard preview for guests and live personal data after sign-in. */
export function HomeEntry() {
  const { isAuthenticated } = useSession();
  return isAuthenticated ? <Outlet /> : <PublicDashboardPage />;
}
