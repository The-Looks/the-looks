import { ArrowRightOutlined, HeartOutlined, LinkOutlined, ShareAltOutlined } from '@ant-design/icons';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AssetPlaceholder, Brand, Button, ButtonLink, Notice } from '../../../components/shared/ui/index';

const steps = [
  { number: '01', title: 'Tạo trên app', detail: 'Chọn hai outfit và đặt câu hỏi.' },
  { number: '02', title: 'Gửi qua Zalo', detail: 'Sao chép hoặc chia sẻ link.' },
  { number: '03', title: 'Bạn bè chọn trên web', detail: 'Chạm vào set yêu thích và gửi phiếu.' },
];

export function GuestLandingPage() {
  const navigate = useNavigate();
  const [link, setLink] = useState('');
  const [invalidLink, setInvalidLink] = useState(false);

  const openPoll = (event: FormEvent) => {
    event.preventDefault();
    try {
      const value = link.trim();
      const code = /^[A-Za-z0-9_-]+$/.test(value)
        ? value
        : new URL(value, window.location.origin).pathname.match(/^\/v\/([A-Za-z0-9_-]+)\/?$/)?.[1];
      if (!code) throw new Error('Invalid poll link');
      setInvalidLink(false);
      navigate(`/v/${code}`);
    } catch {
      setInvalidLink(true);
    }
  };

  return (
    <div className="guest-landing">
      <header className="guest-topbar">
        <Link to="/ask-friends" className="guest-brand"><Brand /></Link>
        <nav className="guest-landing-nav" aria-label="Điều hướng trang giới thiệu">
          <Link to="/ask-friends" className="active">Trang chủ</Link>
          <a href="#how-it-works">Cách hoạt động</a>
          <a href="#open-poll">Mở link bình chọn</a>
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
              <a className="btn" href="#open-poll">Mở link bình chọn <ArrowRightOutlined /></a>
              <ButtonLink to="/polls/new" kind="outline">Tạo bình chọn trên app</ButtonLink>
            </div>
            <div className="guest-share-note"><ShareAltOutlined /> Link Zalo mở thẳng màn bình chọn cho khách.</div>
          </div>
          <div className="guest-landing-art">
            <AssetPlaceholder label="Ảnh outfit giới thiệu" assetPath="assets/landing/hero-outfit.jpg" animated />
            <div className="guest-floating-note"><HeartOutlined /><span><strong>18 bạn đã chọn giúp</strong><small>Hỏi nhanh, mặc đẹp tự tin</small></span></div>
          </div>
        </section>
        <section id="open-poll" className="guest-landing-steps">
          <h2>Mở bình chọn từ bạn bè</h2>
          <p>Dán link được chia sẻ qua Zalo hoặc nhập mã bình chọn để xem hai outfit.</p>
          <form className="row" onSubmit={openPoll}>
            <input className="field" aria-label="Link bình chọn" placeholder="https://localhost:5173/v/..." value={link} onChange={(event) => { setLink(event.target.value); setInvalidLink(false); }} required />
            <Button type="submit">Mở bình chọn <ArrowRightOutlined /></Button>
          </form>
          {invalidLink && <Notice tone="error">Link không đúng định dạng bình chọn.</Notice>}
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
