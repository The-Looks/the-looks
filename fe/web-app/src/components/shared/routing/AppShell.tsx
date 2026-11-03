import { useQuery } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { Avatar, Drawer, Layout } from 'antd';
import {
  AppstoreOutlined,
  CrownOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { authRequests } from '../../../services/guest/auth/requests';
import { session } from '../../../services/shared/session';
import { APP_NAV, AppHeader, currentAppNav } from '../layout/AppHeader';
import { SiteFooter } from '../layout/SiteFooter';

export function AppShell({ children, publicPreview = false }: { children?: ReactNode; publicPreview?: boolean }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const me = useQuery({ queryKey: ['me'], queryFn: authRequests.me, enabled: !publicPreview });
  const isAdmin = me.data?.roles?.includes('ADMIN') ?? false;
  const selected = currentAppNav(pathname);
  const avatarLetter = publicPreview ? 'B' : me.data?.username?.slice(0, 1).toUpperCase() ?? 'T';
  const closeMenu = () => setMenuOpen(false);

  return (
    <Layout className="app-frame app-frame-topnav">
      <Layout className="app-main-layout">
        <AppHeader selected={selected} publicPreview={publicPreview} avatarLetter={avatarLetter} menuOpen={menuOpen} onOpenMenu={() => setMenuOpen(true)} />

        <main className="app-page"><div key={pathname} className="route-transition">{children ?? <Outlet />}</div></main>
        <SiteFooter variant={publicPreview ? 'public' : 'app'} />
      </Layout>

      <nav className="app-mobile-nav" aria-label="Điều hướng di động">
        {APP_NAV.map((item) => <Link key={item.to} to={item.to} className={selected === item.to ? 'active' : ''} aria-current={selected === item.to ? 'page' : undefined}>
          {item.icon}<span>{item.to === '/outfits/suggest' ? 'AI phối đồ' : item.to === '/outfits' ? 'Đã lưu' : item.label}</span>
        </Link>)}
      </nav>

      <Drawer id="account-drawer" title="Tài khoản" placement="right" open={menuOpen} onClose={closeMenu} width={320} className="app-account-drawer">
        <div className="drawer-identity"><Avatar size={48} className="user-avatar">{avatarLetter}</Avatar><div><strong>{publicPreview ? 'Khách' : me.data?.username ?? 'Tài khoản'}</strong><span>{publicPreview ? 'Khám phá THE LOOKS' : me.data?.email ?? ''}</span></div></div>
        <nav className="drawer-navigation" aria-label="Menu tài khoản">
          <Link to={publicPreview ? '/login' : '/profile'} onClick={closeMenu} className={pathname.startsWith('/profile') ? 'active' : ''}><UserOutlined /><span>{publicPreview ? 'Đăng nhập' : 'Hồ sơ'}</span></Link>
          <Link to={publicPreview ? '/register' : '/plans'} onClick={closeMenu} className={pathname.startsWith('/plans') ? 'active' : ''}><CrownOutlined /><span>{publicPreview ? 'Tạo tài khoản' : 'THE LOOKS Premium'}</span></Link>
          {isAdmin && <Link to="/admin" onClick={closeMenu}><AppstoreOutlined /><span>Quản trị hệ thống</span></Link>}
        </nav>
        {!publicPreview && <button className="drawer-logout" type="button" onClick={() => { closeMenu(); void session.logout().then(() => navigate('/')); }}><LogoutOutlined /> Đăng xuất</button>}
      </Drawer>
    </Layout>
  );
}
