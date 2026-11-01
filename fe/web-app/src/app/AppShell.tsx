import { Link, NavLink, Outlet } from 'react-router-dom';
import { Brand, Icon } from '../shared/ui';
const NAV = [
  { to: '/', label: 'Trang chủ', icon: 'home', end: true },
  { to: '/wardrobe', label: 'Tủ đồ', icon: 'wardrobe', end: false },
  { to: '/outfits/suggest', label: 'Phối đồ', icon: 'spark', end: false },
  { to: '/polls', label: 'Bình chọn', icon: 'vote', end: false },
  { to: '/profile', label: 'Cá nhân', icon: 'user', end: false },
];
export function AppShell() {
  return <div className="shell">
    <nav className="nav" aria-label="Điều hướng chính">
      <div className="nav-brand"><Link to="/" aria-label="The Looks — Trang chủ"><Brand /></Link><p>Tủ đồ của riêng bạn</p></div>
      {NAV.map(n => <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => isActive ? 'active' : undefined}><Icon name={n.icon} /><span>{n.label}</span></NavLink>)}
      <div className="nav-footer"><p>Mặc nhiều hơn.<br />Mua sắm thông minh hơn.</p><span>The Looks · Wear More. Buy Smarter.</span></div>
    </nav>
    <div className="mobile-brand"><Link to="/" aria-label="The Looks — Trang chủ"><Brand /></Link><Link to="/wardrobe/add" className="mobile-add" aria-label="Thêm món đồ"><Icon name="plus" /></Link></div>
    <main className="shell-main"><Outlet /></main>
  </div>;
}
