import { Navigate, Route, Routes } from 'react-router-dom';
import { useStore } from '../shared/store.jsx';
import Layout from './Layout.jsx';
import Login from '../features/auth/Login.jsx';
import Dashboard from '../features/dashboard/Dashboard.jsx';
import Users from '../features/users/Users.jsx';
import UserDetail from '../features/users/UserDetail.jsx';
import AuditLog from '../features/audit/AuditLog.jsx';
import Content from '../features/content/Content.jsx';
import Products from '../features/products/Products.jsx';
import Sync from '../features/products/Sync.jsx';
import Notifications from '../features/notifications/Notifications.jsx';
import Settings from '../features/settings/Settings.jsx';
import Plans from '../features/plans/Plans.jsx';
import Affiliate from '../features/affiliate/Affiliate.jsx';

function Protected({ children }) {
  const { authed } = useStore();
  return authed ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:id" element={<UserDetail />} />
        <Route path="/audit" element={<AuditLog />} />
        <Route path="/content" element={<Content />} />
        <Route path="/products" element={<Products />} />
        <Route path="/sync" element={<Sync />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/affiliate" element={<Affiliate />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
