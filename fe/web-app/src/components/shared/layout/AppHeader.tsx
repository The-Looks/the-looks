import type { ReactNode } from 'react';
import { Avatar, Badge, Input, Tooltip } from 'antd';
import {
  AppstoreOutlined,
  BellOutlined,
  CheckSquareOutlined,
  HeartOutlined,
  HomeOutlined,
  SearchOutlined,
  SkinOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { brand } from '../../../services/shared/brand';
import { Brand } from '../ui/index';

export const APP_NAV = [
  { to: '/', label: brand.content.home, icon: <HomeOutlined /> },
  { to: '/wardrobe', label: brand.content.wardrobe, icon: <SkinOutlined /> },
  { to: '/outfits/suggest', label: 'THE LOOKS AI', icon: <AppstoreOutlined /> },
  { to: '/outfits', label: 'Outfit đã lưu', icon: <HeartOutlined /> },
  { to: '/polls', label: brand.content.voting, icon: <CheckSquareOutlined /> },
] as const;

export function currentAppNav(pathname: string) {
  if (pathname === '/') return '/';
  if (pathname.startsWith('/outfits/suggest')) return '/outfits/suggest';
  return APP_NAV.find((item) => item.to !== '/' && pathname.startsWith(item.to))?.to ?? '';
}

export function AppHeader({
  selected,
  publicPreview,
  avatarLetter,
  avatarSrc,
  accountName,
  menuOpen,
  onOpenMenu,
}: {
  selected: string;
  publicPreview: boolean;
  avatarLetter: string;
  avatarSrc?: ReactNode;
  accountName?: string;
  menuOpen: boolean;
  onOpenMenu: () => void;
}) {
  const navigate = useNavigate();

  return <header className="app-topbar app-topbar-editorial">
    <Link to="/" className="app-header-brand" aria-label="THE LOOKS, về trang chủ"><Brand /><span className="app-header-wordmark">The Looks</span></Link>
    <nav className="app-header-nav" aria-label="Điều hướng chính">
      {APP_NAV.map((item) => <Link key={item.to} to={item.to} className={selected === item.to ? 'active' : ''} aria-current={selected === item.to ? 'page' : undefined}>{item.label}</Link>)}
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
      <button className={`topbar-avatar-trigger${accountName ? ' with-name' : ''}`} type="button" aria-label="Mở menu tài khoản" aria-expanded={menuOpen} aria-controls="account-drawer" onClick={onOpenMenu}>
        <Avatar className="user-avatar" src={avatarSrc} alt="">{avatarLetter}</Avatar>
        {accountName && <span className="topbar-account-name">{accountName}</span>}
      </button>
    </div>
  </header>;
}
