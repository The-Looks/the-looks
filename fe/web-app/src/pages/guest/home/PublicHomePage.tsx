import { ArrowRightOutlined, AppstoreOutlined, HeartOutlined, SkinOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { BackLink, ButtonLink } from '../../../components/shared/ui/index';
import { PublicHeader } from '../../../components/shared/layout/PublicHeader';
import { SiteFooter } from '../../../components/shared/layout/SiteFooter';

const features = [
  { title: 'Tủ đồ của bạn', description: 'Sắp xếp những món bạn đang có để tìm lại nhanh hơn và phối theo cách mới.' },
  { title: 'LOOKSY AI', description: 'Nhận gợi ý outfit theo dịp từ chính tủ đồ của bạn, mỗi ngày một cảm hứng.' },
  { title: 'Hỏi bạn bè', description: 'Tạo link bình chọn, gửi qua Zalo và nhận ý kiến mà bạn bè không cần đăng nhập.' },
];

export function PublicHomePage() {
  return (
    <div className="public-home">
      <PublicHeader page="home" />

      <main>
        <BackLink to="/">Về trang chủ</BackLink>
        <section className="public-home-hero" aria-labelledby="public-home-title">
          <div className="public-home-hero-copy">
            <h1 id="public-home-title">Mặc đẹp từ tủ đồ của bạn</h1>
            <p>THE LOOKS giúp bạn nhìn lại tủ đồ, tìm ý tưởng phối đồ và nhờ bạn bè chọn outfit phù hợp. Mỗi ngày mặc đẹp theo cách của riêng bạn.</p>
            <div className="public-home-hero-actions">
              <ButtonLink to="/register">Bắt đầu miễn phí <ArrowRightOutlined /></ButtonLink>
              <a className="public-home-text-link" href="#how-it-works">Xem cách hoạt động <ArrowRightOutlined /></a>
            </div>
          </div>
          <div className="public-home-visual" aria-label="Ảnh minh họa các món đồ thời trang">
            <div className="public-home-visual-photo" aria-hidden="true" />
            <div className="public-home-preview">
              <span className="public-home-preview-label">Quick Pick</span>
              <h2>Hôm nay mặc gì?</h2>
              <p>Khám phá cách phối đồ mới từ tủ đồ của bạn.</p>
              <Link to="/register">Khám phá LOOKSY AI <ArrowRightOutlined /></Link>
            </div>
          </div>
        </section>

        <section className="public-home-features" id="features" aria-labelledby="features-title">
          <div className="public-home-section-heading"><h2 id="features-title">Một tủ đồ, nhiều cách mặc</h2></div>
          <div className="public-home-feature-grid">
            {features.map((feature, index) => (
              <article className="public-home-feature" key={feature.title}>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <Link to={index === 2 ? '/ask-friends' : '/register'} aria-label={`Tìm hiểu ${feature.title}`}>Tìm hiểu <ArrowRightOutlined /></Link>
              </article>
            ))}
          </div>
        </section>

        <section className="public-home-steps" id="how-it-works" aria-labelledby="steps-title">
          <div><h2 id="steps-title">Ba bước để phối đồ</h2><p>Chụp vài món đồ, chọn dịp bạn muốn mặc và để THE LOOKS giúp bạn có thêm lựa chọn.</p><ButtonLink to="/register" small>Tạo tài khoản <ArrowRightOutlined /></ButtonLink></div>
          <ol>
            <li><span><SkinOutlined /></span><div><strong>Thêm món đồ</strong><p>Lưu những món bạn đang có vào tủ đồ số.</p></div></li>
            <li><span><AppstoreOutlined /></span><div><strong>Nhận gợi ý</strong><p>LOOKSY AI phối outfit theo dịp và phong cách.</p></div></li>
            <li><span><HeartOutlined /></span><div><strong>Chia sẻ lựa chọn</strong><p>Gửi link để bạn bè bình chọn mà không cần tài khoản.</p></div></li>
          </ol>
        </section>
        <section className="public-home-close"><h2>Hôm nay bạn muốn mặc gì?</h2><p>Bắt đầu hành trình phong cách của riêng bạn.</p><ButtonLink to="/register">Bắt đầu miễn phí <ArrowRightOutlined /></ButtonLink></section>
      </main>
      <SiteFooter />
    </div>
  );
}
