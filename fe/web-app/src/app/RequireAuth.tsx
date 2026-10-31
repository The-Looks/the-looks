import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '../shared/lib/session';

/** Chưa đăng nhập (hoặc token hết hạn / bị 401) → về /login, đăng nhập xong quay lại trang cũ. */
export function RequireAuth() {
  const { isAuthenticated } = useSession();
  const location = useLocation();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
}
