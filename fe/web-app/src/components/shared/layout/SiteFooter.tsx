import { ArrowRightOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { brand } from '../../../services/shared/brand';
import { Brand } from '../ui/index';

const appLinks = [
  { to: '/wardrobe', label: 'Tủ đồ' },
  { to: '/outfits/suggest', label: 'LOOKSY AI' },
  { to: '/polls', label: 'Bình chọn' },
  { to: '/plans', label: 'Gói thành viên' },
];

const publicLinks = [
  { to: '/about', label: 'Khám phá' },
  { to: '/ask-friends', label: 'Hỏi bạn bè' },
  { to: '/login', label: 'Đăng nhập' },
];

export function SiteFooter({ variant = 'public' }: { variant?: 'app' | 'public' }) {
  const links = variant === 'app' ? appLinks : publicLinks;
  return <footer className={`site-footer site-footer-${variant}`}>
    <div className="site-footer-inner">
      <div className="site-footer-top">
        <Link to="/" className="site-footer-brand" aria-label="THE LOOKS, về trang chủ">
          <Brand />
          <span><strong>THE LOOKS</strong><small>{brand.tagline}</small></span>
        </Link>
        <nav className="site-footer-nav" aria-label="Điều hướng cuối trang">
          {links.map((link) => <Link key={link.to} to={link.to}>{link.label}<ArrowRightOutlined /></Link>)}
        </nav>
      </div>
      <div className="site-footer-bottom"><span>© {new Date().getFullYear()} THE LOOKS</span>
        <span><Link to="/terms">Điều khoản</Link> · <Link to="/privacy">Quyền riêng tư</Link> · <Link to="/refund">Thanh toán và hoàn tiền</Link></span>
        <span>Phong cách của bạn, theo cách của bạn.</span></div>
    </div>
  </footer>;
}
