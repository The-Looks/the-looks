import { useQuery } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { Layout } from 'antd';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { authRequests } from '../../../services/guest/auth/requests';
import { accountAvatar } from '../../user/mascot/accountAvatar';
import { profileKey, profileRequests } from '../../../services/user/profile/requests';
import { APP_NAV, AppHeader, currentAppNav } from '../layout/AppHeader';
import { AccountDrawer } from '../layout/AccountDrawer';
import { SiteFooter } from '../layout/SiteFooter';

export function AppShell({ children, publicPreview = false }: { children?: ReactNode; publicPreview?: boolean }) {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const me = useQuery({ queryKey: ['me'], queryFn: authRequests.me, enabled: !publicPreview });
  const profile = useQuery({ queryKey: profileKey, queryFn: profileRequests.get, enabled: !publicPreview && Boolean(me.data) });
  const isAdmin = me.data?.roles?.includes('ADMIN') ?? false;
  const selected = currentAppNav(pathname);
  const avatarLetter = publicPreview ? 'B' : me.data?.username?.slice(0, 1).toUpperCase() ?? 'T';
  const avatarSrc = !publicPreview && me.data ? accountAvatar(me.data.id, profile.data) : undefined;
  const closeMenu = () => setMenuOpen(false);

  return (
    <Layout className="app-frame app-frame-topnav">
      <Layout className="app-main-layout">
        <AppHeader selected={selected} publicPreview={publicPreview} avatarLetter={avatarLetter} avatarSrc={avatarSrc} accountName={me.data?.username} menuOpen={menuOpen} onOpenMenu={() => setMenuOpen(true)} />

        <main className="app-page"><div key={pathname} className="route-transition">{children ?? <Outlet />}</div></main>
        <SiteFooter variant={publicPreview ? 'public' : 'app'} />
      </Layout>

      <nav className="app-mobile-nav" aria-label="Điều hướng di động">
        {APP_NAV.map((item) => <Link key={item.to} to={item.to} className={selected === item.to ? 'active' : ''} aria-current={selected === item.to ? 'page' : undefined}>
          {item.icon}<span>{item.to === '/outfits/suggest' ? 'AI phối đồ' : item.to === '/outfits' ? 'Đã lưu' : item.label}</span>
        </Link>)}
      </nav>

      <AccountDrawer open={menuOpen} onClose={closeMenu} account={me.data} avatarSrc={avatarSrc} isAdmin={isAdmin} publicPreview={publicPreview} />
    </Layout>
  );
}
