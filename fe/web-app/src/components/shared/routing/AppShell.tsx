import { useQuery } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { Avatar, Badge, Drawer, Input, Layout, Tooltip } from 'antd';
import {
  AppstoreOutlined,
  BellOutlined,
  CheckSquareOutlined,
  CrownOutlined,
  HeartOutlined,
  HomeOutlined,
  LogoutOutlined,
  SearchOutlined,
  SkinOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { authRequests } from '../../../services/guest/auth/requests';
import { brand } from '../../../services/shared/brand';
import { session } from '../../../services/shared/session';
import { Brand } from '../ui/index';

const NAV = [
  { to: '/', label: brand.content.home, icon: <HomeOutlined /> },
  { to: '/wardrobe', label: brand.content.wardrobe, icon: <SkinOutlined /> },
  { to: '/outfits/suggest', label: 'LOOKSY AI', icon: <AppstoreOutlined /> },
  { to: '/outfits', label: 'Outfit đã lưu', icon: <HeartOutlined /> },
  { to: '/polls', label: brand.content.voting, icon: <CheckSquareOutlined /> },
] as const;

const MOBILE_NAV = NAV;

function currentKey(pathname: string) {
  if (pathname === '/') return '/';
  if (pathname.startsWith('/outfits/suggest')) return '/outfits/suggest';
  return NAV.find((item) => item.to !== '/' && pathname.startsWith(item.to))?.to ?? '';
}

export function AppShell({ children, publicPreview = false }: { children?: ReactNode; publicPreview?: boolean }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const me = useQuery({ queryKey: ['me'], queryFn: authRequests.me, enabled: !publicPreview });
  const isAdmin = me.data?.roles?.includes('ADMIN') ?? false;
  const selected = currentKey(pathname);
  const avatarLetter = publicPreview ? 'B' : me.data?.username?.slice(0, 1).toUpperCase() ?? 'T';
  const closeMenu = () => setMenuOpen(false);

  return (
    <Layout className="app-frame app-frame-topnav">
      <Layout className="app-main-layout">
        <header className="app-topbar app-topbar-editorial">
          <Link to="/" className="app-header-brand" aria-label="THE LOOKS, về trang chủ"><Brand /><span className="app-header-wordmark">The Looks</span></Link>
          <nav className="app-header-nav" aria-label="Điều hướng chính">
            {NAV.map((item) => <Link key={item.to} to={item.to} className={selected === item.to ? 'active' : ''} aria-current={selected === item.to ? 'page' : undefined}>{item.label}</Link>)}
          </nav>
          <div className="topbar-actions">
            {!publicPreview && <>
              <Input.Search
                className="topbar-search"
                prefix={<SearchOutlined />}
                placeholder="Tìm món đồ trong tủ..."
                aria-label="Tìm món đồ trong tủ"
                onSearch={(value) => navigate(`/wardrobe${value.trim() ? `?q=${encodeURIComponent(value.trim())}` : ''}`)}
              />
              <Tooltip title="Thông báo"><Link to="/notifications" className="topbar-icon" aria-label="Thông báo"><Badge dot><BellOutlined /></Badge></Link></Tooltip>
            </>}
            <button className="topbar-avatar-trigger" type="button" aria-label="Mở menu tài khoản" aria-expanded={menuOpen} aria-controls="account-drawer" onClick={() => setMenuOpen(true)}>
              <Avatar className="user-avatar">{avatarLetter}</Avatar>
            </button>
          </div>
        </header>

        <main className="app-page"><div key={pathname} className="route-transition">{children ?? <Outlet />}</div></main>
      </Layout>

      <nav className="app-mobile-nav" aria-label="Điều hướng di động">
        {MOBILE_NAV.map((item) => <Link key={item.to} to={item.to} className={selected === item.to ? 'active' : ''} aria-current={selected === item.to ? 'page' : undefined}>
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
