import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Icon from '../shared/ui/Icon.jsx';
import { useStore } from '../shared/store.jsx';

const NAV = [
  { label: 'TỔNG QUAN', items: [{ to: '/', text: 'Tổng quan', icon: 'grid', end: true }] },
  {
    label: 'QUẢN LÝ',
    items: [
      { to: '/users', text: 'Người dùng', icon: 'users' },
      { to: '/content', text: 'Nội dung', icon: 'doc' },
      { to: '/products', text: 'Sản phẩm', icon: 'bag' },
      { to: '/sync', text: 'Đồng bộ', icon: 'sync' },
    ],
  },
  {
    label: 'VẬN HÀNH',
    items: [
      { to: '/notifications', text: 'Thông báo', icon: 'bell' },
      { to: '/audit', text: 'Nhật ký', icon: 'clock' },
      { to: '/settings', text: 'Cài đặt', icon: 'settings' },
    ],
  },
  {
    label: 'DOANH THU',
    items: [
      { to: '/plans', text: 'Doanh thu gói', icon: 'wallet' },
      { to: '/affiliate', text: 'Affiliate', icon: 'link' },
    ],
  },
];

export default function Layout() {
  const { logout, toast } = useStore();
  const navigate = useNavigate();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">TL</div>
          <div>
            <div className="brand-name">THE LOOKS</div>
            <div className="brand-sub">ADMIN PORTAL</div>
          </div>
        </div>
        <nav className="nav">
          {NAV.map((group) => (
            <div key={group.label}>
              <div className="nav-label">{group.label}</div>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                >
                  <Icon name={item.icon} />
                  {item.text}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="me">
          <div className="me-avatar">AD</div>
          <div>
            <div className="me-name">Admin LOOKSY</div>
            <div className="me-role">Quản trị viên</div>
          </div>
          <button
            type="button"
            title="Đăng xuất"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            <Icon name="logout" />
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button type="button" className="icon-btn" aria-label="Tìm kiếm">
            <Icon name="search" />
          </button>
          <button type="button" className="icon-btn" aria-label="Thông báo">
            <Icon name="bell" />
          </button>
          <div className="top-avatar">AD</div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
