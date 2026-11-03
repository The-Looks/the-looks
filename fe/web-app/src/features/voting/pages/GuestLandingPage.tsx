import { ArrowRightOutlined, HeartOutlined, LinkOutlined, ShareAltOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { AssetPlaceholder, Brand, ButtonLink } from '../../../shared/ui';

const steps = [
  { number: '01', title: 'Tạo trên app', detail: 'Chọn hai outfit và đặt câu hỏi.' },
  { number: '02', title: 'Gửi qua Zalo', detail: 'Sao chép hoặc chia sẻ link.' },
  { number: '03', title: 'Bạn bè chọn trên web', detail: 'Chạm vào set yêu thích và gửi phiếu.' },
];

export function GuestLandingPage() {
  return (
    <div className="guest-landing">
      <header className="guest-topbar">
        <Link to="/ask-friends" className="guest-brand"><Brand /></Link>
        <nav className="guest-landing-nav" aria-label="Điều hướng trang giới thiệu">
          <Link to="/ask-friends" className="active">Trang chủ</Link>
          <a href="#how-it-works">Cách hoạt động</a>
          <Link to="/v/demo42">Bình chọn mẫu</Link>
        </nav>
        <ButtonLink to="/login" kind="outline" small>Mở ứng dụng <ArrowRightOutlined /></ButtonLink>
      </header>
      <main>
        <section className="guest-landing-hero">
          <div>
            <span className="guest-kicker"><HeartOutlined /> LOOKSY / THE LOOKS</span>
            <h1>Bạn bè chọn giúp.<br /><em>Bạn tự tin diện đẹp.</em></h1>
            <p>Tạo bình chọn trong ứng dụng và gửi link qua Zalo. Bạn bè mở web, chọn outfit hợp nhất trong vài giây. <strong>Không cần cài app hay đăng nhập.</strong></p>
            <div className="row">
              <ButtonLink to="/v/demo42">Xem bình chọn mẫu <ArrowRightOutlined /></ButtonLink>
              <ButtonLink to="/login" kind="outline">Tạo bình chọn trên app</ButtonLink>
            </div>
            <div className="guest-share-note"><ShareAltOutlined /> Link Zalo mở thẳng màn bình chọn cho khách.</div>
          </div>
          <div className="guest-landing-art">
            <AssetPlaceholder label="Ảnh outfit giới thiệu" assetPath="assets/landing/hero-outfit.jpg" animated />
            <div className="guest-floating-note"><HeartOutlined /><span><strong>18 bạn đã chọn giúp</strong><small>Hỏi nhanh, mặc đẹp tự tin</small></span></div>
          </div>
        </section>
        <section id="how-it-works" className="guest-landing-steps">
          <h2>Chia sẻ trong 3 bước</h2>
          <div className="guest-step-grid">
            {steps.map((step) => <div className="guest-step" key={step.number}><span>{step.number}</span><div><h3>{step.title}</h3><p>{step.detail}</p></div></div>)}
          </div>
          <p className="small muted"><LinkOutlined /> Bình chọn được chia sẻ qua liên kết riêng tư.</p>
        </section>
      </main>
    </div>
  );
}
