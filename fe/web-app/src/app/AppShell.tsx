import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Avatar, Badge, Input, Layout, Menu, Tooltip } from 'antd';
import {
  AppstoreOutlined,
  BellOutlined,
  CrownOutlined,
  HeartOutlined,
  HomeOutlined,
  SearchOutlined,
  SkinOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { authApi, unwrap } from '../shared/api/client';
import { Brand } from '../shared/ui';

const NAV = [
  { to: '/', label: 'Trang chủ', icon: <HomeOutlined /> },
  { to: '/wardrobe', label: 'Tủ đồ', icon: <SkinOutlined /> },
  { to: '/outfits/suggest', label: 'LOOKSY AI', icon: <AppstoreOutlined /> },
  { to: '/outfits', label: 'Outfit đã lưu', icon: <HeartOutlined /> },
  { to: '/polls', label: 'Bình chọn', icon: <HeartOutlined /> },
  { to: '/profile', label: 'Hồ sơ', icon: <UserOutlined /> },
] as const;

const MOBILE_NAV = [NAV[0], NAV[1], NAV[2], NAV[4], NAV[5]];

function currentKey(pathname: string) {
  if (pathname === '/') return '/';
  if (pathname.startsWith('/outfits/suggest')) return '/outfits/suggest';
  return NAV.find((item) => item.to !== '/' && pathname.startsWith(item.to))?.to ?? '/';
}

export function AppShell({ children, publicPreview = false }: { children?: ReactNode; publicPreview?: boolean }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const me = useQuery({ queryKey: ['me'], queryFn: () => unwrap(authApi.GET('/api/app/me')), enabled: !publicPreview });
  const isAdmin = me.data?.roles?.includes('ADMIN') ?? false;
  const selected = currentKey(pathname);
  const pageName = NAV.find((item) => item.to === selected)?.label ?? 'Trang chủ';

  return (
    <Layout className="app-frame">
      <aside className="app-sidebar" aria-label="Điều hướng chính">
        <Link to="/" className="app-sidebar-brand"><Brand /></Link>
        <div className="app-nav-caption">{publicPreview ? 'KHÁM PHÁ' : 'KHÔNG GIAN CỦA BẠN'}</div>
        <Menu
          mode="inline"
          selectedKeys={[selected]}
          items={NAV.map((item) => ({ key: item.to, icon: item.icon, label: item.label }))}
          onClick={({ key }) => navigate(key)}
        />
        <div className="app-sidebar-bottom">
          <Link to={publicPreview ? '/about' : '/plans'} className="premium-callout">
            <CrownOutlined /> <strong>THE LOOKS Premium</strong>
            <span>Khám phá thêm cách phối đồ dành riêng cho bạn.</span>
          </Link>
          {isAdmin && <Link to="/admin" className="admin-switch"><AppstoreOutlined /> Quản trị hệ thống</Link>}
          <Link to={publicPreview ? '/login' : '/profile'} className="sidebar-user">
            <Avatar className="user-avatar">{publicPreview ? 'B' : me.data?.username?.slice(0, 1).toUpperCase() ?? 'T'}</Avatar>
            <span><strong>{publicPreview ? 'Bạn' : me.data?.username ?? 'Tài khoản'}</strong><small>{publicPreview ? 'Đăng nhập để bắt đầu' : isAdmin ? 'Quản trị viên' : 'Tài khoản cá nhân'}</small></span>
          </Link>
        </div>
      </aside>

      <Layout className="app-main-layout">
        <header className="app-topbar">
          <Link to="/" className="mobile-topbar-brand" aria-label="THE LOOKS, về trang chủ"><Brand /></Link>
          <div className="topbar-crumb"><span>{publicPreview ? 'Không gian của bạn' : 'Không gian của tôi'}</span><span aria-hidden="true">›</span><strong>{pageName}</strong></div>
          <div className="topbar-actions">
            {publicPreview ? <div className="topbar-guest-actions"><Link to="/about">Giới thiệu</Link><Link to="/login">Đăng nhập</Link><Link to="/register" className="topbar-join">Bắt đầu</Link></div> : <><Input.Search
              className="topbar-search"
              prefix={<SearchOutlined />}
              placeholder="Tìm món đồ trong tủ..."
              aria-label="Tìm món đồ trong tủ"
              onSearch={(value) => navigate(`/wardrobe${value.trim() ? `?q=${encodeURIComponent(value.trim())}` : ''}`)}
            />
            <Tooltip title="Thông báo"><Link to="/notifications" className="topbar-icon" aria-label="Thông báo"><Badge dot><BellOutlined /></Badge></Link></Tooltip>
            <Link to="/profile" aria-label="Hồ sơ"><Avatar className="user-avatar">{me.data?.username?.slice(0, 1).toUpperCase() ?? 'T'}</Avatar></Link></>}
          </div>
        </header>
        <main className="app-page">{children ?? <Outlet />}</main>
      </Layout>

      <nav className="app-mobile-nav" aria-label="Điều hướng di động">
        {MOBILE_NAV.map((item) => <Link key={item.to} to={item.to} className={selected === item.to ? 'active' : ''}>
          {item.icon}<span>{item.label === 'LOOKSY AI' ? 'Khám phá' : item.label}</span>
        </Link>)}
      </nav>
    </Layout>
  );
}
