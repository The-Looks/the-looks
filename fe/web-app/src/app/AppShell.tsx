import { NavLink, Outlet } from 'react-router-dom';
import { Brand } from '../shared/ui';

const NAV = [
  { to: '/', label: 'Trang chủ', icon: '🏠', end: true },
  { to: '/wardrobe', label: 'Tủ đồ', icon: '👗', end: false },
  { to: '/outfits/suggest', label: 'Phối đồ', icon: '✨', end: false },
  { to: '/polls', label: 'Bình chọn', icon: '🗳️', end: false },
  { to: '/profile', label: 'Cá nhân', icon: '👤', end: false },
];

/** Điện thoại: thanh điều hướng dưới đáy. Desktop (≥1024px): sidebar bên trái. */
export function AppShell() {
  return (
    <div className="shell">
      <nav className="nav" aria-label="Điều hướng chính">
        <div className="nav-brand">
          <Brand />
        </div>
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'active' : undefined)}>
            <span className="nav-ico" aria-hidden="true">
              {n.icon}
            </span>
            {n.label}
          </NavLink>
        ))}
      </nav>
      <main className="shell-main">
        <Outlet />
      </main>
    </div>
  );
}
