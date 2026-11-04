import { ArrowRightOutlined, AppstoreOutlined, HeartOutlined, SkinOutlined, StarOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { ButtonLink } from '../../../components/shared/ui/index';
import { PublicHeader } from '../../../components/shared/layout/PublicHeader';
import { SiteFooter } from '../../../components/shared/layout/SiteFooter';

const features = [
  { icon: <SkinOutlined />, title: 'Tủ đồ của bạn', description: 'Sắp xếp những món bạn đang có để tìm lại nhanh hơn và phối theo cách mới.' },
  { icon: <StarOutlined />, title: 'LOOKSY AI', description: 'Nhận gợi ý outfit theo dịp từ chính tủ đồ của bạn, mỗi ngày một cảm hứng.' },
  { icon: <HeartOutlined />, title: 'Hỏi bạn bè', description: 'Tạo link bình chọn, gửi qua Zalo và nhận ý kiến mà bạn bè không cần đăng nhập.' },
];

export function PublicHomePage() {
  return (
    <div className="public-home">
      <PublicHeader page="home" />

      <main>
        <Link className="back" to="/">‹ Về trang chủ</Link>
        <section className="public-home-hero" aria-labelledby="public-home-title">
          <div className="public-home-hero-copy">
            <span className="eyebrow">WEAR MORE. BUY SMARTER.</span>
            <h1 id="public-home-title">Phong cách mới,<br /><em>từ những gì bạn có.</em></h1>
            <p>THE LOOKS giúp bạn nhìn lại tủ đồ, tìm ý tưởng phối đồ và nhờ bạn bè chọn outfit phù hợp. Mỗi ngày mặc đẹp theo cách của riêng bạn.</p>
            <div className="public-home-hero-actions">
              <ButtonLink to="/register">Bắt đầu miễn phí <ArrowRightOutlined /></ButtonLink>
              <a className="public-home-text-link" href="#how-it-works">Xem cách hoạt động <ArrowRightOutlined /></a>
            </div>
            <div className="public-home-hero-note"><span>✦</span> Tủ đồ của bạn · Gu của bạn · Câu chuyện của bạn</div>
          </div>
          <div className="public-home-visual" aria-label="Ảnh minh họa các món đồ thời trang">
            <div className="public-home-visual-photo" aria-hidden="true" />
            <div className="public-home-preview">
              <span className="eyebrow">✦ QUICK PICK</span>
              <h2>Hôm nay<br />mặc gì?</h2>
              <p>Khám phá cách phối đồ mới từ tủ đồ của bạn.</p>
              <Link to="/register">Khám phá LOOKSY AI <ArrowRightOutlined /></Link>
            </div>
            <span className="public-home-stamp" aria-hidden="true">YOUR STYLE<br />YOUR STORY<br />✦</span>
          </div>
        </section>

        <section className="public-home-features" id="features" aria-labelledby="features-title">
          <div className="public-home-section-heading"><span className="eyebrow">MỘT NƠI CHO PHONG CÁCH CỦA BẠN</span><h2 id="features-title">Mặc đẹp bắt đầu từ tủ đồ của bạn.</h2></div>
          <div className="public-home-feature-grid">
            {features.map((feature, index) => (
              <article className="public-home-feature" key={feature.title}>
                <span className={`public-home-feature-icon feature-${index}`}>{feature.icon}</span>
                <span className="public-home-feature-number">0{index + 1}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <Link to={index === 2 ? '/ask-friends' : '/register'} aria-label={`Tìm hiểu ${feature.title}`}><ArrowRightOutlined /></Link>
              </article>
            ))}
          </div>
        </section>

        <section className="public-home-steps" id="how-it-works" aria-labelledby="steps-title">
          <div><span className="eyebrow">DỄ BẮT ĐẦU</span><h2 id="steps-title">Từ tủ đồ đến outfit bạn yêu thích.</h2><p>Chụp vài món đồ, chọn dịp bạn muốn mặc và để THE LOOKS giúp bạn có thêm lựa chọn.</p><ButtonLink to="/register" small>Tạo tài khoản <ArrowRightOutlined /></ButtonLink></div>
          <ol>
            <li><span><SkinOutlined /></span><div><strong>Thêm món đồ</strong><p>Lưu những món bạn đang có vào tủ đồ số.</p></div></li>
            <li><span><AppstoreOutlined /></span><div><strong>Nhận gợi ý</strong><p>LOOKSY AI phối outfit theo dịp và phong cách.</p></div></li>
            <li><span><HeartOutlined /></span><div><strong>Chia sẻ lựa chọn</strong><p>Gửi link để bạn bè bình chọn mà không cần tài khoản.</p></div></li>
          </ol>
        </section>
        <section className="public-home-close"><span className="eyebrow">THE LOOKS</span><h2>Hôm nay bạn muốn mặc gì?</h2><p>Bắt đầu hành trình phong cách của riêng bạn.</p><ButtonLink to="/register">Bắt đầu miễn phí <ArrowRightOutlined /></ButtonLink></section>
      </main>
      <SiteFooter />
    </div>
  );
}
