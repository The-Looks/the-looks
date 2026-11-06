import { ArrowRightOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Brand, ButtonLink } from '../ui/index';

export function PublicHeader({ page }: { page: 'home' | 'friends' | 'vote' }) {
  if (page === 'home') {
    return <header className="public-home-header">
      <Link to="/" className="public-home-brand" aria-label="THE LOOKS, trang chủ"><Brand /></Link>
      <nav aria-label="Điều hướng trang chủ">
        <a href="#features">Khám phá</a>
        <a href="#how-it-works">Cách hoạt động</a>
        <Link to="/ask-friends">Hỏi bạn bè</Link>
      </nav>
      <div className="public-home-actions">
        <ButtonLink to="/login" kind="outline" small>Đăng nhập</ButtonLink>
        <ButtonLink to="/register" small>Bắt đầu</ButtonLink>
      </div>
    </header>;
  }

  return <header className="guest-topbar">
    <Link to="/" className="guest-brand" aria-label="THE LOOKS, trang chủ"><Brand /><strong>THE LOOKS</strong></Link>
    {page === 'friends' ? <>
      <nav className="guest-landing-nav" aria-label="Điều hướng trang giới thiệu">
        <Link to="/">Trang chủ</Link>
        <Link to="/ask-friends" className="active" aria-current="page">Hỏi bạn bè</Link>
        <a href="#how-it-works">Cách hoạt động</a>
        <a href="#open-poll">Mở link bình chọn</a>
      </nav>
      <ButtonLink to="/login" kind="outline" small>Mở ứng dụng <ArrowRightOutlined /></ButtonLink>
    </> : <>
      <span className="small muted">Bình chọn cùng bạn bè</span>
      <Link to="/ask-friends" className="guest-help-link">Tìm hiểu THE LOOKS</Link>
    </>}
  </header>;
}
