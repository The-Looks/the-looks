import { AppstoreOutlined, CrownOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Drawer } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { session } from '../../../services/shared/session';

export function AccountDrawer({
  open,
  onClose,
  account,
  isAdmin = false,
  publicPreview = false,
}: {
  open: boolean;
  onClose: () => void;
  account?: { username: string; email: string };
  isAdmin?: boolean;
  publicPreview?: boolean;
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const avatarLetter = publicPreview ? 'B' : account?.username?.slice(0, 1).toUpperCase() ?? 'T';

  return <Drawer id="account-drawer" title="Tài khoản" placement="right" open={open} onClose={onClose} width={320} className="app-account-drawer">
    <div className="drawer-identity"><Avatar size={48} className="user-avatar">{avatarLetter}</Avatar><div><strong>{publicPreview ? 'Khách' : account?.username ?? 'Tài khoản'}</strong><span>{publicPreview ? 'Khám phá THE LOOKS' : account?.email ?? ''}</span></div></div>
    <nav className="drawer-navigation" aria-label="Menu tài khoản">
      <Link to={publicPreview ? '/login' : '/profile'} onClick={onClose} className={pathname.startsWith('/profile') ? 'active' : ''}><UserOutlined /><span>{publicPreview ? 'Đăng nhập' : 'Hồ sơ'}</span></Link>
      <Link to={publicPreview ? '/register' : '/plans'} onClick={onClose} className={pathname.startsWith('/plans') ? 'active' : ''}><CrownOutlined /><span>{publicPreview ? 'Tạo tài khoản' : 'THE LOOKS Premium'}</span></Link>
      {isAdmin && <Link to="/admin" onClick={onClose} className={pathname.startsWith('/admin') ? 'active' : ''}><AppstoreOutlined /><span>Quản trị hệ thống</span></Link>}
    </nav>
    {!publicPreview && <button className="drawer-logout" type="button" onClick={() => { onClose(); void session.logout().then(() => navigate('/')); }}><LogoutOutlined /> Đăng xuất</button>}
  </Drawer>;
}
